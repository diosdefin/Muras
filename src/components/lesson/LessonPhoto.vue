<script setup>
import ScientificText from "../ScientificText.vue"
import { useLocale } from '../../composables/useLocale.js'
import { computed, ref, watch } from 'vue'
import { PLACEHOLDER, publicImageUrl, speciesName, speciesPhoto } from '../../data/presentation.js'

const { t, language } = useLocale()

const props = defineProps({ species: { type: Object, required: true } })
const photo = computed(() => speciesPhoto(props.species))
const failed = ref(false)
watch(() => props.species.id, () => { failed.value = false })
</script>

<template>
  <figure class="lesson-photo">
    <img :src="photo && !failed ? publicImageUrl(photo.path) : PLACEHOLDER"
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
