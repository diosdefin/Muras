<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { PLACEHOLDER, publicImageUrl } from '../data/presentation.js'
import { useImageVisualization } from '../composables/useImageVisualization.js'
const props = defineProps({ photo: { type: Object, default: null }, name: { type: String, required: true } })
const canvas = ref(null), container = ref(null), startButton = ref(null), slider = ref(null), failed = ref(false)
const path = computed(() => props.photo ? publicImageUrl(props.photo.path) : null)
const { state, start, setDetail, restore } = useImageVisualization(canvas, container, path)
const active = computed(() => state.value.mode !== 'photo')
const displayedDetail = computed(() => Math.round(state.value.detail))
watch(path, () => { failed.value = false })
watch(() => state.value.restorationCount, async count => {
  if (!count) return
  await nextTick(); startButton.value?.focus({ preventScroll: true })
})
async function begin() {
  if (!start()) return
  await nextTick(); slider.value?.focus({ preventScroll: true })
}
</script>

<template>
  <div class="species-visualization">
    <figure>
      <div ref="container" class="visualization-frame" :data-mode="state.mode">
        <img :class="{ 'visualization-layout': active }" :aria-hidden="active" :src="failed || !photo ? PLACEHOLDER : path" :width="photo?.width || 800" :height="photo?.height || 600" decoding="async"
          :alt="photo && !failed ? `${name} — чёткая фотография` : 'Условный горный пейзаж; фотография вида недоступна'" @error="failed = true" />
        <canvas ref="canvas" v-show="active" role="img" :aria-hidden="!active" :aria-label="`${name} — ${displayedDetail < 100 ? 'условная пикселизация' : 'чёткая фотография'}, детализация ${displayedDetail}%`">
          Условная визуализация фотографии. Вернитесь к обычному изображению кнопкой восстановления.
        </canvas>
      </div>
      <figcaption>{{ photo && !failed ? 'Полный кадр · фотография вида' : 'Условная иллюстрация · не фотография вида' }}</figcaption>
    </figure>
    <div class="visualization-intro">
      <p class="eyebrow">Образ утраты</p>
      <h3>Как исчезает вид</h3>
      <p>Когда детали исчезают, знакомый образ труднее узнать. Это символ утраты, а не прогноз. Восстановите фотографию и изучите угрозы и меры охраны в записи.</p>
    </div>
    <button v-if="!active" ref="startButton" class="visualization-button" type="button" :disabled="!state.ready || failed" aria-controls="visualization-controls" @click="begin">Увидеть, как исчезает вид <span aria-hidden="true">↘</span></button>
    <div v-show="active" id="visualization-controls" class="pixel-control">
      <label for="detail-slider">Детализация изображения</label>
      <p class="detail-value">Детализация: <output for="detail-slider">{{ displayedDetail }}%</output></p>
      <input id="detail-slider" ref="slider" :value="displayedDetail" type="range" min="0" max="100" step="1"
        :aria-valuetext="`${displayedDetail}% детализации; условный эффект`" aria-describedby="pixel-note" @input="setDetail($event.target.value)" />
      <div class="range-endpoints" aria-hidden="true"><span>Образ теряется</span><span>Чёткая фотография</span></div>
      <button type="button" class="visualization-button visualization-restore" :disabled="state.mode === 'restoring'" @click="restore">{{ state.mode === 'restoring' ? 'Восстанавливаем изображение…' : 'Восстановить изображение' }} <span aria-hidden="true">↗</span></button>
    </div>
    <p id="pixel-note" class="media-note">Условная образовательная визуализация. Не отражает фактическую численность вида.</p>
    <p v-if="state.loading" class="media-note" role="status">Загружаем фотографию…</p>
    <p v-else-if="!photo" class="media-note" role="status">Фото не опубликовано: лицензия не подтверждена. Для интерактива нужна разрешённая фотография.</p>
    <p v-else-if="state.error" class="media-note" role="status">{{ state.error }}</p>
    <p v-else-if="state.restorationCount && !active" class="media-note" role="status">Исходная чёткость восстановлена. Можно повторить демонстрацию.</p>
  </div>
</template>

<style scoped>
.visualization-frame { position: relative; width: 100%; min-width: 0; overflow: hidden; border: 1px solid var(--line); border-radius: 6px; background: #eef1e9; }
.visualization-frame img { display: block; width: 100%; height: auto; max-height: min(60vh, 600px); object-fit: contain; }
.visualization-frame .visualization-layout { visibility: hidden; }
.visualization-frame canvas { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
.visualization-intro { margin-top: 24px; }
.visualization-intro .eyebrow { font-size: 12px; }
.visualization-intro h3 { font-family: Georgia, 'Times New Roman', serif; font-size: 28px; line-height: 1.2; font-weight: 400; margin-block: 10px 12px; }
.visualization-intro > p:last-child { color: var(--muted); font-size: 15px; line-height: 1.75; }
.visualization-button { display: flex; justify-content: space-between; align-items: center; gap: 12px; width: 100%; min-height: 48px; border: 1px solid #839388; border-radius: 5px; background: white; padding: 12px 14px; margin-top: 20px; text-align: left; font-weight: 600; font-size: 15px; }
.visualization-button:not(:disabled):hover { border-color: var(--ink); background: var(--paper); }
.visualization-button:disabled { cursor: default; color: var(--muted); }
.visualization-restore { margin-top: 16px; }
</style>
