<script setup>
import ErrorNotice from './components/ErrorNotice.vue'
import BrandLogo from './components/BrandLogo.vue'
import { syncLocaleMetadata, useLocale } from './composables/useLocale.js'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { searchContentLanguage } from './data/localization.js'
import { groupLabel, regionFilterLabel, statusDetails } from './data/presentation.js'
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
import { loadSpeciesCatalog } from './data/catalog-repository.js'
import { createSearchIndex, searchSpecies } from './data/catalog-search.js'
import { validateQuestions } from './data/quiz/model.js'

const { t, language, siteLanguage, setLanguage } = useLocale()

const species = ref([])
const catalog = useCatalog(species)
// Header search sees the whole catalogue even when page filters are active.
const headerSearchIndex = computed(() => createSearchIndex(species.value))
const headerSearchResults = computed(() => searchSpecies(headerSearchIndex.value, catalog.query.value))
const { query, status: selectedStatus, region: selectedRegion, group: selectedGroup, options, results, page, fuzzy, hasFilters } = catalog
const isLoading = ref(true)
const errorMessage = ref('')
const selectedSpecies = ref(null)
const contentLanguage = ref(null)

// Stable page-height reservation for the fixed, scroll-aware navigation.
const headerElement = ref(null)
const headerHeight = ref(122)
const headerCompact = ref(false)
const headerHidden = ref(false)
let previousScrollY = 0
function measureExpandedHeader() {
  if (!headerElement.value || headerCompact.value) return
  const measured = Math.ceil(headerElement.value.getBoundingClientRect().height)
  if (Math.abs(headerHeight.value - measured) > 1) headerHeight.value = measured
}
function handlePageScroll() {
  const y = Math.max(0, window.scrollY)
  if (y <= 36) {
    headerCompact.value = false
    headerHidden.value = false
    previousScrollY = y
    return
  }
  headerCompact.value = true
  const delta = y - previousScrollY
  // Small scroll oscillations must not make the header flicker.
  if (delta >= 9 && y > 160 && !headerElement.value?.contains(document.activeElement)) {
    headerHidden.value = true
  } else if (delta <= -9) {
    headerHidden.value = false
  }
  if (Math.abs(delta) >= 9) previousScrollY = y
}
function revealHeaderOnFocus() { headerHidden.value = false }
const scrollBehavior = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
syncLocaleMetadata()
const translatedGroups = computed(() => options.value.groups.map(option => ({ ...option, label: option.value === 'ALL' ? t('ui.m140') : groupLabel({ group: option.value }, language.value) })))
function statusLabel(value) { return value === 'ALL' ? t('status.all') : statusDetails({ iucn: { category: value } }, language.value).label }
// /map is a real shareable page; existing quiz, lesson and support views stay intact.
const isMapPath = () => typeof window !== 'undefined' && window.location.pathname.replace(/\/$/, '') === '/map'
const readMapRegion = () => typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('region') || '' : ''
const activeView = ref(isMapPath() ? 'map' : 'catalog')
const mapRouteRegion = ref(isMapPath() ? readMapRegion() : '')

function onBrowserNavigation() {
  activeView.value = isMapPath() ? 'map' : 'catalog'
  if (activeView.value === 'map') mapRouteRegion.value = readMapRegion()
  window.scrollTo({ top: 0, behavior: 'instant' })
}
function leaveMapUrl() {
  if (isMapPath()) window.history.pushState({}, '', '/')
  mapRouteRegion.value = ''
}
async function showMap(regionId = '') {
  if (activeView.value === 'lesson' && await lessonView.value?.exitFullscreen() === false) return
  const url = new URL('/map', window.location.origin)
  if (regionId) url.searchParams.set('region', regionId)
  window.history.pushState({}, '', url.pathname + url.search)
  mapRouteRegion.value = regionId
  activeView.value = 'map'
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.getElementById('map-title')?.focus({ preventScroll: true })
  })
}
function updateMapRegion(regionId) {
  if (!isMapPath()) return
  const url = new URL('/map', window.location.origin)
  if (regionId) url.searchParams.set('region', regionId)
  window.history.replaceState({}, '', url.pathname + url.search)
  mapRouteRegion.value = regionId
}

// Mount secondary sections only when first visited, then retain their session state.
const mountedViews = ref(new Set(['catalog']))
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
  mountedViews.value.add(view)
  if (isMapPath() && view !== 'map') leaveMapUrl()
  activeView.value = view
  await nextTick()
  const target = document.getElementById(focusId)
  target?.focus({ preventScroll: true })
  if (view === 'catalog') {
    // The catalogue remains an anchor within the homepage.
    target?.scrollIntoView({ block: 'start', behavior: scrollBehavior() })
  } else {
    // Other views replace main content; don't allow focus() to jump the page.
    headerHidden.value = false
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
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
  contentLanguage.value = null
  selectedSpecies.value = speciesItem
}

function openSearchResult(result) {
  contentLanguage.value = searchContentLanguage(result, null)
  selectedSpecies.value = result.species
}

function closeSpecies() {
  selectedSpecies.value = null
  contentLanguage.value = null
}

onMounted(async () => {
  previousScrollY = Math.max(0, window.scrollY)
  await nextTick()
  measureExpandedHeader()
  window.addEventListener('scroll', handlePageScroll, { passive: true })
  window.addEventListener('resize', measureExpandedHeader, { passive: true })
  window.addEventListener('popstate', onBrowserNavigation)
  handlePageScroll()
  try {
    species.value = await loadSpeciesCatalog()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
  try {
    if (errorMessage.value) throw new Error('Для викторины нужен доступный каталог видов.')
    const response = await fetch(`${import.meta.env.BASE_URL}data/quiz.json`)
    if (!response.ok) throw new Error(`HTTP ${response.status}: data/quiz.json`)
    const questions = await response.json()
    const errors = validateQuestions(questions, species.value)
    if (errors.length) throw new Error(errors[0])
    quizQuestions.value = questions
  } catch (error) { quizError.value = error.message }
  finally { quizLoading.value = false }
})
onUnmounted(() => {
  window.removeEventListener('scroll', handlePageScroll)
  window.removeEventListener('resize', measureExpandedHeader)
  window.removeEventListener('popstate', onBrowserNavigation)
})
</script>

<template>
  <a class="skip-link" :href="`#${activeView}`">{{ t('ui.m004') }}</a>
  <div class="header-space" aria-hidden="true" :style="{ height: `${headerHeight}px` }"></div>
  <header ref="headerElement" class="page-header page-container" :class="{ 'header-compact': headerCompact, 'header-hidden': headerHidden }" @focusin="revealHeaderOnFocus">
    <div class="header-main-row">
      <a class="brand" href="/" @click.prevent="showHome">
        <span><span class="sr-only">MURAS </span><BrandLogo /><span class="brand-caption">{{ t('brand.caption') }}</span><span class="sr-only"> — {{ t('brand.homeAction') }}</span></span>
      </a>
      <div class="header-search">
        <CatalogSearch v-model="query" :results="headerSearchResults" @open="openSearchResult" />
      </div>
      <label class="site-language"><span class="sr-only">{{ t('chooseLanguage') }}</span><select :value="siteLanguage" :aria-label="t('chooseLanguage')" @change="setLanguage($event.target.value)"><option value="ky" lang="ky">KY</option><option value="ru" lang="ru">RU</option><option value="en" lang="en">EN</option></select></label>
    </div>
    <nav class="main-navigation" :aria-label="t('ui.m007')">
      <a class="header-link" href="#catalog" :aria-label="`${t('ui.m009')} — ${t('ui.m008')}`" :aria-current="activeView === 'catalog' ? 'page' : undefined" @click.prevent="showView('catalog')">{{ t('ui.m009') }}</a>
      <a class="header-link" href="/map" :aria-current="activeView === 'map' ? 'page' : undefined" @click.prevent="showMap()">{{ t('ui.m010') }}</a>
      <a class="header-link" href="#quiz" :aria-current="activeView === 'quiz' ? 'page' : undefined" @click.prevent="showView('quiz')">{{ t('ui.m011') }}</a>
      <a class="header-link" href="#lesson" :aria-current="activeView === 'lesson' ? 'page' : undefined" @click.prevent="showView('lesson')">{{ t('ui.m012') }}</a>
      <a class="header-link" href="#support" :aria-current="activeView === 'support' ? 'page' : undefined" @click.prevent="openSupport()">{{ t('ui.m013') }}</a>
    </nav>
  </header>
  <main>
    <section v-show="activeView === 'catalog'" class="hero page-container" aria-labelledby="page-title">
      <div class="hero-copy">
        <p class="eyebrow"><span class="red-rule" aria-hidden="true"></span> {{ t('ui.m014') }}</p>
        <h1 id="page-title">{{ t('ui.m015') }}<br /><span>{{ t('ui.m016') }}</span></h1>
        <p class="hero-description">{{ t('ui.m017') }}</p>
        <p class="hero-intro">{{ t('ui.m018') }}</p>
        <a class="text-link hero-link" href="#catalog" @click.prevent="showView('catalog', 'catalog')">{{ t('ui.m019') }} <span aria-hidden="true">↓</span></a>
      </div>
      <div class="hero-landscape" aria-hidden="true">
        <svg viewBox="0 0 520 340" fill="none">
          <circle cx="382" cy="83" r="35" stroke="currentColor" />
          <path d="m12 270 137-139 45 45 103-131 210 231M100 340 149 131m45 45 43 164M297 45l-35 157 41 43 29 95M12 297l94-30 94 30 100-42 113 47 94-12M12 318l100-22 88 22 103-31 105 37 99-15" stroke="currentColor" />
          <path d="m258 94 39-49 63 70-41-17-22 17-20-29-19 8Z" fill="currentColor" opacity=".13" />
          <path d="M12 340h496M12 15v310M508 15v310" stroke="currentColor" opacity=".25" />
        </svg>
        <p>{{ t('ui.m020') }}<span>{{ t('ui.m021') }}</span></p>
      </div>
    </section>
    <MapSection v-show="activeView === 'catalog' || activeView === 'map'" :mode="activeView === 'map' ? 'full' : 'preview'" :route-region="mapRouteRegion" :species="species" :loading="isLoading" :error="errorMessage" @open="openSpecies" @details="showMap" @regionchange="updateMapRegion" />
    <section v-show="activeView === 'catalog'" id="catalog" class="catalog page-container" aria-labelledby="catalog-title" tabindex="-1" :aria-busy="isLoading">
      <div class="catalog-heading">
        <div>
          <p class="eyebrow">{{ t('ui.m008') }}</p>
          <h2 id="catalog-title">{{ t('ui.m022') }}</h2>
        </div>
        <p class="catalog-note">{{ t('ui.m023') }}<br class="hidden sm:block" /> {{ t('ui.m024') }}</p>
      </div>
      <div class="catalog-tools">
        <GroupFilter v-model="selectedGroup" :options="translatedGroups" :label="t('ui.m025')" />
      <div class="filter-bar">
        <div class="filter-field">
          <label for="status-filter">{{ t('ui.m026') }}</label>
          <select id="status-filter" v-model="selectedStatus" :aria-label="t('ui.m027')">
            <option v-for="status in options.statuses" :key="status.value" :value="status.value">{{ statusLabel(status.value) }}</option>
          </select>
        </div>
        <div class="filter-field">
          <label for="region-filter">{{ t('ui.m028') }}</label>
          <select id="region-filter" v-model="selectedRegion" :aria-label="t('ui.m029')">
            <option v-for="region in options.regions" :key="region" :value="region">{{ regionFilterLabel(region, language) }}</option>
          </select>
        </div>
        <button type="button" class="catalog-reset" :disabled="!hasFilters" @click="catalog.reset">{{ t('ui.m031') }}</button>
      </div>
        <p class="result-count" role="status" aria-live="polite" aria-atomic="true">{{ isLoading ? t('ui.m032') : errorMessage ? t('ui.m033') : fuzzy ? t('ui.m034', { p0: results.length }) : t('ui.m035', { p0: results.length }) }}</p>
      </div>
      <p v-if="isLoading" class="catalog-message" role="status">{{ t('ui.m036') }}</p>
      <ErrorNotice v-else-if="errorMessage" :message="errorMessage"></ErrorNotice>
      <p v-else-if="results.length === 0" class="catalog-message">{{ t('ui.m037') }}</p>
      <div v-else class="species-grid">
        <SpeciesCard v-for="result in page.entries" :key="result.species.id" :species="result.species" @open="openSearchResult(result)" />
      </div>
      <div v-if="page.remaining" class="catalog-more"><button type="button" class="quiz-secondary" @click="showMoreSpecies">{{ t('ui.m038') }} {{ Math.min(12, page.remaining) }}</button><p>{{ t('ui.m039') }} {{ page.entries.length }} {{ t('ui.m040') }} {{ results.length }}</p></div>
    </section>
    <QuizView v-if="mountedViews.has('quiz')" v-show="activeView === 'quiz'" :questions="quizQuestions" :species="species" :loading="quizLoading" :error="quizError" :return-to-lesson="quizFromLesson"
      @catalog="showView('catalog')" @study="studySpecies" @lesson="showView('lesson')" />
    <LessonView v-if="mountedViews.has('lesson')" ref="lessonView" v-show="activeView === 'lesson'" :species="species" :active="activeView === 'lesson'" :loading="isLoading" :error="errorMessage"
      @catalog="showView('catalog')" @quiz="openQuizFromLesson" />
    <SupportView v-if="mountedViews.has('support')" v-show="activeView === 'support'" :species="species" :species-id="supportSpeciesId" :loading="isLoading" :error="errorMessage"
      @select="supportSpeciesId = $event" @study="studySpecies" @catalog="showView('catalog')" />
  </main>
  <footer class="page-footer page-container">
    <p><span class="footer-brand">Muras</span> {{ t('ui.m041') }}</p>
    <p>{{ t('ui.m042') }}<br class="hidden sm:block" /> {{ t('ui.m043') }}</p>
  </footer>
  <SpeciesModal v-if="selectedSpecies" :species="selectedSpecies" :content-language="contentLanguage" @close="closeSpecies" @support="openSupport" />
</template>
