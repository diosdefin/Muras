import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { UNKNOWN_POPULATION, UNKNOWN_LABEL, populationCells, populationPresentation, validatePopulation } from '../src/data/population.js'
import { validateSource } from '../src/data/species-model.js'

const source = { id: 'test-only', title: 'Synthetic fixture, not scientific evidence', publisher: 'Tests', url: 'https://example.org/test-only', accessedAt: '2026-10-13',
  supports: ['type', 'method', 'value', 'min', 'max', 'territory', 'year', 'unit'].map(field => `population.${field}`) }
const fixture = (changes = {}) => ({ ...UNKNOWN_POPULATION, type: 'exact', value: 17, territory: 'Synthetic territory — not Kyrgyzstan', year: 2020, unit: 'особей', sourceIds: [source.id], reviewStatus: 'approved', method: 'complete-count', ...changes })
const view = p => populationPresentation(p, [source])
test('all public records and archive remain unknown; no automatic estimates or verification', async () => {
  const data = JSON.parse(await readFile(new URL('../data/species.source.json', import.meta.url), 'utf8'))
  assert.deepEqual(validateSource(data), [])
  for (const species of [...data.catalog, ...data.demoArchive]) {
    assert.equal(species.population.type, 'unknown'); assert.equal(species.population.value, null)
    assert.equal(species.population.min, null); assert.equal(species.population.max, null); assert.equal(species.verified, false)
  }
})
test('exact odd counts yield precisely 3 and 17 individual cells with no invented rounding', () => {
  for (const value of [3, 17, 99, 100]) {
    const p = fixture({ value }); assert.deepEqual(validatePopulation(p, [source]), [])
    const marks = populationCells(view(p)); assert.equal(marks.cells.length, value); assert.equal(marks.scale, 1)
    assert.equal(marks.cells.reduce((sum, n) => sum + n, 0), value)
  }
})
test('large exact counts aggregate to at most 100 cells with an explicit remainder and scale', () => {
  for (const value of [101, 10001, 1000001, Number.MAX_SAFE_INTEGER]) {
    const marks = populationCells(view(fixture({ value })))
    assert.ok(marks.cells.length <= 100); assert.ok(marks.scale > 1)
    assert.equal(marks.cells.reduce((sum, n) => sum + n, 0), value)
    assert.ok(marks.cells.at(-1) <= marks.scale)
  }
})
test('an integer estimate remains approximate, labelled ≈ and never counted as individual cells', () => {
  const p = fixture({ type: 'approximate', value: 17, method: 'estimate' })
  assert.deepEqual(validatePopulation(p, [source]), []); assert.equal(view(p).label, '≈ 17 особей')
  assert.deepEqual(populationCells(view(p)).cells, [])
})
test('approximate range keeps both bounds, no fictional midpoint, and separate territory/year/unit/source', () => {
  const p = fixture({ type: 'approximate', value: null, min: 12, max: 20, method: 'estimate' })
  assert.deepEqual(validatePopulation(p, [source]), []); assert.equal(view(p).label, '12–20 особей')
  assert.equal(view(p).territory, p.territory); assert.equal(view(p).year, 2020); assert.deepEqual(view(p).sources, [source])
  assert.deepEqual(populationCells(view(p)).cells, [])
})
test('an explicitly sourced zero estimate or zero lower bound is not substituted for unknown', () => {
  const single = fixture({ type: 'approximate', value: 0, method: 'estimate' })
  const range = fixture({ type: 'approximate', value: null, min: 0, max: 5, method: 'estimate' })
  assert.deepEqual(validatePopulation(single, [source]), []); assert.equal(view(single).label, '≈ 0 особей')
  assert.deepEqual(validatePopulation(range, [source]), []); assert.equal(view(range).label, '0–5 особей')
  assert.equal(view(UNKNOWN_POPULATION).value, null)
})
test('null, missing, unknown and legacy missing estimates render neutral unknowns, never zero or extinction', () => {
  for (const p of [null, undefined, {}, UNKNOWN_POPULATION, { estimate: null }]) {
    assert.equal(view(p).type, 'unknown'); assert.equal(view(p).value, null); assert.equal(view(p).label, UNKNOWN_LABEL)
  }
})
test('pending and rejected known data stay unpublished without changing the stored scientific claim', () => {
  for (const reviewStatus of ['pending', 'rejected']) {
    const p = fixture({ reviewStatus }), before = JSON.stringify(p)
    assert.deepEqual(validatePopulation(p, [source]), []); assert.equal(view(p).type, 'unknown'); assert.equal(view(p).needsReview, true)
    assert.equal(JSON.stringify(p), before); assert.deepEqual(populationCells(view(p)).cells, [])
  }
})
test('exact rejects zero, negative, fractional, unsafe, string, null, infinity and range values', () => {
  for (const value of [0, -3, 3.5, Number.MAX_SAFE_INTEGER + 1, '3', null, Infinity, NaN]) assert.ok(validatePopulation(fixture({ value }), [source]).length)
  assert.ok(validatePopulation(fixture({ min: 3, max: 3 }), [source]).length)
})
test('a whole number is insufficient evidence for exact without a documented complete count', () => {
  for (const method of [null, 'estimate', 'AI', undefined]) assert.match(validatePopulation(fixture({ method }), [source]).join('\n'), /полный подсчёт/)
})
test('approximate rejects contradictory, missing, reversed, negative or non-finite bounds', () => {
  for (const changes of [{ value: null }, { value: 17, min: 12, max: 20 }, { value: null, min: 20, max: 12 }, { value: null, min: -1, max: 3 }, { value: Infinity }, { value: '17' }]) {
    assert.ok(validatePopulation(fixture({ type: 'approximate', method: 'estimate', ...changes }), [source]).length)
  }
})
test('unknown cannot contain any number, including zero or leftover ranges', () => {
  for (const field of ['value', 'min', 'max']) assert.match(validatePopulation({ ...UNKNOWN_POPULATION, [field]: 0 }).join('\n'), /unknown не должен содержать числа/)
})
test('known scientific data require valid year, territory, unit, references and supporting fact paths', () => {
  for (const changes of [{ year: null }, { year: 0 }, { year: 2200 }, { year: '2020' }, { territory: null }, { territory: ' ' }, { unit: null }, { sourceIds: [] }, { sourceIds: ['missing'] }, { sourceIds: [source.id, source.id] }]) assert.ok(validatePopulation(fixture(changes), [source]).length)
  assert.ok(validatePopulation(fixture(), [{ ...source, supports: ['habitat'] }]).length)
  assert.doesNotThrow(() => validatePopulation(fixture(), [{ ...source, supports: {} }]))
})
test('required and unknown model fields are checked, invalid claims fail closed in presentation', () => {
  for (const field of Object.keys(UNKNOWN_POPULATION)) { const p = fixture(); delete p[field]; assert.ok(validatePopulation(p, [source]).length) }
  for (const p of [fixture({ type: 'range' }), fixture({ reviewStatus: 'AI-approved' }), fixture({ estimate: 17 }), fixture({ value: -1 })]) {
    assert.ok(validatePopulation(p, [source]).length); assert.equal(view(p).type, 'unknown')
  }
})
