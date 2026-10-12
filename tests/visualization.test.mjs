import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { backingSize, containRect, createVisualization, normalizeDetail, renderFrame, RESTORE_DURATION } from '../src/data/visualization/engine.js'
import { observeVisualization } from '../src/data/visualization/environment.js'
import { compositionCrop, compositionStyle } from '../src/data/image-composition.js'
import { validateSource } from '../src/data/species-model.js'

function fakeCanvas() {
  const context = { calls: [], clearRect() {}, fillRect() {}, drawImage(...args) { this.calls.push(args) } }
  return { width: 0, height: 0, context, getContext: () => context }
}
function harness({ reduced = false, supported = true } = {}) {
  const canvas = fakeCanvas(), scratch = fakeCanvas(), images = [], frames = new Map()
  let state, id = 0, motion = reduced, size = { width: 600, height: 400 }, dpr = 1
  if (!supported) canvas.getContext = () => null
  const controller = createVisualization({ canvas, createCanvas: () => scratch,
    createImage: () => {
      const image = { naturalWidth: 1200, naturalHeight: 800, removeAttribute() { this.src = '' } }
      images.push(image); return image
    }, requestFrame: callback => { frames.set(++id, callback); return id }, cancelFrame: token => frames.delete(token),
    measure: () => size, getDpr: () => dpr, reducedMotion: () => motion, onState: value => { state = value },
  })
  return { controller, canvas, scratch, frames, images, get state() { return state },
    load(path = '/images/approved/irbis-1.webp') { controller.load(path); if (path) images.at(-1).onload() },
    tick(time = 0) { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(time)) },
    setSize(value) { size = value }, setDpr(value) { dpr = value }, setMotion(value) { motion = value },
  }
}

test('initial mode is the clear photograph; loading never draws a pixelated preview', () => {
  const h = harness(); h.load()
  assert.equal(h.state.mode, 'photo'); assert.equal(h.state.detail, 100); assert.equal(h.state.ready, true)
  assert.equal(h.frames.size, 0); assert.equal(h.canvas.context.calls.length, 0)
  assert.equal(h.images[0].src, '/images/approved/irbis-1.webp')
  assert.equal(h.controller.setDetail(0), false)
})

test('detail decreases sampled resolution; each frame samples the immutable original', () => {
  const h = harness(); h.load(); h.controller.start(); h.tick()
  const initialColumns = h.scratch.width
  h.controller.setDetail(0); h.tick()
  assert.equal(h.scratch.width, 8); assert.equal(h.scratch.height, 5)
  h.controller.setDetail(85); h.tick()
  assert.ok(h.scratch.width > initialColumns)
  assert.ok(h.scratch.context.calls.every(call => call[0] === h.images[0]))
  assert.ok(h.scratch.context.calls.every(call => call[1] === 0 && call[2] === 0 && call[3] === 1200 && call[4] === 800))
  assert.equal(h.canvas.context.imageSmoothingEnabled, false)
})

test('rapid slider inputs and resize events coalesce into one frame with the final detail', () => {
  const h = harness(); h.load(); h.controller.start()
  for (let detail = 0; detail <= 80; detail++) { h.controller.setDetail(detail); h.controller.resize() }
  assert.equal(h.frames.size, 1); h.tick()
  assert.equal(h.state.detail, 80); assert.equal(h.canvas.context.calls.length, 1)
})

test('100% detail draws the full original directly rather than the scratch canvas', () => {
  const h = harness(); h.load(); h.controller.start(); h.controller.setDetail(100); h.tick()
  assert.equal(h.canvas.context.calls.at(-1)[0], h.images[0])
  assert.equal(h.canvas.context.imageSmoothingEnabled, true)
  assert.equal(h.scratch.context.calls.length, 0)
})

test('restoration progresses monotonically, finishes at exact original clarity and can restart', () => {
  const h = harness(); h.load(); h.controller.start(); h.controller.setDetail(0); h.tick()
  assert.equal(h.controller.restore(), true); assert.equal(h.controller.restore(), false)
  h.tick(1000); const start = h.state.detail
  h.tick(1000 + RESTORE_DURATION / 2); const middle = h.state.detail
  assert.ok(middle > start && middle < 100)
  h.tick(1000 + RESTORE_DURATION)
  assert.equal(h.state.mode, 'photo'); assert.equal(h.state.detail, 100); assert.equal(h.state.restorationCount, 1)
  assert.equal(h.frames.size, 0)
  assert.equal(h.controller.start(), true); assert.equal(h.state.detail, 35)
  h.tick(); assert.equal(h.scratch.context.calls.at(-1)[0], h.images[0])
})

test('moving the slider during restoration immediately gives control back to the user', () => {
  const h = harness(); h.load(); h.controller.start(); h.controller.restore(); h.tick()
  h.controller.setDetail(12); h.tick(RESTORE_DURATION * 2)
  assert.equal(h.state.mode, 'active'); assert.equal(h.state.detail, 12); assert.equal(h.frames.size, 0)
})

test('reduced motion restores instantly, including when the preference changes mid-animation', () => {
  const h = harness({ reduced: true }); h.load(); h.controller.start(); h.controller.restore()
  assert.equal(h.state.mode, 'photo'); assert.equal(h.state.detail, 100); assert.equal(h.frames.size, 0)
  h.setMotion(false); h.controller.start(); h.controller.restore(); h.tick(0)
  h.setMotion(true); h.controller.motionChanged()
  assert.equal(h.state.mode, 'photo'); assert.equal(h.frames.size, 0); assert.equal(h.state.restorationCount, 2)
})

test('switching species cancels restoration, releases the old image and rejects its stale callbacks', () => {
  const h = harness(); h.load(); const old = h.images[0], stale = old.onload
  h.controller.start(); h.controller.restore(); h.controller.load('/images/approved/manul-1.webp')
  assert.equal(h.frames.size, 0); assert.equal(old.onload, null); assert.equal(old.onerror, null); assert.equal(old.src, '')
  assert.equal(h.state.mode, 'photo'); assert.equal(h.state.detail, 100); assert.equal(h.state.ready, false)
  stale(); assert.equal(h.state.ready, false)
  const image = h.images.at(-1); image.naturalWidth = 1200; image.naturalHeight = 869; image.onload()
  h.controller.start(); h.tick(); assert.equal(h.scratch.context.calls.at(-1)[0], image)
})

test('missing, broken and undecoded images disable the visualization without drawing invented imagery', () => {
  const h = harness(); h.load(null)
  assert.equal(h.images.length, 0); assert.equal(h.state.loading, false); assert.equal(h.controller.start(), false)
  h.controller.load('/missing.webp'); h.images[0].onerror()
  assert.match(h.state.error, /Фотография недоступна/); assert.equal(h.controller.start(), false)
  h.controller.load('/broken.webp'); h.images[1].naturalWidth = 0; h.images[1].onload()
  assert.equal(h.state.ready, false); assert.equal(h.canvas.context.calls.length, 0)
})

test('unsupported or failed Canvas gracefully returns to the ordinary photograph', () => {
  const unsupported = harness({ supported: false }); unsupported.load()
  assert.equal(unsupported.controller.start(), false); assert.match(unsupported.state.error, /обычную фотографию/)
  const h = harness(); h.load(); h.controller.start()
  h.canvas.context.drawImage = () => { throw new Error('GPU context lost') }; h.tick()
  assert.equal(h.state.mode, 'photo'); assert.equal(h.state.ready, false); assert.equal(h.frames.size, 0)
})

test('resizing and DPR changes redraw at physical resolution; temporary zero size can recover', () => {
  const h = harness(); h.load(); h.controller.start(); h.tick()
  assert.equal(h.canvas.width, 600); assert.equal(h.canvas.height, 400)
  h.setDpr(2); h.controller.resize(); h.tick()
  assert.equal(h.canvas.width, 1200); assert.equal(h.canvas.height, 800)
  h.setSize({ width: 0, height: 0 }); h.controller.resize(); h.tick()
  assert.equal(h.state.ready, true)
  h.setSize({ width: 280, height: 420 }); h.controller.resize(); h.tick()
  assert.equal(h.canvas.width, 560); assert.equal(h.canvas.height, 840)
})

test('dispose cancels RAF, detaches image handlers, clears canvas backing stores and rejects late events', () => {
  const h = harness(); h.load(); const late = h.images[0].onload
  h.controller.start(); h.controller.restore(); h.controller.dispose()
  assert.equal(h.frames.size, 0); assert.equal(h.images[0].onload, null); assert.equal(h.images[0].onerror, null)
  assert.equal(h.canvas.width + h.canvas.height + h.scratch.width + h.scratch.height, 0)
  late(); h.controller.resize(); h.controller.load('/new.webp')
  assert.equal(h.images.length, 1); assert.equal(h.controller.start(), false); assert.equal(h.controller.restore(), false)
})

test('portrait and landscape photos retain the full frame and aspect ratio at any viewport', () => {
  assert.deepEqual(containRect(800, 1200, 600, 400), { x: 166.66666666666669, y: 0, width: 266.66666666666663, height: 400 })
  assert.deepEqual(containRect(1200, 800, 300, 500), { x: 0, y: 150, width: 300, height: 200 })
  const canvas = fakeCanvas(), scratch = fakeCanvas(), source = { naturalWidth: 800, naturalHeight: 1200 }
  assert.equal(renderFrame(canvas, scratch, source, 0, { width: 280, height: 420 }, 2), true)
  assert.equal(scratch.width, 8); assert.equal(scratch.height, 12)
  assert.deepEqual(scratch.context.calls[0].slice(1, 5), [0, 0, 800, 1200])
})

test('backing stores have a bounded size, and malformed detail/size inputs are safe', () => {
  assert.deepEqual(backingSize(300, 200, 2), { width: 600, height: 400 })
  const huge = backingSize(10000, 8000, 10)
  assert.ok(Math.max(huge.width, huge.height) <= 2400); assert.ok(huge.width * huge.height < 4010000)
  assert.equal(backingSize(0, 10), null); assert.equal(containRect(10, 0, 20, 20), null)
  assert.equal(renderFrame(fakeCanvas(), fakeCanvas(), {}, 20, null, 1), false)
  assert.equal(normalizeDetail(-100), 0); assert.equal(normalizeDetail('25'), 25)
  assert.equal(normalizeDetail(999), 100); assert.equal(normalizeDetail(NaN), 100)
})

function fakeEnvironment(legacy = false) {
  const queries = [], windowListeners = new Map(), observers = []
  const view = { devicePixelRatio: 1, addEventListener: (key, fn) => windowListeners.set(key, fn),
    removeEventListener: key => windowListeners.delete(key), matchMedia: text => {
      const listeners = new Set(), query = { text, matches: false, listeners, fire() { [...listeners].forEach(fn => fn()) } }
      if (legacy) { query.addListener = fn => listeners.add(fn); query.removeListener = fn => listeners.delete(fn) }
      else { query.addEventListener = (_, fn) => listeners.add(fn); query.removeEventListener = (_, fn) => listeners.delete(fn) }
      queries.push(query); return query
    } }
  class Observer {
    constructor(callback) { this.callback = callback; observers.push(this) }
    observe(element) { this.element = element }
    disconnect() { this.disconnected = true }
  }
  return { view, Observer, queries, windowListeners, observers }
}

test('resize, reduced-motion and DPR observers update and all listeners are removed on close', () => {
  const f = fakeEnvironment(), element = {}, events = []
  const env = observeVisualization(element, { ...f, resize: () => events.push('resize'), motionChanged: () => events.push('motion') })
  assert.equal(f.observers[0].element, element)
  f.queries[0].matches = true; f.queries[0].fire(); assert.equal(env.reducedMotion(), true)
  f.view.devicePixelRatio = 2; f.queries[1].fire()
  assert.equal(f.queries[1].listeners.size, 0); assert.match(f.queries[2].text, /2dppx/)
  f.windowListeners.get('resize')(); f.observers[0].callback()
  assert.deepEqual(events, ['motion', 'resize', 'resize', 'resize'])
  env.dispose(); assert.equal(f.windowListeners.size, 0); assert.equal(f.observers[0].disconnected, true)
  assert.ok(f.queries.every(query => query.listeners.size === 0))
})

test('legacy media-query listeners and absence of ResizeObserver have a working cleanup', () => {
  const f = fakeEnvironment(true)
  const env = observeVisualization({}, { view: f.view, resize() {}, motionChanged() {} })
  env.dispose(); assert.ok(f.queries.every(query => query.listeners.size === 0)); assert.equal(f.windowListeners.size, 0)
})

const source = JSON.parse(await readFile(new URL('../data/species.source.json', import.meta.url), 'utf8'))
test('individual compositions are optional, bounded and validated before data generation', () => {
  assert.deepEqual(validateSource(source), [])
  for (const invalid of [null, { x: 2, y: .5, zoom: 1 }, { x: .5, y: -.2, zoom: 1 },
    { x: .5, y: .5, zoom: 2 }, { x: .5, y: .5 }, { x: .5, y: .5, zoom: 1, surprise: 4 }]) {
    const fixture = structuredClone(source); fixture.catalog[0].images[0].composition = invalid
    assert.match(validateSource(fixture).join('\n'), /images\[0\]\.composition/)
  }
  assert.deepEqual(compositionStyle(null), { objectPosition: '50% 50%', transformOrigin: '50% 50%', transform: 'scale(1)' })
  assert.equal(compositionStyle(source.catalog[0].images[0]).transform, 'scale(1.45)')
})

test('selected crops preserve the inspected faces, flower heads and foreground foliage', () => {
  // Bounds measured visually in the unchanged originals, in source pixels.
  const subjects = { irbis: [385, 420, 790, 590], manul: [355, 230, 968, 700],
    'greigs-tulip': [186, 388, 697, 638], 'sievers-apple': [150, 450, 760, 930] }
  for (const [id, bounds] of Object.entries(subjects)) {
    const photo = source.catalog.find(species => species.id === id).images[0]
    const crop = compositionCrop(photo.width, photo.height, 4 / 3, photo.composition)
    assert.ok(crop.x <= bounds[0] && crop.y <= bounds[1], `${id}: subject start is visible`)
    assert.ok(crop.x + crop.width >= bounds[2] && crop.y + crop.height >= bounds[3], `${id}: subject end is visible`)
  }
  assert.equal(source.catalog.filter(species => species.images[0].composition).length, 4)
  for (const species of source.catalog.filter(species => species.group === 'birds')) assert.equal(species.images[0].composition, undefined)
})
