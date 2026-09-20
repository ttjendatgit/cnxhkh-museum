import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Center, OrbitControls } from '@react-three/drei'
import { ARTIFACT_MODELS } from './artifactModels'
import { useIsTouchDevice } from '../input/useIsTouchDevice'

/* OrbitControls handles touch itself: one finger rotates, two fingers pinch-zoom (and it sets
 * touch-action: none on its canvas, so dragging the model never scrolls the panel). */
interface ArtifactModelViewerProps {
  modelId: string
}

/** The 360° viewing mode: a small self-contained R3F canvas inside the
 * artifact panel that shows the same scene component the room uses (via the
 * registry) on an orbit rig — drag to rotate, wheel to zoom, no panning.
 * Player movement is already frozen while any artifact panel is open, and
 * Esc closes the panel like any other artifact. */
export default function ArtifactModelViewer({ modelId }: ArtifactModelViewerProps) {
  const config = ARTIFACT_MODELS[modelId]
  const touch = useIsTouchDevice()
  // Gentle turntable until the visitor takes over with the mouse.
  const [autoRotate, setAutoRotate] = useState(true)

  if (!config) {
    return <div className="artifact-panel__media-fallback">Không có mô hình 3D cho hiện vật này</div>
  }

  return (
    <div className="artifact-model-viewer">
      <Canvas camera={{ position: [0, config.cameraDistance * 0.35, config.cameraDistance], fov: 40 }} dpr={[1, 2]}>
        <ambientLight intensity={1.1} />
        <directionalLight position={[3, 5, 4]} intensity={2} />
        <directionalLight position={[-4, 2, -3]} intensity={0.8} color="#FFD9A0" />
        <Suspense fallback={null}>
          <Center>{config.render()}</Center>
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableDamping
          minDistance={config.minDistance}
          maxDistance={config.maxDistance}
          autoRotate={autoRotate}
          autoRotateSpeed={1.6}
          onStart={() => setAutoRotate(false)}
        />
      </Canvas>
      <p className="artifact-model-viewer__hint">{touch ? 'Kéo một ngón để xoay · Chụm hai ngón để phóng to / thu nhỏ' : 'Kéo chuột để xoay · Cuộn để phóng to / thu nhỏ · Esc để thoát'}</p>
    </div>
  )
}
