<script setup>
import ScientificText from './ScientificText.vue'
import { useLocale } from '../composables/useLocale.js'
import { computed, ref, watch } from 'vue'
import { compositionStyle } from '../data/image-composition.js'
import { groupLabel, publicImageUrl, speciesName, speciesPhoto, statusDetails } from '../data/presentation.js'

const { t, language } = useLocale()

const props = defineProps({ species: { type: Object, required: true } })
const emit = defineEmits(['open'])
const imageFailed = ref(false)
const photo = computed(() => speciesPhoto(props.species))
const imagePath = computed(() => publicImageUrl(photo.value?.path))
const status = computed(() => statusDetails(props.species, language.value))
const iucnCode = computed(() => props.species.iucn?.category)
watch(imagePath, () => { imageFailed.value = false })
</script>

<template>
  <article class="species-card">
    <div class="card-image">
      <img v-if="!imageFailed" :src="imagePath" :style="compositionStyle(photo, 'card')"
        :width="photo?.width || 800" :height="photo?.height || 600" loading="lazy" decoding="async"
        :alt="photo ? t('ui.m078', { p0: speciesName(species, language) }) : t('ui.m227')"
        @error="imageFailed = true" />
      <p v-else class="image-fallback">{{ t('ui.m228') }}</p>
      <div class="card-overlay-meta">
        <span class="card-overlay-group">{{ groupLabel(species, language) }}</span>
        <span class="status-badge" :data-category="iucnCode || 'unknown'" :title="status.label"
          :aria-label="status.label">{{ iucnCode ? `IUCN ${iucnCode}` : t('status.unknown') }}</span>
      </div>
    </div>
    <div class="card-body">
      <h3>{{ speciesName(species, language) }}</h3>
      <p class="card-description"><ScientificText :value="species.habitat?.description" /></p>
      <button type="button" class="card-open"
        :aria-label="`${t('ui.m232')} — ${t('ui.m125', { p0: speciesName(species, language) })}`"
        aria-haspopup="dialog" @click="emit('open', species)">
        {{ t('ui.m232') }} <span aria-hidden="true">↗</span>
      </button>
    </div>
  </article>
</template>

<style scoped>
/* Only catalogue cards are restyled. Scientific sources and photo licence links remain in SpeciesModal. */
.species-card {
  overflow: hidden;
  border-radius: 12px;
}
.species-card .card-image {
  border-radius: 11px 11px 0 0;
  isolation: isolate;
}
.card-overlay-meta {
  position: absolute;
  z-index: 1;
  top: 10px;
  right: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  pointer-events: none;
}
.card-overlay-group,
.card-overlay-meta .status-badge {
  display: inline-block;
  width: auto;
  max-width: 100%;
  margin: 0;
  padding: 4px 8px;
  border: 1px solid rgb(255 255 255 / 55%);
  border-radius: 6px;
  background: rgb(255 255 255 / 88%);
  box-shadow: 0 2px 8px rgb(26 44 35 / 9%);
  color: var(--ink);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.3;
  text-align: right;
  text-wrap: pretty;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}
.card-overlay-meta .status-badge[data-category="NT"],
.card-overlay-meta .status-badge[data-category="VU"] {
  background: rgb(252 243 221 / 93%);
  color: #66451b;
}
.card-overlay-meta .status-badge[data-category="EN"],
.card-overlay-meta .status-badge[data-category="CR"] {
  background: rgb(255 235 227 / 94%);
  color: #802c28;
}
.species-card .card-body {
  padding: 15px 16px 12px;
}
.species-card .card-body h3 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(22px, 2vw, 26px);
  font-weight: 400;
  line-height: 1.18;
  letter-spacing: -.012em;
  /* Long species names cannot force a tall card. The full name is available in the dialog. */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}
.species-card .card-description {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
  min-height: 0;
  margin: 11px 0 15px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.55;
}
.species-card .card-open {
  border-top: 1px solid var(--line);
  padding: 9px 1px 0;
  min-height: 46px;
  font-size: 14px;
  gap: 10px;
}
.species-card .card-open::after {
  border-radius: 12px;
}
@media (min-width: 1024px) and (max-width: 1150px) {
  .species-card .card-body { padding-inline: 12px; }
  .species-card .card-body h3 { font-size: 21px; }
}
@media (max-width: 639px) {
  .species-card .card-body { padding: 14px 16px 12px; }
  .species-card .card-body h3 { font-size: 25px; }
  .card-overlay-group, .card-overlay-meta .status-badge { font-size: 12px; }
}
@media (forced-colors: active) {
  .card-overlay-group, .card-overlay-meta .status-badge { border: 1px solid CanvasText; background: Canvas; color: CanvasText; backdrop-filter: none; }
}
</style>
