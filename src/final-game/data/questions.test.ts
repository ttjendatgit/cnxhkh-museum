import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { FINAL_KEYWORD, KEYWORD_LETTERS, QUESTIONS } from './questions.ts'

const upper = (value: string) => value.normalize('NFC').toLocaleUpperCase('vi-VN')

describe('question bank', () => {
  it('has 13 questions, ids 1..13, each with text and an answer', () => {
    assert.equal(QUESTIONS.length, 13)
    assert.deepEqual(QUESTIONS.map((question) => question.id), Array.from({ length: 13 }, (_, index) => index + 1))
    for (const question of QUESTIONS) {
      assert.ok(question.question.trim(), `question ${question.id} has no text`)
      assert.ok(question.answer.trim(), `question ${question.id} has no answer`)
    }
  })

  it('reward letters, in order, spell the final keyword', () => {
    assert.equal(FINAL_KEYWORD, 'NHÂN DÂN LÀM CHỦ')
    assert.equal(QUESTIONS.map((question) => question.rewardLetter).join(''), KEYWORD_LETTERS.join(''))
    assert.equal(QUESTIONS.map((question) => question.rewardLetter).join(''), 'NHÂNDÂNLÀMCHỦ')
  })

  it('every answer contains its reward letter (so its crossword row can cross the keyword column)', () => {
    for (const question of QUESTIONS) assert.ok(upper(question.answer).includes(upper(question.rewardLetter)), `question ${question.id}: ${question.answer} has no ${question.rewardLetter}`)
  })
})
