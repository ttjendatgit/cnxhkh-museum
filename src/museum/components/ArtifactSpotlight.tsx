import { useMemo } from 'react'
import * as THREE from 'three'

// Shared warm tone for every dedicated artifact hero spotlight — softer and
// warmer than the general GOLD_SPOT exhibit accent used elsewhere, so the
// artifact itself reads as the room's main focal point without tipping into
// an overexposed/blown-out highlight.
const ARTIFACT_SPOTLIGHT_COLOR = '#FFE2B8'

interface ArtifactSpotlightProps {
  /** Ceiling-mounted light origin. */
  position: [number, number, number]
  /** Point on/near the artifact the beam is aimed at. */
  targetPosition: [number, number, number]
  color?: string
  intensity?: number
  /** Beam cone angle in radians — keep within ~35–45° (0.61–0.79 rad) so the
   * light reads as a focused artifact spot, not a room wash. */
  angle?: number
  /** Kept high by default for a soft, gradual edge instead of a hard theatrical cone. */
  penumbra?: number
  distance?: number
  castShadow?: boolean
}

/** A dedicated ceiling spotlight for a single hero artifact: warm, soft-edged,
 * shadow-casting — the room's main focal light, distinct from the general
 * ceiling wash and the secondary wall-panel accents. */
export default function ArtifactSpotlight({
  position,
  targetPosition,
  color = ARTIFACT_SPOTLIGHT_COLOR,
  intensity = 4.0,
  angle = 0.7,
  penumbra = 0.78,
  distance = 8,
  castShadow = true,
}: ArtifactSpotlightProps) {
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
        shadow-radius={6}
      />
    </>
  )
}
