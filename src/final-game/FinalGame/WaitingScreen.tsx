import { GAME_STATUS_MESSAGES } from '../data/statusMessages'
import '../styles/finalGame.css'

/** What a team sees until the host starts the game: only this message. No crossword, no question
 * list, no question text, no answer box — PlayerScreen renders this INSTEAD of them (they are not
 * mounted, not merely hidden), and the answer-checking code refuses answers in this state too. */
export default function WaitingScreen() {
  return (
    <div className="fg-panel fg-waiting" role="status">
      <p className="fg-waiting__message">{GAME_STATUS_MESSAGES.waiting}</p>
      <p className="fg-muted fg-waiting__hint">Màn hình sẽ tự chuyển sang câu hỏi khi trò chơi bắt đầu.</p>
    </div>
  )
}
