import type { GameStateRecord, TeamRecord } from '../types'

/** Unsubscribe function returned by every subscribe*() call. */
export type Unsubscribe = () => void

/**
 * The contract both the Firebase-backed store (firebaseBackend.ts) and the
 * in-memory mock (mockBackend.ts) implement. Every component/hook in this
 * module talks to this interface only, never to Firebase or the mock
 * directly — that's what makes swapping backends (see gameService.ts) safe.
 */
export interface GameBackend {
  subscribeGameState(cb: (state: GameStateRecord) => void): Unsubscribe
  setGameState(patch: Partial<GameStateRecord>): Promise<void>

  subscribeTeams(cb: (teams: Record<string, TeamRecord>) => void): Unsubscribe
  subscribeTeam(teamId: string, cb: (team: TeamRecord | null) => void): Unsubscribe
  createTeam(teamName: string): Promise<TeamRecord>
  updateTeam(teamId: string, patch: Partial<TeamRecord>): Promise<void>

  /** Starts the competition over: removes every team, sets the status back to
   * 'waiting' and clears the timing. Subscribers see zero teams straight away. */
  resetRoom(): Promise<void>
}
