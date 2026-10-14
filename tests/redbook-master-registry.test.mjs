import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { prepareMasterCandidates } from '../scripts/prepare-redbook-master-registry.mjs'
import { createRegistry, checkRegistry, validateRegistry, fingerprint, digest, createQueueConflicts } from '../scripts/lib/research-pipeline.mjs'
import { createLocalAdapter, inspectPipelineAssets } from '../scripts/lib/local-research-adapter.mjs'
import { PROJECT_ROOT } from '../scripts/build-data.mjs'
import { planBatchImport } from '../scripts/lib/bulk-import.mjs'

const read = async path => JSON.parse(await readFile(new URL('../' + path, import.meta.url), 'utf8'))
const lists = await read('data/research/redbook-master-national-lists.json')
const registry = await read('data/research/redbook-master-registry.json')
const candidates = await read('data/research/redbook-master-candidates.json')
const reconciliation = await read('data/research/redbook-master-reconciliation.json')
// Reconciliation was made before provisional publication; retain that exact input.
const source = await read('data/backups/bulk-25-provisional/species.source.json')
const taxonomy = await read('docs/evidence/redbook-master-taxonomy.json')
const selection = await read('data/research/redbook-master-selection.json')

test('the two national source versions retain every account/numbered position and never reconstruct excluded taxa', () => {
  const [book, law] = lists.lists
  assert.equal(book.records.length, 202)
  assert.equal(law.records.length, 219)
  assert.equal(law.records.filter(r => r.recordState === 'listed_in_2009_copy').length, 202)
  const excluded = law.records.filter(r => r.recordState === 'excluded_by_471_2009')
  assert.equal(excluded.length, 17); assert.ok(excluded.every(r => r.scientificName === null && r.verbatimName === null))
  assert.equal(new Set(law.records.map(r => r.recordId)).size, 219)
  for (const [annex, count] of [[1,99],[2,26],[3,59],[4,18],[5,10],[6,7]]) assert.deepEqual(law.records.filter(r=>r.annex===annex).map(r=>r.row), Array.from({length:count},(_,i)=>i+1))
  for (const s of lists.lists) for (const r of s.records) {
    assert.ok(Number.isInteger(r.pdfPage) && r.pdfPage > 0)
    assert.equal(new URL(r.sourceUrl).hash, `#page=${r.russianAccountPage || r.pdfPage}`)
  }
  assert.equal(book.records.find(r => r.pdfPage === 490).scientificName, 'Barbastella leucomelas')
  assert.ok(book.records.find(r => r.pdfPage === 490).verbatimIndexedNames.includes('Barbestella leucomelas'))
})

test('all 40 source records are preserved and linked; synonym and parent/subspecies overlaps cannot become additional candidates', async () => {
  const baseline = await read('docs/evidence/redbook-master-catalog-baseline.json')
  assert.equal(source.catalog.length, 40)
  assert.equal(fingerprint(source.demoArchive), baseline.archiveFingerprint)
  for (const row of baseline.records) assert.equal(fingerprint(source.catalog.find(s=>s.id===row.id)), row.fingerprint, row.id)
  assert.equal(reconciliation.existing.length, 40)
  assert.equal(new Set(reconciliation.existing.map(r=>r.nationalRecordId)).size, 40)
  assert.ok(reconciliation.existing.find(r=>r.speciesId==='great-bustard').relationship.includes('concept_overlap'))
  assert.ok(reconciliation.existing.find(r=>r.speciesId==='semenovs-fir').relationship.includes('concept_overlap'))
  const collapsed = reconciliation.bookPositions.find(r=>r.nationalRecordId==='book-2006-92')
  assert.equal(collapsed.status, 'confirmed_synonym_of_selected_candidate')
  assert.equal(collapsed.synonymOfCandidate, 'tulipa-korolkowii')
  assert.ok(!candidates.some(c=>c.originalScientificName==='Tulipa rosea'))
  assert.equal(createQueueConflicts(registry).size, 0)
})

test('60 actual national candidates reproduce offline without changing catalog or editorial state and remain deferred by strict checks', async () => {
  validateRegistry(registry)
  const materialHashes = Object.fromEntries(await Promise.all(candidates[0].materials.map(async m=>[m.path,digest(await readFile(new URL('../'+m.path,import.meta.url)))])))
  const rebuilt = prepareMasterCandidates(lists,taxonomy,selection,source,materialHashes)
  assert.deepEqual(rebuilt.candidates,candidates)
  assert.deepEqual(rebuilt.reconciliation,reconciliation)
  assert.equal(candidates.length,60)
  const nationalIds = new Set(lists.lists.flatMap(l=>l.records.filter(r=>r.scientificName).map(r=>r.recordId)))
  for (const c of registry.candidates) {
    assert.equal(c.verified,false); assert.equal(c.approval,null); assert.equal(c.draft,null)
    assert.equal(c.nationalConfirmation.confirmed,true)
    assert.ok(c.nationalSourceRecords.every(id=>nationalIds.has(id)))
    assert.equal(c.nationalRedBook.basis,'historical_edition'); assert.equal(c.nationalRedBook.claimsCurrentLegalStatus,false)
    assert.equal(c.countryOccurrence.currentPresenceConfirmed,null)
    assert.ok(c.sources.some(s=>s.id==='national-book'&&s.url.includes('282.pdf#page=')))
    assert.ok(c.sources.every(s=>['https:','http:'].includes(new URL(s.url).protocol)))
    for (const m of c.materials) assert.equal(m.sha256,materialHashes[m.path])
  }
  const inputBefore=fingerprint(registry),sourceBefore=fingerprint(source)
  const checked=await checkRegistry(registry,source,{adapter:createLocalAdapter(PROJECT_ROOT),validateAssets:s=>inspectPipelineAssets(PROJECT_ROOT,s)})
  assert.deepEqual(checked.report.counts,{processed:60,accepted:0,deferred:60,rejected:0})
  assert.equal(checked.report.states.research_ready,46);assert.equal(checked.report.states.needs_evidence,14)
  assert.equal(checked.report.states.approved_for_import,0);assert.equal(checked.report.states.imported,0)
  assert.deepEqual(checked.batches.map(b=>b.drafts.records.length),[25,25,10])
  for(const b of checked.batches){assert.equal(b.approved.records.length,0); await assert.rejects(planBatchImport(source,b.drafts),/Пакет/)}
  assert.equal(fingerprint(source),sourceBefore);assert.equal(fingerprint(registry),inputBefore)
  const knownConcept = registry.candidates.find(c=>c.originalScientificName==='Bufo viridis')
  assert.equal(knownConcept.acceptedScientificName,null);assert.ok(knownConcept.contradictions.some(s=>s.includes('AMNH')))
  assert.equal(reconciliation.groups.length,8)
  assert.equal(reconciliation.groups.reduce((n,g)=>n+g.selected,0),60)
})
