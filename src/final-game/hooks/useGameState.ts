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

/** The global game state (waiting/playing/paused/finished) and whether the database has answered
 * yet. Until it has, `state` is the initial "waiting" — a screen that must not treat a game in
 * progress as "not started" (a reload mid-game) waits for `loaded`. */
export function useGameStatus(): { state: GameStateRecord; loaded: boolean } {
  const [value, setValue] = useState<{ state: GameStateRecord; loaded: boolean }>({ state: INITIAL_STATE, loaded: false })

  useEffect(() => {
    return getBackend().subscribeGameState((state) => setValue({ state, loaded: true }))
  }, [])

  return value
}

/** Subscribes to the global game state (waiting/playing/paused/finished). */
export function useGameState(): GameStateRecord {
  return useGameStatus().state
}
