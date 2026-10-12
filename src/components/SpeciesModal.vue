<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  species: { type: Object, required: true },
})
const emit = defineEmits(['close'])

const canvas = ref(null)
const activeLanguage = ref('ru')
const populationValue = ref(props.species.population)
const image = new Image()

const PIXEL_SCALE_BY_SPECIES = {
  irbis: { current: 12, historical: 80 },
  'amur-tiger': { current: 12, historical: 48 },
  'whooping-crane': { current: 48, historical: 112 },
}
const SOURCE_IMAGE_EXTENSIONS = ['jpg', 'png', 'webp']

const formattedPopulation = computed(() =>
  new Intl.NumberFormat('ru-RU').format(populationValue.value),
)
const languages = computed(() => [
  { key: 'ru', label: 'RU', name: props.species.name_ru, description: props.species.description_ru },
  { key: 'kg', label: 'KG', name: props.species.name_kg, description: props.species.description_kg },
  { key: 'en', label: 'EN', name: props.species.name_en, description: props.species.description_en },
])
const currentLanguage = computed(() =>
  languages.value.find((language) => language.key === activeLanguage.value) || languages.value[0],
)

function getGridWidth(targetPopulation) {
  const scale = PIXEL_SCALE_BY_SPECIES[props.species.id] || { current: 12, historical: 80 }
  const populationRange = props.species.population_history - props.species.population
  const progress = populationRange > 0
    ? (targetPopulation - props.species.population) / populationRange
    : 0

  return Math.round(scale.current + Math.max(0, Math.min(1, progress)) * (scale.historical - scale.current))
}

function renderPixelated(targetPopulation) {
  const context = canvas.value?.getContext('2d')
  if (!context) return

  const width = canvas.value.width
  const height = canvas.value.height
  context.clearRect(0, 0, width, height)
  context.fillStyle = '#064e3b'
  context.fillRect(0, 0, width, height)
  if (!image.complete || !image.naturalWidth || !image.naturalHeight) {
    context.fillStyle = '#a7f3d0'
    context.font = '600 16px system-ui'
    context.textAlign = 'center'
    context.fillText('Фото появится после добавления исходного файла', width / 2, height / 2)
    return
  }

  const aspectRatio = image.naturalWidth / image.naturalHeight
  const cols = getGridWidth(targetPopulation)
  const rows = Math.max(1, Math.round(cols / aspectRatio))
  const pixelCanvas = document.createElement('canvas')
  pixelCanvas.width = cols
  pixelCanvas.height = rows
  const pixelContext = pixelCanvas.getContext('2d')
  if (!pixelContext) return

  pixelContext.imageSmoothingEnabled = false
  pixelContext.mozImageSmoothingEnabled = false
  pixelContext.webkitImageSmoothingEnabled = false
  pixelContext.drawImage(image, 0, 0, cols, rows)

  context.imageSmoothingEnabled = false
  context.mozImageSmoothingEnabled = false
  context.webkitImageSmoothingEnabled = false
  context.drawImage(pixelCanvas, 0, 0, width, height)
}

function closeOnEscape(event) {
  if (event.key === 'Escape') emit('close')
}

function loadOriginalImage() {
  let extensionIndex = 0

  const tryNextSource = () => {
    if (extensionIndex >= SOURCE_IMAGE_EXTENSIONS.length) {
      renderPixelated(populationValue.value)
      return
    }

    const extension = SOURCE_IMAGE_EXTENSIONS[extensionIndex]
    extensionIndex += 1
    image.src = `/images/source/${props.species.id}.${extension}`
  }

  image.onload = () => renderPixelated(populationValue.value)
  image.onerror = tryNextSource
  tryNextSource()
}

watch(() => props.species, () => {
  populationValue.value = props.species.population
  activeLanguage.value = 'ru'
  loadOriginalImage()
  nextTick(() => renderPixelated(populationValue.value))
}, { immediate: true })

watch(populationValue, (targetPopulation) => renderPixelated(targetPopulation))
onMounted(() => window.addEventListener('keydown', closeOnEscape))
onBeforeUnmount(() => window.removeEventListener('keydown', closeOnEscape))
</script>

<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-emerald-950/70 p-4 backdrop-blur-sm sm:p-8" @click.self="emit('close')">
    <div
      class="mx-auto flex min-h-full max-w-6xl items-center justify-center"
      role="dialog"
      aria-modal="true"
      :aria-label="species.name_ru"
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
            <canvas ref="canvas" width="800" height="600" class="block h-auto w-full" />
          </div>
          <label class="mt-6 block text-sm font-bold text-emerald-100" for="population-slider">
            Было / стало: {{ formattedPopulation }} особей
          </label>
          <input
            id="population-slider"
            v-model.number="populationValue"
            class="mt-3 w-full accent-emerald-300"
            type="range"
            :min="species.population"
            :max="species.population_history"
            :step="1"
          />
          <div class="mt-2 flex justify-between text-xs text-emerald-200/70">
            <span>Сейчас: {{ species.population.toLocaleString('ru-RU') }}</span>
            <span>Исторически: {{ species.population_history.toLocaleString('ru-RU') }}</span>
          </div>
        </div>
        <div class="p-6 sm:p-10">
          <div class="mb-6 flex items-start justify-between gap-4 pr-10">
            <div>
              <p class="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">{{ species.status }}</p>
              <h2 class="mt-2 text-4xl font-black tracking-tight text-emerald-950">{{ currentLanguage.name }}</h2>
            </div>
          </div>
          <div class="mb-6 flex gap-2 border-b border-emerald-950/10">
            <button
              v-for="language in languages"
              :key="language.key"
              type="button"
              class="border-b-2 px-3 py-2 text-sm font-bold transition"
              :class="activeLanguage === language.key ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-400 hover:text-emerald-700'"
              @click="activeLanguage = language.key"
            >
              {{ language.label }}
            </button>
          </div>
          <p class="min-h-20 leading-7 text-slate-600">{{ currentLanguage.description }}</p>
          <dl class="mt-8 grid gap-5 border-t border-emerald-950/10 pt-6 sm:grid-cols-2">
            <div>
              <dt class="text-xs font-bold uppercase tracking-wider text-emerald-700">Ареал</dt>
              <dd class="mt-1 font-semibold text-slate-800">{{ species.region }}</dd>
            </div>
            <div>
              <dt class="text-xs font-bold uppercase tracking-wider text-emerald-700">Текущая численность</dt>
              <dd class="mt-1 font-semibold text-slate-800">{{ species.population.toLocaleString('ru-RU') }} особей</dd>
            </div>
          </dl>
          <div class="mt-8">
            <h3 class="text-xs font-bold uppercase tracking-wider text-emerald-700">Главные угрозы</h3>
            <ul class="mt-3 flex flex-wrap gap-2">
              <li v-for="threat in species.threats" :key="threat" class="rounded-full bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                {{ threat }}
              </li>
            </ul>
          </div>
          <section class="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 sm:p-6">
            <div class="flex items-start gap-3">
              <span class="text-2xl" aria-hidden="true">🐾</span>
              <div>
                <h3 class="text-xl font-black text-emerald-950">Как помочь этому виду?</h3>
                <p class="mt-1 text-sm leading-6 text-emerald-900/70">
                  Поддержите организации, которые защищают его среду обитания.
                </p>
              </div>
            </div>
            <div class="mt-5 grid gap-3 sm:grid-cols-2">
              <article
                v-for="fund in species.donation_funds"
                :key="fund.name"
                class="flex min-w-0 flex-col rounded-xl border border-emerald-200/80 bg-white/80 p-4 shadow-sm"
              >
                <div class="flex items-start gap-3">
                  <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-sm font-black text-emerald-800" aria-hidden="true">
                    {{ fund.name.charAt(0) }}
                  </span>
                  <h4 class="pt-1 font-bold leading-5 text-emerald-950">{{ fund.name }}</h4>
                </div>
                <p class="mt-3 flex-1 text-sm leading-6 text-slate-600">{{ fund.description }}</p>
                <a
                  class="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  :href="fund.url"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Перейти на сайт
                  <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                    <path d="M11 3h6v6M17 3l-8 8" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M15 11v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" stroke-linecap="round" />
                  </svg>
                  <span class="sr-only">(открывается в новой вкладке)</span>
                </a>
              </article>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>
