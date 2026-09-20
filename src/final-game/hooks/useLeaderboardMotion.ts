import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import type { GameStateRecord, LeaderboardEntry } from '../types'

/** How long a row keeps its "just changed" highlight. Matches the CSS animation. */
const HIGHLIGHT_MS = 2200

export interface RowChange {
  /** Places climbed since the previous update (0 when only the score moved). */
  rankDelta: number
}

/**
 * FLIP animation for a ranked list: when rows change position, each one starts
 * at its old offset and glides to its new one (the CSS transition on the row
 * does the gliding). `orderKey` should change whenever the ordering does.
 */
export function useRowFlip(listRef: RefObject<HTMLElement | null>, orderKey: string): void {
  const previousTops = useRef(new Map<string, number>())
  const previousList = useRef<HTMLElement | null>(null)

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return

    // A freshly mounted list (e.g. the game moved from waiting to playing) has
    // no meaningful "before" — don't slide rows in from a previous layout.
    if (previousList.current !== list) {
      previousTops.current = new Map()
      previousList.current = list
    }

    const nextTops = new Map<string, number>()
    const moved: HTMLElement[] = []

    for (const child of Array.from(list.children)) {
      const row = child as HTMLElement
      const id = row.dataset.teamId
      if (!id) continue

      // offsetTop is layout position: unaffected by the transforms used below.
      const top = row.offsetTop
      nextTops.set(id, top)

      const before = previousTops.current.get(id)
      if (before !== undefined && before !== top) {
        row.style.transition = 'none'
        row.style.transform = `translateY(${before - top}px)`
        moved.push(row)
      }
    }

    previousTops.current = nextTops
    if (moved.length === 0) return

    void list.offsetHeight // commit the "from" position before releasing it
    for (const row of moved) {
      row.style.transition = ''
      row.style.transform = ''
    }
  }, [listRef, orderKey])
}

/**
 * Detects teams whose score rose or whose rank improved between two updates
 * and reports them for a short while, so the board can flag what just changed.
 * `tick` bumps on every detected change — key a one-shot effect on it.
 */
export function useRowChanges(entries: LeaderboardEntry[]): { changes: Record<string, RowChange>; tick: number } {
  const previous = useRef<Map<string, { rank: number; score: number }> | null>(null)
  const [state, setState] = useState<{ changes: Record<string, RowChange>; tick: number }>({ changes: {}, tick: 0 })

  useEffect(() => {
    const before = previous.current
    previous.current = new Map(entries.map((entry) => [entry.teamId, { rank: entry.rank, score: entry.score }]))
    // The first snapshot is the baseline, not a change.
    if (!before) return

    const changes: Record<string, RowChange> = {}
    for (const entry of entries) {
      const old = before.get(entry.teamId)
      if (!old) continue
      const rankDelta = Math.max(0, old.rank - entry.rank)
      if (entry.score > old.score || rankDelta > 0) changes[entry.teamId] = { rankDelta }
    }
    if (Object.keys(changes).length === 0) return

    setState((current) => ({ changes, tick: current.tick + 1 }))
    const timer = window.setTimeout(() => setState((current) => ({ ...current, changes: {} })), HIGHLIGHT_MS)
    return () => window.clearTimeout(timer)
  }, [entries])

  return state
}

/** Eases a displayed number toward `target` — scores roll up instead of snapping. */
export function useCountUp(target: number, durationMs = 700): number {
  const [display, setDisplay] = useState(target)
  const shown = useRef(target)

  useEffect(() => {
    const from = shown.current
    if (from === target) return

    const start = performance.now()
    let frame = 0
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      shown.current = Math.round(from + (target - from) * eased)
      setDisplay(shown.current)
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, durationMs])

  return display
}

/** Elapsed game time in ms, excluding paused time; ticks once a second while the game runs. */
export function useGameClock(game: GameStateRecord): number | null {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (game.status !== 'playing') return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [game.status])

  if (game.startedAt === null || game.status === 'waiting') return null

  const end = game.status === 'finished' ? (game.endedAt ?? now) : game.status === 'paused' ? (game.pausedAt ?? now) : now
  return Math.max(0, end - game.startedAt - game.totalPausedMs)
}
