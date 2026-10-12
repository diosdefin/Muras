import { canPublishImage } from './species-model.js'

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
const number = new Intl.NumberFormat('ru-RU')

export function localized(value, language = 'ru') {
  return value?.[language] || value?.ru || value?.en || value?.ky || null
}

export function speciesName(species, language = 'ru') {
  return localized(species.names, language) || species.scientificName || species.id
}

export function formatPopulation(population) {
  if (!population?.estimate) return 'Численность неизвестна'
  const { min, max } = population.estimate
  return `${min === max ? number.format(min) : `${number.format(min)}–${number.format(max)}`} ${population.unit || ''}`.trim()
}

export function regionNames(species) {
  return species.regions?.map(region => localized(region.names)).filter(Boolean) || []
}

export function speciesPhoto(species) {
  return species.images?.find(canPublishImage) || null
}

export function publicImageUrl(path) {
  return path ? `${import.meta.env?.BASE_URL || '/'}${path.replace(/^\//, '')}` : PLACEHOLDER
}

export function statusDetails(species) {
  const category = species.iucn?.category
  return category && STATUS_DETAILS[category]
    ? { ...STATUS_DETAILS[category], label: `IUCN ${category} · ${STATUS_DETAILS[category].label}` }
    : { label: 'IUCN · статус неизвестен', classes: 'bg-slate-100 text-slate-700 ring-slate-200' }
}
