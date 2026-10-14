import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {ref,createSSRApp} from 'vue'
import {renderToString} from 'vue/server-renderer'
import {createServer} from 'vite'
import {validateSource,canPublishImage} from '../src/data/species-model.js'
import {LANGUAGES,scientificContent} from '../src/data/localization.js'
import {CONTENT_FIELDS} from '../src/data/species-content.js'
import {createSearchIndex,searchSpecies} from '../src/data/catalog-search.js'
import {speciesPath,speciesIdFromPath} from '../src/data/species-routes.js'
import {speciesPhoto,PLACEHOLDER,publicImageUrl} from '../src/data/presentation.js'
import {useCatalog} from '../src/composables/useCatalog.js'
import {planBatchImport,taxonNameKey} from '../scripts/lib/bulk-import.mjs'
import {inspectAssets,webpMetadata,canApplyOnBranch} from '../scripts/import-species-batch.mjs'
import {PROJECT_ROOT} from '../scripts/build-data.mjs'
import {checkCommonsMetadata} from '../scripts/prepare-batch-images.mjs'

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8').then(JSON.parse)
const source=await read('data/species.source.json'),published=await read('public/data/species.json')
const baseline=await read('docs/evidence/catalog-40-baseline.json'),photos=await read('docs/evidence/catalog-40-photo-research.json')
const proofs=[],receipts=[]
for(const batch of [1,2]){
 try{proofs.push(...(await read(`docs/evidence/catalog-40-batch-${batch}-taxonomy.json`)).evidence);receipts.push(...(await read(`docs/evidence/catalog-40-batch-${batch}-images.json`)).receipts)}
 catch(error){if(error.code!=='ENOENT')throw error}
}
const added=source.catalog.slice(30),digest=bytes=>createHash('sha256').update(bytes).digest('hex'),hash=value=>digest(JSON.stringify(value))
const entry=species=>{
 const taxon=species.sources.find(s=>s.taxonId?.startsWith('gbif:')&&s.supports.includes('scientificName'))
 return {candidateId:species.id,species:structuredClone(species),taxonomyEvidence:{status:'ACCEPTED',matchType:'EXACT',rank:species.scientificName.split(' ').length===3?'SUBSPECIES':'SPECIES',taxonId:taxon.taxonId,canonicalName:species.scientificName,sourceId:taxon.id}}
}
const batch=records=>({schemaVersion:1,documentType:'species-import-batch',batchId:'expansion-test',records})

test('expansion preserves every byte-logical old account, all 25 photo metadata arrays and the archive',()=>{
 assert.equal(baseline.baselineCommit,'3b20a76');assert.equal(baseline.records.length,30)
 assert.deepEqual(source.catalog.slice(0,30).map(s=>s.id),baseline.records.map(s=>s.id))
 for(const row of baseline.records)assert.equal(hash(source.catalog.find(s=>s.id===row.id)),row.sha256,row.id)
 assert.equal(hash(source.demoArchive),baseline.archiveSha256)
 assert.equal(source.catalog.slice(0,30).filter(speciesPhoto).length,25)
})
test('only the documented ten exact accepted national species are appended, without taxonomic duplicates',()=>{
 assert.equal(added.length,10);assert.equal(source.catalog.length,40);assert.equal(source.catalog.length,30+proofs.length)
 assert.deepEqual(added.map(s=>s.id),proofs.map(s=>s.id));assert.equal(new Set(source.catalog.map(s=>s.id)).size,source.catalog.length)
 const allNames=source.catalog.map(s=>taxonNameKey(s.scientificName));assert.equal(new Set(allNames).size,allNames.length)
 for(const s of added){
  const p=proofs.find(p=>p.id===s.id)
  assert.equal(p.gbif.matchType,'EXACT');assert.equal(p.gbif.status,'ACCEPTED');assert.equal(p.gbif.rank,'SPECIES');assert.equal(p.gbif.canonicalName,s.scientificName)
  assert.equal(s.sources.find(r=>r.id==='gbif-match').taxonId,`gbif:${p.gbif.usageKey}`)
  assert.ok(!source.catalog.some(other=>other.id!==s.id&&taxonNameKey(other.scientificName).startsWith(taxonNameKey(s.scientificName)+' ')))
  assert.equal(s.nationalRedBook.listed,true);assert.equal(s.nationalRedBook.year,2006);assert.match(s.nationalRedBook.edition,/историческая/)
  assert.equal(s.sources.find(r=>r.id==='book-2006').url,`https://macrolepidoptera.ru/lnk/282.pdf#page=${p.bookPage}`)
 }
 assert.deepEqual(validateSource(source),[])
})
test('new scientific claims retain real citations, unknown population and country-only geography pending review',()=>{
 for(const s of added){
  assert.equal(s.verified,false);assert.equal(s.lastReviewedAt,null)
  assert.deepEqual(s.population,{type:'unknown',value:null,min:null,max:null,territory:null,year:null,unit:null,sourceIds:[],reviewStatus:'pending',method:null})
  assert.equal(s.regions.length,1);assert.equal(s.regions[0].code,'KG');assert.equal(s.regions[0].type,'country')
  for(const r of s.sources){assert.ok(['https:','http:'].includes(new URL(r.url).protocol));assert.ok(r.supports.length)}
  for(const field of CONTENT_FIELDS){const section=s.content[field];if(section)assert.ok(section.sourceIds.every(id=>s.sources.some(r=>r.id===id&&r.supports.includes(`content.${field}`))))}
  assert.equal(s.iucn.year,null)
  const proof=proofs.find(p=>p.id===s.id),matched=proof.iucnSearch.results.find(r=>r.key===proof.selectedIucnKey)
  if(s.iucn.category){
   assert.equal(matched.canonicalName,s.scientificName);assert.equal(matched.taxonomicStatus,'ACCEPTED');assert.equal(matched.rank,'SPECIES');assert.equal(s.sources.find(r=>r.id==='iucn-checklist').url,proof.iucnSearchUrl)
   assert.equal(s.iucn.category,({VULNERABLE:'VU',DATA_DEFICIENT:'DD',CRITICALLY_ENDANGERED:'CR',NEAR_THREATENED:'NT',ENDANGERED:'EN',LEAST_CONCERN:'LC'})[matched.threatStatuses[0]])
  }
  else assert.deepEqual(s.iucn.sourceIds,[])
 }
 assert.equal(added.find(s=>s.id==='kostychevs-pasque-flower').threats,null)
 assert.equal(added.find(s=>s.id==='vigorous-ground-beetle').content.reproduction,null)
 const reptile=added.find(s=>s.id==='said-alievs-toad-agama');assert.equal(reptile.taxonomy.class,'Reptilia');assert.equal(reptile.taxonomy.order,'Squamata')
})
test('research encounter counts remain separate from public population values and never acquire an invented observation year',async()=>{
 const notes=await read('data/research/catalog-40-population-notes.json')
 assert.equal(notes.reviewStatus,'pending');assert.equal(notes.records.length,9)
 for(const row of notes.records){
  assert.ok(added.some(s=>s.id===row.speciesId));assert.ok(row.limitations&&row.territory&&row.unit)
  assert.equal(source.catalog.find(s=>s.id===row.speciesId).population.type,'unknown')
  assert.equal(published.find(s=>s.id===row.speciesId).population.type,'unknown')
 }
 const dated=notes.records.filter(r=>r.year!==null);assert.deepEqual(dated.map(r=>r.year),[1992,1955,1992,2005])
 assert.ok(!notes.records.some(r=>r.year===2006))
})
test('four short translations, full Russian accounts and missing vernacular names use explicit honest fallbacks',()=>{
 for(const s of added){
  assert.deepEqual(Object.keys(s.content),CONTENT_FIELDS)
  assert.ok(s.content.overview.text.ru.split(/\s+/u).length>=150,s.id)
  assert.equal(s.names.uz,null);assert.ok(s.names.ky&&s.names.ru&&s.names.en)
  for(const language of LANGUAGES){
   const short=scientificContent(s.content.shortDescription.text,language)
   assert.equal(short.language,language);assert.equal(short.fallback,false);assert.ok(short.text.length>=120&&short.text.length<=180,`${s.id}.${language}`)
   const full=scientificContent(s.content.overview.text,language);assert.equal(full.language,'ru');assert.equal(full.fallback,language!=='ru')
  }
  const projected=published.find(p=>p.id===s.id);assert.deepEqual(projected.content,s.content);assert.deepEqual(projected.names,s.names)
 }
})
test('every new available name and Latin binomial is searchable; correct group filters and pagination include appended records',()=>{
 const index=createSearchIndex(published),catalog=useCatalog(ref(published))
 for(const s of added){
  for(const name of [...Object.values(s.names),s.scientificName].filter(Boolean))assert.ok(searchSpecies(index,name).some(r=>r.species.id===s.id),name)
  catalog.group.value=s.group;assert.ok(catalog.results.value.some(r=>r.species.id===s.id))
  assert.equal(speciesIdFromPath(speciesPath(s.id)),s.id)
 }
 const all=useCatalog(ref(published));while(all.page.value.remaining)all.more()
 assert.equal(all.page.value.entries.length,source.catalog.length);assert.equal(new Set(all.page.value.entries.map(r=>r.species.id)).size,source.catalog.length)
})
test('new reviewed photos retain exact provenance and their local/public WebP hashes; absent photos remain placeholders',async()=>{
 for(const s of added){
  assert.deepEqual(await inspectAssets(PROJECT_ROOT,s),[])
  const receipt=receipts.find(r=>r.candidateId===s.id),publicSpecies=published.find(p=>p.id===s.id)
  if(!s.images.length){assert.equal(receipt.status,'placeholder');assert.equal(speciesPhoto(publicSpecies),null);assert.equal(publicImageUrl(null),PLACEHOLDER);continue}
  assert.equal(receipt.visualReview.reviewed,true);assert.deepEqual(s.images[0],receipt.image)
  const reviewed=photos.candidates.find(r=>r.id===s.id),page=photos.commonsPages.find(r=>r.candidateId===s.id).page
  if(s.id==='giant-robber-fly'){
   const rights=await read('docs/evidence/catalog-40-robber-fly-rights.json')
   assert.equal(rights.observation.taxon.name,s.scientificName);assert.equal(rights.observation.photo.license_code,'cc-by')
   assert.equal(rights.occurrence.media[0].license,'http://creativecommons.org/licenses/by/4.0/')
   assert.equal(s.images[0].author,rights.occurrence.media[0].creator);assert.equal(s.images[0].license,'CC BY 4.0')
   assert.equal(s.images[0].originalPage,'https://www.inaturalist.org/photos/106836074')
   assert.throws(()=>checkCommonsMetadata(reviewed,page),/допуска/)
  }else{const meta=checkCommonsMetadata(reviewed,page);assert.equal(meta.author,s.images[0].author);assert.equal(meta.license,s.images[0].license)}
  for(const image of s.images){
   assert.equal(canPublishImage(image),true);const bytes=await readFile(new URL('../'+image.path,import.meta.url))
   assert.equal(digest(bytes),image.sha256);assert.deepEqual(webpMetadata(bytes),{width:image.width,height:image.height,privateMetadata:false})
   const projection=publicSpecies.images[0];assert.equal(digest(await readFile(new URL('../public'+projection.path,import.meta.url))),image.sha256)
   assert.equal(canPublishImage({...image,licenseVerified:false}),false)
   if(image.license.includes('SA'))assert.match(image.attribution,/той же лицензией/)
  }
 }
})
test('existing append-only importer adds the documented packet and repeating it is lossless',async()=>{
 const original={...source,catalog:source.catalog.slice(0,30)},packet=batch(added.map(entry))
 const initial=JSON.stringify(original),plan=await planBatchImport(original,packet,{validateAssets:s=>inspectAssets(PROJECT_ROOT,s)})
 assert.deepEqual(plan.counts,{processed:added.length,added:added.length,unchanged:0,rejected:0});assert.deepEqual(plan.proposedSource,source)
 assert.equal(JSON.stringify(original),initial)
 const repeat=await planBatchImport(source,packet);assert.deepEqual(repeat.counts,{processed:added.length,added:0,unchanged:added.length,rejected:0});assert.deepEqual(repeat.proposedSource,source)
 const duplicate=entry(added[0]);duplicate.species.id=duplicate.candidateId='duplicate-taxon'
 const rejected=await planBatchImport(source,batch([duplicate]));assert.equal(rejected.counts.rejected,1);assert.deepEqual(rejected.proposedSource,source)
})
test('import blocks parent/subspecies collisions and main, but permits the explicitly authorized feature branch',async()=>{
 for(const name of ['main','master','feature/unrelated',''])assert.equal(canApplyOnBranch(name),false)
 assert.equal(canApplyOnBranch('feature/species-content'),true);assert.equal(canApplyOnBranch('feature/catalog-expansion'),true)
 const subspecies=source.catalog.find(s=>s.id==='great-bustard'),parent=entry(subspecies)
 parent.candidateId=parent.species.id='parent-bustard';parent.species.scientificName='Otis tarda';parent.taxonomyEvidence.canonicalName='Otis tarda';parent.taxonomyEvidence.rank='SPECIES'
 parent.taxonomyEvidence.taxonId='gbif:999999';parent.species.sources.find(s=>s.id===parent.taxonomyEvidence.sourceId).taxonId='gbif:999999'
 const plan=await planBatchImport(source,batch([parent]));assert.equal(plan.counts.rejected,1);assert.match(plan.results[0].errors.join(' '),/вида\/подвида/);assert.deepEqual(plan.proposedSource,source)
})
test('CC0 official deed is accepted and canonicalized; wrong hosts and unrelated permission links are rejected',()=>{
 // Test URL normalization independently of editorial approval; the actual Commons
 // candidate is rejected because its author source carries a different licence.
 const candidate=structuredClone(photos.candidates.find(c=>c.id==='giant-robber-fly'))
 candidate.photoResearch.photo.rightsConfirmed=true;candidate.photoResearch.photo.eligibleForNextEditorialStage=true
 const page=photos.commonsPages.find(r=>r.candidateId===candidate.id).page
 assert.equal(checkCommonsMetadata(candidate,page).licenseUrl,'https://creativecommons.org/publicdomain/zero/1.0/')
 for(const url of ['https://example.org/publicdomain/zero/1.0/','https://creativecommons.org/licenses/by-nc/4.0/','https://creativecommons.org/publicdomain/zero/1.0/deed.en/evil']){
  const bad=structuredClone(page);bad.imageinfo[0].extmetadata.LicenseUrl.value=url;assert.throws(()=>checkCommonsMetadata(candidate,bad),/CC0/)
 }
})
test('actual Vue cards, modals and standalone pages render every new record in four interface languages without component changes',async()=>{
 const vite=await createServer({server:{middlewareMode:true,ws:false,hmr:false,watch:null},appType:'custom',logLevel:'error'})
 try{
  const {siteLanguage}=await vite.ssrLoadModule('/src/composables/useLocale.js')
  const components=await Promise.all(['SpeciesCard.vue','SpeciesModal.vue','SpeciesPage.vue'].map(async name=>(await vite.ssrLoadModule('/src/components/'+name)).default))
  for(const language of LANGUAGES){siteLanguage.value=language
   for(const s of published.slice(30))for(const [index,component]of components.entries()){
    const html=await renderToString(createSSRApp(component,{species:s}));assert.ok(html.includes(speciesPhoto(s)?.path||'placeholder.svg'),s.id)
    if(index>0)assert.ok(html.includes(s.scientificName));if(index===0)assert.ok(html.includes(s.content.shortDescription.text[language]))
    if(index===2)for(const p of s.content.overview.text.ru.split('\n\n'))assert.ok(html.includes(p))
    if(index>0){assert.ok(html.includes('macrolepidoptera.ru/lnk/282.pdf'));if(s.images.length)assert.ok(html.includes(s.images[0].originalPage.replaceAll('&','&amp;')))}
   }
  }
 }finally{await vite.close()}
})
