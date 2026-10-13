import { computed, inject, provide, ref, watch } from 'vue'
import { messages } from '../locales/index.js'
import { readLanguage, saveLanguage, translate, validLanguage } from '../data/localization.js'
import { applyBrandMetadata, brandMetadata } from '../data/brand.js'
const context = Symbol('content-language')
const messageKeys = new Map(Object.entries(messages.ru).map(([key, text]) => [text, key]))
const storage = () => { try { return globalThis.localStorage } catch { return null } }
export const siteLanguage = ref(readLanguage(storage()))
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
