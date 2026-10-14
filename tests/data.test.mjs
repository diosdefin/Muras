import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir, mkdtemp, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { PROJECT_ROOT, generateData } from '../scripts/build-data.mjs'
import { validateSource, validateSpecies, canPublishImage } from '../src/data/species-model.js'
import { formatPopulation, groupLabel, nationalStatus, regionNames, speciesName, speciesPhoto } from '../src/data/presentation.js'

const source = JSON.parse(await readFile(join(PROJECT_ROOT, 'data/species.source.json'), 'utf8'))
const catalogIds = ['irbis', 'argali', 'manul', 'golden-eagle', 'bearded-vulture', 'saker-falcon', 'greigs-tulip', 'kaufmanns-tulip', 'sievers-apple']
// Keep validation/generator fixtures independent of the size and licence approvals of the real catalogue.
const fresh = () => {
  const d = structuredClone(source)
  d.catalog = [d.catalog[0]]
  d.catalog[0].images = [d.catalog[0].images.find(image => !image.licenseVerified)]
  d.catalog[0].nationalRedBook = { listed: null, category: null, edition: null, year: null, sourceIds: [] }
  return d
}

test('canonical data preserves original nine records and two archived examples without invented populations', () => {
  assert.deepEqual(validateSource(source), [])
  assert.deepEqual(source.catalog.slice(0, 9).map(s => s.id), catalogIds)
  for (const group of ['mammals', 'birds', 'plants']) assert.equal(source.catalog.slice(0, 9).filter(s => s.group === group).length, 3)
  assert.deepEqual(source.demoArchive.map(s => s.id), ['amur-tiger', 'whooping-crane'])
  for (const s of [...source.catalog, ...source.demoArchive]) {
    assert.equal(s.verified, false)
    assert.equal(s.population.type, 'unknown')
    assert.equal(s.population.value, null)
    assert.equal(s.population.min, null)
    assert.equal(s.population.max, null)
  }
  for (const s of source.catalog) {
    assert.equal(s.nationalRedBook.listed, true)
    assert.equal(s.regions[0].code, 'KG')
    assert.ok(s.sources.find(source => s.regions[0].sourceIds.includes(source.id)).url.includes('282.pdf'))
    assert.ok(s.names.ru && s.names.ky && s.names.en)
    assert.equal(s.iucn.year, null) // Dataset publication year is not an assessment year.
    if (source.catalog.indexOf(s) < 17) assert.ok(speciesPhoto(s)) // Preserve the first two photographic batches.
  }
  assert.equal(source.catalog.find(s => s.id === 'argali').nationalRedBook.category, null)
  assert.equal(source.catalog[0].nationalRedBook.category, 'III · CR C2a(i): R, C1')
  assert.equal(source.catalog[0].iucn.category, 'VU')
  assert.equal(source.catalog.find(s => s.id === 'greigs-tulip').nationalRedBook.category, 'EN')
  assert.equal(source.catalog.find(s => s.id === 'greigs-tulip').iucn.category, 'LC')
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
  s.population = { type: 'approximate', value: null, min: 12, max: 20, territory: 'Test territory', year: 2020, unit: 'особей', sourceIds: ['fixture'], reviewStatus: 'approved', method: 'estimate' }
  s.sources.push({ id: 'fixture', title: 'Test fixture, not scientific evidence', publisher: 'Tests', url: 'https://example.org/fixture', accessedAt: '2026-10-12', supports: ['type', 'method', 'value', 'min', 'max', 'territory', 'year', 'unit'].map(field => `population.${field}`) })
}

test('dated, sourced population ranges and exact estimates are supported', () => {
  const d = fresh(); addPopulation(d.catalog[0])
  assert.deepEqual(validateSource(d), [])
  assert.equal(formatPopulation(d.catalog[0].population, d.catalog[0].sources), '12–20 особей')
  Object.assign(d.catalog[0].population, { type: 'exact', value: 12, min: null, max: null, method: 'complete-count' })
  assert.deepEqual(validateSource(d), [])
  assert.equal(formatPopulation(d.catalog[0].population, d.catalog[0].sources), '12 особей')
})

test('invalid population bounds, absent year and absent references are rejected', () => {
  const d = fresh(); addPopulation(d.catalog[0]); const p = d.catalog[0].population
  p.min = 21; p.year = null; p.sourceIds = []
  const errors = validateSource(d).join('\n')
  assert.match(errors, /диапазон min ≤ max/); assert.match(errors, /территорию, год/); assert.match(errors, /требует источник/)
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
  assert.equal(formatPopulation(s.population), 'Нет подтверждённой оценки численности')
  assert.deepEqual(regionNames(s), [])
  assert.equal(speciesName(s, 'ky'), 'amur-tiger')
  assert.equal(speciesPhoto(s), null)
})

test('unconfirmed and incomplete photo licences are never publishable', () => {
  const image = fresh().catalog[0].images[0]
  assert.equal(canPublishImage(image), false)
  const s = fresh().catalog[0]; s.images[0].licenseVerified = true
  assert.match(validateSpecies([s]).join('\n'), /заполненные метаданные/)
  assert.match(validateSpecies(fresh().catalog, 'public', { publicData: true }).join('\n'), /только разрешённые фотографии/)
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
  assert.deepEqual(publicCatalog.map(s => s.id), source.catalog.map(s => s.id))
  assert.equal(publicCatalog.every(s => s.images.every(image => image.path.endsWith('.webp'))), true)
  assert.equal(JSON.stringify(publicCatalog).includes('data/backups'), false)
})

test('licensed assets are local WebP, have declared dimensions, captions and matching fingerprints', async () => {
  for (const s of source.catalog.filter(s => speciesPhoto(s))) {
    const image = speciesPhoto(s)
    const bytes = await readFile(join(PROJECT_ROOT, image.path))
    assert.equal(bytes.subarray(0, 4).toString(), 'RIFF')
    assert.equal(bytes.subarray(8, 12).toString(), 'WEBP')
    assert.equal(createHash('sha256').update(bytes).digest('hex'), image.sha256)
    assert.ok(image.width <= 1800 && image.height <= 1800)
    assert.ok(image.caption.ru)
    assert.ok(image.originalPage.startsWith('https://commons.wikimedia.org/wiki/File:') ||
      image.originalPage === 'https://plant.depo.msu.ru/open/public/en/item/MW0895964')
    assert.ok(image.modifications.some(change => change.includes('пикселизация')))
  }
})

test('an altered licensed asset fails before replacing generated public data', async () => {
  await withFixture(async (root, d, save) => {
    await generateData(root)
    const before = await readFile(join(root, 'public/data/species.json'), 'utf8')
    await mkdir(join(root, 'assets'), { recursive: true })
    const image = structuredClone(source.catalog[0].images[0])
    image.path = 'assets/changed.webp'
    await writeFile(join(root, image.path), 'wrong bytes')
    d.catalog[0].images = [image]; await save()
    await assert.rejects(generateData(root), /Контрольная сумма фото не совпадает/)
    assert.equal(await readFile(join(root, 'public/data/species.json'), 'utf8'), before)
  })
})

test('invalid image fingerprints, dimensions and caption languages are rejected', () => {
  const d = fresh(); const image = structuredClone(source.catalog[0].images[0]); d.catalog[0].images = [image]
  image.sha256 = 'bad'; image.width = 0; image.caption.kg = 'wrong key'
  const errors = validateSource(d).join('\n')
  assert.match(errors, /SHA-256/); assert.match(errors, /положительный размер/); assert.match(errors, /используйте ky/)
})

test('group and national presentation handle unknown values separately from IUCN', () => {
  assert.equal(groupLabel(source.catalog[0]), 'Млекопитающие')
  assert.equal(groupLabel({ group: null }), 'Группа не установлена')
  assert.match(nationalStatus(source.catalog[0]), /Красная книга КР.*CR.*2006/)
  assert.match(nationalStatus(source.catalog.find(s => s.id === 'argali')), /категория не установлена/)
  assert.match(nationalStatus({ nationalRedBook: null }), /включение не подтверждено/)
})
