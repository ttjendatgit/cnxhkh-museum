import type { Question } from '../types'

/** The 13-letter phrase teams assemble by solving all questions in order.
 * Spaces are kept for display but are not part of any single question's
 * `rewardLetter` — there are exactly 13 letters (N-H-Â-N D-Â-N L-À-M C-H-Ủ). */
export const FINAL_KEYWORD = 'NHÂN DÂN LÀM CHỦ'

/** Same phrase with spaces stripped, one entry per reward-letter slot — this
 * is what the crossword's vertical keyword column spells, one letter per row, and
 * what a team's collectedLetters is index-aligned to. */
export const KEYWORD_LETTERS = FINAL_KEYWORD.replace(/\s/g, '').split('')

/**
 * The question bank: one entry per keyword letter, in keyword order (the
 * question at index i awards KEYWORD_LETTERS[i]). `rewardLetter` is the letter
 * of the answer that sits in the crossword's vertical keyword column.
 *
 * CROSSWORD CONTRACT: each answer must contain its `rewardLetter` exactly
 * (diacritics included) — its horizontal row crosses the vertical keyword column
 * at that letter. If the answer has the letter more than once, CrosswordBoard
 * picks which occurrence to use so the grid stays as narrow as possible.
 * Answers are matched without regard to case, spacing or Vietnamese accents
 * (see comparisonKey in gameService.ts). Add `alternativeAnswers` for genuine
 * variants; keep `rewardLetter` lined up with FINAL_KEYWORD (both are checked at load time below).
 */
export const QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'Theo nội dung bài học, chủ thể làm chủ đất nước và là nơi quyền lực thuộc về là ai?',
    answer: 'NHÂN DÂN',
    rewardLetter: 'N',
  },
  {
    id: 2,
    question: 'Nhà nước và các tổ chức hoạt động dựa trên cơ sở của văn bản nào cùng với pháp luật?',
    answer: 'HIẾN PHÁP',
    rewardLetter: 'H',
  },
  {
    id: 3,
    question: 'Khái niệm nào vừa là mục tiêu, bản chất, vừa là động lực của chế độ XHCN?',
    answer: 'DÂN CHỦ',
    rewardLetter: 'Â',
  },
  {
    id: 4,
    question: 'Thiết chế nào quản lý xã hội bằng pháp luật và phục vụ nhân dân?',
    answer: 'NHÀ NƯỚC',
    rewardLetter: 'N',
  },
  {
    id: 5,
    question: 'Hình thức dân chủ trong đó người dân trực tiếp được thông tin, bàn bạc, kiểm tra và giám sát là gì?',
    answer: 'DÂN CHỦ TRỰC TIẾP',
    rewardLetter: 'D',
  },
  {
    id: 6,
    question: 'Điền từ còn thiếu:\n"Quyền lực nhà nước là thống nhất, có sự ___, phối hợp và kiểm soát."',
    answer: 'PHÂN CÔNG',
    rewardLetter: 'Â',
  },
  {
    id: 7,
    question: 'Theo giáo trình, Nhà nước pháp quyền XHCN Việt Nam mang bản chất của giai cấp nào?',
    answer: 'CÔNG NHÂN',
    rewardLetter: 'N',
  },
  {
    id: 8,
    question: 'Nhà nước quản lý xã hội bằng công cụ nào?',
    answer: 'PHÁP LUẬT',
    rewardLetter: 'L',
  },
  {
    id: 9,
    question: 'Hoàn thành nội dung:\n"Một đặc trưng của CNXH Việt Nam là do nhân dân ___."',
    answer: 'LÀM CHỦ',
    rewardLetter: 'À',
  },
  {
    id: 10,
    question: 'Dân chủ được xác định là ___ của chế độ XHCN, hướng tới "dân giàu, nước mạnh, dân chủ, công bằng, văn minh".',
    answer: 'MỤC TIÊU',
    rewardLetter: 'M',
  },
  {
    id: 11,
    question: 'Điền từ còn thiếu:\n"Dân giàu, nước mạnh, dân chủ, ___, văn minh."',
    answer: 'CÔNG BẰNG',
    rewardLetter: 'C',
  },
  {
    id: 12,
    question: 'Theo tài liệu, thiết chế thực hiện dân chủ thông qua Nhà nước và cả ___?',
    answer: 'HỆ THỐNG CHÍNH TRỊ',
    rewardLetter: 'H',
  },
  {
    id: 13,
    question: 'Nhà nước pháp quyền XHCN tôn trọng quyền con người và coi con người là ___, là trung tâm của sự phát triển.',
    answer: 'CHỦ THỂ',
    rewardLetter: 'Ủ',
  },
]

// Loud at load time rather than silently wrong at play time: every question
// must award exactly the keyword letter in its own position, and its answer
// must contain that exact letter (diacritics included) — the answer's row
// crosses the crossword's vertical keyword column at that letter.
const misaligned = QUESTIONS.filter((question, index) => question.rewardLetter !== KEYWORD_LETTERS[index])
if (QUESTIONS.length !== KEYWORD_LETTERS.length || misaligned.length > 0) {
  console.error(
    `[final-game] QUESTIONS must have ${KEYWORD_LETTERS.length} entries whose rewardLetter matches FINAL_KEYWORD in order` +
      ` (got ${QUESTIONS.length} entries, ${misaligned.length} misaligned: ${misaligned.map((q) => q.id).join(', ')}).`,
  )
}
const notCrossing = QUESTIONS.filter((question) => !question.answer.normalize('NFC').toLocaleUpperCase('vi-VN').includes(question.rewardLetter))
if (notCrossing.length > 0) {
  console.error(`[final-game] These answers do not contain their keyword letter, so their crossword row cannot cross the keyword column: ${notCrossing.map((q) => q.id).join(', ')}.`)
}
