import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createServer } from 'vite'
import { PROJECT_ROOT } from '../scripts/build-data.mjs'
import { digest, fingerprint, candidateFingerprint } from '../scripts/lib/research-pipeline.mjs'
import { createLocalAdapter } from '../scripts/lib/local-research-adapter.mjs'
import { runPipeline } from '../scripts/bulk-pipeline.mjs'
import { validateSource, validateSpecies, canPublishImage } from '../src/data/species-model.js'
import { webpMetadata, canApplyOnBranch } from '../scripts/import-species-batch.mjs'
import { LANGUAGES, scientificContent } from '../src/data/localization.js'
import { UNKNOWN_POPULATION } from '../src/data/population.js'
import { speciesName, speciesPhoto } from '../src/data/presentation.js'
import { createSearchIndex, searchSpecies, matchesCatalogFilters, catalogOptions } from '../src/data/catalog-search.js'
import { paginateCatalog, prioritizeIllustratedResults } from '../src/data/catalog-pagination.js'
import { speciesPath, speciesIdFromPath } from '../src/data/species-routes.js'
import { importSource, MAX_JSON_BYTES } from '../src/admin/data/model.js'

const bytes=p=>readFile(`${PROJECT_ROOT}/${p}`)
const read=async p=>JSON.parse(await bytes(p))
const source=await read('data/species.source.json'),published=await read('public/data/species.json')
const before=await read('data/backups/catalog-184/species.source.json')
const beforePublic=await read('data/backups/catalog-184/public-species.json')
const baseline=await read('data/backups/catalog-184/baseline.json')
const manifestPath='data/research/catalog-187-review-manifest.json',manifest=await read(manifestPath),registry=await read(manifest.registry)
const decision=await read('data/research/publication-decisions/muras-25-11-owner-provisional.json')
const additions=source.catalog.slice(178),publicAdditions=published.slice(178)
const held=['papilio-alexanor-voldemar','megalodontes-kuznetzovi','polochrum-pamirepandum']
const ids=["sorbaria-olgae","dorema-microcarpum","tianschaniella-umbellifera","parnassius-loxias-tashkorensis","parnassius-apollo-merzbacheri","cuon-alpinus"]


test('catalog 184 preserves all prior 178 objects, archive, assets and research and imports exactly the authorized 6',async()=>{
 assert.equal(before.catalog.length,178);assert.equal(beforePublic.length,178)
 assert.equal(source.catalog.length,184);assert.equal(published.length,184)
 assert.deepEqual(source.catalog.slice(0,178),before.catalog)
 assert.deepEqual(published.slice(0,178),beforePublic)
 assert.deepEqual({...source,catalog:null},{...before,catalog:null})
 assert.deepEqual(additions.map(s=>s.id),ids);assert.deepEqual(manifest.candidateIds,ids)
 assert.deepEqual(publicAdditions.map(s=>s.id),ids)
 assert.equal(new Set([...source.catalog,...source.demoArchive].map(s=>s.id)).size,186)
 assert.equal(new Set(source.catalog.map(s=>s.scientificName.normalize('NFKC').toLowerCase())).size,184)
 assert.deepEqual(validateSource(source),[])
 assert.deepEqual(validateSpecies(published,'published',{publicData:true}),[])
 assert.equal(digest(await bytes(manifestPath)),'ea602571d211f948738d5016c70fd235f01d211b144e324687764a99906922f7')
 assert.equal(fingerprint(registry),'e464a27088b435607d373d58154fff1fcb385ad55ba3d294765c17384c4800e6')
 assert.equal(decision.manifestSha256,digest(await bytes(manifestPath)))
 assert.equal(decision.registryFingerprint,fingerprint(registry));assert.equal(decision.scientificApproval,null)
 assert.deepEqual(decision.records.map(r=>r.id),ids)
 for(const id of held){
  assert.ok(!source.catalog.some(s=>s.id===id));assert.ok(!published.some(s=>s.id===id))
  assert.ok(!manifest.candidateIds.includes(id));assert.equal(registry.candidates.find(c=>c.id===id).state,'needs_evidence')
 }
 const adapter=createLocalAdapter(PROJECT_ROOT)
 for(const [i,s]of additions.entries()){
  const{publication,...science}=s,entry=manifest.candidates[i],record=decision.records[i]
  assert.deepEqual(science,await read(entry.draftFile))
  assert.equal(digest(await bytes(entry.draftFile)),entry.draftSha256)
  const c=registry.candidates.find(c=>c.id===s.id)
  assert.equal(candidateFingerprint(c,await adapter.load(c)),entry.checkedFingerprint)
  assert.equal(c.approval,null);assert.equal(c.scientificReviewStatus,'pending')
  assert.equal(s.verified,false);assert.equal(s.lastReviewedAt,null)
  assert.deepEqual(s.population,UNKNOWN_POPULATION)
  assert.equal(s.nationalRedBook.year,2006);assert.match(s.nationalRedBook.edition,/историческ/)
  assert.deepEqual(s.iucn,{category:null,year:null,sourceIds:[]})
  assert.equal(publication.status,'provisional');assert.equal(publication.scientificReviewStatus,'pending')
  assert.equal(publication.independentReviewer,null);assert.equal(publication.decisionId,decision.decisionId)
  assert.equal(publication.publishedAt,'2026-10-28');assert.equal(publication.researchFingerprint,entry.checkedFingerprint)
  assert.equal(record.fingerprint,entry.checkedFingerprint);assert.equal(record.draftSha256,entry.draftSha256)
  assert.equal(record.ownerRole,'project_owner');assert.equal(record.date,'2026-10-28')
  assert.ok(record.reason.includes(decision.manifestSha256));assert.ok(record.reason.includes(decision.registryFingerprint))
  assert.match(record.reason,/№25\.11/);assert.match(record.reason,/pending/)
  assert.equal(record.independentReviewer,null);assert.equal(record.scientificReviewStatus,'pending')
  for(const language of LANGUAGES){assert.ok(s.names[language]);assert.ok(s.content.shortDescription.text[language])}
  for(const language of ['ky','uz','en']){
   const fallback=scientificContent(s.content.overview.text,language)
   assert.equal(fallback.language,'ru');assert.equal(fallback.fallback,true)
  }
 }
 // Only catalog outputs and the previous live-release test become different old files.
 const allowed=new Set(['data/species.source.json','public/data/species.json','tests/catalog-178-publication.test.mjs'])
 for(const f of baseline.files)if(!allowed.has(f.path))assert.equal(digest(await bytes(f.path)),f.sha256,f.path)
 assert.equal(canApplyOnBranch('feature/catalog-200'),true)
 for(const branch of ['main','master','feature/catalog-201','feature/unrelated'])assert.equal(canApplyOnBranch(branch),false)
})

test('184 live records have complete pagination, four-language search, routes, filters and unchanged licensed assets',async()=>{
 assert.equal(additions.reduce((n,s)=>n+s.images.length,0),1)
 assert.equal(publicAdditions.reduce((n,s)=>n+s.images.length,0),1)
 assert.equal(publicAdditions.filter(s=>!s.images.length).length,5)
 for(const ordered of [published,prioritizeIllustratedResults(published,s=>Boolean(speciesPhoto(s)))]){
  const pages=Array.from({length:8},(_,n)=>paginateCatalog(ordered,n+1))
  assert.deepEqual(pages.map(p=>p.entries.length),[24,24,24,24,24,24,24,16])
  assert.deepEqual(pages.flatMap(p=>p.entries).map(s=>s.id),ordered.map(s=>s.id))
  assert.equal(new Set(pages.flatMap(p=>p.entries).map(s=>s.id)).size,184)
 }
 const index=createSearchIndex(published),options=catalogOptions(published),hashes=new Set()
 for(const s of published){
  assert.equal(speciesIdFromPath(speciesPath(s.id)),s.id)
  for(const language of LANGUAGES)assert.ok(searchSpecies(index,speciesName(s,language)).some(r=>r.species.id===s.id),`${s.id}.${language}`)
  for(const im of s.images){
   const data=await bytes(`public${im.path}`)
   assert.equal(digest(data),im.sha256)
   assert.deepEqual(webpMetadata(data),{width:im.width,height:im.height,privateMetadata:false})
   assert.ok(!hashes.has(im.sha256),`duplicate photo ${s.id}`);hashes.add(im.sha256)
  }
 }
 assert.equal(hashes.size,146)
 for(const s of publicAdditions){
  const status=s.iucn.category||'UNKNOWN'
  assert.ok(options.groups.some(o=>o.value===s.group));assert.ok(options.statuses.some(o=>o.value===status))
  assert.ok(matchesCatalogFilters(s,{group:s.group,status,region:'Кыргызстан'}))
  assert.equal(matchesCatalogFilters(s,{group:s.group==='birds'?'plants':'birds'}),false)
  assert.equal(matchesCatalogFilters(s,{region:'Unrelated region'}),false)
  for(const im of s.images){
   assert.ok(canPublishImage(im));assert.ok(im.attribution.includes(im.author));assert.ok(im.attribution.includes(im.license))
   const original=additions.find(x=>x.id===s.id).images[0]
   assert.equal(digest(await bytes(original.path)),im.sha256)
   assert.equal(im.originalPage,original.originalPage);assert.equal(im.licenseUrl,original.licenseUrl)
  }
 }
})

test('all 6 imported cards, modals and pages render photos or placeholders and pending in KY UZ RU EN',async()=>{
 const vite=await createServer({server:{middlewareMode:true,ws:false,hmr:false,watch:null},appType:'custom',logLevel:'error'})
 const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll("'",'&#39;')
 try{
  const{siteLanguage}=await vite.ssrLoadModule('/src/composables/useLocale.js')
  const components=await Promise.all(['SpeciesCard.vue','SpeciesModal.vue','SpeciesPage.vue'].map(async name=>(await vite.ssrLoadModule('/src/components/'+name)).default))
  const{tr}=await vite.ssrLoadModule('/src/locales/index.js')
  for(const language of LANGUAGES){
   siteLanguage.value=language
   for(const s of publicAdditions)for(const[n,component]of components.entries()){
    const html=await renderToString(createSSRApp(component,{species:s}))
    assert.ok(html.includes(speciesPhoto(s)?.path||'placeholder.svg'),`${s.id}.${language}.${n}`)
    if(n>0&&s.images.length)for(const value of[s.images[0].author,s.images[0].license,s.images[0].originalPage])assert.ok(html.includes(escape(value)),`${s.id}.${language}: credits`)
    if(n>0){assert.ok(html.includes(escape(tr(language,'ui.m243'))),`${s.id}.${language}: pending`);assert.ok(html.includes('2006'))}
   }
  }
 }finally{await vite.close()}
})

test('replaying the actual owner decision is read-only and returns zero additions and 6 unchanged',async()=>{
 const beforeSource=digest(await bytes('data/species.source.json')),beforeRegistry=fingerprint(registry)
 const result=await runPipeline(PROJECT_ROOT,['provisional','--registry',manifest.registry,'--manifest',manifestPath,
  '--mode','dry-run','--owner-role','project_owner','--decision-id',decision.decisionId,'--date','2026-10-28','--reason',decision.records[0].reason])
 assert.deepEqual(result.counts,{processed:6,added:0,unchanged:6,rejected:0})
 assert.equal(result.applied,false);assert.equal(result.scientificApproval,null)
 assert.equal(digest(await bytes('data/species.source.json')),beforeSource)
 assert.equal(fingerprint(await read(manifest.registry)),beforeRegistry)
})

test('the existing bounded admin importer accepts the 184-record source with no model changes',async()=>{
 const data=await bytes('data/species.source.json')
 assert.ok(data.length<MAX_JSON_BYTES)
 assert.deepEqual(importSource(data.toString('utf8')),source)
})