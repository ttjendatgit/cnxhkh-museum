import { useRef, useState } from 'react'
import '../styles/finalGame.css'

interface AnswerInputProps {
  /** Called with the typed answer; resolve `true` if it was accepted (the box then clears). */
  onSubmit: (value: string) => Promise<boolean>
  disabled?: boolean
  placeholder?: string
  /** Button text; the game's is "XÁC NHẬN". */
  submitLabel?: string
  /** Called whenever the text changes, so the parent can clear stale feedback. */
  onChange?: () => void
}

/** Phones only: after the keyboard has come up, bring the answer box and its button to the top of
 * the visible area so the keyboard does not cover the button. */
const KEYBOARD_SETTLE_MS = 350

/** The answer box and its confirm button. Enter (the keyboard's "Go") submits too. */
export default function AnswerInput({ onSubmit, disabled = false, placeholder = 'Nhập đáp án…', submitLabel = 'XÁC NHẬN', onChange }: AnswerInputProps) {
  const [value, setValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  async function submit() {
    if (!value.trim() || submitting || disabled) return
    setSubmitting(true)
    try {
      if (await onSubmit(value)) setValue('')
    } finally {
      setSubmitting(false)
    }
  }

  function revealAboveKeyboard() {
    if (!window.matchMedia('(pointer: coarse)').matches) return
    window.setTimeout(() => box.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }), KEYBOARD_SETTLE_MS)
  }

  return (
    <div className="fg-answer" ref={box}>
      <input
        className="fg-input"
        placeholder={placeholder}
        value={value}
        onChange={(event) => {
          setValue(event.target.value)
          onChange?.()
        }}
        onFocus={revealAboveKeyboard}
        onKeyDown={(event) => {
          if (event.key === 'Enter') void submit()
        }}
        disabled={disabled || submitting}
        aria-label="Đáp án"
        // Phone keyboards: a "Go" key instead of a line break, and no autocorrect/capitalising
        // rewriting a typed answer (matching ignores case and accents anyway).
        enterKeyHint="go"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
      />
      <button className="fg-button fg-button--primary" onClick={() => void submit()} disabled={disabled || submitting || !value.trim()}>
        {submitting ? 'ĐANG KIỂM TRA…' : submitLabel}
      </button>
    </div>
  )
}
