import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, writeFile, cp, mkdtemp, rm, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { createHash } from 'node:crypto'
import { PROJECT_ROOT, generateAllData } from '../scripts/build-data.mjs'
import { BOUNDARY_SHA256, prepareMap, projectBoundaries, publishMap } from '../scripts/build-map.mjs'
import { REGIONS, polygons, regionalEntries, validateBoundaries, validateMapGeometry, validateRegionalEvidence } from '../src/data/geography/model.js'

const read = async path => JSON.parse(await readFile(resolve(PROJECT_ROOT, path), 'utf8'))
const geojson = await read('data/geography/source/regions.geojson')
const metadata = await read('data/geography/source/metadata.json')
const evidence = await read('data/geography/occurrences.source.json')
const species = await read('public/data/species.json')
const clone = value => structuredClone(value)

test('seven real oblasts match the pinned boundary file, with no invented city polygons', async () => {
  assert.deepEqual(validateBoundaries(geojson), [])
  assert.equal(REGIONS.length, 7)
  assert.deepEqual(new Set(geojson.features.map(f => f.properties.shapeISO)), new Set(REGIONS.map(r => r.iso)))
  const bytes = await readFile(resolve(PROJECT_ROOT, 'data/geography/source/regions.geojson'))
  assert.equal(createHash('sha256').update(bytes).digest('hex'), BOUNDARY_SHA256)
  assert.equal(metadata.boundaryYearRepresented, '2017')
  assert.equal(metadata.boundaryLicense, 'Open Data Commons Open Database License 1.0')
})

test('invalid names, counts, non-finite coordinates, open and degenerate rings fail', () => {
  for (const mutate of [
    g => g.features.pop(),
    g => { g.features[0].properties.shapeName = 'Bishkek' },
    g => { g.features[1].properties.shapeISO = 'KG-B' },
    g => { g.features[0].geometry.coordinates[0][0][0] = NaN },
    g => { g.features[0].geometry.coordinates[0].pop() },
    g => { g.features[0].geometry.coordinates[0] = [[70, 40], [70, 40], [70, 40], [70, 40]] },
  ]) { const g = clone(geojson); mutate(g); assert.ok(validateBoundaries(g).length) }
  for (const g of [null, {}, { type: 'FeatureCollection', features: [null] }]) assert.ok(validateBoundaries(g).length)
})

test('projection preserves every polygon and hole and keeps all points within viewBox', () => {
  const map = projectBoundaries(geojson, metadata)
  assert.deepEqual(validateMapGeometry(map), [])
  for (const region of map.regions) {
    const shape = geojson.features.find(f => f.properties.shapeISO === REGIONS.find(r => r.id === region.id).iso)
    const rings = polygons(shape.geometry).flat()
    assert.equal((region.path.match(/M/g) || []).length, rings.length)
    assert.equal((region.path.match(/Z/g) || []).length, rings.length)
    assert.equal((region.path.match(/[ML]/g) || []).length, rings.reduce((sum, ring) => sum + ring.length - 1, 0))
    for (const match of region.path.matchAll(/[ML]([\d.]+),([\d.]+)/g)) {
      assert.ok(+match[1] >= 0 && +match[1] <= map.viewBox[2]); assert.ok(+match[2] >= 0 && +match[2] <= map.viewBox[3])
    }
  }
  assert.equal(polygons(geojson.features.find(f => f.properties.shapeISO === 'KG-B').geometry)[0].length, 6)
  assert.equal(polygons(geojson.features.find(f => f.properties.shapeISO === 'KG-O').geometry).length, 2)
})

test('only two sourced 2022 plant observations in Jalal-Abad; independent review stays pending', () => {
  assert.deepEqual(validateRegionalEvidence(evidence, species), [])
  assert.equal(evidence.records.length, 2)
  assert.deepEqual(evidence.records.map(r => r.speciesId).sort(), ['kaufmanns-tulip', 'sievers-apple'])
  assert.ok(evidence.records.every(r => r.regionId === 'jalal-abad' && r.reviewStatus === 'documented_pending_review' && r.localityPrecision === 'oblast' && r.observationYear === 2022))
  assert.ok(species.every(s => s.verified === false))
})

test('selection and group filters never infer oblasts from countrywide catalogue records', () => {
  for (const region of REGIONS) {
    const all = regionalEntries(evidence, species, region.id)
    assert.equal(all.length, region.id === 'jalal-abad' ? 2 : 0)
    assert.equal(regionalEntries(evidence, species, region.id, 'mammals').length, 0)
    assert.equal(regionalEntries(evidence, species, region.id, 'birds').length, 0)
    assert.equal(regionalEntries(evidence, species, region.id, 'plants').length, all.length)
    for (const entry of all) { assert.ok(species.includes(entry.species)); assert.equal(entry.sources[0].id, 'kendirbaeva-2025') }
  }
  assert.deepEqual(regionalEntries(evidence, species, ''), [])
  assert.deepEqual(regionalEntries({ sources: [], records: [] }, species, 'jalal-abad'), [])
  assert.deepEqual(regionalEntries(null, species, 'batken'), [])
})

test('unverified, undocumented and finer-than-oblast occurrences never appear in regional results', () => {
  for (const mutate of [
    r => { r.reviewStatus = 'unverified' }, r => { r.sourceIds = ['missing'] },
    r => { r.sourceIds = [] }, r => { r.localityPrecision = 'exact' },
  ]) { const data = clone(evidence); data.records.forEach(mutate); assert.deepEqual(regionalEntries(data, species, 'jalal-abad'), []) }
})

test('unknown IDs, duplicate links, unsafe sources and photos used as evidence are rejected', () => {
  for (const mutate of [
    d => { d.records[0].speciesId = 'amur-tiger' }, d => { d.records[0].regionId = 'bishkek' },
    d => { d.records[0].sourceIds = ['missing'] }, d => { d.records[0].sourceIds = ['kendirbaeva-2025', 'kendirbaeva-2025'] },
    d => d.records.push(clone(d.records[0])), d => d.sources.push(clone(d.sources[0])),
    d => { d.sources[0].url = 'javascript:alert(1)' }, d => { d.sources[0].kind = 'photo' },
    d => { d.sources[0].kind = 'countrywide' }, d => { d.records[0].evidence = null },
    d => { d.records[0].observationYear = 2026 }, d => { d.records[0].reviewStatus = 'AI_verified' },
  ]) { const data = clone(evidence); mutate(data); assert.ok(validateRegionalEvidence(data, species).length) }
})

test('malformed evidence returns errors and precise habitat coordinates cannot be published', () => {
  for (const record of [null, {}, { ...evidence.records[0], sourceIds: 'invalid' }]) {
    const data = clone(evidence); data.records[0] = record
    assert.ok(validateRegionalEvidence(data, species).length)
  }
  for (const mutate of [
    r => { r.latitude = 41.12345 }, r => { r.evidence = 'N 41°48′, E 71°57′' },
    r => { r.locator = '41.12345, 71.12345' }, r => { r.localityPrecision = 'nest' },
  ]) { const data = clone(evidence); mutate(data.records[0]); assert.ok(validateRegionalEvidence(data, species).some(s => /координаты|точные|точность/.test(s))) }
})

test('public geometry, evidence and machine-readable ODbL data are deterministic local outputs', async () => {
  const prepared = await prepareMap(PROJECT_ROOT, species)
  await publishMap(PROJECT_ROOT, prepared, { check: true })
  assert.deepEqual(await read('public/data/geography/occurrences.json'), evidence)
  const publicGeojson = await read('public/data/geography/regions.geojson')
  assert.deepEqual(publicGeojson.features, geojson.features)
  assert.equal(publicGeojson.license, 'https://opendatacommons.org/licenses/odbl/1-0/')
  assert.ok(prepared.payloads.get('public/data/geography/map.json').length < 110000)
})

test('offline preparation never requests network and rejects tampered or stale geographic assets', async () => {
  const root = await mkdtemp(resolve(tmpdir(), 'redbook-map-test-'))
  try {
    await cp(resolve(PROJECT_ROOT, 'data/geography'), resolve(root, 'data/geography'), { recursive: true })
    const before = await readFile(resolve(root, 'data/geography/occurrences.source.json'), 'utf8')
    const previousFetch = globalThis.fetch
    let prepared
    try { globalThis.fetch = () => { throw new Error('Network forbidden in offline test') }; prepared = await prepareMap(root, species) }
    finally { globalThis.fetch = previousFetch }
    await publishMap(root, prepared); await publishMap(root, prepared, { check: true })
    assert.equal(await readFile(resolve(root, 'data/geography/occurrences.source.json'), 'utf8'), before)
    await writeFile(resolve(root, 'public/data/geography/map.json'), '{}')
    await assert.rejects(publishMap(root, prepared, { check: true }), /устарел/)
    await writeFile(resolve(root, 'data/geography/source/regions.geojson'), '{}')
    await assert.rejects(prepareMap(root, species), /Контрольная сумма/)
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('invalid regional evidence stops the unified generator before overwriting catalogue or quiz', async () => {
  const root = await mkdtemp(resolve(tmpdir(), 'redbook-map-build-'))
  try {
    await cp(resolve(PROJECT_ROOT, 'data/geography'), resolve(root, 'data/geography'), { recursive: true })
    const document = await read('data/species.source.json'); document.catalog.forEach(s => { s.images = [] })
    await writeFile(resolve(root, 'data/species.source.json'), JSON.stringify(document))
    await mkdir(resolve(root, 'src/data/quiz'), { recursive: true })
    const questions = (await read('src/data/quiz/questions.json')).filter(q => q.difficulty === 'researcher')
    await writeFile(resolve(root, 'src/data/quiz/questions.json'), JSON.stringify(questions))
    await generateAllData(root)
    const catalogBefore = await readFile(resolve(root, 'public/data/species.json'), 'utf8')
    const quizBefore = await readFile(resolve(root, 'public/data/quiz.json'), 'utf8')
    const data = clone(evidence); data.records[0].sourceIds = ['missing']
    await writeFile(resolve(root, 'data/geography/occurrences.source.json'), JSON.stringify(data))
    await assert.rejects(generateAllData(root), /Некорректные данные карты/)
    assert.equal(await readFile(resolve(root, 'public/data/species.json'), 'utf8'), catalogBefore)
    assert.equal(await readFile(resolve(root, 'public/data/quiz.json'), 'utf8'), quizBefore)
  } finally { await rm(root, { recursive: true, force: true }) }
})
