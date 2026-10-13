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
    <p class="quiz-percent">{{ result.percent }}<span>%</span></p>
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
    <section v-if="mistakes.length" class="quiz-review" aria-labelledby="quiz-review-title">
      <h3 id="quiz-review-title">{{ t('ui.m205') }}</h3>
      <p class="quiz-hint">{{ t('ui.m206') }}</p>
      <ul>
        <li v-for="question in localizedMistakes" :key="question.id">
          <p :lang="question.language">{{ question.question }}</p>
          <button type="button" class="quiz-secondary" :aria-label="t('ui.m207', { p0: question.question })" @click="$emit('study', question.speciesId)">{{ t('ui.m126') }} <span aria-hidden="true">↗</span></button>
        </li>
      </ul>
    </section>
  </article>
</template>
