import { lazy, Suspense, useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import './finalRoomScreen.css'

// Same lazy chunk as the game overlay — the leaderboard (and the Firebase SDK
// behind it) is only fetched once someone actually walks into the Final Room.
const WallLeaderboard = lazy(() => import('./FinalGameScreens').then((module) => ({ default: module.WallLeaderboard })))

/** Size of the DOM board in CSS px; its 2:1 ratio matches the 6 x 3 m screen. */
const BOARD_PX = { width: 1200, height: 600 }
const SCREEN_SIZE = { width: 6, height: 3 }
/** `Html transform` maps 1 world unit to 400 / distanceFactor CSS px. */
const DISTANCE_FACTOR = 400 / (BOARD_PX.width / SCREEN_SIZE.width)

interface FinalRoomScreenProps {
  centerZ: number
  width: number
  depth: number
  /** z of the screen's back panel (its front face sits 5cm ahead of this). */
  screenZ: number
}

/** The Final Room's big screen as a public leaderboard: waiting lobby before
 * the game, the realtime ranking during it, the result after it.
 *
 * The board is real DOM (the game module's LeaderboardScreen) laid over the
 * screen with `Html transform`. A DOM layer can't be hidden by walls, so it is
 * only mounted while the player is inside the room — from the neighbouring
 * gallery it would otherwise show through the wall. */
export default function FinalRoomScreen({ centerZ, width, depth, screenZ }: FinalRoomScreenProps) {
  const [inRoom, setInRoom] = useState(false)
  const wasInRoom = useRef(false)

  useFrame(({ camera }) => {
    const inside = Math.abs(camera.position.x) < width / 2 && Math.abs(camera.position.z - centerZ) < depth / 2
    if (inside !== wasInRoom.current) {
      wasInRoom.current = inside
      setInRoom(inside)
    }
  })

  if (!inRoom) return null

  return (
    <Html
      transform
      distanceFactor={DISTANCE_FACTOR}
      position={[0, 2, screenZ + 0.056]}
      pointerEvents="none"
      // Stay under the HUD (z 10), the artifact panel and the game overlay.
      zIndexRange={[4, 0]}
    >
      <div className="final-room-screen" style={{ width: BOARD_PX.width, height: BOARD_PX.height }}>
        <Suspense fallback={<p className="final-room-screen__loading">Đang tải bảng xếp hạng…</p>}>
          <WallLeaderboard />
        </Suspense>
      </div>
    </Html>
  )
}
