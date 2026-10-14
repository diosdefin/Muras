import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir, mkdtemp, rm, readdir, stat, symlink } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { execFileSync } from 'node:child_process'
import { performance } from 'node:perf_hooks'
import { createRegistry, checkRegistry, parseCsv, digest, validateRegistry } from '../scripts/lib/research-pipeline.mjs'
import { createLocalAdapter, inspectPipelineAssets } from '../scripts/lib/local-research-adapter.mjs'
import { runPipeline } from '../scripts/bulk-pipeline.mjs'
import { canApplyOnBranch, importBatchFile } from '../scripts/import-species-batch.mjs'
import { planBatchImport } from '../scripts/lib/bulk-import.mjs'
import { scientificContent } from '../src/data/localization.js'
import { syntheticCandidate } from './helpers/synthetic-bulk-candidates.mjs'

const sourceBytes = await readFile(new URL('../data/species.source.json', import.meta.url))
const source = JSON.parse(sourceBytes)
const json = (root, path, value) => writeFile(join(root, path), JSON.stringify(value, null, 2) + '\n')
const registryArgs = ['--registry', 'data/research/queue.json']
async function temporary(fn, { git = false } = {}) {
  const root = await mkdtemp(join(tmpdir(), 'muras-pipeline-'))
  try {
    await mkdir(join(root, 'data/research'), { recursive: true })
    await writeFile(join(root, 'data/species.source.json'), sourceBytes)
    if (git) { execFileSync('git', ['init', '-b', 'feature/bulk-import', root], { stdio: 'pipe' }) }
    return await fn(root)
  } finally {
    // mkdtemp supplies an absolute root; deletion never targets another checkout.
    assert.ok(root.startsWith(join(tmpdir(), 'muras-pipeline-')))
    await rm(root, { recursive: true, force: true })
  }
}
const check = (root, registry, options = {}) => checkRegistry(registry, source, {
  adapter: createLocalAdapter(root), validateAssets: s => inspectPipelineAssets(root, s), ...options })

test('CSV supports UTF-8 BOM, quoted commas, doubled quotes, embedded CRLF, empty values and rejects broken rows', () => {
  assert.deepEqual(parseCsv('\uFEFFid,originalScientificName,note\r\na,"Testophyta alpha","Кыргызча, русский ""текст""\r\nnext"\r\nb,Testophyta beta,\r\n'), [
    { id: 'a', originalScientificName: 'Testophyta alpha', note: 'Кыргызча, русский "текст"\r\nnext' },
    { id: 'b', originalScientificName: 'Testophyta beta', note: '' }])
  for (const input of ['id,id\na,b', 'id,name\na', 'id\n"unterminated', 'id\n"a"x', 'id\na"b']) assert.throws(() => parseCsv(input), /CSV/)
  assert.throws(() => createRegistry(Array.from({ length: 201 }, (_, i) => ({ id: `x-${i}` }))), /200/)
  assert.throws(() => createRegistry([{ id: 'x' }, { id: 'x' }]), /повторяющийся/)
  assert.throws(() => createRegistry([{ id: '../x' }]), /ID/)
  assert.throws(() => createRegistry([{ id: 'x' }], { batchSize: 26 }), /25/)
  assert.throws(() => createRegistry(JSON.parse('[{"id":"x","__proto__":{}}]')), /безопасный/)
  const reg = createRegistry([{ ...syntheticCandidate(1), state: 'approved_for_import', approval: { decision: 'approve' } }])
  assert.equal(reg.candidates[0].state, 'pending'); assert.equal(reg.candidates[0].approval, null)
})

test('CLI init preserves CSV and JSON evidence without translating names, and refuses overwriting a registry', async () => temporary(async root => {
  const c = syntheticCandidate(1), headers = ['id', 'originalScientificName', 'acceptedScientificName', 'rank', 'group', 'nationalRedBook', 'countryOccurrence', 'taxonomyEvidence', 'taxonomySourceIds', 'sources', 'draft']
  const escape = text => `"${text.replaceAll('"', '""')}"`
  await writeFile(join(root, 'input.csv'), '\uFEFF' + headers.join(',') + '\r\n' + headers.map(k => escape(typeof c[k] === 'string' ? c[k] : JSON.stringify(c[k]))).join(',') + '\r\n')
  await runPipeline(root, ['init', '--input', 'input.csv', ...registryArgs])
  const result = await runPipeline(root, ['check', ...registryArgs])
  assert.equal(result.counts.accepted, 1)
  assert.equal(result.results[0].readiness.photo, 'placeholder')
  assert.deepEqual(result.results[0].readiness.translationRequired, ['ky', 'uz', 'en'])
  assert.deepEqual(scientificContent(c.draft.content.shortDescription.text, 'uz'), { text: c.draft.content.shortDescription.text.ru, language: 'ru', fallback: true })
  await assert.rejects(runPipeline(root, ['init', '--input', 'input.csv', ...registryArgs]), /EEXIST/)
  await assert.rejects(runPipeline(root, ['check', ...registryArgs, '--report', 'data/species.source.json']), /generated/)
  await assert.rejects(runPipeline(root, ['report', '--registry', 'data/species.source.json']), /research/)
  await assert.rejects(runPipeline(root, ['check', ...registryArgs, '--batch', '0']), /партии/)
}))

test('science gates bind national, KG and taxonomy sources, isolate bad candidates, and forbid historical legal claims/automatic verification', async () => temporary(async root => {
  const modifications = [
    c => { c.nationalRedBook.listed = false },
    c => { c.nationalRedBook.claimsCurrentLegalStatus = true },
    c => { c.nationalRedBook.basis = 'current_legal_list'; c.nationalRedBook.claimsCurrentLegalStatus = true },
    c => { c.countryOccurrence.confirmed = false },
    c => { c.sources[0].supports = c.sources[0].supports.filter(k => k !== 'scientificName') },
    c => { c.taxonomyEvidence.rank = 'SUBSPECIES' },
    c => { c.draft.verified = true },
    c => { c.draft.population.reviewStatus = 'approved' },
    c => { c.draft.sources = structuredClone(c.draft.sources); c.draft.sources[0].url = 'https://example.invalid/changed' },
    c => { c.contradictions = ['Unresolved concept'] },
    c => { c.missingData = ['National source missing'] },
    c => { c.draft.content.shortDescription.sourceIds = ['missing'] },
    c => { c.draft.regions = null },
    c => { c.sources = [null] },
  ]
  const candidates = modifications.map((edit, i) => { const c = structuredClone(syntheticCandidate(i + 1)); edit(c); return c })
  candidates.push(syntheticCandidate(50))
  const plan = await check(root, createRegistry(candidates))
  assert.equal(plan.report.counts.accepted, 1)
  assert.equal(plan.batches[0].approved.records.length, 0)
  assert.ok(plan.report.results.slice(0, -1).every(r => r.errors.length))
  await assert.rejects(planBatchImport(source, plan.batches[0].drafts), /Пакет/)
  const corrupt = createRegistry([{ id: 'a' }]); corrupt.candidates[0].state = 'invented'
  assert.throws(() => validateRegistry(corrupt), /состояние/)
}))

test('one shared taxon index detects ID/name/taxon and species/subspecies conflicts across batches and archive', async () => temporary(async root => {
  const a = syntheticCandidate(1), b = syntheticCandidate(2)
  b.acceptedScientificName = b.originalScientificName = 'Testophyta taxon1 minor'; b.rank = 'SUBSPECIES'
  const catalog = syntheticCandidate(3); catalog.acceptedScientificName = source.catalog[0].scientificName
  const archive = syntheticCandidate(4); archive.id = source.demoArchive[0].id
  const key = syntheticCandidate(5); key.taxonomyEvidence.taxonId = a.taxonomyEvidence.taxonId
  const results = (await check(root, createRegistry([a, b, catalog, archive, key], { batchSize: 1 }))).report.results
  assert.ok(results.every(r => r.state === 'rejected'))
  assert.match(results[0].errors.join(';'), /реестре/)
  assert.match(results[2].errors.join(';'), /существует/)
}))

test('local snapshots are read once, checked by hash, changed material/drafts invalidate approval; traversal and symlink reads fail', async () => temporary(async root => {
  await writeFile(join(root, 'snapshot.txt'), 'local-reviewed-evidence')
  const materials = [{ path: 'snapshot.txt', sha256: digest('local-reviewed-evidence') }]
  const a = syntheticCandidate(1), b = syntheticCandidate(2); a.materials = b.materials = materials
  await json(root, 'draft.json', a.draft); a.draft = null; a.draftFile = 'draft.json'
  const adapter = createLocalAdapter(root), registry = createRegistry([a, b])
  const result = await check(root, registry, { adapter })
  assert.equal(result.report.counts.accepted, 2); assert.equal(adapter.reads, 2)
  a.materials[0].sha256 = '0'.repeat(64)
  assert.match((await check(root, createRegistry([a]))).report.results[0].errors.join(';'), /Материал изменён/)
  a.draftFile = '../outside.json'
  assert.match((await check(root, createRegistry([a]))).report.results[0].errors.join(';'), /вне проекта/)
  let linked = false
  try { await symlink(process.cwd(), join(root, 'outside'), process.platform === 'win32' ? 'junction' : 'dir'); linked = true }
  catch (error) { if (!['EPERM', 'EACCES'].includes(error.code)) throw error }
  if (linked) {
    await assert.rejects(createLocalAdapter(root).load({ draftFile: 'outside/data/species.source.json', materials: [] }), /вне проекта/)
    await mkdir(join(root, '.generated')); await mkdir(join(root, 'public'))
    await writeFile(join(root, 'public/marker.json'), 'public-marker')
    await symlink(join(root, 'public'), join(root, '.generated/alias'), process.platform === 'win32' ? 'junction' : 'dir')
    await json(root, 'data/research/queue.json', createRegistry([syntheticCandidate(3)]))
    await assert.rejects(runPipeline(root, ['report', ...registryArgs, '--report', '.generated/alias/marker.json']), /symlink\/junction/)
    assert.equal(await readFile(join(root, 'public/marker.json'), 'utf8'), 'public-marker')
  }
}))

test('apply needs explicit fingerprint-bound review, preserves 40 records/archive, creates exact backup, and repeats without duplicates', async () => temporary(async root => {
  const c = syntheticCandidate(1)
  await json(root, 'input.json', [c]); await runPipeline(root, ['init', '--input', 'input.json', ...registryArgs])
  const bytes = await readFile(join(root, 'data/research/queue.json'))
  await runPipeline(root, ['check', ...registryArgs]); await runPipeline(root, ['report', ...registryArgs])
  assert.deepEqual(await readFile(join(root, 'data/research/queue.json')), bytes)
  assert.deepEqual(await readFile(join(root, 'data/species.source.json')), sourceBytes)
  assert.deepEqual((await readdir(root)).sort(), ['data', 'input.json', '.git'].sort())
  assert.equal((await runPipeline(root, ['apply', ...registryArgs])).states.imported, 0)
  assert.deepEqual(await readFile(join(root, 'data/species.source.json')), sourceBytes)
  await assert.rejects(runPipeline(root, ['approve', ...registryArgs, '--candidate', c.id]), /reviewer/)
  await runPipeline(root, ['approve', ...registryArgs, '--candidate', c.id, '--reviewer', 'Test reviewer', '--date', '2026-10-14', '--reason', 'Synthetic test review'])
  const approved = JSON.parse(await readFile(join(root, 'data/research/queue.json')))
  assert.equal(approved.candidates[0].state, 'approved_for_import'); assert.equal(approved.candidates[0].draft.verified, false)
  assert.equal(approved.candidates[0].diagnostics.state, 'approved_for_import')
  const applied = await runPipeline(root, ['apply', ...registryArgs])
  assert.equal(applied.states.imported, 1); assert.equal(applied.applications[0].counts.added, 1)
  assert.equal(JSON.parse(await readFile(join(root, 'data/research/queue.json'))).candidates[0].diagnostics.state, 'imported')
  const after = JSON.parse(await readFile(join(root, 'data/species.source.json')))
  assert.deepEqual(after.catalog.slice(0, 40), source.catalog); assert.deepEqual(after.demoArchive, source.demoArchive)
  const backups = await readdir(join(root, '.generated/import-backups')); assert.equal(backups.length, 1)
  assert.deepEqual(await readFile(join(root, '.generated/import-backups', backups[0])), sourceBytes)
  const mtime = (await stat(join(root, 'data/species.source.json'))).mtimeMs
  assert.equal((await runPipeline(root, ['apply', ...registryArgs])).states.imported, 1)
  assert.equal((await stat(join(root, 'data/species.source.json'))).mtimeMs, mtime)
  // Simulate a process stopping immediately after the source rename but before checkpoint.
  await json(root, 'data/research/queue.json', approved)
  const recovered = await runPipeline(root, ['apply', ...registryArgs])
  assert.equal(recovered.states.imported, 1); assert.equal(recovered.counts.rejected, 0)
  assert.equal((await stat(join(root, 'data/species.source.json'))).mtimeMs, mtime)
}, { git: true }))

test('edited draft or photo metadata cannot reuse approval; photo/license validation remains strict but placeholders are accepted', async () => temporary(async root => {
  const c = syntheticCandidate(1)
  await json(root, 'draft.json', c.draft); c.draft = null; c.draftFile = 'draft.json'
  await json(root, 'input.json', [c]); await runPipeline(root, ['init', '--input', 'input.json', ...registryArgs])
  await runPipeline(root, ['approve', ...registryArgs, '--candidate', c.id, '--reviewer', 'Editor', '--date', '2026-10-14', '--reason', 'Test review'])
  const draft = JSON.parse(await readFile(join(root, 'draft.json'))); draft.content.overview.text.ru += ' Изменение.'
  await json(root, 'draft.json', draft)
  const changed = await runPipeline(root, ['check', ...registryArgs]); assert.equal(changed.states.approved_for_import, 0); assert.equal(changed.states.ready_for_review, 1)
  assert.match(changed.results[0].warnings.join(' '), /устарело/)
  const photo = structuredClone(source.catalog.find(s => s.images.length).images[0])
  await mkdir(join(root, dirname(photo.path)), { recursive: true })
  await writeFile(join(root, photo.path), await readFile(new URL('../' + photo.path, import.meta.url)))
  const imageSpecies = { ...syntheticCandidate(2).draft, images: [photo] }
  photo.license = 'CC BY 4.0'; photo.licenseUrl = 'https://example.invalid/license'
  const errors = await inspectPipelineAssets(root, imageSpecies)
  assert.match(errors.join(';'), /URL не соответствует лицензии CC/)
  const photoCandidate = syntheticCandidate(2); photoCandidate.draft.images = [photo]
  assert.equal((await check(root, createRegistry([photoCandidate]))).report.results[0].state, 'needs_photo')
  assert.deepEqual(await inspectPipelineAssets(root, syntheticCandidate(2).draft), [])
}))

test('one invalid approved draft cannot block another approved candidate, and a substituted packet is refused before source writes', async () => temporary(async root => {
  await json(root, 'input.json', [syntheticCandidate(1), syntheticCandidate(2)])
  await runPipeline(root, ['init', '--input', 'input.json', ...registryArgs])
  for (const id of ['synthetic-1', 'synthetic-2']) await runPipeline(root, ['approve', ...registryArgs, '--candidate', id, '--reviewer', 'Editor', '--date', '2026-10-14', '--reason', 'Synthetic review'])
  const registry = JSON.parse(await readFile(join(root, 'data/research/queue.json')))
  registry.candidates[0].draft.taxonomy.genus = 'Unsupported'
  await json(root, 'data/research/queue.json', registry)
  const applied = await runPipeline(root, ['apply', ...registryArgs])
  assert.equal(applied.states.imported, 1)
  assert.equal(applied.applications[0].counts.added, 1)
  const after = JSON.parse(await readFile(join(root, 'data/species.source.json')))
  assert.equal(after.catalog.at(-1).id, 'synthetic-2'); assert.equal(after.catalog.length, 41)
  const packet = { schemaVersion: 1, documentType: 'species-import-batch', batchId: 'substituted-test', records: [] }
  await json(root, 'packet.json', packet)
  const before = await readFile(join(root, 'data/species.source.json'))
  await assert.rejects(importBatchFile(root, 'packet.json', { apply: true, expectedBatchSha256: '0'.repeat(64) }), /Пакет изменился/)
  assert.deepEqual(await readFile(join(root, 'data/species.source.json')), before)
}, { git: true }))

test('main and unapproved candidates remain protected; registry/report paths cannot overwrite public data', async () => temporary(async root => {
  assert.equal(canApplyOnBranch('main'), false); assert.equal(canApplyOnBranch('feature/bulk-import'), true)
  execFileSync('git', ['symbolic-ref', 'HEAD', 'refs/heads/main'], { cwd: root })
  await json(root, 'data/research/queue.json', createRegistry([syntheticCandidate(1)]))
  await assert.rejects(runPipeline(root, ['apply', ...registryArgs]), /main/)
  assert.deepEqual(await readFile(join(root, 'data/species.source.json')), sourceBytes)
  await assert.rejects(runPipeline(root, ['resume', '--registry', 'public/data/species.json']), /research/)
  await writeFile(join(root, 'data/research/queue.json.pipeline.lock'), 'foreign lock')
  await assert.rejects(runPipeline(root, ['resume', ...registryArgs]), /EEXIST/)
  assert.equal(await readFile(join(root, 'data/research/queue.json.pipeline.lock'), 'utf8'), 'foreign lock')
}, { git: true }))

test('200 candidates: eight checkpoints, isolated rejection, resumable processing, resource metrics and zero public writes', async t => temporary(async root => {
  const candidates = Array.from({ length: 200 }, (_, i) => syntheticCandidate(i + 1))
  await writeFile(join(root, 'snapshot.txt'), 'shared-local-evidence')
  for (const [i, c] of candidates.entries()) {
    c.materials = [{ path: 'snapshot.txt', sha256: digest('shared-local-evidence') }]
    if (i >= 140 && i < 170) { c.sources = []; c.draft = null }
    if (i >= 170 && i < 190) c.contradictions = ['Unresolved synthetic taxonomy']
    if (i >= 190) c.acceptedScientificName = source.catalog[i - 190].scientificName
  }
  const registry = createRegistry(candidates), adapter = createLocalAdapter(root), before = performance.now()
  const initial = await check(root, registry, { adapter })
  assert.deepEqual(initial.report.counts, { processed: 200, accepted: 140, deferred: 50, rejected: 10 })
  assert.equal(initial.batches.length, 8); assert.equal(adapter.reads, 1)
  const checkMs = performance.now() - before
  await json(root, 'data/research/queue.json', registry)
  // Simulate interruption after batch 1; subsequent resume continues all checkpoints safely.
  const partial = await check(root, registry, { batchNumber: 1 }); await json(root, 'data/research/queue.json', partial.registry)
  const resumed = await runPipeline(root, ['resume', ...registryArgs])
  assert.deepEqual(resumed.counts, initial.report.counts)
  assert.equal((await readdir(join(root, '.generated/bulk-pipeline/research-queue'))).filter(p => p.startsWith('batch-')).length, 8)
  const repeated = await runPipeline(root, ['resume', ...registryArgs])
  assert.deepEqual(repeated.counts, initial.report.counts)
  assert.deepEqual(await readFile(join(root, 'data/species.source.json')), sourceBytes)
  assert.ok(repeated.metrics.durationMs >= 0); assert.equal(repeated.metrics.localMaterialReads, 1)
  assert.equal(repeated.metrics.memory.rss > 0, true)
  t.diagnostic(JSON.stringify({ scenario: '200 temporary synthetic candidates', checkMs: Number(checkMs.toFixed(2)), ...resumed.counts, ...resumed.metrics }))
}))
