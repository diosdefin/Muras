import { DIFFICULTIES, QUESTION_LIMIT } from './model.js'

export const HISTORY_KEY = 'redbook.quiz.results.v1'
export const HISTORY_LIMIT = 20

function validResult(value) {
  return value && DIFFICULTIES.some(level => level.id === value.difficulty) &&
    ['standard', 'mistakes'].includes(value.mode) && Number.isInteger(value.total) && value.total >= 1 && value.total <= QUESTION_LIMIT &&
    Number.isInteger(value.correct) && value.correct >= 0 && value.correct <= value.total &&
    Number.isInteger(value.skipped) && value.skipped >= 0 && value.skipped <= value.total - value.correct &&
    value.percent === Math.round(value.correct / value.total * 100) && typeof value.completedAt === 'string' &&
    /^\d{4}-\d{2}-\d{2}T/.test(value.completedAt) && !Number.isNaN(Date.parse(value.completedAt))
}

export function readHistory(storage) {
  if (!storage) return { results: [], available: false }
  try {
    const raw = storage.getItem(HISTORY_KEY)
    if (raw === null) return { results: [], available: true }
    const document = JSON.parse(raw)
    return { results: document?.version === 1 && Array.isArray(document.results)
      ? document.results.filter(validResult).slice(-HISTORY_LIMIT) : [], available: true }
  } catch { return { results: [], available: false } }
}

export function appendHistory(results, result, storage) {
  const updated = [...results.filter(validResult), result].filter(validResult).slice(-HISTORY_LIMIT)
  try {
    if (!storage) return { results: updated, available: false }
    storage.setItem(HISTORY_KEY, JSON.stringify({ version: 1, results: updated }))
    return { results: updated, available: true }
  } catch { return { results: updated, available: false } }
}

// Answered question ids (this browser only), so new sessions start with unseen questions.
export const SEEN_KEY = 'redbook.quiz.seen.v1'
export const SEEN_LIMIT = 1000

export function readSeen(storage) {
  try {
    const document = JSON.parse(storage?.getItem(SEEN_KEY) || 'null')
    return new Set(document?.version === 1 && Array.isArray(document.ids) ? document.ids.filter(id => typeof id === 'string').slice(-SEEN_LIMIT) : [])
  } catch { return new Set() }
}

export function rememberSeen(seen, id, storage) {
  const updated = new Set([...seen].filter(item => item !== id))
  updated.add(id)
  const ids = [...updated].slice(-SEEN_LIMIT)
  try { storage?.setItem(SEEN_KEY, JSON.stringify({ version: 1, ids })) } catch { /* private mode: keep in memory */ }
  return new Set(ids)
}
