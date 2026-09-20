import { useEffect, useState } from 'react'
import type { GameStateRecord } from '../types'
import { getBackend } from '../services/gameService'

const INITIAL_STATE: GameStateRecord = {
  status: 'waiting',
  startedAt: null,
  pausedAt: null,
  totalPausedMs: 0,
  endedAt: null,
}

/** Subscribes to the global game state (waiting/playing/paused/finished). */
export function useGameState(): GameStateRecord {
  const [state, setState] = useState<GameStateRecord>(INITIAL_STATE)

  useEffect(() => {
    return getBackend().subscribeGameState(setState)
  }, [])

  return state
}
