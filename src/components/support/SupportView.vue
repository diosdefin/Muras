<script setup>
import { computed } from 'vue'
import SupportSpecies from './SupportSpecies.vue'
import SupportWall from './SupportWall.vue'
import { supportSpecies } from '../../data/support/model.js'
import { speciesName } from '../../data/presentation.js'
import './support.css'
const props = defineProps({ species: { type: Array, required: true }, speciesId: { type: String, default: null }, loading: Boolean, error: { type: String, default: '' } })
const emit = defineEmits(['select', 'study', 'catalog'])
const current = computed(() => supportSpecies(props.species, props.speciesId))
</script>

<template>
  <section id="support" class="support-section page-container" tabindex="-1" aria-labelledby="support-title" :aria-busy="loading">
    <header class="support-heading"><div><p class="eyebrow"><span class="red-rule" aria-hidden="true"></span> Природное наследие Кыргызстана</p><h1 id="support-title">Сохрани вид</h1><p>Редкие виды — часть природного наследия Кыргызстана. Изучить угрозы и меры охраны — первый шаг к обсуждению будущей поддержки природоохранных инициатив.</p></div><button class="quiz-secondary" type="button" @click="emit('catalog')">Вернуться в каталог</button></header>
    <aside class="support-closed" aria-labelledby="support-closed-title"><span class="support-closed-mark" aria-hidden="true">○</span><div><h2 id="support-closed-title">Приём пожертвований пока не открыт</h2><p>Конкурсная концепция. Здесь нет платежей, сборов и действующей программы финансирования.</p></div></aside>
    <p v-if="loading" class="catalog-message" role="status">Загружаем научные записи…</p>
    <p v-else-if="error" class="catalog-message error-message" role="alert">{{ error }}</p>
    <p v-else-if="!species.length" class="catalog-message">Каталог недоступен. Сведения о видах пока нельзя показать.</p>
    <template v-else>
      <div class="support-selection"><label for="support-species">Вид и будущая поддержка</label><select id="support-species" :value="current?.id || ''" @change="emit('select', $event.target.value || null)"><option value="">Общий раздел · выбрать вид</option><option v-for="record in species" :key="record.id" :value="record.id">{{ speciesName(record) }}</option></select></div>
      <SupportSpecies v-if="current" :species="current" @study="emit('study', $event)" />
      <section v-else class="support-purpose" aria-labelledby="support-purpose-title"><p class="eyebrow">Знание перед действием</p><h2 id="support-purpose-title">Защита начинается с понимания угроз</h2><p>В каталоге собраны редкие виды Кыргызстана, сведения об угрозах и мерах охраны. Источники позволяют обсуждать помощь на основе опубликованных данных. Выберите вид, чтобы изучить его запись.</p><p>Будущая программа должна опираться на план проверенной природоохранной организации. Поддержка программы не означает автоматического спасения конкретного животного или растения.</p></section>
      <section class="support-program" aria-labelledby="support-program-title"><header><p class="eyebrow">Будущая программа · концепция</p><h2 id="support-program-title">Что нужно до открытия поддержки</h2><p>Партнёр, бюджет и программа пока не утверждены. Возможные направления работ предстоит согласовать с природоохранной организацией на основе научных сведений{{ current ? ` о виде «${speciesName(current)}»` : '' }}.</p></header><ol><li><span aria-hidden="true">01</span><h3>Проверенный партнёр</h3><p>Организация, понятные задачи, территория работ и документы программы.</p></li><li><span aria-hidden="true">02</span><h3>Прозрачные условия</h3><p>Безопасный способ поддержки, опубликованный бюджет и порядок отчётности.</p></li><li><span aria-hidden="true">03</span><h3>Добровольное признание</h3><p>Имя на будущей стене — только по согласию, с возможностью его отозвать.</p></li></ol></section>
      <SupportWall :species="species" :species-id="current?.id || null" />
    </template>
  </section>
</template>
