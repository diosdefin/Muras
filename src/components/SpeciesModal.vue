<script setup>
import { computed, ref, watch } from 'vue'
import { formatPopulation, groupLabel, localized, nationalStatus, regionNames, speciesName, speciesPhoto, statusDetails } from '../data/presentation.js'
import { useModalDialog } from '../composables/useModalDialog.js'
import SpeciesVisualization from './SpeciesVisualization.vue'

const props = defineProps({ species: { type: Object, required: true } })
const emit = defineEmits(['close'])
const dialog = ref(null)
const closeButton = ref(null)
const activeLanguage = ref('ru')
const photo = computed(() => speciesPhoto(props.species))
const formattedPopulation = computed(() => formatPopulation(props.species.population))
const languages = [
  { key: 'ru', label: 'RU', accessibleName: 'Русский язык' },
  { key: 'ky', label: 'KG', accessibleName: 'Кыргызский язык' },
  { key: 'en', label: 'EN', accessibleName: 'Английский язык' },
]
const currentName = computed(() => speciesName(props.species, activeLanguage.value))
const currentDescription = computed(() => localized(props.species.habitat?.description, activeLanguage.value))
function contentLanguage(dictionary) {
  return [activeLanguage.value, 'ru', 'en', 'ky'].find(key => dictionary?.[key]) || 'ru'
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

watch(() => props.species, () => { activeLanguage.value = 'ru' }, { immediate: true })
</script>

<template>
  <dialog ref="dialog" class="modal-shell" aria-modal="true" aria-labelledby="species-title"
    @cancel.prevent="emit('close')" @pointerdown="beginBackdrop" @click="closeFromBackdrop">
    <header class="modal-header">
      <div class="modal-title">
        <p class="eyebrow">Запись каталога</p>
        <h2 id="species-title" :lang="nameLanguage">{{ currentName }}</h2>
      </div>
      <button ref="closeButton" type="button" class="close-button" aria-label="Закрыть запись" autofocus @click="emit('close')">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="m6 6 12 12M6 18 18 6" />
        </svg>
      </button>
    </header>
    <div class="modal-scroll">
      <div class="modal-grid">
        <section class="modal-media" aria-label="Фотография и образовательная визуализация">
          <SpeciesVisualization :photo="photo" :name="currentName" />
          <div v-if="photo" class="photo-credit">
            <p v-if="photo.caption" :lang="contentLanguage(photo.caption)">{{ localized(photo.caption, activeLanguage) }}</p>
            <p>{{ photo.attribution }}</p>
            <a :href="photo.originalPage" target="_blank" rel="noopener noreferrer">Источник фото <span class="sr-only">(откроется в новой вкладке)</span></a>
            <a :href="photo.licenseUrl" target="_blank" rel="noopener noreferrer">{{ photo.license }} <span class="sr-only">(откроется в новой вкладке)</span></a>
            <p v-if="photo.modifications?.length">Изменения: {{ photo.modifications.join('; ') }}</p>
          </div>
        </section>
        <div class="modal-information">
          <p class="card-group">{{ groupLabel(species) }}</p>
          <p class="status-badge" :data-category="species.iucn.category">{{ statusDetails(species).label }}</p>
          <p v-if="species.iucn.category && !species.iucn.year" class="media-note">Год индивидуальной оценки IUCN в доступном источнике не указан.</p>
          <p v-if="species.scientificName" class="modal-scientific scientific-name" lang="la">{{ species.scientificName }}</p>
          <p class="national-status">{{ nationalStatus(species) }}.
            {{ species.nationalRedBook.edition }}. {{ species.verified ? 'Запись проверена.' : 'Требует редакторской проверки.' }}</p>
          <div class="language-switch" role="group" aria-label="Язык названия и описания">
            <button v-for="language in languages" :key="language.key" type="button"
              :aria-label="language.accessibleName" :aria-pressed="activeLanguage === language.key"
              @click="activeLanguage = language.key">{{ language.label }}</button>
          </div>
          <p class="species-description" :lang="currentDescription ? contentLanguage(species.habitat?.description) : 'ru'">
            {{ currentDescription || 'Сведения о местообитании пока не подтверждены.' }}
          </p>
          <dl class="species-facts">
            <div>
              <dt>Ареал</dt>
              <dd>{{ regionNames(species).join(', ') || 'Сведения пока не подтверждены' }}</dd>
            </div>
            <div>
              <dt>Численность</dt>
              <dd>{{ formattedPopulation }}</dd>
              <dd v-if="species.population.estimate" class="fact-context">{{ species.population.territory }}, {{ species.population.year }} год</dd>
            </div>
          </dl>
          <section class="information-section" aria-labelledby="threats-title">
            <h3 id="threats-title">Главные угрозы</h3>
            <ul v-if="species.threats" class="threat-list">
              <li v-for="(threat, index) in species.threats" :key="index" :lang="contentLanguage(threat.text)">{{ localized(threat.text, activeLanguage) }}</li>
            </ul>
            <p v-else>Сведения пока не подтверждены.</p>
          </section>
          <section class="information-section" aria-labelledby="conservation-title">
            <h3 id="conservation-title">Меры охраны</h3>
            <ul v-if="species.conservationMeasures" class="threat-list">
              <li v-for="(measure, index) in species.conservationMeasures" :key="index" :lang="contentLanguage(measure.text)">{{ localized(measure.text, activeLanguage) }}</li>
            </ul>
            <p v-else>Сведения пока не подтверждены.</p>
          </section>
          <section class="information-section sources-section" aria-labelledby="sources-title">
            <h3 id="sources-title">Источники сведений</h3>
            <ol v-if="species.sources.length" class="source-list">
              <li v-for="source in species.sources" :key="source.id">
                <a :href="source.url" target="_blank" rel="noopener noreferrer">
                  {{ source.title }} <span aria-hidden="true">↗</span><span class="sr-only"> (откроется в новой вкладке)</span>
                </a>
              </li>
            </ol>
            <p v-else>Подтверждённых источников пока нет.</p>
          </section>
        </div>
      </div>
    </div>
  </dialog>
</template>
