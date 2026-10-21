import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createServer } from 'vite'
import { PROJECT_ROOT } from '../scripts/build-data.mjs'
import { digest, fingerprint } from '../scripts/lib/research-pipeline.mjs'
import { webpMetadata } from '../scripts/import-species-batch.mjs'
import { validateSource } from '../src/data/species-model.js'
import { LANGUAGES } from '../src/data/localization.js'
import { speciesPhoto } from '../src/data/presentation.js'

const read = async p => JSON.parse(await readFile(`${PROJECT_ROOT}/${p}`, 'utf8'))
const baseline = await read('data/backups/catalog-100-photo-final/species.source.json')
const beforePublic = await read('data/backups/catalog-100-photo-final/public-species.json')
// Immutable task 23.1 release; catalog-125-publication tests cover live additions
// and verify that these complete 100 records remain unchanged.
const source = await read('data/backups/catalog-125/species.source.json'), published = await read('data/backups/catalog-125/public-species.json')
const journal = await read('data/research/catalog-100-photo-final-updates.json')
const selection = await read('data/research/catalog-100-photo-final-selection.json')
const added = journal.records.filter(r => r.status === 'published')
const strip = d => ({ ...d, catalog: d.catalog.map(({ images, ...r }) => r) })

test('final photo pass changes only three empty image arrays, preserves all 85 prior images and every scientific field', async () => {
  assert.equal(source.catalog.length, 100); assert.deepEqual(validateSource(source), [])
  assert.deepEqual(strip(source), strip(baseline))
  assert.deepEqual(published.map(({ images, ...r }) => r), beforePublic.map(({ images, ...r }) => r))
  assert.deepEqual(selection.candidateIds, baseline.catalog.filter(s => !s.images.length).map(s => s.id))
  assert.equal(selection.candidateIds.length, 15)
  assert.deepEqual(added.map(r => r.id).sort(), ['tulipa-zenaidae','barbastella-leucomelas','said-alievs-toad-agama'].sort())
  assert.equal(added.filter(r => r.kind === 'scientific_illustration').length, 1)
  assert.equal(added.filter(r => r.kind.endsWith('photograph')).length, 2)
  assert.equal(published.filter(s => s.images.length).length, 88)
  assert.equal(published.filter(s => !s.images.length).length, 12)
  for (const old of baseline.catalog) {
    const s = source.catalog.find(s => s.id === old.id)
    if (old.images.length || !added.some(r => r.id === old.id)) assert.deepEqual(s.images, old.images, old.id)
  }
  for (const s of beforePublic) for (const im of s.images) assert.equal(digest(await readFile(`${PROJECT_ROOT}/public${im.path}`)), im.sha256)
})

test('each newly used file has specific rights and documented identity, and rejected museum material cannot enter the catalog', async () => {
  const hashes = published.flatMap(s => s.images.map(im => im.sha256))
  assert.equal(new Set(hashes).size, hashes.length)
  for (const row of added) {
    const { images, ...science } = source.catalog.find(s => s.id === row.id)
    assert.deepEqual(images, [row.image]); assert.equal(fingerprint(science), row.scientificFingerprint)
    assert.equal(row.visualReview.reviewed, true); assert.equal(row.identification.independentDetermination, false)
    assert.match(row.originalSha256, /^[a-f0-9]{64}$/); assert.match(row.license, /^CC BY (2|4)\.0$/)
    assert.ok(row.originalDimensions.width >= row.image.width && row.originalDimensions.height >= row.image.height)
    const data = await readFile(`${PROJECT_ROOT}/${row.image.path}`)
    assert.equal(digest(data), row.image.sha256)
    assert.deepEqual(webpMetadata(data), { width: row.image.width, height: row.image.height, privateMetadata: false })
  }
  const bat = added.find(r => r.id === 'barbastella-leucomelas')
  assert.equal(bat.kind, 'scientific_illustration'); assert.match(bat.image.caption.ru, /не фотография/)
  const raw = await read('docs/evidence/task23-1-discovery.json')
  const page = Object.values(raw.records.find(r => r.id === 'commons-selected').data.query.pages).find(p => p.title === bat.evidence.fileTitle)
  assert.match(page.revisions[0].slots.main['*'], /\{\{CC-BY-2.0\}\}/i)
  const rejected = journal.records.find(r => r.status === 'unresolved')
  assert.ok(rejected.rejectionReason.includes('этикетке'))
  assert.ok(!hashes.includes(rejected.image.sha256))
  const agama = added.find(r => r.id === 'said-alievs-toad-agama')
  const record = (await read(agama.evidence.path)).records[0].data.results[0]
  assert.equal(record.media[agama.evidence.mediaIndex].creator, agama.author)
  assert.equal(record.media[agama.evidence.mediaIndex].license, 'http://creativecommons.org/licenses/by/4.0/')
  assert.match(agama.identification.documentedName, /helioscopus saidalievi/)
})

test('all 15 targeted cards, modals and species pages render the final image or placeholder and attribution in all four languages', async () => {
  const vite = await createServer({ server: { middlewareMode: true, ws: false, hmr: false, watch: null }, appType: 'custom', logLevel: 'error' })
  const escape = s => s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll("'",'&#39;')
  try {
    const { siteLanguage } = await vite.ssrLoadModule('/src/composables/useLocale.js')
    const components = await Promise.all(['SpeciesCard.vue','SpeciesModal.vue','SpeciesPage.vue'].map(async n => (await vite.ssrLoadModule('/src/components/' + n)).default))
    for (const language of LANGUAGES) {
      siteLanguage.value = language
      for (const s of published.filter(s => selection.candidateIds.includes(s.id))) for (const [n, component] of components.entries()) {
        const html = await renderToString(createSSRApp(component, { species: s }))
        assert.ok(html.includes(speciesPhoto(s)?.path || 'placeholder.svg'), `${s.id}.${language}`)
        if (n > 0 && s.images.length) for (const value of [s.images[0].author,s.images[0].license,s.images[0].originalPage]) assert.ok(html.includes(escape(value)))
        if (n > 0 && s.id === 'barbastella-leucomelas') assert.ok(html.includes('Историческая научная иллюстрация'))
      }
    }
  } finally { await vite.close() }
})
