import { DIFFICULTIES, QUESTION_LIMIT } from './model.js'

// Immutable session operations are independent of Vue and browser storage.
export function shuffle(items, random = Math.random) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function createAttempt(bank, difficulty, { random = Math.random, questionIds = null } = {}) {
  if (!DIFFICULTIES.some(level => level.id === difficulty)) throw new Error('Неизвестный уровень викторины')
  const pool = [...new Map(bank.filter(q => q.difficulty === difficulty && (!questionIds || questionIds.includes(q.id)))
    .map(q => [q.id, q])).values()]
  if (!pool.length) throw new Error('Для этого уровня пока нет подходящих вопросов')
  const questions = shuffle(pool, random).slice(0, QUESTION_LIMIT).map(q => ({ ...q, options: shuffle(q.options, random) }))
  return { difficulty, mode: questionIds ? 'mistakes' : 'standard', questions, index: 0, answers: {}, completedAt: null }
}

export function recordAnswer(attempt, questionId, answerId) {
  const current = attempt?.questions[attempt.index]
  if (!current || attempt.completedAt || current.id !== questionId || attempt.answers[current.id]) return attempt
  if (answerId !== null && !current.options.some(option => option.id === answerId)) return attempt
  return { ...attempt, answers: { ...attempt.answers, [current.id]: {
    answerId, correct: answerId === current.correctAnswerId, skipped: answerId === null,
  } } }
}

export function nextQuestion(attempt, now = () => new Date().toISOString()) {
  if (!attempt || attempt.completedAt || !attempt.answers[attempt.questions[attempt.index].id]) return attempt
  return attempt.index === attempt.questions.length - 1
    ? { ...attempt, completedAt: now() }
    : { ...attempt, index: attempt.index + 1 }
}

export function mistakeQuestions(attempt) {
  return attempt?.questions.filter(q => attempt.answers[q.id] && !attempt.answers[q.id].correct) || []
}

export function attemptResult(attempt) {
  if (!attempt?.completedAt) return null
  const total = attempt.questions.length
  const correct = Object.values(attempt.answers).filter(answer => answer.correct).length
  const skipped = Object.values(attempt.answers).filter(answer => answer.skipped).length
  return { difficulty: attempt.difficulty, mode: attempt.mode, total, correct, skipped,
    percent: Math.round(correct / total * 100), completedAt: attempt.completedAt }
}
