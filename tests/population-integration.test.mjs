import test from 'node:test'
import assert from 'node:assert/strict'
import { createRenderer, h, ref } from 'vue'
import { useImageVisualization } from '../src/composables/useImageVisualization.js'
import { loadSpeciesCatalog } from '../src/data/catalog-repository.js'
import { observeVisualization } from '../src/data/visualization/environment.js'
import { readFile } from 'node:fs/promises'

test('Vue integration measures the visible image frame when the initial Canvas is display:none', () => {
  const previous = Object.fromEntries(['window', 'document', 'Image'].map(key => [key, globalThis[key]]))
  const frames = new Map(), images = []; let api, id = 0, app
  const context = { clearRect() {}, drawImage() {} }
  const canvas = { width: 0, height: 0, getContext: () => context, getBoundingClientRect: () => ({ width: 0, height: 0 }) }
  const container = { getBoundingClientRect: () => ({ width: 600, height: 450 }) }
  try {
    globalThis.document = { createElement: () => ({ ...canvas }) }
    globalThis.Image = class { constructor() { this.naturalWidth = 1200; this.naturalHeight = 800; images.push(this) } removeAttribute() {} }
    globalThis.window = { devicePixelRatio: 1, requestAnimationFrame: fn => { frames.set(++id, fn); return id }, cancelAnimationFrame: token => frames.delete(token),
      addEventListener() {}, removeEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) }
    const renderer = createRenderer({ createElement: tag => ({ tag }), insert() {}, remove() {}, patchProp() {}, setElementText() {}, createText: text => ({ text }), createComment: text => ({ text }), setText() {}, setComment() {}, parentNode: () => null, nextSibling: () => null })
    app = renderer.createApp({ setup() { api = useImageVisualization(ref(canvas), ref(container), ref({ path: '/test-only.webp', type: 'exact' })); return () => h('div') } })
    app.mount({}); assert.equal(images.length,0); assert.equal(frames.size,0); api.start(); images[0].onload()
    const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn(0))
    assert.equal(canvas.width, 600); assert.equal(canvas.height, 450); assert.equal(api.state.value.mode, 'animating')
    app.unmount(); app = null
    assert.equal(frames.size, 0); assert.equal(canvas.width + canvas.height, 0); assert.equal(images[0].onload, null)
  } finally {
    app?.unmount()
    for (const [key, value] of Object.entries(previous)) { if (value === undefined) delete globalThis[key]; else globalThis[key] = value }
  }
})
test('catalog provider accepts valid local or API records and forwards URL/abort signal', async () => {
  const records = JSON.parse(await readFile(new URL('../public/data/species.json', import.meta.url), 'utf8'))
  const signal = new AbortController().signal; let requested
  const result = await loadSpeciesCatalog({ url: '/future-api/species/', signal, fetcher: async (url, options) => { requested = { url, options }; return { ok: true, json: async () => records } } })
  assert.equal(result, records); assert.equal(requested.url, '/future-api/species/'); assert.equal(requested.options.signal, signal)
})
test('provider rejects transport errors and invalid scientific records before the interface consumes them', async () => {
  await assert.rejects(loadSpeciesCatalog({ fetcher: async () => ({ ok: false, status: 503 }) }), /503/)
  await assert.rejects(loadSpeciesCatalog({ fetcher: async () => ({ ok: true, json: async () => [{ population: { type: 'unknown', value: 0 } }] }) }), /Некорректные данные каталога/)
})
test('viewport and document visibility listeners pause work and are removed with observers', () => {
  const listeners = new Map(), docListeners = new Map(), observers = [], states = []
  const view = { document: { hidden: false, addEventListener: (event, fn) => docListeners.set(event, fn), removeEventListener: event => docListeners.delete(event) },
    addEventListener: (event, fn) => listeners.set(event, fn), removeEventListener: event => listeners.delete(event), matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) }
  class Observer { constructor(fn) { this.fn = fn; observers.push(this) } observe() {} disconnect() { this.closed = true } }
  const env = observeVisualization({}, { view, Observer, VisibilityObserver: Observer, resize() {}, motionChanged() {}, visibilityChanged: value => states.push(value) })
  observers[0].fn([{ isIntersecting: false }]); observers[0].fn([{ isIntersecting: true }])
  view.document.hidden = true; docListeners.get('visibilitychange')()
  assert.deepEqual(states, [true, false, true, false])
  env.dispose(); assert.equal(docListeners.size + listeners.size, 0); assert.ok(observers.every(o => o.closed))
})
