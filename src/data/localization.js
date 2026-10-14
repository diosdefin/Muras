export const LANGUAGES = ['ky', 'uz', 'ru', 'en']
export const LOCALE_STORAGE_KEY = 'redbook.locale.v1'
export const validLanguage = value => LANGUAGES.includes(value)
export function readLanguage(storage) {
  try { const value = storage?.getItem(LOCALE_STORAGE_KEY); return validLanguage(value) ? value : 'ky' } catch { return 'ky' }
}
export function saveLanguage(storage, language) {
  if (!validLanguage(language)) return false
  try { storage?.setItem(LOCALE_STORAGE_KEY, language); return Boolean(storage) } catch { return false }
}
export function translate(messages, language, key, values = {}) {
  const text = messages[language]?.[key] ?? messages.ru?.[key] ?? key
  return text.replace(/\{(\w+)\}/g, (match, name) => values[name] == null ? match : String(values[name]))
}
export function scientificContent(value, language) {
  const actual = [language, 'ru', 'en', 'ky', 'uz'].find(code => typeof value?.[code] === 'string' && value[code].trim())
  return { text: actual ? value[actual] : null, language: actual || 'und', fallback: Boolean(actual && actual !== language) }
}
export function searchContentLanguage(result, siteLanguage) {
  const matches = result?.matchedLanguages || (result?.language ? [result.language] : [])
  return ['direct', 'transliteration'].includes(result?.kind) && matches.length === 1 && validLanguage(matches[0]) ? matches[0] : siteLanguage
}
export function localizedQuestion(question, language) {
  const version = question.translations?.[language]
  const usable = version && version.question && version.explanation && question.options.every(option => version.options?.[option.id])
  return { ...question, question: usable ? version.question : question.question,
    explanation: usable ? version.explanation : question.explanation,
    options: question.options.map(option => ({ ...option, text: usable ? version.options[option.id] : option.text, language: usable ? version.optionLanguages?.[option.id] || language : 'ru' })),
    language: usable ? language : 'ru', fallback: language !== 'ru' && !usable }
}

export function validateSourceLocalization(source, path = 'source') {
  const errors = []
  const text = value => typeof value === 'string' && Boolean(value.trim())
  const url = value => { try { return ['http:', 'https:'].includes(new URL(value).protocol) } catch { return false } }
  if (source.language !== undefined && source.language !== null && !validLanguage(source.language)) errors.push(`${path}.language: используйте ky/uz/ru/en или null`)
  if (source.versions !== undefined) {
    if (!source.versions || typeof source.versions !== 'object' || Array.isArray(source.versions)) errors.push(`${path}.versions: ожидается объект языковых версий`)
    else for (const [lang, version] of Object.entries(source.versions)) {
      if (!validLanguage(lang) || !version || !url(version.url) || !text(version.title) || version.language !== lang || version.verified !== true || Object.keys(version).some(key => !['url','title','language','verified'].includes(key))) errors.push(`${path}.versions.${lang}: нужны подтверждённые URL, title, language и verified: true`)
    }
  }
  return errors
}
// Only explicit, reviewed alternatives may replace an original URL. No URL guessing.
export function localizedSource(source, language) {
  const alternative = source.versions?.[language]
  let validUrl = false
  try { validUrl = ['http:', 'https:'].includes(new URL(alternative?.url).protocol) } catch { /* Keep the original source. */ }
  const usable = validLanguage(language) && alternative?.verified === true && alternative.language === language &&
    typeof alternative.title === 'string' && alternative.title.trim() && validUrl
  const selected = usable ? alternative : source
  return { url: selected.url, title: selected.title, language: selected.language || null }
}
