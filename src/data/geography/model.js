// Administrative geometry and occurrence evidence are independent datasets.
export const REGIONS = [
  { id: 'batken', iso: 'KG-B', sourceName: 'Batken Region', name: 'Баткенская область' },
  { id: 'osh', iso: 'KG-O', sourceName: 'Osh Region', name: 'Ошская область' },
  { id: 'jalal-abad', iso: 'KG-J', sourceName: 'Jalal-Abad Region', name: 'Джалал-Абадская область' },
  { id: 'naryn', iso: 'KG-N', sourceName: 'Naryn Region', name: 'Нарынская область' },
  { id: 'issyk-kul', iso: 'KG-Y', sourceName: 'Issyk-Kul Region', name: 'Иссык-Кульская область' },
  { id: 'chuy', iso: 'KG-C', sourceName: 'Chuy Region', name: 'Чуйская область' },
  { id: 'talas', iso: 'KG-T', sourceName: 'Talas Region', name: 'Таласская область' },
]
export const REVIEW_STATUSES = ['documented_pending_review', 'reviewed', 'unverified']
const text = value => typeof value === 'string' && value.trim().length > 0
const https = value => { try { return new URL(value).protocol === 'https:' } catch { return false } }

export function polygons(geometry) {
  return geometry?.type === 'Polygon' ? [geometry.coordinates] : geometry?.type === 'MultiPolygon' ? geometry.coordinates : []
}

export function validateBoundaries(geojson) {
  const errors = []
  if (geojson?.type !== 'FeatureCollection' || !Array.isArray(geojson.features) || geojson.features.length !== 7) return ['Границы: ожидается FeatureCollection ровно с семью областями.']
  const seen = new Set()
  for (const feature of geojson.features) {
    const p = feature?.properties
    const region = REGIONS.find(r => r.iso === p?.shapeISO)
    if (feature?.type !== 'Feature' || !region || region.sourceName !== p?.shapeName || p?.shapeGroup !== 'KGZ' || p?.shapeType !== 'ADM1' || seen.has(p?.shapeISO)) {
      errors.push('Границы: неверное или повторное название / ISO области.'); continue
    }
    seen.add(p.shapeISO)
    const parts = polygons(feature.geometry)
    if (!Array.isArray(parts) || !parts.length) { errors.push(`${region.id}: ожидается Polygon или MultiPolygon.`); continue }
    for (const rings of parts) {
      if (!Array.isArray(rings) || !rings.length) { errors.push(`${region.id}: пустой полигон.`); continue }
      for (const ring of rings) {
        if (!Array.isArray(ring) || ring.length < 4 || ring.some(point => !Array.isArray(point) || point.length !== 2 || !point.every(Number.isFinite) || point[0] < 69 || point[0] > 81 || point[1] < 39 || point[1] > 44)) {
          errors.push(`${region.id}: некорректные координаты административной границы.`); continue
        }
        if (ring[0].some((v, i) => v !== ring.at(-1)[i])) errors.push(`${region.id}: незамкнутое кольцо.`)
        const area = ring.slice(1).reduce((sum, point, i) => sum + ring[i][0] * point[1] - point[0] * ring[i][1], 0)
        if (Math.abs(area) < 1e-10) errors.push(`${region.id}: вырожденное кольцо.`)
      }
    }
  }
  return errors
}

export function validateRegionalEvidence(data, species) {
  const errors = []
  if (data?.schemaVersion !== 1 || !Array.isArray(data.sources) || !Array.isArray(data.records)) return ['Свидетельства: ожидаются schemaVersion: 1, sources и records.']
  const sources = new Map()
  for (const source of data.sources) {
    if (!text(source?.id) || sources.has(source.id) || !text(source.title) || !https(source.url) || !text(source.locator) || !(Number.isInteger(source.year) || (['preserved-specimen', 'administrative-reference'].includes(source.kind) || source.kind === 'regional-monitoring-report' && Number.isInteger(source.informationYear) && source.informationYear > 2006) && source.year === null) || !['regional-field-study', 'preserved-specimen', 'historical-national-account', 'administrative-reference', 'regional-monitoring-report'].includes(source.kind)) errors.push('Свидетельства: неверный, повторный или нерегиональный источник.')
    if (source?.kind === 'preserved-specimen' && (!text(source.catalogNumber) || !/^gbif:\d+$/.test(source.taxonId) || !text(source.scientificName) || !REGIONS.some(r => r.id === source.administrativeRegionId))) errors.push('Свидетельства: образцу нужны точный таксон, номер и документированная область.')
    if (source && Object.keys(source).some(k => !['id', 'title', 'url', 'locator', 'year', 'kind', 'checkedAt', 'license', 'licenseUrl', 'catalogNumber', 'taxonId', 'scientificName', 'administrativeRegionId', 'administrativeRegionIds', 'speciesId', 'historicalScientificName', 'accountPage', 'pairedPage', 'bookPdfSha256', 'publicationDate', 'informationYear'].includes(k))) errors.push('Свидетельства: неизвестные поля источника, включая координаты, запрещены.')
    if (/\d+\s*[°′″]|\b(?:latitude|longitude|coordinates)\b|\b\d{2}\.\d{3,}\b/i.test(`${source?.title || ''} ${source?.locator || ''}`)) errors.push('Свидетельства: точные местоположения источника нельзя публиковать.')
    if (source?.kind === 'historical-national-account' && (source.year !== 2006 || source.bookPdfSha256 !== 'f517212f7ce12fcf5c30f2cf73edc5a842b3ded15dea232b844fbe7ce2525cf8' || !text(source.historicalScientificName) || !species.some(s => s.id === source.speciesId && s.sources?.some(ref => ref.url === source.url)) || !Number.isInteger(source.accountPage) || source.accountPage < 38 || source.accountPage > 527 || source.pairedPage !== source.accountPage - 1 || source.url !== `https://macrolepidoptera.ru/lnk/282.pdf#page=${source.accountPage}`)) errors.push('Свидетельства: неверная ссылка на проверенный исторический очерк.')
    if (source?.kind === 'administrative-reference' && (!Array.isArray(source.administrativeRegionIds) || !source.administrativeRegionIds.length || source.administrativeRegionIds.some(id => !REGIONS.some(r => r.id === id)))) errors.push('Свидетельства: неверный административный справочник.')
    if (source?.publicationDate !== undefined && (!/^\d{4}-\d{2}-\d{2}$/.test(source.publicationDate) || !Number.isFinite(Date.parse(source.publicationDate)) || new Date(source.publicationDate).toISOString().slice(0, 10) !== source.publicationDate || +source.publicationDate.slice(0, 4) !== source.year)) errors.push('Свидетельства: неверная дата публикации.')
    sources.set(source?.id, source)
  }
  const seen = new Set()
  for (const [index, record] of data.records.entries()) {
    const key = `${record?.speciesId}:${record?.regionId}`
    const prefix = `Свидетельство ${index + 1}`
    const sourceIds = Array.isArray(record?.sourceIds) ? record.sourceIds : []
    if (!species.some(s => s.id === record?.speciesId)) errors.push(`${prefix}: неизвестный вид.`)
    if (!REGIONS.some(r => r.id === record?.regionId)) errors.push(`${prefix}: неизвестная область.`)
    if (seen.has(key)) errors.push(`${prefix}: повторная связь вида с областью.`)
    seen.add(key)
    if (!Array.isArray(record?.sourceIds) || !record.sourceIds.length || new Set(record.sourceIds).size !== record.sourceIds.length || record.sourceIds.some(id => !sources.has(id))) errors.push(`${prefix}: неверные ссылки на источники.`)
    const primarySources = sourceIds.map(id => sources.get(id)).filter(s => s && s.kind !== 'administrative-reference')
    if (!primarySources.length) errors.push(`${prefix}: административный справочник не доказывает присутствие вида.`)
    for (const source of primarySources) if (source.kind === 'historical-national-account') {
      if (source.speciesId !== record?.speciesId || record?.temporalContext !== 'historical') errors.push(`${prefix}: исторический очерк не подтверждает этот таксон или современное наблюдение.`)
    }
    if (primarySources.some(s => ['historical-national-account', 'regional-monitoring-report'].includes(s.kind))) {
      const basis = record?.administrativeBasis
      if (basis?.type !== 'documented-locality' || Object.keys(basis).some(k => !['type', 'sourceIds'].includes(k)) || !Array.isArray(basis.sourceIds) || !basis.sourceIds.length || basis.sourceIds.some(id => !sourceIds.includes(id) || sources.get(id)?.kind !== 'administrative-reference' || !sources.get(id).administrativeRegionIds.includes(record?.regionId))) errors.push(`${prefix}: нужно документированное административное сопоставление.`)
      if (record?.evidenceId !== `map-184:${record?.speciesId}:${record?.regionId}`) errors.push(`${prefix}: нужен идентификатор проверенного исследовательского решения.`)
    }
    if (!text(record?.evidence) || !text(record?.locator)) errors.push(`${prefix}: нужны доказательство и место в публикации.`)
    if (!REVIEW_STATUSES.includes(record?.reviewStatus)) errors.push(`${prefix}: неизвестный статус проверки.`)
    if (record?.localityPrecision !== 'oblast') errors.push(`${prefix}: разрешена только точность до области.`)
    for (const id of sourceIds) {
      const source = sources.get(id), item = species.find(s => s.id === record?.speciesId)
      if (source?.kind === 'preserved-specimen' && (source.administrativeRegionId !== record?.regionId || source.scientificName !== item?.scientificName || !item?.sources?.some(s => s.taxonId === source.taxonId))) errors.push(`${prefix}: образец не подтверждает точный таксон и область.`)
    }
    if (record?.observationDate !== undefined && (!/^\d{4}-\d{2}-\d{2}$/.test(record.observationDate) || !Number.isFinite(Date.parse(record.observationDate)) || new Date(record.observationDate).toISOString().slice(0, 10) !== record.observationDate || +record.observationDate.slice(0, 4) !== record.observationYear)) errors.push(`${prefix}: неверная дата наблюдения.`)
    if (record?.temporalContext !== undefined && !['historical', 'recent', 'undated'].includes(record.temporalContext)) errors.push(`${prefix}: современное присутствие не подтверждено.`)
    if (record?.temporalContext === 'recent' && (!Number.isInteger(record.observationYear) || record.observationYear <= 2006)) errors.push(`${prefix}: для позднего наблюдения нужен известный год после 2006.`)
    if (record?.temporalContext === 'undated' && (record.observationYear !== null || !primarySources.length || primarySources.some(s => s.kind !== 'regional-monitoring-report'))) errors.push(`${prefix}: неизвестная дата допустима только для документированного списка.`)
    if (record?.precisionLimits !== undefined && !text(record.precisionLimits)) errors.push(`${prefix}: нужны ограничения точности.`)
    const undatedDocument = record?.observationYear === null && text(record?.observationPeriod) && primarySources.length && primarySources.every(s => ['historical-national-account', 'regional-monitoring-report'].includes(s.kind))
    if (!undatedDocument && (!Number.isInteger(record?.observationYear) || record.observationYear < 1800 || record.observationYear > 2100 || sourceIds.some(id => Number.isInteger(sources.get(id)?.year) && sources.get(id).year < record.observationYear))) errors.push(`${prefix}: неверный год наблюдения.`)
    if (record && Object.keys(record).some(k => !['speciesId', 'regionId', 'sourceIds', 'evidence', 'locator', 'reviewStatus', 'localityPrecision', 'observationYear', 'observationDate', 'temporalContext', 'precisionLimits', 'observationPeriod', 'administrativeBasis', 'evidenceId'].includes(k))) errors.push(`${prefix}: лишние поля, включая координаты, запрещены.`)
    if (/\d+\s*[°′″]|\b(?:latitude|longitude|coordinates)\b|\b\d{2}\.\d{3,}\b/i.test(`${record?.evidence || ''} ${record?.locator || ''} ${record?.precisionLimits || ''} ${record?.observationPeriod || ''}`)) errors.push(`${prefix}: точные местоположения нельзя публиковать.`)
  }
  return errors
}

export function regionalEntries(data, species, regionId, group = 'ALL') {
  if (!regionId) return []
  const entries = new Map()
  for (const record of data?.records || []) {
    if (record.regionId !== regionId || !['documented_pending_review', 'reviewed'].includes(record.reviewStatus) || record.localityPrecision !== 'oblast') continue
    const item = species.find(s => s.id === record.speciesId)
    if (!Array.isArray(record.sourceIds)) continue
    const sources = record.sourceIds.map(id => data.sources.find(s => s.id === id)).filter(Boolean)
    if (item && sources.length === record.sourceIds.length && sources.length && (group === 'ALL' || item.group === group)) entries.set(item.id, { species: item, evidence: record, sources })
  }
  return [...entries.values()]
}

export function validateMapGeometry(data) {
  if (data?.schemaVersion !== 1 || !Array.isArray(data.regions) || data.regions.length !== 7 || !Array.isArray(data.viewBox) || data.viewBox.length !== 4 || !data.viewBox.every(Number.isFinite) || data.viewBox[2] <= 0 || data.viewBox[3] <= 0) return ['Карта: неверная структура SVG-геометрии.']
  const errors = []
  const seen = new Set()
  for (const r of data.regions) {
    const pathValid = typeof r?.path === 'string' && /^(?:M\d+(?:\.\d+)?,\d+(?:\.\d+)?(?:L\d+(?:\.\d+)?,\d+(?:\.\d+)?){2,}Z)+$/.test(r.path)
    if (!REGIONS.some(item => item.id === r?.id && item.name === r.name) || seen.has(r?.id) || !pathValid) errors.push('Карта: неверная или повторная область / SVG-путь.')
    seen.add(r?.id)
  }
  if (data.provenance?.license !== 'ODbL-1.0' || data.provenance?.yearRepresented !== '2017' || !https(data.provenance?.sourceUrl)) errors.push('Карта: отсутствует происхождение, дата или лицензия.')
  return errors
}

export function publicRegionalEvidence(data) {
  const records = data.records.filter(r => ['documented_pending_review', 'reviewed'].includes(r.reviewStatus)).map(r => {
    const publicationYear = data.sources.find(s => r.sourceIds.includes(s.id) && s.kind !== 'administrative-reference').year
    const observation = r.observationYear === null
      ? `региональное свидетельство в источнике ${publicationYear === null ? 'с неуказанным годом публикации' : `${publicationYear} года`}; год наблюдения не указан`
      : `документированная запись ${r.observationYear} года`
    return {
      ...r,
      evidence: `${REGIONS.find(region => region.id === r.regionId).name}: ${observation}. Современное присутствие и численность этим свидетельством не установлены.`,
      locator: 'См. указанный источник; публичная точность — только область.',
    }
  })
  const used = new Set(records.flatMap(r => r.sourceIds))
  return { schemaVersion: 1, sources: data.sources.filter(s => used.has(s.id)), records }
}
