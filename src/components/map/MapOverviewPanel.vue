<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useLocale } from '../../composables/useLocale.js'
import { availableGroups } from '../../data/species-groups.js'
import { groupLabel, publicImageUrl, regionLabel, speciesName, speciesPhoto, PLACEHOLDER } from '../../data/presentation.js'

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
const previewEntries = computed(() => props.entries.slice(0, 4))

function next(direction = 1) { slide.value = (slide.value + direction + slides.value.length) % slides.value.length }
let rotation
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  rotation = window.setInterval(() => {
    if (!props.region && !paused.value && !document.hidden) next()
  }, 7000)
})
onUnmounted(() => window.clearInterval(rotation))
</script>

<template>
  <aside id="map-overview-panel" class="map-overview" :aria-label="region ? regionLabel(region.id, language) : t('mapPreview.catalog')"
    @focusin="paused = true" @focusout="paused = false">
    <Transition name="overview-fade" mode="out-in">
      <div v-if="region" :key="`region-${region.id}`" class="map-overview-content map-region-summary">
        <div class="map-overview-topline">
          <p class="map-overview-eyebrow">{{ t('mapPreview.regionSubtitle') }}</p>
          <button type="button" class="map-overview-clear" :aria-label="t('mapPreview.clear')" @click="emit('clear')">×</button>
        </div>
        <h3>{{ regionLabel(region.id, language) }}</h3>
        <p v-if="entries.length" class="map-region-count" role="status">{{ t('mapPreview.regionRecords', { p0: entries.length }) }}</p>
        <p v-else class="map-region-empty" role="status">{{ t('mapPreview.regionNoData') }}</p>
        <div v-if="previewEntries.length" class="map-region-gallery" :aria-label="t('mapPreview.photoSources')">
          <div v-for="entry in previewEntries" :key="entry.species.id" class="map-region-thumb">
            <img :src="imageFailures[entry.species.id] ? PLACEHOLDER : publicImageUrl(speciesPhoto(entry.species)?.path)" :alt="speciesName(entry.species, language)"
              width="58" height="58" loading="lazy" decoding="async" @error="imageFailures[entry.species.id] = true" />
            <span>{{ speciesName(entry.species, language) }}</span>
          </div>
        </div>
        <div v-if="previewEntries.some(entry => speciesPhoto(entry.species))" class="map-overview-credits">
          <span>{{ t('mapPreview.photoSources') }}:</span>
          <template v-for="entry in previewEntries" :key="entry.species.id">
            <a v-if="speciesPhoto(entry.species)" :href="speciesPhoto(entry.species).originalPage" target="_blank" rel="noopener noreferrer">{{ speciesPhoto(entry.species).author }} · {{ speciesPhoto(entry.species).license }}</a>
          </template>
        </div>
        <p class="map-region-review">{{ t('mapPreview.regionReview') }}</p>
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
