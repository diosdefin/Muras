// Replace this local transport with an API adapter when the backend is introduced.
// Components use this validated boundary instead of reading scientific JSON themselves.
import { REGIONS, regionalEntries, validateMapGeometry, validateRegionalEvidence } from './model.js'
import { createSearchIndex, searchSpecies } from '../catalog-search.js'

export async function loadRegionalData(species, { baseUrl = '/', fetcher = globalThis.fetch } = {}) {
  const [geometry, evidence] = await Promise.all(['map.json', 'occurrences.json'].map(async file => {
    const response = await fetcher(`${baseUrl}data/geography/${file}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}: data/geography/${file}`)
    return response.json()
  }))
  const errors = [...validateMapGeometry(geometry), ...validateRegionalEvidence(evidence, species)]
  if (errors.length) throw new Error(errors.join('\n'))
  return { geometry, evidence }
}

export function queryRegionalEntries(evidence, species, { regionId = '', group = 'ALL', query = '' } = {}) {
  if (validateRegionalEvidence(evidence, species).length || regionId && !REGIONS.some(r => r.id === regionId)) return []
  const entries = (regionId ? [regionId] : REGIONS.map(r => r.id)).flatMap(id => regionalEntries(evidence, species, id, group))
  const candidates = [...new Map(entries.map(e => [e.species.id, e.species])).values()]
  const matches = new Set(searchSpecies(createSearchIndex(candidates), query).map(r => r.species.id))
  return entries.filter(entry => matches.has(entry.species.id))
}
