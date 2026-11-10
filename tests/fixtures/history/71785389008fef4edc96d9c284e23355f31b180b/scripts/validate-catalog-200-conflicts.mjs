// Read-only audit of task 25.4 research decisions. Never approves or imports data.
import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const bytes = path => readFile(resolve(root, path))
const read = async path => JSON.parse(await bytes(path))
const digest = b => createHash('sha256').update(b).digest('hex')
const git = (...args) => execFileSync('git', args, { cwd: root, maxBuffer: 16 * 1024 * 1024 }).toString('utf8').trim()
const resultPath = 'data/research/catalog-200-conflict-resolution.json'
const result = await read(resultPath)
const inventory = await read(result.sourceInventory.path)
const baseline = await read(result.preservation.baselineFile)
const source = await read('data/species.source.json')
const evidence = await read('docs/evidence/catalog-200-conflict-sources.json')
const taxonomy = await read(evidence.taxonomyEvidenceFile)
const prior = JSON.parse(git('show', `${result.sourceCommit}:data/species.source.json`))

assert.equal(git('branch', '--show-current'), 'feature/catalog-200')
assert.equal(result.sourceCommit, 'e5b7427bc3f25074711255945398d8fbaef1483e')
git('merge-base', '--is-ancestor', result.sourceCommit, 'HEAD')
assert.equal(source.catalog.length, 166)
assert.equal(source.demoArchive.length, 2)
assert.deepEqual(source, prior, 'The original 166 objects or archive changed')
assert.equal(digest(await bytes('data/species.source.json')), baseline.catalogSourceSha256)
assert.equal(digest(await bytes(result.sourceInventory.path)), result.sourceInventory.sha256)
assert.equal(baseline.sourceCommit, result.sourceCommit)
assert.deepEqual(baseline.files.map(f => f.path).sort(), git('ls-tree', '-r', '--name-only', result.sourceCommit).split(/\r?\n/).sort())
for (const f of baseline.files) assert.equal(digest(await bytes(f.path)), f.sha256, `Previous tracked file changed: ${f.path}`)
const previousPaths = new Set(baseline.files.map(f => f.path))
assert.deepEqual(git('diff', '--name-only', result.sourceCommit).split(/\r?\n/).filter(p => previousPaths.has(p)), [], 'A previously tracked file has a Git diff')
for (const f of result.evidenceFiles) assert.equal(digest(await bytes(f.path)), f.sha256, `Evidence checksum: ${f.path}`)

const originalB = inventory.candidates.filter(c => c.classification === 'B')
const expectedIds = [...originalB.map(c => c.id), 'kosopoljanskia-hebecarpa']
assert.equal(originalB.length, 34)
assert.deepEqual(result.sourceInventory.originalBIds, originalB.map(c => c.id))
assert.deepEqual(result.decisions.map(c => c.id), expectedIds)
assert.equal(new Set(expectedIds).size, 35)
assert.equal(new Set(evidence.sources.map(s => s.id)).size, evidence.sources.length)
const sources = new Map(evidence.sources.map(s => [s.id, s]))
const counts = Object.fromEntries(['READY', 'NEEDS_EVIDENCE', 'DUPLICATE', 'EXCLUDED'].map(s => [s, 0]))
const normalize = s => s.toLowerCase().replace(/\b(subsp\.|ssp\.|var\.)\s*/g, '').replace(/\s+/g, ' ').trim()
const readyNames = new Set(), readyKeys = new Set()
const publishedIds = new Set(source.catalog.map(c => c.id))
const archiveIds = new Set(source.demoArchive.map(c => c.id))
assert.equal(result.publishedIdentityComparison.identities.length, 166)
assert.deepEqual(result.publishedIdentityComparison.identities.map(i => i.id), source.catalog.map(c => c.id))

for (const d of result.decisions) {
  const old = inventory.candidates[d.sourceInventory.candidateIndex]
  assert.equal(d.id, old.id)
  assert.equal(d.sourceInventory.originalClassification, old.classification)
  assert.equal(d.sourceInventory.sha256, result.sourceInventory.sha256)
  assert.equal(d.historicalScientificName, old.historicalScientificName)
  assert.equal(d.historicalRank, old.historicalRank)
  assert.deepEqual(d.confirmedHistoricalAliases, old.confirmedHistoricalAliases)
  assert.equal(d.previousDecision.reason, old.reason)
  assert.deepEqual(d.previousDecision.taxonomyEvidence, old.taxonomyEvidence)
  assert.deepEqual(d.nationalSources.bookPages, old.bookPages)
  assert.deepEqual(d.nationalSources.decreePositions, old.decreePositions)
  assert.deepEqual(d.nationalSources.references, old.sourceReferences)
  assert.ok(d.reason.length > 60)
  assert.ok(d.conflictTypes.length > 0)
  assert.equal(d.confidence.historicalInclusion, 'high')
  assert.ok(Object.hasOwn(counts, d.status))
  counts[d.status]++
  assert.equal(d.verified, false)
  assert.equal(d.scientificReviewStatus, 'pending')
  assert.equal(d.scientificApproval, null)
  assert.equal(d.publicationAllowed, false)
  assert.equal(d.ownerPublicationAuthorization, null)
  assert.equal(d.newDraftCreated, false)
  assert.equal(d.newPhotoResearchStarted, false)
  assert.equal(d.currentLegalStatus2026, null)
  assert.equal(d.currentPresenceConfirmedByThisReview, null)
  if (d.gbifTaxonIdForSelectedConcept !== null) assert.ok(Number.isSafeInteger(d.gbifTaxonIdForSelectedConcept) && d.gbifTaxonIdForSelectedConcept > 0, `${d.id}: selected GBIF key must be a numeric key`)
  assert.equal(d.preparationAllowedByThisDecision, d.status === 'READY')
  assert.equal(d.duplicateAssessment.comparedCatalogCount, 166)
  assert.equal(d.duplicateAssessment.comparedArchiveCount, 2)
  assert.equal(publishedIds.has(d.id), false)
  assert.equal(archiveIds.has(d.id), false)
  assert.deepEqual(d.duplicateAssessment.archiveMatches, [])
  for (const ref of d.evidenceSourceIds) {
    assert.ok(sources.has(ref), `${d.id}: missing source ${ref}`)
    const s = sources.get(ref)
    assert.ok(s.url.startsWith('https://'))
    assert.ok(s.accessMethod && s.locator && s.finding)
  }
  // A national source is evidence too; Cuon has a precise documented evidence gap.
  assert.ok(d.nationalSources.references.length > 0)
  assert.ok(d.evidenceSourceIds.length > 0 || (d.id === 'cuon-alpinus' && d.remainingBlockers.length > 0))
  for (const ref of d.newTaxonomyEvidenceReferences) assert.equal(taxonomy.records[ref.recordIndex].requestedName, ref.requestedName)
  if (d.status === 'NEEDS_EVIDENCE') assert.ok(d.remainingBlockers.length > 0)
  if (d.status === 'READY') {
    assert.deepEqual(d.remainingBlockers, [])
    assert.ok(d.acceptedScientificName && ['SPECIES', 'SUBSPECIES'].includes(d.acceptedRank))
    assert.deepEqual(d.duplicateAssessment.exactPublishedNameMatches, [])
    assert.deepEqual(d.duplicateAssessment.publishedKeyMatches, [])
    assert.deepEqual(d.duplicateAssessment.confirmedDuplicateOfCatalogIds, [])
    const name = normalize(d.acceptedScientificName)
    assert.equal(readyNames.has(name), false)
    readyNames.add(name)
    if (d.gbifTaxonIdForSelectedConcept) {
      assert.equal(readyKeys.has(d.gbifTaxonIdForSelectedConcept), false)
      readyKeys.add(d.gbifTaxonIdForSelectedConcept)
    }
  }
}
for (const [status, count] of Object.entries(counts)) assert.equal(result.counts[status], count)
assert.equal(Object.values(counts).reduce((a, b) => a + b, 0), 35)
const ready = result.decisions.filter(d => d.status === 'READY')
assert.deepEqual(result.nextBatch.candidateIds, ready.map(d => d.id))
assert.deepEqual(result.nextBatch.suggestedPreparationGroups.flat(), ready.map(d => d.id))
assert.equal(new Set(result.nextBatch.candidateIds).size, ready.length)
for (const a of ready) for (const b of ready) {
  if (a.id !== b.id) assert.equal(normalize(b.acceptedScientificName).startsWith(normalize(a.acceptedScientificName) + ' '), false, 'Ready species/subspecies overlap')
}
assert.equal(result.pairwiseCandidateReview.pairCount, 35 * 34 / 2)
let pairCount = 0
const flaggedPairs = []
const options = d => {
  const candidates = [
    { name: d.historicalScientificName, rank: d.historicalRank },
    ...d.confirmedHistoricalAliases.map(name => ({ name, rank: null })),
    { name: d.acceptedScientificName, rank: d.acceptedRank },
    ...d.specialistAcceptedNameAlternatives,
  ].filter(x => x.name)
  return {
    names: new Set(candidates.map(x => normalize(x.name))),
    species: new Set(candidates.filter(x => x.rank === 'SPECIES').map(x => normalize(x.name))),
    parents: new Set(candidates.filter(x => x.rank === 'SUBSPECIES').map(x => normalize(x.name).split(' ').slice(0, 2).join(' '))),
    keys: new Set(d.duplicateAssessment.comparedGbifTaxonIds),
  }
}
for (let a = 0; a < result.decisions.length; a++) for (let b = a + 1; b < result.decisions.length; b++) {
  pairCount++
  const left = result.decisions[a], right = result.decisions[b]
  const x = options(left), y = options(right)
  const names = [...x.names].filter(n => y.names.has(n))
  const keys = [...x.keys].filter(k => y.keys.has(k))
  const parents = [...x.species].filter(n => y.parents.has(n)).concat([...y.species].filter(n => x.parents.has(n)))
  if (names.length || keys.length || parents.length) {
    flaggedPairs.push({ ids: [left.id, right.id], sameNames: names, sameKeys: keys, parentSpeciesNames: parents, proposedIdentitiesAreNotMerges: true })
    assert.equal(left.status === 'READY' && right.status === 'READY', false, 'Two admitted candidates have overlapping proposed identities')
  }
}
assert.equal(pairCount, result.pairwiseCandidateReview.pairCount)
assert.deepEqual(flaggedPairs, result.pairwiseCandidateReview.flaggedPairs)
for (const pair of result.pairwiseCandidateReview.semanticConflicts) for (const id of pair.ids) assert.equal(result.decisions.find(d => d.id === id).status, 'NEEDS_EVIDENCE')

const duplicate = result.decisions.find(d => d.id === 'malus-niedzwetzkyana')
assert.equal(duplicate.status, 'DUPLICATE')
assert.deepEqual(duplicate.duplicateAssessment.confirmedDuplicateOfCatalogIds, ['sievers-apple'])
assert.equal(taxonomy.records.find(r => r.requestedName === 'Malus sieversii (Ledeb.) M.Roem.').accepted.data.key, duplicate.gbifTaxonIdForSelectedConcept)
const held = result.decisions.find(d => d.id === 'kosopoljanskia-hebecarpa')
assert.equal(held.sourceInventory.originalClassification, 'A')
assert.equal(held.status, 'NEEDS_EVIDENCE')
assert.equal(held.previousHoldDecision.state, 'needs_evidence')
assert.equal(result.categoryConflict.authoritativeCorrectionFound, false)
assert.equal(result.categoryConflict.book2006.kyCategory, 'VU')
assert.equal(result.categoryConflict.book2006.ruCategory, 'EN')
assert.equal(result.categoryConflict.book2006.tablePage, 21)
const manifest = await read('data/research/catalog-167-review-manifest.json')
assert.equal(manifest.candidateIds.includes(held.id), false)
assert.equal(result.expansion.catalogSizeAfterPreparationAndSeparateAuthorization, 166 + ready.length)
assert.equal(result.expansion.historicalAccountUpperBoundAfterKnownDuplicates, inventory.expansion.historicalAccountCeilingAfterKnownSynonym - counts.DUPLICATE)
assert.equal(result.expansion.exactAchievableMaximum, null)
const report = await readFile(resolve(root, 'docs/research/catalog-200-conflict-resolution.md'), 'utf8')
for (const id of expectedIds) assert.ok(report.includes(id), `Report omits ${id}`)
assert.ok((await stat(resolve(root, resultPath))).size > 0)
console.log(JSON.stringify({ ok: true, decisions:35, ...counts, catalogCount:166, archiveCount:2, previousTrackedFilesByteIdentical:baseline.files.length, priorRegistryAndManifestPreserved:true, sourceSha256:digest(await bytes('data/species.source.json')), resultSha256:digest(await bytes(resultPath)) }, null, 2))
