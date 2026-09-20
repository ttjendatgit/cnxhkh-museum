import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { TeamRecord } from '../types.ts'
import { isEligible, rankTeams, rankWinners } from './scoring.ts'

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

/** Team ids in normal-ranking order. */
function order(teams: TeamRecord[]): string[] {
  return rankTeams(teams).map((entry) => entry.teamId)
}

/** Team ids of the prize winners, in prize order. */
function winners(teams: TeamRecord[], limit?: number): string[] {
  return rankWinners(teams, 13, limit).map((entry) => entry.teamId)
}

const win = (id: string, options: Parameters<typeof team>[1] = {}) => team(id, { finished: true, completionTime: 500, score: 230, ...options })

describe('rankTeams: normal ranking (during the game)', () => {
  it('ranks the higher score higher', () => {
    assert.deepEqual(order([team('low', { score: 40, solved: 4 }), team('high', { score: 90, solved: 9 })]), ['high', 'low'])
  })

  it('on the same score, ranks the team with more solved questions higher', () => {
    // 100 = 10 solved, or 0 solved plus the keyword bonus.
    assert.deepEqual(order([team('keyword-only', { score: 100, solved: 0 }), team('ten-solved', { score: 100, solved: 10 })]), ['ten-solved', 'keyword-only'])
  })

  it('on the same score and solved count, ranks the earlier joinedAt higher', () => {
    assert.deepEqual(order([team('b', { score: 50, solved: 5, joinedAt: 2 }), team('a', { score: 50, solved: 5, joinedAt: 1 })]), ['a', 'b'])
  })

  it('ignores finished state and completionTime', () => {
    assert.deepEqual(order([win('finished', { score: 130, completionTime: 1 }), team('unfinished', { score: 200, solved: 12 })]), ['unfinished', 'finished'])
  })

  it('gives every team a rank from 1 with no gaps', () => {
    const ranked = rankTeams([team('a', { score: 5, solved: 1 }), win('b'), team('c', { score: 50, solved: 5 })])
    assert.deepEqual(ranked.map((entry) => entry.rank), [1, 2, 3])
    assert.deepEqual(ranked.map((entry) => entry.eligible), [true, false, false])
  })

  it('copies what the leaderboard shows', () => {
    const [first, second] = rankTeams([team('b', { score: 20, solved: 2 }), win('a', { completionTime: 123 })])
    assert.deepEqual(first, { rank: 1, eligible: true, teamId: 'a', teamName: 'a', score: 230, solvedCount: 13, finished: true, completionTime: 123 })
    assert.deepEqual(second, { rank: 2, eligible: false, teamId: 'b', teamName: 'b', score: 20, solvedCount: 2, finished: false, completionTime: null })
  })

  it('handles no teams and does not reorder the input', () => {
    assert.deepEqual(rankTeams([]), [])
    const teams = [team('b', { score: 1 }), team('a', { score: 2 })]
    rankTeams(teams)
    assert.deepEqual(teams.map((entry) => entry.teamId), ['b', 'a'])
  })
})

describe('isEligible', () => {
  it('requires all 13 questions, the keyword and finished', () => {
    assert.equal(isEligible(win('ok')), true)
    assert.equal(isEligible({ ...win('few'), solvedQuestions: [1, 2, 3] }), false)
    assert.equal(isEligible(win('no-keyword', { keywordCorrect: false })), false)
    assert.equal(isEligible({ ...win('not-finished'), finished: false }), false)
  })
})

describe('rankWinners: prize ranking (after the game)', () => {
  it('excludes teams that did not finish, whatever their score', () => {
    assert.deepEqual(winners([team('unfinished', { score: 999, solved: 13, keywordCorrect: true }), win('winner', { score: 130 })]), ['winner'])
  })

  it('ranks the higher score higher, even when slower', () => {
    assert.deepEqual(winners([win('fast-low', { completionTime: 300, score: 130 }), win('slow-high', { completionTime: 900, score: 230 })]), ['slow-high', 'fast-low'])
  })

  it('on the same score, ranks the shorter completionTime higher', () => {
    assert.deepEqual(winners([win('slow', { completionTime: 600 }), win('fast', { completionTime: 300 })]), ['fast', 'slow'])
  })

  it('on the same score and time, ranks the earlier joinedAt higher', () => {
    assert.deepEqual(winners([win('later', { joinedAt: 20 }), win('first', { joinedAt: 10 })]), ['first', 'later'])
  })

  it('puts a team with no recorded time after timed teams of the same score', () => {
    assert.deepEqual(winners([win('no-time', { completionTime: null }), win('timed', { completionTime: 800 })]), ['timed', 'no-time'])
  })

  it('keeps only the Top 3, numbered by prize place', () => {
    const teams = [win('d', { score: 130 }), win('a', { score: 230, completionTime: 100 }), win('c', { score: 230, completionTime: 300 }), win('b', { score: 230, completionTime: 200 })]
    assert.deepEqual(winners(teams), ['a', 'b', 'c'])
    assert.deepEqual(rankWinners(teams).map((entry) => entry.rank), [1, 2, 3])
  })

  it('returns fewer than 3 when fewer teams are eligible, and none when nobody is', () => {
    assert.deepEqual(winners([win('only'), team('playing', { score: 100, solved: 10 })]), ['only'])
    assert.deepEqual(winners([team('playing', { score: 100, solved: 10 })]), [])
    assert.deepEqual(winners([]), [])
  })

  it('does not reorder the input', () => {
    const teams = [win('b', { score: 130 }), win('a', { score: 230 })]
    rankWinners(teams)
    assert.deepEqual(teams.map((entry) => entry.teamId), ['b', 'a'])
  })
})
