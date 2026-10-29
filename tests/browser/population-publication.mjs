// Local headless checks. Synthetic decisions exist only in this explicitly labelled fixture.
import assert from 'node:assert/strict'
import {readFile,mkdir,writeFile} from 'node:fs/promises'
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright')
const base=process.env.POPULATION_BASE_URL||'http://127.0.0.1:5174'
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE})
const results=[],errors=[]
await mkdir('.generated/population-publication',{recursive:true})
async function open(options={}){
 const c=await browser.newContext({viewport:{width:1000,height:950},...options})
 await c.addInitScript(()=>{
  const state=window.populationStats={contexts:0,raf:0,pending:new Set(),canvases:new Set()}
  const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(...args){state.contexts++;state.canvases.add(this);return get.apply(this,args)}
  const request=requestAnimationFrame.bind(window),cancel=cancelAnimationFrame.bind(window)
  window.requestAnimationFrame=fn=>{state.raf++;const id=request(t=>{state.pending.delete(id);fn(t)});state.pending.add(id);return id}
  window.cancelAnimationFrame=id=>{state.pending.delete(id);return cancel(id)}
 })
 const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/tests/browser/population-publication.html');await p.locator('.species-visualization').waitFor();return {c,p}
}
const button=p=>p.locator('.visualization-button'),frame=p=>p.locator('.visualization-frame')
const effect=(p,type)=>p.waitForFunction(t=>document.querySelector('.visualization-frame')?.dataset.effect===t,type,{polling:30})
const photo=p=>p.waitForFunction(()=>document.querySelector('.visualization-button')?.getAttribute('aria-pressed')==='false')
const active=p=>p.waitForFunction(()=>document.querySelector('.visualization-frame')?.dataset.mode==='active')
const noBuffers=p=>p.waitForFunction(()=>populationStats.pending.size===0&&[...populationStats.canvases].every(c=>c.width===0&&c.height===0))
const grayscale=p=>p.waitForFunction(()=>getComputedStyle(document.querySelector('.visualization-frame img')).filter==='grayscale(1)')
async function select(p,id){await p.locator(`[data-species="${id}"]`).click();await p.locator('[data-failure=""]').click()}
try{
 const {c,p}=await open()
 await p.waitForTimeout(500);await effect(p,'unknown')
 assert.equal(await p.locator('canvas').count(),0);assert.deepEqual(await p.evaluate(()=>[populationStats.contexts,populationStats.raf]),[0,0])
 assert.equal(await p.locator('.visualization-frame img').evaluate(el=>getComputedStyle(el).filter),'grayscale(0)')
 await button(p).click();await grayscale(p);assert.equal(await p.locator('.population-value').count(),0);assert.equal(await p.locator('canvas').count(),0)
 await button(p).click();results.push('without a separate editorial decision, real candidate stays unknown, full-colour by default and CSS grayscale on demand; no Canvas or RAF')
 await p.locator('#grant-test').click()
 const packet=JSON.parse(await readFile('data/research/population-publication-candidates.json','utf8'))
 for(const candidate of packet.candidates){
  const id=candidate.identity.speciesId;await select(p,id);await effect(p,'approximate');await photo(p)
  if(id==='lonicera-paradoxa'){
   assert.equal(await button(p).isDisabled(),true);assert.equal(await p.locator('canvas').count(),0)
   await p.locator('.population-review-status').waitFor()
   assert.equal(await p.locator('.population-value').textContent(),'≈ 12 экземпляров')
   continue
  }
  assert.equal(await p.locator('canvas').evaluate(el=>el.width+el.height),0)
  await button(p).click();await active(p);await p.locator('.population-review-status').waitFor()
  const label=await p.locator('.population-value').textContent()
  if(candidate.estimate.type==='range'){assert.ok(label.includes(`${candidate.estimate.min}–${candidate.estimate.max}`));assert.ok(label.includes('оценочный диапазон'));assert.ok(!label.includes('≈'))}else assert.ok(label.startsWith('≈ '))
  const content=await p.locator('.population-info').textContent()
  assert.ok(content.includes(candidate.estimate.territory));assert.ok(content.includes(String(candidate.estimate.publicationYear)))
  assert.ok(content.includes('По опубликованному источнику, независимая проверка MURAS ожидается'))
  assert.ok(!content.includes('пока не опубликована'))
  assert.equal(await p.locator('.population-sources a').first().getAttribute('href'),candidate.source.url)
  if(id==='irbis'){assert.equal(await p.locator('.population-interval').textContent(),'95% ДИ: 246–366');assert.ok(content.includes('2020–2024'));assert.ok(label.includes('взрослых особей'));await p.screenshot({path:'.generated/population-publication/irbis-documented.png',fullPage:true})}
  assert.ok(await p.locator('canvas').evaluate(el=>el.width>0&&el.height>0))
  await button(p).click();await photo(p);await noBuffers(p)
 }
 results.push('all six selected candidates use correct types, field dates, publication years, territory, units, source and pending warning; five photos use existing symbolic Canvas, placeholder does not')
 await select(p,'irbis');await effect(p,'approximate');await button(p).click();await active(p)
 await p.locator('#revoke-test').click();await effect(p,'unknown');await photo(p);await noBuffers(p)
 assert.equal(await p.locator('.population-info').count(),0);assert.equal(await p.locator('canvas').count(),0)
 await button(p).click();await grayscale(p);await button(p).click()
 await p.evaluate(()=>{publicationFixture.granted.value=true;publicationFixture.granted.value=false})
 await p.waitForTimeout(150);await effect(p,'unknown');assert.equal(await p.locator('canvas').count(),0)
 results.push('revoking permission removes the number and Canvas and releases RAF; a rapid grant/revoke cannot revive stale data')
 await p.locator('#grant-test').click()
 for(const failure of ['needs','corrupt','source','identity']){
  await p.locator(`[data-failure="${failure}"]`).click();await effect(p,'unknown');assert.equal(await p.locator('canvas').count(),0)
  await button(p).click();await grayscale(p);assert.equal(await p.locator('.population-value').count(),0);await button(p).click()
  await p.locator('[data-failure=""]').click();await effect(p,'approximate')
 }
 await select(p,'eurasian-lynx');await effect(p,'approximate');await p.locator('[data-failure="taxonId"]').click();await effect(p,'unknown')
 results.push('NEEDS_EVIDENCE, damaged number, substituted source, wrong accepted name and wrong catalogue taxon ID all block publication')
 await select(p,'irbis');await effect(p,'approximate')
 for(const lang of ['ky','uz','ru','en']){
  await p.locator(`[data-language="${lang}"]`).click();await effect(p,'approximate');await photo(p);await button(p).click();await active(p);await p.locator('.population-review-status').waitFor()
  const dict=JSON.parse(await readFile(`src/locales/${lang}.json`,'utf8'))
  assert.equal(await p.locator('.population-review-status').textContent(),dict['population.sourcePending'])
  assert.ok(!(await p.locator('.population-info').textContent()).includes(dict['ui.m167']))
  assert.ok((await p.locator('.population-info').textContent()).includes('2020–2024'))
  assert.ok((await p.locator('.population-interval').textContent()).includes('246–366'))
  await button(p).click();await photo(p);await noBuffers(p)
 }
 results.push('KY UZ RU EN retain approximate marker, separate 95% CI, field period, publication year and explicit pending review warning')
 await p.locator('[data-language="ru"]').click()
 for(const view of ['modal','page']){
  await p.locator(`[data-view="${view}"]`).click();await effect(p,'approximate');await photo(p);await button(p).click();await active(p);await p.locator('.population-review-status').waitFor()
  assert.ok((await p.locator('.population-value').textContent()).includes('300'))
  if(view==='modal'){await p.locator('.close-button').click();await noBuffers(p)}else{await button(p).click();await noBuffers(p)}
 }
 results.push('actual SpeciesModal and SpeciesPage consume the same opt-in editorial context and reset/release resources')
 await p.locator('[data-view="app"]').click()
 await p.locator('.species-card .card-open').first().waitFor()
 await p.locator('.species-card .card-open').first().click();await effect(p,'approximate')
 await button(p).click();await active(p);await p.locator('.population-review-status').waitFor()
 assert.ok((await p.locator('.population-value').textContent()).includes('300'))
 await p.evaluate(()=>{publicationFixture.granted.value=false});await effect(p,'unknown');await photo(p);await noBuffers(p)
 assert.equal(await p.locator('.population-info').count(),0)
 await p.locator('dialog[open] .close-button').click()
 await p.evaluate(()=>{publicationFixture.granted.value=true})
 await p.locator('.species-card .card-open').first().click();await effect(p,'approximate')
 await p.locator('.modal-detail-button').click();await p.locator('.species-page .species-visualization').waitFor();await effect(p,'approximate')
 await button(p).click();await active(p);await p.locator('.population-review-status').waitFor()
 assert.equal(await p.locator('.population-interval').textContent(),'95% ДИ: 246–366')
 await p.evaluate(()=>{publicationFixture.granted.value=false});await effect(p,'unknown');await noBuffers(p)
 await p.evaluate(()=>{publicationFixture.granted.value=true;history.pushState({},'', '/species/lonicera-paradoxa');window.dispatchEvent(new PopStateEvent('popstate'))})
 await p.locator('.species-page .species-visualization').waitFor();await effect(p,'approximate');await p.locator('.population-review-status').waitFor()
 assert.equal(await p.locator('.population-value').textContent(),'≈ 12 экземпляров')
 assert.equal(await button(p).isDisabled(),true);assert.equal(await p.locator('canvas').count(),0)
 await p.evaluate(()=>{publicationFixture.granted.value=false});await effect(p,'unknown');assert.equal(await p.locator('.population-value').count(),0)
 results.push('actual App sidecar wiring reaches catalogue modal and species route; revocation hides the estimate; authorized placeholder page shows metadata without Canvas')
 await c.close()
 const mobile=await open({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'})
 await select(mobile.p,'ursus-arctos');await mobile.p.locator('#grant-test').tap();await effect(mobile.p,'approximate')
 const before=await mobile.p.evaluate(()=>populationStats.raf)
 await button(mobile.p).tap();await active(mobile.p);await mobile.p.locator('.population-review-status').waitFor()
 assert.equal(await mobile.p.evaluate(()=>populationStats.raf),before)
 assert.equal(await mobile.p.locator('body').evaluate(el=>el.scrollWidth<=innerWidth),true)
 await mobile.p.screenshot({path:'.generated/population-publication/range-mobile.png',fullPage:true})
 await button(mobile.p).tap();await noBuffers(mobile.p);await mobile.c.close()
 results.push('390px reduced-motion range stays readable without horizontal overflow or animation RAF')
 assert.deepEqual(errors,[])
 const report={passed:results.length,results,errors,syntheticDecisionsOnly:true,publications:0}
 await writeFile('.generated/population-publication/browser-results.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2))
}finally{await browser.close()}
