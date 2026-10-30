import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { PROJECT_ROOT } from './build-data.mjs'
import { createTaxonIndex, createQueueConflicts, validateRegistry, fingerprint } from './lib/research-pipeline.mjs'
import { taxonNameKey } from './lib/bulk-import.mjs'
import { readLocal, parseJson } from './lib/local-research-adapter.mjs'

// Discovery is an identity comparison, never a readiness or publication decision.
// Reuse the importer's name normalization and existing catalogue/archive index.
export function discoverCandidates(registry, source) {
  validateRegistry(registry)
  const index = createTaxonIndex(source), conflicts = createQueueConflicts(registry)
  const archive = new Set(source.demoArchive.map(s => s.id))
  const candidates = registry.candidates.map(c => {
    const matches = [], seen = new Set()
    const add = (id, reason) => {
      if (!id || seen.has(`${id}:${reason}`)) return
      seen.add(`${id}:${reason}`)
      matches.push({ id, location: archive.has(id) ? 'archive' : 'catalog', reason })
    }
    add(index.ids.get(c.id)?.id, 'id')
    for (const name of new Set([c.acceptedScientificName, c.originalScientificName].map(taxonNameKey).filter(Boolean))) {
      add(index.names.get(name), 'documented_name')
      for (const [existing, id] of index.names) {
        if (existing.startsWith(`${name} `) || name.startsWith(`${existing} `)) add(id, 'species_subspecies_overlap')
      }
    }
    // A saved exact identifier can flag a match, but is not revalidated online here.
    add(index.taxonIds.get(c.taxonomyEvidence?.taxonId), 'saved_taxon_id')
    const queueConflicts = conflicts.get(c.id) || []
    const overlap = matches.some(m => m.reason === 'species_subspecies_overlap')
    return { id: c.id, originalScientificName: c.originalScientificName ?? null,
      acceptedScientificName: c.acceptedScientificName ?? null, rank: c.rank ?? null, group: c.group ?? null,
      storedState: c.state, disposition: queueConflicts.length || overlap ? 'identity_conflict' :
        matches.length ? 'existing_match_requires_review' : 'needs_research', matches, queueConflicts,
      missingData: c.missingData || [], contradictions: c.contradictions || [] }
  })
  return { schemaVersion: 1, documentType: 'offline-research-discovery',
    registryId: registry.registryId, registryFingerprint: fingerprint(registry), catalogFingerprint: fingerprint(source),
    catalogCount: source.catalog.length, archiveCount: source.demoArchive.length,
    nationalInclusionVerified: false, publicationAuthorized: false,
    limitations: [
      'Saved identity evidence only; no network requests, scientific approval or national-list validation.',
      'An unmatched name is not proof of absence. Review synonyms and historic species/subspecies concepts in primary documents.',
      'This master registry is a historical subset, not a complete current national or legal inventory.',
      'Stored states are not recomputed readiness. Use data:bulk:check and an explicit editorial decision.'
    ],
    counts: Object.fromEntries(['needs_research', 'existing_match_requires_review', 'identity_conflict']
      .map(state => [state, candidates.filter(c => c.disposition === state).length])), candidates }
}

export async function runDiscovery(root, args = []) {
  if (args.length && (args.length !== 2 || args[0] !== '--registry')) throw new Error('Only --registry data/research/NAME.json is supported; stdout report only')
  const registryPath = args[1] || 'data/research/redbook-master-registry.json'
  if (!/^data\/research\/[a-zA-Z0-9_/-]+\.json$/.test(registryPath)) throw new Error('Registry must be a local data/research/*.json file')
  const registry = parseJson(await readLocal(root, registryPath))
  const source = parseJson(await readLocal(root, 'data/species.source.json'))
  return discoverCandidates(registry, source)
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { console.log(JSON.stringify(await runDiscovery(PROJECT_ROOT, process.argv.slice(2)), null, 2)) }
  catch (error) { console.error(`Discovery: ${error.message}`); process.exitCode = 1 }
}
