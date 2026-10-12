import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { ref } from 'vue'
import { supportSpecies, sourcedStatements } from '../src/data/support/model.js'
import { WALL_KEY, WALL_LIMIT, addWallEntry, normalizeAlias, readWall, validAlias, wallEntries, writeWall } from '../src/data/support/wall.js'
import { useSupportWall } from '../src/composables/useSupportWall.js'

const catalog = JSON.parse(await readFile(new URL('../public/data/species.json', import.meta.url), 'utf8'))
const ids = catalog.map(species => species.id)
const date = '2026-10-13T06:00:00.000Z'
function memoryStorage() {
  const values = new Map()
  return { values, getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) }
}
const entry = (id = 'demo-1', alias = 'Друг гор', speciesId = 'irbis') => ({ id, alias, speciesId, createdAt: date })
const add = (entries, value = {}) => addWallEntry(entries, { alias: 'Друг гор', speciesId: 'irbis', acknowledged: true, ...value }, ids, { makeId: () => 'demo-new', now: () => date })
const put = (storage, entries, version = 1) => storage.setItem(WALL_KEY, JSON.stringify({ version, entries }))
const wall = storage => { let id = 0; return useSupportWall(ref(catalog), { storage, makeId: () => `demo-${++id}`, now: () => date }) }

test('support selects the exact catalog record and never substitutes a species for an unknown ID', () => {
  for (const species of catalog) assert.equal(supportSpecies(catalog, species.id), species)
  assert.equal(supportSpecies(catalog, null), null); assert.equal(supportSpecies(catalog, 'amur-tiger'), null)
  assert.equal(supportSpecies([], 'irbis'), null)
})

test('all support facts are unchanged catalog excerpts with existing supporting references', () => {
  for (const species of catalog) for (const field of ['threats', 'conservationMeasures']) {
    assert.deepEqual(sourcedStatements(species, field), species[field])
    assert.equal(species.verified, false)
  }
})

test('missing facts and dangling/unrelated sources are omitted without invented replacements', () => {
  const species = structuredClone(catalog[0])
  species.threats = [null, { text: { ru: 'Без источника' }, sourceIds: [] }, { text: { ru: 'Неверная ссылка' }, sourceIds: ['missing'] }, { text: { ru: 'Другой источник' }, sourceIds: ['unrelated'] }]
  species.sources.push({ id: 'unrelated', supports: ['iucn'] })
  assert.deepEqual(sourcedStatements(species, 'threats'), [])
  assert.deepEqual(sourcedStatements(null, 'threats'), [])
  assert.deepEqual(sourcedStatements({ threats: {} }, 'threats'), [])
  assert.deepEqual(sourcedStatements(species, 'population'), [])
})

test('first visit has an honest empty wall and no prefilled supporters', () => {
  const storage = memoryStorage()
  assert.deepEqual(readWall(storage, ids), { entries: [], available: true, hasSavedData: false, notice: '' })
  assert.equal(wall(storage).entries.value.length, 0); assert.equal(storage.values.size, 0)
})

test('pseudonyms normalize spacing and Unicode while supporting Kyrgyz, Russian and Latin letters', () => {
  assert.equal(normalizeAlias('  Дос   куш  '), 'Дос куш')
  for (const alias of ['Көл-досу', 'Друг гор', 'Токой_42', 'Nature Friend', 'E\u0301cho']) assert.equal(validAlias(normalizeAlias(alias)), true)
  assert.equal(normalizeAlias(null), '')
  const result = add([], { alias: '  Дос   куш  ' })
  assert.equal(result.entries[0].alias, 'Дос куш')
})

test('invalid/oversized pseudonyms, contact-like strings, HTML and invisible controls are rejected', () => {
  for (const alias of ['', 'А', 'a'.repeat(33), '<script>alert(1)</script>', 'name@example.com', 'https://example.com', 'Друг 996555123456', '1234', 'Друг\u202eгор', 'Друг\nгор']) {
    assert.equal(validAlias(alias), false, alias)
    assert.ok(add([], { alias }).error, alias)
  }
})

test('a local acknowledgement and an existing species ID are required; general entries are allowed', () => {
  assert.ok(add([], { acknowledged: false }).error)
  assert.ok(add([], { speciesId: 'foreign-example' }).error)
  assert.equal(add([], { speciesId: null }).entries[0].speciesId, null)
  assert.deepEqual(Object.keys(add([]).entries[0]), ['id', 'alias', 'speciesId', 'createdAt'])
})

test('duplicates are prevented within a context but identical aliases in different contexts are independent', () => {
  const existing = [entry()]
  assert.match(add(existing, { alias: 'друг ГОР' }).error, /уже есть/)
  assert.equal(add(existing, { speciesId: 'manul' }).entries.length, 2)
  assert.equal(add(existing, { speciesId: null }).entries.length, 2)
  assert.deepEqual(existing, [entry()])
})

test('IDs must be unique and valid; invalid generated IDs/dates never persist', () => {
  const existing = [entry('demo-new')]
  assert.ok(add(existing, { alias: 'Друг леса' }).error)
  assert.ok(addWallEntry([], { alias: 'Друг леса', acknowledged: true }, ids, { makeId: () => '<id>', now: () => date }).error)
  assert.ok(addWallEntry([], { alias: 'Друг леса', acknowledged: true }, ids, { makeId: () => 'new-id', now: () => 'invalid' }).error)
})

test('wall limit rejects new entries without discarding existing names', () => {
  const entries = Array.from({ length: WALL_LIMIT }, (_, n) => entry(`id-${n}`, `Дос-${n}`))
  assert.match(add(entries).error, /не больше 50/)
  assert.equal(entries.length, WALL_LIMIT)
})

test('general wall combines contexts; species walls strictly isolate their own records', () => {
  const entries = [entry(), entry('demo-2', 'Друг леса', 'manul'), entry('demo-3', 'Дос', null)]
  assert.deepEqual(wallEntries(entries), entries)
  assert.deepEqual(wallEntries(entries, 'irbis', 'species'), [entries[0]])
  assert.deepEqual(wallEntries(entries, 'manul', 'species'), [entries[1]])
  assert.deepEqual(wallEntries(entries, null, 'species'), [])
  assert.deepEqual(wallEntries(entries, 'missing', 'species'), [])
})

test('successful additions survive a fresh controller/browser reload', () => {
  const storage = memoryStorage(), first = wall(storage)
  assert.equal(first.add({ alias: 'Друг гор', speciesId: 'irbis', acknowledged: true }), true)
  assert.deepEqual(wall(storage).entries.value, [entry()])
  assert.match(first.message.value, /Пожертвование не совершено/)
})

test('deletion removes only the chosen entry and persists after reload', () => {
  const storage = memoryStorage(); put(storage, [entry(), entry('demo-2', 'Друг леса', 'manul')])
  const controller = wall(storage)
  assert.equal(controller.remove('demo-1'), true)
  assert.deepEqual(readWall(storage, ids).entries, [entry('demo-2', 'Друг леса', 'manul')])
  assert.equal(controller.remove('missing'), false)
  assert.equal(controller.remove('demo-2'), true); assert.equal(storage.getItem(WALL_KEY), null)
})

test('clearing removes the demo key while preserving quiz results and unrelated browser data', () => {
  const storage = memoryStorage(); put(storage, [entry()]); storage.setItem('redbook.quiz.results.v1', 'quiz-history')
  const controller = wall(storage)
  assert.equal(controller.clear(), true); assert.equal(controller.hasSavedData.value, false)
  assert.equal(storage.getItem(WALL_KEY), null); assert.equal(storage.getItem('redbook.quiz.results.v1'), 'quiz-history')
  assert.deepEqual(wall(storage).entries.value, [])
})

test('malformed/unknown/oversized storage can be safely cleared rather than crashing', () => {
  for (const raw of ['{broken', 'null', '{"version":9,"entries":[]}', 'x'.repeat(40001)]) {
    const storage = memoryStorage(); storage.setItem(WALL_KEY, raw)
    const controller = wall(storage)
    assert.equal(controller.available.value, true); assert.equal(controller.hasSavedData.value, true)
    assert.equal(controller.entries.value.length, 0); assert.ok(controller.notice.value)
    assert.equal(controller.clear(), true); assert.equal(storage.getItem(WALL_KEY), null)
  }
})

test('stored HTML, fabricated amounts, unknown species, duplicate IDs/aliases and malformed dates are filtered', () => {
  const storage = memoryStorage(); put(storage, [entry(), null, entry('demo-2', '<img src=x onerror=alert(1)>'),
    { ...entry('demo-3', 'Друг'), amount: 10000 }, entry('demo-4', 'Дос', 'foreign'), entry('demo-1', 'Дос'), entry('demo-5', 'ДРУГ ГОР'), { ...entry('demo-6', 'Лес'), createdAt: '2026-02-31T06:00:00.000Z' }])
  const read = readWall(storage, ids)
  assert.deepEqual(read.entries, [entry()]); assert.ok(read.notice)
})

test('restored storage is bounded by the demo limit', () => {
  const storage = memoryStorage(); put(storage, Array.from({ length: 60 }, (_, n) => entry(`id-${n}`, `Друг-${n}`)))
  assert.equal(readWall(storage, ids).entries.length, WALL_LIMIT)
})

test('unavailable storage does not pretend to add a persisted supporter', () => {
  for (const storage of [null, { getItem() { throw new Error('SecurityError') } }]) {
    const controller = wall(storage)
    assert.equal(controller.available.value, false)
    assert.equal(controller.add({ alias: 'Дос', acknowledged: true }), false)
    assert.equal(controller.entries.value.length, 0)
  }
})

test('quota errors leave the persistent and visible list unchanged', () => {
  const storage = memoryStorage(); put(storage, [entry('existing-id')])
  storage.setItem = () => { throw new Error('QuotaExceededError') }
  const controller = wall(storage)
  assert.equal(controller.add({ alias: 'Друг леса', acknowledged: true }), false)
  assert.deepEqual(controller.entries.value, [entry('existing-id')]); assert.deepEqual(readWall(storage, ids).entries, [entry('existing-id')])
  assert.match(controller.message.value, /не изменён/)
})

test('failed deletion and clearing never claim success or hide persisted aliases', () => {
  const storage = memoryStorage(); put(storage, [entry(), entry('demo-2', 'Дос')])
  const before = storage.getItem(WALL_KEY), controller = wall(storage)
  storage.setItem = storage.removeItem = () => { throw new Error('SecurityError') }
  assert.equal(controller.remove('demo-1'), false); assert.equal(controller.clear(), false)
  assert.equal(storage.getItem(WALL_KEY), before); assert.equal(controller.entries.value.length, 2)
  assert.match(controller.message.value, /не удалось/i)
})

test('mutations refresh storage to retain writes from another tab and refresh handles external clearing', () => {
  const storage = memoryStorage(), controller = wall(storage)
  put(storage, [entry('external-id', 'Дос', 'manul')])
  assert.equal(controller.add({ alias: 'Друг гор', speciesId: 'irbis', acknowledged: true }), true)
  assert.equal(readWall(storage, ids).entries.length, 2)
  storage.removeItem(WALL_KEY); controller.refresh()
  assert.deepEqual(controller.entries.value, []); assert.equal(controller.hasSavedData.value, false)
})

test('storage write helper never reaches unrelated namespaces', () => {
  const storage = memoryStorage(); storage.setItem('another-key', 'keep')
  assert.equal(writeWall(storage, [entry()]), true)
  assert.equal(writeWall(storage, []), true)
  assert.equal(storage.getItem('another-key'), 'keep'); assert.equal(writeWall(null, []), false)
})
