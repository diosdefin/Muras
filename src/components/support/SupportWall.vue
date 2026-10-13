<script setup>
import { useLocale } from '../../composables/useLocale.js'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRef, watch } from 'vue'
import { useSupportWall } from '../../composables/useSupportWall.js'
import { WALL_KEY, wallEntries } from '../../data/support/wall.js'
import { supportSpecies } from '../../data/support/model.js'
import { speciesName } from '../../data/presentation.js'

const { t, language, uiMessage } = useLocale()

const props = defineProps({ species: { type: Array, required: true }, speciesId: { type: String, default: null } })
const wall = useSupportWall(toRef(props, 'species'))
const { entries, available, hasSavedData, notice, message } = wall
const scope = ref(props.speciesId ? 'species' : 'all'), alias = ref(''), acknowledged = ref(false), formError = ref('')
const input = ref(null), heading = ref(null)
const selected = computed(() => supportSpecies(props.species, props.speciesId))
const targetId = computed(() => scope.value === 'species' && selected.value ? selected.value.id : null)
const targetLabel = computed(() => targetId.value ? speciesName(selected.value, language.value) : t('ui.m301'))
const visibleEntries = computed(() => wallEntries(entries.value, props.speciesId, scope.value))
function contextLabel(entry) {
  const record = supportSpecies(props.species, entry.speciesId)
  return record ? speciesName(record, language.value) : t('ui.m301')
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
    <header class="support-wall-heading"><div><p class="eyebrow">{{ t('ui.m302') }}</p><h2 id="support-wall-title" ref="heading" tabindex="-1">{{ t('ui.m303') }}</h2></div><p>{{ t('ui.m304') }}</p></header>
    <p id="wall-privacy" class="support-privacy">{{ t('ui.m305') }}</p>
    <div class="support-wall-scopes" role="group" :aria-label="t('ui.m306')">
      <button class="quiz-secondary" type="button" :disabled="!selected" :aria-pressed="scope === 'species'" @click="scope = 'species'">{{ t('ui.m307') }}</button>
      <button class="quiz-secondary" type="button" :aria-pressed="scope === 'all'" @click="scope = 'all'">{{ t('ui.m308') }}</button>
    </div>
    <p class="support-wall-context" role="status">{{ scope === 'species' && selected ? t('ui.m309', { p0: speciesName(selected, language) }) : t('ui.m310') }}</p>
    <div class="support-wall-layout">
      <div class="support-wall-list">
        <ul v-if="visibleEntries.length" class="support-aliases" :aria-label="t('ui.m311')">
          <li v-for="entry in visibleEntries" :key="entry.id"><span class="support-entry-mark" aria-hidden="true">↗</span><div><p class="support-alias" lang="und">{{ entry.alias }}</p><p class="support-entry-context">{{ contextLabel(entry) }} {{ t('ui.m312') }}</p></div><button class="support-remove" type="button" :aria-label="t('ui.m313', { p0: entry.alias, p1: contextLabel(entry) })" @click="remove(entry.id)">{{ t('ui.m314') }}</button></li>
        </ul>
        <div v-else class="support-empty"><span aria-hidden="true">○</span><h3>{{ t('ui.m315') }}</h3><p>{{ scope === 'species' ? t('ui.m316') : t('ui.m317') }}</p></div>
      </div>
      <form class="support-demo-form" aria-labelledby="support-form-title" @submit.prevent="add">
        <p class="eyebrow">{{ t('ui.m318') }}</p><h3 id="support-form-title">{{ t('ui.m319') }}</h3>
        <p>{{ t('ui.m320') }}</p>
        <p class="support-form-context">{{ t('ui.m321') }} <strong>{{ targetLabel }}</strong></p>
        <label for="support-alias">{{ t('ui.m322') }}</label>
        <input id="support-alias" ref="input" v-model="alias" type="text" required minlength="2" maxlength="32" autocomplete="off" :spellcheck="false" :disabled="!available" :aria-invalid="!!formError" aria-describedby="support-alias-hint wall-privacy support-form-error" :placeholder="t('ui.m323')" @input="formError = ''" />
        <p id="support-alias-hint" class="support-field-hint">{{ t('wall.hint') }}</p>
        <label class="support-ack"><input v-model="acknowledged" type="checkbox" required :disabled="!available" /><span>{{ t('ui.m324') }}</span></label>
        <p id="support-form-error" class="error-message" :role="formError ? 'alert' : undefined">{{ uiMessage(formError) }}</p>
        <button class="quiz-primary" type="submit" :disabled="!available">{{ t('ui.m325') }}</button>
      </form>
    </div>
    <p v-if="!available" class="support-notice" role="status">{{ t('ui.m326') }} <button class="text-link" type="button" @click="wall.refresh">{{ t('ui.m327') }}</button></p>
    <p v-if="notice" class="support-notice" role="status">{{ uiMessage(notice) }}</p>
    <p v-if="message && !formError" class="support-notice" role="status">{{ uiMessage(message) }}</p>
    <div class="support-wall-footer"><p>{{ t('ui.m328') }}</p><button class="quiz-secondary" type="button" :disabled="!hasSavedData" @click="clear">{{ t('ui.m329') }}</button></div>
  </section>
</template>
