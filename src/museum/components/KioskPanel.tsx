import { useEffect, useState } from 'react'
import { useKioskStore } from '../state/useKioskStore'
import { useArtifactStore } from '../state/useArtifactStore'
import { useFinalGameStore } from '../final-room/useFinalGameStore'
import { useVideoStore } from '../state/useVideoStore'
import { nearestInteraction, pickNearest } from '../state/interactionArbiter'
import { useIsTouchDevice } from '../input/useIsTouchDevice'
import { KIOSK_SEARCH_PLACEHOLDER, KIOSK_SUBTITLE, KIOSK_TABS, KIOSK_TITLE } from '../data/kioskContent'
import '../styles/kioskPanel.css'

/** The kiosk's screen: a frame for looking up sources, the source ledger and answers. Its content
 * is placeholder text for now (data/kioskContent.ts); it never plays video. */
function KioskScreen({ onClose }: { onClose: () => void }) {
  const [tabId, setTabId] = useState(KIOSK_TABS[0].id)
  const tab = KIOSK_TABS.find((candidate) => candidate.id === tabId) ?? KIOSK_TABS[0]

  return (
    <div
      className="kiosk-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={KIOSK_TITLE}
      // Clicks here must not reach the document-level click handler PointerLockControls uses to re-lock the pointer.
      onClick={(event) => {
        event.stopPropagation()
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="kiosk-panel">
        <button type="button" className="kiosk-panel__close" onClick={onClose} aria-label="Đóng kiosk tra cứu">
          ✕
        </button>

        <header className="kiosk-panel__header">
          <p className="kiosk-panel__eyebrow">Phòng III</p>
          <h2 className="kiosk-panel__title">{KIOSK_TITLE}</h2>
          <p className="kiosk-panel__subtitle">{KIOSK_SUBTITLE}</p>
        </header>

        <div className="kiosk-panel__tabs" role="tablist">
          {KIOSK_TABS.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              role="tab"
              aria-selected={candidate.id === tab.id}
              className={`kiosk-panel__tab${candidate.id === tab.id ? ' kiosk-panel__tab--active' : ''}`}
              onClick={() => setTabId(candidate.id)}
            >
              {candidate.label}
            </button>
          ))}
        </div>

        <div className="kiosk-panel__body" role="tabpanel">
          <input className="kiosk-panel__search" type="search" placeholder={KIOSK_SEARCH_PLACEHOLDER} disabled aria-label="Tìm kiếm" />
          <h3 className="kiosk-panel__heading">{tab.heading}</h3>
          <div className="kiosk-panel__empty">{tab.placeholder}</div>
        </div>
      </div>
    </div>
  )
}

/**
 * The DOM side of the Room 3 reference kiosk: the "[E] Tra cứu tư liệu" prompt near it and the
 * lookup screen opened by E (or the touch [TƯƠNG TÁC] button). Same pattern as the video player:
 * movement is frozen while it is open, Esc / ✕ closes it, and it only takes the E press when the
 * kiosk is the nearest thing to interact with (see state/interactionArbiter.ts).
 */
export default function KioskPanel() {
  const touch = useIsTouchDevice()
  const nearby = useKioskStore((state) => state.nearby)
  const open = useKioskStore((state) => state.open)
  const openKiosk = useKioskStore((state) => state.openKiosk)
  const close = useKioskStore((state) => state.close)
  const artifactNearby = useArtifactStore((state) => state.nearby)
  const videoNearby = useVideoStore((state) => state.nearby)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (useKioskStore.getState().open) {
        if (event.code === 'Escape') close()
        // While the screen is open E must not open anything behind it.
        if (event.code === 'KeyE') event.stopImmediatePropagation()
        return
      }
      if (event.code !== 'KeyE' || useFinalGameStore.getState().open) return
      if (nearestInteraction() !== 'kiosk') return
      event.stopImmediatePropagation()
      openKiosk()
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [openKiosk, close])

  // Keep the pointer free while the screen is open so its buttons work.
  useEffect(() => {
    if (!open) return
    if (document.pointerLockElement) document.exitPointerLock()
    function handleLockChange() {
      if (document.pointerLockElement) document.exitPointerLock()
    }
    document.addEventListener('pointerlockchange', handleLockChange)
    return () => document.removeEventListener('pointerlockchange', handleLockChange)
  }, [open])

  const showPrompt = !touch && !open && pickNearest(artifactNearby, videoNearby, nearby) === 'kiosk'

  return (
    <>
      {showPrompt && (
        <div className={`kiosk-prompt${artifactNearby ? ' kiosk-prompt--stacked' : ''}`}>
          <kbd>E</kbd>
          Tra cứu tư liệu
        </div>
      )}
      {open && <KioskScreen onClose={close} />}
    </>
  )
}
