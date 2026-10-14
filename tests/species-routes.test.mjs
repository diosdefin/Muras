import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { speciesIdFromPath, speciesPath } from '../src/data/species-routes.js'

const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url)))

test('every published species receives a stable shareable URL and decodes back to its id', () => {
  const catalog = JSON.parse(readFileSync(new URL('../data/species.source.json', import.meta.url))).catalog
  assert.ok(catalog.length >= 30)
  for (const { id } of catalog) {
    assert.equal(speciesIdFromPath(speciesPath(id)), id)
    assert.equal(speciesIdFromPath(`${speciesPath(id)}/`), id)
  }
})

test('invalid paths cannot be mistaken for a species record', () => {
  for (const path of ['', '/', '/map', '/admin', '/species/', '/species/a/b', '/species/%2F', '/species/../x', '/species/%', '/species/?id=irbis']) {
    assert.equal(speciesIdFromPath(path), null, path)
  }
  assert.throws(() => speciesPath('../admin'), /Invalid species id/)
})

test('Vercel routes shareable species pages without stealing admin or static assets', () => {
  assert.ok(config.rewrites.some(({ source, destination }) => source === '/species/:id' && destination === '/index.html'))
  assert.ok(config.rewrites.some(({ source, destination }) => source === '/admin' && destination === '/admin/index.html'))
  assert.ok(!config.rewrites.some(({ source }) => source === '/:path*' || source === '/(.*)'))
})
