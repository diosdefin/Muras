<script setup>
import { useLocale } from '../../composables/useLocale.js'
import { computed } from 'vue'
import SourceLink from '../SourceLink.vue'
import { sourceNumber, sourcesFor } from '../../data/lesson.js'

const { t } = useLocale()

const props = defineProps({ species: { type: Object, required: true }, ids: { type: Array, default: () => [] } })
const sources = computed(() => sourcesFor(props.species, props.ids))
</script>

<template>
  <span v-if="sources.length" class="lesson-references" :aria-label="t('ui.m086')">
    <SourceLink v-for="source in sources" :key="source.id" :source="source" compact>[{{ sourceNumber(species, source.id) }}]</SourceLink>
  </span>
</template>
