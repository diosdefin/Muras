<script setup>
import { regionLabel } from '../../data/presentation.js'
import ScientificText from "../ScientificText.vue"
import SourceLink from '../SourceLink.vue'
import { useLocale } from '../../composables/useLocale.js'
import { computed, ref } from 'vue'
import ThumbPicture from '../ThumbPicture.vue'
import { publicImageUrl, speciesName, speciesNameLanguage, speciesPhoto, PLACEHOLDER } from '../../data/presentation.js'

const { t, language } = useLocale()

const props = defineProps({ entry: { type: Object, required: true }, showRegion: { type: Boolean, default: true } })
const emit = defineEmits(['open', 'profile'])
const failed = ref(false)
const photo = computed(() => speciesPhoto(props.entry.species))
// Most records carry no observation year; the label is shown only with an actual date.
const observed = computed(() => props.entry.evidence.observationDate || (props.entry.evidence.observationYear ?? null))
// The evidence line is phrased from structured fields in the visitor's language (the published Russian sentence
// carries the same facts); the region is already shown by the card or the panel around it.
const evidenceText = computed(() => {
  const { observationYear } = props.entry.evidence
  if (observationYear != null) return t('mapUI.evidenceObserved', { p0: observationYear })
  const year = props.entry.sources.find(source => source.kind !== 'administrative-reference')?.year ?? null
  return year === null ? t('mapUI.evidenceSourceUndated') : t('mapUI.evidenceSource', { p0: year })
})
</script>

<template>
  <article class="regional-species">
    <!-- One compact action in the corner: opens the species card. -->
    <button type="button" class="regional-explore" aria-haspopup="dialog" :aria-label="t('ui.m125', { p0: speciesName(entry.species, language) })" :title="t('ui.m126')" @click="emit('open', entry.species)">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3.5" y="5" width="17" height="14" rx="2.5" /><rect x="6.5" y="8.5" width="5" height="5" rx="1" /><path d="M14 9.5h3.5M14 12.5h3.5M6.5 16h11" />
      </svg>
    </button>
    <div class="regional-species-heading">
      <ThumbPicture v-if="!failed && photo?.path" :path="photo.path" width="96" height="96" loading="lazy" decoding="async"
        :alt="photo && !failed ? t('ui.m078', { p0: speciesName(entry.species, language) }) : t('ui.m121')" @error="failed = true" />
      <img v-else :src="PLACEHOLDER" width="96" height="96" loading="lazy" decoding="async" :alt="t('ui.m121')" />
      <div><h4 :lang="speciesNameLanguage(entry.species, language)">{{ speciesName(entry.species, language) }}</h4><p class="scientific-name" lang="la">{{ entry.species.scientificName }}</p></div>
    </div>
    <p v-if="showRegion || observed" class="map-observation"><template v-if="showRegion">{{ regionLabel(entry.evidence.regionId, language) }}</template><template v-if="showRegion && observed"> · </template><template v-if="observed">{{ t('mapUI.observed') }} <time :datetime="String(observed)">{{ observed }}</time></template></p>
    <!-- Details stay in the document (screen readers, search) but are folded to keep the list light. -->
    <details class="regional-more">
      <summary>{{ t('ui.m232') }}</summary>
      <p v-if="photo" class="map-photo-caption"><ScientificText :value="photo.caption" /> {{ t('ui.m122') }}</p>
      <p :lang="language">{{ evidenceText }}</p>
      <p class="map-review">{{ t('mapUI.historical') }}</p>
      <p class="map-review">{{ entry.evidence.reviewStatus === 'reviewed' ? t('ui.m123') : t('ui.m124') }}</p>
      <div class="regional-sources">
        <SourceLink v-for="source in entry.sources" :key="source.id" :source="source" compact>{{ t('ui.m128') }} {{ source.year ?? t('mapUI.publicationUnknown') }}</SourceLink>
      </div>
      <details v-if="photo" class="map-photo-credit">
        <summary>{{ t('ui.m129') }}</summary>
        <p lang="und">{{ photo.attribution || photo.author }}</p>
        <p class="language-note">{{ t('originalMetadata') }}</p>
        <a :href="photo.originalPage" target="_blank" rel="noopener noreferrer">{{ t('ui.m082') }} {{ photo.author }}<span class="sr-only"> {{ t('ui.m130') }}</span></a>
        <a :href="photo.licenseUrl" target="_blank" rel="noopener noreferrer">{{ photo.license }}<span class="sr-only"> {{ t('ui.m131') }}</span></a>
        <p>{{ t('ui.m132') }}</p>
      </details>
    </details>
  </article>
</template>

<style scoped>
.regional-species { position: relative; }
.regional-species-heading { padding-right: 44px; }
.regional-explore {
  position: absolute; top: 12px; right: 12px; display: grid; place-items: center;
  width: 36px; height: 36px; border: 1px solid var(--line); border-radius: 10px;
  background: #fff; color: var(--green); transition: border-color .15s ease, background .15s ease, color .15s ease;
}
.regional-explore:hover { border-color: var(--green); background: var(--paper); color: var(--ink); }
.regional-more { margin-top: 2px; }
.regional-more > summary {
  display: inline-flex; align-items: center; gap: 6px; min-height: 36px;
  color: var(--green); font-size: 13px; font-weight: 600; cursor: pointer; list-style: none;
}
.regional-more > summary::-webkit-details-marker { display: none; }
.regional-more > summary::after { content: '⌄'; font-size: 15px; line-height: 1; transform: translateY(-2px); transition: transform .15s ease; }
.regional-more[open] > summary::after { transform: rotate(180deg) translateY(-1px); }
.regional-more > :not(summary) { margin-top: 6px; }
.regional-sources { display: flex; flex-wrap: wrap; gap: 0 14px; font-size: 13px; }
</style>
