<script setup>
import { useLocale } from '../../composables/useLocale.js'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
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

// The list appears only for a chosen region. Each category is shown once (largest
// first); long categories start with a few records and expand with "Show more".
const PREVIEW = 6
const expanded = ref(new Set())
watch(() => props.entries, () => { expanded.value = new Set() })
const groupedEntries = computed(() => {
  const byGroup = new Map()
  for (const entry of props.entries) {
    const id = entry.species.group
    if (!byGroup.has(id)) byGroup.set(id, [])
    byGroup.get(id).push(entry)
  }
  return [...byGroup]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([id, records]) => {
      const visible = expanded.value.has(id) ? records : records.slice(0, PREVIEW)
      return { id, label: groupLabel({ group: id }, language.value), total: records.length, visible, hidden: records.length - visible.length }
    })
})
function expand(id) { expanded.value = new Set([...expanded.value, id]) }
</script>

<template>
  <aside id="map-region-panel" class="map-panel" aria-labelledby="map-panel-title">
    <p class="eyebrow">{{ t('ui.m144') }}</p>
    <h3 id="map-panel-title" tabindex="-1">{{ (region ? regionLabel(region.id, language) : null) || t('mapUI.allRegions') }}</h3>
    <p v-if="!region" class="map-empty map-choose-region">{{ t('ui.m147') }}</p>
    <template v-else>
      <details class="map-filters-disclosure" :open="!compact">
        <summary class="map-filters-summary">{{ t('mapUI.filters') }} <span aria-hidden="true">⌄</span></summary>
        <div class="map-filters-content">
          <GroupFilter :model-value="group" :options="groups" :label="t('ui.m148')" @update:model-value="emit('group', $event)" />
        </div>
      </details>
      <p class="map-panel-status" role="status" aria-live="polite" aria-atomic="true">{{ t('ui.m150', { p0: regionLabel(region.id, language), p1: entries.length }) }}</p>
      <p v-if="!entries.length" class="map-empty">{{ unfilteredCount && (group !== 'ALL' || query.trim()) ? t('mapUI.noMatches') : t('ui.m153') }} {{ t('ui.m154') }}</p>
      <div v-else class="regional-species-list">
        <section v-for="bucket in groupedEntries" :key="bucket.id" class="regional-species-group" :aria-label="bucket.label">
          <h4 class="regional-group-title">{{ bucket.label }} <span>{{ bucket.total }}</span></h4>
          <div class="regional-group-items">
            <RegionalSpecies v-for="entry in bucket.visible" :key="`${entry.species.id}:${entry.evidence.regionId}`" :entry="entry" :show-region="false" @open="emit('open', $event)" @profile="emit('profile', $event)" />
          </div>
          <button v-if="bucket.hidden" type="button" class="regional-more-button" @click="expand(bucket.id)">{{ t('ui.m038') }} · {{ bucket.hidden }}</button>
        </section>
      </div>
    </template>

    <button v-if="region || group !== 'ALL' || query" type="button" class="map-reset" @click="emit('reset')">{{ t('ui.m156') }}</button>
  </aside>
</template>

<style scoped>
/* Category bands make it obvious where one group of species ends and the next begins. */
.regional-species-list .regional-group-title {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  margin-bottom: 10px; padding: 9px 12px; border-radius: 8px;
  background: #e4ece2; color: var(--ink); font-size: 14px; font-weight: 650;
}
.regional-species-list .regional-group-title > span {
  min-width: 28px; padding: 1px 8px; border-radius: 999px; background: #fff; color: var(--green);
  font-size: 12px; font-weight: 700; text-align: center;
}
.regional-species-list .regional-species-group + .regional-species-group { margin-top: 22px; }
.regional-more-button {
  display: block; width: 100%; min-height: 42px; margin-top: 10px; padding: 8px 14px;
  border: 1px solid var(--line); border-radius: 8px; background: #fff; color: var(--ink);
  font-size: 14px; font-weight: 600;
}
.regional-more-button:hover { border-color: var(--green); background: var(--paper); }
.map-choose-region { margin-top: 12px; }
</style>
