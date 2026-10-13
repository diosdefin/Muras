<script setup>
import SourceLink from "./SourceLink.vue"
import { useLocale } from '../composables/useLocale.js'
import { computed } from 'vue'
import { populationCells, populationPresentation } from '../data/population.js'

const { t, language } = useLocale()

const props = defineProps({ population: { type: Object, default: null }, sources: { type: Array, default: () => [] } })
const presentation = computed(() => populationPresentation(props.population, props.sources, language.value))
const marks = computed(() => populationCells(presentation.value))
</script>
<template>
  <section class="population-info" :aria-label="t('ui.m157')">
    <h3>{{ t('ui.m158') }}</h3>
    <p class="population-value">{{ presentation.label }}</p>
    <template v-if="presentation.type !== 'unknown'">
      <dl><div><dt>{{ t('ui.m159') }}</dt><dd>{{ presentation.accuracy }}</dd></div><div><dt>{{ t('ui.m160') }}</dt><dd>{{ presentation.territory }}</dd></div><div><dt>{{ t('ui.m161') }}</dt><dd>{{ presentation.year }}</dd></div><div><dt>{{ t('ui.m162') }}</dt><dd>{{ presentation.unit }}</dd></div></dl>
      <div v-if="marks.cells.length" class="population-cells" aria-hidden="true"><span v-for="(count, index) in marks.cells" :key="index" :title="`${count} ${presentation.unit}`" :style="{ opacity: 0.35 + 0.65 * count / marks.scale }" /></div>
      <p v-if="marks.cells.length" class="population-note">{{ marks.scale === 1 ? t('ui.m163', { p0: presentation.unit, p1: marks.cells.length }) : t('ui.m164', { p0: marks.scale, p1: presentation.unit, p2: marks.cells.at(-1) }) }}</p>
      <p v-else class="population-note">{{ t('ui.m165') }}</p>
      <ul class="population-sources"><li v-for="source in presentation.sources" :key="source.id"><SourceLink :source="source" /></li></ul>
    </template>
    <p v-else class="population-note">{{ t('ui.m166') }}</p>
    <p v-if="presentation.needsReview" class="population-note">{{ t('ui.m167') }}</p>
  </section>
</template>
<style scoped>
.population-info { border-top: 1px solid var(--line); padding-top: 20px; margin-block: 20px; overflow-wrap: anywhere; }
h3 { font-size: 17px; margin-bottom: 10px; font-weight: 600; }
.population-value { font-size: 18px; line-height: 1.5; }
dl { margin-top: 14px; display: grid; gap: 10px; }
dl > div { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: 12px; }
dt, .population-note { color: var(--muted); font-size: 14px; line-height: 1.7; }
.population-note { margin-top: 12px; }
.population-cells { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 16px; max-width: 360px; }
.population-cells span { width: 14px; height: 14px; background: var(--ink); border-radius: 2px; }
.population-sources { list-style: none; margin-top: 12px; font-size: 14px; }
.population-sources a { display: inline-flex; align-items: center; min-height: 44px; text-decoration: underline; text-underline-offset: 3px; }
</style>
