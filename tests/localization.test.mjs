import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createRenderer, defineComponent, h, nextTick, ref } from 'vue'
import { messages, tr } from '../src/locales/index.js'
import { LANGUAGES, LOCALE_STORAGE_KEY, localizedQuestion, localizedSource, readLanguage, saveLanguage, scientificContent, searchContentLanguage, validateSourceLocalization } from '../src/data/localization.js'
import { validateMessages, validateMessageReferences } from '../scripts/validate-locales.mjs'
import { createSearchIndex, searchSpecies } from '../src/data/catalog-search.js'
import { validateQuestions } from '../src/data/quiz/model.js'
import { useQuiz } from '../src/composables/useQuiz.js'
import { useCatalog } from '../src/composables/useCatalog.js'
import { provideContentLanguage, siteLanguage, useLocale } from '../src/composables/useLocale.js'
import { groupLabel, nationalStatus, regionFilterLabel, regionLabel, statusDetails } from '../src/data/presentation.js'
import { populationPresentation } from '../src/data/population.js'
const read = path => readFile(new URL(path, import.meta.url), 'utf8').then(JSON.parse)
const catalog = await read('../public/data/species.json'), bank = await read('../src/data/quiz/questions.json')
const memory = () => { const data = new Map(); return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) } }

test('first visit, missing/corrupt/blocked storage always use KY; saved RU/EN are restored', () => {
  const storage = memory()
  assert.equal(readLanguage(storage), 'ky')
  for (const lang of LANGUAGES) { assert.equal(saveLanguage(storage, lang), true); assert.equal(readLanguage(storage), lang) }
  storage.setItem(LOCALE_STORAGE_KEY,'kg'); assert.equal(readLanguage(storage),'ky')
  assert.equal(readLanguage(null),'ky')
  assert.equal(readLanguage({ getItem: () => { throw Error('blocked') } }),'ky')
  assert.equal(saveLanguage({ setItem: () => { throw Error('blocked') } }, 'en'),false)
  assert.equal(saveLanguage(storage,'la'),false)
})
test('all local dictionaries have complete matching keys and substitution parameters', () => {
  assert.deepEqual(validateMessages(messages),[])
  assert.ok(Object.keys(messages.ru).length >= 390)
  for(const lang of LANGUAGES) assert.equal(tr(lang,'ui.m035',{p0:9}).includes('9'),true)
  const copy=structuredClone(messages); delete copy.ky['ui.m009']; assert.ok(validateMessages(copy).length)
  copy.ky['ui.m009']='Каталог';copy.en['ui.m035']='Found {other}'; assert.ok(validateMessages(copy).some(e=>e.includes('параметры')))
})
test('real matched aliases determine modal language independently of the global site language', () => {
  const index=createSearchIndex(catalog)
  for(const global of LANGUAGES) for(const [query,language]of [['ирбис','ru'],['илбирс','ky'],['snow leopard','en'],['ilbirs','ky']]){
    const result=searchSpecies(index,query)[0]
    assert.equal(result.species.id,'irbis');assert.equal(searchContentLanguage(result,global),language)
  }
})
test('Latin, fuzzy, empty and equally matched language aliases retain the global language', () => {
  const index=createSearchIndex(catalog)
  for(const global of LANGUAGES) for(const query of ['Panthera uncia','ирбси',''])assert.equal(searchContentLanguage(searchSpecies(index,query)[0],global),global)
  const same=createSearchIndex([{...catalog[0],names:{ru:'Общее имя',ky:'Общее имя',en:null}}])
  const result=searchSpecies(same,'Общее имя')[0]
  assert.deepEqual(result.matchedLanguages,['ru','ky'])
  assert.equal(searchContentLanguage(result,'en'),'en')
})
test('Kyrgyz ө/ү/ң and stored translations remain distinct after locale changes', () => {
  const index=createSearchIndex(catalog)
  assert.equal(searchContentLanguage(searchSpecies(index,'бүркүт')[0],'ru'),'ky')
  assert.equal(searchSpecies(index,'буркут').some(r=>r.matchedName==='Бүркүт'),false)
})
test('scientific fallback exposes the actual language without changing content or inventing missing text', () => {
  assert.deepEqual(scientificContent({ru:'Исходный текст',ky:null},'en'),{text:'Исходный текст',language:'ru',fallback:true})
  assert.deepEqual(scientificContent(null,'ky'),{text:null,language:'und',fallback:false})
  assert.equal(scientificContent(catalog[0].habitat.description,'ky').fallback,false)
})
test('source language metadata accepts only reviewed explicit alternatives and never fabricates a URL', () => {
  const original={url:'https://example.org/original',title:'Original',language:'ru'}
  assert.equal(localizedSource(original,'ky').url,original.url)
  const source={...original,versions:{en:{url:'https://example.org/checked',title:'Checked',language:'en',verified:true}}}
  assert.deepEqual(validateSourceLocalization(source),[])
  assert.equal(localizedSource(source,'en').url,'https://example.org/checked')
  source.versions.en.verified=false
  assert.equal(localizedSource(source,'en').url,original.url)
  assert.ok(validateSourceLocalization(source).length)
  source.versions.en.verified=true;source.versions.en.url='javascript:alert(1)'
  assert.equal(localizedSource(source,'en').url,original.url)
  assert.ok(validateSourceLocalization(source).length)
  source.versions.en.url='https://'
  assert.equal(localizedSource(source,'en').url,original.url)
  source.versions.en.url='https://example.org/checked';source.versions.en.language='ky'
  assert.equal(localizedSource(source,'en').url,original.url)
  for(const species of catalog)for(const s of species.sources)for(const lang of LANGUAGES)assert.equal(localizedSource(s,lang).url,s.url)
})
test('all 18 questions retain answer/source/fact ids and four options in all languages', () => {
  assert.deepEqual(validateQuestions(bank,catalog),[])
  for(const q of bank)for(const lang of LANGUAGES){
    const localized=localizedQuestion(q,lang)
    assert.equal(localized.fallback,false);assert.equal(localized.language,lang)
    assert.equal(localized.id,q.id);assert.equal(localized.correctAnswerId,q.correctAnswerId)
    assert.deepEqual(localized.options.map(o=>o.id),q.options.map(o=>o.id))
    assert.deepEqual(localized.sourceIds,q.sourceIds);assert.deepEqual(localized.factPaths,q.factPaths)
    assert.deepEqual(localized.image,q.image)
  }
  const crossName=bank.find(q=>q.id==='beginner-saker-kyrgyz-name')
  assert.ok(localizedQuestion(crossName,'en').options.every(o=>o.language==='ru'))
})
test('quiz validator rejects translated answer mutations, missing ids and duplicated options', () => {
  for(const corrupt of [q=>q.translations.ky.correctAnswerId='wrong',q=>delete q.translations.en.options[q.correctAnswerId],q=>q.translations.ky.options[q.options[0].id]=q.translations.ky.options[q.options[1].id]]){
    const clone=structuredClone(bank);corrupt(clone[0]);assert.ok(validateQuestions(clone,catalog).length)
  }
  const q={...bank[0],translations:{}};assert.equal(localizedQuestion(q,'ky').fallback,true)
})
test('changing displayed quiz language preserves shuffled order, answer lock, score and progress', () => {
  const quiz=useQuiz(ref(bank),{storage:memory(),random:()=>0.3})
  quiz.start('beginner')
  const q=quiz.currentQuestion.value;quiz.answer(q.id,q.correctAnswerId)
  const saved=quiz.attempt.value
  for(const lang of LANGUAGES){
    const display=localizedQuestion(quiz.currentQuestion.value,lang)
    assert.equal(quiz.attempt.value,saved);assert.equal(quiz.currentAnswer.value.correct,true)
    assert.equal(quiz.progress.value,1);assert.deepEqual(display.options.map(o=>o.id),q.options.map(o=>o.id))
  }
  quiz.answer(q.id,q.options.find(o=>o.id!==q.correctAnswerId).id)
  assert.equal(quiz.currentAnswer.value.correct,true)
  quiz.next();assert.equal(quiz.attempt.value.index,1)
})
test('translated categories, regions and unknown population labels retain scientific codes and null data', () => {
  for(const lang of LANGUAGES){
    assert.ok(statusDetails(catalog[0],lang).label.includes('IUCN VU'))
    assert.ok(nationalStatus(catalog[0],lang).includes('2006'))
    assert.ok(groupLabel(catalog[0],lang))
    assert.ok(regionLabel('chuy',lang))
    assert.equal(regionFilterLabel('Кыргызстан',lang),tr(lang,'ui.m006'))
    const p=populationPresentation(catalog[0].population,catalog[0].sources,lang)
    assert.equal(p.value,null);assert.equal(p.label,tr(lang,'population.unknown'))
  }
})
test('locale changes do not invalidate catalog results or options, query and filter values', () => {
  const c=useCatalog(ref(catalog));c.query.value='ирбис';c.group.value='mammals'
  const results=c.results.value,options=c.options.value
  for(const lang of LANGUAGES){siteLanguage.value=lang;assert.equal(c.results.value,results);assert.equal(c.options.value,options);assert.equal(c.query.value,'ирбис');assert.equal(c.group.value,'mammals')}
  siteLanguage.value='ky'
})
test('Vue content-language context is isolated from the site and returns to the global locale after close', async () => {
  const node=type=>({type,children:[],text:''})
  const renderer=createRenderer({createElement:node,createText:text=>({...node('text'),text}),createComment:node,
    insert:(child,parent)=>parent.children.push(child),remove:()=>{},setText:(n,text)=>n.text=text,setElementText:(n,text)=>n.text=text,
    patchProp:()=>{},parentNode:()=>null,nextSibling:()=>null})
  const pin=ref('ru'),visible=ref(true),observed={}
  const Child=defineComponent({setup(){const {language,t}=useLocale();return()=>{observed.child=language.value;return h('p',t('ui.m009'))}}})
  const Modal=defineComponent({setup(){provideContentLanguage(pin);return()=>h(Child)}})
  const Root=defineComponent({setup(){const {language}=useLocale();return()=>{observed.site=language.value;return h('main',visible.value?[h(Modal)]:[h(Child)])}}})
  siteLanguage.value='ky';const app=renderer.createApp(Root);app.mount(node('root'))
  assert.deepEqual(observed,{site:'ky',child:'ru'})
  siteLanguage.value='en';await nextTick();assert.deepEqual(observed,{site:'en',child:'ru'})
  visible.value=false;pin.value=null;await nextTick();assert.equal(observed.child,'en')
  app.unmount();siteLanguage.value='ky'
})

test('validation catches missing literal UI keys before production build', async () => {
  const root=await mkdtemp(join(tmpdir(),'redbook-locales-'))
  try {
    await mkdir(join(root,'src'))
    await writeFile(join(root,'src','fixture.vue'), '<template>{{ t("missing.translation") }}</template>')
    assert.equal((await validateMessageReferences(root,new Set(Object.keys(messages.ru)))).length,1)
    await writeFile(join(root,'src','fixture.vue'), '<template>{{ t("ui.m009") }}</template>')
    assert.deepEqual(await validateMessageReferences(root,new Set(Object.keys(messages.ru))),[])
  } finally { await rm(root,{recursive:true,force:true}) }
})
