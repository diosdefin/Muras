<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, useId, watch } from 'vue'

// Same lightweight, accessible interaction pattern as LanguageMenu; no browser-native popup.
const props = defineProps({
  id: { type: String, default: undefined },
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, required: true },
  label: { type: String, required: true },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])
const root = ref(null), trigger = ref(null), items = ref([]), open = ref(false)
const listId = `muras-select-${useId()}`
const selected = computed(() => props.options.find(option => option.value === props.modelValue) || props.options[0])
const selectedIndex = computed(() => Math.max(0, props.options.findIndex(option => option.value === props.modelValue)))
function close(focus = false) { open.value = false; if (focus) nextTick(() => trigger.value?.focus()) }
async function show(direction = 0) {
  if (props.disabled || !props.options.length) return
  open.value = true
  await nextTick()
  const index = direction === 1 ? Math.min(props.options.length - 1, selectedIndex.value + 1) : direction === -1 ? Math.max(0, selectedIndex.value - 1) : selectedIndex.value
  items.value[index]?.focus()
  items.value[index]?.scrollIntoView({ block: 'nearest' })
}
function toggle() { open.value ? close(true) : show() }
function pick(value) { emit('update:modelValue', value); close(true) }
function keydown(event) {
  if (event.key === 'Escape' || event.key === 'Tab') { if (event.key === 'Escape') { event.preventDefault(); close(true) } else close(); return }
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  const index = items.value.indexOf(document.activeElement)
  const target = event.key === 'Home' ? 0 : event.key === 'End' ? props.options.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + props.options.length) % props.options.length
  items.value[target]?.focus()
  items.value[target]?.scrollIntoView({ block: 'nearest' })
}
function outside(event) { if (open.value && !root.value?.contains(event.target)) close() }
function focusout(event) { if (!event.currentTarget.contains(event.relatedTarget)) close() }
watch(() => props.disabled, disabled => { if (disabled) close() })
onMounted(() => document.addEventListener('pointerdown', outside))
onUnmounted(() => document.removeEventListener('pointerdown', outside))
</script>

<template>
  <div ref="root" class="muras-select" :class="{ 'muras-select-open': open, 'muras-select-disabled': disabled }" @focusout="focusout">
    <button ref="trigger" :id="id" type="button" class="muras-select-trigger" :aria-label="label" :disabled="disabled" :aria-expanded="open" :aria-controls="listId" aria-haspopup="listbox"
      @click="toggle" @keydown.down.prevent="show(1)" @keydown.up.prevent="show(-1)">
      <span class="muras-select-value">{{ selected?.label || '' }}</span>
      <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m5 7 5 5 5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <div v-if="open" :id="listId" class="muras-select-options" role="listbox" :aria-label="label" @keydown="keydown">
      <button v-for="(option, index) in options" :key="option.value" :ref="element => { if (element) items[index] = element }"
        type="button" class="muras-select-option" role="option" :aria-selected="option.value === modelValue" tabindex="-1" @click="pick(option.value)">
        <span>{{ option.label }}</span><span class="muras-option-check" aria-hidden="true">{{ option.value === modelValue ? '✓' : '' }}</span>
      </button>
    </div>
  </div>
</template>
