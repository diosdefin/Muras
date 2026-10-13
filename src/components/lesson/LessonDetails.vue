<script setup>
import ScientificText from "../ScientificText.vue"
import { useLocale } from '../../composables/useLocale.js'
import { computed } from 'vue'
import LessonReferences from './LessonReferences.vue'
import { nationalStatus, regionNames, statusDetails } from '../../data/presentation.js'
import PopulationInfo from '../PopulationInfo.vue'

const { t, language } = useLocale()

defineProps({ species: { type: Object, required: true } })
const taxonomyLabels = computed(() => ({ kingdom: t('ui.m055'), phylum: t('ui.m056'), class: t('ui.m057'), order: t('ui.m058'), family: t('ui.m059'), genus: t('ui.m060') }))
</script>

<template>
  <details class="lesson-details">
    <summary>{{ t('ui.m061') }}</summary>
    <div class="lesson-details-content">
      <p class="lesson-editorial">{{ species.verified ? t('ui.m062') : t('ui.m063') }} {{ t('ui.m064') }}</p>
      <section>
        <h3>{{ t('ui.m065') }}</h3>
        <p><ScientificText :value="species.habitat?.description" /> <LessonReferences :species="species" :ids="species.habitat?.sourceIds" /></p>
        <p>{{ t('ui.m067') }} {{ regionNames(species, language).join(', ') || t('ui.m068') }}.</p>
      </section>
      <section v-for="field in ['threats', 'conservationMeasures']" :key="field">
        <h3>{{ field === 'threats' ? t('ui.m069') : t('ui.m070') }}</h3>
        <ul v-if="species[field]?.length">
          <li v-for="(item, index) in species[field]" :key="index"><ScientificText :value="item.text" /> <LessonReferences :species="species" :ids="item.sourceIds" /></li>
        </ul>
        <p v-else>{{ t('ui.m066') }}</p>
      </section>
      <section>
        <h3>{{ t('ui.m071') }}</h3>
        <p>{{ nationalStatus(species, language) }}. <ScientificText :value="{ru: species.nationalRedBook?.edition}" />. <LessonReferences :species="species" :ids="species.nationalRedBook?.sourceIds" /></p>
        <p>{{ statusDetails(species, language).label }}. <LessonReferences :species="species" :ids="species.iucn?.sourceIds" /></p>
        <p>{{ species.iucn?.year ? t('ui.m072', { p0: species.iucn.year }) : t('ui.m073') }}</p>
      </section>
      <PopulationInfo :population="species.population" :sources="species.sources" />
      <section>
        <h3>{{ t('ui.m074') }}</h3>
        <dl class="lesson-taxonomy">
          <div v-for="(label, key) in taxonomyLabels" :key="key"><dt>{{ label }}</dt><dd :lang="species.taxonomy?.[key] ? 'la' : language">{{ species.taxonomy?.[key] || t('ui.m075') }}</dd></div>
        </dl>
        <LessonReferences :species="species" :ids="species.sources.filter(source => source.supports.some(field => field.startsWith('taxonomy.'))).map(source => source.id)" />
      </section>
      <section v-if="species.images?.length">
        <h3>{{ t('ui.m076') }}</h3>
        <template v-for="photo in species.images" :key="photo.path">
          <p lang="und">{{ photo.attribution }}</p>
          <ul v-if="photo.modifications?.length"><li v-for="change in photo.modifications" :key="change"><ScientificText :value="{ru: change}" /></li></ul>
          <p class="language-note">{{ t('originalMetadata') }}</p>
          <p>{{ t('ui.m077') }}</p>
        </template>
      </section>
    </div>
  </details>
</template>
