import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { ref, createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createServer } from 'vite'
import { validateSource, validateSpecies } from '../src/data/species-model.js'
import { availableGroups } from '../src/data/species-groups.js'
import { createSearchIndex, searchSpecies } from '../src/data/catalog-search.js'
import { scientificContent } from '../src/data/localization.js'
import { importSource, exportSource } from '../src/admin/data/model.js'
import { useCatalog } from '../src/composables/useCatalog.js'
import { useLesson } from '../src/composables/useLesson.js'
import { validateQuestions } from '../src/data/quiz/model.js'
import { regionalEntries } from '../src/data/geography/model.js'

const read = async p => JSON.parse(await readFile(new URL(`../${p}`, import.meta.url), 'utf8'))
const source = await read('data/species.source.json'), published = await read('public/data/species.json')
const research = await read('data/research/catalog-candidates.json')
const added = source.catalog.slice(9,17)
const firstBatchPublished = published.slice(0,17)
const expected = {
  'central-asian-tortoise': ['Testudo horsfieldii','reptiles','VU'],
  'central-asian-frog': ['Rana asiatica','amphibians','VU'],
  'predatory-bush-cricket': ['Saga pedo','arthropods','VU'],
  'dog-stinkhorn': ['Mutinus caninus','fungi',null],
  'marbled-polecat': ['Vormela peregusna','mammals','VU'],
  'black-stork': ['Ciconia nigra','birds','LC'],
  'ibisbill': ['Ibidorhyncha struthersii','birds','LC'],
  'eduards-fritillary': ['Fritillaria eduardii','plants',null],
}
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex')

test('first batch contains exactly eight documented taxa, preserves original nine and archived bytes logically', () => {
  assert.equal(source.catalog.slice(0,17).length, 17)
  assert.deepEqual(added.map(s=>s.id), Object.keys(expected))
  assert.equal(digest(source.catalog.slice(0,9)), '5b971eac79d862f1a34dda0099daf69ec83c55da71299cec9a4d321f8f5a033b')
  assert.equal(digest(source.demoArchive), 'e5d779d888e80970476120ae8da6e378e2408527d36484e61a083821f4df6a22')
  assert.equal(new Set(source.catalog.slice(0,17).map(s=>s.scientificName)).size, 17)
  assert.deepEqual(validateSource(source), [])
  assert.deepEqual(validateSpecies(published,'catalog',{publicData:true}), [])
  for (const s of added) assert.deepEqual([s.scientificName,s.group,s.iucn.category],expected[s.id])
  assert.deepEqual(Object.fromEntries(availableGroups(firstBatchPublished).map(g=>[g,firstBatchPublished.filter(s=>s.group===g).length])),
    { mammals:4,birds:5,plants:4,reptiles:1,amphibians:1,arthropods:1,fungi:1 })
})

test('historical national evidence is separate from global IUCN; no invented translations, population or editorial approval', () => {
  for (const s of added) {
    const c = research.candidates.find(c=>c.id===s.id)
    assert.equal(s.nationalRedBook.category,c.nationalRedBook.category)
    assert.equal(s.nationalRedBook.year,2006)
    assert.match(s.nationalRedBook.edition,/историческая/)
    assert.equal(s.verified,false); assert.equal(s.lastReviewedAt,null)
    assert.deepEqual(s.population,{type:'unknown',value:null,min:null,max:null,territory:null,year:null,unit:null,sourceIds:[],reviewStatus:'pending',method:null})
    assert.equal(s.iucn.year,null)
    assert.deepEqual(s.regions.map(r=>r.code),['KG'])
    assert.deepEqual(s.habitat.description,c.habitat.description)
    for (const language of ['ky','en']) {
      assert.deepEqual(scientificContent(s.habitat.description,language),{text:c.habitat.description.ru,language:'ru',fallback:true})
      for (const m of [...s.threats,...s.conservationMeasures]) assert.equal(m.text[language],null)
    }
    for (const m of s.conservationMeasures) assert.match(m.text.ru,/^Рекомендации издания 2006 года:/)
    for (const [language,ids] of Object.entries(c.nameSourceIds)) for (const id of ids) {
      assert.ok(s.sources.find(source=>source.id===id)?.supports.includes(`names.${language}`))
    }
  }
  const tortoise=added[0]
  assert.equal(tortoise.taxonomy.class,'Reptilia'); assert.equal(tortoise.taxonomy.order,'Testudines')
  assert.ok(tortoise.sources.find(s=>s.id==='iucn-query').supports.includes('taxonomy.class'))
  assert.match(tortoise.sources.find(s=>s.id==='gbif-match').notes,/Agrionemys horsfieldi/)
})

test('expanded admin import/export is lossless and seven public groups filter real records; names are searchable in four scripts', () => {
  assert.deepEqual(JSON.parse(exportSource(importSource(JSON.stringify(source)))),source)
  const index = createSearchIndex(published), state = useCatalog(ref(firstBatchPublished))
  assert.equal(state.page.value.entries.length,12); assert.equal(state.page.value.remaining,5)
  state.more(); assert.equal(state.page.value.entries.length,17); assert.equal(state.page.value.remaining,0)
  for (const group of availableGroups(firstBatchPublished)) {
    state.group.value=group
    assert.ok(state.results.value.length>0); assert.ok(state.results.value.every(r=>r.species.group===group))
  }
  for (const s of added) for (const name of [...Object.values(s.names),s.scientificName]) {
    assert.ok(searchSpecies(index,name).some(r=>r.species.id===s.id))
  }
  const lesson=useLesson(ref(firstBatchPublished)), visited=[]
  for(let n=0;n<17;n++){visited.push(lesson.current.value.id);lesson.next()}
  assert.deepEqual(visited,firstBatchPublished.map(s=>s.id)); assert.equal(lesson.current.value.id,published[0].id)
})

test('regional drafts stay private and never become map results; unchanged quiz still has 18 valid questions', async () => {
  const drafts=await read('data/research/first-batch-regions.json'), evidence=await read('data/geography/occurrences.source.json')
  assert.equal(drafts.notForPublication,true); assert.equal(drafts.records.length,2)
  assert.deepEqual(drafts.records.map(r=>r.regionId),['issyk-kul','talas'])
  for(const r of drafts.records){assert.equal(r.reviewStatus,'pending');assert.equal(r.publicationApproved,false);assert.equal(r.localityPrecision,'oblast')}
  assert.equal(evidence.records.length,2)
  for(const id of ['issyk-kul','talas','jalal-abad']) assert.ok(!regionalEntries(evidence,published,id).some(r=>Object.hasOwn(expected,r.species.id)))
  const questions=await read('src/data/quiz/questions.json')
  assert.equal(questions.length,18);assert.deepEqual(validateQuestions(questions,published),[])
  assert.ok(!questions.some(q=>Object.hasOwn(expected,q.speciesId)))
})

test('eight approved WebP originals have matching local public bytes, fingerprints and reusable CC licences', async () => {
  for(const s of added){
    const p=s.images[0], publicPhoto=published.find(r=>r.id===s.id).images[0]
    const bytes=await readFile(new URL(`../${p.path}`,import.meta.url))
    assert.equal(bytes.subarray(0,4).toString(),'RIFF'); assert.equal(bytes.subarray(8,12).toString(),'WEBP')
    assert.equal(createHash('sha256').update(bytes).digest('hex'),p.sha256)
    assert.ok(bytes.equals(await readFile(new URL(`../public${publicPhoto.path}`,import.meta.url))))
    assert.equal(Math.max(p.width,p.height),1800)
    assert.equal(p.licenseVerified,true);assert.match(p.license,/^CC BY(?:-SA)? [234]\.0$/)
    assert.match(p.originalPage,/^https:\/\/commons.wikimedia.org\/wiki\/File:/)
    assert.match(p.licenseUrl,/^https?:\/\/creativecommons.org\/licenses\/by(?:-sa)?\//)
    assert.ok(p.attribution.includes(p.author)&&p.attribution.includes(p.license))
    assert.ok(p.modifications.some(m=>m.includes('EXIF')))
    if(p.license.includes('SA'))assert.match(p.attribution,/той же лицензией/)
  }
})

test('all eight render card, lesson, modal, sources and an honest Russian scientific fallback in KY/RU/EN', async () => {
  const vite=await createServer({server:{middlewareMode:true,ws:false,hmr:false,watch:null},appType:'custom',logLevel:'error'})
  try {
    const {siteLanguage}=await vite.ssrLoadModule('/src/composables/useLocale.js')
    const components={}
    for(const file of ['SpeciesCard.vue','SpeciesModal.vue','lesson/LessonPhoto.vue']) components[file]=(await vite.ssrLoadModule(`/src/components/${file}`)).default
    for(const language of ['ky','ru','en']){
      siteLanguage.value=language
      for(const s of published.slice(9,17)){
        const card=await renderToString(createSSRApp(components['SpeciesCard.vue'],{species:s}))
        assert.ok(card.includes(s.scientificName));assert.ok(card.includes(s.images[0].path));assert.ok(card.includes('lang="ru"'))
        for(const file of ['SpeciesModal.vue','lesson/LessonPhoto.vue']){
          const html=await renderToString(createSSRApp(components[file],{species:s}))
          assert.ok(html.includes(s.images[0].license));assert.ok(html.includes(s.images[0].author));assert.ok(html.includes(s.images[0].path))
        }
      }
    }
    const missing={...published[9],images:[]}
    for(const file of Object.keys(components)) assert.match(await renderToString(createSSRApp(components[file],{species:missing})),/placeholder\.svg/)
  } finally { await vite.close() }
})
