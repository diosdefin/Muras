// Language-aware public URLs. Kyrgyz is the default and lives at the site root;
// Uzbek, Russian and English use a path prefix so every language has its own
// indexable address (/ru/species/irbis) that search engines can tell apart.
import { LANGUAGES, validLanguage } from './localization.js'

export const DEFAULT_LANGUAGE = 'ky'
export const LANGUAGE_PREFIXES = Object.freeze({ ky: '', uz: '/uz', ru: '/ru', en: '/en' })

const PREFIXED = LANGUAGES.filter(language => LANGUAGE_PREFIXES[language])
const PREFIX_PATTERN = new RegExp(`^/(${PREFIXED.join('|')})(?=/|$)`)

// '/ru/species/irbis' -> { language: 'ru', path: '/species/irbis' }; '/species/irbis' -> { language: null, path: ... }
export function splitLanguagePath(pathname) {
  const value = typeof pathname === 'string' && pathname.startsWith('/') ? pathname : '/'
  const match = PREFIX_PATTERN.exec(value)
  if (!match) return { language: null, path: value }
  return { language: match[1], path: value.slice(match[0].length) || '/' }
}

// Adds the language prefix to an unprefixed route path; the home page of a prefixed language keeps a trailing slash.
export function languagePath(path, language) {
  const base = splitLanguagePath(path).path
  const prefix = validLanguage(language) ? LANGUAGE_PREFIXES[language] : ''
  if (!prefix) return base
  return base === '/' ? `${prefix}/` : `${prefix}${base}`
}

// The language named by the address bar, or null when the URL carries no prefix.
export function languageFromPath(pathname) {
  return splitLanguagePath(pathname).language
}
