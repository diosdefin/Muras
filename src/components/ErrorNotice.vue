<script setup>
import { useLocale } from '../composables/useLocale.js'

defineProps({ message: { type: String, required: true } })
const { t } = useLocale()
</script>

<template>
  <div class="catalog-message error-message" role="alert">
    <p>{{ t('error.generic') }}</p>
    <details><summary>{{ t('error.details') }}</summary><p lang="und">{{ message }}</p></details>
    <slot />
  </div>
</template>

<style scoped>
summary { cursor: pointer; padding-block: 12px; min-height: 44px; font-size: 14px; }
details p { font-size: 14px; overflow-wrap: anywhere; }
</style>
