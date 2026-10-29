import { UI_V3_FILES } from './helpers/ui-v3-preservation.mjs'
import { historicalBytes } from './helpers/photo-amendment.mjs'
import { POPULATION_PUBLICATION_BASE, POPULATION_PUBLICATION_FILES } from './helpers/population-publication-evolution.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { formatDocumentedEstimate } from '../data/research/population-184-bulk/format.mjs'
import { validateResearchPacket, fingerprint } from '../data/research/population-184-bulk/validate.mjs'
import { planBatchImport } from '../scripts/lib/bulk-import.mjs'
import { populationPresentation, validatePopulation } from '../src/data/population.js'
const read = p => JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8').replace(/^\uFEFF/,''))
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const packet = read('data/research/population-184-bulk-publication.json')
const source = read('data/species.source.json')
const old = read('data/research/population-184-evidence-audit.json')
const manifest = read('data/research/population-184-bulk/manifest.json')
const drafts = read('data/research/population-184-bulk/pending-population-drafts.json')
const claims = packet.records.flatMap(r=>r.estimates)
const fixture = {type:'approximate',value:300,min:null,max:null,unit:'особей',method:'estimate',territory:'Синтетическая территория',year:2021,publicationYear:2026,sourceUrl:'https://example.org/fixture',observationPeriod:null}
test('28.3: packet binds all 184 taxa, all 91 prior claims and every pending draft',()=>{
 assert.deepEqual(validateResearchPacket(packet,source.catalog),[])
 const previous=old.records.flatMap(r=>r.estimates)
 assert.equal(previous.length,91)
 for(const c of previous) assert.equal(claims.find(n=>n.evidenceId===c.evidenceId).originalEvidenceFingerprint,fingerprint(c))
 assert.equal(manifest.estimates.length,36)
 assert.equal(drafts.candidates.length,36)
 assert.equal(manifest.registryFingerprint,packet.registryFingerprint)
 assert.equal(manifest.registrySHA256,sha(readFileSync(new URL('../data/research/population-184-bulk-publication.json',import.meta.url))))
 for(const c of manifest.estimates) assert.equal(claims.find(n=>n.evidenceId===c.evidenceId).fingerprint,c.fingerprint)
 assert.equal(manifest.notForApply,true)
 assert.equal(manifest.ownerAuthorization,null)
 assert.equal(manifest.scientificApproval,null)
})
test('28.3: approximate, documented exact, range and statistical CI remain distinct',()=>{
 assert.equal(formatDocumentedEstimate(fixture).label,'≈ 300 особей')
 assert.equal(formatDocumentedEstimate({...fixture,type:'exact',value:150,method:'complete-count'}).label,'150 особей')
 assert.throws(()=>formatDocumentedEstimate({...fixture,type:'exact'}),/complete-count/)
 const range=formatDocumentedEstimate({...fixture,type:'range',value:null,min:200,max:350})
 assert.equal(range.label,'200–350 особей'); assert.equal(range.accuracy,'Оценочный диапазон')
 assert.throws(()=>formatDocumentedEstimate({...fixture,type:'range',min:200,max:350}),/midpoint/)
 const ci=formatDocumentedEstimate({...fixture,confidenceInterval:{min:246,max:366,level:0.95}})
 assert.equal(ci.label,'≈ 300 особей');assert.equal(ci.intervalLabel,'95% ДИ: 246–366')
 assert.equal(formatDocumentedEstimate({type:'unknown'}).kind,'unknown')
})
test('28.3: research formatting preserves field year, publication year and geography in four languages',()=>{
 for(const lang of ['ky','uz','ru','en']) {
  const p=formatDocumentedEstimate(fixture,lang)
  assert.equal(p.year,2021);assert.equal(p.publicationYear,2026);assert.equal(p.territory,fixture.territory)
  assert.equal(p.sourceUrl,fixture.sourceUrl);assert.ok(p.label.startsWith('≈ '));assert.ok(p.status)
  assert.equal(formatDocumentedEstimate({...fixture,type:'range',value:null,min:200,max:350},lang).label,'200–350 особей')
 }
})
test('28.3: every pending or rejected draft stays hidden by the unchanged public gate',()=>{
 let valid=0,notRepresentable=0
 for(const d of drafts.candidates) {
  if(validatePopulation(d.population,d.sources).length) notRepresentable++;else valid++
  for(const reviewStatus of ['pending','rejected']) {
   const p=populationPresentation({...d.population,reviewStatus},d.sources,'ru')
   assert.equal(p.type,'unknown');assert.equal(p.value,null);assert.equal(p.year,null);assert.deepEqual(p.sources,[])
  }
 }
 assert.ok(valid>0);assert.ok(notRepresentable>0)
})
test('28.3: reference dates and source-reported confidence intervals are not rewritten',()=>{
 const news=claims.find(c=>c.sourceId==='super-60956'&&c.speciesId==='irbis')
 assert.equal(news.value,459);assert.equal(news.year,null);assert.equal(news.reportedReferenceYear,2024)
 assert.equal(news.consistentWithNR7ObservationYear,2023);assert.equal(news.sourceReadiness,'NEEDS_EVIDENCE')
 const annual=claims.find(c=>c.evidenceId==='nr7-row-5-2023')
 assert.equal(annual.year,2023);assert.equal(annual.publicationYear,2026);assert.equal(annual.value,459)
 const slr=claims.find(c=>c.evidenceId==='slr-national-adults')
 assert.equal(slr.value,300);assert.deepEqual(slr.confidenceInterval,{min:246,max:366,level:0.95})
 assert.equal(slr.min,null);assert.ok(slr.observationPeriod)
})
test('28.3: parental taxa, introduced cohorts, ambiguous names and world totals are withheld',()=>{
 for(const c of claims.filter(c=>['subtaxon_only','parent_species_not_subspecies','historical_concept_unresolved','ambiguous_common_name','introduced_cohort_not_national_wild_population'].includes(c.taxonMatchStatus))) assert.equal(c.sourceReadiness,'NEEDS_EVIDENCE')
 const gazelle=claims.find(c=>c.speciesId==='gazella-subgutturosa')
 assert.equal(gazelle.introducedIndividualsIn2021,15)
 assert.ok(packet.unmatchedClaims.some(c=>c.sourceName==='Жору'&&c.value===191))
 for(const c of claims.filter(c=>c.scope==='global')) assert.notEqual(c.sourceReadiness,'READY_SOURCE_DOCUMENTED')
})
test('28.3: tampered values, missing sources, invented approval and density pixels fail validation',()=>{
 const mutate=fn=>{const p=structuredClone(packet);fn(p);assert.ok(validateResearchPacket(p,source.catalog).length)}
 mutate(p=>{p.records.find(r=>r.estimates.length).estimates[0].value=123456})
 mutate(p=>{p.records.find(r=>r.estimates.length).estimates[0].sourceId='missing'})
 mutate(p=>{p.records[0].scientificReviewStatus='approved'})
 mutate(p=>{p.records.find(r=>r.metrics.length).metrics[0].eligibleForPixelation=true})
})
test('28.3: pre-existing scientific statuses, archive, media and other untouched tracked bytes remain immutable',()=>{
 const baseline=read('data/research/population-184-bulk/baseline.json')
 for(const [path,expected] of Object.entries(baseline.hashes).filter(([p])=>!['tests/population-activation.test.mjs','data/.gitattributes'].includes(p))) assert.equal(sha((POPULATION_PUBLICATION_FILES.has(path)||UI_V3_FILES.has(path))?historicalBytes(POPULATION_PUBLICATION_BASE,path,expected):readFileSync(new URL('../'+path,import.meta.url))),expected,path)
 assert.equal(source.catalog.length,184);assert.equal(source.demoArchive.length,2)
 assert.equal(source.catalog.filter(s=>s.images.length).length,161)
 for(const s of source.catalog){assert.equal(s.population.type,'unknown');assert.equal(s.verified,false);assert.equal(s.population.reviewStatus,'pending')}
})

test('28.3: existing append-only importer rejects population patches without mutating any source',async()=>{
 const d=drafts.candidates.find(c=>c.speciesId==='eurasian-lynx'&&c.population.year===2024)
 const s=structuredClone(source.catalog.find(s=>s.id===d.speciesId))
 s.population=d.population;s.sources.push(...d.sources)
 const taxon=s.sources.find(s=>s.taxonId==='gbif:2435240')
 const entry={candidateId:s.id,species:s,taxonomyEvidence:{status:'ACCEPTED',matchType:'EXACT',rank:'SPECIES',canonicalName:s.scientificName,taxonId:taxon.taxonId,sourceId:taxon.id}}
 const batch={schemaVersion:1,documentType:'species-import-batch',batchId:'test-only-readonly-population-rejection',records:[entry]}
 const before=JSON.stringify(source),a=await planBatchImport(source,batch),b=await planBatchImport(source,batch)
 assert.deepEqual(a,b);assert.equal(a.beforeCount,184);assert.equal(a.afterCount,184)
 assert.deepEqual(a.counts,{processed:1,added:0,unchanged:0,rejected:1})
 assert.ok(a.results[0].errors.some(e=>e.includes('импорт только добавляет')))
 assert.equal(JSON.stringify(source),before);assert.deepEqual(a.proposedSource,source)
})