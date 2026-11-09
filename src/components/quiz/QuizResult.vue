<script setup>
import { useLocale } from '../../composables/useLocale.js'
import { computed } from 'vue'
import { localizedQuestion } from '../../data/localization.js'

const { t, language } = useLocale()

const props = defineProps({ result: { type: Object, required: true }, mistakes: { type: Array, required: true }, storageAvailable: Boolean, returnToLesson: Boolean })
defineEmits(['restart', 'repeat', 'choose', 'catalog', 'study', 'lesson'])
const label = computed(() => t(`quiz.${props.result.difficulty}`))
const localizedMistakes = computed(() => props.mistakes.map(question => localizedQuestion(question, language.value)))
const message = computed(() => props.result.percent === 100 ? t('ui.m190') : props.result.percent >= 70 ? t('ui.m191') : t('ui.m192'))
</script>

<template>
  <article class="quiz-result">
    <p class="eyebrow">{{ label }} · {{ result.mode === 'mistakes' ? t('ui.m193') : t('ui.m194') }}</p>
    <h2 data-quiz-focus tabindex="-1">{{ message }}</h2>
    <p class="quiz-percent" :style="{ '--quiz-p': result.percent }">{{ result.percent }}<span>%</span></p>
    <p class="quiz-result-count">{{ t('ui.m195') }} <strong>{{ result.correct }} {{ t('ui.m040') }} {{ result.total }}</strong>.</p>
    <p v-if="result.skipped" class="quiz-hint">{{ t('ui.m196') }} {{ result.skipped }}{{ t('ui.m197') }}</p>
    <p class="quiz-hint" role="status">{{ storageAvailable ? t('ui.m198') : t('ui.m199') }}</p>
    <div class="quiz-actions">
      <button type="button" class="quiz-primary" @click="$emit('restart')">{{ t('ui.m200') }}</button>
      <button v-if="mistakes.length" type="button" class="quiz-secondary" @click="$emit('repeat')">{{ t('ui.m201') }}{{ mistakes.length }})</button>
      <button type="button" class="quiz-secondary" @click="$emit('choose')">{{ t('ui.m202') }}</button>
      <button v-if="returnToLesson" type="button" class="quiz-secondary" @click="$emit('lesson')">{{ t('ui.m203') }}</button>
      <button type="button" class="quiz-secondary" @click="$emit('catalog')">{{ t('ui.m204') }}</button>
    </div>
    <details v-if="mistakes.length" class="quiz-review">
      <summary><h3 id="quiz-review-title">{{ t('ui.m205') }}</h3><span class="quiz-review-count">{{ mistakes.length }}</span></summary>
      <ul>
        <li v-for="question in localizedMistakes" :key="question.id">
          <p :lang="question.language">{{ question.question }}</p>
          <button type="button" class="quiz-review-study" :aria-label="t('ui.m207', { p0: question.question })" :title="t('ui.m126')" @click="$emit('study', question.speciesId)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3.5" y="5" width="17" height="14" rx="2.5" /><rect x="6.5" y="8.5" width="5" height="5" rx="1" /><path d="M14 9.5h3.5M14 12.5h3.5M6.5 16h11" />
            </svg>
          </button>
        </li>
      </ul>
    </details>
  </article>
</template>

<style scoped>
/* Mistakes to revisit: a compact, collapsible list that stays short as the question bank grows. */
.quiz-review > summary { display: flex; align-items: center; justify-content: space-between; gap: 12px; cursor: pointer; list-style: none; min-height: 44px; }
.quiz-review > summary::-webkit-details-marker { display: none; }
.quiz-review > summary::after { content: '⌄'; margin-left: 4px; color: var(--muted); font-size: 18px; line-height: 1; transition: transform .15s ease; }
.quiz-review[open] > summary::after { transform: rotate(180deg); }
.quiz-review > summary h3 { flex: 1; }
.quiz-review-count { min-width: 28px; padding: 1px 8px; border-radius: 999px; background: #e6eee5; color: var(--ink); font-size: 13px; font-weight: 700; text-align: center; }
.quiz-review li { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-block: 10px; }
.quiz-review li p { flex: 1; min-width: 0; font-size: 15px; line-height: 1.5; }
.quiz-review-study {
  flex: 0 0 auto; display: grid; place-items: center; width: 36px; height: 36px;
  border: 1px solid var(--line); border-radius: 10px; background: #fff; color: var(--green);
}
.quiz-review-study:hover { border-color: var(--green); background: var(--paper); color: var(--ink); }
</style>
