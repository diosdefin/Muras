<script setup>
import { computed } from 'vue'
import LessonPhoto from '../lesson/LessonPhoto.vue'
import LessonReferences from '../lesson/LessonReferences.vue'
import { groupLabel, localized, speciesName } from '../../data/presentation.js'
import { sourcedStatements } from '../../data/support/model.js'
const props = defineProps({ species: { type: Object, required: true } })
const emit = defineEmits(['study'])
const threats = computed(() => sourcedStatements(props.species, 'threats'))
const measures = computed(() => sourcedStatements(props.species, 'conservationMeasures'))
</script>

<template>
  <article class="support-species" aria-labelledby="support-species-title">
    <LessonPhoto :species="species" />
    <div class="support-species-copy">
      <p class="eyebrow">{{ groupLabel(species) }} · запись каталога</p>
      <h2 id="support-species-title">{{ speciesName(species) }}</h2>
      <p class="support-names"><span v-if="species.names.ky" lang="ky">{{ species.names.ky }}</span><span v-if="species.names.en" lang="en">{{ species.names.en }}</span><span v-if="species.scientificName" class="scientific-name" lang="la">{{ species.scientificName }}</span></p>
      <p class="support-editorial">{{ species.verified ? 'Запись проверена.' : 'Источники указаны; запись требует независимой редакторской проверки.' }}</p>
      <div class="support-facts">
        <section><h3>Угрозы · по источникам</h3><ul v-if="threats.length"><li v-for="(item, n) in threats" :key="n">{{ localized(item.text) }} <LessonReferences :species="species" :ids="item.sourceIds" /></li></ul><p v-else>Сведения об угрозах пока не подтверждены.</p></section>
        <section><h3>Меры охраны · по источникам</h3><ul v-if="measures.length"><li v-for="(item, n) in measures" :key="n">{{ localized(item.text) }} <LessonReferences :species="species" :ids="item.sourceIds" /></li></ul><p v-else>Сведения о мерах охраны пока не подтверждены.</p></section>
      </div>
      <div class="support-visual-link">
        <span class="support-mosaic" aria-hidden="true"><i v-for="n in 12" :key="n"></i></span>
        <div><p>«Как исчезает вид» в научной карточке — условный образ утраты. Эффект не отражает численность и не предсказывает исчезновение.</p><button class="text-link" type="button" aria-haspopup="dialog" @click="emit('study', species.id)">Научная карточка и визуализация <span aria-hidden="true">↗</span></button></div>
      </div>
    </div>
  </article>
</template>
