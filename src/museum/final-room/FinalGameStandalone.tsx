import { lazy, Suspense } from 'react'
import type { FinalGameView } from './useFinalGameStore'
import './finalRoomOverlay.css'

const FinalGameScreens = lazy(() => import('./FinalGameScreens'))

/** A final-game screen as its own full page (no 3D museum): used for the
 * operator console and the projector leaderboard — see finalGameRoute.ts. */
export default function FinalGameStandalone({ view }: { view: FinalGameView }) {
  return (
    <div className="final-room-standalone">
      <Suspense fallback={<p className="final-room-overlay__loading">Đang tải…</p>}>
        <FinalGameScreens view={view} />
      </Suspense>
    </div>
  )
}
