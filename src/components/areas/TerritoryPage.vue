<script setup>
import { computed } from 'vue'
import { useLocale } from '../../composables/useLocale.js'
import { publicImageUrl, regionLabel, speciesName, speciesNameLanguage } from '../../data/presentation.js'
import { areaDescription, areaName, primaryPhoto } from '../../data/protected-areas.js'
import AreaPlaceholder from './AreaPlaceholder.vue'

const props = defineProps({
  area: { type: Object, default: null }, species: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }, error: { type: String, default: '' },
})
const emit = defineEmits(['list', 'species'])
const { t, language } = useLocale()
const typeKey = { reserve: 'areas.typeReserve', 'national-park': 'areas.typeNationalPark', biosphere: 'areas.typeBiosphere' }
const photo = computed(() => props.area ? primaryPhoto(props.area) : null)
const otherPhotos = computed(() => (props.area?.photos || []).filter(p => p !== photo.value))
const formatter = computed(() => new Intl.NumberFormat(language.value === 'ky' ? 'ru' : language.value))
const areaSize = computed(() => props.area?.area?.ha ? t('areas.areaHa', { value: formatter.value.format(props.area.area.ha) }) : null)
const regions = computed(() => (props.area?.location?.regions || []).map(id => regionLabel(id, language.value)).join(', '))
const districts = computed(() => (props.area?.location?.districts?.[language.value] || props.area?.location?.districts?.ru || []).join(', '))
const linkedSpecies = computed(() => (props.area?.speciesLinks || []).map(link => props.species.find(s => s.id === link.speciesId)).filter(Boolean))
const documentText = computed(() => props.area?.established?.document?.[language.value] || props.area?.established?.document?.ru || '')
const iucn = computed(() => props.area?.iucnCategory || '')
const altText = p => p.caption?.[language.value] || p.caption?.ru || ''
</script>

<template>
  <section id="territory" class="species-page page-container territory-page" aria-labelledby="territory-heading">
    <nav class="tp-nav" :aria-label="t('areas.back')">
      <a href="/territories" class="tp-back" @click.prevent="emit('list')"><span aria-hidden="true">←</span> {{ t('areas.back') }}</a>
    </nav>
    <p v-if="error" class="catalog-message" role="alert">{{ t('areas.error') }}</p>
    <p v-else-if="loading" class="catalog-message muras-loading" role="status">{{ t('areas.loading') }}</p>
    <div v-else-if="!area" class="profile-not-found" role="status"><p>{{ t('areas.notFound') }}</p></div>
    <template v-else>
      <header class="tp-hero" :class="{ 'tp-hero-empty': !photo }">
        <div class="tp-hero-media">
          <img v-if="photo" :src="publicImageUrl(photo.path)" :width="photo.width" :height="photo.height" decoding="async" fetchpriority="high" :alt="altText(photo)" />
          <AreaPlaceholder v-else :label="t(typeKey[area.type])" :caption="t('areas.noPhoto')" />
        </div>
        <div class="tp-hero-text">
          <p class="tp-eyebrow">{{ t(typeKey[area.type]) }} <span aria-hidden="true">·</span> {{ regions }}</p>
          <h1 id="territory-heading" tabindex="-1">{{ areaName(area, language) }}</h1>
          <ul class="tp-chips">
            <li><strong>{{ area.established.year }}</strong><span>{{ t('areas.factEstablished') }}</span></li>
            <li v-if="areaSize"><strong>{{ areaSize }}</strong><span>{{ t('areas.factArea') }}</span></li>
            <li v-if="iucn"><strong>{{ iucn }}</strong><span>{{ t('areas.factIucn') }}</span></li>
          </ul>
        </div>
      </header>
      <p v-if="photo" class="tp-caption">{{ altText(photo) }}</p>
      <div class="tp-layout">
        <div class="tp-main">
          <section class="profile-section tp-about" aria-labelledby="territory-about">
            <h2 id="territory-about">{{ t('areas.about') }}</h2>
            <p>{{ areaDescription(area, language) }}</p>
          </section>
          <section class="profile-section tp-species" aria-labelledby="territory-species">
            <h2 id="territory-species">{{ t('areas.species') }}</h2>
            <template v-if="linkedSpecies.length">
              <p class="tp-muted">{{ t('areas.speciesNote') }}</p>
              <ul class="tp-species-list">
                <li v-for="item in linkedSpecies" :key="item.id">
                  <button type="button" class="tp-species-btn" :lang="speciesNameLanguage(item, language)" @click="emit('species', item.id)">{{ speciesName(item, language) }} <span aria-hidden="true">↗</span></button>
                </li>
              </ul>
            </template>
            <p v-else class="tp-muted">{{ t('areas.noSpecies') }}</p>
          </section>
          <section class="profile-section tp-sources" aria-labelledby="territory-sources">
            <h2 id="territory-sources">{{ t('areas.sources') }}</h2>
            <ul class="territory-sources">
              <li v-for="source in area.sources" :key="source.id"><a :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.title }}</a><template v-if="source.publisher"> — {{ source.publisher }}</template></li>
            </ul>
            <p class="territory-review-note">{{ t('areas.reviewNote') }}</p>
          </section>
        </div>
        <aside class="tp-side">
          <section class="tp-card tp-facts-card" aria-labelledby="territory-facts">
            <h2 id="territory-facts">{{ t('areas.facts') }}</h2>
            <dl class="territory-facts">
              <div><dt>{{ t('areas.factEstablished') }}</dt><dd>{{ area.established.year }}<template v-if="documentText"> — {{ documentText }}</template></dd></div>
              <div v-if="areaSize"><dt>{{ t('areas.factArea') }}</dt><dd>{{ areaSize }}<template v-if="area.area?.year"> ({{ t('areas.areaYear', { year: area.area.year }) }})</template></dd></div>
              <div><dt>{{ t('areas.factRegions') }}</dt><dd>{{ regions }}</dd></div>
              <div v-if="districts"><dt>{{ t('areas.factDistricts') }}</dt><dd>{{ districts }}</dd></div>
              <div v-if="area.iucnCategory"><dt>{{ t('areas.factIucn') }}</dt><dd>{{ area.iucnCategory }}</dd></div>
              <div v-if="area.designations?.length"><dt>{{ t('areas.factDesignations') }}</dt><dd>{{ area.designations.map(d => d.year ? `${d.name} (${d.year})` : d.name).join('; ') }}</dd></div>
              <div v-if="area.website"><dt>{{ t('areas.factWebsite') }}</dt><dd><a :href="area.website" target="_blank" rel="noopener noreferrer">{{ area.website }}</a></dd></div>
            </dl>
          </section>
          <section v-if="otherPhotos.length" class="tp-card tp-more-photos" :aria-label="t('areas.photoCredits')">
            <figure v-for="extra in otherPhotos" :key="extra.path" class="territory-photo">
              <img :src="publicImageUrl(extra.path)" :width="extra.width" :height="extra.height" loading="lazy" decoding="async" :alt="altText(extra)" />
              <figcaption>{{ altText(extra) }}</figcaption>
            </figure>
          </section>
          <details v-if="area.photos?.length" class="tp-card profile-credits">
            <summary>{{ t('areas.photoCredits') }}</summary>
            <template v-for="item in area.photos" :key="item.path">
              <p><a :href="item.originalPage" target="_blank" rel="noopener noreferrer">{{ t('areas.photoBy') }} {{ item.author }}</a> · <a :href="item.licenseUrl" target="_blank" rel="noopener noreferrer">{{ item.license }}</a></p>
              <p lang="und">{{ item.attribution }}</p>
            </template>
          </details>
        </aside>
      </div>
      <div class="tp-footer-nav">
        <button type="button" class="tp-back-big" @click="emit('list')"><span aria-hidden="true">←</span> {{ t('areas.back') }}</button>
      </div>
    </template>
  </section>
</template>

<style scoped>
.species-page { padding-top: 14px; padding-bottom: 84px; }
.tp-nav { padding: 6px 0 14px; }
.tp-back, .tp-back-big { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 18px; border: 1px solid var(--line); border-radius: 999px; background: #fff; color: var(--ink); font-family: inherit; font-weight: 600; font-size: 14px; line-height: 1; text-decoration: none; cursor: pointer; transition: background .15s ease, border-color .15s ease; }
.tp-back:hover, .tp-back-big:hover { background: var(--paper); border-color: #b8c4ba; }
.tp-hero { position: relative; overflow: hidden; border-radius: 16px; background: #2c4439; color: #fff; display: grid; }
.tp-hero-media { grid-area: 1 / 1; min-height: clamp(240px, 28vw, 340px); max-height: 360px; overflow: hidden; }
.tp-hero-media img { display: block; width: 100%; height: 100%; min-height: inherit; object-fit: cover; }
.tp-hero:not(.tp-hero-empty) .tp-hero-media::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(12, 24, 17, 0) 28%, rgba(12, 24, 17, .78) 100%); }
.tp-hero-text { grid-area: 1 / 1; align-self: end; position: relative; z-index: 1; padding: clamp(18px, 3.4vw, 40px); }
.tp-hero-empty { color: #2c4439; background: #dbe5d9; }
.tp-hero-empty .tp-hero-media { min-height: clamp(200px, 22vw, 260px); }
.tp-eyebrow { margin-bottom: 10px; font-size: 12px; font-weight: 650; letter-spacing: .1em; text-transform: uppercase; opacity: .9; overflow-wrap: anywhere; }
.tp-eyebrow span { margin: 0 4px; }
.tp-hero h1 { font: 400 clamp(26px, 4vw, 44px)/1.12 Georgia, 'Times New Roman', serif; overflow-wrap: anywhere; hyphens: auto; max-width: 900px; }
.tp-chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 0; padding: 0; list-style: none; }
.tp-chips li { display: grid; gap: 2px; padding: 9px 14px; border-radius: 12px; background: rgba(255, 255, 255, .92); color: #1c2b22; backdrop-filter: blur(4px); }
.tp-chips strong { font-weight: 600; font-size: clamp(15px, 2vw, 18px); line-height: 1.2; }
.tp-chips span { font-size: 11px; letter-spacing: .05em; text-transform: uppercase; color: #52665a; }
.tp-caption { margin: 10px 2px 0; font-size: 13px; color: var(--muted); line-height: 1.5; }
.tp-layout { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, .65fr); align-items: start; gap: clamp(22px, 4vw, 56px); margin-top: 30px; }
.tp-main, .tp-side { min-width: 0; }
.tp-side { display: grid; gap: 16px; position: sticky; top: 88px; }
.tp-card { padding: 20px; background: var(--paper); border-radius: 14px; }
.tp-card h2 { font: 400 22px/1.2 Georgia, 'Times New Roman', serif; margin-bottom: 14px; }
.profile-section { padding: 0 0 26px; border-bottom: 1px solid var(--line); margin-bottom: 26px; }
.profile-section:last-child { border-bottom: 0; margin-bottom: 0; }
.profile-section h2 { font: 400 clamp(22px, 2.5vw, 30px)/1.2 Georgia, 'Times New Roman', serif; margin-bottom: 14px; }
.profile-section p { font-size: 16px; line-height: 1.8; }
.tp-muted { color: var(--muted); font-size: 14px !important; margin-bottom: 12px; }
.tp-species-list { display: flex; flex-wrap: wrap; gap: 8px; margin: 0; padding: 0; list-style: none; }
.tp-species-btn { display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 0 14px; border: 1px solid var(--line); border-radius: 999px; background: #fff; color: var(--ink); font-family: inherit; font-weight: 500; font-size: 14px; line-height: 1.2; cursor: pointer; text-align: left; }
.tp-species-btn:hover { background: var(--paper); }
.profile-credits { font-size: 13px; overflow-wrap: anywhere; }
.profile-credits summary { font-weight: 600; cursor: pointer; min-height: 32px; display: flex; align-items: center; }
.profile-credits p { color: var(--muted); margin-top: 10px; line-height: 1.65; }
.profile-credits a { text-decoration: underline; text-underline-offset: 3px; }
.territory-photo { margin: 0 0 14px; }
.territory-photo:last-child { margin-bottom: 0; }
.territory-photo img { display: block; width: 100%; height: auto; border-radius: 10px; }
.territory-photo figcaption { margin-top: 8px; font-size: 13px; line-height: 1.5; color: var(--muted); }
.territory-facts { display: grid; gap: 0; margin: 0; }
.territory-facts > div { display: grid; gap: 3px; padding: 11px 0; border-bottom: 1px solid var(--line); line-height: 1.55; }
.territory-facts > div:first-child { padding-top: 0; }
.territory-facts > div:last-child { border-bottom: 0; padding-bottom: 0; }
.territory-facts dt { font-size: 12px; font-weight: 650; letter-spacing: .05em; text-transform: uppercase; color: var(--muted); }
.territory-facts dd { margin: 0; overflow-wrap: anywhere; font-size: 15px; }
.territory-sources { margin: 0; padding-left: 20px; display: grid; gap: 8px; line-height: 1.6; overflow-wrap: anywhere; font-size: 15px; }
.territory-review-note { margin-top: 14px; color: var(--muted); font-size: 13px !important; line-height: 1.6 !important; }
.tp-footer-nav { display: none; }
.profile-not-found { padding: 60px 0; }
@media (max-width: 1023px) {
  .tp-layout { grid-template-columns: minmax(0, 1fr); gap: 0; margin-top: 22px; }
  .tp-main, .tp-side { display: contents; }
  .tp-about { order: 1; } .tp-facts-card { order: 2; margin-bottom: 26px; } .tp-species { order: 3; } .tp-more-photos { order: 4; margin-bottom: 26px; }
  .tp-sources { order: 5; } .profile-credits { order: 6; margin-top: 8px; }
  .tp-layout { display: flex; flex-direction: column; }
  .tp-side { position: static; }
}
@media (max-width: 767px) {
  .species-page { padding-top: 8px; padding-bottom: 56px; }
  .tp-nav { padding-bottom: 10px; }
  .tp-back { min-height: 40px; padding: 0 14px; font-size: 13px; }
  /* Phones: the photo stays clean; title and facts sit below it instead of covering it. */
  .tp-hero { display: block; overflow: visible; border-radius: 0; background: none; color: var(--ink); }
  .tp-hero-media { min-height: 0; border-radius: 12px; overflow: hidden; background: #dbe5d9; aspect-ratio: 4 / 3; }
  .tp-hero-media img { height: 100%; min-height: 0; aspect-ratio: 4 / 3; }
  .tp-hero:not(.tp-hero-empty) .tp-hero-media::after { display: none; }
  .tp-hero-empty .tp-hero-media { min-height: 0; aspect-ratio: 16 / 9; }
  .tp-hero-text { padding: 14px 2px 0; }
  .tp-eyebrow { font-size: 10.5px; margin-bottom: 6px; color: var(--muted); }
  .tp-hero h1 { font-size: clamp(21px, 6.2vw, 29px); line-height: 1.18; hyphens: manual; }
  .tp-chips { gap: 6px; margin-top: 10px; }
  .tp-chips li { padding: 6px 10px; border-radius: 10px; background: var(--paper); border: 1px solid var(--line); color: var(--ink); backdrop-filter: none; }
  .tp-chips strong { font-size: 13.5px; }
  .tp-chips span { font-size: 9.5px; }
  .tp-caption { font-size: 12px; margin-top: 8px; }
  .tp-layout { margin-top: 16px; }
  .tp-card { padding: 14px; border-radius: 12px; }
  .tp-card h2 { font-size: 18px; margin-bottom: 8px; }
  .profile-section { padding-bottom: 16px; margin-bottom: 16px; }
  .profile-section h2 { font-size: 19px; margin-bottom: 8px; }
  .profile-section p { font-size: 14.5px; line-height: 1.65; }
  .territory-facts > div { padding: 9px 0; }
  .territory-facts dt { font-size: 10.5px; }
  .territory-facts dd, .territory-sources { font-size: 13.5px; }
  .tp-species-btn { min-height: 36px; padding: 0 11px; font-size: 13px; }
  .tp-footer-nav { display: flex; justify-content: center; margin-top: 24px; }
  .tp-back-big { width: 100%; justify-content: center; min-height: 46px; }
}
@media (max-width: 360px) { .tp-hero h1 { font-size: 20px; } }
</style>
