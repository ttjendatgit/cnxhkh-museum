import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { nextUnsolvedId } from './questionProgress.ts'

const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

describe('nextUnsolvedId', () => {
  it('starts at the first unsolved question when nothing is current', () => {
    assert.equal(nextUnsolvedId(ALL, []), 1)
    assert.equal(nextUnsolvedId(ALL, [1, 2, 3]), 4)
  })

  it('skips solved questions instead of following the fixed order', () => {
    // 1, 2, 3 and 5 are solved; 4 has just been solved, so the next open one is 6.
    assert.equal(nextUnsolvedId(ALL, [1, 2, 3, 4, 5], 4), 6)
  })

  it('goes forward from the current question before going back', () => {
    assert.equal(nextUnsolvedId(ALL, [7], 7), 8)
    assert.equal(nextUnsolvedId(ALL, [1, 2, 3, 4, 5, 6, 7], 7), 8)
  })

  it('wraps around to an earlier unsolved question', () => {
    assert.equal(nextUnsolvedId(ALL, [3, 8, 9, 10, 11, 12, 13], 13), 1)
    assert.equal(nextUnsolvedId(ALL, [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 3], 13), null)
  })

  it('returns null once every question is solved', () => {
    assert.equal(nextUnsolvedId(ALL, ALL, 13), null)
    assert.equal(nextUnsolvedId(ALL, ALL), null)
  })

  it('treats an unknown current id like "no current question"', () => {
    assert.equal(nextUnsolvedId(ALL, [1], 99), 2)
  })
})
