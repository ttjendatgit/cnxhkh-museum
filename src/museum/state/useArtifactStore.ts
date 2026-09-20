import { create } from 'zustand'
import type { Artifact } from '../types/Artifact'

interface NearbyArtifact {
  artifact: Artifact
  distance: number
}

interface ArtifactStoreState {
  /** The closest in-range artifact across every mounted ArtifactFrame, or
   * null if the player isn't near any of them. Each ArtifactFrame reports
   * its own distance every frame (see ArtifactFrame.tsx); this store just
   * keeps whichever report is currently closest. */
  nearby: NearbyArtifact | null
  /** The artifact whose ArtifactDetailPanel is currently open, if any. */
  activeArtifact: Artifact | null

  reportNearby: (artifact: Artifact, distance: number) => void
  clearNearby: (artifactId: string) => void
  openNearest: () => void
  open: (artifact: Artifact) => void
  close: () => void
}

export const useArtifactStore = create<ArtifactStoreState>((set, get) => ({
  nearby: null,
  activeArtifact: null,

  reportNearby: (artifact, distance) => {
    const current = get().nearby
    if (!current) {
      set({ nearby: { artifact, distance } })
    } else if (current.artifact.id === artifact.id) {
      // Same artifact still nearest: refresh its distance in place, without
      // notifying subscribers — every ArtifactFrame reports every frame, and
      // re-rendering the DOM overlay 60x/second for an unchanged answer is waste.
      current.distance = distance
    } else if (distance < current.distance) {
      set({ nearby: { artifact, distance } })
    }
  },

  clearNearby: (artifactId) => {
    const current = get().nearby
    if (current && current.artifact.id === artifactId) set({ nearby: null })
  },

  openNearest: () => {
    const { nearby, activeArtifact } = get()
    if (nearby && !activeArtifact) set({ activeArtifact: nearby.artifact })
  },

  open: (artifact) => set({ activeArtifact: artifact }),

  close: () => set({ activeArtifact: null }),
}))
