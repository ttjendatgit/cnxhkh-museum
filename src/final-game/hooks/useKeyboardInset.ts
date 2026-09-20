import { useEffect } from 'react'

/**
 * Publishes the on-screen keyboard's height as the CSS variable `--fg-kb-inset` (on <html>).
 * A phone's keyboard covers the bottom of the page without resizing it, so the page has no
 * scroll room to lift the answer box above it; the game's padding-bottom uses this variable to
 * add that room while the keyboard is up. It is 0 whenever there is no keyboard (and on desktop),
 * and while the player has pinch-zoomed (a zoomed viewport is smaller, but nothing covers it).
 */
export function useKeyboardInset(): void {
  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return
    const root = document.documentElement

    function update() {
      const covered = viewport && viewport.scale <= 1.01 ? window.innerHeight - viewport.height - viewport.offsetTop : 0
      root.style.setProperty('--fg-kb-inset', `${Math.max(0, Math.round(covered))}px`)
    }

    update()
    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)
    return () => {
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
      root.style.removeProperty('--fg-kb-inset')
    }
  }, [])
}
