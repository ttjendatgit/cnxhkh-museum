import type { GameStateRecord, TeamRecord } from '../types'
import { useGameClock } from '../hooks/useLeaderboardMotion'
import { QUESTIONS } from './questions'
import '../styles/finalGame.css'

function formatClock(ms: number | null): string {
  const totalSeconds = Math.floor((ms ?? 0) / 1000)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${pad(Math.floor(totalSeconds / 60))}:${pad(totalSeconds % 60)}`
}

/** The team's own numbers, always on screen: game time, score and solved questions.
 * The time counts from the admin's start minus paused time (derived from the shared game
 * state, so a reload does not reset it) and stands still while the game is paused. */
export default function PlayerStatusBar({ team, gameState }: { team: TeamRecord; gameState: GameStateRecord }) {
  const clock = useGameClock(gameState)

  return (
    <div className="fg-status">
      <div className="fg-status__stats">
        <span className="fg-status__stat" aria-label={`Thời gian ${formatClock(clock)}`}>
          ⏱ <span className="fg-status__label">Thời gian: </span>
          {formatClock(clock)}
        </span>
        <span className="fg-status__stat" aria-label={`Điểm ${team.score}`}>
          ⭐ <span className="fg-status__label">Điểm: </span>
          {team.score}
        </span>
        <span className="fg-status__stat" aria-label={`Câu đã giải ${team.solvedQuestions.length} trên ${QUESTIONS.length}`}>
          🧩 <span className="fg-status__label">Câu đã giải: </span>
          {team.solvedQuestions.length}/{QUESTIONS.length}
        </span>
      </div>
      {gameState.status === 'paused' && <p className="fg-status__paused">Tạm dừng - thời gian được bảo lưu</p>}
    </div>
  )
}
