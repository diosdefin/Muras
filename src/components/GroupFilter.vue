<script setup>
import { useLocale } from '../composables/useLocale.js'

const { t } = useLocale()

defineProps({ modelValue: { type: String, default: 'ALL' }, options: { type: Array, required: true }, label: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue'])
</script>
<template>
  <div class="group-filter" role="group" :aria-label="label || t('ui.m054')">
    <button v-for="option in options" :key="option.value" type="button" :aria-pressed="modelValue === option.value" @click="emit('update:modelValue', option.value)">{{ option.label }}</button>
  </div>
</template>
