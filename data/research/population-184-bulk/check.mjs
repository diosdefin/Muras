// Read-only compatibility and integrity report. Never calls apply/approve/provisional.
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { isDeepStrictEqual } from 'node:util'
import { validateResearchPacket } from './validate.mjs'
import { populationPresentation, validatePopulation } from '../../../src/data/population.js'
import { planBatchImport } from '../../../scripts/lib/bulk-import.mjs'
const read=p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,''))
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex')
const packet=read('data/research/population-184-bulk-publication.json'),source=read('data/species.source.json')
const drafts=read('data/research/population-184-bulk/pending-population-drafts.json')
const manifest=read('data/research/population-184-bulk/manifest.json'),base=read('data/research/population-184-bulk/baseline.json')
const errors=validateResearchPacket(packet,source.catalog)
const changedPriorFiles=Object.entries(base.hashes).filter(([p,h])=>sha(p)!==h).map(([p])=>p)
const permittedChanges=['data/.gitattributes','tests/population-activation.test.mjs']
if(!isDeepStrictEqual(changedPriorFiles,permittedChanges))errors.push('Unexpected prior-file change')
const compatibility=drafts.candidates.map(d=>({speciesId:d.speciesId,evidenceId:d.evidenceId,shapeErrors:validatePopulation(d.population,d.sources),publicType:populationPresentation(d.population,d.sources).type}))
const d=drafts.candidates.find(c=>c.speciesId==='eurasian-lynx'&&c.population.year===2024)
const s=structuredClone(source.catalog.find(s=>s.id===d.speciesId));s.population=d.population;s.sources.push(...d.sources)
const taxon=s.sources.find(r=>r.taxonId==='gbif:2435240')
const batch={schemaVersion:1,documentType:'species-import-batch',batchId:'research-only-existing-id-patch-probe',records:[{candidateId:s.id,species:s,taxonomyEvidence:{status:'ACCEPTED',matchType:'EXACT',rank:'SPECIES',canonicalName:s.scientificName,taxonId:taxon.taxonId,sourceId:taxon.id}}]}
const a=await planBatchImport(source,batch),b=await planBatchImport(source,batch)
const summarize=p=>({before:p.beforeCount,after:p.afterCount,counts:p.counts,errors:p.results.flatMap(r=>r.errors)})
const results={task:'28.3',readOnly:true,errors,catalogue:source.catalog.length,archive:source.demoArchive.length,photos:source.catalog.filter(s=>s.images.length).length,placeholder:source.catalog.filter(s=>!s.images.length).length,registryFingerprint:packet.registryFingerprint,manifestSHA256:sha('data/research/population-184-bulk/manifest.json'),registrySHA256:sha('data/research/population-184-bulk-publication.json'),manifestEstimates:manifest.estimates.length,manifestTaxa:manifest.speciesIds.length,shapeValid:compatibility.filter(r=>!r.shapeErrors.length).length,shapeBlocked:compatibility.filter(r=>r.shapeErrors.length).length,hiddenByPublicGate:compatibility.filter(r=>r.publicType==='unknown').length,publicationPermitted:0,published:0,firstReadOnlyProbe:summarize(a),secondReadOnlyProbe:summarize(b),identicalProbes:isDeepStrictEqual(a,b),proposedSourceUnchanged:isDeepStrictEqual(a.proposedSource,source),unchangedPriorFiles:Object.keys(base.hashes).length-changedPriorFiles.length,changedPriorFiles,compatibility}
console.log(JSON.stringify(results,null,2))
if(errors.length||!results.identicalProbes||!results.proposedSourceUnchanged||results.hiddenByPublicGate!==36)process.exitCode=1
