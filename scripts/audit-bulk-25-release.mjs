// Audit only: existing validators/planner perform all checks. No approve/apply/import.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { isDeepStrictEqual } from 'node:util'
import { resolve, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'
import { PROJECT_ROOT } from './build-data.mjs'
import { checkRegistry, createQueueConflicts, digest, fingerprint } from './lib/research-pipeline.mjs'
import { createLocalAdapter, inspectPipelineAssets } from './lib/local-research-adapter.mjs'
import { planBatchImport, taxonNameKey } from './lib/bulk-import.mjs'
import { checkCommonsMetadata } from './prepare-batch-images.mjs'
import { validateSpecies } from '../src/data/species-model.js'
import { scientificContent } from '../src/data/localization.js'
import { speciesNameLanguage } from '../src/data/presentation.js'

const langs = ['ky', 'uz', 'ru', 'en']
const priorHead = '1a213f4cb8f38a70e20129b1011b7fb1d698dd26'
const read = async (root, p) => JSON.parse((await readFile(resolve(root, p), 'utf8')).replace(/^\uFEFF/, ''))
const fileTitle = uri => decodeURIComponent(new URL(uri).pathname.split('/wiki/')[1]).replaceAll('_', ' ')

export async function auditBulk25(root = PROJECT_ROOT, { historical = false } = {}) {
  const baselinePath = p => historical ? ({ 'data/species.source.json': 'data/backups/bulk-25-provisional/species.source.json',
    'public/data/species.json': 'data/backups/bulk-25-provisional/public-species.json',
    'src/data/species-model.js': 'data/backups/bulk-25-provisional/species-model.js' }[p] || p) : p
  const [registry, manifest, master, source, national, taxonomy, legacy, selection, preserved] = await Promise.all([
    'data/research/bulk-25-content-registry.json', 'data/research/bulk-25-content-manifest.json',
    'data/research/redbook-master-registry.json', 'data/species.source.json',
    'data/research/redbook-master-national-lists.json', 'docs/evidence/redbook-master-taxonomy.json',
    'data/research/catalog-candidates.json', 'data/research/bulk-expansion-selection.json',
    'docs/evidence/bulk-25-preservation.json'
  ].map(p => read(root, baselinePath(p))))
  const sourceBefore = fingerprint(source), registryBytesBefore = await readFile(resolve(root, 'data/research/bulk-25-content-registry.json'))
  assert.equal(source.catalog.length, 40)
  assert.equal(source.demoArchive.length, 2)
  assert.equal(fingerprint(master), manifest.masterRegistryFingerprint)
  assert.deepEqual(registry.candidates.map(c => c.id), manifest.candidateIds)
  assert.equal(manifest.candidateIds.length, 25)
  for (const [p, sha] of Object.entries(preserved)) assert.equal(digest(await readFile(resolve(root, baselinePath(p)))), sha, p)
  const sourceRecords = new Map(national.lists.flatMap(l => l.records).map(r => [r.recordId, r]))
  const selectedIds = new Set(manifest.candidateIds)
  const remaining = master.candidates.filter(c => !selectedIds.has(c.id))
  const queue = createQueueConflicts({ candidates: [...registry.candidates, ...remaining] })
  const crossRegistryConflicts = registry.candidates.flatMap(c => (queue.get(c.id) || []).map(error => ({ candidateId: c.id, error })))
  assert.deepEqual(crossRegistryConflicts, [])
  const adapter = createLocalAdapter(root)
  const checked = await checkRegistry(registry, source, { adapter, validateAssets: s => inspectPipelineAssets(root, s) })
  const repeated = await checkRegistry(checked.registry, source, { adapter: createLocalAdapter(root), validateAssets: s => inspectPipelineAssets(root, s) })
  assert.deepEqual(checked.batches, repeated.batches)
  assert.deepEqual(checked.report.results, repeated.report.results)
  const accounts = new Map(), receipts = new Map(), recipes = new Map(), cachePages = new Map()
  for (let n = 1; n <= 5; n++) {
    const [a, r, p] = await Promise.all([`docs/evidence/bulk-25-block-${n}-accounts.json`,
      `docs/evidence/bulk-25-block-${n}-images.json`, `data/research/bulk-25-content/block-${n}-photos.json`].map(p => read(root, p)))
    a.records.forEach(r => accounts.set(r.candidateId, r))
    r.receipts.forEach(r => receipts.set(r.candidateId, r))
    p.candidates.forEach(c => recipes.set(c.id, c))
  }
  for (const r of (await read(root, 'docs/evidence/bulk-25-photo-search.json')).records) {
    for (const q of r.queries) for (const page of Object.values(q.data?.query?.pages || {})) {
      if (page.imageinfo?.[0]?.descriptionurl) cachePages.set(fileTitle(page.imageinfo[0].descriptionurl), page)
    }
  }
  const results = [], technicalRecords = []
  for (const c of registry.candidates) {
    const loaded = await adapter.load(c), s = loaded.draft, raw = accounts.get(c.id)
    const book = sourceRecords.get(c.nationalSourceRecords.find(id => id.startsWith('book-')))
    const decree = sourceRecords.get(c.nationalSourceRecords.find(id => id.startsWith('decree-')))
    assert.equal(taxonNameKey(book.scientificName), taxonNameKey(c.originalScientificName))
    let decreeRelationship = 'same_name'
    if (taxonNameKey(decree.scientificName) !== taxonNameKey(c.originalScientificName)) {
      assert.ok(book.sameAccountAlternativeNames.includes(decree.scientificName))
      if (book.rank === 'SUBSPECIES' && decree.rank === 'SPECIES') {
        assert.equal(decree.scientificName, c.originalScientificName.split(' ').slice(0, 2).join(' '))
        decreeRelationship = 'parent_species_only'
        const decreeSource = s.sources.find(s => s.id === 'national-list-1')
        assert.ok(!decreeSource.supports.includes('nationalRedBook.listed'))
      } else decreeRelationship = 'same_account_alternative'
    }
    assert.equal(decree.recordState, 'listed_in_2009_copy')
    assert.deepEqual(raw.pages.map(p => p.page), c.nationalConfirmation.pdfPages)
    assert.ok(raw.pages.every(p => p.text?.trim()))
    assert.equal(c.nationalRedBook.basis, 'historical_edition')
    assert.equal(c.nationalRedBook.claimsCurrentLegalStatus, false)
    assert.equal(c.countryOccurrence.currentPresenceConfirmed, null)
    const t = taxonomy.records.find(t => t.nationalRecordId === c.taxonomyResearch.evidenceRecordId)
    const accepted = t.accepted?.data || t.match.data
    assert.equal(accepted.canonicalName, c.acceptedScientificName)
    assert.equal(accepted.rank, c.rank)
    assert.equal(c.taxonomyEvidence.taxonId, `gbif:${accepted.key || accepted.usageKey}`)
    for (const key of ['kingdom', 'phylum', 'class', 'order', 'family', 'genus']) assert.equal(s.taxonomy[key], accepted[key] || null)
    assert.deepEqual(validateSpecies([s]), [])
    assert.deepEqual(await inspectPipelineAssets(root, s), [])
    assert.equal(s.verified, false)
    assert.equal(s.lastReviewedAt, null)
    assert.equal(s.population.type, 'unknown')
    assert.equal(s.population.reviewStatus, 'pending')
    assert.deepEqual(s.population.sourceIds, [])
    assert.equal(s.iucn.category, null)
    assert.equal(s.regions.length, 1)
    assert.equal(s.regions[0].code, 'KG')
    assert.equal(s.regions[0].type, 'country')
    assert.equal(c.approval, null)
    const words = s.content.overview.text.ru.trim().split(/\s+/u).length
    assert.ok(words >= 120 && words <= 250)
    assert.ok(s.content.shortDescription.text.ru.length >= 120 && s.content.shortDescription.text.ru.length <= 180)
    for (const language of langs) assert.equal(scientificContent(s.content.shortDescription.text, language).fallback, false)
    assert.ok(!/[А-Яа-яЁё]/u.test(s.content.shortDescription.text.uz))
    const result = checked.report.results.find(r => r.candidateId === c.id)
    const scientificBlockers = [...c.contradictions, ...c.missingData]
    const errors = result.errors.filter(e => e !== 'Есть нерешённые противоречия или обязательные пробелы')
    const disposition = scientificBlockers.length ? 'blocked' : errors.length ? 'needs_correction' : 'technically_ready'
    assert.equal(result.state, scientificBlockers.length ? 'needs_evidence' : 'ready_for_review')
    const receipt = receipts.get(c.id)
    let photo = { status: 'placeholder', reason: receipt.reason }
    if (s.images.length) {
      assert.equal(receipt.status, 'prepared')
      assert.deepEqual(s.images[0], receipt.image)
      const page = cachePages.get(fileTitle(s.images[0].originalPage))
      const verified = checkCommonsMetadata(recipes.get(c.id), page)
      for (const key of ['author', 'license', 'licenseUrl', 'originalPage']) assert.equal(s.images[0][key], verified[key])
      assert.equal(receipt.metadata.revisionId, verified.revisionId)
      assert.equal(receipt.visualReview.reviewed, true)
      const photoSource = s.sources.find(s => s.id === 'photo-commons')
      if (Object.hasOwn(receipt.metadata, 'sourceLanguage')) assert.equal(photoSource.language, receipt.metadata.sourceLanguage)
      photo = { status: 'licensed_private_draft', originalPage: s.images[0].originalPage, path: s.images[0].path,
        license: s.images[0].license, licenseUrl: s.images[0].licenseUrl, author: s.images[0].author,
        revisionId: verified.revisionId, cachedRightsCheckPassed: true, includedInReviewPacket: disposition === 'technically_ready' }
    }
    const legacyAliases = legacy.candidates.filter(l => l.id !== c.id &&
      [c.originalScientificName, c.acceptedScientificName].some(n => taxonNameKey(n) === taxonNameKey(l.scientificName))).map(l => ({
        id: l.id, scientificName: l.scientificName, decision: selection.candidates.find(s => s.id === l.id)?.decision || 'not_selected',
        publicationApproved: l.readiness.publicationApproved, alreadyPublic: source.catalog.some(s => s.id === l.id),
        gaps: l.gapsAndContradictions }))
    assert.ok(legacyAliases.every(a => !a.publicationApproved && ['defer', 'exclude', 'not_selected'].includes(a.decision)))
    technicalRecords.push({ candidateId: c.id, species: s, taxonomyEvidence: c.taxonomyEvidence })
    results.push({ candidateId: c.id, scientificName: s.scientificName, nationalName: c.originalScientificName,
      disposition, pipelineState: result.state, structuralChecksPassed: true, independentScientificReviewRequired: true,
      eligibleForIndependentApprovalReview: disposition === 'technically_ready', approval: null, fingerprint: result.fingerprint,
      draftFile: c.draftFile, draftSha256: loaded.draftSha256,
      nationalEvidence: { bookRecord: book.recordId, pdfPages: raw.pages.map(p => p.page), url: book.sourceUrl, sourceYear: 2006,
        headingAsPrinted: book.verbatimHeadingLines, decreeRecord: decree.recordId, annex: decree.annex, row: decree.row,
        decreeUrl: decree.sourceUrl, decreeYear: 2009, decreeNameAsPrinted: decree.scientificName,
        decreeRelationship, currentLegalStatus: null },
      taxonomy: { ...c.taxonomyEvidence, requestedScientificName: t.match.data.scientificName,
        acceptedScientificNameAsReturned: accepted.scientificName, acceptedNameIsProposal: disposition === 'blocked' },
      sourceIds: s.sources.map(s => s.id), sourceUrls: s.sources.map(s => s.url),
      texts: { shortLanguages: langs, shortCharsRu: s.content.shortDescription.text.ru.length, overviewWordsRu: words,
        fullLanguages: ['ru'], fullFallbackLanguage: 'ru', nameLanguages: langs.filter(l => s.names[l]),
        nameLanguageForKy: speciesNameLanguage(s, 'ky'), translationsIndependentlyReviewed: false },
      photo, technicalErrors: errors, scientificBlockers, missingFacts: c.missingFacts, editorialNotes: c.editorialNotes,
      legacyAliases })
  }
  const packet = { schemaVersion: 1, documentType: 'species-import-batch', batchId: 'bulk-25-release-structural-dry-run', records: technicalRecords }
  const plan = await planBatchImport(source, packet, { validateAssets: s => inspectPipelineAssets(root, s) })
  assert.equal(plan.counts.added, 25)
  assert.equal(plan.counts.rejected, 0)
  assert.ok(isDeepStrictEqual(plan.proposedSource.catalog.slice(0, 40), source.catalog))
  assert.ok(isDeepStrictEqual(plan.proposedSource.demoArchive, source.demoArchive))
  const repeatedPlan = await planBatchImport(plan.proposedSource, packet, { validateAssets: s => inspectPipelineAssets(root, s) })
  assert.equal(repeatedPlan.counts.added, 0)
  assert.equal(repeatedPlan.counts.unchanged, 25)
  const copied = structuredClone(technicalRecords[0]); copied.candidateId = copied.species.id = 'audit-synthetic-duplicate'
  const duplicatePlan = await planBatchImport(plan.proposedSource, { ...packet, records: [copied] })
  assert.equal(duplicatePlan.counts.rejected, 1)
  assert.match(duplicatePlan.results[0].errors.join(' '), /Таксон уже представлен/)
  assert.equal(fingerprint(source), sourceBefore)
  assert.equal(digest(await readFile(resolve(root, 'data/research/bulk-25-content-registry.json'))), digest(registryBytesBefore))
  const counts = Object.fromEntries(['technically_ready', 'needs_correction', 'blocked'].map(s => [s, results.filter(r => r.disposition === s).length]))
  const ready = results.filter(r => r.disposition === 'technically_ready')
  const reviewManifest = { schemaVersion: 1, documentType: 'independent-scientific-review-manifest',
    auditedFromCommit: priorHead, registry: 'data/research/bulk-25-content-registry.json',
    registryFingerprint: fingerprint(registry), selectionManifest: 'data/research/bulk-25-content-manifest.json',
    candidateIds: ready.map(r => r.candidateId), candidates: ready.map(r => ({ id: r.candidateId, scientificName: r.scientificName,
      draftFile: r.draftFile, draftSha256: r.draftSha256, checkedFingerprint: r.fingerprint, independentReview: 'pending' })),
    withheldCandidates: results.filter(r => r.disposition !== 'technically_ready').map(r => ({ id: r.candidateId,
      disposition: r.disposition, requires: r.scientificBlockers, technicalErrors: r.technicalErrors })),
    approval: null, publicationAllowed: false, counts }
  const audit = { schemaVersion: 1, documentType: 'bulk-25-release-audit', auditedFromCommit: priorHead,
    auditedAt: '2026-10-14', independentlyApproved: false, counts,
    structuralChecksPassed: 25, approvalReviewEligible: ready.length, sourceCatalogCount: 40, archiveCount: 2,
    preservedFileCount: Object.keys(preserved).length, sourceCatalogFingerprint: sourceBefore,
    unchangedCatalogAndRegistryDuringDryRun: true, otherMasterCandidatesChecked: remaining.length,
    crossRegistryConflicts, legacyAliasCount: results.reduce((n, r) => n + r.legacyAliases.length, 0),
    images: { licensedPrivateDrafts: results.filter(r => r.photo.status === 'licensed_private_draft').length,
      includedInReviewPackets: ready.filter(r => r.photo.status === 'licensed_private_draft').length },
    pipeline: checked.report, dryRun: { writePerformed: false, structuralPlan: plan.counts,
      repeatedPlan: repeatedPlan.counts, duplicateCopyRejected: true, sourcePrefix40Unchanged: true,
      approvedPacketRecords: checked.batches.reduce((n, b) => n + b.approved.records.length, 0),
      repeatResearchCheckIdentical: true }, results }
  return { audit, reviewManifest }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = await auditBulk25(PROJECT_ROOT, { historical: process.argv.includes('--historical') })
  for (const [p, value] of [['docs/evidence/bulk-25-release-audit.json', result.audit],
    ['data/research/bulk-25-release-review-manifest.json', result.reviewManifest]]) {
    await mkdir(dirname(resolve(PROJECT_ROOT, p)), { recursive: true })
    await writeFile(resolve(PROJECT_ROOT, p), JSON.stringify(value, null, 2) + '\n')
  }
  console.log(JSON.stringify({ ...result.audit.counts, approvalReviewEligible: result.audit.approvalReviewEligible,
    structuralChecksPassed: result.audit.structuralChecksPassed, approved: 0, imported: 0 }))
}
