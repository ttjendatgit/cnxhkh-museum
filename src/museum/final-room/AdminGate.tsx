import { useState, type FormEvent, type ReactNode } from 'react'
import { isUsingMockBackend } from '../../final-game'
import '../../final-game/styles/finalGame.css'

const SESSION_KEY = 'final-game:admin-unlocked'

// Set VITE_FINAL_GAME_ADMIN_PIN in .env.local to protect the operator console.
// NOTE: this is a client-side gate for keeping curious players out of the
// controls, not real security — the value ships in the bundle. Actually
// protecting Start/End/Reset needs Firebase Auth + database rules.
const ADMIN_PIN = (import.meta.env.VITE_FINAL_GAME_ADMIN_PIN as string | undefined)?.trim()

function readUnlocked(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

/** Guards the operator console (start / pause / end / reset all teams).
 *
 *  - PIN configured   → asks for it once per browser session.
 *  - No PIN, mock backend (local dev) → open, so the flow is testable at once.
 *  - No PIN, real Firebase → stays locked: with live data, an unprotected
 *    reset button in every player's browser would be a footgun. */
export default function AdminGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(readUnlocked)
  const [pin, setPin] = useState('')
  const [wrong, setWrong] = useState(false)

  const openWithoutPin = !ADMIN_PIN && isUsingMockBackend()
  if (unlocked || openWithoutPin) return <>{children}</>

  if (!ADMIN_PIN) {
    return (
      <div className="final-game">
        <p className="final-game__eyebrow">Phòng Kết — Điều hành</p>
        <h1 className="final-game__title">Khu vực điều hành bị khóa</h1>
        <div className="fg-panel">
          <p className="fg-muted">
            Chưa cấu hình mã điều hành. Đặt biến môi trường VITE_FINAL_GAME_ADMIN_PIN rồi build lại để mở bảng điều khiển khi dùng Firebase.
          </p>
        </div>
      </div>
    )
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (pin.trim() === ADMIN_PIN) {
      try {
        sessionStorage.setItem(SESSION_KEY, '1')
      } catch {
        // Session storage unavailable — unlock for this mount only.
      }
      setUnlocked(true)
    } else {
      setWrong(true)
    }
  }

  return (
    <div className="final-game">
      <p className="final-game__eyebrow">Phòng Kết — Điều hành</p>
      <h1 className="final-game__title">Nhập mã điều hành</h1>
      <form className="fg-panel" onSubmit={handleSubmit}>
        <label className="fg-label" htmlFor="admin-pin-input">
          Mã điều hành
        </label>
        <input
          id="admin-pin-input"
          className="fg-input"
          type="password"
          autoComplete="off"
          value={pin}
          onChange={(event) => {
            setPin(event.target.value)
            setWrong(false)
          }}
        />
        {wrong && <p className="fg-feedback fg-feedback--wrong">Mã không đúng.</p>}
        <div className="fg-row" style={{ marginTop: 20 }}>
          <button type="submit" className="fg-button fg-button--primary" disabled={!pin.trim()}>
            Mở khóa
          </button>
        </div>
      </form>
    </div>
  )
}
