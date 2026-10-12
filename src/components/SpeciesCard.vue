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
  CR: { label: 'Критическая угроза', classes: 'bg-red-100 text-red-800 ring-red-200' },
  EN: { label: 'Под угрозой', classes: 'bg-orange-100 text-orange-800 ring-orange-200' },
  VU: { label: 'Уязвимый вид', classes: 'bg-yellow-100 text-yellow-800 ring-yellow-200' },
}[props.species.status] || { label: 'Статус неизвестен', classes: 'bg-slate-100 text-slate-700 ring-slate-200' }))

const imagePath = computed(() =>
  props.species.image || `/images/processed/${props.species.id}.png`,
)

const formattedPopulation = computed(() =>
  new Intl.NumberFormat('ru-RU').format(props.species.population),
)
</script>

<template>
  <article
    class="group cursor-pointer overflow-hidden rounded-2xl border border-emerald-950/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    role="button"
    tabindex="0"
    @click="emit('open', species)"
    @keydown.enter="emit('open', species)"
    @keydown.space.prevent="emit('open', species)"
  >
    <div class="relative aspect-[4/3] overflow-hidden bg-emerald-900">
      <img
        v-if="!imageFailed"
        :src="imagePath"
        :alt="`${species.name_ru} — пиксельная фотография`"
        class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        @error="imageFailed = true"
      />
      <div v-else class="flex h-full items-center justify-center bg-gradient-to-br from-emerald-800 to-emerald-950 px-8 text-center text-emerald-100">
        <span class="text-sm font-semibold uppercase tracking-[0.2em]">Фото появится скоро</span>
      </div>
      <span
        class="absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ring-1"
        :class="statusDetails.classes"
      >
        {{ species.status }} · {{ statusDetails.label }}
      </span>
    </div>
    <div class="p-5">
      <h3 class="text-2xl font-black tracking-tight text-slate-900">{{ species.name_ru }}</h3>
      <p class="mt-1 text-sm text-slate-500">{{ species.name_kg }} · {{ species.name_en }}</p>
      <p class="mt-5 text-sm leading-6 text-slate-600">{{ species.description_ru }}</p>
      <div class="mt-6 border-t border-slate-100 pt-4">
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Осталось в природе</p>
        <p class="mt-1 text-3xl font-black tracking-tight text-emerald-950">
          {{ formattedPopulation }}
          <span class="text-base font-semibold text-slate-500">особей</span>
        </p>
      </div>
    </div>
  </article>
</template>
