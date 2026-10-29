// Offline task-25.9 provenance and preservation audit; no approvals or public writes.
import fs from 'node:fs'
import assert from 'node:assert/strict'
import {resolve} from 'node:path'
import {execFileSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
import {digest,fingerprint,candidateFingerprint,checkRegistry} from './lib/research-pipeline.mjs'
import {createLocalAdapter,inspectPipelineAssets} from './lib/local-research-adapter.mjs'
import {validateSpecies} from '../src/data/species-model.js'
import {UNKNOWN_POPULATION} from '../src/data/population.js'
import {taxonNameKey} from './lib/bulk-import.mjs'
import {canApplyOnBranch,webpMetadata} from './import-species-batch.mjs'
const root=resolve(fileURLToPath(new URL('..',import.meta.url))),bytes=p=>fs.readFileSync(resolve(root,p)),read=p=>JSON.parse(bytes(p)),sha=p=>digest(bytes(p))
const baseline=read('docs/evidence/catalog-187-baseline.json'),registryPath='data/research/catalog-187-content-registry.json',manifestPath='data/research/catalog-187-review-manifest.json'
const registry=read(registryPath),manifest=read(manifestPath),decision=read('data/research/catalog-200-final-taxonomy-review.json'),source=read('data/species.source.json')
assert.equal(baseline.sourceCommit,'841110e08bbd262d3624a5553f39e682cf921c93')
assert.equal(execFileSync('git',['branch','--show-current'],{cwd:root,encoding:'utf8'}).trim(),'feature/catalog-200')
execFileSync('git',['merge-base','--is-ancestor',baseline.sourceCommit,'HEAD'],{cwd:root})
assert.equal(source.catalog.length,178);assert.equal(source.demoArchive.length,2)
assert.equal(read('public/data/species.json').length,178)
for(const f of baseline.files)assert.equal(sha(f.path),f.sha256,'Protected old file '+f.path)
const ids=decision.decisions.filter(c=>c.status==='READY').map(c=>c.id)
assert.deepEqual(registry.candidates.map(c=>c.id),ids);assert.deepEqual(manifest.sourceReadyCandidateIds,ids)
const held=['papilio-alexanor-voldemar','megalodontes-kuznetzovi','polochrum-pamirepandum']
assert.deepEqual(manifest.withheldCandidates.map(c=>c.id),held)
assert.deepEqual(manifest.candidateIds,ids.filter(id=>!held.includes(id)))
assert.equal(manifest.registryFingerprint,fingerprint(registry));assert.equal(manifest.registrySha256,sha(registryPath))
assert.equal(manifest.sourceDecisionSha256,sha(manifest.sourceDecisionFile));assert.equal(manifest.preparedCandidateCount,6)
assert.equal(manifest.potentialCatalogCountAfterSeparateAuthorizedImport,184)
const adapter=createLocalAdapter(root),checked=await checkRegistry(registry,source,{adapter,validateAssets:s=>inspectPipelineAssets(root,s)})
assert.deepEqual(checked.report.counts,{processed:9,accepted:6,deferred:3,rejected:0})
const seen=new Set(),taxa=new Set();let images=0,minWords=Infinity,maxWords=0
for(const c of registry.candidates){
 const d=read(c.draftFile),loaded=await adapter.load(c),upstream=decision.decisions.find(x=>x.id===c.id)
 assert.equal(c.sourceDecision.originalStatus,'READY');assert.equal(c.sourceDecision.sha256,sha(c.sourceDecision.file))
 assert.equal(c.acceptedScientificName,upstream.acceptedScientificName);assert.equal(c.rank,upstream.acceptedRank)
 assert.equal(c.checkedFingerprint,candidateFingerprint(c,loaded));assert.equal(c.preparation.draftSha256,sha(c.draftFile))
 assert.equal(c.preparation.draftSemanticFingerprint,fingerprint(d))
 assert.equal(c.approval,null);assert.equal(c.scientificReviewStatus,'pending');assert.equal(c.independentScientificReview,'pending')
 assert.deepEqual(validateSpecies([d]),[],c.id);assert.equal(d.verified,false);assert.equal(d.lastReviewedAt,null);assert.equal(d.publication,undefined)
 assert.deepEqual(d.population,UNKNOWN_POPULATION);assert.deepEqual(d.iucn,{category:null,year:null,sourceIds:[]})
 assert.equal(d.nationalRedBook.year,2006);assert.match(d.nationalRedBook.edition,/историческ/)
 assert.ok(!source.catalog.some(s=>s.id===c.id||taxonNameKey(s.scientificName)===taxonNameKey(d.scientificName)))
 assert.ok(!source.demoArchive.some(s=>s.id===c.id||taxonNameKey(s.scientificName)===taxonNameKey(d.scientificName)))
 assert(!seen.has(taxonNameKey(d.scientificName)));seen.add(taxonNameKey(d.scientificName))
 for(const l of ['ky','uz','ru','en']){assert(d.names[l]?.trim());assert(d.content.shortDescription.text[l]?.trim());assert(d.content.shortDescription.text[l].length<=300);assert(!d.content.shortDescription.text[l].includes('\uFFFD'))}
 const words=d.content.overview.text.ru.split(/\s+/u).filter(Boolean).length;assert(words>=150);minWords=Math.min(minWords,words);maxWords=Math.max(maxWords,words)
 for(const k of ['overview','appearance','ecology','diet','reproduction','distribution'])if(d.content[k])for(const l of ['ky','uz','en'])assert.equal(d.content[k].text[l],null)
 if(held.includes(c.id)){assert.equal(c.state,'needs_evidence');assert.equal(c.taxonomyEvidence,null);assert(c.missingData.length);assert(!manifest.candidateIds.includes(c.id));}
 else{assert.equal(c.state,'ready_for_review');assert.equal(c.taxonomyEvidence.rank,c.rank);assert.equal(c.taxonomyEvidence.status,'ACCEPTED');assert.equal(c.taxonomyEvidence.matchType,'EXACT');assert.equal(taxonNameKey(c.taxonomyEvidence.canonicalName),taxonNameKey(c.acceptedScientificName));assert(!taxa.has(c.taxonomyEvidence.taxonId));taxa.add(c.taxonomyEvidence.taxonId);assert.deepEqual(await inspectPipelineAssets(root,d),[]);const m=manifest.candidates.find(m=>m.id===c.id);assert.equal(m.checkedFingerprint,c.checkedFingerprint);assert.equal(m.draftSha256,sha(c.draftFile));}
 for(const im of d.images){images++;assert.equal(sha(im.path),im.sha256);assert.deepEqual(webpMetadata(bytes(im.path)),{width:im.width,height:im.height,privateMetadata:false});}
}
assert.equal(images,1);assert.equal(manifest.candidates.filter(c=>!read(c.draftFile).images.length).length,5)
for(const obj of [manifest,registry]){assert.equal(obj.scientificApproval,null);assert.equal(obj.ownerAuthorization,null);assert.equal(obj.publicationAllowed,false)}
assert.equal(canApplyOnBranch('feature/catalog-200'),true);assert.equal(canApplyOnBranch('main'),false)
const runs=read('docs/evidence/catalog-187-dry-runs.json');assert.deepEqual(runs.runs[0].report,runs.runs[1].report)
for(const run of runs.runs){assert.equal(run.report.beforeCount,178);assert.equal(run.report.afterCount,184);assert.deepEqual(run.report.counts,{processed:6,added:6,unchanged:0,rejected:0});assert.equal(run.report.applied,false);assert.equal(run.report.mode,'preview');assert(run.report.results.every(x=>x.errors.length===0));}
console.log(JSON.stringify({status:'passed',drafts:9,eligible:6,held:3,images:1,placeholders:8,eligibleImages:1,eligiblePlaceholders:5,overviewWords:{min:minWords,max:maxWords},sourceCount:178,archiveCount:2,protectedFilesUnchanged:baseline.files.length,manifestSha256:sha(manifestPath),registryFingerprint:manifest.registryFingerprint,dryRunsIdentical:true,modelChanged:false,validatorChanged:false,scientificReviewStatus:'pending'},null,2))
