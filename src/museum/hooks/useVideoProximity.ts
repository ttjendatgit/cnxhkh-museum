import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, type Object3D } from 'three'
import type { MuseumVideo } from '../data/room3Videos'
import { useVideoStore } from '../state/useVideoStore'

/** Reports how far the player is from a video screen to the video store, every frame, so the
 * nearest screen can offer "E to watch". The counterpart of useArtifactProximity. */
export function useVideoProximity(video: MuseumVideo, targetRef: RefObject<Object3D | null>, radius: number): void {
  const reportNearby = useVideoStore((state) => state.reportNearby)
  const clearNearby = useVideoStore((state) => state.clearNearby)
  const worldPosition = useMemo(() => new Vector3(), [])
  const wasNearby = useRef(false)

  useFrame(({ camera }) => {
    if (!targetRef.current) return
    targetRef.current.getWorldPosition(worldPosition)
    const distance = camera.position.distanceTo(worldPosition)
    const isNearby = distance <= radius

    if (isNearby) reportNearby(video, distance)
    else if (wasNearby.current) clearNearby(video.id)
    wasNearby.current = isNearby
  })

  // If the screen unmounts while it is the nearest, don't leave a stale prompt behind.
  useEffect(() => () => clearNearby(video.id), [video.id, clearNearby])
}
