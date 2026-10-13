import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile,writeFile,mkdir,mkdtemp,rm,stat } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createHash } from 'node:crypto'
import { ref,createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createServer } from 'vite'
import { planBatchImport,taxonNameKey } from '../scripts/lib/bulk-import.mjs'
import { importBatchFile,inspectAssets,webpMetadata } from '../scripts/import-species-batch.mjs'
import { prepareResearchBatch } from '../scripts/prepare-research-batch.mjs'
import { checkCommonsMetadata } from '../scripts/prepare-batch-images.mjs'
import { PROJECT_ROOT } from '../scripts/build-data.mjs'
import { availableGroups,GROUPS } from '../src/data/species-groups.js'
import { validateSource } from '../src/data/species-model.js'
import { useCatalog } from '../src/composables/useCatalog.js'
import { createSearchIndex,searchSpecies } from '../src/data/catalog-search.js'
import { scientificContent } from '../src/data/localization.js'
import { importSource,exportSource } from '../src/admin/data/model.js'

const read=async path=>JSON.parse(await readFile(join(PROJECT_ROOT,path),'utf8'))
const source=await read('data/species.source.json'),published=await read('public/data/species.json')
const baseline={...source,catalog:source.catalog.slice(0,17)}
const research=await read('data/research/catalog-candidates.json'),selection=await read('data/research/bulk-expansion-selection.json')
const tax=await read('docs/evidence/bulk-expansion-taxonomy.json'),photos=await read('docs/evidence/bulk-expansion-images.json')
const packet=prepareResearchBatch(research,selection,{taxonomyEvidence:tax,imageEvidence:photos})
const item=id=>structuredClone(packet.records.find(r=>r.candidateId===id))
const batch=records=>({schemaVersion:1,documentType:'species-import-batch',batchId:'test-only',records})
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex')

test('research recipe prepares 13 supported records and separately rejects nine unresolved concepts without mutating research',()=>{
  const before=JSON.stringify(research)
  assert.equal(packet.records.length,22);assert.equal(packet.records.filter(r=>r.species).length,13)
  assert.equal(packet.records.filter(r=>r.deferredReason).length,9)
  assert.equal(JSON.stringify(research),before)
  assert.deepEqual(validateSource(source),[])
  assert.equal(hash(source.catalog.slice(0,17)),'625b3a11bfd48a49b48925244060b44dd2a991a3df3cca49c49242d99cd4caf3')
  assert.equal(source.catalog.length,30)
  assert.deepEqual(availableGroups(published),GROUPS)
  assert.deepEqual(Object.fromEntries(GROUPS.map(g=>[g,published.filter(s=>s.group===g).length])),{mammals:6,birds:7,plants:7,fish:2,reptiles:2,amphibians:1,arthropods:3,fungi:2})
})

test('real batch dry-run produces the committed catalogue, then repeated import is lossless and adds zero records',async()=>{
  const before=JSON.stringify(baseline),input=JSON.stringify(packet)
  const plan=await planBatchImport(baseline,packet,{validateAssets:s=>inspectAssets(PROJECT_ROOT,s)})
  assert.deepEqual(plan.counts,{processed:22,added:13,unchanged:0,rejected:9})
  assert.deepEqual(plan.proposedSource,source)
  assert.deepEqual(plan.proposedSource.demoArchive,baseline.demoArchive)
  assert.equal(JSON.stringify(baseline),before);assert.equal(JSON.stringify(packet),input)
  const repeated=await planBatchImport(plan.proposedSource,packet,{validateAssets:s=>inspectAssets(PROJECT_ROOT,s)})
  assert.deepEqual(repeated.counts,{processed:22,added:0,unchanged:13,rejected:9})
  assert.deepEqual(repeated.proposedSource,source)
  // Object key order is transport formatting, not a reason to overwrite an existing record.
  const reordered=item('pike-asp');reordered.species=Object.fromEntries(Object.entries(reordered.species).reverse())
  assert.equal((await planBatchImport(source,batch([reordered]))).results[0].status,'unchanged')
})

test('errors and asset failures are isolated per candidate; unknown groups and misleading taxonomy cannot enter the catalogue',async()=>{
  const invalidGroup=item('pike-asp');invalidGroup.species.group='insects'
  const wrongGenus=item('pike-asp');wrongGenus.species.taxonomy.genus='Differentgenus'
  const higherMatch=item('pike-asp');higherMatch.taxonomyEvidence.matchType='HIGHERRANK'
  const missingEvidence=item('pike-asp');missingEvidence.species.sources.find(s=>s.id==='gbif-match').taxonId='gbif:999'
  const badApproval=item('pike-asp');badApproval.species.verified=true;badApproval.species.lastReviewedAt='2026-10-13'
  const mixed=batch([null,invalidGroup,wrongGenus,higherMatch,missingEvidence,badApproval,item('pike-asp'),item('turkestan-catfish')])
  const plan=await planBatchImport(baseline,mixed,{validateAssets:s=>{if(s.id==='pike-asp')throw new Error('Synthetic asset failure');return []}})
  assert.deepEqual(plan.counts,{processed:8,added:1,unchanged:0,rejected:7})
  assert.equal(plan.proposedSource.catalog.at(-1).id,'turkestan-catfish')
  assert.ok(plan.results.every(r=>r.status==='added'||r.errors.length))
  assert.match(plan.results[1].errors.join(' '),/неизвестная группа/)
  assert.match(plan.results[2].errors.join(' '),/Род/)
  assert.match(plan.results[3].errors.join(' '),/точное принятое/)
  assert.match(plan.results[4].errors.join(' '),/Идентификатор/)
  assert.match(plan.results[5].errors.join(' '),/одобрение/)
})

test('IDs, accepted names, canonical subspecies syntax and taxon IDs prevent duplicates inside a batch and across catalog/archive',async()=>{
  assert.equal(taxonNameKey(' Abies sibirica subsp. semenovii '),taxonNameKey('ABIES  SIBIRICA SEMENOVII'))
  const renamed=item('pike-asp');renamed.candidateId=renamed.species.id='different-id'
  const archived=item('pike-asp');archived.candidateId=archived.species.id='amur-tiger'
  const changed=item('pike-asp');changed.species.names.ru='Synthetic changed existing name'
  const plan=await planBatchImport(baseline,batch([item('pike-asp'),item('pike-asp'),renamed,archived,changed]))
  assert.deepEqual(plan.counts,{processed:5,added:1,unchanged:1,rejected:3})
  assert.match(plan.results[2].errors.join(' '),/Таксон уже/)
  assert.match(plan.results[3].errors.join(' '),/архивной/)
  assert.match(plan.results[4].errors.join(' '),/не перезаписывает/)
  const duplicateKey=item('turkestan-catfish');duplicateKey.taxonomyEvidence.taxonId=item('pike-asp').taxonomyEvidence.taxonId
  duplicateKey.species.sources.find(s=>s.id===duplicateKey.taxonomyEvidence.sourceId).taxonId=duplicateKey.taxonomyEvidence.taxonId
  const keys=await planBatchImport(baseline,batch([item('pike-asp'),duplicateKey]))
  assert.match(keys.results[1].errors.join(' '),/Таксон уже/)
})

test('malformed envelopes and unsafe records are rejected before writes; input is never treated as executable code',async()=>{
  for(const value of [null,[],{...batch([]),schemaVersion:2},{...batch([]),batchId:'../escape'},{...batch([]),records:{}}])await assert.rejects(planBatchImport(baseline,value),/Пакет/)
  const unsafe=JSON.parse('{"candidateId":"x","species":{"__proto__":{"polluted":true}}}')
  assert.match((await planBatchImport(baseline,batch([unsafe]))).results[0].errors.join(' '),/безопасный JSON/)
  assert.equal({}.polluted,undefined)
})

test('filesystem preview preserves bytes; apply backs up the exact source, repeats do not write, and foreign lock/temp files survive',async()=>{
  const root=await mkdtemp(join(tmpdir(),'muras-bulk-'))
  try{
    await mkdir(join(root,'data'))
    const path=join(root,'data/species.source.json'),raw=JSON.stringify(baseline,null,2).replaceAll('\n','\r\n')+'\r\n'
    await writeFile(path,raw);await writeFile(join(root,'packet.json'),JSON.stringify(batch([item('pike-asp')])))
    const preview=await importBatchFile(root,'packet.json');assert.equal(preview.mode,'preview');assert.equal(preview.applied,false)
    assert.equal(await readFile(path,'utf8'),raw)
    await writeFile(`${path}.import.lock`,'Synthetic existing lock')
    await assert.rejects(importBatchFile(root,'packet.json',{apply:true}),/EEXIST/)
    assert.equal(await readFile(`${path}.import.lock`,'utf8'),'Synthetic existing lock');await rm(`${path}.import.lock`)
    await writeFile(`${path}.test-only.pending`,'Synthetic existing pending file')
    await assert.rejects(importBatchFile(root,'packet.json',{apply:true}),/EEXIST/)
    assert.equal(await readFile(`${path}.test-only.pending`,'utf8'),'Synthetic existing pending file');assert.equal(await readFile(path,'utf8'),raw)
    await rm(`${path}.test-only.pending`)
    const applied=await importBatchFile(root,'packet.json',{apply:true});assert.equal(applied.applied,true)
    const backup=join(root,`.generated/import-backups/test-only-${createHash('sha256').update(raw).digest('hex').slice(0,16)}.json`)
    assert.equal(await readFile(backup,'utf8'),raw)
    const bytes=await readFile(path),mtime=(await stat(path)).mtimeMs
    const repeat=await importBatchFile(root,'packet.json',{apply:true});assert.equal(repeat.applied,false);assert.equal(repeat.counts.unchanged,1)
    assert.ok(bytes.equals(await readFile(path)));assert.equal((await stat(path)).mtimeMs,mtime)
    await assert.rejects(stat(`${path}.import.lock`),/ENOENT/)
    await assert.rejects(importBatchFile(root,'../outside.json'),/вне проекта/)
  }finally{await rm(root,{recursive:true,force:true})}
})

test('Commons licence/author/species matching is an explicit gate, independent of species verification and visual review',()=>{
  const c=research.candidates.find(c=>c.id==='european-glass-lizard')
  const page={imageinfo:[{descriptionurl:c.photoResearch.photo.originalPage,width:2400,height:1600,extmetadata:{LicenseShortName:{value:'CC BY-SA 4.0'},Artist:{value:'Konstantinos Kalaentzis'},LicenseUrl:{value:'https://creativecommons.org/licenses/by-sa/4.0/'},ImageDescription:{value:'Pseudopus apodus'}}}],revisions:[{revid:1,slots:{main:{'*':'{{self|cc-by-sa-4.0}}'}}}]}
  assert.equal(checkCommonsMetadata(c,page).license,'CC BY-SA 4.0')
  for(const key of ['Artist','LicenseShortName','ImageDescription']){
    const copy=structuredClone(page);copy.imageinfo[0].extmetadata[key].value='Unsupported test value';assert.throws(()=>checkCommonsMetadata(c,copy))
  }
  const noRights=structuredClone(c);noRights.photoResearch.photo.rightsConfirmed=false;assert.throws(()=>checkCommonsMetadata(noRights,page),/допуска/)
  const unreviewed=structuredClone(photos);delete unreviewed.receipts.find(r=>r.status==='prepared').visualReview
  assert.match(prepareResearchBatch(research,selection,{taxonomyEvidence:tax,imageEvidence:unreviewed}).records[0].deferredReason,/визуальный/)
  const foreign=structuredClone(research);foreign.candidates.find(c=>c.id==='european-glass-lizard').countryOccurrence.countryCode='GR'
  assert.match(prepareResearchBatch(foreign,selection,{taxonomyEvidence:tax,imageEvidence:photos}).records[0].deferredReason,/Кыргызстан/)
  const wrongSubject=structuredClone(research);wrongSubject.candidates.find(c=>c.id==='european-glass-lizard').photoResearch.photo.subjectAsDocumented='Different taxon'
  assert.match(prepareResearchBatch(wrongSubject,selection,{taxonomyEvidence:tax,imageEvidence:photos}).records[0].deferredReason,/Определение фотографии/)
})

test('local asset verification checks real WebP dimensions, fingerprint and metadata, and rejects private/projected paths',async()=>{
  for(const s of source.catalog.slice(17).filter(s=>s.images.length)){
    assert.deepEqual(await inspectAssets(PROJECT_ROOT,s),[])
    const image=s.images[0],metadata=webpMetadata(await readFile(join(PROJECT_ROOT,image.path)))
    assert.deepEqual(metadata,{width:image.width,height:image.height,privateMetadata:false})
    const copy=structuredClone(s);copy.images[0].width++;assert.match((await inspectAssets(PROJECT_ROOT,copy)).join(' '),/размеры/)
    copy.images[0].sha256='0'.repeat(64);assert.match((await inspectAssets(PROJECT_ROOT,copy)).join(' '),/SHA-256/)
    copy.images[0].path='../outside.webp';assert.match((await inspectAssets(PROJECT_ROOT,copy)).join(' '),/вне проекта/)
  }
  assert.throws(()=>webpMetadata(Buffer.from('RIFFfakeWEBP')),/Повреждённый/)
})

test('new records preserve unknown populations and scientific language fallbacks; parent IUCN/photo never become subspecies facts',()=>{
  const added=source.catalog.slice(17)
  assert.equal(added.length,13);assert.equal(added.filter(s=>s.images.length).length,4);assert.equal(added.filter(s=>!s.images.length).length,9)
  for(const s of added){
    assert.equal(s.verified,false);assert.equal(s.lastReviewedAt,null);assert.equal(s.population.type,'unknown');assert.equal(s.population.reviewStatus,'pending');assert.equal(s.population.value,null)
    assert.equal(s.nationalRedBook.year,2006);assert.match(s.nationalRedBook.edition,/историческая/)
    assert.deepEqual(s.regions.map(r=>r.code),['KG']);assert.equal(s.iucn.year,null)
    for(const lang of ['ky','en'])assert.deepEqual(scientificContent(s.habitat.description,lang),{text:s.habitat.description.ru,language:'ru',fallback:true})
  }
  const bustard=added.find(s=>s.id==='great-bustard')
  assert.equal(bustard.scientificName,'Otis tarda tarda');assert.equal(bustard.iucn.category,null);assert.deepEqual(bustard.images,[])
  const fir=added.find(s=>s.id==='semenovs-fir');assert.equal(fir.scientificName,'Abies sibirica semenovii');assert.equal(fir.iucn.category,'LC');assert.deepEqual(fir.iucn.sourceIds,['iucn-subspecies'])
  assert.equal(added.find(s=>s.id==='tien-shan-scutiger').scientificName,'Albatrellus tianschanicus')
  assert.deepEqual(JSON.parse(exportSource(importSource(JSON.stringify(source)))),source)
})

test('all 30 names are searchable and lazy pagination yields 12/24/30 without duplicates across eight groups',()=>{
  const index=createSearchIndex(published),catalog=useCatalog(ref(published))
  for(const s of published)for(const name of [...Object.values(s.names),s.scientificName].filter(Boolean))assert.ok(searchSpecies(index,name).some(r=>r.species.id===s.id),name)
  assert.equal(catalog.page.value.entries.length,12);assert.equal(catalog.page.value.remaining,18)
  catalog.more();assert.equal(catalog.page.value.entries.length,24);catalog.more();assert.equal(catalog.page.value.entries.length,30)
  assert.equal(new Set(catalog.page.value.entries.map(r=>r.species.id)).size,30)
  for(const group of GROUPS){catalog.group.value=group;assert.ok(catalog.results.value.length>0);assert.ok(catalog.results.value.every(r=>r.species.group===group))}
})

test('all 13 new records render in KY/RU/EN with licensed local photos or honest placeholders and a working modal/lesson',async()=>{
  const vite=await createServer({server:{middlewareMode:true,ws:false,hmr:false,watch:null},appType:'custom',logLevel:'error'})
  try{
    const {siteLanguage}=await vite.ssrLoadModule('/src/composables/useLocale.js'),components={}
    for(const name of ['SpeciesCard.vue','SpeciesModal.vue','lesson/LessonPhoto.vue'])components[name]=(await vite.ssrLoadModule(`/src/components/${name}`)).default
    for(const language of ['ky','ru','en']){
      siteLanguage.value=language
      for(const s of published.slice(17))for(const [file,Component]of Object.entries(components)){
        const html=await renderToString(createSSRApp(Component,{species:s}))
        assert.ok(html.includes(s.images[0]?.path||'placeholder.svg'),`${file}: ${s.id}`)
        if(s.images.length){assert.ok(html.includes(s.images[0].license));assert.ok(html.includes(s.images[0].author))}
        if(file==='SpeciesModal.vue')assert.ok(html.includes(s.scientificName))
        if(file==='SpeciesCard.vue')assert.ok(html.includes('loading="lazy"'))
        if(file!=='lesson/LessonPhoto.vue'||s.images.length)assert.ok(html.includes('lang="ru"'))
      }
    }
  }finally{await vite.close()}
})
