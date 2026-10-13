import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile,mkdir,mkdtemp,rm,writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createRenderer,defineComponent,h,nextTick} from 'vue'
import {clone,deleteSpecies,duplicateSpecies,emptySpecies,exportSource,importSource,jsonSafe,populationTransition,publicationErrors,previewUrl,setPhotoComposition,setPath,uniqueId} from '../src/admin/data/model.js'
import {createDraftRepository,DRAFT_KEY,PREVIOUS_KEY} from '../src/admin/data/repository.js'
import {createImageSession,imageFormat,inspectImage,MAX_IMAGE_BYTES} from '../src/admin/data/images.js'
import {useAdminEditor} from '../src/admin/useAdminEditor.js'
import {compositionCrop,compositionStyle,imageComposition,panComposition,validComposition} from '../src/data/image-composition.js'
import {renderFrame,createVisualization} from '../src/data/visualization/engine.js'
import {validateSource} from '../src/data/species-model.js'
import {writeAdminEntry} from '../scripts/admin-entry.mjs'
import {validateMessages} from '../scripts/validate-locales.mjs'
import {createServer} from 'vite'
import {createSSRApp} from 'vue'
import {renderToString} from '@vue/server-renderer'
const source=JSON.parse(await readFile(new URL('../data/species.source.json',import.meta.url),'utf8'))
const published=JSON.parse(await readFile(new URL('../public/data/species.json',import.meta.url),'utf8'))
const copy=()=>clone(source),envelope=current=>({original:copy(),current,assets:[]})
function storage(){const values=new Map();return{getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)}}
function known(type='exact') {const doc=copy(),species=doc.catalog[0];species.population={type,value:type==='exact'?42:12.5,min:null,max:null,territory:'Synthetic test territory',year:2020,unit:'Synthetic test unit',method:type==='exact'?'complete-count':'estimate',reviewStatus:'approved',sourceIds:['synthetic-test-source']};species.sources.push({id:'synthetic-test-source',title:'Synthetic test fixture; not catalog research',publisher:'Tests',url:'https://example.org/test-fixture',accessedAt:'2020-01-01',supports:['type','value','min','max','territory','year','unit','method'].map(k=>'population.'+k)});return doc}

test('authoritative import and export preserve every original field, translations, archive and unpublished images',()=>{
 const doc=copy();doc.extension={editorNote:'Retained metadata'};doc.catalog[0].sources[0].extra={text:'Source metadata retained'}
 const imported=importSource(JSON.stringify(doc));assert.deepEqual(JSON.parse(exportSource(imported)),doc)
 assert.equal(imported.demoArchive.length,2);assert.equal(imported.catalog[0].images.length,2)
})
test('reject malformed, projected, wrong-schema, unsafe, oversized and scientifically invalid JSON',()=>{
 for(const text of ['{',JSON.stringify(published),JSON.stringify({...source,schemaVersion:2}),JSON.stringify({...source,catalog:[{id:'bad'}]}),'x'.repeat(2*1024*1024+1),'{"__proto__":{}}'])assert.throws(()=>importSource(text),/admin.error/)
 const doc=copy();doc.catalog[0].sources[0].url='javascript:alert(1)';assert.throws(()=>importSource(JSON.stringify(doc)),/admin.error.schema/)
 assert.equal(jsonSafe({value:Infinity}),false)
})
test('editing changes only the chosen path and never shares mutable draft data with the public/source catalog',()=>{
 const doc=copy(),original=JSON.stringify(doc),updated=setPath(doc,['catalog',0,'names','en'],'Draft name')
 assert.equal(JSON.stringify(doc),original);assert.equal(updated.catalog[0].images,doc.catalog[0].images)
 assert.equal(published[0].names.en,'Snow Leopard');assert.equal(updated.catalog[0].names.ru,doc.catalog[0].names.ru)
 assert.throws(()=>setPath(doc,['__proto__','polluted'],true),/unsafe/)
})
test('new and duplicated species are distinct unverified drafts with unique IDs and no fabricated population',()=>{
 const doc=copy(),empty=emptySpecies(uniqueId(doc));assert.equal(empty.verified,false);assert.equal(empty.population.value,null);assert.equal(empty.scientificName,null);assert.deepEqual(empty.sources,[])
 doc.catalog.push(empty);assert.equal(uniqueId(doc),'species-draft-2')
 assert.ok(publicationErrors(doc).some(e=>e.includes('incompleteSpecies')))
 const duplicated=duplicateSpecies(known(),0),last=duplicated.catalog.at(-1)
 assert.equal(last.id,'irbis-draft');assert.equal(last.verified,false);assert.equal(last.population.reviewStatus,'pending')
 assert.deepEqual(last.names,source.catalog[0].names);assert.deepEqual(last.images,source.catalog[0].images)
})
test('deletion requires explicit confirmation and leaves the source/archive untouched',()=>{
 const doc=copy();assert.equal(deleteSpecies(doc,0,false),doc)
 const next=deleteSpecies(doc,0,true);assert.equal(next.catalog.length,8);assert.equal(doc.catalog.length,9);assert.deepEqual(next.demoArchive,doc.demoArchive)
})
test('population transition warns before discarding a range or known number, preserves evidence and uses null for unknown',()=>{
 const p=known().catalog[0].population
 assert.equal(populationTransition(p,'unknown').needsConfirmation,true)
 const cleared=populationTransition(p,'unknown',true).population
 assert.deepEqual([cleared.value,cleared.min,cleared.max,cleared.method],[null,null,null,null]);assert.equal(cleared.territory,p.territory);assert.deepEqual(cleared.sourceIds,p.sourceIds)
 const range={...p,type:'approximate',value:null,min:10,max:20,method:'estimate'}
 assert.equal(populationTransition(range,'exact').needsConfirmation,true)
 assert.deepEqual(populationTransition(range,'exact',true).population.min,null)
})
test('exact, approximate single/range exports require scientific metadata, evidence and independent approval',()=>{
 for(const type of ['exact','approximate']){const doc=known(type);assert.deepEqual(publicationErrors(doc),[]);doc.catalog[0].population.reviewStatus='pending';assert.throws(()=>exportSource(doc),/export/);doc.catalog[0].population.reviewStatus='approved';doc.catalog[0].population.year=null;assert.ok(publicationErrors(doc).length)}
 const range=known('approximate');Object.assign(range.catalog[0].population,{value:null,min:10,max:20});assert.deepEqual(publicationErrors(range),[])
 range.catalog[0].population.max=5;assert.ok(publicationErrors(range).length)
 const exact=known();exact.catalog[0].population.method='estimate';assert.ok(publicationErrors(exact).length)
})
test('composition up to 3× is bounded, per-photo and per-format; public CSS and Canvas share detail',()=>{
 const doc=setPhotoComposition(copy(),0,0,'card',{x:.2,y:.8,zoom:2.5});const next=setPhotoComposition(doc,0,0,'detail',{x:.8,y:.1,zoom:3})
 assert.deepEqual(validateSource(next),[]);assert.equal(imageComposition(next.catalog[0].images[0],'card').zoom,2.5)
 assert.equal(imageComposition(next.catalog[0].images[0],'detail').zoom,3)
 assert.deepEqual(next.catalog[1].images,source.catalog[1].images);assert.deepEqual(next.catalog[0].images[1],source.catalog[0].images[1])
 assert.equal(compositionStyle(next.catalog[0].images[0],'detail').transform,'scale(3)')
 assert.equal(imageComposition(next.catalog[0].images[0],'lesson').zoom,1)
 assert.equal(validComposition({x:.5,y:.5,zoom:3.1}),false)
 assert.throws(()=>setPhotoComposition(doc,0,0,'canvas',{x:.5,y:.5,zoom:1}),/composition/)
})
test('pointer pan uses real crop geometry and clamps to source bounds without changing zoom',()=>{
 const c={x:.5,y:.5,zoom:2},next=panComposition(c,30,20,1200,600,400,300)
 assert.ok(next.x<c.x&&next.y<c.y);assert.equal(next.zoom,2)
 const end=panComposition(c,10000,-10000,1200,600,400,300);assert.equal(end.x,0);assert.equal(end.y,1)
 assert.equal(panComposition(c,1,2,0,0,0,0),c)
})
test('Canvas receives the same detail crop as the CSS preview, including portrait and 3× zoom',()=>{
 for(const [width,height]of [[1600,900],[900,1600],[1000,1000]]){
  const calls=[],context={filter:'none',clearRect(){},drawImage(...args){calls.push(args)}}
  const canvas={width:0,height:0,getContext:()=>context},scratch={getContext:()=>context},image={naturalWidth:width,naturalHeight:height}
  const composition={x:.17,y:.84,zoom:3},expected=compositionCrop(width,height,4/3,composition)
  assert.equal(renderFrame(canvas,scratch,image,0,{width:400,height:300},2,{composition}),true)
  assert.deepEqual(calls[0].slice(1,5),[expected.x,expected.y,expected.width,expected.height])
 }
})
test('live composition changes coalesce into one RAF and do not reload or resample unrelated metadata',()=>{
 const queue=new Map(),images=[],calls=[],ctx={filter:'none',clearRect(){},drawImage(...args){calls.push(args)}},canvas={width:0,height:0,getContext:()=>ctx}
 let n=0;const engine=createVisualization({canvas,createCanvas:()=>({width:0,height:0,getContext:()=>ctx}),createImage:()=>{const image={naturalWidth:1200,naturalHeight:600,removeAttribute(){}};images.push(image);return image},requestFrame:callback=>{queue.set(++n,callback);return n},cancelFrame:id=>queue.delete(id),setTimer:()=>0,clearTimer(){},measure:()=>({width:400,height:300}),reducedMotion:()=>true})
 engine.load('/test.webp',{type:'unknown'});images[0].onload();engine.start()
 const c={x:.2,y:.8,zoom:2};for(let i=0;i<20;i++)engine.setComposition({...c,x:i/20})
 assert.equal(images.length,1);assert.equal(queue.size,1);queue.values().next().value(100);queue.clear()
 const draws=calls.length;engine.setComposition({x:19/20,y:.8,zoom:2});assert.equal(queue.size,0);assert.equal(calls.length,draws)
 engine.dispose();assert.equal(canvas.width,0);assert.equal(engine.setComposition(c),false)
})
test('draft repository restores incomplete drafts losslessly and maintains a separate checkpoint',()=>{
 const memory=storage(),repo=createDraftRepository(memory),first=envelope(copy());repo.save(first)
 const changed=envelope(setPath(first.current,['catalog',0,'names','en'],null));repo.save(changed,{checkpoint:true})
 assert.equal(repo.load().current.catalog[0].names.en,null);assert.equal(repo.previous().current.catalog[0].names.en,'Snow Leopard')
 const next=envelope(setPath(changed.current,['catalog',0,'scientificName'],null));repo.save(next)
 assert.equal(repo.previous().current.catalog[0].names.en,'Snow Leopard')
 assert.deepEqual(repo.load().current.demoArchive,source.demoArchive);assert.deepEqual(repo.load().current.catalog[0].sources,source.catalog[0].sources)
})
test('corrupt draft structures and lost archive data are rejected, not reconstructed from public records',()=>{
 const memory=storage(),repo=createDraftRepository(memory);memory.setItem(DRAFT_KEY,'{');assert.throws(()=>repo.load())
 const bad=envelope(copy());bad.current.catalog[0].images=null;memory.setItem(DRAFT_KEY,JSON.stringify({...bad,version:1}));assert.throws(()=>repo.load(),/draft/)
 const archive=envelope(copy());archive.current.demoArchive=[];memory.setItem(DRAFT_KEY,JSON.stringify({...archive,version:1}));assert.throws(()=>repo.load(),/draft/)
})
test('quota failures retain the prior saved document and clearing never touches public locale or quiz keys',()=>{
 const memory=storage(),repo=createDraftRepository(memory);repo.save(envelope(copy()));const original=memory.getItem(DRAFT_KEY)
 const blocked={...memory,setItem(){throw Error('quota')}};assert.throws(()=>createDraftRepository(blocked).save(envelope(copy())),/storage/);assert.equal(memory.getItem(DRAFT_KEY),original)
 memory.setItem('redbook.locale.v1','en');assert.equal(repo.clear(false),false);assert.equal(repo.clear(true),true);assert.equal(memory.getItem('redbook.locale.v1'),'en');assert.equal(memory.getItem(PREVIOUS_KEY),null)
})
test('missing and unpublished photos stay unavailable; preview paths are matched by hash, never guessed',()=>{
 assert.equal(previewUrl(source.catalog[0],0,published),'/images/approved/irbis-1.webp')
 assert.equal(previewUrl(source.catalog[0],1,published),null)
 const changed=clone(source.catalog[0]);changed.images[0].sha256='1'.repeat(64);assert.equal(previewUrl(changed,0,published),null)
 changed.images[0].path='blob:local';assert.throws(()=>exportSource({...copy(),catalog:[changed]}),/export/)
})
test('local file publication requires explicit preparation, and importing bytes never confirms rights',()=>{
 const doc=copy(),assets=[{speciesIndex:0,index:0,prepared:false}]
 assert.ok(publicationErrors(doc,assets).some(e=>e.includes('filePending')));assert.deepEqual(publicationErrors(doc,[{...assets[0],prepared:true}]),[])
})
const PNG=new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,0])
function fakeImage(){return {naturalWidth:800,naturalHeight:600,set src(value){queueMicrotask(()=>this.onload?.())},removeAttribute(){}}}
test('local uploads check bytes, extension, size, decoding and compute a hash without publishing a path',async()=>{
 const file=new File([PNG],'photo.png',{type:'image/png'}),revoked=[]
 const image=await inspectImage(file,{createUrl:()=> 'blob:preview',revokeUrl:url=>revoked.push(url),createImage:fakeImage})
 assert.equal(image.width,800);assert.equal(image.height,600);assert.match(image.sha256,/^[a-f0-9]{64}$/);assert.equal(image.path,undefined);assert.equal(image.licenseVerified,undefined);assert.equal(revoked.length,0)
 assert.equal(imageFormat(PNG),'png');assert.equal(imageFormat(new Uint8Array([1,2,3])),null)
 for(const bad of [new File(['<svg/>'],'file.svg',{type:'image/svg+xml'}),new File([PNG],'photo.jpg'),{size:MAX_IMAGE_BYTES+1}])await assert.rejects(()=>inspectImage(bad),/admin.error/)
})
test('decode failure and cancellation revoke object URLs; sessions release replaced/deleted files and enforce memory bounds',async()=>{
 const revoked=[],file=new File([PNG],'photo.png',{type:'image/png'})
 await assert.rejects(()=>inspectImage(file,{createUrl:()=> 'blob:bad',revokeUrl:v=>revoked.push(v),createImage:()=>({set src(v){queueMicrotask(()=>this.onerror())},removeAttribute(){}})}),/imageDecode/)
 assert.deepEqual(revoked,['blob:bad'])
 const abort=new AbortController();await assert.rejects(()=>inspectImage(file,{signal:abort.signal,createUrl:()=> 'blob:abort',revokeUrl:v=>revoked.push(v),createImage:()=>({set src(v){abort.abort()},removeAttribute(){}})}),/cancelled/)
 const session=createImageSession({revoke:v=>revoked.push(v),maxBytes:10});session.put('a',{url:'blob:1',size:5});session.put('a',{url:'blob:2',size:5});assert.equal(session.get('a'),'blob:2')
 assert.throws(()=>session.put('b',{url:'blob:large',size:20}),/sessionSize/);session.retain([]);assert.equal(session.get('a'),null);session.dispose();assert.ok(revoked.includes('blob:1')&&revoked.includes('blob:2')&&revoked.includes('blob:large'))
})
test('admin messages have complete parity and are kept separate from public dictionaries',async()=>{
 const messages={};for(const language of ['ru','ky','en'])messages[language]=JSON.parse(await readFile(new URL(`../src/admin/locales/${language}.json`,import.meta.url),'utf8'))
 assert.deepEqual(validateMessages(messages),[]);assert.ok(Object.keys(messages.ru).every(key=>key.startsWith('admin.')))
 assert.ok(Object.keys(messages.ru).length>=160)
})
test('build creates a physical /admin/ entry with the same asset URLs for static hosting',async()=>{
 const root=await mkdtemp(join(tmpdir(),'redbook-admin-entry-'));try{await mkdir(join(root,'dist'));const html='<html><script src="/assets/main.js"></script></html>';await writeFile(join(root,'dist/index.html'),html);await writeAdminEntry(root);assert.equal(await readFile(join(root,'dist/admin/index.html'),'utf8'),html)}finally{await rm(root,{recursive:true,force:true})}
})
test('Vue editor persists through proxies, resets approval after a change, confirms deletion and restores checkpoints',async()=>{
 const memory=storage(),repository=createDraftRepository(memory),node=type=>({type,children:[]})
 const renderer=createRenderer({createElement:node,createText:node,createComment:node,insert:(c,p)=>p.children.push(c),remove(){},setText(){},setElementText(){},patchProp(){},parentNode:()=>null,nextSibling:()=>null})
 const oldWindow=globalThis.window;globalThis.window={addEventListener(){},removeEventListener(){}}
 let editor;const App=defineComponent({setup(){editor=useAdminEditor({repository,delay:10000});return()=>h('div')}}),app=renderer.createApp(App);app.mount(node('root'))
 try{
  assert.equal(await editor.importText(JSON.stringify(known()),true),true);editor.selectedIndex.value=0
  editor.update(['population','value'],45);assert.equal(editor.current.value.population.reviewStatus,'pending');assert.equal(editor.dirty.value,true)
  editor.update(['population','reviewStatus'],'approved');assert.equal(await editor.save(true),true);assert.equal(editor.dirty.value,false)
  const before=editor.document.value;assert.equal(await editor.remove(0,false),false);assert.equal(editor.document.value,before)
  assert.equal(await editor.remove(0,true),true);assert.equal(editor.document.value.catalog.length,8);await editor.save()
  assert.equal(await editor.restorePrevious(true),true);assert.equal(editor.document.value.catalog.length,9)
  editor.add();assert.equal(editor.current.value.verified,false);editor.update(['names','en'],'Unsourced draft');assert.ok(!editor.validate())
  assert.equal(editor.reset(false),false);assert.equal(await editor.reset(true),true);assert.equal(editor.document.value.catalog.length,9)
  await nextTick()
 }finally{app.unmount();globalThis.window=oldWindow}
 assert.equal(repository.load().current.catalog.length,9)
})

test('async persistence serializes saves and never clears newer unsaved edits or replaces an imported document with a late load',async()=>{
 const node=type=>({type,children:[]}),saved=[],pending=[]
 let finishLoad
 const repository={load:()=>new Promise(resolve=>{finishLoad=resolve}),save:value=>new Promise(resolve=>{saved.push(value);pending.push(resolve)})}
 const renderer=createRenderer({createElement:node,createText:node,createComment:node,insert:(c,p)=>p.children.push(c),remove(){},setText(){},setElementText(){},patchProp(){},parentNode:()=>null,nextSibling:()=>null})
 const oldWindow=globalThis.window;globalThis.window={addEventListener(){},removeEventListener(){}}
 let editor;const app=renderer.createApp(defineComponent({setup(){editor=useAdminEditor({repository,delay:10000});return()=>h('div')}}));app.mount(node('root'))
 try{
  const imported=editor.importText(JSON.stringify(source),true);await Promise.resolve()
  finishLoad(envelope(known()));await Promise.resolve();assert.equal(editor.document.value.catalog[0].population.type,'unknown')
  editor.selectedIndex.value=0;editor.update(['names','en'],'Newer unsaved name')
  pending.shift()();await imported;assert.equal(editor.dirty.value,true)
  const saving=editor.save();await Promise.resolve();assert.equal(saved.at(-1).current.catalog[0].names.en,'Newer unsaved name')
  pending.shift()();assert.equal(await saving,true);assert.equal(editor.dirty.value,false)
 }finally{app.unmount();globalThis.window=oldWindow}
})

test('all editor panels render real Vue templates with imported fields and image previews outside the browser',async()=>{
 const vite=await createServer({server:{middlewareMode:true,hmr:false,watch:null},appType:'custom',logLevel:'error'})
 try{
  await vite.ssrLoadModule('/src/admin/locales/index.js')
  const {siteLanguage}=await vite.ssrLoadModule('/src/composables/useLocale.js');siteLanguage.value='ru'
  const species=copy().catalog[0]
  for(const tab of ['basic','description','conservation']){
   const {default:Component}=await vite.ssrLoadModule('/src/admin/components/SpeciesFields.vue')
   const html=await renderToString(createSSRApp(Component,{species,tab}))
   assert.ok(html.includes('<input')||html.includes('<textarea'));assert.ok(!html.includes('admin.'))
   if(tab==='basic')assert.ok(html.includes('Panthera uncia')&&html.includes('Илбирс')&&html.includes('Snow Leopard'))
  }
  for(const name of ['PopulationEditor','SourcesEditor','PhotoEditor']){
   const {default:Component}=await vite.ssrLoadModule(`/src/admin/components/${name}.vue`)
   const html=await renderToString(createSSRApp(Component,{species,speciesIndex:0,published,assets:[],session:createImageSession(),revision:0,ask:async()=>false}))
   assert.ok(html.includes('<input'));assert.ok(!html.includes('admin.'))
   if(name==='PhotoEditor')assert.ok(html.includes('/images/approved/irbis-1.webp')&&html.includes('<canvas')&&html.includes('Horizontal'))
   if(name==='SourcesEditor')assert.ok(html.includes('redbook-2006')&&html.includes('https://macrolepidoptera.ru'))
  }
 }finally{await vite.close()}
})
