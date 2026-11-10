import { computed, onMounted, ref } from 'vue'
import { supportsAvif } from '../data/photo-thumbs.js'

const STORE = 'muras-offline-v1'
const KEY = 'muras-offline-saved'
const supported = () => typeof window !== 'undefined' && 'serviceWorker' in navigator && 'caches' in window && import.meta.env.PROD

// "Save for offline": keeps the lightweight photo copies (a few MB) on the device.
// The app shell and data are already kept by the service worker; full-size photos are
// cached only after they have been opened.
export function useOfflineSave() {
  const state = ref('idle') // idle | working | done | error
  const progress = ref(0)
  const available = computed(() => supported())
  onMounted(() => {
    try { if (localStorage.getItem(KEY)) state.value = 'done' } catch { /* private mode */ }
  })
  async function save() {
    if (!supported() || state.value === 'working') return
    state.value = 'working'; progress.value = 0
    try {
      await navigator.serviceWorker.ready
      const list = await (await fetch('/precache.json', { cache: 'no-store' })).json()
      const urls = (await supportsAvif()) ? list.thumbs.avif : list.thumbs.webp
      const cache = await caches.open(STORE)
      let done = 0, index = 0
      const worker = async () => {
        while (index < urls.length) {
          const url = urls[index++]
          if (!(await cache.match(url))) {
            const response = await fetch(url)
            if (!response.ok) throw new Error(url + ' ' + response.status)
            await cache.put(url, response)
          }
          progress.value = Math.round((++done / urls.length) * 100)
        }
      }
      await Promise.all(Array.from({ length: 6 }, worker))
      try { localStorage.setItem(KEY, list.version) } catch { /* ignore */ }
      state.value = 'done'
    } catch {
      state.value = 'error'
    }
  }
  return { state, progress, available, save }
}
