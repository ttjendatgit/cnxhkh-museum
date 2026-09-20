import { create } from 'zustand'

/** Which final-game screen the overlay (or standalone page) is showing. */
export type FinalGameView = 'player' | 'admin' | 'leaderboard'

interface FinalGameStoreState {
  /** The player is within reach of the game station (drives the E prompt). */
  nearby: boolean
  /** The game overlay is open — PlayerController freezes movement while true. */
  open: boolean
  view: FinalGameView

  setNearby: (nearby: boolean) => void
  openStation: () => void
  close: () => void
  setView: (view: FinalGameView) => void
}

/** Museum-side state for the Final Room game station. Deliberately separate
 * from the artifact store: the artifact system is untouched by this feature. */
export const useFinalGameStore = create<FinalGameStoreState>((set) => ({
  nearby: false,
  open: false,
  view: 'player',

  setNearby: (nearby) => set({ nearby }),
  openStation: () => set({ open: true, view: 'player' }),
  close: () => set({ open: false }),
  setView: (view) => set({ view }),
}))
