import { tr } from '../locales/index.js'
// Transport-independent scientific model; an API can supply the same object later.
export const UNKNOWN_POPULATION = Object.freeze({ type: 'unknown', value: null, min: null, max: null,
  territory: null, year: null, unit: null, sourceIds: Object.freeze([]), reviewStatus: 'pending', method: null })
export const UNKNOWN_LABEL = 'Нет подтверждённой оценки численности'
const fields = Object.keys(UNKNOWN_POPULATION)
const text = value => typeof value === 'string' && Boolean(value.trim())
const nonnegative = value => typeof value === 'number' && Number.isFinite(value) && value >= 0

export function validatePopulation(population, sources = [], path = 'population') {
  const errors = [], fail = (field, message) => errors.push(`${path}${field ? `.${field}` : ''}: ${message}`)
  if (!population || typeof population !== 'object' || Array.isArray(population)) return [`${path}: ожидается объект численности`]
  const p = population
  for (const field of fields) if (!(field in p)) fail(field, 'обязательное поле отсутствует')
  for (const field of Object.keys(p)) if (!fields.includes(field)) fail(field, 'неизвестное поле')
  if (!['exact', 'approximate', 'unknown'].includes(p.type)) fail('type', 'используйте exact, approximate или unknown')
  if (!['pending', 'approved', 'rejected'].includes(p.reviewStatus)) fail('reviewStatus', 'используйте pending, approved или rejected')
  for (const field of ['territory', 'unit']) if (p[field] !== null && !text(p[field])) fail(field, 'ожидается строка или null')
  if (p.year !== null && (!Number.isInteger(p.year) || p.year < 1500 || p.year > new Date().getFullYear())) fail('year', 'ожидается прошедший/текущий год или null')
  const refs = Array.isArray(p.sourceIds) ? p.sourceIds : []
  const sourceMap = new Map((Array.isArray(sources) ? sources : []).filter(s => s && typeof s === 'object').map(s => [s.id, s]))
  if (!Array.isArray(p.sourceIds) || new Set(refs).size !== refs.length || refs.some(id => !sourceMap.has(id))) fail('sourceIds', 'неизвестная, повторяющаяся или некорректная ссылка на источник')
  if (p.type === 'unknown') {
    if (['value', 'min', 'max'].some(field => p[field] !== null)) fail('', 'unknown не должен содержать числа: value/min/max должны быть null')
    if (p.method !== null) fail('method', 'unknown требует null')
    for (const field of ['territory', 'year', 'unit']) {
      if (p[field] != null && !refs.some(id => Array.isArray(sourceMap.get(id)?.supports) && sourceMap.get(id).supports.includes(`population.${field}`))) fail(field, 'нет выбранного источника, подтверждающего это поле (sources.supports)')
    }
    return errors
  }
  if (p.type === 'exact') {
    if (!Number.isSafeInteger(p.value) || p.value <= 0) fail('value', 'exact требует положительного безопасного целого числа')
    if (p.min !== null || p.max !== null) fail('', 'exact хранит value; min/max должны быть null')
    if (p.method !== 'complete-count') fail('method', 'exact требует документированный полный подсчёт (complete-count), не оценку')
  } else if (p.type === 'approximate') {
    const single = nonnegative(p.value) && p.min === null && p.max === null
    const range = p.value === null && nonnegative(p.min) && nonnegative(p.max) && p.min <= p.max
    if (!single && !range) fail('', 'approximate требует неотрицательное value или корректный диапазон min ≤ max, не оба')
    if (p.method !== 'estimate') fail('method', 'approximate требует estimate')
  }
  if (!text(p.territory) || p.year === null || p.year === undefined || !text(p.unit)) fail('', 'оценка требует территорию, год и единицу учёта')
  if (!refs.length) fail('sourceIds', 'утверждение требует источник')
  // Every populated scientific field must be supported by a selected source.
  for (const field of ['type', 'method', 'value', 'min', 'max', 'territory', 'year', 'unit']) {
    if (p[field] == null) continue
    if (!refs.some(id => Array.isArray(sourceMap.get(id)?.supports) && sourceMap.get(id).supports.includes(`population.${field}`))) fail(field, 'нет выбранного источника, подтверждающего это поле (sources.supports)')
  }
  return errors
}

// Pending/rejected or malformed claims never become published population facts.
export function populationPresentation(population, sources = [], language = 'ru') {
  const published = population?.type !== 'unknown' && population?.reviewStatus === 'approved' && !validatePopulation(population, sources).length
  const p = published ? population : UNKNOWN_POPULATION
  const number = new Intl.NumberFormat(language, { maximumFractionDigits: 10 })
  const label = p.type === 'unknown' ? tr(language, 'population.unknown') : `${p.type === 'approximate' && p.value !== null ? '≈ ' : ''}${p.value !== null ? number.format(p.value) : `${number.format(p.min)}–${number.format(p.max)}`} ${p.unit}`
  return { ...p, label, needsReview: population?.type && population.type !== 'unknown' && !published,
    sources: published ? sources.filter(source => p.sourceIds.includes(source.id)) : [],
    accuracy: tr(language, p.type === 'unknown' ? 'population.noEstimate' : `population.${p.type}`) }
}

// Only exact, approved counts get individual cells. Remainders are labelled explicitly.
export function populationCells(presentation) {
  if (presentation.type !== 'exact' || presentation.reviewStatus !== 'approved' || !Number.isSafeInteger(presentation.value) || presentation.value <= 0) return { cells: [], scale: null }
  const scale = presentation.value <= 100 ? 1 : Math.ceil(presentation.value / 100)
  const cells = Array.from({ length: Math.ceil(presentation.value / scale) }, (_, index) => Math.min(scale, presentation.value - index * scale))
  return { cells, scale }
}
