import { populationPresentation, UNKNOWN_POPULATION } from './population.js'
import { tr } from '../locales/index.js'

const text = v => typeof v === 'string' && Boolean(v.trim())
const hash = v => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v)
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v)
const number = v => typeof v === 'number' && Number.isFinite(v) && v >= 0
const year = v => Number.isInteger(v) && v >= 1500 && v <= new Date().getFullYear()
const url = v => { try { return ['https:', 'http:'].includes(new URL(v).protocol) } catch { return false } }
const safe = (v, depth = 0) => depth < 40 && (v === null || typeof v === 'string' || typeof v === 'boolean' || typeof v === 'number' && Number.isFinite(v) || Array.isArray(v) && v.every(x => safe(x, depth + 1)) || object(v) && Object.getPrototypeOf(v) === Object.prototype && Object.entries(v).every(([k,x]) => !['__proto__','prototype','constructor'].includes(k) && safe(x, depth + 1)))
export const canonicalPopulationJSON = v => JSON.stringify(v, (_, x) => object(x) ? Object.fromEntries(Object.keys(x).sort().map(k => [k,x[k]])) : x)
// Web Crypto, not an ad-hoc checksum. Same plain JSON contract for local data and REST.
export async function populationFingerprint(value, cryptoProvider = globalThis.crypto) {
 if (!safe(value) || !cryptoProvider?.subtle) throw Error('Safe JSON and Web Crypto required')
 return [...new Uint8Array(await cryptoProvider.subtle.digest('SHA-256', new TextEncoder().encode(canonicalPopulationJSON(value))))].map(n => n.toString(16).padStart(2,'0')).join('')
}
const without = (value, key) => Object.fromEntries(Object.entries(value).filter(([k]) => k !== key))
const keysAre = (value, keys) => object(value) && Object.keys(value).length === keys.length && Object.keys(value).every(k => keys.includes(k))
const sourceStatuses = ['DOCUMENT_CONTENT_PREVIOUSLY_CHECKED','MIRROR_BYTES_CHECKED_OFFICIAL_REPORT_ANNOUNCEMENT_CORROBORATED']

export function validateDocumentedPopulation(candidate, identity) {
 const errors = [], fail = message => errors.push(message)
 if (!object(candidate) || !safe(candidate)) return ['Invalid documented candidate']
 const c = candidate, e = c.estimate, s = c.source, d = c.documentation, i = c.identity
 if (c.schemaVersion !== 1 || c.documentType !== 'documented-population-candidate' || !hash(c.candidateFingerprint)) fail('Candidate contract/fingerprint required')
 if (c.sourceReadiness !== 'READY_SOURCE_DOCUMENTED' || c.populationPublicationStatus !== 'unpublished') fail('Only prepared source-documented candidates are admissible')
 if (c.scientificReviewStatus !== 'pending' || c.verified !== false || c.lastReviewedAt !== null) fail('Independent scientific status must stay pending')
 if (!object(i) || !text(identity?.speciesId) || !text(identity?.acceptedScientificName) || i.speciesId !== identity.speciesId || i.acceptedScientificName !== identity.acceptedScientificName || !['SPECIES','SUBSPECIES'].includes(i.taxonRank) || i.acceptedScientificName.trim().split(/\s+/).length !== (i.taxonRank === 'SPECIES' ? 2 : 3) || !Array.isArray(i.taxonIds)) fail('Exact catalogue taxon identity/rank required')
 if (identity?.taxonRank && identity.taxonRank !== i?.taxonRank) fail('Taxon rank mismatch')
 if (identity?.taxonIds && canonicalPopulationJSON([...identity.taxonIds].sort()) !== canonicalPopulationJSON([...(i?.taxonIds || [])].sort())) fail('Taxon ID mismatch')
 if (!object(s) || !text(s.id) || !text(s.title) || !url(s.url) || s.retrievedUrl !== null && !url(s.retrievedUrl) || !text(String(s.sourcePage || '')) || !text(s.sourceName) || !sourceStatuses.includes(s.sourceConfirmationStatus)) fail('Documented source, URL, page and source name required')
 if (!object(d) || !hash(d.evidenceFingerprint) || !hash(d.researchRegistryFingerprint) || !text(d.evidenceId) || d.taxonMatchConfirmed !== true || d.territoryMatchConfirmed !== true || !Array.isArray(d.limitations) || !d.limitations.length || d.limitations.some(v=>!text(v))) fail('Exact taxon/territory documentation and limitations required')
 if (!object(e)) return [...errors,'Estimate required']
 if (!['exact','approximate','range'].includes(e.type)) fail('Numeric estimate type required')
 if (!text(e.territory) || !['KG_NATIONAL','KG_LOCAL','KG_MONITORING'].includes(e.scope)) fail('Explicit supported Kyrgyzstan scope required')
 if (!['individuals','adult individuals','specimens','pairs','breeding pairs','shrubs','plants of various ages'].includes(e.unit)) fail('Documented unit required')
 if (e.type === 'range') {
  if (e.value !== null || !number(e.min) || !number(e.max) || e.min > e.max || e.method !== 'estimate') fail('Range must retain both bounds without a midpoint')
 } else {
  if (!number(e.value) || e.min !== null || e.max !== null) fail('Point estimate must not absorb range bounds')
  if (e.type === 'exact' && (!Number.isSafeInteger(e.value) || e.value <= 0 || e.method !== 'complete-count' || !text(d.methodology))) fail('Exact requires documented complete count')
  if (e.type === 'approximate' && e.method !== 'estimate') fail('Approximate requires estimate method')
 }
 const period = e.observationPeriod
 if (e.year !== null) { if (!year(e.year) || period !== null) fail('Field year and observation period must not conflict') }
 else if (!object(period) || !year(period.startYear) || !year(period.endYear) || period.startYear > period.endYear) fail('Explicit observation year or bounded period required')
 if (!year(e.publicationYear) || (e.year ?? period?.endYear) > e.publicationYear) fail('Publication year required separately and must not predate observations')
 if (e.confidenceInterval !== null && e.uncertaintyInterval !== null) fail('Do not conflate confidence and unspecified uncertainty')
 for (const key of ['confidenceInterval','uncertaintyInterval']) if (e[key] !== null) {
  const x = e[key]
  if (!object(x) || !number(x.min) || !number(x.max) || x.min > x.max || e.type === 'range' || e.value < x.min || e.value > x.max || key === 'confidenceInterval' && !(typeof x.level === 'number' && x.level > 0 && x.level < 1)) fail('Invalid labelled statistical interval')
 }
 return errors
}

// decision is supplied ONLY by a trusted editorial release layer, never inferred from a claim.
// This validates scope/integrity; authentication of the human owner belongs to that layer.
export async function checkPopulationPublication(context, identity, { cryptoProvider = globalThis.crypto } = {}) {
 try {
  if (!object(context)) return ['No editorial release context']
  const {candidate:c, manifest:m, decision:d} = structuredClone(context)
  const errors = validateDocumentedPopulation(c, identity)
  if (errors.length) return errors
  if (!keysAre(m,['schemaVersion','documentType','researchRegistryFingerprint','candidates','fingerprint']) || m.schemaVersion !== 1 || m.documentType !== 'population-publication-selection' || m.researchRegistryFingerprint !== c.documentation.researchRegistryFingerprint || !hash(m.fingerprint) || !Array.isArray(m.candidates) || !m.candidates.length || m.candidates.length > 184 || m.candidates.some(r=>!keysAre(r,['speciesId','candidateFingerprint']) || !text(r.speciesId) || !hash(r.candidateFingerprint)) || new Set(m.candidates.map(r=>r.speciesId)).size !== m.candidates.length) return ['Invalid fixed selection manifest']
  if (!keysAre(d,['schemaVersion','decisionId','ownerRole','populationPublicationStatus','date','reason','packetFingerprint','authorizedCandidates']) || d.schemaVersion !== 1 || d.ownerRole !== 'project_owner' || d.populationPublicationStatus !== 'authorized' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(d.decisionId || '') || !text(d.reason) || !/^\d{4}-\d{2}-\d{2}$/.test(d.date || '') || !Number.isFinite(Date.parse(d.date)) || new Date(d.date).toISOString().slice(0,10) !== d.date || d.date > new Date().toISOString().slice(0,10) || d.packetFingerprint !== m.fingerprint || !Array.isArray(d.authorizedCandidates) || !d.authorizedCandidates.length || new Set(d.authorizedCandidates.map(r=>r.speciesId)).size !== d.authorizedCandidates.length) return ['Explicit current owner editorial authorization required; revoked or absent decisions deny display']
  if (d.authorizedCandidates.some(r=>!keysAre(r,['speciesId','candidateFingerprint']) || !m.candidates.some(entry=>entry.speciesId === r.speciesId && entry.candidateFingerprint === r.candidateFingerprint))) return ['Decision exceeds its manifest scope']
  if (!d.authorizedCandidates.some(r=>r.speciesId === c.identity.speciesId && r.candidateFingerprint === c.candidateFingerprint)) return ['Candidate not explicitly authorized']
  if (!m.candidates.some(r=>r.speciesId === c.identity.speciesId && r.candidateFingerprint === c.candidateFingerprint)) return ['Candidate not selected']
  if (await populationFingerprint(without(c,'candidateFingerprint'),cryptoProvider) !== c.candidateFingerprint) return ['Candidate fingerprint mismatch']
  if (await populationFingerprint(without(m,'fingerprint'),cryptoProvider) !== m.fingerprint) return ['Selection manifest fingerprint mismatch']
  return []
 } catch { return ['Publication context could not be validated'] }
}

export async function documentedPopulationPresentation(context, identity, language = 'ru', options = {}) {
 // Snapshot before awaiting: a changed/revoked mutable input cannot replace validated bytes.
 let snapshot
 try { snapshot = structuredClone(context) } catch { return populationPresentation(UNKNOWN_POPULATION,[],language) }
 const denied = () => ({...populationPresentation(UNKNOWN_POPULATION,[],language),populationPublicationStatus:'unpublished',symbolicOnly:true})
 if ((await checkPopulationPublication(snapshot,identity,options)).length) return denied()
 const c = snapshot.candidate, e = c.estimate, n = v=>new Intl.NumberFormat(language,{maximumFractionDigits:10}).format(v)
 const unitKeys = {'individuals':'individuals','adult individuals':'adults','specimens':'specimens','pairs':'pairs','breeding pairs':'breedingPairs','shrubs':'shrubs','plants of various ages':'plants'}
 const unit = tr(language,'population.unit.'+unitKeys[e.unit])
 const label = (e.type === 'range' ? `${n(e.min)}–${n(e.max)}` : `${e.type === 'approximate' ? '≈ ' : ''}${n(e.value)}`)+` ${unit}`+(e.type === 'range' ? ` · ${tr(language,'population.estimatedRange')}` : '')
 const interval = e.confidenceInterval || e.uncertaintyInterval
 const intervalLabel = !interval ? null : e.confidenceInterval ? tr(language,'population.confidenceInterval',{level:n(interval.level*100),min:n(interval.min),max:n(interval.max)}) : tr(language,'population.uncertaintyInterval',{min:n(interval.min),max:n(interval.max)})
 return {...e,type:e.type === 'range' ? 'approximate' : e.type,estimateType:e.type,unit,label,reviewStatus:'pending',scientificReviewStatus:'pending',verified:false,lastReviewedAt:null,populationPublicationStatus:'authorized',publicationMode:'source-documented',candidateFingerprint:c.candidateFingerprint,symbolicOnly:true,needsReview:true,accuracy:tr(language,e.type === 'range' ? 'population.estimatedRange' : 'population.'+e.type),periodLabel:e.year !== null ? String(e.year) : `${e.observationPeriod.startYear}–${e.observationPeriod.endYear}`,intervalLabel,statusLabel:tr(language,'population.sourcePending'),limitations:c.documentation.limitations,sources:[{id:c.source.id,title:`${c.source.title} — ${c.source.sourcePage}`,publisher:c.source.sourceName,url:c.source.url},...(c.source.retrievedUrl ? [{id:c.source.id+'-archive',title:tr(language,'population.archivedCopy'),publisher:c.source.sourceName,url:c.source.retrievedUrl}] : [])],sourceIds:[c.source.id]}
}

// Optional sidecar from a trusted release/API layer. Never merges into species records.
export function populationPublicationContexts(release) {
 if (!object(release) || !Array.isArray(release.candidates) || release.candidates.length > 184) return new Map()
 const ids = release.candidates.map(c=>c?.identity?.speciesId)
 if (ids.some(id=>!text(id)) || new Set(ids).size !== ids.length) return new Map()
 return new Map(release.candidates.map(candidate=>[candidate.identity.speciesId,{candidate,manifest:release.selectionManifest,decision:release.ownerAuthorization}]))
}
