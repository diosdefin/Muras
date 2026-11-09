<script setup>
import ErrorNotice from '../ErrorNotice.vue'
import { useLocale } from '../../composables/useLocale.js'
import { computed, nextTick, ref, toRef, watch } from 'vue'
import QuizQuestion from './QuizQuestion.vue'
import QuizResult from './QuizResult.vue'
import { useQuiz } from '../../composables/useQuiz.js'
import { DIFFICULTIES, QUESTION_LIMIT, questionSpecies } from '../../data/quiz/model.js'
import GroupFilter from '../GroupFilter.vue'
import CustomSelect from '../CustomSelect.vue'

const { t } = useLocale()

const props = defineProps({ questions: { type: Array, required: true }, species: { type: Array, required: true }, loading: Boolean, error: { type: String, default: '' }, returnToLesson: Boolean })
const emit = defineEmits(['catalog', 'study', 'lesson'])
// Optional topic filter: all questions by default; small groups are combined as "Other".
const MAIN_GROUPS = ['birds', 'mammals', 'plants']
const GROUP_KEY = 'redbook.quiz.group.v1'
const groupOf = question => {
  const group = questionSpecies(question, props.species)?.group
  return MAIN_GROUPS.includes(group) ? group : 'other'
}
const groupLabels = { birds: 'ui.m142', mammals: 'ui.m141', plants: 'ui.m143', other: 'quiz.groupOther' }
const groupOptions = computed(() => {
  const present = new Set(props.questions.map(groupOf))
  return [{ value: 'ALL', label: t('ui.m140') },
    ...[...MAIN_GROUPS, 'other'].filter(group => present.has(group)).map(value => ({ value, label: t(groupLabels[value]) }))]
})
const readGroup = () => { try { return localStorage.getItem(GROUP_KEY) || 'ALL' } catch { return 'ALL' } }
const group = ref(typeof window === 'undefined' ? 'ALL' : readGroup())
watch(group, value => { try { localStorage.setItem(GROUP_KEY, value) } catch { /* not stored */ } })
const bank = computed(() => {
  const selected = groupOptions.value.some(option => option.value === group.value) ? group.value : 'ALL'
  return selected === 'ALL' ? props.questions : props.questions.filter(question => groupOf(question) === selected)
})
const { attempt, stage, currentQuestion, currentAnswer, result, mistakes, progress, history, storageAvailable,
  start, answer, next, finish, restart, repeatMistakes, selectDifficulty } = useQuiz(bank)
const content = ref(null)
const levels = computed(() => DIFFICULTIES.map(level => ({...level, label: t(`quiz.${level.id}`), description: t(`quiz.${level.id}Description`)})))
const currentLevel = computed(() => levels.value.find(level => level.id === attempt.value?.difficulty))
const questionCount = difficulty => Math.min(QUESTION_LIMIT, bank.value.filter(q => q.difficulty === difficulty).length)
const lastResult = difficulty => history.value.filter(r => r.difficulty === difficulty && r.mode === 'standard').at(-1)

watch(() => `${stage.value}:${currentQuestion.value?.id}`, async () => {
  await nextTick()
  content.value?.querySelector('[data-quiz-focus]')?.focus({ preventScroll: true })
})
</script>

<template>
  <section id="quiz" class="quiz-section page-container" :aria-labelledby="stage === 'selection' ? 'quiz-title' : undefined" :aria-label="stage === 'selection' ? undefined : t('ui.m011')" tabindex="-1" :aria-busy="loading">
    <!-- The introduction is for choosing a level; during a test the question comes first. -->
    <header v-if="stage === 'selection'" class="quiz-heading">
      <p class="eyebrow"><span class="red-rule" aria-hidden="true"></span> {{ t('ui.m208') }}</p>
      <h1 id="quiz-title">{{ t('ui.m209') }}<br class="hidden sm:block" /> {{ t('ui.m210') }}</h1>
      <p>{{ t('ui.m211') }}</p>
    </header>
    <button v-if="returnToLesson && stage !== 'result'" type="button" class="quiz-secondary quiz-lesson-return" @click="emit('lesson')">{{ t('ui.m203') }}</button>
    <p v-if="loading" class="catalog-message muras-loading" role="status">{{ t('ui.m212') }}</p>
    <ErrorNotice v-else-if="error" :message="error"><p>{{ t('ui.m213') }}</p></ErrorNotice>
    <div v-else ref="content">
      <div v-if="stage === 'selection'" class="quiz-selection quiz-enter">
        <h2 data-quiz-focus tabindex="-1">{{ t('ui.m214') }}</h2>
        <div v-if="groupOptions.length > 2" class="quiz-groups">
          <GroupFilter class="quiz-groups-chips" v-model="group" :options="groupOptions" :label="t('ui.m054')" />
          <!-- Phones: the same choice as a compact dropdown instead of two rows of chips. -->
          <CustomSelect class="quiz-groups-select" v-model="group" :options="groupOptions" :label="t('ui.m054')" />
        </div>
        <div class="quiz-levels">
          <button v-for="level in levels" :key="level.id" type="button" class="quiz-level" :disabled="!questionCount(level.id)"
            :aria-label="t('ui.m217', { p0: level.label })" @click="start(level.id)">
            <span class="eyebrow">{{ questionCount(level.id) }} {{ t('ui.m218') }}</span>
            <span class="quiz-level-title">{{ level.label }}</span>
            <span>{{ level.description }}</span>
            <span v-if="lastResult(level.id)" class="quiz-last-result">{{ t('ui.m219') }} {{ lastResult(level.id).percent }}% · {{ lastResult(level.id).correct }}/{{ lastResult(level.id).total }}</span>
            <span class="quiz-level-action">{{ questionCount(level.id) ? t('ui.m220') : t('ui.m221') }} <span v-if="questionCount(level.id)" aria-hidden="true">→</span></span>
          </button>
        </div>
      </div>
      <div v-else-if="stage === 'question'" :key="currentQuestion.id" class="quiz-session quiz-enter">
        <div class="quiz-progress-heading">
          <p>{{ currentLevel.label }}{{ attempt.mode === 'mistakes' ? ' ' + t('ui.m223') : '' }}</p>
          <p>{{ t('ui.m224') }} {{ attempt.index + 1 }} {{ t('ui.m040') }} {{ attempt.questions.length }}</p>
        </div>
        <progress class="quiz-progress" :value="progress" :max="attempt.questions.length" :aria-label="t('ui.m225')" />
        <QuizQuestion :question="currentQuestion" :answer="currentAnswer" :species="species" :last="attempt.index === attempt.questions.length - 1"
          @answer="answer" @next="next" @study="emit('study', $event)" />
        <button type="button" class="quiz-secondary quiz-finish" @click="finish">{{ t('quiz.finish') }}</button>
      </div>
      <QuizResult v-else class="quiz-enter" :result="result" :mistakes="mistakes" :storage-available="storageAvailable" :return-to-lesson="returnToLesson"
        @restart="restart" @repeat="repeatMistakes" @choose="selectDifficulty" @catalog="emit('catalog')" @study="emit('study', $event)" @lesson="emit('lesson')" />
    </div>
  </section>
</template>

<style scoped>
.quiz-finish { margin-top: 24px; }
.quiz-groups { margin-top: 14px; }
.quiz-groups-select { display: none; }
@media (max-width: 767px) {
  .quiz-groups :deep(.quiz-groups-chips) { display: none; }
  .quiz-groups { position: relative; z-index: 5; }
  .quiz-groups-select { display: block; }
}
.quiz-groups :deep(.group-filter) { gap: 6px; }
.quiz-groups :deep(.group-filter button) { min-height: 36px; padding: 6px 12px; border-radius: 999px; font-size: 13px; }
</style>
