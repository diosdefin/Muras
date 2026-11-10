<script setup>
import ErrorNotice from '../ErrorNotice.vue'
import { useLocale } from '../../composables/useLocale.js'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import RegionMap from './RegionMap.vue'
import RegionPanel from './RegionPanel.vue'
import MapOverviewPanel from './MapOverviewPanel.vue'
import { REGIONS, regionalEntries, validateMapGeometry, validateRegionalEvidence } from '../../data/geography/model.js'
import './map.css'

const { t } = useLocale()

const props = defineProps({ species: { type: Array, default: () => [] }, loading: { type: Boolean, default: false }, error: { type: String, default: '' }, mode: { type: String, default: 'full' }, routeRegion: { type: String, default: '' } })
const emit = defineEmits(['open', 'details', 'regionchange'])
const geometry = ref(null), evidence = ref(null), loadingMap = ref(true), loadError = ref('')
const selected = ref(''), group = ref('ALL')
const mobilePreviewSlide = ref('map')
const region = computed(() => REGIONS.find(r => r.id === selected.value) || null)
const validationError = computed(() => !props.loading && evidence.value ? validateRegionalEvidence(evidence.value, props.species)[0] || '' : '')
const errorMessage = computed(() => props.error || loadError.value || validationError.value)
const entries = computed(() => errorMessage.value ? [] : regionalEntries(evidence.value, props.species, selected.value, group.value))
const unfilteredCount = computed(() => regionalEntries(evidence.value, props.species, selected.value).length)
watch(() => props.routeRegion, id => {
  if (props.mode === 'full') selected.value = REGIONS.some(region => region.id === id) ? id : ''
}, { immediate: true })
function selectRegion(id) {
  selected.value = selected.value === id ? '' : id
  if (props.mode === 'full') emit('regionchange', selected.value)
  else if (selected.value) mobilePreviewSlide.value = 'info'
}
function dismissPreview() { selected.value = ''; mobilePreviewSlide.value = 'map' }
const local = file => `${import.meta.env.BASE_URL}data/geography/${file}`
async function reset() {
  selected.value = ''; group.value = 'ALL'; emit('regionchange', '')
  await nextTick()
  document.getElementById('map-region-select')?.focus({ preventScroll: true })
}
onMounted(async () => {
  try {
    const [map, records] = await Promise.all(['map.json', 'occurrences.json'].map(async file => {
      const response = await fetch(local(file))
      if (!response.ok) throw new Error(`HTTP ${response.status}: data/geography/${file}`)
      return response.json()
    }))
    const errors = validateMapGeometry(map)
    if (errors.length) throw new Error(errors[0])
    geometry.value = map; evidence.value = records
  } catch (error) { loadError.value = error.message }
  finally { loadingMap.value = false }
})
</script>

<template>
  <section id="map" class="map-section page-container" :class="{ 'map-preview': mode === 'preview', 'map-full': mode === 'full' }" aria-labelledby="map-title" tabindex="-1" :aria-busy="loadingMap || loading">
    <div class="map-section-heading">
      <div><p class="eyebrow"><span class="red-rule" aria-hidden="true"></span> {{ t('ui.m109') }}</p><h2 id="map-title" tabindex="-1">{{ t('ui.m110') }}</h2></div>
      <p>{{ t('ui.m111') }}</p>
    </div>
    <p v-if="loadingMap || loading" class="catalog-message" role="status">{{ t('ui.m112') }}</p>
    <ErrorNotice v-else-if="errorMessage" :message="errorMessage"></ErrorNotice>
    <div v-else class="map-layout" :class="{ 'map-mobile-show-info': mode === 'preview' && mobilePreviewSlide === 'info', 'map-mobile-show-map': mode === 'preview' && mobilePreviewSlide === 'map' }">
      <RegionMap :geometry="geometry" :selected="selected" :preview="mode === 'preview'" :panel-id="mode === 'preview' ? 'map-overview-panel' : 'map-region-panel'" @select="selectRegion" />
      <MapOverviewPanel v-if="mode === 'preview'" :species="species" :region="region" :entries="regionalEntries(evidence, species, selected)" @clear="dismissPreview" @details="emit('details', selected)" />
      <RegionPanel v-else :species="species" :region="region" :entries="entries" :group="group" :unfiltered-count="unfilteredCount" @group="group = $event" @reset="reset" @open="emit('open', $event)" />
    </div>
    <div v-if="mode === 'preview' && !loadingMap && !errorMessage" class="map-mobile-pager" role="group" :aria-label="t('mapUI.pager')">
      <button type="button" :aria-label="t('mapUI.map')" :aria-pressed="mobilePreviewSlide === 'map'" @click="mobilePreviewSlide = 'map'"></button>
      <button type="button" :aria-label="t('mapUI.details')" :aria-pressed="mobilePreviewSlide === 'info'" @click="mobilePreviewSlide = 'info'"></button>
    </div>
    <div v-if="mode === 'preview' && !loadingMap && !errorMessage" class="map-provenance map-provenance-compact">
      {{ t('mapPreview.mapAttribution') }} <a href="https://www.geoboundaries.org/api/current/gbOpen/KGZ/ADM1/" target="_blank" rel="noopener noreferrer">geoBoundaries</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> · <a :href="local('ODbL-1.0.txt')">ODbL 1.0</a>.
    </div>
    <div v-else-if="mode === 'full'" class="map-provenance">
      <p>{{ t('ui.m114') }} <a href="https://www.geoboundaries.org/api/current/gbOpen/KGZ/ADM1/" target="_blank" rel="noopener noreferrer">geoBoundaries · gbOpen KGZ ADM1<span class="sr-only"> {{ t('ui.m107') }}</span></a>{{ t('ui.m115') }} <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors<span class="sr-only"> {{ t('ui.m107') }}</span></a> {{ t('ui.m116') }} <a :href="local('ODbL-1.0.txt')">ODbL 1.0</a> · <a :href="local('regions.geojson')" download>{{ t('ui.m117') }}</a> · <a :href="local('map.json')" download>{{ t('ui.m118') }}</a> · <a :href="local('metadata.json')">{{ t('ui.m119') }}</a>.</p>
      <p>{{ t('ui.m120') }}</p>
    </div>
  </section>
</template>
