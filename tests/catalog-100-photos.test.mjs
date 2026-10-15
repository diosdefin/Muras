import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createServer } from 'vite'
import { PROJECT_ROOT } from '../scripts/build-data.mjs'
import { digest, fingerprint } from '../scripts/lib/research-pipeline.mjs'
import { runPipeline } from '../scripts/bulk-pipeline.mjs'
import { webpMetadata } from '../scripts/import-species-batch.mjs'
import { canPublishImage, validateSource } from '../src/data/species-model.js'
import { speciesPhoto, speciesName } from '../src/data/presentation.js'
import { LANGUAGES } from '../src/data/localization.js'
import { createSearchIndex, searchSpecies, matchesCatalogFilters } from '../src/data/catalog-search.js'
import { paginateCatalog } from '../src/data/catalog-pagination.js'
import { speciesIdFromPath, speciesPath } from '../src/data/species-routes.js'

const read = async p => JSON.parse(await readFile(`${PROJECT_ROOT}/${p}`, 'utf8'))
const before = await read('data/backups/catalog-100-photos/species.source.json')
const beforePublic = await read('data/backups/catalog-100-photos/public-species.json')
// Task 23's immutable 85-image release; task 23.1 additions have their own audit.
const source = await read('data/backups/catalog-100-photo-final/species.source.json')
const published = await read('data/backups/catalog-100-photo-final/public-species.json')
const journal = await read('data/research/catalog-100-photo-updates.json')
const withoutImages = doc => ({ ...doc, catalog: doc.catalog.map(({ images, ...rest }) => rest) })
const escape = s => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll("'", '&#39;')

test('photo restoration preserves every scientific field, original image, archive and publication decision in all 100 records', async () => {
  assert.equal(source.catalog.length, 100); assert.equal(published.length, 100)
  assert.deepEqual(validateSource(source), [])
  assert.deepEqual(withoutImages(source), withoutImages(before))
  assert.deepEqual(published.map(({ images, ...rest }) => rest), beforePublic.map(({ images, ...rest }) => rest))
  assert.equal(before.catalog.filter(s => s.images.length).length, 43)
  assert.equal(journal.records.length, 42)
  assert.equal(new Set(journal.records.map(r => r.id)).size, 42)
  for (const old of before.catalog) {
    const current = source.catalog.find(s => s.id === old.id)
    if (old.images.length) assert.deepEqual(current.images, old.images, old.id)
    else assert.equal(current.images.length, journal.records.some(r => r.id === old.id) ? 1 : 0, old.id)
  }
  for (const old of beforePublic) for (const im of old.images) assert.equal(digest(await readFile(`${PROJECT_ROOT}/public${im.path}`)), im.sha256)
})

test('new photos have auditable per-file rights, precise source determinations and original dimensions; all published WebP bytes are unique and intact', async () => {
  const hashes = new Set(), files = []
  for (const s of published) for (const im of s.images) {
    assert.ok(canPublishImage(im), s.id)
    const bytes = await readFile(`${PROJECT_ROOT}/public${im.path}`)
    assert.equal(digest(bytes), im.sha256)
    assert.deepEqual(webpMetadata(bytes), { width: im.width, height: im.height, privateMetadata: false })
    assert.ok(!hashes.has(im.sha256), `duplicate ${s.id}`); hashes.add(im.sha256)
    files.push(im.path.split('/').pop())
  }
  assert.equal(hashes.size, 85)
  const live = await read('public/data/species.json')
  assert.deepEqual((await readdir(`${PROJECT_ROOT}/public/images/approved`)).sort(), live.flatMap(s => s.images.map(im => im.path.split('/').pop())).sort())
  for (const row of journal.records) {
    const { images, ...science } = source.catalog.find(s => s.id === row.id)
    assert.deepEqual(images, [row.image]); assert.equal(row.scientificFingerprint, fingerprint(science))
    assert.equal(row.status, 'documented_and_visually_checked'); assert.equal(row.identification.independentDetermination, false)
    assert.ok(row.identification.documentedName.startsWith(row.scientificName) || row.identification.documentedName === 'Barbus brachycephalus')
    assert.match(row.originalImageUrl, /^https:\/\//); assert.match(row.originalSha256, /^[a-f0-9]{64}$/)
    assert.ok(row.originalDimensions.width > 0 && row.originalDimensions.height > 0)
    assert.match(row.license, /^(CC0|CC BY(?:-SA)? [234]\.0)$/)
    assert.ok(row.image.attribution.includes(row.author)); assert.ok(row.image.attribution.includes(row.license))
    const receipt = (await read(`docs/evidence/task23-photo-images-${row.block}.json`)).receipts.find(r => r.candidateId === row.id)
    assert.equal(receipt.visualReview.reviewed, true)
    if (receipt.metadata.occurrenceKey) {
      const raw = await read(receipt.metadata.metadataCache)
      const occurrence = raw.records.find(r => r.id === row.id).data.results.find(o => o.key === receipt.metadata.occurrenceKey)
      const media = occurrence.media[receipt.metadata.mediaIndex]
      assert.equal(media.identifier, row.originalImageUrl)
      assert.equal(media.creator || media.rightsHolder, row.author)
      assert.equal(media.license.replace(/^http:/, 'https:').replace(/\/?$/, '/'), row.licenseUrl)
      assert.equal(occurrence.scientificName, row.identification.documentedName)
    }
  }
  assert.match(journal.records.find(r => r.id === 'allium-semenovii').image.path, /-task23.webp$/)
  assert.match(journal.records.find(r => r.id === 'rossomyrmex-proformicarum').image.caption.ru, /Музейный экземпляр/)
})

test('all 100 live cards, modals and species pages retain photographs/placeholders, credits and four-language search with unchanged pagination', async () => {
  const index = createSearchIndex(published)
  assert.deepEqual([1,2,3,4,5].map(n => paginateCatalog(published, n).entries.length), [24,24,24,24,4])
  const vite = await createServer({ server: { middlewareMode: true, ws: false, hmr: false, watch: null }, appType: 'custom', logLevel: 'error' })
  try {
    const { siteLanguage } = await vite.ssrLoadModule('/src/composables/useLocale.js')
    const components = await Promise.all(['SpeciesCard.vue','SpeciesModal.vue','SpeciesPage.vue'].map(async n => (await vite.ssrLoadModule('/src/components/' + n)).default))
    for (const language of LANGUAGES) {
      siteLanguage.value = language
      for (const s of published) {
        assert.equal(speciesIdFromPath(speciesPath(s.id)), s.id)
        assert.ok(matchesCatalogFilters(s, { group: s.group }))
        assert.ok(searchSpecies(index, speciesName(s, language)).some(r => r.species.id === s.id), `${s.id}.${language}`)
        for (const [n, component] of components.entries()) {
          const html = await renderToString(createSSRApp(component, { species: s }))
          assert.ok(html.includes(speciesPhoto(s)?.path || 'placeholder.svg'), `${s.id}.${language}.${n}`)
          if (n > 0 && s.images.length) {
            assert.ok(html.includes(escape(s.images[0].author)), `${s.id}: author`)
            assert.ok(html.includes(escape(s.images[0].license)), `${s.id}: licence`)
            assert.ok(html.includes(escape(s.images[0].originalPage)), `${s.id}: source link`)
          }
        }
      }
    }
  } finally { await vite.close() }
})

test('a historical publication manifest cannot silently overwrite subsequent photo edits or grant scientific approval', async () => {
  const hash = digest(await readFile(`${PROJECT_ROOT}/data/species.source.json`))
  const registry = await read('data/research/catalog-100-content-registry.json')
  const report = await runPipeline(PROJECT_ROOT, ['check', '--registry', 'data/research/catalog-100-content-registry.json'])
  const changed = journal.records.filter(r => registry.candidates.some(c => c.id === r.id))
  assert.ok(changed.length)
  for (const row of changed) assert.ok(report.results.find(r => r.candidateId === row.id).errors.length, row.id)
  assert.equal(report.states.approved_for_import, 0)
  assert.equal(digest(await readFile(`${PROJECT_ROOT}/data/species.source.json`)), hash)
})
