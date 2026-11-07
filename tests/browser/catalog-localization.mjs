import assert from 'node:assert/strict'
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {resolve} from 'node:path'
import {createServer} from 'vite'
import {localAdminFixture,repository} from '../helpers/local-admin-fixture.mjs'
import {createAdminService} from '../../scripts/local-admin/service.mjs'
import {adminMiddleware} from '../../scripts/local-admin/http.mjs'
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright')
const fixture=await localAdminFixture(),service=await createAdminService({root:fixture.root})
const vite=await createServer({root:repository,define:{__MURAS_LOCAL_ADMIN__:'true'},plugins:[{name:'translation-test-api',configureServer(s){s.middlewares.use(adminMiddleware(service))}}],server:{host:'127.0.0.1',port:5186,strictPort:true,cors:false,watch:null},logLevel:'error'})
await vite.listen();const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE})
const base='http://127.0.0.1:5186',before=await readFile(resolve(repository,'data/species.source.json')),source=JSON.parse(before),results=[],errors=[]
try{
 for(const lang of ['ky','ru','uz','en']){
  const ctx=await browser.newContext({viewport:{width:1300,height:900}});await ctx.addInitScript(l=>localStorage.setItem('redbook.locale.v1',l),lang)
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message))
  for(const id of ['irbis','argali','golden-eagle','eduards-fritillary']){
   await page.goto(base+'/species/'+id);await page.locator('section[aria-labelledby="profile-about"] .scientific-content > span').first().waitFor()
   const paragraphs=page.locator('section[aria-labelledby="profile-about"] .scientific-content > span'),s=source.catalog.find(s=>s.id===id)
   assert.deepEqual(await paragraphs.allTextContents(),s.content.overview.text[lang].split('\n\n'))
   assert.deepEqual(await paragraphs.evaluateAll(nodes=>nodes.map(n=>n.lang)),[lang,lang]);results.push(`${id} ${lang}: full real profile, two paragraphs and correct lang`)
  }
  await page.goto(base+'/');await page.locator('.species-card').first().waitFor();await page.locator('.species-card .card-open').first().click();await page.locator('dialog[open]').waitFor();assert.ok((await page.locator('dialog[open]').textContent()).includes(source.catalog[0].content.overview.text[lang].split('\n\n')[0]));results.push(`${lang}: actual catalogue card and modal translation`)
  await page.goto(base+'/admin/');await page.locator('.admin-table').waitFor();await page.locator('[data-testid="translation-filter"]').selectOption('uz');assert.ok(await page.locator('.admin-table tbody tr').count()>0)
  await page.locator('.admin-row-actions button').first().click();await page.locator('[data-testid="translation-status"]').waitFor();assert.ok((await page.locator('[data-testid="translation-status"]').textContent()).includes('UZ'))
  assert.ok(await page.locator('input[lang="uz"]').count());results.push(`${lang}: actual admin completeness/filter and separate language editing`)
  await ctx.close()
 }
 const ctx=await browser.newContext();await ctx.addInitScript(()=>localStorage.setItem('redbook.locale.v1','en'));const page=await ctx.newPage()
 await page.goto(base+'/species/manul');await page.locator('section[aria-labelledby="profile-about"] .scientific-content > span').first().waitFor();assert.equal(await page.locator('section[aria-labelledby="profile-about"] .scientific-content > span').first().getAttribute('lang'),'ru');assert.ok(await page.locator('section[aria-labelledby="profile-about"] .language-note').count());results.push('untranslated profile: explicitly labelled Russian fallback')
 await page.goto(base+'/species/irbis');await page.locator('.language-trigger').click();await page.locator('[role="menuitemradio"][lang="ky"]').click();assert.equal(await page.locator('section[aria-labelledby="profile-about"] .scientific-content > span').first().getAttribute('lang'),'ky');results.push('real language menu updates scientific content without reload')
 await page.goto(base+'/admin/');await page.locator('.admin-table').waitFor();await page.locator('.admin-row-actions button').first().click();await page.locator('input[lang="uz"]').fill('')
 await page.locator('.admin-header select').selectOption('ru');await page.getByRole('button',{name:'Сохранить черновик',exact:true}).click();await page.getByText('Черновик сохранён в файлах проекта. Каталог не изменён.',{exact:true}).waitFor();assert.ok((await service.draft()).envelope);assert.ok((await page.locator('[data-testid="translation-status"]').textContent()).includes('Не все переводы'));results.push('incomplete translation saves to disposable file draft without marking it complete or changing source')
 assert.ok((await readFile(resolve(repository,'data/species.source.json'))).equals(before));assert.deepEqual(errors,[])
 await mkdir('.generated/localization',{recursive:true});await writeFile('.generated/localization/browser-results.json',JSON.stringify({passed:results.length,results,errors},null,2)+'\n');console.log(JSON.stringify({passed:results.length,results,errors},null,2))
}finally{await browser.close();await vite.close();await service.close();await fixture.cleanup()}
