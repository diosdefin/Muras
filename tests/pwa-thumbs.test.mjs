import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir, stat, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { thumbPaths, connectionIsConstrained } from '../src/data/photo-thumbs.js'
import { writePrecache } from '../scripts/admin-entry.mjs'

const url = path => new URL('../' + path, import.meta.url)
const sha = bytes => createHash('sha256').update(bytes).digest('hex')

test('thumbPaths maps only the licensed photo folders and keeps everything else untouched', () => {
  assert.deepEqual(thumbPaths('/images/approved/irbis-1.webp'), { webp: 'images/thumbs/approved/irbis-1.webp', avif: 'images/thumbs/approved/irbis-1.avif' })
  assert.deepEqual(thumbPaths('images/areas/ala-archa-1.webp'), { webp: 'images/thumbs/areas/ala-archa-1.webp', avif: 'images/thumbs/areas/ala-archa-1.avif' })
  for (const bad of ['/images/placeholder.svg', '/images/approved/x.png', '/images/approved/a/b.webp', '', null, undefined]) assert.equal(thumbPaths(bad), null)
})

test('connectionIsConstrained reads saveData and slow effective types only', () => {
  assert.equal(connectionIsConstrained(undefined), false)
  assert.equal(connectionIsConstrained({ effectiveType: '4g' }), false)
  assert.equal(connectionIsConstrained({ effectiveType: '3g' }), true)
  assert.equal(connectionIsConstrained({ effectiveType: '4g', saveData: true }), true)
})

test('every original photo has a lighter WebP and AVIF copy; originals still match their recorded SHA-256', async () => {
  const manifest = JSON.parse(await readFile(url('public/images/thumbs/manifest.json'), 'utf8'))
  const photos = (await Promise.all(['approved', 'areas'].map(async folder => (await readdir(url('public/images/' + folder))).filter(f => f.endsWith('.webp')).map(f => `${folder}/${f}`)))).flat()
  assert.deepEqual(Object.keys(manifest).sort(), photos.sort())
  for (const [rel, item] of Object.entries(manifest)) {
    const original = await readFile(url('public/images/' + rel))
    assert.equal(sha(original), item.originalSha256, rel + ': original changed')
    const base = rel.replace(/\.webp$/, '')
    const webp = (await stat(url(`public/images/thumbs/${rel}`))).size
    const avif = (await stat(url(`public/images/thumbs/${base}.avif`))).size
    assert.equal(webp, item.webpBytes); assert.equal(avif, item.avifBytes)
    assert.ok(Math.max(item.width, item.height) <= 640, rel)
    assert.ok(webp <= original.length, rel + ': thumbnail is not lighter')
  }
})

test('the service worker and manifest stay same-origin and never touch the admin routes', async () => {
  const worker = await readFile(url('public/sw.js'), 'utf8')
  assert.ok(!/importScripts|https?:\/\//.test(worker))
  assert.ok(worker.includes("path.startsWith('/admin')") && worker.includes('__muras_admin'))
  const manifest = JSON.parse(await readFile(url('public/manifest.webmanifest'), 'utf8'))
  assert.equal(manifest.display, 'standalone')
  for (const icon of manifest.icons) await stat(url('public' + icon.src))
})

test('writePrecache lists the shell, data and thumbnails but no videos or full-size photos', async () => {
  const root = await mkdtemp(join(tmpdir(), 'muras-precache-'))
  try {
    for (const dir of ['assets', 'data', 'images/thumbs/approved', 'images/approved']) await mkdir(join(root, 'dist', dir), { recursive: true })
    await writeFile(join(root, 'dist/assets/app-1.js'), 'x'); await writeFile(join(root, 'dist/assets/hero-1.mp4'), 'x')
    await writeFile(join(root, 'dist/data/species.json'), '{}'); await writeFile(join(root, 'dist/images/approved/a.webp'), 'x')
    await writeFile(join(root, 'dist/images/thumbs/approved/a.webp'), 'x'); await writeFile(join(root, 'dist/images/thumbs/approved/a.avif'), 'x')
    assert.equal(await writePrecache(root), true)
    const list = JSON.parse(await readFile(join(root, 'dist/precache.json'), 'utf8'))
    assert.ok(list.shell.includes('/') && list.shell.includes('/assets/app-1.js'))
    assert.ok(!JSON.stringify(list).includes('.mp4') && !JSON.stringify(list).includes('/images/approved/'))
    assert.deepEqual(list.data, ['/data/species.json'])
    assert.deepEqual(list.thumbs, { webp: ['/images/thumbs/approved/a.webp'], avif: ['/images/thumbs/approved/a.avif'] })
    assert.match(list.version, /^[0-9a-f]{16}$/)
    await rm(join(root, 'dist/assets'), { recursive: true })
    assert.equal(await writePrecache(root), false)
  } finally { await rm(root, { recursive: true, force: true }) }
})
