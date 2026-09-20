import Leaderboard, { type LeaderboardVariant } from '../components/Leaderboard'

/** Thin wrapper so the projector/main-screen entry point has a single,
 * obvious component to mount — kept separate from Leaderboard.tsx itself
 * in case the projector view later needs its own chrome (fullscreen toggle,
 * QR code, etc.) without touching the reusable Leaderboard component.
 *
 * `variant="wall"` is the fixed-size board the museum mounts on the Final
 * Room's big screen; the default fills the viewport. */
export default function LeaderboardScreen({ variant = 'page' }: { variant?: LeaderboardVariant }) {
  return <Leaderboard variant={variant} />
}
