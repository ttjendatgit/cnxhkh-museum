import type { GameStatus } from '../types'

/** What a team sees when the game isn't accepting answers — one message per
 * status, so the reason is always clear (not started / paused / over). */
export const GAME_STATUS_MESSAGES: Record<GameStatus, string> = {
  waiting: 'Trò chơi chưa bắt đầu. Vui lòng chờ điều hành viên.',
  playing: '',
  paused: 'Trò chơi đang tạm dừng. Vui lòng chờ điều hành viên tiếp tục.',
  finished: 'Trò chơi đã kết thúc.',
}
