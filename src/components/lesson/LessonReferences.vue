<script setup>
import { computed } from 'vue'
import { sourceNumber, sourcesFor } from '../../data/lesson.js'
const props = defineProps({ species: { type: Object, required: true }, ids: { type: Array, default: () => [] } })
const sources = computed(() => sourcesFor(props.species, props.ids))
</script>

<template>
  <span v-if="sources.length" class="lesson-references" aria-label="Источники утверждения">
    <a v-for="source in sources" :key="source.id" :href="source.url" :title="source.title" target="_blank" rel="noopener noreferrer"
      :aria-label="`Источник ${sourceNumber(species, source.id)}: ${source.title} (новая вкладка)`">[{{ sourceNumber(species, source.id) }}]</a>
  </span>
</template>
