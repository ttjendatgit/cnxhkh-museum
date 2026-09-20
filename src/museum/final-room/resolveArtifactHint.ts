import type { ResolveArtifact } from '../../final-game/types'
import { getArtifactById } from '../data/artifacts'

const ROOM_LABELS: Record<string, string> = {
  room1: 'Phòng I',
  room2: 'Phòng II',
  room3: 'Phòng III',
}

/** Bridges the two worlds: the final game stores only artifact *ids* on its
 * questions and never imports museum data, so the museum hands it this
 * resolver to turn an id into the title/room a team should go and study. */
export const resolveArtifactHint: ResolveArtifact = (artifactId) => {
  const artifact = getArtifactById(artifactId)
  if (!artifact) return null
  return { title: artifact.title, location: ROOM_LABELS[artifact.roomId] }
}
