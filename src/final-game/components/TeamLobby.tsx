import { useState } from 'react'
import type { TeamRecord } from '../types'
import { useGameState } from '../hooks/useGameState'
import { joinGame, teamCreationBlockedReason } from '../services/gameService'
import '../styles/finalGame.css'

interface TeamLobbyProps {
  onJoined: (team: TeamRecord) => void
}

/** Entry screen: a group types its team name and creates its team — team count is never
 * hard-coded. One team is one device, so there is no joining an existing team; a name another
 * team already uses is refused, and teams can only be created while the game is waiting. */
export default function TeamLobby({ onJoined }: TeamLobbyProps) {
  const [teamName, setTeamName] = useState('')
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const blocked = teamCreationBlockedReason(useGameState().status)

  async function handleJoin() {
    if (blocked) {
      setError(blocked)
      return
    }
    if (!teamName.trim()) {
      setError('Vui lòng nhập tên đội.')
      return
    }
    setJoining(true)
    setError(null)
    try {
      const team = await joinGame(teamName)
      onJoined(team)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tham gia trò chơi.')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="final-game">
      <p className="final-game__eyebrow">Phòng Kết — Trò Chơi Giải Mã</p>
      <h1 className="final-game__title">Bí Mật Của Nhân Dân</h1>

      <div className="fg-panel">
        <label className="fg-label" htmlFor="team-name-input">
          Tên đội của bạn
        </label>
        <input
          id="team-name-input"
          className="fg-input"
          placeholder="VD: Đội 01"
          value={teamName}
          onChange={(event) => {
            setTeamName(event.target.value)
            setError(null)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleJoin()
          }}
          maxLength={40}
          disabled={joining || blocked !== null}
        />

        {(blocked ?? error) && <p className="fg-feedback fg-feedback--wrong">{blocked ?? error}</p>}

        <div className="fg-row" style={{ marginTop: 20 }}>
          <button className="fg-button fg-button--primary" onClick={handleJoin} disabled={joining || blocked !== null}>
            {joining ? 'Đang tạo đội…' : 'Bắt đầu'}
          </button>
        </div>
      </div>

      <p className="fg-muted">Mỗi đội chơi độc lập trên thiết bị riêng của mình.</p>
    </div>
  )
}
