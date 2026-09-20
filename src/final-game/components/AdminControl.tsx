import { useState } from 'react'
import { useGameState } from '../hooks/useGameState'
import { useAllTeams } from '../hooks/useAllTeams'
import { teamStatusLabel } from '../data/teamStatus'
import { adminEndGame, adminPauseGame, adminResetGame, adminResumeGame, adminStartGame } from '../services/gameService'
import '../styles/finalGame.css'

/** Operator console: start/pause/resume/end/reset. Ending or resetting
 * updates `gameState`, which every connected client (QuestionPanel,
 * Leaderboard) is already subscribed to — so the lockout is
 * immediate everywhere, with no per-client polling needed. */
export default function AdminControl() {
  const gameState = useGameState()
  const teams = useAllTeams()
  const [busy, setBusy] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)

  async function run(action: () => Promise<void>) {
    setBusy(true)
    try {
      await action()
    } finally {
      setBusy(false)
    }
  }

  const teamCount = Object.keys(teams).length
  const finishedCount = Object.values(teams).filter((team) => team.finished).length

  return (
    <div className="final-game">
      <p className="final-game__eyebrow">Phòng Kết — Bảng Điều Khiển</p>
      <h1 className="final-game__title">Quản Trị Trò Chơi</h1>

      <div className="fg-panel">
        <p className="fg-label">Trạng thái hiện tại</p>
        <p className="fg-question" style={{ marginBottom: 4 }}>
          {gameState.status.toUpperCase()}
        </p>
        <p className="fg-muted">
          {teamCount} đội đã tham gia · {finishedCount} đội hoàn thành
        </p>

        <div className="fg-divider" />

        <div className="fg-row">
          <button className="fg-button fg-button--primary" disabled={busy || gameState.status === 'playing'} onClick={() => run(adminStartGame)}>
            Bắt đầu
          </button>
          <button className="fg-button" disabled={busy || gameState.status !== 'playing'} onClick={() => run(adminPauseGame)}>
            Tạm dừng
          </button>
          <button className="fg-button" disabled={busy || gameState.status !== 'paused'} onClick={() => run(() => adminResumeGame(gameState))}>
            Tiếp tục
          </button>
          <button className="fg-button fg-button--danger" disabled={busy || gameState.status === 'finished' || gameState.status === 'waiting'} onClick={() => run(adminEndGame)}>
            Kết thúc
          </button>
        </div>

        <div className="fg-divider" />

        {!confirmingReset ? (
          <button className="fg-button fg-button--danger" disabled={busy} onClick={() => setConfirmingReset(true)}>
            Đặt lại toàn bộ trò chơi
          </button>
        ) : (
          <div className="fg-row">
            <span className="fg-muted">Xóa toàn bộ {teamCount} đội và đưa trò chơi về trạng thái chờ. Xác nhận?</span>
            <button
              className="fg-button fg-button--danger"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await adminResetGame()
                  setConfirmingReset(false)
                })
              }
            >
              Xác nhận đặt lại
            </button>
            <button className="fg-button" disabled={busy} onClick={() => setConfirmingReset(false)}>
              Hủy
            </button>
          </div>
        )}
      </div>

      <div className="fg-panel">
        <p className="fg-label">Danh sách đội</p>
        {teamCount === 0 ? (
          <p className="fg-muted">Chưa có đội nào tham gia.</p>
        ) : (
          <table className="fg-table">
            <thead>
              <tr>
                <th>Đội</th>
                <th>Điểm</th>
                <th>Tiến độ</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(teams).map((team) => (
                <tr key={team.teamId}>
                  <td>{team.teamName}</td>
                  <td>{team.score}</td>
                  <td>{team.solvedQuestions.length} / 13</td>
                  <td>{team.finished ? 'Hoàn thành' : teamStatusLabel(gameState.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
