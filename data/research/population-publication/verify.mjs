// Read-only verification, never issues editorial decisions or applies catalogue patches.
import {readFileSync,statfsSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {isDeepStrictEqual} from 'node:util'
import {populationFingerprint,validateDocumentedPopulation,checkPopulationPublication} from '../../../src/data/population-publication.js'
const read=p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,''))
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex')
const packet=read('data/research/population-publication-candidates.json'),prior=read(packet.sourceRegistry),source=read('data/species.source.json'),baseline=read('data/research/population-publication/baseline.json')
const errors=[]
const protectedFiles=Object.entries(baseline.hashes).filter(([p])=>/^(data|public|assets|docs\/evidence|docs\/research)\//.test(p)&&p!=='data/.gitattributes')
const changedProtectedFiles=protectedFiles.filter(([p,h])=>sha(p)!==h).map(([p])=>p)
errors.push(...changedProtectedFiles.map(p=>'Protected bytes changed: '+p))
const {registryFingerprint,...body}=packet
if(await populationFingerprint(body)!==registryFingerprint)errors.push('Registry fingerprint mismatch')
const {fingerprint,...manifest}=packet.selectionManifest
if(await populationFingerprint(manifest)!==fingerprint)errors.push('Manifest fingerprint mismatch')
let deniedWithoutOwner=0
for(const c of packet.candidates){
 const s=source.catalog.find(s=>s.id===c.identity.speciesId)
 const identity={speciesId:s?.id,acceptedScientificName:s?.scientificName,taxonRank:s?.scientificName.split(/\s+/).length===3?'SUBSPECIES':'SPECIES',taxonIds:[...new Set((s?.sources||[]).filter(s=>s.taxonId).map(s=>s.taxonId))]}
 errors.push(...validateDocumentedPopulation(c,identity))
 const {candidateFingerprint,...claim}=c
 if(await populationFingerprint(claim)!==candidateFingerprint)errors.push('Candidate fingerprint mismatch')
 const old=prior.records.find(r=>r.speciesId===s.id)?.estimates.find(e=>e.evidenceId===c.documentation.evidenceId)
 if(old?.sourceReadiness!=='READY_SOURCE_DOCUMENTED'||old?.fingerprint!==c.documentation.evidenceFingerprint)errors.push('Prior evidence not bound')
 for(const key of ['type','value','min','max','year','observationPeriod','publicationYear','territory','confidenceInterval','uncertaintyInterval'])if(!isDeepStrictEqual(c.estimate[key]??null,old[key]??null))errors.push('Projection changed scientific estimate: '+key)
 if((await checkPopulationPublication({candidate:c,manifest:packet.selectionManifest,decision:null},identity)).length)deniedWithoutOwner++
}
for(const a of packet.assessments){
 const original=prior.records.find(r=>r.speciesId===a.speciesId)
 if(!isDeepStrictEqual(a.readyEstimates,original?.estimates.filter(c=>c.sourceReadiness==='READY_SOURCE_DOCUMENTED')))errors.push('Historical ready estimates altered')
}
if(packet.ownerAuthorization!==null||packet.populationPublicationStatus!=='unpublished'||packet.counts.published!==0||deniedWithoutOwner!==packet.candidates.length)errors.push('Unexpected publication or owner permission')
const fs=statfsSync('.'),result={task:'28.4',sourceCommit:baseline.head,errors,readOnly:true,counts:packet.counts,publicationPermittedNow:0,deniedWithoutOwner,protectedFileCount:protectedFiles.length,changedProtectedFiles,sourceCatalogueSHA256:sha('data/species.source.json'),publicCatalogueSHA256:sha('public/data/species.json'),priorRegistrySHA256:sha(packet.sourceRegistry),candidateRegistrySHA256:sha('data/research/population-publication-candidates.json'),candidateRegistryFingerprint:packet.registryFingerprint,selectionManifestFingerprint:packet.selectionManifest.fingerprint,freeDiskBytes:fs.bavail*fs.bsize}
console.log(JSON.stringify(result,null,2));if(errors.length)process.exitCode=1
