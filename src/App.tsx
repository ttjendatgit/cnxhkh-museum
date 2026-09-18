import { Canvas } from '@react-three/fiber'
import Museum from './museum/Museum'
import PlayerController from './museum/PlayerController'
import HUD from './ui/HUD'

const SCENE_BACKGROUND = '#2A2723'

export default function App() {
  return (
    <>
      <Canvas shadows="soft" camera={{ position: [0, 1.7, 2.5], fov: 75, near: 0.1, far: 120 }}>
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
    </>
  )
}
