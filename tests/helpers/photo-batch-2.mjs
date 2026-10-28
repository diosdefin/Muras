import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PROJECT_ROOT } from '../../scripts/build-data.mjs'
import { digest } from '../../scripts/lib/research-pipeline.mjs'
import { webpMetadata } from '../../scripts/import-species-batch.mjs'
import { canPublishImage } from '../../src/data/species-model.js'
import { historicalBytes, photoBatch, assertPhotoAmendment } from './photo-amendment.mjs'

export const BATCH2_BASE = 'c2999c61c2e019e32f06ffdde32fc2c6081b10e1'
export const BATCH2_JOURNAL = 'data/research/catalog-184-photo-batch-2.json'
const EVIDENCE_FINGERPRINT = '069f7714522445348dabbb12df3ddf8e8b0b5d5219cd6956a79c437dc17453cd'
const readBytes = p => readFile(`${PROJECT_ROOT}/${p}`)
const before = JSON.parse(historicalBytes(BATCH2_BASE, 'data/species.source.json', 'e079d24d0dc1b23bf40cab66a19f2276deb0a5940a4eefc4c1d6e810a7c0139c'))
const beforePublic = JSON.parse(historicalBytes(BATCH2_BASE, 'public/data/species.json', '0eebd3129fa441592dabcf665cf0e9f1807fb500ea6525e918ec3f8cdd078a1d'))
const selected = JSON.parse(historicalBytes(BATCH2_BASE, 'data/research/catalog-184-photo-audit.json')).batches[1].ids
const connected = ['diptychus-dybowskii-lansdelli', 'terpsiphone-paradisi', 'parnassius-apollo-merzbacheri']
const noImages = ({ images, ...science }) => science
export const batch2Before = () => structuredClone(before)
export const batch2BeforePublic = () => structuredClone(beforePublic)
export async function photoBatch2() { return JSON.parse(await readBytes(BATCH2_JOURNAL)) }

export function assertBatch2Evidence(r, species) {
  const im = r.image, e = r.primaryEvidence, permission = r.rightsEvidence?.photo
  assert.ok(canPublishImage(im), `${r.id}: explicit image license required`)
  assert.equal(r.scientificName, species.scientificName, `${r.id}: exact taxon`)
  assert.equal(e.taxon.name, species.scientificName)
  assert.equal(e.taxon.rank, r.rank)
  assert.equal(r.rank, species.scientificName.split(' ').length === 3 ? 'subspecies' : 'species')
  assert.equal(e.community_taxon_id, e.taxon.id)
  assert.equal(e.quality_grade, 'research')
  assert.ok(e.identifications.filter(i => i.current && i.taxon.name === species.scientificName && i.taxon.rank === r.rank).length >= 2, `${r.id}: exact independent community identifications`)
  const photo = e.photos.find(p => im.originalPage === `https://www.inaturalist.org/photos/${p.id}`)
  assert.ok(photo, `${r.id}: exact photo page`)
  assert.equal(permission.id, photo.id)
  assert.equal(permission.native_page_url, null, `${r.id}: no unverified third-party repost`)
  assert.equal(permission.license_url, im.licenseUrl, `${r.id}: original file-specific license URL`)
  const cc = { 'cc-by': ['CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/'], 'cc-by-sa': ['CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'] }[photo.license_code]
  assert.ok(cc, `${r.id}: permitted license`)
  assert.deepEqual([im.license, im.licenseUrl], cc)
  assert.equal(im.author, e.user.name)
  assert.ok(photo.attribution.includes(im.author) && permission.attribution.includes(im.author))
  assert.ok(im.attribution.includes(im.author) && im.attribution.includes(im.license))
  for (const key of ['author','originalPage','license','licenseUrl']) assert.equal(r[key], im[key])
  assert.equal(r.sourceUrl, photo.url.replace('/square.', '/original.'))
  assert.equal(new URL(r.sourceUrl).hostname, 'inaturalist-open-data.s3.amazonaws.com')
  assert.equal(r.primaryEvidenceUrl, `https://api.inaturalist.org/v1/observations/${e.id}`)
  assert.equal(r.rightsEvidence.primaryUrl, `https://www.inaturalist.org/observations/${e.id}.json`)
  assert.match(r.rightsEvidence.responseSha256, /^[a-f0-9]{64}$/)
  assert.match(r.originalSha256, /^[a-f0-9]{64}$/)
  assert.equal(r.originalDimensions.width, permission.width)
  assert.equal(r.originalDimensions.height, permission.height)
  assert.ok(im.width <= permission.width && im.height <= permission.height, 'no upscaling')
  assert.equal(r.finalWebPSha256, im.sha256)
  assert.deepEqual(r.catalogTaxonIds, species.sources.filter(s=>s.taxonId).map(s=>s.taxonId))
  assert.equal(r.kind, 'photograph')
}

export async function assertPhotoBatch2(source, published, journal, load = readBytes) {
  assert.equal(journal.sourceCommit, BATCH2_BASE)
  assert.equal(journal.task, '26.3')
  assert.equal(journal.documentType, 'catalog-photo-only-amendments')
  assert.equal(journal.authorization.scientificApproval, false)
  assert.deepEqual(journal.candidateIds, selected, 'only the original 19 batch-2 taxa')
  assert.deepEqual(journal.connectedIds, connected)
  assert.deepEqual(journal.records.map(r=>r.id), connected)
  assert.equal(journal.counts.connected, 3)
  assert.deepEqual({ ...source, catalog: null }, { ...before, catalog: null }, 'archive/root unchanged')
  assert.deepEqual(source.catalog.map(noImages), before.catalog.map(noImages), '184 scientific objects unchanged')
  assert.deepEqual(published.map(noImages), beforePublic.map(noImages), 'public scientific objects unchanged')
  for (const [i, old] of before.catalog.entries()) {
    const now = source.catalog[i], pub = published[i], event = journal.records.find(r=>r.id===old.id)
    if (!event) {
      assert.deepEqual(now.images, old.images, `${old.id}: historical source media immutable`)
      assert.deepEqual(pub.images, beforePublic[i].images, `${old.id}: historical public media immutable`)
    } else {
      assert.equal(old.images.length, 0, `${old.id}: only a historically empty image array`)
      assertBatch2Evidence(event, now)
      assert.deepEqual(now.images, [event.image], `${old.id}: journal/catalog link`)
      assert.equal(event.scientificFingerprint, digest(JSON.stringify(noImages(now))))
      assert.deepEqual(pub.images, [{ ...event.image, path: `/images/approved/${old.id}-1.webp` }])
    }
    for (const im of now.images.filter(canPublishImage)) {
      const bytes = await load(im.path)
      assert.equal(digest(bytes), im.sha256, `${old.id}: source image SHA-256`)
      assert.deepEqual(webpMetadata(bytes), { width: im.width, height: im.height, privateMetadata: false })
      if (event) assert.equal(bytes.length, event.finalWebPBytes)
    }
    for (const im of pub.images) {
      assert.ok(canPublishImage(im), `${old.id}: public permission`)
      assert.equal(digest(await load(`public${im.path}`)), im.sha256, `${old.id}: public image SHA-256`)
    }
  }
  const payload = { sourceCommit: journal.sourceCommit, candidateIds: journal.candidateIds, connectedIds: journal.connectedIds, records: journal.records }
  assert.equal(digest(JSON.stringify(payload)), EVIDENCE_FINGERPRINT, 'immutable batch-2 evidence')
  assert.equal(journal.evidenceFingerprint, EVIDENCE_FINGERPRINT)
  return journal.records
}

export async function allPhotoAmendments(source, published, load = readBytes) {
  // Validate both immutable stages. New evidence cannot rewrite the old stage.
  const prior = await assertPhotoAmendment(batch2Before(), batch2BeforePublic(), await photoBatch(), load)
  const next = await assertPhotoBatch2(source, published, await photoBatch2(), load)
  return [...prior, ...next]
}