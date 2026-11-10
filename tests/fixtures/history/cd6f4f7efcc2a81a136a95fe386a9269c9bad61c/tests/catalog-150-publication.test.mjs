import { historicalPipeline } from './helpers/historical-pipeline.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createServer } from 'vite'
import { PROJECT_ROOT } from '../scripts/build-data.mjs'
import { digest, fingerprint } from '../scripts/lib/research-pipeline.mjs'
import { runPipeline } from '../scripts/bulk-pipeline.mjs'
import { validateSource, validateSpecies, canPublishImage } from '../src/data/species-model.js'
import { webpMetadata } from '../scripts/import-species-batch.mjs'
import { LANGUAGES } from '../src/data/localization.js'
import { speciesName, speciesPhoto } from '../src/data/presentation.js'
import { createSearchIndex, searchSpecies, matchesCatalogFilters, catalogOptions } from '../src/data/catalog-search.js'
import { paginateCatalog, prioritizeIllustratedResults } from '../src/data/catalog-pagination.js'
import { speciesPath, speciesIdFromPath } from '../src/data/species-routes.js'

const bytes = path => readFile(`${PROJECT_ROOT}/${path}`)
const read = async path => JSON.parse(await bytes(path))
// Immutable 150-record release; catalog-166-publication checks the live catalogue.
const source = await read('data/backups/catalog-166/species.source.json'), published = await read('data/backups/catalog-166/public-species.json')
const before = await read('data/backups/catalog-150/species.source.json')
const beforePublic = await read('data/backups/catalog-150/public-species.json')
const baseline = await read('data/backups/catalog-150/baseline.json')
const manifestPath = 'data/research/catalog-150-unified-review-manifest.json'
const manifest = await read(manifestPath), registry = await read(manifest.registry)
const decision = await read('data/research/publication-decisions/muras-24-4-owner-provisional.json')
const additions = source.catalog.slice(125), publicAdditions = published.slice(125)
const reason = 'Отдельное разрешение владельца на предварительную публикацию manifest SHA-256 e1b61981b42be0f9885eeb97a0f32b4b13aa931a4a87ceb22e11409e77e47b27; независимое научное одобрение отсутствует, scientificReviewStatus pending.'

test('catalog 150 preserves all prior 125 objects and assets and publishes only the exact owner-authorized pending drafts', async () => {
  assert.equal(before.catalog.length, 125); assert.equal(beforePublic.length, 125)
  assert.equal(source.catalog.length, 150); assert.equal(published.length, 150)
  assert.deepEqual(source.catalog.slice(0, 125), before.catalog)
  assert.deepEqual(published.slice(0, 125), beforePublic)
  assert.deepEqual(source.demoArchive, before.demoArchive)
  assert.deepEqual(additions.map(s => s.id), manifest.candidateIds)
  assert.deepEqual(publicAdditions.map(s => s.id), manifest.candidateIds)
  assert.equal(new Set([...source.catalog, ...source.demoArchive].map(s => s.id)).size, 152)
  assert.equal(new Set(source.catalog.map(s => s.scientificName.normalize('NFKC').toLowerCase())).size, 150)
  assert.deepEqual(validateSource(source), [])
  assert.deepEqual(validateSpecies(published, 'published', { publicData: true }), [])
  assert.equal(digest(await bytes(manifestPath)), 'e1b61981b42be0f9885eeb97a0f32b4b13aa931a4a87ceb22e11409e77e47b27')
  assert.equal(fingerprint(registry), '69acb83ebcc96c30bc378b80a60db3b2199cd48220f874593ba28067932014d0')
  assert.equal(decision.manifestSha256, digest(await bytes(manifestPath)))
  assert.equal(decision.registryFingerprint, fingerprint(registry)); assert.equal(decision.scientificApproval, null)
  assert.deepEqual(decision.records.map(r => r.id), manifest.candidateIds)
  assert.ok(registry.candidates.every(c => c.approval === null))
  for (const [n, s] of additions.entries()) {
    const { publication, ...science } = s, entry = manifest.candidates[n], record = decision.records[n]
    assert.deepEqual(science, await read(entry.draftFile))
    assert.equal(digest(await bytes(entry.draftFile)), entry.draftSha256)
    assert.equal(s.verified, false); assert.equal(s.lastReviewedAt, null)
    assert.equal(s.population.type, 'unknown'); assert.equal(s.population.reviewStatus, 'pending')
    for (const field of ['value', 'min', 'max', 'year', 'territory', 'method']) assert.equal(s.population[field], null)
    assert.equal(s.nationalRedBook.year, 2006); assert.match(s.nationalRedBook.edition, /историческ/)
    assert.equal(publication.status, 'provisional'); assert.equal(publication.scientificReviewStatus, 'pending')
    assert.equal(publication.independentReviewer, null); assert.equal(publication.decisionId, decision.decisionId)
    assert.equal(publication.publishedAt, '2026-10-16'); assert.equal(publication.researchFingerprint, entry.checkedFingerprint)
    assert.equal(record.fingerprint, entry.checkedFingerprint); assert.equal(record.draftSha256, entry.draftSha256)
    assert.equal(record.ownerRole, 'project_owner'); assert.equal(record.date, '2026-10-16'); assert.equal(record.reason, reason)
    assert.equal(record.independentReviewer, null); assert.equal(record.scientificReviewStatus, 'pending')
  }
  for (const f of [...baseline.files, ...baseline.immutable]) assert.equal(digest(await bytes(f.path)), f.sha256, f.path)
  const gazelle = additions.find(s => s.id === 'gazella-subgutturosa')
  assert.match(gazelle.content.shortDescription.text.ru, /Современная численность и сохранение дикой популяции в стране не установлены/)
  assert.match(gazelle.content.distribution.text.ru, /не подтверждение нынешнего наличия/)
  assert.equal(registry.candidates.find(c => c.id === gazelle.id).countryOccurrence.currentPresenceConfirmed, null)
})

test('150 release species retain valid WebP, four-language search, routes, filters and seven complete pagination pages', async () => {
  assert.equal(additions.reduce((n, s) => n + s.images.length, 0), 22)
  assert.equal(publicAdditions.reduce((n, s) => n + s.images.length, 0), 22)
  assert.equal(publicAdditions.filter(s => !s.images.length).length, 3)
  for (const ordered of [published, prioritizeIllustratedResults(published, s => Boolean(speciesPhoto(s)))]) {
    const pages = Array.from({ length: 7 }, (_, n) => paginateCatalog(ordered, n + 1))
    assert.deepEqual(pages.map(p => p.entries.length), [24, 24, 24, 24, 24, 24, 6])
    assert.deepEqual(pages.flatMap(p => p.entries).map(s => s.id), ordered.map(s => s.id))
    assert.equal(new Set(pages.flatMap(p => p.entries).map(s => s.id)).size, 150)
  }
  const index = createSearchIndex(published), options = catalogOptions(published)
  for (const s of published) {
    assert.equal(speciesIdFromPath(speciesPath(s.id)), s.id)
    for (const language of LANGUAGES) assert.ok(searchSpecies(index, speciesName(s, language)).some(r => r.species.id === s.id), `${s.id}.${language}`)
  }
  for (const s of publicAdditions) {
    assert.ok(options.groups.some(o => o.value === s.group))
    assert.ok(matchesCatalogFilters(s, { group: s.group, status: 'UNKNOWN' }))
    assert.equal(matchesCatalogFilters(s, { group: s.group === 'birds' ? 'plants' : 'birds' }), false)
    assert.equal(matchesCatalogFilters(s, { status: 'CR' }), false)
    assert.ok(options.regions.filter(r => r !== 'ALL').some(region => matchesCatalogFilters(s, { region })))
    assert.equal(matchesCatalogFilters(s, { region: 'Unrelated region' }), false)
  }
  const hashes = new Set()
  for (const s of published) for (const im of s.images) {
    const data = await bytes(`public${im.path}`)
    assert.equal(digest(data), im.sha256)
    assert.deepEqual(webpMetadata(data), { width: im.width, height: im.height, privateMetadata: false })
    assert.ok(!hashes.has(im.sha256), `duplicate photo ${s.id}`); hashes.add(im.sha256)
  }
  assert.equal(hashes.size, 130)
  for (const s of publicAdditions) for (const im of s.images) {
    assert.ok(canPublishImage(im)); assert.ok(im.attribution.includes(im.author)); assert.ok(im.attribution.includes(im.license))
    const original = additions.find(x => x.id === s.id).images[0]
    assert.equal(digest(await bytes(original.path)), im.sha256)
    assert.equal(im.originalPage, original.originalPage); assert.equal(im.licenseUrl, original.licenseUrl)
  }
})

test('all 25 new cards, modals and species pages render photos/placeholders, credits and pending status in four languages', async () => {
  const vite = await createServer({ server: { middlewareMode: true, ws: false, hmr: false, watch: null }, appType: 'custom', logLevel: 'error' })
  const escape = s => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll("'", '&#39;')
  try {
    const { siteLanguage } = await vite.ssrLoadModule('/src/composables/useLocale.js')
    const components = await Promise.all(['SpeciesCard.vue', 'SpeciesModal.vue', 'SpeciesPage.vue'].map(async name => (await vite.ssrLoadModule('/src/components/' + name)).default))
    const { tr } = await vite.ssrLoadModule('/src/locales/index.js')
    for (const language of LANGUAGES) {
      siteLanguage.value = language
      for (const s of publicAdditions) for (const [n, component] of components.entries()) {
        const html = await renderToString(createSSRApp(component, { species: s }))
        assert.ok(html.includes(speciesPhoto(s)?.path || 'placeholder.svg'), `${s.id}.${language}.${n}`)
        if (n > 0 && s.images.length) for (const value of [s.images[0].author, s.images[0].license, s.images[0].originalPage]) {
          assert.ok(html.includes(escape(value)), `${s.id}.${language}: attribution`)
        }
        if (n > 0) assert.ok(html.includes(escape(tr(language, 'ui.m243'))), `${s.id}.${language}: review disclosure`)
      }
    }
  } finally { await vite.close() }
})

test('a repeat of the same owner decision is a read-only dry-run with zero additions and 25 unchanged records', async () => {
  const originalSource = digest(await bytes('data/species.source.json')), originalRegistry = fingerprint(registry)
  const result = await historicalPipeline(source, root => runPipeline(root, ['provisional', '--registry', manifest.registry, '--manifest', manifestPath,
    '--mode', 'dry-run', '--owner-role', 'project_owner', '--decision-id', decision.decisionId, '--date', '2026-10-16', '--reason', reason]))
  assert.deepEqual(result.counts, { processed: 25, added: 0, unchanged: 25, rejected: 0 })
  assert.equal(result.applied, false); assert.equal(result.scientificApproval, null)
  assert.equal(digest(await bytes('data/species.source.json')), originalSource)
  assert.equal(fingerprint(await read(manifest.registry)), originalRegistry)
})
