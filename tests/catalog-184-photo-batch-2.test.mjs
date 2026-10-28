import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createServer } from 'vite'
import { PROJECT_ROOT } from '../scripts/build-data.mjs'
import { digest } from '../scripts/lib/research-pipeline.mjs'
import { validateSource, validateSpecies } from '../src/data/species-model.js'
import { createSearchIndex, searchSpecies, matchesCatalogFilters } from '../src/data/catalog-search.js'
import { paginateCatalog } from '../src/data/catalog-pagination.js'
import { speciesName } from '../src/data/presentation.js'
import { speciesPath, speciesIdFromPath } from '../src/data/species-routes.js'
import { photoBatch2, assertPhotoBatch2, assertBatch2Evidence, allPhotoAmendments, batch2Before } from './helpers/photo-batch-2.mjs'
const bytes = p => readFile(`${PROJECT_ROOT}/${p}`)
const source = JSON.parse(await bytes('data/species.source.json')), published = JSON.parse(await bytes('public/data/species.json')), journal = await photoBatch2()
const fresh = () => [structuredClone(source), structuredClone(published), structuredClone(journal)]

test('batch 2 appends precisely three evidenced images to the original 19 targets while preserving all 184 scientific objects and 158 prior image arrays', async () => {
  assert.equal((await allPhotoAmendments(source,published)).length,15)
  assert.equal(source.catalog.length,184);assert.equal(source.demoArchive.length,2)
  assert.equal(published.filter(s=>s.images.length).length,161);assert.equal(published.filter(s=>!s.images.length).length,23)
  assert.equal(journal.candidateIds.length,19);assert.equal(journal.counts.priorityB,4);assert.equal(journal.counts.priorityC,15)
  assert.deepEqual(validateSource(source),[]);assert.deepEqual(validateSpecies(published,'published',{publicData:true}),[])
  assert.equal(new Set(published.flatMap(s=>s.images.map(i=>i.sha256))).size,161)
  for(const id of ['iskandera-alaica','scutellaria-nepetoides','lonicera-paradoxa','centaurea-alaica','otonycteris-hemprichi','pike-asp','parnassius-loxias-tashkorensis'])assert.equal(source.catalog.find(s=>s.id===id).images.length,0)
})

test('second photo events cannot authorize scientific or archive changes by refreshing recorded fingerprints',async()=>{
  const[s,p,j]=fresh();s.catalog[0].verified=!s.catalog[0].verified
  await assert.rejects(assertPhotoBatch2(s,p,j),/scientific objects unchanged/)
  const archive=fresh();archive[0].demoArchive[0].scientificName+=' invalid'
  await assert.rejects(assertPhotoBatch2(...archive),/archive\/root unchanged/)
})

test('the second journal cannot replace an old nonempty image array, its rights or historical bytes',async()=>{
  const[s,p,j]=fresh();const old=batch2Before().catalog.find(s=>s.images.length)
  s.catalog.find(s=>s.id===old.id).images.push(structuredClone(j.records[0].image))
  await assert.rejects(assertPhotoBatch2(s,p,j),/historical source media immutable/)
  await assert.rejects(assertPhotoBatch2(...fresh(),async path=>path===old.images[0].path?Buffer.from('corrupt old photo'):bytes(path)),/image SHA-256/)
  const altered=fresh();altered[2].candidateIds[0]='iskandera-alaica'
  await assert.rejects(assertPhotoBatch2(...altered),/original 19 batch-2 taxa/)
})

test('all six new files reject corruption and even a valid substitute with refreshed checksums cannot rewrite the evidence',async()=>{
  for(const r of journal.records)for(const path of[r.image.path,`public/images/approved/${r.id}-1.webp`])await assert.rejects(assertPhotoBatch2(...fresh(),async p=>p===path?Buffer.from('corrupt new photo'):bytes(p)),/image SHA-256/)
  const[s,p,j]=fresh(),r=j.records[0],other=source.catalog.find(s=>s.id==='sorbaria-olgae').images[0],replacement=await bytes(other.path)
  for(const im of[r.image,s.catalog.find(s=>s.id===r.id).images[0],p.find(s=>s.id===r.id).images[0]]){im.sha256=other.sha256;im.width=other.width;im.height=other.height}
  r.finalWebPSha256=other.sha256;r.finalWebPBytes=replacement.length
  const paths=[r.image.path,`public/images/approved/${r.id}-1.webp`]
  await assert.rejects(assertPhotoBatch2(s,p,j,async path=>paths.includes(path)?replacement:bytes(path)),/immutable batch-2 evidence/)
})

test('new files require their own author, exact species or subspecies and original file-specific license, independent of refreshed metadata',()=>{
  for(const r of journal.records){
    const s=source.catalog.find(s=>s.id===r.id);assertBatch2Evidence(r,s)
    const noLicense=structuredClone(r);delete noLicense.rightsEvidence.photo.license_url;assert.throws(()=>assertBatch2Evidence(noLicense,s),/file-specific license URL/)
    const badRank=structuredClone(r);badRank.primaryEvidence.taxon.rank='genus';assert.throws(()=>assertBatch2Evidence(badRank,s))
    const wrongAuthor=structuredClone(r);wrongAuthor.image.author='Unverified third party';assert.throws(()=>assertBatch2Evidence(wrongAuthor,s))
    const repost=structuredClone(r);repost.rightsEvidence.photo.native_page_url='https://example.org/unverified';assert.throws(()=>assertBatch2Evidence(repost,s),/third-party repost/)
    const missing=structuredClone(r);missing.image.license='';missing.image.licenseVerified=false;assert.throws(()=>assertBatch2Evidence(missing,s),/explicit image license/)
  }
})

test('two complete photo-journal checks are deterministic and leave all tracked files unchanged',async()=>{
  const files=execFileSync('git',['ls-files','-z'],{cwd:PROJECT_ROOT,windowsHide:true}).toString().split('\0').filter(Boolean)
  const hashes=async()=>{const result={};for(const p of files)result[p]=digest(await bytes(p));return result}
  const before=await hashes(),first=await allPhotoAmendments(source,published),second=await allPhotoAmendments(source,published)
  assert.deepEqual(first,second);assert.deepEqual(await hashes(),before)
})

test('all 184 live records retain multilingual search, routes, filters and pagination, and the three new photos render credits in every detail view',async()=>{
  const index=createSearchIndex(published)
  assert.deepEqual(Array.from({length:8},(_,i)=>paginateCatalog(published,i+1).entries.length),[24,24,24,24,24,24,24,16])
  for(const s of published){assert.equal(speciesIdFromPath(speciesPath(s.id)),s.id);assert.ok(matchesCatalogFilters(s,{group:s.group}));for(const l of ['ky','uz','ru','en'])assert.ok(searchSpecies(index,speciesName(s,l)).some(r=>r.species.id===s.id))}
  const vite=await createServer({server:{middlewareMode:true,ws:false,hmr:false,watch:null},appType:'custom',logLevel:'error'})
  const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll("'",'&#39;')
  try{const{siteLanguage}=await vite.ssrLoadModule('/src/composables/useLocale.js');const components=await Promise.all(['SpeciesCard.vue','SpeciesModal.vue','SpeciesPage.vue'].map(async n=>(await vite.ssrLoadModule('/src/components/'+n)).default));for(const l of['ky','uz','ru','en']){siteLanguage.value=l;for(const r of journal.records){const s=published.find(s=>s.id===r.id);for(const[i,component]of components.entries()){const html=await renderToString(createSSRApp(component,{species:s}));assert.ok(html.includes(s.images[0].path));if(i>0)for(const text of[r.author,r.license,r.originalPage,r.licenseUrl])assert.ok(html.includes(escape(text)),`${s.id}.${l}: credit`)}}}}finally{await vite.close()}
})