<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  species: {
    type: Object,
    required: true,
  },
})
const emit = defineEmits(['open'])

const imageFailed = ref(false)

const statusDetails = computed(() => ({
  CR: { label: 'Критическая угроза', classes: 'bg-red-500/15 text-red-200 ring-red-500/30' },
  EN: { label: 'Под угрозой', classes: 'bg-amber-500/15 text-amber-200 ring-amber-500/30' },
  VU: { label: 'Уязвимый вид', classes: 'bg-yellow-500/15 text-yellow-200 ring-yellow-500/30' },
}[props.species.status] || { label: 'Статус неизвестен', classes: 'bg-slate-700 text-slate-200 ring-slate-600' }))

const imagePath = computed(() =>
  props.species.image || `/images/processed/${props.species.id}.png`,
)

const formattedPopulation = computed(() =>
  new Intl.NumberFormat('ru-RU').format(props.species.population),
)
</script>

<template>
  <article
    class="group cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-lg shadow-slate-950/30 transition duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-slate-950/40"
    role="button"
    tabindex="0"
    @click="emit('open', species)"
    @keydown.enter="emit('open', species)"
    @keydown.space.prevent="emit('open', species)"
  >
    <div class="relative aspect-[4/3] overflow-hidden bg-slate-950">
      <img
        v-if="!imageFailed"
        :src="imagePath"
        :alt="`${species.name_ru} — изображение вида`"
        class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        @error="imageFailed = true"
      />
      <div v-else class="flex h-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 px-8 text-center text-slate-200">
        <span class="text-xs font-semibold uppercase tracking-[0.2em]">Фото появится скоро</span>
      </div>
      <span
        class="absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ring-1"
        :class="statusDetails.classes"
      >
        {{ species.status }} · {{ statusDetails.label }}
      </span>
    </div>
    <div class="p-5">
      <div class="flex items-center justify-between gap-2">
        <h3 class="text-2xl font-semibold tracking-tight text-white">{{ species.name_ru }}</h3>
        <span class="rounded-full border border-slate-700 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">
          {{ species.category }}
        </span>
      </div>
      <p class="mt-1 text-sm text-slate-400">{{ species.name_kg }} · {{ species.name_en }}</p>
      <p class="mt-5 text-sm leading-6 text-slate-300">{{ species.description_ru }}</p>
      <div class="mt-6 border-t border-slate-800 pt-4">
        <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300">Осталось в природе</p>
        <p class="mt-2 text-3xl font-semibold tracking-tight text-white">
          {{ formattedPopulation }}
          <span class="text-base font-medium text-slate-400">особей</span>
        </p>
      </div>
    </div>
  </article>
</template>
