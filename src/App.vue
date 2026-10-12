<script setup>
import { computed, onMounted, ref } from 'vue'
import SpeciesCard from './components/SpeciesCard.vue'
import SpeciesModal from './components/SpeciesModal.vue'

const species = ref([])
const activeCategory = ref('all')
const isLoading = ref(true)
const errorMessage = ref('')
const selectedSpecies = ref(null)

const categoryOptions = [
  { value: 'all', label: 'Все' },
  { value: 'mammals', label: 'Млекопитающие' },
  { value: 'birds', label: 'Птицы' },
  { value: 'plants', label: 'Растения' },
  { value: 'insects', label: 'Насекомые' },
]

const filteredSpecies = computed(() =>
  species.value.filter((item) => activeCategory.value === 'all' || item.category === activeCategory.value),
)

const categorySummary = computed(() => {
  const totals = {
    all: species.value.length,
    mammals: species.value.filter((item) => item.category === 'mammals').length,
    birds: species.value.filter((item) => item.category === 'birds').length,
    plants: species.value.filter((item) => item.category === 'plants').length,
    insects: species.value.filter((item) => item.category === 'insects').length,
  }
  return totals
})

function openSpecies(speciesItem) {
  selectedSpecies.value = speciesItem
}

function closeSpecies() {
  selectedSpecies.value = null
}

onMounted(async () => {
  try {
    const response = await fetch('/data/species.json')
    if (!response.ok) {
      throw new Error(`Не удалось загрузить данные: ${response.status}`)
    }
    species.value = await response.json()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <main class="min-h-screen bg-slate-950 text-slate-100">
    <header class="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      <div class="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6 sm:px-10 lg:flex-row lg:items-end lg:justify-between lg:px-16">
        <div class="max-w-3xl">
          <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-300">Кыргызстан · National Red List</p>
          <h1 class="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Красная книга Кыргызской Республики.<br />
            <span class="text-slate-300">Цифровой мониторинг популяций</span>
          </h1>
        </div>

        <div class="flex flex-wrap gap-2" aria-label="Фильтр по категориям">
          <button
            v-for="category in categoryOptions"
            :key="category.value"
            type="button"
            class="rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-sky-500"
            :class="activeCategory === category.value
              ? 'border-sky-500 bg-sky-500/10 text-sky-200'
              : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600 hover:text-slate-100'"
            :aria-pressed="activeCategory === category.value"
            @click="activeCategory = category.value"
          >
            {{ category.label }}
            <span class="ml-1 text-xs text-slate-400">{{ categorySummary[category.value] }}</span>
          </button>
        </div>
      </div>
    </header>

    <section class="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-16">
      <div class="mb-8 grid gap-4 md:grid-cols-3">
        <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <p class="text-[11px] uppercase tracking-[0.25em] text-slate-400">Всего видов</p>
          <p class="mt-3 text-3xl font-semibold text-white">{{ species.length }}</p>
        </div>
        <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <p class="text-[11px] uppercase tracking-[0.25em] text-slate-400">Под угрозой</p>
          <p class="mt-3 text-3xl font-semibold text-amber-300">{{ species.filter((item) => item.status !== 'LC').length }}</p>
        </div>
        <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <p class="text-[11px] uppercase tracking-[0.25em] text-slate-400">Мониторинг</p>
          <p class="mt-3 text-3xl font-semibold text-emerald-300">24/7</p>
        </div>
      </div>

      <div class="mb-8 flex items-end justify-between gap-4">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-sky-300">Каталог видов</p>
          <h2 class="mt-2 text-2xl font-semibold text-white">Эталонный реестр популяций</h2>
        </div>
      </div>

      <p v-if="isLoading" class="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center text-slate-400">
        Загрузка официального каталога…
      </p>
      <p v-else-if="errorMessage" class="rounded-2xl border border-red-500/40 bg-red-950/30 p-8 text-center text-red-200">
        {{ errorMessage }}
      </p>
      <p v-else-if="filteredSpecies.length === 0" class="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center text-slate-400">
        В этом разделе данных пока нет.
      </p>
      <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <SpeciesCard
          v-for="animal in filteredSpecies"
          :key="animal.id"
          :species="animal"
          @open="openSpecies"
        />
      </div>
    </section>

    <SpeciesModal
      v-if="selectedSpecies"
      :species="selectedSpecies"
      @close="closeSpecies"
    />
  </main>
</template>
