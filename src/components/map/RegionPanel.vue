<script setup>
import { useLocale } from '../../composables/useLocale.js'
import { computed } from 'vue'
import { regionLabel } from '../../data/presentation.js'
import RegionalSpecies from './RegionalSpecies.vue'
import GroupFilter from '../GroupFilter.vue'

const { t, language } = useLocale()

const groups = computed(() => [{ value: 'ALL', label: t('ui.m140') }, { value: 'mammals', label: t('ui.m141') }, { value: 'birds', label: t('ui.m142') }, { value: 'plants', label: t('ui.m143') }])
defineProps({ region: { type: Object, default: null }, entries: { type: Array, default: () => [] }, group: { type: String, default: 'ALL' }, unfilteredCount: { type: Number, default: 0 } })
const emit = defineEmits(['open', 'reset', 'group'])
</script>

<template>
  <aside id="map-region-panel" class="map-panel" aria-labelledby="map-panel-title">
    <p class="eyebrow">{{ t('ui.m144') }}</p>
    <h3 id="map-panel-title">{{ (region ? regionLabel(region.id, language) : null) || t('ui.m145') }}</h3>
    <p class="map-panel-intro">{{ region ? t('ui.m146') : t('ui.m147') }}</p>
    <GroupFilter :model-value="group" :options="groups" :label="t('ui.m148')" @update:model-value="emit('group', $event)" />
    <p class="map-panel-status" role="status" aria-live="polite" aria-atomic="true">{{ !region ? t('ui.m149') : entries.length ? t('ui.m150', { p0: regionLabel(region.id, language), p1: entries.length }) : t('ui.m151') }}</p>
    <p v-if="region && !entries.length" class="map-empty">{{ unfilteredCount && group !== 'ALL' ? t('ui.m152') : t('ui.m153') }} {{ t('ui.m154') }}</p>
    <div v-if="region && entries.length" class="regional-species-list">
      <RegionalSpecies v-for="entry in entries" :key="entry.species.id" :entry="entry" @open="emit('open', $event)" />
    </div>
    <p v-if="!region" class="map-empty">{{ t('ui.m155') }}</p>
    <button v-if="region || group !== 'ALL'" type="button" class="map-reset" @click="emit('reset')">{{ t('ui.m156') }}</button>
  </aside>
</template>
