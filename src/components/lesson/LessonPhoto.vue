<script setup>
import ScientificText from "../ScientificText.vue"
import { useLocale } from '../../composables/useLocale.js'
import { computed, ref, watch } from 'vue'
import { PLACEHOLDER, publicImageUrl, speciesName, speciesPhoto } from '../../data/presentation.js'
import { compositionStyle } from '../../data/image-composition.js'

const { t, language } = useLocale()

const props = defineProps({ species: { type: Object, required: true } })
const photo = computed(() => speciesPhoto(props.species))
const failed = ref(false)
watch(() => props.species.id, () => { failed.value = false })
</script>

<template>
  <figure class="lesson-photo">
    <div v-if="photo?.compositions?.lesson && !failed" class="lesson-composed-frame"><img :src="publicImageUrl(photo.path)" :style="compositionStyle(photo, 'lesson')" :alt="speciesName(species, language)" :width="photo.width" :height="photo.height" decoding="async" @error="failed = true" /></div>
    <img v-else :src="photo && !failed ? publicImageUrl(photo.path) : PLACEHOLDER"
      :alt="photo && !failed ? t('ui.m078', { p0: speciesName(species, language) }) : t('ui.m079')"
      :width="photo?.width || 800" :height="photo?.height || 600" decoding="async" @error="failed = true" />
    <figcaption>
      <p v-if="!photo || failed" role="status">{{ failed ? t('ui.m080') : t('ui.m081') }}</p>
      <p v-if="photo?.caption"><ScientificText :value="photo.caption" /></p>
      <p v-if="photo" class="lesson-photo-links">{{ t('ui.m082') }} {{ photo.author }}.
        <a :href="photo.originalPage" target="_blank" rel="noopener noreferrer">{{ t('ui.m083') }}<span class="sr-only"> {{ t('ui.m084') }}</span></a>
        <a :href="photo.licenseUrl" target="_blank" rel="noopener noreferrer">{{ photo.license }}<span class="sr-only"> {{ t('ui.m085') }}</span></a>
      </p>
    </figcaption>
  </figure>
</template>

<style scoped>
.lesson-composed-frame { width: 100%; aspect-ratio: 4 / 3; overflow: hidden; border-radius: 6px; }
.lesson-composed-frame img { width: 100%; height: 100%; object-fit: cover; }
</style>
