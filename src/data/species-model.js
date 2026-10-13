import { validComposition, validCompositions } from './image-composition.js'
import { validatePopulation } from './population.js'
import { validateSourceLocalization } from './localization.js'
import { isSpeciesGroup } from './species-groups.js'

export const LANGUAGES = ['ru', 'ky', 'en']
export const IUCN_CATEGORIES = ['EX', 'EW', 'CR', 'EN', 'VU', 'NT', 'LC', 'DD', 'NE']
const FIELDS = ['id', 'scientificName', 'names', 'taxonomy', 'group', 'nationalRedBook', 'iucn',
  'habitat', 'regions', 'threats', 'conservationMeasures', 'population', 'images', 'sources',
  'verified', 'lastReviewedAt']

export function canPublishImage(image) {
  return image?.licenseVerified === true &&
    ['path', 'author', 'originalPage', 'license', 'licenseUrl', 'attribution'].every(key =>
      typeof image[key] === 'string' && image[key].trim().length > 0) &&
    Array.isArray(image.modifications)
}

export function validateSpecies(records, label = 'catalog', { publicData = false } = {}) {
  const errors = []
  const fail = (path, message) => errors.push(`${path}: ${message}`)
  const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
  const text = (value) => typeof value === 'string' && value.trim().length > 0
  const nullableText = (value) => value === null || text(value)
  const date = (value) => text(value) && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
  const year = (value) => value === null || (Number.isInteger(value) && value >= 1500 && value <= 2100)
  const url = (value) => { try { return ['https:', 'http:'].includes(new URL(value).protocol) } catch { return false } }
  const localized = (value, path) => {
    if (!object(value)) { fail(path, 'ожидается объект ru/ky/en'); return }
    for (const lang of LANGUAGES) if (!nullableText(value[lang])) fail(`${path}.${lang}`, 'ожидается строка или null')
    for (const key of Object.keys(value)) if (!LANGUAGES.includes(key)) fail(`${path}.${key}`, 'неизвестный язык; используйте ky, не kg')
  }
  if (!Array.isArray(records)) return [`${label}: ожидается массив видов`]
  const ids = new Set()
  records.forEach((item, index) => {
    const p = `${label}[${index}]`
    if (!object(item)) { fail(p, 'ожидается объект вида'); return }
    for (const key of FIELDS) if (!(key in item)) fail(`${p}.${key}`, 'обязательное поле отсутствует')
    for (const key of Object.keys(item)) if (!FIELDS.includes(key)) fail(`${p}.${key}`, 'неизвестное поле')
    if (!text(item.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id)) fail(`${p}.id`, 'ожидается безопасный slug')
    if (ids.has(item.id)) fail(`${p}.id`, 'повторяющийся id')
    ids.add(item.id)
    if (!nullableText(item.scientificName)) fail(`${p}.scientificName`, 'ожидается строка или null')
    localized(item.names, `${p}.names`)
    if (item.group !== null && !isSpeciesGroup(item.group)) fail(`${p}.group`, 'неизвестная группа')
    if (typeof item.verified !== 'boolean') fail(`${p}.verified`, 'ожидается boolean')
    if (item.lastReviewedAt !== null && !date(item.lastReviewedAt)) fail(`${p}.lastReviewedAt`, 'ожидается дата YYYY-MM-DD или null')
    const sourceIds = new Set()
    const supported = new Set()
    if (!Array.isArray(item.sources)) fail(`${p}.sources`, 'ожидается массив источников')
    else item.sources.forEach((s, n) => {
      const sp = `${p}.sources[${n}]`
      if (!object(s)) { fail(sp, 'ожидается объект'); return }
      errors.push(...validateSourceLocalization(s, sp))
      if (s.authors !== undefined && s.authors !== null && !(text(s.authors) || Array.isArray(s.authors) && s.authors.every(text))) fail(`${sp}.authors`, 'ожидается строка, массив имён или null')
      if (s.publishedAt !== undefined && s.publishedAt !== null && !date(s.publishedAt)) fail(`${sp}.publishedAt`, 'ожидается дата YYYY-MM-DD или null')
      if (!text(s.id) || sourceIds.has(s.id)) fail(`${sp}.id`, 'отсутствующий или повторяющийся id источника')
      sourceIds.add(s.id)
      if (!text(s.title) || !text(s.publisher) || !url(s.url) || !date(s.accessedAt)) fail(sp, 'нужны title, publisher, HTTP(S) url и accessedAt')
      if (!Array.isArray(s.supports) || !s.supports.length || s.supports.some(v => !text(v))) fail(`${sp}.supports`, 'перечислите подтверждаемые поля')
      else s.supports.forEach(v => supported.add(v))
    })
    const claim = (path, value) => {
      if (value !== null && value !== undefined && !supported.has(path)) fail(`${p}.${path}`, 'нет источника, подтверждающего это поле (sources.supports)')
    }
    const refs = (value, path, required, claimPath) => {
      if (!Array.isArray(value) || value.some(id => !sourceIds.has(id))) fail(path, 'неизвестная или некорректная ссылка на источник')
      else if (required && value.length === 0) fail(path, 'утверждение требует источник')
      else if (required && claimPath && !item.sources.some(s => object(s) && value.includes(s.id) && Array.isArray(s.supports) && s.supports.includes(claimPath))) fail(path, `ссылка должна подтверждать ${claimPath}`)
    }
    claim('scientificName', item.scientificName)
    claim('group', item.group)
    for (const lang of LANGUAGES) claim(`names.${lang}`, item.names?.[lang])
    if (!object(item.taxonomy)) fail(`${p}.taxonomy`, 'ожидается объект таксономии')
    else for (const rank of ['kingdom', 'phylum', 'class', 'order', 'family', 'genus']) {
      if (!nullableText(item.taxonomy[rank])) fail(`${p}.taxonomy.${rank}`, 'ожидается строка или null')
      claim(`taxonomy.${rank}`, item.taxonomy[rank])
    }
    for (const field of ['nationalRedBook', 'iucn']) {
      const status = item[field]
      if (!object(status)) { fail(`${p}.${field}`, 'ожидается объект классификации'); continue }
      if (!year(status.year)) fail(`${p}.${field}.year`, 'ожидается год или null')
      if (!nullableText(status.category)) fail(`${p}.${field}.category`, 'ожидается категория или null')
      if (field === 'iucn' && status.category !== null && !IUCN_CATEGORIES.includes(status.category)) fail(`${p}.iucn.category`, 'неизвестная категория IUCN')
      if (field === 'nationalRedBook') {
        if (status.listed !== null && typeof status.listed !== 'boolean') fail(`${p}.${field}.listed`, 'ожидается boolean или null')
        if (!nullableText(status.edition)) fail(`${p}.${field}.edition`, 'ожидается издание или null')
        if (status.category !== null && status.listed !== true) fail(`${p}.${field}`, 'категория требует подтверждённого включения')
        claim(`${field}.listed`, status.listed)
        claim(`${field}.edition`, status.edition)
      }
      claim(`${field}.category`, status.category)
      claim(`${field}.year`, status.year)
      refs(status.sourceIds, `${p}.${field}.sourceIds`, status.category !== null || status.listed !== null && field === 'nationalRedBook',
        status.category !== null ? `${field}.category` : `${field}.listed`)
      if (field === 'nationalRedBook' && (status.listed !== null || status.category !== null) && (!status.edition || status.year === null)) {
        fail(`${p}.${field}`, 'национальный статус требует название издания/документа и год')
      }
    }
    if (item.habitat !== null) {
      if (!object(item.habitat)) fail(`${p}.habitat`, 'ожидается объект или null')
      else { localized(item.habitat.description, `${p}.habitat.description`); refs(item.habitat.sourceIds, `${p}.habitat.sourceIds`, true, 'habitat'); claim('habitat', item.habitat) }
    }
    for (const field of ['regions', 'threats', 'conservationMeasures']) {
      if (item[field] === null) continue
      if (!Array.isArray(item[field]) || item[field].length === 0) { fail(`${p}.${field}`, 'неизвестное значение — null; иначе непустой массив'); continue }
      item[field].forEach((entry, n) => {
        if (!object(entry)) { fail(`${p}.${field}[${n}]`, 'ожидается объект'); return }
        localized(field === 'regions' ? entry.names : entry.text, `${p}.${field}[${n}]`)
        refs(entry.sourceIds, `${p}.${field}[${n}].sourceIds`, true, `${field}.${n}`)
        claim(`${field}.${n}`, entry)
        if (field === 'regions' && (!text(entry.code) || !['country', 'region'].includes(entry.type))) fail(`${p}.${field}[${n}]`, 'нужны code и type country/region')
      })
    }
    errors.push(...validatePopulation(item.population, item.sources, `${p}.population`))
    if (!Array.isArray(item.images)) fail(`${p}.images`, 'ожидается массив изображений (может быть пустым)')
    else item.images.forEach((image, n) => {
      const ip = `${p}.images[${n}]`
      if (!object(image)) { fail(ip, 'ожидается объект'); return }
      for (const key of ['path', 'author', 'originalPage', 'license', 'licenseUrl', 'attribution']) if (!nullableText(image[key])) fail(`${ip}.${key}`, 'ожидается строка или null')
      if (typeof image.licenseVerified !== 'boolean') fail(`${ip}.licenseVerified`, 'ожидается boolean')
      if (image.caption !== undefined) localized(image.caption, `${ip}.caption`)
      if (image.composition !== undefined && !validComposition(image.composition)) fail(`${ip}.composition`, 'нужны x/y в диапазоне 0..1 и zoom в диапазоне 1..3; только эти три поля')
      if (image.compositions !== undefined && !validCompositions(image.compositions)) fail(`${ip}.compositions`, 'допустимы card/detail/lesson с x/y 0..1 и zoom 1..3; Canvas использует detail')
      if (image.sha256 !== undefined && (typeof image.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(image.sha256))) fail(`${ip}.sha256`, 'ожидается SHA-256 из 64 шестнадцатеричных символов')
      for (const key of ['width', 'height']) if (image[key] !== undefined && (!Number.isInteger(image[key]) || image[key] <= 0)) fail(`${ip}.${key}`, 'ожидается положительный размер в пикселях')
      if (image.modifications !== null && (!Array.isArray(image.modifications) || image.modifications.some(v => !text(v)))) fail(`${ip}.modifications`, 'ожидается массив строк или null')
      for (const key of ['originalPage', 'licenseUrl']) if (image[key] !== null && !url(image[key])) fail(`${ip}.${key}`, 'ожидается HTTP(S) URL')
      if (text(image.path) && (image.path.includes('..') || image.path.includes('\\') || /^[a-z]+:/i.test(image.path) || !/\.(png|jpe?g|webp)$/i.test(image.path))) fail(`${ip}.path`, 'ожидается локальный безопасный путь к PNG/JPEG/WebP')
      if (image.licenseVerified && !canPublishImage(image)) fail(ip, 'подтверждённая лицензия требует заполненные метаданные и сведения об изменениях')
      if (publicData && (!canPublishImage(image) || !image.path.startsWith('/images/approved/'))) fail(ip, 'публичный JSON может содержать только разрешённые фотографии')
    })
    if (item.verified && (!item.sources?.length || !item.lastReviewedAt || !item.scientificName ||
        !item.names?.ru || !item.names?.ky || !item.names?.en || item.nationalRedBook?.listed !== true ||
        !item.nationalRedBook?.category || !item.nationalRedBook?.edition || item.nationalRedBook?.year == null)) {
      fail(`${p}.verified`, 'полная проверка национальной записи требует источники, дату, названия и национальную классификацию')
    }
  })
  return errors
}

export function validateSource(document) {
  if (!document || document.schemaVersion !== 1) return ['schemaVersion: ожидается версия 1']
  const errors = [...validateSpecies(document.catalog), ...validateSpecies(document.demoArchive, 'demoArchive')]
  if (Array.isArray(document.catalog) && Array.isArray(document.demoArchive)) {
    const ids = document.catalog.map(item => item?.id)
    for (const item of document.demoArchive) if (item?.id && ids.includes(item.id)) errors.push(`${item.id}: вид одновременно находится в каталоге и архиве`)
  }
  return errors
}
