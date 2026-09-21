import { useEffect, useRef, useState } from 'react'
import TeamLobby from '../components/TeamLobby'
import CrosswordBoard from '../FinalGame/CrosswordBoard'
import PlayerStatusBar from '../FinalGame/PlayerStatusBar'
import QuestionPanel from '../FinalGame/QuestionPanel'
import QuestionPicker from '../FinalGame/QuestionPicker'
import { QUESTIONS } from '../FinalGame/questions'
import ResultScreen from '../FinalGame/ResultScreen'
import WaitingScreen from '../FinalGame/WaitingScreen'
import { useKeyboardInset } from '../hooks/useKeyboardInset'
import { useTeam } from '../hooks/useTeam'
import { useGameStatus } from '../hooks/useGameState'
import { gamePhase } from '../services/gamePhase'
import { nextUnsolvedId } from '../services/questionProgress'
import { getRoomId } from '../services/room'
import type { ResolveArtifact, TeamRecord } from '../types'
import '../styles/finalGame.css'

interface PlayerScreenProps {
  /** Turns a question's related artifact into a hint (this module never reads museum data). */
  resolveArtifact?: ResolveArtifact
}

/** One team's own game, on its own device (one team = one device; nobody joins an existing
 * team). The team types its name once, then gets the
 * crossword and the questions; every correct answer updates only that team's node, so
 * the public leaderboard (LeaderboardScreen) follows in realtime. Teams play independently.
 * Questions can be answered in any order: the crossword rows (and, on a phone, the question
 * list) choose which one the clue panel shows. On a phone everything stacks — stats, crossword,
 * the chosen question with its answer and keyword boxes, then the question list; on a wide
 * screen the crossword is on the left and the clue on the right. */
export default function PlayerScreen({ resolveArtifact }: PlayerScreenProps) {
  // Per room, so a phone that moves to another competition asks for a team name again.
  const storageKey = `final-game:teamId:${getRoomId()}`
  const [teamId, setTeamId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(storageKey)
    } catch {
      return null
    }
  })

  // The question the player picked; until they pick one, the first unsolved question is shown.
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { team, loading } = useTeam(teamId)
  const questionPanel = useRef<HTMLDivElement>(null)
  useKeyboardInset()
  const { state: gameState, loaded: gameLoaded } = useGameStatus()

  useEffect(() => {
    try {
      if (teamId) localStorage.setItem(storageKey, teamId)
    } catch {
      // Storage can be unavailable (private mode, quota) — joining still
      // works for the current session, it just won't survive a reload.
    }
  }, [teamId, storageKey])

  // Choosing a question from the crossword or the list: on a narrow screen the question panel sits
  // below them, so bring it into view instead of leaving the player to scroll for it.
  function handlePick(id: number) {
    setSelectedId(id)
    if (!window.matchMedia('(max-width: 980px)').matches) return
    window.requestAnimationFrame(() => questionPanel.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }))
  }

  function handleJoined(joinedTeam: TeamRecord) {
    setSelectedId(null)
    setTeamId(joinedTeam.teamId)
  }

  // After a reload the stored team is looked up in the database first: showing the name form
  // meanwhile would look like the team was lost (and invite creating a second one).
  if (teamId && (loading || !gameLoaded)) {
    return (
      <div className="final-game">
        <p className="fg-muted">Đang khôi phục đội…</p>
      </div>
    )
  }
  if (!teamId || !team) return <TeamLobby onJoined={handleJoined} />
  const phase = gamePhase(gameState.status)
  // FINISHED (or this team won): the result, no way to answer.
  if (phase === 'FINISHED' || team.finished) return <ResultScreen team={team} />

  // WAITING: the host has not started. Nothing of the game is rendered — no crossword, no question
  // list, no question text, no answer box, nothing to pick — only the waiting message. (Answers are
  // also refused in the answer-checking code, see submitAnswer.)
  if (phase === 'WAITING') {
    return (
      <div className="final-game">
        <header className="fg-game__header">
          <p className="final-game__eyebrow">Phòng Kết — {team.teamName}</p>
          <h1 className="final-game__title">Bí Mật Của Nhân Dân</h1>
        </header>
        <PlayerStatusBar team={team} gameState={gameState} />
        <WaitingScreen />
      </div>
    )
  }

  const activeId = selectedId ?? nextUnsolvedId(QUESTIONS.map((question) => question.id), team.solvedQuestions)

  return (
    <div className="final-game">
      <header className="fg-game__header">
        <p className="final-game__eyebrow">Phòng Kết — {team.teamName}</p>
        <h1 className="final-game__title">Bí Mật Của Nhân Dân</h1>
      </header>
      <PlayerStatusBar team={team} gameState={gameState} />
      <div className="fg-game">
        <div className="fg-game__left">
          <CrosswordBoard team={team} activeId={activeId} onSelect={handlePick} />
          <QuestionPicker team={team} activeId={activeId} onSelect={handlePick} />
        </div>
        <div className="fg-game__right" ref={questionPanel}>
          <QuestionPanel team={team} gameState={gameState} activeId={activeId} onSelect={setSelectedId} resolveArtifact={resolveArtifact} />
        </div>
      </div>
    </div>
  )
}
