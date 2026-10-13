export const MAX_IMAGE_BYTES = 20 * 1024 * 1024
export const MAX_IMAGE_PIXELS = 40 * 1000 * 1000
export function imageFormat(bytes) {
  if(bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return 'jpeg'
  if([137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))return 'png'
  if(String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP')return 'webp'
  return null
}
export async function inspectImage(file, { createUrl=URL.createObjectURL, revokeUrl=URL.revokeObjectURL,
  createImage=()=>new Image(), hash=buffer=>crypto.subtle.digest('SHA-256',buffer), timeout=15000, signal } = {}) {
  if(!file || file.size <= 0 || file.size > MAX_IMAGE_BYTES)throw new Error('admin.error.imageSize')
  const buffer=await file.arrayBuffer(), format=imageFormat(new Uint8Array(buffer))
  const extension=file.name.split('.').at(-1).toLowerCase().replace(/^jpg$/,'jpeg')
  if(!format || extension!==format || file.type && file.type !== `image/${format}`)throw new Error('admin.error.imageFormat')
  const url=createUrl(file)
  try {
    if(signal?.aborted)throw new Error('admin.error.cancelled')
    const size=await new Promise((resolve,reject)=>{
      const image=createImage()
      const abort=()=>finish(new Error('admin.error.cancelled'))
      const finish=(error)=>{const size={width:image.naturalWidth,height:image.naturalHeight};clearTimeout(timer);signal?.removeEventListener('abort',abort);image.onload=null;image.onerror=null;image.removeAttribute?.('src');error?reject(error):resolve(size)}
      const timer=setTimeout(()=>finish(new Error('admin.error.imageDecode')),timeout)
      signal?.addEventListener('abort',abort,{once:true})
      image.onload=()=>finish(!image.naturalWidth || image.naturalWidth*image.naturalHeight>MAX_IMAGE_PIXELS ? new Error('admin.error.imageSize') : null)
      image.onerror=()=>finish(new Error('admin.error.imageDecode'));image.src=url
    })
    const sha256=[...new Uint8Array(await hash(buffer))].map(n=>n.toString(16).padStart(2,'0')).join('')
    if(signal?.aborted)throw new Error('admin.error.cancelled')
    return { url,...size,sha256,fileName:file.name,size:file.size,format }
  } catch(error) {revokeUrl(url);throw error}
}
export function createImageSession({revoke=URL.revokeObjectURL,maxBytes=60*1024*1024}={}) {
  const files=new Map()
  return {
    put(id,file) {
      const total=[...files].reduce((sum,[key,v])=>sum+(key===id?0:v.size),0)
      if(total+file.size>maxBytes){revoke(file.url);throw new Error('admin.error.sessionSize')}
      const old=files.get(id);if(old)revoke(old.url);files.set(id,file)
    },
    get:id=>files.get(id)?.url || null,
    retain(ids) {for(const[id,file]of files)if(!ids.includes(id)){revoke(file.url);files.delete(id)}},
    dispose(){for(const file of files.values())revoke(file.url);files.clear()},
  }
}
