import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PROJECT_ROOT } from '../scripts/build-data.mjs'
import { digest, fingerprint } from '../scripts/lib/research-pipeline.mjs'
import { runPipeline } from '../scripts/bulk-pipeline.mjs'
import { validateSource, validateSpecies } from '../src/data/species-model.js'

const read = async p => JSON.parse(await readFile(`${PROJECT_ROOT}/${p}`, 'utf8'))
const source = await read('data/species.source.json'), published = await read('public/data/species.json')
const before = await read('data/backups/catalog-84/species.source.json')
const beforePublic = await read('data/backups/catalog-84/public-species.json')
const manifestPath = 'data/research/catalog-84-review-manifest.json'
const manifest = await read(manifestPath), registry = await read(manifest.registry)
const journal = await read('data/research/publication-decisions/muras-22-6-owner-provisional.json')

test('catalog 84 preserves all previous 63 records and binds the 21 additions to the explicitly authorized manifest', async () => {
  assert.equal(source.catalog.length, 84); assert.equal(published.length, 84)
  assert.equal(new Set(source.catalog.map(s => s.id)).size, 84)
  assert.deepEqual(source.catalog.slice(0, 63), before.catalog)
  assert.deepEqual(source.demoArchive, before.demoArchive)
  assert.deepEqual(published.slice(0, 63), beforePublic)
  assert.deepEqual(source.catalog.slice(63).map(s => s.id), manifest.candidateIds)
  assert.deepEqual(published.slice(63).map(s => s.id), manifest.candidateIds)
  assert.deepEqual(validateSource(source), [])
  assert.deepEqual(validateSpecies(published, 'public', { publicData: true }), [])
  assert.equal(digest(await readFile(`${PROJECT_ROOT}/${manifestPath}`)), 'fbe1c33118ae86dbaca13ccfe6e7149ee267861f0fd2158a884b66d574de0c9d')
  assert.equal(journal.manifestSha256, digest(await readFile(`${PROJECT_ROOT}/${manifestPath}`)))
  assert.equal(journal.registryFingerprint, fingerprint(registry))
  assert.equal(journal.scientificApproval, null)
  assert.deepEqual(journal.records.map(r => r.id), manifest.candidateIds)
  for (const [n, s] of source.catalog.slice(63).entries()) {
    const { publication, ...science } = s, entry = manifest.candidates[n], decision = journal.records[n]
    assert.deepEqual(science, await read(entry.draftFile))
    assert.equal(s.verified, false); assert.equal(s.lastReviewedAt, null)
    assert.equal(s.population.type, 'unknown'); assert.equal(s.population.reviewStatus, 'pending')
    assert.equal(publication.status, 'provisional'); assert.equal(publication.scientificReviewStatus, 'pending')
    assert.equal(publication.independentReviewer, null); assert.equal(publication.decisionId, journal.decisionId)
    assert.equal(publication.researchFingerprint, entry.checkedFingerprint)
    assert.equal(decision.fingerprint, entry.checkedFingerprint); assert.equal(decision.draftSha256, entry.draftSha256)
    assert.equal(decision.ownerRole, 'project_owner'); assert.equal(decision.date, '2026-10-15')
    assert.match(decision.reason, /Разрешаю публикацию этого пакета/)
    assert.equal(decision.independentReviewer, null); assert.equal(decision.scientificReviewStatus, 'pending')
    assert.equal(s.images.length, 0); assert.equal(s.nationalRedBook.year, 2006)
    assert.match(s.nationalRedBook.edition, /историческ/)
  }
  for (const id of ['tulipa-anadroma', 'eryx-tataricus']) assert.ok(!source.catalog.some(s => s.id === id))
  assert.ok(registry.candidates.every(c => c.approval === null))
})

test('repeat of the exact authorized package adds zero, preserves source bytes and grants no scientific approvals', async () => {
  const hashBefore = digest(await readFile(`${PROJECT_ROOT}/data/species.source.json`))
  const repeat = await runPipeline(PROJECT_ROOT, ['provisional', '--registry', journal.registry, '--manifest', journal.manifest,
    '--mode', 'dry-run', '--owner-role', 'project_owner', '--decision-id', journal.decisionId,
    '--date', journal.records[0].date, '--reason', journal.records[0].reason])
  assert.deepEqual(repeat.counts, { processed: 21, added: 0, unchanged: 21, rejected: 0 })
  assert.equal(repeat.applied, false); assert.equal(repeat.scientificApproval, null)
  const checked = await runPipeline(PROJECT_ROOT, ['check', '--registry', journal.registry])
  assert.equal(checked.states.imported, 21); assert.equal(checked.states.approved_for_import, 0)
  assert.ok(checked.results.every(r => r.errors.length === 0))
  assert.equal(digest(await readFile(`${PROJECT_ROOT}/data/species.source.json`)), hashBefore)
})
