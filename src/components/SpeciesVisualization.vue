<script setup>
import { useLocale } from '../composables/useLocale.js'
import { computed, ref, watch } from 'vue'
import { PLACEHOLDER, publicImageUrl } from '../data/presentation.js'
import { compositionStyle, imageComposition } from '../data/image-composition.js'
import { useImageVisualization } from '../composables/useImageVisualization.js'
import { UNKNOWN_DESATURATION } from '../data/visualization/engine.js'

const { t, uiMessage } = useLocale()

const props = defineProps({ photo: { type: Object, default: null }, name: { type: String, required: true }, populationType: { type: String, default: 'unknown' }, speciesId: { type: String, default: '' }, previewUrl: { type: String, default: null } })
const canvas = ref(null), container = ref(null), failed = ref(false)
const input = computed(() => ({ path: props.previewUrl || (props.photo ? publicImageUrl(props.photo.path) : null),
  composition: imageComposition(props.photo), type: props.populationType, id: props.speciesId }))
const { state, start, restore } = useImageVisualization(canvas, container, input)
const active = computed(() => state.value.mode !== 'photo')
watch(input, () => { failed.value = false })
</script>

<template>
  <div class="species-visualization">
    <figure>
      <div ref="container" class="visualization-frame" :data-mode="state.mode" :data-effect="state.effect">
        <img :class="{ 'visualization-layout': active }" :aria-hidden="active" :style="photo && !failed ? compositionStyle(photo) : {}"
          :src="failed || !photo ? PLACEHOLDER : input.path" :width="photo?.width || 800" :height="photo?.height || 600" decoding="async"
          :alt="photo && !failed ? t('ui.m254', { p0: name }) : t('ui.m079')" @error="failed = true" />
        <canvas ref="canvas" v-show="active" :style="{ filter: state.effect === 'unknown' && state.grayscaleFallback ? `grayscale(${state.amount * UNKNOWN_DESATURATION})` : 'none' }" role="img" :aria-hidden="!active" :aria-label="`${name} — ${state.effect === 'unknown' ? t('ui.m255') : t('ui.m256')}`"> {{ t('ui.m257') }} </canvas>
      </div>
    </figure>
    <button class="visualization-button" type="button" :disabled="!state.ready || failed" :aria-pressed="active" @click="active ? restore() : start()">
      {{ active ? t('ui.m267') : t('ui.m268') }} <span aria-hidden="true">{{ active ? '↗' : '↘' }}</span>
    </button>
    <p class="sr-only">{{ t('ui.m269') }}</p>
    <p v-if="state.loading" class="media-note" role="status">{{ t('ui.m270') }}</p>
    <p v-else-if="!photo" class="media-note" role="status">{{ t('ui.m271') }}</p>
    <p v-else-if="failed || state.error" class="media-note" role="status">{{ uiMessage(state.error) || t('ui.m080') }}</p>
  </div>
</template>

<style scoped>
.visualization-frame { position: relative; width: 100%; aspect-ratio: 4 / 3; min-width: 0; overflow: hidden; box-shadow: inset 0 0 0 1px var(--line); border-radius: 6px; background: #eef1e9; }
.visualization-frame img { display: block; width: 100%; height: 100%; object-fit: cover; }
.visualization-frame .visualization-layout { visibility: hidden; }
.visualization-frame canvas { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
.visualization-button { display: flex; justify-content: space-between; align-items: center; gap: 12px; min-height: 44px; border: 1px solid #839388; border-radius: 5px; background: white; padding: 10px 14px; margin-top: 12px; text-align: left; font-weight: 600; font-size: 15px; }
.visualization-button:not(:disabled):hover { border-color: var(--ink); background: var(--paper); }
.visualization-button:disabled { cursor: default; color: var(--muted); }
</style>
