<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  species: {
    type: Array,
    required: true,
  },
})

const canvas = ref(null)
const currentSpecies = ref(null)
const selectedAnswer = ref('')
const guessedFirstTry = ref(0)
const attempts = ref(0)
const isComplete = ref(false)
const image = new Image()

const fallbackOptions = ['Манул', 'Сайгак', 'Кулан', 'Медведь']
const pixelGrid = computed(() => (attempts.value === 0 ? 6 : 14))
const answerOptions = computed(() => {
  if (!currentSpecies.value) return []

  const names = props.species.map((item) => item.name_ru).filter(Boolean)
  const distractors = [...new Set([...names, ...fallbackOptions])]
    .filter((name) => name !== currentSpecies.value.name_ru)

  return [currentSpecies.value.name_ru, ...distractors]
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)
})

function imagePath(speciesItem) {
  return `/images/source/${speciesItem.id}.jpg`
}

function drawPixelatedImage() {
  const target = canvas.value
  const context = target?.getContext('2d')
  if (!target || !context) return

  const width = target.width
  const height = target.height
  context.clearRect(0, 0, width, height)
  context.fillStyle = '#064e3b'
  context.fillRect(0, 0, width, height)

  if (!image.complete || !image.naturalWidth) {
    context.fillStyle = '#a7f3d0'
    context.font = '600 16px system-ui'
    context.textAlign = 'center'
    context.fillText('Изображение загружается…', width / 2, height / 2)
    return
  }

  const pixelCanvas = document.createElement('canvas')
  const aspectRatio = image.naturalWidth / image.naturalHeight
  pixelCanvas.width = pixelGrid.value
  pixelCanvas.height = Math.max(1, Math.round(pixelGrid.value / aspectRatio))
  const pixelContext = pixelCanvas.getContext('2d')
  pixelContext.imageSmoothingEnabled = false
  pixelContext.drawImage(image, 0, 0, pixelCanvas.width, pixelCanvas.height)

  context.imageSmoothingEnabled = false
  context.drawImage(pixelCanvas, 0, 0, width, height)
}

function chooseSpecies() {
  if (!props.species.length) return
  currentSpecies.value = props.species[Math.floor(Math.random() * props.species.length)]
  selectedAnswer.value = ''
  attempts.value = 0
  isComplete.value = false
  image.onload = drawPixelatedImage
  image.onerror = () => {
    if (currentSpecies.value.image && image.src !== new URL(currentSpecies.value.image, window.location.origin).href) {
      image.src = currentSpecies.value.image
      return
    }
    drawPixelatedImage()
  }
  image.src = imagePath(currentSpecies.value)
  nextTick(drawPixelatedImage)
}

function chooseAnswer(answer) {
  if (isComplete.value || selectedAnswer.value === answer) return

  if (answer === currentSpecies.value.name_ru) {
    if (attempts.value === 0) guessedFirstTry.value += 1
    selectedAnswer.value = answer
    isComplete.value = true
    drawPixelatedImage()
    return
  }

  selectedAnswer.value = answer
  attempts.value += 1
  drawPixelatedImage()
}

watch(() => props.species, chooseSpecies, { immediate: true })
onBeforeUnmount(() => {
  image.onload = null
  image.onerror = null
})
</script>

<template>
  <section class="mx-auto max-w-4xl px-6 py-10 sm:px-10 lg:px-16" aria-labelledby="quiz-title">
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Режим урока</p>
        <h2 id="quiz-title" class="mt-2 text-3xl font-black tracking-tight text-slate-950">
          Угадай животное по пикселям
        </h2>
        <p class="mt-3 max-w-2xl leading-7 text-slate-600">
          Внимательно смотри на силуэт: после ошибки изображение станет немного четче.
        </p>
      </div>
      <div class="rounded-2xl bg-emerald-950 px-5 py-3 text-white shadow-lg shadow-emerald-950/10">
        <p class="text-xs font-bold uppercase tracking-wider text-emerald-300">Угадано с первого раза</p>
        <p class="mt-1 text-2xl font-black">{{ guessedFirstTry }}</p>
      </div>
    </div>

    <div class="overflow-hidden rounded-3xl bg-emerald-950 p-3 shadow-2xl shadow-emerald-950/15 sm:p-5">
      <div class="relative overflow-hidden rounded-2xl bg-emerald-900">
        <canvas
          ref="canvas"
          width="900"
          height="620"
          class="block aspect-[9/6] h-auto w-full"
          :aria-label="isComplete ? currentSpecies.name_ru : 'Сильно запикселенное изображение животного'"
          role="img"
        />
        <div
          v-if="isComplete"
          class="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/75 p-6 text-center text-white backdrop-blur-[2px]"
        >
          <div class="animate-[celebrate_700ms_ease-out] text-5xl" aria-hidden="true">🎉</div>
          <p class="mt-3 text-3xl font-black">Правильно!</p>
          <p class="mt-2 text-emerald-100">Это {{ currentSpecies.name_ru }}</p>
        </div>
      </div>

      <div v-if="!isComplete" class="grid gap-3 p-2 pt-5 sm:grid-cols-2">
        <button
          v-for="option in answerOptions"
          :key="option"
          type="button"
          class="rounded-2xl border border-emerald-700/70 bg-emerald-900 px-5 py-4 text-left font-bold text-white transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-45"
          :disabled="selectedAnswer === option"
          @click="chooseAnswer(option)"
        >
          {{ option }}
          <span v-if="selectedAnswer === option" class="float-right text-emerald-300">Попробуйте ещё</span>
        </button>
      </div>
      <div v-else class="p-2 pt-5">
        <button
          type="button"
          class="w-full rounded-2xl bg-emerald-300 px-5 py-4 font-black text-emerald-950 transition hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          @click="chooseSpecies"
        >
          Следующее животное <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  </section>
</template>
