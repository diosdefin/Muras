<script setup>
import { nextTick, onMounted, ref } from 'vue'
import SpeciesCard from './components/SpeciesCard.vue'
import SpeciesModal from './components/SpeciesModal.vue'
import QuizView from './components/quiz/QuizView.vue'
import LessonView from './components/lesson/LessonView.vue'
import MapSection from './components/map/MapSection.vue'
import SupportView from './components/support/SupportView.vue'
import CatalogSearch from './components/CatalogSearch.vue'
import GroupFilter from './components/GroupFilter.vue'
import { useCatalog } from './composables/useCatalog.js'
import './components/catalog.css'
import { validateSpecies } from './data/species-model.js'
import { validateQuestions } from './data/quiz/model.js'

const species = ref([])
const catalog = useCatalog(species)
const { query, status: selectedStatus, region: selectedRegion, group: selectedGroup, options, results, page, fuzzy, hasFilters } = catalog
const isLoading = ref(true)
const errorMessage = ref('')
const selectedSpecies = ref(null)
const activeView = ref('catalog')
const quizQuestions = ref([])
const quizLoading = ref(true)
const quizError = ref('')
const lessonView = ref(null)
const quizFromLesson = ref(false)
const supportSpeciesId = ref(null)

async function openSupport(id = null) {
  supportSpeciesId.value = species.value.some(record => record.id === id) ? id : null
  closeSpecies()
  await nextTick() // Let the dialog restore background scrolling/focus before switching views.
  await showView('support')
}

async function showView(view, focusId = view) {
  if (activeView.value === 'lesson' && view !== 'lesson' && await lessonView.value?.exitFullscreen() === false) return
  activeView.value = view
  await nextTick()
  if (view === 'support') {
    document.getElementById(focusId)?.focus({ preventScroll: true })
    window.scrollTo({ top: 0, behavior: 'instant' })
  } else if (view === 'catalog') {
    const target = document.getElementById(focusId)
    target?.focus({ preventScroll: true })
    target?.scrollIntoView({ block: 'start', behavior: 'instant' })
  } else document.getElementById(focusId)?.focus()
}

function openQuizFromLesson() {
  quizFromLesson.value = true
  return showView('quiz')
}

async function showHome() {
  await showView('catalog')
  if (activeView.value !== 'catalog') return
  window.scrollTo({ top: 0, behavior: 'instant' })
  document.querySelector('.brand')?.focus({ preventScroll: true })
}

function studySpecies(id) {
  const record = species.value.find(item => item.id === id)
  if (record) openSpecies(record)
}

async function showMoreSpecies() {
  const previousCount = page.value.entries.length
  catalog.more()
  await nextTick()
  document.querySelectorAll('.species-grid .card-open')[previousCount]?.focus()
}

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
  try {
    if (errorMessage.value) throw new Error('Для викторины нужен доступный каталог видов.')
    const response = await fetch(`${import.meta.env.BASE_URL}data/quiz.json`)
    if (!response.ok) throw new Error(`Не удалось загрузить вопросы: ${response.status}.`)
    const questions = await response.json()
    const errors = validateQuestions(questions, species.value)
    if (errors.length) throw new Error(`Некорректные вопросы: ${errors[0]}`)
    quizQuestions.value = questions
  } catch (error) { quizError.value = error.message }
  finally { quizLoading.value = false }
})
</script>

<template>
  <a class="skip-link" :href="`#${activeView}`">Перейти к содержимому</a>
  <header class="page-header page-container">
    <a class="brand" href="#" aria-label="Redbook — главная страница" @click.prevent="showHome">
      <span class="brand-mark" aria-hidden="true">R<span>.</span></span>
      <span>Redbook<span class="brand-caption">Кыргызстан</span></span>
    </a>
    <nav class="main-navigation" aria-label="Основная навигация">
      <a class="header-link" href="#catalog" aria-label="Каталог видов" :aria-current="activeView === 'catalog' ? 'page' : undefined" @click.prevent="showView('catalog')">Каталог</a>
      <a class="header-link" href="#map" @click.prevent="showView('catalog', 'map')">Карта</a>
      <a class="header-link" href="#quiz" :aria-current="activeView === 'quiz' ? 'page' : undefined" @click.prevent="showView('quiz')">Викторина</a>
      <a class="header-link" href="#lesson" :aria-current="activeView === 'lesson' ? 'page' : undefined" @click.prevent="showView('lesson')">Режим урока</a>
      <a class="header-link" href="#support" :aria-current="activeView === 'support' ? 'page' : undefined" @click.prevent="openSupport()">Сохрани вид</a>
    </nav>
  </header>
  <main>
    <section v-show="activeView === 'catalog'" class="hero page-container" aria-labelledby="page-title">
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
    <MapSection v-show="activeView === 'catalog'" :species="species" :loading="isLoading" :error="errorMessage" @open="openSpecies" />
    <section v-show="activeView === 'catalog'" id="catalog" class="catalog page-container" aria-labelledby="catalog-title" tabindex="-1" :aria-busy="isLoading">
      <div class="catalog-heading">
        <div>
          <p class="eyebrow">Каталог видов</p>
          <h2 id="catalog-title">Кого мы защищаем</h2>
        </div>
        <p class="catalog-note">Научные источники и статус проверки<br class="hidden sm:block" /> указаны в каждой записи.</p>
      </div>
      <div class="catalog-tools">
        <CatalogSearch v-model="query" :results="results" @open="openSpecies" />
        <GroupFilter v-model="selectedGroup" :options="options.groups" label="Группа видов каталога" />
      <div class="filter-bar">
        <div class="filter-field">
          <label for="status-filter">Статус IUCN</label>
          <select id="status-filter" v-model="selectedStatus" aria-label="Фильтр по статусу IUCN">
            <option v-for="status in options.statuses" :key="status.value" :value="status.value">{{ status.label }}</option>
          </select>
        </div>
        <div class="filter-field">
          <label for="region-filter">Регион</label>
          <select id="region-filter" v-model="selectedRegion" aria-label="Фильтр по региону">
            <option v-for="region in options.regions" :key="region" :value="region">{{ region === 'ALL' ? 'Все регионы' : region }}</option>
          </select>
        </div>
        <button type="button" class="catalog-reset" :disabled="!hasFilters" @click="catalog.reset">Сбросить фильтры</button>
      </div>
        <p class="result-count" role="status" aria-live="polite" aria-atomic="true">{{ isLoading ? 'Загрузка…' : errorMessage ? 'Каталог недоступен' : fuzzy ? `Возможные совпадения: ${results.length}. Проверьте название.` : `Найдено записей: ${results.length}` }}</p>
      </div>
      <p v-if="isLoading" class="catalog-message" role="status">Загружаем каталог видов…</p>
      <p v-else-if="errorMessage" class="catalog-message error-message" role="alert">{{ errorMessage }}</p>
      <p v-else-if="results.length === 0" class="catalog-message">Виды не найдены. Проверьте название или сбросьте фильтры.</p>
      <div v-else class="species-grid">
        <SpeciesCard v-for="result in page.entries" :key="result.species.id" :species="result.species" @open="openSpecies" />
      </div>
      <div v-if="page.remaining" class="catalog-more"><button type="button" class="quiz-secondary" @click="showMoreSpecies">Показать ещё {{ Math.min(12, page.remaining) }}</button><p>Показано {{ page.entries.length }} из {{ results.length }}</p></div>
    </section>
    <QuizView v-show="activeView === 'quiz'" :questions="quizQuestions" :species="species" :loading="quizLoading" :error="quizError" :return-to-lesson="quizFromLesson"
      @catalog="showView('catalog')" @study="studySpecies" @lesson="showView('lesson')" />
    <LessonView ref="lessonView" v-show="activeView === 'lesson'" :species="species" :active="activeView === 'lesson'" :loading="isLoading" :error="errorMessage"
      @catalog="showView('catalog')" @quiz="openQuizFromLesson" />
    <SupportView v-show="activeView === 'support'" :species="species" :species-id="supportSpeciesId" :loading="isLoading" :error="errorMessage"
      @select="supportSpeciesId = $event" @study="studySpecies" @catalog="showView('catalog')" />
  </main>
  <footer class="page-footer page-container">
    <p><span class="footer-brand">Redbook</span> · Образовательный проект</p>
    <p>Пикселизация — условная иллюстрация,<br class="hidden sm:block" /> а не подсчёт особей.</p>
  </footer>
  <SpeciesModal v-if="selectedSpecies" :species="selectedSpecies" @close="closeSpecies" @support="openSupport" />
</template>
