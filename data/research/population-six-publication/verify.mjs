import { UI_V3_FILES, assertUiV3File } from '../../../tests/helpers/ui-v3-preservation.mjs'
// Read-only audit of the real owner decision; it never issues or changes permissions.
import {readFileSync,statfsSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {isDeepStrictEqual} from 'node:util'
import {fileURLToPath} from 'node:url'
import {resolve} from 'node:path'
import {checkPopulationPublication,populationFingerprint,populationPublicationContexts} from '../../../src/data/population-publication.js'
const read=p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,''))
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex')
export const SIX_IDS=['eurasian-lynx','golden-eagle','irbis','lonicera-paradoxa','manul','ursus-arctos']
export async function verifySixPublication(){
 const packet=read('data/research/population-publication-candidates.json'), release=read('src/data/population-editorial-release.json'), audit=read('data/research/population-six-publication/owner-decision.json'),baseline=read('data/research/population-six-publication/baseline.json'),source=read('data/species.source.json')
 const errors=[],fail=s=>errors.push(s)
 if(baseline.head!=='b77e2030974778ebd1cfaba7f87a4d75d02a6739')fail('Unexpected baseline HEAD')
 const changedProtectedFiles=Object.entries(baseline.hashes).filter(([p,h])=>{
  if(sha(p)===h)return false
  if(!UI_V3_FILES.has(p))return true
  try{return !assertUiV3File(p)}catch{return true}
 }).map(([p])=>p)
 errors.push(...changedProtectedFiles.map(p=>'Protected bytes changed: '+p))
 if(sha('data/research/population-publication-candidates.json')!=='9b949266a1b96b2d39277040898f175fb071f98fb517c873e7855075418df8c1')fail('Preparation SHA-256 mismatch')
 const {registryFingerprint,...body}=packet
 if(registryFingerprint!=='13f2c5b5f958dda341502a84e00782a59310745ebfdd146880fae9df56696de8'||await populationFingerprint(body)!==registryFingerprint)fail('Preparation fingerprint mismatch')
 if(packet.selectionManifest.fingerprint!=='6e7af629fdae99d30b5c2da3ffd72a162babe57787f7db9b2fd5d22f50616b1a')fail('Selection fingerprint mismatch')
 if(!isDeepStrictEqual(release.candidates,packet.candidates)||!isDeepStrictEqual(release.selectionManifest,packet.selectionManifest)||release.preparationRegistryFingerprint!==packet.registryFingerprint)fail('Release exceeds immutable prepared packet')
 if(!isDeepStrictEqual(release.ownerAuthorization,audit.decision)||audit.authorizationEvidence.independentScientificApproval!==false||audit.authorizationEvidence.provenance!=='Explicit project-owner authorization in the human user message for task 28.5 in the current dialog')fail('Owner decision provenance mismatch')
 if(!isDeepStrictEqual(release.ownerAuthorization.authorizedCandidates,packet.selectionManifest.candidates))fail('Decision is not exactly the selected six')
 const contexts=populationPublicationContexts(release)
 if(!isDeepStrictEqual([...contexts.keys()].sort(),SIX_IDS))fail('Unexpected candidate IDs')
 let permitted=0,withImages=0
 for(const [id,ctx] of contexts){
  const s=source.catalog.find(s=>s.id===id),c=ctx.candidate
  const identity={speciesId:s?.id,acceptedScientificName:s?.scientificName,taxonIds:[...new Set((s?.sources||[]).filter(s=>s.taxonId).map(s=>s.taxonId))]}
  const e=await checkPopulationPublication(ctx,identity);errors.push(...e.map(e=>id+': '+e));if(!e.length)permitted++
  if(s?.images?.length)withImages++
  const record=audit.records.find(r=>r.speciesId===id)
  if(!record||record.evidenceId!==c.documentation.evidenceId||record.candidateFingerprint!==c.candidateFingerprint||record.evidenceFingerprint!==c.documentation.evidenceFingerprint||record.date!==audit.decision.date||record.decisionId!==audit.decision.decisionId||record.basis!==audit.decision.reason)fail('Incomplete decision record: '+id)
 }
 if(audit.records.length!==6||permitted!==6||withImages!==5)fail('Publication/image counts mismatch')
 const geography=read('data/geography/occurrences.source.json')
 if(source.catalog.length!==184||source.demoArchive.length!==2||geography.records.length!==208)fail('Protected catalogue counts mismatch')
 if(source.catalog.some(s=>s.population.type!=='unknown'||s.population.reviewStatus!=='pending'||s.verified!==false))fail('Legacy scientific status changed')
 const fs=statfsSync('.')
 return {task:'28.5',errors,sourceHEAD:baseline.head,decisionId:audit.decision.decisionId,decisionDate:audit.decision.date,registrySHA256:sha('data/research/population-publication-candidates.json'),registryFingerprint,selectionManifestFingerprint:packet.selectionManifest.fingerprint,published:permitted,symbolicVisualizationWithPhotos:withImages,placeholder:permitted-withImages,otherTaxaUnknown:source.catalog.length-permitted,alternativeEstimates:packet.counts.alternativeEstimates,catalogue:source.catalog.length,archive:source.demoArchive.length,regionalLinks:geography.records.length,protectedFiles:Object.keys(baseline.hashes).length,changedProtectedFiles,freeDiskBytes:fs.bavail*fs.bsize}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){const r=await verifySixPublication();console.log(JSON.stringify(r,null,2));if(r.errors.length)process.exitCode=1}
