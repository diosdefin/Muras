import { LANGUAGES } from './localization.js'
import { CONTENT_FIELDS } from './species-content.js'
const text = x => typeof x === 'string' && Boolean(x.trim())
export function localizedBlocks(species) {
  const blocks = [{ path: 'names', field: 'names', value: species.names }]
  for (const field of CONTENT_FIELDS) blocks.push({ path: `content.${field}.text`, field: `content.${field}`, value: species.content?.[field]?.text })
  blocks.push({ path: 'habitat.description', field: 'habitat.description', value: species.habitat?.description })
  for (const [list, key] of [['threats', 'text'], ['conservationMeasures', 'text'], ['regions', 'names'], ['images', 'caption']]) {
    for (const [index, item] of (species[list] || []).entries()) blocks.push({ path: `${list}.${index}.${key}`, field: `${list}[].${key}`, value: item[key], regionCode: list === 'regions' ? item.code : null })
  }
  return blocks
}
export function translationCell(block, language, scientificName) {
  if (!block.value || !LANGUAGES.some(l => text(block.value[l]))) return block.field === 'names' ? 'missing' : 'not_applicable'
  const value = block.value[language]?.trim()
  if (!value) return 'missing'
  if (block.field === 'names' && scientificName && value === scientificName) return 'scientific_name_fallback'
  if (language !== 'ru' && value === block.value.ru?.trim()) {
    // The Kyrgyz and Russian country name is legitimately identical.
    if (block.field === 'regions[].names' && block.regionCode === 'KG' && language === 'ky' && value === 'Кыргызстан') return 'present'
    return 'same_as_russian_requires_review'
  }
  if (['en', 'uz'].includes(language) && /[А-Яа-яЁё]{4}/u.test(value) && !/[A-Za-z]{4}/u.test(value)) return 'script_requires_review'
  return 'present'
}
export function translationCompleteness(species) {
  const blocks = localizedBlocks(species)
  const languages = Object.fromEntries(LANGUAGES.map(language => {
    const cells = blocks.map(block => ({ path: block.path, field: block.field, state: translationCell(block, language, species.scientificName) }))
    const applicable = cells.filter(c => c.state !== 'not_applicable'), filled = applicable.filter(c => c.state === 'present').length
    const body = applicable.filter(c => c.field !== 'names')
    return [language, { filled, total: applicable.length, complete: applicable.length > 0 && filled === applicable.length,
      bodyComplete: body.length > 0 && body.every(c => c.state === 'present'),
      issues: applicable.filter(c => c.state !== 'present'), cells }]
  }))
  return { id: species.id, languages, complete: LANGUAGES.every(l => languages[l].complete) }
}
