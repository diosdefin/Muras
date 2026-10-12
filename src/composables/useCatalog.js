import { computed, ref, unref, watch } from 'vue'
import { catalogOptions, catalogPage, createSearchIndex, matchesCatalogFilters, normalizeSearch, PAGE_SIZE, searchSpecies } from '../data/catalog-search.js'

export function useCatalog(catalog) {
  const query = ref(''), status = ref('ALL'), region = ref('ALL'), group = ref('ALL'), limit = ref(PAGE_SIZE)
  const index = computed(() => createSearchIndex(unref(catalog)))
  const options = computed(() => catalogOptions(unref(catalog)))
  const results = computed(() => searchSpecies(index.value, query.value)
    .filter(result => matchesCatalogFilters(result.species, { status: status.value, region: region.value, group: group.value })))
  const page = computed(() => catalogPage(results.value, limit.value))
  const fuzzy = computed(() => results.value[0]?.kind === 'fuzzy')
  const hasFilters = computed(() => Boolean(normalizeSearch(query.value)) || [status.value, region.value, group.value].some(value => value !== 'ALL'))
  watch([query, status, region, group, catalog], () => { limit.value = PAGE_SIZE }, { flush: 'sync' })
  function reset() { query.value = ''; status.value = region.value = group.value = 'ALL'; limit.value = PAGE_SIZE }
  function more() { limit.value += PAGE_SIZE }
  return { query, status, region, group, options, results, page, fuzzy, hasFilters, reset, more }
}
