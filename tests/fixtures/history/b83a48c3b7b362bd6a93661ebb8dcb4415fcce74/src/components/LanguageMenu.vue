<script setup>
import { nextTick, onMounted, onUnmounted, ref, useId } from 'vue'

const props = defineProps({ modelValue: { type: String, default: 'ky' }, label: { type: String, required: true } })
const emit = defineEmits(['change'])
const root = ref(null)
const trigger = ref(null)
const items = ref([])
const open = ref(false)
const menuId = `muras-language-${useId()}`
const languages = [
  { code: 'ky', name: 'Кыргызча' },
  { code: 'uz', name: 'Oʻzbekcha' },
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' },
]
function close(returnFocus = false) {
  open.value = false
  if (returnFocus) nextTick(() => trigger.value?.focus())
}
async function toggle() {
  if (open.value) { close(true); return }
  open.value = true
  await nextTick()
  focusOption(languages.findIndex(option => option.code === props.modelValue))
}
function focusOption(index) { items.value[(index + languages.length) % languages.length]?.focus() }
function pick(code) { emit('change', code); close(true) }
function keydown(event) {
  if (event.key === 'Escape') { event.preventDefault(); close(true); return }
  const index = items.value.indexOf(document.activeElement)
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault(); focusOption(index + (event.key === 'ArrowDown' ? 1 : -1))
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault(); focusOption(event.key === 'Home' ? 0 : languages.length - 1)
  }
}
function outside(event) { if (open.value && !root.value?.contains(event.target)) close() }
function focusOut(event) { if (!event.currentTarget.contains(event.relatedTarget)) close() }
onMounted(() => document.addEventListener('pointerdown', outside))
onUnmounted(() => document.removeEventListener('pointerdown', outside))
</script>

<template>
  <div ref="root" class="site-language" @focusout="focusOut">
    <button ref="trigger" class="language-trigger" type="button" :aria-label="label" :aria-expanded="open" :aria-controls="menuId" aria-haspopup="menu" @click="toggle" @keydown.down.prevent="open ? focusOption(0) : toggle()">
      <span>{{ modelValue.toUpperCase() }}</span>
      <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m5 7 5 5 5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <div v-if="open" :id="menuId" class="language-options" role="menu" :aria-label="label" @keydown="keydown">
      <button v-for="(option, index) in languages" :key="option.code" :ref="el => { if (el) items[index] = el }" type="button" role="menuitemradio" :aria-checked="option.code === modelValue" :lang="option.code" @click="pick(option.code)">
        <span class="language-code">{{ option.code.toUpperCase() }}</span>
        <span class="language-name">{{ option.name }}</span>
        <svg v-if="option.code === modelValue" width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m3 10 5 5 9-10"/></svg>
      </button>
    </div>
  </div>
</template>
