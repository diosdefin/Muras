import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir, mkdtemp, cp, rm } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { createRenderer, defineComponent, h, createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createServer } from 'vite'
import { GROUPS, LEGACY_GROUPS, availableGroups, editableGroups, isSpeciesGroup } from '../src/data/species-groups.js'
import { groupLabel } from '../src/data/presentation.js'
import { validateSpecies, validateSource, canPublishImage } from '../src/data/species-model.js'
import { GROUPS as ADMIN_GROUPS, emptySpecies, importSource, exportSource } from '../src/admin/data/model.js'
import { createDraftRepository } from '../src/admin/data/repository.js'
import { useAdminEditor } from '../src/admin/useAdminEditor.js'
import { catalogOptions, matchesCatalogFilters } from '../src/data/catalog-search.js'
import { regionalEntries, validateRegionalEvidence } from '../src/data/geography/model.js'
import { validateQuestions } from '../src/data/quiz/model.js'
import { generateAllData, PROJECT_ROOT } from '../scripts/build-data.mjs'

const read = async file => JSON.parse(await readFile(join(PROJECT_ROOT, file), 'utf8'))
const source = await read('data/species.source.json')
const published = await read('public/data/species.json')
const questions = await read('src/data/quiz/questions.json')
const evidence = await read('data/geography/occurrences.source.json')
const ids = ['mammals', 'birds', 'plants', 'fish', 'reptiles', 'amphibians', 'arthropods', 'fungi']

// Technical fixtures only: no real species, photographs, populations or scientific claims.
function fixture(group) {
  const record = emptySpecies(`test-only-${group}`)
  record.group = group
  record.sources = [{ id: 'test-only', title: 'Synthetic validation fixture, not research',
    publisher: 'Tests', url: 'https://example.org/test-only', accessedAt: '2020-01-01', supports: ['group'] }]
  return record
}
function exportableFixture(group) {
  const record = fixture(group)
  record.scientificName = 'Synthetic test-only record'
  record.names.ru = 'Synthetic test-only record'
  record.regions = [{ code: 'KG', type: 'country', names: { ru: 'Synthetic test territory', ky: null, en: null }, sourceIds: ['test-only'] }]
  record.sources[0].supports.push('scientificName', 'names.ru', 'regions.0')
  return record
}

test('one immutable registry provides eight selectable IDs and preserves the broader legacy ID', () => {
  assert.deepEqual(GROUPS, ids)
  assert.equal(ADMIN_GROUPS, GROUPS)
  assert.equal(new Set(GROUPS).size, 8)
  assert.ok(Object.isFrozen(GROUPS))
  assert.deepEqual(LEGACY_GROUPS, ['invertebrates'])
  assert.deepEqual(editableGroups(), ids)
  assert.deepEqual(editableGroups([{ group: 'invertebrates' }]), [...ids, 'invertebrates'])
  for (const group of [...ids, ...LEGACY_GROUPS]) assert.equal(isSpeciesGroup(group), true)
  for (const group of ['unknown', 'Mammals', 'insects', '__proto__', undefined, null]) assert.equal(isSpeciesGroup(group), false)
})

test('all group labels are localized in KY/RU/EN, including distinct arthropods and legacy invertebrates', () => {
  const labels = {
    mammals: ['Сүт эмүүчүлөр', 'Млекопитающие', 'Mammals'],
    birds: ['Канаттуулар', 'Птицы', 'Birds'], plants: ['Өсүмдүктөр', 'Растения', 'Plants'],
    fish: ['Балыктар', 'Рыбы', 'Fish'], reptiles: ['Сойлоп жүрүүчүлөр', 'Пресмыкающиеся', 'Reptiles'],
    amphibians: ['Жерде-сууда жашоочулар', 'Земноводные', 'Amphibians'],
    arthropods: ['Муунак буттуулар', 'Членистоногие', 'Arthropods'],
    fungi: ['Козу карындар', 'Грибы', 'Fungi'], invertebrates: ['Омурткасыздар', 'Беспозвоночные', 'Invertebrates'],
  }
  for (const [group, expected] of Object.entries(labels)) {
    assert.deepEqual(['ky', 'ru', 'en'].map(language => groupLabel({ group }, language)), expected)
  }
  for (const language of ['ky', 'ru', 'en']) {
    assert.equal(groupLabel({ group: '__proto__' }, language), groupLabel({ group: null }, language))
  }
})

test('validator accepts eight sourced groups and legacy IDs, rejects unknown IDs and still requires evidence', () => {
  for (const group of [...ids, ...LEGACY_GROUPS]) {
    const record = fixture(group)
    assert.deepEqual(validateSpecies([record]), [])
    record.sources = []
    assert.match(validateSpecies([record]).join('\n'), /group: нет источника/)
  }
  for (const group of ['insects', 'FISH', '', '__proto__', undefined]) {
    assert.match(validateSpecies([{ ...fixture('fish'), group }]).join('\n'), /group: неизвестная группа/)
  }
  assert.deepEqual(validateSpecies([emptySpecies('test-only-unknown')]), [])
})

test('catalog filters include only present groups, expand without empty cards and keep legacy IDs distinct', () => {
  assert.deepEqual(availableGroups(published), ids)
  assert.deepEqual(catalogOptions(published).groups.map(option => option.value), ['ALL', ...ids])
  assert.deepEqual(catalogOptions([]).groups.map(option => option.value), ['ALL'])
  const records = [...ids, 'invertebrates'].map(fixture)
  assert.deepEqual(availableGroups([...records, ...records]), [...ids, 'invertebrates'])
  assert.deepEqual(catalogOptions(records).groups.map(option => option.value), ['ALL', ...ids, 'invertebrates'])
  for (const group of [...ids, 'invertebrates']) {
    assert.deepEqual(records.filter(record => matchesCatalogFilters(record, { group })).map(record => record.group), [group])
  }
})

test('real admin add/update/save restores a draft in each group without publishing it or mutating existing species', async () => {
  const values = new Map()
  const repository = createDraftRepository({ getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) })
  const node = type => ({ type, children: [] })
  const renderer = createRenderer({ createElement: node, createText: node, createComment: node, insert: (c, p) => p.children.push(c),
    remove() {}, setText() {}, setElementText() {}, patchProp() {}, parentNode: () => null, nextSibling: () => null })
  const oldWindow = globalThis.window
  globalThis.window = { addEventListener() {}, removeEventListener() {} }
  let editor
  const app = renderer.createApp(defineComponent({ setup() { editor = useAdminEditor({ repository, delay: 10000 }); return () => h('div') } }))
  app.mount(node('root'))
  try {
    assert.equal(await editor.importText(JSON.stringify(source), true), true)
    for (const group of ids) {
      editor.add(); editor.update(['group'], group)
      assert.equal(editor.current.value.group, group)
      assert.equal(editor.current.value.verified, false)
      assert.equal(editor.current.value.population.type, 'unknown')
      assert.equal(editor.current.value.population.value, null)
      assert.deepEqual(editor.current.value.images, [])
      assert.ok(!validateSpecies([editor.current.value]).some(error => error.includes('неизвестная группа')))
    }
    assert.equal(await editor.save(), true)
    const saved = repository.load().current
    assert.deepEqual(saved.catalog.slice(source.catalog.length).map(record => record.group), ids)
    assert.deepEqual(saved.catalog.slice(0, source.catalog.length), source.catalog)
    assert.deepEqual(saved.demoArchive, source.demoArchive)
    assert.equal(await editor.exportText(), null) // Incomplete drafts cannot be exported as publishable records.
  } finally { app.unmount(); globalThis.window = oldWindow }
})

test('import/export and full generator support all groups without rewriting IDs, archive, existing species, quiz or map', async () => {
  const document = structuredClone(source)
  document.catalog.push(...[...ids, ...LEGACY_GROUPS].map(exportableFixture))
  const text = exportSource(importSource(JSON.stringify(document)))
  assert.deepEqual(JSON.parse(text), document)
  const root = await mkdtemp(join(tmpdir(), 'muras-groups-'))
  try {
    await mkdir(join(root, 'data'), { recursive: true }); await writeFile(join(root, 'data/species.source.json'), text)
    await cp(join(PROJECT_ROOT, 'data/geography'), join(root, 'data/geography'), { recursive: true })
    await mkdir(join(root, 'src/data/quiz'), { recursive: true })
    await cp(join(PROJECT_ROOT, 'src/data/quiz/questions.json'), join(root, 'src/data/quiz/questions.json'))
    for (const record of source.catalog) for (const image of record.images.filter(canPublishImage)) {
      await mkdir(dirname(join(root, image.path)), { recursive: true })
      await cp(join(PROJECT_ROOT, image.path), join(root, image.path))
    }
    const result = await generateAllData(root); await generateAllData(root, { check: true })
    assert.deepEqual(validateSource(document), [])
    assert.deepEqual(result.catalog.slice(0, published.length), published)
    assert.deepEqual(result.catalog.slice(published.length).map(record => record.group), [...ids, ...LEGACY_GROUPS])
    assert.deepEqual(result.archive, source.demoArchive)
    assert.equal(result.questionCount, 18); assert.equal(result.regionCount, 7); assert.equal(result.occurrenceCount, 2)
    assert.deepEqual(validateQuestions(questions, result.catalog), [])
    assert.deepEqual(validateRegionalEvidence(evidence, result.catalog), [])
    assert.deepEqual(await readFile(join(root, 'public/data/quiz.json')), await readFile(join(PROJECT_ROOT, 'public/data/quiz.json')))
    for (const record of result.catalog.slice(published.length)) {
      assert.ok(!questions.some(question => question.speciesId === record.id))
      assert.ok(!evidence.records.some(entry => entry.speciesId === record.id))
    }
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('map filters all groups by documented links and never infers occurrences for added groups', () => {
  const records = [...published, ...ids.map(fixture)]
  for (const group of ids) assert.equal(regionalEntries(evidence, records, 'jalal-abad', group).length, group === 'plants' ? 2 : 0)
  for (const group of ids) {
    // Relabel a test copy of an already linked record; the production evidence and species stay untouched.
    const copy = structuredClone(published)
    copy.find(record => record.id === 'sievers-apple').group = group
    assert.ok(regionalEntries(evidence, copy, 'jalal-abad', group).some(entry => entry.species.id === 'sievers-apple'))
  }
})

test('Vue admin selects and map buttons expose localized available groups without hiding imported legacy values', async () => {
  const vite = await createServer({ server: { middlewareMode: true, ws: false, hmr: false, watch: null }, appType: 'custom', logLevel: 'error' })
  try {
    await vite.ssrLoadModule('/src/admin/locales/index.js')
    const { siteLanguage } = await vite.ssrLoadModule('/src/composables/useLocale.js')
    const { default: Fields } = await vite.ssrLoadModule('/src/admin/components/SpeciesFields.vue')
    const { default: Panel } = await vite.ssrLoadModule('/src/components/map/RegionPanel.vue')
    for (const language of ['ky', 'ru', 'en']) {
      siteLanguage.value = language
      for (const group of ids) {
        const html = await renderToString(createSSRApp(Fields, { species: fixture(group), tab: 'basic' }))
        for (const id of ids) assert.ok(html.includes(`value="${id}"`))
        assert.ok(html.includes(`<select value="${group}">`))
        assert.ok(html.includes(groupLabel({ group }, language)))
        assert.ok(!html.includes('value="invertebrates"'))
      }
      const legacy = await renderToString(createSSRApp(Fields, { species: fixture('invertebrates'), tab: 'basic' }))
      assert.ok(legacy.includes('<select value="invertebrates">'))
      const html = await renderToString(createSSRApp(Panel, { species: published }))
      for (const group of ids) assert.ok(html.includes(groupLabel({ group }, language)))
      const expanded = await renderToString(createSSRApp(Panel, { species: ids.map(fixture), group: 'arthropods' }))
      for (const group of ids) assert.ok(expanded.includes(groupLabel({ group }, language)))
      assert.match(expanded, /aria-pressed="true"[^>]*>Членистоногие|aria-pressed="true"[^>]*>Муунак буттуулар|aria-pressed="true"[^>]*>Arthropods/)
    }
  } finally { await vite.close() }
})
