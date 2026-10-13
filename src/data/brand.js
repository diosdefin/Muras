import { LANGUAGES, translate, validLanguage } from './localization.js'

export const BRAND_NAME = 'Muras'
export const THEME_COLOR = '#F7F8F4'
export const OG_LOCALES = Object.freeze({ ky:'ky_KG', ru:'ru_RU', en:'en_GB' })

export function brandMetadata(messages, language, { admin = false } = {}) {
  const locale = validLanguage(language) ? language : 'ky'
  return {
    language:locale,
    title:translate(messages, locale, admin ? 'brand.adminTitle' : 'pageTitle'),
    description:translate(messages, locale, admin ? 'brand.adminDescription' : 'ui.m018'),
    siteName:BRAND_NAME, themeColor:THEME_COLOR, type:'website', locale:OG_LOCALES[locale],
    alternateLocales:LANGUAGES.filter(lang=>lang!==locale).map(lang=>OG_LOCALES[lang]),
  }
}

// Only siteLanguage drives metadata; a temporary scientific-card language never does.
export function applyBrandMetadata(document, metadata) {
  document.documentElement.lang = metadata.language
  document.title = metadata.title
  const set = (attribute, key, value) => {
    let element = document.querySelector(`meta[${attribute}="${key}"]`)
    if (!element) {
      element = document.createElement('meta')
      element.setAttribute(attribute,key)
      document.head.appendChild(element)
    }
    element.setAttribute('content',value)
  }
  set('name','description',metadata.description)
  set('name','theme-color',metadata.themeColor)
  for (const [key,value] of Object.entries({ title:metadata.title, description:metadata.description,
    site_name:metadata.siteName, type:metadata.type, locale:metadata.locale })) set('property',`og:${key}`,value)
  document.querySelectorAll('meta[property="og:locale:alternate"]').forEach(element=>element.remove())
  for (const locale of metadata.alternateLocales) {
    const element=document.createElement('meta')
    element.setAttribute('property','og:locale:alternate');element.setAttribute('content',locale)
    document.head.appendChild(element)
  }
}
