import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir, mkdtemp, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { PROJECT_ROOT, generateData } from '../scripts/build-data.mjs'
import { validateSource, validateSpecies, canPublishImage } from '../src/data/species-model.js'
import { formatPopulation, regionNames, speciesName, speciesPhoto } from '../src/data/presentation.js'

const source = JSON.parse(await readFile(join(PROJECT_ROOT, 'data/species.source.json'), 'utf8'))
const fresh = () => structuredClone(source)

test('canonical data: one candidate, two archived examples, no invented populations', () => {
  assert.deepEqual(validateSource(source), [])
  assert.deepEqual(source.catalog.map(s => s.id), ['irbis'])
  assert.deepEqual(source.demoArchive.map(s => s.id), ['amur-tiger', 'whooping-crane'])
  for (const s of [...source.catalog, ...source.demoArchive]) {
    assert.equal(s.verified, false)
    assert.equal(s.nationalRedBook.category, null)
    assert.equal(s.population.estimate, null)
  }
})

test('unknown fields and absent arrays produce readable validation errors', () => {
  assert.match(validateSpecies(null).join('\n'), /ожидается массив/)
  const d = fresh(); delete d.catalog[0].population; d.catalog[0].population_history = 20000
  assert.match(validateSource(d).join('\n'), /population: обязательное поле отсутствует/)
  assert.match(validateSource(d).join('\n'), /population_history: неизвестное поле/)
})

test('duplicate IDs and placing a species in both datasets are rejected', () => {
  const d = fresh(); d.catalog.push(structuredClone(d.catalog[0])); d.demoArchive.push(structuredClone(d.catalog[0]))
  assert.match(validateSource(d).join('\n'), /повторяющийся id/)
  assert.match(validateSource(d).join('\n'), /одновременно/)
})

test('scientific claims must reference existing supporting sources', () => {
  const d = fresh(); d.catalog[0].sources = []
  assert.match(validateSource(d).join('\n'), /scientificName: нет источника/)
  assert.match(validateSource(d).join('\n'), /неизвестная.*ссылка на источник/)
})

test('a real but unrelated source cannot justify a classification', () => {
  const d = fresh(); d.catalog[0].iucn.sourceIds = ['gslep-kyrgyzstan-names']
  assert.match(validateSource(d).join('\n'), /ссылка должна подтверждать iucn.category/)
})

test('malformed source entries return field errors instead of crashing validator', () => {
  const d = fresh(); d.catalog[0].sources.unshift(null)
  assert.match(validateSource(d).join('\n'), /sources\[0\]: ожидается объект/)
})

test('malformed image paths and null species return errors without exceptions', () => {
  for (const path of [123, {}, undefined]) {
    const d = fresh(); d.catalog[0].images[0].path = path
    assert.match(validateSource(d).join('\n'), /images\[0\].path: ожидается строка или null/)
    assert.equal(canPublishImage(d.catalog[0].images[0]), false)
  }
  const d = fresh(); d.catalog.push(null); d.demoArchive.push(null)
  assert.match(validateSource(d).join('\n'), /ожидается объект вида/)
})

function addPopulation(s) {
  s.population = { territory: 'Test territory', year: 2020, estimate: { type: 'range', min: 12, max: 20 }, unit: 'особей', sourceIds: ['fixture'] }
  s.sources.push({ id: 'fixture', title: 'Test fixture, not scientific evidence', publisher: 'Tests', url: 'https://example.org/fixture', accessedAt: '2026-10-12', supports: ['population.territory', 'population.year', 'population.unit', 'population.estimate'] })
}

test('dated, sourced population ranges and exact estimates are supported', () => {
  const d = fresh(); addPopulation(d.catalog[0])
  assert.deepEqual(validateSource(d), [])
  assert.equal(formatPopulation(d.catalog[0].population), '12–20 особей')
  d.catalog[0].population.estimate = { type: 'exact', min: 12, max: 12 }
  assert.deepEqual(validateSource(d), [])
  assert.equal(formatPopulation(d.catalog[0].population), '12 особей')
})

test('invalid population bounds, absent year and absent references are rejected', () => {
  const d = fresh(); addPopulation(d.catalog[0]); const p = d.catalog[0].population
  p.estimate.min = 21; p.year = null; p.sourceIds = []
  const errors = validateSource(d).join('\n')
  assert.match(errors, /целыми min ≤ max/); assert.match(errors, /территорию, год/); assert.match(errors, /требует источник/)
})

test('IUCN is never a substitute for a documented national classification', () => {
  const d = fresh(); d.catalog[0].nationalRedBook.category = 'VU'
  assert.match(validateSource(d).join('\n'), /подтверждённого включения/)
  d.catalog[0].nationalRedBook.listed = true
  assert.match(validateSource(d).join('\n'), /название издания\/документа и год/)
  d.catalog[0].verified = true
  assert.match(validateSource(d).join('\n'), /полная проверка национальной записи/)
})

test('invalid dates, unsafe URLs and kg instead of ky are rejected', () => {
  const d = fresh(); d.catalog[0].lastReviewedAt = '2026-02-30'
  d.catalog[0].names.kg = 'Legacy language key'; d.catalog[0].sources[0].url = 'javascript:alert(1)'
  const errors = validateSource(d).join('\n')
  assert.match(errors, /YYYY-MM-DD/); assert.match(errors, /используйте ky/); assert.match(errors, /HTTP\(S\)/)
})

test('missing scientific data renders honest fallbacks', () => {
  const s = structuredClone(source.demoArchive[0])
  assert.equal(formatPopulation(s.population), 'Численность неизвестна')
  assert.deepEqual(regionNames(s), [])
  assert.equal(speciesName(s, 'ky'), 'amur-tiger')
  assert.equal(speciesPhoto(s), null)
})

test('unconfirmed and incomplete photo licences are never publishable', () => {
  const image = structuredClone(source.catalog[0].images[0])
  assert.equal(canPublishImage(image), false)
  const s = structuredClone(source.catalog[0]); s.images[0].licenseVerified = true
  assert.match(validateSpecies([s]).join('\n'), /заполненные метаданные/)
  assert.match(validateSpecies(source.catalog, 'public', { publicData: true }).join('\n'), /только разрешённые фотографии/)
})

test('legacy backup preserves every original byte verified by SHA-256', async () => {
  const root = join(PROJECT_ROOT, 'data/backups/legacy-2026-10-12')
  const manifest = JSON.parse(await readFile(join(root, 'manifest.json'), 'utf8'))
  assert.equal(manifest.length, 8)
  for (const item of manifest) {
    const hash = createHash('sha256').update(await readFile(join(root, item.backupPath))).digest('hex')
    assert.equal(hash, item.sha256, item.backupPath)
  }
})

async function withFixture(fn) {
  const root = await mkdtemp(join(tmpdir(), 'redbook-data-test-'))
  try {
    await mkdir(join(root, 'data'), { recursive: true })
    const d = fresh()
    const save = () => writeFile(join(root, 'data/species.source.json'), JSON.stringify(d), 'utf8')
    await save(); await fn(root, d, save)
  } finally { await rm(root, { recursive: true, force: true }) }
}

test('generation is deterministic, excludes archive/photos, never edits source', async () => {
  await withFixture(async (root) => {
    const before = await readFile(join(root, 'data/species.source.json'), 'utf8')
    const result = await generateData(root)
    assert.equal(result.catalog.length, 1); assert.deepEqual(result.catalog[0].images, [])
    assert.deepEqual(await readdir(join(root, 'public/data')), ['species.json'])
    assert.deepEqual(await readdir(join(root, 'public/images/approved')), [])
    await generateData(root, { check: true }); await generateData(root)
    // A Windows checkout can use CRLF; this must not be mistaken for stale data.
    const publicPath = join(root, 'public/data/species.json')
    const publicText = await readFile(publicPath, 'utf8')
    await writeFile(publicPath, publicText.replace(/\n/g, '\r\n'))
    await generateData(root, { check: true })
    assert.equal(await readFile(join(root, 'data/species.source.json'), 'utf8'), before)
    assert.equal(JSON.parse(await readFile(join(root, 'data/archive/demo-species.generated.json'), 'utf8')).length, 2)
  })
})

test('invalid source fails before overwriting previously generated public data', async () => {
  await withFixture(async (root, d, save) => {
    await generateData(root); const before = await readFile(join(root, 'public/data/species.json'), 'utf8')
    d.catalog[0].scientificName = 123; await save()
    await assert.rejects(generateData(root), /catalog\[0\].scientificName/)
    assert.equal(await readFile(join(root, 'public/data/species.json'), 'utf8'), before)
  })
})

test('approving and revoking fixture permissions copies and removes public assets', async () => {
  await withFixture(async (root, d, save) => {
    await mkdir(join(root, 'assets'), { recursive: true })
    const bytes = await readFile(join(PROJECT_ROOT, 'data/backups/legacy-2026-10-12/images/source/irbis.jpg'))
    await writeFile(join(root, 'assets/fixture.jpg'), bytes)
    // Permission metadata below is synthetic and confined to this temporary fixture.
    d.catalog[0].images[0] = { path: 'assets/fixture.jpg', author: 'Test fixture', originalPage: 'https://example.org/photo', license: 'Synthetic test permission', licenseUrl: 'https://example.org/permission', attribution: 'Test fixture only', modifications: [], licenseVerified: true }
    await save(); await generateData(root)
    assert.deepEqual(await readdir(join(root, 'public/images/approved')), ['irbis-1.jpg'])
    assert.deepEqual(await readFile(join(root, 'public/images/approved/irbis-1.jpg')), bytes)
    await generateData(root, { check: true })
    d.catalog[0].images[0].licenseVerified = false; await save(); await generateData(root)
    assert.deepEqual(await readdir(join(root, 'public/images/approved')), [])
    assert.deepEqual(JSON.parse(await readFile(join(root, 'public/data/species.json'), 'utf8'))[0].images, [])
  })
})

test('approved files must exist; traversal and unapproved leftovers fail checks', async () => {
  await withFixture(async (root, d, save) => {
    await generateData(root)
    await writeFile(join(root, 'public/images/approved/stale.jpg'), 'test')
    await assert.rejects(generateData(root, { check: true }), /устаревшие или неподтверждённые/)
    d.catalog[0].images[0] = { path: 'missing.jpg', author: 'Fixture', originalPage: 'https://example.org/photo', license: 'Fixture', licenseUrl: 'https://example.org/permission', attribution: 'Fixture', modifications: [], licenseVerified: true }
    await save(); await assert.rejects(generateData(root), /изображение не найдено/)
    d.catalog[0].images[0].path = '../outside.jpg'; await save()
    await assert.rejects(generateData(root), /локальный безопасный путь/)
  })
})

test('committed public projection validates and contains no private image paths', async () => {
  const publicCatalog = JSON.parse(await readFile(join(PROJECT_ROOT, 'public/data/species.json'), 'utf8'))
  assert.deepEqual(validateSpecies(publicCatalog, 'public', { publicData: true }), [])
  assert.deepEqual(publicCatalog.map(s => s.id), ['irbis'])
  assert.equal(JSON.stringify(publicCatalog).includes('data/backups'), false)
})
