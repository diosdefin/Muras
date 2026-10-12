import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { ref, nextTick } from 'vue'
import { useLesson } from '../src/composables/useLesson.js'
import { createLessonFullscreen } from '../src/composables/useLessonFullscreen.js'
import { firstSentence, lessonKey, lessonTabTarget, sourceNumber, sourcesFor } from '../src/data/lesson.js'
import { formatPopulation, speciesPhoto } from '../src/data/presentation.js'

const catalog = JSON.parse(await readFile(new URL('../public/data/species.json', import.meta.url), 'utf8'))

test('lesson visits all nine existing species once and wraps in both directions without changing data', () => {
  const before = JSON.stringify(catalog)
  const lesson = useLesson(ref(catalog))
  const seen = []
  for (let n = 0; n < catalog.length; n++) { seen.push(lesson.current.value.id); lesson.next() }
  assert.deepEqual(seen, catalog.map(species => species.id))
  assert.equal(lesson.index.value, 0)
  lesson.previous()
  assert.equal(lesson.current.value.id, catalog.at(-1).id)
  lesson.select(catalog[3].id)
  assert.equal(lesson.index.value, 3)
  lesson.select('missing')
  assert.equal(lesson.index.value, 3)
  assert.equal(JSON.stringify(catalog), before)
})

test('selection handles an empty or updated catalog without stale records', async () => {
  const records = ref([])
  const lesson = useLesson(records)
  assert.equal(lesson.current.value, null)
  lesson.next(); lesson.previous(); lesson.select('missing')
  records.value = catalog
  await nextTick()
  lesson.select(catalog[3].id)
  records.value = [catalog[0]]
  await nextTick()
  assert.equal(lesson.current.value.id, catalog[0].id)
  lesson.next()
  assert.equal(lesson.index.value, 0)
  records.value = []
  await nextTick()
  assert.equal(lesson.current.value, null)
})

test('brief information is a verbatim sourced excerpt, not a new scientific claim', () => {
  assert.equal(firstSentence({ ru: 'Первое предложение. Второе предложение.' }), 'Первое предложение.')
  assert.equal(firstSentence({ ru: null, en: null, ky: null }), null)
  assert.equal(firstSentence(null), null)
  for (const species of catalog) {
    const excerpt = firstSentence(species.habitat?.description)
    assert.ok(species.habitat.description.ru.startsWith(excerpt))
    assert.ok(species.habitat.sourceIds.length)
    assert.equal(formatPopulation(species.population), 'Численность неизвестна')
    assert.equal(species.verified, false)
    assert.ok(speciesPhoto(species).licenseVerified)
  }
})

test('reference numbers retain original source order and exclude unknown IDs', () => {
  assert.equal(sourceNumber(catalog[0], catalog[0].sources[0].id), 1)
  assert.equal(sourceNumber(catalog[0], 'missing'), null)
  assert.deepEqual(sourcesFor(catalog[0], ['missing']), [])
  assert.deepEqual(sourcesFor(catalog[0], [catalog[0].sources[0].id]), [catalog[0].sources[0]])
})

test('lesson keyboard controls work only inside the presentation and do not intercept interactive elements or modifiers', () => {
  const root = { contains: target => target.inside === true }
  const target = { inside: true, closest: () => null }
  assert.equal(lessonKey({ key: 'ArrowRight', target }, root), 'next')
  assert.equal(lessonKey({ key: 'ArrowLeft', target }, root), 'previous')
  assert.equal(lessonKey({ key: 'Escape', target }, root), 'exit')
  assert.equal(lessonKey({ key: 'Enter', target }, root), null)
  for (const field of ['defaultPrevented', 'isComposing', 'altKey', 'ctrlKey', 'metaKey', 'shiftKey']) {
    assert.equal(lessonKey({ key: 'ArrowRight', target, [field]: true }, root), null)
  }
  assert.equal(lessonKey({ key: 'ArrowRight', target: { inside: false } }, root), null)
  for (const key of ['ArrowLeft', 'ArrowRight', 'Escape']) {
    assert.equal(lessonKey({ key, target: { inside: true, closest: () => ({ tagName: 'INPUT' }) } }, root), null)
  }
})

test('fullscreen Tab boundaries keep focus on visible lesson controls while ordinary Tab stays native', () => {
  const first = {}, middle = {}, last = {}, outside = {}
  const elements = [first, middle, last]
  const root = { contains: target => elements.includes(target) }
  assert.equal(lessonTabTarget({ key: 'Tab', shiftKey: true }, root, first, elements), last)
  assert.equal(lessonTabTarget({ key: 'Tab' }, root, last, elements), first)
  assert.equal(lessonTabTarget({ key: 'Tab' }, root, middle, elements), null)
  assert.equal(lessonTabTarget({ key: 'Tab' }, root, outside, elements), first)
  assert.equal(lessonTabTarget({ key: 'Tab', shiftKey: true }, root, root, elements), last)
  assert.equal(lessonTabTarget({ key: 'Tab' }, root, root, []), root)
  assert.equal(lessonTabTarget({ key: 'ArrowRight' }, root, first, elements), null)
})

function fullscreenFixture() {
  const listeners = new Set()
  const ownerDocument = {
    fullscreenEnabled: true, fullscreenElement: null,
    addEventListener: (type, fn) => listeners.add(fn),
    removeEventListener: (type, fn) => listeners.delete(fn),
    async exitFullscreen() { ownerDocument.fullscreenElement = null; listeners.forEach(fn => fn()) },
  }
  let requestCalls = 0
  const element = { async requestFullscreen() { requestCalls++; ownerDocument.fullscreenElement = element; listeners.forEach(fn => fn()) } }
  let exits = 0, focuses = 0
  const controller = createLessonFullscreen(() => element, { ownerDocument, onExternalExit: () => exits++, onFocus: () => focuses++ })
  return { ownerDocument, element, controller, listeners, calls: () => ({ requestCalls, exits, focuses }) }
}

test('fullscreen is requested only by explicit action; toggle exits without leaving the lesson', async () => {
  const fixture = fullscreenFixture()
  fixture.controller.connect(); fixture.controller.connect()
  assert.equal(fixture.calls().requestCalls, 0)
  assert.equal(fixture.listeners.size, 1)
  await fixture.controller.toggle()
  assert.equal(fixture.controller.isFullscreen.value, true)
  assert.equal(fixture.calls().requestCalls, 1)
  await fixture.controller.toggle()
  assert.equal(fixture.controller.isFullscreen.value, false)
  assert.equal(fixture.calls().exits, 0)
  fixture.controller.dispose()
  assert.equal(fixture.listeners.size, 0)
})

test('external fullscreen exit (including browser Escape) leaves presentation exactly once', async () => {
  const fixture = fullscreenFixture()
  fixture.controller.connect()
  await fixture.controller.enter()
  await fixture.ownerDocument.exitFullscreen()
  fixture.listeners.forEach(fn => fn())
  assert.equal(fixture.calls().exits, 1)
  assert.equal(fixture.controller.isFullscreen.value, false)
})

test('fullscreen fallback handles unsupported, disabled and rejected APIs without breaking lesson', async () => {
  for (const ownerDocument of [null, { fullscreenEnabled: false }]) {
    const controller = createLessonFullscreen(() => ({}), { ownerDocument })
    await controller.enter()
    assert.match(controller.message.value, /недоступен/)
    assert.equal(controller.isFullscreen.value, false)
    await controller.exit()
  }
  const fixture = fullscreenFixture()
  fixture.element.requestFullscreen = async () => { throw new Error('NotAllowed') }
  await fixture.controller.enter()
  assert.match(fixture.controller.message.value, /не разрешил/)
  assert.equal(fixture.controller.isFullscreen.value, false)
})

test('failed fullscreen exit preserves state and allows native external exit afterwards', async () => {
  const fixture = fullscreenFixture()
  fixture.controller.connect()
  await fixture.controller.enter()
  fixture.ownerDocument.exitFullscreen = async () => { throw new Error('Denied') }
  assert.equal(await fixture.controller.exit(), false)
  assert.match(fixture.controller.message.value, /Escape/)
  assert.equal(fixture.controller.isFullscreen.value, true)
  fixture.ownerDocument.fullscreenElement = null
  fixture.listeners.forEach(fn => fn())
  assert.equal(fixture.calls().exits, 1)
})

test('controller never exits a fullscreen element owned by another feature', async () => {
  const fixture = fullscreenFixture()
  fixture.ownerDocument.fullscreenElement = {}
  let exited = false
  fixture.ownerDocument.exitFullscreen = async () => { exited = true }
  await fixture.controller.exit()
  assert.equal(exited, false)
})

test('rapid navigation waits for a pending fullscreen request and duplicate entry is ignored', async () => {
  const fixture = fullscreenFixture()
  fixture.controller.connect()
  let finish
  let requests = 0
  fixture.element.requestFullscreen = () => {
    requests++
    return new Promise(resolve => { finish = () => {
      fixture.ownerDocument.fullscreenElement = fixture.element
      fixture.listeners.forEach(fn => fn())
      resolve()
    } })
  }
  const entry = fixture.controller.enter()
  await fixture.controller.enter()
  assert.equal(requests, 1)
  const exit = fixture.controller.exit()
  finish()
  await entry
  assert.equal(await exit, true)
  assert.equal(fixture.controller.isFullscreen.value, false)
  assert.equal(fixture.ownerDocument.fullscreenElement, null)
  assert.equal(fixture.calls().exits, 0)
})
