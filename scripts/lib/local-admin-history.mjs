import {execFileSync} from 'node:child_process'
import {checkoutBytesMatching} from './historical-checksum.mjs'
const BASE='50951765ab52c32fdae30309cc19ede7e9bd279d'
const FILES=new Set(['.gitignore','README.md','package.json','vite.config.js','src/main.js','scripts/admin-entry.mjs','tests/admin.test.mjs','tests/uz-localization.test.mjs','src/admin/AdminApp.vue','src/admin/useAdminEditor.js','src/admin/components/PhotoEditor.vue','src/admin/components/LocalizedFields.vue',...['ky','uz','ru','en'].map(l=>`src/admin/locales/${l}.json`)])
const cache=new Map()
export function localAdminHistoricalBytes(root,path,expected){
 if(!FILES.has(path)||!expected)return null
 const key=JSON.stringify([root,path])
 if(!cache.has(key))cache.set(key,execFileSync('git',['show',`${BASE}:${path}`],{cwd:root,windowsHide:true,maxBuffer:16*1024*1024}))
 return checkoutBytesMatching(path,cache.get(key),expected)
}
