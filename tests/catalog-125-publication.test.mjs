import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createServer } from 'vite'
import { PROJECT_ROOT } from '../scripts/build-data.mjs'
import { digest, fingerprint } from '../scripts/lib/research-pipeline.mjs'
import { validateSource, validateSpecies, canPublishImage } from '../src/data/species-model.js'
import { webpMetadata } from '../scripts/import-species-batch.mjs'
import { LANGUAGES } from '../src/data/localization.js'
import { speciesName, speciesPhoto } from '../src/data/presentation.js'
import { createSearchIndex, searchSpecies } from '../src/data/catalog-search.js'
import { paginateCatalog } from '../src/data/catalog-pagination.js'
import { speciesPath, speciesIdFromPath } from '../src/data/species-routes.js'

const read = async path => JSON.parse(await readFile(`${PROJECT_ROOT}/${path}`, 'utf8'))
// Immutable 125-record release; catalog-150-publication covers the live catalogue.
const source = await read('data/backups/catalog-150/species.source.json'), published = await read('data/backups/catalog-150/public-species.json')
const before = await read('data/backups/catalog-125/species.source.json')
const beforePublic = await read('data/backups/catalog-125/public-species.json')
const manifestPath = 'data/research/catalog-125-review-manifest.json'
const manifest = await read(manifestPath), registry = await read(manifest.registry)
const decision = await read('data/research/publication-decisions/muras-24-1-owner-provisional.json')
const additions = source.catalog.slice(before.catalog.length), publicAdditions = published.slice(beforePublic.length)

test('catalog 125 preserves the complete prior 100 and publishes exactly the authorized plants with scientific pending', async () => {
  assert.equal(before.catalog.length, 100); assert.equal(beforePublic.length, 100)
  assert.equal(source.catalog.length, 125); assert.equal(published.length, 125)
  assert.deepEqual(source.catalog.slice(0, 100), before.catalog)
  assert.deepEqual(source.demoArchive, before.demoArchive)
  assert.deepEqual(published.slice(0, 100), beforePublic)
  assert.deepEqual(additions.map(s => s.id), manifest.candidateIds)
  assert.deepEqual(publicAdditions.map(s => s.id), manifest.candidateIds)
  assert.equal(new Set(source.catalog.map(s => s.id)).size, 125)
  assert.equal(new Set(source.catalog.map(s => s.scientificName.normalize('NFKC').toLowerCase())).size, 125)
  assert.deepEqual(validateSource(source), [])
  assert.deepEqual(validateSpecies(published, 'published', { publicData: true }), [])
  assert.equal(digest(await readFile(`${PROJECT_ROOT}/${manifestPath}`)), 'e2cb306acf708d13fe53e0ec3ddcdd620489593b4c96d640abd8121ebbc7e1dd')
  assert.equal(fingerprint(registry), '6b89e1b5e569e2bf23c0a7313e2a0802c73f63fafccdeb895dbabd3baf55f9da')
  assert.equal(decision.manifestSha256, digest(await readFile(`${PROJECT_ROOT}/${manifestPath}`)))
  assert.equal(decision.registryFingerprint, fingerprint(registry))
  assert.equal(decision.scientificApproval, null)
  assert.deepEqual(decision.records.map(r => r.id), manifest.candidateIds)
  for (const [n, s] of additions.entries()) {
    const { publication, ...science } = s, entry = manifest.candidates[n], record = decision.records[n]
    assert.deepEqual(science, await read(entry.draftFile))
    assert.equal(digest(await readFile(`${PROJECT_ROOT}/${entry.draftFile}`)), entry.draftSha256)
    assert.equal(s.group, 'plants'); assert.equal(s.verified, false); assert.equal(s.lastReviewedAt, null)
    assert.equal(s.population.type, 'unknown'); assert.equal(s.population.reviewStatus, 'pending')
    for (const field of ['value', 'min', 'max', 'year', 'territory', 'method']) assert.equal(s.population[field], null)
    assert.equal(publication.status, 'provisional'); assert.equal(publication.scientificReviewStatus, 'pending')
    assert.equal(publication.independentReviewer, null); assert.equal(publication.decisionId, decision.decisionId)
    assert.equal(publication.publishedAt, '2026-10-16'); assert.equal(publication.researchFingerprint, entry.checkedFingerprint)
    assert.equal(record.fingerprint, entry.checkedFingerprint); assert.equal(record.draftSha256, entry.draftSha256)
    assert.equal(record.ownerRole, 'project_owner'); assert.equal(record.date, '2026-10-16')
    assert.equal(record.reason, 'Отдельное разрешение владельца на предварительную публикацию manifest SHA-256 e2cb306acf708d13fe53e0ec3ddcdd620489593b4c96d640abd8121ebbc7e1dd; независимое научное одобрение отсутствует, scientificReviewStatus pending.')
    assert.equal(record.independentReviewer, null); assert.equal(record.scientificReviewStatus, 'pending')
  }
  assert.ok(registry.candidates.every(c => c.approval === null))
})

test('the 20 new images retain exact bytes and attribution, all names are searchable in four languages, and six pages contain 24/24/24/24/24/5', async () => {
  assert.equal(additions.reduce((n, s) => n + s.images.length, 0), 20)
  assert.equal(publicAdditions.reduce((n, s) => n + s.images.length, 0), 20)
  assert.equal(publicAdditions.filter(s => !s.images.length).length, 5)
  const pages = [1, 2, 3, 4, 5, 6].map(n => paginateCatalog(published, n))
  assert.deepEqual(pages.map(p => p.entries.length), [24, 24, 24, 24, 24, 5])
  assert.deepEqual(pages.flatMap(p => p.entries).map(s => s.id), published.map(s => s.id))
  const index = createSearchIndex(published)
  for (const s of published) {
    assert.equal(speciesIdFromPath(speciesPath(s.id)), s.id)
    for (const language of LANGUAGES) {
      assert.ok(searchSpecies(index, speciesName(s, language)).some(r => r.species.id === s.id), `${s.id}.${language}`)
    }
  }
  const hashes = new Set()
  for (const s of published) for (const im of s.images) {
    const bytes = await readFile(`${PROJECT_ROOT}/public${im.path}`)
    assert.equal(digest(bytes), im.sha256, s.id)
    assert.deepEqual(webpMetadata(bytes), { width: im.width, height: im.height, privateMetadata: false })
    assert.ok(!hashes.has(im.sha256), s.id); hashes.add(im.sha256)
  }
  for (const s of publicAdditions) for (const im of s.images) {
    assert.ok(canPublishImage(im)); assert.equal(im.license, 'CC BY 4.0')
    assert.ok(im.attribution.includes(im.author)); assert.ok(im.attribution.includes(im.license))
    assert.match(im.originalPage, /^https:\/\//)
    const original = additions.find(x => x.id === s.id).images[0]
    assert.equal(digest(await readFile(`${PROJECT_ROOT}/${original.path}`)), im.sha256)
  }
})

test('all 25 added cards, modals and species pages render their real image or placeholder and credits in KY/UZ/RU/EN', async () => {
  const vite = await createServer({ server: { middlewareMode: true, ws: false, hmr: false, watch: null }, appType: 'custom', logLevel: 'error' })
  const escape = s => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll("'", '&#39;')
  try {
    const { siteLanguage } = await vite.ssrLoadModule('/src/composables/useLocale.js')
    const components = await Promise.all(['SpeciesCard.vue', 'SpeciesModal.vue', 'SpeciesPage.vue'].map(async name => (await vite.ssrLoadModule('/src/components/' + name)).default))
    for (const language of LANGUAGES) {
      siteLanguage.value = language
      for (const s of publicAdditions) for (const [n, component] of components.entries()) {
        const html = await renderToString(createSSRApp(component, { species: s }))
        assert.ok(html.includes(speciesPhoto(s)?.path || 'placeholder.svg'), `${s.id}.${language}.${n}`)
        if (n > 0 && s.images.length) for (const value of [s.images[0].author, s.images[0].license, s.images[0].originalPage]) {
          assert.ok(html.includes(escape(value)), `${s.id}.${language}: attribution`)
        }
      }
    }
  } finally { await vite.close() }
})
