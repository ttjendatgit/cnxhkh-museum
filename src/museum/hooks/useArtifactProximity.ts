import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, type Object3D } from 'three'
import type { Artifact } from '../types/Artifact'
import { useArtifactStore } from '../state/useArtifactStore'

/**
 * Shared proximity reporting for anything in the scene that opens an artifact
 * panel (ArtifactFrame on walls, ArtifactTrigger on 3D objects): every frame,
 * measures camera-to-target distance and reports it to the artifact store,
 * which keeps whichever artifact is nearest. Purely reports — the single
 * E/Esc key handler lives in ArtifactDetailPanel.
 *
 * `onFrame` is called each frame with the in-range flag, for visual
 * feedback that must stay imperative (no React re-render), e.g. a glow.
 */
export function useArtifactProximity(
  artifact: Artifact,
  targetRef: RefObject<Object3D | null>,
  radius: number,
  onFrame?: (isNearby: boolean) => void,
): void {
  const reportNearby = useArtifactStore((state) => state.reportNearby)
  const clearNearby = useArtifactStore((state) => state.clearNearby)
  const worldPosition = useMemo(() => new Vector3(), [])
  const wasNearby = useRef(false)

  useFrame(({ camera }) => {
    if (!targetRef.current) return
    targetRef.current.getWorldPosition(worldPosition)
    const distance = camera.position.distanceTo(worldPosition)
    const isNearby = distance <= radius

    if (isNearby) {
      reportNearby(artifact, distance)
    } else if (wasNearby.current) {
      clearNearby(artifact.id)
    }
    wasNearby.current = isNearby

    onFrame?.(isNearby)
  })

  // If the trigger unmounts while it is the nearest one, don't leave a stale prompt behind.
  useEffect(() => () => clearNearby(artifact.id), [artifact.id, clearNearby])
}
