import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { execFileSync } from 'node:child_process'
import { runPipeline } from '../scripts/bulk-pipeline.mjs'
import { checkRegistry, createRegistry, digest, fingerprint } from '../scripts/lib/research-pipeline.mjs'
import { createLocalAdapter } from '../scripts/lib/local-research-adapter.mjs'
import { syntheticCandidate } from './helpers/synthetic-bulk-candidates.mjs'
import { validateSpecies } from '../src/data/species-model.js'
import { importBatchFile } from '../scripts/import-species-batch.mjs'

const read = async p => JSON.parse(await readFile(p, 'utf8'))
const source = await read(new URL('../data/backups/bulk-25-provisional/species.source.json', import.meta.url))
const json = (root, path, value) => writeFile(join(root, path), JSON.stringify(value, null, 2) + '\n')
const args = ['provisional', '--registry', 'data/research/queue.json', '--manifest', 'data/research/review.json',
  '--mode', 'dry-run', '--owner-role', 'project_owner', '--decision-id', 'synthetic-owner-decision',
  '--date', '2026-10-14', '--reason', 'Synthetic owner authorization; no scientific review']
const mode = value => args.map((v, i) => args[i - 1] === '--mode' ? value : v)
async function fixture(fn) {
  const root = await mkdtemp(join(tmpdir(), 'muras-provisional-'))
  try {
    await mkdir(join(root, 'data/research'), { recursive: true })
    await json(root, 'data/species.source.json', source)
    execFileSync('git', ['init', '-b', 'feature/bulk-import', root], { stdio: 'pipe' })
    const registry = createRegistry([syntheticCandidate(1), syntheticCandidate(2)])
    const checked = await checkRegistry(registry, source, { adapter: createLocalAdapter(root) })
    await json(root, 'data/research/queue.json', checked.registry)
    const manifest = { schemaVersion: 1, documentType: 'independent-scientific-review-manifest', registry: 'data/research/queue.json',
      registryFingerprint: fingerprint(checked.registry), candidateIds: checked.registry.candidates.map(c => c.id),
      candidates: await Promise.all(checked.registry.candidates.map(async c => ({ id: c.id, draftFile: c.draftFile,
        draftSha256: (await createLocalAdapter(root).load(c)).draftSha256, checkedFingerprint: c.checkedFingerprint }))), withheldCandidates: [] }
    await json(root, 'data/research/review.json', manifest)
    await fn(root, checked.registry, manifest)
  } finally { assert.ok(root.startsWith(join(tmpdir(), 'muras-provisional-'))); await rm(root, { recursive: true, force: true }) }
}

test('owner publication adds one whole package, journals the decision, preserves scientific pending and repeats without duplicates', async () => fixture(async root => {
  const before = await readFile(join(root, 'data/species.source.json'))
  const registryBefore = await readFile(join(root, 'data/research/queue.json'))
  const preview = await runPipeline(root, args)
  assert.equal(preview.counts.added, 2)
  assert.deepEqual(await readFile(join(root, 'data/species.source.json')), before)
  await assert.rejects(readFile(join(root, 'data/research/publication-decisions/synthetic-owner-decision.json')), /ENOENT/)
  const applied = await runPipeline(root, mode('apply'))
  assert.equal(applied.counts.added, 2); assert.equal(applied.applied, true)
  const after = await read(join(root, 'data/species.source.json'))
  assert.deepEqual(after.catalog.slice(0, 40), source.catalog)
  assert.deepEqual(after.demoArchive, source.demoArchive)
  for (const s of after.catalog.slice(40)) {
    assert.equal(s.publication.status, 'provisional'); assert.equal(s.publication.scientificReviewStatus, 'pending')
    assert.equal(s.publication.independentReviewer, null); assert.equal(s.verified, false); assert.equal(s.lastReviewedAt, null)
    assert.equal(s.population.reviewStatus, 'pending'); assert.deepEqual(validateSpecies([s]), [])
    assert.ok(validateSpecies([{ ...s, verified: true }]).some(e => e.includes('publication')))
  }
  const journal = await read(join(root, 'data/research/publication-decisions/synthetic-owner-decision.json'))
  assert.equal(journal.scientificApproval, null); assert.equal(journal.records.length, 2)
  assert.ok(journal.records.every(r => r.ownerRole === 'project_owner' && r.independentReviewer === null))
  assert.deepEqual(await readFile(join(root, 'data/research/queue.json')), registryBefore)
  const checked = await runPipeline(root, ['check', '--registry', 'data/research/queue.json'])
  assert.equal(checked.states.imported, 2); assert.equal(checked.states.approved_for_import, 0)
  const repeat = await runPipeline(root, args)
  assert.equal(repeat.counts.added, 0); assert.equal(repeat.counts.unchanged, 2)
  const repeatApply = await runPipeline(root, mode('apply'))
  assert.equal(repeatApply.counts.added, 0); assert.equal(repeatApply.applied, false)
  // The same decision cannot authorize a later, different selection.
  const registry = await read(join(root, 'data/research/queue.json'))
  registry.candidates.push(...createRegistry([syntheticCandidate(3)]).candidates)
  await json(root, 'data/research/queue.json', registry)
  const next = await checkRegistry(registry, after, { adapter: createLocalAdapter(root) })
  const c = registry.candidates.at(-1), loaded = await createLocalAdapter(root).load(c)
  await json(root, 'data/research/review.json', { schemaVersion: 1, documentType: 'independent-scientific-review-manifest',
    registry: 'data/research/queue.json', registryFingerprint: fingerprint(registry), candidateIds: [c.id],
    candidates: [{ id: c.id, draftFile: c.draftFile, draftSha256: loaded.draftSha256,
      checkedFingerprint: next.report.results.find(r => r.candidateId === c.id).fingerprint }], withheldCandidates: [] })
  const catalogBeforeNext = await readFile(join(root, 'data/species.source.json'))
  await assert.rejects(runPipeline(root, mode('apply')), /ID решения уже занят/)
  assert.deepEqual(await readFile(join(root, 'data/species.source.json')), catalogBeforeNext)
}))

test('missing owner decision, main, stale fingerprints and a blocked concept cannot use provisional publication', async () => fixture(async (root, registry, manifest) => {
  const before = await readFile(join(root, 'data/species.source.json'))
  await assert.rejects(runPipeline(root, args.filter((_, i) => ![args.indexOf('--reason'), args.indexOf('--reason') + 1].includes(i))), /явным разрешением/)
  await assert.rejects(runPipeline(root, [...args, '--reviewer', 'Invented']), /не поддерживается/)
  execFileSync('git', ['symbolic-ref', 'HEAD', 'refs/heads/main'], { cwd: root })
  await assert.rejects(runPipeline(root, mode('apply')), /main/)
  execFileSync('git', ['symbolic-ref', 'HEAD', 'refs/heads/feature/bulk-import'], { cwd: root })
  manifest.candidates[0].checkedFingerprint = '0'.repeat(64)
  await json(root, 'data/research/review.json', manifest)
  await assert.rejects(runPipeline(root, mode('apply')), /актуального технического допуска/)
  registry.candidates[1].contradictions = ['Synthetic unresolved taxonomy']
  await json(root, 'data/research/queue.json', registry)
  const checked = await checkRegistry(registry, source, { adapter: createLocalAdapter(root) })
  manifest.registryFingerprint = fingerprint(registry)
  manifest.candidates = manifest.candidates.map(e => ({ ...e, checkedFingerprint: checked.report.results.find(r => r.candidateId === e.id).fingerprint }))
  await json(root, 'data/research/review.json', manifest)
  await assert.rejects(runPipeline(root, mode('apply')), /synthetic-2/)
  assert.deepEqual(await readFile(join(root, 'data/species.source.json')), before)
  const legacy = await runPipeline(root, ['apply', '--registry', 'data/research/queue.json'])
  assert.equal(legacy.states.approved_for_import, 0); assert.equal(legacy.states.imported, 0)
  assert.deepEqual(await readFile(join(root, 'data/species.source.json')), before)
}))

test('atomic import option refuses a partially valid package before any catalog write', async () => fixture(async root => {
  const one = syntheticCandidate(1), two = syntheticCandidate(2)
  two.draft.sources = []
  await json(root, 'packet.json', { schemaVersion: 1, documentType: 'species-import-batch', batchId: 'synthetic-atomic',
    records: [one, two].map(c => ({ candidateId: c.id, species: c.draft, taxonomyEvidence: c.taxonomyEvidence })) })
  const before = await readFile(join(root, 'data/species.source.json'))
  await assert.rejects(importBatchFile(root, 'packet.json', { apply: true, requireAllValid: true }), /Весь пакет отменён/)
  assert.deepEqual(await readFile(join(root, 'data/species.source.json')), before)
}))
