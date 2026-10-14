<script setup>
import ErrorNotice from '../ErrorNotice.vue'
import { useLocale } from '../../composables/useLocale.js'
import { computed, nextTick, ref, toRef, watch } from 'vue'
import QuizQuestion from './QuizQuestion.vue'
import QuizResult from './QuizResult.vue'
import { useQuiz } from '../../composables/useQuiz.js'
import { DIFFICULTIES, QUESTION_LIMIT } from '../../data/quiz/model.js'

const { t } = useLocale()

const props = defineProps({ questions: { type: Array, required: true }, species: { type: Array, required: true }, loading: Boolean, error: { type: String, default: '' }, returnToLesson: Boolean })
const emit = defineEmits(['catalog', 'study', 'lesson'])
const { attempt, stage, currentQuestion, currentAnswer, result, mistakes, progress, history, storageAvailable,
  start, answer, next, restart, repeatMistakes, selectDifficulty } = useQuiz(toRef(props, 'questions'))
const content = ref(null)
const levels = computed(() => DIFFICULTIES.map(level => ({...level, label: t(`quiz.${level.id}`), description: t(`quiz.${level.id}Description`)})))
const currentLevel = computed(() => levels.value.find(level => level.id === attempt.value?.difficulty))
const questionCount = difficulty => Math.min(QUESTION_LIMIT, props.questions.filter(q => q.difficulty === difficulty).length)
const lastResult = difficulty => history.value.filter(r => r.difficulty === difficulty && r.mode === 'standard').at(-1)

watch(() => `${stage.value}:${currentQuestion.value?.id}`, async () => {
  await nextTick()
  content.value?.querySelector('[data-quiz-focus]')?.focus({ preventScroll: true })
})
</script>

<template>
  <section id="quiz" class="quiz-section page-container" aria-labelledby="quiz-title" tabindex="-1" :aria-busy="loading">
    <header class="quiz-heading">
      <p class="eyebrow"><span class="red-rule" aria-hidden="true"></span> {{ t('ui.m208') }}</p>
      <h1 id="quiz-title">{{ t('ui.m209') }}<br class="hidden sm:block" /> {{ t('ui.m210') }}</h1>
      <p>{{ t('ui.m211') }}</p>
    </header>
    <button v-if="returnToLesson && stage !== 'result'" type="button" class="quiz-secondary quiz-lesson-return" @click="emit('lesson')">{{ t('ui.m203') }}</button>
    <p v-if="loading" class="catalog-message" role="status">{{ t('ui.m212') }}</p>
    <ErrorNotice v-else-if="error" :message="error"><p>{{ t('ui.m213') }}</p></ErrorNotice>
    <div v-else ref="content">
      <div v-if="stage === 'selection'" class="quiz-selection quiz-enter">
        <h2 data-quiz-focus tabindex="-1">{{ t('ui.m214') }}</h2>
        <p class="quiz-hint">{{ t('ui.m215') }} {{ QUESTION_LIMIT }} {{ t('ui.m216') }}</p>
        <div class="quiz-levels">
          <button v-for="level in levels" :key="level.id" type="button" class="quiz-level" :disabled="!questionCount(level.id)"
            :aria-label="t('ui.m217', { p0: level.label })" @click="start(level.id)">
            <span class="eyebrow">{{ level.number }} · {{ questionCount(level.id) }} {{ t('ui.m218') }}</span>
            <span class="quiz-level-title">{{ level.label }}</span>
            <span>{{ level.description }}</span>
            <span v-if="lastResult(level.id)" class="quiz-last-result">{{ t('ui.m219') }} {{ lastResult(level.id).percent }}% · {{ lastResult(level.id).correct }}/{{ lastResult(level.id).total }}</span>
            <span class="quiz-level-action">{{ questionCount(level.id) ? t('ui.m220') : t('ui.m221') }} <span aria-hidden="true">↗</span></span>
          </button>
        </div>
        <p class="quiz-hint">{{ t('ui.m222') }}</p>
      </div>
      <div v-else-if="stage === 'question'" :key="currentQuestion.id" class="quiz-session quiz-enter">
        <div class="quiz-progress-heading">
          <p>{{ currentLevel.label }}{{ attempt.mode === 'mistakes' ? ' ' + t('ui.m223') : '' }}</p>
          <p>{{ t('ui.m224') }} {{ attempt.index + 1 }} {{ t('ui.m040') }} {{ attempt.questions.length }}</p>
        </div>
        <progress class="quiz-progress" :value="progress" :max="attempt.questions.length" :aria-label="t('ui.m225')" />
        <QuizQuestion :question="currentQuestion" :answer="currentAnswer" :species="species" :last="attempt.index === attempt.questions.length - 1"
          @answer="answer" @next="next" @study="emit('study', $event)" />
        <button type="button" class="quiz-back" @click="emit('catalog')">{{ t('ui.m226') }}</button>
      </div>
      <QuizResult v-else class="quiz-enter" :result="result" :mistakes="mistakes" :storage-available="storageAvailable" :return-to-lesson="returnToLesson"
        @restart="restart" @repeat="repeatMistakes" @choose="selectDifficulty" @catalog="emit('catalog')" @study="emit('study', $event)" @lesson="emit('lesson')" />
    </div>
  </section>
</template>
