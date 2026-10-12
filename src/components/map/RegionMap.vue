<script setup>
import { computed, ref } from 'vue'
const props = defineProps({ geometry: { type: Object, required: true }, selected: { type: String, default: '' } })
const emit = defineEmits(['select'])
const hovered = ref(''), focused = ref('')
const activeName = computed(() => props.geometry.regions.find(r => r.id === (hovered.value || focused.value || props.selected))?.name)
</script>

<template>
  <div class="region-map">
    <div class="map-caption"><span>Кыргызстан</span><span>07 областей</span></div>
    <svg :viewBox="geometry.viewBox.join(' ')" class="oblast-map" role="group" aria-labelledby="oblast-map-title oblast-map-description">
      <title id="oblast-map-title">Области Кыргызстана</title>
      <desc id="oblast-map-description">Выберите область нажатием, Enter или пробелом. Границы geoBoundaries за 2017 год. Карта показывает региональные свидетельства, а не полные ареалы видов.</desc>
      <path v-for="region in geometry.regions" :key="region.id" :d="region.path" :data-region="region.id" fill-rule="evenodd"
        role="button" tabindex="0" :aria-label="region.name" :aria-pressed="selected === region.id" aria-controls="map-region-panel"
        @click="emit('select', region.id)" @keydown.enter.prevent="emit('select', region.id)" @keydown.space.prevent="emit('select', region.id)"
        @mouseenter="hovered = region.id" @mouseleave="hovered = ''" @focus="focused = region.id" @blur="focused = ''">
        <title>{{ region.name }}</title>
      </path>
    </svg>
    <p class="map-hover-name">{{ activeName || 'Выберите область на карте или в списке' }}</p>
    <div class="map-legend"><span><i aria-hidden="true"></i> Административные границы</span><span><i class="selected" aria-hidden="true"></i> Выбранная область</span></div>
    <div id="map-region-select" class="map-region-select" role="group" aria-labelledby="region-choice-label" tabindex="-1">
      <p id="region-choice-label">Выберите область</p>
      <div class="region-choices"><button v-for="region in geometry.regions" :key="region.id" type="button" :aria-label="region.name" :aria-pressed="selected === region.id" aria-controls="map-region-panel" @click="emit('select', region.id)">{{ region.name.replace(/ская область$/, '') }}</button></div>
    </div>
  </div>
</template>
