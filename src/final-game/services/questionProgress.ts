/** Which question to show next. Questions can be answered in any order, so "next" is not
 * "current + 1": it is the next question still unsolved after the current one, wrapping
 * around to the first unsolved one, or null when every question is solved. Pure — the
 * caller passes the question ids in board order. */
export function nextUnsolvedId(allIds: number[], solvedIds: number[], currentId: number | null = null): number | null {
  const solved = new Set(solvedIds)
  const start = currentId === null ? 0 : allIds.indexOf(currentId) + 1
  const ordered = [...allIds.slice(start), ...allIds.slice(0, start)]
  return ordered.find((id) => !solved.has(id)) ?? null
}
