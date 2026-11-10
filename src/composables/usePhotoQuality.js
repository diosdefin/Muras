import { ref, onMounted, onBeforeUnmount } from 'vue'
import { connectionIsConstrained } from '../data/photo-thumbs.js'

// Shared for the page session: once the visitor asks for full quality it stays on.
const fullRequested = ref(false)

export function usePhotoQuality() {
  const lowData = ref(false)
  // Offline counts too: only the saved lightweight copies are available then.
  const update = () => { lowData.value = connectionIsConstrained() || globalThis.navigator?.onLine === false }
  onMounted(() => {
    update()
    globalThis.navigator?.connection?.addEventListener?.('change', update)
    window.addEventListener('online', update); window.addEventListener('offline', update)
  })
  onBeforeUnmount(() => {
    globalThis.navigator?.connection?.removeEventListener?.('change', update)
    window.removeEventListener('online', update); window.removeEventListener('offline', update)
  })
  return { lowData, fullRequested, requestFull: () => { fullRequested.value = true } }
}
