<script setup>
import ErrorNotice from '../ErrorNotice.vue'
import SourceLink from "../SourceLink.vue"
import ScientificText from "../ScientificText.vue"
import { useLocale } from '../../composables/useLocale.js'
import { nextTick, onBeforeUnmount, onMounted, ref, toRef, watch } from 'vue'
import LessonPhoto from './LessonPhoto.vue'
import LessonDetails from './LessonDetails.vue'
import LessonReferences from './LessonReferences.vue'
import { useLesson } from '../../composables/useLesson.js'
import { useLessonFullscreen } from '../../composables/useLessonFullscreen.js'
import { lessonKey, lessonTabTarget } from '../../data/lesson.js'
import { groupLabel, nationalStatus, regionNames, speciesName, speciesNameLanguage, statusDetails } from '../../data/presentation.js'

const { t, language, uiMessage } = useLocale()

const props = defineProps({ species: { type: Array, required: true }, active: Boolean, loading: Boolean, error: { type: String, default: '' } })
const emit = defineEmits(['catalog', 'quiz'])
const root = ref(null)
const { selectedId, current, index, select, next, previous } = useLesson(toRef(props, 'species'))
const { isFullscreen, message, toggle, exit } = useLessonFullscreen(root, {
  onExternalExit: () => { if (props.active) emit('catalog') },
  onFocus: () => { if (props.active) nextTick(() => { root.value?.focus({ preventScroll: true }); if (root.value) root.value.scrollTop = 0 }) },
})
watch(() => current.value?.id, async () => {
  await nextTick()
  if (!props.active || !root.value) return
  const editing = document.activeElement?.closest('select, input, textarea, [contenteditable]')
  if (isFullscreen.value) root.value.scrollTop = 0
  if (!editing) {
    if (!isFullscreen.value) root.value.scrollIntoView({ block: 'start', behavior: 'instant' })
    root.value.focus({ preventScroll: true })
  }
})
function keydown(event) {
  if (!props.active) return
  if (isFullscreen.value && event.key === 'Tab') {
    const elements = [...root.value.querySelectorAll('button, a[href], input, select, textarea, summary, [tabindex]')]
      .filter(element => {
        if (element.disabled || element.tabIndex < 0 || !element.getClientRects().length || element.closest('[hidden], [inert]')) return false
        // Chromium can retain layout boxes for links in closed details; they cannot receive focus.
        const closed = element.closest('details:not([open])')
        return !closed || closed.querySelector('summary')?.contains(element)
      })
    const target = lessonTabTarget(event, root.value, document.activeElement, elements)
    if (target) { event.preventDefault(); target.focus(); return }
  }
  const action = lessonKey(event, root.value)
  if (!action) return
  event.preventDefault()
  if (action === 'exit') emit('catalog')
  else if (action === 'next') next()
  else previous()
}
onMounted(() => document.addEventListener('keydown', keydown))
onBeforeUnmount(() => document.removeEventListener('keydown', keydown))
defineExpose({ exitFullscreen: exit })
</script>

<template>
  <section id="lesson" ref="root" class="lesson-section page-container" tabindex="-1" aria-labelledby="lesson-title" :aria-busy="loading">
    <header class="lesson-toolbar">
      <div><p class="eyebrow">{{ t('ui.m088') }}</p><h1 id="lesson-title">{{ t('ui.m012') }}</h1></div>
      <div class="lesson-tools">
        <label class="sr-only" for="lesson-species">{{ t('ui.m089') }}</label>
        <select id="lesson-species" :value="selectedId || ''" :disabled="!current" @change="select($event.target.value)">
          <option v-for="record in species" :key="record.id" :value="record.id" :lang="speciesNameLanguage(record, language)">{{ speciesName(record, language) }}</option>
        </select>
        <button class="quiz-secondary" type="button" :aria-pressed="isFullscreen" @click="toggle">{{ isFullscreen ? t('ui.m090') : t('ui.m091') }}</button>
      </div>
    </header>
    <p v-if="message" class="lesson-notice" role="status">{{ uiMessage(message) }}</p>
    <p v-if="loading" class="catalog-message" role="status">{{ t('ui.m092') }}</p>
    <ErrorNotice v-else-if="error" :message="error"></ErrorNotice>
    <p v-else-if="!current" class="catalog-message" role="status">{{ t('ui.m093') }}</p>
    <template v-else>
      <article :key="current.id" class="lesson-slide" tabindex="0" aria-labelledby="lesson-species-title" aria-describedby="lesson-keyboard-note">
        <LessonPhoto :species="current" />
        <div class="lesson-content">
          <p class="lesson-group">{{ groupLabel(current, language) }} · {{ regionNames(current, language).join(', ') || t('ui.m094') }}</p>
          <h2 id="lesson-species-title" :lang="speciesNameLanguage(current, language)">{{ speciesName(current, language) }}</h2>
          <p class="lesson-names"><span lang="ru">{{ current.names.ru }}</span><span lang="ky">{{ current.names.ky || t('ui.m095') }}</span><span class="scientific-name" lang="la">{{ current.scientificName || '—' }}</span></p>
          <p class="lesson-editorial">{{ current.verified ? t('ui.m096') : t('ui.m097') }}</p>
          <div class="lesson-brief-facts">
            <section><h3>{{ t('ui.m098') }}</h3><p><ScientificText :value="current.habitat?.description" short /> <LessonReferences :species="current" :ids="current.habitat?.sourceIds" /></p></section>
            <section><h3>{{ t('ui.m099') }}</h3><ul v-if="current.threats?.length"><li v-for="(item, n) in current.threats.slice(0, 2)" :key="n"><ScientificText :value="item.text" /> <LessonReferences :species="current" :ids="item.sourceIds" /></li></ul><p v-else>{{ t('ui.m066') }}</p></section>
            <section><h3>{{ t('ui.m100') }}</h3><p v-if="current.conservationMeasures?.length"><ScientificText :value="current.conservationMeasures[0].text" short /> <LessonReferences :species="current" :ids="current.conservationMeasures[0].sourceIds" /></p><p v-else>{{ t('ui.m066') }}</p></section>
          </div>
          <div class="lesson-statuses">
            <p>{{ nationalStatus(current, language) }} <LessonReferences :species="current" :ids="current.nationalRedBook?.sourceIds" /></p>
            <p>{{ statusDetails(current, language).label }} <LessonReferences :species="current" :ids="current.iucn?.sourceIds" /></p>
          </div>
        </div>
      </article>
      <div class="lesson-navigation">
        <div class="lesson-paging">
          <button class="quiz-secondary" type="button" :disabled="species.length < 2" @click="previous"><span aria-hidden="true">←</span> {{ t('ui.m101') }}</button>
          <p role="status" aria-live="polite" aria-atomic="true"><span>{{ index + 1 }} / {{ species.length }}</span><span class="sr-only"> · {{ speciesName(current, language) }}</span></p>
          <button class="quiz-secondary" type="button" :disabled="species.length < 2" @click="next">{{ t('ui.m102') }} <span aria-hidden="true">→</span></button>
        </div>
        <div class="lesson-actions"><button class="quiz-primary" type="button" @click="emit('quiz')">{{ t('ui.m103') }}</button><button class="quiz-secondary" type="button" @click="emit('catalog')">{{ t('ui.m104') }}</button></div>
      </div>
      <p id="lesson-keyboard-note" class="lesson-keyboard-note">{{ t('ui.m105') }}</p>
      <LessonDetails :key="current.id" :species="current" />
      <details class="lesson-details lesson-source-list">
        <summary>{{ t('ui.m106') }} {{ current.sources.length }}</summary>
        <ol><li v-for="(source, n) in current.sources" :key="source.id"><SourceLink :source="source" /></li></ol>
      </details>
    </template>
  </section>
</template>
