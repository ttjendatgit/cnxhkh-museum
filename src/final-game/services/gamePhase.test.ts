import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { acceptsAnswers, gamePhase, GameNotRunningError } from './gamePhase.ts'

describe('gamePhase', () => {
  it('maps the stored status to WAITING / RUNNING / FINISHED', () => {
    assert.equal(gamePhase('waiting'), 'WAITING')
    assert.equal(gamePhase('playing'), 'RUNNING')
    assert.equal(gamePhase('paused'), 'RUNNING')
    assert.equal(gamePhase('finished'), 'FINISHED')
  })
})

describe('acceptsAnswers', () => {
  it('is true only while the game is playing', () => {
    assert.equal(acceptsAnswers('playing'), true)
    for (const status of ['waiting', 'paused', 'finished'] as const) assert.equal(acceptsAnswers(status), false, status)
  })
})

describe('GameNotRunningError', () => {
  it('carries the status that refused the answer', () => {
    const error = new GameNotRunningError('waiting')
    assert.equal(error.status, 'waiting')
    assert.ok(error instanceof Error)
    assert.equal(error.name, 'GameNotRunningError')
  })
})
