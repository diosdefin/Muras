<script setup>
import { computed } from 'vue'
import { useLocale } from '../composables/useLocale.js'
import { scientificContent } from '../data/localization.js'

const props = defineProps({ value: { type: Object, default: null }, short: Boolean })
const { language, t } = useLocale()
const content = computed(() => scientificContent(props.value, language.value))
const text = computed(() => props.short ? content.value.text?.split(/(?<=[.!?])\s+/u)[0] : content.value.text)
</script>
<template>
  <span class="scientific-content">
    <span :lang="content.text ? content.language : language">{{ text || t('ui.m066') }}</span>
    <small v-if="content.fallback" class="language-note">
      {{ t('scientificFallback', { language: t(`language.${content.language}`) }) }}
    </small>
  </span>
</template>
