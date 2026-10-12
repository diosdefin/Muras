<script setup>
import { computed, ref, watch } from 'vue'
import { localized, PLACEHOLDER, publicImageUrl, speciesName } from '../../data/presentation.js'
import { questionPhoto, questionSources, questionSpecies } from '../../data/quiz/model.js'

const props = defineProps({ question: { type: Object, required: true }, answer: { type: Object, default: null },
  species: { type: Array, required: true }, last: Boolean })
const emit = defineEmits(['answer', 'next', 'study'])
const failedImage = ref(false)
const photo = computed(() => questionPhoto(props.question, props.species))
const record = computed(() => questionSpecies(props.question, props.species))
const sources = computed(() => questionSources(props.question, props.species))
const correctOption = computed(() => props.question.options.find(option => option.id === props.question.correctAnswerId))
const latinOptions = computed(() => props.question.factPaths.some(path => path === 'scientificName' || path.startsWith('taxonomy.')))
watch(() => props.question.id, () => { failedImage.value = false })
function answerState(option) {
  if (!props.answer) return 'available'
  if (option.id === props.question.correctAnswerId) return 'correct'
  return props.answer.answerId === option.id ? 'incorrect' : 'locked'
}
</script>

<template>
  <article class="quiz-question" :class="{ 'quiz-question-with-photo': !!question.image }">
    <h2 id="quiz-question-title" data-quiz-focus tabindex="-1">{{ question.question }}</h2>
    <figure v-if="question.image" class="quiz-photo">
      <img v-if="photo && !failedImage" :src="publicImageUrl(photo.path)" :width="photo.width" :height="photo.height"
        :alt="answer ? `Фотография: ${speciesName(record)}` : 'Фотография для определения вида'" decoding="async" @error="failedImage = true" />
      <div v-else class="quiz-photo-fallback" role="status">
        <img :src="PLACEHOLDER" width="800" height="600" alt="Условный горный пейзаж; фотография недоступна" />
        <p>Фотография недоступна. Можно пропустить вопрос и прочитать объяснение.</p>
        <button v-if="!answer" type="button" class="quiz-secondary" @click="emit('answer', question.id, null)">Пропустить вопрос без фото</button>
      </div>
      <figcaption v-if="photo" class="quiz-photo-credit">
        <span>Фото: {{ photo.author }}.</span>
        <a :href="photo.originalPage" target="_blank" rel="noopener noreferrer">Оригинал фото<span class="sr-only"> (новая вкладка)</span></a>
        <a :href="photo.licenseUrl" target="_blank" rel="noopener noreferrer">{{ photo.license }}<span class="sr-only"> (условия, новая вкладка)</span></a>
        <span>WebP · кадрирование. Адаптация на условиях {{ photo.license }}.</span>
        <p v-if="answer">{{ localized(photo.caption) }}</p>
      </figcaption>
    </figure>
    <div class="quiz-options" role="group" aria-labelledby="quiz-question-title">
      <button v-for="(option, index) in question.options" :key="option.id" type="button" class="quiz-answer"
        :data-state="answerState(option)" :aria-pressed="answer?.answerId === option.id" :aria-disabled="!!answer"
        @click="emit('answer', question.id, option.id)">
        <span class="quiz-answer-letter" aria-hidden="true">{{ ['А', 'Б', 'В', 'Г'][index] }}</span>
        <span :lang="latinOptions ? 'la' : 'ru'">{{ option.text }}</span>
        <span v-if="answer && option.id === question.correctAnswerId" class="quiz-answer-state">{{ answer.correct ? 'Ваш ответ · верно' : 'Правильный ответ' }}</span>
        <span v-else-if="answer?.answerId === option.id" class="quiz-answer-state">Ваш ответ · неверно</span>
      </button>
    </div>
    <section v-if="answer" class="quiz-feedback" :data-correct="answer.correct" aria-labelledby="quiz-feedback-title">
      <div role="status" aria-live="polite">
        <h3 id="quiz-feedback-title">{{ answer.skipped ? 'Вопрос пропущен' : answer.correct ? 'Верно' : 'Можно узнать больше' }}</h3>
        <p v-if="!answer.correct">Правильный ответ: <strong :lang="latinOptions ? 'la' : 'ru'">{{ correctOption.text }}</strong>.</p>
        <p>{{ question.explanation }}</p>
      </div>
      <ul class="quiz-sources" aria-label="Источники ответа">
        <li v-for="source in sources" :key="source.id"><a :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.title }}<span class="sr-only"> (новая вкладка)</span></a></li>
      </ul>
      <div class="quiz-actions">
        <button type="button" class="quiz-primary" @click="emit('next')">{{ last ? 'Посмотреть результат' : 'Следующий вопрос' }} <span aria-hidden="true">→</span></button>
        <button type="button" class="quiz-secondary" @click="emit('study', question.speciesId)">Изучить вид</button>
      </div>
    </section>
    <p v-else class="quiz-hint">Выберите один ответ. Затем появятся объяснение и источники.</p>
  </article>
</template>
