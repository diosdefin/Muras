<script setup>
import { computed, ref } from 'vue'
import { formatPopulation, localized, publicImageUrl, speciesName, speciesPhoto, statusDetails as getStatusDetails } from '../data/presentation.js'

const props = defineProps({
  species: {
    type: Object,
    required: true,
  },
})
const emit = defineEmits(['open'])

const imageFailed = ref(false)

const statusDetails = computed(() => getStatusDetails(props.species))
const photo = computed(() => speciesPhoto(props.species))

const imagePath = computed(() =>
  publicImageUrl(photo.value?.path),
)

const formattedPopulation = computed(() =>
  props.species.population.estimate ? formatPopulation(props.species.population) : 'Неизвестна',
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
        :alt="photo ? `${speciesName(species)} — фотография` : 'Условный горный пейзаж; фотография вида пока недоступна'"
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
        {{ statusDetails.label }}
      </span>
    </div>
    <div class="p-5">
      <h3 class="text-2xl font-black tracking-tight text-slate-900">{{ speciesName(species) }}</h3>
      <p class="mt-1 text-sm text-slate-500">{{ [species.names.ky, species.names.en, species.scientificName].filter(Boolean).join(' · ') }}</p>
      <p v-if="!species.verified" class="mt-1 text-sm text-slate-500">Кандидат · национальная запись ещё не проверена</p>
      <p class="mt-5 text-sm leading-6 text-slate-600">{{ localized(species.habitat?.description) || 'Сведения о местообитании пока не подтверждены.' }}</p>
      <div class="mt-6 border-t border-slate-100 pt-4">
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Численность</p>
        <p class="mt-1 text-3xl font-black tracking-tight text-emerald-950">
          {{ formattedPopulation }}
        </p>
      </div>
    </div>
  </article>
</template>
