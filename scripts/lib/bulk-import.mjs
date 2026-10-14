import { isDeepStrictEqual } from 'node:util'
import { validateSource, validateSpecies } from '../../src/data/species-model.js'

// Plain JSON contract: reusable by a future API without filesystem/network access.
export const taxonNameKey = name => typeof name === 'string'
  ? name.normalize('NFKC').toLowerCase().replace(/\b(?:subsp|ssp|var)\./g, '').trim().replace(/\s+/g, ' ') : ''
const safeJson = (value, depth = 0) => depth < 50 && (value === null ||
  ['string','boolean'].includes(typeof value) || typeof value === 'number' && Number.isFinite(value) ||
  Array.isArray(value) && value.every(v=>safeJson(v,depth+1)) || value && typeof value === 'object' &&
  Object.entries(value).every(([k,v])=>!['__proto__','constructor','prototype'].includes(k)&&safeJson(v,depth+1)))

export async function planBatchImport(source, batch, { validateAssets = async () => [] } = {}) {
  if(!safeJson(source))throw new Error('Исходный каталог должен содержать безопасный JSON')
  const sourceErrors = validateSource(source)
  if (sourceErrors.length) throw new Error(`Исходный каталог некорректен:\n${sourceErrors.join('\n')}`)
  if (!batch || batch.schemaVersion !== 1 || batch.documentType !== 'species-import-batch' ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(batch.batchId || '') || !Array.isArray(batch.records) || batch.records.length > 2000) {
    throw new Error('Пакет: нужны schemaVersion:1, documentType:species-import-batch, безопасный batchId и records (до 2000 записей)')
  }
  const proposedSource = structuredClone(source), results = []
  const existing = [...source.catalog,...source.demoArchive]
  const ids = new Map(existing.map(s=>[s.id,s]))
  const names = new Map(existing.filter(s=>s.scientificName).map(s=>[taxonNameKey(s.scientificName),s.id]))
  const taxonIds = new Map(existing.flatMap(s=>s.sources.filter(r=>r.taxonId).map(r=>[r.taxonId,s.id])))
  for (const [index, entry] of batch.records.entries()) {
    const result = { index, candidateId: typeof entry?.candidateId === 'string' ? entry.candidateId : null,
      status: 'rejected', errors: [], warnings: [] }
    results.push(result)
    try {
      if (!safeJson(entry)) { result.errors.push('Запись должна содержать безопасный JSON без NaN/служебных ключей'); continue }
      if (entry?.deferredReason && entry.species === null) { result.errors.push(`Отложено: ${entry.deferredReason}`); continue }
      const s=entry?.species, e=entry?.taxonomyEvidence
      result.errors.push(...validateSpecies([s],`records[${index}].species`))
      if (result.errors.length) continue
      if (s.id !== entry.candidateId) result.errors.push('candidateId должен совпадать с species.id')
      if (s.verified !== false) result.errors.push('Пакетный импорт не предоставляет независимое редакторское одобрение: verified должен оставаться false')
      if (s.nationalRedBook.listed !== true || !s.regions?.some(r=>r.code==='KG'&&r.type==='country'&&r.sourceIds.length))
        result.errors.push('Нужны подтверждённое национальное включение и источник встречаемости KG')
      const nameKey=taxonNameKey(s.scientificName)
      if (!e || e.status !== 'ACCEPTED' || e.matchType !== 'EXACT' || !['SPECIES','SUBSPECIES'].includes(e.rank) ||
        !/^(?:gbif|iucn-gbif):[1-9]\d*$/.test(e.taxonId || '') || nameKey !== taxonNameKey(e.canonicalName))
        result.errors.push('Таксономия: требуется точное принятое имя, ранг SPECIES/SUBSPECIES и идентификатор первоисточника')
      else {
        if (nameKey.split(' ').length !== (e.rank==='SUBSPECIES'?3:2)) result.errors.push('Число частей научного имени не соответствует рангу таксона')
        if (taxonNameKey(s.taxonomy.genus) !== nameKey.split(' ')[0]) result.errors.push('Род не соответствует научному имени')
        if (!s.sources.some(r=>r.id===e.sourceId&&r.taxonId===e.taxonId&&r.supports.includes('scientificName')))
          result.errors.push('Идентификатор таксона должен быть связан с источником scientificName')
      }
      if (result.errors.length) continue
      result.errors.push(...await validateAssets(s))
      if (result.errors.length) continue
      if (ids.has(s.id)) {
        if (source.demoArchive.some(r=>r.id===s.id)) result.errors.push(`ID ${s.id} занят архивной записью`)
        else if (isDeepStrictEqual(ids.get(s.id),s)) result.status='unchanged'
        else result.errors.push(`ID ${s.id} уже существует с другими данными; импорт только добавляет, не перезаписывает`)
        continue
      }
      const duplicate = names.get(nameKey) || taxonIds.get(e.taxonId)
      if (duplicate) { result.errors.push(`Таксон уже представлен записью ${duplicate}`); continue }
      const overlapping = [...names].find(([name]) => name.startsWith(`${nameKey} `) || nameKey.startsWith(`${name} `))
      if (overlapping) { result.errors.push(`Конфликт вида/подвида с записью ${overlapping[1]}; требуется отдельное разрешение таксономического концепта`); continue }
      if (!s.images.length) result.warnings.push('Разрешённая фотография отсутствует: используется существующий placeholder')
      proposedSource.catalog.push(structuredClone(s));ids.set(s.id,s);names.set(nameKey,s.id);taxonIds.set(e.taxonId,s.id)
      result.status='added'
      result.summary={id:s.id,scientificName:s.scientificName,group:s.group,imageCount:s.images.length}
    } catch(error) { result.errors.push(`Ошибка кандидата: ${error.message}`) }
  }
  const errors=validateSource(proposedSource)
  if(errors.length)throw new Error(`План нарушает модель каталога:\n${errors.join('\n')}`)
  return { schemaVersion:1,batchId:batch.batchId,beforeCount:source.catalog.length,afterCount:proposedSource.catalog.length,
    counts:{processed:results.length,added:results.filter(r=>r.status==='added').length,
      unchanged:results.filter(r=>r.status==='unchanged').length,rejected:results.filter(r=>r.status==='rejected').length},
    results,proposedSource }
}
