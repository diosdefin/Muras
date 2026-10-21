import { isHistoricalEvidenceUnchanged } from '../scripts/lib/ui-design-scope.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PROJECT_ROOT } from '../scripts/build-data.mjs'
import { checkRegistry, fingerprint, digest } from '../scripts/lib/research-pipeline.mjs'
import { createLocalAdapter, inspectPipelineAssets } from '../scripts/lib/local-research-adapter.mjs'
import { planBatchImport } from '../scripts/lib/bulk-import.mjs'
import { checkCommonsMetadata } from '../scripts/prepare-batch-images.mjs'
import { validateSpecies } from '../src/data/species-model.js'
import { scientificContent } from '../src/data/localization.js'
import { speciesName, speciesNameLanguage } from '../src/data/presentation.js'
import { auditBulk25 } from '../scripts/audit-bulk-25-release.mjs'
const read = async p => JSON.parse(await readFile(`${PROJECT_ROOT}/${p}`, 'utf8'))
const registry = await read('data/research/bulk-25-content-registry.json')
const manifest = await read('data/research/bulk-25-content-manifest.json')
// Reproduce the 22.4 pre-import audit against its immutable 40-record snapshot.
// Current 63-record behavior is checked independently in provisional-catalog.test.
const source = await read('data/backups/bulk-25-provisional/species.source.json')
const master = await read('data/research/redbook-master-registry.json')
const options = () => ({ adapter: createLocalAdapter(PROJECT_ROOT), validateAssets: s => inspectPipelineAssets(PROJECT_ROOT, s) })

test('bulk-25 keeps stable accepted taxon order, the master registry and public baseline', async () => {
  assert.equal(source.catalog.length, 40)
  assert.equal(fingerprint(master), manifest.masterRegistryFingerprint)
  assert.deepEqual(manifest.candidateIds, master.candidates.filter(c => c.state === 'research_ready').slice(0, 25).map(c => c.id))
  assert.deepEqual(registry.candidates.map(c => c.id), manifest.candidateIds)
  assert.equal(new Set(registry.candidates.map(c => c.taxonomyEvidence.taxonId)).size, 25)
  assert.equal(registry.candidates.filter(c => c.rank === 'SUBSPECIES').length, 1)
  assert.equal(registry.candidates.find(c => c.rank === 'SUBSPECIES').id, 'varanus-griseus-caspius')
  for (const [path, sha] of Object.entries(await read('docs/evidence/bulk-25-preservation.json'))) {
    if (!isHistoricalEvidenceUnchanged(path)) continue
    const baselinePath = ({ 'data/species.source.json': 'data/backups/bulk-25-provisional/species.source.json',
      'public/data/species.json': 'data/backups/bulk-25-provisional/public-species.json',
      'src/data/species-model.js': 'data/backups/bulk-25-provisional/species-model.js',
      'src/admin/data/repository.js': 'data/backups/catalog-125/admin-draft-repository.js',
      'src/admin/data/model.js': 'data/backups/catalog-166/admin-model.js' })[path] || path
    assert.equal(digest(await readFile(`${PROJECT_ROOT}/${baselinePath}`)), sha, path)
  }
})

test('all 25 drafts are structurally valid; two documented taxon conflicts cannot enter review or publication packets', async () => {
  const before = fingerprint(source)
  const checked = await checkRegistry(registry, source, options())
  assert.equal(checked.report.counts.accepted, 23)
  assert.equal(checked.report.states.ready_for_review, 23)
  assert.equal(checked.report.states.needs_evidence, 2)
  assert.deepEqual(checked.report.results.filter(r => r.state === 'needs_evidence').map(r => r.candidateId), ['tulipa-anadroma', 'eryx-tataricus'])
  assert.equal(checked.report.states.approved_for_import, 0)
  assert.equal(checked.report.states.imported, 0)
  for (const batch of checked.batches) {
    assert.equal(batch.approved.records.length, 0)
    const saved = await read(`data/research/bulk-25-content/block-${batch.number}-drafts.json`)
    assert.deepEqual(saved, batch.drafts)
    await assert.rejects(planBatchImport(source, saved), /species-import-batch/)
    // Pure planning is used solely to verify compatibility, without file writes.
    const records = await Promise.all(registry.candidates.slice((batch.number - 1) * 5, batch.number * 5).map(async c => ({ candidateId: c.id,
      species: await read(c.draftFile), taxonomyEvidence: c.taxonomyEvidence })))
    // This structural-only plan includes the original draft files. Research errors
    // above still prevent the two conflicting concepts from approval/application.
    const plan = await planBatchImport(source, { ...saved, documentType: 'species-import-batch', records }, {
      validateAssets: s => inspectPipelineAssets(PROJECT_ROOT, s) })
    assert.equal(plan.counts.added, 5)
    assert.equal(plan.counts.rejected, 0)
  }
  assert.equal(fingerprint(source), before)
  assert.ok(registry.candidates.every(c => c.approval === null))
})

test('four short languages, honest long-text/name fallback and unknown science remain explicit', async () => {
  let photos = 0
  for (const c of registry.candidates) {
    const s = await read(c.draftFile)
    assert.deepEqual(validateSpecies([s]), [])
    assert.equal(s.verified, false)
    assert.equal(s.population.type, 'unknown')
    assert.equal(s.population.reviewStatus, 'pending')
    assert.equal(s.nationalRedBook.year, 2006)
    assert.equal(s.iucn.category, null)
    assert.equal(s.regions.length, 1)
    for (const lang of ['ky', 'uz', 'ru', 'en']) {
      assert.equal(scientificContent(s.content.shortDescription.text, lang).fallback, false)
      if (lang !== 'ru') {
        assert.equal(scientificContent(s.content.overview.text, lang).language, 'ru')
        assert.equal(scientificContent(s.content.overview.text, lang).fallback, true)
        assert.equal(speciesName(s, lang), s.names[lang] || s.names.ru)
        assert.equal(speciesNameLanguage(s, lang), s.names[lang] ? lang : 'ru')
        const unnamed = { ...s, names: { ky: null, uz: null, ru: null, en: null } }
        assert.equal(speciesName(unnamed, lang), s.scientificName)
        assert.equal(speciesNameLanguage(unnamed, lang), 'la')
      }
    }
    const words = s.content.overview.text.ru.trim().split(/\s+/u).length
    assert.ok(words >= 120 && words <= 250)
    assert.ok(s.content.shortDescription.text.ru.length >= 120 && s.content.shortDescription.text.ru.length <= 180)
    assert.ok(!/[А-Яа-яЁё]/u.test(s.content.shortDescription.text.uz))
    assert.deepEqual(await inspectPipelineAssets(PROJECT_ROOT, s), [])
    photos += s.images.length
  }
  assert.equal(photos, 10)
  assert.equal((await read(registry.candidates.find(c => c.id === 'tulipa-platystemon').draftFile)).habitat, null)
  for (const id of ['eminium-regelii', 'varanus-griseus-caspius']) assert.equal((await read(registry.candidates.find(c => c.id === id).draftFile)).nationalRedBook.category, null)
  const rejected = (await read('docs/evidence/bulk-25-block-1-images.json')).receipts.find(r => r.candidateId === 'allium-semenovii')
  assert.equal(rejected.status, 'placeholder')
  assert.ok(rejected.rejectedImage)
})

test('repeat checks preserve fingerprints; tampered evidence fails and canonical CC URLs pass asset validation', async () => {
  const first = await checkRegistry(registry, source, options())
  const second = await checkRegistry(first.registry, source, options())
  assert.deepEqual(first.report.results, second.report.results)
  assert.deepEqual(first.batches, second.batches)
  const modified = structuredClone(registry)
  modified.candidates[0].materials[0].sha256 = '0'.repeat(64)
  const bad = await checkRegistry(modified, source, options())
  assert.equal(bad.report.results[0].state, 'needs_evidence')
  assert.match(bad.report.results[0].errors.join(' '), /Материал изменён/)
  assert.equal(bad.report.states.ready_for_review, 22)
  const research = await read('data/research/bulk-25-content/block-1-photos.json')
  const candidate = research.candidates.find(c => c.id === 'eminium-regelii')
  const search = await read('docs/evidence/bulk-25-photo-search.json')
  const page = Object.values(search.records.find(r => r.candidateId === candidate.id).queries[0].data.query.pages)[0]
  const metadata = checkCommonsMetadata(candidate, page)
  assert.equal(metadata.licenseUrl, 'https://creativecommons.org/licenses/by/4.0/')
})

test('release review manifest withholds ambiguous scientific concepts and checks all other queues without publication', async () => {
  const { audit, reviewManifest } = await auditBulk25(PROJECT_ROOT, { historical: true })
  assert.deepEqual(audit.counts, { technically_ready: 23, needs_correction: 0, blocked: 2 })
  assert.deepEqual(reviewManifest, await read('data/research/bulk-25-release-review-manifest.json'))
  assert.equal(reviewManifest.publicationAllowed, false)
  assert.equal(reviewManifest.approval, null)
  assert.equal(audit.otherMasterCandidatesChecked, 35)
  assert.equal(audit.legacyAliasCount, 2)
  assert.equal(audit.dryRun.writePerformed, false)
  assert.equal(audit.dryRun.repeatedPlan.unchanged, 25)
  assert.equal(audit.dryRun.duplicateCopyRejected, true)
  const hybrid = audit.results.find(r => r.candidateId === 'tulipa-anadroma')
  assert.match(hybrid.taxonomy.acceptedScientificNameAsReturned, /×/)
  assert.equal(hybrid.eligibleForIndependentApprovalReview, false)
  const boa = audit.results.find(r => r.candidateId === 'eryx-tataricus')
  assert.match(boa.nationalEvidence.headingAsPrinted.join(' '), /Lichtenstein/)
  assert.match(boa.taxonomy.requestedScientificName, /Tzarevsky/)
  assert.equal(boa.eligibleForIndependentApprovalReview, false)
})

test('historic evidence scope and documented source languages remain honest in the derived drafts', async () => {
  const monitor = await read('data/research/bulk-25-content/drafts/varanus-griseus-caspius.json')
  assert.equal(monitor.taxonomy.genus, 'Varanus')
  assert.ok(monitor.sources.find(s => s.id === 'national-book').supports.includes('nationalRedBook.listed'))
  assert.ok(!monitor.sources.find(s => s.id === 'national-list-1').supports.includes('nationalRedBook.listed'))
  const tulip = await read('data/research/bulk-25-content/drafts/tulipa-platystemon.json')
  assert.equal(tulip.habitat, null)
  assert.ok(!tulip.sources.find(s => s.id === 'national-book').supports.includes('habitat'))
  for (const id of ['eryx-tataricus', 'lyrurus-tetrix', 'aythya-nyroca', 'oxyura-leucocephala']) {
    const s = await read(`data/research/bulk-25-content/drafts/${id}.json`)
    assert.equal(s.sources.find(s => s.id === 'photo-commons').language, null)
  }
  const merganser = await read('data/research/bulk-25-content/drafts/mergus-serrator.json')
  for (const text of Object.values(merganser.content.shortDescription.text)) assert.match(text, /2006/)
  const delphinium = await read('data/research/bulk-25-content/drafts/delphinium-knorringianum.json')
  assert.match(delphinium.content.shortDescription.text.ky, /текөөрчөсү/)
})
