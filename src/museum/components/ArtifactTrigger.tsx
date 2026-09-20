import { useRef } from 'react'
import type { Group } from 'three'
import type { Artifact } from '../types/Artifact'
import { useArtifactProximity } from '../hooks/useArtifactProximity'

interface ArtifactTriggerProps {
  artifact: Artifact
  /** How close the player must be. Larger than a wall frame's radius by
   * default, since 3D exhibits usually sit behind a barrier the player
   * can't walk up to. */
  radius?: number
}

/** An invisible proximity trigger for artifacts that are real 3D objects in
 * the scene rather than wall frames — same interaction as ArtifactFrame
 * (nearest-wins prompt, E to open), but with no geometry of its own: the
 * existing 3D object stays exactly as it is. */
export default function ArtifactTrigger({ artifact, radius = 3.2 }: ArtifactTriggerProps) {
  const ref = useRef<Group>(null)

  useArtifactProximity(artifact, ref, radius)

  return <group ref={ref} position={[artifact.position.x, artifact.position.y, artifact.position.z]} userData={{ artifactId: artifact.id }} />
}
