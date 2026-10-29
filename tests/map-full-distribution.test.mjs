import { UI_V3_FILES } from './helpers/ui-v3-preservation.mjs'
import { POPULATION_EVOLVING_FILES } from './helpers/population-evolution.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { REGIONS, validateRegionalEvidence, publicRegionalEvidence } from '../src/data/geography/model.js'
import { queryRegionalEntries, loadRegionalData } from '../src/data/geography/repository.js'
import { historicalBytes } from './helpers/photo-amendment.mjs'
const BASE='b83a48c3b7b362bd6a93661ebb8dcb4415fcce74'
const read=async path=>JSON.parse(await readFile(new URL('../'+path,import.meta.url)))
const bytes=path=>readFile(new URL('../'+path,import.meta.url))
const hash=b=>createHash('sha256').update(b).digest('hex')
const old=path=>JSON.parse(historicalBytes(BASE,path))
const source=await read('data/species.source.json'), species=await read('public/data/species.json')
const evidence=await read('data/geography/occurrences.source.json'), published=await read('public/data/geography/occurrences.json')
const registry=await read('data/research/map-184-full-distribution.json')
const reviewed=await read('data/research/map-184/reviewed-links.json')
const secondary=await read('data/research/map-184/secondary-review.json')
const copy=()=>structuredClone(evidence)
const record=d=>d.records.find(r=>r.evidenceId)
const historical=d=>d.sources.find(s=>s.kind==='historical-national-account')
const fails=mutate=>{const d=copy();mutate(d);assert.ok(validateRegionalEvidence(d,species).length)}

test('distribution review covers all 184 actual taxa, exact national accounts and inspected maps',()=>{
 assert.equal(registry.status,'completed');assert.equal(registry.publicationApplied,true)
 assert.equal(registry.independentScientificApproval,null)
 assert.equal(registry.records.length,184)
 assert.deepEqual(new Set(registry.records.map(r=>r.speciesId)),new Set(source.catalog.map(s=>s.id)))
 assert.equal(registry.book.sha256,'f517212f7ce12fcf5c30f2cf73edc5a842b3ded15dea232b844fbe7ce2525cf8')
 for(const r of registry.records){
  assert.equal(r.acceptedScientificName,species.find(s=>s.id===r.speciesId).scientificName)
  assert.ok(r.historicalScientificName);assert.ok(r.nationalRecordId)
  assert.equal(r.pairedPage,r.sourcePage-1);assert.ok(r.sourceUrl.endsWith('#page='+r.sourcePage))
  assert.match(r.directPdfTextSha256,/^[a-f0-9]{64}$/)
  assert.equal(r.visualReview.status,'inspected');assert.equal(r.visualReview.mapPointsUsedForAdministrativeInference,false)
  assert.ok(r.localityEvidence.length);assert.ok(r.unresolvedQuestions.length)
  if(!r.oblastIds.length){assert.ok(r.namedGeography.length);assert.ok(r.unresolvedQuestions.length>=3)}
  const regions=REGIONS.filter(x=>evidence.records.some(p=>p.speciesId===r.speciesId&&p.regionId===x.id)).map(x=>x.id)
  assert.deepEqual(r.oblastIds,regions)
  assert.equal(r.reviewStatus,regions.length?'documented_pending_review':'needs_evidence')
 }
 assert.equal(registry.records.filter(r=>!r.oblastIds.length).length,66)
})

test('208 unique documented pairs preserve six original records and exact source objects',()=>{
 assert.deepEqual(validateRegionalEvidence(evidence,species),[])
 assert.deepEqual(published,publicRegionalEvidence(evidence))
 const original=old('data/geography/occurrences.source.json')
 assert.deepEqual(evidence.records.slice(0,6),original.records)
 assert.deepEqual(evidence.sources.slice(0,original.sources.length),original.sources)
 assert.equal(evidence.records.length,208)
 assert.equal(new Set(evidence.records.map(r=>r.speciesId+':'+r.regionId)).size,208)
 assert.equal(new Set(evidence.records.map(r=>r.speciesId)).size,118)
 assert.equal(registry.records.filter(r=>r.oblastIds.length>1).length,53)
 assert.equal(registry.newLinkEvidence.length,202)
 assert.equal(registry.newLinkEvidence.filter(r=>r.evidenceType==='historical-national-account').length,189)
 assert.equal(registry.corroborations.length,2)
 for(const r of evidence.records.slice(6)){
  assert.equal(r.reviewStatus,'documented_pending_review');assert.equal(r.localityPrecision,'oblast')
  assert.ok(registry.newLinkEvidence.some(p=>p.speciesId===r.speciesId&&p.regionId===r.regionId))
 }
})

test('every new book pair has a separate page, locality cue and administrative reference',()=>{
 assert.equal(reviewed.links.length,191)
 for(const x of reviewed.links){
  const r=registry.records.find(r=>r.speciesId===x.speciesId)
  assert.equal(x.sourcePage,r.sourcePage);assert.ok(x.localityCue)
  const proof=r.localityEvidence.find(p=>p.regionId===x.regionId&&p.evidenceType==='historical-national-account')
  assert.ok(proof);assert.equal(proof.directPdfTextSha256,r.directPdfTextSha256)
  for(const id of x.administrativeSourceIds){
   const s=evidence.sources.find(s=>s.id===id)
   assert.equal(s.kind,'administrative-reference');assert.ok(s.administrativeRegionIds.includes(x.regionId))
  }
 }
})

test('administrative-only claims, wrong account, invented dates and nested coordinates fail closed',()=>{
 for(const mutate of [
  d=>{record(d).sourceIds=['admin-protected']},
  d=>{historical(d).bookPdfSha256='0'.repeat(64)},
  d=>{historical(d).accountPage+=2},
  d=>{const s=historical(d);s.accountPage+=2;s.pairedPage+=2;s.url='https://macrolepidoptera.ru/lnk/282.pdf#page='+s.accountPage},
  d=>{historical(d).speciesId='sievers-apple'},
  d=>{record(d).temporalContext='recent'},
  d=>{record(d).administrativeBasis.sourceIds=['admin-batken']},
  d=>{record(d).administrativeBasis.latitude=42.12345},
  d=>{record(d).evidenceId='another-decision'},
  d=>{record(d).observationPeriod='42.12345, 79.12345'},
  d=>{d.records[0].observationYear=null;d.records[0].observationPeriod='unknown'},
  d=>{d.records.push(structuredClone(record(d)))},
  d=>{d.records.find(r=>r.temporalContext==='undated').observationYear=2025},
  d=>{d.records.find(r=>r.temporalContext==='undated').temporalContext='recent'},
 ])fails(mutate)
 const d=copy();record(d).reviewStatus='unverified'
 assert.equal(publicRegionalEvidence(d).records.length,207)
})

test('historical, recent dated observations and undated source lists never imply current populations',()=>{
 const historicalRecords=evidence.records.slice(6).filter(r=>r.sourceIds.some(id=>evidence.sources.find(s=>s.id===id)?.kind==='historical-national-account'))
 for(const r of historicalRecords){assert.equal(r.temporalContext,'historical');assert.notEqual(r.observationYear,2006)}
 const gazelle=evidence.records.find(r=>r.speciesId==='gazella-subgutturosa'&&r.regionId==='batken')
 assert.equal(gazelle.regionId,'batken');assert.equal(gazelle.observationYear,1975)
 const recent=evidence.records.slice(6).filter(r=>r.temporalContext==='recent')
 assert.equal(recent.length,3);assert.ok(recent.every(r=>[2013,2025].includes(r.observationYear)))
 const undated=evidence.records.filter(r=>r.temporalContext==='undated')
 assert.equal(undated.length,5);assert.ok(undated.every(r=>r.observationYear===null&&r.observationPeriod))
 const ramsar=evidence.sources.find(s=>s.id==='ramsar-sonkol-ris2010')
 assert.ok(!evidence.records.some(r=>r.speciesId==='great-bustard'&&r.regionId==='naryn'))
 assert.ok(registry.records.find(r=>r.speciesId==='great-bustard').localityEvidence.some(r=>r.evidenceType==='rejected-rank-mismatch'))
 assert.equal(ramsar.year,null);assert.equal(ramsar.informationYear,2010)
 for(const r of published.records)assert.match(r.evidence,/Современное присутствие и численность.*не установлены/)
})

test('six museum records retain exact taxon, catalog number, verbatim province and snapshot proof',()=>{
 const selected=secondary.gbifSearch.records.filter(r=>r.selectedEvidence)
 assert.equal(selected.length,6)
 for(const x of selected){
  const v=x.selectedEvidence,s=evidence.sources.find(s=>s.id==='gbif-specimen-'+v.occurrenceKey)
  assert.equal(s.catalogNumber,v.catalogNumber);assert.equal(s.taxonId,v.acceptedTaxonId)
  assert.equal(s.scientificName,species.find(s=>s.id===x.speciesId).scientificName)
  assert.equal(s.administrativeRegionId,v.regionId);assert.equal(v.countryCode,'KG')
  assert.ok(v.verbatimStateProvince);assert.match(v.snapshotSha256,/^[a-f0-9]{64}$/)
  assert.equal(v.rank,'SPECIES');assert.ok(!v.issues.includes('TAXON_MATCH_HIGHERRANK'))
 }
 fails(d=>{d.sources.find(s=>s.id==='gbif-specimen-890179680').taxonId='gbif:1'})
 fails(d=>{d.sources.find(s=>s.id==='gbif-specimen-890179680').catalogNumber=''})
})

test('uncertain ranges, parent subspecies and ambiguous provinces are not promoted',()=>{
 for(const id of ['cuon-alpinus','hemiechinus-hypomelas','masaris-longicornis','parnassius-apollo-merzbacheri']){
  const r=registry.records.find(r=>r.speciesId===id)
  assert.ok(r,id);assert.deepEqual(r.oblastIds,[],id)
 }
 assert.ok(!evidence.records.some(r=>r.speciesId==='rhinolophus-bocharicus'))
 const ambiguous=secondary.gbifSearch.records.find(r=>r.speciesId==='ammopiptanthus-nanus')
 assert.ok(!ambiguous?.selectedEvidence)
 const source=secondary.monitoring.source
 assert.match(source.sourceTagConflict,/Чуйская/)
 const actual=evidence.records.filter(r=>r.sourceIds.includes(source.id))
 assert.equal(actual.length,5);assert.ok(actual.every(r=>r.regionId==='talas'))
 assert.ok(!actual.some(r=>r.speciesId.includes('bear')))
})

test('old private drafts stay unchanged; fresh black-stork decisions have independent documentary provenance',async()=>{
 for(const path of ['data/research/first-batch-regions.json','data/research/map-activation-evidence.json'])assert.deepEqual(await read(path),old(path))
 const records=registry.newLinkEvidence.filter(p=>p.speciesId==='black-stork')
 assert.ok(records.some(p=>p.sourcePage===375));assert.ok(records.some(p=>p.sourceIds.includes('ramsar-sonkol-ris2010')))
 assert.ok(records.every(p=>p.reviewStatus==='documented_pending_review'))
 const fir=reviewed.links.filter(p=>p.speciesId==='semenovs-fir')
 assert.ok(fir.every(p=>p.taxonomyBridge));assert.ok(fir.length)
})

test('full repository returns all pairs for all seven oblasts, filters and four-language search without truncation',async()=>{
 const counts={batken:8,osh:15,'jalal-abad':39,naryn:26,'issyk-kul':51,chuy:48,talas:21}
 assert.equal(queryRegionalEntries(published,species).length,208)
 for(const region of REGIONS){
  const entries=queryRegionalEntries(published,species,{regionId:region.id})
  assert.equal(entries.length,counts[region.id]);assert.equal(registry.counts.byRegion[region.id],entries.length)
  for(const group of new Set(species.map(s=>s.group)))assert.equal(queryRegionalEntries(published,species,{regionId:region.id,group}).length,entries.filter(e=>e.species.group===group).length)
 }
 for(const id of ['irbis','allium-semenovii','black-stork']){
  const s=species.find(s=>s.id===id)
  for(const name of [...Object.values(s.names),s.scientificName])assert.ok(queryRegionalEntries(published,species,{query:name}).some(e=>e.species.id===id))
 }
 const geometry=await read('public/data/geography/map.json')
 assert.equal((await loadRegionalData(species,{fetcher:async url=>({ok:true,json:async()=>url.endsWith('map.json')?geometry:published})})).evidence.records.length,208)
})

test('184 cards, archive, images and geometry stay unchanged; historical UI hashes retain authentic Git bytes',async()=>{
 assert.deepEqual(source,old('data/species.source.json'));assert.equal(source.catalog.length,184);assert.equal(source.demoArchive.length,2)
 assert.equal(source.catalog.filter(s=>s.images.length).length,161)
 const frozen=await read('data/research/map-184/preservation.json')
 assert.equal(frozen.sourceCommit,BASE)
 for(const [path,expected] of Object.entries(frozen.files)){
  assert.equal(hash(historicalBytes(BASE,path,expected)),expected,path+' historical')
  assert.equal(hash((POPULATION_EVOLVING_FILES.has(path)||UI_V3_FILES.has(path))?historicalBytes(BASE,path,expected):await bytes(path)),expected,path+' preserved')
 }
})

test('research inputs and publication are deterministically bound by SHA-256',async()=>{
 for(const [path,expected] of Object.entries(registry.reproducibility.inputLfSha256))assert.equal(hash(Buffer.from((await bytes(path)).toString('utf8').replace(/\r\n/g,'\n'))),expected,path)
 assert.equal(hash(await bytes('data/species.source.json')),registry.reproducibility.catalogSha256)
 assert.equal(hash(Buffer.from((await bytes('data/geography/occurrences.source.json')).toString('utf8').replace(/\r\n/g,'\n'))),registry.reproducibility.regionalPayloadLfSha256)
})
