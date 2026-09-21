import type { GameStatus } from '../types'

/**
 * The game as a player sees it, derived from the room's stored status (which the admin panel and
 * Firebase keep writing as 'waiting' | 'playing' | 'paused' | 'finished' — unchanged):
 *   WAITING   the host has not started the game
 *   RUNNING   the game is on ('playing', and also 'paused': the same screen, answers held)
 *   FINISHED  the host ended it
 */
export type GamePhase = 'WAITING' | 'RUNNING' | 'FINISHED'

export function gamePhase(status: GameStatus): GamePhase {
  if (status === 'waiting') return 'WAITING'
  if (status === 'finished') return 'FINISHED'
  return 'RUNNING'
}

/** Whether answers are accepted right now: only while the game is actually playing (not waiting,
 * paused or finished). The one rule the answer-checking code enforces. */
export function acceptsAnswers(status: GameStatus): boolean {
  return status === 'playing'
}

/** Thrown by the answer-checking code when someone tries to answer while the game is not playing —
 * whatever the screen shows, an answer is never checked or recorded then. */
export class GameNotRunningError extends Error {
  readonly status: GameStatus

  constructor(status: GameStatus) {
    super(`[final-game] Answers are not accepted while the game is "${status}"`)
    this.name = 'GameNotRunningError'
    this.status = status
  }
}
