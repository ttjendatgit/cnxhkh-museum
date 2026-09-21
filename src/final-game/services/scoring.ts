import type { ScoringConfig, TeamRecord } from '../types'

/** Default scoring — kept isolated from game logic so an event organizer can
 * retune point values without touching question/answer/game-state code. */
export const DEFAULT_SCORING: ScoringConfig = {
  pointsPerQuestion: 10,
  keywordBonus: 100,
}

export function computeScore(solvedCount: number, keywordSolved: boolean, config: ScoringConfig = DEFAULT_SCORING): number {
  return solvedCount * config.pointsPerQuestion + (keywordSolved ? config.keywordBonus : 0)
}

/** Number of questions a team must solve to win a prize. */
export const TOTAL_QUESTIONS = 13

/** Number of prize places. */
export const PRIZE_COUNT = 3

/** Can win: solved every question, found the keyword and finished. */
export function isEligible(team: TeamRecord, totalQuestions: number = TOTAL_QUESTIONS): boolean {
  return team.solvedQuestions.length >= totalQuestions && team.keywordCorrect && team.finished
}

// Ranking (leaderboard, Top 3, a team's own result) lives in rankingService.ts.
