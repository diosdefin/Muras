<script setup>
import { computed, ref, watch } from 'vue'
import { PLACEHOLDER, publicImageUrl } from '../data/presentation.js'
import { compositionStyle, imageComposition } from '../data/image-composition.js'
import { useImageVisualization } from '../composables/useImageVisualization.js'
const props = defineProps({ photo: { type: Object, default: null }, name: { type: String, required: true }, populationType: { type: String, default: 'unknown' }, speciesId: { type: String, default: '' } })
const canvas = ref(null), container = ref(null), failed = ref(false)
const input = computed(() => ({ path: props.photo ? publicImageUrl(props.photo.path) : null,
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
          :alt="photo && !failed ? `${name} — чёткая цветная фотография` : 'Условный горный пейзаж; фотография вида недоступна'" @error="failed = true" />
        <canvas ref="canvas" v-show="active" :style="{ filter: state.effect === 'unknown' && state.grayscaleFallback ? `grayscale(${state.amount})` : 'none' }" role="img" :aria-hidden="!active" :aria-label="`${name} — ${state.effect === 'unknown' ? 'символическое чёрно-белое изображение без потери детализации' : 'условная пикселизация, не подсчёт особей'}`">
          Условная визуализация фотографии. Можно вернуться к чёткому цветному изображению.
        </canvas>
      </div>
      <figcaption>{{ photo && !failed ? 'Фотография вида · редакционная композиция кадра' : 'Условная иллюстрация · не фотография вида' }}<template v-if="active"> · {{ state.effect === 'unknown' ? 'условный чёрно-белый эффект' : 'условная пикселизация' }}</template></figcaption>
    </figure>
    <div class="visualization-intro">
      <p class="eyebrow">Образ и научные данные</p>
      <h3>{{ state.effect === 'unknown' ? 'Когда данных недостаточно' : 'Как исчезает вид' }}</h3>
      <p v-if="state.effect === 'unknown'">Цвет исчезает как символ пробела в знаниях. Детали фотографии сохраняются. Отсутствие подтверждённой оценки не означает исчезновение вида.</p>
      <p v-else>Потеря деталей — художественный образ уязвимости природы, а не прогноз. Пиксели не обозначают особей; научная оценка приведена отдельно.</p>
    </div>
    <button class="visualization-button" type="button" :disabled="!state.ready || failed" :aria-pressed="active" @click="active ? restore() : start()">
      {{ active ? 'Показать чётко' : 'Показать визуализацию' }} <span aria-hidden="true">{{ active ? '↗' : '↘' }}</span>
    </button>
    <p class="media-note">Условная образовательная визуализация. Не отражает фактическую численность вида.</p>
    <p v-if="state.loading" class="media-note" role="status">Загружаем фотографию…</p>
    <p v-else-if="!photo" class="media-note" role="status">Фото не опубликовано: лицензия не подтверждена. Для визуализации нужна разрешённая фотография.</p>
    <p v-else-if="failed || state.error" class="media-note" role="status">{{ state.error || 'Фотография недоступна.' }}</p>
  </div>
</template>

<style scoped>
.visualization-frame { position: relative; width: 100%; aspect-ratio: 4 / 3; min-width: 0; overflow: hidden; box-shadow: inset 0 0 0 1px var(--line); border-radius: 6px; background: #eef1e9; }
.visualization-frame img { display: block; width: 100%; height: 100%; object-fit: cover; }
.visualization-frame .visualization-layout { visibility: hidden; }
.visualization-frame canvas { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
.visualization-intro { margin-top: 20px; }
.visualization-intro .eyebrow { font-size: 12px; }
.visualization-intro h3 { font-family: Georgia, 'Times New Roman', serif; font-size: 26px; line-height: 1.2; font-weight: 400; margin-block: 10px 12px; }
.visualization-intro > p:last-child { color: var(--muted); font-size: 15px; line-height: 1.75; }
.visualization-button { display: flex; justify-content: space-between; align-items: center; gap: 12px; min-height: 44px; border: 1px solid #839388; border-radius: 5px; background: white; padding: 10px 14px; margin-top: 16px; text-align: left; font-weight: 600; font-size: 15px; }
.visualization-button:not(:disabled):hover { border-color: var(--ink); background: var(--paper); }
.visualization-button:disabled { cursor: default; color: var(--muted); }
</style>
