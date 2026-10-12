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

const imagePath = computed(() => props.species.image || `/images/processed/${props.species.id}.png`)
const formattedPopulation = computed(() => new Intl.NumberFormat('ru-RU').format(populationValue.value))

const languages = computed(() => [
  { key: 'ru', label: 'RU', name: props.species.name_ru, description: props.species.description_ru },
  { key: 'kg', label: 'KG', name: props.species.name_kg, description: props.species.description_kg },
  { key: 'en', label: 'EN', name: props.species.name_en, description: props.species.description_en },
])

const currentLanguage = computed(
  () => languages.value.find((language) => language.key === activeLanguage.value) || languages.value[0],
)

const funding = computed(() =>
  props.species.funding || [
    {
      name: 'NABU Kyrgyzstan',
      url: 'https://nabu-kyrgyzstan.org/',
      account: 'Платёжный портал фонда · поддержка природоохранных программ',
    },
    {
      name: 'Snow Leopard Foundation Kyrgyzstan',
      url: 'https://snowleopardfoundation.kg/',
      account: 'Платёжный портал фонда · поддержка сохранения снежного барса',
    },
  ],
)

function drawPixelatedImage() {
  const context = canvas.value?.getContext('2d')
  if (!context) return

  const width = canvas.value.width
  const height = canvas.value.height
  context.clearRect(0, 0, width, height)
  context.fillStyle = '#020617'
  context.fillRect(0, 0, width, height)

  if (!image.complete || !image.naturalWidth) {
    context.fillStyle = '#e2e8f0'
    context.font = '600 18px system-ui'
    context.textAlign = 'center'
    context.fillText('Изображение загружается…', width / 2, height / 2)
    return
  }

  const aspectRatio = image.naturalWidth / image.naturalHeight
  const cols = Math.max(8, Math.min(200, Math.floor((populationValue.value * aspectRatio) ** 0.5)))
  const rows = Math.max(8, Math.min(200, Math.floor(populationValue.value / cols)))
  const pixelCanvas = document.createElement('canvas')
  pixelCanvas.width = cols
  pixelCanvas.height = rows
  const pixelContext = pixelCanvas.getContext('2d')
  pixelContext.imageSmoothingEnabled = false
  pixelContext.drawImage(image, 0, 0, cols, rows)

  context.imageSmoothingEnabled = false
  context.drawImage(pixelCanvas, 0, 0, width, height)
}

function closeOnEscape(event) {
  if (event.key === 'Escape') emit('close')
}

watch(
  () => props.species,
  () => {
    populationValue.value = props.species.population
    activeLanguage.value = 'ru'
    image.src = imagePath.value
    image.onload = drawPixelatedImage
    nextTick(drawPixelatedImage)
  },
  { immediate: true },
)

watch(populationValue, drawPixelatedImage)
onMounted(() => window.addEventListener('keydown', closeOnEscape))
onBeforeUnmount(() => window.removeEventListener('keydown', closeOnEscape))
</script>

<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm sm:p-8" @click.self="emit('close')">
    <div
      class="mx-auto flex min-h-full max-w-6xl items-center justify-center"
      role="dialog"
      aria-modal="true"
      :aria-label="species.name_ru"
    >
      <div class="relative grid max-h-[calc(100vh-3rem)] w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl shadow-slate-950/60 lg:grid-cols-[1.08fr_1fr]">
        <button
          class="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900/90 text-2xl text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
          type="button"
          aria-label="Закрыть"
          @click="emit('close')"
        >
          ×
        </button>

        <div class="border-r border-slate-800 bg-slate-950 p-5 sm:p-8">
          <div class="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
            <canvas ref="canvas" width="840" height="620" class="block h-auto w-full" />
          </div>

          <div class="mt-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <label class="block text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400" for="population-slider">
              Популяция: {{ formattedPopulation }} особей
            </label>
            <input
              id="population-slider"
              v-model.number="populationValue"
              class="mt-4 w-full accent-sky-500"
              type="range"
              :min="species.population"
              :max="species.population_history"
              :step="1"
            />
            <div class="mt-3 flex justify-between text-xs text-slate-400">
              <span>Текущее значение: {{ species.population.toLocaleString('ru-RU') }}</span>
              <span>Исторический максимум: {{ species.population_history.toLocaleString('ru-RU') }}</span>
            </div>
          </div>
        </div>

        <div class="overflow-y-auto p-6 sm:p-8">
          <div class="mb-6 pr-8">
            <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-300">{{ species.status }} · {{ species.category }}</p>
            <h2 class="mt-3 text-4xl font-semibold tracking-tight text-white">{{ currentLanguage.name }}</h2>
            <p class="mt-2 text-sm text-slate-400">{{ species.scientific_name }}</p>
          </div>

          <div class="mb-6 flex gap-2 border-b border-slate-800 pb-3">
            <button
              v-for="language in languages"
              :key="language.key"
              type="button"
              class="border-b-2 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition"
              :class="activeLanguage === language.key ? 'border-sky-400 text-sky-200' : 'border-transparent text-slate-400 hover:text-slate-200'"
              @click="activeLanguage = language.key"
            >
              {{ language.label }}
            </button>
          </div>

          <p class="leading-7 text-slate-300">{{ currentLanguage.description }}</p>

          <dl class="mt-8 grid gap-5 border-t border-slate-800 pt-5 sm:grid-cols-2">
            <div>
              <dt class="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Ареал</dt>
              <dd class="mt-2 text-sm font-medium text-slate-100">{{ species.region }}</dd>
            </div>
            <div>
              <dt class="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Численность</dt>
              <dd class="mt-2 text-sm font-medium text-slate-100">{{ species.population.toLocaleString('ru-RU') }} особей</dd>
            </div>
          </dl>

          <div class="mt-8">
            <h3 class="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Основные угрозы</h3>
            <ul class="mt-3 flex flex-wrap gap-2">
              <li v-for="threat in species.threats" :key="threat" class="rounded-full border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200">
                {{ threat }}
              </li>
            </ul>
          </div>

          <div class="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h3 class="text-[11px] font-semibold uppercase tracking-[0.25em] text-sky-300">Финансирование защитных мероприятий</h3>
            <p class="mt-3 text-sm leading-6 text-slate-300">
              Поддержка природоохранных программ, мониторинга и восстановления мест обитания.
            </p>
            <div class="mt-4 space-y-3">
              <a
                v-for="fund in funding"
                :key="fund.name"
                :href="fund.url"
                target="_blank"
                rel="noreferrer"
                class="block rounded-xl border border-slate-700 bg-slate-950 p-4 transition hover:border-sky-500 hover:bg-slate-800"
              >
                <span class="block text-sm font-semibold text-white">{{ fund.name }}</span>
                <span class="mt-1 block text-xs uppercase tracking-[0.2em] text-slate-400">{{ fund.account }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
