// Optional end-to-end verification of the real, uncapped regional dataset.
import assert from 'node:assert/strict'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { queryRegionalEntries } from '../../src/data/geography/repository.js'
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright')
const base=process.env.MAP_BASE_URL||'http://127.0.0.1:5174'
const evidence=JSON.parse(await readFile('public/data/geography/occurrences.json'))
const species=JSON.parse(await readFile('public/data/species.json'))
const regions=['batken','osh','jalal-abad','naryn','issyk-kul','chuy','talas']
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE})
const checks=[],errors=[]
const count=(regionId='',group='ALL',query='')=>queryRegionalEntries(evidence,species,{regionId,group,query}).length
const wait=async(page,n)=>page.waitForFunction(n=>document.querySelectorAll('.regional-species').length===n,n)
await mkdir('.generated/map-184',{recursive:true})
try{
 const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'})
 await context.addInitScript(()=>localStorage.setItem('redbook.locale.v1','ru'))
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message))
 await page.goto(base+'/map');await wait(page,208)
 for(const [i,id]of regions.entries()){
  await page.locator('.region-choices button').nth(i).click();await wait(page,count(id))
  assert.equal(new URL(page.url()).searchParams.get('region'),id)
  assert.equal(await page.locator(`path[data-region="${id}"]`).getAttribute('aria-pressed'),'true')
  const links=await page.locator('.map-species-page').evaluateAll(es=>es.map(e=>e.getAttribute('href')))
  assert.deepEqual(new Set(links),new Set(evidence.records.filter(r=>r.regionId===id).map(r=>'/species/'+r.speciesId)))
 }
 checks.push('208 pairs and every species route shown without truncation across seven oblasts')
 await page.locator('.map-reset').click();await wait(page,208)
 const target=species.find(s=>s.id==='irbis')
 for(const name of [...Object.values(target.names),target.scientificName]){
  await page.locator('#map-species-search').fill(name);await wait(page,count('','ALL',name))
  assert.ok(await page.locator('.regional-species').count()>1)
 }
 checks.push('KY UZ RU EN and Latin search retains multiple regions per species')
 await page.locator('.map-reset').click();await wait(page,208)
 const groups=['ALL','mammals','birds','plants','reptiles','amphibians','fish','arthropods','fungi']
 const buttons=page.locator('#map-region-panel .group-filter button')
 // Match visible Russian labels to groups rather than assuming UI order.
 const labels={'Все группы':'ALL','Млекопитающие':'mammals','Птицы':'birds','Растения':'plants','Пресмыкающиеся':'reptiles','Земноводные':'amphibians','Рыбы':'fish','Членистоногие':'arthropods','Грибы':'fungi'}
 for(let i=0;i<await buttons.count();i++){
  const label=(await buttons.nth(i).textContent()).trim(),group=labels[label]
  assert.ok(group,'Known group label: '+label)
  await buttons.nth(i).click();await wait(page,count('',group))
 }
 checks.push('every organism group filters the full dataset')
 await page.goto(base+'/map?region=chuy');await wait(page,count('chuy'))
 await page.screenshot({path:'.generated/map-184/full-map-desktop.png'})
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'})
 await mobile.addInitScript(()=>localStorage.setItem('redbook.locale.v1','ru'))
 const phone=await mobile.newPage();phone.on('pageerror',e=>errors.push(e.message))
 await phone.goto(base+'/map?region=issyk-kul');await wait(phone,51)
 assert.equal(await phone.locator('body').evaluate(el=>el.scrollWidth<=innerWidth),true)
 await phone.locator('.region-choices button').nth(0).tap();await wait(phone,8)
 await phone.screenshot({path:'.generated/map-184/full-map-mobile.png'})
 checks.push('390px touch selection renders every entry and has no horizontal overflow')
 await phone.goto(base+'/');await phone.locator('.map-preview .oblast-map').waitFor()
 await phone.locator('path[data-region="chuy"]').focus();await phone.locator('path[data-region="chuy"]').press('Enter')
 await phone.locator('.map-overview-action').tap();await phone.waitForURL('**/map?region=chuy');await wait(phone,48)
 checks.push('homepage preview leads to all 48 Chuy entries')
 await mobile.close();await context.close()
 assert.deepEqual(errors,[])
 await writeFile('.generated/map-184/browser-results.json',JSON.stringify({checks,errors},null,2)+'\n')
 console.log(JSON.stringify({passed:checks.length,checks,errors},null,2))
}finally{await browser.close()}
