import { useSyncExternalStore } from 'react'

// The primary pointer is a finger. A laptop with a touch screen keeps a mouse/trackpad as its
// primary pointer, so it stays on the desktop controls (WASD, mouse, E).
const COARSE_POINTER = '(pointer: coarse)'

/** `?controls=touch` / `?controls=desktop` overrides the detection (testing on a desktop browser). */
function forcedMode(): 'touch' | 'desktop' | null {
  const value = new URLSearchParams(window.location.search).get('controls')
  return value === 'touch' || value === 'desktop' ? value : null
}

export function isTouchDevice(): boolean {
  const forced = forcedMode()
  if (forced) return forced === 'touch'
  return window.matchMedia?.(COARSE_POINTER).matches ?? false
}

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia?.(COARSE_POINTER)
  query?.addEventListener('change', onChange)
  return () => query?.removeEventListener('change', onChange)
}

/** Whether to show the touch controls instead of the desktop ones. */
export function useIsTouchDevice(): boolean {
  return useSyncExternalStore(subscribe, isTouchDevice, () => false)
}
