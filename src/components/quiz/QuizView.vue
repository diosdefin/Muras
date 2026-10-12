<script setup>
import { computed, nextTick, ref, toRef, watch } from 'vue'
import QuizQuestion from './QuizQuestion.vue'
import QuizResult from './QuizResult.vue'
import { useQuiz } from '../../composables/useQuiz.js'
import { DIFFICULTIES, QUESTION_LIMIT } from '../../data/quiz/model.js'

const props = defineProps({ questions: { type: Array, required: true }, species: { type: Array, required: true }, loading: Boolean, error: { type: String, default: '' } })
const emit = defineEmits(['catalog', 'study'])
const { attempt, stage, currentQuestion, currentAnswer, result, mistakes, progress, history, storageAvailable,
  start, answer, next, restart, repeatMistakes, selectDifficulty } = useQuiz(toRef(props, 'questions'))
const content = ref(null)
const currentLevel = computed(() => DIFFICULTIES.find(level => level.id === attempt.value?.difficulty))
const questionCount = difficulty => Math.min(QUESTION_LIMIT, props.questions.filter(q => q.difficulty === difficulty).length)
const lastResult = difficulty => history.value.filter(r => r.difficulty === difficulty && r.mode === 'standard').at(-1)

watch(() => `${stage.value}:${currentQuestion.value?.id}`, async () => {
  await nextTick()
  content.value?.querySelector('[data-quiz-focus]')?.focus()
})
</script>

<template>
  <section id="quiz" class="quiz-section page-container" aria-labelledby="quiz-title" tabindex="-1" :aria-busy="loading">
    <header class="quiz-heading">
      <p class="eyebrow"><span class="red-rule" aria-hidden="true"></span> Учиться через открытие</p>
      <h1 id="quiz-title">Насколько хорошо<br class="hidden sm:block" /> вы знаете природу?</h1>
      <p>Виды Кыргызстана, их местообитания и охрана. Каждый ответ — возможность узнать больше.</p>
    </header>
    <p v-if="loading" class="catalog-message" role="status">Загружаем вопросы…</p>
    <p v-else-if="error" class="catalog-message error-message" role="alert">{{ error }} Каталог остаётся доступен.</p>
    <div v-else ref="content">
      <div v-if="stage === 'selection'" class="quiz-selection quiz-enter">
        <h2 data-quiz-focus tabindex="-1">Выберите уровень</h2>
        <p class="quiz-hint">Без таймера. До {{ QUESTION_LIMIT }} вопросов за прохождение — доступное количество указано ниже. Источники появятся после ответа.</p>
        <div class="quiz-levels">
          <button v-for="level in DIFFICULTIES" :key="level.id" type="button" class="quiz-level" :disabled="!questionCount(level.id)"
            :aria-label="`Начать: ${level.label}`" @click="start(level.id)">
            <span class="eyebrow">{{ level.number }} · {{ questionCount(level.id) }} вопросов</span>
            <span class="quiz-level-title">{{ level.label }}</span>
            <span>{{ level.description }}</span>
            <span v-if="lastResult(level.id)" class="quiz-last-result">Последний результат: {{ lastResult(level.id).percent }}% · {{ lastResult(level.id).correct }}/{{ lastResult(level.id).total }}</span>
            <span class="quiz-level-action">{{ questionCount(level.id) ? 'Начать' : 'Вопросов пока нет' }} <span aria-hidden="true">↗</span></span>
          </button>
        </div>
        <p class="quiz-hint">Результаты хранятся только в этом браузере. Для повторения ошибок завершите прохождение.</p>
      </div>
      <div v-else-if="stage === 'question'" :key="currentQuestion.id" class="quiz-session quiz-enter">
        <div class="quiz-progress-heading">
          <p>{{ currentLevel.label }}{{ attempt.mode === 'mistakes' ? ' · Повторение ошибок' : '' }}</p>
          <p>Вопрос {{ attempt.index + 1 }} из {{ attempt.questions.length }}</p>
        </div>
        <progress class="quiz-progress" :value="progress" :max="attempt.questions.length" aria-label="Прогресс викторины" />
        <QuizQuestion :question="currentQuestion" :answer="currentAnswer" :species="species" :last="attempt.index === attempt.questions.length - 1"
          @answer="answer" @next="next" @study="emit('study', $event)" />
        <button type="button" class="quiz-back" @click="emit('catalog')">← Вернуться к каталогу</button>
      </div>
      <QuizResult v-else class="quiz-enter" :result="result" :mistakes="mistakes" :storage-available="storageAvailable"
        @restart="restart" @repeat="repeatMistakes" @choose="selectDifficulty" @catalog="emit('catalog')" @study="emit('study', $event)" />
    </div>
  </section>
</template>
