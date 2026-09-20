import type { LeaderboardEntry, ScoringConfig, TeamRecord } from '../types'

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

function toEntry(team: TeamRecord, rank: number, totalQuestions: number): LeaderboardEntry {
  return {
    rank,
    eligible: isEligible(team, totalQuestions),
    teamId: team.teamId,
    teamName: team.teamName,
    score: team.score,
    solvedCount: team.solvedQuestions.length,
    finished: team.finished,
    completionTime: team.completionTime,
  }
}

/**
 * The normal ranking, used while the game runs and for everyone outside the Top 3
 * afterwards. Every team is ranked: higher score, then more questions solved, then
 * earlier joinedAt (so the order is deterministic).
 */
export function rankTeams(teams: TeamRecord[], totalQuestions: number = TOTAL_QUESTIONS): LeaderboardEntry[] {
  return [...teams]
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score
      if (a.solvedQuestions.length !== b.solvedQuestions.length) return b.solvedQuestions.length - a.solvedQuestions.length
      return a.joinedAt - b.joinedAt
    })
    .map((team, index) => toEntry(team, index + 1, totalQuestions))
}

/**
 * The prize ranking, shown once the game is over. Only eligible teams (see isEligible)
 * compete: higher score, then shorter completionTime (no recorded time sorts last), then
 * earlier joinedAt. `rank` is the prize place. Returns at most `limit` teams.
 */
export function rankWinners(teams: TeamRecord[], totalQuestions: number = TOTAL_QUESTIONS, limit: number = PRIZE_COUNT): LeaderboardEntry[] {
  const timeOf = (team: TeamRecord) => team.completionTime ?? Number.POSITIVE_INFINITY

  return teams
    .filter((team) => isEligible(team, totalQuestions))
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score
      if (timeOf(a) !== timeOf(b)) return timeOf(a) < timeOf(b) ? -1 : 1
      return a.joinedAt - b.joinedAt
    })
    .slice(0, limit)
    .map((team, index) => toEntry(team, index + 1, totalQuestions))
}
