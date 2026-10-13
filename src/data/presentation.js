import { canPublishImage } from './species-model.js'
import { populationPresentation } from './population.js'
import { tr } from '../locales/index.js'

export const STATUS_DETAILS = {
  CR: { label: 'Критическая угроза', classes: 'bg-red-100 text-red-800 ring-red-200' },
  EN: { label: 'Под угрозой', classes: 'bg-orange-100 text-orange-800 ring-orange-200' },
  VU: { label: 'Уязвимый вид', classes: 'bg-yellow-100 text-yellow-800 ring-yellow-200' },
  NT: { label: 'Близок к уязвимому', classes: 'bg-yellow-100 text-yellow-800 ring-yellow-200' },
  LC: { label: 'Наименьшие опасения', classes: 'bg-slate-100 text-slate-700 ring-slate-200' },
  DD: { label: 'Недостаточно данных', classes: 'bg-slate-100 text-slate-700 ring-slate-200' },
  NE: { label: 'Не оценён', classes: 'bg-slate-100 text-slate-700 ring-slate-200' },
  EX: { label: 'Исчезнувший', classes: 'bg-slate-100 text-slate-700 ring-slate-200' },
  EW: { label: 'Исчезнувший в природе', classes: 'bg-slate-100 text-slate-700 ring-slate-200' },
}
export const PLACEHOLDER = `${import.meta.env?.BASE_URL || '/'}images/placeholder.svg`

export function localized(value, language = 'ru') {
  return value?.[language] || value?.ru || value?.en || value?.ky || null
}

export function speciesName(species, language = 'ru') {
  return localized(species.names, language) || species.scientificName || species.id
}

export function groupLabel(species, language = 'ru') {
  const key = { mammals: 'ui.m141', birds: 'ui.m142', plants: 'ui.m143' }[species.group] || `group.${species.group}`
  if (language !== 'ru') return tr(language, key === `group.${species.group}` && !['fish','reptiles','amphibians','invertebrates','fungi'].includes(species.group) ? 'group.unknown' : key)
  return { mammals: 'Млекопитающие', birds: 'Птицы', plants: 'Растения', fish: 'Рыбы',
    reptiles: 'Пресмыкающиеся', amphibians: 'Земноводные', invertebrates: 'Беспозвоночные',
    fungi: 'Грибы' }[species.group] || 'Группа не установлена'
}

export function nationalStatus(species, language = 'ru') {
  const status = species.nationalRedBook
  if (status?.listed !== true) return tr(language, 'national.unconfirmed')
  return tr(language, 'national.listed', { category: status.category || tr(language, 'national.noCategory'), year: status.year })
}

export function formatPopulation(population, sources = [], language = 'ru') {
  return populationPresentation(population, sources, language).label
}

export function regionNames(species, language = 'ru') {
  return species.regions?.map(region => localized(region.names, language)).filter(Boolean) || []
}

export function speciesPhoto(species) {
  return species.images?.find(canPublishImage) || null
}

export function publicImageUrl(path) {
  return path ? `${import.meta.env?.BASE_URL || '/'}${path.replace(/^\//, '')}` : PLACEHOLDER
}

export function statusDetails(species, language = 'ru') {
  const category = species.iucn?.category
  return category && STATUS_DETAILS[category]
    ? { ...STATUS_DETAILS[category], label: `IUCN ${category} · ${tr(language, `status.${category}`)}` }
    : { label: tr(language, 'status.unknown'), classes: 'bg-slate-100 text-slate-700 ring-slate-200' }
}

export function regionLabel(id, language = 'ru') { return tr(language, `region.${id}`) }
export function regionFilterLabel(value, language = 'ru') {
  if (value === 'ALL') return tr(language, 'ui.m030')
  if (value === 'Кыргызстан') return tr(language, 'ui.m006')
  if (value === 'Регион неизвестен') return tr(language, 'region.unknown')
  const id = { 'Баткенская область':'batken', 'Чуйская область':'chuy', 'Иссык-Кульская область':'issyk-kul', 'Джалал-Абадская область':'jalal-abad', 'Нарынская область':'naryn', 'Ошская область':'osh', 'Таласская область':'talas' }[value]
  return id ? regionLabel(id, language) : value
}
