import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createRegistry, validateRegistry, checkRegistry, digest } from '../scripts/lib/research-pipeline.mjs'
import { createLocalAdapter } from '../scripts/lib/local-research-adapter.mjs'
import { validateSpecies } from '../src/data/species-model.js'
import { discoverCandidates, runDiscovery } from '../scripts/discover-research-candidates.mjs'
import { canApplyOnBranch, IMPORT_BRANCHES } from '../scripts/import-species-batch.mjs'
import { syntheticCandidate } from './helpers/synthetic-bulk-candidates.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const source = { schemaVersion: 1, catalog: [syntheticCandidate(1).draft], demoArchive: [syntheticCandidate(2).draft] }
const queue = rows => createRegistry(rows, { registryId: 'discovery-test' })
const candidate = overrides => ({ ...syntheticCandidate(3), ...overrides })

test('discovery flags published and archived identities without granting publication or changing scientific states', () => {
  const registry = queue([syntheticCandidate(1), syntheticCandidate(2), syntheticCandidate(3)])
  const before = JSON.stringify({ registry, source }), result = discoverCandidates(registry, source)
  assert.deepEqual(result.counts, { needs_research: 1, existing_match_requires_review: 2, identity_conflict: 0 })
  assert.equal(result.candidates[0].matches[0].location, 'catalog')
  assert.equal(result.candidates[1].matches[0].location, 'archive')
  assert.equal(result.candidates[2].storedState, 'pending')
  assert.equal(result.nationalInclusionVerified, false); assert.equal(result.publicationAuthorized, false)
  assert.equal(JSON.stringify({ registry, source }), before)
})

test('discovery checks historical names, exact stored identifiers and species/subspecies overlap', () => {
  const historical = discoverCandidates(queue([candidate({ originalScientificName: 'Testophyta taxon1' })]), source)
  assert.equal(historical.candidates[0].matches[0].reason, 'documented_name')
  const identifier = discoverCandidates(queue([candidate({ taxonomyEvidence: { ...syntheticCandidate(3).taxonomyEvidence, taxonId: 'gbif:80000002' } })]), source)
  assert.ok(identifier.candidates[0].matches.some(m => m.location === 'archive' && m.reason === 'saved_taxon_id'))
  const overlap = discoverCandidates(queue([candidate({ acceptedScientificName: 'Testophyta taxon1 subsp. minor', rank: 'SUBSPECIES' })]), source)
  assert.equal(overlap.candidates[0].disposition, 'identity_conflict')
  assert.ok(overlap.candidates[0].matches.some(m => m.reason === 'species_subspecies_overlap'))
})

test('queue-wide identity conflicts and evidence-blocked candidates remain visible without promotion', () => {
  const c = syntheticCandidate(4); c.originalScientificName = 'Testophyta taxon3'
  const registry = queue([syntheticCandidate(3), c, candidate({ id: 'blocked', acceptedScientificName: null, originalScientificName: null, taxonomyEvidence: null })])
  registry.candidates[2].state = 'needs_evidence'
  const result = discoverCandidates(registry, source)
  assert.equal(result.candidates[0].disposition, 'identity_conflict')
  assert.equal(result.candidates[1].disposition, 'identity_conflict')
  assert.equal(result.candidates[2].storedState, 'needs_evidence')
  assert.equal(result.candidates[2].disposition, 'needs_research')
  assert.ok(result.limitations.some(s => s.includes('not proof of absence')))
})

test('discovery refuses malformed registries/catalogues and write or external-path arguments', async () => {
  assert.throws(() => discoverCandidates({ ...queue([]), schemaVersion: 2 }, source))
  assert.throws(() => discoverCandidates(queue([]), { ...source, catalog: [{}] }))
  for (const args of [['--apply'], ['--registry', '../outside.json'], ['--registry', 'C:/private.json'],
    ['--registry', 'data/research/../../private.json'], ['--registry', 'data/research/a.json', '--mode', 'apply']]) {
    await assert.rejects(runDiscovery(root, args))
  }
})

test('pending example matches actual schemas but cannot pass research readiness or authorize import', async () => {
  const template = JSON.parse(await readFile(new URL('../data/research/templates/new-species-candidate.example.json', import.meta.url)))
  validateRegistry(template)
  const c = template.candidates[0]
  assert.deepEqual(validateSpecies([c.draft]), [])
  assert.equal(c.state, 'pending'); assert.equal(c.approval, null)
  assert.equal(c.acceptedScientificName, null); assert.equal(c.nationalRedBook, null)
  assert.equal(c.draft.verified, false); assert.equal(c.draft.lastReviewedAt, null)
  assert.equal(c.draft.population.type, 'unknown'); assert.equal(c.draft.population.value, null)
  const checked = await checkRegistry(template, source, { adapter: createLocalAdapter('.') })
  assert.equal(checked.report.results[0].state, 'needs_evidence')
  assert.ok(checked.report.results[0].errors.length > 0)
  assert.deepEqual(checked.batches[0].approved.records, [])
})

test('real offline discovery is deterministic and leaves registry/catalogue bytes and objects unchanged', async () => {
  const registryPath = new URL('../data/research/redbook-master-registry.json', import.meta.url)
  const sourcePath = new URL('../data/species.source.json', import.meta.url)
  const registryBefore = await readFile(registryPath), sourceBefore = await readFile(sourcePath)
  const registry = JSON.parse(registryBefore), actual = JSON.parse(sourceBefore)
  const first = discoverCandidates(registry, actual), second = discoverCandidates(registry, actual)
  assert.deepEqual(first, second)
  assert.deepEqual(await runDiscovery(root), first)
  assert.equal(first.candidates.length, registry.candidates.length)
  assert.equal(first.catalogCount, actual.catalog.length); assert.equal(first.archiveCount, actual.demoArchive.length)
  assert.equal(digest(await readFile(registryPath)), digest(registryBefore))
  assert.equal(digest(await readFile(sourcePath)), digest(sourceBefore))
  assert.deepEqual(registry, JSON.parse(registryBefore)); assert.deepEqual(actual, JSON.parse(sourceBefore))
})

test('historical branch allowlist remains exact; main/master, local admin and arbitrary future branches stay forbidden', () => {
  for (const branch of IMPORT_BRANCHES) assert.equal(canApplyOnBranch(branch), true, branch)
  for (const branch of ['main', 'master', '', 'HEAD', 'Main', 'feature/', 'feature/catalog-201',
    'feature/local-file-admin', 'feature/release-preparation', 'feature/catalog-200/extra', 'feature/catalog-200 ']) {
    assert.equal(canApplyOnBranch(branch), false, branch)
  }
})
