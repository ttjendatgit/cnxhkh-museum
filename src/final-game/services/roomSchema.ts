import type { GameStateRecord, GameStatus, TeamRecord } from '../types'

/**
 * The Realtime Database layout of one competition:
 *
 *   gameRooms/{roomId}
 *     status:  'waiting' | 'playing' | 'paused' | 'finished'
 *     timing:  { startedAt, pausedAt, totalPausedMs, endedAt }     // clock for pause / completion time
 *     teams/{teamId}:
 *       name         team name
 *       score        points so far                                  } what the LED leaderboard reads
 *       solvedCount  questions answered correctly (0-13)            }
 *       joinedAt     epoch ms the team joined
 *       keywordCorrect  the team entered the final keyword correctly (does not finish the game)
 *       finished     victory: all 13 questions solved AND keywordCorrect
 *       finishedAt   epoch ms of victory; absent until then
 *       completionTime  ms from game start (minus paused time) to victory; absent until then
 *       solvedQuestions  { "1": true, "2": true, "5": true } — which questions the team has solved, keyed
 *                    by question id. Written one key at a time, so two phones of the same team
 *                    never overwrite each other's answers, and a reload keeps the progress.
 *       collectedLetters[], keywordAttempt
 *                    the rest of the team's own crossword progress
 *
 * Every team is its own node, so a player answering writes only
 * `gameRooms/{roomId}/teams/{theirTeamId}`. The leaderboard subscribes to `teams` and
 * ranks client-side (scoring.ts), so there is no second path to keep in sync.
 *
 * This file is pure (no Firebase imports): it maps between these nodes and the
 * module's own records, so both the Firebase and the mock backend hand out identical shapes.
 */

export interface GameRoomTeamNode {
  name: string
  score: number
  solvedCount: number
  /** Legacy name of `finishedAt` (older data); read, never written. */
  completedAt?: number
  finished?: boolean
  finishedAt?: number
  keywordCorrect?: boolean
  joinedAt: number
  completionTime?: number
  /** `{ [questionId]: true }`. Older data held an array of question ids; both are read. */
  solvedQuestions?: Record<string, boolean> | number[]
  collectedLetters?: string[]
  keywordAttempt?: string
}

export interface GameRoomTimingNode {
  startedAt?: number
  pausedAt?: number
  totalPausedMs?: number
  endedAt?: number
}

export interface GameRoomNode {
  status: GameStatus
  timing?: GameRoomTimingNode
  teams?: Record<string, GameRoomTeamNode>
}

// Realtime Database does not store `null` values or empty arrays — writing them
// deletes the key, so a read returns `undefined` for them. Everything read goes
// through the mappers below, which put the defaults back.

function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object') {
    // A sparse array can come back as an index-keyed object.
    const record = value as Record<string, T>
    const length = Object.keys(record).reduce((max, key) => Math.max(max, Number(key) + 1), 0)
    return Array.from({ length }, (_, index) => record[index])
  }
  return []
}

export function gameStateFromNodes(status: unknown, timing: GameRoomTimingNode | null | undefined): GameStateRecord {
  return {
    status: (status as GameStatus | null | undefined) ?? 'waiting',
    startedAt: timing?.startedAt ?? null,
    pausedAt: timing?.pausedAt ?? null,
    totalPausedMs: timing?.totalPausedMs ?? 0,
    endedAt: timing?.endedAt ?? null,
  }
}

/** A game-state patch as a multi-path update relative to `gameRooms/{roomId}`. */
export function gameStatePatchToUpdate(patch: Partial<GameStateRecord>): Record<string, unknown> {
  const update: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue
    update[key === 'status' ? 'status' : `timing/${key}`] = value
  }
  return update
}

/** The solved question ids from a `solvedQuestions` node. Reads the `{ "1": true }` map, and
 * also what the SDK makes of it — a map with dense small integer keys comes back as an array
 * with `true` at each solved id's index — and the older array of ids. Ascending, no duplicates. */
export function solvedIdsFromNode(raw: unknown): number[] {
  const ids = new Set<number>()
  const add = (key: string | number, value: unknown) => {
    if (typeof value === 'number') ids.add(value)
    else if (value === true && Number.isInteger(Number(key))) ids.add(Number(key))
  }
  if (Array.isArray(raw)) raw.forEach((value, index) => add(index, value))
  else if (raw && typeof raw === 'object') Object.entries(raw).forEach(([key, value]) => add(key, value))
  return [...ids].sort((a, b) => a - b)
}

export function teamFromNode(raw: Partial<GameRoomTeamNode>, teamId: string): TeamRecord {
  const solvedQuestions = solvedIdsFromNode(raw.solvedQuestions)
  return {
    teamId,
    teamName: raw.name ?? teamId,
    progress: raw.solvedCount ?? solvedQuestions.length,
    solvedQuestions,
    collectedLetters: toArray<string>(raw.collectedLetters).map((letter) => letter ?? ''),
    score: raw.score ?? 0,
    completionTime: raw.completionTime ?? null,
    keywordAttempt: raw.keywordAttempt ?? '',
    // Older nodes only had `completedAt` and were finished by the keyword alone.
    keywordCorrect: raw.keywordCorrect ?? (raw.finished === true || typeof (raw.finishedAt ?? raw.completedAt) === 'number'),
    finished: raw.finished === true || typeof (raw.finishedAt ?? raw.completedAt) === 'number',
    finishedAt: raw.finishedAt ?? raw.completedAt ?? null,
    joinedAt: raw.joinedAt ?? 0,
  }
}

/** A brand-new team as the node written when it joins. */
export function teamToNode(team: TeamRecord): GameRoomTeamNode {
  return { name: team.teamName, score: team.score, solvedCount: team.progress, joinedAt: team.joinedAt, keywordCorrect: false, finished: false }
}

/** A team patch as an update of that team's own node. `finished: true` without an explicit
 * `finishedAt` is stamped with `now`; null values remove the key. */
export function teamPatchToUpdate(patch: Partial<TeamRecord>, now: number): Record<string, unknown> {
  const update: Record<string, unknown> = {}
  if (patch.teamName !== undefined) update.name = patch.teamName
  if (patch.score !== undefined) update.score = patch.score
  if (patch.progress !== undefined) update.solvedCount = patch.progress
  if (patch.joinedAt !== undefined) update.joinedAt = patch.joinedAt
  // One path per solved question / letter, not the whole list: a phone with a stale copy of the
  // team can then only ever add its own answer, never erase one another phone has just written.
  for (const id of patch.solvedQuestions ?? []) update[`solvedQuestions/${id}`] = true
  patch.collectedLetters?.forEach((letter, index) => {
    if (letter) update[`collectedLetters/${index}`] = letter
  })
  if (patch.keywordAttempt !== undefined) update.keywordAttempt = patch.keywordAttempt
  if (patch.completionTime !== undefined) update.completionTime = patch.completionTime
  if (patch.keywordCorrect !== undefined) update.keywordCorrect = patch.keywordCorrect
  if (patch.finished !== undefined) update.finished = patch.finished
  if (patch.finishedAt !== undefined) update.finishedAt = patch.finishedAt
  else if (patch.finished === true) update.finishedAt = now
  return update
}
