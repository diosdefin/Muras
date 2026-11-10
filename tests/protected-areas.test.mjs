import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { areaPath, areaIdFromPath, isAreasListPath, areasForRegion, areasForSpecies, filterAreas, sortAreas, validateAreas, areaName, AREA_REGIONS } from '../src/data/protected-areas.js'

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const { areas } = JSON.parse(read('public/data/protected-areas.json'))
const species = new Set(JSON.parse(read('data/species.source.json')).catalog.map(s => s.id))

test('protected areas data is structurally valid and does not touch the species catalog', () => {
  assert.ok(areas.length >= 20)
  assert.deepEqual(validateAreas(areas, species), [])
  assert.equal(species.size, 184)
})

test('every photo file exists, matches its hash and carries an allowed licence with attribution', () => {
  for (const area of areas) for (const photo of area.photos) {
    assert.ok(existsSync(new URL(`../public/${photo.path}`, import.meta.url)), photo.path)
    assert.equal(createHash('sha256').update(readFileSync(new URL(`../public/${photo.path}`, import.meta.url))).digest('hex'), photo.sha256, photo.path)
    assert.match(photo.license, /^(CC0|CC BY 4\.0|CC BY-SA 4\.0|Public domain)/)
    assert.match(photo.originalPage, /^https:\/\/commons\.wikimedia\.org\//)
    assert.ok(photo.author && photo.attribution, area.id)
    if (/BY-SA/.test(photo.license)) assert.match(photo.attribution, /тех же условиях/)
    for (const l of ['ru', 'ky', 'uz', 'en']) assert.ok(photo.caption?.[l], `${area.id} caption ${l}`)
  }
})

test('species links always carry a source quote and only editorial notes stay private', () => {
  for (const area of areas) {
    for (const link of area.speciesLinks || []) assert.ok(link.quote && link.sourceIds?.length, `${area.id}/${link.speciesId}`)
    for (const key of ['conflicts', 'open_questions', 'confidence']) assert.ok(!(key in area), `${area.id} leaks ${key}`)
  }
})

test('route helpers', () => {
  assert.equal(areaIdFromPath(areaPath(areas[0].id)), areas[0].id)
  assert.ok(isAreasListPath('/territories') && isAreasListPath('/territories/'))
  assert.equal(areaIdFromPath('/species/x'), null)
})

test('region, species and filter helpers', () => {
  for (const region of AREA_REGIONS) assert.ok(areasForRegion(areas, region).every(a => a.location.regions.includes(region)))
  const linked = areas.flatMap(a => a.speciesLinks || []).map(l => l.speciesId)[0]
  if (linked) assert.ok(areasForSpecies(areas, linked).length >= 1)
  assert.ok(filterAreas(areas, { type: 'reserve' }).every(a => a.type === 'reserve'))
  const rank = { reserve: 0, 'national-park': 1, biosphere: 2 }
  const sorted = sortAreas(areas, 'en')
  assert.equal(sorted.length, areas.length)
  for (let i = 1; i < sorted.length; i++) assert.ok(rank[sorted[i - 1].type] <= rank[sorted[i].type])
})

test('areas locale keys exist in all four languages with matching placeholders', () => {
  const locales = Object.fromEntries(['ru', 'ky', 'uz', 'en'].map(l => [l, JSON.parse(read(`src/locales/${l}.json`))]))
  const keys = Object.keys(locales.ru).filter(k => k.startsWith('areas.'))
  assert.ok(keys.length >= 40)
  for (const l of Object.keys(locales)) for (const k of keys) {
    assert.ok(locales[l][k], `${l} ${k}`)
    assert.deepEqual(locales[l][k].match(/\{\w+\}/g) || [], locales.ru[k].match(/\{\w+\}/g) || [], `${l} ${k} slots`)
  }
})
