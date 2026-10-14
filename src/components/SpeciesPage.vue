<script setup>
import { computed, toRef } from 'vue'
import { provideContentLanguage, siteLanguage, useLocale } from '../composables/useLocale.js'
import { groupLabel, nationalStatus, regionNames, speciesName, speciesNameLanguage, speciesPhoto, statusDetails } from '../data/presentation.js'
import { populationPresentation } from '../data/population.js'
import ScientificText from './ScientificText.vue'
import SpeciesVisualization from './SpeciesVisualization.vue'
import PopulationInfo from './PopulationInfo.vue'
import LessonReferences from './lesson/LessonReferences.vue'
import SourceLink from './SourceLink.vue'
import { contentParagraphs } from '../data/species-content.js'

const props = defineProps({
  species: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  contentLanguage: { type: String, default: null },
})
const emit = defineEmits(['catalog', 'support'])
const preferredLanguage = computed(() => props.contentLanguage || siteLanguage.value)
const { t, language } = useLocale(preferredLanguage)
provideContentLanguage(toRef(props, 'contentLanguage'))
const name = computed(() => props.species ? speciesName(props.species, language.value) : '')
const photo = computed(() => props.species ? speciesPhoto(props.species) : null)
const status = computed(() => props.species ? statusDetails(props.species, language.value) : null)
const locations = computed(() => props.species ? regionNames(props.species, language.value) : [])
const population = computed(() => props.species ? populationPresentation(props.species.population, props.species.sources) : { type: 'unknown' })
</script>

<template>
  <article class="species-page page-container" aria-labelledby="profile-heading">
    <a href="#catalog" class="profile-back" @click.prevent="emit('catalog')">← {{ t('speciesProfile.catalogBack') }}</a>
    <p v-if="loading" class="profile-loading" role="status">{{ t('ui.m032') }}</p>
    <p v-else-if="error" class="profile-loading" role="alert">{{ error }}</p>
    <div v-else-if="!species" class="profile-not-found">
      <h1 id="profile-heading" tabindex="-1">{{ t('speciesProfile.notFound') }}</h1>
      <p>{{ t('speciesProfile.notFoundDescription') }}</p>
    </div>
    <template v-else>
      <header class="profile-hero">
        <p class="profile-eyebrow">{{ groupLabel(species, language) }} <span aria-hidden="true">·</span> {{ status.label }}</p>
        <h1 id="profile-heading" tabindex="-1" :lang="speciesNameLanguage(species, language)">{{ name }}</h1>
        <p v-if="species.scientificName" class="profile-latin" lang="la">{{ species.scientificName }}</p>
      </header>
      <div class="profile-layout">
        <aside class="profile-sidebar" :aria-label="t('speciesProfile.visualAndPopulation')">
          <SpeciesVisualization :photo="photo" :name="name" :population-type="population.type" :species-id="species.id" />
          <PopulationInfo :population="species.population" :sources="species.sources" />
          <details v-if="photo" class="profile-credits">
            <summary>{{ t('ui.m240') }}</summary>
            <p><a :href="photo.originalPage" target="_blank" rel="noopener noreferrer">{{ t('ui.m082') }} {{ photo.author }}</a> · <a :href="photo.licenseUrl" target="_blank" rel="noopener noreferrer">{{ photo.license }}</a></p>
            <p v-if="photo.caption"><ScientificText :value="photo.caption" /></p>
            <p lang="und">{{ photo.attribution }}</p>
            <p v-if="photo.modifications?.length">{{ t('ui.m241') }} <ScientificText :value="{ ru: photo.modifications.join('; ') }" /></p>
          </details>
        </aside>
        <div class="profile-content">
          <section class="profile-section" aria-labelledby="profile-about">
            <h2 id="profile-about">{{ t('speciesProfile.overview') }}</h2>
            <template v-if="species.content?.overview">
              <p v-for="(paragraph, index) in contentParagraphs(species.content.overview, language)" :key="index"><ScientificText :value="paragraph" /></p>
              <LessonReferences :species="species" :ids="species.content.overview.sourceIds" />
            </template>
            <p v-else>{{ t('ui.m066') }}</p>
          </section>
          <section v-for="field in ['appearance', 'ecology', 'diet', 'reproduction']" v-show="field !== 'diet' || !['plants', 'fungi'].includes(species.group) || species.content?.diet" :key="field" class="profile-section" :aria-labelledby="`profile-${field}`">
            <h2 :id="`profile-${field}`">{{ t(`content.${field}`) }}</h2>
            <template v-if="species.content?.[field]">
              <p v-for="(paragraph, index) in contentParagraphs(species.content[field], language)" :key="index"><ScientificText :value="paragraph" /></p>
              <LessonReferences :species="species" :ids="species.content[field].sourceIds" />
            </template>
            <p v-else class="profile-note">{{ t('ui.m066') }}</p>
          </section>
          <section class="profile-section" aria-labelledby="profile-habitat">
            <h2 id="profile-habitat">{{ t('ui.m065') }}</h2>
            <p><ScientificText :value="species.habitat?.description" /> <LessonReferences :species="species" :ids="species.habitat?.sourceIds" /></p>
          </section>
          <section class="profile-section" aria-labelledby="profile-regions">
            <h2 id="profile-regions">{{ t('ui.m246') }}</h2>
            <p>{{ locations.join(', ') || t('ui.m247') }}</p>
            <template v-if="species.content?.distribution">
              <p v-for="(paragraph, index) in contentParagraphs(species.content.distribution, language)" :key="index"><ScientificText :value="paragraph" /></p>
              <LessonReferences :species="species" :ids="species.content.distribution.sourceIds" />
            </template>
            <p v-else class="profile-note">{{ t('ui.m066') }}</p>
            <p class="profile-note">{{ t('speciesProfile.regionNote') }}</p>
          </section>
          <section class="profile-section" aria-labelledby="profile-threats">
            <h2 id="profile-threats">{{ t('ui.m249') }}</h2>
            <ul v-if="species.threats?.length" class="profile-bullets">
              <li v-for="(threat, index) in species.threats" :key="index"><ScientificText :value="threat.text" /> <LessonReferences :species="species" :ids="threat.sourceIds" /></li>
            </ul>
            <p v-else class="profile-note">{{ t('ui.m066') }}</p>
          </section>
          <section class="profile-section" aria-labelledby="profile-conservation">
            <h2 id="profile-conservation">{{ t('ui.m070') }}</h2>
            <ul v-if="species.conservationMeasures?.length" class="profile-bullets">
              <li v-for="(measure, index) in species.conservationMeasures" :key="index"><ScientificText :value="measure.text" /> <LessonReferences :species="species" :ids="measure.sourceIds" /></li>
            </ul>
            <p v-else class="profile-note">{{ t('ui.m066') }}</p>
          </section>
          <section class="profile-section" aria-labelledby="profile-status">
            <h2 id="profile-status">{{ t('speciesProfile.scientificStatus') }}</h2>
            <p>{{ nationalStatus(species, language) }} · {{ species.nationalRedBook?.edition }}</p>
            <p class="profile-note">{{ species.verified ? t('ui.m062') : t('ui.m243') }}</p>
          </section>
          <section class="profile-section" aria-labelledby="profile-sources">
            <h2 id="profile-sources">{{ t('ui.m250') }} ({{ species.sources?.length || 0 }})</h2>
            <ol v-if="species.sources?.length" class="source-list">
              <li v-for="source in species.sources" :key="source.id"><SourceLink :source="source" /></li>
            </ol>
            <p v-else>{{ t('ui.m251') }}</p>
          </section>
          <div class="profile-support">
            <button class="text-link" type="button" @click="emit('support', species.id)">{{ t('ui.m252') }} ↗</button>
            <p>{{ t('ui.m253') }}</p>
          </div>
        </div>
      </div>
    </template>
  </article>
</template>

<style scoped>
.species-page { padding-top: 26px; padding-bottom: 84px; }
.profile-back { display: inline-flex; align-items: center; min-height: 44px; font-size: 14px; color: var(--muted); text-decoration: underline; text-underline-offset: 4px; }
.profile-hero { max-width: 1000px; padding: 34px 0 38px; }
.profile-eyebrow { margin-bottom: 14px; font-size: 12px; font-weight: 650; letter-spacing: .1em; color: var(--muted); text-transform: uppercase; }
.profile-eyebrow span { margin: 0 4px; }
.profile-hero h1 { font: 400 clamp(36px, 6.5vw, 68px)/1.12 Georgia, 'Times New Roman', serif; overflow-wrap: anywhere; }
.profile-latin { margin-top: 8px; font: italic 20px/1.4 Georgia, 'Times New Roman', serif; color: var(--muted); }
.profile-layout { display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); align-items: start; gap: clamp(24px, 4vw, 72px); border-top: 1px solid var(--line); padding-top: 34px; }
.profile-sidebar, .profile-content { min-width: 0; }
.profile-sidebar { padding: 22px; background: var(--paper); border-radius: 12px; }
.profile-sidebar :deep(.canvas-frame) { border-radius: 8px; }
.profile-sidebar :deep(.population-info) { margin-bottom: 22px; }
.profile-credits { border-top: 1px solid var(--line); padding: 16px 0 0; font-size: 13px; overflow-wrap: anywhere; }
.profile-credits summary { font-weight: 600; cursor: pointer; min-height: 32px; }
.profile-credits p { color: var(--muted); margin-top: 12px; line-height: 1.7; }
.profile-credits a { text-decoration: underline; text-underline-offset: 3px; }
.profile-section { padding: 0 0 28px; border-bottom: 1px solid var(--line); margin-bottom: 28px; }
.profile-section h2 { font: 400 clamp(23px, 2.5vw, 30px)/1.2 Georgia, 'Times New Roman', serif; margin-bottom: 16px; }
.profile-section p, .profile-bullets { font-size: 16px; line-height: 1.8; }
.profile-note { color: var(--muted); font-size: 14px !important; }
.profile-bullets { list-style: disc; padding-left: 22px; }
.profile-bullets li+li { margin-top: 13px; }
.profile-support p { margin-top: 12px; font-size: 14px; color: var(--muted); }
.profile-not-found, .profile-loading { padding: 60px 0; }
.profile-not-found h1 { font-size: 30px; }
@media (max-width: 767px) {
  .species-page { padding-top: 12px; padding-bottom: 60px; }
  .profile-hero { padding: 20px 0 26px; }
  .profile-layout { grid-template-columns: minmax(0, 1fr); gap: 26px; padding-top: 24px; }
  .profile-sidebar { padding: 16px; }
  .profile-section { padding-bottom: 22px; margin-bottom: 22px; }
}
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; } }
</style>
