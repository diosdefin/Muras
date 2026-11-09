<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import irbis from '../assets/hero/hero-irbis-1040x680.mp4'
import argali from '../assets/hero/hero-argali-1040x680.mp4'
import berkut from '../assets/hero/hero-berkut-1040x680.mp4'
import fritillaria from '../assets/hero/hero-fritillaria-1040x680.mp4'
import poster from '../assets/hero/hero-landscape-poster.webp'

// Every clip starts and ends on the exact landscape of the poster (animal/boundary-qc.md),
// so the poster stays underneath at all times and the video layer is switched on/off
// instantly on those still frames: no fades, no empty background, no visible seam.
const scenes = [
  { key: 'argali', src: argali },
  { key: 'snow-leopard', src: irbis },
  { key: 'eagle', src: berkut },
  { key: 'fritillary', src: fritillaria },
]
const gapDuration = 4000
const cacheName = 'muras-hero-v1'

const frame = ref(null)
const video = ref(null)
const phase = ref('loading') // loading → scene ⇄ gap; static when video is impossible
const sceneKey = ref('')
const layerVisible = ref(false)
const intersecting = ref(false)
const pageVisible = ref(true)
const active = computed(() => intersecting.value && pageVisible.value)

let ready = []
let bag = []
let current = null
let gapTimer, gapStartedAt, frameRequest, observer, idleRequest
let remainingGap = 0
let blocked = false
let pageLoaded = false
let preloadStarted = false
let disposed = false
const objectUrls = []

const absolute = src => new URL(src, location.href).href

// Downloaded clips are kept in the browser's Cache Storage, so a later visit plays them
// without downloading again. Production file names carry a content hash (never stale);
// clips that are no longer part of the site are removed from the cache.
async function openCache() {
  if (typeof caches === 'undefined') return null // e.g. plain-http LAN preview
  try {
    const cache = await caches.open(cacheName)
    const keep = new Set(scenes.map(scene => absolute(scene.src)))
    for (const request of await cache.keys()) if (!keep.has(request.url)) cache.delete(request)
    return cache
  } catch {
    return null
  }
}

async function download(cache, scene) {
  const url = absolute(scene.src)
  let response = cache && await cache.match(url)
  if (response && import.meta.env.DEV) {
    // Dev URLs have no content hash: a cheap HEAD request detects a replaced file.
    const head = await fetch(url, { method: 'HEAD', cache: 'no-store' }).catch(() => null)
    if (head?.ok && head.headers.get('etag') !== response.headers.get('etag')) response = null
  }
  if (!response) {
    response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    if (cache) await cache.put(url, response.clone()).catch(() => {})
  }
  const objectUrl = URL.createObjectURL(await response.blob())
  objectUrls.push(objectUrl)
  return { key: scene.key, url: objectUrl }
}

// All four clips are fully downloaded (one after another, after the page itself has
// loaded) before the first scene starts, so playback never waits for the network.
async function preload() {
  const cache = await openCache()
  for (const scene of scenes) {
    if (disposed) return
    try {
      ready.push(await download(cache, scene))
    } catch (error) {
      console.warn(`[hero] ${scene.key} unavailable`, error)
    }
  }
  if (disposed) return
  if (!ready.length) {
    phase.value = 'static'
    return
  }
  remainingGap = 0
  phase.value = 'gap'
  resumeGap()
}

function shuffledRound() {
  const round = ready.slice()
  for (let i = round.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[round[i], round[j]] = [round[j], round[i]]
  }
  // A new random order of all scenes each round, never the same scene twice in a row.
  if (round.length > 1 && round[0] === current) {
    const j = 1 + Math.floor(Math.random() * (round.length - 1))
    ;[round[0], round[j]] = [round[j], round[0]]
  }
  return round
}

function nextScene() {
  if (!bag.length) bag = shuffledRound()
  current = bag.shift()
  sceneKey.value = current.key
  phase.value = 'scene'
  video.value.src = current.url
  play()
}

function cancelReveal() {
  if (frameRequest === undefined) return
  video.value?.cancelVideoFrameCallback?.(frameRequest)
  frameRequest = undefined
}

function reveal(element) {
  if (layerVisible.value || frameRequest !== undefined) return
  const show = () => {
    frameRequest = undefined
    if (phase.value === 'scene' && element === video.value) layerVisible.value = true
  }
  if (element.requestVideoFrameCallback) frameRequest = element.requestVideoFrameCallback(show)
  else show()
}

function play() {
  const element = video.value
  if (!element || phase.value !== 'scene' || !active.value) return
  element.play().then(() => {
    blocked = false
    if (phase.value === 'scene' && active.value) reveal(element)
  }).catch(error => {
    if (error.name === 'AbortError' || phase.value !== 'scene') return
    if (error.name === 'NotAllowedError') blocked = true // the landscape stays; retried on the next tap
    else dropCurrent()
  })
}

function startGap(duration) {
  cancelReveal()
  layerVisible.value = false
  remainingGap = duration
  phase.value = 'gap'
  resumeGap()
}

function onEnded() {
  if (phase.value === 'scene') startGap(gapDuration)
}

function dropCurrent() {
  if (phase.value !== 'scene') return
  ready = ready.filter(scene => scene !== current)
  bag = bag.filter(scene => scene !== current)
  if (!ready.length) {
    cancelReveal()
    layerVisible.value = false
    phase.value = 'static'
    return
  }
  startGap(0)
}

function freezeGap() {
  if (gapTimer === undefined) return
  clearTimeout(gapTimer)
  gapTimer = undefined
  remainingGap = Math.max(0, remainingGap - (performance.now() - gapStartedAt))
}

function resumeGap() {
  if (phase.value !== 'gap' || !active.value || gapTimer !== undefined) return
  gapStartedAt = performance.now()
  gapTimer = setTimeout(() => {
    gapTimer = undefined
    remainingGap = 0
    if (phase.value === 'gap' && active.value) nextScene()
  }, remainingGap)
}

function setActive(nextIntersecting = intersecting.value, nextVisible = pageVisible.value) {
  const was = active.value
  intersecting.value = nextIntersecting
  pageVisible.value = nextVisible
  maybePreload()
  if (was === active.value) return
  if (!active.value) {
    freezeGap()
    cancelReveal()
    video.value?.pause() // the current frame simply stays on screen
  } else if (phase.value === 'gap') {
    resumeGap()
  } else if (phase.value === 'scene') {
    play()
  }
}

const onVisibility = () => setActive(undefined, !document.hidden)
const onGesture = () => { if (blocked) play() }
// Download only once the page has loaded and the hero has actually been on screen
// (the component also lives, hidden, behind species and map pages).
function maybePreload() {
  if (preloadStarted || !pageLoaded || !intersecting.value || disposed || phase.value !== 'loading') return
  preloadStarted = true
  const run = () => { idleRequest = undefined; preload() }
  idleRequest = window.requestIdleCallback ? requestIdleCallback(run, { timeout: 1500 }) : setTimeout(run, 200)
}
const onLoad = () => { pageLoaded = true; maybePreload() }

onMounted(() => {
  pageVisible.value = !document.hidden
  document.addEventListener('visibilitychange', onVisibility)
  document.addEventListener('pointerdown', onGesture, { passive: true })
  if (typeof IntersectionObserver === 'undefined') intersecting.value = true
  else {
    observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting, undefined))
    observer.observe(frame.value)
  }
  if (navigator.connection?.saveData) {
    phase.value = 'static' // "Save data" asked us not to download ~5 MB of video
    return
  }
  if (document.readyState === 'complete') onLoad()
  else window.addEventListener('load', onLoad, { once: true })
})

onUnmounted(() => {
  disposed = true
  observer?.disconnect()
  document.removeEventListener('visibilitychange', onVisibility)
  document.removeEventListener('pointerdown', onGesture)
  window.removeEventListener('load', onLoad)
  if (idleRequest !== undefined) (window.cancelIdleCallback || clearTimeout)(idleRequest)
  freezeGap()
  cancelReveal()
  video.value?.pause()
  video.value?.removeAttribute('src')
  for (const url of objectUrls) URL.revokeObjectURL(url)
})
</script>

<template>
  <div class="hero-art">
    <!-- Decorative media: no "save video / save frame / download" menu on right-click or long-press. -->
    <div ref="frame" class="hero-art-frame" aria-hidden="true" :data-phase="phase" @contextmenu.prevent>
      <div class="hero-art-mask">
        <img :src="poster" alt="" width="1040" height="680" decoding="async" draggable="false">
        <video ref="video" class="hero-art-video" :class="{ 'is-visible': layerVisible }"
          :data-scene="sceneKey || undefined" width="1040" height="680" muted playsinline preload="auto"
          disablepictureinpicture disableremoteplayback controlslist="nodownload nofullscreen noremoteplayback" draggable="false"
          @ended="onEnded" @error="dropCurrent" />
      </div>
    </div>
  </div>
</template>

<style scoped>
:global(.hero > .hero-landscape) { display: block; }
.hero-art { width: 100%; margin-inline: auto; }
.hero-art-frame { position: relative; width: 100%; aspect-ratio: 26 / 17; background: #f7f8f4; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
.hero-art-mask {
  --feather: clamp(8px, 2vw, 12px);
  position: absolute;
  inset: 0;
  mask-image:
    linear-gradient(to right, transparent, #000 var(--feather), #000 calc(100% - var(--feather)), transparent),
    linear-gradient(to bottom, transparent, #000 var(--feather), #000 calc(100% - var(--feather)), transparent);
  mask-composite: intersect;
}
.hero-art-mask > :is(img, video) {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}
/* Switched instantly: first/last frames equal the poster underneath. */
.hero-art-video { opacity: 0; }
.hero-art-video.is-visible { opacity: 1; }

/* Phone/tablet: the "explore the catalogue" link moves below the animation. */
@media (max-width: 1023.98px) {
  :global(.hero.page-container) { row-gap: 0; }
  :global(.hero > .hero-copy) { display: contents; }
  :global(.hero > .hero-landscape) { margin-top: 32px; }
  :global(.hero > .hero-copy > .hero-link) { order: 1; justify-self: start; margin-top: 24px; }
}
/* Desktop: a little larger, growing to the left and down; the 26:17 ratio is kept. */
@media (min-width: 1024px) {
  .hero-art { width: calc(100% + 48px); margin-left: -48px; transform: translateY(12px); }
}
@media (min-width: 1200px) {
  .hero-art { width: calc(100% + 88px); margin-left: -88px; transform: translateY(16px); }
}
</style>
