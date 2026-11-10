/* MURAS service worker: offline shell + runtime caching. No third-party code, same-origin only.
   The list of files to keep comes from /precache.json, written by scripts/admin-entry.mjs after each build. */
const SHELL = 'muras-shell-'
const RUNTIME = 'muras-runtime-v1' // data revalidated in the background
const MEDIA = 'muras-media-v1'     // photos viewed online, trimmed
const MEDIA_LIMIT = 150
const NAV_TIMEOUT = 4000

async function precacheShell() {
  const response = await fetch('/precache.json', { cache: 'no-store' })
  if (!response.ok) throw new Error('precache.json ' + response.status)
  const manifest = await response.json()
  const name = SHELL + manifest.version
  if (await caches.has(name)) return name
  const cache = await caches.open(name)
  try {
    await Promise.all([...manifest.shell, ...manifest.data].map(async url => {
      const file = await fetch(url, { cache: 'reload' })
      if (!file.ok) throw new Error(url + ' ' + file.status)
      await cache.put(url, file)
    }))
  } catch (error) {
    await caches.delete(name) // never keep a half-filled shell
    throw error
  }
  for (const key of await caches.keys()) if (key.startsWith(SHELL) && key !== name) await caches.delete(key)
  return name
}

self.addEventListener('install', event => {
  event.waitUntil(precacheShell().then(() => self.skipWaiting()))
})
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

const lookup = async request => (await (await caches.open(RUNTIME)).match(request)) || caches.match(request)
async function trim(cache) {
  const keys = await cache.keys()
  for (const key of keys.slice(0, Math.max(0, keys.length - MEDIA_LIMIT))) await cache.delete(key)
}
async function cacheFirst(request, target) {
  const hit = await lookup(request)
  if (hit) return hit
  const response = await fetch(request)
  if (response.ok && response.status === 200) {
    const cache = await caches.open(target)
    await cache.put(request, response.clone())
    if (target === MEDIA) trim(cache)
  }
  return response
}
async function staleWhileRevalidate(request, event) {
  const hit = await lookup(request)
  const update = fetch(request).then(async response => {
    if (response.ok) await (await caches.open(RUNTIME)).put(request, response.clone())
    return response
  })
  if (hit) { event.waitUntil(update.catch(() => {})); return hit }
  return update
}
async function navigate(event) {
  const shellName = (await caches.keys()).find(key => key.startsWith(SHELL))
  const fallback = shellName ? await (await caches.open(shellName)).match('/') : null
  try {
    const network = fetch(event.request)
    const response = fallback
      ? await Promise.race([network, new Promise((_, reject) => setTimeout(() => reject(new Error('slow')), NAV_TIMEOUT))])
      : await network
    event.waitUntil(precacheShell().catch(() => {}))
    return response
  } catch (error) {
    if (fallback) return fallback
    throw error
  }
}

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin || request.headers.has('range')) return
  const path = url.pathname
  if (path.startsWith('/admin') || path.startsWith('/__muras_admin') || path === '/sw.js' || path === '/precache.json') return
  if (/\.(mp4|webm|mov)$/i.test(path)) return
  if (request.mode === 'navigate') { event.respondWith(navigate(event)); return }
  if (path.startsWith('/assets/') || path.startsWith('/icons/') || path === '/favicon.svg' || path === '/manifest.webmanifest') {
    event.respondWith(cacheFirst(request, RUNTIME)); return
  }
  if (path.startsWith('/data/')) { event.respondWith(staleWhileRevalidate(request, event)); return }
  if (path.startsWith('/images/')) {
    event.respondWith((async () => (await (await caches.open('muras-offline-v1')).match(request)) || cacheFirst(request, MEDIA))())
  }
})
