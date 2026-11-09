<script setup>
import SourceLink from "../SourceLink.vue"
import ScientificText from "../ScientificText.vue"
import { useLocale } from '../../composables/useLocale.js'
import { computed, ref, watch } from 'vue'
import { PLACEHOLDER, publicImageUrl, speciesName } from '../../data/presentation.js'
import { localizedQuestion } from '../../data/localization.js'
import { questionPhoto, questionSources, questionSpecies } from '../../data/quiz/model.js'

const { t, language } = useLocale()

const props = defineProps({ question: { type: Object, required: true }, answer: { type: Object, default: null },
  species: { type: Array, required: true }, last: Boolean })
const emit = defineEmits(['answer', 'next', 'study'])
const failedImage = ref(false)
const photo = computed(() => questionPhoto(props.question, props.species))
const record = computed(() => questionSpecies(props.question, props.species))
const sources = computed(() => questionSources(props.question, props.species))
const displayQuestion = computed(() => localizedQuestion(props.question, language.value))
const correctOption = computed(() => displayQuestion.value.options.find(option => option.id === props.question.correctAnswerId))
const latinOptions = computed(() => props.question.factPaths.some(path => path === 'scientificName' || path.startsWith('taxonomy.')))
watch(() => props.question.id, () => { failedImage.value = false })
function answerState(option) {
  if (!props.answer) return 'available'
  if (option.id === props.question.correctAnswerId) return 'correct'
  return props.answer.answerId === option.id ? 'incorrect' : 'locked'
}
</script>

<template>
  <article class="quiz-question" :lang="language" :class="{ 'quiz-question-with-photo': !!question.image }">
    <h2 id="quiz-question-title" :lang="displayQuestion.language" data-quiz-focus tabindex="-1">{{ displayQuestion.question }}</h2>
    <p v-if="displayQuestion.fallback" class="language-note">{{ t('scientificFallback', { language: t('language.ru') }) }}</p>
    <figure v-if="question.image" class="quiz-photo">
      <img v-if="photo && !failedImage" :src="publicImageUrl(photo.path)" :width="photo.width" :height="photo.height"
        :alt="answer ? t('ui.m168', { p0: speciesName(record, language) }) : t('ui.m169')" decoding="async" @error="failedImage = true" />
      <div v-else class="quiz-photo-fallback" role="status">
        <img :src="PLACEHOLDER" width="800" height="600" :alt="t('ui.m170')" />
        <p>{{ t('ui.m171') }}</p>
        <button v-if="!answer" type="button" class="quiz-secondary" @click="emit('answer', question.id, null)">{{ t('ui.m172') }}</button>
      </div>
      <figcaption v-if="photo" class="quiz-photo-credit">
        <span>{{ t('ui.m082') }} {{ photo.author }}.</span>
        <a :href="photo.originalPage" target="_blank" rel="noopener noreferrer">{{ t('ui.m173') }}<span class="sr-only"> {{ t('ui.m107') }}</span></a>
        <a :href="photo.licenseUrl" target="_blank" rel="noopener noreferrer">{{ photo.license }}<span class="sr-only"> {{ t('ui.m085') }}</span></a>
        <span>{{ t('ui.m174') }} {{ photo.license }}.</span>
        <p v-if="answer"><ScientificText :value="photo.caption" /></p>
      </figcaption>
    </figure>
    <div class="quiz-options" role="group" aria-labelledby="quiz-question-title">
      <button v-for="(option, index) in displayQuestion.options" :key="option.id" type="button" class="quiz-answer"
        :data-state="answerState(option)" :aria-pressed="answer?.answerId === option.id" :aria-disabled="!!answer"
        @click="emit('answer', question.id, option.id)">
        <span class="quiz-answer-letter" aria-hidden="true">{{ [t('ui.m175'), t('ui.m176'), t('ui.m177'), t('ui.m178')][index] }}</span>
        <span :lang="latinOptions ? 'la' : option.language">{{ option.text }}</span>
        <span v-if="answer && option.id === question.correctAnswerId" class="quiz-answer-state">{{ answer.correct ? t('ui.m179') : t('ui.m180') }}</span>
        <span v-else-if="answer?.answerId === option.id" class="quiz-answer-state">{{ t('ui.m181') }}</span>
      </button>
    </div>
    <section v-if="answer" class="quiz-feedback" :data-correct="answer.correct" aria-labelledby="quiz-feedback-title">
      <div role="status" aria-live="polite">
        <h3 id="quiz-feedback-title">{{ answer.skipped ? t('ui.m182') : answer.correct ? t('ui.m183') : t('ui.m184') }}</h3>
        <p v-if="!answer.correct">{{ t('ui.m185') }} <strong :lang="latinOptions ? 'la' : correctOption.language">{{ correctOption.text }}</strong>.</p>
        <p :lang="displayQuestion.language">{{ displayQuestion.explanation }}</p>
      </div>
      <details v-if="sources.length" class="quiz-sources-details">
        <summary>{{ t('ui.m186') }} · {{ sources.length }}</summary>
        <ul class="quiz-sources" :aria-label="t('ui.m186')">
          <li v-for="source in sources" :key="source.id"><SourceLink :source="source" /></li>
        </ul>
      </details>
    </section>
    <!-- After an answer the next step stays at hand at the bottom of the screen; no scrolling needed. -->
    <div v-if="answer" class="quiz-actions quiz-next-bar">
      <button type="button" class="quiz-primary" @click="emit('next')">{{ last ? t('ui.m187') : t('ui.m188') }} <span aria-hidden="true">→</span></button>
      <button type="button" class="quiz-secondary" @click="emit('study', question.speciesId)">{{ t('ui.m126') }}</button>
    </div>
  </article>
</template>

<style scoped>
.quiz-next-bar {
  position: sticky; bottom: 0; z-index: 5; display: flex; flex-wrap: wrap; gap: 10px;
  margin-top: 16px; padding: 10px 0 calc(10px + env(safe-area-inset-bottom));
  background: rgb(255 255 255 / .96); border-top: 1px solid var(--line);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
}
.quiz-question-with-photo > .quiz-next-bar { grid-column: 1 / -1; }
.quiz-sources-details { margin-top: 12px; }
.quiz-sources-details > summary { cursor: pointer; min-height: 36px; display: flex; align-items: center; color: var(--muted); font-size: 14px; font-weight: 600; }
.quiz-sources-details .quiz-sources { margin-top: 4px; }
/* A smaller photo keeps the answers in view. */
@media (min-width: 768px) {
  .quiz-photo > img, .quiz-photo :deep(.quiz-photo-fallback img) { max-height: 300px; object-fit: contain; background: #eef2ec; }
}
</style>
