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
  <a class="skip-link" href="#catalog">Перейти к каталогу</a>
  <header class="page-header page-container">
    <a class="brand" href="#" aria-label="Redbook — главная страница">
      <span class="brand-mark" aria-hidden="true">R<span>.</span></span>
      <span>Redbook<span class="brand-caption">Кыргызстан</span></span>
    </a>
    <a class="header-link" href="#catalog" aria-label="Каталог видов">Каталог <span aria-hidden="true">↗</span></a>
  </header>
  <main>
    <section class="hero page-container" aria-labelledby="page-title">
      <div class="hero-copy">
        <p class="eyebrow"><span class="red-rule" aria-hidden="true"></span> Цифровая энциклопедия природы</p>
        <h1 id="page-title">Красная книга<br /><span>Кыргызстана</span></h1>
        <p class="hero-description">Узнавать, чтобы сохранять.</p>
        <p class="hero-intro">Учебный каталог редких видов: местообитания, угрозы и меры охраны. Каждая запись — повод внимательнее посмотреть на природу вокруг.</p>
        <a class="text-link hero-link" href="#catalog">Исследовать каталог <span aria-hidden="true">↓</span></a>
      </div>
      <div class="hero-landscape" aria-hidden="true">
        <svg viewBox="0 0 520 340" fill="none">
          <circle cx="382" cy="83" r="35" stroke="currentColor" />
          <path d="m12 270 137-139 45 45 103-131 210 231M100 340 149 131m45 45 43 164M297 45l-35 157 41 43 29 95M12 297l94-30 94 30 100-42 113 47 94-12M12 318l100-22 88 22 103-31 105 37 99-15" stroke="currentColor" />
          <path d="m258 94 39-49 63 70-41-17-22 17-20-29-19 8Z" fill="currentColor" opacity=".13" />
          <path d="M12 340h496M12 15v310M508 15v310" stroke="currentColor" opacity=".25" />
        </svg>
        <p>Природа Кыргызстана<span>Наблюдать · изучать · сохранять</span></p>
      </div>
    </section>
    <section id="catalog" class="catalog page-container" aria-labelledby="catalog-title" tabindex="-1" :aria-busy="isLoading">
      <div class="catalog-heading">
        <div>
          <p class="eyebrow">Каталог видов</p>
          <h2 id="catalog-title">Кого мы защищаем</h2>
        </div>
        <p class="catalog-note">Научные источники и статус проверки<br class="hidden sm:block" /> указаны в каждой записи.</p>
      </div>
      <div class="filter-bar">
        <div class="filter-field">
          <label for="status-filter">Статус IUCN</label>
          <select id="status-filter" v-model="selectedStatus" aria-label="Фильтр по статусу IUCN">
            <option v-for="status in statuses" :key="status.value" :value="status.value">{{ status.label }}</option>
          </select>
        </div>
        <div class="filter-field">
          <label for="region-filter">Регион</label>
          <select id="region-filter" v-model="selectedRegion" aria-label="Фильтр по региону">
            <option v-for="region in regions" :key="region" :value="region">{{ region === 'ALL' ? 'Все регионы' : region }}</option>
          </select>
        </div>
        <p class="result-count" role="status" aria-live="polite">{{ isLoading ? 'Загрузка…' : errorMessage ? 'Каталог недоступен' : `Найдено записей: ${filteredSpecies.length}` }}</p>
      </div>
      <p v-if="isLoading" class="catalog-message" role="status">Загружаем каталог видов…</p>
      <p v-else-if="errorMessage" class="catalog-message error-message" role="alert">{{ errorMessage }}</p>
      <p v-else-if="filteredSpecies.length === 0" class="catalog-message">По выбранным фильтрам виды не найдены. Попробуйте изменить статус или регион.</p>
      <div v-else class="species-grid">
        <SpeciesCard v-for="animal in filteredSpecies" :key="animal.id" :species="animal" @open="openSpecies" />
      </div>
    </section>
  </main>
  <footer class="page-footer page-container">
    <p><span class="footer-brand">Redbook</span> · Образовательный проект</p>
    <p>Пикселизация — условная иллюстрация,<br class="hidden sm:block" /> а не подсчёт особей.</p>
  </footer>
  <SpeciesModal v-if="selectedSpecies" :species="selectedSpecies" @close="closeSpecies" />
</template>
