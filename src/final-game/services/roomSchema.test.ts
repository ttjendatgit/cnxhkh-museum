import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { solvedIdsFromNode, teamFromNode, teamPatchToUpdate } from './roomSchema.ts'

describe('solvedIdsFromNode', () => {
  it('reads the { "id": true } map', () => {
    assert.deepEqual(solvedIdsFromNode({ '1': true, '2': true, '5': true }), [1, 2, 5])
  })

  it('reads a map the SDK returned as an array (true at each solved id\'s index)', () => {
    assert.deepEqual(solvedIdsFromNode([undefined, true, true, undefined, undefined, true]), [1, 2, 5])
  })

  it('still reads the older array of question ids', () => {
    assert.deepEqual(solvedIdsFromNode([5, 1, 2]), [1, 2, 5])
  })

  it('ignores false entries and handles a missing node', () => {
    assert.deepEqual(solvedIdsFromNode({ '1': true, '2': false }), [1])
    assert.deepEqual(solvedIdsFromNode(undefined), [])
    assert.deepEqual(solvedIdsFromNode(null), [])
  })
})

describe('team node mapping', () => {
  it('builds solvedQuestions and progress from the map', () => {
    const team = teamFromNode({ name: 'A', score: 30, solvedCount: 3, joinedAt: 1, solvedQuestions: { '1': true, '4': true, '9': true } }, 't1')
    assert.deepEqual(team.solvedQuestions, [1, 4, 9])
    assert.equal(team.progress, 3)
  })

  it('writes each solved question as its own path, so devices cannot overwrite each other', () => {
    const update = teamPatchToUpdate({ solvedQuestions: [1, 5], collectedLetters: ['N', '', '', '', 'N'], progress: 2, score: 20 }, 0)
    assert.deepEqual(update, {
      score: 20,
      solvedCount: 2,
      'solvedQuestions/1': true,
      'solvedQuestions/5': true,
      'collectedLetters/0': 'N',
      'collectedLetters/4': 'N',
    })
  })
})
