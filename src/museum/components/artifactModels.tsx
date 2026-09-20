import type { ReactNode } from 'react'
import BallotBox1946 from './BallotBox1946'

/** How the 360° viewer presents one 3D artifact. Artifacts opt in by setting
 * `modelId` to a key of ARTIFACT_MODELS — the panel itself never names an
 * individual artifact. */
export interface ArtifactModelConfig {
  /** Renders the existing scene component (never a second copy of the asset). */
  render: () => ReactNode
  /** Initial camera distance from the model's center. */
  cameraDistance: number
  minDistance: number
  maxDistance: number
}

// Same scale Room 1 uses for the in-scene ballot box (Room1Props'
// BALLOT_BOX_SCALE), so the viewer shows the model at its real proportions.
const BALLOT_BOX_DISPLAY_SCALE = 0.494

export const ARTIFACT_MODELS: Record<string, ArtifactModelConfig> = {
  'ballot-box-1946': {
    render: () => <BallotBox1946 scale={BALLOT_BOX_DISPLAY_SCALE} />,
    cameraDistance: 2.4,
    minDistance: 1.1,
    maxDistance: 5,
  },
}
