import test,{before,after} from 'node:test'
import assert from 'node:assert/strict'
import {readFile,writeFile,symlink,readdir,lstat,mkdir,unlink} from 'node:fs/promises'
import {resolve} from 'node:path'
import {createHash} from 'node:crypto'
import {createServer,request as httpRequest} from 'node:http'
import {createAdminService,JSON_LIMIT} from '../scripts/local-admin/service.mjs'
import {adminMiddleware} from '../scripts/local-admin/http.mjs'
import {generateAllData} from '../scripts/build-data.mjs'
import {emptySpecies} from '../src/admin/data/model.js'
import {localAdminFixture} from './helpers/local-admin-fixture.mjs'
const hash=b=>createHash('sha256').update(b).digest('hex'),clone=v=>structuredClone(v)
let fixture,service,original,sourceBytes,httpServer,base
before(async()=>{fixture=await localAdminFixture();sourceBytes=await readFile(resolve(fixture.root,'data/species.source.json'));original=JSON.parse(sourceBytes);service=await createAdminService({root:fixture.root});httpServer=createServer((req,res)=>adminMiddleware(service)(req,res,()=>{res.statusCode=404;res.end()}));await new Promise(r=>httpServer.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${httpServer.address().port}`})
after(async()=>{await new Promise(r=>httpServer.close(r));await service.close();await fixture.cleanup()})
const request=(route,options={})=>fetch(base+'/__muras_admin'+route,{...options,headers:{'X-Muras-Editor':'1','Origin':base,'Content-Type':'application/json',...options.headers}})
const status=code=>e=>e.status===code

test('clean clone loads 184 authoritative records without browser or file drafts',async()=>{
 const r=await service.catalog();assert.equal(r.revision,hash(sourceBytes));assert.equal(r.document.catalog.length,184);assert.equal(r.document.demoArchive.length,2);assert.deepEqual(await service.draft(),{envelope:null,revision:'missing'});assert.equal((await request('/catalog')).status,200)
})
test('incomplete research drafts persist and reopen without changing published source',async()=>{
 const doc=clone(original);doc.catalog.push(emptySpecies('synthetic-incomplete-draft'));const envelope={original:clone(original),current:doc,assets:[]}
 const saved=await service.saveDraft({envelope,baseRevision:hash(sourceBytes),draftRevision:'missing',checkpoint:true})
 const reopened=await createAdminService({root:fixture.root});try{const loaded=await reopened.draft();assert.equal(loaded.envelope.current.catalog.length,185);assert.equal(loaded.revision,saved.revision);assert.deepEqual((await reopened.catalog()).document,original)}finally{await reopened.close()}
 await assert.rejects(()=>service.saveDraft({envelope,baseRevision:hash(sourceBytes),draftRevision:'missing'}),status(409));assert.ok((await readFile(resolve(fixture.root,'data/species.source.json'))).equals(sourceBytes))
})
test('invalid JSON, request bounds, Host, Origin, CSRF headers and route allowlist are enforced',async()=>{
 assert.equal((await request('/draft',{method:'PUT',body:'{'})).status,400)
 assert.equal((await request('/draft',{method:'PUT',body:'x'.repeat(JSON_LIMIT+1)})).status,413)
 assert.equal((await request('/catalog',{headers:{Origin:'https://example.org'}})).status,403)
 const badHost=await new Promise((resolve,reject)=>{const r=httpRequest(base+'/__muras_admin/catalog',{headers:{Host:'localhost:'+httpServer.address().port,Origin:base,'X-Muras-Editor':'1'}},res=>{res.resume();resolve(res.statusCode)});r.on('error',reject);r.end()});assert.equal(badHost,403)
 assert.equal((await fetch(base+'/__muras_admin/catalog')).status,403)
 assert.equal((await request('/apply',{method:'DELETE'})).status,404)
 assert.equal((await request('/files/..%2f..%2f.env',{method:'PUT',body:'{}'})).status,404)
 assert.equal((await request('/catalog?path=../../.env')).status,404)
})
test('invalid scientific claims, arbitrary image paths and archive edits never reach the files',async()=>{
 const current=await service.catalog(),doc=clone(current.document);doc.demoArchive=[]
 await assert.rejects(()=>service.prepare({document:doc,baseRevision:current.revision}),status(422))
 const bad=clone(current.document);bad.catalog[0].sources[0].url='javascript:alert(1)';await assert.rejects(()=>service.prepare({document:bad,baseRevision:current.revision}),status(422))
 const path=clone(current.document);path.catalog[0].images[0].path='../../outside.webp';await assert.rejects(()=>service.prepare({document:path,baseRevision:current.revision}),status(422))
 assert.ok((await readFile(resolve(fixture.root,'data/species.source.json'))).equals(sourceBytes))
})
test('confirmed reviewed apply persists source and generated data and reopens without Git operations',async()=>{
 const before=await service.catalog(),doc=clone(before.document);doc.catalog[0].names.en='Synthetic edited test name'
 const plan=await service.prepare({document:doc,baseRevision:before.revision});assert.deepEqual(plan.diff,{added:[],removed:[],modified:[{id:'irbis',fields:['names.en']}]})
 await assert.rejects(()=>service.apply({token:plan.token,baseRevision:before.revision,confirmed:false}),status(400));assert.deepEqual((await service.catalog()).document,before.document)
 const result=await service.apply({token:plan.token,baseRevision:before.revision,confirmed:true});assert.equal(result.gitCommitted,false);assert.equal(result.deployed,false);assert.notEqual(result.revision,before.revision)
 assert.equal((await service.catalog()).document.catalog[0].names.en,'Synthetic edited test name');assert.equal(JSON.parse(await readFile(resolve(fixture.root,'public/data/species.json')))[0].names.en,'Synthetic edited test name');assert.deepEqual(result.document.demoArchive,original.demoArchive)
 await assert.rejects(()=>service.apply({token:plan.token,baseRevision:before.revision,confirmed:true}),status(409))
})
test('another process changing source or generator dependencies cannot be overwritten',async()=>{
 const before=await service.catalog(),doc=clone(before.document);doc.catalog[0].names.en='Another synthetic edit';const plan=await service.prepare({document:doc,baseRevision:before.revision})
 const external=clone(before.document);external.catalog[0].names.en='External process edit';const path=resolve(fixture.root,'data/species.source.json');await writeFile(path,JSON.stringify(external))
 await assert.rejects(()=>service.apply({token:plan.token,baseRevision:before.revision,confirmed:true}),status(409));assert.equal((await service.catalog()).document.catalog[0].names.en,'External process edit');await writeFile(path,JSON.stringify(before.document,null,2)+'\n')
 const p=resolve(fixture.root,'src/data/quiz/questions.json'),bytes=await readFile(p);await writeFile(p,Buffer.concat([bytes,Buffer.from('\n')]))
 await assert.rejects(()=>service.apply({token:plan.token,baseRevision:before.revision,confirmed:true}),status(409));await writeFile(p,bytes)
})
let receipt,png
const opts=b=>({fileName:'synthetic.png',sha256:hash(b),mime:'image/png'})
test('image pipeline verifies originals, dimensions and hashes, retains bytes and deduplicates uploads',async()=>{
 png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAAE0lEQVR4nGN0q4higAEmOAudAwApAAEel85EhQAAAABJRU5ErkJggg==','base64')
 await assert.rejects(()=>service.upload(png,{...opts(png),sha256:'0'.repeat(64)}),status(422));await assert.rejects(()=>service.upload(Buffer.from('<svg/>'),{fileName:'evil.svg',sha256:hash(Buffer.from('<svg/>')),mime:'image/svg+xml'}),status(422));await assert.rejects(()=>service.upload(png,{...opts(png),fileName:'../escape.png'}),status(422))
 receipt=await service.upload(png,opts(png));assert.equal(receipt.originalSha256,hash(png));assert.equal(receipt.width,4);assert.equal(receipt.height,3);assert.ok((await readFile(resolve(fixture.root,receipt.originalPath))).equals(png));assert.equal(hash(await service.preview(receipt.id)),receipt.sha256)
 const files=await readdir(resolve(fixture.root,'data/drafts/media'));assert.equal((await service.upload(png,opts(png))).id,receipt.id);assert.deepEqual(await readdir(resolve(fixture.root,'data/drafts/media')),files)
 const b=await service.preview(receipt.id);await writeFile(resolve(fixture.root,receipt.webpPath),'corrupt');await assert.rejects(()=>service.media(receipt.id),status(422));await writeFile(resolve(fixture.root,receipt.webpPath),b)
})
function imageFor(name){return {path:receipt.path,sha256:receipt.sha256,width:receipt.width,height:receipt.height,originalSha256:receipt.originalSha256,originalPath:receipt.originalAssetPath,originalWidth:receipt.originalWidth,originalHeight:receipt.originalHeight,author:'Synthetic test fixture',originalPage:'https://example.org/fixture',license:'CC0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',attribution:'Synthetic test-only raster',modifications:receipt.modifications,licenseVerified:true,editorialEvidence:{taxonScientificName:name,sourceUrl:'https://example.org/fixture.png',taxonConfirmed:true,rightsConfirmed:true}}}
test('new image publication requires taxon evidence, reusable rights and explicit confirmation',async()=>{
 const before=await service.catalog(),doc=clone(before.document),species=doc.catalog.find(s=>s.id==='lonicera-paradoxa');species.images=[imageFor(species.scientificName)]
 const denied=clone(doc);denied.catalog.find(s=>s.id===species.id).images[0].license='CC BY-NC 4.0';await assert.rejects(()=>service.prepare({document:denied,baseRevision:before.revision}),status(422))
 const wrong=clone(doc);wrong.catalog.find(s=>s.id===species.id).images[0].editorialEvidence.taxonScientificName='Wrong species';await assert.rejects(()=>service.prepare({document:wrong,baseRevision:before.revision}),status(422));await assert.rejects(()=>lstat(resolve(fixture.root,receipt.path)),/ENOENT/)
 const plan=await service.prepare({document:doc,baseRevision:before.revision});await service.apply({token:plan.token,baseRevision:before.revision,confirmed:true});assert.equal(hash(await readFile(resolve(fixture.root,receipt.path))),receipt.sha256);assert.equal(hash(await readFile(resolve(fixture.root,receipt.originalAssetPath))),receipt.originalSha256)
 const published=JSON.parse(await readFile(resolve(fixture.root,'public/data/species.json'))).find(s=>s.id===species.id);assert.ok(published.images[0].path.startsWith('/images/approved/'));assert.equal(published.images[0].author,'Synthetic test fixture')
 const applied=await service.catalog(),saved=await service.draft();await service.saveDraft({envelope:{original:applied.document,current:applied.document,assets:[]},baseRevision:applied.revision,draftRevision:saved.revision});const bundle=await service.exportBundle();assert.equal(bundle.media.length,1);assert.equal(bundle.envelope.assets[0].id,receipt.id);assert.equal(hash(Buffer.from(bundle.media[0].originalBase64,'base64')),receipt.id)
})
test('draft bundles retain incomplete research and media across a fresh clone',async()=>{
 const current=await service.catalog(),doc=clone(current.document);doc.catalog.push(emptySpecies('synthetic-unfinished'));const index=doc.catalog.findIndex(s=>s.id==='lonicera-paradoxa'),envelope={original:current.document,current:doc,assets:[{id:receipt.id,speciesIndex:index,index:0,size:png.length,fileName:'synthetic.png',sha256:receipt.sha256,prepared:true}]}
 const old=await service.draft();await service.saveDraft({envelope,baseRevision:current.revision,draftRevision:old.revision,checkpoint:true});const bundle=await service.exportBundle();assert.equal(hash(Buffer.from(bundle.media[0].originalBase64,'base64')),receipt.id)
 const second=await localAdminFixture(),other=await createAdminService({root:second.root});try{const result=await other.importBundle({bundle,draftRevision:'missing'});assert.equal(result.envelope.current.catalog.length,185);assert.equal((await other.catalog()).document.catalog.length,184);assert.equal(hash(await other.preview(receipt.id)),receipt.sha256)}finally{await other.close();await second.cleanup()}
})
test('legacy migration is explicit, idempotent and cannot install stale browser data over catalogue',async()=>{
 const value={original:clone(original),current:clone(original),assets:[{id:'legacy-browser-uuid',speciesIndex:0,index:0,fileName:'lost.jpg'}]};value.current.catalog[0].names.en='Legacy stale name';const before=await service.catalog(),a=await service.migrate({envelope:value}),b=await service.migrate({envelope:value});assert.equal(a.id,b.id);assert.equal(a.alreadyMigrated,false);assert.equal(b.alreadyMigrated,true);assert.deepEqual(await service.catalog(),before)
})
test('post-write generator failure restores source and projections byte for byte',async()=>{
 const s=await createAdminService({root:fixture.root,generator:async(root,options)=>{if(options?.check)throw Error('Synthetic post-write failure');return generateAllData(root,options)}})
 try{const before=await s.catalog(),old=await readFile(resolve(fixture.root,'public/data/species.json')),doc=clone(before.document);doc.catalog[0].names.en='Rollback fixture';const plan=await s.prepare({document:doc,baseRevision:before.revision});await assert.rejects(()=>s.apply({token:plan.token,baseRevision:before.revision,confirmed:true}),/Synthetic post-write failure/);assert.deepEqual(await s.catalog(),before);assert.ok((await readFile(resolve(fixture.root,'public/data/species.json'))).equals(old))}finally{await s.close()}
})
test('a symlinked draft directory cannot redirect writes outside the repository',async()=>{
 const second=await localAdminFixture(),outside=await localAdminFixture();try{await symlink(outside.root,resolve(second.root,'data/drafts'),'junction');const other=await createAdminService({root:second.root});try{await assert.rejects(()=>other.saveDraft({envelope:{original,current:original,assets:[]},baseRevision:hash(sourceBytes),draftRevision:'missing'}),status(400))}finally{await other.close()}}finally{await second.cleanup();await outside.cleanup()}
})

test('a crashed transaction and an external file lock block apply instead of bypassing protection',async()=>{
 const dir=resolve(fixture.root,'data/drafts/transactions/deadbeef');await mkdir(dir,{recursive:true});await writeFile(resolve(dir,'journal.json'),JSON.stringify({status:'applying',entries:[]}))
 const before=await service.catalog();await assert.rejects(()=>service.apply({token:'not-authorized',baseRevision:before.revision,confirmed:true}),e=>e.status===409&&e.message==='admin.error.recovery');await writeFile(resolve(dir,'journal.json'),JSON.stringify({status:'resolved',entries:[]}))
 const lock=resolve(fixture.root,'data/drafts/.editor.lock');await writeFile(lock,'Synthetic external lock')
 try{await assert.rejects(()=>service.saveDraft({}),e=>e.status===409&&e.message==='admin.error.locked')}finally{await unlink(lock)}
 assert.deepEqual(await service.catalog(),before)
})
test('removing a species required by quiz or map fails the existing generator checks before writing',async()=>{
 const before=await service.catalog(),document=clone(before.document);document.catalog=document.catalog.filter(s=>s.id!=='irbis')
 await assert.rejects(()=>service.prepare({document,baseRevision:before.revision}),e=>e.status===422&&e.message==='admin.error.validation');assert.deepEqual(await service.catalog(),before)
})
