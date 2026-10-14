import { LANGUAGES, scientificContent } from './localization.js'

export const CONTENT_FIELDS = Object.freeze(['shortDescription', 'overview', 'appearance', 'ecology', 'diet', 'reproduction', 'distribution'])
export const emptyContent = () => Object.fromEntries(CONTENT_FIELDS.map(key => [key, null]))
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const text = value => typeof value === 'string' && Boolean(value.trim())

// Structural/evidence checks do not replace an independent scientific review.
export function validateContent(content, sources, path = 'content') {
  if (content == null) return [] // Legacy records and archives need no migration.
  const errors = [], fail = (at, message) => errors.push(`${at}: ${message}`)
  const references = Array.isArray(sources) ? sources : []
  if (!object(content)) return [`${path}: ожидается объект энциклопедических разделов или null`]
  for (const key of Object.keys(content)) if (!CONTENT_FIELDS.includes(key)) fail(`${path}.${key}`, 'неизвестный раздел')
  for (const key of CONTENT_FIELDS) {
    const at = `${path}.${key}`, section = content[key]
    if (!Object.hasOwn(content, key)) { fail(at, 'нужен раздел; неизвестные сведения — null'); continue }
    if (section === null) continue
    if (!object(section) || Object.keys(section).some(k => !['text', 'sourceIds'].includes(k))) { fail(at, 'нужны только text и sourceIds'); continue }
    if (!object(section.text) || Object.keys(section.text).some(lang => !LANGUAGES.includes(lang))) fail(`${at}.text`, 'нужен объект KY/UZ/RU/EN')
    else {
      for (const language of LANGUAGES) {
        const value = section.text[language]
        if (value !== null && !text(value)) fail(`${at}.text.${language}`, 'ожидается непустая строка или null')
        if (text(value) && value.length > (key === 'shortDescription' ? 300 : 20000)) fail(`${at}.text.${language}`, 'превышен предел длины текста')
      }
      if (!LANGUAGES.some(lang => text(section.text[lang]))) fail(at, 'раздел без сведений должен быть null')
    }
    if (!Array.isArray(section.sourceIds) || !section.sourceIds.length || new Set(section.sourceIds).size !== section.sourceIds.length ||
      section.sourceIds.some(id => !text(id) || !references.some(source => source?.id === id))) fail(`${at}.sourceIds`, 'нужны уникальные ссылки на существующие источники')
    else {
      const claim = `content.${key}`
      if (!section.sourceIds.every(id => references.some(source => source?.id === id && Array.isArray(source.supports) && source.supports.includes(claim)))) fail(`${at}.sourceIds`, `каждый указанный источник должен подтверждать ${claim}`)
    }
  }
  return errors
}

// First paragraph only in the dialog; full text lives on the species page.
export function overviewPreview(species) {
  const value = species.content?.overview?.text
  if (!value) return null
  return Object.fromEntries(LANGUAGES.map(language => [language, value[language]?.split(/\n\s*\n/u)[0] || null]))
}

export function contentParagraphs(section, language) {
  const selected = scientificContent(section?.text, language)
  return selected.text?.split(/\n\s*\n/u).filter(text).map(paragraph => ({ [selected.language]: paragraph })) || []
}
