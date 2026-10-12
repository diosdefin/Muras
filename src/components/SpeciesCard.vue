<script setup>
import { computed, ref, watch } from 'vue'
import { compositionStyle } from '../data/image-composition.js'
import { groupLabel, publicImageUrl, speciesName, speciesPhoto, statusDetails } from '../data/presentation.js'
import { briefDescription } from '../data/catalog-search.js'

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
      <img v-if="!imageFailed" :src="imagePath" :style="compositionStyle(photo)" :width="photo?.width || 800" :height="photo?.height || 600" loading="lazy" decoding="async"
        :alt="photo ? `${speciesName(species)} — фотография` : 'Условный горный пейзаж; фотография вида пока недоступна'"
        @error="imageFailed = true" />
      <p v-else class="image-fallback">Изображение недоступно</p>
      <span v-if="!photo" class="image-caption">Условная иллюстрация</span>
    </div>
    <div class="card-body">
      <h3>{{ speciesName(species) }}</h3>
      <p v-if="species.scientificName" class="scientific-name" lang="la">{{ species.scientificName }}</p>
      <div class="card-classification"><p class="card-group">{{ groupLabel(species) }}</p><p class="status-badge" :data-category="species.iucn.category">{{ statusDetails(species).label }}</p></div>
      <p class="card-description">{{ briefDescription(species) }}</p>
      <p v-if="!species.verified" class="verification-note"><span aria-hidden="true">○</span> Требует редакторской проверки</p>
      <div v-if="photo" class="card-photo-credit">
        <a :href="photo.originalPage" target="_blank" rel="noopener noreferrer">Фото: {{ photo.author }}<span class="sr-only"> (оригинальная страница, новая вкладка)</span></a>
        <a :href="photo.licenseUrl" target="_blank" rel="noopener noreferrer">{{ photo.license }}<span class="sr-only"> (условия использования, новая вкладка)</span></a>
      </div>
      <button type="button" class="card-open" :aria-label="`Открыть запись: ${speciesName(species)}`"
        aria-haspopup="dialog" @click="emit('open', species)">
        Подробнее <span aria-hidden="true">↗</span>
      </button>
    </div>
  </article>
</template>
