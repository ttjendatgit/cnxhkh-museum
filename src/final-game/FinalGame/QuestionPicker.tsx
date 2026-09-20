import type { TeamRecord } from '../types'
import { QUESTIONS } from './questions'
import '../styles/finalGame.css'

interface QuestionPickerProps {
  team: TeamRecord
  /** The question shown in the clue panel (null when none). */
  activeId: number | null
  onSelect: (id: number) => void
}

/** All 13 questions as touch-sized buttons: solved ones carry ✓, the chosen one ▶.
 * Shown under the crossword on narrow screens, where its row numbers are tiny;
 * a wide screen picks straight from the crossword instead. */
export default function QuestionPicker({ team, activeId, onSelect }: QuestionPickerProps) {
  return (
    <nav className="fg-panel fg-picker" aria-label="Danh sách câu hỏi">
      <p className="fg-label">Chọn câu hỏi</p>
      <ul className="fg-picker__list">
        {QUESTIONS.map((question) => {
          const solved = team.solvedQuestions.includes(question.id)
          const active = question.id === activeId
          const classes = ['fg-picker__item']
          if (solved) classes.push('fg-picker__item--solved')
          if (active) classes.push('fg-picker__item--active')
          return (
            <li key={question.id}>
              <button
                type="button"
                className={classes.join(' ')}
                onClick={() => onSelect(question.id)}
                aria-current={active}
                aria-label={`Câu ${question.id}${solved ? ', đã giải' : ''}${active ? ', đang chọn' : ''}`}
              >
                <span>{String(question.id).padStart(2, '0')}</span>
                {solved ? <span aria-hidden="true">✓</span> : active ? <span aria-hidden="true">▶</span> : null}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
