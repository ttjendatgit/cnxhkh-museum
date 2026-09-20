import { Canvas } from '@react-three/fiber'
import Museum from './museum/Museum'
import PlayerController from './museum/PlayerController'
import HUD from './ui/HUD'
import ArtifactDetailPanel from './museum/components/ArtifactDetailPanel'
import FinalGameOverlay from './museum/final-room/FinalGameOverlay'
import FinalGameStandalone from './museum/final-room/FinalGameStandalone'
import { getStandaloneFinalGameView } from './museum/final-room/finalGameRoute'
import { useIsTouchDevice } from './museum/input/useIsTouchDevice'
import TouchControls from './ui/TouchControls'

const SCENE_BACKGROUND = '#2A2723'
// Phones report a pixel ratio of 3 or more; rendering the whole museum at that is what makes them
// stutter. 1.5 keeps it sharp enough and is far cheaper. Desktop keeps three's default range [1, 2].
const MOBILE_MAX_DPR = 1.5

export default function App() {
  const touch = useIsTouchDevice()

  // `?game=admin|leaderboard|player` opens a final-game screen full-page
  // (operator laptop / projector) instead of the 3D museum.
  const standaloneView = getStandaloneFinalGameView()
  if (standaloneView) return <FinalGameStandalone view={standaloneView} />

  return (
    <>
      <Canvas shadows="soft" dpr={touch ? [1, MOBILE_MAX_DPR] : [1, 2]} camera={{ position: [0, 1.7, 2.5], fov: 75, near: 0.1, far: 120 }}>
        <color attach="background" args={[SCENE_BACKGROUND]} />
        <fog attach="fog" args={[SCENE_BACKGROUND, 14, 55]} />
        {/* Stronger overall fill so the galleries read bright and inviting —
            the ceiling track lights and focused exhibit spots still layer
            the directional shaping and focal contrast on top of this. */}
        <ambientLight intensity={0.62} color="#FFEED9" />
        <hemisphereLight args={['#FFF6E8', '#3A322A', 0.66]} />
        <directionalLight position={[6, 18, 8]} intensity={0.42} color="#FFD9A6" />
        <Museum />
        <PlayerController />
      </Canvas>
      <HUD />
      <TouchControls />
      <ArtifactDetailPanel />
      <FinalGameOverlay />
    </>
  )
}
