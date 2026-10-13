<script setup>
import SourceLink from "./SourceLink.vue"
import { provideContentLanguage, useLocale } from '../composables/useLocale.js'
import { computed, ref, toRef } from 'vue'
import { groupLabel, nationalStatus, regionNames, speciesName, speciesPhoto, statusDetails } from '../data/presentation.js'
import { populationPresentation } from '../data/population.js'
import { useModalDialog } from '../composables/useModalDialog.js'
import { siteLanguage } from '../composables/useLocale.js'
import ScientificText from './ScientificText.vue'
import SpeciesVisualization from './SpeciesVisualization.vue'
import LessonReferences from './lesson/LessonReferences.vue'
import PopulationInfo from './PopulationInfo.vue'

const props = defineProps({ species: { type: Object, required: true }, contentLanguage: { type: String, default: null } })
const effectiveLanguage = computed(() => props.contentLanguage || siteLanguage.value)
const { t, language } = useLocale(effectiveLanguage)
provideContentLanguage(toRef(props, 'contentLanguage'))
const emit = defineEmits(['close', 'support'])
const dialog = ref(null)
const closeButton = ref(null)
const photo = computed(() => speciesPhoto(props.species))
const population = computed(() => populationPresentation(props.species.population, props.species.sources))
const currentName = computed(() => speciesName(props.species, language.value))
function contentLanguage(dictionary) {
  return [language.value, 'ru', 'en', 'ky'].find(key => dictionary?.[key]) || 'ru'
}
const nameLanguage = computed(() => Object.values(props.species.names).some(Boolean)
  ? contentLanguage(props.species.names) : props.species.scientificName ? 'la' : 'ru')

useModalDialog(dialog, closeButton)

let backdropPointer = false
function outsideDialog(event) {
  if (event.target !== dialog.value) return false
  const bounds = dialog.value.getBoundingClientRect()
  return event.clientX < bounds.left || event.clientX > bounds.right ||
    event.clientY < bounds.top || event.clientY > bounds.bottom
}
function beginBackdrop(event) { backdropPointer = outsideDialog(event) }
function closeFromBackdrop(event) {
  if (backdropPointer && outsideDialog(event)) emit('close')
  backdropPointer = false
}
</script>

<template>
  <dialog ref="dialog" class="modal-shell" :lang="language" aria-modal="true" aria-labelledby="species-title"
    @cancel.prevent="emit('close')" @pointerdown="beginBackdrop" @click="closeFromBackdrop">
    <header class="modal-header">
      <div class="modal-title">
        <p class="eyebrow">{{ t('ui.m236') }}</p>
        <h2 id="species-title" :lang="nameLanguage">{{ currentName }}</h2>
      </div>
      <button ref="closeButton" type="button" class="close-button" :aria-label="t('ui.m237')" autofocus @click="emit('close')">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="m6 6 12 12M6 18 18 6" />
        </svg>
      </button>
    </header>
    <div class="modal-scroll">
      <div class="modal-grid">
        <section class="modal-media" :aria-label="t('ui.m238')">
          <SpeciesVisualization :photo="photo" :name="currentName" :population-type="population.type" :species-id="species.id" />
          <div v-if="photo" class="photo-credit">
            <p class="photo-credit-links"><a :href="photo.originalPage" target="_blank" rel="noopener noreferrer">{{ t('ui.m082') }} {{ photo.author }} <span class="sr-only">{{ t('ui.m230') }}</span></a>
            <a :href="photo.licenseUrl" target="_blank" rel="noopener noreferrer">{{ photo.license }} <span class="sr-only">{{ t('ui.m239') }}</span></a>
            </p>
            <details class="modal-disclosure photo-details"><summary>{{ t('ui.m240') }}</summary><div>
              <p v-if="photo.caption"><ScientificText :value="photo.caption" /></p>
              <p lang="und">{{ photo.attribution }}</p>
              <p v-if="photo.modifications?.length">{{ t('ui.m241') }} <ScientificText :value="{ru: photo.modifications.join('; ')}" /></p>
              <p class="language-note">{{ t('originalMetadata') }}</p>
            </div></details>
          </div>
        </section>
        <div class="modal-information">
          <section aria-labelledby="basic-information-title">
          <h3 id="basic-information-title" class="modal-section-title">{{ t('ui.m242') }}</h3>
          <p class="card-group">{{ groupLabel(species, language) }}</p>
          <p class="status-badge" :data-category="species.iucn.category">{{ statusDetails(species, language).label }}</p>
          <p v-if="species.iucn.category && !species.iucn.year" class="media-note">{{ t('ui.m073') }}</p>
          <p v-if="species.scientificName" class="modal-scientific scientific-name" lang="la">{{ species.scientificName }}</p>
          <p class="national-status">{{ nationalStatus(species, language) }}.
            <ScientificText :value="{ru: species.nationalRedBook.edition}" />. {{ species.verified ? t('ui.m062') : t('ui.m243') }}</p>
          <p class="species-description"><ScientificText :value="species.habitat?.description" /></p>
          <dl class="species-facts">
            <div>
              <dt>{{ t('ui.m246') }}</dt>
              <dd>{{ regionNames(species, language).join(', ') || t('ui.m247') }}</dd>
            </div>
          </dl>
          <PopulationInfo :population="species.population" :sources="species.sources" />
          </section>
          <details class="modal-disclosure"><summary>{{ t('ui.m248') }}</summary><div>
          <section class="information-section" aria-labelledby="threats-title">
            <h3 id="threats-title">{{ t('ui.m249') }}</h3>
            <ul v-if="species.threats?.length" class="threat-list">
              <li v-for="(threat, index) in species.threats" :key="index" ><ScientificText :value="threat.text" /> <LessonReferences :species="species" :ids="threat.sourceIds" /></li>
            </ul>
            <p v-else>{{ t('ui.m066') }}</p>
          </section>
          <section class="information-section" aria-labelledby="conservation-title">
            <h3 id="conservation-title">{{ t('ui.m070') }}</h3>
            <ul v-if="species.conservationMeasures?.length" class="threat-list">
              <li v-for="(measure, index) in species.conservationMeasures" :key="index" ><ScientificText :value="measure.text" /> <LessonReferences :species="species" :ids="measure.sourceIds" /></li>
            </ul>
            <p v-else>{{ t('ui.m066') }}</p>
          </section>
          </div></details>
          <details class="modal-disclosure"><summary>{{ t('ui.m250') }} <span class="disclosure-count">{{ species.sources.length }}</span></summary>
            <ol v-if="species.sources.length" class="source-list">
              <li v-for="source in species.sources" :key="source.id">
                <SourceLink :source="source" />
              </li>
            </ol>
            <p v-else>{{ t('ui.m251') }}</p>
          </details>
          <div class="support-modal-action"><button class="text-link" type="button" @click="emit('support', species.id)">{{ t('ui.m252') }} <span aria-hidden="true">↗</span></button><p>{{ t('ui.m253') }}</p></div>
        </div>
      </div>
    </div>
  </dialog>
</template>
