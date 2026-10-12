<script setup>
import { computed, ref, watch } from 'vue'
import { localized, PLACEHOLDER, publicImageUrl, speciesName, speciesPhoto } from '../../data/presentation.js'
const props = defineProps({ species: { type: Object, required: true } })
const photo = computed(() => speciesPhoto(props.species))
const failed = ref(false)
watch(() => props.species.id, () => { failed.value = false })
</script>

<template>
  <figure class="lesson-photo">
    <img :src="photo && !failed ? publicImageUrl(photo.path) : PLACEHOLDER"
      :alt="photo && !failed ? `${speciesName(species)} — фотография` : 'Условный горный пейзаж; фотография вида недоступна'"
      :width="photo?.width || 800" :height="photo?.height || 600" decoding="async" @error="failed = true" />
    <figcaption>
      <p v-if="!photo || failed" role="status">{{ failed ? 'Фотография недоступна.' : 'Фото не опубликовано: лицензия не подтверждена.' }}</p>
      <p v-if="photo?.caption">{{ localized(photo.caption) }}</p>
      <p v-if="photo" class="lesson-photo-links">Фото: {{ photo.author }}.
        <a :href="photo.originalPage" target="_blank" rel="noopener noreferrer">Оригинал<span class="sr-only"> фото (новая вкладка)</span></a>
        <a :href="photo.licenseUrl" target="_blank" rel="noopener noreferrer">{{ photo.license }}<span class="sr-only"> (условия, новая вкладка)</span></a>
      </p>
    </figcaption>
  </figure>
</template>
