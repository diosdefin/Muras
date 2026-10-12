<script setup>
import LessonReferences from './LessonReferences.vue'
import { formatPopulation, localized, nationalStatus, regionNames, statusDetails } from '../../data/presentation.js'
defineProps({ species: { type: Object, required: true } })
const taxonomyLabels = { kingdom: 'Царство', phylum: 'Тип / отдел', class: 'Класс', order: 'Отряд / порядок', family: 'Семейство', genus: 'Род' }
</script>

<template>
  <details class="lesson-details">
    <summary>Дополнительные научные сведения</summary>
    <div class="lesson-details-content">
      <p class="lesson-editorial">{{ species.verified ? 'Запись проверена.' : 'Запись требует независимой редакторской проверки.' }}
        Национальные категории относятся к указанному изданию; рекомендации не означают, что все меры уже реализованы.</p>
      <section>
        <h3>Среда обитания</h3>
        <p>{{ localized(species.habitat?.description) || 'Сведения пока не подтверждены.' }} <LessonReferences :species="species" :ids="species.habitat?.sourceIds" /></p>
        <p>Ареал: {{ regionNames(species).join(', ') || 'Не установлен' }}.</p>
      </section>
      <section v-for="field in ['threats', 'conservationMeasures']" :key="field">
        <h3>{{ field === 'threats' ? 'Угрозы' : 'Меры охраны' }}</h3>
        <ul v-if="species[field]?.length">
          <li v-for="(item, index) in species[field]" :key="index">{{ localized(item.text) }} <LessonReferences :species="species" :ids="item.sourceIds" /></li>
        </ul>
        <p v-else>Сведения пока не подтверждены.</p>
      </section>
      <section>
        <h3>Природоохранные категории</h3>
        <p>{{ nationalStatus(species) }}. {{ species.nationalRedBook?.edition }}. <LessonReferences :species="species" :ids="species.nationalRedBook?.sourceIds" /></p>
        <p>{{ statusDetails(species).label }}. <LessonReferences :species="species" :ids="species.iucn?.sourceIds" /></p>
        <p>{{ species.iucn?.year ? `Год оценки IUCN: ${species.iucn.year}.` : 'Год индивидуальной оценки IUCN в доступном источнике не указан.' }}</p>
      </section>
      <section>
        <h3>Численность</h3>
        <p>{{ formatPopulation(species.population) }}<template v-if="species.population?.estimate"> · {{ species.population.territory }}, {{ species.population.year }} год</template>.
          <LessonReferences :species="species" :ids="species.population?.sourceIds" /></p>
      </section>
      <section>
        <h3>Таксономия каталога</h3>
        <dl class="lesson-taxonomy">
          <div v-for="(label, key) in taxonomyLabels" :key="key"><dt>{{ label }}</dt><dd :lang="species.taxonomy?.[key] ? 'la' : 'ru'">{{ species.taxonomy?.[key] || 'Не установлено' }}</dd></div>
        </dl>
        <LessonReferences :species="species" :ids="species.sources.filter(source => source.supports.some(field => field.startsWith('taxonomy.'))).map(source => source.id)" />
      </section>
      <section v-if="species.images?.length">
        <h3>Авторство и изменения фотографии</h3>
        <template v-for="photo in species.images" :key="photo.path">
          <p>{{ photo.attribution }}</p>
          <ul v-if="photo.modifications?.length"><li v-for="change in photo.modifications" :key="change">{{ change }}</li></ul>
          <p>В режиме урока фотография показана целиком, без пикселизации.</p>
        </template>
      </section>
    </div>
  </details>
</template>
