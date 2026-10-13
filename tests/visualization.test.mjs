import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { observeVisualization } from '../src/data/visualization/environment.js'
import { compositionCrop, compositionStyle } from '../src/data/image-composition.js'
import { validateSource } from '../src/data/species-model.js'

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
    { x: .5, y: .5, zoom: 3.1 }, { x: .5, y: .5 }, { x: .5, y: .5, zoom: 1, surprise: 4 }]) {
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
