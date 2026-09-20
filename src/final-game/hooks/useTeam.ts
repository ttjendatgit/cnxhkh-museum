import { useEffect, useState } from 'react'
import type { TeamRecord } from '../types'
import { getBackend } from '../services/gameService'

/** Subscribes to a single team's live record. Pass `null` while no team has
 * joined yet (e.g. before TeamLobby completes).
 *
 * `loading` is true from subscribing until the database has answered once, so a screen can
 * tell "still checking the stored team" (after a reload) from "that team does not exist". */
export function useTeam(teamId: string | null): { team: TeamRecord | null; loading: boolean } {
  // Which team id the last answer was for, so a new id counts as loading again.
  const [answer, setAnswer] = useState<{ teamId: string; team: TeamRecord | null } | null>(null)

  useEffect(() => {
    if (!teamId) return
    return getBackend().subscribeTeam(teamId, (team) => setAnswer({ teamId, team }))
  }, [teamId])

  // Derived during render rather than reset via a separate effect branch:
  // once teamId itself goes back to null, the last-subscribed team is stale.
  if (!teamId) return { team: null, loading: false }
  if (answer?.teamId !== teamId) return { team: null, loading: true }
  return { team: answer.team, loading: false }
}
