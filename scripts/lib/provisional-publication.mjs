import { isDeepStrictEqual } from 'node:util'
import { checkRegistry, digest, fingerprint, safeJson, slug, validDate } from './research-pipeline.mjs'
import { createLocalAdapter, readLocal, parseJson, inspectPipelineAssets } from './local-research-adapter.mjs'
import { planBatchImport } from './bulk-import.mjs'

// Owner authorization concerns publication only. Never create scientific approval.
export async function prepareProvisionalPublication(root, registry, source, opts) {
  if (!['dry-run', 'apply'].includes(opts.mode) || opts['owner-role'] !== 'project_owner' ||
    !slug(opts['decision-id']) || !validDate(opts.date) || !opts.reason?.trim()) {
    throw new Error('Предварительная публикация требует --mode dry-run|apply, --owner-role project_owner, --decision-id, --date YYYY-MM-DD и --reason с явным разрешением владельца')
  }
  const manifestBytes = await readLocal(root, opts.manifest), manifest = parseJson(manifestBytes)
  if (!safeJson(manifest) || manifest.documentType !== 'independent-scientific-review-manifest' || manifest.schemaVersion !== 1 ||
    manifest.registry !== opts.registry || fingerprint(registry) !== manifest.registryFingerprint ||
    !Array.isArray(manifest.candidateIds) || !manifest.candidateIds.length || manifest.candidateIds.length > 25 ||
    new Set(manifest.candidateIds).size !== manifest.candidateIds.length ||
    !Array.isArray(manifest.candidates) || !isDeepStrictEqual(manifest.candidateIds, manifest.candidates.map(c => c.id))) {
    throw new Error('Manifest отсутствует, устарел или не соответствует конкретному реестру/списку (1–25 записей)')
  }
  const adapter = createLocalAdapter(root)
  const checked = await checkRegistry(registry, source, { adapter, validateAssets: s => inspectPipelineAssets(root, s) })
  const records = [], decisions = []
  for (const entry of manifest.candidates) {
    const candidate = registry.candidates.find(c => c.id === entry.id)
    const result = checked.report.results.find(r => r.candidateId === entry.id)
    if (!candidate || !['ready_for_review', 'imported'].includes(result?.state) || result.errors.length ||
      result.fingerprint !== entry.checkedFingerprint || candidate.approval !== null ||
      manifest.withheldCandidates?.some(c => c.id === entry.id)) throw new Error(`${entry.id}: нет актуального технического допуска без научного одобрения`)
    const loaded = await adapter.load(candidate)
    if (candidate.draftFile !== entry.draftFile || loaded.draftSha256 !== entry.draftSha256) throw new Error(`${entry.id}: черновик изменился после аудита`)
    const species = structuredClone(loaded.draft)
    if (species.verified !== false || species.lastReviewedAt !== null || species.population.reviewStatus !== 'pending' || species.publication !== undefined) {
      throw new Error(`${entry.id}: черновик не сохраняет независимую проверку pending`)
    }
    species.publication = { status: 'provisional', scientificReviewStatus: 'pending', independentReviewer: null,
      decisionId: opts['decision-id'], publishedAt: opts.date, researchFingerprint: result.fingerprint }
    records.push({ candidateId: entry.id, species, taxonomyEvidence: candidate.taxonomyEvidence })
    decisions.push({ id: entry.id, fingerprint: result.fingerprint, draftSha256: loaded.draftSha256,
      date: opts.date, ownerRole: opts['owner-role'], reason: opts.reason, scientificReviewStatus: 'pending', independentReviewer: null })
  }
  const packet = { schemaVersion: 1, documentType: 'species-import-batch', batchId: opts['decision-id'], records }
  const plan = await planBatchImport(source, packet, { validateAssets: s => inspectPipelineAssets(root, s) })
  if (plan.counts.rejected) throw new Error(`Предварительная публикация отменена: ${plan.results.filter(r => r.errors.length).map(r => `${r.candidateId}: ${r.errors.join('; ')}`).join('\n')}`)
  const decision = { schemaVersion: 1, documentType: 'owner-provisional-publication-decision', decisionId: opts['decision-id'],
    registry: opts.registry, registryFingerprint: manifest.registryFingerprint, manifest: opts.manifest,
    manifestSha256: digest(manifestBytes), publicationStatus: 'provisional', scientificApproval: null, records: decisions }
  return { packet, decision, plan }
}
