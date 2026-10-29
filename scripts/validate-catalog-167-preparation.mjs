// Read-only audit of the unpublished task-25.2 packet. Never authorizes/imports.
import assert from 'node:assert/strict'
import { readFile, readdir, stat } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { digest, fingerprint, candidateFingerprint } from './lib/research-pipeline.mjs'
import { createLocalAdapter, inspectPipelineAssets } from './lib/local-research-adapter.mjs'
import { validateSpecies } from '../src/data/species-model.js'
import { canApplyOnBranch } from './import-species-batch.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const bytes = path => readFile(resolve(root, path))
const read = async path => JSON.parse(await bytes(path))
const inventory = await read('data/research/catalog-200-inventory.json')
const selected = inventory.candidates.filter(c => c.classification === 'A')
const registryPath = 'data/research/catalog-167-content-registry.json'
const manifestPath = 'data/research/catalog-167-review-manifest.json'
const registry = await read(registryPath), manifest = await read(manifestPath)
const source = await read('data/species.source.json')
const baseline = await read('docs/evidence/catalog-167-baseline.json')
const adapter = createLocalAdapter(root)
assert.equal(selected.length, 17)
assert.equal(source.catalog.length, 150)
assert.deepEqual(registry.candidates.map(c => c.id), selected.map(c => c.id))
const heldId = 'kosopoljanskia-hebecarpa'
assert.deepEqual(manifest.candidateIds, selected.filter(c => c.id !== heldId).map(c => c.id))
assert.equal(manifest.registry, registryPath)
assert.equal(manifest.registryFingerprint, fingerprint(registry))
assert.equal(manifest.preparedCandidateCount, 16)
assert.equal(manifest.draftedCandidateCount, 17)
assert.equal(manifest.baselineCatalogCount, 150)
assert.equal(manifest.potentialCatalogCountAfterSeparateAuthorizedImport, 166)
assert.equal(manifest.publicationAllowed, false)
assert.equal(manifest.ownerAuthorization, null)
assert.equal(manifest.scientificApproval, null)
assert.deepEqual(manifest.withheldCandidates.map(c => c.id), [heldId])
assert.equal(canApplyOnBranch('feature/catalog-200'), true)
assert.equal(canApplyOnBranch('main'), false)
assert.equal(canApplyOnBranch('feature/catalog-201'), false)

for (const f of baseline.files) assert.equal(digest(await bytes(f.path)), f.sha256, `Old file changed: ${f.path}`)
const oldIds = new Set([...source.catalog, ...source.demoArchive].map(s => s.id))
const oldNames = new Set([...source.catalog, ...source.demoArchive].map(s => s.scientificName?.toLowerCase()).filter(Boolean))
const oldTaxa = new Set(source.catalog.flatMap(s => s.sources.map(s => s.taxonId).filter(Boolean)))
const newTaxa = new Set(), groups = {}, placeholders = []
let imageCount = 0
for (const [index, c] of registry.candidates.entries()) {
  const a = selected[index], entry = [...manifest.candidates, ...manifest.withheldCandidates].find(e => e.id === c.id)
  assert.equal(c.id, entry.id)
  assert.equal(c.originalScientificName, a.historicalScientificName)
  assert.equal(c.acceptedScientificName, a.acceptedScientificName)
  assert.equal(c.rank, a.acceptedRank)
  assert.equal(c.rank, 'SPECIES')
  assert.equal(c.taxonomyEvidence.taxonId, a.gbifTaxonId)
  assert.equal(oldIds.has(c.id), false)
  assert.equal(oldTaxa.has(c.taxonomyEvidence.taxonId), false)
  assert.equal(newTaxa.has(c.taxonomyEvidence.taxonId), false)
  newTaxa.add(c.taxonomyEvidence.taxonId)
  for (const name of a.confirmedHistoricalAliases) assert.equal(oldNames.has(name.toLowerCase()), false)
  assert.equal(c.state, c.id === heldId ? 'needs_evidence' : 'ready_for_review')
  assert.equal(c.approval, null)
  assert.equal(c.verified, false)
  assert.equal(c.scientificReviewStatus, 'pending')
  assert.equal(c.countryOccurrence.currentPresenceConfirmed, null)
  assert.deepEqual(c.nationalConfirmation.pdfPages, a.bookPages)
  if (c.id === heldId) {
    assert.equal(c.contradictions.length, 1)
    assert.match(c.contradictions[0], /KY с.160 VU, RU\/EN с.161 EN/)
    assert.equal(c.preparation.status, 'needs_evidence')
  } else assert.deepEqual(c.contradictions, [])
  const loaded = await adapter.load(c), d = loaded.draft
  assert.equal(candidateFingerprint(c, loaded), c.checkedFingerprint, c.id)
  assert.equal(entry.checkedFingerprint, c.checkedFingerprint)
  assert.equal(entry.draftFile, c.draftFile)
  assert.equal(entry.draftSha256, loaded.draftSha256)
  assert.equal(c.preparation.draftSha256, loaded.draftSha256)
  if (c.id !== heldId) assert.equal(entry.independentReview, 'pending')
  assert.deepEqual(validateSpecies([d]), [])
  assert.deepEqual(await inspectPipelineAssets(root, d), [])
  assert.deepEqual(d.sources, c.sources)
  assert.equal(d.verified, false)
  assert.equal(d.lastReviewedAt, null)
  assert.equal(d.publication, undefined)
  assert.equal(d.population.type, 'unknown')
  assert.equal(d.population.value, null)
  assert.equal(d.population.reviewStatus, 'pending')
  assert.equal(d.nationalRedBook.year, 2006)
  assert.match(d.nationalRedBook.edition, /историческ/)
  for (const language of ['ky', 'uz', 'ru', 'en']) {
    assert.ok(d.names[language]?.trim())
    assert.ok(d.content.shortDescription.text[language]?.trim())
    assert.ok(!d.content.shortDescription.text[language].includes('\uFFFD'))
  }
  assert.equal(d.names.uz, c.acceptedScientificName)
  assert.ok(d.content.overview.text.ru.length >= 1000)
  assert.equal(d.sources.find(s => s.id === 'national-book').url, a.sourceReferences[0].url)
  assert.ok(d.sources.some(s => s.id === 'national-decree'))
  if (c.id === 'numenius-tenuirostris') {
    assert.equal(d.iucn.category, 'EX'); assert.equal(d.iucn.year, 2025)
    assert.match(d.content.shortDescription.text.ru, /вымирание/)
  }
  imageCount += d.images.length
  if (!d.images.length) placeholders.push(c.id)
  groups[c.group] = (groups[c.group] || 0) + 1
}
assert.equal(imageCount, 13)
assert.equal(placeholders.length, 4)
assert.deepEqual(groups, { plants: 10, birds: 5, mammals: 2 })
for (const n of [1, 2, 3]) {
  const check = await read(`docs/evidence/catalog-167-block-${n}-check.json`)
  for (const r of check.results) {
    // Only the explicitly documented final source hold changes a block fingerprint.
    const c = registry.candidates.find(c => c.id === r.candidateId)
    if (c.id === heldId) {
      assert.equal(c.materials.at(-1).path, 'docs/evidence/catalog-167-final-source-decisions.json')
      assert.equal(c.state, 'needs_evidence')
    } else if (c.id === 'dendrocopos-major') {
      assert.deepEqual(c.preparation.editorialCorrections, [{
        field: 'content.shortDescription.text.ru', from: 'Кыргызcтанские', to: 'Кыргызстанские',
        reason: 'Replace a Latin c confusable with Cyrillic с; no scientific claim changed.'
      }])
      assert.match((await read(c.draftFile)).content.shortDescription.text.ru, /Кыргызстанские/)
    } else assert.equal(c.checkedFingerprint, r.fingerprint)
  }
}
const preview = await read('docs/evidence/catalog-167-import-dry-run.json')
assert.deepEqual(preview.counts, { processed: 16, added: 16, unchanged: 0, rejected: 0 })
assert.equal(preview.applied, false)
assert.equal(preview.beforeCount, 150); assert.equal(preview.afterCount, 166)
assert.ok(!preview.results.some(r => r.candidateId === heldId))
assert.equal(preview.sourceSha256, digest(await bytes('data/species.source.json')))

// Prepared image originals must not leak through the existing public export.
const files = async dir => (await Promise.all((await readdir(dir, { withFileTypes: true })).map(e => e.isDirectory() ? files(join(dir, e.name)) : join(dir, e.name)))).flat()
for (const dir of ['public', 'dist']) {
  const paths = await files(resolve(root, dir))
  for (const c of selected) assert.ok(!paths.some(p => {
    const name = p.split(/[\\/]/).at(-1)
    return name.startsWith(`${c.id}-`) || name === `${c.id}.webp`
  }), `Unpublished image leaked: ${c.id}`)
  const published = await read(`${dir}/data/species.json`)
  assert.equal(Array.isArray(published) ? published.length : published.catalog.length, 150)
}
const distFiles = await files(resolve(root, 'dist'))
const distBytes = (await Promise.all(distFiles.map(p => stat(p)))).reduce((n, s) => n + s.size, 0)
console.log(JSON.stringify({ selectedFromInventoryA: 17, drafted: 17, technicallyReady: 16,
  needsEvidence: [heldId], approved: 0, imported: 0,
  groups, imageCount, placeholderCount: placeholders.length, readyImageCount: 13,
  readyPlaceholderCount: 3, heldPlaceholderCount: 1, placeholders,
  protectedFilesUnchanged: baseline.files.length, catalogCount: 150, individualFingerprintsValid: true,
  manifestSha256: digest(await bytes(manifestPath)), registryFingerprint: fingerprint(registry),
  dryRun: preview.counts, distBytes }, null, 2))
