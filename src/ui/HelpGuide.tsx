import { useEffect, useState } from 'react'
import { useArtifactStore } from '../museum/state/useArtifactStore'
import { useVideoStore } from '../museum/state/useVideoStore'
import { useKioskStore } from '../museum/state/useKioskStore'
import { useFinalGameStore } from '../museum/final-room/useFinalGameStore'
import { useIsTouchDevice } from '../museum/input/useIsTouchDevice'
import { HELP_NOTE, HELP_SECTIONS, HELP_TITLE } from '../museum/data/helpGuide'
import './helpGuide.css'

/** Whether the keyboard focus is in something you type into (then H / ? are just letters). */
function isTyping(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null
  if (!element) return false
  return element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT' || element.isContentEditable
}

/**
 * The "?" tour guide: a small round button in the corner that opens / closes a panel with the
 * controls for a computer and for a phone. The tab for the device in use opens first. Its wording
 * lives in museum/data/helpGuide.ts and is a frame for now. It is a light popover, not a modal: it
 * never freezes the player, but it frees the mouse pointer while open so it can be clicked.
 */
export default function HelpGuide() {
  const touch = useIsTouchDevice()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'desktop' | 'mobile'>(touch ? 'mobile' : 'desktop')
  const artifactOpen = useArtifactStore((state) => state.activeArtifact !== null)
  const videoOpen = useVideoStore((state) => state.active !== null)
  const kioskOpen = useKioskStore((state) => state.open)
  const gameOpen = useFinalGameStore((state) => state.open)
  const covered = artifactOpen || videoOpen || kioskOpen || gameOpen

  // H or ? toggles it (from the keyboard, when nothing else is on screen); Esc closes it.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey || isTyping(event.target)) return
      if (event.code === 'Escape') {
        setOpen(false)
        return
      }
      if (covered) return
      if (event.code === 'KeyH' || event.key === '?') setOpen((current) => !current)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [covered])

  // The mouse pointer is locked for looking around; free it while the guide is open so it can be clicked.
  useEffect(() => {
    if (!open) return
    if (document.pointerLockElement) document.exitPointerLock()
    function handleLockChange() {
      if (document.pointerLockElement) document.exitPointerLock()
    }
    document.addEventListener('pointerlockchange', handleLockChange)
    return () => document.removeEventListener('pointerlockchange', handleLockChange)
  }, [open])

  if (covered) return null

  const section = HELP_SECTIONS.find((candidate) => candidate.id === tab) ?? HELP_SECTIONS[0]

  return (
    <div
      className="help-guide"
      // Clicks here must not reach the document-level click handler PointerLockControls uses to re-lock the pointer.
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      <button
        type="button"
        className={`help-guide__button${open ? ' help-guide__button--open' : ''}`}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="help-guide-panel"
        aria-label={open ? 'Đóng hướng dẫn' : 'Mở hướng dẫn'}
        title={touch ? 'Hướng dẫn' : 'Hướng dẫn (H)'}
      >
        ?
      </button>

      {open && (
        <div id="help-guide-panel" className="help-guide__panel" role="dialog" aria-label={HELP_TITLE}>
          <h2 className="help-guide__title">{HELP_TITLE}</h2>
          <div className="help-guide__tabs" role="tablist">
            {HELP_SECTIONS.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                role="tab"
                aria-selected={candidate.id === section.id}
                className={`help-guide__tab${candidate.id === section.id ? ' help-guide__tab--active' : ''}`}
                onClick={() => setTab(candidate.id)}
              >
                {candidate.label}
              </button>
            ))}
          </div>
          <ul className="help-guide__list" role="tabpanel">
            {section.items.map((item) => (
              <li key={item.keys} className="help-guide__item">
                <kbd>{item.keys}</kbd>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
          <p className="help-guide__note">{HELP_NOTE}</p>
        </div>
      )}
    </div>
  )
}
