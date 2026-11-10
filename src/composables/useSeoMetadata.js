import { watch } from 'vue'
import { applySeoMetadata, pageMetadata } from '../data/seo.js'

// Keeps <title>, description, canonical address, language alternates and structured data in step with the
// current page and language. The same builder produces the static pre-rendered HTML, so both agree.
export function useSeoMetadata({ language, route, species, areas }) {
  return watch([language, route, species, areas], () => {
    if (typeof document === 'undefined') return
    try {
      const current = route.value
      const data = { speciesCount: species.value.length || undefined }
      if (current?.name === 'species') data.species = species.value.find(record => record.id === current.id)
      if (current?.name === 'territory') data.area = areas.value.find(area => area.id === current.id)
      applySeoMetadata(document, pageMetadata(current, language.value, data))
    } catch { /* metadata is an enhancement and must never break the page */ }
  }, { immediate: true, flush: 'post' })
}
