<script setup>
import { computed, ref } from 'vue'
import { localized, publicImageUrl, speciesName, speciesPhoto, PLACEHOLDER } from '../../data/presentation.js'
const props = defineProps({ entry: { type: Object, required: true } })
const emit = defineEmits(['open'])
const failed = ref(false)
const photo = computed(() => speciesPhoto(props.entry.species))
</script>

<template>
  <article class="regional-species">
    <div class="regional-species-heading">
      <img :src="failed ? PLACEHOLDER : publicImageUrl(photo?.path)" width="96" height="96" loading="lazy" decoding="async"
        :alt="photo && !failed ? `${speciesName(entry.species)} — фотография` : 'Условная иллюстрация; фото недоступно'" @error="failed = true" />
      <div><h4>{{ speciesName(entry.species) }}</h4><p class="scientific-name" lang="la">{{ entry.species.scientificName }}</p></div>
    </div>
    <p v-if="photo" class="map-photo-caption">{{ localized(photo.caption) }} Фото иллюстрирует вид, а не региональное наблюдение.</p>
    <p>{{ entry.evidence.evidence }}</p>
    <p class="map-review">{{ entry.evidence.reviewStatus === 'reviewed' ? 'Редакторская проверка выполнена' : 'Нужна независимая редакторская проверка' }}</p>
    <div class="regional-actions">
      <button type="button" class="text-link" aria-haspopup="dialog" :aria-label="`Открыть запись: ${speciesName(entry.species)}`" @click="emit('open', entry.species)">Изучить вид <span aria-hidden="true">↗</span></button>
      <a v-for="source in entry.sources" :key="source.id" :href="source.url" target="_blank" rel="noopener noreferrer" :aria-label="`Региональный источник для ${speciesName(entry.species)}: ${source.title} (новая вкладка)`">Источник · {{ source.year }}</a>
    </div>
    <details v-if="photo" class="map-photo-credit">
      <summary>Автор и лицензия фотографии</summary>
      <p>{{ photo.attribution || photo.author }}</p>
      <a :href="photo.originalPage" target="_blank" rel="noopener noreferrer">Фото: {{ photo.author }}<span class="sr-only"> (оригинал, новая вкладка)</span></a>
      <a :href="photo.licenseUrl" target="_blank" rel="noopener noreferrer">{{ photo.license }}<span class="sr-only"> (лицензия, новая вкладка)</span></a>
      <p>WebP · кадрирование. Все изменения указаны в карточке вида.</p>
    </details>
  </article>
</template>
