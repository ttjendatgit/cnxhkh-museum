import type { CSSProperties } from 'react'
import type { Question, TeamRecord } from '../types'
import { FINAL_KEYWORD, QUESTIONS } from './questions'
import '../styles/finalGame.css'

// ── Layout ───────────────────────────────────────────────────────────────
// A traditional crossword: one numbered horizontal row per question, each with as
// many cells as its answer has letters, all rows crossing a single vertical
// keyword column inside the grid. Row i crosses the column at the answer's letter
// equal to keyword letter i, so the column, read top to bottom, spells
// FINAL_KEYWORD. (questions.ts checks at load time that every answer has its letter.)
// If a curated answer ever lacks its letter it cannot cross: its row then ends one
// blank column short of the keyword column, which gets an extra cell for that letter.

interface RowLayout {
  question: Question
  /** The answer's letter/digit cells, uppercase, spaces and punctuation dropped. */
  cells: string[]
  /** Index in `cells` of the letter shared with the keyword column, or null if the answer lacks it. */
  keyIndex: number | null
  /** Empty grid columns before the row's first cell. */
  offset: number
}

function toCells(answer: string): string[] {
  return Array.from(answer.normalize('NFC').toLocaleUpperCase('vi-VN')).filter((char) => /[\p{L}\p{N}]/u.test(char))
}

/** Every position in the answer holding the reward letter (exact match, diacritics included). */
function findKeyCandidates(cells: string[], reward: string): number[] {
  const target = reward.normalize('NFC').toLocaleUpperCase('vi-VN')
  return cells.flatMap((cell, index) => (cell === target ? [index] : []))
}

/**
 * Places every row against one shared keyword column. An answer may hold its reward letter
 * more than once; which occurrence to cross at is chosen so the whole grid is as narrow as it
 * can be: for each possible column position, every row takes its furthest-right letter that
 * still fits left of it (that keeps its tail short), and the position giving the fewest
 * columns wins. A row without the letter cannot cross, so it needs one extra blank column and
 * gets its own cell in the keyword column.
 */
function buildLayout() {
  const partial = QUESTIONS.map((question) => {
    const cells = toCells(question.answer)
    return { question, cells, candidates: findKeyCandidates(cells, question.rewardLetter) }
  })
  // Cells needed left of the keyword column if this row crosses at `index` (null: cannot cross).
  const leftOf = (row: { cells: string[] }, index: number | null) => index ?? row.cells.length + 1
  const rightOf = (row: { cells: string[] }, index: number | null) => (index === null ? 0 : row.cells.length - 1 - index)
  const widest = Math.max(...partial.map((row) => row.cells.length)) + 1

  let best: { keyColumn: number; columns: number; picks: (number | null)[] } | null = null
  for (let keyColumn = 0; keyColumn <= widest; keyColumn++) {
    const picks: (number | null)[] = []
    let maxRight = 0
    for (const row of partial) {
      const options = (row.candidates.length > 0 ? row.candidates : [null]).filter((index) => leftOf(row, index) <= keyColumn)
      if (options.length === 0) break
      const pick = options.reduce((left, right) => (leftOf(row, right) > leftOf(row, left) ? right : left))
      picks.push(pick)
      maxRight = Math.max(maxRight, rightOf(row, pick))
    }
    if (picks.length < partial.length) continue
    const columns = keyColumn + 1 + maxRight
    if (!best || columns < best.columns) best = { keyColumn, columns, picks }
  }
  if (!best) throw new Error('[final-game] Could not lay out the crossword')

  const chosen = best
  const rows: RowLayout[] = partial.map((row, index) => {
    const keyIndex = chosen.picks[index]
    return { question: row.question, cells: row.cells, keyIndex, offset: chosen.keyColumn - leftOf(row, keyIndex) }
  })
  return { rows, columns: chosen.columns, keyColumn: chosen.keyColumn }
}

const LAYOUT = buildLayout()

// A little extra space before the first row of each word of the keyword (NHÂN / DÂN / LÀM / CHỦ).
const WORD_LENGTHS = FINAL_KEYWORD.split(' ').map((word) => word.length)
const WORD_STARTS = new Set(WORD_LENGTHS.map((_, index) => WORD_LENGTHS.slice(0, index).reduce((sum, length) => sum + length, 0)))

interface CrosswordBoardProps {
  team: TeamRecord
  /** The question shown in the clue panel (null when none). */
  activeId: number | null
  /** Called with a question id when its row is clicked. */
  onSelect: (id: number) => void
}

/** The crossword grid: 13 numbered horizontal answer rows crossing the vertical
 * keyword column. A correct answer fills its row, its crossing letter appears in
 * the column (gold, glowing), and once all rows are filled the column reads the keyword.
 * Clicking a row (or its number) chooses that question — they can be answered in any order. */
export default function CrosswordBoard({ team, activeId, onSelect }: CrosswordBoardProps) {
  const gridStyle = { gridTemplateColumns: `repeat(${LAYOUT.columns}, var(--cw-cell))` } as CSSProperties

  return (
    <div className="fg-panel fg-cw">
      <div className="fg-cw__rows" role="table" aria-label="Ô chữ">
        {LAYOUT.rows.map((row, rowIndex) => {
          const solved = team.solvedQuestions.includes(row.question.id)
          const classes = ['fg-cw__row']
          if (WORD_STARTS.has(rowIndex) && rowIndex > 0) classes.push('fg-cw__row--word-gap')
          if (row.question.id === activeId) classes.push('fg-cw__row--current')
          if (solved) classes.push('fg-cw__row--solved')

          const cellClass = (isKey: boolean) => `fg-cw__cell${isKey ? ' fg-cw__cell--key' : ''}${solved ? ' fg-cw__cell--filled' : ''}`

          return (
            <div key={row.question.id} className={classes.join(' ')} role="row" onClick={() => onSelect(row.question.id)}>
              <button type="button" className="fg-cw__num" aria-label={`Câu ${row.question.id}${solved ? ', đã giải' : ''}`} aria-current={row.question.id === activeId}>
                {String(row.question.id).padStart(2, '0')}
              </button>
              <div className="fg-cw__cells" style={gridStyle}>
                {row.cells.map((cell, index) => {
                  const isKey = index === row.keyIndex
                  return (
                    <div key={index} className={cellClass(isKey)} style={{ gridColumn: row.offset + index + 1 }}>
                      {solved ? (isKey ? row.question.rewardLetter : cell) : ''}
                    </div>
                  )
                })}
                {row.keyIndex === null && (
                  <div className={cellClass(true)} style={{ gridColumn: LAYOUT.keyColumn + 1 }}>
                    {solved ? row.question.rewardLetter : ''}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
