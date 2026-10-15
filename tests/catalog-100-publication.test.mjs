import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PROJECT_ROOT } from '../scripts/build-data.mjs'
import { digest, fingerprint } from '../scripts/lib/research-pipeline.mjs'
import { runPipeline } from '../scripts/bulk-pipeline.mjs'
import { validateSource, validateSpecies } from '../src/data/species-model.js'
import { LANGUAGES } from '../src/data/localization.js'
import { speciesName } from '../src/data/presentation.js'
import { createSearchIndex, searchSpecies, matchesCatalogFilters } from '../src/data/catalog-search.js'
import { paginateCatalog } from '../src/data/catalog-pagination.js'
import { speciesIdFromPath, speciesPath } from '../src/data/species-routes.js'
import { historicalPipeline } from './helpers/historical-pipeline.mjs'

const read = async p => JSON.parse(await readFile(`${PROJECT_ROOT}/${p}`, 'utf8'))
// Immutable release before task 23 photo-only amendments; current photos are
// independently checked in catalog-100-photos.test.mjs.
const source = await read('data/backups/catalog-100-photos/species.source.json'), published = await read('data/backups/catalog-100-photos/public-species.json')
const before = await read('data/backups/catalog-100/species.source.json')
const beforePublic = await read('data/backups/catalog-100/public-species.json')
const manifestPath = 'data/research/catalog-100-review-manifest.json'
const manifest = await read(manifestPath), registry = await read(manifest.registry)
const journal = await read('data/research/publication-decisions/muras-22-7-owner-provisional.json')

test('catalog 100 appends only the 16 authorized IDs, preserves all 84 previous records and keeps scientific data identical to the audited drafts', async () => {
  assert.equal(source.catalog.length, 100); assert.equal(published.length, 100)
  assert.equal(new Set(source.catalog.map(s => s.id)).size, 100)
  assert.equal(new Set(source.catalog.map(s => s.scientificName.toLowerCase())).size, 100)
  assert.deepEqual(source.catalog.slice(0, 84), before.catalog)
  assert.deepEqual(source.demoArchive, before.demoArchive)
  assert.deepEqual(published.slice(0, 84), beforePublic)
  assert.deepEqual(source.catalog.slice(84).map(s => s.id), manifest.candidateIds)
  assert.deepEqual(published.slice(84).map(s => s.id), manifest.candidateIds)
  assert.deepEqual(validateSource(source), [])
  assert.deepEqual(validateSpecies(published, 'public', { publicData: true }), [])
  assert.equal(digest(await readFile(`${PROJECT_ROOT}/${manifestPath}`)), '592f264f91bb1628d7ff6e84925395dfd6894517348fc6df07eb16870b9ac74b')
  assert.equal(journal.manifestSha256, digest(await readFile(`${PROJECT_ROOT}/${manifestPath}`)))
  assert.equal(journal.registryFingerprint, fingerprint(registry))
  assert.equal(journal.scientificApproval, null)
  assert.deepEqual(journal.records.map(r => r.id), manifest.candidateIds)
  for (const [n, s] of source.catalog.slice(84).entries()) {
    const { publication, ...science } = s, entry = manifest.candidates[n], decision = journal.records[n]
    assert.deepEqual(science, await read(entry.draftFile))
    assert.equal(s.verified, false); assert.equal(s.lastReviewedAt, null)
    assert.equal(s.population.type, 'unknown'); assert.equal(s.population.reviewStatus, 'pending')
    assert.equal(publication.status, 'provisional'); assert.equal(publication.scientificReviewStatus, 'pending')
    assert.equal(publication.independentReviewer, null); assert.equal(publication.decisionId, journal.decisionId)
    assert.equal(publication.researchFingerprint, entry.checkedFingerprint)
    assert.equal(decision.fingerprint, entry.checkedFingerprint); assert.equal(decision.draftSha256, entry.draftSha256)
    assert.equal(decision.ownerRole, 'project_owner'); assert.equal(decision.date, '2026-10-15')
    assert.equal(decision.reason, 'Отдельное разрешение владельца на manifest SHA-256 592f264f91bb1628d7ff6e84925395dfd6894517348fc6df07eb16870b9ac74b; научная экспертиза не выполнена.')
    assert.equal(decision.independentReviewer, null); assert.equal(decision.scientificReviewStatus, 'pending')
  }
  for (const id of ['tulipa-anadroma', 'eryx-tataricus']) assert.ok(!source.catalog.some(s => s.id === id))
  assert.ok(registry.candidates.every(c => c.approval === null))
})

test('all 100 route identities and four-language searches work, filters retain additions, pagination is 24/24/24/24/4 and all photo bytes match', async () => {
  const index = createSearchIndex(published)
  for (const s of published) {
    assert.equal(speciesIdFromPath(speciesPath(s.id)), s.id)
    assert.ok(matchesCatalogFilters(s, { group: s.group }))
    for (const language of LANGUAGES) assert.ok(searchSpecies(index, speciesName(s, language)).some(r => r.species.id === s.id), `${s.id}.${language}`)
    assert.ok(searchSpecies(index, s.scientificName).some(r => r.species.id === s.id))
    for (const im of s.images) assert.equal(digest(await readFile(`${PROJECT_ROOT}/public${im.path}`)), im.sha256)
  }
  for (const s of published.slice(84)) assert.ok(matchesCatalogFilters(s, { group: s.group, status: 'UNKNOWN', region: 'Кыргызстан' }))
  const pages = [1,2,3,4,5].map(n => paginateCatalog(published, n))
  assert.deepEqual(pages.map(p => p.entries.length), [24,24,24,24,4])
  assert.deepEqual(pages.flatMap(p => p.entries).map(s => s.id), published.map(s => s.id))
  assert.equal(source.catalog.slice(84).reduce((n, s) => n + s.images.length, 0), 2)
  assert.equal(source.catalog.slice(84).filter(s => !s.images.length).length, 14)
})

test('repeat authorized provisional dry-run adds zero, preserves source bytes and never produces scientific approval', async () => {
  const beforeHash = digest(await readFile(`${PROJECT_ROOT}/data/species.source.json`))
  const { repeat, checked } = await historicalPipeline(source, async root => ({ repeat: await runPipeline(root, ['provisional', '--registry', journal.registry, '--manifest', journal.manifest,
    '--mode', 'dry-run', '--owner-role', 'project_owner', '--decision-id', journal.decisionId,
    '--date', journal.records[0].date, '--reason', journal.records[0].reason]), checked: await runPipeline(root, ['check', '--registry', journal.registry]) }))
  assert.deepEqual(repeat.counts, { processed: 16, added: 0, unchanged: 16, rejected: 0 })
  assert.equal(repeat.applied, false); assert.equal(repeat.scientificApproval, null)
  assert.equal(checked.states.imported, 16); assert.equal(checked.states.approved_for_import, 0)
  assert.ok(checked.results.every(r => r.errors.length === 0))
  assert.equal(digest(await readFile(`${PROJECT_ROOT}/data/species.source.json`)), beforeHash)
})
