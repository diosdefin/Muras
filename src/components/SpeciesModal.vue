<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { formatPopulation, groupLabel, localized, nationalStatus, publicImageUrl, regionNames, speciesName, speciesPhoto, statusDetails } from '../data/presentation.js'
import { useModalDialog } from '../composables/useModalDialog.js'

const props = defineProps({ species: { type: Object, required: true } })
const emit = defineEmits(['close'])
const dialog = ref(null)
const closeButton = ref(null)
const canvas = ref(null)
const activeLanguage = ref('ru')
const detailValue = ref(32)
const image = new Image()
const photo = computed(() => speciesPhoto(props.species))
const imagePath = computed(() => publicImageUrl(photo.value?.path))
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

function drawPixelatedImage() {
  const context = canvas.value?.getContext('2d')
  if (!context) return
  const { width, height } = canvas.value
  context.clearRect(0, 0, width, height)
  context.fillStyle = '#eef1e9'
  context.fillRect(0, 0, width, height)
  if (!image.complete || !image.naturalWidth) {
    context.fillStyle = '#253b32'
    context.font = '600 24px system-ui'
    context.textAlign = 'center'
    context.fillText('Изображение недоступно', width / 2, height / 2)
    return
  }
  const cols = Math.max(8, Math.min(200, detailValue.value))
  const rows = Math.max(1, Math.round(cols * height / width))
  const pixelCanvas = document.createElement('canvas')
  pixelCanvas.width = cols
  pixelCanvas.height = rows
  const pixelContext = pixelCanvas.getContext('2d')
  if (!pixelContext) return
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  const cropWidth = width / scale
  const cropHeight = height / scale
  pixelContext.imageSmoothingEnabled = false
  pixelContext.drawImage(image, (image.naturalWidth - cropWidth) / 2, (image.naturalHeight - cropHeight) / 2,
    cropWidth, cropHeight, 0, 0, cols, rows)
  context.imageSmoothingEnabled = false
  context.drawImage(pixelCanvas, 0, 0, width, height)
}

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

watch(() => props.species, () => {
  detailValue.value = 32
  activeLanguage.value = 'ru'
  image.onload = drawPixelatedImage
  image.onerror = drawPixelatedImage
  image.src = imagePath.value
  nextTick(drawPixelatedImage)
}, { immediate: true })
watch(detailValue, drawPixelatedImage)
onBeforeUnmount(() => { image.onload = null; image.onerror = null })
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
        <section class="modal-media" aria-label="Учебная иллюстрация">
          <figure>
            <div class="canvas-frame">
              <canvas ref="canvas" width="800" height="600" role="img"
                :aria-label="photo ? 'Условная пикселизация фотографии' : 'Учебная пикселизация условного пейзажа; это не фото вида'">
                Учебная иллюстрация. Детализацию можно изменить ползунком ниже.
              </canvas>
            </div>
            <figcaption>{{ photo ? 'Фотография вида · учебный эффект' : 'Условный горный пейзаж · не фотография вида' }}</figcaption>
          </figure>
          <div class="pixel-control">
            <label for="detail-slider">Учебная пикселизация</label>
            <p class="detail-value">Детализация: <output for="detail-slider">{{ detailValue }}</output></p>
            <input id="detail-slider" v-model.number="detailValue" type="range" min="8" max="200" step="1"
              :aria-valuetext="`Детализация: ${detailValue}`" aria-describedby="pixel-note" />
            <div class="range-endpoints" aria-hidden="true"><span>Меньше деталей</span><span>Больше деталей</span></div>
          </div>
          <p id="pixel-note" class="media-note">Условный эффект не отражает численность вида.</p>
          <p v-if="!photo" class="media-note">Фото не опубликовано: лицензия не подтверждена.</p>
          <div v-else class="photo-credit">
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
