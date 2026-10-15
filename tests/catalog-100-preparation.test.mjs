import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createServer } from 'vite'
import { PROJECT_ROOT } from '../scripts/build-data.mjs'
import { checkRegistry, digest, fingerprint, createQueueConflicts } from '../scripts/lib/research-pipeline.mjs'
import { createLocalAdapter, inspectPipelineAssets } from '../scripts/lib/local-research-adapter.mjs'
import { planBatchImport } from '../scripts/lib/bulk-import.mjs'
import { validateSpecies } from '../src/data/species-model.js'
import { UNKNOWN_POPULATION } from '../src/data/population.js'
import { LANGUAGES, scientificContent } from '../src/data/localization.js'
import { speciesName } from '../src/data/presentation.js'
import { createSearchIndex, searchSpecies } from '../src/data/catalog-search.js'
import { speciesIdFromPath, speciesPath } from '../src/data/species-routes.js'
import { paginateCatalog } from '../src/data/catalog-pagination.js'
import { tr } from '../src/locales/index.js'

const read = async p => JSON.parse(await readFile(`${PROJECT_ROOT}/${p}`, 'utf8'))
const source = await read('data/species.source.json'), published = await read('public/data/species.json')
const registry = await read('data/research/catalog-100-content-registry.json')
const manifest = await read('data/research/catalog-100-review-manifest.json')
const national = await read('data/research/redbook-master-national-lists.json')
const taxonomy = await read('docs/evidence/catalog-100-taxonomy.json')
const drafts = await Promise.all(registry.candidates.map(c => read(c.draftFile)))
const options = { adapter: createLocalAdapter(PROJECT_ROOT), validateAssets: s => inspectPipelineAssets(PROJECT_ROOT, s) }

test('preparation preserves all 84 public records and prior science, keeps the 16-record manifest unpublished and excludes queue conflicts', async () => {
  assert.equal(source.catalog.length, 84); assert.equal(published.length, 84)
  for (const [p, sha] of Object.entries(await read('docs/evidence/catalog-100-preservation.json'))) {
    assert.equal(digest(await readFile(`${PROJECT_ROOT}/${p}`)), sha, p)
  }
  assert.equal(fingerprint(registry), manifest.registryFingerprint)
  assert.deepEqual(registry.candidates.map(c => c.id), manifest.candidateIds)
  assert.equal(manifest.candidateIds.length, 16); assert.equal(new Set(manifest.candidateIds).size, 16)
  assert.equal(manifest.publicationAllowed, false); assert.equal(manifest.approval, null)
  assert.equal(manifest.ownerAuthorization, null); assert.equal(manifest.publicationDecision, null)
  const master = await read('data/research/redbook-master-registry.json')
  const previous = await read('data/research/bulk-25-content-registry.json')
  const remaining = [...new Map([...master.candidates, ...previous.candidates]
    .filter(c => !source.catalog.some(s => s.id === c.id) && !manifest.candidateIds.includes(c.id)).map(c => [c.id, c])).values()]
  const conflicts = createQueueConflicts({ candidates: [...registry.candidates, ...remaining] })
  for (const c of registry.candidates) {
    assert.ok(!conflicts.has(c.id)); assert.ok(![...source.catalog, ...source.demoArchive].some(s => s.id === c.id))
    assert.ok(!['birds', 'mammals'].includes(c.group)); assert.equal(c.approval, null)
  }
  for (const id of ['tulipa-anadroma', 'eryx-tataricus']) assert.ok(!manifest.candidateIds.includes(id))
  const audit = await read('docs/evidence/catalog-100-needs-evidence-audit.json')
  assert.equal(audit.records.length, 14)
  assert.deepEqual(audit.records.filter(r => r.decision === 'research_ready_in_catalog_100_queue').map(r => r.id), ['dictyocephalus-attenuatus', 'prionus-tschitscherini'])
  await assert.rejects(stat(`${PROJECT_ROOT}/data/research/publication-decisions/muras-22-7-owner-provisional.json`), { code: 'ENOENT' })
})

test('all 16 drafts bind exact taxonomy and both historical national documents, preserve unknowns and four real short-language texts', async () => {
  const nationalRecords = new Map(national.lists.flatMap(l => l.records).map(r => [r.recordId, r]))
  for (const [n, c] of registry.candidates.entries()) {
    const s = drafts[n], entry = manifest.candidates[n]
    assert.deepEqual(validateSpecies([s]), [])
    assert.equal(digest(await readFile(`${PROJECT_ROOT}/${c.draftFile}`)), entry.draftSha256)
    assert.equal(s.verified, false); assert.equal(s.lastReviewedAt, null); assert.equal(s.publication, undefined)
    assert.deepEqual(s.population, UNKNOWN_POPULATION)
    assert.equal(s.nationalRedBook.year, 2006); assert.match(s.nationalRedBook.edition, /историческ/)
    assert.equal(c.nationalRedBook.claimsCurrentLegalStatus, false); assert.equal(s.iucn.category, null)
    assert.equal(s.names.ky, null); assert.equal(s.names.uz, null)
    const t = taxonomy.records.findLast(r => r.nationalRecordId === c.taxonomyResearch.evidenceRecordId && r.requestedName === c.taxonomyResearch.requestedName)
    assert.equal(t.match.data.matchType, 'EXACT')
    const accepted = t.accepted?.data || t.match.data
    assert.equal(accepted.canonicalName, s.scientificName); assert.equal(accepted.rank, c.rank)
    assert.equal(c.taxonomyEvidence.taxonId, `gbif:${accepted.key || accepted.usageKey}`)
    const documents = c.nationalSourceRecords.map(id => nationalRecords.get(id))
    assert.ok(documents.some(r => r.sourceId === 'book-2006'))
    assert.ok(documents.some(r => r.sourceId === 'decree-170-2009' && r.recordState === 'listed_in_2009_copy'))
    assert.equal(s.regions.length, 1); assert.equal(s.regions[0].code, 'KG')
    for (const language of LANGUAGES) {
      assert.equal(scientificContent(s.content.shortDescription.text, language).fallback, false)
      assert.equal(scientificContent(s.content.overview.text, language).language, 'ru')
    }
    assert.ok(!/[А-Яа-яЁё]/u.test(s.content.shortDescription.text.uz))
    assert.ok(s.content.shortDescription.text.ru.length >= 120 && s.content.shortDescription.text.ru.length <= 180)
    assert.ok(s.content.overview.text.ru.trim().split(/\s+/u).length >= 120)
    assert.ok(s.habitat); assert.equal(entry.independentReview, 'pending')
    assert.deepEqual(await inspectPipelineAssets(PROJECT_ROOT, s), [])
    if (s.images.length) assert.equal(s.sources.find(r => r.id === 'photo-commons').accessedAt, '2026-10-15')
  }
  assert.equal(drafts.reduce((sum, s) => sum + s.images.length, 0), 2)
  assert.equal(drafts.filter(s => !s.images.length).length, 14)
  assert.equal(drafts.find(s => s.id === 'corydalis-pseudoadunca').threats, null)
  assert.equal(drafts.find(s => s.id === 'dictyocephalus-attenuatus').content.reproduction, null)
  assert.equal(drafts.find(s => s.id === 'rossomyrmex-proformicarum').content.diet, null)
  assert.ok(!drafts.find(s => s.id === 'primula-eugeniae').content.appearance.text.ru.includes('20 см'))
  assert.match(drafts.find(s => s.id === 'barbus-brachycephalus').content.distribution.text.ru, /2006.*исчезновении/)
})

test('existing bulk checks accept all 16; pure preview adds 16, repeats unchanged and rejects a duplicate without applying anything', async () => {
  const before = digest(await readFile(`${PROJECT_ROOT}/data/species.source.json`))
  const checked = await checkRegistry(registry, source, options)
  assert.equal(checked.report.states.ready_for_review, 16)
  assert.equal(checked.report.states.approved_for_import, 0); assert.equal(checked.report.states.imported, 0)
  for (const result of checked.report.results) {
    assert.deepEqual(result.errors, [])
    assert.equal(result.fingerprint, manifest.candidates.find(c => c.id === result.candidateId).checkedFingerprint)
  }
  const packet = { schemaVersion: 1, documentType: 'species-import-batch', batchId: 'catalog-100-validation-only',
    records: registry.candidates.map((c, n) => ({ candidateId: c.id, species: drafts[n], taxonomyEvidence: c.taxonomyEvidence })) }
  const plan = await planBatchImport(source, packet, options)
  assert.deepEqual(plan.counts, { processed: 16, added: 16, unchanged: 0, rejected: 0 })
  assert.equal(plan.proposedSource.catalog.length, 100)
  assert.deepEqual(plan.proposedSource.catalog.slice(0, 84), source.catalog)
  assert.deepEqual(plan.proposedSource.demoArchive, source.demoArchive)
  assert.deepEqual((await planBatchImport(plan.proposedSource, packet, options)).counts, { processed: 16, added: 0, unchanged: 16, rejected: 0 })
  const duplicate = structuredClone(packet.records[0]); duplicate.candidateId = duplicate.species.id = 'validation-only-duplicate'
  assert.equal((await planBatchImport(plan.proposedSource, { ...packet, records: [duplicate] }, options)).counts.rejected, 1)
  assert.equal(digest(await readFile(`${PROJECT_ROOT}/data/species.source.json`)), before)
})

test('unpublished previews retain four-language search, route identity, photos/placeholders and existing pending notes', async () => {
  const preview = [...published, ...drafts], index = createSearchIndex(preview)
  assert.deepEqual([1,2,3,4,5].map(n => paginateCatalog(preview, n).entries.length), [24,24,24,24,4])
  for (const s of drafts) {
    for (const language of LANGUAGES) assert.ok(searchSpecies(index, speciesName(s, language)).some(r => r.species.id === s.id))
    assert.equal(speciesIdFromPath(speciesPath(s.id)), s.id)
  }
  const vite = await createServer({ server: { middlewareMode: true, ws: false, hmr: false, watch: null }, appType: 'custom', logLevel: 'error' })
  try {
    const { siteLanguage } = await vite.ssrLoadModule('/src/composables/useLocale.js')
    const components = await Promise.all(['SpeciesCard.vue','SpeciesModal.vue','SpeciesPage.vue'].map(async name => (await vite.ssrLoadModule(`/src/components/${name}`)).default))
    for (const language of LANGUAGES) {
      siteLanguage.value = language
      for (const s of drafts) for (const [n, component] of components.entries()) {
        const html = await renderToString(createSSRApp(component, { species: s }))
        assert.ok(html.includes(s.images[0]?.path || 'placeholder.svg'))
        if (n > 0) { assert.ok(html.includes(s.scientificName)); assert.ok(html.includes(tr(language, 'ui.m243'))) }
      }
    }
  } finally { await vite.close() }
})
