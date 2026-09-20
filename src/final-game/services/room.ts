const DEFAULT_ROOM_ID = 'main'

/** Which game room this browser plays in — the `{roomId}` in `gameRooms/{roomId}`.
 * Taken from `?room=<id>` in the URL, else `VITE_FINAL_GAME_ROOM_ID`, else "main".
 * One id per physical competition (the LED screen, the admin and every team's phone
 * must use the same one). Only letters, digits, "-" and "_" are accepted, which also
 * keeps it a valid Realtime Database key. */
export function getRoomId(): string {
  const fromUrl = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('room') : null
  const raw = fromUrl ?? (import.meta.env.VITE_FINAL_GAME_ROOM_ID as string | undefined) ?? DEFAULT_ROOM_ID
  return /^[A-Za-z0-9_-]{1,40}$/.test(raw) ? raw : DEFAULT_ROOM_ID
}
