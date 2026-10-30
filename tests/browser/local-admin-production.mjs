// Audit the actual production output. This never starts the local write service.
import assert from 'node:assert/strict'
import {readFile,readdir,writeFile,mkdir} from 'node:fs/promises'
import {resolve} from 'node:path'
import {preview} from 'vite'
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright')
const root=process.cwd(),before=await readFile(resolve(root,'data/species.source.json'))
const forbidden=['/__muras_admin','muras-local-draft-bundle','admin.files.apply','data/drafts/current.json']
const files=await readdir(resolve(root,'dist/assets'))
assert.equal(files.some(f=>f.startsWith('AdminApp-')),false)
for(const file of files.filter(f=>f.endsWith('.js')))for(const text of forbidden)assert.ok(!(await readFile(resolve(root,'dist/assets',file),'utf8')).includes(text),file+': '+text)
const server=await preview({root,preview:{host:'127.0.0.1',port:5187,strictPort:true}})
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE})
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message))
 await page.goto('http://127.0.0.1:5187/admin/');assert.equal(await page.locator('script').count(),0);assert.equal(await page.getByRole('button').count(),0);assert.ok((await page.locator('body').textContent()).includes('Редактор доступен только локально.'))
 const denied=await page.request.post('http://127.0.0.1:5187/__muras_admin/apply',{data:{confirmed:true},headers:{'X-Muras-Editor':'1','Origin':'http://127.0.0.1:5187'}});assert.ok(denied.status()>=400)
 await page.goto('http://127.0.0.1:5187/');await page.locator('.species-card').first().waitFor()
 const data=await(await page.request.get('http://127.0.0.1:5187/data/species.json')).json();assert.equal(data.length,184)
 assert.ok((await readFile(resolve(root,'data/species.source.json'))).equals(before));assert.deepEqual(errors,[])
 const report={passed:4,checks:['No working admin or write client in production chunks','Static /admin/ has no editor or executable scripts','Production POST to write endpoint is refused','Public catalogue still renders 184 records; source bytes unchanged'],errors}
 await mkdir('.generated/local-admin',{recursive:true});await writeFile('.generated/local-admin/production-results.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2))
}finally{await browser.close();await new Promise(r=>server.httpServer.close(r))}
