import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {isDeepStrictEqual} from 'node:util'
import {populationPublicationContexts,checkPopulationPublication,documentedPopulationPresentation,populationFingerprint} from '../src/data/population-publication.js'
import {verifySixPublication,SIX_IDS} from '../data/research/population-six-publication/verify.mjs'
const read=p=>JSON.parse(readFileSync(p,'utf8'))
const release=read('src/data/population-editorial-release.json'),packet=read('data/research/population-publication-candidates.json'),source=read('data/species.source.json')
const contexts=populationPublicationContexts(release),clone=v=>structuredClone(v)
const display=ctx=>documentedPopulationPresentation(ctx,ctx.candidate.identity,'ru')

test('28.5: real owner decision permits exactly six primary estimates and no alternatives',async()=>{
 assert.deepEqual([...contexts.keys()].sort(),SIX_IDS)
 assert.deepEqual(release.candidates,packet.candidates)
 assert.deepEqual(release.ownerAuthorization.authorizedCandidates,packet.selectionManifest.candidates)
 assert.equal(release.ownerAuthorization.decisionId,'muras-28-5-owner-editorial')
 assert.equal(release.ownerAuthorization.date,'2026-10-29')
 assert.ok(!JSON.stringify(release.ownerAuthorization).includes('synthetic'))
 let n=0
 for(const s of source.catalog){const ctx=contexts.get(s.id);if(!ctx)continue;assert.deepEqual(await checkPopulationPublication(ctx,{speciesId:s.id,acceptedScientificName:s.scientificName,taxonIds:[...new Set(s.sources.filter(s=>s.taxonId).map(s=>s.taxonId))]}),[]);n++}
 assert.equal(n,6);assert.equal(source.catalog.length-n,178)
 assert.equal(packet.counts.alternativeEstimates,30)
})
test('28.5: publication leaves all protected bytes, science, archive, photos and links intact',async()=>{
 const r=await verifySixPublication();assert.deepEqual(r.errors,[]);assert.equal(r.catalogue,184);assert.equal(r.archive,2);assert.equal(r.regionalLinks,208);assert.equal(r.symbolicVisualizationWithPhotos,5);assert.equal(r.placeholder,1)
 for(const ctx of contexts.values()){const p=await display(ctx);assert.equal(p.scientificReviewStatus,'pending');assert.equal(p.verified,false);assert.equal(p.lastReviewedAt,null);assert.equal(p.symbolicOnly,true)}
})
test('28.5: approximate marker, original ranges, CI, unit and field dates are retained',async()=>{
 for(const ctx of contexts.values()){
  const e=ctx.candidate.estimate,p=await display(ctx)
  if(e.type==='approximate')assert.ok(p.label.startsWith('≈ '))
  else{assert.equal(p.value,null);assert.equal(p.min,e.min);assert.equal(p.max,e.max);assert.ok(p.label.startsWith(`${e.min}–${e.max}`));assert.ok(!p.label.includes('≈'))}
  assert.equal(p.territory,e.territory);assert.equal(p.publicationYear,e.publicationYear);assert.equal(p.sources[0].url,ctx.candidate.source.url);assert.ok(p.statusLabel.includes('ожидается'))
  assert.equal(p.periodLabel,e.year===null?`${e.observationPeriod.startYear}–${e.observationPeriod.endYear}`:String(e.year))
 }
 const irbis=await display(contexts.get('irbis'));assert.equal(irbis.intervalLabel,'95% ДИ: 246–366');assert.equal(irbis.value,300);assert.equal(irbis.year,null);assert.equal(irbis.unit,'взрослых особей')
 assert.equal((await display(contexts.get('lonicera-paradoxa'))).unit,'экземпляров')
})
test('28.5: removing or revoking the actual owner decision hides every estimate',async()=>{
 for(const status of ['revoked','unpublished'])for(const ctx of contexts.values()){const c=clone(ctx);c.decision.populationPublicationStatus=status;const p=await display(c);assert.equal(p.type,'unknown');assert.equal(p.value,null);assert.deepEqual(p.sources,[])}
 for(const ctx of contexts.values()){const c=clone(ctx);c.decision=null;assert.equal((await display(c)).type,'unknown')}
})
test('28.5: checksum damage blocks publication even with the real owner decision',async()=>{
 for(const ctx of contexts.values()){
  for(const field of ['estimate','source','manifest','fingerprint']){
   const c=clone(ctx)
   if(field==='estimate')c.candidate.estimate.territory+=' changed'
   if(field==='source')c.candidate.source.url='https://example.org/substitution'
   if(field==='manifest')c.manifest.fingerprint='0'.repeat(64)
   if(field==='fingerprint')c.candidate.candidateFingerprint='0'.repeat(64)
   assert.equal((await display(c)).type,'unknown')
  }
 }
})
test('28.5: even a correctly rehashed alternative cannot borrow owner authorization',async()=>{
 const c=clone(contexts.get('irbis'));c.candidate.estimate.value=301
 const {candidateFingerprint,...body}=c.candidate;c.candidate.candidateFingerprint=await populationFingerprint(body)
 assert.equal((await display(c)).type,'unknown')
 for(const id of ['menzbiers-marmot','anser-indica'])assert.equal(contexts.has(id),false)
})
test('28.5: pending is not rewritten to scientific approval to enable display',async()=>{
 for(const ctx of contexts.values()){const c=clone(ctx);c.candidate.scientificReviewStatus='approved';assert.equal((await display(c)).type,'unknown')}
 for(const s of source.catalog){assert.equal(s.population.type,'unknown');assert.equal(s.population.reviewStatus,'pending');assert.equal(s.verified,false)}
})
test('28.5: repeated real-release verification is read-only and deterministic',async()=>{
 const before=JSON.stringify(release),a=await verifySixPublication(),b=await verifySixPublication()
 delete a.freeDiskBytes;delete b.freeDiskBytes
 assert.ok(isDeepStrictEqual(a,b));assert.equal(JSON.stringify(release),before)
 const app=readFileSync('src/App.vue','utf8');assert.ok(app.includes('default: () => editorialPopulationRelease'));assert.ok(app.includes('populationPublicationContexts(props.populationPublicationRelease)'))
})
