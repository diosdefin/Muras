<script setup>
import { computed, ref } from 'vue'
import { formatPopulation, localized, publicImageUrl, speciesName, speciesPhoto, statusDetails } from '../data/presentation.js'

const props = defineProps({ species: { type: Object, required: true } })
const emit = defineEmits(['open'])
const imageFailed = ref(false)
const photo = computed(() => speciesPhoto(props.species))
const imagePath = computed(() => publicImageUrl(photo.value?.path))
const formattedPopulation = computed(() => props.species.population.estimate ? formatPopulation(props.species.population) : 'Неизвестна')
</script>

<template>
  <article class="species-card">
    <div class="card-image">
      <img v-if="!imageFailed" :src="imagePath" width="800" height="600"
        :alt="photo ? `${speciesName(species)} — фотография` : 'Условный горный пейзаж; фотография вида пока недоступна'"
        @error="imageFailed = true" />
      <p v-else class="image-fallback">Изображение недоступно</p>
      <span v-if="!photo" class="image-caption">Условная иллюстрация</span>
    </div>
    <div class="card-body">
      <p class="status-badge" :data-category="species.iucn.category">{{ statusDetails(species).label }}</p>
      <h3>{{ speciesName(species) }}</h3>
      <p class="card-names">
        <span v-if="species.names.ky" lang="ky">{{ species.names.ky }}</span>
        <span v-if="species.names.en" lang="en">{{ species.names.en }}</span>
      </p>
      <p v-if="species.scientificName" class="scientific-name" lang="la">{{ species.scientificName }}</p>
      <p class="card-description">{{ localized(species.habitat?.description) || 'Сведения о местообитании пока не подтверждены.' }}</p>
      <p v-if="!species.verified" class="verification-note"><span aria-hidden="true">○</span> Кандидат · запись ещё не проверена</p>
      <div class="card-population">
        <span>Численность</span>
        <strong>{{ formattedPopulation }}</strong>
      </div>
      <button type="button" class="card-open" :aria-label="`Открыть запись: ${speciesName(species)}`"
        aria-haspopup="dialog" @click="emit('open', species)">
        Смотреть запись <span aria-hidden="true">↗</span>
      </button>
    </div>
  </article>
</template>
