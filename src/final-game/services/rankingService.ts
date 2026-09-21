import type { LeaderboardEntry, TeamRecord } from '../types'
import { PRIZE_COUNT, TOTAL_QUESTIONS, isEligible } from './scoring.ts'

/** The one ordering every screen uses — the public leaderboard, the Top 3 and a team's own
 * result screen — so a team's rank can never differ between them:
 * higher score first; on equal scores the shorter completionTime first (no recorded time
 * sorts last); then more solved questions, then earlier joinedAt so the order is deterministic. */
export function compareTeams(a: TeamRecord, b: TeamRecord): number {
  if (a.score !== b.score) return b.score - a.score

  const timeA = a.completionTime ?? Number.POSITIVE_INFINITY
  const timeB = b.completionTime ?? Number.POSITIVE_INFINITY
  if (timeA !== timeB) return timeA < timeB ? -1 : 1

  if (a.solvedQuestions.length !== b.solvedQuestions.length) return b.solvedQuestions.length - a.solvedQuestions.length
  return a.joinedAt - b.joinedAt
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

/** Every team, sorted with compareTeams and numbered from 1 with no gaps. Does not reorder the input. */
export function calculateRanking(teams: TeamRecord[], totalQuestions: number = TOTAL_QUESTIONS): LeaderboardEntry[] {
  return [...teams].sort(compareTeams).map((team, index) => toEntry(team, index + 1, totalQuestions))
}

/** A team's place in `ranking` (1-based), or null when it is not in the list. */
export function findRank(ranking: LeaderboardEntry[], teamId: string): number | null {
  const index = ranking.findIndex((entry) => entry.teamId === teamId)
  return index === -1 ? null : index + 1
}

/** The prize ranking, shown once the game is over: the eligible teams (see isEligible) in
 * compareTeams order, at most `limit` of them. `rank` is the prize place. */
export function rankWinners(teams: TeamRecord[], totalQuestions: number = TOTAL_QUESTIONS, limit: number = PRIZE_COUNT): LeaderboardEntry[] {
  return teams
    .filter((team) => isEligible(team, totalQuestions))
    .sort(compareTeams)
    .slice(0, limit)
    .map((team, index) => toEntry(team, index + 1, totalQuestions))
}
