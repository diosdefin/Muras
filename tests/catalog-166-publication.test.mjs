import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createServer } from 'vite'
import { PROJECT_ROOT } from '../scripts/build-data.mjs'
import { digest, fingerprint, candidateFingerprint } from '../scripts/lib/research-pipeline.mjs'
import { createLocalAdapter } from '../scripts/lib/local-research-adapter.mjs'
import { runPipeline } from '../scripts/bulk-pipeline.mjs'
import { validateSource, validateSpecies, canPublishImage } from '../src/data/species-model.js'
import { webpMetadata, canApplyOnBranch } from '../scripts/import-species-batch.mjs'
import { LANGUAGES } from '../src/data/localization.js'
import { speciesName, speciesPhoto } from '../src/data/presentation.js'
import { createSearchIndex, searchSpecies, matchesCatalogFilters, catalogOptions } from '../src/data/catalog-search.js'
import { paginateCatalog, prioritizeIllustratedResults } from '../src/data/catalog-pagination.js'
import { speciesPath, speciesIdFromPath } from '../src/data/species-routes.js'
import { importSource, MAX_JSON_BYTES } from '../src/admin/data/model.js'

const bytes = path => readFile(`${PROJECT_ROOT}/${path}`)
const read = async path => JSON.parse(await bytes(path))
const source = await read('data/species.source.json'), published = await read('public/data/species.json')
const before = await read('data/backups/catalog-166/species.source.json')
const beforePublic = await read('data/backups/catalog-166/public-species.json')
const manifestPath = 'data/research/catalog-167-review-manifest.json'
const manifest = await read(manifestPath), registry = await read(manifest.registry)
const decision = await read('data/research/publication-decisions/muras-25-3-owner-provisional.json')
const additions = source.catalog.slice(150), publicAdditions = published.slice(150)
const heldId = 'kosopoljanskia-hebecarpa'

test('catalog 166 preserves the exact prior 150 and publishes only the 16 owner-authorized pending drafts', async () => {
  assert.equal(before.catalog.length, 150); assert.equal(beforePublic.length, 150)
  assert.equal(source.catalog.length, 166); assert.equal(published.length, 166)
  assert.deepEqual(source.catalog.slice(0, 150), before.catalog)
  assert.deepEqual(published.slice(0, 150), beforePublic)
  assert.deepEqual(source.demoArchive, before.demoArchive)
  assert.deepEqual(additions.map(s => s.id), manifest.candidateIds)
  assert.deepEqual(publicAdditions.map(s => s.id), manifest.candidateIds)
  assert.equal(new Set([...source.catalog, ...source.demoArchive].map(s => s.id)).size, 168)
  assert.equal(new Set(source.catalog.map(s => s.scientificName.normalize('NFKC').toLowerCase())).size, 166)
  assert.deepEqual(validateSource(source), [])
  assert.deepEqual(validateSpecies(published, 'published', { publicData: true }), [])
  assert.equal(digest(await bytes(manifestPath)), 'a56943c3295e3619a6e5c6d418071b813cc89970499e655b1cf923bbf428aefe')
  assert.equal(fingerprint(registry), '2aa4ae2a31a6a84375eb9f463091a744f06a02683981e0015e4b538027de7a78')
  assert.equal(manifest.candidateIds.includes(heldId), false)
  assert.equal(source.catalog.some(s => s.id === heldId), false)
  assert.equal(published.some(s => s.id === heldId), false)
  assert.equal(registry.candidates.find(c => c.id === heldId).state, 'needs_evidence')
  assert.equal(decision.manifestSha256, digest(await bytes(manifestPath)))
  assert.equal(decision.registryFingerprint, fingerprint(registry)); assert.equal(decision.scientificApproval, null)
  assert.deepEqual(decision.records.map(r => r.id), manifest.candidateIds)
  const adapter = createLocalAdapter(PROJECT_ROOT)
  for (const [n, s] of additions.entries()) {
    const { publication, ...science } = s, entry = manifest.candidates[n], record = decision.records[n]
    assert.deepEqual(science, await read(entry.draftFile))
    assert.equal(digest(await bytes(entry.draftFile)), entry.draftSha256)
    const c = registry.candidates.find(c => c.id === s.id)
    assert.equal(candidateFingerprint(c, await adapter.load(c)), entry.checkedFingerprint)
    assert.equal(c.approval, null); assert.equal(s.verified, false); assert.equal(s.lastReviewedAt, null)
    assert.equal(s.population.type, 'unknown'); assert.equal(s.population.reviewStatus, 'pending')
    for (const field of ['value', 'min', 'max', 'year', 'territory', 'method']) assert.equal(s.population[field], null)
    assert.equal(s.nationalRedBook.year, 2006); assert.match(s.nationalRedBook.edition, /историческ/)
    assert.equal(publication.status, 'provisional'); assert.equal(publication.scientificReviewStatus, 'pending')
    assert.equal(publication.independentReviewer, null); assert.equal(publication.decisionId, decision.decisionId)
    assert.equal(publication.publishedAt, '2026-10-21'); assert.equal(publication.researchFingerprint, entry.checkedFingerprint)
    assert.equal(record.fingerprint, entry.checkedFingerprint); assert.equal(record.draftSha256, entry.draftSha256)
    assert.equal(record.ownerRole, 'project_owner'); assert.equal(record.date, '2026-10-21')
    assert.ok(record.reason.includes(decision.manifestSha256)); assert.match(record.reason, /pending/)
    assert.equal(record.independentReviewer, null); assert.equal(record.scientificReviewStatus, 'pending')
  }
  const baseline = await read('data/backups/catalog-166/baseline.json')
  const immutable = baseline.files.filter(f => f.path.startsWith('data/research/') || f.path.startsWith('assets/') ||
    f.path.startsWith('docs/evidence/') || f.path.startsWith('public/images/'))
  for (const f of immutable) assert.equal(digest(await bytes(f.path)), f.sha256, f.path)
  assert.equal(canApplyOnBranch('feature/catalog-200'), true); assert.equal(canApplyOnBranch('main'), false)
})

test('166 live species retain correct pagination, four-language search, routes, filters and all licensed WebP', async () => {
  assert.equal(additions.reduce((n, s) => n + s.images.length, 0), 13)
  assert.equal(publicAdditions.reduce((n, s) => n + s.images.length, 0), 13)
  assert.deepEqual(publicAdditions.filter(s => !s.images.length).map(s => s.id), ['sorbus-persica', 'otostegia-schennikovii', 'centaurea-alaica'])
  for (const ordered of [published, prioritizeIllustratedResults(published, s => Boolean(speciesPhoto(s)))]) {
    const pages = Array.from({ length: 7 }, (_, n) => paginateCatalog(ordered, n + 1))
    assert.deepEqual(pages.map(p => p.entries.length), [24, 24, 24, 24, 24, 24, 22])
    assert.deepEqual(pages.flatMap(p => p.entries).map(s => s.id), ordered.map(s => s.id))
    assert.equal(new Set(pages.flatMap(p => p.entries).map(s => s.id)).size, 166)
  }
  const index = createSearchIndex(published), options = catalogOptions(published), hashes = new Set()
  for (const s of published) {
    assert.equal(speciesIdFromPath(speciesPath(s.id)), s.id)
    for (const language of LANGUAGES) assert.ok(searchSpecies(index, speciesName(s, language)).some(r => r.species.id === s.id), `${s.id}.${language}`)
    for (const im of s.images) {
      const data = await bytes(`public${im.path}`)
      assert.equal(digest(data), im.sha256)
      assert.deepEqual(webpMetadata(data), { width: im.width, height: im.height, privateMetadata: false })
      assert.ok(!hashes.has(im.sha256), `duplicate photo ${s.id}`); hashes.add(im.sha256)
    }
  }
  assert.equal(hashes.size, 143)
  for (const s of publicAdditions) {
    const status = s.iucn.category || 'UNKNOWN'
    assert.ok(options.groups.some(o => o.value === s.group))
    assert.ok(options.statuses.some(o => o.value === status))
    assert.ok(matchesCatalogFilters(s, { group: s.group, status, region: 'Кыргызстан' }))
    assert.equal(matchesCatalogFilters(s, { group: s.group === 'birds' ? 'plants' : 'birds' }), false)
    assert.equal(matchesCatalogFilters(s, { region: 'Unrelated region' }), false)
    for (const im of s.images) {
      assert.ok(canPublishImage(im)); assert.ok(im.attribution.includes(im.author)); assert.ok(im.attribution.includes(im.license))
      const original = additions.find(x => x.id === s.id).images[0]
      assert.equal(digest(await bytes(original.path)), im.sha256)
      assert.equal(im.originalPage, original.originalPage); assert.equal(im.licenseUrl, original.licenseUrl)
    }
  }
  const curlew = publicAdditions.find(s => s.id === 'numenius-tenuirostris')
  assert.equal(curlew.iucn.category, 'EX'); assert.equal(curlew.iucn.year, 2025)
  assert.match(curlew.content.shortDescription.text.ru, /вымирание/)
  assert.equal(curlew.nationalRedBook.category, 'CR'); assert.equal(curlew.nationalRedBook.year, 2006)
})

test('all 16 new cards, modals and species pages render credits, placeholders and pending disclosures in four languages', async () => {
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
        if (n > 0) {
          assert.ok(html.includes(escape(tr(language, 'ui.m243'))), `${s.id}.${language}: review disclosure`)
          assert.ok(html.includes('2006'), `${s.id}.${language}: historical year`)
        }
      }
    }
  } finally { await vite.close() }
})

test('the same owner decision repeats as a read-only dry-run with zero additions and all 16 unchanged', async () => {
  const originalSource = digest(await bytes('data/species.source.json')), originalRegistry = fingerprint(registry)
  const result = await runPipeline(PROJECT_ROOT, ['provisional', '--registry', manifest.registry, '--manifest', manifestPath,
    '--mode', 'dry-run', '--owner-role', 'project_owner', '--decision-id', decision.decisionId, '--date', '2026-10-21', '--reason', decision.records[0].reason])
  assert.deepEqual(result.counts, { processed: 16, added: 0, unchanged: 16, rejected: 0 })
  assert.equal(result.applied, false); assert.equal(result.scientificApproval, null)
  assert.equal(digest(await bytes('data/species.source.json')), originalSource)
  assert.equal(fingerprint(await read(manifest.registry)), originalRegistry)
})

test('the bounded admin importer accepts the formatted 166-record source without changing validation', async () => {
  const data = await bytes('data/species.source.json')
  assert.ok(data.length > 2 * 1024 * 1024)
  assert.ok(data.length < MAX_JSON_BYTES)
  assert.deepEqual(importSource(data.toString('utf8')), source)
  assert.throws(() => importSource(' '.repeat(MAX_JSON_BYTES + 1)), /admin.error.jsonSize/)
})
