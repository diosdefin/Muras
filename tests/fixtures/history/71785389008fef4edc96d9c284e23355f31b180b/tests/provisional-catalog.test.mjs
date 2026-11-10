import { isHistoricalEvidenceUnchanged } from '../scripts/lib/ui-design-scope.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { escapeHtml } from '@vue/shared'
import { createServer } from 'vite'
import { PROJECT_ROOT } from '../scripts/build-data.mjs'
import { digest, fingerprint } from '../scripts/lib/research-pipeline.mjs'
import { runPipeline } from '../scripts/bulk-pipeline.mjs'
import { validateSource, validateSpecies } from '../src/data/species-model.js'
import { LANGUAGES } from '../src/data/localization.js'
import { speciesName, speciesPhoto } from '../src/data/presentation.js'
import { createSearchIndex, searchSpecies, matchesCatalogFilters } from '../src/data/catalog-search.js'
import { paginateCatalog, CATALOG_PAGE_SIZE } from '../src/data/catalog-pagination.js'
import { speciesPath, speciesIdFromPath } from '../src/data/species-routes.js'
import { tr } from '../src/locales/index.js'
import { historicalPipeline } from './helpers/historical-pipeline.mjs'
const read = async p => JSON.parse(await readFile(`${PROJECT_ROOT}/${p}`, 'utf8'))
// The 22.5B regression checks its immutable 63-record release; catalog-84 tests
// separately validate the current publication and preservation of all these records.
const source = await read('data/backups/catalog-84/species.source.json'), published = await read('data/backups/catalog-84/public-species.json')
const baseline = await read('data/backups/bulk-25-provisional/species.source.json')
const beforePublic = await read('data/backups/bulk-25-provisional/public-species.json')
const manifest = await read('data/research/bulk-25-release-review-manifest.json')
const registry = await read(manifest.registry)
const journal = await read('data/research/publication-decisions/muras-22-5b-owner-provisional.json')
const added = source.catalog.slice(40), newPublic = published.slice(40)

test('provisional release appends exactly the 23 manifest IDs and preserves all 40 original records, images, sources and statuses', async () => {
  assert.equal(source.catalog.length, 63); assert.equal(published.length, 63)
  assert.deepEqual(source.catalog.slice(0, 40), baseline.catalog)
  assert.deepEqual(source.demoArchive, baseline.demoArchive)
  assert.deepEqual(published.slice(0, 40), beforePublic)
  assert.deepEqual(added.map(s => s.id), manifest.candidateIds)
  assert.deepEqual(newPublic.map(s => s.id), manifest.candidateIds)
  assert.equal(new Set(source.catalog.map(s => s.id)).size, 63)
  const changed = new Set(['data/species.source.json', 'public/data/species.json', 'src/data/species-model.js'])
  const preservation = await read('docs/evidence/bulk-25-preservation.json')
  for (const [p, sha] of Object.entries(preservation)) if (!changed.has(p) && isHistoricalEvidenceUnchanged(p)) {
    const baselinePath = p === 'src/admin/data/repository.js' ? 'data/backups/catalog-125/admin-draft-repository.js' : p === 'src/admin/data/model.js' ? 'data/backups/catalog-166/admin-model.js' : p
    assert.equal(digest(await readFile(`${PROJECT_ROOT}/${baselinePath}`)), sha, p)
  }
  assert.equal(digest(await readFile(`${PROJECT_ROOT}/data/backups/bulk-25-provisional/species.source.json`)), preservation['data/species.source.json'])
  assert.equal(digest(await readFile(`${PROJECT_ROOT}/data/backups/bulk-25-provisional/public-species.json`)), preservation['public/data/species.json'])
  assert.equal(fingerprint(registry), manifest.registryFingerprint)
  assert.deepEqual(validateSource(source), [])
  assert.deepEqual(validateSpecies(published, 'public', { publicData: true }), [])
})

test('publication decisions never become scientific approval and excluded concepts remain blocked', async () => {
  assert.equal(journal.scientificApproval, null)
  assert.deepEqual(journal.records.map(r => r.id), manifest.candidateIds)
  for (const [n, s] of added.entries()) {
    const { publication, ...science } = s
    assert.deepEqual(science, await read(manifest.candidates[n].draftFile))
    assert.equal(publication.status, 'provisional'); assert.equal(publication.scientificReviewStatus, 'pending')
    assert.equal(publication.independentReviewer, null); assert.equal(publication.decisionId, journal.decisionId)
    assert.equal(publication.researchFingerprint, manifest.candidates[n].checkedFingerprint)
    assert.equal(journal.records[n].ownerRole, 'project_owner')
    assert.equal(journal.records[n].fingerprint, publication.researchFingerprint)
    assert.equal(s.verified, false); assert.equal(s.lastReviewedAt, null)
    assert.equal(s.population.type, 'unknown'); assert.equal(s.population.reviewStatus, 'pending')
    assert.equal(s.nationalRedBook.year, 2006); assert.match(s.nationalRedBook.edition, /историческ/)
    assert.equal(s.iucn.category, null)
  }
  for (const id of ['tulipa-anadroma', 'eryx-tataricus']) {
    assert.ok(!source.catalog.some(s => s.id === id)); assert.ok(!journal.records.some(s => s.id === id))
    const c = registry.candidates.find(c => c.id === id)
    assert.equal(c.state, 'needs_evidence'); assert.ok(c.contradictions.length)
  }
  assert.ok(registry.candidates.every(c => c.approval === null))
})

test('names and scientific names work in four interface languages, group/status filters retain the new records and pagination is 24/24/15', () => {
  const index = createSearchIndex(published)
  for (const s of newPublic) {
    for (const language of LANGUAGES) assert.ok(searchSpecies(index, speciesName(s, language)).some(r => r.species.id === s.id))
    assert.ok(searchSpecies(index, s.scientificName).some(r => r.species.id === s.id))
    assert.equal(matchesCatalogFilters(s, { group: s.group, status: 'UNKNOWN', region: 'Кыргызстан' }), true)
    assert.equal(speciesIdFromPath(speciesPath(s.id)), s.id)
  }
  assert.equal(CATALOG_PAGE_SIZE, 24)
  const pages = [1, 2, 3].map(n => paginateCatalog(published, n))
  assert.deepEqual(pages.map(p => p.entries.length), [24, 24, 15])
  assert.deepEqual(pages.flatMap(p => p.entries).map(s => s.id), published.map(s => s.id))
})

test('repeat provisional dry-run adds zero and the old pipeline still has no scientific approvals', async () => {
  const args = ['provisional', '--registry', journal.registry, '--manifest', journal.manifest, '--mode', 'dry-run',
    '--owner-role', 'project_owner', '--decision-id', journal.decisionId, '--date', journal.records[0].date, '--reason', journal.records[0].reason]
  const before = digest(await readFile(`${PROJECT_ROOT}/data/species.source.json`))
  const { repeat, checked } = await historicalPipeline(source, async root => ({
    repeat: await runPipeline(root, args), checked: await runPipeline(root, ['check', '--registry', journal.registry])
  }))
  assert.deepEqual(repeat.counts, { processed: 23, added: 0, unchanged: 23, rejected: 0 })
  assert.equal(checked.states.imported, 23); assert.equal(checked.states.approved_for_import, 0)
  assert.equal(checked.states.needs_evidence, 2)
  assert.equal(digest(await readFile(`${PROJECT_ROOT}/data/species.source.json`)), before)
})

test('all new Vue cards, modals and profiles render in KY/UZ/RU/EN with existing pending notes and intact photos/placeholders', async () => {
  assert.equal(added.reduce((n, s) => n + s.images.length, 0), 9)
  assert.equal(added.filter(s => !s.images.length).length, 14)
  for (const s of newPublic) for (const image of s.images) assert.equal(digest(await readFile(`${PROJECT_ROOT}/public${image.path}`)), image.sha256)
  const vite = await createServer({ server: { middlewareMode: true, ws: false, hmr: false, watch: null }, appType: 'custom', logLevel: 'error' })
  try {
    const { siteLanguage } = await vite.ssrLoadModule('/src/composables/useLocale.js')
    const components = await Promise.all(['SpeciesCard.vue', 'SpeciesModal.vue', 'SpeciesPage.vue', 'lesson/LessonPhoto.vue'].map(async name => (await vite.ssrLoadModule(`/src/components/${name}`)).default))
    for (const language of LANGUAGES) {
      siteLanguage.value = language
      for (const s of newPublic) for (const [index, component] of components.entries()) {
        const html = await renderToString(createSSRApp(component, { species: s }))
        assert.ok(html.includes(speciesPhoto(s)?.path || 'placeholder.svg'), `${s.id}.${language}`)
        if (index === 1 || index === 2) {
          assert.ok(html.includes(s.scientificName)); assert.ok(html.includes(tr(language, 'ui.m243')))
          assert.ok(!html.includes(tr(language, 'ui.m062')))
          assert.ok(html.includes('macrolepidoptera.ru/lnk/282.pdf'))
        }
        if (index > 0 && s.images.length) {
          assert.ok(html.includes(escapeHtml(s.images[0].author)), `${s.id}.${language}: attribution`)
          assert.ok(html.includes(escapeHtml(s.images[0].license)))
        }
      }
    }
  } finally { await vite.close() }
})
