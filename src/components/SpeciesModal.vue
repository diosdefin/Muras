<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { formatPopulation, localized, publicImageUrl, regionNames, speciesName, speciesPhoto, statusDetails } from '../data/presentation.js'

const props = defineProps({
  species: { type: Object, required: true },
})
const emit = defineEmits(['close'])

const canvas = ref(null)
const activeLanguage = ref('ru')
const detailValue = ref(32)
const image = new Image()
const photo = computed(() => speciesPhoto(props.species))

const imagePath = computed(() =>
  publicImageUrl(photo.value?.path),
)
const formattedPopulation = computed(() =>
  formatPopulation(props.species.population),
)
const languages = computed(() => [
  { key: 'ru', label: 'RU', name: speciesName(props.species, 'ru'), description: localized(props.species.habitat?.description, 'ru') },
  { key: 'ky', label: 'KG', name: speciesName(props.species, 'ky'), description: localized(props.species.habitat?.description, 'ky') },
  { key: 'en', label: 'EN', name: speciesName(props.species, 'en'), description: localized(props.species.habitat?.description, 'en') },
])
const currentLanguage = computed(() =>
  languages.value.find((language) => language.key === activeLanguage.value) || languages.value[0],
)

function drawPixelatedImage() {
  const context = canvas.value?.getContext('2d')
  if (!context) return

  const width = canvas.value.width
  const height = canvas.value.height
  context.clearRect(0, 0, width, height)
  context.fillStyle = '#064e3b'
  context.fillRect(0, 0, width, height)
  if (!image.complete || !image.naturalWidth) {
    context.fillStyle = '#a7f3d0'
    context.font = '600 16px system-ui'
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
  pixelContext.imageSmoothingEnabled = false
  pixelContext.drawImage(image, 0, 0, cols, rows)
  context.imageSmoothingEnabled = false
  context.drawImage(pixelCanvas, 0, 0, width, height)
}

function closeOnEscape(event) {
  if (event.key === 'Escape') emit('close')
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
onMounted(() => window.addEventListener('keydown', closeOnEscape))
onBeforeUnmount(() => window.removeEventListener('keydown', closeOnEscape))
</script>

<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-emerald-950/70 p-4 backdrop-blur-sm sm:p-8" @click.self="emit('close')">
    <div
      class="mx-auto flex min-h-full max-w-6xl items-center justify-center"
      role="dialog"
      aria-modal="true"
      :aria-label="speciesName(species)"
    >
      <div class="relative grid w-full overflow-hidden rounded-3xl bg-[#f3f7f1] shadow-2xl lg:grid-cols-2">
        <button
          class="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-2xl text-emerald-950 shadow transition hover:bg-white"
          type="button"
          aria-label="Закрыть"
          @click="emit('close')"
        >
          ×
        </button>
        <div class="bg-emerald-950 p-5 sm:p-8">
          <div class="overflow-hidden rounded-2xl bg-emerald-900 shadow-inner">
            <canvas ref="canvas" width="800" height="600" class="block h-auto w-full" :aria-label="photo ? 'Условная пикселизация фотографии' : 'Учебная пикселизация условного пейзажа; это не фото вида'" />
          </div>
          <label class="mt-6 block text-sm font-bold text-emerald-100" for="population-slider">
            Учебная пикселизация: {{ detailValue }} столбцов
          </label>
          <input
            id="population-slider"
            v-model.number="detailValue"
            class="mt-3 w-full accent-emerald-300"
            type="range"
            :min="8"
            :max="200"
            :step="1"
          />
          <div class="mt-2 flex justify-between text-xs text-emerald-200/70">
            <span>Меньше деталей</span>
            <span>Больше деталей</span>
          </div>
          <p class="mt-2 text-xs text-emerald-200/70">Условный эффект не отражает численность. {{ photo ? '' : 'Фото не опубликовано: лицензия не подтверждена.' }}</p>
          <p v-if="photo" class="mt-2 text-xs text-emerald-200/70">
            {{ photo.attribution }} · <a :href="photo.originalPage" target="_blank" rel="noopener noreferrer">Источник фото</a> ·
            <a :href="photo.licenseUrl" target="_blank" rel="noopener noreferrer">{{ photo.license }}</a>
            {{ photo.modifications?.length ? ` · Изменения: ${photo.modifications.join('; ')}` : '' }}
          </p>
        </div>
        <div class="p-6 sm:p-10">
          <div class="mb-6 flex items-start justify-between gap-4 pr-10">
            <div>
              <p class="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">{{ statusDetails(species).label }}</p>
              <h2 class="mt-2 text-4xl font-black tracking-tight text-emerald-950">{{ currentLanguage.name }}</h2>
            </div>
          </div>
          <p class="mb-6 text-sm text-slate-500">Национальная Красная книга: {{ species.nationalRedBook.category || 'категория не подтверждена' }}. {{ species.verified ? 'Запись проверена.' : 'Кандидат, проверка не завершена.' }}</p>
          <div class="mb-6 flex gap-2 border-b border-emerald-950/10">
            <button
              v-for="language in languages"
              :key="language.key"
              type="button"
              :aria-pressed="activeLanguage === language.key"
              class="border-b-2 px-3 py-2 text-sm font-bold transition"
              :class="activeLanguage === language.key ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-400 hover:text-emerald-700'"
              @click="activeLanguage = language.key"
            >
              {{ language.label }}
            </button>
          </div>
          <p class="min-h-20 leading-7 text-slate-600" :lang="activeLanguage">{{ currentLanguage.description || 'Сведения о местообитании пока не подтверждены.' }}</p>
          <dl class="mt-8 grid gap-5 border-t border-emerald-950/10 pt-6 sm:grid-cols-2">
            <div>
              <dt class="text-xs font-bold uppercase tracking-wider text-emerald-700">Ареал</dt>
              <dd class="mt-1 font-semibold text-slate-800">{{ regionNames(species).join(', ') || 'Сведения пока не подтверждены' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-bold uppercase tracking-wider text-emerald-700">Текущая численность</dt>
              <dd class="mt-1 font-semibold text-slate-800">{{ formattedPopulation }}</dd>
              <dd v-if="species.population.estimate" class="mt-1 text-sm text-slate-500">{{ species.population.territory }}, {{ species.population.year }} год</dd>
            </div>
          </dl>
          <div class="mt-8">
            <h3 class="text-xs font-bold uppercase tracking-wider text-emerald-700">Главные угрозы</h3>
            <ul class="mt-3 flex flex-wrap gap-2">
              <li v-for="(threat, index) in species.threats || []" :key="index" class="rounded-full bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                {{ localized(threat.text, activeLanguage) }}
              </li>
            </ul>
            <p v-if="!species.threats" class="mt-3 text-sm text-slate-500">Сведения пока не подтверждены.</p>
          </div>
          <div class="mt-8">
            <h3 class="text-xs font-bold uppercase tracking-wider text-emerald-700">Источники сведений</h3>
            <ul class="mt-3 text-sm text-slate-700">
              <li v-for="source in species.sources" :key="source.id">
                <a :href="source.url" target="_blank" rel="noopener noreferrer" class="underline">{{ source.title }}</a>
              </li>
            </ul>
            <p v-if="!species.sources.length" class="mt-3 text-sm text-slate-500">Подтверждённых источников пока нет.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
