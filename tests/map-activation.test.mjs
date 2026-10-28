import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createServer } from 'vite'
import { REGIONS, validateRegionalEvidence, publicRegionalEvidence } from '../src/data/geography/model.js'
import { loadRegionalData, queryRegionalEntries } from '../src/data/geography/repository.js'
import { speciesPath, speciesIdFromPath } from '../src/data/species-routes.js'
import { historicalBytes } from './helpers/photo-amendment.mjs'
const read = async path => JSON.parse(await readFile(new URL('../'+path, import.meta.url)))
const species = await read('public/data/species.json'), evidence = await read('data/geography/occurrences.source.json')
const geometry = await read('public/data/geography/map.json'), published = await read('public/data/geography/occurrences.json')
const base = '43ff31186ea54eafdb6eec654c50828fb4c99eb3'
const old = path => historicalBytes(base, path)
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const clone = value => structuredClone(value)
const added = ['hedysarum-chaitocarpum','amygdalus-petunnikowii','sorbus-persica','tianschaniella-umbellifera']

test('map activation preserves every scientific object, archive, original image and license byte', async () => {
  const source = await read('data/species.source.json')
  assert.equal(source.catalog.length,184); assert.equal(source.demoArchive.length,2)
  assert.equal(source.catalog.filter(s=>s.images.length).length,161)
  const originalSource=JSON.parse(old('data/species.source.json'))
  assert.deepEqual(source,originalSource)
  assert.deepEqual(species,JSON.parse(old('public/data/species.json')))
  for (const item of source.catalog) for (const im of item.images) {
    const bytes=await readFile(new URL('../'+im.path,import.meta.url))
    assert.equal(hash(bytes),hash(old(im.path)),im.path)
    if(im.sha256)assert.equal(hash(bytes),im.sha256)
    assert.deepEqual(im,originalSource.catalog.find(s=>s.id===item.id).images.find(i=>i.path===im.path))
  }
  for(const item of species)for(const im of item.images)assert.equal(hash(await readFile(new URL('../public'+im.path,import.meta.url))),im.sha256)

})

test('four targeted new links preserve the two original records and do not admit private drafts', async () => {
  const original=JSON.parse(old('data/geography/occurrences.source.json'))
  assert.deepEqual(evidence.records.slice(0,2),original.records)
  assert.deepEqual(evidence.sources[0],original.sources[0])
  assert.deepEqual(evidence.records.slice(2).map(r=>r.speciesId),added)
  assert.equal(new Set(evidence.records.map(r=>r.speciesId+':'+r.regionId)).size,6)
  assert.deepEqual(validateRegionalEvidence(evidence,species),[])
  assert.deepEqual(published,publicRegionalEvidence(evidence))
  const research=await read('data/research/map-activation-evidence.json')
  assert.equal(research.independentReviewer,null);assert.equal(research.drafts.length,4)
  for(const d of research.drafts)assert.ok(!published.records.some(r=>r.speciesId===d.speciesId))
  assert.deepEqual(await read('data/research/first-batch-regions.json'),JSON.parse(old('data/research/first-batch-regions.json')))
  for(const r of evidence.records)assert.equal(r.reviewStatus,'documented_pending_review')
})

test('seven region selections and all group filters use only documented links', () => {
  for(const r of REGIONS){
    const expected=r.id==='jalal-abad'?5:r.id==='issyk-kul'?1:0
    assert.equal(queryRegionalEntries(published,species,{regionId:r.id}).length,expected)
    for(const group of ['mammals','birds','plants','fish','reptiles','amphibians','arthropods','fungi'])assert.equal(queryRegionalEntries(published,species,{regionId:r.id,group}).length,group==='plants'?expected:0)
  }
  assert.equal(queryRegionalEntries(published,species).length,6)
  assert.deepEqual(queryRegionalEntries(published,species,{regionId:'bishkek'}),[])
  assert.deepEqual(queryRegionalEntries(published,species,{query:'Panthera uncia'}),[])
})

test('regional search finds each evidenced species in KY UZ RU EN and Latin without inventing links', () => {
  for(const entry of queryRegionalEntries(published,species)){
    for(const name of [...Object.values(entry.species.names),entry.species.scientificName]){
      const results=queryRegionalEntries(published,species,{query:name})
      assert.ok(results.some(r=>r.species.id===entry.species.id),name)
      assert.ok(results.every(r=>published.records.some(p=>p.speciesId===r.species.id&&p.regionId===r.evidence.regionId)))
      assert.ok(queryRegionalEntries(published,species,{regionId:entry.evidence.regionId,query:name}).some(r=>r.species.id===entry.species.id))
    }
  }
  assert.deepEqual(queryRegionalEntries(published,species,{query:'no such species 12345'}),[])
})

test('single regional repository validates local transport and fails closed on missing or malformed data', async () => {
  const urls=[]
  const fetcher=async url=>{urls.push(url);return {ok:true,json:async()=>url.endsWith('map.json')?geometry:published}}
  const result=await loadRegionalData(species,{baseUrl:'/muras/',fetcher})
  assert.deepEqual(result,{geometry,evidence:published})
  assert.deepEqual(urls,['/muras/data/geography/map.json','/muras/data/geography/occurrences.json'])
  await assert.rejects(loadRegionalData(species,{fetcher:async()=>({ok:false,status:404})}),/HTTP 404/)
  await assert.rejects(loadRegionalData(species,{fetcher:async()=>({ok:true,json:async()=>({})})}),/Карта|Свидетельства/)
  const bad=clone(published);bad.records[0].sourceIds=['missing']
  assert.deepEqual(queryRegionalEntries(bad,species),[])
})

test('public projection excludes unverified evidence and reveals only an oblast, never collection points', () => {
  const copy=clone(evidence);copy.records[0].reviewStatus='unverified'
  const result=publicRegionalEvidence(copy)
  assert.equal(result.records.length,5)
  assert.ok(!result.records.some(r=>r.speciesId==='kaufmanns-tulip'))
  assert.ok(result.records.every(r=>r.localityPrecision==='oblast'))
  const bytes=JSON.stringify(published.records)
  assert.doesNotMatch(bytes,/Besh-Aral|Сары-Челек|Беш-Арал|control plot|latitude|longitude|coordinates|\d+\s*[°′″]|\b\d{2}\.\d{3,}\b/i)
  assert.equal(published.records.find(r=>r.speciesId==='tianschaniella-umbellifera').observationDate,'2000-07-20')
  assert.equal(published.sources.find(s=>s.id==='rbge-e00714915').year,null)
})

test('specimen safeguards reject wrong taxon, wrong oblast, invalid date and precise coordinates', () => {
  for(const mutate of [
    d=>{d.sources[1].taxonId='gbif:1'},d=>{d.sources[1].scientificName='Tianschaniella sp.'},
    d=>{d.sources[1].administrativeRegionId='chuy'},d=>{d.sources[1].catalogNumber=''},
    d=>{d.sources[1].latitude=42.12345},d=>{d.sources[1].locator='42.12345, 79.12345'},
    d=>{d.records[5].observationDate='2000-02-31'},d=>{d.records[5].observationDate='2001-07-20'},
    d=>{d.records[5].temporalContext='current'},d=>{d.records[5].precisionLimits='42°15′'},
  ]){const data=clone(evidence);mutate(data);assert.ok(validateRegionalEvidence(data,species).length)}
})

test('map-only locale changes preserve every unrelated translation from the baseline', async () => {
  for(const lang of ['ky','uz','ru','en']){
    const path=`src/locales/${lang}.json`,before=JSON.parse(old(path)),after=await read(path)
    for(const [key,value]of Object.entries(before))if(!['ui.m153','mapPreview.regionNoData'].includes(key))assert.equal(after[key],value,lang+':'+key)
    for(const key of Object.keys(after))if(!(key in before))assert.ok(key.startsWith('mapUI.'))
  }
})

test('regional panels render accessible search, groups, dated evidence, honest empty states and real routes in four languages', async () => {
  const vite=await createServer({server:{middlewareMode:true,ws:false,hmr:false,watch:null},appType:'custom',logLevel:'error'})
  try{
    const{siteLanguage}=await vite.ssrLoadModule('/src/composables/useLocale.js')
    const{tr}=await vite.ssrLoadModule('/src/locales/index.js')
    const Panel=(await vite.ssrLoadModule('/src/components/map/RegionPanel.vue')).default
    for(const language of ['ky','uz','ru','en']){
      siteLanguage.value=language
      for(const region of REGIONS){
        const entries=queryRegionalEntries(published,species,{regionId:region.id})
        const html=await renderToString(createSSRApp(Panel,{species,region,entries,unfilteredCount:entries.length}))
        assert.match(html,/id="map-species-search" type="search"/)
        assert.match(html,/aria-live="polite"/)
        if(!entries.length)assert.ok(html.includes(tr(language,'ui.m153')))
        for(const entry of entries){
          assert.ok(html.includes(`href="${speciesPath(entry.species.id)}"`))
          assert.equal(speciesIdFromPath(speciesPath(entry.species.id)),entry.species.id)
          assert.ok(html.includes('loading="lazy"'));assert.ok(html.includes('<time datetime='))
          assert.ok(html.includes(tr(language,'mapUI.historical')))
          for(const source of entry.sources)assert.ok(html.includes(source.url))
        }
      }
    }
    assert.equal(tr('ru','ui.m153'),'Подтверждённые региональные сведения пока отсутствуют')
    const MapSection=(await vite.ssrLoadModule('/src/components/map/MapSection.vue')).default
    const failure=await renderToString(createSSRApp(MapSection,{species:[],loading:false,error:'CATALOG_LOAD_FAILED'}))
    assert.ok(failure.includes('CATALOG_LOAD_FAILED'),'catalog failure must not be masked by waiting for regional validation')
    assert.ok(!failure.includes('class="catalog-message"'))
  }finally{await vite.close()}
})
