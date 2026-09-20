import { useEffect, useState } from 'react'
import type { TeamRecord } from '../types'
import { getBackend } from '../services/gameService'

/** Subscribes to every team's record — used by the leaderboard and admin
 * screens. Dynamic: however many teams have joined (Team 01..Team 15..N),
 * nothing here assumes a fixed count. */
export function useAllTeams(): Record<string, TeamRecord> {
  const [teams, setTeams] = useState<Record<string, TeamRecord>>({})

  useEffect(() => {
    return getBackend().subscribeTeams(setTeams)
  }, [])

  return teams
}
