import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createServer } from 'vite'
import { PROJECT_ROOT } from '../scripts/build-data.mjs'
import { checkRegistry, digest, fingerprint, createQueueConflicts } from '../scripts/lib/research-pipeline.mjs'
import { createLocalAdapter, inspectPipelineAssets } from '../scripts/lib/local-research-adapter.mjs'
import { planBatchImport } from '../scripts/lib/bulk-import.mjs'
import { validateSpecies } from '../src/data/species-model.js'
import { scientificContent, LANGUAGES } from '../src/data/localization.js'
import { createSearchIndex, searchSpecies, matchesCatalogFilters } from '../src/data/catalog-search.js'
import { speciesName } from '../src/data/presentation.js'
import { speciesIdFromPath, speciesPath } from '../src/data/species-routes.js'
import { paginateCatalog } from '../src/data/catalog-pagination.js'
import { tr } from '../src/locales/index.js'
const read = async p => JSON.parse(await readFile(`${PROJECT_ROOT}/${p}`, 'utf8'))
// Immutable pre-publication baseline keeps preparation checks reproducible after import.
const source = await read('data/backups/catalog-84/species.source.json'), published = await read('data/backups/catalog-84/public-species.json')
const registry = await read('data/research/catalog-84-content-registry.json')
const manifest = await read('data/research/catalog-84-review-manifest.json')
const master = await read('data/research/redbook-master-registry.json')
const taxonomy = await read('docs/evidence/redbook-master-taxonomy.json')
const national = await read('data/research/redbook-master-national-lists.json')
const drafts = await Promise.all(registry.candidates.map(c => read(c.draftFile)))
const options = { adapter: createLocalAdapter(PROJECT_ROOT), validateAssets: s => inspectPipelineAssets(PROJECT_ROOT, s) }

test('next batch selects exactly 21 unused research-ready concepts and keeps current 63 and their source/photo bytes intact', async () => {
  assert.equal(source.catalog.length, 63); assert.equal(source.demoArchive.length, 2)
  const eligible = master.candidates.filter(c => c.state === 'research_ready' && !source.catalog.some(s => s.id === c.id) && !['tulipa-anadroma','eryx-tataricus'].includes(c.id))
  assert.deepEqual(registry.candidates.map(c => c.id), eligible.map(c => c.id)); assert.equal(eligible.length, 21)
  assert.equal(fingerprint(registry), manifest.registryFingerprint)
  assert.deepEqual(manifest.candidateIds, eligible.map(c => c.id))
  const remaining = master.candidates.filter(c => !source.catalog.some(s => s.id === c.id) && !manifest.candidateIds.includes(c.id))
  assert.equal(createQueueConflicts({ candidates: [...registry.candidates, ...remaining] }).size, 0)
  for (const [p, sha] of Object.entries(await read('docs/evidence/catalog-84-preservation.json'))) {
    const baselinePath = p === 'data/species.source.json' ? 'data/backups/catalog-84/species.source.json' : p === 'public/data/species.json' ? 'data/backups/catalog-84/public-species.json' : p
    assert.equal(digest(await readFile(`${PROJECT_ROOT}/${baselinePath}`)), sha, p)
  }
})

test('all draft fields retain historical source scope, exact cached taxonomy, four short texts and explicit unknown science', async () => {
  const nationalRecords = new Map(national.lists.flatMap(l => l.records).map(r => [r.recordId, r]))
  for (const [n, c] of registry.candidates.entries()) {
    const s = drafts[n], entry = manifest.candidates[n]
    assert.deepEqual(validateSpecies([s]), []); assert.equal(digest(await readFile(`${PROJECT_ROOT}/${c.draftFile}`)), entry.draftSha256)
    assert.equal(s.verified, false); assert.equal(s.lastReviewedAt, null); assert.equal(s.publication, undefined)
    assert.equal(c.approval, null); assert.equal(s.population.type, 'unknown'); assert.equal(s.population.reviewStatus, 'pending')
    assert.equal(s.nationalRedBook.year, 2006); assert.match(s.nationalRedBook.edition, /историческ/)
    assert.equal(c.nationalRedBook.claimsCurrentLegalStatus, false); assert.equal(s.iucn.category, null)
    assert.equal(s.names.ky, null); assert.equal(s.names.uz, null); assert.equal(s.images.length, 0)
    assert.deepEqual(c.contradictions, []); assert.deepEqual(c.missingData, [])
    const cached = taxonomy.records.find(r => r.nationalRecordId === c.taxonomyResearch.evidenceRecordId && r.requestedName === c.taxonomyResearch.requestedName)
    assert.equal(cached.match.data.matchType, 'EXACT')
    const accepted = cached.accepted?.data || cached.match.data
    assert.equal(accepted.canonicalName, s.scientificName)
    assert.equal(c.taxonomyEvidence.taxonId, `gbif:${accepted.key || accepted.usageKey}`)
    for (const key of ['kingdom','phylum','class','order','family','genus']) assert.equal(s.taxonomy[key], accepted[key] || null)
    const docs = c.nationalSourceRecords.map(id => nationalRecords.get(id))
    assert.ok(docs.some(r => r.sourceId === 'book-2006' && r.scientificName === c.originalScientificName))
    assert.ok(docs.some(r => r.recordState === 'listed_in_2009_copy'))
    for (const language of LANGUAGES) {
      assert.equal(scientificContent(s.content.shortDescription.text, language).fallback, false)
      assert.equal(scientificContent(s.content.overview.text, language).language, 'ru')
    }
    assert.ok(!/[А-Яа-яЁё]/u.test(s.content.shortDescription.text.uz))
    assert.ok(s.content.shortDescription.text.ru.length >= 120 && s.content.shortDescription.text.ru.length <= 180)
    const words = s.content.overview.text.ru.trim().split(/\s+/u).length
    assert.ok(words >= 120 && words <= 250)
  }
  const bat = registry.candidates.find(c => c.id === 'barbastella-leucomelas')
  assert.equal(taxonomy.records.find(r => r.nationalRecordId === bat.taxonomyResearch.evidenceRecordId).match.data.matchType, 'NONE')
  const horseshoe = registry.candidates.find(c => c.id === 'rhinolophus-bocharicus')
  assert.equal(nationalRecords.get(horseshoe.nationalSourceRecords[1]).scientificName, 'Rinolophus bocharicus')
  assert.ok(!horseshoe.sources.find(s => s.id === 'national-list-orthography').supports.includes('nationalRedBook.listed'))
  assert.equal(drafts.find(s => s.id === 'barbastella-leucomelas').threats, null)
  assert.equal(drafts.find(s => s.id === 'lutra-lutra').content.diet, null)
})

test('existing dry-run accepts 21, repeats unchanged and rejects a duplicate copy without publication or scientific approval', async () => {
  const before = digest(await readFile(`${PROJECT_ROOT}/data/species.source.json`))
  const checked = await checkRegistry(registry, source, options)
  assert.equal(checked.report.states.ready_for_review, 21); assert.equal(checked.report.states.approved_for_import, 0)
  assert.equal(checked.report.states.imported, 0)
  for (const result of checked.report.results) {
    assert.deepEqual(result.errors, [])
    assert.equal(result.fingerprint, manifest.candidates.find(c => c.id === result.candidateId).checkedFingerprint)
  }
  const packet = { schemaVersion: 1, documentType: 'species-import-batch', batchId: 'catalog-84-structural-preview',
    records: registry.candidates.map((c, n) => ({ candidateId: c.id, species: drafts[n], taxonomyEvidence: c.taxonomyEvidence })) }
  const plan = await planBatchImport(source, packet, options)
  assert.equal(plan.counts.added, 21); assert.equal(plan.counts.rejected, 0)
  assert.deepEqual(plan.proposedSource.catalog.slice(0, 63), source.catalog)
  assert.deepEqual(plan.proposedSource.demoArchive, source.demoArchive)
  const repeat = await planBatchImport(plan.proposedSource, packet, options)
  assert.equal(repeat.counts.added, 0); assert.equal(repeat.counts.unchanged, 21)
  const duplicate = structuredClone(packet.records[0]); duplicate.candidateId = duplicate.species.id = 'preview-duplicate'
  assert.equal((await planBatchImport(plan.proposedSource, { ...packet, records: [duplicate] }, options)).counts.rejected, 1)
  assert.equal(digest(await readFile(`${PROJECT_ROOT}/data/species.source.json`)), before)
  assert.equal(manifest.publicationAllowed, false); assert.equal(manifest.approval, null)
})

test('published search, routes, filters, 24-record pagination and all new Vue profiles work in four languages with placeholders', async () => {
  const preview = await read('public/data/species.json'), index = createSearchIndex(preview)
  const released = preview.filter(s => manifest.candidateIds.includes(s.id))
  assert.equal(preview.length, 84); assert.equal(released.length, 21)
  for (const s of released) {
    for (const language of LANGUAGES) assert.ok(searchSpecies(index, speciesName(s, language)).some(r => r.species.id === s.id))
    assert.equal(speciesIdFromPath(speciesPath(s.id)), s.id)
    assert.equal(matchesCatalogFilters(s, { group: s.group, status: 'UNKNOWN', region: 'Кыргызстан' }), true)
  }
  assert.deepEqual([1,2,3,4].map(n => paginateCatalog(preview, n).entries.length), [24,24,24,12])
  const vite = await createServer({ server: { middlewareMode: true, ws: false, hmr: false, watch: null }, appType: 'custom', logLevel: 'error' })
  try {
    const { siteLanguage } = await vite.ssrLoadModule('/src/composables/useLocale.js')
    const components = await Promise.all(['SpeciesCard.vue','SpeciesModal.vue','SpeciesPage.vue'].map(async name => (await vite.ssrLoadModule(`/src/components/${name}`)).default))
    for (const language of LANGUAGES) {
      siteLanguage.value = language
      for (const s of released) for (const [n, component] of components.entries()) {
        const html = await renderToString(createSSRApp(component, { species: s }))
        assert.ok(html.includes('placeholder.svg'))
        if (n > 0) { assert.ok(html.includes(tr(language, 'ui.m243'))); assert.ok(html.includes(s.scientificName)) }
      }
    }
  } finally { await vite.close() }
})
