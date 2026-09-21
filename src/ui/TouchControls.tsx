import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { useArtifactStore } from '../museum/state/useArtifactStore'
import { useFinalGameStore } from '../museum/final-room/useFinalGameStore'
import { useVideoStore } from '../museum/state/useVideoStore'
import { useKioskStore } from '../museum/state/useKioskStore'
import { nearestInteraction } from '../museum/state/interactionArbiter'
import { touchInput, resetTouchInput } from '../museum/input/touchInput'
import { useIsTouchDevice } from '../museum/input/useIsTouchDevice'
import './touchControls.css'

/** How far (CSS px) the joystick knob can leave the centre of its base. */
const KNOB_TRAVEL = 52
/** Fraction of that travel a finger must move before the player starts walking. */
const DEAD_ZONE = 0.18

/** What the E key does on desktop: open the Final Room game at its station, else whichever is
 * nearest of an artifact, a Room 3 video screen and the Room 3 kiosk. */
function interact(): void {
  const station = useFinalGameStore.getState()
  if (station.nearby && !station.open) {
    station.openStation()
    return
  }
  const target = nearestInteraction()
  if (target === 'video') useVideoStore.getState().openNearest()
  else if (target === 'kiosk') useKioskStore.getState().openKiosk()
  else if (target === 'artifact') useArtifactStore.getState().openNearest()
}

/** Fixed virtual joystick. It only sets the walking direction (touchInput.move*); it never turns the camera. */
function Joystick() {
  const knob = useRef<HTMLDivElement>(null)
  const pointer = useRef<{ id: number; cx: number; cy: number } | null>(null)

  function update(event: ReactPointerEvent, cx: number, cy: number) {
    let dx = event.clientX - cx
    let dy = event.clientY - cy
    const length = Math.hypot(dx, dy)
    if (length > KNOB_TRAVEL) {
      dx = (dx / length) * KNOB_TRAVEL
      dy = (dy / length) * KNOB_TRAVEL
    }
    if (knob.current) knob.current.style.transform = `translate(${dx}px, ${dy}px)`
    const active = Math.hypot(dx, dy) / KNOB_TRAVEL > DEAD_ZONE
    touchInput.moveX = active ? dx / KNOB_TRAVEL : 0
    touchInput.moveY = active ? -dy / KNOB_TRAVEL : 0
  }

  function release() {
    pointer.current = null
    touchInput.moveX = 0
    touchInput.moveY = 0
    if (knob.current) knob.current.style.transform = ''
  }

  return (
    <div
      className="touch-joystick"
      role="presentation"
      onPointerDown={(event) => {
        if (pointer.current) return
        const rect = event.currentTarget.getBoundingClientRect()
        pointer.current = { id: event.pointerId, cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 }
        event.currentTarget.setPointerCapture(event.pointerId)
        update(event, pointer.current.cx, pointer.current.cy)
      }}
      onPointerMove={(event) => {
        if (pointer.current?.id === event.pointerId) update(event, pointer.current.cx, pointer.current.cy)
      }}
      onPointerUp={(event) => {
        if (pointer.current?.id === event.pointerId) release()
      }}
      onPointerCancel={(event) => {
        if (pointer.current?.id === event.pointerId) release()
      }}
      // The finger leaving for good (capture lost) must never leave the player walking.
      onLostPointerCapture={(event) => {
        if (pointer.current?.id === event.pointerId) release()
      }}
    >
      <div className="touch-joystick__base" aria-hidden="true">
        <div className="touch-joystick__knob" ref={knob} />
      </div>
    </div>
  )
}

/** The rest of the screen: dragging a finger here turns the camera. It is a separate touch
 * from the joystick's, so both can be used at once. */
function LookZone() {
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null)

  return (
    <div
      className="touch-look"
      role="presentation"
      onPointerDown={(event) => {
        if (pointer.current) return
        pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        const current = pointer.current
        if (!current || current.id !== event.pointerId) return
        touchInput.lookX += event.clientX - current.x
        touchInput.lookY += event.clientY - current.y
        current.x = event.clientX
        current.y = event.clientY
      }}
      onPointerUp={(event) => {
        if (pointer.current?.id === event.pointerId) pointer.current = null
      }}
      onPointerCancel={(event) => {
        if (pointer.current?.id === event.pointerId) pointer.current = null
      }}
    />
  )
}

/**
 * Touch controls for the 3D museum, shown on phones and tablets only (desktop keeps WASD,
 * mouse and E): a joystick bottom-left for walking, a look zone for swiping the camera, and a
 * [TƯƠNG TÁC] button that does what E does. Everything is hidden while an artifact panel or the
 * Final Room game is open, so touching those never moves or turns the player.
 */
export default function TouchControls() {
  const touch = useIsTouchDevice()
  // Every hook is called on every render (no `||` between them, which would skip the second one).
  const artifactOpen = useArtifactStore((state) => state.activeArtifact !== null)
  const gameOpen = useFinalGameStore((state) => state.open)
  const videoOpen = useVideoStore((state) => state.active !== null)
  const kioskOpen = useKioskStore((state) => state.open)
  const kioskNearby = useKioskStore((state) => state.nearby !== null)
  const artifactNearby = useArtifactStore((state) => state.nearby !== null)
  const stationNearby = useFinalGameStore((state) => state.nearby)
  const videoNearby = useVideoStore((state) => state.nearby !== null)
  const canInteract = artifactNearby || stationNearby || videoNearby || kioskNearby
  const visible = touch && !artifactOpen && !gameOpen && !videoOpen && !kioskOpen

  // Whenever the controls go away, or the page is hidden, nothing may keep walking or turning.
  useEffect(() => {
    if (!visible) resetTouchInput()
    const stop = () => resetTouchInput()
    document.addEventListener('visibilitychange', stop)
    window.addEventListener('blur', stop)
    return () => {
      document.removeEventListener('visibilitychange', stop)
      window.removeEventListener('blur', stop)
    }
  }, [visible])

  if (!visible) return null

  return (
    <div className="touch-controls" onContextMenu={(event) => event.preventDefault()}>
      <LookZone />
      <Joystick />
      {canInteract && (
        <button type="button" className="touch-interact" onClick={interact}>
          Tương tác
        </button>
      )}
    </div>
  )
}
