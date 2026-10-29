// Read-only integrity check for task 25.1; this script cannot authorize imports.
import fs from 'node:fs'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { digest } from './lib/research-pipeline.mjs'

const read = p => JSON.parse(fs.readFileSync(p))
const d = read('data/research/catalog-200-inventory.json')
const source = read('data/species.source.json'), published = read('public/data/species.json')
const original = path => execFileSync('git', ['show', `${d.sourceCommit}:${path}`], { maxBuffer: 16 * 1024 * 1024 })
assert.equal(d.sourceCommit, '5c26da5a3b235d93143a62dee2f70b906a09e070')
assert.deepEqual(source, JSON.parse(original('data/species.source.json')))
assert.deepEqual(published, JSON.parse(original('public/data/species.json')))
assert.equal(source.catalog.length, 150)
assert.equal(source.demoArchive.length, 2)
assert.equal(d.scope.publicationAllowed, false)
assert.equal(d.scope.importPerformed, false)
assert.equal(d.scope.scientificApproval, null)
assert.equal(d.scope.currentLegalStatus2026, null)
const national = read('data/research/redbook-master-national-lists.json')
const expectedIds = national.lists.flatMap(l => l.records.map(r => r.recordId)).sort()
assert.equal(d.sourcePositions.length, 421)
assert.deepEqual(d.sourcePositions.map(p => p.recordId).sort(), expectedIds)
assert.equal(new Set(d.sourcePositions.map(p => p.recordId)).size, 421)
for (const list of national.lists) for (const r of list.records) {
  const p = d.sourcePositions.find(p => p.recordId === r.recordId)
  for (const [key, value] of Object.entries(r)) assert.deepEqual(p[key], value, `${r.recordId}.${key}`)
}
const book = d.sourcePositions.filter(p => p.kind === 'book_account')
const decree = d.sourcePositions.filter(p => p.kind === 'numbered_decree_position')
assert.equal(book.length, 202); assert.equal(decree.length, 219)
assert.equal(book.filter(p => p.catalogIds.length).length, 151)
assert.equal(book.filter(p => !p.catalogIds.length).length, 51)
assert.equal(decree.filter(p => p.status === 'historically_excluded').length, 17)
for (const p of decree.filter(p => p.status === 'historically_excluded')) {
  assert.equal(p.scientificName, null); assert.equal(p.classification, 'C'); assert.deepEqual(p.catalogIds, [])
}
assert.equal(d.publishedCrosswalk.length, 150)
const corrected = decree.find(p => p.recordId === 'decree-170-2009-3-6')
assert.equal(corrected.scientificName, 'Chettusia grigna') // legacy transcription preserved
assert.equal(corrected.transcriptionReview.verifiedVerbatimScientificName, 'Chettusia gregaria')
assert.equal(corrected.transcriptionReview.oldSourceFileChanged, false)
assert.ok(source.catalog.find(s=>s.id==='vanellus-gregarius').sources.some(s=>s.taxonId==='gbif:5229138'))
assert.deepEqual(d.publishedCrosswalk.map(p => p.catalogId), source.catalog.map(s => s.id))
assert.equal(d.catalogIdentityCheck.publishedScientificNamesDistinct, 150)
assert.equal(d.catalogIdentityCheck.publishedIdsDistinct, 150)
assert.deepEqual(d.catalogIdentityCheck.gbifKeyCollisions, [])
assert.deepEqual(d.catalogIdentityCheck.publishedParentChildNameOverlaps, [])
assert.deepEqual(d.catalogIdentityCheck.catalogIdsWithoutStoredGBIFKey, source.catalog.filter(s=>!s.sources.some(r=>r.taxonId?.startsWith('gbif:'))).map(s=>s.id))
assert.equal(d.candidates.length, 52)
assert.deepEqual(Object.fromEntries(['A','B','C'].map(k => [k,d.candidates.filter(c=>c.classification===k).length])), { A:17, B:34, C:1 })
assert.equal(new Set(d.candidates.map(c => c.id)).size, 52)
for (const c of d.candidates) {
  assert.ok(c.reason.trim()); assert.equal(c.publicationAllowed, false); assert.equal(c.verified, false)
  assert.equal(c.scientificReviewStatus, 'pending'); assert.equal(c.newPublicationDraftCreated, false); assert.equal(c.newPhotoResearchStarted, false)
  assert.ok(book.some(p => p.recordId === c.nationalRecordId))
  assert.ok(c.decreePositions.every(id => decree.some(p => p.recordId === id)))
  assert.ok(c.sourceReferences.every(s => s.url.startsWith('https://')))
  if (c.classification === 'B') assert.equal(c.acceptedScientificName, null)
  assert.deepEqual(c.duplicateAssessment.matchedArchiveIds, [])
  assert.deepEqual(c.duplicateAssessment.matchedCatalogIds, c.classification === 'C' ? ['tulipa-korolkowii'] : [])
  if (c.classification === 'A') {
    assert.ok(c.acceptedScientificName && c.gbifTaxonId && c.acceptedRank === 'SPECIES')
    assert.ok(![...source.catalog,...source.demoArchive].some(s => s.id === c.id || s.scientificName === c.acceptedScientificName || s.sources.some(r => r.taxonId === c.gbifTaxonId)), c.id)
  }
  for (const t of c.taxonomyEvidence) {
    const raw = read(t.evidenceFile).records[t.recordIndex]
    assert.equal(raw.nationalRecordId, c.nationalRecordId)
    assert.equal(raw.requestedName, t.requestedName)
  }
}
const dup = d.candidates.find(c => c.classification === 'C')
assert.equal(dup.historicalScientificName, 'Tulipa rosea')
assert.deepEqual(dup.duplicateOfCatalogIds, ['tulipa-korolkowii'])
assert.ok(d.archiveComparison.every(r => r.matchedSourcePositions.length === 0 && r.candidateConflicts.length === 0))
for (const f of d.sourceFiles) assert.equal(digest(fs.readFileSync(f.path)), f.sha256, f.path)
for (const p of book) {
  assert.equal(p.sourceCorrespondence.decreeRecordIds.length, 1)
  assert.equal(p.sourceCorrespondence.modernIdentityAsserted, false)
}
assert.equal(d.expansion.confirmedCatalogSizeIfPreparedAndSeparatelyAuthorized, 150 + 17)
assert.equal(d.expansion.historicalAccountCeilingAfterKnownSynonym, 202 - 1)
assert.equal(d.expansion.conditionalCeilingUnderCurrentGBIFNoParentChildDuplication, 202 - 1 - 1)
assert.equal(d.expansion.exactAchievableMaximum, null)
assert.deepEqual(d.remainderParentChildConflicts.map(r=>r.candidateIds), [['falco-peregrinus','falco-pelegrinoides']])
const b = d.batchPlan.nextConditionalBatch
assert.equal(b.confirmedIds.length,17); assert.equal(b.reserveBIds.length,8)
assert.ok(b.confirmedIds.every(id=>d.candidates.some(c=>c.id===id&&c.classification==='A')))
assert.ok(b.reserveBIds.every(id=>d.candidates.some(c=>c.id===id&&c.classification==='B')))
assert.equal(d.batchPlan.subsequentConditionalBatches[0].candidateIds.length,25)
const planIds=[...b.confirmedIds,...b.reserveBIds,...d.batchPlan.subsequentConditionalBatches[0].candidateIds]
assert.equal(new Set(planIds).size,50)
assert.ok(!planIds.includes('falco-pelegrinoides'))
console.log(JSON.stringify({historicalPositions:421,publishedTaxa:150,classes:{A:17,B:34,C:1},excludedSlots:17,oldCatalogAndPublicUnchanged:true,coverageAndReferencesValid:true}))
