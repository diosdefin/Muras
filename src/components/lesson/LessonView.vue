<script setup>
import ErrorNotice from '../ErrorNotice.vue'
import SourceLink from "../SourceLink.vue"
import ScientificText from "../ScientificText.vue"
import { useLocale } from '../../composables/useLocale.js'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRef, watch } from 'vue'
import LessonPhoto from './LessonPhoto.vue'
import CustomSelect from '../CustomSelect.vue'
import '../custom-select.css'
import LessonDetails from './LessonDetails.vue'
import LessonReferences from './LessonReferences.vue'
import { useLesson } from '../../composables/useLesson.js'
import { useLessonFullscreen } from '../../composables/useLessonFullscreen.js'
import { lessonKey, lessonTabTarget } from '../../data/lesson.js'
import { groupLabel, nationalStatus, speciesName, speciesNameLanguage, statusDetails } from '../../data/presentation.js'

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
  const editing = document.activeElement?.closest('.muras-select, select, input, textarea, [contenteditable]')
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
// Other-language names under the title, without repeating the title itself.
const otherNames = computed(() => {
  if (!current.value) return []
  const title = speciesName(current.value, language.value)
  return ['ru', 'ky'].map(lang => ({ lang, text: current.value.names?.[lang] })).filter(name => name.text && name.text !== title)
})
// Phones: a horizontal swipe on the slide moves to the next or previous species.
let touch = null
function touchStart(event) {
  const point = event.changedTouches[0]
  touch = { x: point.clientX, y: point.clientY }
}
function touchEnd(event) {
  if (!touch || props.species.length < 2) return
  const point = event.changedTouches[0]
  const dx = point.clientX - touch.x, dy = point.clientY - touch.y
  touch = null
  if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return
  if (dx < 0) next()
  else previous()
}
defineExpose({ exitFullscreen: exit })
</script>

<template>
  <section id="lesson" ref="root" class="lesson-section page-container" tabindex="-1" aria-labelledby="lesson-title" :aria-busy="loading">
    <header class="lesson-toolbar">
      <div><p class="eyebrow">{{ t('ui.m088') }}</p><h1 id="lesson-title">{{ t('ui.m012') }}</h1></div>
      <div class="lesson-tools">
        <label class="sr-only" for="lesson-species">{{ t('ui.m089') }}</label>
        <CustomSelect id="lesson-species" :model-value="selectedId || ''" :options="species.map(record => ({ value: record.id, label: speciesName(record, language) }))" :label="t('ui.m089')" :disabled="!current" @update:model-value="select($event)" />
        <button class="quiz-secondary lesson-fullscreen" type="button" :aria-pressed="isFullscreen" :title="isFullscreen ? t('ui.m090') : t('ui.m091')" @click="toggle">
          <svg class="lesson-fullscreen-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path v-if="isFullscreen" d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
            <path v-else d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          </svg>
          <span class="lesson-fullscreen-label">{{ isFullscreen ? t('ui.m090') : t('ui.m091') }}</span>
        </button>
      </div>
    </header>
    <p v-if="message" class="lesson-notice" role="status">{{ uiMessage(message) }}</p>
    <p v-if="loading" class="catalog-message muras-loading" role="status">{{ t('ui.m092') }}</p>
    <ErrorNotice v-else-if="error" :message="error"></ErrorNotice>
    <p v-else-if="!current" class="catalog-message" role="status">{{ t('ui.m093') }}</p>
    <template v-else>
      <article :key="current.id" class="lesson-slide" tabindex="0" aria-labelledby="lesson-species-title" aria-describedby="lesson-keyboard-note"
        @touchstart.passive="touchStart" @touchend="touchEnd">
        <LessonPhoto :species="current" />
        <div class="lesson-content">
          <p class="lesson-group">{{ groupLabel(current, language) }}</p>
          <h2 id="lesson-species-title" :lang="speciesNameLanguage(current, language)">{{ speciesName(current, language) }}</h2>
          <p class="lesson-names"><span v-for="name in otherNames" :key="name.lang" :lang="name.lang">{{ name.text }}</span><span v-if="current.scientificName" class="scientific-name" lang="la">{{ current.scientificName }}</span></p>
          <p class="lesson-editorial" :data-verified="current.verified">{{ current.verified ? t('ui.m096') : t('ui.m097') }}</p>
          <div class="lesson-brief-facts">
            <section><h3>{{ t('ui.m065') }}</h3><p><ScientificText :value="current.habitat?.description" short /> <LessonReferences :species="current" :ids="current.habitat?.sourceIds" /></p></section>
            <section><h3>{{ t('ui.m099') }}</h3><ul v-if="current.threats?.length"><li v-for="(item, n) in current.threats.slice(0, 2)" :key="n"><ScientificText :value="item.text" /> <LessonReferences :species="current" :ids="item.sourceIds" /></li></ul><p v-else>{{ t('ui.m066') }}</p></section>
            <section><h3>{{ t('ui.m070') }}</h3><p v-if="current.conservationMeasures?.length"><ScientificText :value="current.conservationMeasures[0].text" short /> <LessonReferences :species="current" :ids="current.conservationMeasures[0].sourceIds" /></p><p v-else>{{ t('ui.m066') }}</p></section>
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
        <div class="lesson-actions"><button class="quiz-secondary" type="button" @click="emit('catalog')">{{ t('ui.m104') }}</button></div>
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

<style scoped>
/* Computer screens: calmer text sizes next to the photo. Fullscreen (classroom projection) keeps
   the large type from style.css. */
@media (min-width: 1024px) {
  .lesson-section:not(:fullscreen) .lesson-content h2 { font-size: clamp(34px, 2.6vw, 44px); margin-block: 6px 10px; }
  .lesson-section:not(:fullscreen) .lesson-names { font-size: 19px; }
  .lesson-section:not(:fullscreen) .lesson-group,
  .lesson-section:not(:fullscreen) .lesson-statuses,
  .lesson-section:not(:fullscreen) .lesson-brief-facts h3 { font-size: 15px; }
  .lesson-section:not(:fullscreen) .lesson-brief-facts p,
  .lesson-section:not(:fullscreen) .lesson-brief-facts li { font-size: 17px; line-height: 1.55; }
  .lesson-section:not(:fullscreen) .lesson-content .lesson-editorial { font-size: 13px; }
  .lesson-section:not(:fullscreen) :deep(.lesson-photo figcaption) { font-size: 15px; }
}
/* The fullscreen icon is used only by the compact phone toolbar (styles/mobile.css). */
.lesson-fullscreen-icon { display: none; }
/* Review state as a quiet label instead of red running text. */
.lesson-content .lesson-editorial {
  display: inline-block; margin-top: 10px; padding: 2px 10px; border-radius: 999px;
  background: #f6ebe8; color: #8e3a35; font-size: 13px; line-height: 1.6;
}
.lesson-content .lesson-editorial[data-verified="true"] { background: #e6eee5; color: #36533f; }
</style>
