<script setup>
import ErrorNotice from './components/ErrorNotice.vue'
import BrandLogo from './components/BrandLogo.vue'
import { syncLocaleMetadata, useLocale } from './composables/useLocale.js'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { speciesPath, speciesIdFromPath } from './data/species-routes.js'
import SpeciesPage from './components/SpeciesPage.vue'
import { searchContentLanguage } from './data/localization.js'
import { groupLabel, regionFilterLabel, statusDetails } from './data/presentation.js'
import SpeciesCard from './components/SpeciesCard.vue'
import SpeciesModal from './components/SpeciesModal.vue'
import QuizView from './components/quiz/QuizView.vue'
import LessonView from './components/lesson/LessonView.vue'
import MapSection from './components/map/MapSection.vue'
import SupportView from './components/support/SupportView.vue'
import CatalogSearch from './components/CatalogSearch.vue'
import LanguageMenu from './components/LanguageMenu.vue'
import { paginateCatalog, pageNumbers } from './data/catalog-pagination.js'
import GroupFilter from './components/GroupFilter.vue'
import HeroIllustrations from './components/HeroIllustrations.vue'
import { speciesPhoto } from './data/presentation.js'
import { prioritizeIllustratedResults } from './data/catalog-pagination.js'
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
const { query, status: selectedStatus, region: selectedRegion, group: selectedGroup, options, results, fuzzy, hasFilters } = catalog
const catalogPageNumber = ref(1)
// Preserve the catalogue's original order within each partition. Search relevance
// still wins when a query is present. Remove this temporary prioritization when
// the final 12 taxon images have been sourced and reviewed.
const displayedResults = computed(() => query.value.trim() ? results.value : prioritizeIllustratedResults(results.value, result => Boolean(speciesPhoto(result.species))))
const catalogPagination = computed(() => paginateCatalog(displayedResults.value, catalogPageNumber.value))
// A separate preference for compact and large screens avoids 5 unreadable cards
// suddenly appearing on a phone when a desktop preference changes.
const isCompactViewport = ref(typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches)
const desktopColumns = ref(3)
const compactColumns = ref(2)
const catalogColumns = computed({
  get: () => isCompactViewport.value ? compactColumns.value : desktopColumns.value,
  set: value => { if (isCompactViewport.value) compactColumns.value = Number(value); else desktopColumns.value = Number(value) },
})
let viewportQuery
function updateViewport(event) { isCompactViewport.value = event.matches }
const catalogGridStyle = computed(() => ({ '--catalog-columns': catalogColumns.value }))
const paginationButtons = computed(() => pageNumbers(catalogPagination.value.current, catalogPagination.value.totalPages))
watch([query, selectedStatus, selectedRegion, selectedGroup, species], () => { catalogPageNumber.value = 1 }, { flush: 'sync' })
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
const readSpeciesId = () => typeof window !== 'undefined' ? speciesIdFromPath(window.location.pathname) : null
const speciesRouteId = ref(readSpeciesId())
const activeView = ref(isMapPath() ? 'map' : speciesRouteId.value ? 'species' : 'catalog')
const profileSpecies = computed(() => species.value.find(item => item.id === speciesRouteId.value) || null)
const mapRouteRegion = ref(isMapPath() ? readMapRegion() : '')

function onBrowserNavigation() {
  speciesRouteId.value = readSpeciesId()
  activeView.value = isMapPath() ? 'map' : speciesRouteId.value ? 'species' : 'catalog'
  if (activeView.value === 'map') mapRouteRegion.value = readMapRegion()
  headerHidden.value = false
  window.scrollTo({ top: 0, behavior: 'instant' })
}
function leaveSpeciesUrl() {
  if (readSpeciesId()) {
    window.history.pushState({}, '', '/')
    speciesRouteId.value = null
  }
}
async function openSpeciesPage(id) {
  if (!species.value.some(item => item.id === id)) return
  closeSpecies()
  await nextTick() // Let the dialog release the scroll lock before navigating.
  if (activeView.value === 'lesson' && await lessonView.value?.exitFullscreen() === false) return
  const path = speciesPath(id)
  if (window.location.pathname !== path) window.history.pushState({}, '', path)
  speciesRouteId.value = id
  activeView.value = 'species'
  headerHidden.value = false
  await nextTick()
  window.scrollTo({ top: 0, behavior: 'instant' })
  document.getElementById('profile-heading')?.focus({ preventScroll: true })
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
  speciesRouteId.value = null
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
  if (readSpeciesId()) leaveSpeciesUrl()
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

async function changeCatalogPage(number) {
  const target = Math.min(catalogPagination.value.totalPages, Math.max(1, number))
  if (target === catalogPageNumber.value) return
  catalogPageNumber.value = target
  await nextTick()
  const heading = document.getElementById('catalog-title')
  document.getElementById('catalog')?.scrollIntoView({ block: 'start', behavior: scrollBehavior() })
  heading?.focus({ preventScroll: true })
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
  viewportQuery = window.matchMedia('(max-width: 767px)')
  isCompactViewport.value = viewportQuery.matches
  viewportQuery.addEventListener('change', updateViewport)
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
  viewportQuery?.removeEventListener('change', updateViewport)
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
      <LanguageMenu :model-value="siteLanguage" :label="t('chooseLanguage')" @change="setLanguage" />
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
      <div class="hero-landscape"><HeroIllustrations /></div>
    </section>
    <MapSection v-show="activeView === 'catalog' || activeView === 'map'" :mode="activeView === 'map' ? 'full' : 'preview'" :route-region="mapRouteRegion" :species="species" :loading="isLoading" :error="errorMessage" @open="openSpecies" @details="showMap" @regionchange="updateMapRegion" />
    <section v-show="activeView === 'catalog'" id="catalog" class="catalog page-container" aria-labelledby="catalog-title" tabindex="-1" :aria-busy="isLoading">
      <div class="catalog-heading">
        <div>
          <p class="eyebrow">{{ t('ui.m008') }}</p>
          <h2 id="catalog-title" tabindex="-1">{{ t('ui.m022') }}</h2>
        </div>
        <p class="catalog-note">{{ t('ui.m023') }}<br class="hidden sm:block" /> {{ t('ui.m024') }}</p>
      </div>
      <div class="catalog-tools">
        <!-- Desktop keeps familiar one-tap group buttons; mobile uses one tidy disclosure. -->
        <div class="desktop-catalog-filters">
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
        </div>
        <div class="compact-catalog-filters">
          <details class="catalog-filter-disclosure">
            <summary><span>{{ t('catalogUI.filters') }}<span v-if="hasFilters" class="filters-active-indicator" aria-hidden="true"></span></span><span class="filter-chevron" aria-hidden="true">⌄</span></summary>
            <div class="compact-filter-fields">
              <div class="filter-field">
                <label for="group-filter-compact">{{ t('ui.m025') }}</label>
                <select id="group-filter-compact" v-model="selectedGroup"><option v-for="group in translatedGroups" :key="group.value" :value="group.value">{{ group.label }}</option></select>
              </div>
              <div class="filter-field">
                <label for="status-filter-compact">{{ t('ui.m026') }}</label>
                <select id="status-filter-compact" v-model="selectedStatus"><option v-for="status in options.statuses" :key="status.value" :value="status.value">{{ statusLabel(status.value) }}</option></select>
              </div>
              <div class="filter-field">
                <label for="region-filter-compact">{{ t('ui.m028') }}</label>
                <select id="region-filter-compact" v-model="selectedRegion"><option v-for="region in options.regions" :key="region" :value="region">{{ regionFilterLabel(region, language) }}</option></select>
              </div>
              <button type="button" class="catalog-reset" :disabled="!hasFilters" @click="catalog.reset">{{ t('ui.m031') }}</button>
            </div>
          </details>
        </div>
        <div class="catalog-options-row">
          <p class="result-count" role="status" aria-live="polite" aria-atomic="true">{{ isLoading ? t('ui.m032') : errorMessage ? t('ui.m033') : fuzzy ? t('ui.m034', { p0: results.length }) : t('ui.m035', { p0: results.length }) }}</p>
          <div class="catalog-density">
            <label for="catalog-columns">{{ t('catalogUI.columns') }}</label>
            <select id="catalog-columns" v-model.number="catalogColumns" :aria-label="t('catalogUI.columns')">
              <option v-for="number in 5" :key="number" :value="number">{{ t('catalogUI.inRow', { p0: number }) }}</option>
            </select>
          </div>
        </div>
      </div>
      <p v-if="isLoading" class="catalog-message" role="status">{{ t('ui.m036') }}</p>
      <ErrorNotice v-else-if="errorMessage" :message="errorMessage"></ErrorNotice>
      <p v-else-if="results.length === 0" class="catalog-message">{{ t('ui.m037') }}</p>
      <div v-else class="catalog-grid-viewport">
        <div class="species-grid catalog-custom-grid" :data-columns="catalogColumns" :style="catalogGridStyle">
          <SpeciesCard v-for="result in catalogPagination.entries" :key="result.species.id" :species="result.species" @open="openSearchResult(result)" />
        </div>
      </div>
      <nav v-if="!isLoading && !errorMessage && catalogPagination.totalPages > 1" class="catalog-pagination" :aria-label="t('catalog.pagination.label')">
        <button class="page-arrow" type="button" :disabled="catalogPagination.current === 1" :aria-label="t('catalog.pagination.previous')" @click="changeCatalogPage(catalogPagination.current - 1)"><span aria-hidden="true">←</span></button>
        <template v-for="(number, index) in paginationButtons" :key="`${number}-${index}`">
          <span v-if="number === '…'" class="page-ellipsis" aria-hidden="true">…</span>
          <button v-else class="page-number" type="button" :aria-label="t('catalog.pagination.page', { p0: number })" :aria-current="catalogPagination.current === number ? 'page' : undefined" @click="changeCatalogPage(number)">{{ number }}</button>
        </template>
        <button class="page-arrow" type="button" :disabled="catalogPagination.current === catalogPagination.totalPages" :aria-label="t('catalog.pagination.next')" @click="changeCatalogPage(catalogPagination.current + 1)"><span aria-hidden="true">→</span></button>
      </nav>
    </section>
    <QuizView v-if="mountedViews.has('quiz')" v-show="activeView === 'quiz'" :questions="quizQuestions" :species="species" :loading="quizLoading" :error="quizError" :return-to-lesson="quizFromLesson"
      @catalog="showView('catalog')" @study="studySpecies" @lesson="showView('lesson')" />
    <LessonView v-if="mountedViews.has('lesson')" ref="lessonView" v-show="activeView === 'lesson'" :species="species" :active="activeView === 'lesson'" :loading="isLoading" :error="errorMessage"
      @catalog="showView('catalog')" @quiz="openQuizFromLesson" />
    <SpeciesPage v-if="activeView === 'species'" :species="profileSpecies" :loading="isLoading" :error="errorMessage" :content-language="contentLanguage" @catalog="showView('catalog')" @support="openSupport" />
    <SupportView v-if="mountedViews.has('support')" v-show="activeView === 'support'" :species="species" :species-id="supportSpeciesId" :loading="isLoading" :error="errorMessage"
      @select="supportSpeciesId = $event" @study="studySpecies" @catalog="showView('catalog')" />
  </main>
  <footer class="page-footer">
    <div class="page-container footer-inner">
      <p><span class="footer-brand">MURAS</span> {{ t('ui.m041') }}</p>
      <p class="footer-note">Полотова А.</p>
    </div>
  </footer>
  <SpeciesModal v-if="selectedSpecies" :species="selectedSpecies" :content-language="contentLanguage" @close="closeSpecies" @support="openSupport" @details="openSpeciesPage" />
</template>
