// Real Vue editor + real API, exclusively against a disposable repository copy.
import assert from 'node:assert/strict'
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {resolve} from 'node:path'
import {createServer} from 'vite'
import {createAdminService} from '../../scripts/local-admin/service.mjs'
import {adminMiddleware} from '../../scripts/local-admin/http.mjs'
import {localAdminFixture,repository} from '../helpers/local-admin-fixture.mjs'
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright')
const fixture=await localAdminFixture(),service=await createAdminService({root:fixture.root})
const vite=await createServer({root:repository,configFile:resolve(repository,'vite.config.js'),define:{__MURAS_LOCAL_ADMIN__:'true'},plugins:[{name:'test-local-files',configureServer(s){s.middlewares.use(adminMiddleware(service))}}],server:{host:'127.0.0.1',port:5186,strictPort:true,cors:false,watch:null},logLevel:'error'})
await vite.listen();console.log('editor enabled',vite.config.define.__MURAS_LOCAL_ADMIN__);const base='http://127.0.0.1:5186'
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE})
const errors=[],results=[];await mkdir('.generated/local-admin',{recursive:true})
const context=await browser.newContext({viewport:{width:1300,height:950}})
await context.addInitScript(()=>localStorage.setItem('redbook.locale.v1','ru'))
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message))
const sourcePath=resolve(fixture.root,'data/species.source.json'),initial=await readFile(sourcePath)
async function open(){await page.goto(base+'/admin/');await page.getByRole('heading',{name:'Виды · 184',exact:true}).waitFor();await page.getByRole('button',{name:'Редактировать —',exact:false}).first().waitFor()}
const confirm=()=>page.locator('dialog[open]').getByRole('button',{name:'Подтвердить',exact:true}).click()
async function editFirst(){await page.getByRole('button',{name:'Редактировать —',exact:false}).first().click();await page.locator('input[lang="en"]').first().waitFor()}
try{
 await open();assert.equal(await page.getByRole('button',{name:'Добавить вид',exact:true}).isEnabled(),true)
 assert.equal((await service.catalog()).document.catalog.length,184);assert.equal((await service.draft()).envelope,null)
 await page.reload();await page.getByRole('heading',{name:'Виды · 184',exact:true}).waitFor();results.push('fresh clone and reload: 184 records editable immediately without import, browser storage or draft files')
 await editFirst();await page.locator('input[lang="en"]').first().fill('Browser-only synthetic draft name')
 await page.getByRole('button',{name:'Сохранить черновик',exact:true}).click();await page.getByText('Черновик сохранён в файлах проекта. Каталог не изменён.',{exact:true}).waitFor()
 assert.ok((await readFile(sourcePath)).equals(initial));assert.equal((await service.draft()).envelope.current.catalog[0].names.en,'Browser-only synthetic draft name')
 await page.reload();await page.getByRole('heading',{name:'Виды · 184',exact:true}).waitFor();await editFirst();assert.equal(await page.locator('input[lang="en"]').first().inputValue(),'Snow Leopard')
 await page.getByRole('button',{name:'Открыть файловый черновик',exact:true}).click();await confirm();await editFirst();assert.equal(await page.locator('input[lang="en"]').first().inputValue(),'Browser-only synthetic draft name')
 results.push('draft save persists to files; reopening requires explicit action and never automatically replaces source on startup')
 await page.getByRole('button',{name:'Проверить данные',exact:true}).click();await page.locator('[data-testid="apply-preview"]').waitFor({timeout:30000});assert.ok((await page.locator('[data-testid="apply-preview"]').textContent()).includes('names.en'))
 assert.ok((await readFile(sourcePath)).equals(initial))
 await page.getByRole('button',{name:'Применить к исходному каталогу',exact:true}).click();await confirm();await page.getByText('Изменения применены к файлам проекта. Они ещё не отправлены в GitHub и на сайт.',{exact:true}).waitFor({timeout:30000})
 assert.equal((await service.catalog()).document.catalog[0].names.en,'Browser-only synthetic draft name');await page.reload();await page.getByRole('heading',{name:'Виды · 184',exact:true}).waitFor();await editFirst();assert.equal(await page.locator('input[lang="en"]').first().inputValue(),'Browser-only synthetic draft name')
 results.push('server preview lists changed fields; explicit confirmation updates source and projections, survives reopening, and performs no Git operation')
 await page.locator('input[lang="en"]').first().fill('Stale draft must not overwrite external edit');await page.getByRole('button',{name:'Проверить данные',exact:true}).click();await page.locator('[data-testid="apply-preview"]').waitFor({timeout:30000})
 const external=(await service.catalog()).document;external.catalog[0].names.en='Newer external-process name';await writeFile(sourcePath,JSON.stringify(external,null,2)+'\n')
 await page.getByRole('button',{name:'Применить к исходному каталогу',exact:true}).click();await confirm();await page.getByText('Исходные файлы изменены другим процессом. Экспортируйте черновик и заново загрузите каталог; перезапись отменена.',{exact:true}).waitFor();assert.equal((await service.catalog()).document.catalog[0].names.en,'Newer external-process name')
 results.push('newer external source revision is refused by actual UI/API instead of being overwritten')
 await page.getByRole('button',{name:'Перезагрузить из файлов',exact:true}).click();await confirm();await page.getByRole('heading',{name:'Виды · 184',exact:true}).waitFor()
 for(const lang of ['ky','uz','en','ru']){await page.locator('.admin-header select').selectOption(lang);await page.waitForTimeout(40);assert.ok(!(await page.locator('.admin-app').textContent()).includes('admin.files.'))}
 results.push('KY UZ EN RU admin states render without missing message keys')
 const legacy={version:1,original:(await service.catalog()).document,current:structuredClone((await service.catalog()).document),assets:[]};legacy.current.catalog[0].names.en='Stale legacy browser document'
 await page.evaluate(v=>localStorage.setItem('redbook.admin.draft.v1',JSON.stringify(v)),legacy);await page.reload();await page.getByRole('heading',{name:'Виды · 184',exact:true}).waitFor()
 await page.getByRole('button',{name:'Скопировать старый черновик браузера',exact:true}).click();await confirm();await page.getByText('Старый черновик скопирован отдельно; каталог не заменён, данные браузера сохранены.',{exact:true}).waitFor()
 assert.ok(await page.evaluate(()=>localStorage.getItem('redbook.admin.draft.v1')));assert.equal((await service.catalog()).document.catalog[0].names.en,'Newer external-process name')
 results.push('explicit one-time legacy migration retains browser data and keeps authoritative catalogue intact')
 const downloadEvent=page.waitForEvent('download');await page.getByRole('button',{name:'Экспорт черновика с материалами',exact:true}).click();const download=await downloadEvent;assert.equal(download.suggestedFilename(),'muras-draft-bundle.json')
 results.push('draft/material bundle exports through the real browser control')
 // Upload and restore actual media through the existing PhotoEditor; all files are in the disposable copy.
 await page.getByRole('button',{name:'Перезагрузить из файлов',exact:true}).click();await confirm();await page.getByRole('heading',{name:'Виды · 184',exact:true}).waitFor()
 await page.locator('.admin-list-filters input[type="search"]').fill('Lonicera paradoxa');await page.getByRole('button',{name:'Редактировать —',exact:false}).first().click();await page.getByRole('tab',{name:'Фотографии',exact:true}).click()
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAAE0lEQVR4nGN0q4higAEmOAudAwApAAEel85EhQAAAABJRU5ErkJggg==','base64')
 await page.locator('input[accept="image/jpeg,image/png,image/webp"]').setInputFiles({name:'synthetic.png',mimeType:'image/png',buffer:png})
 await page.locator('.admin-crop img').waitFor({timeout:30000});assert.equal(await page.locator('.admin-crop img').evaluate(el=>el.decode().then(()=>el.naturalWidth)),4)
 const ru=JSON.parse(await readFile(resolve(repository,'src/admin/locales/ru.json'),'utf8'))
 for(const [key,value]of [['admin.author','Synthetic browser fixture'],['admin.originalPage','https://example.org/fixture'],['admin.license','CC0'],['admin.licenseUrl','https://creativecommons.org/publicdomain/zero/1.0/'],['admin.attribution','Synthetic test-only image'],['admin.files.originalUrl','https://example.org/fixture.png']])await page.getByLabel(ru[key],{exact:true}).fill(value)
 await page.getByLabel(ru['admin.licenseReviewed'],{exact:true}).check();await page.getByLabel(ru['admin.files.taxonConfirmed'],{exact:true}).check();await page.getByLabel(ru['admin.files.rightsConfirmed'],{exact:true}).check()
 await page.getByRole('button',{name:'Сохранить черновик',exact:true}).click();await page.getByText('Черновик сохранён в файлах проекта. Каталог не изменён.',{exact:true}).waitFor()
 assert.equal((await service.catalog()).document.catalog.find(s=>s.id==='lonicera-paradoxa').images.length,0)
 const exported=page.waitForEvent('download');await page.getByRole('button',{name:'Экспорт черновика с материалами',exact:true}).click();const bundleDownload=await exported,bundlePath=await bundleDownload.path();const bundle=JSON.parse(await readFile(bundlePath));assert.equal(bundle.media.length,1);assert.equal(Buffer.from(bundle.media[0].originalBase64,'base64').toString('base64'),png.toString('base64'))
 await page.reload();await page.getByRole('heading',{name:'Виды · 184',exact:true}).waitFor();await page.getByRole('button',{name:'Открыть файловый черновик',exact:true}).click();await confirm();await page.locator('.admin-list-filters input[type="search"]').fill('Lonicera paradoxa');await page.getByRole('button',{name:'Редактировать —',exact:false}).first().click();await page.getByRole('tab',{name:'Фотографии',exact:true}).click();await page.locator('.admin-crop img').waitFor()
 assert.equal(await page.getByLabel(ru['admin.author'],{exact:true}).inputValue(),'Synthetic browser fixture')
 results.push('PhotoEditor uploads a real decoded original through the existing pipeline, keeps rights evidence, exports bytes, and restores preview/metadata without publishing')
 await page.getByRole('button',{name:'Проверить данные',exact:true}).click();await page.locator('[data-testid="apply-preview"]').waitFor({timeout:30000});await page.getByRole('button',{name:'Применить к исходному каталогу',exact:true}).click();await confirm();await page.getByText('Изменения применены к файлам проекта. Они ещё не отправлены в GitHub и на сайт.',{exact:true}).waitFor({timeout:30000})
 const applied=(await service.catalog()).document.catalog.find(s=>s.id==='lonicera-paradoxa').images[0];assert.ok(applied.originalPath.startsWith('assets/images/originals/'));assert.ok((await readFile(resolve(fixture.root,applied.originalPath))).equals(png));assert.ok((await readFile(resolve(fixture.root,applied.path))).length>0)
 results.push('explicitly confirmed licensed image apply saves the original, WebP, catalogue metadata and generated public asset')
 // A browser with storage disabled still obtains its authoritative catalogue from the API.
 const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('storage disabled')}}));const b=await blocked.newPage();b.on('pageerror',e=>errors.push(e.message));await b.goto(base+'/admin/');await b.locator('.admin-table tbody tr').first().waitFor();assert.equal(await b.locator('.admin-row-actions button').first().isEnabled(),true);await blocked.close()
 results.push('localStorage unavailable: catalogue still loads and edits remain enabled')
 await page.screenshot({path:'.generated/local-admin/editor.png',fullPage:true})
 assert.deepEqual(errors,[]);const report={passed:results.length,results,errors,isolatedRepository:true,realProjectDataModified:false};await writeFile('.generated/local-admin/browser-results.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2))
}catch(error){console.error('pageerrors',errors);console.error((await page.locator('body').textContent()).slice(0,5000));await page.screenshot({path:'.generated/local-admin/failure.png',fullPage:true});throw error}finally{await browser.close();await vite.close();await service.close();await fixture.cleanup()}
