<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, toRef, watch } from 'vue'
import LessonPhoto from './LessonPhoto.vue'
import LessonDetails from './LessonDetails.vue'
import LessonReferences from './LessonReferences.vue'
import { useLesson } from '../../composables/useLesson.js'
import { useLessonFullscreen } from '../../composables/useLessonFullscreen.js'
import { firstSentence, lessonKey, lessonTabTarget } from '../../data/lesson.js'
import { groupLabel, localized, nationalStatus, regionNames, speciesName, statusDetails } from '../../data/presentation.js'

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
      <div><p class="eyebrow">Природное наследие Кыргызстана</p><h1 id="lesson-title">Режим урока</h1></div>
      <div class="lesson-tools">
        <label class="sr-only" for="lesson-species">Выберите вид для урока</label>
        <select id="lesson-species" :value="selectedId || ''" :disabled="!current" @change="select($event.target.value)">
          <option v-for="record in species" :key="record.id" :value="record.id">{{ speciesName(record) }}</option>
        </select>
        <button class="quiz-secondary" type="button" :aria-pressed="isFullscreen" @click="toggle">{{ isFullscreen ? 'Выйти из полного экрана' : 'На весь экран' }}</button>
      </div>
    </header>
    <p v-if="message" class="lesson-notice" role="status">{{ message }}</p>
    <p v-if="loading" class="catalog-message" role="status">Загружаем виды…</p>
    <p v-else-if="error" class="catalog-message error-message" role="alert">{{ error }}</p>
    <p v-else-if="!current" class="catalog-message" role="status">Нет доступных видов для урока.</p>
    <template v-else>
      <article :key="current.id" class="lesson-slide" tabindex="0" aria-labelledby="lesson-species-title" aria-describedby="lesson-keyboard-note">
        <LessonPhoto :species="current" />
        <div class="lesson-content">
          <p class="lesson-group">{{ groupLabel(current) }} · {{ regionNames(current).join(', ') || 'Ареал не установлен' }}</p>
          <h2 id="lesson-species-title">{{ current.names.ru || current.scientificName || current.id }}</h2>
          <p class="lesson-names"><span lang="ky">{{ current.names.ky || 'Кыргызское название не установлено' }}</span><span class="scientific-name" lang="la">{{ current.scientificName || '—' }}</span></p>
          <p class="lesson-editorial">{{ current.verified ? 'Запись проверена' : 'Требует редакторской проверки' }}</p>
          <div class="lesson-brief-facts">
            <section><h3>Среда обитания · кратко</h3><p>{{ firstSentence(current.habitat?.description) || 'Сведения пока не подтверждены.' }} <LessonReferences :species="current" :ids="current.habitat?.sourceIds" /></p></section>
            <section><h3>Основные угрозы</h3><ul v-if="current.threats?.length"><li v-for="(item, n) in current.threats.slice(0, 2)" :key="n">{{ localized(item.text) }} <LessonReferences :species="current" :ids="item.sourceIds" /></li></ul><p v-else>Сведения пока не подтверждены.</p></section>
            <section><h3>Меры охраны · выдержка</h3><p v-if="current.conservationMeasures?.length">{{ firstSentence(current.conservationMeasures[0].text) }} <LessonReferences :species="current" :ids="current.conservationMeasures[0].sourceIds" /></p><p v-else>Сведения пока не подтверждены.</p></section>
          </div>
          <div class="lesson-statuses">
            <p>{{ nationalStatus(current) }} <LessonReferences :species="current" :ids="current.nationalRedBook?.sourceIds" /></p>
            <p>{{ statusDetails(current).label }} <LessonReferences :species="current" :ids="current.iucn?.sourceIds" /></p>
          </div>
        </div>
      </article>
      <div class="lesson-navigation">
        <div class="lesson-paging">
          <button class="quiz-secondary" type="button" :disabled="species.length < 2" @click="previous"><span aria-hidden="true">←</span> Назад</button>
          <p role="status" aria-live="polite" aria-atomic="true"><span>{{ index + 1 }} / {{ species.length }}</span><span class="sr-only"> · {{ speciesName(current) }}</span></p>
          <button class="quiz-secondary" type="button" :disabled="species.length < 2" @click="next">Далее <span aria-hidden="true">→</span></button>
        </div>
        <div class="lesson-actions"><button class="quiz-primary" type="button" @click="emit('quiz')">Запустить викторину</button><button class="quiz-secondary" type="button" @click="emit('catalog')">Вернуться в каталог</button></div>
      </div>
      <p id="lesson-keyboard-note" class="lesson-keyboard-note">Фокус на слайде: ← → переключают виды, Escape возвращает в каталог. В полях и кнопках действуют обычные клавиши.</p>
      <LessonDetails :key="current.id" :species="current" />
      <details class="lesson-details lesson-source-list">
        <summary>Научные источники · {{ current.sources.length }}</summary>
        <ol><li v-for="(source, n) in current.sources" :key="source.id"><a :href="source.url" target="_blank" rel="noopener noreferrer">[{{ n + 1 }}] {{ source.title }}<span class="sr-only"> (новая вкладка)</span></a></li></ol>
      </details>
    </template>
  </section>
</template>
