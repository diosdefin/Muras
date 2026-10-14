import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile,readdir} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {createSSRApp} from 'vue'
import {renderToString} from 'vue/server-renderer'
import {createServer} from 'vite'
import {canPublishImage,validateSpecies} from '../src/data/species-model.js'
import {speciesPhoto,publicImageUrl,PLACEHOLDER} from '../src/data/presentation.js'
import {checkCommonsMetadata} from '../scripts/prepare-batch-images.mjs'
import {webpMetadata} from '../scripts/import-species-batch.mjs'

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8').then(JSON.parse)
const source=await read('data/species.source.json'),published=await read('public/data/species.json')
const baseline=await read('docs/evidence/species-photo-baseline.json'),preparation=await read('docs/evidence/species-photo-preparation.json')
const research=await read('docs/evidence/species-photo-research.json')
const digest=bytes=>createHash('sha256').update(bytes).digest('hex')
const hash=value=>digest(JSON.stringify(value))
const added=preparation.receipts.filter(r=>r.status==='prepared')

test('photo audit preserves all original 21 photos and adds only four formerly empty existing records',()=>{
  assert.equal(baseline.baselineCommit,'1351122');assert.equal(baseline.rows.length,30)
  assert.equal(baseline.rows.filter(r=>r.realPhoto).length,21)
  assert.ok(baseline.rows.filter(r=>r.realPhoto).every(r=>r.fileExists&&r.shaMatches&&r.licenseAccepted))
  assert.equal(added.length,4);assert.equal(new Set(added.map(r=>r.candidateId)).size,4)
  assert.equal(source.catalog.filter(s=>speciesPhoto(s)).length,25)
  for(const row of baseline.photos){
    const current=source.catalog.find(s=>s.id===row.id)
    if(row.images.length)assert.deepEqual(current.images,row.images,row.id)
    else if(!added.some(r=>r.candidateId===row.id))assert.deepEqual(current.images,[],row.id)
  }
})
test('all thirty scientific accounts, names, statuses, maps and archive remain identical to the pre-photo audit',()=>{
  for(const expected of baseline.scientificFingerprints){const {images,...science}=source.catalog.find(s=>s.id===expected.id);assert.equal(hash(science),expected.sha256,expected.id)}
  assert.equal(hash(source.demoArchive),baseline.archiveSha256)
})
test('every published local image exists and matches its source bytes, dimensions and SHA-256; no stale approved files',async()=>{
  const names=[]
  for(const species of published){
    const original=source.catalog.find(s=>s.id===species.id).images.filter(canPublishImage)
    assert.equal(species.images.length,original.length)
    for(const [index,image] of species.images.entries()){
      assert.match(image.path,/^\/images\/approved\/[a-z0-9-]+\.webp$/)
      const bytes=await readFile(new URL('../public'+image.path,import.meta.url))
      assert.equal(digest(bytes),image.sha256)
      assert.deepEqual(bytes,await readFile(new URL('../'+original[index].path,import.meta.url)))
      assert.deepEqual(webpMetadata(bytes),{width:image.width,height:image.height,privateMetadata:false})
      assert.equal(publicImageUrl(image.path),image.path);names.push(image.path.split('/').pop())
    }
  }
  assert.deepEqual((await readdir(new URL('../public/images/approved',import.meta.url))).sort(),names.sort())
})
test('new image receipts carry exact reviewed provenance, real files, licensing conditions and visual-review limitations',async()=>{
  for(const receipt of added){
    const image=source.catalog.find(s=>s.id===receipt.candidateId).images[0]
    assert.deepEqual(image,receipt.image);assert.equal(canPublishImage(image),true)
    assert.equal(receipt.visualReview.reviewed,true);assert.match(receipt.metadata.originalSha256,/^[a-f0-9]{64}$/)
    assert.equal(digest(await readFile(new URL('../'+image.path,import.meta.url))),image.sha256)
    assert.match(image.license,/^(CC BY(?:-SA)? [234]\.0|Apache License 2\.0)$/)
    if(image.license.startsWith('CC '))assert.equal(new URL(image.licenseUrl).hostname,'creativecommons.org')
    assert.ok(image.attribution.includes(image.author.split(' (')[0]));assert.ok(image.attribution.includes(image.license));assert.ok(image.modifications.length)
  }
  assert.match(added.find(r=>r.candidateId==='christophs-clouded-yellow').image.caption.ru,/Музейный экземпляр/)
  assert.match(added.find(r=>r.candidateId==='semenovs-fir').image.caption.ru,/Гербарный образец/)
  assert.equal(added.find(r=>r.candidateId==='semenovs-fir').metadata.photographer,null)
  assert.match(decodeURIComponent(added.find(r=>r.candidateId==='great-bustard').image.originalPage),/Otis_tarda_tarda/)
})
test('Apache image requires published unaltered license and original copyright notice; no blanket approval of restricted licences',async()=>{
  const candidate=research.candidates.find(c=>c.id==='kolpakowskis-tulip'),photo=candidate.photoResearch.photo,a=photo.licenseArtifacts
  assert.equal(digest(await readFile(new URL('../'+a.licensePath,import.meta.url))),a.licenseSha256)
  const notice=await readFile(new URL('../'+a.noticePath,import.meta.url));assert.equal(digest(notice),a.noticeSha256)
  assert.ok(notice.toString().includes(a.copyrightNotice));assert.match(notice.toString(),/resized without upscaling/)
  const page={title:'File:Example.jpg',revisions:[{revid:1,slots:{main:{'*':'{{Apache}}'}}}],imageinfo:[{descriptionurl:photo.originalPage,width:2046,height:2761,extmetadata:{LicenseShortName:{value:photo.license},Artist:{value:photo.author},ImageDescription:{value:photo.subjectAsDocumented},Permission:{value:a.copyrightNotice},LicenseUrl:{value:photo.licenseUrl}}}]}
  assert.equal(checkCommonsMetadata(candidate,page).license,'Apache License 2.0')
  const incomplete=structuredClone(candidate);delete incomplete.photoResearch.photo.licenseArtifacts;assert.throws(()=>checkCommonsMetadata(incomplete,page),/Apache/)
  const wrong=structuredClone(page);wrong.imageinfo[0].extmetadata.Permission.value='Unconfirmed';assert.throws(()=>checkCommonsMetadata(candidate,wrong),/Apache/)
  const changedPage=structuredClone(page);changedPage.imageinfo[0].descriptionurl='https://commons.wikimedia.org/wiki/File:Different.jpg';assert.throws(()=>checkCommonsMetadata(candidate,changedPage),/страница/)
  const foreignPage=structuredClone(page);foreignPage.imageinfo[0].descriptionurl=photo.originalPage.replace('commons.wikimedia.org','example.org');assert.throws(()=>checkCommonsMetadata(candidate,foreignPage),/Wikimedia Commons/)
  const badLink=structuredClone(page);badLink.imageinfo[0].extmetadata.LicenseUrl.value='https://example.org/Apache';assert.throws(()=>checkCommonsMetadata(candidate,badLink),/URL/)
  for(const license of ['CC BY-NC 4.0','CC BY-ND 4.0','All rights reserved']){
    const copy=structuredClone(candidate),bad=structuredClone(page);copy.photoResearch.photo.license=license;bad.imageinfo[0].extmetadata.LicenseShortName.value=license
    assert.throws(()=>checkCommonsMetadata(copy,bad),/Лицензия/)
  }
})
test('remaining five empty arrays and unverified image metadata safely select placeholders',()=>{
  const missing=['pike-asp','turkestan-catfish','relict-spider','tien-shan-scutiger','menzbiers-marmot']
  assert.deepEqual(published.filter(s=>!speciesPhoto(s)).map(s=>s.id),missing)
  for(const s of published.filter(s=>missing.includes(s.id))){assert.equal(speciesPhoto(s),null);assert.equal(publicImageUrl(speciesPhoto(s)?.path),PLACEHOLDER)}
  const example=added[0].image
  for(const key of ['path','author','originalPage','license','licenseUrl','attribution'])assert.equal(canPublishImage({...example,[key]:null}),false)
  assert.equal(canPublishImage({...example,licenseVerified:false}),false)
  const copy=structuredClone(published[0]);copy.images[0].path='https://example.org/photo.webp';assert.ok(validateSpecies([copy],'public',{publicData:true}).length)
})
test('actual card, modal and species page render all thirty photo choices and credits without component changes',async()=>{
  const vite=await createServer({server:{middlewareMode:true,ws:false,hmr:false,watch:null},appType:'custom',logLevel:'error'})
  try{
    const {siteLanguage}=await vite.ssrLoadModule('/src/composables/useLocale.js');siteLanguage.value='ru'
    const components=await Promise.all(['SpeciesCard.vue','SpeciesModal.vue','SpeciesPage.vue'].map(async file=>(await vite.ssrLoadModule('/src/components/'+file)).default))
    for(const species of published){
      const photo=speciesPhoto(species)
      for(const [index,component] of components.entries()){
        const html=await renderToString(createSSRApp(component,{species}))
        assert.ok(html.includes(photo?.path||'placeholder.svg'),species.id)
        if(photo&&index>0){assert.ok(html.includes(photo.license),species.id);assert.ok(html.includes(photo.originalPage.replaceAll('&','&amp;')),species.id)}
        if(!photo&&index>0)assert.ok(html.includes('placeholder.svg'),species.id)
      }
    }
  }finally{await vite.close()}
})
