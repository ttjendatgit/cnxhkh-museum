/** Public surface of the standalone Final Room puzzle module. It imports
 * nothing from the museum; the museum reaches it only through
 * src/museum/final-room/FinalGameScreens.tsx (see README.md in this folder). */

export { default as PlayerScreen } from './screens/PlayerScreen'
export { default as LeaderboardScreen } from './screens/LeaderboardScreen'
export { default as AdminScreen } from './screens/AdminScreen'
export { CrosswordBoard, QuestionPanel, AnswerInput, ResultScreen } from './FinalGame'

export { default as TeamLobby } from './components/TeamLobby'
export { default as Leaderboard } from './components/Leaderboard'
export { default as AdminControl } from './components/AdminControl'

export * from './types'
export { QUESTIONS, FINAL_KEYWORD, KEYWORD_LETTERS } from './data/questions'
export { DEFAULT_SCORING, computeScore, rankTeams, rankWinners } from './services/scoring'
export { isFirebaseConfigured } from './services/firebase'
export { isUsingMockBackend, getBackend, joinGame, submitAnswer, submitKeyword, adminStartGame, adminPauseGame, adminResumeGame, adminEndGame, adminResetGame } from './services/gameService'
