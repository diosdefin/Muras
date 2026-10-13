<script setup>
import { computed } from 'vue'
import { useLocale } from '../composables/useLocale.js'
import { localizedSource } from '../data/localization.js'

const props = defineProps({ source: { type: Object, required: true }, compact: Boolean })
const { language, t } = useLocale()
const content = computed(() => localizedSource(props.source, language.value))
const languageNote = computed(() => content.value.language
  ? t('sourceLanguage', { language: t(`sourceLanguageName.${content.value.language}`) })
  : t('sourceLanguageUnknown'))
const title = computed(() => `${content.value.title} · ${languageNote.value}`)
</script>

<template>
  <a :href="content.url" :title="title"
    :aria-label="compact ? `${title} ${t('ui.m107')}` : undefined"
    target="_blank" rel="noopener noreferrer">
    <slot />
    <span v-if="!compact" :lang="content.language || 'und'">{{ content.title }}</span>
    <span class="sr-only"> {{ t('ui.m107') }}</span>
    <small v-if="content.language !== language" :class="compact ? 'source-language-code' : 'language-note'">
      {{ compact ? content.language?.toUpperCase() || '?' : languageNote }}
    </small>
  </a>
</template>
