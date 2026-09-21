import { create } from 'zustand'
import type { MuseumVideo } from '../data/room3Videos'

interface NearbyVideo {
  video: MuseumVideo
  distance: number
}

interface VideoStoreState {
  /** The closest in-range video screen, or null. Every screen reports its own distance each
   * frame (see hooks/useVideoProximity.ts); this keeps whichever report is closest. */
  nearby: NearbyVideo | null
  /** The video open in the large player, if any. */
  active: MuseumVideo | null

  reportNearby: (video: MuseumVideo, distance: number) => void
  clearNearby: (videoId: string) => void
  openNearest: () => void
  close: () => void
}

/** Museum-side state for the video walls — the same shape as the artifact store, and separate
 * from it: the artifact system is untouched. The wall screens keep playing muted whatever this says. */
export const useVideoStore = create<VideoStoreState>((set, get) => ({
  nearby: null,
  active: null,

  reportNearby: (video, distance) => {
    const current = get().nearby
    if (!current) {
      set({ nearby: { video, distance } })
    } else if (current.video.id === video.id) {
      // Same screen still nearest: refresh its distance without notifying subscribers.
      current.distance = distance
    } else if (distance < current.distance) {
      set({ nearby: { video, distance } })
    }
  },

  clearNearby: (videoId) => {
    const current = get().nearby
    if (current && current.video.id === videoId) set({ nearby: null })
  },

  openNearest: () => {
    const { nearby, active } = get()
    if (nearby && !active) set({ active: nearby.video })
  },

  close: () => set({ active: null }),
}))
