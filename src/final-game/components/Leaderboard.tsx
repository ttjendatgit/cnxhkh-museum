import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useLeaderboard, useWinners } from '../hooks/useLeaderboard'
import { useGameState } from '../hooks/useGameState'
import { useCountUp, useGameClock, useRowChanges, useRowFlip, type RowChange } from '../hooks/useLeaderboardMotion'
import { QUESTIONS } from '../data/questions'
import { teamStatusLabel } from '../data/teamStatus'
import type { GameStatus, LeaderboardEntry } from '../types'
import '../styles/finalGame.css'
import '../styles/leaderboardDisplay.css'

/** `page`: fills the viewport (projector / `?game=leaderboard`).
 * `wall`: a fixed 1200x600 board sized for the Final Room's big screen. */
export type LeaderboardVariant = 'page' | 'wall'

/** The wall board has a fixed height, so it shows the top of the ranking only. */
const WALL_LIVE_ROWS = 7
const WALL_FINAL_ROWS = 2 // rows below the Top 3
const WALL_LOBBY_CHIPS = 12

function formatDuration(ms: number | null): string {
  if (ms === null) return '—'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/** True for a moment after mount. Entrance animations are tied to this instead
 * of living on the elements permanently: React re-inserts reordered nodes, and a
 * permanent CSS animation would replay (and fight the reorder glide) each time. */
function useEntering(ms = 1800): boolean {
  const [entering, setEntering] = useState(true)
  useEffect(() => {
    const timer = window.setTimeout(() => setEntering(false), ms)
    return () => window.clearTimeout(timer)
  }, [ms])
  return entering
}

function AnimatedNumber({ value }: { value: number }) {
  return <>{useCountUp(value)}</>
}

interface RankingProps {
  entries: LeaderboardEntry[]
  changes: Record<string, RowChange>
  /** The room's status (gameRooms/{roomId}/status) — teams carry none of their own. */
  roomStatus: GameStatus
  /** Heading above the list, to label a section of the end-of-game board. */
  title?: string
  /** Column header row; only the first section of a board needs one. */
  showHead?: boolean
  /** Show a finished team's completion time. Only the Top 3 does; during the game, and for the
   * teams below the Top 3, a finished team just reads "Hoàn thành". */
  showTime?: boolean
}

function Ranking({ entries, changes, roomStatus, title, showHead = true, showTime = false }: RankingProps) {
  const listRef = useRef<HTMLOListElement>(null)
  const entering = useEntering()
  useRowFlip(listRef, entries.map((entry) => entry.teamId).join('|'))

  return (
    <div className="fg-board__ranking">
      {title && <p className="fg-board__section">{title}</p>}
      {showHead && (
        <div className="fg-board__head" aria-hidden="true">
          <span>Hạng</span>
          <span>Đội</span>
          <span>Câu đã giải</span>
          <span>Điểm</span>
          <span>Trạng thái</span>
        </div>
      )}
      <ol className="fg-board__list" ref={listRef}>
        {entries.map((entry, index) => {
          const change = changes[entry.teamId]
          const classes = ['fg-board__row']
          if (entering) classes.push('fg-board__row--enter')
          if (entry.rank === 1) classes.push('fg-board__row--leader')
          if (change) classes.push('fg-board__row--changed')
          return (
            <li key={entry.teamId} data-team-id={entry.teamId} className={classes.join(' ')} style={{ '--i': index } as CSSProperties}>
              <span className="fg-board__rank">
                {entry.rank}
                {change && change.rankDelta > 0 && <span className="fg-board__delta">▲{change.rankDelta}</span>}
              </span>
              <span className="fg-board__team">
                {entry.teamName}
              </span>
              <span className="fg-board__solved">
                {entry.solvedCount} / {QUESTIONS.length}
              </span>
              <span className="fg-board__score">
                <AnimatedNumber value={entry.score} />
              </span>
              <span className={`fg-board__time${entry.finished ? ' fg-board__time--done' : ''}`}>{entry.finished ? `✓ ${showTime ? formatDuration(entry.completionTime) : 'Hoàn thành'}` : teamStatusLabel(roomStatus)}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function WaitingStage({ entries, variant }: { entries: LeaderboardEntry[]; variant: LeaderboardVariant }) {
  const chips = variant === 'wall' ? entries.slice(0, WALL_LOBBY_CHIPS) : entries
  const hidden = entries.length - chips.length
  const entering = useEntering()

  return (
    <div className="fg-board__stage fg-board__stage--waiting">
      <div className="fg-board__sweep" aria-hidden="true" />
      <div className="fg-board__emblem" aria-hidden="true">
        <span />
      </div>
      <p className="fg-board__brand-eyebrow">Phòng Kết</p>
      <h2 className="fg-board__headline">Bí Mật Của Nhân Dân</h2>
      <div className="fg-board__rule" aria-hidden="true" />
      <p className="fg-board__subline">
        Tiến đến bục thử thách và nhấn <kbd>E</kbd> để tham gia. Trò chơi bắt đầu khi điều hành viên sẵn sàng.
      </p>

      {entries.length === 0 ? (
        <p className="fg-board__lobby-note">Chưa có đội nào tham gia.</p>
      ) : (
        <>
          <p className="fg-board__lobby-note">{entries.length} đội đã sẵn sàng</p>
          <ul className="fg-board__chips">
            {chips.map((entry, index) => (
              <li key={entry.teamId} className={`fg-board__chip${entering ? ' fg-board__chip--enter' : ''}`} style={{ '--i': index } as CSSProperties}>
                {entry.teamName}
              </li>
            ))}
            {hidden > 0 && <li className="fg-board__chip fg-board__chip--more">+{hidden}</li>}
          </ul>
        </>
      )}
    </div>
  )
}

function LiveStage({ entries, status, tick, changes, variant }: { entries: LeaderboardEntry[]; status: GameStatus; tick: number; changes: Record<string, RowChange>; variant: LeaderboardVariant }) {
  const shown = variant === 'wall' ? entries.slice(0, WALL_LIVE_ROWS) : entries
  const hidden = entries.length - shown.length

  return (
    <div className="fg-board__stage fg-board__stage--live">
      <div className="fg-board__sweep" aria-hidden="true" />
      {/* Re-keyed on every update so the light pass replays. */}
      {tick > 0 && <div key={tick} className="fg-board__sweep fg-board__sweep--update" aria-hidden="true" />}
      {status === 'paused' && <p className="fg-board__banner">Tạm dừng</p>}
      {entries.length === 0 ? (
        <p className="fg-board__lobby-note">Chưa có đội nào tham gia.</p>
      ) : (
        <>
          <Ranking entries={shown} changes={changes} roomStatus={status} />
          {hidden > 0 && <p className="fg-board__more">+{hidden} đội khác</p>}
        </>
      )}
    </div>
  )
}

function FinalStage({ entries, winners, variant }: { entries: LeaderboardEntry[]; winners: LeaderboardEntry[]; variant: LeaderboardVariant }) {
  const champion = winners[0]
  // Everyone outside the Top 3 stays visible with their normal ranking. With no
  // winner there is no Top 3 block, so the ranking gets the room it would have used.
  const winnerIds = new Set(winners.map((winner) => winner.teamId))
  const rest = entries.filter((entry) => !winnerIds.has(entry.teamId))
  const wallRows = champion ? WALL_FINAL_ROWS : WALL_LIVE_ROWS
  const shown = variant === 'wall' ? rest.slice(0, wallRows) : rest
  const hidden = rest.length - shown.length

  return (
    <div className="fg-board__stage fg-board__stage--final">
      <div className="fg-board__sweep" aria-hidden="true" />
      {entries.length === 0 ? (
        <p className="fg-board__lobby-note">Trò chơi đã kết thúc — không có đội nào tham gia.</p>
      ) : (
        <>
          {champion ? (
            <>
              <div className="fg-board__winner">
                <p className="fg-board__winner-label">Đội chiến thắng</p>
                <p className="fg-board__winner-name">{champion.teamName}</p>
                <p className="fg-board__winner-meta">
                  {champion.score} điểm · {champion.solvedCount} / {QUESTIONS.length} câu
                  {champion.completionTime !== null && ` · ${formatDuration(champion.completionTime)}`}
                </p>
              </div>
              <Ranking entries={winners} changes={{}} roomStatus="finished" title="Top 3" showTime />
            </>
          ) : (
            <p className="fg-board__lobby-note">Chưa có đội nào hoàn thành thử thách</p>
          )}
          {shown.length > 0 && <Ranking entries={shown} changes={{}} roomStatus="finished" title={champion ? 'Các đội còn lại' : undefined} showHead={!champion} />}
          {hidden > 0 && <p className="fg-board__more">+{hidden} đội khác</p>}
        </>
      )}
    </div>
  )
}

/** Public ranking board. Three phases — waiting (lobby), live (realtime
 * ranking) and final (result) — each entered with its own transition. Only
 * shows rank/score/progress count/completion — never question text or answers,
 * win or lose. */
export default function Leaderboard({ variant = 'page' }: { variant?: LeaderboardVariant }) {
  const entries = useLeaderboard()
  const winners = useWinners()
  const gameState = useGameState()
  const clock = useGameClock(gameState)
  const { changes, tick } = useRowChanges(entries)

  const { status } = gameState
  const statusLabel = status === 'playing' ? 'Đang thi đấu' : status === 'paused' ? 'Tạm dừng' : status === 'finished' ? 'Kết thúc' : 'Chờ bắt đầu'

  return (
    <div className={`final-game fg-board fg-board--${variant}`}>
      <header className="fg-board__header">
        <div>
          <p className="final-game__eyebrow">Phòng Kết — Bảng Xếp Hạng</p>
          <h1 className="final-game__title fg-board__title">Thử Thách Cuối Cùng</h1>
        </div>
        <div className="fg-board__status">
          <span className={`fg-status-pill${status === 'playing' ? ' fg-status-pill--playing' : ''}${status === 'finished' ? ' fg-status-pill--finished' : ''}`}>{statusLabel}</span>
          {clock !== null && <span className="fg-board__clock">{formatDuration(clock)}</span>}
        </div>
      </header>

      {/* Keyed by phase so each change of phase replays the entrance. */}
      {status === 'waiting' && <WaitingStage key="waiting" entries={entries} variant={variant} />}
      {(status === 'playing' || status === 'paused') && <LiveStage key="live" entries={entries} status={status} tick={tick} changes={changes} variant={variant} />}
      {status === 'finished' && <FinalStage key="final" entries={entries} winners={winners} variant={variant} />}
    </div>
  )
}
