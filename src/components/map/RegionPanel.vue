<script setup>
import RegionalSpecies from './RegionalSpecies.vue'
defineProps({ region: { type: Object, default: null }, entries: { type: Array, default: () => [] }, group: { type: String, default: 'ALL' }, unfilteredCount: { type: Number, default: 0 } })
const emit = defineEmits(['open', 'reset', 'group'])
</script>

<template>
  <aside id="map-region-panel" class="map-panel" aria-labelledby="map-panel-title">
    <p class="eyebrow">Региональные свидетельства</p>
    <h3 id="map-panel-title">{{ region?.name || 'Природа в контексте места' }}</h3>
    <p class="map-panel-intro">{{ region ? 'Область Кыргызстана. Здесь собраны сведения из проверенных публикаций с привязкой к этому региону.' : 'Выберите область, чтобы познакомиться с документальными свидетельствами о видах из нашего каталога.' }}</p>
    <div class="filter-field">
      <label for="map-group-filter">Группа видов</label>
      <select id="map-group-filter" :value="group" @change="emit('group', $event.target.value)">
        <option value="ALL">Все группы</option><option value="mammals">Млекопитающие</option><option value="birds">Птицы</option><option value="plants">Растения</option>
      </select>
    </div>
    <p class="map-panel-status" role="status" aria-live="polite" aria-atomic="true">{{ !region ? 'Область не выбрана' : entries.length ? `${region.name} · записей по источникам: ${entries.length}` : 'Региональные сведения пока уточняются' }}</p>
    <p v-if="region && !entries.length" class="map-empty">{{ unfilteredCount && group !== 'ALL' ? 'Для выбранной группы пока нет документальной привязки в нашей базе.' : 'В нашей базе пока нет документальной привязки видов к этой области.' }} Это не означает, что редкие виды здесь отсутствуют.</p>
    <div v-if="region && entries.length" class="regional-species-list">
      <RegionalSpecies v-for="entry in entries" :key="entry.species.id" :entry="entry" @open="emit('open', $event)" />
    </div>
    <p v-if="!region" class="map-empty">Выберите область на карте или в списке. Пустая подборка не означает отсутствия редких видов.</p>
    <button v-if="region || group !== 'ALL'" type="button" class="map-reset" @click="emit('reset')">Сбросить выбор</button>
  </aside>
</template>
