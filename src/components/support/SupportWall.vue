<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRef, watch } from 'vue'
import { useSupportWall } from '../../composables/useSupportWall.js'
import { ALIAS_HINT, WALL_KEY, wallEntries } from '../../data/support/wall.js'
import { supportSpecies } from '../../data/support/model.js'
import { speciesName } from '../../data/presentation.js'
const props = defineProps({ species: { type: Array, required: true }, speciesId: { type: String, default: null } })
const wall = useSupportWall(toRef(props, 'species'))
const { entries, available, hasSavedData, notice, message } = wall
const scope = ref(props.speciesId ? 'species' : 'all'), alias = ref(''), acknowledged = ref(false), formError = ref('')
const input = ref(null), heading = ref(null)
const selected = computed(() => supportSpecies(props.species, props.speciesId))
const targetId = computed(() => scope.value === 'species' && selected.value ? selected.value.id : null)
const targetLabel = computed(() => targetId.value ? speciesName(selected.value) : 'Общая поддержка')
const visibleEntries = computed(() => wallEntries(entries.value, props.speciesId, scope.value))
function contextLabel(entry) {
  const record = supportSpecies(props.species, entry.speciesId)
  return record ? speciesName(record) : 'Общая поддержка'
}
watch(() => props.speciesId, id => { scope.value = id ? 'species' : 'all' })
watch(targetId, () => { alias.value = ''; acknowledged.value = false; formError.value = ''; message.value = '' })
watch(() => props.species.map(record => record.id).join(','), wall.refresh)
async function add() {
  formError.value = ''
  if (!wall.add({ alias: alias.value, speciesId: targetId.value, acknowledged: acknowledged.value })) {
    formError.value = message.value
  } else { alias.value = ''; acknowledged.value = false }
  await nextTick(); input.value?.focus({ preventScroll: true })
}
async function remove(id) {
  formError.value = ''
  if (wall.remove(id)) { await nextTick(); heading.value?.focus({ preventScroll: true }) }
}
async function clear() {
  formError.value = ''
  if (wall.clear()) { formError.value = ''; await nextTick(); heading.value?.focus({ preventScroll: true }) }
}
function storageChanged(event) { if (event.key === WALL_KEY || event.key === null) wall.refresh() }
onMounted(() => window.addEventListener('storage', storageChanged))
onBeforeUnmount(() => window.removeEventListener('storage', storageChanged))
</script>

<template>
  <section class="support-wall" aria-labelledby="support-wall-title">
    <header class="support-wall-heading"><div><p class="eyebrow">Демонстрация · только этот браузер</p><h2 id="support-wall-title" ref="heading" tabindex="-1">Стена защитников природы</h2></div><p>Будущий формат признания поддержки. Сейчас это локальный макет, а не список благотворителей.</p></header>
    <p id="wall-privacy" class="support-privacy">Другие пользователи сайта эти записи не увидят. Список доступен только в этом профиле браузера. Псевдонимы не отправляются на сервер и не подтверждают пожертвование. Очистка данных браузера удалит список.</p>
    <div class="support-wall-scopes" role="group" aria-label="Область демонстрационной стены">
      <button class="quiz-secondary" type="button" :disabled="!selected" :aria-pressed="scope === 'species'" @click="scope = 'species'">Для выбранного вида</button>
      <button class="quiz-secondary" type="button" :aria-pressed="scope === 'all'" @click="scope = 'all'">Общая стена</button>
    </div>
    <p class="support-wall-context" role="status">{{ scope === 'species' && selected ? `Демозаписи для вида: ${speciesName(selected)}` : 'Общая стена: все локальные демозаписи' }}</p>
    <div class="support-wall-layout">
      <div class="support-wall-list">
        <ul v-if="visibleEntries.length" class="support-aliases" aria-label="Локальные демонстрационные записи">
          <li v-for="entry in visibleEntries" :key="entry.id"><span class="support-entry-mark" aria-hidden="true">↗</span><div><p class="support-alias">{{ entry.alias }}</p><p class="support-entry-context">{{ contextLabel(entry) }} · демозапись</p></div><button class="support-remove" type="button" :aria-label="`Удалить демозапись ${entry.alias} — ${contextLabel(entry)}`" @click="remove(entry.id)">Удалить</button></li>
        </ul>
        <div v-else class="support-empty"><span aria-hidden="true">○</span><h3>Здесь пока нет демозаписей</h3><p>{{ scope === 'species' ? 'Для этого вида ещё не добавлены локальные псевдонимы.' : 'Общая стена пуста. Мы не заполняем её вымышленными пожертвованиями.' }}</p></div>
      </div>
      <form class="support-demo-form" aria-labelledby="support-form-title" @submit.prevent="add">
        <p class="eyebrow">Проверить концепцию</p><h3 id="support-form-title">Добавить демопсевдоним</h3>
        <p>Используйте выдуманный псевдоним. Не вводите настоящее имя, контакты или другие личные сведения.</p>
        <p class="support-form-context">Привязка записи: <strong>{{ targetLabel }}</strong></p>
        <label for="support-alias">Псевдоним для демонстрации</label>
        <input id="support-alias" ref="input" v-model="alias" type="text" required minlength="2" maxlength="32" autocomplete="off" :spellcheck="false" :disabled="!available" :aria-invalid="!!formError" aria-describedby="support-alias-hint wall-privacy support-form-error" placeholder="Например: Друг гор" @input="formError = ''" />
        <p id="support-alias-hint" class="support-field-hint">{{ ALIAS_HINT }}</p>
        <label class="support-ack"><input v-model="acknowledged" type="checkbox" required :disabled="!available" /><span>Понимаю: это локальная демозапись, а не пожертвование.</span></label>
        <p id="support-form-error" class="error-message" :role="formError ? 'alert' : undefined">{{ formError }}</p>
        <button class="quiz-primary" type="submit" :disabled="!available">Добавить в демосписок</button>
      </form>
    </div>
    <p v-if="!available" class="support-notice" role="status">Локальное хранилище недоступно. Демозаписи добавить нельзя. <button class="text-link" type="button" @click="wall.refresh">Повторить проверку</button></p>
    <p v-if="notice" class="support-notice" role="status">{{ notice }}</p>
    <p v-if="message && !formError" class="support-notice" role="status">{{ message }}</p>
    <div class="support-wall-footer"><p>Записи сохраняются локально в этом браузере. Никаких сумм и рейтингов.</p><button class="quiz-secondary" type="button" :disabled="!hasSavedData" @click="clear">Очистить весь демосписок</button></div>
  </section>
</template>
