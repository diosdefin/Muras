<script setup>
import { computed } from 'vue'
import { populationCells, populationPresentation } from '../data/population.js'
const props = defineProps({ population: { type: Object, default: null }, sources: { type: Array, default: () => [] } })
const presentation = computed(() => populationPresentation(props.population, props.sources))
const marks = computed(() => populationCells(presentation.value))
</script>
<template>
  <section class="population-info" aria-label="Научные сведения о численности">
    <h3>Численность</h3>
    <p class="population-value">{{ presentation.label }}</p>
    <template v-if="presentation.type !== 'unknown'">
      <dl><div><dt>Точность</dt><dd>{{ presentation.accuracy }}</dd></div><div><dt>Территория</dt><dd>{{ presentation.territory }}</dd></div><div><dt>Год</dt><dd>{{ presentation.year }}</dd></div><div><dt>Единица учёта</dt><dd>{{ presentation.unit }}</dd></div></dl>
      <div v-if="marks.cells.length" class="population-cells" aria-hidden="true"><span v-for="(count, index) in marks.cells" :key="index" :title="`${count} ${presentation.unit}`" :style="{ opacity: 0.35 + 0.65 * count / marks.scale }" /></div>
      <p v-if="marks.cells.length" class="population-note">{{ marks.scale === 1 ? `Одна ячейка — одна единица учёта (${presentation.unit}); всего ${marks.cells.length}.` : `Одна полная ячейка — ${marks.scale} ${presentation.unit}. Последняя — ${marks.cells.at(-1)}. Это агрегированное представление полного подсчёта.` }}</p>
      <p v-else class="population-note">Оценочное значение не представлено как точно подсчитанные особи.</p>
      <ul class="population-sources"><li v-for="source in presentation.sources" :key="source.id"><a :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.title }} <span class="sr-only">(новая вкладка)</span> ↗</a></li></ul>
    </template>
    <p v-else class="population-note">Отсутствие опубликованной подтверждённой оценки не означает, что вид исчез. Неизвестное значение не равно нулю.</p>
    <p v-if="presentation.needsReview" class="population-note">Предложенная оценка требует редакторской проверки и пока не опубликована.</p>
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
