import { computed, ref, shallowRef, unref } from 'vue'
import { attemptResult, createAttempt, mistakeQuestions, nextQuestion, recordAnswer } from '../data/quiz/engine.js'
import { appendHistory, readHistory } from '../data/quiz/history.js'

function browserStorage() {
  try { return typeof window !== 'undefined' ? window.localStorage : null } catch { return null }
}

export function useQuiz(bank, { storage = browserStorage(), random = Math.random, now } = {}) {
  const attempt = shallowRef(null)
  const restored = readHistory(storage)
  const history = ref(restored.results)
  const storageAvailable = ref(restored.available)
  const stage = computed(() => !attempt.value ? 'selection' : attempt.value.completedAt ? 'result' : 'question')
  const currentQuestion = computed(() => attempt.value?.questions[attempt.value.index] || null)
  const currentAnswer = computed(() => attempt.value?.answers[currentQuestion.value?.id] || null)
  const result = computed(() => attemptResult(attempt.value))
  const mistakes = computed(() => mistakeQuestions(attempt.value))
  const progress = computed(() => attempt.value ? attempt.value.index + (currentAnswer.value ? 1 : 0) : 0)

  function start(difficulty) { attempt.value = createAttempt(unref(bank), difficulty, { random }) }
  function answer(questionId, answerId) { attempt.value = recordAnswer(attempt.value, questionId, answerId) }
  function next() {
    const before = attempt.value
    attempt.value = nextQuestion(before, now)
    if (before && !before.completedAt && attempt.value.completedAt) {
      const saved = appendHistory(history.value, result.value, storage)
      history.value = saved.results; storageAvailable.value = saved.available
    }
  }
  function restart() { if (attempt.value) start(attempt.value.difficulty) }
  function repeatMistakes() {
    if (!mistakes.value.length || stage.value !== 'result') return
    attempt.value = createAttempt(unref(bank), attempt.value.difficulty, { random, questionIds: mistakes.value.map(q => q.id) })
  }
  function selectDifficulty() { attempt.value = null }

  return { attempt, stage, currentQuestion, currentAnswer, result, mistakes, progress, history,
    storageAvailable, start, answer, next, restart, repeatMistakes, selectDifficulty }
}
