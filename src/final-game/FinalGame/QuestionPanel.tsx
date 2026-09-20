import { useEffect, useRef, useState } from 'react'
import type { GameStateRecord, Question, ResolveArtifact, TeamRecord } from '../types'
import { GAME_STATUS_MESSAGES } from '../data/statusMessages'
import { submitAnswer, submitKeyword } from '../services/gameService'
import { nextUnsolvedId } from '../services/questionProgress'
import { DEFAULT_SCORING } from '../services/scoring'
import { QUESTIONS } from './questions'
import AnswerInput from './AnswerInput'
import '../styles/finalGame.css'

interface QuestionPanelProps {
  team: TeamRecord
  gameState: GameStateRecord
  /** The question being shown, or null once every question is solved (the keyword step). */
  activeId: number | null
  /** Shows another question (null: none). Called when the player picks one and after a correct answer. */
  onSelect: (id: number | null) => void
  /** Turns a question's related artifact into a hint (this module never reads museum data). */
  resolveArtifact?: ResolveArtifact
}

/** The temporary message shown under an answer box after a submit. It lives in
 * QuestionPanel (which stays mounted) so it survives the team record updating. */
interface AnswerFeedback {
  type: 'success' | 'error' | null
  message: string
}

const NO_FEEDBACK: AnswerFeedback = { type: null, message: '' }

/** How long the "correct" message stays before the next question appears. */
const NEXT_QUESTION_DELAY_MS = 1400

const KEYWORD_FOUND_MESSAGE = 'Đã tìm ra từ khóa.\nHãy hoàn thành toàn bộ câu hỏi để chiến thắng.'
const SOLVED_MESSAGE = 'Câu hỏi này đã được giải ✓'

const pad = (value: number) => String(value).padStart(2, '0')

function FeedbackLine({ feedback }: { feedback: AnswerFeedback }) {
  if (!feedback.type) return null
  return (
    <p className={`fg-feedback ${feedback.type === 'success' ? 'fg-feedback--correct' : 'fg-feedback--wrong'}`} role="status">
      {feedback.message}
    </p>
  )
}

interface ClueStepProps {
  team: TeamRecord
  gameState: GameStateRecord
  question: Question
  index: number
  locked: boolean
  resolveArtifact?: ResolveArtifact
  /** Keeps this question on screen: called when an answer is submitted, before the team record changes. */
  onPin: () => void
  /** Moves on to the next unsolved question, once the "correct" message has been read. */
  onAdvance: () => void
}

/** One horizontal clue: "CÂU 01/13", its text, an artifact hint and the answer box.
 *
 * It is keyed by question id, so picking another question starts it afresh (no stale message,
 * and a pending "move on" timer is cancelled). After a correct answer it keeps showing the
 * question with "Chính xác! +10 điểm" for a moment — the team record (score, solved list,
 * crossword row) is already updated, only the swap to the next question is held back. */
function ClueStep({ team, gameState, question, index, locked, resolveArtifact, onPin, onAdvance }: ClueStepProps) {
  const [feedback, setFeedback] = useState<AnswerFeedback>(NO_FEEDBACK)
  const [advancing, setAdvancing] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const hint = question.relatedArtifactId && resolveArtifact ? resolveArtifact(question.relatedArtifactId) : null
  const solved = team.solvedQuestions.includes(question.id)
  const shown: AnswerFeedback = feedback.type ? feedback : solved ? { type: 'success', message: SOLVED_MESSAGE } : NO_FEEDBACK

  async function handleSubmit(answer: string) {
    onPin()
    // submitAnswer checks the answer first and writes to Firebase (score, solved questions,
    // revealed letter) only when it is correct; a wrong answer writes nothing.
    const correct = await submitAnswer(team, question.id, answer, gameState)
    if (correct) {
      setFeedback({ type: 'success', message: `Chính xác! +${DEFAULT_SCORING.pointsPerQuestion} điểm` })
      setAdvancing(true)
      timer.current = window.setTimeout(onAdvance, NEXT_QUESTION_DELAY_MS)
    } else {
      setFeedback({ type: 'error', message: 'Chưa chính xác. Hãy thử lại!' })
    }
    return correct
  }

  return (
    <>
      <p className="fg-question-number">
        CÂU {pad(index + 1)}/{QUESTIONS.length}
      </p>
      {question.image && <img className="fg-question-image" src={question.image} alt="" onError={(event) => (event.currentTarget.style.display = 'none')} />}
      <p className="fg-question">{question.question}</p>
      {hint && (
        <p className="fg-hint">
          Gợi ý: tìm hiểu hiện vật “{hint.title}”{hint.location ? ` — ${hint.location}` : ''}.
        </p>
      )}
      <AnswerInput onSubmit={handleSubmit} disabled={locked || solved || advancing} onChange={() => setFeedback(NO_FEEDBACK)} />
      <FeedbackLine feedback={shown} />
    </>
  )
}

/** The final keyword box. It can be tried at any time; a correct keyword is recorded but only
 * finishes the game together with all 13 answers. The keyword itself is never shown. */
function KeywordStep({ team, gameState, locked }: { team: TeamRecord; gameState: GameStateRecord; locked: boolean }) {
  const [feedback, setFeedback] = useState<AnswerFeedback>(NO_FEEDBACK)

  async function handleSubmit(attempt: string) {
    const { correct, finished } = await submitKeyword(team, attempt, gameState)
    if (!correct) setFeedback({ type: 'error', message: 'Từ khóa chưa chính xác. Hãy thử lại!' })
    else if (!finished) setFeedback({ type: 'success', message: KEYWORD_FOUND_MESSAGE })
    return correct
  }

  // A keyword found earlier stays acknowledged (also after a reload) until the questions are done.
  const shown: AnswerFeedback = feedback.type ? feedback : team.keywordCorrect && !team.finished ? { type: 'success', message: KEYWORD_FOUND_MESSAGE } : NO_FEEDBACK

  return (
    <div className="fg-keyword">
      <div className="fg-divider" />
      <p className="fg-label">Từ khóa</p>
      <AnswerInput
        onSubmit={handleSubmit}
        disabled={locked || team.keywordCorrect}
        placeholder="Nhập từ khóa…"
        submitLabel="XÁC NHẬN TỪ KHÓA"
        onChange={() => setFeedback(NO_FEEDBACK)}
      />
      <FeedbackLine feedback={shown} />
    </div>
  )
}

/** The player's question panel: the chosen clue with its answer box, and the keyword box.
 * Questions can be answered in any order (the crossword and the question list choose which one
 * is shown). Locks whenever the game isn't actively playing (waiting, paused, finished). */
export default function QuestionPanel({ team, gameState, activeId, onSelect, resolveArtifact }: QuestionPanelProps) {
  // The timer that moves on after a correct answer fires later than the render that scheduled it.
  const latestSolved = useRef(team.solvedQuestions)
  useEffect(() => {
    latestSolved.current = team.solvedQuestions
  })

  const index = QUESTIONS.findIndex((question) => question.id === activeId)
  const gameLocked = gameState.status !== 'playing' || team.finished

  function advanceFrom(answeredId: number) {
    // The answered question counts as solved even if its update has not come back yet.
    onSelect(nextUnsolvedId(QUESTIONS.map((question) => question.id), [...latestSolved.current, answeredId], answeredId))
  }

  return (
    <div className="fg-panel fg-clue">
      {index === -1 ? (
        <>
          <p className="fg-question-number">HOÀN THÀNH CÁC HÀNG NGANG</p>
          <p className="fg-question">Cả {QUESTIONS.length} hàng ngang đã được điền. Hãy đọc cột dọc trên ô chữ để tìm từ khóa.</p>
        </>
      ) : (
        <ClueStep
          key={QUESTIONS[index].id}
          team={team}
          gameState={gameState}
          question={QUESTIONS[index]}
          index={index}
          locked={gameLocked}
          resolveArtifact={resolveArtifact}
          onPin={() => onSelect(QUESTIONS[index].id)}
          onAdvance={() => advanceFrom(QUESTIONS[index].id)}
        />
      )}
      <KeywordStep team={team} gameState={gameState} locked={gameLocked} />
      {gameState.status !== 'playing' && <p className="fg-feedback fg-feedback--wrong">{GAME_STATUS_MESSAGES[gameState.status]}</p>}
      <div className="fg-progress-bar">
        <div className="fg-progress-bar__fill" style={{ width: `${(team.solvedQuestions.length / QUESTIONS.length) * 100}%` }} />
      </div>
    </div>
  )
}
