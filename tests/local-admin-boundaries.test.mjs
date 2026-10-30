import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {execFileSync} from 'node:child_process'
import {localAdminHistoricalBytes} from '../scripts/lib/local-admin-history.mjs'
import {createLocalAdminAPI} from '../src/admin/data/local-api.js'
const read=p=>readFileSync(p,'utf8')
test('local editor historical scope checks authentic pre-feature bytes, never catalogue or media replacements',()=>{
 const bytes=execFileSync('git',['show','50951765ab52c32fdae30309cc19ede7e9bd279d:package.json'])
 const hash=createHash('sha256').update(bytes).digest('hex');assert.deepEqual(localAdminHistoricalBytes(process.cwd(),'package.json',hash),bytes)
 for(const path of ['data/species.source.json','public/data/species.json','assets/images/species/irbis.webp','src/data/species-model.js','src/locales/ru.json'])assert.equal(localAdminHistoricalBytes(process.cwd(),path,hash),null)
 assert.equal(localAdminHistoricalBytes(process.cwd(),'package.json','0'.repeat(64)),null)
})
test('local client carries same-origin headers, revision and confirmation and has a localized offline state',async()=>{
 const requests=[],api=createLocalAdminAPI(async(url,options)=>{requests.push({url,...options});return{ok:true,json:async()=>({})}})
 await api.catalog();await api.apply({token:'fixture',baseRevision:'f'.repeat(64),confirmed:true})
 assert.equal(requests[0].headers['X-Muras-Editor'],'1');assert.equal(requests[0].credentials,'same-origin');assert.equal(requests[0].cache,'no-store')
 assert.deepEqual(JSON.parse(requests[1].body),{token:'fixture',baseRevision:'f'.repeat(64),confirmed:true})
 await assert.rejects(()=>createLocalAdminAPI(async()=>{throw Error('offline')}).catalog(),/admin.error.localServer/)
})
test('working admin requires the dev-only entry; scientific validators remain outside historical exceptions',()=>{
 assert.ok(read('src/main.js').includes('import.meta.env.DEV && __MURAS_LOCAL_ADMIN__'))
 assert.ok(read('vite.config.js').includes("__MURAS_LOCAL_ADMIN__: 'false'"))
 const script=read('scripts/dev-admin.mjs');assert.ok(script.includes("host:'127.0.0.1'"));assert.ok(script.includes('cors:false'));assert.ok(script.includes('adminMiddleware(service)'))
 assert.ok(!read('src/admin/AdminApp.vue').includes('В·'));assert.ok(!read('src/admin/components/PhotoEditor.vue').includes('Г—'))
 assert.ok(read('.gitignore').split(/\r?\n/).includes('data/drafts/'))
})
