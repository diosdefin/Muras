<script setup>
import SourceLink from './SourceLink.vue'
import { provideContentLanguage, useLocale } from '../composables/useLocale.js'
import { computed, ref, toRef } from 'vue'
import { groupLabel, nationalStatus, regionNames, speciesName, speciesPhoto, statusDetails } from '../data/presentation.js'
import { useModalDialog } from '../composables/useModalDialog.js'
import { populationPresentation } from '../data/population.js'
import { siteLanguage } from '../composables/useLocale.js'
import ScientificText from './ScientificText.vue'
import SpeciesVisualization from './SpeciesVisualization.vue'
import LessonReferences from './lesson/LessonReferences.vue'
import PopulationInfo from './PopulationInfo.vue'

const props = defineProps({ species: { type: Object, required: true }, contentLanguage: { type: String, default: null } })
const effectiveLanguage = computed(() => props.contentLanguage || siteLanguage.value)
const { t, language } = useLocale(effectiveLanguage)
provideContentLanguage(toRef(props, 'contentLanguage'))
const emit = defineEmits(['close', 'support', 'details'])
const dialog = ref(null)
const closeButton = ref(null)
const photo = computed(() => speciesPhoto(props.species))
const population = computed(() => populationPresentation(props.species.population, props.species.sources))
const currentName = computed(() => speciesName(props.species, language.value))
const currentStatus = computed(() => statusDetails(props.species, language.value))
const knownRegions = computed(() => regionNames(props.species, language.value))
function preferredLanguage(dictionary) {
  return [language.value, 'ru', 'en', 'ky'].find(key => dictionary?.[key]) || 'ru'
}
const nameLanguage = computed(() => Object.values(props.species.names || {}).some(Boolean)
  ? preferredLanguage(props.species.names) : props.species.scientificName ? 'la' : 'ru')

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
  <dialog ref="dialog" class="modal-shell species-detail-modal" :lang="language" aria-modal="true" aria-labelledby="species-title"
    @cancel.prevent="emit('close')" @pointerdown="beginBackdrop" @click="closeFromBackdrop">
    <header class="modal-header modal-header-profile">
      <div class="modal-heading-left">
        <div class="modal-heading-meta">
          <span>{{ groupLabel(species, language) }}</span>
          <span class="modal-heading-status" :data-category="species.iucn?.category || 'unknown'">{{ currentStatus.label }}</span>
        </div>
        <p v-if="species.scientificName" class="modal-heading-latin" lang="la">{{ species.scientificName }}</p>
      </div>
      <div class="modal-heading-actions">
        <button class="modal-detail-button" type="button" :aria-label="`${t('ui.m232')} — ${currentName}`" @click="emit('details', species.id)">
          {{ t('ui.m232') }} <span aria-hidden="true">↗</span>
        </button>
        <button ref="closeButton" type="button" class="close-button" :aria-label="t('ui.m237')" autofocus @click="emit('close')">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="m6 6 12 12M6 18 18 6" />
          </svg>
        </button>
      </div>
    </header>
    <div class="modal-scroll">
      <div class="modal-grid">
        <section class="modal-media" :aria-label="t('ui.m238')">
          <SpeciesVisualization :photo="photo" :name="currentName" :population-type="population.type" :species-id="species.id" />
          <PopulationInfo :population="species.population" :sources="species.sources" />
          <details v-if="photo" class="modal-disclosure photo-details">
            <summary>{{ t('ui.m240') }}</summary>
            <div class="photo-credit">
              <p class="photo-credit-links">
                <a :href="photo.originalPage" target="_blank" rel="noopener noreferrer">{{ t('ui.m082') }} {{ photo.author }} <span class="sr-only">{{ t('ui.m230') }}</span></a>
                <a :href="photo.licenseUrl" target="_blank" rel="noopener noreferrer">{{ photo.license }} <span class="sr-only">{{ t('ui.m239') }}</span></a>
              </p>
              <p v-if="photo.caption"><ScientificText :value="photo.caption" /></p>
              <p lang="und">{{ photo.attribution }}</p>
              <p v-if="photo.modifications?.length">{{ t('ui.m241') }} <ScientificText :value="{ ru: photo.modifications.join('; ') }" /></p>
              <p class="language-note">{{ t('originalMetadata') }}</p>
            </div>
          </details>
        </section>
        <div class="modal-information">
          <h2 id="species-title" class="modal-profile-name" :lang="nameLanguage">{{ currentName }}</h2>
          <section class="species-introduction" :aria-label="t('speciesProfile.overview')">
            <h3>{{ t('speciesProfile.overview') }}</h3>
            <p class="species-description"><ScientificText :value="species.habitat?.description" /></p>
          </section>
          <section class="species-facts" :aria-label="t('ui.m246')">
            <div>
              <h3>{{ t('ui.m246') }}</h3>
              <p class="species-region-list">{{ knownRegions.join(', ') || t('ui.m247') }}</p>
            </div>
          </section>
          <details class="modal-disclosure"><summary>{{ t('ui.m248') }}</summary><div>
            <section class="information-section" aria-labelledby="threats-title">
              <h3 id="threats-title">{{ t('ui.m249') }}</h3>
              <ul v-if="species.threats?.length" class="threat-list">
                <li v-for="(threat, index) in species.threats" :key="index"><ScientificText :value="threat.text" /> <LessonReferences :species="species" :ids="threat.sourceIds" /></li>
              </ul>
              <p v-else>{{ t('ui.m066') }}</p>
            </section>
            <section class="information-section" aria-labelledby="conservation-title">
              <h3 id="conservation-title">{{ t('ui.m070') }}</h3>
              <ul v-if="species.conservationMeasures?.length" class="threat-list">
                <li v-for="(measure, index) in species.conservationMeasures" :key="index"><ScientificText :value="measure.text" /> <LessonReferences :species="species" :ids="measure.sourceIds" /></li>
              </ul>
              <p v-else>{{ t('ui.m066') }}</p>
            </section>
          </div></details>
          <details class="modal-disclosure"><summary>{{ t('ui.m250') }} <span class="disclosure-count">{{ species.sources.length }}</span></summary><div>
            <p class="modal-record-note">{{ nationalStatus(species, language) }} · <ScientificText :value="{ ru: species.nationalRedBook.edition }" /> · {{ species.verified ? t('ui.m062') : t('ui.m243') }}</p>
            <p v-if="species.iucn.category && !species.iucn.year" class="modal-record-note">{{ t('ui.m073') }}</p>
            <ol v-if="species.sources.length" class="source-list">
              <li v-for="source in species.sources" :key="source.id"><SourceLink :source="source" /></li>
            </ol>
            <p v-else>{{ t('ui.m251') }}</p>
          </div></details>
          <div class="support-modal-action">
            <button class="text-link" type="button" @click="emit('support', species.id)">{{ t('ui.m252') }} <span aria-hidden="true">↗</span></button>
            <p>{{ t('ui.m253') }}</p>
          </div>
        </div>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.species-detail-modal .modal-heading-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 5px 9px; color: var(--muted); font-size: 12px; font-weight: 600; line-height: 1.45; }
.species-detail-modal .modal-heading-divider { color: #abb6ab; }
.species-detail-modal .modal-heading-status { padding: 3px 8px; border-radius: 4px; background: #edf1e9; font-size: 11px; color: #36533f; }
.species-detail-modal .modal-heading-status[data-category="NT"],
.species-detail-modal .modal-heading-status[data-category="VU"] { background: #f6efdf; color: #715027; }
.species-detail-modal .modal-heading-status[data-category="EN"],
.species-detail-modal .modal-heading-status[data-category="CR"] { background: #f8eae6; color: #983a36; }
.species-detail-modal .modal-scientific { margin-top: 5px; font-size: 15px; }
.species-detail-modal .species-introduction h3,
.species-detail-modal .species-facts h3 { font-size: 16px; font-weight: 650; margin: 0 0 12px; }
.species-detail-modal .species-description { margin: 0; font-size: 15px; line-height: 1.75; }
.species-detail-modal .species-facts { display: block; margin-top: 24px; padding-top: 20px; }
.species-detail-modal .species-region-list { margin: 0; font-size: 15px; line-height: 1.7; }
.species-detail-modal .modal-information > .modal-disclosure { margin-top: 20px; }
.species-detail-modal .modal-disclosure .information-section { margin-top: 14px; }
.species-detail-modal .modal-record-note { margin: 8px 0 12px; color: var(--muted); font-size: 13px; line-height: 1.7; }
.species-detail-modal .photo-details { margin-top: 14px; }
.species-detail-modal .photo-credit { margin-top: 0; padding-bottom: 6px; }
.species-detail-modal .photo-credit > p + p { margin-top: 8px; }
.species-detail-modal .photo-credit-links { margin-bottom: 4px; }
.species-detail-modal .photo-credit-links a { padding: 6px 0; min-height: 36px; }
.species-detail-modal .modal-media :deep(.population-info) { margin: 18px 0 0; padding-top: 18px; }
.species-detail-modal .modal-media :deep(.population-info h3) { font-size: 16px; }
.species-detail-modal .support-modal-action { margin-top: 20px; }
@media (max-width: 639px) {
  .species-detail-modal .modal-heading-meta { font-size: 11px; gap: 4px 7px; }
  .species-detail-modal .modal-heading-status { font-size: 10px; }
  .species-detail-modal .modal-information { padding-top: 24px; }
}

.species-detail-modal .modal-header-profile { padding-block: 13px; }
.species-detail-modal .modal-heading-left { min-width: 0; }
.species-detail-modal .modal-heading-meta { font-size: 12px; }
.species-detail-modal .modal-heading-latin { margin-top: 7px; font: italic 19px/1.3 Georgia, 'Times New Roman', serif; color: var(--muted); overflow-wrap: anywhere; }
.species-detail-modal .modal-heading-actions { display: flex; flex: 0 0 auto; align-items: center; gap: 9px; }
.species-detail-modal .modal-detail-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 44px; padding: 0 13px; border: 1px solid var(--line); border-radius: 24px; background: white; font-size: 13px; font-weight: 600; white-space: nowrap; }
.species-detail-modal .modal-detail-button:hover { background: var(--paper); }
.species-detail-modal .modal-profile-name { margin: 0 0 24px; font: 400 clamp(29px, 3vw, 42px)/1.15 Georgia, 'Times New Roman', serif; overflow-wrap: anywhere; }
@media (max-width: 639px) {
  .species-detail-modal .modal-header-profile { gap: 10px; padding: 10px 12px; }
  .species-detail-modal .modal-heading-meta { gap: 4px; }
  .species-detail-modal .modal-heading-latin { font-size: 16px; }
  .species-detail-modal .modal-heading-actions { gap: 5px; }
  .species-detail-modal .modal-detail-button { height: 40px; font-size: 12px; padding-inline: 8px; }
  .species-detail-modal .close-button { width: 42px; height: 42px; }
  .species-detail-modal .modal-profile-name { margin-bottom: 17px; }
}
@media (max-width: 370px) {
  .species-detail-modal .modal-heading-left .modal-heading-status { font-size: 10px; }
  .species-detail-modal .modal-heading-latin { font-size: 15px; }
}
</style>
