import { UI_V3_FILES, assertUiV3File } from './helpers/ui-v3-preservation.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {effectScope, reactive, ref} from 'vue'
import {checkPopulationPublication, documentedPopulationPresentation, validateDocumentedPopulation, populationFingerprint, canonicalPopulationJSON,populationPublicationContexts} from '../src/data/population-publication.js'
import {populationPresentation,populationCells,UNKNOWN_POPULATION,validatePopulation} from '../src/data/population.js'
import {usePopulationPresentation} from '../src/composables/usePopulationPresentation.js'
import {syntheticOwnerDecision,candidateIdentity} from './helpers/population-publication-fixtures.mjs'
import {historicalBytes} from './helpers/photo-amendment.mjs'
const BASE='c043497581bb3a5722830a22a2177b97a4594a1e'
const bytes=p=>readFileSync(new URL('../'+p,import.meta.url))
const read=p=>JSON.parse(bytes(p).toString('utf8').replace(/^\uFEFF/,''))
const sha=b=>createHash('sha256').update(b).digest('hex')
const packet=read('data/research/population-publication-candidates.json'),prior=read('data/research/population-184-bulk-publication.json')
const source=read('data/species.source.json')
const context=(id='irbis')=>({candidate:structuredClone(packet.candidates.find(c=>c.identity.speciesId===id)),manifest:structuredClone(packet.selectionManifest),decision:syntheticOwnerDecision(packet.selectionManifest)})
const display=ctx=>documentedPopulationPresentation(ctx,ctx.candidate.identity)
async function rebind(ctx){
 const {candidateFingerprint,...c}=ctx.candidate
 ctx.candidate.candidateFingerprint=await populationFingerprint(c)
 const entry=ctx.manifest.candidates.find(r=>r.speciesId===ctx.candidate.identity.speciesId)
 entry.candidateFingerprint=ctx.candidate.candidateFingerprint
 const {fingerprint,...m}=ctx.manifest;ctx.manifest.fingerprint=await populationFingerprint(m)
 ctx.decision=syntheticOwnerDecision(ctx.manifest);return ctx
}
const eventually=async predicate=>{for(let i=0;i<100;i++){if(predicate())return;await new Promise(r=>setTimeout(r,10))}assert.fail('Timed out waiting for adapter')}

test('28.4: all eight READY taxa and 36 estimates reviewed; six selected without owner authorization',()=>{
 assert.deepEqual(packet.counts,{reviewedTaxa:8,reviewedEstimates:36,eligibleTaxa:6,eligibleWithImages:5,excludedTaxa:2,alternativeEstimates:30,published:0})
 assert.equal(packet.ownerAuthorization,null);assert.equal(packet.populationPublicationStatus,'unpublished')
 assert.equal(packet.assessments.flatMap(a=>a.readyEstimates).length,36)
 for(const a of packet.assessments){
  const r=prior.records.find(r=>r.speciesId===a.speciesId)
  assert.equal(r.researchStatus,'READY_SOURCE_DOCUMENTED')
  assert.deepEqual(a.readyEstimates,r.estimates.filter(e=>e.sourceReadiness==='READY_SOURCE_DOCUMENTED'))
  assert.ok(a.reason)
 }
 assert.deepEqual(packet.assessments.filter(a=>!a.eligible).map(a=>a.speciesId).sort(),['anser-indica','menzbiers-marmot'])
 for(const c of packet.candidates){const a=packet.assessments.find(a=>a.speciesId===c.identity.speciesId);assert.equal(c.documentation.evidenceId,a.primaryEvidenceId);assert.deepEqual(validateDocumentedPopulation(c,c.identity),[])}
})
test('28.4: browser Web Crypto and Node SHA-256 agree with every prepared fingerprint',async()=>{
 for(const c of packet.candidates){const {candidateFingerprint,...body}=c;assert.equal(await populationFingerprint(body),candidateFingerprint);assert.equal(sha(canonicalPopulationJSON(body)),candidateFingerprint)}
 const {fingerprint,...m}=packet.selectionManifest;assert.equal(await populationFingerprint(m),fingerprint)
 const {registryFingerprint,...p}=packet;assert.equal(await populationFingerprint(p),registryFingerprint)
})
test('28.4: editorial authorization never changes independent scientific status or source catalogue',async()=>{
 const before=JSON.stringify(source)
 for(const c of packet.candidates){const ctx=context(c.identity.speciesId),input=JSON.stringify(ctx),p=await display(ctx);assert.equal(p.scientificReviewStatus,'pending');assert.equal(p.reviewStatus,'pending');assert.equal(p.verified,false);assert.equal(p.lastReviewedAt,null);assert.equal(p.populationPublicationStatus,'authorized');assert.equal(JSON.stringify(ctx),input)}
 assert.equal(JSON.stringify(source),before)
})
test('28.4: explicit separate owner decision required; self-authorizing the claim is rejected',async()=>{
 for(const decision of [null,{}, {populationPublicationStatus:'authorized'}, {...context().decision,ownerRole:'editor'}]){const ctx=context();ctx.decision=decision;assert.equal((await display(ctx)).type,'unknown')}
 const ctx=context();ctx.candidate.populationPublicationStatus='authorized';assert.equal((await display(ctx)).type,'unknown')
})
test('28.4: NEEDS_EVIDENCE stays withheld even if test-only fingerprints and decision are rebound',async()=>{
 const ctx=context();ctx.candidate.sourceReadiness='NEEDS_EVIDENCE';await rebind(ctx);assert.equal((await display(ctx)).type,'unknown')
})
test('28.4: revocation or removal of editorial permission hides all numerical facts',async()=>{
 for(const status of ['revoked','unpublished','pending','approved']){const ctx=context();ctx.decision.populationPublicationStatus=status;const p=await display(ctx);assert.equal(p.type,'unknown');assert.equal(p.year,null);assert.equal(p.value,null);assert.deepEqual(p.sources,[])}
})
test('28.4: every approximate point retains approximately sign in all four languages',async()=>{
 for(const c of packet.candidates.filter(c=>c.estimate.type==='approximate'))for(const lang of ['ky','uz','ru','en']){const p=await documentedPopulationPresentation(context(c.identity.speciesId),c.identity,lang);assert.ok(p.label.startsWith('≈ '));assert.equal(p.value,c.estimate.value)}
})
test('28.4: ranges retain bounds with an estimated-range label and no invented midpoint or approximately sign',async()=>{
 for(const id of ['manul','ursus-arctos']){const p=await display(context(id));const c=context(id).candidate;assert.equal(p.estimateType,'range');assert.equal(p.value,null);assert.equal(p.min,c.estimate.min);assert.equal(p.max,c.estimate.max);assert.ok(p.label.includes(`${p.min}–${p.max}`));assert.ok(p.label.includes('оценочный диапазон'));assert.ok(!p.label.includes('≈'))}
})
test('28.4: source-reported adult point estimate and labelled 95% CI are separate from field period/publication',async()=>{
 const p=await display(context());assert.equal(p.label,'≈ 300 взрослых особей');assert.equal(p.intervalLabel,'95% ДИ: 246–366');assert.equal(p.year,null);assert.equal(p.periodLabel,'2020–2024');assert.equal(p.publicationYear,2026);assert.deepEqual(p.confidenceInterval,{min:246,max:366,level:0.95});assert.equal(p.min,null);assert.equal(p.max,null)
})
test('28.4: precise geography, year/period, publication, units, sources and limitations retained',async()=>{
 for(const c of packet.candidates){const p=await display(context(c.identity.speciesId));assert.equal(p.territory,c.estimate.territory);assert.equal(p.scope,c.estimate.scope);assert.equal(p.year,c.estimate.year);assert.equal(p.publicationYear,c.estimate.publicationYear);assert.equal(p.sources[0].url,c.source.url);assert.deepEqual(p.limitations,c.documentation.limitations);assert.ok(p.statusLabel.includes('независимая проверка MURAS ожидается'))}
 assert.equal((await display(context('ursus-arctos'))).year,1964)
 assert.equal((await display(context('lonicera-paradoxa'))).label,'≈ 12 экземпляров')
})
test('28.4: taxon ID, name, species/subspecies rank and country scope mismatches block publication',async()=>{
 const ctx=context('eurasian-lynx')
 for(const changed of [{speciesId:'other'},{acceptedScientificName:'Lynx pardinus'},{taxonRank:'SUBSPECIES'},{taxonIds:['gbif:1']}])assert.ok((await checkPopulationPublication(ctx,{...candidateIdentity(ctx.candidate),...changed})).length)
 const wrong=context();wrong.candidate.documentation.taxonMatchConfirmed=false;await rebind(wrong);assert.equal((await display(wrong)).type,'unknown')
 const global=context();global.candidate.estimate.scope='GLOBAL';await rebind(global);assert.equal((await display(global)).type,'unknown')
})
test('28.4: existing unknown and pending scientific gate retain their old behaviour',()=>{
 const p=populationPresentation(UNKNOWN_POPULATION,[]);assert.equal(p.type,'unknown');assert.equal(p.value,null)
 for(const s of source.catalog){assert.equal(s.population.type,'unknown');assert.deepEqual(validatePopulation(s.population,s.sources),[])}
 assert.equal(sha(bytes('src/data/population.js')),read('data/research/population-publication/baseline.json').hashes['src/data/population.js'])
})
test('28.4: documented mode remains symbolic and cannot produce literal individual cells',async()=>{
 for(const c of packet.candidates){const p=await display(context(c.identity.speciesId));assert.equal(p.symbolicOnly,true);assert.deepEqual(populationCells(p),{cells:[],scale:null})}
})
test('28.4: tampering with value, source or uncertainty invalidates the exact release binding',async()=>{
 for(const mutate of [c=>c.estimate.value++,c=>c.source.url='https://example.org/substitution',c=>c.source.sourcePage='wrong',c=>c.estimate.confidenceInterval.max++]){const ctx=context();mutate(ctx.candidate);assert.equal((await display(ctx)).type,'unknown')}
})
test('28.4: wildcard permissions, wrong packet, missing candidate and duplicate decisions deny display',async()=>{
 for(const mutate of [c=>c.decision.packetFingerprint='0'.repeat(64),c=>c.decision.authorizedCandidates=[],c=>c.decision.authorizedCandidates=[{speciesId:'*',candidateFingerprint:c.candidate.candidateFingerprint}],c=>c.decision.authorizedCandidates.push(c.decision.authorizedCandidates[0]),c=>c.manifest.candidates.push(c.manifest.candidates[0])]){const ctx=context();mutate(ctx);assert.equal((await display(ctx)).type,'unknown')}
})
test('28.4: malformed periods, statistical levels and unconfirmed source fail even with a rebound test decision',async()=>{
 for(const mutate of [c=>c.estimate.year=2024,c=>c.estimate.observationPeriod={startYear:2024,endYear:2020},c=>c.estimate.confidenceInterval.level=95,c=>c.source.sourceConfirmationStatus='UNCONFIRMED',c=>c.documentation.territoryMatchConfirmed=false,c=>c.scientificReviewStatus='approved']){const ctx=context();mutate(ctx.candidate);await rebind(ctx);assert.equal((await display(ctx)).type,'unknown')}
})
test('28.4: unavailable crypto fails closed instead of trusting an unhashed release',async()=>{
 const ctx=context();assert.equal((await documentedPopulationPresentation(ctx,ctx.candidate.identity,'ru',{cryptoProvider:null})).type,'unknown')
})
test('28.4: reactive revocation, invalid identity and rapid changes cannot restore stale authorized results',async()=>{
 const scope=effectScope(),ctx=context();let value
 const props=reactive({population:UNKNOWN_POPULATION,sources:[],speciesId:ctx.candidate.identity.speciesId,scientificName:ctx.candidate.identity.acceptedScientificName,populationPublication:ctx})
 scope.run(()=>{value=usePopulationPresentation(props,ref('ru'))})
 await eventually(()=>value.value.type!=='unknown')
 props.populationPublication.decision.populationPublicationStatus='revoked';assert.equal(value.value.type,'unknown')
 props.populationPublication=context();props.populationPublication.decision.populationPublicationStatus='revoked'
 await new Promise(r=>setTimeout(r,30));assert.equal(value.value.type,'unknown')
 props.populationPublication=context();await eventually(()=>value.value.type!=='unknown')
 props.scientificName='Testus mismatch';assert.equal(value.value.type,'unknown');await new Promise(r=>setTimeout(r,30));assert.equal(value.value.type,'unknown')
 scope.stop()
})
test('28.4: scientific records, source history, media, licences, archive and 208 links remain byte-identical',()=>{
 const baseline=read('data/research/population-publication/baseline.json')
 for(const [path,expected]of Object.entries(baseline.hashes))if((/^(data|public|assets)\//.test(path))&&path!=='data/.gitattributes')assert.equal(sha(bytes(path)),expected,path)
 assert.equal(source.catalog.length,184);assert.equal(source.demoArchive.length,2);assert.equal(source.catalog.filter(s=>s.images.length).length,161)
 assert.equal(read('data/geography/occurrences.source.json').records.length,208)
 for(const file of ['PopulationInfo.vue','SpeciesVisualization.vue','SpeciesModal.vue','SpeciesPage.vue']){
  const path='src/components/'+file,styles=b=>b.toString('utf8').match(/<style[\s\S]*$/)[0].replace(/\r\n/g,'\n')
  assert.equal(styles(bytes(path)),styles(historicalBytes(BASE,path)),path+' CSS')
 }
 assert.equal(bytes('src/App.vue').toString('utf8').match(/<style[\s\S]*$/)?.[0] || '',historicalBytes(BASE,'src/App.vue').toString('utf8').match(/<style[\s\S]*$/)?.[0] || '')
 for(const path of ['src/style.css','src/components/catalog.css']){if(UI_V3_FILES.has(path))assertUiV3File(path);else assert.equal(sha(bytes(path)),baseline.hashes[path],path)}
 for(const lang of ['ky','uz','ru','en']){const path=`src/locales/${lang}.json`,old=JSON.parse(historicalBytes(BASE,path)),now=read(path);for(const [key,value]of Object.entries(old))assert.equal(now[key],value,lang+':'+key)}
})

test('28.4: consulted mirror is labelled separately and unsafe source URLs cannot be authorized',async()=>{
 const ctx=context('eurasian-lynx'),p=await display(ctx)
 assert.equal(p.sources.length,2);assert.equal(p.sources[1].url,ctx.candidate.source.retrievedUrl)
 assert.equal(p.sources[1].title,'Прочитанная архивная копия')
 ctx.candidate.source.retrievedUrl='javascript:alert(1)';await rebind(ctx);assert.equal((await display(ctx)).type,'unknown')
})

test('28.4: optional release sidecar forwards exact contexts without changing species or granting prepared candidates',async()=>{
 assert.equal(populationPublicationContexts(null).size,0)
 const before=JSON.stringify(packet),contexts=populationPublicationContexts(packet)
 assert.equal(contexts.size,6)
 for(const ctx of contexts.values())assert.equal((await display(ctx)).type,'unknown')
 const duplicate=structuredClone(packet);duplicate.candidates.push(duplicate.candidates[0]);assert.equal(populationPublicationContexts(duplicate).size,0)
 const synthetic={...packet,ownerAuthorization:syntheticOwnerDecision(packet.selectionManifest)}
 for(const ctx of populationPublicationContexts(synthetic).values())assert.notEqual((await display(ctx)).type,'unknown')
 assert.equal(JSON.stringify(packet),before)
})
