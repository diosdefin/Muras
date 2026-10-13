import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir, mkdtemp, cp, rm } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { createSSRApp, createRenderer, defineComponent, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createServer } from 'vite'
import { generateAllData, PROJECT_ROOT } from '../scripts/build-data.mjs'
import { validateSource, canPublishImage } from '../src/data/species-model.js'
import { createDraftRepository } from '../src/admin/data/repository.js'
import { useAdminEditor } from '../src/admin/useAdminEditor.js'
import { imageComposition, compositionCrop } from '../src/data/image-composition.js'
import { renderFrame } from '../src/data/visualization/engine.js'

test('admin import → composition edits → persisted draft → export → full generator → public previews preserves source/archive and original photo bytes',async()=>{
  const text=await readFile(join(PROJECT_ROOT,'data/species.source.json'),'utf8'),source=JSON.parse(text)
  const root=await mkdtemp(join(tmpdir(),'muras-release-'))
  const memory=new Map(),repository=createDraftRepository({getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value)})
  const node=type=>({type,children:[]})
  const renderer=createRenderer({createElement:node,createText:node,createComment:node,insert:(c,p)=>p.children.push(c),remove(){},setText(){},setElementText(){},patchProp(){},parentNode:()=>null,nextSibling:()=>null})
  const oldWindow=globalThis.window;globalThis.window={addEventListener(){},removeEventListener(){}}
  let editor,vite
  const app=renderer.createApp(defineComponent({setup(){editor=useAdminEditor({repository,delay:10000});return()=>h('div')}}))
  app.mount(node('root'))
  try{
    assert.equal(await editor.importText(text,true),true)
    editor.selectedIndex.value=editor.document.value.catalog.findIndex(s=>s.id==='irbis')
    const photoIndex=editor.current.value.images.findIndex(canPublishImage)
    const compositions={card:{x:.4,y:.6,zoom:1.2},detail:{x:.45,y:.5,zoom:1.4},lesson:{x:.5,y:.55,zoom:1.1}}
    for(const [view,value]of Object.entries(compositions))editor.update(['images',photoIndex,'compositions',view],value)
    assert.equal(await editor.save(),true)
    const restored=repository.load();assert.deepEqual(restored.current.catalog[0].images[photoIndex].compositions,compositions)
    const exported=await editor.exportText(),document=JSON.parse(exported)
    assert.deepEqual(validateSource(document),[]);assert.deepEqual(document.demoArchive,source.demoArchive)
    const scientificCopy=structuredClone(document);delete scientificCopy.catalog[0].images[photoIndex].compositions
    assert.deepEqual(scientificCopy,source)
    await mkdir(join(root,'data'),{recursive:true});await writeFile(join(root,'data/species.source.json'),exported)
    await cp(join(PROJECT_ROOT,'data/geography'),join(root,'data/geography'),{recursive:true})
    await mkdir(join(root,'src/data/quiz'),{recursive:true});await cp(join(PROJECT_ROOT,'src/data/quiz/questions.json'),join(root,'src/data/quiz/questions.json'))
    for(const species of source.catalog)for(const image of species.images.filter(canPublishImage)){
      await mkdir(dirname(join(root,image.path)),{recursive:true});await cp(join(PROJECT_ROOT,image.path),join(root,image.path))
    }
    const result=await generateAllData(root);await generateAllData(root,{check:true})
    assert.equal(result.questionCount,18);assert.equal(result.regionCount,7)
    assert.deepEqual(result.archive,source.demoArchive)
    const publicSpecies=result.catalog.find(s=>s.id==='irbis'),photo=publicSpecies.images[0]
    assert.deepEqual(photo.compositions,compositions)
    const original=source.catalog[0].images[photoIndex]
    assert.ok((await readFile(join(root,'public',photo.path))).equals(await readFile(join(PROJECT_ROOT,original.path))))
    const ctx={filter:'none',clearRect(){},drawImage(...args){this.crop=args.slice(1,5)}}
    const canvas={width:0,height:0,getContext:()=>ctx},scratch={getContext:()=>ctx}
    renderFrame(canvas,scratch,{naturalWidth:original.width,naturalHeight:original.height},1,{width:400,height:300},1,{composition:imageComposition(photo),effect:'unknown'})
    const crop=compositionCrop(original.width,original.height,4/3,compositions.detail)
    assert.deepEqual(ctx.crop,[crop.x,crop.y,crop.width,crop.height])
    vite=await createServer({server:{middlewareMode:true,ws:false,hmr:false,watch:null},appType:'custom',logLevel:'error'})
    for(const [file,view]of [['SpeciesCard.vue','card'],['SpeciesVisualization.vue','detail'],['lesson/LessonPhoto.vue','lesson']]){
      const {default:Component}=await vite.ssrLoadModule(`/src/components/${file}`)
      const html=await renderToString(createSSRApp(Component,{species:publicSpecies,photo,name:'Ирбис',populationType:'unknown',speciesId:'irbis'}))
      assert.ok(html.includes(`scale(${compositions[view].zoom})`),file)
      assert.ok(html.includes(`object-position:${{card:'40% 60%',detail:'45% 50%',lesson:'50% 55%'}[view]}`),file)
      assert.ok(html.includes(photo.path),file)
      if(file==='SpeciesCard.vue')assert.ok(html.includes('aria-label="Кененирээк — Жазууну ачуу: Илбирс"'))
    }
    assert.equal(await readFile(join(PROJECT_ROOT,'data/species.source.json'),'utf8'),text)
  }finally{if(vite)await vite.close();app.unmount();globalThis.window=oldWindow;await rm(root,{recursive:true,force:true})}
})

test('storage read denial during save is localized and performs no writes or checkpoint loss',()=>{
  let writes=0
  const repository=createDraftRepository({getItem(){throw new DOMException('Access denied','SecurityError')},setItem(){writes++}})
  assert.throws(()=>repository.save({original:{},current:{},assets:[]},{checkpoint:true}),error=>error.message==='admin.error.storage')
  assert.equal(writes,0)
})

test('initial public render keeps the catalog but does not construct unvisited secondary sections',async()=>{
  const previous=globalThis.document
  globalThis.document={documentElement:{lang:''},head:{appendChild(){}},querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({setAttribute(){}})}
  const vite=await createServer({server:{middlewareMode:true,ws:false,hmr:false,watch:null},appType:'custom',logLevel:'error'})
  try{
    const {default:App}=await vite.ssrLoadModule('/src/App.vue')
    const html=await renderToString(createSSRApp(App))
    assert.ok(html.includes('id="catalog"'));assert.ok(html.includes('id="map"'))
    for(const id of ['quiz','lesson','support'])assert.ok(!html.includes(`id="${id}"`))
    assert.ok(html.includes('MURAS'));assert.ok(html.includes('Расмий мамлекеттик басылма эмес.'))
  }finally{await vite.close();globalThis.document=previous}
})
