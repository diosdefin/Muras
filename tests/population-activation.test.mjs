import { POPULATION_PUBLICATION_BASE, POPULATION_PUBLICATION_FILES } from './helpers/population-publication-evolution.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createServer } from 'vite'
import { fixtures,sources } from './helpers/population-fixtures.mjs'
import { populationPresentation } from '../src/data/population.js'
import { historicalBytes } from './helpers/photo-amendment.mjs'
const BASE='029a89e00a136ab3d9edfe78d937082cf31c343d'
const read=async p=>JSON.parse(await readFile(new URL('../'+p,import.meta.url)))
const bytes=p=>readFile(new URL('../'+p,import.meta.url))
const hash=b=>createHash('sha256').update(b).digest('hex')

test('population adapter admits only validated approved estimates and preserves exact values and range endpoints',()=>{
 for(const key of ['unknown','pending','rejected','invalid']){
  const p=populationPresentation(fixtures[key],sources)
  assert.equal(p.type,'unknown');assert.equal(p.value,null);assert.equal(p.year,null);assert.deepEqual(p.sources,[])
 }
 const a=populationPresentation(fixtures.approximate,sources),r=populationPresentation(fixtures.range,sources),e=populationPresentation(fixtures.exact,sources)
 assert.match(a.label,/≈ 17/);assert.equal(a.type,'approximate')
 assert.match(r.label,/12–20/);assert.equal(r.value,null);assert.equal(r.min,12);assert.equal(r.max,20)
 assert.equal(e.value,17);assert.equal(e.year,2020);assert.equal(e.territory,fixtures.exact.territory);assert.deepEqual(e.sources,sources)
})

test('real visualization SSR defaults to full-colour photo and manual action in all four languages; unapproved fixtures have no Canvas',async()=>{
 const vite=await createServer({server:{middlewareMode:true,ws:false,hmr:false,watch:null},appType:'custom',logLevel:'error'})
 try{
  const Component=(await vite.ssrLoadModule('/src/components/SpeciesVisualization.vue')).default
  const{siteLanguage}=await vite.ssrLoadModule('/src/composables/useLocale.js')
  const{tr}=await vite.ssrLoadModule('/src/locales/index.js')
  const photo=(await read('public/data/species.json'))[0].images[0]
  for(const lang of ['ky','uz','ru','en']){
   siteLanguage.value=lang
   for(const [key,population] of Object.entries(fixtures)){
    const html=await renderToString(createSSRApp(Component,{photo,name:'Synthetic fixture',speciesId:key,population,sources}))
    assert.match(html,/data-mode="photo"/);assert.match(html,/aria-pressed="false"/)
    assert.ok(html.includes(tr(lang,'visualization.start')))
    assert.ok(!html.includes('visualization-unknown-label'))
    assert.ok(!html.includes('population-value'))
    assert.equal(html.includes('<canvas'),['exact','approximate','range'].includes(key))
    if(['exact','approximate','range'].includes(key))assert.match(html,/<canvas[^>]+width="0" height="0"/)
   }
   const empty=await renderToString(createSSRApp(Component,{name:'No photograph',population:fixtures.exact,sources}))
   assert.ok(empty.includes('placeholder.svg'));assert.match(empty,/<button[^>]+disabled/);assert.ok(!empty.includes('<canvas'))
  }
  // An unchecked type string must not be enough to unlock a numeric visualization.
  const unchecked=await renderToString(createSSRApp(Component,{photo,name:'Unchecked',populationType:'exact'}))
  assert.match(unchecked,/data-effect="unknown"/);assert.ok(!unchecked.includes('<canvas'))
 }finally{await vite.close()}
})

test('scientific records, images, licences, archive, adapter and all 208 regional links remain unchanged',async()=>{
 // New unpublished research is not a mutation of the activation baseline.
 // Existing protected paths still reject modifications, deletions or renames.
 const changes=execFileSync('git',['diff','--name-status','--no-renames',BASE,'--','data','assets','public','src/data/population.js','src/data/geography','src/data/species-model.js'],{encoding:'utf8'}).trim().split('\n').filter(Boolean)
 const allowedResearchAddition=line=>{
  const [status,path]=line.trim().split('\t')
  return status==='A'&&(path.startsWith('data/research/')||path==='data/.gitattributes')
 }
 assert.deepEqual(changes.filter(line=>!allowedResearchAddition(line)),[])
 // Attributes affect only these fingerprinted, unpublished research JSONs.
 const attributeRules=historicalBytes(POPULATION_PUBLICATION_BASE,'data/.gitattributes').toString('utf8').split(/\r?\n/).map(l=>l.trim()).filter(l=>l&&!l.startsWith('#'))
 assert.deepEqual(attributeRules,['research/population-184-evidence-audit.json text eol=lf','research/population-184-bulk-publication.json text eol=lf'])
 const source=await read('data/species.source.json'),evidence=await read('data/geography/occurrences.source.json')
 assert.deepEqual(source,JSON.parse(historicalBytes(BASE,'data/species.source.json')))
 assert.equal(source.catalog.length,184);assert.equal(source.demoArchive.length,2);assert.equal(source.catalog.filter(s=>s.images.length).length,161)
 assert.equal(evidence.records.length,208);assert.equal(new Set(evidence.records.map(r=>r.speciesId)).size,118)
 for(const [path,expected]of Object.entries({'data/species.source.json':'22cab3d3dbad13cb44343646081fbcf9880d9fe244956e694314e808e1593935','public/data/species.json':'8c87e8254851ad70ecafd256f6f8138a65d8181660b03abe20121233655ea532','data/geography/occurrences.source.json':'bc439cb62781cafdf632679f1a2d3d67f2af28d842099d72b6105c715eeecbba','public/data/geography/occurrences.json':'7789bdde826bcb60b5fbf7f9d392cd76019f95b091f8f37cadcda789e5103c91'}))assert.equal(hash(await bytes(path)),expected,path)
 for(const s of source.catalog)for(const im of s.images)assert.equal(hash(await bytes(im.path)),hash(historicalBytes(BASE,im.path)),im.path)
})

test('activation adds only three localized messages and leaves catalogue cards, map, lesson and global design unchanged',async()=>{
 for(const lang of ['ky','uz','ru','en']){
  const path=`src/locales/${lang}.json`,before=JSON.parse(historicalBytes(BASE,path)),after=JSON.parse(historicalBytes(POPULATION_PUBLICATION_BASE,path))
  for(const [key,value]of Object.entries(before))assert.equal(after[key],value,lang+':'+key)
  assert.deepEqual(Object.keys(after).filter(k=>!(k in before)).sort(),['visualization.restore','visualization.start','visualization.unknown'])
 }
 const stable=['src/App.vue','src/components/SpeciesCard.vue','src/components/lesson/LessonPhoto.vue','src/components/PopulationInfo.vue','src/data/visualization/environment.js','src/data/geography/repository.js']
 for(const p of stable)assert.deepEqual((POPULATION_PUBLICATION_FILES.has(p)?historicalBytes(POPULATION_PUBLICATION_BASE,p):await bytes(p)).toString('utf8').replace(/\r\n/g,'\n'),historicalBytes(BASE,p).toString('utf8'),p)
})
