import type { GameStatus } from '../types'

/** What a team's status cell reads, derived from the ROOM's status (gameRooms/{roomId}/status)
 * — teams carry no status of their own. A team that has completed the keyword is shown as
 * completed by the caller; this covers every team still in play. */
export function teamStatusLabel(roomStatus: GameStatus | string): string {
  switch (roomStatus) {
    case 'finished':
      return 'Đã kết thúc'
    case 'playing':
    case 'started':
      return 'Đang chơi'
    case 'paused':
      return 'Tạm dừng'
    case 'waiting':
      return 'Chờ bắt đầu'
    default:
      return String(roomStatus)
  }
}
