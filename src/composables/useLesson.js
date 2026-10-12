import { computed, ref, unref, watch } from 'vue'

export function useLesson(catalog) {
  const selectedId = ref(null)
  const records = computed(() => unref(catalog) || [])
  const index = computed(() => Math.max(0, records.value.findIndex(species => species.id === selectedId.value)))
  const current = computed(() => records.value[index.value] || null)
  watch(records, () => {
    if (!records.value.some(species => species.id === selectedId.value)) selectedId.value = records.value[0]?.id || null
  }, { immediate: true })
  function select(id) { if (records.value.some(species => species.id === id)) selectedId.value = id }
  function move(delta) {
    if (!records.value.length) return
    const next = (index.value + delta + records.value.length) % records.value.length
    selectedId.value = records.value[next].id
  }
  return { selectedId, current, index, select, next: () => move(1), previous: () => move(-1) }
}
