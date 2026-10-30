import {AdminError,JSON_LIMIT,BUNDLE_LIMIT} from './service.mjs'
import {MAX_IMAGE_BYTES} from '../../src/admin/data/images.js'
const reply=(res,status,value)=>{res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.end(JSON.stringify(value))}
async function body(req,limit,raw=false){
 if(Number(req.headers['content-length'])>limit){req.resume();throw new AdminError(413,'admin.error.jsonSize')}
 const chunks=[];let size=0
 await new Promise((resolve,reject)=>{req.setTimeout(15000,()=>{reject(new AdminError(408,'admin.error.timeout'));req.destroy()});req.on('data',chunk=>{size+=chunk.length;if(size>limit){reject(new AdminError(413,'admin.error.jsonSize'));return}chunks.push(chunk)});req.on('end',resolve);req.on('aborted',()=>reject(new AdminError(400,'admin.error.json')));req.on('error',reject)}).finally(()=>req.setTimeout(0))
 if(raw)return Buffer.concat(chunks)
 if(req.headers['content-type']?.split(';')[0]!=='application/json')throw new AdminError(415,'admin.error.json')
 try{return JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{throw new AdminError(400,'admin.error.json')}
}
export function adminMiddleware(service){return async(req,res,next)=>{
 if(!req.url?.startsWith('/__muras_admin'))return next()
 try{
  const origin=`http://127.0.0.1:${req.socket.localPort}`
  if(req.headers.host!==`127.0.0.1:${req.socket.localPort}`||req.headers.origin&&req.headers.origin!==origin||req.headers['x-muras-editor']!=='1'||req.headers['sec-fetch-site']==='cross-site'||!['127.0.0.1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress))throw new AdminError(403,'admin.error.origin')
  const url=new URL(req.url,origin),route=url.pathname.slice('/__muras_admin'.length)
  if(url.search)throw new AdminError(404,'admin.error.route')
  const key=req.method+' '+route
  let value
  if(key==='GET /catalog')value=await service.catalog()
  else if(key==='GET /draft')value=await service.draft()
  else if(key==='GET /migration')value=await service.latestMigration()
  else if(key==='GET /previous')value=await service.previous()
  else if(key==='PUT /draft')value=await service.saveDraft(await body(req,JSON_LIMIT))
  else if(key==='POST /prepare')value=await service.prepare(await body(req,MAX_SOURCE))
  else if(key==='POST /apply')value=await service.apply(await body(req,4096))
  else if(key==='POST /migrate')value=await service.migrate(await body(req,JSON_LIMIT))
  else if(key==='GET /bundle')value=await service.exportBundle()
  else if(key==='POST /bundle')value=await service.importBundle(await body(req,BUNDLE_LIMIT))
  else if(key==='POST /media')value=await service.upload(await body(req,MAX_IMAGE_BYTES,true),{fileName:decodeURIComponent(req.headers['x-file-name']||''),sha256:req.headers['x-content-sha256'],mime:req.headers['content-type']})
  else if(req.method==='GET'&&/^\/media\/[a-f0-9]{64}$/.test(route)){res.setHeader('Content-Type','image/webp');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.end(await service.preview(route.split('/').at(-1)));return}
  else throw new AdminError(404,'admin.error.route')
  reply(res,200,value)
 }catch(error){if(error.status===413){req.resume();if(!req.complete){req.setTimeout(15000,()=>req.destroy());req.once('end',()=>req.setTimeout(0))}}
  if(!error.status)console.error('[MURAS local admin]',error)
  reply(res,error.status||500,{error:error.status?error.message:error.code==='ENOSPC'?'admin.error.disk':'admin.error.server',details:error.details||[]})}
}}
const MAX_SOURCE=JSON_LIMIT
