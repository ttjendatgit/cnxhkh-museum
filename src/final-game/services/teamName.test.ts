import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { cleanTeamName, isTeamNameTaken, teamNameKey } from './teamName.ts'

describe('team names', () => {
  it('treats case and spacing variants as the same name', () => {
    const key = teamNameKey('Nhóm 1')
    for (const variant of ['nhóm 1', '  Nhóm 1', 'Nhóm 1  ', 'Nhóm   1', ' NHÓM \t 1 ']) assert.equal(teamNameKey(variant), key, variant)
  })

  it('keeps different names different', () => {
    assert.notEqual(teamNameKey('Nhóm 1'), teamNameKey('Nhóm 2'))
    assert.notEqual(teamNameKey('Nhóm 1'), teamNameKey('Nhóm1'))
  })

  it('cleans the stored name: trimmed, single spaces, original case', () => {
    assert.equal(cleanTeamName('  Nhóm   Sao  Vàng '), 'Nhóm Sao Vàng')
  })

  it('handles Vietnamese capitals and decomposed accents', () => {
    assert.equal(teamNameKey('ĐỘI MỘT'), teamNameKey('đội một'))
    assert.equal(teamNameKey('Nhóm 1'), teamNameKey('Nhóm 1'))
  })

  it('finds a taken name among existing ones', () => {
    assert.equal(isTeamNameTaken('nhóm 1', ['Nhóm 2', 'Nhóm   1']), true)
    assert.equal(isTeamNameTaken('Nhóm 3', ['Nhóm 2', 'Nhóm 1']), false)
    assert.equal(isTeamNameTaken('Nhóm 1', []), false)
  })
})
