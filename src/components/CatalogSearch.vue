<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { speciesName } from '../data/presentation.js'
const props = defineProps({ modelValue: { type: String, default: '' }, results: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue', 'open'])
const input = ref(null), expanded = ref(false), active = ref(-1), composing = ref(false), draft = ref(props.modelValue)
const suggestions = computed(() => props.results.slice(0, 6))
const secondaryName = result => result.matchedName === speciesName(result.species) ? result.species.scientificName : result.matchedName
const secondaryLanguage = result => result.matchedName === speciesName(result.species) ? 'la' : result.language
const visible = computed(() => expanded.value && Boolean(props.modelValue.trim()))
const activeId = computed(() => visible.value && active.value >= 0 && suggestions.value[active.value] ? `search-option-${suggestions.value[active.value].species.id}` : undefined)
watch(() => props.modelValue, value => { draft.value = value; active.value = -1 })
watch(suggestions, () => { active.value = -1 })
function update(event) {
  draft.value = event.target.value
  if (composing.value || event.isComposing) return
  active.value = -1; expanded.value = true; emit('update:modelValue', draft.value)
}
function select(result) { expanded.value = false; active.value = -1; emit('open', result.species) }
async function move(direction) {
  if (!props.modelValue.trim()) return
  expanded.value = true
  const count = suggestions.value.length
  if (!count) return
  active.value = active.value < 0 ? (direction < 0 ? count - 1 : 0) : (active.value + direction + count) % count
  await nextTick()
  document.getElementById(activeId.value)?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
}
function keydown(event) {
  if (composing.value || event.isComposing) return
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); move(event.key === 'ArrowDown' ? 1 : -1) }
  if (event.key === 'Escape') { event.preventDefault(); expanded.value = false; active.value = -1 }
  if (event.key === 'Enter' && activeId.value) { event.preventDefault(); select(suggestions.value[active.value]) }
}
async function clear() { emit('update:modelValue', ''); draft.value = ''; expanded.value = false; await nextTick(); input.value?.focus() }
function leave(event) { if (!event.currentTarget.contains(event.relatedTarget)) { expanded.value = false; active.value = -1 } }
</script>
<template>
  <div class="catalog-search" @focusout="leave">
    <label for="catalog-search">Поиск вида</label>
    <div class="search-input-row">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg>
      <input id="catalog-search" ref="input" :value="draft" type="text" role="combobox" aria-autocomplete="list" :aria-expanded="visible" aria-controls="catalog-suggestions" :aria-activedescendant="activeId" aria-describedby="catalog-search-hint" autocomplete="off" :spellcheck="false" maxlength="120" placeholder="Ирбис, илбирс, snow leopard…" @input="update" @focus="expanded = true" @keydown="keydown" @compositionstart="composing = true" @compositionend="composing = false; update($event)" />
      <button v-if="modelValue" type="button" class="search-clear" aria-label="Очистить поиск" @click="clear">×</button>
    </div>
    <p id="catalog-search-hint" class="search-hint">Русское, кыргызское, английское или латинское название. Подсказки: ↑ ↓, Enter; закрыть — Escape.</p>
    <div v-show="visible" class="search-popup">
      <p class="search-popup-caption">{{ results[0]?.kind === 'fuzzy' ? 'Возможные совпадения · проверьте название' : 'Виды из каталога · с учётом фильтров' }}</p>
      <ul id="catalog-suggestions" role="listbox" aria-label="Подсказки видов">
        <li v-for="(result, index) in suggestions" :id="`search-option-${result.species.id}`" :key="result.species.id" role="option" :aria-selected="active === index" @pointerdown.prevent @click="select(result)">
          <span>{{ speciesName(result.species) }}</span><span v-if="secondaryName(result)" :lang="secondaryLanguage(result)">{{ secondaryName(result) }}</span><small v-if="result.kind === 'transliteration'">Транслитерация названия</small><small v-if="result.kind === 'fuzzy'">Возможно, вы имели в виду этот вид</small>
        </li>
      </ul>
      <p v-if="!results.length" class="search-no-results">Совпадений нет. Проверьте название или сбросьте фильтры.</p>
    </div>
  </div>
</template>
