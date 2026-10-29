<script setup>
import { useLocale } from '../composables/useLocale.js'
import { computed, ref, watch } from 'vue'
import { PLACEHOLDER, publicImageUrl } from '../data/presentation.js'
import { compositionStyle, imageComposition } from '../data/image-composition.js'
import { usePopulationPresentation } from '../composables/usePopulationPresentation.js'
import { useImageVisualization } from '../composables/useImageVisualization.js'
import { ANIMATION_DURATION } from '../data/visualization/engine.js'
import PopulationInfo from './PopulationInfo.vue'

const { t, language, uiMessage } = useLocale()
const props = defineProps({ photo: { type: Object, default: null }, name: { type: String, required: true },
  population: { type: Object, default: null }, sources: { type: Array, default: () => [] },
  populationPublication: { type: Object, default: null }, scientificName: { type: String, default: '' }, taxonIds: { type: Array, default: () => [] }, speciesId: { type: String, default: '' }, previewUrl: { type: String, default: null } })
const canvas = ref(null), container = ref(null), failed = ref(false), active = ref(false)
// The same validated adapter serves local JSON and future REST records; a type string is not approval.
const presentation = usePopulationPresentation(props, language)
const known = computed(() => presentation.value.type !== 'unknown')
const input = computed(() => ({ path: props.previewUrl || (props.photo ? publicImageUrl(props.photo.path) : null),
  composition: imageComposition(props.photo), type: presentation.value.type, id: props.speciesId, estimateKey: presentation.value.candidateFingerprint || '' }))
const { state, start, restore } = useImageVisualization(canvas, container, input)
const canvasVisible = computed(() => active.value && known.value && state.value.mode !== 'photo' && !state.value.error)
function reset() { active.value = false; restore() }
function toggle() {
  if (active.value) { reset(); return }
  if (!props.photo || failed.value) return
  active.value = true
  if (known.value && !start()) active.value = false
}
function imageFailed() { failed.value = true; reset() }
watch(input, (value, previous) => {
  if (value.path !== previous?.path || value.id !== previous?.id || value.type !== previous?.type || value.estimateKey !== previous?.estimateKey) { failed.value = false; reset() }
})
watch(() => state.value.error, value => { if (value) active.value = false })
</script>

<template>
  <div class="species-visualization">
    <figure>
      <div ref="container" class="visualization-frame" :data-mode="active ? (known ? state.mode : 'active') : 'photo'" :data-effect="presentation.type">
        <img :key="`${speciesId}:${failed ? PLACEHOLDER : input.path}:${presentation.type}`" :class="{ 'visualization-layout': canvasVisible, 'visualization-unknown': active && !known }" :aria-hidden="canvasVisible"
          :style="{ ...(photo && !failed ? compositionStyle(photo) : {}), '--visualization-duration': `${ANIMATION_DURATION}ms` }"
          :src="failed || !photo ? PLACEHOLDER : input.path" :width="photo?.width || 800" :height="photo?.height || 600" decoding="async"
          :alt="photo && !failed ? t('ui.m254', { p0: name }) : t('ui.m079')" @error="imageFailed" />
        <canvas v-if="known && photo && !failed" ref="canvas" v-show="canvasVisible" width="0" height="0" role="img"
          :aria-hidden="!canvasVisible" :aria-label="`${name} — ${t('ui.m256')}`">{{ t('ui.m257') }}</canvas>
      </div>
    </figure>
    <button class="visualization-button" type="button" :disabled="!photo || failed" :aria-pressed="active" @click="toggle">
      {{ active ? t('visualization.restore') : t('visualization.start') }} <span aria-hidden="true">{{ active ? '↗' : '↘' }}</span>
    </button>
    <div v-if="active || (!photo && known && presentation.publicationMode === 'source-documented')" class="visualization-explanation" aria-live="polite">
      <template v-if="known">
        <p v-if="active" class="media-note">{{ t('ui.m269') }}</p>
        <PopulationInfo :population="population" :sources="sources" :population-publication="populationPublication" :species-id="speciesId" :scientific-name="scientificName" :taxon-ids="taxonIds" />
      </template>
      <p v-else class="media-note visualization-unknown-label">{{ t('visualization.unknown') }}</p>
    </div>
    <p v-if="state.loading" class="media-note" role="status">{{ t('ui.m270') }}</p>
    <p v-else-if="!photo" class="media-note" role="status">{{ t('ui.m271') }}</p>
    <p v-else-if="failed || state.error" class="media-note" role="status">{{ uiMessage(state.error) || t('ui.m080') }}</p>
  </div>
</template>

<style scoped>
.visualization-frame { position: relative; width: 100%; aspect-ratio: 4 / 3; min-width: 0; overflow: hidden; box-shadow: inset 0 0 0 1px var(--line); border-radius: 6px; background: #eef1e9; }
.visualization-frame img { display: block; width: 100%; height: 100%; object-fit: cover; filter: grayscale(0); transition: filter var(--visualization-duration, 900ms) ease; }
.visualization-frame img.visualization-unknown { filter: grayscale(1); }
.visualization-frame .visualization-layout { visibility: hidden; }
.visualization-frame canvas { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
.visualization-button { display: flex; justify-content: space-between; align-items: center; gap: 12px; min-height: 44px; max-width: 100%; border: 1px solid #839388; border-radius: 5px; background: white; padding: 10px 14px; margin-top: 12px; text-align: left; font-weight: 600; font-size: 15px; }
.visualization-button:not(:disabled):hover { border-color: var(--ink); background: var(--paper); }
.visualization-button:disabled { cursor: default; color: var(--muted); }
@media (prefers-reduced-motion: reduce) { .visualization-frame img { transition: none; } }
</style>
