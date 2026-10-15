import { readFile, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { checkRegistry, digest, fingerprint } from './lib/research-pipeline.mjs'
import { createLocalAdapter, inspectPipelineAssets } from './lib/local-research-adapter.mjs'
const read = async p => JSON.parse(await readFile(p, 'utf8'))
const n = /^\d+$/.test(process.argv[2] || '') ? Number(process.argv[2]) : undefined
const manifestOption = process.argv.indexOf('--manifest')
const manifest = await read(manifestOption < 0 ? 'data/research/bulk-25-content-manifest.json' : process.argv[manifestOption + 1])
const contentDirectory = manifest.contentDirectory || 'data/research/bulk-25-content'
const evidencePrefix = manifest.evidencePrefix || 'bulk-25'
const master = await read('data/research/redbook-master-registry.json')
const registry = await read(manifest.registryFile || 'data/research/bulk-25-content-registry.json')
const source = await read('data/species.source.json')
assert.equal(source.catalog.length, manifest.baselineCatalogCount || 40)
assert.equal(fingerprint(master), manifest.masterRegistryFingerprint)
assert.deepEqual(registry.candidates.map(c => c.id), manifest.candidateIds)
const eligible = master.candidates.filter(c => c.state === 'research_ready' &&
  (!manifest.excludePublished || !source.catalog.some(s => s.id === c.id)) && !(manifest.excludedIds || []).includes(c.id))
assert.deepEqual(manifest.candidateIds, eligible.slice(0, manifest.selectionLimit || 25).map(c => c.id))
const preservation = await read(`docs/evidence/${evidencePrefix}-preservation.json`)
for (const [path, sha] of Object.entries(preservation)) assert.equal(digest(await readFile(path)), sha, `${path}: baseline changed`)
const checked = await checkRegistry(registry, source, { adapter: createLocalAdapter(process.cwd()),
  validateAssets: s => inspectPipelineAssets(process.cwd(), s), batchNumber: n })
const selected = n ? registry.candidates.slice((n - 1) * registry.batchSize, n * registry.batchSize) : registry.candidates
const quality = []
for (const c of selected) {
  assert.equal(c.approval, null)
  const result = checked.report.results.find(r => r.candidateId === c.id)
  const evidenceDeferred = Boolean(c.contradictions.length || c.missingData.length)
  assert.equal(result.state, evidenceDeferred ? 'needs_evidence' : 'ready_for_review', `${c.id}: ${result.errors.join('; ')}`)
  assert.deepEqual(result.errors, evidenceDeferred ? ['Есть нерешённые противоречия или обязательные пробелы'] : [])
  const s = await read(c.draftFile)
  assert.equal(s.verified, false)
  assert.equal(s.lastReviewedAt, null)
  assert.equal(s.population.type, 'unknown')
  assert.equal(s.population.reviewStatus, 'pending')
  assert.equal(s.regions.length, 1)
  assert.equal(s.regions[0].code, 'KG')
  assert.equal(s.iucn.category, null)
  assert.deepEqual(Object.keys(s.content), ['shortDescription', 'overview', 'appearance', 'ecology', 'diet', 'reproduction', 'distribution'])
  assert.ok(s.content.shortDescription.text.ru.length >= 120 && s.content.shortDescription.text.ru.length <= 180, c.id + ': RU short length')
  for (const language of ['ky', 'uz', 'ru', 'en']) assert.ok(s.content.shortDescription.text[language])
  assert.ok(!/[А-Яа-яЁё]/.test(s.content.shortDescription.text.uz))
  assert.ok(s.content.overview.text.ru)
  const words = s.content.overview.text.ru.trim().split(/\s+/u).length
  assert.ok(words >= 120 && words <= 250, `${c.id}: overview ${words} words`)
  if (s.group === 'plants') assert.equal(s.content.diet, null)
  assert.ok(s.sources.every(s => s.url.startsWith('https://') && s.supports.length))
  for (const image of s.images) assert.ok(image.path.startsWith('assets/images/species/'))
  assert.deepEqual(await inspectPipelineAssets(process.cwd(), s), [])
  quality.push({ candidateId: c.id, nationalEvidence: c.nationalConfirmation, taxonomyEvidence: c.taxonomyEvidence,
    scientificSources: s.sources.map(r => ({ id: r.id, url: r.url })), shortLengthRu: s.content.shortDescription.text.ru.length,
    overviewWordsRu: words, languages: result.readiness, missingFacts: c.missingFacts, editorialNotes: c.editorialNotes,
    technicalErrors: [], scientificBlockers: evidenceDeferred ? [...c.contradictions, ...c.missingData] : [],
    independentReview: evidenceDeferred ? 'requires_specialist_resolution' : 'pending', importPermission: 'absent', state: result.state })
}
const report = { schemaVersion: 1, documentType: 'unpublished-content-quality-report',
  preservedFiles: Object.keys(preservation).length, sourceCatalogCount: source.catalog.length,
  pipeline: checked.report, quality }
const path = `docs/evidence/${evidencePrefix}-${n ? `block-${n}` : 'final'}-validation.json`
await writeFile(path, JSON.stringify(report, null, 2) + '\n')
for (const batch of checked.batches) await writeFile(`${contentDirectory}/block-${batch.number}-drafts.json`, JSON.stringify(batch.drafts, null, 2) + '\n')
console.log(JSON.stringify({ report: path, prepared: quality.length, readyForReview: quality.filter(q => q.state === 'ready_for_review').length,
  needsEvidence: quality.filter(q => q.state === 'needs_evidence').length, preservedFiles: report.preservedFiles, approved: 0, imported: 0 }))
