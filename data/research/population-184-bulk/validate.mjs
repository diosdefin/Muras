import { createHash } from 'node:crypto'
export const canonical = value => JSON.stringify(value, (_, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(k => [k, v[k]])) : v)
export const fingerprint = value => createHash('sha256').update(canonical(value)).digest('hex')
export function validateResearchPacket(packet, catalogue) {
 const errors = [], fail = m => errors.push(m)
 if (packet.records.length !== 184 || new Set(packet.records.map(r => r.speciesId)).size !== 184) fail('184 unique taxa required')
 const taxa = new Map(catalogue.map(s => [s.id,s]))
 for (const r of packet.records) {
  if (taxa.get(r.speciesId)?.scientificName !== r.acceptedScientificName) fail('Taxon identity changed: '+r.speciesId)
  if (r.scientificReviewStatus !== 'pending' || r.verified !== false || r.lastReviewedAt !== null) fail('Scientific status changed')
  for (const c of r.estimates) {
   const {fingerprint: saved,...body} = c
   if (saved !== fingerprint(body)) fail('Claim fingerprint mismatch: '+c.evidenceId)
   if (!packet.sources.some(s => s.id === c.sourceId)) fail('Unknown source')
   if (c.scientificReviewStatus !== 'pending' || c.reviewStatus !== 'pending' || c.verified !== false || c.lastReviewedAt !== null) fail('Claim approval invented')
   if (c.type === 'range' && (c.value !== null || !(c.min <= c.max))) fail('Range converted into a point')
   if (c.sourceReadiness === 'READY_SOURCE_DOCUMENTED') {
    if (!c.territory || !c.sourcePage || (c.year == null && !c.observationPeriod) || c.type === 'unknown') fail('Incomplete ready claim')
    if (['subtaxon_only','parent_species_not_subspecies','historical_concept_unresolved','ambiguous_common_name'].includes(c.taxonMatchStatus)) fail('Unresolved taxon admitted')
   }
  }
  for (const m of r.metrics) if (!m.notPopulationEstimate || m.eligibleForPixelation !== false) fail('Density/encounters converted to population')
 }
 const {registryFingerprint,...body} = packet
 if (registryFingerprint !== fingerprint(body)) fail('Registry fingerprint mismatch')
 if (packet.publication.applied || packet.publication.ownerAuthorization || packet.publication.independentScientificApproval) fail('Unexpected publication authorization')
 return errors
}
