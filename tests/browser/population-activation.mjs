// Runs only against local Vite and explicit synthetic fixtures, never changes public data.
import assert from 'node:assert/strict'
import { readFile,mkdir,writeFile } from 'node:fs/promises'
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright')
const base=process.env.POPULATION_BASE_URL||'http://127.0.0.1:5174'
const fixtureUrl=base+'/tests/browser/population-activation.html'
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE})
const results=[],errors=[]
await mkdir('.generated/population-activation',{recursive:true})
function instrument(){
 const state=window.visualizationStats={images:0,contexts:0,rafRequested:0,pending:new Set(),canvases:new Set()}
 const ImageOriginal=window.Image;window.Image=class extends ImageOriginal{constructor(...args){super(...args);state.images++}}
 const context=HTMLCanvasElement.prototype.getContext
 HTMLCanvasElement.prototype.getContext=function(...args){state.contexts++;state.canvases.add(this);return context.apply(this,args)}
 const request=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window)
 window.requestAnimationFrame=fn=>{state.rafRequested++;const id=request(t=>{state.pending.delete(id);fn(t)});state.pending.add(id);return id}
 window.cancelAnimationFrame=id=>{state.pending.delete(id);return cancel(id)}
}
async function context(options={}){
 const c=await browser.newContext({viewport:{width:1000,height:900},...options})
 await c.addInitScript(instrument);await c.addInitScript(()=>localStorage.setItem('redbook.locale.v1','ru'))
 return c
}
async function pageFor(c,url=fixtureUrl){const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(url);await p.locator('.species-visualization').waitFor();return p}
const button=p=>p.locator('.visualization-button')
const frame=p=>p.locator('.visualization-frame')
const image=p=>p.locator('.visualization-frame img')
async function idle(p){await p.waitForFunction(()=>document.querySelector('.visualization-button')?.getAttribute('aria-pressed')==='false',null,{polling:30})}
async function active(p){await p.waitForFunction(()=>document.querySelector('.visualization-frame')?.dataset.mode==='active',null,{polling:30})}
async function noBuffers(p){await p.waitForFunction(()=>visualizationStats.pending.size===0&&[...visualizationStats.canvases].every(c=>c.width===0&&c.height===0),null,{polling:30})}
const filter=(p,value)=>p.waitForFunction(v=>getComputedStyle(document.querySelector('.visualization-frame img')).filter===v,value,{polling:30})
try{
 const c=await context(),p=await pageFor(c)
 await p.waitForTimeout(1100)
 assert.equal(await frame(p).getAttribute('data-mode'),'photo')
 assert.equal(await image(p).evaluate(el=>getComputedStyle(el).filter),'grayscale(0)')
 assert.deepEqual(await p.evaluate(()=>({images:visualizationStats.images,contexts:visualizationStats.contexts,raf:visualizationStats.rafRequested})),{images:0,contexts:0,raf:0})
 assert.equal(await p.locator('.species-visualization canvas').count(),0)
 const original=await image(p).getAttribute('src'),natural=await image(p).evaluate(el=>el.naturalWidth)
 await button(p).click();await filter(p,'grayscale(1)')
 assert.equal(await p.locator('.visualization-unknown-label').textContent(),'Численность неизвестна')
 assert.equal(await p.locator('.population-info').count(),0)
 assert.equal(await p.locator('.species-visualization canvas').count(),0)
 assert.deepEqual(await p.evaluate(()=>[visualizationStats.images,visualizationStats.contexts,visualizationStats.rafRequested]),[0,0,0])
 await button(p).click();await filter(p,'grayscale(0)');await idle(p)
 assert.equal(await image(p).getAttribute('src'),original);assert.equal(await image(p).evaluate(el=>el.naturalWidth),natural)
 await button(p).click();await filter(p,'grayscale(1)');await p.locator('#switch-species').click();await idle(p)
 assert.equal(await image(p).evaluate(el=>getComputedStyle(el).filter),'grayscale(0)')
 results.push('default stays sharp and full-colour; unknown is CSS grayscale only; restore preserves original source and resolution; unknown species switch resets immediately')
 for(const lang of ['ky','uz','ru','en']){
  const dict=JSON.parse(await readFile(`src/locales/${lang}.json`))
  await p.locator(`[data-language="${lang}"]`).click()
  assert.ok((await button(p).textContent()).includes(dict['visualization.start']))
  await button(p).click();assert.ok((await button(p).textContent()).includes(dict['visualization.restore']))
  assert.equal(await p.locator('.visualization-unknown-label').textContent(),dict['visualization.unknown'])
  await button(p).click()
 }
 results.push('manual controls and unknown message work in KY UZ RU EN')
 await p.locator('[data-language="ru"]').click()
 for(const kind of ['pending','rejected','invalid']){
  await p.locator(`[data-kind="${kind}"]`).click();await button(p).click();await filter(p,'grayscale(1)')
  assert.equal(await p.locator('.population-info').count(),0);assert.equal(await p.locator('.species-visualization canvas').count(),0)
  assert.equal(await p.locator('.visualization-unknown-label').count(),1)
  await button(p).click()
 }
 results.push('pending rejected and invalid synthetic claims hide numbers, dates and sources; no pixelation')
 for(const kind of ['exact','approximate','range']){
  await p.locator(`[data-kind="${kind}"]`).click();await idle(p)
  assert.equal(await p.locator('canvas').evaluate(el=>el.width+el.height),0)
  await button(p).click();await active(p)
  const label=await p.locator('.population-value').textContent()
  assert.ok(label.includes(kind==='range'?'12–20':kind==='approximate'?'≈ 17':'17'))
  const text=await p.locator('.population-info').textContent()
  assert.ok(text.includes('2020'));assert.ok(text.includes('Synthetic territory — not Kyrgyzstan'))
  assert.equal(await p.locator('.population-sources a').getAttribute('href'),'https://example.org/test-only')
  assert.equal(await frame(p).getAttribute('data-effect'),kind==='range'?'approximate':kind)
  assert.ok(await p.locator('canvas').evaluate(el=>el.width>0&&el.height>0))
  if(kind==='range'){
   for(const lang of ['ky','uz','ru','en']){
    const dict=JSON.parse(await readFile(`src/locales/${lang}.json`))
    await p.locator(`[data-language="${lang}"]`).click();await active(p)
    assert.match(await p.locator('.population-value').textContent(),/12–20/)
    assert.ok((await p.locator('.population-info').textContent()).includes(dict['population.approximate']))
   }
   await p.locator('[data-language="ru"]').click()
   await p.screenshot({path:'.generated/population-activation/known-range.png'})
  }
  await button(p).click();await idle(p);await noBuffers(p)
 }
 results.push('approved exact approximate and range fixtures use existing symbolic Canvas; endpoint values, territory, year, source and type stay intact')
 await p.locator('[data-kind="exact"]').click()
 for(let i=0;i<10;i++){await button(p).click();await button(p).click()}
 await idle(p);await noBuffers(p)
 await button(p).click();await active(p);await p.locator('#switch-species').click();await idle(p);await noBuffers(p)
 assert.equal(await image(p).getAttribute('src'),original)
 await button(p).click();await active(p);await p.locator('#unmount').click();await noBuffers(p)
 assert.equal(await p.locator('.species-visualization').count(),0)
 await p.locator('#unmount').click();await idle(p)
 await button(p).click();await active(p);await p.locator('#no-photo').click();await idle(p);await noBuffers(p)
 assert.equal(await button(p).isDisabled(),true);assert.ok((await image(p).getAttribute('src')).includes('placeholder.svg'))
 assert.equal(await p.locator('canvas').count(),0)
 await p.locator('#no-photo').click();await p.locator('#broken-photo').click()
 await p.waitForFunction(()=>document.querySelector('.visualization-button').disabled,null,{polling:30})
 assert.ok((await image(p).getAttribute('src')).includes('placeholder.svg'));await noBuffers(p)
 await p.locator('#broken-photo').click()
 results.push('rapid toggles, species change, unmount, broken or missing photo release Canvas/RAF; placeholder is preserved')
 await p.locator('[data-kind="exact"]').click()
 await button(p).click();await active(p)
 await p.evaluate(()=>{document.querySelector('#subject').style.marginTop='3000px'})
 await p.waitForTimeout(150)
 assert.equal(await p.evaluate(()=>visualizationStats.pending.size),0)
 await p.evaluate(()=>window.dispatchEvent(new Event('resize')));await p.waitForTimeout(100)
 assert.equal(await p.evaluate(()=>visualizationStats.pending.size),0)
 await p.evaluate(()=>{document.querySelector('#subject').style.marginTop='20px'})
 await button(p).click();await noBuffers(p)
 results.push('offscreen active component schedules no RAF, including on resize')
 await p.locator('[data-kind="unknown"]').click();await p.locator('[data-view="modal"]').click()
 await p.locator('dialog[open]').waitFor();await idle(p)
 await button(p).click();await filter(p,'grayscale(1)');await p.locator('.close-button').click()
 assert.equal(await p.locator('dialog').count(),0);await noBuffers(p)
 await p.locator('[data-kind="exact"]').click();await p.locator('dialog[open]').waitFor()
 await button(p).click();await active(p);await p.locator('.close-button').click();await noBuffers(p)
 assert.equal(await p.locator('dialog').count(),0)
 await p.locator('[data-view="page"]').click();await p.locator('[data-kind="unknown"]').click();await idle(p)
 await button(p).click();await filter(p,'grayscale(1)');await button(p).click();await filter(p,'grayscale(0)')
 results.push('real modal and species page share manual behaviour; closing an active known-population modal releases Canvas and RAF')
 // Actual catalogue path: images remain ordinary DOM images and the card opens the same modal.
 const app=await c.newPage();app.on('pageerror',e=>errors.push(e.message));await app.goto(base+'/#catalog')
 await app.locator('.species-card .card-open').first().waitFor()
 assert.equal(await app.locator('.species-card canvas').count(),0)
 await app.locator('.species-card .card-open').first().click();await app.locator('dialog[open] .species-visualization').waitFor()
 await app.waitForTimeout(1100);await idle(app);await filter(app,'grayscale(0)')
 await button(app).click();await filter(app,'grayscale(1)');await app.locator('.close-button').click()
 await app.goto(base+'/species/irbis');await app.locator('.species-page .species-visualization').waitFor();await idle(app)
 await button(app).click();await filter(app,'grayscale(1)');await button(app).click();await filter(app,'grayscale(0)')
 results.push('real catalogue has no per-card Canvas; real card → modal and /species/irbis work with unchanged public data')
 await c.close()
 const reduced=await context({reducedMotion:'reduce',viewport:{width:390,height:844},isMobile:true,hasTouch:true}),phone=await pageFor(reduced)
 await button(phone).tap();await filter(phone,'grayscale(1)')
 assert.equal(await image(phone).evaluate(el=>getComputedStyle(el).transitionDuration),'0s')
 assert.equal(await phone.locator('body').evaluate(el=>el.scrollWidth<=innerWidth),true)
 await phone.screenshot({path:'.generated/population-activation/unknown-mobile.png'})
 await button(phone).tap();await phone.locator('[data-kind="range"]').tap()
 const before=await phone.evaluate(()=>visualizationStats.rafRequested)
 await button(phone).tap();await active(phone)
 assert.equal(await phone.evaluate(()=>visualizationStats.rafRequested),before)
 await button(phone).tap();await noBuffers(phone);await reduced.close()
 results.push('390px touch controls have no overflow; reduced-motion grayscale and known Canvas need no animation RAF')
 const fallback=await context();await fallback.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=()=>null})
 const f=await pageFor(fallback);await f.locator('[data-kind="exact"]').click();await button(f).click()
 await f.waitForFunction(()=>document.querySelector('.species-visualization').textContent.includes('Интерактивная визуализация недоступна'),null,{polling:30})
 await idle(f);assert.equal(await image(f).evaluate(el=>getComputedStyle(el).visibility),'visible');await noBuffers(f)
 await f.locator('[data-kind="unknown"]').click();await button(f).click();await filter(f,'grayscale(1)')
 await fallback.close()
 results.push('unsupported Canvas preserves original photo; unknown grayscale remains available')
 assert.deepEqual(errors,[])
 await writeFile('.generated/population-activation/browser-results.json',JSON.stringify({passed:results.length,results,errors},null,2)+'\n')
 console.log(JSON.stringify({passed:results.length,results,errors},null,2))
}finally{await browser.close()}
