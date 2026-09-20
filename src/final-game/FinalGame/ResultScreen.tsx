import type { TeamRecord } from '../types'
import { useGameState } from '../hooks/useGameState'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { QUESTIONS } from './questions'
import '../styles/finalGame.css'

function formatDuration(ms: number | null): string {
  if (ms === null) return '—'
  const seconds = Math.floor(ms / 1000)
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
}

/** The finish screen. A team that won (all 13 questions and the keyword) is congratulated;
 * a team the game ended on sees a plain "game over" with its progress. The keyword itself
 * is never shown. */
export default function ResultScreen({ team }: { team: TeamRecord }) {
  const entries = useLeaderboard()
  // Until the admin ends the game, other teams are still playing: this rank can still change.
  const gameOver = useGameState().status === 'finished'
  const entry = entries.find((candidate) => candidate.teamId === team.teamId)

  return (
    <div className="final-game">
      <div className="fg-panel fg-finish">
        {team.finished ? (
          <>
            <p className="fg-finish__congrats">CHÚC MỪNG</p>
            <p className="fg-finish__team">ĐỘI {team.teamName.toLocaleUpperCase('vi-VN')}</p>
            <div className="fg-divider" />
            <p className="fg-muted" style={{ textAlign: 'center' }}>
              Đội đã hoàn thành toàn bộ câu hỏi và tìm ra từ khóa.
            </p>
            {!gameOver && (
              <p className="fg-muted" style={{ textAlign: 'center' }}>
                Các đội khác vẫn đang chơi. Kết quả cuối cùng sẽ được công bố khi điều hành viên kết thúc trò chơi.
              </p>
            )}
          </>
        ) : (
          <>
            <p className="fg-finish__congrats">TRÒ CHƠI KẾT THÚC</p>
            <p className="fg-finish__team">ĐỘI {team.teamName.toLocaleUpperCase('vi-VN')}</p>
            <p className="fg-muted" style={{ textAlign: 'center' }}>
              Đội chưa hoàn thành toàn bộ câu hỏi và từ khóa khi trò chơi kết thúc.
            </p>
          </>
        )}

        <div className="fg-divider" />
        <div className="fg-result">
          <div>
            <span className="fg-result__value">{entry ? `${entry.rank} / ${entries.length}` : '—'}</span>
            <span className="fg-result__label">{gameOver ? 'Xếp hạng' : 'Hạng tạm thời'}</span>
          </div>
          <div>
            <span className="fg-result__value">{team.score}</span>
            <span className="fg-result__label">Điểm</span>
          </div>
          <div>
            <span className="fg-result__value">
              {team.solvedQuestions.length} / {QUESTIONS.length}
            </span>
            <span className="fg-result__label">Câu đã giải</span>
          </div>
          <div>
            <span className="fg-result__value">{formatDuration(team.completionTime)}</span>
            <span className="fg-result__label">Thời gian</span>
          </div>
        </div>
      </div>
    </div>
  )
}
