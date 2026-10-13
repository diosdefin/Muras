import test from 'node:test'
import assert from 'node:assert/strict'
import { ANIMATION_DURATION, AUTO_DELAY, backingSize, createVisualization, renderFrame } from '../src/data/visualization/engine.js'
import { compositionCrop } from '../src/data/image-composition.js'

function fakeCanvas() {
  const context = { filter: 'none', calls: [], filters: [], clearRect() {}, drawImage(...args) { this.calls.push(args); this.filters.push(this.filter) } }
  return { width: 0, height: 0, context, getContext: () => context }
}
function harness({ reduced = false, supported = true } = {}) {
  const canvas = fakeCanvas(), scratch = fakeCanvas(), images = [], frames = new Map(), timers = new Map()
  let state, id = 0, motion = reduced, size = { width: 600, height: 450 }, dpr = 1
  if (!supported) canvas.getContext = () => null
  const controller = createVisualization({ canvas, createCanvas: () => scratch,
    createImage: () => { const image = { naturalWidth: 1200, naturalHeight: 800, removeAttribute() { this.src = '' } }; images.push(image); return image },
    requestFrame: callback => { frames.set(++id, callback); return id }, cancelFrame: token => frames.delete(token),
    setTimer: (callback, delay) => { timers.set(++id, { callback, delay }); return id }, clearTimer: token => timers.delete(token),
    measure: () => size, getDpr: () => dpr, reducedMotion: () => motion, onState: value => { state = value },
  })
  return { controller, canvas, scratch, frames, timers, images, get state() { return state },
    load(path = '/images/approved/irbis-1.webp', options) { controller.load(path, options); if (path) images.at(-1).onload() },
    pause() { const callbacks = [...timers.values()]; timers.clear(); callbacks.forEach(item => item.callback()) },
    tick(time = 0) { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(time)) },
    setSize(value) { size = value }, setDpr(value) { dpr = value }, setMotion(value) { motion = value },
  }
}
test('clear photo appears first; automatic transition waits for the short pause', () => {
  const h = harness(); h.load()
  assert.equal(h.state.mode, 'photo'); assert.equal(h.state.amount, 0)
  assert.equal(h.canvas.context.calls.length, 0); assert.equal(h.frames.size, 0)
  assert.equal(h.timers.size, 1); assert.equal([...h.timers.values()][0].delay, AUTO_DELAY)
  h.pause(); h.tick(0); h.tick(ANIMATION_DURATION)
  assert.equal(h.state.mode, 'active'); assert.equal(h.state.amount, 1); assert.equal(h.frames.size, 0)
})
test('unknown removes colour without pixelation or reducing sampled resolution', () => {
  const h = harness(); h.load(); h.pause(); h.tick(0); h.tick(450); h.tick(900)
  assert.deepEqual(h.canvas.context.filters, ['grayscale(0)', 'grayscale(0.5)', 'grayscale(1)'])
  assert.equal(h.scratch.context.calls.length, 0)
  assert.ok(h.canvas.context.calls.every(call => call[0] === h.images[0]))
  assert.equal(h.canvas.context.imageSmoothingEnabled, true)
})
test('browsers without Canvas filter expose a CSS grayscale fallback without losing resolution', () => {
  const h = harness(); delete h.canvas.context.filter; h.load(); h.pause(); h.tick(0); h.tick(900)
  assert.equal(h.state.grayscaleFallback, true); assert.equal(h.state.amount, 1)
  assert.equal(h.scratch.context.calls.length, 0); assert.equal(h.canvas.context.imageSmoothingEnabled, true)
  assert.equal(h.canvas.context.filter, undefined)
})
test('exact and approximate share symbolic pixelation independent of any count', () => {
  for (const type of ['exact', 'approximate']) {
    const h = harness(); h.load(undefined, { type, value: 3 }); h.pause(); h.tick(0); h.tick(450); const middle = h.scratch.width; h.tick(900)
    assert.equal(h.state.effect, type); assert.equal(h.scratch.width, 24); assert.ok(middle > 24)
    assert.ok(h.scratch.context.calls.every(call => call[0] === h.images[0]))
    assert.equal(h.canvas.context.imageSmoothingEnabled, false)
  }
})
test('clear → visualization → clear can repeat without loss of original detail', () => {
  const h = harness(); h.load(undefined, { type: 'exact' }); h.pause(); h.tick(0); h.tick(900)
  h.controller.restore(); h.tick(1000); h.tick(1450); assert.equal(h.state.amount, .5); h.tick(1900)
  assert.equal(h.state.mode, 'photo'); assert.equal(h.state.amount, 0); assert.equal(h.frames.size, 0)
  assert.equal(h.canvas.context.calls.at(-1)[0], h.images[0]); assert.equal(h.canvas.context.imageSmoothingEnabled, true)
  h.controller.start(); h.tick(2000); h.tick(2900); assert.equal(h.state.amount, 1)
})
test('manual clarity cancels pending auto-start and can interrupt an in-flight transition', () => {
  const h = harness(); h.load(); h.controller.restore(); assert.equal(h.timers.size, 0)
  h.controller.start(); h.tick(0); h.tick(450); h.controller.restore(); h.tick(500); h.tick(1400)
  assert.equal(h.state.mode, 'photo'); assert.equal(h.frames.size + h.timers.size, 0)
})
test('reduced motion changes instantly; preference change finishes current transition', () => {
  const h = harness({ reduced: true }); h.load(); h.pause()
  assert.equal(h.state.mode, 'active'); assert.equal(h.frames.size, 0)
  h.controller.restore(); assert.equal(h.state.mode, 'photo')
  h.setMotion(false); h.controller.start(); h.tick(0); h.tick(100); h.setMotion(true); h.controller.motionChanged()
  assert.equal(h.state.amount, 1); assert.equal(h.frames.size, 0)
})
test('switch species cancels RAF/timer, releases source, and ignores stale load/auto callbacks', () => {
  const h = harness(); h.load(); const old = h.images[0], lateLoad = old.onload, lateAuto = [...h.timers.values()][0].callback
  h.controller.load('/images/approved/manul-1.webp', { type: 'approximate' })
  lateLoad(); lateAuto(); assert.equal(h.state.ready, false); assert.equal(h.frames.size + h.timers.size, 0)
  assert.equal(old.src, ''); assert.equal(old.onload, null); assert.equal(old.onerror, null)
  h.images[1].onload(); h.pause(); h.tick(0); h.controller.load('/new.webp')
  assert.equal(h.frames.size, 0); assert.equal(h.state.mode, 'photo'); assert.equal(h.state.effect, 'unknown')
})
test('reopening the same photograph resets to clear and schedules a fresh demonstration', () => {
  const h = harness(); h.load(); h.pause(); h.tick(0); h.tick(900); h.load()
  assert.equal(h.state.mode, 'photo'); assert.equal(h.state.amount, 0); assert.equal(h.timers.size, 1)
  assert.equal(h.images.length, 2)
})
test('no image, broken or undecoded images and unsupported Canvas keep a safe photo fallback', () => {
  const h = harness(); h.load(null); assert.equal(h.controller.start(), false); assert.equal(h.images.length, 0)
  h.controller.load('/missing.webp'); h.images[0].onerror(); assert.match(h.state.error, /Фотография недоступна/)
  h.controller.load('/bad.webp'); h.images[1].naturalWidth = 0; h.images[1].onload(); assert.equal(h.state.ready, false)
  const unsupported = harness({ supported: false }); unsupported.load(); assert.equal(unsupported.timers.size, 0)
  const broken = harness(); broken.load(); broken.canvas.context.drawImage = () => { throw Error('context lost') }; broken.pause(); broken.tick()
  assert.equal(broken.state.mode, 'photo'); assert.equal(broken.state.ready, false); assert.equal(broken.frames.size, 0)
})
test('offscreen/hidden animation pauses without accumulating RAF and resumes on visibility', () => {
  const h = harness(); h.controller.visibilityChanged(false); h.load(); assert.equal(h.timers.size, 0)
  h.controller.visibilityChanged(true); h.pause(); h.tick(0); h.tick(450); h.controller.visibilityChanged(false)
  const amount = h.state.amount; assert.equal(h.frames.size, 0)
  h.controller.resize(); assert.equal(h.frames.size, 0)
  h.controller.visibilityChanged(true); h.tick(5000); assert.equal(h.state.amount, amount); h.tick(5900)
  assert.equal(h.state.mode, 'active'); assert.equal(h.frames.size, 0)
})
test('resize storms coalesce; DPR and backing resolution are bounded', () => {
  const h = harness(); h.load(); h.pause(); h.tick(0); h.tick(900)
  h.setDpr(8); for (let i = 0; i < 100; i++) h.controller.resize()
  assert.equal(h.frames.size, 1); h.tick(); assert.equal(h.canvas.width, 1200); assert.equal(h.canvas.height, 900)
  const huge = backingSize(10000, 8000, 10)
  assert.ok(Math.max(huge.width, huge.height) <= 1800); assert.ok(huge.width * huge.height <= 2002000)
  assert.equal(backingSize(0, 10), null)
})
test('zero-size layouts stop scheduling and resume after a resize', () => {
  const h = harness(); h.load(); h.setSize({ width: 0, height: 0 }); h.pause(); h.tick()
  assert.equal(h.frames.size, 0); assert.equal(h.state.ready, true)
  h.setSize({ width: 300, height: 225 }); h.controller.resize(); h.tick(0); h.tick(900)
  assert.equal(h.state.mode, 'active')
})
test('dispose releases all buffers, timers, listeners on images and rejects late work', () => {
  const h = harness(); h.load(); const late = h.images[0].onload, auto = [...h.timers.values()][0].callback
  h.controller.start(); h.controller.dispose(); late(); auto(); h.controller.resize(); h.controller.load('/new.webp')
  assert.equal(h.frames.size + h.timers.size, 0); assert.equal(h.images.length, 1)
  assert.equal(h.images[0].onload, null); assert.equal(h.canvas.width + h.canvas.height + h.scratch.width + h.scratch.height, 0)
  assert.equal(h.controller.start(), false)
})
test('clear and pixelated frames use the exact CSS cover/position/zoom source crop', () => {
  for (const dimensions of [[1200, 800], [800, 1200], [900, 1100]]) {
    const canvas = fakeCanvas(), scratch = fakeCanvas(), source = { naturalWidth: dimensions[0], naturalHeight: dimensions[1] }
    const composition = { x: .3, y: .65, zoom: 1.45 }, size = { width: 320, height: 240 }
    const crop = compositionCrop(...dimensions, 4 / 3, composition), bounds = [crop.x, crop.y, crop.width, crop.height]
    renderFrame(canvas, scratch, source, 0, size, 2, { composition, effect: 'exact' })
    assert.deepEqual(canvas.context.calls[0].slice(1, 5), bounds)
    renderFrame(canvas, scratch, source, 1, size, 2, { composition, effect: 'exact' })
    assert.deepEqual(scratch.context.calls[0].slice(1, 5), bounds)
    renderFrame(canvas, scratch, source, 1, size, 2, { composition, effect: 'unknown' })
    assert.deepEqual(canvas.context.calls.at(-1).slice(1, 5), bounds)
  }
})
