import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { TeamRecord } from '../types.ts'
import { isEligible } from './scoring.ts'

/** A team with only what ranking looks at; `solved` is how many questions it has answered. */
function team(
  id: string,
  options: { finished?: boolean; completionTime?: number | null; score?: number; solved?: number; joinedAt?: number; keywordCorrect?: boolean } = {},
): TeamRecord {
  const { finished = false, completionTime = null, score = 0, solved = 0, joinedAt = 0, keywordCorrect } = options
  return {
    teamId: id,
    teamName: id,
    progress: solved,
    solvedQuestions: Array.from({ length: finished ? Math.max(solved, 13) : solved }, (_, index) => index + 1),
    collectedLetters: [],
    score,
    completionTime,
    keywordAttempt: '',
    keywordCorrect: keywordCorrect ?? finished,
    finished,
    finishedAt: finished ? 1 : null,
    joinedAt,
  }
}

const win = (id: string, options: Parameters<typeof team>[1] = {}) => team(id, { finished: true, completionTime: 500, score: 230, ...options })

describe('isEligible', () => {
  it('requires all 13 questions, the keyword and finished', () => {
    assert.equal(isEligible(win('ok')), true)
    assert.equal(isEligible({ ...win('few'), solvedQuestions: [1, 2, 3] }), false)
    assert.equal(isEligible(win('no-keyword', { keywordCorrect: false })), false)
    assert.equal(isEligible({ ...win('not-finished'), finished: false }), false)
  })
})
