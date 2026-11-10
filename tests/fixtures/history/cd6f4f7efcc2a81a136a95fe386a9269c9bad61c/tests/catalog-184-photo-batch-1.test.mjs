import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createServer } from 'vite'
import { PROJECT_ROOT } from '../scripts/build-data.mjs'
import { digest } from '../scripts/lib/research-pipeline.mjs'
import { runPipeline } from '../scripts/bulk-pipeline.mjs'
import { validateSource, validateSpecies } from '../src/data/species-model.js'
import { createSearchIndex, searchSpecies, matchesCatalogFilters } from '../src/data/catalog-search.js'
import { paginateCatalog } from '../src/data/catalog-pagination.js'
import { speciesName } from '../src/data/presentation.js'
import { speciesPath, speciesIdFromPath } from '../src/data/species-routes.js'
import { photoBatch, assertPhotoAmendment, assertPhotoEvidence, historical184, PHOTO_COMMIT, historicalBytes } from './helpers/photo-amendment.mjs'

const bytes = p => readFile(`${PROJECT_ROOT}/${p}`)
const read = async p => JSON.parse(await bytes(p))
// The complete batch-1 state remains immutable after later append-only media events.
const source = JSON.parse(historicalBytes(PHOTO_COMMIT, 'data/species.source.json'))
const published = JSON.parse(historicalBytes(PHOTO_COMMIT, 'public/data/species.json'))
const journal = await photoBatch()
const fresh = () => [structuredClone(source), structuredClone(published), structuredClone(journal)]
const check = (...args) => assertPhotoAmendment(...args)
const files = execFileSync('git', ['ls-files', '-z'], { cwd: PROJECT_ROOT, windowsHide: true }).toString().split('\0').filter(Boolean)
async function trackedHashes() {
  const hashes = {}
  for (const path of files) hashes[path] = digest(await bytes(path))
  return hashes
}

test('photo batch 1 preserves every historical scientific object, archive, 146 old image arrays and their bytes', async () => {
  assert.equal(journal.sourceCommit, '63f8e43d7d6b504079412c03c7cbf6eda421567a')
  assert.equal(PHOTO_COMMIT, 'ffca52781c27b08f5c889dd417d781e2d4854663')
  assert.equal((await check(...fresh())).length, 12)
  assert.equal(historical184().catalog.filter(s => s.images.length).length, 146)
  assert.deepEqual(validateSource(source), [])
  assert.deepEqual(validateSpecies(published, 'published', { publicData: true }), [])
  assert.equal(source.catalog.length, 184); assert.equal(source.demoArchive.length, 2)
  assert.equal(published.filter(s => s.images.length).length, 158)
  assert.equal(published.filter(s => !s.images.length).length, 26)
  assert.equal(journal.records.filter(r => r.kind === 'photograph').length, 8)
  assert.equal(journal.records.filter(r => r.kind === 'herbarium').length, 4)
})

test('a new photo event cannot authorize scientific or archival changes, even with a rewritten scientific fingerprint', async () => {
  const [s,p,j] = fresh(), r = j.records[0], species = s.catalog.find(s => s.id === r.id)
  species.verified = !species.verified
  const { images, ...science } = species
  r.scientificFingerprint = digest(JSON.stringify(science))
  await assert.rejects(check(s,p,j), /all 184 scientific objects/)
  const archive = fresh(); archive[0].demoArchive[0].scientificName += ' changed'
  await assert.rejects(check(...archive), /archive and root scientific data/)
})

test('historical nonempty image arrays and old source/public WebP bytes cannot be replaced', async () => {
  const [s,p,j] = fresh(), old = historical184().catalog.find(s => s.images.length)
  s.catalog.find(s => s.id === old.id).images[0].author += ' replaced'
  await assert.rejects(check(s,p,j), /historical images\/rights unchanged/)
  for (const path of [old.images[0].path, `public${p.find(s => s.id === old.id).images[0].path}`]) {
    await assert.rejects(check(...fresh(), async p => p === path ? Buffer.from('corrupt old WebP') : bytes(p)), /image SHA-256/)
  }
})

test('a photo journal may add only the first image to an originally empty array', async () => {
  const [s,p,j] = fresh(), old = historical184().catalog.find(s => s.images.length)
  j.records[0].id = old.id; j.connectedIds[0] = old.id
  await assert.rejects(check(s,p,j), /addition only to an empty historical image array/)
  const duplicate = fresh(); duplicate[2].records.push(duplicate[2].records[0])
  await assert.rejects(check(...duplicate), /one event per connected image/)
})

test('every new image requires its own taxon, original hash and file-specific primary license evidence', () => {
  for (const r of journal.records) {
    const species = source.catalog.find(s => s.id === r.id)
    assertPhotoEvidence(r, species)
    const wrong = structuredClone(r); wrong.scientificName = 'Unrelated taxon'
    assert.throws(() => assertPhotoEvidence(wrong, species), /taxon identity/)
    const noHash = structuredClone(r); noHash.originalSha256 = ''
    assert.throws(() => assertPhotoEvidence(noHash, species))
    const noPermission = structuredClone(r)
    if (noPermission.sourceMedia) delete noPermission.sourceMedia.license
    else if (noPermission.rightsEvidence.platform) delete noPermission.rightsEvidence.extmetadata.LicenseShortName
    else delete noPermission.rightsEvidence.license
    assert.throws(() => assertPhotoEvidence(noPermission, species))
  }
})

test('corruption or substitution of any new source/public image fails independently of snapshots', async () => {
  for (const r of journal.records) for (const path of [r.image.path, `public/images/approved/${r.id}-1.webp`]) {
    await assert.rejects(check(...fresh(), async p => p === path ? Buffer.from('substituted WebP') : bytes(p)), /image SHA-256/)
  }
  // Even a valid different image with recalculated hashes and refreshed metadata
  // cannot be blessed by rewriting the recorded photo event.
  const [s,p,j] = fresh(), r = j.records[0], other = j.records.find(r=>r.id==='sorbaria-olgae')
  const replacementBytes = await bytes(other.image.path)
  for (const im of [r.image,s.catalog.find(s=>s.id===r.id).images[0],p.find(s=>s.id===r.id).images[0]]) {
    im.sha256 = digest(replacementBytes); im.width = other.image.width; im.height = other.image.height
  }
  r.finalWebPSha256 = r.image.sha256; r.finalWebPBytes = replacementBytes.length
  const paths = [r.image.path,`public/images/approved/${r.id}-1.webp`]
  await assert.rejects(check(s,p,j,async path=>paths.includes(path)?replacementBytes:bytes(path)), /original photo journal must remain immutable/)
})

test('removing a license cannot be hidden by refreshing image arrays, journal metadata or a purported snapshot', async () => {
  const [s,p,j] = fresh(), r = j.records[0]
  for (const im of [r.image,s.catalog.find(s => s.id === r.id).images[0],p.find(s => s.id === r.id).images[0]]) {
    im.license = ''; im.licenseVerified = false
  }
  r.license = ''
  await assert.rejects(check(s,p,j), /explicit image license/)
  const changed = fresh(); changed[2].records[0].originalSha256 = '0'.repeat(64)
  await assert.rejects(check(...changed))
})

test('repeated photo validation is deterministic and changes no tracked files or evidence', async () => {
  const hashes = await trackedHashes()
  const first = await check(...fresh()), second = await check(...fresh())
  assert.deepEqual(first, second)
  assert.deepEqual(await trackedHashes(), hashes)
})

test('old owner decisions still reject the live photo-amended objects without writing or authorizing a new version', async () => {
  const hashes = await trackedHashes()
  for (const id of ['muras-24-4-owner-provisional','muras-25-3-owner-provisional','muras-25-7-owner-provisional','muras-25-11-owner-provisional']) {
    const d = await read(`data/research/publication-decisions/${id}.json`)
    await assert.rejects(runPipeline(PROJECT_ROOT, ['provisional','--registry',d.registry,'--manifest',d.manifest,
      '--mode','dry-run','--owner-role','project_owner','--decision-id',d.decisionId,'--date',d.records[0].date,'--reason',d.records[0].reason]), /нет актуального технического допуска/)
  }
  assert.deepEqual(await trackedHashes(), hashes)
})

test('the live photo-amended catalog retains four-language search, filters, routes, pagination and rendered credits', async () => {
  const index = createSearchIndex(published)
  assert.deepEqual(Array.from({length:8},(_,i)=>paginateCatalog(published,i+1).entries.length), [24,24,24,24,24,24,24,16])
  for (const s of published) {
    assert.equal(speciesIdFromPath(speciesPath(s.id)),s.id)
    for (const language of ['ky','uz','ru','en']) assert.ok(searchSpecies(index,speciesName(s,language)).some(r=>r.species.id===s.id))
    assert.ok(matchesCatalogFilters(s,{group:s.group}))
  }
  const vite = await createServer({server:{middlewareMode:true,ws:false,hmr:false,watch:null},appType:'custom',logLevel:'error'})
  const escape = s => s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll("'",'&#39;')
  try {
    const {siteLanguage} = await vite.ssrLoadModule('/src/composables/useLocale.js')
    const {tr} = await vite.ssrLoadModule('/src/locales/index.js')
    const components = await Promise.all(['SpeciesCard.vue','SpeciesModal.vue','SpeciesPage.vue'].map(async n=>(await vite.ssrLoadModule('/src/components/'+n)).default))
    for (const language of ['ky','uz','ru','en']) {
      siteLanguage.value = language
      for (const r of journal.records) {
        const s = published.find(s=>s.id===r.id), im=s.images[0]
        for (const [i,component] of components.entries()) {
          const html = await renderToString(createSSRApp(component,{species:s}))
          assert.ok(html.includes(im.path), `${s.id}.${language}.${i}: image`)
          if (i>0) {
            for (const text of [im.author,im.license,im.originalPage,im.licenseUrl]) assert.ok(html.includes(escape(text)),`${s.id}.${language}: attribution`)
            if (s.publication?.scientificReviewStatus === 'pending') assert.ok(html.includes(escape(tr(language,'ui.m243'))))
          }
        }
      }
    }
  } finally {await vite.close()}
})