/** Shared types for the standalone Final Room multiplayer puzzle module.
 * This module imports nothing from the museum; the museum imports it only
 * through src/museum/final-room/ (the integration layer). */

export type GameStatus = 'waiting' | 'playing' | 'paused' | 'finished'

export interface Question {
  id: number
  question: string
  answer: string
  /** Other spellings accepted as correct, e.g. "02/09/1945" for "2/9/1945". */
  alternativeAnswers?: string[]
  /** Optional illustration shown with the question (a plain image URL, e.g. Cloudinary). */
  image?: string
  /** Id of the museum artifact this question is about. This module never
   * imports museum data — the host app turns the id into a visitor-facing
   * hint through the `resolveArtifact` prop (see ResolveArtifact). */
  relatedArtifactId?: string
  /** The single keyword letter awarded for solving this question. */
  rewardLetter: string
}

/** What the host app tells the player about a question's related artifact. */
export interface RelatedArtifactInfo {
  title: string
  /** Where to find it, e.g. "Phòng I". */
  location?: string
}

/** Supplied by the host app so this module can stay independent of museum data. */
export type ResolveArtifact = (artifactId: string) => RelatedArtifactInfo | null

/** One team's full record, as stored under `/final-game/teams/{teamId}`. */
export interface TeamRecord {
  teamId: string
  teamName: string
  /** Number of questions solved so far (0–13). */
  progress: number
  /** Question ids this team has answered correctly. */
  solvedQuestions: number[]
  /** Letters revealed so far, index-aligned to question order (13 slots,
   * empty string for a slot not yet unlocked). */
  collectedLetters: string[]
  score: number
  /** ms elapsed from game start (minus paused time) to this team finishing, or null until finished. */
  completionTime: number | null
  /** The team's latest attempt at the final keyword (right or wrong). */
  keywordAttempt: string
  /** The team has entered the final keyword correctly. On its own this does NOT finish the game. */
  keywordCorrect: boolean
  /** Victory: all 13 questions solved AND the keyword entered correctly (in either order). */
  finished: boolean
  /** Epoch ms of victory, or null until then. */
  finishedAt: number | null
  joinedAt: number
}

/** Global game state, stored under `/final-game/gameState`. */
export interface GameStateRecord {
  status: GameStatus
  /** Epoch ms when the game was (most recently) started. */
  startedAt: number | null
  /** Epoch ms when the game was paused, or null if not currently paused. */
  pausedAt: number | null
  /** Total ms spent paused so far — subtracted when computing completion time. */
  totalPausedMs: number
  endedAt: number | null
}

export interface LeaderboardEntry {
  /** Place in the list this entry came from: the normal ranking, or the prize place for a winner. */
  rank: number
  /** Solved every question, keyword correct and finished — the only teams that can win a prize. */
  eligible: boolean
  teamId: string
  teamName: string
  score: number
  solvedCount: number
  finished: boolean
  completionTime: number | null
}

export interface ScoringConfig {
  pointsPerQuestion: number
  keywordBonus: number
}
