import { useEffect, useRef } from 'react'
import { useVideoStore } from '../state/useVideoStore'
import { useArtifactStore } from '../state/useArtifactStore'
import { useKioskStore } from '../state/useKioskStore'
import { nearestInteraction, pickNearest } from '../state/interactionArbiter'
import { useFinalGameStore } from '../final-room/useFinalGameStore'
import { useIsTouchDevice } from '../input/useIsTouchDevice'
import type { MuseumVideo } from '../data/room3Videos'
import '../styles/videoPlayer.css'

/** The large player. Its own <video>, separate from the muted one looping on the wall, so opening
 * and closing it never touches the wall. Mounted fresh each time it opens: it starts from the
 * beginning, with sound. */
function VideoPlayer({ video, onClose }: { video: MuseumVideo; onClose: () => void }) {
  const element = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = element.current
    if (!el) return
    // The source is set here (not as a JSX attribute) so it is also set again if React re-runs this
    // effect after the cleanup below has emptied the element.
    el.src = video.url
    el.currentTime = 0
    el.muted = false
    el.volume = 1
    // Opening was a key press or a tap, so playing with sound is allowed. If a browser still
    // refuses, the native controls are right there.
    void el.play().catch(() => undefined)
    return () => {
      el.pause()
      el.removeAttribute('src')
      el.load()
    }
  }, [video])

  return (
    <div
      className="video-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      // Clicks here must not reach the document-level click handler PointerLockControls uses to re-lock the pointer.
      onClick={(event) => {
        event.stopPropagation()
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <button type="button" className="video-overlay__close" onClick={onClose} aria-label="Đóng video">
        ✕
      </button>
      <div className="video-overlay__stage">
        <p className="video-overlay__title">{video.title}</p>
        {/* object-fit: contain — the whole picture in its own shape, never stretched or cropped. */}
        <video ref={element} className="video-overlay__video" controls autoPlay playsInline preload="auto" />
      </div>
    </div>
  )
}

/**
 * The DOM side of the Room 3 video walls: the "[E] Xem video tư liệu" prompt near a screen, and the
 * large player opened by E (or the touch [TƯƠNG TÁC] button). It follows the artifact panel's
 * pattern: PlayerController freezes movement while it is open, and Esc / ✕ closes it.
 *
 * E is also the artifact key. This listens first (capture phase) and only takes the press when a
 * video screen is the nearest thing; otherwise it does nothing and the artifact panel's own
 * handler sees the key exactly as before.
 */
export default function VideoPlayerOverlay() {
  const touch = useIsTouchDevice()
  const nearby = useVideoStore((state) => state.nearby)
  const active = useVideoStore((state) => state.active)
  const openNearest = useVideoStore((state) => state.openNearest)
  const close = useVideoStore((state) => state.close)
  const artifactNearby = useArtifactStore((state) => state.nearby)
  const kioskNearby = useKioskStore((state) => state.nearby)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (useVideoStore.getState().active) {
        if (event.code === 'Escape') close()
        // While the player is open E must not open an artifact or the game behind it.
        if (event.code === 'KeyE') event.stopImmediatePropagation()
        return
      }
      if (event.code !== 'KeyE' || useFinalGameStore.getState().open) return
      // An artifact frame or the kiosk that is closer than the screen keeps the key.
      if (nearestInteraction() !== 'video') return
      event.stopImmediatePropagation()
      openNearest()
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [openNearest, close])

  // Keep the pointer free while the player is open so its buttons work; anything that re-locks it
  // (PointerLockControls locks on document clicks) is undone immediately.
  useEffect(() => {
    if (!active) return
    if (document.pointerLockElement) document.exitPointerLock()
    function handleLockChange() {
      if (document.pointerLockElement) document.exitPointerLock()
    }
    document.addEventListener('pointerlockchange', handleLockChange)
    return () => document.removeEventListener('pointerlockchange', handleLockChange)
  }, [active])

  // The prompt is for the nearest interaction: not when an artifact frame is closer. On a phone the
  // [TƯƠNG TÁC] button takes its place.
  const showPrompt = !touch && !active && pickNearest(artifactNearby, nearby, kioskNearby) === 'video'
  // In the narrow band where an artifact prompt is on screen too, sit above it instead of on top of it.
  const stacked = showPrompt && artifactNearby !== null

  return (
    <>
      {showPrompt && (
        <div className={`video-prompt${stacked ? ' video-prompt--stacked' : ''}`}>
          <kbd>E</kbd>
          Xem video tư liệu
        </div>
      )}
      {active && <VideoPlayer key={active.id} video={active} onClose={close} />}
    </>
  )
}
