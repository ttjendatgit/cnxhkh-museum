import { lazy, Suspense, useEffect } from 'react'
import { useFinalGameStore } from './useFinalGameStore'
import { useIsTouchDevice } from '../input/useIsTouchDevice'
import './finalRoomOverlay.css'

// The game (and the Firebase SDK behind it) is fetched the first time someone opens it.
const FinalGameScreens = lazy(() => import('./FinalGameScreens'))

const PROMPT = 'Nhấn E để bắt đầu thử thách'

/**
 * DOM side of the Final Room game station: shows the proximity prompt,
 * opens the game on E, closes on Esc, and hosts the player screen — plus an
 * operator switch that opens the admin console (start / pause / end / reset).
 *
 * While open, PlayerController freezes movement (it reads the same store),
 * so typing answers never walks the camera around.
 */
export default function FinalGameOverlay() {
  const touch = useIsTouchDevice()
  const nearby = useFinalGameStore((state) => state.nearby)
  const open = useFinalGameStore((state) => state.open)
  const view = useFinalGameStore((state) => state.view)
  const openStation = useFinalGameStore((state) => state.openStation)
  const close = useFinalGameStore((state) => state.close)
  const setView = useFinalGameStore((state) => state.setView)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (open) {
        if (event.code === 'Escape') close()
        return
      }
      if (event.code === 'KeyE' && nearby) openStation()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, nearby, openStation, close])

  // Keep the pointer free while the game is open so the cursor works for
  // typing and clicking; anything that re-locks it (PointerLockControls locks
  // on document clicks) is undone immediately.
  useEffect(() => {
    if (!open) return

    if (document.pointerLockElement) document.exitPointerLock()

    function handleLockChange() {
      if (document.pointerLockElement) document.exitPointerLock()
    }

    document.addEventListener('pointerlockchange', handleLockChange)
    return () => document.removeEventListener('pointerlockchange', handleLockChange)
  }, [open])

  return (
    <>
      {/* On a phone the [TƯƠNG TÁC] button (ui/TouchControls) replaces this "press E" prompt. */}
      {!touch && nearby && !open && (
        <div className="final-room-prompt">
          <kbd>E</kbd>
          {PROMPT}
        </div>
      )}

      {open && (
        <div
          className="final-room-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Thử thách Phòng Kết"
          // Clicks here must not reach the document-level click handler PointerLockControls uses to re-lock the pointer.
          onClick={(event) => event.stopPropagation()}
        >
          <div className="final-room-overlay__bar">
            <button type="button" className="final-room-overlay__button" onClick={() => setView(view === 'admin' ? 'player' : 'admin')}>
              {view === 'admin' ? '← Về thử thách' : 'Điều hành'}
            </button>
            <button type="button" className="final-room-overlay__button" onClick={close} aria-label="Đóng thử thách (Esc)">
              ✕ Thoát
            </button>
          </div>

          <Suspense fallback={<p className="final-room-overlay__loading">Đang tải thử thách…</p>}>
            <FinalGameScreens view={view} />
          </Suspense>
        </div>
      )}
    </>
  )
}
