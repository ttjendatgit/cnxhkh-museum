import type { FinalGameView } from './useFinalGameStore'

/** Reads `?game=player|admin|leaderboard` from the URL. When present, the app
 * shows that final-game screen full-page instead of the 3D museum — the way
 * an operator laptop opens the admin console and a projector opens the
 * leaderboard, e.g. `/?game=admin`. */
export function getStandaloneFinalGameView(): FinalGameView | null {
  const value = new URLSearchParams(window.location.search).get('game')
  return value === 'player' || value === 'admin' || value === 'leaderboard' ? value : null
}
