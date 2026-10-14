import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRenderer, defineComponent, h, nextTick, ref } from 'vue'
import { messages } from '../src/locales/index.js'
import { brandMetadata, applyBrandMetadata } from '../src/data/brand.js'
import { readLanguage, LOCALE_STORAGE_KEY } from '../src/data/localization.js'
import { readHistory, HISTORY_KEY } from '../src/data/quiz/history.js'
import { readWall, WALL_KEY } from '../src/data/support/wall.js'
import { syncLocaleMetadata, siteLanguage, provideContentLanguage, useLocale } from '../src/composables/useLocale.js'

function headDocument() {
  const elements=[]
  const createElement=()=>({attributes:{},setAttribute(key,value){this.attributes[key]=value},remove(){elements.splice(elements.indexOf(this),1)}})
  const match=selector=>{const [,attribute,key]=selector.match(/^meta\[(name|property)="([^"]+)"\]$/);return element=>element.attributes[attribute]===key}
  return { elements,createElement,documentElement:{lang:''},title:'',head:{appendChild(element){elements.push(element)}},
    querySelector(selector){return elements.find(match(selector))||null},querySelectorAll(selector){return elements.filter(match(selector))} }
}
const meta=(doc,attribute,key)=>doc.querySelector(`meta[${attribute}="${key}"]`)?.attributes.content

test('Muras branding is localized without renaming the thematic Red Book catalog',()=>{
  for(const language of ['ky','uz','ru','en']) {
    const value=brandMetadata(messages,language)
    assert.ok(value.title.startsWith('Muras — '));assert.ok(value.description.length>60)
    assert.equal(value.siteName,'Muras');assert.equal(value.themeColor,'#F7F8F4')
    assert.ok(brandMetadata(messages,language,{admin:true}).title.startsWith('Muras Admin — '))
    assert.ok(!Object.values(messages[language]).some(text=>/Redbook/i.test(text)))
  }
  assert.equal(messages.ky['ui.m017'],'Жаратылыш — биздин мурас')
  assert.equal(messages.ky['brand.caption'],'Мурас · Кыргызстан')
  assert.equal(messages.ru['ui.m015'],'Красная книга')
  assert.equal(messages.ky['ui.m016'],'Кызыл китеби')
})

test('all localized metadata updates consistently, including repeated switches and admin, without duplicate OG locales',()=>{
  const doc=headDocument()
  for(const language of ['ky','uz','en','ru','ky']) for(const admin of [false,true]) {
    const value=brandMetadata(messages,language,{admin});applyBrandMetadata(doc,value)
    assert.equal(doc.title,value.title);assert.equal(doc.documentElement.lang,language)
    assert.equal(meta(doc,'name','description'),value.description)
    assert.equal(meta(doc,'property','og:title'),value.title)
    assert.equal(meta(doc,'property','og:description'),value.description)
    assert.equal(meta(doc,'property','og:site_name'),'Muras')
    assert.equal(meta(doc,'property','og:locale'),value.locale)
    const alternate=doc.querySelectorAll('meta[property="og:locale:alternate"]').map(e=>e.attributes.content)
    assert.equal(new Set(alternate).size,3);assert.ok(!alternate.includes(value.locale))
    assert.equal(doc.querySelectorAll('meta[property="og:title"]').length,1)
    assert.equal(meta(doc,'property','og:url'),undefined);assert.equal(meta(doc,'property','og:image'),undefined)
  }
})

test('static first-visit HTML has matching Kyrgyz Muras metadata, an existing SVG favicon and no invented domain',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8'),value=brandMetadata(messages,'ky')
  assert.ok(html.includes('<html lang="ky">'));assert.ok(html.includes(`<title>${value.title}</title>`))
  for(const content of [value.description,value.siteName,value.locale,value.themeColor])assert.ok(html.includes(`content="${content}"`))
  assert.ok(!/og:url|og:image|rel="canonical"|Redbook/i.test(html))
  const icon=await readFile(new URL('../public/favicon.svg',import.meta.url),'utf8')
  assert.ok(html.includes('href="/favicon.svg"'));assert.ok(icon.includes('xmlns="http://www.w3.org/2000/svg"'))
  assert.ok(!/<script|<image|https?:\/\/(?!www.w3.org)/.test(icon))
  assert.equal(brandMetadata(messages,'invalid').language,'ky')
})

test('temporary card language does not change site or Open Graph metadata',async()=>{
  const oldDocument=globalThis.document;const doc=headDocument();globalThis.document=doc
  const node=type=>({type,children:[]})
  const renderer=createRenderer({createElement:node,createText:node,createComment:node,insert:(c,p)=>p.children.push(c),remove(){},setText(){},setElementText(){},patchProp(){},parentNode:()=>null,nextSibling:()=>null})
  const pin=ref('ru'),observed={}
  const Card=defineComponent({setup(){provideContentLanguage(pin);return()=>h(Child)}})
  const Child=defineComponent({setup(){const {language}=useLocale();return()=>{observed.card=language.value;return h('span')}}})
  siteLanguage.value='ky'
  const app=renderer.createApp(defineComponent({setup(){syncLocaleMetadata();return()=>h(Card)}}))
  try {
    app.mount(node('root'));assert.equal(observed.card,'ru');assert.equal(doc.documentElement.lang,'ky')
    siteLanguage.value='en';await nextTick();assert.equal(observed.card,'ru');assert.equal(doc.title,messages.en.pageTitle)
    pin.value='ky';await nextTick();assert.equal(doc.title,messages.en.pageTitle);assert.equal(meta(doc,'property','og:locale'),'en_GB')
  }finally{app.unmount();siteLanguage.value='ky';globalThis.document=oldDocument}
})

test('legacy language, quiz and support keys retain saved user data after the rebrand',()=>{
  const result={difficulty:'beginner',mode:'standard',total:6,correct:3,skipped:0,percent:50,completedAt:'2026-10-13T06:00:00.000Z'}
  const entry={id:'demo-1',alias:'Друг гор',speciesId:'irbis',createdAt:'2026-10-13T06:00:00.000Z'}
  const saved=new Map([['redbook.locale.v1','ru'],['redbook.quiz.results.v1',JSON.stringify({version:1,results:[result]})],['redbook.support.demo.v1',JSON.stringify({version:1,entries:[entry]})]])
  const storage={getItem:key=>saved.get(key)??null}
  assert.equal(LOCALE_STORAGE_KEY,'redbook.locale.v1');assert.equal(HISTORY_KEY,'redbook.quiz.results.v1');assert.equal(WALL_KEY,'redbook.support.demo.v1')
  assert.equal(readLanguage(storage),'ru');assert.deepEqual(readHistory(storage).results,[result]);assert.deepEqual(readWall(storage,['irbis']).entries,[entry])
  assert.equal(readLanguage({getItem:()=>null}),'ky')
})
