import { create } from 'zustand'

interface KioskStoreState {
  /** The player is within reach of the Room 3 reference kiosk; `distance` feeds the shared E arbitration. */
  nearby: { distance: number } | null
  /** The kiosk panel is open — PlayerController freezes movement while true. */
  open: boolean

  reportNearby: (distance: number) => void
  clearNearby: () => void
  openKiosk: () => void
  close: () => void
}

/** Museum-side state for the Room 3 reference kiosk (sources, source ledger, FAQ). Separate from
 * the artifact and video stores. */
export const useKioskStore = create<KioskStoreState>((set, get) => ({
  nearby: null,
  open: false,

  reportNearby: (distance) => {
    const current = get().nearby
    // Same "nearby" answer: refresh the distance in place, without re-rendering subscribers every frame.
    if (current) current.distance = distance
    else set({ nearby: { distance } })
  },
  clearNearby: () => {
    if (get().nearby) set({ nearby: null })
  },
  openKiosk: () => {
    if (get().nearby && !get().open) set({ open: true })
  },
  close: () => set({ open: false }),
}))
