const PREFIX='/__muras_admin'
export function createLocalAdminAPI(fetcher=globalThis.fetch){
 async function request(route,{method='GET',body,headers={},raw=false}={}){
  let response
  try{response=await fetcher(PREFIX+route,{method,cache:'no-store',credentials:'same-origin',headers:{'X-Muras-Editor':'1',...(body&&!raw?{'Content-Type':'application/json'}:{}),...headers},...(body?{body:raw?body:JSON.stringify(body)}:{})})}catch{throw Error('admin.error.localServer')}
  if(!response.ok){let result;try{result=await response.json()}catch{};const error=Error(result?.error||'admin.error.localServer');error.details=result?.details||[];error.status=response.status;throw error}
  return response.json()
 }
 return {catalog:()=>request('/catalog'),latestMigration:()=>request('/migration'),draft:()=>request('/draft'),previous:()=>request('/previous'),saveDraft:body=>request('/draft',{method:'PUT',body}),prepare:body=>request('/prepare',{method:'POST',body}),apply:body=>request('/apply',{method:'POST',body}),migrate:envelope=>request('/migrate',{method:'POST',body:{envelope}}),exportBundle:()=>request('/bundle'),importBundle:body=>request('/bundle',{method:'POST',body}),upload:async(file,sha256)=>request('/media',{method:'POST',body:file,raw:true,headers:{'Content-Type':file.type,'X-File-Name':encodeURIComponent(file.name),'X-Content-SHA256':sha256}}),preview:async id=>{
  const response=await fetcher(PREFIX+'/media/'+id,{headers:{'X-Muras-Editor':'1'},cache:'no-store'});if(!response.ok)throw Error('admin.error.imageIntegrity');return URL.createObjectURL(await response.blob())
 }}
}
