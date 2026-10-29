import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { PROJECT_ROOT } from '../../scripts/build-data.mjs'
import { digest } from '../../scripts/lib/research-pipeline.mjs'
import { webpMetadata } from '../../scripts/import-species-batch.mjs'
import { canPublishImage } from '../../src/data/species-model.js'

export const PHOTO_BASE_COMMIT = '63f8e43d7d6b504079412c03c7cbf6eda421567a'
export const PHOTO_COMMIT = 'ffca52781c27b08f5c889dd417d781e2d4854663'
export const PHOTO_JOURNAL = 'data/research/catalog-184-photo-batch-1.json'
const cache = new Map()
// Git objects are immutable historical evidence, never a snapshot of today's files.
export function historicalBytes(commit, path, expectedSha256) {
  assert.match(commit, /^[a-f0-9]{40}$/)
  assert.match(path, /^[a-zA-Z0-9_./-]+$/)
  const key = `${commit}:${path}`
  if (!cache.has(key)) cache.set(key, execFileSync('git', ['show', key], { cwd: PROJECT_ROOT, maxBuffer: 16 * 1024 * 1024, windowsHide: true }))
  let bytes = Buffer.from(cache.get(key))
  // Historical checksums describe Windows working-tree bytes, while Git stores LF.
  // Reconstruct CRLF only if it matches the original fixed checksum exactly.
  if (expectedSha256 && digest(bytes) !== expectedSha256) {
    const text = bytes.toString('utf8')
    // This original test had exactly one CRLF (line 22), all other lines LF.
    // Its old fixed raw checksum remains authoritative.
    if (path === 'tests/catalog-166-publication.test.mjs' && expectedSha256 === '11695d6d9273c53d1ff42c7e244c5abea0c11531333f868f49c14098cb5d4a47') {
      bytes = Buffer.from(text.split('\n').map((line, i) => i === 21 ? line + '\r' : line).join('\n'))
    } else bytes = Buffer.from(text.replace(/\r?\n/g, '\r\n'))
  }
  if (expectedSha256) assert.equal(digest(bytes), expectedSha256, key)
  return bytes
}
const originalBytes = historicalBytes(PHOTO_BASE_COMMIT, 'data/species.source.json')
assert.equal(digest(originalBytes), 'cee3277b598a87b40126fc24064a6c5c05487a8d107cd7a95d401ad1d380a881')
const originalPublicBytes = historicalBytes(PHOTO_BASE_COMMIT, 'public/data/species.json')
assert.equal(digest(originalPublicBytes), '74a09270cafbf4444f750fe64e9a2e9966b52d0cef4187814b6b22ba043fedd4')
const before = JSON.parse(originalBytes), beforePublic = JSON.parse(originalPublicBytes)
const approvedJournal = JSON.parse(historicalBytes(PHOTO_COMMIT, PHOTO_JOURNAL))
const noImages = ({ images, ...science }) => science
const readBytes = p => readFile(`${PROJECT_ROOT}/${p}`)
const licenseKey = url => String(url).replace(/^http:/, 'https:').replace(/(?:legalcode|deed.en)\/?$/, '').replace(/\/$/, '')

export function historical184() { return structuredClone(before) }
export function historicalPublic184() { return structuredClone(beforePublic) }
export async function photoBatch() {
  const raw = await readBytes(PHOTO_JOURNAL)
  assert.equal(digest(raw), digest(historicalBytes(PHOTO_COMMIT, PHOTO_JOURNAL)), 'immutable photo journal')
  return JSON.parse(raw)
}

export function assertPhotoEvidence(r, species) {
  const im = r.image
  assert.ok(canPublishImage(im), `${r.id}: explicit image license and complete metadata required`)
  assert.equal(r.scientificName, species.scientificName, `${r.id}: taxon identity`)
  for (const key of ['author', 'originalPage', 'license', 'licenseUrl']) assert.equal(r[key], im[key], `${r.id}: ${key}`)
  assert.match(r.originalSha256, /^[a-f0-9]{64}$/)
  assert.equal(r.finalWebPSha256, im.sha256)
  assert.ok(r.originalDimensions.width >= im.width && r.originalDimensions.height >= im.height)
  const credit = r.id === 'dorema-microcarpum' ? 'Komiljon Sh. Tojibaev et al.' : im.author
  assert.ok(im.attribution.includes(credit) && im.attribution.includes(im.license), `${r.id}: attribution`)
  assert.ok(r.primaryEvidenceUrl?.startsWith('https://'), `${r.id}: primary evidence URL`)
  if (r.rightsEvidence?.platform === 'Wikimedia Commons') {
    const e = r.rightsEvidence
    assert.ok(e.revisionId && e.licenseTemplates.length, `${r.id}: Commons revision/license statement`)
    assert.equal(e.extmetadata.LicenseShortName.value, im.license)
    assert.equal(e.metadata.originalPage, im.originalPage)
    assert.equal(e.metadata.author, im.author)
    assert.equal(e.metadata.originalSha256, r.originalSha256)
    assert.equal(licenseKey(e.extmetadata.LicenseUrl.value), licenseKey(im.licenseUrl))
  } else if (r.sourceMedia) {
    assert.equal(r.sourceMedia.identifier, r.sourceUrl, `${r.id}: exact media file`)
    assert.equal(licenseKey(r.sourceMedia.license), licenseKey(im.licenseUrl), `${r.id}: media-specific license`)
    const e = r.primaryEvidence
    if (e?.photos) {
      assert.equal(e.taxon.name, species.scientificName)
      assert.equal(e.taxon.rank, 'species')
      const photo = e.photos.find(p => im.originalPage.endsWith(`/photos/${p.id}`))
      assert.equal(photo?.license_code, 'cc-by', `${r.id}: image license, not observation license`)
      const media = r.mediaLicenseEvidence?.media.find(m => m.identifier === r.sourceUrl)
      assert.equal(licenseKey(media?.license), licenseKey(im.licenseUrl))
      assert.equal(media.creator, im.author)
      assert.equal(e.quality_grade, 'research')
      assert.ok(e.identifications.some(i => i.current && i.taxon.name === species.scientificName))
    } else {
      assert.equal(e?.taxonRank, 'SPECIES')
      assert.ok(e.acceptedScientificName.startsWith(species.scientificName), `${r.id}: accepted specimen name`)
      assert.ok(e.catalogNumber, `${r.id}: specimen identifier`)
      assert.ok(e.media.some(m => m.identifier === r.sourceUrl && licenseKey(m.license) === licenseKey(im.licenseUrl)))
      assert.equal(r.kind, 'herbarium')
    }
  } else {
    assert.equal(r.id, 'dorema-microcarpum')
    assert.equal(r.rightsEvidence?.doi, '10.3897/natureconservation.49.84834')
    assert.equal(r.rightsEvidence.license, im.license)
    assert.match(r.rightsEvidence.articleXmlSha256, /^[a-f0-9]{64}$/)
    assert.equal(r.rightsEvidence.panel, 'A')
    assert.ok(r.crop && r.identity && r.articleAuthors.length)
  }
}

// Validate the actual amendment against a fixed pre-photo release and fixed evidence.
// No configurable replacement baseline and no ignoring images for old nonempty arrays.
export async function assertPhotoAmendment(source, published, journal, load = readBytes) {
  assert.deepEqual({ ...source, catalog: null }, { ...before, catalog: null }, 'archive and root scientific data')
  assert.deepEqual(source.catalog.map(noImages), before.catalog.map(noImages), 'all 184 scientific objects')
  assert.deepEqual(published.map(noImages), beforePublic.map(noImages), 'all 184 public scientific objects')
  assert.equal(source.catalog.length, 184); assert.equal(published.length, 184)
  assert.deepEqual(journal.connectedIds, journal.records.map(r => r.id), 'one event per connected image')
  assert.equal(new Set(journal.connectedIds).size, 12)
  for (const r of journal.records) {
    const old = before.catalog.find(s => s.id === r.id)
    assert.ok(old, `${r.id}: existing taxon`)
    assert.equal(old.images.length, 0, `${r.id}: addition only to an empty historical image array`)
    const s = source.catalog.find(s => s.id === r.id)
    assertPhotoEvidence(r, s)
    assert.deepEqual(s.images, [r.image], `${r.id}: journal/catalog link`)
    assert.equal(digest(JSON.stringify(noImages(s))), r.scientificFingerprint)
    const pub = published.find(s => s.id === r.id)
    assert.deepEqual(pub.images, [{ ...r.image, path: `/images/approved/${r.id}-1.webp` }])
  }
  for (const [i, old] of before.catalog.entries()) {
    const now = source.catalog[i], pub = published[i]
    if (!journal.connectedIds.includes(old.id)) {
      assert.deepEqual(now.images, old.images, `${old.id}: historical images/rights unchanged`)
      assert.deepEqual(pub.images, beforePublic[i].images, `${old.id}: historical public images/rights unchanged`)
    }
    for (const im of now.images) {
      const bytes = await load(im.path)
      const event = journal.records.find(r => r.id === now.id)
      if (canPublishImage(im)) {
        assert.equal(digest(bytes), im.sha256, `${old.id}: source image SHA-256`)
        if (event) assert.equal(bytes.length, event.finalWebPBytes, `${now.id}: new WebP byte length`)
        assert.deepEqual(webpMetadata(bytes), { width: im.width, height: im.height, privateMetadata: false })
      } else {
        // Quarantined legacy originals remain byte-identical and never become public.
        assert.equal(digest(bytes), digest(historicalBytes(PHOTO_BASE_COMMIT, im.path)), `${old.id}: legacy source bytes`)
      }
    }
    for (const im of pub.images) assert.equal(digest(await load(`public${im.path}`)), im.sha256, `${old.id}: public image SHA-256`)
  }
  // Evidence cannot be rewritten to bless a new license, hash, author or taxon.
  assert.deepEqual(journal, approvedJournal, 'original photo journal must remain immutable')
  return journal.records
}