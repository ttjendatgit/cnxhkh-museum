import type { GameStateRecord, GameStatus, ScoringConfig, TeamRecord } from '../types'
import { FINAL_KEYWORD, KEYWORD_LETTERS, QUESTIONS } from '../data/questions'
import { isFirebaseConfigured } from './firebase'
import { createFirebaseBackend } from './firebaseBackend'
import { createMockBackend } from './mockBackend'
import type { GameBackend } from './gameBackend'
import { computeScore, DEFAULT_SCORING } from './scoring'
import { cleanTeamName, isTeamNameTaken, TEAM_NAME_TAKEN_MESSAGE } from './teamName'

export type { GameBackend } from './gameBackend'

let backendInstance: GameBackend | null = null

/** Picks the Firebase-backed store if VITE_FIREBASE_* env vars are set,
 * otherwise the in-memory mock — every hook/component goes through this,
 * never through firebaseBackend.ts/mockBackend.ts directly. */
export function getBackend(): GameBackend {
  if (!backendInstance) {
    backendInstance = isFirebaseConfigured() ? createFirebaseBackend() : createMockBackend()
    console.info(`[final-game] backend: ${isFirebaseConfigured() ? 'Firebase Realtime Database' : 'local mock (no VITE_FIREBASE_* set)'}`)
  }
  return backendInstance
}

export function isUsingMockBackend(): boolean {
  return !isFirebaseConfigured()
}

// --- text normalization -------------------------------------------------

export function normalizeAnswer(value: string): string {
  return value.trim().toLocaleUpperCase('vi-VN').replace(/\s+/g, ' ')
}

/** Diacritic-insensitive comparison key — lets a team's answer count even if
 * they typed without Vietnamese accents (common on shared/borrowed devices). */
export function comparisonKey(value: string): string {
  return normalizeAnswer(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // normalizeAnswer already upper-cased the text, so "D" (not "d") is what an unaccented "Đ" must become.
    .replace(/đ/gi, 'D')
}

// --- player actions -------------------------------------------------

/** The value a subscription reports first (the current one), read once. */
function readOnce<T>(subscribe: (cb: (value: T) => void) => () => void): Promise<T> {
  return new Promise((resolve) => {
    let done = false
    let unsubscribe: (() => void) | null = null
    unsubscribe = subscribe((value) => {
      if (done) return
      done = true
      resolve(value)
      unsubscribe?.()
    })
    // A backend that answers synchronously reports before `unsubscribe` is assigned.
    if (done) unsubscribe()
  })
}

/** Why a new team cannot be created in this room state, or null when it can: only while
 * the room is 'waiting'. Teams are created once, on the device that will play them. */
export function teamCreationBlockedReason(status: GameStatus): string | null {
  if (status === 'waiting') return null
  return status === 'finished' ? 'Trò chơi đã kết thúc. Không thể tạo đội mới.' : 'Trò chơi đã bắt đầu. Không thể tạo đội mới.'
}

/** Creates the team for this device. Refuses unless the room is waiting, and refuses a name
 * another team already uses (compared without case or extra spaces — see teamName.ts). A team
 * is one device; there is no joining an existing team. Checked against the live database
 * right before writing, so two phones cannot both pick a name that was free a minute ago. */
export async function joinGame(teamName: string): Promise<TeamRecord> {
  const name = cleanTeamName(teamName)
  if (!name) throw new Error('Vui lòng nhập tên đội.')

  const backend = getBackend()
  const blocked = teamCreationBlockedReason((await readOnce<GameStateRecord>((cb) => backend.subscribeGameState(cb))).status)
  if (blocked) throw new Error(blocked)

  const teams = await readOnce<Record<string, TeamRecord>>((cb) => backend.subscribeTeams(cb))
  if (isTeamNameTaken(name, Object.values(teams).map((team) => team.teamName))) throw new Error(TEAM_NAME_TAKEN_MESSAGE)

  return backend.createTeam(name)
}

/** The game clock a completion time is measured on: when the game started and how long it was paused. */
export interface GameClock {
  startedAt: number | null
  totalPausedMs: number
}

/** ms from game start, minus paused time, to `now`; null if the game never started. */
function elapsedMs(clock: GameClock | null, now: number): number | null {
  if (!clock || clock.startedAt === null) return null
  return Math.max(0, now - clock.startedAt - clock.totalPausedMs)
}

/** The fields written when a team wins. */
function victoryPatch(clock: GameClock | null): Pick<TeamRecord, 'finished' | 'finishedAt' | 'completionTime'> {
  const now = Date.now()
  return { finished: true, finishedAt: now, completionTime: elapsedMs(clock, now) }
}

/** Checks an answer against a question BEFORE writing anything: a wrong answer returns false
 * and changes nothing. A correct one persists the team's own progress (solved questions,
 * revealed letter, score) and returns true. Already-solved questions count as correct
 * (idempotent re-submit).
 *
 * Victory needs all 13 questions AND the keyword, in either order: if this answer is the
 * 13th and the team already has the keyword, the same write also finishes the team. */
export async function submitAnswer(
  team: TeamRecord,
  questionId: number,
  rawAnswer: string,
  clock: GameClock | null,
  scoring: ScoringConfig = DEFAULT_SCORING,
): Promise<boolean> {
  if (team.solvedQuestions.includes(questionId)) return true

  const questionIndex = QUESTIONS.findIndex((q) => q.id === questionId)
  const question = QUESTIONS[questionIndex]
  if (!question) throw new Error(`[final-game] Unknown question id: ${questionId}`)

  const given = comparisonKey(rawAnswer)
  const accepted = [question.answer, ...(question.alternativeAnswers ?? [])]
  if (!accepted.some((candidate) => comparisonKey(candidate) === given)) return false

  const collectedLetters = [...team.collectedLetters]
  while (collectedLetters.length < KEYWORD_LETTERS.length) collectedLetters.push('')
  collectedLetters[questionIndex] = question.rewardLetter

  const solvedQuestions = [...team.solvedQuestions, questionId]
  const wins = solvedQuestions.length >= QUESTIONS.length && team.keywordCorrect

  await getBackend().updateTeam(team.teamId, {
    solvedQuestions,
    collectedLetters,
    progress: solvedQuestions.length,
    score: computeScore(solvedQuestions.length, team.keywordCorrect, scoring),
    ...(wins ? victoryPatch(clock) : {}),
  })
  return true
}

/** Checks a keyword attempt. The keyword may be tried at any time, but a correct one does NOT
 * complete the game by itself: it records `keywordCorrect` (and its bonus), and the team only
 * finishes once all 13 questions are solved as well. `finished` tells whether this attempt
 * was the winning one; `correct && !finished` means questions remain. */
export async function submitKeyword(
  team: TeamRecord,
  attempt: string,
  clock: GameClock | null,
  scoring: ScoringConfig = DEFAULT_SCORING,
): Promise<{ correct: boolean; finished: boolean }> {
  if (team.finished) return { correct: true, finished: true }

  const correct = comparisonKey(attempt) === comparisonKey(FINAL_KEYWORD)
  if (!correct) {
    await getBackend().updateTeam(team.teamId, { keywordAttempt: attempt })
    return { correct: false, finished: false }
  }

  const allSolved = team.solvedQuestions.length >= QUESTIONS.length
  await getBackend().updateTeam(team.teamId, {
    keywordAttempt: attempt,
    keywordCorrect: true,
    score: computeScore(team.solvedQuestions.length, true, scoring),
    ...(allSolved ? victoryPatch(clock) : {}),
  })
  return { correct: true, finished: allSolved }
}

// --- admin actions -------------------------------------------------

export async function adminStartGame(): Promise<void> {
  await getBackend().setGameState({ status: 'playing', startedAt: Date.now(), pausedAt: null, endedAt: null, totalPausedMs: 0 })
}

export async function adminPauseGame(): Promise<void> {
  await getBackend().setGameState({ status: 'paused', pausedAt: Date.now() })
}

export async function adminResumeGame(current: GameStateRecord): Promise<void> {
  const pausedDuration = current.pausedAt ? Date.now() - current.pausedAt : 0
  await getBackend().setGameState({
    status: 'playing',
    pausedAt: null,
    totalPausedMs: current.totalPausedMs + pausedDuration,
  })
}

/** Ends the game immediately for every client — components listen to
 * gameState.status and lock out further answering the moment it flips to
 * 'finished' (see FinalGame/QuestionPanel.tsx). */
export async function adminEndGame(): Promise<void> {
  await getBackend().setGameState({ status: 'finished', endedAt: Date.now() })
}

/** Starts over: every team is removed (gameRooms/{roomId}/teams), the status goes back to
 * 'waiting' and the timing is cleared. Leaderboard and admin see "0 đội" immediately; a
 * phone still holding a removed team falls back to the team-name screen. */
export async function adminResetGame(): Promise<void> {
  await getBackend().resetRoom()
}
