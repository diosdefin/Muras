<script setup>
import { computed } from 'vue'
import { DIFFICULTIES } from '../../data/quiz/model.js'
const props = defineProps({ result: { type: Object, required: true }, mistakes: { type: Array, required: true }, storageAvailable: Boolean, returnToLesson: Boolean })
defineEmits(['restart', 'repeat', 'choose', 'catalog', 'study', 'lesson'])
const label = computed(() => DIFFICULTIES.find(level => level.id === props.result.difficulty).label)
const message = computed(() => props.result.percent === 100 ? 'Все ответы верны' : props.result.percent >= 70 ? 'Хороший результат' : 'Продолжайте исследовать')
</script>

<template>
  <article class="quiz-result">
    <p class="eyebrow">{{ label }} · {{ result.mode === 'mistakes' ? 'Повторение ошибок' : 'Результат' }}</p>
    <h2 data-quiz-focus tabindex="-1">{{ message }}</h2>
    <p class="quiz-percent">{{ result.percent }}<span>%</span></p>
    <p class="quiz-result-count">Правильных ответов: <strong>{{ result.correct }} из {{ result.total }}</strong>.</p>
    <p v-if="result.skipped" class="quiz-hint">Пропущено: {{ result.skipped }}. Пропуски входят в общее число вопросов и не дают баллов.</p>
    <p class="quiz-hint" role="status">{{ storageAvailable ? 'Результат сохранён в этом браузере.' : 'Локальное сохранение недоступно. Результат доступен до закрытия страницы.' }}</p>
    <div class="quiz-actions">
      <button type="button" class="quiz-primary" @click="$emit('restart')">Пройти снова</button>
      <button v-if="mistakes.length" type="button" class="quiz-secondary" @click="$emit('repeat')">Повторить ошибки ({{ mistakes.length }})</button>
      <button type="button" class="quiz-secondary" @click="$emit('choose')">Выбрать уровень</button>
      <button v-if="returnToLesson" type="button" class="quiz-secondary" @click="$emit('lesson')">Вернуться к уроку</button>
      <button type="button" class="quiz-secondary" @click="$emit('catalog')">Вернуться к каталогу</button>
    </div>
    <section v-if="mistakes.length" class="quiz-review" aria-labelledby="quiz-review-title">
      <h3 id="quiz-review-title">Что можно повторить</h3>
      <p class="quiz-hint">Откройте запись вида или повторите только вопросы с ошибками и пропусками.</p>
      <ul>
        <li v-for="question in mistakes" :key="question.id">
          <p>{{ question.question }}</p>
          <button type="button" class="quiz-secondary" :aria-label="`Изучить вид для вопроса: ${question.question}`" @click="$emit('study', question.speciesId)">Изучить вид <span aria-hidden="true">↗</span></button>
        </li>
      </ul>
    </section>
  </article>
</template>
