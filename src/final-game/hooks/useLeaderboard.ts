import { useMemo } from 'react'
import type { LeaderboardEntry } from '../types'
import { QUESTIONS } from '../data/questions'
import { calculateRanking, rankWinners } from '../services/rankingService'
import { useAllTeams } from './useAllTeams'

/** Realtime ranked leaderboard, derived client-side from the live `teams`
 * subscription (see firebaseBackend.ts for why this isn't a separate
 * written DB path) — updates the instant any team's score/finish state changes. */
export function useLeaderboard(): LeaderboardEntry[] {
  const teams = useAllTeams()

  return useMemo(() => calculateRanking(Object.values(teams), QUESTIONS.length), [teams])
}

/** The Top 3 prize winners (eligible teams only), for the end-of-game board. */
export function useWinners(): LeaderboardEntry[] {
  const teams = useAllTeams()

  return useMemo(() => rankWinners(Object.values(teams), QUESTIONS.length), [teams])
}
