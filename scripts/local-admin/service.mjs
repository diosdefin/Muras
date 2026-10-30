// Dev-only file adapter. No routes accept a client-supplied destination path.
import {readFile,writeFile,mkdir,rename,unlink,lstat,readdir,open,realpath,rm} from 'node:fs/promises'
import {resolve,relative,dirname} from 'node:path'
import {createHash,randomUUID} from 'node:crypto'
import {execFile} from 'node:child_process'
import {promisify,isDeepStrictEqual} from 'node:util'
import {importSource,editableShape,jsonSafe,publicationErrors,MAX_JSON_BYTES} from '../../src/admin/data/model.js'
import {imageFormat,MAX_IMAGE_BYTES} from '../../src/admin/data/images.js'
import {canPublishImage} from '../../src/data/species-model.js'
import {generateAllData} from '../build-data.mjs'
const exec=promisify(execFile),digest=b=>createHash('sha256').update(b).digest('hex'),encode=v=>Buffer.from(JSON.stringify(v,null,2)+'\n')
const equal=isDeepStrictEqual,hash=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v),http=v=>{try{return ['http:','https:'].includes(new URL(v).protocol)}catch{return false}}
export class AdminError extends Error{constructor(status,code,details=[]){super(code);this.status=status;this.details=details}}
const fail=(status,code,details)=>{throw new AdminError(status,code,details)}
export const JSON_LIMIT=2*MAX_JSON_BYTES+256*1024,BUNDLE_LIMIT=80*1024*1024
const PHOTO_RECIPE='EXIF orientation; resized without upscaling to 1800 px; WebP quality 82; EXIF/XMP removed.'
const INPUTS=['src/data/quiz/questions.json','data/geography/source/regions.geojson','data/geography/source/metadata.json','data/geography/source/ODbL-1.0.txt','data/geography/occurrences.source.json']
const OUTPUTS=['public/data/species.json','data/archive/demo-species.generated.json','public/data/quiz.json','public/data/geography/map.json','public/data/geography/occurrences.json','public/data/geography/regions.geojson','public/data/geography/metadata.json','public/data/geography/ODbL-1.0.txt']
export function catalogueDiff(before,after){
 const old=new Map(before.catalog.map(s=>[s.id,s])),current=new Map(after.catalog.map(s=>[s.id,s]))
 const paths=(a,b,p='')=>{if(equal(a,b))return [];if(!a||!b||typeof a!=='object'||typeof b!=='object'||Array.isArray(a)||Array.isArray(b))return[p];return [...new Set([...Object.keys(a),...Object.keys(b)])].flatMap(k=>paths(a[k],b[k],p?p+'.'+k:k))}
 return {added:[...current.keys()].filter(id=>!old.has(id)),removed:[...old.keys()].filter(id=>!current.has(id)),modified:[...current].filter(([id,s])=>old.has(id)&&!equal(s,old.get(id))).map(([id,s])=>({id,fields:paths(old.get(id),s)}))}
}
export async function createAdminService({root,python=process.env.MURAS_PYTHON||'python',imageTool=resolve(import.meta.dirname,'image.py'),generator=generateAllData}={}){
 root=await realpath(root)
 // Reject symlinks/junctions even for fixed directories (including data/drafts).
 async function path(file){
  const target=resolve(root,file),rel=relative(root,target)
  if(!rel||rel.startsWith('..')||rel.includes(':'))fail(400,'admin.error.path')
  let parent=root
  for(const part of rel.split(/[\\/]/)){parent=resolve(parent,part);try{if((await lstat(parent)).isSymbolicLink())fail(400,'admin.error.path')}catch(e){if(e.code!=='ENOENT')throw e}}
  return target
 }
 const bytes=async f=>readFile(await path(f)),json=async f=>JSON.parse((await bytes(f)).toString('utf8').replace(/^\uFEFF/,''))
 async function atomic(file,value){const target=await path(file);await mkdir(dirname(target),{recursive:true});const temp=target+'.'+randomUUID()+'.tmp';try{const f=await open(temp,'wx');try{await f.writeFile(value);await f.sync()}finally{await f.close()};await rename(temp,target)}finally{await unlink(temp).catch(e=>{if(e.code!=='ENOENT')throw e})}}
 async function optional(file){try{const b=await bytes(file);return {bytes:b,revision:digest(b),value:JSON.parse(b)}}catch(e){if(e.code==='ENOENT')return {revision:'missing',value:null};throw e}}
 let operations=Promise.resolve()
 function locked(run){const task=operations.then(()=>withFileLock(run));operations=task.catch(()=>{});return task}
 async function withFileLock(run){const lock=await path('data/drafts/.editor.lock');await mkdir(dirname(lock),{recursive:true});let f;try{f=await open(lock,'wx')}catch(e){if(e.code==='EEXIST')fail(409,'admin.error.locked');throw e}try{await f.writeFile(JSON.stringify({pid:process.pid,at:new Date().toISOString()}));return await run()}finally{await f.close();await unlink(lock)}}
 const catalog=async()=>{let b;try{b=await bytes('data/species.source.json')}catch(e){if(e.code==='ENOENT')fail(404,'admin.error.sourceRequired');throw e};let document;try{document=importSource(b.toString('utf8'))}catch(e){fail(422,e.message,e.details)};return {document,revision:digest(b)}}
 const draft=async()=>{const d=await optional('data/drafts/current.json');return {envelope:d.value,revision:d.revision}}
 function envelopeCheck(envelope,source){
  if(!jsonSafe(envelope)||!editableShape(envelope?.current)||!Array.isArray(envelope.assets)||envelope.assets.length>300)fail(422,'admin.error.draft')
  try{importSource(JSON.stringify(envelope.original))}catch{fail(422,'admin.error.draft')}
  if(!equal(envelope.current.demoArchive,envelope.original.demoArchive)||source&&!equal(envelope.current.demoArchive,source.demoArchive))fail(422,'admin.error.archive')
  for(const a of envelope.assets)if(!hash(a?.id)||!Number.isInteger(a.speciesIndex)||a.speciesIndex<0||!Number.isInteger(a.index)||a.index<0||!envelope.current.catalog[a.speciesIndex]?.images[a.index])fail(422,'admin.error.draft')
 }
 async function saveDraft(body){return locked(async()=>{
  const current=await optional('data/drafts/current.json');if(body.draftRevision!==current.revision)fail(409,'admin.error.draftConflict')
  envelopeCheck(body.envelope,(await catalog()).document)
  if(!hash(body.baseRevision))fail(422,'admin.error.revision')
  for(const a of body.envelope.assets)await media(a.id)
  if(body.checkpoint&&current.bytes)await atomic('data/drafts/previous.json',current.bytes)
  const value={...body.envelope,version:1,baseRevision:body.baseRevision},b=encode(value);await atomic('data/drafts/current.json',b)
  return {revision:digest(b)}
 })}
 async function inspect(input,output){try{const {stdout}=await exec(python,[imageTool,await path(input),...(output?[await path(output)]:[])],{timeout:60000,maxBuffer:1024*1024,windowsHide:true});return JSON.parse(stdout)}catch(e){if(e.code==='ENOSPC')throw e;fail(422,'admin.error.imagePipeline')}}
 async function media(id){if(!hash(id))fail(400,'admin.error.path');const receipt=await json(`data/drafts/media/${id}.json`);if(receipt.id!==id||receipt.originalSha256!==id||!['jpeg','png','webp'].includes(receipt.format)||!hash(receipt.sha256))fail(422,'admin.error.imageIntegrity');
  const originalPath=`data/drafts/media/${id}.original.${receipt.format}`,webpPath=`data/drafts/media/${id}.optimized.webp`
  if(digest(await bytes(originalPath))!==id||digest(await bytes(webpPath))!==receipt.sha256)fail(422,'admin.error.imageIntegrity')
  return {...receipt,originalPath,webpPath}
 }
 async function upload(buffer,{fileName,sha256,mime}){return locked(async()=>{
  const format=imageFormat(buffer),ext=String(fileName).split('.').at(-1)?.toLowerCase().replace(/^jpg$/,'jpeg')
  if(!buffer.length||buffer.length>MAX_IMAGE_BYTES)fail(413,'admin.error.imageSize')
  if(!format||ext!==format||!fileName||fileName.length>160||/[\\/:\x00-\x1f]/.test(fileName)||mime!==`image/${format}`)fail(422,'admin.error.imageFormat')
  if(!hash(sha256)||digest(buffer)!==sha256)fail(422,'admin.error.imageIntegrity')
  try{return await media(sha256)}catch(e){if(e.code!=='ENOENT')throw e}
  const original=`data/drafts/media/${sha256}.original.${format}`,webp=`data/drafts/media/${sha256}.optimized.webp`
  await atomic(original,buffer)
  const result=await inspect(original,webp)
  const value={id:sha256,format,fileName,originalSha256:sha256,originalWidth:result.width,originalHeight:result.height,width:result.optimized.width,height:result.optimized.height,sha256:result.optimized.sha256,size:buffer.length,prepared:true,modifications:[PHOTO_RECIPE],path:`assets/images/species/local-${result.optimized.sha256}.webp`,originalAssetPath:`assets/images/originals/${sha256}.${format}`}
  await atomic(`data/drafts/media/${sha256}.json`,encode(value));return media(sha256)
 })}
 function permittedLicense(image){const cc=/^CC BY(-SA)? ([234]\.0)$/.exec(image.license||'');return cc?image.licenseUrl===`https://creativecommons.org/licenses/by${cc[1]?'-sa':''}/${cc[2]}/`:image.license==='CC0'&&image.licenseUrl==='https://creativecommons.org/publicdomain/zero/1.0/'||image.license==='Public domain'&&http(image.licenseUrl)}
 async function validateImages(document,original,stage){
  const dependencies=new Map(),newAssets=new Map()
  for(const s of document.catalog)for(const image of s.images){
   const old=original.catalog.find(o=>o.id===s.id)?.images.find(i=>i.path===image.path&&i.sha256===image.sha256)
   if(old&&equal({...image,composition:undefined,compositions:undefined,caption:undefined},{...old,composition:undefined,compositions:undefined,caption:undefined})){
    if(canPublishImage(image)){if(!/^assets\/images\/[a-zA-Z0-9/_.-]+$/.test(image.path))fail(422,'admin.error.path');const b=await bytes(image.path);if(!hash(image.sha256)||digest(b)!==image.sha256)fail(422,'admin.error.imageIntegrity');dependencies.set(image.path,digest(b));if(stage)await stageWrite(stage,image.path,b)}
    continue
   }
   if(!canPublishImage(image)||!permittedLicense(image))fail(422,'admin.error.imageRights')
   const evidence=image.editorialEvidence
   if(evidence?.taxonScientificName!==s.scientificName||evidence?.taxonConfirmed!==true||evidence?.rightsConfirmed!==true||!http(evidence?.sourceUrl))fail(422,'admin.error.imageEvidence')
   if(old){if(['originalPath','originalSha256','originalWidth','originalHeight'].some(k=>!equal(image[k],old[k])))fail(422,'admin.error.imageIntegrity');const b=await bytes(image.path);if(!hash(image.sha256)||digest(b)!==image.sha256||image.width!==old.width||image.height!==old.height)fail(422,'admin.error.imageIntegrity');dependencies.set(image.path,digest(b));if(stage)await stageWrite(stage,image.path,b);continue}
   const m=await media(image.originalSha256)
   if(image.path!==m.path||image.originalPath!==m.originalAssetPath||image.sha256!==m.sha256||image.width!==m.width||image.height!==m.height||!image.modifications.includes(PHOTO_RECIPE))fail(422,'admin.error.imageIntegrity')
   for(const [to,from]of [[m.path,m.webpPath],[m.originalAssetPath,m.originalPath]]){const b=await bytes(from);newAssets.set(to,b);dependencies.set(from,digest(b));if(stage)await stageWrite(stage,to,b)}
  }
  return {dependencies,newAssets}
 }
 const stageWrite=async(stage,p,b)=>{const target=await path(`${stage}/${p}`);await mkdir(dirname(target),{recursive:true});await writeFile(target,b)}
 const plans=new Map()
 async function cleanStage(stage){if(!/^data\/drafts\/staging\/[a-f0-9-]+$/.test(stage))throw Error('Unsafe staging cleanup');await rm(await path(stage),{recursive:true,force:true})}
 async function prepare({document,baseRevision}){return locked(async()=>{
  const current=await catalog();if(current.revision!==baseRevision)fail(409,'admin.error.conflict')
  let doc;try{doc=importSource(JSON.stringify(document))}catch(e){fail(422,e.message,e.details)}
  if(!equal({...doc,catalog:[]},{...current.document,catalog:[]}))fail(422,'admin.error.archive')
  const errors=publicationErrors(doc);if(errors.length)fail(422,'admin.error.schema',errors)
  for(const [id,p]of plans)if(p.expires<Date.now()){await cleanStage(p.stage);plans.delete(id)}
  if(plans.size>=4)fail(429,'admin.error.busy')
  const token=randomUUID(),stage=`data/drafts/staging/${token}`
  try{
   const {dependencies,newAssets}=await validateImages(doc,current.document,stage)
   for(const input of INPUTS){const b=await bytes(input);dependencies.set(input,digest(b));await stageWrite(stage,input,b)}
   await stageWrite(stage,'data/species.source.json',encode(doc));await generator(await path(stage))
   const diff=catalogueDiff(current.document,doc),plan={stage,baseRevision,document:doc,dependencies,newAssets,diff,expires:Date.now()+10*60*1000}
   plans.set(token,plan);return {token,diff,baseRevision,expiresAt:new Date(plan.expires).toISOString()}
  }catch(e){await cleanStage(stage);if(e instanceof AdminError)throw e;fail(422,'admin.error.validation',[e.message])}
 })}
 async function transact(changes){
  const id=randomUUID(),dir=`data/drafts/transactions/${id}`
  const entries=[]
  for(const [file,b]of changes){let old=null;try{old=await bytes(file)}catch(e){if(e.code!=='ENOENT')throw e};if(b!==null&&old?.equals(b))continue;const backup=`${dir}/${entries.length}.bak`;if(old)await atomic(backup,old);entries.push({file,backup:old?backup:null,oldHash:old?digest(old):null,newHash:b===null?null:digest(b),bytes:b})}
  const journal=status=>atomic(`${dir}/journal.json`,encode({id,status,entries:entries.map(({bytes,...e})=>e)}))
  // An interrupted multi-file operation is recoverable; never silently clear its journal.
  await journal('applying');const written=[]
  try{for(const entry of entries){let b=null;try{b=await bytes(entry.file)}catch(e){if(e.code!=='ENOENT')throw e};if((b?digest(b):null)!==entry.oldHash)fail(409,'admin.error.conflict');if(entry.bytes===null)await unlink(await path(entry.file));else await atomic(entry.file,entry.bytes);written.push(entry)}
   await generator(root,{check:true});await journal('committed')
  }catch(error){let recovery=false;for(const e of written.reverse()){try{let b=null;try{b=await bytes(e.file)}catch(x){if(x.code!=='ENOENT')throw x};if((b?digest(b):null)!==e.newHash){recovery=true;continue}if(e.backup)await atomic(e.file,await bytes(e.backup));else await unlink(await path(e.file))}catch{recovery=true}}
   await journal(recovery?'recovery-required':'rolled-back');if(recovery)fail(500,'admin.error.recovery');throw error
  }
 }
 async function pendingRecovery(){let folders=[];try{folders=await readdir(await path('data/drafts/transactions'))}catch(e){if(e.code!=='ENOENT')throw e};for(const f of folders){if(!/^[a-f0-9-]+$/.test(f))continue;const j=await json(`data/drafts/transactions/${f}/journal.json`);if(['applying','recovery-required'].includes(j.status))return true}return false}
 async function apply({token,baseRevision,confirmed}){return locked(async()=>{
  if(confirmed!==true)fail(400,'admin.error.confirmation')
  if(await pendingRecovery())fail(409,'admin.error.recovery')
  const p=plans.get(token);if(!p||p.expires<Date.now())fail(409,'admin.error.planExpired')
  if((await catalog()).revision!==baseRevision||p.baseRevision!==baseRevision)fail(409,'admin.error.conflict')
  for(const [file,h]of p.dependencies)if(digest(await bytes(file))!==h)fail(409,'admin.error.conflict')
  const changes=new Map(p.newAssets)
  // Refuse collisions: even content-addressed target assets cannot overwrite an unrelated file.
  for(const [file,b]of p.newAssets){try{if(!(await bytes(file)).equals(b))fail(409,'admin.error.imageIntegrity')}catch(e){if(e.code!=='ENOENT')throw e}}
  changes.set('data/species.source.json',await bytes(`${p.stage}/data/species.source.json`))
  for(const output of OUTPUTS)changes.set(output,await bytes(`${p.stage}/${output}`))
  const generated=await readdir(await path(`${p.stage}/public/images/approved`));for(const name of generated)changes.set('public/images/approved/'+name,await bytes(`${p.stage}/public/images/approved/${name}`))
  const old=await readdir(await path('public/images/approved'));for(const name of old)if(!generated.includes(name)){if(!/^[a-z0-9-]+\.(webp|png|jpe?g)$/.test(name))fail(422,'admin.error.path');changes.set('public/images/approved/'+name,null)}
  await transact(changes);plans.delete(token);await cleanStage(p.stage)
  const result=await catalog();return {...result,diff:p.diff,gitCommitted:false,deployed:false}
 })}
 async function migrate({envelope}){return locked(async()=>{if(!jsonSafe(envelope)||!editableShape(envelope?.current)||!Array.isArray(envelope.assets))fail(422,'admin.error.draft');try{importSource(JSON.stringify(envelope.original))}catch{fail(422,'admin.error.draft')};if(!equal(envelope.current.demoArchive,envelope.original.demoArchive))fail(422,'admin.error.archive');const id=digest(encode(envelope)),file=`data/drafts/migrations/${id}.json`;try{await bytes(file);return {id,alreadyMigrated:true}}catch(e){if(e.code!=='ENOENT')throw e};await atomic(file,encode({documentType:'legacy-browser-draft',envelope,note:'Imported explicitly; not installed over the live catalogue. Browser-only file bytes are not recoverable.'}));return {id,alreadyMigrated:false}})}
 async function exportBundle(){
  const saved=await draft();if(!saved.envelope)fail(404,'admin.noPrevious')
  const envelope=structuredClone(saved.envelope),receipts=new Map()
  // Include local images even after apply cleared transient upload descriptors.
  for(const [speciesIndex,s]of envelope.current.catalog.entries())for(const [index,image]of s.images.entries()){
   const id=image.originalSha256
   if(!hash(id)||!hash(image.sha256)||image.path!==`assets/images/species/local-${image.sha256}.webp`)continue
   let m
   try{m=await media(id)}catch(e){
    if(e.code!=='ENOENT')throw e
    const format=image.originalPath?.split('.').at(-1)
    if(!['jpeg','png','webp'].includes(format)||image.originalPath!==`assets/images/originals/${id}.${format}`)fail(422,'admin.error.imageIntegrity')
    const raw=await bytes(image.originalPath),webp=await bytes(image.path)
    if(digest(raw)!==id||digest(webp)!==image.sha256)fail(422,'admin.error.imageIntegrity')
    m={id,format,fileName:'original.'+format,originalSha256:id,originalPath:image.originalPath,webpPath:image.path,originalWidth:image.originalWidth,originalHeight:image.originalHeight,width:image.width,height:image.height,sha256:image.sha256,size:raw.length}
   }
   receipts.set(id,m)
   if(!envelope.assets.some(a=>a.speciesIndex===speciesIndex&&a.index===index))envelope.assets.push({id,speciesIndex,index,size:m.size,fileName:m.fileName,sha256:m.sha256,prepared:true})
  }
  const items=[]
  for(const id of new Set(envelope.assets.map(a=>a.id))){const m=receipts.get(id)||await media(id);items.push({receipt:m,originalBase64:(await bytes(m.originalPath)).toString('base64'),webpBase64:(await bytes(m.webpPath)).toString('base64')})}
  const bundle={version:1,documentType:'muras-local-draft-bundle',envelope,media:items};if(encode(bundle).length>BUNDLE_LIMIT)fail(413,'admin.error.bundleSize');return bundle
 }
 async function importBundle(body){return locked(async()=>{
  if(!hash(body.bundle?.envelope?.baseRevision)||body.bundle?.version!==1||body.bundle.documentType!=='muras-local-draft-bundle'||!Array.isArray(body.bundle.media)||body.bundle.media.length>100)fail(422,'admin.error.draft')
  const saved=await draft();if(saved.revision!==body.draftRevision)fail(409,'admin.error.draftConflict');envelopeCheck(body.bundle.envelope,(await catalog()).document)
  for(const item of body.bundle.media){const r=item.receipt;if(!hash(r?.id)||r.id!==r.originalSha256||!hash(r.sha256)||!['jpeg','png','webp'].includes(r.format))fail(422,'admin.error.imageIntegrity')
   const raw=Buffer.from(item.originalBase64||'','base64'),webp=Buffer.from(item.webpBase64||'','base64');if(!raw.length||raw.length>MAX_IMAGE_BYTES||webp.length>MAX_IMAGE_BYTES||digest(raw)!==r.id||digest(webp)!==r.sha256||imageFormat(raw)!==r.format||imageFormat(webp)!=='webp')fail(422,'admin.error.imageIntegrity')
   const original=`data/drafts/media/${r.id}.original.${r.format}`,optimized=`data/drafts/media/${r.id}.optimized.webp`
   const receipt={id:r.id,format:r.format,fileName:'imported.'+r.format,originalSha256:r.id,originalWidth:r.originalWidth,originalHeight:r.originalHeight,width:r.width,height:r.height,sha256:r.sha256,size:raw.length,prepared:true,modifications:[PHOTO_RECIPE],path:`assets/images/species/local-${r.sha256}.webp`,originalAssetPath:`assets/images/originals/${r.id}.${r.format}`}
   await atomic(original,raw);await atomic(optimized,webp);const a=await inspect(original),b=await inspect(optimized)
   if(a.width!==r.originalWidth||a.height!==r.originalHeight||b.width!==r.width||b.height!==r.height)fail(422,'admin.error.imageIntegrity')
   await atomic(`data/drafts/media/${r.id}.json`,encode(receipt))
  }
  for(const a of body.bundle.envelope.assets)await media(a.id)
  if(saved.envelope)await atomic('data/drafts/previous.json',encode(saved.envelope))
  const value={...body.bundle.envelope,version:1};await atomic('data/drafts/current.json',encode(value));return {envelope:value,revision:digest(encode(value))}
 })}
 async function latestMigration(){let files=[];try{files=await readdir(await path('data/drafts/migrations'))}catch(e){if(e.code!=='ENOENT')throw e};const entries=await Promise.all(files.filter(f=>/^[a-f0-9]{64}\.json$/.test(f)).map(async f=>({file:f,mtime:(await lstat(await path('data/drafts/migrations/'+f))).mtimeMs})));entries.sort((a,b)=>b.mtime-a.mtime);if(!entries.length)return {envelope:null};const record=await json('data/drafts/migrations/'+entries[0].file);return {envelope:{original:record.envelope.original,current:record.envelope.current,assets:[],baseRevision:digest(encode(record.envelope.original))},missingMaterials:record.envelope.assets.length}}
 return {catalog,draft,saveDraft,prepare,apply,upload,media,migrate,latestMigration,exportBundle,importBundle,previous:async()=>{const d=await optional('data/drafts/previous.json');return {envelope:d.value,revision:d.revision}},preview:async id=>bytes((await media(id)).webpPath),close:async()=>{await operations;for(const p of plans.values())await cleanStage(p.stage);plans.clear()}}
}
