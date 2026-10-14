<script setup>
import { useLocale } from '../../composables/useLocale.js'
import { regionLabel } from '../../data/presentation.js'
import { computed, ref } from 'vue'

const { t, language } = useLocale()

const props = defineProps({ geometry: { type: Object, required: true }, selected: { type: String, default: '' }, preview: { type: Boolean, default: false }, panelId: { type: String, default: 'map-region-panel' } })
const emit = defineEmits(['select'])
const hovered = ref(''), focused = ref('')
const activeName = computed(() => { const id = hovered.value || focused.value || props.selected; return id ? regionLabel(id, language.value) : null })
</script>

<template>
  <div class="region-map">
    <div class="map-caption"><span>{{ t('ui.m006') }}</span><span>{{ t('ui.m133') }}</span></div>
    <svg :viewBox="geometry.viewBox.join(' ')" class="oblast-map" role="group" aria-labelledby="oblast-map-title oblast-map-description">
      <title id="oblast-map-title">{{ t('ui.m134') }}</title>
      <desc id="oblast-map-description">{{ t('ui.m135') }}</desc>
      <path v-for="region in geometry.regions" :key="region.id" :d="region.path" :data-region="region.id" fill-rule="evenodd"
        role="button" tabindex="0" :aria-label="regionLabel(region.id, language)" :aria-pressed="selected === region.id" :aria-controls="panelId"
        @click="emit('select', region.id)" @keydown.enter.prevent="emit('select', region.id)" @keydown.space.prevent="emit('select', region.id)"
        @mouseenter="hovered = region.id" @mouseleave="hovered = ''" @focus="focused = region.id" @blur="focused = ''">
        <title>{{ regionLabel(region.id, language) }}</title>
      </path>
    </svg>
    <p class="map-hover-name">{{ activeName || t('ui.m136') }}</p>
    <div v-if="!preview" class="map-legend"><span><i aria-hidden="true"></i> {{ t('ui.m137') }}</span><span><i class="selected" aria-hidden="true"></i> {{ t('ui.m138') }}</span></div>
    <div v-if="!preview" id="map-region-select" class="map-region-select" role="group" aria-labelledby="region-choice-label" tabindex="-1">
      <p id="region-choice-label">{{ t('ui.m139') }}</p>
      <div class="region-choices"><button v-for="region in geometry.regions" :key="region.id" type="button" :aria-label="regionLabel(region.id, language)" :aria-pressed="selected === region.id" :aria-controls="panelId" @click="emit('select', region.id)">{{ regionLabel(region.id, language) }}</button></div>
    </div>
  </div>
</template>
