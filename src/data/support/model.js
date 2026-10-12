import { localized } from '../presentation.js'

export function supportSpecies(catalog, id) {
  return catalog.find(record => record.id === id) || null
}

// Use existing wording and references. Never infer conservation facts from a donation.
export function sourcedStatements(species, field) {
  if (!['threats', 'conservationMeasures'].includes(field)) return []
  if (!Array.isArray(species?.[field])) return []
  return species[field].filter((statement, index) => {
    if (!statement || !localized(statement.text) || !Array.isArray(statement.sourceIds) || !statement.sourceIds.length) return false
    const sources = statement.sourceIds.map(id => species.sources?.find(source => source.id === id))
    return sources.every(Boolean) && sources.some(source => source.supports?.includes(`${field}.${index}`))
  })
}
