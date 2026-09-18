import { useMemo } from 'react'
import * as THREE from 'three'

interface ExhibitSpotlightProps {
  position: [number, number, number]
  targetPosition: [number, number, number]
  color?: string
  intensity?: number
  angle?: number
  penumbra?: number
  distance?: number
  castShadow?: boolean
}

export default function ExhibitSpotlight({
  position,
  targetPosition,
  color = '#FFC98A',
  intensity = 3.2,
  angle = 0.4,
  penumbra = 0.6,
  distance = 9,
  castShadow = true,
}: ExhibitSpotlightProps) {
  const target = useMemo(() => new THREE.Object3D(), [])
  target.position.set(targetPosition[0], targetPosition[1], targetPosition[2])

  return (
    <>
      <primitive object={target} />
      <spotLight
        position={position}
        target={target}
        color={color}
        intensity={intensity}
        angle={angle}
        penumbra={penumbra}
        distance={distance}
        decay={2}
        castShadow={castShadow}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={4}
      />
    </>
  )
}
