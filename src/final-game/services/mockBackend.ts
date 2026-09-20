import type { GameStateRecord, TeamRecord } from '../types'
import type { GameBackend } from './gameBackend'

import { getRoomId } from './room'

// One mock database per room id, like the real gameRooms/{roomId}.
const STORAGE_KEY = `final-game:mock-db:${getRoomId()}`

const INITIAL_GAME_STATE: GameStateRecord = {
  status: 'waiting',
  startedAt: null,
  pausedAt: null,
  totalPausedMs: 0,
  endedAt: null,
}

interface PersistedDb {
  gameState: GameStateRecord
  teams: Record<string, TeamRecord>
}

function readPersisted(): PersistedDb | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PersistedDb) : null
  } catch {
    return null
  }
}

function writePersisted(db: PersistedDb): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // Storage unavailable (private mode / quota) — the mock still works for this tab.
  }
}

/**
 * Local stand-in for Firebase, implementing the same `GameBackend` contract
 * so every hook/component works unmodified against either one
 * (`gameService.ts` picks this automatically when no VITE_FIREBASE_* env vars
 * are set).
 *
 * State is mirrored to localStorage and kept in sync across tabs of the same
 * browser through the `storage` event, so player / admin / leaderboard tabs
 * can be opened side by side and behave like the real thing during
 * development. It does NOT sync across devices — that is what the real
 * Firebase backend is for.
 */
export function createMockBackend(): GameBackend {
  const persisted = readPersisted()
  let gameState: GameStateRecord = persisted?.gameState ?? INITIAL_GAME_STATE
  const teams = new Map<string, TeamRecord>(Object.entries(persisted?.teams ?? {}))

  const gameStateListeners = new Set<(state: GameStateRecord) => void>()
  const teamsListeners = new Set<(teams: Record<string, TeamRecord>) => void>()
  const teamListeners = new Map<string, Set<(team: TeamRecord | null) => void>>()

  function snapshotTeams(): Record<string, TeamRecord> {
    return Object.fromEntries(teams.entries())
  }

  function emitGameState() {
    for (const listener of gameStateListeners) listener(gameState)
  }

  function emitTeams() {
    const snapshot = snapshotTeams()
    for (const listener of teamsListeners) listener(snapshot)
  }

  function emitTeam(teamId: string) {
    const listeners = teamListeners.get(teamId)
    if (!listeners) return
    const team = teams.get(teamId) ?? null
    for (const listener of listeners) listener(team)
  }

  function persist() {
    writePersisted({ gameState, teams: snapshotTeams() })
  }

  // Another tab wrote to the shared mock database: adopt its state and notify
  // every local subscriber.
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key !== STORAGE_KEY) return
      const next = readPersisted()
      gameState = next?.gameState ?? INITIAL_GAME_STATE
      const knownIds = new Set([...teams.keys(), ...Object.keys(next?.teams ?? {})])
      teams.clear()
      for (const [id, team] of Object.entries(next?.teams ?? {})) teams.set(id, team)
      emitGameState()
      emitTeams()
      for (const id of knownIds) emitTeam(id)
    })
  }

  return {
    subscribeGameState(cb) {
      gameStateListeners.add(cb)
      cb(gameState)
      return () => gameStateListeners.delete(cb)
    },

    async setGameState(patch) {
      gameState = { ...gameState, ...patch }
      persist()
      emitGameState()
    },

    async resetRoom() {
      const knownIds = [...teams.keys()]
      teams.clear()
      gameState = INITIAL_GAME_STATE
      persist()
      emitGameState()
      emitTeams()
      for (const id of knownIds) emitTeam(id)
    },

    subscribeTeams(cb) {
      teamsListeners.add(cb)
      cb(snapshotTeams())
      return () => teamsListeners.delete(cb)
    },

    subscribeTeam(teamId, cb) {
      let listeners = teamListeners.get(teamId)
      if (!listeners) {
        listeners = new Set()
        teamListeners.set(teamId, listeners)
      }
      const set = listeners
      set.add(cb)
      cb(teams.get(teamId) ?? null)
      return () => set.delete(cb)
    },

    async createTeam(teamName) {
      const teamId = `team-${Date.now()}-${Math.floor(Math.random() * 10000)}`
      const team: TeamRecord = {
        teamId,
        teamName,
        progress: 0,
        solvedQuestions: [],
        collectedLetters: [],
        score: 0,
        completionTime: null,
        keywordAttempt: '',
        keywordCorrect: false,
        finished: false,
        finishedAt: null,
        joinedAt: Date.now(),
      }
      teams.set(teamId, team)
      persist()
      emitTeams()
      emitTeam(teamId)
      return team
    },

    async updateTeam(teamId, patch) {
      const existing = teams.get(teamId)
      if (!existing) throw new Error(`[final-game mock backend] Unknown teamId: ${teamId}`)
      teams.set(teamId, { ...existing, ...patch })
      persist()
      emitTeams()
      emitTeam(teamId)
    },
  }
}
