import { child, onValue, push, ref, remove, set, update, type DatabaseReference } from 'firebase/database'
import type { GameRoomTeamNode, GameRoomTimingNode } from './roomSchema'
import { gameStateFromNodes, gameStatePatchToUpdate, teamFromNode, teamPatchToUpdate, teamToNode } from './roomSchema'
import type { TeamRecord } from '../types'
import { GAME_ROOMS_ROOT, getFirebaseDb } from './firebase'
import { getRoomId } from './room'
import type { GameBackend } from './gameBackend'

/**
 * Firebase Realtime Database implementation of GameBackend, under
 * `gameRooms/{roomId}` — the layout (status, timing, teams/{teamId}) is documented
 * in roomSchema.ts, which also does the mapping to and from the module's records.
 *
 * A player's answer updates only their own `teams/{teamId}` node; the leaderboard
 * and the admin subscribe to the whole `teams` node and update the instant any team changes.
 */
export function createFirebaseBackend(): GameBackend {
  function roomRef(): DatabaseReference {
    return ref(getFirebaseDb(), `${GAME_ROOMS_ROOT}/${getRoomId()}`)
  }
  const teamsRef = () => child(roomRef(), 'teams')
  const teamRef = (teamId: string) => child(teamsRef(), teamId)

  return {
    subscribeGameState(cb) {
      let status: unknown = null
      let timing: GameRoomTimingNode | null = null
      // Report only once both nodes have arrived: a missing status reads as 'waiting', and
      // a lone timing update must never make a running game look like it has not started.
      let statusLoaded = false
      let timingLoaded = false
      const emit = () => {
        if (statusLoaded && timingLoaded) cb(gameStateFromNodes(status, timing))
      }

      const stopStatus = onValue(child(roomRef(), 'status'), (snapshot) => {
        status = snapshot.val()
        statusLoaded = true
        emit()
      })
      const stopTiming = onValue(child(roomRef(), 'timing'), (snapshot) => {
        timing = snapshot.exists() ? (snapshot.val() as GameRoomTimingNode) : null
        timingLoaded = true
        emit()
      })
      return () => {
        stopStatus()
        stopTiming()
      }
    },

    async setGameState(patch) {
      await update(roomRef(), gameStatePatchToUpdate(patch))
    },

    subscribeTeams(cb) {
      return onValue(teamsRef(), (snapshot) => {
        const teams: Record<string, TeamRecord> = {}
        snapshot.forEach((node) => {
          const key = node.key
          if (key) teams[key] = teamFromNode(node.val() as Partial<GameRoomTeamNode>, key)
        })
        cb(teams)
      })
    },

    subscribeTeam(teamId, cb) {
      return onValue(teamRef(teamId), (snapshot) => {
        cb(snapshot.exists() ? teamFromNode(snapshot.val() as Partial<GameRoomTeamNode>, teamId) : null)
      })
    },

    async createTeam(teamName) {
      const newRef = push(teamsRef())
      const teamId = newRef.key
      if (!teamId) throw new Error('[final-game] Firebase failed to allocate a team id')
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
      await set(newRef, teamToNode(team))
      return team
    },

    async updateTeam(teamId, patch) {
      await update(teamRef(teamId), teamPatchToUpdate(patch, Date.now()))
    },

    async resetRoom() {
      // Teams first, so the leaderboard never shows a "waiting" room still holding old teams.
      await remove(teamsRef())
      await update(roomRef(), { status: 'waiting', timing: null })
    },
  }
}
