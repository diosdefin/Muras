// Read-only, offline audit of task 25.5. No approval, import or public writes.
import fs from 'node:fs'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { digest, fingerprint, candidateFingerprint, checkRegistry } from './lib/research-pipeline.mjs'
import { createLocalAdapter, inspectPipelineAssets } from './lib/local-research-adapter.mjs'
import { taxonNameKey } from './lib/bulk-import.mjs'
import { validateSpecies } from '../src/data/species-model.js'
import { UNKNOWN_POPULATION } from '../src/data/population.js'
import { scientificContent, LANGUAGES } from '../src/data/localization.js'
const root=resolve(fileURLToPath(new URL('..',import.meta.url)))
const bytes=p=>fs.readFileSync(resolve(root,p))
const read=p=>JSON.parse(bytes(p))
const sha=p=>digest(bytes(p))
const git=(...args)=>execFileSync('git',args,{cwd:root,maxBuffer:16*1024*1024})
const baseline=read('docs/evidence/catalog-181-baseline.json')
const registryPath='data/research/catalog-181-content-registry.json'
const manifestPath='data/research/catalog-181-review-manifest.json'
const registry=read(registryPath),manifest=read(manifestPath)
const source=read('data/species.source.json')
const old=read('data/research/catalog-200-conflict-resolution.json')
const selected=old.decisions.filter(c=>c.status==='READY')
const held=['papilio-alexanor-voldemar','megalodontes-kuznetzovi','polochrum-pamirepandum']
assert.equal(git('branch','--show-current').toString().trim(),'feature/catalog-200')
assert.equal(baseline.sourceCommit,'903a932a8b7577b85d9c3734bee03ce512e0b72e')
git('merge-base','--is-ancestor',baseline.sourceCommit,'HEAD')
assert.equal(source.catalog.length,166)
assert.equal(source.demoArchive.length,2)
assert.deepEqual(source,JSON.parse(git('show',`${baseline.sourceCommit}:data/species.source.json`)))
assert.equal(sha('data/species.source.json'),'79197b9323386983951a56c889b5246884a5d9a17bc203b94ad077bd96892360')
for(const f of baseline.files){
 if(f.path!=='.gitattributes')assert.equal(sha(f.path),f.sha256,`Previously tracked file changed: ${f.path}`)
}
// The sole old-file edit appends LF rules for new fingerprinted JSON.
const oldAttributes=git('show',`${baseline.sourceCommit}:.gitattributes`).toString().replace(/\r\n/g,'\n')
const attributes=bytes('.gitattributes').toString().replace(/\r\n/g,'\n')
assert.equal(attributes.slice(0,oldAttributes.length),oldAttributes)
assert.equal(attributes.slice(oldAttributes.length).trim(),[
 '# Fingerprinted task-25.5 preparation materials.',
 'data/research/catalog-181*.json text eol=lf',
 'data/research/catalog-181-content/**/*.json text eol=lf',
 'docs/evidence/catalog-181*.json text eol=lf'].join('\n'))
assert.equal(selected.length,15)
assert.deepEqual(registry.candidates.map(c=>c.id),selected.map(c=>c.id))
assert.deepEqual(manifest.sourceReadyCandidateIds,selected.map(c=>c.id))
assert.deepEqual(manifest.candidateIds,selected.filter(c=>!held.includes(c.id)).map(c=>c.id))
assert.deepEqual(manifest.withheldCandidates.map(c=>c.id),held)
assert.equal(manifest.registry,registryPath)
assert.equal(manifest.registryFingerprint,fingerprint(registry))
assert.equal(manifest.registrySha256,sha(registryPath))
assert.equal(manifest.sourceDecisionSha256,sha(manifest.sourceDecisionFile))
assert.equal(manifest.draftedCandidateCount,15)
assert.equal(manifest.preparedCandidateCount,12)
assert.equal(manifest.withheldCandidateCount,3)
assert.equal(manifest.baselineCatalogCount,166)
assert.equal(manifest.potentialCatalogCountAfterSeparateAuthorizedImport,178)
for(const object of [registry,manifest]){
 assert.equal(object.ownerAuthorization,null)
 assert.equal(object.scientificApproval,null)
 assert.equal(object.publicationAllowed,false)
}
const adapter=createLocalAdapter(root)
const taxonomy=read('docs/evidence/catalog-181-taxonomy.json')
const imageReceipts=read('docs/evidence/catalog-181-images.json').receipts
const existing=[...source.catalog,...source.demoArchive]
const ids=new Set(existing.map(s=>s.id))
const names=new Set(existing.map(s=>taxonNameKey(s.scientificName)))
const taxonIds=new Set(existing.flatMap(s=>s.sources.map(s=>s.taxonId).filter(Boolean)))
const groups={},readyGroups={},placeholders=[]
let imageCount=0,minOverviewWords=Infinity,maxOverviewWords=0
for(const [i,c] of registry.candidates.entries()){
 const decision=selected[i],withheld=held.includes(c.id)
 const entry=[...manifest.candidates,...manifest.withheldCandidates].find(e=>e.id===c.id)
 assert.equal(c.originalScientificName,decision.historicalScientificName)
 assert.equal(c.acceptedScientificName,decision.acceptedScientificName)
 assert.equal(c.rank,decision.acceptedRank)
 assert.equal(c.group,decision.group)
 assert.equal(c.sourceDecision.originalStatus,'READY')
 assert.equal(c.sourceDecision.sha256,manifest.sourceDecisionSha256)
 assert.deepEqual(c.nationalConfirmation.pages,decision.nationalSources.bookPages)
 assert.equal(c.nationalConfirmation.bookYear,2006)
 assert.equal(c.nationalConfirmation.modernPresenceConfirmed,null)
 assert.equal(c.countryOccurrence.currentPresenceConfirmed,null)
 assert.equal(c.nationalRedBook.claimsCurrentLegalStatus,false)
 assert.equal(c.state,withheld?'needs_evidence':'ready_for_review')
 assert.equal(c.verified,false)
 assert.equal(c.lastReviewedAt,null)
 assert.equal(c.scientificReviewStatus,'pending')
 assert.equal(c.independentScientificReview,'pending')
 assert.equal(c.approval,null)
 assert.equal(ids.has(c.id),false,`Duplicate ID: ${c.id}`)
 ids.add(c.id)
 for(const name of new Set([c.originalScientificName,c.acceptedScientificName].map(taxonNameKey))){
  assert.equal(names.has(name),false,`Duplicate historical/accepted name: ${name}`)
  names.add(name)
 }
 if(withheld){
  assert.equal(c.taxonomyEvidence,null)
  assert.ok(c.contradictions.length>0)
  assert.ok(entry.reason.length>20)
 }else{
  assert.deepEqual(c.contradictions,[])
  const t=c.taxonomyEvidence,r=taxonomy.records.find(r=>r.candidateId===c.id)
  assert.equal(r.httpStatus,200)
  assert.equal(r.data.taxonomicStatus,'ACCEPTED')
  assert.equal(r.data.rank,c.rank)
  assert.equal(taxonNameKey(r.data.canonicalName),taxonNameKey(c.acceptedScientificName))
  assert.equal(t.taxonId,`gbif:${r.data.key}`)
  assert.equal(t.matchType,'EXACT')
  assert.ok(taxonomy.datasets.some(d=>d.key===r.data.datasetKey&&d.data.key===d.key&&d.data.title))
  assert.equal(taxonIds.has(t.taxonId),false,`Duplicate taxon key: ${t.taxonId}`)
  taxonIds.add(t.taxonId)
 }
 const loaded=await adapter.load(c),d=loaded.draft
 assert.equal(candidateFingerprint(c,loaded),c.checkedFingerprint,c.id)
 assert.equal(entry.checkedFingerprint,c.checkedFingerprint)
 assert.equal(entry.draftSha256,loaded.draftSha256)
 assert.equal(c.preparation.draftSha256,loaded.draftSha256)
 assert.equal(c.preparation.draftSemanticFingerprint,fingerprint(d))
 assert.deepEqual(validateSpecies([d]),[])
 assert.deepEqual(await inspectPipelineAssets(root,d),[])
 assert.equal(d.scientificName,c.acceptedScientificName)
 assert.deepEqual(d.sources,c.sources)
 assert.equal(d.verified,false)
 assert.equal(d.lastReviewedAt,null)
 assert.equal(d.publication,undefined)
 assert.deepEqual(d.population,UNKNOWN_POPULATION)
 assert.deepEqual(d.iucn,{category:null,year:null,sourceIds:[]})
 assert.equal(d.nationalRedBook.year,2006)
 assert.match(d.nationalRedBook.edition,/историческ/)
 for(const l of LANGUAGES){
  assert.ok(d.names[l]?.trim())
  const text=d.content.shortDescription.text[l]
  assert.ok(text?.trim()&&text.length<=300&&!text.includes('\uFFFD'))
 }
 assert.equal(d.names.uz,c.acceptedScientificName)
 const words=d.content.overview.text.ru.split(/\s+/).filter(Boolean).length
 assert.ok(words>=150,`Incomplete Russian overview: ${c.id}`)
 minOverviewWords=Math.min(minOverviewWords,words);maxOverviewWords=Math.max(maxOverviewWords,words)
 for(const [key,section] of Object.entries(d.content)){
  if(!section||key==='shortDescription')continue
  for(const l of ['ky','uz','en'])assert.equal(section.text[l],null)
  for(const id of section.sourceIds)assert.ok(d.sources.some(s=>s.id===id),`${c.id}: missing source ${id}`)
 }
 for(const l of ['ky','uz','en']){
  const fallback=scientificContent(d.content.overview.text,l)
  assert.equal(fallback.language,'ru');assert.equal(fallback.fallback,true)
 }
 for(const image of d.images){
  const receipt=imageReceipts.find(r=>r.candidateId===c.id)
  assert.deepEqual(image,receipt.image)
  assert.equal(receipt.outputVisualReview,true)
  assert.equal(receipt.visualReview.reviewed,true)
  assert.equal(sha(image.path),image.sha256)
  assert.equal(image.licenseVerified,true)
  assert.match(image.caption.ru,/не свидетельство нахождения в Кыргызстане/i)
 }
 imageCount+=d.images.length
 if(!d.images.length)placeholders.push(c.id)
 groups[c.group]=(groups[c.group]||0)+1
 if(!withheld)readyGroups[c.group]=(readyGroups[c.group]||0)+1
}
assert.equal(imageCount,2);assert.equal(placeholders.length,13)
assert.deepEqual(groups,{plants:3,arthropods:4,fish:3,reptiles:1,birds:1,mammals:3})
const fresh=await checkRegistry(registry,source,{adapter,validateAssets:d=>inspectPipelineAssets(root,d)})
const savedCheck=read('docs/evidence/catalog-181-bulk-check.json')
const {metrics,...savedCheckContent}=savedCheck
assert.deepEqual(fresh.report,savedCheckContent)
assert.deepEqual(fresh.registry,registry)
assert.deepEqual(fresh.report.counts,{processed:15,accepted:12,deferred:3,rejected:0})
const dryRun=read('docs/evidence/catalog-181-import-dry-run.json')
assert.equal(dryRun.applied,false)
assert.equal(dryRun.mode,'preview')
assert.equal(dryRun.beforeCount,166);assert.equal(dryRun.afterCount,178)
assert.equal(dryRun.sourceSha256,sha('data/species.source.json'))
assert.deepEqual(dryRun.counts,{processed:12,added:12,unchanged:0,rejected:0})
assert.deepEqual(dryRun.results.map(r=>r.candidateId),manifest.candidateIds)
assert.ok(dryRun.results.every(r=>r.errors.length===0))
const files=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(dir,e.name)):[join(dir,e.name)])
for(const dir of ['public','dist']){
 const published=read(`${dir}/data/species.json`)
 assert.equal((Array.isArray(published)?published:published.catalog).length,166)
 assert.ok(!files(resolve(root,dir)).some(p=>/catalog181-/.test(p)),`Unpublished image leaked: ${dir}`)
}
const distBytes=files(resolve(root,'dist')).reduce((n,p)=>n+fs.statSync(p).size,0)
console.log(JSON.stringify({schemaVersion:1,sourceCommit:baseline.sourceCommit,catalogCount:166,archiveCount:2,
 selectedReadyFromTask25_4:15,drafted:15,technicallyReady:12,needsEvidence:held,approved:0,imported:0,
 groups,readyGroups,imageCount,placeholderCount:13,readyImageCount:2,readyPlaceholderCount:10,
 oldFilesByteIdentical:baseline.files.length-1,onlyOldFileChange:'Append LF rules to .gitattributes for new task-25.5 JSON',
 sourceSha256:sha('data/species.source.json'),individualFingerprintsValid:true,
 manifestSha256:sha(manifestPath),registryFingerprint:fingerprint(registry),registrySha256:sha(registryPath),
 russianOverviewWordRange:[minOverviewWords,maxOverviewWords],fourShortLanguagesValid:true,
 scientificReviewStatus:'pending',dryRun:dryRun.counts,distBytes},null,2))
