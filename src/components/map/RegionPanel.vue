<script setup>
import { useLocale } from '../../composables/useLocale.js'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { groupLabel, regionLabel } from '../../data/presentation.js'
import { availableGroups } from '../../data/species-groups.js'
import RegionalSpecies from './RegionalSpecies.vue'
import GroupFilter from '../GroupFilter.vue'

const { t, language } = useLocale()

const props = defineProps({ species: { type: Array, default: () => [] }, region: { type: Object, default: null }, entries: { type: Array, default: () => [] }, group: { type: String, default: 'ALL' }, query: { type: String, default: '' }, unfilteredCount: { type: Number, default: 0 } })
const groups = computed(() => [{ value: 'ALL', label: t('ui.m140') }, ...availableGroups(props.species).map(value => ({ value, label: groupLabel({ group: value }, language.value) }))])
const emit = defineEmits(['open', 'profile', 'reset', 'group', 'query'])
const compact = ref(false)
let media
function viewport(event) { compact.value = event.matches }
onMounted(() => { media = window.matchMedia('(max-width: 767px)'); viewport(media); media.addEventListener('change', viewport) })
onUnmounted(() => media?.removeEventListener('change', viewport))
const groupedEntries = computed(() => {
  const byGroup = new Map()
  for (const entry of props.entries) {
    const id = entry.species.group
    if (!byGroup.has(id)) byGroup.set(id, [])
    byGroup.get(id).push(entry)
  }
  return [...byGroup].map(([id, records]) => ({ id, label: groupLabel({ group: id }, language.value), records }))
})
</script>

<template>
  <aside id="map-region-panel" class="map-panel" aria-labelledby="map-panel-title">
    <p class="eyebrow">{{ t('ui.m144') }}</p>
    <h3 id="map-panel-title" tabindex="-1">{{ (region ? regionLabel(region.id, language) : null) || t('mapUI.allRegions') }}</h3>
    <p class="map-panel-intro">{{ region ? t('ui.m146') : t('ui.m147') }}</p>
    <details class="map-filters-disclosure" :open="!compact">
      <summary class="map-filters-summary">{{ t('mapUI.filters') }} <span aria-hidden="true">⌄</span></summary>
      <div class="map-filters-content">
        <label for="map-species-search" class="map-search-label">{{ t('mapUI.search') }}</label>
        <input id="map-species-search" type="search" :value="query" maxlength="120" autocomplete="off" :placeholder="t('mapUI.searchHint')" @input="emit('query', $event.target.value)" />
        <GroupFilter :model-value="group" :options="groups" :label="t('ui.m148')" @update:model-value="emit('group', $event)" />
      </div>
    </details>
    <p class="map-panel-status" role="status" aria-live="polite" aria-atomic="true">{{ t('ui.m150', { p0: region ? regionLabel(region.id, language) : t('mapUI.allRegions'), p1: entries.length }) }}</p>
    <p v-if="!entries.length" class="map-empty">{{ unfilteredCount && (group !== 'ALL' || query.trim()) ? t('mapUI.noMatches') : t('ui.m153') }} {{ t('ui.m154') }}</p>
    <div v-if="entries.length" class="regional-species-list">
      <section v-for="bucket in groupedEntries" :key="bucket.id" class="regional-species-group" :aria-label="bucket.label">
        <h4 class="regional-group-title">{{ bucket.label }} <span>{{ bucket.records.length }}</span></h4>
        <div class="regional-group-items">
          <RegionalSpecies v-for="entry in bucket.records" :key="`${entry.species.id}:${entry.evidence.regionId}`" :entry="entry" @open="emit('open', $event)" @profile="emit('profile', $event)" />
        </div>
      </section>
    </div>

    <button v-if="region || group !== 'ALL' || query" type="button" class="map-reset" @click="emit('reset')">{{ t('ui.m156') }}</button>
  </aside>
</template>
