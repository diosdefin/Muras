import { computed, inject, provide, ref, watch } from 'vue'
import { messages } from '../locales/index.js'
import { readLanguage, saveLanguage, translate, validLanguage } from '../data/localization.js'
import { applyBrandMetadata, brandMetadata } from '../data/brand.js'
import { languageFromPath } from '../data/language-routes.js'
const context = Symbol('content-language')
const messageKeys = new Map(Object.entries(messages.ru).map(([key, text]) => [text, key]))
const storage = () => { try { return globalThis.localStorage } catch { return null } }
// A language prefix in the address (/ru/..., /uz/..., /en/...) wins over the saved choice, because the URL is what was shared or indexed.
function initialLanguage() {
  const fromUrl = typeof window !== 'undefined' ? languageFromPath(window.location?.pathname) : null
  if (fromUrl) { saveLanguage(storage(), fromUrl); return fromUrl }
  return readLanguage(storage())
}
export const siteLanguage = ref(initialLanguage())
export function useLocale(override = null) {
  const language = override || inject(context, siteLanguage)
  const t = (key, values) => translate(messages, language.value, key, values)
  const uiMessage = text => {
    const key = messageKeys.get(text)
    return key ? t(key) : text
  }
  const setLanguage = value => { if (validLanguage(value)) { siteLanguage.value = value; saveLanguage(storage(), value) } }
  return { language, siteLanguage, t, uiMessage, setLanguage }
}
export function provideContentLanguage(value) {
  provide(context, computed(() => value.value || siteLanguage.value))
}
export function syncLocaleMetadata(options = {}) {
  return watch(siteLanguage, language => {
    applyBrandMetadata(document, brandMetadata(messages, language, options))
  }, { immediate: true })
}
