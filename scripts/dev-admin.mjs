// This entry point is deliberately absent from the browser/production dependency graph.
import {createServer} from 'vite'
import {resolve} from 'node:path'
import {createAdminService} from './local-admin/service.mjs'
import {adminMiddleware} from './local-admin/http.mjs'
const root=resolve(import.meta.dirname,'..')
const service=await createAdminService({root})
const server=await createServer({root,define:{__MURAS_LOCAL_ADMIN__:'true'},plugins:[{name:'muras-local-file-editor',configureServer(vite){vite.middlewares.use(adminMiddleware(service))}}],server:{host:'127.0.0.1',port:5173,strictPort:true,cors:false,allowedHosts:['127.0.0.1'],fs:{deny:['**/.git/**','**/data/drafts/**','**/.env*','**/*.{crt,pem}','**/.npmrc']}}})
await server.listen();server.printUrls();console.log('Local editor: http://127.0.0.1:5173/admin/ - files remain uncommitted until you use Git.')
let stopping=false
async function stop(){if(stopping)return;stopping=true;await server.close();await service.close();process.exit(0)}
process.on('SIGINT',stop);process.on('SIGTERM',stop)
