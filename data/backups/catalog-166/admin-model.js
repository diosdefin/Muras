import { validateSource } from '../../data/species-model.js'
import { UNKNOWN_POPULATION } from '../../data/population.js'
import { imageComposition, validComposition } from '../../data/image-composition.js'
import { publicImageUrl } from '../../data/presentation.js'
import { LANGUAGES } from '../../data/localization.js'
import { CONTENT_FIELDS } from '../../data/species-content.js'

export const MAX_JSON_BYTES = 2 * 1024 * 1024
export const EMPTY_NAMES = Object.freeze({ ru: null, ky: null, en: null, uz: null })
export { GROUPS } from '../../data/species-groups.js'
export const TAXONOMY = ['kingdom','phylum','class','order','family','genus']
export const clone = value => JSON.parse(JSON.stringify(value))
export const object = value => value !== null && typeof value === 'object' && !Array.isArray(value)
export const nullableText = value => value == null || typeof value === 'string'
export const textValue = value => value === '' ? null : value
export function jsonSafe(value) {
  if (typeof value === 'number') return Number.isFinite(value)
  if (value === null || ['string','boolean'].includes(typeof value)) return true
  if (Array.isArray(value)) return value.every(jsonSafe)
  return object(value) && Object.entries(value).every(([key,v]) => !['__proto__','prototype','constructor'].includes(key) && jsonSafe(v))
}
export function importSource(text) {
  if (typeof text !== 'string' || new TextEncoder().encode(text).length > MAX_JSON_BYTES) throw new Error('admin.error.jsonSize')
  let document
  try { document = JSON.parse(text.replace(/^\uFEFF/, '')) } catch { throw new Error('admin.error.json') }
  if (!jsonSafe(document)) throw new Error('admin.error.unsafe')
  let errors
  try { errors = validateSource(document) } catch { throw new Error('admin.error.schema') }
  if (errors.length) { const error = new Error('admin.error.schema'); error.details = errors; throw error }
  return document
}
export function publicationErrors(document, assets = []) {
  if (!document) return ['admin.error.sourceRequired']
  const errors = validateSource(document)
  for (const species of document.catalog) {
    if (!species.scientificName || !Object.values(species.names).some(Boolean) || !species.group || !species.regions?.some(region=>region.code==='KG'&&region.type==='country'&&region.sourceIds.length)) errors.push(`${species.id}: admin.error.incompleteSpecies`)
  }
  for (const species of [...document.catalog, ...document.demoArchive]) {
    if (species.population.type !== 'unknown' && species.population.reviewStatus !== 'approved') errors.push(`${species.id}: admin.error.populationApproval`)
    species.images.forEach((image, index) => {
      if (image.licenseVerified && assets.some(a => a.speciesIndex === document.catalog.indexOf(species) && a.index === index && !a.prepared)) errors.push(`${species.id}.images[${index}]: admin.error.filePending`)
    })
  }
  return errors
}
export function exportSource(document, assets = []) {
  const errors = publicationErrors(document, assets)
  if (errors.length) { const error = new Error('admin.error.export'); error.details = errors; throw error }
  return JSON.stringify(document, null, 2) + '\n'
}
export function editableShape(document) {
  const dict = value => object(value) && LANGUAGES.every(k => nullableText(value[k]))
  const refs = value => Array.isArray(value) && value.every(v => typeof v === 'string')
  const statements = value => value === null || Array.isArray(value) && value.every(e => object(e) && dict(e.text) && refs(e.sourceIds))
  const content = value => value == null || object(value) && Object.keys(value).every(k => CONTENT_FIELDS.includes(k)) &&
    CONTENT_FIELDS.every(k => value[k] === null || object(value[k]) && dict(value[k].text) && refs(value[k].sourceIds))
  return object(document) && document.schemaVersion === 1 && Array.isArray(document.catalog) && Array.isArray(document.demoArchive) && jsonSafe(document) && document.catalog.every(s =>
    object(s) && typeof s.id === 'string' && nullableText(s.scientificName) && nullableText(s.group) && typeof s.verified==='boolean' && dict(s.names) && object(s.taxonomy) && TAXONOMY.every(k=>nullableText(s.taxonomy[k])) &&
    content(s.content) && object(s.nationalRedBook) && refs(s.nationalRedBook.sourceIds) && object(s.iucn) && refs(s.iucn.sourceIds) &&
    (s.habitat === null || object(s.habitat) && dict(s.habitat.description) && refs(s.habitat.sourceIds)) &&
    (s.regions === null || Array.isArray(s.regions) && s.regions.every(r => object(r) && dict(r.names) && refs(r.sourceIds))) &&
    statements(s.threats) && statements(s.conservationMeasures) &&
    object(s.population) && ['exact','approximate','unknown'].includes(s.population.type) && ['pending','approved','rejected'].includes(s.population.reviewStatus) && refs(s.population.sourceIds) && ['value','min','max','year'].every(k=>s.population[k]===null||Number.isFinite(s.population[k])) &&
    Array.isArray(s.images) && s.images.every(i => object(i) && nullableText(i.path) && (i.modifications === null || refs(i.modifications))) &&
    Array.isArray(s.sources) && s.sources.every(source => object(source) && typeof source.id === 'string' && refs(source.supports)))
}
export function setPath(value, path, next) {
  if (!path.length) return next
  const [key, ...rest] = path
  if (['__proto__','constructor','prototype'].includes(String(key))) throw new Error('admin.error.unsafe')
  const copy = Array.isArray(value) ? value.slice() : { ...value }
  copy[key] = setPath(value?.[key], rest, next)
  return copy
}
export function emptySpecies(id) {
  return { id, scientificName: null, names: clone(EMPTY_NAMES), taxonomy: Object.fromEntries(TAXONOMY.map(k => [k,null])), group: null,
    nationalRedBook: { listed: null, category: null, edition: null, year: null, sourceIds: [] },
    iucn: { category: null, year: null, sourceIds: [] }, habitat: null, regions: null, threats: null, conservationMeasures: null,
    population: clone(UNKNOWN_POPULATION), images: [], sources: [], verified: false, lastReviewedAt: null, content: null }
}
export function uniqueId(document, base = 'species-draft') {
  const used = new Set([...document.catalog,...document.demoArchive].map(s => s.id))
  let id = base, n = 2
  while (used.has(id)) id = `${base}-${n++}`
  return id
}
export function duplicateSpecies(document, index) {
  const copy = clone(document.catalog[index]); copy.id = uniqueId(document, `${copy.id || 'species'}-draft`)
  copy.verified = false; copy.lastReviewedAt = null
  if (copy.population.type !== 'unknown') copy.population.reviewStatus = 'pending'
  return { ...document, catalog: [...document.catalog, copy] }
}
export function deleteSpecies(document, index, confirmed) {
  return confirmed ? { ...document, catalog: document.catalog.filter((_,i) => i !== index) } : document
}
export function populationTransition(population, type, confirmed = false) {
  if (!['exact','approximate','unknown'].includes(type)) throw new Error('admin.error.schema')
  if (type === population.type) return { population, needsConfirmation: false }
  const incompatible = type === 'unknown' ? ['value','min','max'].some(k => population[k] !== null) :
    type === 'exact' ? population.min !== null || population.max !== null : false
  if (incompatible && !confirmed) return { population, needsConfirmation: true }
  return { needsConfirmation: false, population: { ...population, type, method: type === 'exact' ? 'complete-count' : type === 'approximate' ? 'estimate' : null,
    ...(type === 'unknown' ? { value:null,min:null,max:null } : type === 'exact' ? {min:null,max:null} : {}) } }
}
export function setPhotoComposition(document, speciesIndex, imageIndex, view, composition) {
  if (!validComposition(composition) || !['card','detail','lesson'].includes(view)) throw new Error('admin.error.composition')
  return setPath(document, ['catalog',speciesIndex,'images',imageIndex,'compositions',view], { ...composition })
}
export function previewUrl(species, index, published) {
  const photo = species.images[index]
  if (!photo) return null
  const match = published.find(s => s.id === species.id)?.images.find(image =>
    image.sha256 && image.sha256 === photo.sha256)
  return match ? publicImageUrl(match.path) : null
}
export function claimPaths(species) {
  const paths = ['scientificName','group',...LANGUAGES.map(k=>`names.${k}`),...TAXONOMY.map(k=>`taxonomy.${k}`)]
  paths.push(...CONTENT_FIELDS.map(k => `content.${k}`))
  for(const field of ['nationalRedBook','iucn'])for(const k of Object.keys(species[field]))if(k !== 'sourceIds')paths.push(`${field}.${k}`)
  if(species.habitat)paths.push('habitat')
  for(const field of ['regions','threats','conservationMeasures'])species[field]?.forEach((_,i)=>paths.push(`${field}.${i}`))
  for(const k of ['type','method','value','min','max','territory','year','unit'])paths.push(`population.${k}`)
  return [...new Set([...paths,...species.sources.flatMap(s=>s.supports)])]
}
export function newImage() { return { path:null,author:null,originalPage:null,license:null,licenseUrl:null,attribution:null,modifications:null,licenseVerified:false } }
export function safeHttpUrl(value) { try { return ['https:','http:'].includes(new URL(value).protocol) ? value : null } catch { return null } }
export { imageComposition }
