<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import RegionMap from './RegionMap.vue'
import RegionPanel from './RegionPanel.vue'
import { REGIONS, regionalEntries, validateMapGeometry, validateRegionalEvidence } from '../../data/geography/model.js'
import './map.css'
const props = defineProps({ species: { type: Array, default: () => [] }, loading: { type: Boolean, default: false }, error: { type: String, default: '' } })
const emit = defineEmits(['open'])
const geometry = ref(null), evidence = ref(null), loadingMap = ref(true), loadError = ref('')
const selected = ref(''), group = ref('ALL')
const region = computed(() => REGIONS.find(r => r.id === selected.value) || null)
const validationError = computed(() => !props.loading && evidence.value ? validateRegionalEvidence(evidence.value, props.species)[0] || '' : '')
const errorMessage = computed(() => props.error || loadError.value || validationError.value)
const entries = computed(() => errorMessage.value ? [] : regionalEntries(evidence.value, props.species, selected.value, group.value))
const unfilteredCount = computed(() => regionalEntries(evidence.value, props.species, selected.value).length)
const local = file => `${import.meta.env.BASE_URL}data/geography/${file}`
async function reset() {
  selected.value = ''; group.value = 'ALL'
  await nextTick()
  document.getElementById('map-region-select')?.focus({ preventScroll: true })
}
onMounted(async () => {
  try {
    const [map, records] = await Promise.all(['map.json', 'occurrences.json'].map(async file => {
      const response = await fetch(local(file))
      if (!response.ok) throw new Error(`Не удалось загрузить ${file}: ${response.status}`)
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
  <section id="map" class="map-section page-container" aria-labelledby="map-title" tabindex="-1" :aria-busy="loadingMap || loading">
    <div class="map-section-heading">
      <div><p class="eyebrow"><span class="red-rule" aria-hidden="true"></span> География природного наследия</p><h2 id="map-title">Семь областей. Одна природа.</h2></div>
      <p>На карте — опубликованные региональные свидетельства, а не полные ареалы видов.</p>
    </div>
    <p v-if="loadingMap || loading" class="catalog-message" role="status">Загружаем локальную карту…</p>
    <p v-else-if="errorMessage" class="catalog-message error-message" role="alert">Карта недоступна: {{ errorMessage }}</p>
    <div v-else class="map-layout">
      <RegionMap :geometry="geometry" :selected="selected" @select="selected = $event" />
      <RegionPanel :region="region" :entries="entries" :group="group" :unfiltered-count="unfilteredCount" @group="group = $event" @reset="reset" @open="emit('open', $event)" />
    </div>
    <div class="map-provenance">
      <p>Границы: <a href="https://www.geoboundaries.org/api/current/gbOpen/KGZ/ADM1/" target="_blank" rel="noopener noreferrer">geoBoundaries · gbOpen KGZ ADM1<span class="sr-only"> (новая вкладка)</span></a>, состояние на 2017 год.
        © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors<span class="sr-only"> (новая вкладка)</span></a> · Wambacher.
        Данные доступны по <a :href="local('ODbL-1.0.txt')">ODbL 1.0</a> · <a :href="local('regions.geojson')" download>Скачать GeoJSON</a> · <a :href="local('map.json')" download>SVG-геометрия</a> · <a :href="local('metadata.json')">Метаданные</a>.</p>
      <p>Бишкек и Ош — города республиканского значения; отдельных городских полигонов в этом наборе нет. Для остальных видов область пока не уточнена. Точные местонахождения не публикуются.</p>
    </div>
  </section>
</template>
