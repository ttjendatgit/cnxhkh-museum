import { AdminScreen, LeaderboardScreen, PlayerScreen } from '../../final-game'
import AdminGate from './AdminGate'
import { resolveArtifactHint } from './resolveArtifactHint'
import type { FinalGameView } from './useFinalGameStore'

/** The single place the museum touches the final-game module's screens.
 * Loaded lazily (see FinalGameOverlay / FinalGameStandalone), so the game —
 * and the Firebase SDK behind it — stays out of the museum's initial bundle
 * until someone actually opens the game. */
export function WallLeaderboard() {
  return <LeaderboardScreen variant="wall" />
}

export default function FinalGameScreens({ view }: { view: FinalGameView }) {
  if (view === 'leaderboard') return <LeaderboardScreen />
  if (view === 'admin') {
    return (
      <AdminGate>
        <AdminScreen />
      </AdminGate>
    )
  }
  return <PlayerScreen resolveArtifact={resolveArtifactHint} />
}
