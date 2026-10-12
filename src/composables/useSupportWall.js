import { computed, ref, unref } from 'vue'
import { addWallEntry, readWall, writeWall } from '../data/support/wall.js'

function browserStorage() {
  try { return typeof window !== 'undefined' ? window.localStorage : null } catch { return null }
}

export function useSupportWall(catalog, { storage = browserStorage(), makeId, now } = {}) {
  const entries = ref([]), available = ref(false), hasSavedData = ref(false), notice = ref(''), message = ref('')
  const ids = computed(() => unref(catalog).map(species => species.id))
  function refresh() {
    const read = readWall(storage, ids.value)
    entries.value = read.entries; available.value = read.available; hasSavedData.value = read.hasSavedData; notice.value = read.notice
  }
  refresh()
  function persist(updated, successMessage) {
    if (!writeWall(storage, updated)) {
      message.value = 'Не удалось сохранить изменения. Локальный список не изменён.'
      return false
    }
    entries.value = updated; hasSavedData.value = updated.length > 0; notice.value = ''; message.value = successMessage
    return true
  }
  function add(value) {
    refresh() // Include changes from another tab before writing.
    if (!available.value) { message.value = 'Локальное хранилище недоступно. Демозапись не добавлена.'; return false }
    const result = addWallEntry(entries.value, value, ids.value, { makeId, now })
    if (result.error) { message.value = result.error; return false }
    return persist(result.entries, 'Демозапись добавлена только в этот браузер. Пожертвование не совершено.')
  }
  function remove(id) {
    refresh()
    if (!entries.value.some(entry => entry.id === id)) { message.value = 'Демозапись уже удалена или недоступна.'; return false }
    return persist(entries.value.filter(entry => entry.id !== id), 'Локальная демозапись удалена.')
  }
  function clear() {
    refresh()
    return persist([], 'Весь локальный демосписок очищен.')
  }
  return { entries, available, hasSavedData, notice, message, refresh, add, remove, clear }
}
