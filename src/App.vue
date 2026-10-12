<script setup>
import { computed, onMounted, ref } from 'vue'
import SpeciesCard from './components/SpeciesCard.vue'
import SpeciesModal from './components/SpeciesModal.vue'
import { validateSpecies } from './data/species-model.js'
import { regionNames, STATUS_DETAILS } from './data/presentation.js'

const species = ref([])
const selectedStatus = ref('ALL')
const selectedRegion = ref('ALL')
const isLoading = ref(true)
const errorMessage = ref('')
const selectedSpecies = ref(null)

const statuses = [
  { value: 'ALL', label: 'Все виды' },
  ...Object.entries(STATUS_DETAILS).map(([value, detail]) => ({ value, label: `IUCN ${value} · ${detail.label}` })),
  { value: 'UNKNOWN', label: 'IUCN · статус неизвестен' },
]

const regions = computed(() => {
  const availableRegions = new Set(
    species.value.flatMap((item) => regionNames(item).length ? regionNames(item) : ['Регион неизвестен']),
  )

  return ['ALL', ...availableRegions]
})

const filteredSpecies = computed(() =>
  species.value.filter((item) => {
    const regions = regionNames(item)
    const matchesStatus = selectedStatus.value === 'ALL' || (item.iucn.category || 'UNKNOWN') === selectedStatus.value
    const matchesRegion = selectedRegion.value === 'ALL' || regions.includes(selectedRegion.value) ||
      (selectedRegion.value === 'Регион неизвестен' && regions.length === 0)
    return matchesStatus && matchesRegion
  }),
)

function openSpecies(speciesItem) {
  selectedSpecies.value = speciesItem
}

function closeSpecies() {
  selectedSpecies.value = null
}

onMounted(async () => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/species.json`)
    if (!response.ok) {
      throw new Error(`Не удалось загрузить данные: ${response.status}`)
    }
    const records = await response.json()
    const validationErrors = validateSpecies(records, 'catalog', { publicData: true })
    if (validationErrors.length) throw new Error(`Некорректные данные каталога: ${validationErrors[0]}`)
    species.value = records
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <main class="min-h-screen bg-[#f3f7f1] text-slate-900">
    <header class="overflow-hidden bg-emerald-950 px-6 py-16 text-white sm:px-10 lg:px-16">
      <div class="mx-auto max-w-7xl">
        <div class="max-w-3xl">
          <p class="mb-5 text-sm font-bold uppercase tracking-[0.35em] text-emerald-300">
            Redbook · Кыргызстан
          </p>
          <h1 class="text-4xl font-black tracking-tight sm:text-6xl">
            Красная книга<br />
            <span class="text-emerald-300">в пикселях</span>
          </h1>
          <p class="mt-6 max-w-2xl text-lg leading-8 text-emerald-100/80">
            Учебный каталог редких видов Кыргызстана.
            Пикселизация — условная иллюстрация, а не подсчёт животных.
          </p>
        </div>
      </div>
    </header>

    <section class="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-16">
      <div class="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Каталог видов</p>
          <h2 class="mt-2 text-3xl font-black tracking-tight">Кого мы защищаем</h2>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row">
          <label class="sr-only" for="status-filter">Фильтр по статусу</label>
          <select
            id="status-filter"
            v-model="selectedStatus"
            class="rounded-xl border border-emerald-900/10 bg-white px-4 py-3 text-sm font-semibold shadow-sm outline-none ring-emerald-600 focus:ring-2"
          >
            <option v-for="status in statuses" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
          <label class="sr-only" for="region-filter">Фильтр по региону</label>
          <select
            id="region-filter"
            v-model="selectedRegion"
            class="rounded-xl border border-emerald-900/10 bg-white px-4 py-3 text-sm font-semibold shadow-sm outline-none ring-emerald-600 focus:ring-2"
          >
            <option v-for="region in regions" :key="region" :value="region">
              {{ region === 'ALL' ? 'Все регионы' : region }}
            </option>
          </select>
        </div>
      </div>

      <p v-if="isLoading" class="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
        Загружаем каталог видов…
      </p>
      <p v-else-if="errorMessage" class="rounded-2xl bg-red-50 p-8 text-center text-red-700">
        {{ errorMessage }}
      </p>
      <p v-else-if="filteredSpecies.length === 0" class="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
        По выбранным фильтрам виды не найдены.
      </p>
      <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
