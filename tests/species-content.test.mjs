import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {createSSRApp} from 'vue'
import {renderToString} from 'vue/server-renderer'
import {createServer} from 'vite'
import {CONTENT_FIELDS,emptyContent,validateContent,overviewPreview,contentParagraphs} from '../src/data/species-content.js'
import {LANGUAGES,scientificContent} from '../src/data/localization.js'
import {validateSource,validateSpecies} from '../src/data/species-model.js'
import {importSource,exportSource,editableShape,emptySpecies,setPath,claimPaths} from '../src/admin/data/model.js'
import {planBatchImport} from '../scripts/lib/bulk-import.mjs'
import {prepareResearchBatch} from '../scripts/prepare-research-batch.mjs'
import {legacyScientificSource} from './helpers/legacy-scientific-source.mjs'

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8').then(JSON.parse)
const source=await read('data/species.source.json'),published=await read('public/data/species.json')
const prepared=source.catalog.filter(s=>s.content)
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex')
const text=ru=>({ru,ky:null,uz:null,en:null})
const section=ru=>({text:text(ru),sourceIds:['book']})
const references=CONTENT_FIELDS.map(key=>`content.${key}`)
const refs=[{id:'book',supports:references}]

test('encyclopedia is optional for legacy/archive records; unknown and missing section shapes are rejected',()=>{
  assert.deepEqual(validateContent(undefined,[]),[]);assert.deepEqual(validateContent(null,[]),[])
  assert.deepEqual(validateContent(emptyContent(),[]),[])
  assert.deepEqual(validateContent({...emptyContent(),overview:section('Источник описывает этот организм.')},refs),[])
  for(const content of [[],false,{}, {...emptyContent(),habitat:null}, {...emptyContent(),overview:'wrong'}, {...emptyContent(),overview:{...section('Текст'),extra:1}}])assert.ok(validateContent(content,refs).length)
})
test('all four scientific language keys must be nullable/nonempty and at least one text is required',()=>{
  const content={...emptyContent(),overview:section('Текст')}
  for(const language of LANGUAGES){const copy=structuredClone(content);delete copy.overview.text[language];assert.ok(validateContent(copy,refs).length)}
  for(const value of ['',12,false,[],{}]){const copy=structuredClone(content);copy.overview.text.uz=value;assert.ok(validateContent(copy,refs).length)}
  content.overview.text=text(null);assert.ok(validateContent(content,refs).length)
  content.overview.text={...text('Текст'),xx:null};assert.ok(validateContent(content,refs).length)
})
test('every content citation must exist, be unique, and explicitly support that section',()=>{
  for(const sourceIds of [[],['missing'],['book','book'],[null],['book','unrelated']]){
    const content={...emptyContent(),overview:{text:text('Текст'),sourceIds}}
    assert.ok(validateContent(content,[...refs,{id:'unrelated',supports:['names.ru']}]).length)
  }
  const content={...emptyContent(),overview:section('Текст')}
  assert.ok(validateContent(content,[{id:'book',supports:['content.diet']}]).length)
  assert.ok(validateContent(content,{}).length)
  assert.ok(validateContent(content,[null]).length)
})
test('text length limits bound cards and imports without forcing unsubstantiated minimum content',()=>{
  assert.ok(validateContent({...emptyContent(),shortDescription:section('x'.repeat(301))},refs).length)
  assert.ok(validateContent({...emptyContent(),overview:section('x'.repeat(20001))},refs).length)
  assert.deepEqual(validateContent({...emptyContent(),overview:section('Краткий подтверждённый факт.')},refs),[])
})
test('all thirty records have real introductions, sourced overview and unchanged old scientific facts',()=>{
  assert.ok(source.catalog.length>=30);assert.equal(prepared.length,source.catalog.length)
  assert.deepEqual(prepared.map(s=>s.id),source.catalog.slice(0,prepared.length).map(s=>s.id))
  assert.equal(hash(legacyScientificSource({...source,catalog:source.catalog.slice(0,30)})),'52e69ac766a536e158d5b3ea0780db66c25f02944644de0871a9383fe85e2fb0')
  assert.deepEqual(validateSource(source),[]);assert.deepEqual(validateSpecies(published,'public',{publicData:true}),[])
  for(const s of prepared){
    assert.deepEqual(Object.keys(s.content),CONTENT_FIELDS)
    assert.ok(s.content.overview.text.ru.split(/\s+/u).length>=130,s.id)
    for(const language of LANGUAGES){const value=s.content.shortDescription.text[language];assert.equal(typeof value,'string');assert.ok(value.length>=120&&value.length<=180,`${s.id}.${language}: ${value.length}`)}
    assert.notEqual(s.content.shortDescription.text.ru,s.habitat?.description.ru,s.id)
    assert.equal(s.verified,false);assert.equal(s.population.type,'unknown')
    assert.deepEqual(validateContent(s.content,s.sources,s.id),[])
    const paragraphs=CONTENT_FIELDS.flatMap(field=>s.content[field]?.text.ru?.split(/\n\s*\n/u)||[])
    assert.equal(new Set(paragraphs).size,paragraphs.length,`Repeated paragraph: ${s.id}`)
    const projected=published.find(item=>item.id===s.id)
    assert.deepEqual(projected.content,s.content)
  }
})
test('all thirty records have honest four-language short texts and marked fallback for every longer section',()=>{
  for(const species of prepared){
    for(const language of LANGUAGES){
      const short=scientificContent(species.content.shortDescription.text,language)
      assert.equal(short.language,language);assert.equal(short.fallback,false)
      for(const field of CONTENT_FIELDS.filter(field=>field!=='shortDescription')){
        const section=species.content[field]
        if(!section)continue
        assert.equal(section.text[language],language==='ru'?section.text.ru:null)
        const selected=scientificContent(section.text,language)
        assert.equal(selected.language,'ru');assert.equal(selected.fallback,language!=='ru')
      }
    }
  }
})
test('poorly studied biology stays unknown rather than acquiring generic animal or fungal facts',()=>{
  const spider=prepared.find(s=>s.id==='relict-spider'),fungus=prepared.find(s=>s.id==='tien-shan-scutiger')
  assert.equal(spider.content.diet,null);assert.equal(spider.content.reproduction,null)
  assert.match(spider.content.overview.text.ru,/предположительно/)
  assert.equal(fungus.content.diet,null)
  assert.match(fungus.content.ecology.text.ru,/неизученной/)
  assert.match(fungus.content.reproduction.text.ru,/не описаны/)
  for(const s of prepared.filter(s=>['plants','fungi'].includes(s.group)))assert.equal(s.content.diet,null)
  for(const s of prepared.filter(s=>['central-asian-tortoise','central-asian-frog','predatory-bush-cricket','dalmatian-pelican','menzbiers-marmot','great-bustard'].includes(s.id)))assert.equal(s.content.appearance,null)
})
test('preview is the first overview paragraph, full page preserves both paragraphs and true fallback language',()=>{
  const s=prepared[0]
  assert.ok(s.content.overview.text.ru.includes('\n\n'))
  assert.equal(overviewPreview(s).ru,s.content.overview.text.ru.split('\n\n')[0])
  assert.equal(overviewPreview({}),null)
  for(const language of ['ky','uz','en']){
    assert.equal(scientificContent(overviewPreview(s),language).language,'ru')
    assert.equal(scientificContent(overviewPreview(s),language).fallback,true)
    assert.equal(contentParagraphs(s.content.overview,language).length,2)
    assert.equal(scientificContent(s.content.shortDescription.text,language).fallback,false)
  }
  assert.deepEqual(contentParagraphs(null,'uz'),[])
})
test('admin imports and exports enriched and legacy sources losslessly and edits only the chosen content path',()=>{
  for(const data of [source,legacyScientificSource({...source,catalog:source.catalog.slice(0,30)})]){
    const imported=importSource(JSON.stringify(data));assert.equal(editableShape(imported),true)
    assert.deepEqual(JSON.parse(exportSource(imported)),data)
  }
  const copy=setPath(source,['catalog',0,'content','overview','text','uz'],'Sinov')
  assert.equal(copy.catalog[0].content.overview.text.uz,'Sinov')
  assert.equal(source.catalog[0].content.overview.text.uz,null)
  assert.ok(claimPaths(source.catalog[0]).includes('content.reproduction'))
  assert.equal(emptySpecies('test-draft').content,null)
})
test('malformed encyclopedia blocks scientific import/export without an uncaught validator exception',()=>{
  for(const change of [s=>s.content.overview.sourceIds=['missing'],s=>s.content.overview.text={ru:'Text'},s=>s.content.overview.unexpected=true]){
    const copy=structuredClone(source);change(copy.catalog[0])
    assert.ok(validateSource(copy).length)
    assert.throws(()=>importSource(JSON.stringify(copy)),/admin.error.schema/)
    assert.throws(()=>exportSource(copy),/admin.error.export/)
  }
})
test('append-only batch import cannot overwrite new content with an old recipe',async()=>{
  const research=await read('data/research/catalog-candidates.json'),selection=await read('data/research/bulk-expansion-selection.json')
  const taxonomyEvidence=await read('docs/evidence/bulk-expansion-taxonomy.json'),imageEvidence=await read('docs/evidence/bulk-expansion-images.json')
  const packet=prepareResearchBatch(research,selection,{taxonomyEvidence,imageEvidence})
  const candidate=packet.records.find(r=>prepared.some(s=>s.id===r.candidateId)&&r.species)
  if(candidate){const plan=await planBatchImport(source,{...packet,records:[candidate]});assert.equal(plan.results[0].status,'rejected');assert.deepEqual(plan.proposedSource,source)}
})
test('real Vue card/modal/profile show their distinct texts, references, fallback and missing sections',async()=>{
  const vite=await createServer({server:{middlewareMode:true,ws:false,hmr:false,watch:null},appType:'custom',logLevel:'error'})
  try{
    const {siteLanguage}=await vite.ssrLoadModule('/src/composables/useLocale.js')
    const components={};for(const file of ['SpeciesCard.vue','SpeciesModal.vue','SpeciesPage.vue'])components[file]=(await vite.ssrLoadModule('/src/components/'+file)).default
    for(const language of LANGUAGES){siteLanguage.value=language;const s=published[0]
      const card=await renderToString(createSSRApp(components['SpeciesCard.vue'],{species:s}))
      assert.ok(card.includes(s.content.shortDescription.text[language]));assert.ok(!card.includes(s.habitat.description.ru))
      const modal=await renderToString(createSSRApp(components['SpeciesModal.vue'],{species:s}))
      assert.ok(modal.includes(overviewPreview(s).ru));assert.ok(!modal.includes(s.content.overview.text.ru.split('\n\n')[1]));assert.ok(modal.includes('Animal Diversity Web'))
      const page=await renderToString(createSSRApp(components['SpeciesPage.vue'],{species:s}))
      for(const paragraph of s.content.overview.text.ru.split('\n\n'))assert.ok(page.includes(paragraph))
      assert.ok(page.includes(s.content.diet.text.ru));assert.ok(page.includes(scientificContent(s.habitat.description,language).text))
      assert.ok(page.includes('profile-appearance'));assert.ok(page.includes('profile-reproduction'))
      assert.ok(page.includes('lang="ru"'))
    }
    siteLanguage.value='uz'
    const missing={...published[0],content:null}
    for(const Component of Object.values(components)){const html=await renderToString(createSSRApp(Component,{species:missing}));assert.ok(html.includes('Maʼlumot hali tasdiqlanmagan.'))}
    const Editor=(await vite.ssrLoadModule('/src/admin/components/SpeciesFields.vue')).default
    const html=await renderToString(createSSRApp(Editor,{species:source.catalog[0],tab:'description'}))
    for(const field of CONTENT_FIELDS)assert.ok(html.includes(source.catalog[0].content[field]?.text.ru||'lang="uz"'))
    assert.ok(html.includes('Ensiklopedik tavsif'));assert.ok(html.includes('sourceLanguage')===false)
    assert.ok(html.includes('lang="uz"'))
  }finally{await vite.close()}
})
