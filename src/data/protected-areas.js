// Protected territories (state nature reserves and national parks) — a dataset separate from the
// 184-species scientific catalogue. Every fact is sourced; photos carry verified free licences.
export const AREA_TYPES = ['reserve', 'national-park', 'biosphere']
export const AREA_REGIONS = ['batken', 'chuy', 'issyk-kul', 'jalal-abad', 'naryn', 'osh', 'talas']
const AREA_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const LANGS = ['ru', 'ky', 'uz', 'en']
const ALLOWED_LICENCES = /^(CC0( 1\.0)?|Public domain|PDM( 1\.0)?|CC BY (2\.0|2\.5|3\.0|4\.0)|CC BY-SA (2\.0|2\.5|3\.0|4\.0))$/

export function areaPath(id) {
  if (typeof id !== 'string' || !AREA_ID.test(id)) throw new TypeError('Invalid territory id')
  return `/territories/${id}`
}
export function areaIdFromPath(pathname) {
  const match = typeof pathname === 'string' ? /^\/territories\/([^/]+)\/?$/.exec(pathname) : null
  if (!match) return null
  try { const id = decodeURIComponent(match[1]); return AREA_ID.test(id) ? id : null } catch { return null }
}
export const isAreasListPath = pathname => typeof pathname === 'string' && pathname.replace(/\/$/, '') === '/territories'

export function areaName(area, language = 'ru') { return area.names?.[language] || area.names?.ru || area.id }
export function areaDescription(area, language = 'ru') { return area.description?.[language] || area.description?.ru || '' }
export function primaryPhoto(area) { return area.photos?.find(p => p.primary) || area.photos?.[0] || null }
export const areasForRegion = (areas, regionId) => areas.filter(a => a.location?.regions?.includes(regionId))
// Only links proven by a source (with a quotation) are exposed; never inferred from the region.
export const areasForSpecies = (areas, speciesId) => areas.filter(a => a.speciesLinks?.some(l => l.speciesId === speciesId))
export function filterAreas(areas, { type = 'ALL', region = 'ALL' } = {}) {
  return areas.filter(a => (type === 'ALL' || a.type === type) && (region === 'ALL' || a.location?.regions?.includes(region)))
}
export function sortAreas(areas, language = 'ru') {
  const rank = { reserve: 0, 'national-park': 1, biosphere: 2 }
  return [...areas].sort((a, b) => (rank[a.type] - rank[b.type]) || areaName(a, language).localeCompare(areaName(b, language), language))
}

let cache = null
export async function loadAreas(fetchImpl = globalThis.fetch) {
  if (cache) return cache
  const base = import.meta.env?.BASE_URL || '/'
  const response = await fetchImpl(`${base}data/protected-areas.json`)
  if (!response.ok) throw new Error('areas.error')
  cache = (await response.json()).areas
  return cache
}

// Structural validation shared by the build script and the tests; returns a list of problems.
export function validateAreas(areas, speciesIds = new Set()) {
  const errors = [], seen = new Set()
  const cyrillic = /[А-Яа-яЁё]/, badApostrophe = /[oOgG]['‘’`]/
  for (const a of areas) {
    const id = a.id, fail = message => errors.push(`${id}: ${message}`)
    if (!AREA_ID.test(id || '')) fail('invalid id')
    if (seen.has(id)) fail('duplicate id'); seen.add(id)
    if (!AREA_TYPES.includes(a.type)) fail('invalid type')
    for (const l of LANGS) {
      if (!a.names?.[l]?.trim()) fail(`names.${l} missing`)
      if (!a.description?.[l]?.trim()) fail(`description.${l} missing`)
      else if (a.description[l].length > 600) fail(`description.${l} too long`)
    }
    for (const field of ['names', 'description']) {
      if (cyrillic.test(a[field]?.uz || '') || cyrillic.test(a[field]?.en || '')) fail(`${field}: Cyrillic in uz/en`)
      if (badApostrophe.test(a[field]?.uz || '')) fail(`${field}.uz: use ʻ (U+02BB)`)
    }
    if (!Number.isInteger(a.established?.year) || a.established.year < 1900 || a.established.year > 2100) fail('established.year')
    if (!a.location?.regions?.length || !a.location.regions.every(r => AREA_REGIONS.includes(r))) fail('location.regions')
    const sourceIds = new Set((a.sources || []).map(s => s.id))
    if (!sourceIds.size) fail('no sources')
    for (const s of a.sources || []) if (!/^https:\/\//.test(s.url || '') || !s.title) fail(`source ${s.id}`)
    for (const ref of [...(a.established?.sourceIds || []), ...(a.area?.sourceIds || [])]) if (!sourceIds.has(ref)) fail(`unknown source ${ref}`)
    if (a.area?.ha != null && !(a.area.ha > 0 && a.area.year)) fail('area needs year')
    for (const link of a.speciesLinks || []) {
      if (speciesIds.size && !speciesIds.has(link.speciesId)) fail(`unknown species ${link.speciesId}`)
      if (!link.quote || !link.sourceIds?.length || !link.sourceIds.every(r => sourceIds.has(r))) fail(`species link ${link.speciesId} lacks a source quotation`)
    }
    if ((a.photos || []).length && (a.photos.filter(p => p.primary).length !== 1)) fail('exactly one primary photo required')
    for (const p of a.photos || []) {
      if (!ALLOWED_LICENCES.test(p.license || '')) fail(`photo licence not allowed: ${p.license}`)
      if (!/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(p.originalPage || '')) fail('photo originalPage')
      if (!p.author || !p.attribution || !/^[a-f0-9]{64}$/.test(p.sha256 || '')) fail('photo author/attribution/sha256')
      if (LANGS.some(l => !p.caption?.[l]?.trim())) fail('photo caption languages')
      if (/SA/.test(p.license) && !/тех же условиях/.test(p.attribution)) fail('BY-SA attribution lacks share-alike notice')
    }
  }
  return errors
}
