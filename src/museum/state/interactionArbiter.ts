import { useArtifactStore } from './useArtifactStore'
import { useVideoStore } from './useVideoStore'
import { useKioskStore } from './useKioskStore'

/** What "E" (or the touch [TƯƠNG TÁC] button) would act on. Artifact frames, Room 3 video
 * screens and the Room 3 kiosk can have overlapping reach, and one press must open only one of them. */
export type Interaction = 'artifact' | 'video' | 'kiosk'

/** The nearest of the three, given their current "nearby" answers; a tie goes to the artifact,
 * then the video, then the kiosk. */
export function pickNearest(
  artifact: { distance: number } | null,
  video: { distance: number } | null,
  kiosk: { distance: number } | null,
): Interaction | null {
  const candidates: [Interaction, number][] = []
  if (artifact) candidates.push(['artifact', artifact.distance])
  if (video) candidates.push(['video', video.distance])
  if (kiosk) candidates.push(['kiosk', kiosk.distance])
  candidates.sort((a, b) => a[1] - b[1]) // stable: earlier entries win ties
  return candidates[0]?.[0] ?? null
}

/** The same, read straight from the stores at the moment of a key press or tap. Anything already
 * open does not count. */
export function nearestInteraction(): Interaction | null {
  const artifact = useArtifactStore.getState()
  const video = useVideoStore.getState()
  const kiosk = useKioskStore.getState()
  return pickNearest(
    artifact.nearby && !artifact.activeArtifact ? artifact.nearby : null,
    video.nearby && !video.active ? video.nearby : null,
    kiosk.nearby && !kiosk.open ? kiosk.nearby : null,
  )
}
