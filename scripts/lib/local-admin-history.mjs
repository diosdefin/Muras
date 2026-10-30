import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
const BASE='50951765ab52c32fdae30309cc19ede7e9bd279d'
const FILES=new Set(['.gitignore','README.md','package.json','vite.config.js','src/main.js','scripts/admin-entry.mjs','tests/admin.test.mjs','tests/uz-localization.test.mjs','src/admin/AdminApp.vue','src/admin/useAdminEditor.js','src/admin/components/PhotoEditor.vue',...['ky','uz','ru','en'].map(l=>`src/admin/locales/${l}.json`)])
const sha=b=>createHash('sha256').update(b).digest('hex'),cache=new Map()
export function localAdminHistoricalBytes(root,path,expected){
 if(!FILES.has(path)||!expected)return null
 if(!cache.has(path))cache.set(path,execFileSync('git',['show',`${BASE}:${path}`],{cwd:root,windowsHide:true,maxBuffer:16*1024*1024}))
 const raw=cache.get(path),lf=Buffer.from(raw.toString('utf8').replace(/\r\n/g,'\n')),crlf=Buffer.from(lf.toString('utf8').replace(/\n/g,'\r\n'))
 return [raw,lf,crlf].find(b=>sha(b)===expected)||null
}
