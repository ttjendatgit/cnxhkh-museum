/** Team names are compared without regard to case or spacing, so "Nhóm 1", "nhóm 1",
 * "  Nhóm 1" and "Nhóm   1" are the same team name. Pure — no backend involved. */

/** The name as stored and shown: trimmed, runs of whitespace collapsed to one space. */
export function cleanTeamName(name: string): string {
  return name.normalize('NFC').trim().replace(/\s+/g, ' ')
}

/** What two names are compared by. */
export function teamNameKey(name: string): string {
  return cleanTeamName(name).toLocaleLowerCase('vi-VN')
}

/** Whether `name` is already used by one of `existingNames`. */
export function isTeamNameTaken(name: string, existingNames: Iterable<string>): boolean {
  const key = teamNameKey(name)
  for (const existing of existingNames) if (teamNameKey(existing) === key) return true
  return false
}

export const TEAM_NAME_TAKEN_MESSAGE = 'Tên đội đã tồn tại.\nVui lòng chọn tên khác.'
