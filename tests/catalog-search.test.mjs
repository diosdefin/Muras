import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { ref } from 'vue'
import { briefDescription, catalogOptions, catalogPage, createSearchIndex, matchesCatalogFilters, normalizeSearch, searchSpecies, typoDistance } from '../src/data/catalog-search.js'
import { useCatalog } from '../src/composables/useCatalog.js'
const catalog = JSON.parse(await readFile(new URL('../public/data/species.json', import.meta.url), 'utf8'))
const index = createSearchIndex(catalog)
const ids = query => searchSpecies(index, query).map(result => result.species.id)

test('all four irbis names resolve to the same existing record, regardless of case and spaces', () => {
  for (const query of ['ирбис', 'ИЛБИРС', ' Snow  Leopard ', 'PANTHERA UNCiA']) assert.deepEqual(ids(query), ['irbis'])
})
test('every catalog name in every supported language and Latin remains searchable', () => {
  for (const species of catalog) for (const name of [...Object.values(species.names), species.scientificName].filter(Boolean)) {
    assert.ok(ids(name).includes(species.id), name)
    assert.equal(searchSpecies(index, name).find(result => result.species.id === species.id).kind, 'direct')
  }
})
test('normalization handles Unicode, ё/е, apostrophes and whitespace without collapsing Kyrgyz letters', () => {
  assert.equal(normalizeSearch(' ЁЖ\n  ӨҮҢ '), 'еж өүң')
  assert.equal(normalizeSearch('Pallas’s  Cat'), "pallas's cat")
  assert.equal(normalizeSearch(null), '')
  assert.deepEqual(ids("pallas's cat"), ['manul'])
  const fixture = createSearchIndex([{ id: 'fixture', names: { ru: 'Ёж' } }])
  assert.equal(searchSpecies(fixture, 'еж')[0].species.id, 'fixture')
})
test('prefix, substring and multiword queries find names only', () => {
  assert.deepEqual(ids('панте'), []) // No invented Cyrillic scientific-name translation.
  assert.deepEqual(ids('panth'), ['irbis'])
  assert.deepEqual(ids('бирс'), ['irbis'])
  assert.deepEqual(ids('leopard snow'), ['irbis'])
  assert.equal(ids('тюльпан').length, 2)
  assert.deepEqual(ids('Браконьерство'), [])
})
test('safe Latin transliterations are marked and preserve the original Kyrgyz name', () => {
  for (const query of ['ilbirs', 'irbis']) assert.deepEqual(ids(query), ['irbis'])
  for (const query of ['burkut', 'bür küt'.replace(' ', '')]) {
    const result = searchSpecies(index, query)[0]
    assert.equal(result.species.id, 'golden-eagle'); assert.equal(result.kind, 'transliteration')
    assert.equal(result.matchedName, 'Бүркүт'); assert.equal(result.language, 'ky')
  }
  const similarRussian = searchSpecies(index, 'буркут')[0]
  assert.equal(similarRussian.kind, 'fuzzy'); assert.equal(similarRussian.matchedName, 'Беркут'); assert.equal(similarRussian.language, 'ru')
  assert.deepEqual(searchSpecies(createSearchIndex([{ id: 'fixture', names: { ky: 'Бүркүт' } }]), 'буркут'), [])
  assert.ok(typoDistance('көлдүн', 'колдун', 2) > 2)
  assert.ok(typoDistance('көлдосу', 'колдосу', 2) > 2)
})
test('small typos and adjacent transpositions produce explicitly probable matches', () => {
  for (const query of ['ирпис', 'ирбс', 'илбирз', 'snow leoprad', 'snoq leoprad', 'panthrea uncai']) {
    const result = searchSpecies(index, query)
    assert.equal(result[0]?.species.id, 'irbis', query)
    assert.ok(result.every(item => item.kind === 'fuzzy'), query)
  }
  assert.deepEqual(ids('манол'), ['manul'])
  assert.equal(typoDistance('leoprad', 'leopard'), 1)
})
test('short, foreign, random, oversized and punctuation-only queries do not invent matches', () => {
  for (const query of ['тигр', 'американский журавль', 'zzzzzz', 'ман', '???', 'x'.repeat(121)]) {
    if (query === 'ман') { assert.ok(ids(query).includes('manul')); continue }
    assert.deepEqual(ids(query), [], query)
  }
  assert.deepEqual(ids('ирп'), [])
})
test('exact and partial results suppress fuzzy alternatives rather than replacing names', () => {
  const fixture = createSearchIndex([
    { id: 'exact', names: { ru: 'Ирбис' } }, { id: 'typo-neighbor', names: { ru: 'Ирпис' } },
  ])
  assert.deepEqual(searchSpecies(fixture, 'ирбис').map(result => result.species.id), ['exact'])
  assert.deepEqual(searchSpecies(fixture, 'ир').map(result => result.kind), ['direct', 'direct'])
})
test('empty query retains original order, species objects, uniqueness and source data', () => {
  const before = JSON.stringify(catalog)
  assert.deepEqual(ids('  '), catalog.map(species => species.id))
  const results = searchSpecies(index, 'тюльпан')
  assert.equal(new Set(results.map(result => result.species.id)).size, results.length)
  assert.equal(results[0].species, catalog.find(species => species.id === results[0].species.id))
  assert.equal(JSON.stringify(catalog), before)
})
test('filter options contain only categories and groups in the catalog, including unknown values when present', () => {
  const options = catalogOptions(catalog)
  assert.deepEqual(options.statuses.map(option => option.value), ['ALL', 'EN', 'VU', 'NT', 'LC', 'UNKNOWN'])
  assert.deepEqual(options.groups.map(option => option.value), ['ALL', 'mammals', 'birds', 'plants', 'reptiles', 'amphibians', 'arthropods', 'fungi'])
  assert.deepEqual(options.regions, ['ALL', 'Кыргызстан'])
  const fixture = catalogOptions([{ group: 'fish', iucn: { category: null }, regions: null }])
  assert.deepEqual(fixture.statuses.map(option => option.value), ['ALL', 'UNKNOWN'])
  assert.deepEqual(fixture.regions, ['ALL', 'Регион неизвестен'])
  assert.equal(catalogOptions([]).statuses.length, 1)
})
test('search, IUCN, group and geographic filters intersect without overriding one another', () => {
  const filtered = filters => searchSpecies(index, 'тюльпан').filter(result => matchesCatalogFilters(result.species, filters)).map(result => result.species.id)
  assert.deepEqual(filtered({ status: 'NT', group: 'plants', region: 'Кыргызстан' }), ['kaufmanns-tulip'])
  assert.deepEqual(filtered({ status: 'VU' }), [])
  assert.deepEqual(filtered({ group: 'mammals' }), [])
  assert.deepEqual(filtered({ region: 'unknown' }), [])
  assert.equal(matchesCatalogFilters({ iucn: null, regions: null }, { status: 'UNKNOWN', region: 'Регион неизвестен' }), true)
})
test('a filtered-out exact match cannot cause another species to appear as a fuzzy replacement', () => {
  const state = useCatalog(ref(catalog))
  state.query.value = 'ирбис'; state.group.value = 'birds'
  assert.equal(state.results.value.length, 0)
  state.group.value = 'mammals'; assert.equal(state.results.value[0].species.id, 'irbis')
})
test('reset clears query and every existing/new filter; index is reused across queries', () => {
  const state = useCatalog(ref(catalog))
  state.query.value = 'leopard'; state.status.value = 'VU'; state.region.value = 'Кыргызстан'; state.group.value = 'mammals'
  assert.equal(state.hasFilters.value, true); assert.equal(state.results.value.length, 1)
  state.reset()
  assert.equal(state.query.value, ''); assert.equal(state.status.value, 'ALL'); assert.equal(state.region.value, 'ALL'); assert.equal(state.group.value, 'ALL')
  assert.equal(state.hasFilters.value, false); assert.equal(state.results.value.length, catalog.length)
})
test('nine species need no pagination; larger fixture expands by twelve without repetitions', () => {
  assert.equal(catalogPage(catalog.slice(0, 9)).remaining, 0)
  const larger = Array.from({ length: 25 }, (_, n) => ({ ...catalog[n % 9], id: `fixture-${n}` }))
  const state = useCatalog(ref(larger))
  assert.equal(state.page.value.entries.length, 12); assert.equal(state.page.value.remaining, 13)
  state.more(); assert.equal(state.page.value.entries.length, 24); assert.equal(state.page.value.remaining, 1)
  state.more(); assert.equal(state.page.value.entries.length, 25); assert.equal(state.page.value.remaining, 0)
  assert.equal(new Set(state.page.value.entries.map(result => result.species.id)).size, 25)
  state.query.value = 'ирбис'; assert.equal(state.page.value.entries.length, 3)
  state.reset(); assert.equal(state.page.value.entries.length, 12)
})
test('pagination resets when filters or catalog change; invalid limits cannot hide the first page', () => {
  const records = ref(Array.from({ length: 30 }, (_, n) => ({ ...catalog[n % 9], id: `fixture-${n}` })))
  const state = useCatalog(records)
  state.more(); state.group.value = 'plants'; assert.equal(state.page.value.remaining, 0)
  state.reset(); state.more(); records.value = catalog
  assert.equal(state.page.value.entries.length, 12)
  assert.equal(catalogPage(records.value, NaN).entries.length, 12)
  assert.equal(catalogPage(records.value, -1).entries.length, 12)
})
test('compact descriptions are unchanged first sentences with honest missing-data fallbacks', () => {
  for (const species of catalog) assert.ok(species.habitat.description.ru.startsWith(briefDescription(species)))
  assert.match(briefDescription({ habitat: null }), /не подтверждены/)
})
