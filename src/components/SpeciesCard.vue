<script setup>
import ScientificText from "./ScientificText.vue"
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
watch(imagePath, () => { imageFailed.value = false })
</script>

<template>
  <article class="species-card">
    <div class="card-image">
      <img v-if="!imageFailed" :src="imagePath" :style="compositionStyle(photo, 'card')" :width="photo?.width || 800" :height="photo?.height || 600" loading="lazy" decoding="async"
        :alt="photo ? t('ui.m078', { p0: speciesName(species, language) }) : t('ui.m227')"
        @error="imageFailed = true" />
      <p v-else class="image-fallback">{{ t('ui.m228') }}</p>
      <span v-if="!photo" class="image-caption">{{ t('ui.m229') }}</span>
    </div>
    <div class="card-body">
      <h3>{{ speciesName(species, language) }}</h3>
      <p v-if="species.scientificName" class="scientific-name" lang="la">{{ species.scientificName }}</p>
      <div class="card-classification"><p class="card-group">{{ groupLabel(species, language) }}</p><p class="status-badge" :data-category="species.iucn.category">{{ statusDetails(species, language).label }}</p></div>
      <p class="card-description"><ScientificText :value="species.habitat?.description" short /></p>
      <p v-if="!species.verified" class="verification-note"><span aria-hidden="true">○</span> {{ t('ui.m097') }}</p>
      <div v-if="photo" class="card-photo-credit">
        <a :href="photo.originalPage" target="_blank" rel="noopener noreferrer">{{ t('ui.m082') }} {{ photo.author }}<span class="sr-only"> {{ t('ui.m230') }}</span></a>
        <a :href="photo.licenseUrl" target="_blank" rel="noopener noreferrer">{{ photo.license }}<span class="sr-only"> {{ t('ui.m231') }}</span></a>
      </div>
      <button type="button" class="card-open" :aria-label="t('ui.m125', { p0: speciesName(species, language) })"
        aria-haspopup="dialog" @click="emit('open', species)"> {{ t('ui.m232') }} <span aria-hidden="true">↗</span>
      </button>
    </div>
  </article>
</template>
