import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { preview } from 'vite'

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const output = resolve(process.env.HERO_QA_DIR || '.generated/hero-animations')
await mkdir(output, { recursive: true })
const { headers } = JSON.parse(await readFile('vercel.json', 'utf8'))
const policy = headers.find(rule => rule.source === '/assets/hero-:file').headers[0].value
// Apply the production cache policy in isolated preview so Chrome can be measured
// without publishing. Vite preview itself does not interpret vercel.json.
const mediaRequests = new Map()
const server = await preview({
  plugins: [{ name: 'count-hero-origin-requests', configurePreviewServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (/^\/assets\/hero-.*\.mp4$/.test(req.url)) mediaRequests.set(req.url, (mediaRequests.get(req.url) || 0) + 1)
      next()
    })
  } }],
  preview: { host: '127.0.0.1', port: 5189, strictPort: true, headers: { 'Cache-Control': policy } },
})
let browser
const base = 'http://127.0.0.1:5189'
const frameSelector = '.hero-art-frame'
const readySelector = '.hero-art-video.is-visible'
const scenes = ['argali', 'eagle', 'fritillary', 'snow-leopard']
const durations = { argali: 20.8, eagle: 22, fritillary: 22.4, 'snow-leopard': 19 }
const report = { desktop: [], gapsMs: [], viewports: [], firstScenes: [], errors: [] }
async function ready(page) {
  try {
    await page.locator(readySelector).waitFor({ timeout: 15000 })
  } catch (error) {
    const state = await page.evaluate(() => {
      const frame = document.querySelector('.hero-art-frame')
      const video = frame?.querySelector('video')
      return { phase: frame?.dataset.phase, top: frame?.getBoundingClientRect().top, hidden: document.hidden,
        video: video && [video.dataset.scene, video.currentTime, video.readyState, video.paused, video.error?.code],
        trace: window.heroTrace }
    })
    console.error(JSON.stringify(state))
    throw error
  }
}
const gap = page => page.waitForFunction(() => {
  const frame = document.querySelector('.hero-art-frame')
  // The landscape poster stays; only the video layer is switched off.
  return frame?.dataset.phase === 'gap' && frame.querySelector('img') && !frame.querySelector('video.is-visible')
})
const tab = (page, hidden) => page.evaluate(value => {
  window.heroHidden = value
  document.dispatchEvent(new Event('visibilitychange'))
}, hidden)
const scroll = (page, down) => page.evaluate(value => window.scrollTo({
  top: value ? document.body.scrollHeight : 0, behavior: 'instant',
}), down)

try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  page.on('pageerror', error => report.errors.push(error.message))
  await page.addInitScript(() => {
    window.heroTrace = { phases: [], ended: [], observers: 0, listeners: 0 }
    const Observer = window.IntersectionObserver
    window.IntersectionObserver = class extends Observer {
      observe(node) {
        if (node.matches('.hero-art-frame')) window.heroTrace.observers++
        return super.observe(node)
      }
    }
    const listen = document.addEventListener
    document.addEventListener = function (type, ...args) {
      if (type === 'visibilitychange') window.heroTrace.listeners++
      return listen.call(this, type, ...args)
    }
    // Speed up actual decoding without synthesizing ended or shortening the gap.
    listen.call(document, 'loadedmetadata', event => {
      if (event.target.matches?.('.hero-art-video')) event.target.playbackRate = 8
    }, true)
    listen.call(document, 'ended', event => {
      if (event.target.matches?.('.hero-art-video')) {
        const video = event.target
        window.heroTrace.ended.push([video.dataset.scene, video.currentTime, video.duration])
      }
    }, true)
    const find = new MutationObserver(() => {
      const frame = document.querySelector('.hero-art-frame')
      if (!frame) return
      const record = () => {
        const phase = frame.dataset.phase
        const list = window.heroTrace.phases
        if (list.at(-1)?.phase !== phase) list.push({ phase, time: performance.now() })
        if (frame.querySelectorAll('video').length > 1) window.heroTrace.overlap = true
      }
      find.disconnect()
      new MutationObserver(record).observe(frame, { attributes: true, childList: true, subtree: true })
      record()
    })
    find.observe(document, { childList: true, subtree: true })
    const nativeHidden = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden').get
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => window.heroHidden || nativeHidden.call(document) })
  })
  const cdp = await context.newCDPSession(page)
  await cdp.send('Network.enable')
  const media = new Map()
  cdp.on('Network.requestWillBeSent', ({ requestId, request }) => {
    if (/\/assets\/hero-.*\.mp4$/.test(request.url)) media.set(requestId, { url: request.url })
  })
  cdp.on('Network.requestServedFromCache', ({ requestId }) => {
    if (media.has(requestId)) media.get(requestId).cache = true
  })
  cdp.on('Network.responseReceived', ({ requestId, response }) => {
    if (media.has(requestId)) Object.assign(media.get(requestId), {
      cache: media.get(requestId).cache || response.fromDiskCache,
      status: response.status,
      policy: Object.entries(response.headers).find(([key]) => key.toLowerCase() === 'cache-control')?.[1],
    })
  })
  cdp.on('Network.loadingFinished', ({ requestId, encodedDataLength }) => {
    if (media.has(requestId)) media.get(requestId).bytes = encodedDataLength
  })

  await page.goto(base)
  await ready(page)
  // All four clips are downloaded once, before the first scene starts.
  assert.equal(mediaRequests.size, 4, 'all clips preloaded before playback')
  assert.ok([...mediaRequests.values()].every(count => count === 1))
  assert.ok([...media.values()].some(entry => entry.policy === policy))
  const video = page.locator(readySelector)
  assert.deepEqual(await video.evaluate(v => [v.muted, v.playsInline, v.loop, v.controls]), [true, true, false, false])
  await scroll(page, true)
  await page.waitForFunction(() => document.querySelector('video.hero-art-video')?.paused)
  const pausedAt = await video.evaluate(v => v.currentTime)
  await page.waitForTimeout(300)
  assert.equal(await video.evaluate(v => v.currentTime), pausedAt)
  await scroll(page, false)
  await page.waitForFunction(time => document.querySelector('video.hero-art-video')?.currentTime > time, pausedAt)
  await tab(page, true)
  await page.waitForFunction(() => document.querySelector('video.hero-art-video')?.paused)
  await scroll(page, true)
  await tab(page, false)
  await page.waitForTimeout(350)
  assert.equal(await video.evaluate(v => v.paused), true)
  await scroll(page, false)
  await page.waitForFunction(() => !document.querySelector('video.hero-art-video')?.paused)

  let originFirstCycle
  for (let index = 0; index < 8; index++) {
    console.log('Checking cycle scene', index + 1)
    await ready(page)
    const [scene, duration] = await page.locator(readySelector).evaluate(v => [v.dataset.scene, v.duration])
    assert.equal(duration, durations[scene])
    report.desktop.push(scene)
    await gap(page)
    if (index === 3) originFirstCycle = new Map(mediaRequests)
    if (index === 0) {
      await page.waitForTimeout(500)
      await tab(page, true)
      await page.waitForTimeout(4250)
      assert.equal(await page.locator(frameSelector).getAttribute('data-phase'), 'gap')
      assert.equal(await page.locator('.hero-art-frame video.is-visible').count(), 0)
      assert.equal(await page.locator('.hero-art-frame img').count(), 1)
      await tab(page, false)
    }
  }
  const trace = await page.evaluate(() => window.heroTrace)
  assert.deepEqual([...new Set(report.desktop.slice(0, 4))].sort(), scenes)
  assert.deepEqual([...new Set(report.desktop.slice(4))].sort(), scenes)
  assert.notEqual(report.desktop[3], report.desktop[4])
  assert.deepEqual(trace.ended.map(e => e[0]), report.desktop)
  assert.ok(trace.ended.every(([, position, duration]) => Math.abs(position - duration) < 0.05))
  assert.equal(trace.overlap, undefined)
  assert.equal(trace.observers, 1)
  assert.equal(trace.listeners, 1)
  // Ignore the zero-length start gap right after preloading.
  const phases = trace.phases.slice(trace.phases.findIndex(entry => entry.phase === 'scene'))
  for (let i = 1; i < phases.length; i++) {
    const [start, end] = phases.slice(i - 1, i + 1)
    if (start.phase === 'gap' && end.phase === 'scene') report.gapsMs.push(Math.round(end.time - start.time))
  }
  assert.equal(report.gapsMs.length, 7)
  assert.ok(report.gapsMs[0] >= 8050)
  assert.ok(report.gapsMs.slice(1).every(value => value >= 3950 && value < 5000))
  report.network = {
    firstCycleOriginRequests: Object.fromEntries(originFirstCycle),
    afterSecondCycleOriginRequests: Object.fromEntries(mediaRequests),
    cacheHits: [...media.values()].filter(entry => entry.cache).length,
    transferredBytes: [...media.values()].filter(entry => !entry.cache).reduce((sum, entry) => sum + (entry.bytes || 0), 0),
  }
  assert.ok(report.network.cacheHits > 0 || [...mediaRequests].every(([url, count]) => originFirstCycle.get(url) === count))
  await cdp.send('Performance.enable')
  const { metrics } = await cdp.send('Performance.getMetrics')
  report.jsHeapBytesAfterTwoCycles = metrics.find(metric => metric.name === 'JSHeapUsedSize')?.value
  await page.goto(base + '/species/irbis')
  await page.locator('section[aria-labelledby="profile-about"]').waitFor()
  // Hidden behind the species page, the hero never starts downloading.
  assert.equal(await page.locator(frameSelector).getAttribute('data-phase'), 'loading')
  await context.close()

  for (const [name, width, height, mobile] of [
    ['monitor', 1920, 1080, false], ['laptop', 1366, 768, false], ['tablet', 768, 1024, true],
    ['iphone', 390, 844, true], ['android', 412, 915, true],
  ]) {
    const ctx = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile })
    const p = await ctx.newPage()
    await p.goto(base)
    const frame = p.locator(frameSelector)
    await frame.scrollIntoViewIfNeeded()
    await ready(p)
    const box = await frame.boundingBox()
    assert.ok(Math.abs(box.width / box.height - 26 / 17) < 0.01)
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false)
    assert.deepEqual(await p.locator(readySelector).evaluate(v => [v.videoWidth, v.videoHeight, getComputedStyle(v).objectFit]), [1040, 680, 'contain'])
    report.viewports.push({ name, viewport: [width, height], frame: [box.width, box.height] })
    await frame.screenshot({ path: resolve(output, name + '-frame.png') })
    await ctx.close()
  }

  // Windows "Animation effects: off" makes Chrome report prefers-reduced-motion.
  // That setting only removes CSS fades; it must not leave the hero on the poster forever.
  const reduced = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } })
  const rp = await reduced.newPage()
  const reducedRequests = new Set()
  rp.on('request', request => { if (request.url().endsWith('.mp4')) reducedRequests.add(request.url()) })
  await rp.goto(base)
  await rp.locator(frameSelector).scrollIntoViewIfNeeded()
  await ready(rp)
  assert.equal(await rp.locator('.hero-art video').count(), 1)
  assert.equal(await rp.locator(readySelector).evaluate(v => !v.paused), true)
  assert.equal(reducedRequests.size, 4)
  await reduced.close()

  const broken = await browser.newContext({ viewport: { width: 1400, height: 900 } })
  let failed = false
  await broken.route('**/assets/hero-*.mp4', route => {
    if (failed) return route.continue()
    failed = true
    return route.abort('failed')
  })
  const bp = await broken.newPage()
  await bp.goto(base)
  await ready(bp)
  assert.equal(failed, true)
  await broken.close()

  for (const value of [0, 0.25, 0.4, 0.6]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const p = await ctx.newPage()
    await p.addInitScript(random => { Math.random = () => random }, value)
    await p.goto(base)
    await ready(p)
    report.firstScenes.push(await p.locator(readySelector).getAttribute('data-scene'))
    await ctx.close()
  }
  assert.deepEqual([...new Set(report.firstScenes)].sort(), scenes)
  assert.deepEqual(report.errors, [])
  await writeFile(resolve(output, 'browser-results.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify(report, null, 2))
} finally {
  await browser?.close()
  await new Promise(resolve => server.httpServer.close(resolve))
}
