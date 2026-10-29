<script setup>
import ErrorNotice from '../ErrorNotice.vue'
import { useLocale } from '../../composables/useLocale.js'
import { computed } from 'vue'
import SupportSpecies from './SupportSpecies.vue'
import CustomSelect from '../CustomSelect.vue'
import '../custom-select.css'
import SupportWall from './SupportWall.vue'
import { supportSpecies } from '../../data/support/model.js'
import { speciesName } from '../../data/presentation.js'
import './support.css'

const { t, language } = useLocale()

const props = defineProps({ species: { type: Array, required: true }, speciesId: { type: String, default: null }, loading: Boolean, error: { type: String, default: '' } })
const emit = defineEmits(['select', 'study', 'catalog'])
const current = computed(() => supportSpecies(props.species, props.speciesId))
</script>

<template>
  <section id="support" class="support-section page-container" tabindex="-1" aria-labelledby="support-title" :aria-busy="loading">
    <header class="support-heading"><div><p class="eyebrow"><span class="red-rule" aria-hidden="true"></span> {{ t('ui.m088') }}</p><h1 id="support-title">{{ t('ui.m013') }}</h1><p>{{ t('ui.m280') }}</p></div><button class="quiz-secondary" type="button" @click="emit('catalog')">{{ t('ui.m104') }}</button></header>
    <aside class="support-closed" aria-labelledby="support-closed-title"><span class="support-closed-mark" aria-hidden="true">○</span><div><h2 id="support-closed-title">{{ t('ui.m281') }}</h2><p>{{ t('ui.m282') }}</p></div></aside>
    <p v-if="loading" class="catalog-message" role="status">{{ t('ui.m283') }}</p>
    <ErrorNotice v-else-if="error" :message="error"></ErrorNotice>
    <p v-else-if="!species.length" class="catalog-message">{{ t('ui.m284') }}</p>
    <template v-else>
      <div class="support-selection"><label for="support-species">{{ t('ui.m285') }}</label><CustomSelect id="support-species" :model-value="current?.id || ''" :options="[{ value: '', label: t('ui.m286') }, ...species.map(record => ({ value: record.id, label: speciesName(record, language) }))]" :label="t('ui.m285')" @update:model-value="emit('select', $event || null)" /></div>
      <SupportSpecies v-if="current" :species="current" @study="emit('study', $event)" />
      <section v-else class="support-purpose" aria-labelledby="support-purpose-title"><p class="eyebrow">{{ t('ui.m287') }}</p><h2 id="support-purpose-title">{{ t('ui.m288') }}</h2><p>{{ t('ui.m289') }}</p><p>{{ t('ui.m290') }}</p></section>
      <section class="support-program" aria-labelledby="support-program-title"><header><p class="eyebrow">{{ t('ui.m291') }}</p><h2 id="support-program-title">{{ t('ui.m292') }}</h2><p>{{ t('ui.m293') }}{{ current ? ' ' + t('ui.m294', { p0: speciesName(current, language) }) : '' }}.</p></header><ol><li><span aria-hidden="true">01</span><h3>{{ t('ui.m295') }}</h3><p>{{ t('ui.m296') }}</p></li><li><span aria-hidden="true">02</span><h3>{{ t('ui.m297') }}</h3><p>{{ t('ui.m298') }}</p></li><li><span aria-hidden="true">03</span><h3>{{ t('ui.m299') }}</h3><p>{{ t('ui.m300') }}</p></li></ol></section>
      <div class="support-future-thanks"><p class="eyebrow">{{ t('supportUI.wallEyebrow') }}</p><h2>{{ t('supportUI.wallTitle') }}</h2><p>{{ t('supportUI.wallDescription') }}</p></div>
      <SupportWall :species="species" :species-id="current?.id || null" />
    </template>
  </section>
</template>
