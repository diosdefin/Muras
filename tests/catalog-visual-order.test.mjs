import test from 'node:test'
import assert from 'node:assert/strict'
import { prioritizeIllustratedResults, paginateCatalog } from '../src/data/catalog-pagination.js'

test('temporary photo-first sorting is stable, and never mutates source data', () => {
  const initial = [
    { id: 'a', photo: false }, { id: 'b', photo: true },
    { id: 'c', photo: false }, { id: 'd', photo: true },
  ]
  const sorted = prioritizeIllustratedResults(initial, row => row.photo)
  assert.deepEqual(sorted.map(row => row.id), ['b', 'd', 'a', 'c'])
  assert.deepEqual(initial.map(row => row.id), ['a', 'b', 'c', 'd'])
})

test('pagination stays at 24 even after stable photo prioritization', () => {
  const rows = Array.from({ length: 100 }, (_, n) => ({ id: n, photo: n % 5 !== 0 }))
  const prioritized = prioritizeIllustratedResults(rows, row => row.photo)
  assert.deepEqual([1,2,3,4,5].map(n => paginateCatalog(prioritized, n).entries.length), [24,24,24,24,4])
  assert.ok(prioritized.slice(0, 80).every(row => row.photo))
  assert.ok(prioritized.slice(80).every(row => !row.photo))
})
