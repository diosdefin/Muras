<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useLocale } from '../../composables/useLocale.js'
import { availableGroups } from '../../data/species-groups.js'
import { groupLabel, publicImageUrl, regionLabel, speciesPhoto, PLACEHOLDER } from '../../data/presentation.js'

const { t, language } = useLocale()
const props = defineProps({
  species: { type: Array, default: () => [] },
  region: { type: Object, default: null },
  entries: { type: Array, default: () => [] },
})
const emit = defineEmits(['details', 'clear'])
const slide = ref(0)
const paused = ref(false)
const imageFailures = ref({})

const groups = computed(() => availableGroups(props.species))
const largest = computed(() => {
  const counts = new Map()
  for (const item of props.species) counts.set(item.group, (counts.get(item.group) || 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0] || [null, 0]
})
const slides = computed(() => [
  { key: 'records', eyebrow: t('mapPreview.catalog'), value: props.species.length, label: t('mapPreview.records'), detail: t('mapPreview.sourceNote'), ratio: 100 },
  { key: 'groups', eyebrow: t('mapPreview.groups'), value: groups.value.length, label: t('mapPreview.groupsDescription'), detail: t('mapPreview.sourceNote'), ratio: groups.value.length / 8 * 100 },
  { key: 'largest', eyebrow: t('mapPreview.largestGroup'), value: largest.value[1], label: largest.value[0] ? groupLabel({ group: largest.value[0] }, language.value) : t('mapPreview.records'), detail: t('mapPreview.shareOfCatalog', { p0: props.species.length ? Math.round(largest.value[1] / props.species.length * 100) : 0 }), ratio: props.species.length ? largest.value[1] / props.species.length * 100 : 0 },
])
const current = computed(() => slides.value[slide.value] || slides.value[0])
// The regional preview represents every documented group, not just the first two animals.
const regionGroups = computed(() => {
  const bucket = new Map()
  for (const entry of props.entries) {
    const group = entry.species.group
    if (!bucket.has(group)) bucket.set(group, { group, count: 0, representative: entry.species })
    const item = bucket.get(group)
    item.count += 1
    if (!speciesPhoto(item.representative) && speciesPhoto(entry.species)) item.representative = entry.species
  }
  return [...bucket.values()].sort((a, b) => b.count - a.count)
})

function next(direction = 1) { slide.value = (slide.value + direction + slides.value.length) % slides.value.length }
let rotation
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  rotation = window.setInterval(() => {
    if (!props.region && !paused.value && !document.hidden) next()
  }, 6500)
})
onUnmounted(() => window.clearInterval(rotation))
</script>

<template>
  <aside id="map-overview-panel" class="map-overview" :aria-label="region ? regionLabel(region.id, language) : t('mapPreview.catalog')"
    @focusin="paused = true" @focusout="paused = false">
    <Transition name="overview-fade" mode="out-in">
      <div v-if="region" :key="`region-${region.id}`" class="map-overview-content map-region-summary">
        <div class="map-overview-topline">
          <button type="button" class="map-overview-clear" :aria-label="t('mapPreview.clear')" @click="emit('clear')"><svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.65" aria-hidden="true"><path d="M5 5 15 15M15 5 5 15" stroke-linecap="round"/></svg></button>
        </div>
        <h3>{{ regionLabel(region.id, language) }}</h3>
        <p v-if="entries.length" class="map-region-count" role="status">{{ t('mapPreview.regionRecords', { p0: entries.length }) }}</p>
        <p v-else class="map-region-empty" role="status">{{ t('mapPreview.regionNoData') }}</p>
        <div v-if="regionGroups.length" class="map-region-gallery" :aria-label="t('mapPreview.groups')">
          <div v-for="item in regionGroups" :key="item.group" class="map-region-thumb">
            <div class="map-region-avatar">
              <img :src="imageFailures[item.group] ? PLACEHOLDER : publicImageUrl(speciesPhoto(item.representative)?.path)"
                :alt="groupLabel({ group: item.group }, language)" width="60" height="60" loading="lazy" decoding="async"
                @error="imageFailures[item.group] = true" />
              <span class="map-region-badge" :aria-label="String(item.count)">{{ item.count }}</span>
            </div>
            <span>{{ groupLabel({ group: item.group }, language) }}</span>
          </div>
        </div>
        <button type="button" class="map-overview-action" @click="emit('details')">{{ t('mapPreview.details') }} <span aria-hidden="true">↗</span></button>
      </div>
      <div v-else :key="current.key" class="map-overview-content map-fact-slide" aria-live="off">
        <p class="map-overview-eyebrow">{{ current.eyebrow }}</p>
        <div class="map-fact-number">{{ current.value }}</div>
        <h3>{{ current.label }}</h3>
        <div class="map-fact-track" aria-hidden="true"><span :style="{ width: `${Math.min(100, current.ratio)}%` }"></span></div>
        <p class="map-fact-description">{{ current.detail }}</p>
      </div>
    </Transition>
    <div v-if="!region" class="map-fact-controls">
      <span class="map-fact-dots" aria-hidden="true"><i v-for="(_, index) in slides" :key="index" :class="{ active: slide === index }"></i></span>
      <div class="map-fact-arrows">
        <button type="button" :aria-label="t('mapPreview.slidePrevious')" @click="next(-1)">←</button>
        <button type="button" :aria-label="t('mapPreview.slideNext')" @click="next(1)">→</button>
      </div>
    </div>
  </aside>
</template>
