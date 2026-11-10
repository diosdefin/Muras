<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useLocale } from '../../composables/useLocale.js'
import CustomSelect from '../CustomSelect.vue'
import GroupFilter from '../GroupFilter.vue'
import AreaPlaceholder from './AreaPlaceholder.vue'
import { publicImageUrl, regionLabel } from '../../data/presentation.js'
import { AREA_REGIONS, areaDescription, areaName, filterAreas, primaryPhoto, sortAreas } from '../../data/protected-areas.js'

const props = defineProps({ areas: { type: Array, default: () => [] }, loading: { type: Boolean, default: false }, error: { type: String, default: '' } })
const emit = defineEmits(['open'])
const { t, language } = useLocale()
const type = ref('ALL'), region = ref('ALL')
const typeKey = { reserve: 'areas.typeReserve', 'national-park': 'areas.typeNationalPark', biosphere: 'areas.typeBiosphere' }
const typeOptions = computed(() => [{ value: 'ALL', label: t('areas.all') }, ...Object.entries(typeKey).map(([value, key]) => ({ value, label: t(key) }))])
const regionOptions = computed(() => [{ value: 'ALL', label: t('areas.allRegions') }, ...AREA_REGIONS.map(value => ({ value, label: regionLabel(value, language.value) }))])
// Territories without a photo go to the bottom so the grid starts with real pictures.
const visible = computed(() => {
  const sorted = sortAreas(filterAreas(props.areas, { type: type.value, region: region.value }), language.value)
  return [...sorted.filter(a => primaryPhoto(a)), ...sorted.filter(a => !primaryPhoto(a))]
})
const isCompact = ref(typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches)
const desktopColumns = ref(3), compactColumns = ref(2)
const columns = computed({
  get: () => isCompact.value ? compactColumns.value : desktopColumns.value,
  set: value => { if (isCompact.value) compactColumns.value = Math.min(2, Math.max(1, Number(value))); else desktopColumns.value = Number(value) },
})
const columnOptions = computed(() => (isCompact.value ? [1, 2] : [1, 2, 3, 4]).map(n => ({ value: n, label: t('catalogUI.inRow', { p0: n }) })))
let query
const onViewport = event => { isCompact.value = event.matches; if (event.matches && compactColumns.value > 2) compactColumns.value = 2 }
onMounted(() => { query = window.matchMedia('(max-width: 767px)'); isCompact.value = query.matches; query.addEventListener?.('change', onViewport) })
onBeforeUnmount(() => query?.removeEventListener?.('change', onViewport))
const hasFilters = computed(() => type.value !== 'ALL' || region.value !== 'ALL')
function reset() { type.value = 'ALL'; region.value = 'ALL' }
</script>

<template>
  <section id="territories" class="catalog page-container territories-view" aria-labelledby="territories-title" tabindex="-1" :aria-busy="loading">
    <div class="catalog-heading">
      <div>
        <p class="eyebrow">{{ t('areas.eyebrow') }}</p>
        <h2 id="territories-title" tabindex="-1">{{ t('areas.title') }}</h2>
      </div>
      <p class="catalog-note">{{ t('areas.note') }}</p>
    </div>
    <div class="catalog-tools">
      <div class="desktop-catalog-filters">
        <GroupFilter v-model="type" :options="typeOptions" :label="t('areas.filterType')" />
        <div class="filter-bar">
          <div class="filter-field">
            <label for="areas-region-filter">{{ t('areas.filterRegion') }}</label>
            <CustomSelect id="areas-region-filter" v-model="region" :options="regionOptions" :label="t('areas.filterRegion')" />
          </div>
          <button type="button" class="catalog-reset" :disabled="!hasFilters" @click="reset">{{ t('ui.m031') }}</button>
        </div>
      </div>
      <div class="compact-catalog-filters">
        <details class="catalog-filter-disclosure">
          <summary><span>{{ t('catalogUI.filters') }}<span v-if="hasFilters" class="filters-active-indicator" aria-hidden="true"></span></span><span class="filter-chevron" aria-hidden="true">⌄</span></summary>
          <div class="compact-filter-fields">
            <div class="filter-field">
              <label for="areas-type-compact">{{ t('areas.filterType') }}</label>
              <CustomSelect id="areas-type-compact" v-model="type" :options="typeOptions" :label="t('areas.filterType')" />
            </div>
            <div class="filter-field">
              <label for="areas-region-compact">{{ t('areas.filterRegion') }}</label>
              <CustomSelect id="areas-region-compact" v-model="region" :options="regionOptions" :label="t('areas.filterRegion')" />
            </div>
            <button type="button" class="catalog-reset" :disabled="!hasFilters" @click="reset">{{ t('ui.m031') }}</button>
          </div>
        </details>
      </div>
    </div>
    <p v-if="error" class="catalog-message" role="alert">{{ t('areas.error') }}</p>
    <p v-else-if="loading" class="catalog-message muras-loading" role="status">{{ t('areas.loading') }}</p>
    <template v-else>
      <div class="catalog-options-row">
        <p class="result-count" role="status" aria-live="polite" aria-atomic="true">{{ t('areas.found', { count: visible.length }) }}</p>
        <div class="catalog-density">
          <label for="areas-columns">{{ t('catalogUI.columns') }}</label>
          <CustomSelect id="areas-columns" v-model="columns" :options="columnOptions" :label="t('catalogUI.columns')" />
        </div>
      </div>
      <p v-if="!visible.length" class="catalog-message catalog-empty">{{ t('areas.empty') }}</p>
      <div v-else class="catalog-grid-viewport"><div class="species-grid catalog-custom-grid" :data-columns="columns" :style="{ '--catalog-columns': columns }">
        <article v-for="area in visible" :key="area.id" class="species-card territory-card">
          <div class="card-image">
            <img v-if="primaryPhoto(area)" :src="publicImageUrl(primaryPhoto(area).path)" :width="primaryPhoto(area).width" :height="primaryPhoto(area).height"
              loading="lazy" decoding="async" :alt="primaryPhoto(area).caption?.[language] || primaryPhoto(area).caption?.ru || areaName(area, language)" />
            <AreaPlaceholder v-else :label="t(typeKey[area.type])" :caption="t('areas.noPhoto')" />
            <div class="card-overlay-meta">
              <span class="card-overlay-group">{{ t(typeKey[area.type]) }}</span>
              <span class="status-badge" data-category="unknown">{{ area.established.year }}</span>
            </div>
          </div>
          <div class="card-body">
            <h3>{{ areaName(area, language) }}</h3>
            <p class="card-description">{{ areaDescription(area, language) }}</p>
            <button type="button" class="card-open" :aria-label="`${t('areas.open')} — ${areaName(area, language)}`" @click="emit('open', area.id)">
              {{ t('areas.open') }} <span aria-hidden="true">↗</span>
            </button>
          </div>
        </article>
      </div></div>
    </template>
  </section>
</template>
