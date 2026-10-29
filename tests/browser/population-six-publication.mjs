// Real public entry point, real fixed owner-authorized release, no synthetic permission.
import assert from 'node:assert/strict'
import {readFile,mkdir,writeFile} from 'node:fs/promises'
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright')
const base=process.env.POPULATION_BASE_URL||'http://127.0.0.1:4174'
const release=JSON.parse(await readFile('src/data/population-editorial-release.json','utf8'))
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE})
const results=[],errors=[]
await mkdir('.generated/population-six-publication',{recursive:true})
const ctx=await browser.newContext({viewport:{width:1100,height:950}})
await ctx.addInitScript(()=>localStorage.setItem('redbook.locale.v1','ru'))
const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message))
const effect=t=>p.waitForFunction(t=>document.querySelector('.visualization-frame')?.dataset.effect===t,t)
const button=()=>p.locator('.visualization-button')
const restored=()=>p.waitForFunction(()=>document.querySelector('.visualization-button')?.getAttribute('aria-pressed')==='false'&&[...document.querySelectorAll('.species-visualization canvas')].every(c=>c.width===0&&c.height===0))
try{
 for(const c of release.candidates){
  const id=c.identity.speciesId
  await p.goto(base+'/species/'+id);await p.locator('.species-page .species-visualization').waitFor();await effect('approximate')
  const image=p.locator('.visualization-frame img');await image.scrollIntoViewIfNeeded();await image.evaluate(el=>el.decode())
  assert.equal(await image.evaluate(el=>getComputedStyle(el).filter),'grayscale(0)')
  assert.equal(await button().getAttribute('aria-pressed'),'false')
  if(id==='lonicera-paradoxa'){
   assert.equal(await button().isDisabled(),true);assert.equal(await p.locator('canvas').count(),0)
  }else{
   assert.equal(await p.locator('canvas').evaluate(el=>el.width+el.height),0)
   await button().click();await p.waitForFunction(()=>document.querySelector('.visualization-frame')?.dataset.mode==='active')
   assert.equal(await p.locator('canvas').evaluate(el=>el.width>0&&el.height>0),true)
  }
  await p.locator('.population-review-status').waitFor()
  const label=await p.locator('.population-value').textContent(),info=await p.locator('.population-info').textContent(),e=c.estimate
  if(e.type==='range'){assert.ok(label.startsWith(`${e.min}–${e.max}`));assert.ok(!label.includes('≈'))}else assert.ok(label.startsWith('≈ '))
  assert.ok(info.includes(e.territory));assert.ok(info.includes(String(e.publicationYear)))
  assert.ok(info.includes(e.year===null?`${e.observationPeriod.startYear}–${e.observationPeriod.endYear}`:String(e.year)))
  assert.equal(await p.locator('.population-sources a').first().getAttribute('href'),c.source.url)
  assert.ok((await p.locator('.population-review-status').textContent()).includes('ожидается'))
  assert.equal(await p.locator('.population-cells').count(),0)
  if(id==='irbis'){assert.equal(await p.locator('.population-interval').textContent(),'95% ДИ: 246–366');assert.ok(label.includes('взрослых особей'))}
  if(id==='lonicera-paradoxa')assert.equal(label,'≈ 12 экземпляров')
  await p.locator('.species-visualization').screenshot({path:'.generated/population-six-publication/'+id+'.png'})
  if(id!=='lonicera-paradoxa'){await button().click();await restored();assert.equal(await image.evaluate(el=>getComputedStyle(el).filter),'grayscale(0)')}
  results.push({id,entry:'production species route',label,photo:id!=='lonicera-paradoxa',source:c.source.url,passed:true})
 }
 await p.goto(base+'/species/argali');await p.locator('.species-visualization').waitFor();await effect('unknown')
 await button().click();await p.waitForFunction(()=>getComputedStyle(document.querySelector('.visualization-frame img')).filter==='grayscale(1)')
 assert.equal(await p.locator('canvas').count(),0);assert.equal(await p.locator('.population-value').count(),0)
 await button().click();await restored();results.push({id:'argali',unknown:'CSS grayscale only; no fabricated number or Canvas',passed:true})
 await p.goto(base+'/');await p.locator('.species-card .card-open').first().waitFor();assert.equal(await p.locator('.species-card canvas').count(),0)
 await p.locator('.species-card .card-open').first().click();await effect('approximate');await button().click()
 await p.waitForFunction(()=>document.querySelector('.visualization-frame')?.dataset.mode==='active');await p.locator('.population-review-status').waitFor()
 assert.ok((await p.locator('.population-value').textContent()).includes('300'))
 await p.locator('dialog[open] .close-button').click();assert.equal(await p.locator('.species-visualization canvas').count(),0)
 results.push({entry:'production catalogue modal',symbolic:true,closeReleasesCanvas:true,passed:true})
 await p.goto(base+'/species/irbis');await effect('approximate')
 for(const lang of ['ky','uz','ru','en']){
  await p.locator('.language-trigger').click();await p.locator(`[role="menuitemradio"][lang="${lang}"]`).click();await effect('approximate')
  await button().click();await p.locator('.population-review-status').waitFor()
  const dict=JSON.parse(await readFile(`src/locales/${lang}.json`,'utf8'))
  assert.equal(await p.locator('.population-review-status').textContent(),dict['population.sourcePending'])
  assert.ok((await p.locator('.population-value').textContent()).startsWith('≈ '));await button().click();await restored()
 }
 results.push({entry:'production language menu',languages:['ky','uz','ru','en'],passed:true})
 await ctx.close()
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'})
 await mobile.addInitScript(()=>localStorage.setItem('redbook.locale.v1','ru'))
 const m=await mobile.newPage();m.on('pageerror',e=>errors.push(e.message));await m.goto(base+'/species/lonicera-paradoxa')
 await m.locator('.population-value').waitFor();assert.equal(await m.locator('canvas').count(),0)
 assert.equal(await m.locator('body').evaluate(el=>el.scrollWidth<=innerWidth),true)
 await mobile.close();results.push({entry:'390px reduced-motion placeholder',passed:true})
 assert.deepEqual(errors,[])
 const report={passed:results.length,realOwnerDecisionId:release.ownerAuthorization.decisionId,productionEntry:true,published:6,symbolicPhotos:5,placeholder:1,results,errors}
 await writeFile('.generated/population-six-publication/browser-results.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2))
}finally{await browser.close()}
