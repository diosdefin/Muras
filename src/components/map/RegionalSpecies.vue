<script setup>
import ScientificText from "../ScientificText.vue"
import SourceLink from '../SourceLink.vue'
import { useLocale } from '../../composables/useLocale.js'
import { computed, ref } from 'vue'
import { publicImageUrl, speciesName, speciesPhoto, PLACEHOLDER } from '../../data/presentation.js'

const { t, language } = useLocale()

const props = defineProps({ entry: { type: Object, required: true } })
const emit = defineEmits(['open'])
const failed = ref(false)
const photo = computed(() => speciesPhoto(props.entry.species))
</script>

<template>
  <article class="regional-species">
    <div class="regional-species-heading">
      <img :src="failed ? PLACEHOLDER : publicImageUrl(photo?.path)" width="96" height="96" loading="lazy" decoding="async"
        :alt="photo && !failed ? t('ui.m078', { p0: speciesName(entry.species, language) }) : t('ui.m121')" @error="failed = true" />
      <div><h4>{{ speciesName(entry.species, language) }}</h4><p class="scientific-name" lang="la">{{ entry.species.scientificName }}</p></div>
    </div>
    <p v-if="photo" class="map-photo-caption"><ScientificText :value="photo.caption" /> {{ t('ui.m122') }}</p>
    <p><ScientificText :value="{ru: entry.evidence.evidence}" /></p>
    <p class="map-review">{{ entry.evidence.reviewStatus === 'reviewed' ? t('ui.m123') : t('ui.m124') }}</p>
    <div class="regional-actions">
      <button type="button" class="text-link" aria-haspopup="dialog" :aria-label="t('ui.m125', { p0: speciesName(entry.species, language) })" @click="emit('open', entry.species)">{{ t('ui.m126') }} <span aria-hidden="true">↗</span></button>
      <SourceLink v-for="source in entry.sources" :key="source.id" :source="source" compact>{{ t('ui.m128') }} {{ source.year }}</SourceLink>
    </div>
    <details v-if="photo" class="map-photo-credit">
      <summary>{{ t('ui.m129') }}</summary>
      <p lang="und">{{ photo.attribution || photo.author }}</p>
      <p class="language-note">{{ t('originalMetadata') }}</p>
      <a :href="photo.originalPage" target="_blank" rel="noopener noreferrer">{{ t('ui.m082') }} {{ photo.author }}<span class="sr-only"> {{ t('ui.m130') }}</span></a>
      <a :href="photo.licenseUrl" target="_blank" rel="noopener noreferrer">{{ photo.license }}<span class="sr-only"> {{ t('ui.m131') }}</span></a>
      <p>{{ t('ui.m132') }}</p>
    </details>
  </article>
</template>
