import { createHash } from 'node:crypto'
import { isDeepStrictEqual } from 'node:util'
import { validateSource } from '../../src/data/species-model.js'
import { UNKNOWN_POPULATION } from '../../src/data/population.js'
import { LANGUAGES } from '../../src/data/localization.js'
import { isSpeciesGroup } from '../../src/data/species-groups.js'
import { planBatchImport, taxonNameKey } from './bulk-import.mjs'

export const STATES = Object.freeze(['pending', 'needs_evidence', 'research_ready', 'needs_photo',
  'ready_for_review', 'approved_for_import', 'imported', 'rejected'])
export const slug = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
export const digest = value => createHash('sha256').update(value).digest('hex')
const text = value => typeof value === 'string' && Boolean(value.trim())
const url = value => { try { return ['https:', 'http:'].includes(new URL(value).protocol) } catch { return false } }
export const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value
export const fingerprint = value => digest(JSON.stringify(canonical(value)))
export function safeJson(value, depth = 0) {
  return depth < 50 && (value === null || ['string', 'boolean'].includes(typeof value) ||
    typeof value === 'number' && Number.isFinite(value) || Array.isArray(value) && value.every(v => safeJson(v, depth + 1)) ||
    value && typeof value === 'object' && Object.entries(value).every(([k, v]) =>
      !['__proto__', 'constructor', 'prototype'].includes(k) && safeJson(v, depth + 1)))
}

// RFC 4180 style fields, including CRLF, doubled quotes and quoted newlines. No evaluation.
export function parseCsv(input) {
  const rows = [], row = []
  let field = '', quoted = false, closed = false
  const push = () => { row.push(field); field = ''; closed = false }
  const end = () => { push(); rows.push(row.splice(0)) }
  const value = input.replace(/^\uFEFF/, '')
  for (let i = 0; i < value.length; i++) {
    const ch = value[i]
    if (quoted) {
      if (ch === '"') { if (value[i + 1] === '"') { field += '"'; i++ } else { quoted = false; closed = true } }
      else field += ch
    } else if (ch === '"') {
      if (field || closed) throw new Error('CSV: кавычка внутри некавыченного поля')
      quoted = true
    } else if (ch === ',') push()
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && value[i + 1] === '\n') i++; end() }
    else { if (closed) throw new Error('CSV: символ после закрывающей кавычки'); field += ch }
  }
  if (quoted) throw new Error('CSV: незакрытое поле')
  if (field || row.length || closed) end()
  const headers = rows.shift()
  if (!headers?.length || headers.some(h => !text(h)) || new Set(headers).size !== headers.length) throw new Error('CSV: некорректные заголовки')
  return rows.filter(r => !(r.length === 1 && r[0] === '')).map((values, index) => {
    if (values.length !== headers.length) throw new Error(`CSV: строка ${index + 2}, число полей не совпадает`)
    return Object.fromEntries(headers.map((h, i) => [h, values[i]]))
  })
}

export function createRegistry(rows, { registryId = 'research-queue', batchSize = 25 } = {}) {
  if (!slug(registryId) || !Number.isInteger(batchSize) || batchSize < 1 || batchSize > 25) throw new Error('Нужны безопасный registryId и batchSize 1..25')
  if (!Array.isArray(rows) || rows.length > 200 || !safeJson(rows)) throw new Error('Нужен безопасный список до 200 кандидатов')
  const ids = new Set()
  const candidates = rows.map((row, index) => {
    if (!row || !slug(row.id) || ids.has(row.id)) throw new Error(`Строка ${index + 1}: отсутствующий/повторяющийся безопасный ID`)
    ids.add(row.id)
    // Input decisions/checkpoints cannot authorize publication.
    const { state, approval, diagnostics, checkedFingerprint, importedFingerprint, ...research } = row
    return { originalScientificName: null, acceptedScientificName: null, rank: null, group: null,
      nationalRedBook: null, countryOccurrence: null, taxonomyEvidence: null, taxonomySourceIds: [],
      sources: [], contradictions: [], missingData: [], materials: [], draft: null,
      ...research, state: 'pending', approval: null }
  })
  return { schemaVersion: 1, documentType: 'bulk-research-registry', registryId, batchSize, candidates }
}

export function validateRegistry(registry) {
  if (!safeJson(registry) || registry?.schemaVersion !== 1 || registry.documentType !== 'bulk-research-registry' ||
    !slug(registry.registryId) || !Number.isInteger(registry.batchSize) || registry.batchSize < 1 || registry.batchSize > 25 ||
    !Array.isArray(registry.candidates) || registry.candidates.length > 200) throw new Error('Некорректный bulk-research-registry (до 200 кандидатов, партия 1..25)')
  const ids = new Set()
  for (const c of registry.candidates) {
    if (!slug(c?.id) || ids.has(c.id) || !STATES.includes(c.state)) throw new Error('Некорректный/повторяющийся ID или состояние реестра')
    ids.add(c.id)
  }
}

export function createTaxonIndex(source) {
  const errors = validateSource(source)
  if (errors.length) throw new Error(`Исходный каталог некорректен: ${errors.join('; ')}`)
  const records = [...source.catalog, ...source.demoArchive]
  return { ids: new Map(records.map(s => [s.id, s])),
    names: new Map(records.filter(s => s.scientificName).map(s => [taxonNameKey(s.scientificName), s.id])),
    taxonIds: new Map(records.flatMap(s => s.sources.filter(r => r.taxonId).map(r => [r.taxonId, s.id]))) }
}

function duplicates(c, index) {
  const result = [], key = taxonNameKey(c.acceptedScientificName || c.originalScientificName)
  if (index.ids.has(c.id)) result.push(`ID уже существует: ${c.id}`)
  for (const name of new Set([key, taxonNameKey(c.originalScientificName)].filter(Boolean))) {
    if (index.names.has(name)) result.push(`Таксон уже существует: ${index.names.get(name)}`)
    for (const [existing, id] of index.names) if (existing.startsWith(`${name} `) || name.startsWith(`${existing} `)) result.push(`Конфликт вида/подвида: ${id}`)
  }
  if (index.taxonIds.has(c.taxonomyEvidence?.taxonId)) result.push(`Таксономический ID уже существует: ${index.taxonIds.get(c.taxonomyEvidence.taxonId)}`)
  return [...new Set(result)]
}

export function researchErrors(c, species) {
  const errors = [], sources = Array.isArray(c.sources) ? c.sources : []
  const supported = (ids, claim) => Array.isArray(ids) && ids.length && new Set(ids).size === ids.length &&
    ids.every(id => sources.some(s => s?.id === id && s.supports?.includes(claim)))
  if (!text(c.originalScientificName) || !text(c.acceptedScientificName)) errors.push('Нужны исходное и принятое научные имена')
  if (!['SPECIES', 'SUBSPECIES'].includes(c.rank) || !isSpeciesGroup(c.group)) errors.push('Нужны ранг SPECIES/SUBSPECIES и допустимая группа')
  const sourceIds = new Set()
  for (const s of sources) {
    if (!s || !text(s.id) || sourceIds.has(s.id) || !text(s.title) || !text(s.publisher) || !url(s.url) || !validDate(s.accessedAt) ||
      !Array.isArray(s.supports) || !s.supports.length || !s.supports.every(text)) errors.push('Некорректные метаданные исследовательского источника')
    sourceIds.add(s?.id)
  }
  const n = c.nationalRedBook
  if (n?.listed !== true || !['historical_edition', 'current_legal_list'].includes(n?.basis) || !text(n?.edition) ||
    !Number.isInteger(n?.year) || n.year < 1500 || n.year > 2100 || !supported(n?.sourceIds, 'nationalRedBook.listed')) errors.push('Не подтверждено национальное включение с видом документа, годом и источником')
  if (n?.basis === 'historical_edition' && n?.claimsCurrentLegalStatus !== false) errors.push('Историческое издание не подтверждает актуальный юридический статус')
  if (n?.basis === 'current_legal_list' && (n.claimsCurrentLegalStatus !== true ||
    !supported(n.sourceIds, 'nationalRedBook.currentLegalStatus') || /историческ|historical/i.test(n.edition || ''))) errors.push('Актуальный юридический статус требует отдельного явно подтверждающего источника')
  if (c.countryOccurrence?.countryCode !== 'KG' || c.countryOccurrence?.confirmed !== true || !supported(c.countryOccurrence?.sourceIds, 'regions.0')) errors.push('Нет подтверждённого присутствия в Кыргызстане')
  const t = c.taxonomyEvidence
  if (!t || t.status !== 'ACCEPTED' || t.matchType !== 'EXACT' || t.rank !== c.rank ||
    taxonNameKey(t.canonicalName) !== taxonNameKey(c.acceptedScientificName) || !/^(?:gbif|iucn-gbif):[1-9]\d*$/.test(t.taxonId || '') ||
    !supported(c.taxonomySourceIds, 'scientificName') || !c.taxonomySourceIds.includes(t.sourceId) ||
    !sources.some(s => s.id === t.sourceId && s.taxonId === t.taxonId)) errors.push('Нет точного принятого таксона со связанным источником и идентификатором')
  if (!Array.isArray(c.contradictions) || !Array.isArray(c.missingData) || !c.contradictions.every(text) || !c.missingData.every(text)) errors.push('contradictions/missingData должны быть списками строк')
  else if (c.contradictions.length || c.missingData.length) errors.push('Есть нерешённые противоречия или обязательные пробелы')
  if (species) {
    if (species.id !== c.id || taxonNameKey(species.scientificName) !== taxonNameKey(c.acceptedScientificName) || species.group !== c.group) errors.push('Черновик не соответствует идентичности кандидата')
    const national = { ...n }; delete national.basis; delete national.claimsCurrentLegalStatus
    if (!isDeepStrictEqual(species.nationalRedBook, national)) errors.push('Национальные сведения черновика не совпадают с реестром')
    if (n?.basis === 'historical_edition' && !/историческ|historical/i.test(species.nationalRedBook?.edition || '')) errors.push('Историческое издание должно быть явно обозначено в карточке')
    for (const id of new Set([...(n?.sourceIds || []), ...(c.countryOccurrence?.sourceIds || []), ...(c.taxonomySourceIds || [])])) {
      if (!sources.some(s => s.id === id && species.sources?.some(r => isDeepStrictEqual(s, r)))) errors.push(`Черновик не сохраняет исследовательский источник ${id}`)
    }
    if (!species.regions?.some(r => r.type === 'country' && r.code === 'KG' && c.countryOccurrence.sourceIds.every(id => r.sourceIds.includes(id)))) errors.push('Источник встречаемости не связан с регионом KG')
    if (species.verified !== false || species.lastReviewedAt !== null) errors.push('Конвейер не предоставляет независимое научное одобрение: verified:false, lastReviewedAt:null')
    if (species.population?.reviewStatus !== 'pending') errors.push('Конвейер оставляет независимую проверку численности pending')
  }
  return errors
}

export function candidateFingerprint(c, loaded) {
  const { state, approval, diagnostics, checkedFingerprint, importedFingerprint, ...research } = c
  return fingerprint({ research, loaded })
}
export const validApproval = (c, hash) => c.approval?.decision === 'approve' && text(c.approval.reviewer) &&
  text(c.approval.reason) && validDate(c.approval.reviewedAt) && c.approval.fingerprint === hash

export function languagePhotoReport(species) {
  return { photo: species?.images?.length ? 'prepared' : 'placeholder',
    photoCheck: species?.images?.length ? 'not_run' : 'placeholder_allowed',
    shortDescriptions: Object.fromEntries(LANGUAGES.map(l => [l, text(species?.content?.shortDescription?.text?.[l])])),
    fullDescriptions: Object.fromEntries(LANGUAGES.map(l => [l, text(species?.content?.overview?.text?.[l])])),
    missingNames: LANGUAGES.filter(l => !text(species?.names?.[l])),
    translationRequired: LANGUAGES.filter(l => !text(species?.content?.shortDescription?.text?.[l])), scientificReviewRequired: true }
}

// Pure planning around the established importer. Adapters only supply local evidence;
// they cannot change decisions or publish records. Final validation always runs afresh.
export function createQueueConflicts(registry) {
  // Detect queue conflicts once across the entire registry, including other batches.
  const queuedIndex = { ids: new Map(), names: new Map(), taxonIds: new Map() }, conflicts = new Map()
  for (const c of registry.candidates) {
    const conflictsHere = duplicates(c, queuedIndex)
    for (const message of conflictsHere) {
      const otherId = message.split(': ').at(-1)
      conflicts.set(otherId, [...(conflicts.get(otherId) || []), `Конфликт в реестре: ${c.id}`])
    }
    if (conflictsHere.length) conflicts.set(c.id, [...(conflicts.get(c.id) || []), ...conflictsHere.map(m => `Конфликт в реестре: ${m}`)])
    for (const name of [c.acceptedScientificName, c.originalScientificName].filter(text)) queuedIndex.names.set(taxonNameKey(name), c.id)
    if (c.taxonomyEvidence?.taxonId) queuedIndex.taxonIds.set(c.taxonomyEvidence.taxonId, c.id)
  }
  return conflicts
}

export async function checkRegistry(registry, source, { adapter, validateAssets = async () => [], batchNumber,
  catalogIndex, queueConflicts } = {}) {
  validateRegistry(registry)
  const index = catalogIndex || createTaxonIndex(source), next = structuredClone(registry), batches = [], results = []
  const all = registry.candidates, conflicts = queueConflicts || createQueueConflicts(registry)
  const batchCount = Math.ceil(all.length / registry.batchSize)
  if (batchNumber !== undefined && (!Number.isInteger(batchNumber) || batchNumber < 1 || batchNumber > batchCount)) throw new Error('Номер партии вне реестра')
  for (let offset = 0; offset < all.length; offset += registry.batchSize) {
    const number = offset / registry.batchSize + 1
    if (batchNumber !== undefined && number !== batchNumber) continue
    const packet = { schemaVersion: 1, documentType: 'species-import-batch', batchId: `${registry.registryId}-${number}`, records: [] }
    const batchResults = []
    for (const c of all.slice(offset, offset + registry.batchSize)) {
      const result = { candidateId: c.id, batchNumber: number, state: 'needs_evidence', errors: [], warnings: [], fingerprint: null }
      batchResults.push(result); results.push(result)
      try {
        if (text(c.rejectionReason)) { result.state = 'rejected'; result.errors.push(c.rejectionReason); continue }
        const loaded = await adapter.load(c)
        const species = loaded.draft ? { verified: false, lastReviewedAt: null, population: structuredClone(UNKNOWN_POPULATION), ...loaded.draft } : null
        result.fingerprint = candidateFingerprint(c, loaded)
        result.readiness = languagePhotoReport(species)
        const existing = index.ids.get(c.id)
        const alreadyImported = c.importedFingerprint === result.fingerprint && existing && isDeepStrictEqual(existing, species)
        result.errors.push(...(alreadyImported ? [] : duplicates(c, index)), ...(conflicts.get(c.id) || []))
        if (result.errors.length) { result.state = 'rejected'; continue }
        result.errors.push(...researchErrors(c, species))
        if (result.errors.length) continue
        result.state = 'research_ready'
        if (!species) { result.errors.push('Не подготовлен публикационный черновик draft/draftFile'); continue }
        packet.records.push({ candidateId: c.id, species, taxonomyEvidence: c.taxonomyEvidence })
      } catch (error) { result.errors.push(`Ошибка кандидата: ${error.message}`) }
    }
    const assetChecks = new Map()
    const plan = await planBatchImport(source, packet, { validateAssets: async s => {
      const errors = await validateAssets(s); assetChecks.set(s.id, errors); return errors
    } })
    for (const validation of plan.results) {
      const r = batchResults.find(r => r.candidateId === validation.candidateId), c = all.find(c => c.id === r.candidateId)
      r.errors.push(...validation.errors); r.warnings.push(...validation.warnings)
      if (r.readiness.photo === 'prepared' && assetChecks.has(c.id)) r.readiness.photoCheck = assetChecks.get(c.id).length ? 'failed' : 'passed'
      if (validation.status === 'rejected') r.state = assetChecks.get(c.id)?.length ||
        validation.errors.some(e => /images|Фото|лицензи|WebP|SHA-256|LICENSE|NOTICE|EXIF|XMP/i.test(e)) ? 'needs_photo' : 'research_ready'
      else if (c.importedFingerprint === r.fingerprint && validation.status === 'unchanged') r.state = 'imported'
      else r.state = validApproval(c, r.fingerprint) ? 'approved_for_import' : 'ready_for_review'
      if (c.approval && !validApproval(c, r.fingerprint)) r.warnings.push('Одобрение отсутствует/устарело: требуется новое решение редактора')
    }
    // Drafts retain incomplete candidates explicitly, but only complete records are importable.
    const drafts = { ...packet, documentType: 'research-draft-batch', records: batchResults.map(r => ({
      ...(packet.records.find(e => e.candidateId === r.candidateId) ||
      { candidateId: r.candidateId, species: null, deferredReason: r.errors.join('; ') || r.state }), state: r.state })) }
    batches.push({ number, drafts, approved: { ...packet, records: packet.records.filter(e =>
      batchResults.some(r => r.candidateId === e.candidateId && r.state === 'approved_for_import')) } })
    for (const r of batchResults) {
      const c = next.candidates.find(c => c.id === r.candidateId)
      c.state = r.state; c.diagnostics = r; c.checkedFingerprint = r.fingerprint
    }
  }
  return { registry: next, batches, report: { schemaVersion: 1, registryId: registry.registryId, catalogFingerprint: fingerprint(source),
    counts: { processed: results.length, accepted: results.filter(r => ['ready_for_review', 'approved_for_import', 'imported'].includes(r.state)).length,
      deferred: results.filter(r => ['pending', 'needs_evidence', 'research_ready', 'needs_photo'].includes(r.state)).length,
      rejected: results.filter(r => r.state === 'rejected').length },
    states: Object.fromEntries(STATES.map(s => [s, results.filter(r => r.state === s).length])), results } }
}
