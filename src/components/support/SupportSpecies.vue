<script setup>
import ScientificText from "../ScientificText.vue"
import { useLocale } from '../../composables/useLocale.js'
import { computed } from 'vue'
import LessonPhoto from '../lesson/LessonPhoto.vue'
import LessonReferences from '../lesson/LessonReferences.vue'
import { groupLabel, speciesName, speciesNameLanguage } from '../../data/presentation.js'
import { sourcedStatements } from '../../data/support/model.js'

const { t, language } = useLocale()

const props = defineProps({ species: { type: Object, required: true } })
const emit = defineEmits(['study'])
const threats = computed(() => sourcedStatements(props.species, 'threats'))
const measures = computed(() => sourcedStatements(props.species, 'conservationMeasures'))
</script>

<template>
  <article class="support-species" aria-labelledby="support-species-title">
    <LessonPhoto :species="species" />
    <div class="support-species-copy">
      <p class="eyebrow">{{ groupLabel(species, language) }} {{ t('ui.m272') }}</p>
      <h2 id="support-species-title" :lang="speciesNameLanguage(species, language)">{{ speciesName(species, language) }}</h2>
      <p class="support-names"><span v-if="species.names.ky" lang="ky">{{ species.names.ky }}</span><span v-if="species.names.en" lang="en">{{ species.names.en }}</span><span v-if="species.scientificName" class="scientific-name" lang="la">{{ species.scientificName }}</span></p>
      <p class="support-editorial">{{ species.verified ? t('ui.m062') : t('ui.m273') }}</p>
      <div class="support-facts">
        <section><h3>{{ t('ui.m274') }}</h3><ul v-if="threats.length"><li v-for="(item, n) in threats" :key="n"><ScientificText :value="item.text" /> <LessonReferences :species="species" :ids="item.sourceIds" /></li></ul><p v-else>{{ t('ui.m275') }}</p></section>
        <section><h3>{{ t('ui.m276') }}</h3><ul v-if="measures.length"><li v-for="(item, n) in measures" :key="n"><ScientificText :value="item.text" /> <LessonReferences :species="species" :ids="item.sourceIds" /></li></ul><p v-else>{{ t('ui.m277') }}</p></section>
      </div>
      <div class="support-visual-link">
        <span class="support-mosaic" aria-hidden="true"><i v-for="n in 12" :key="n"></i></span>
        <div><p>{{ t('ui.m278') }}</p><button class="text-link" type="button" aria-haspopup="dialog" @click="emit('study', species.id)">{{ t('ui.m279') }} <span aria-hidden="true">↗</span></button></div>
      </div>
    </div>
  </article>
</template>
