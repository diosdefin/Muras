import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CATALOG_PAGE_SIZE, paginateCatalog, pageNumbers } from '../src/data/catalog-pagination.js'

test('catalog pagination shows 24 on each full page, including partial final page', () => {
  const records = Array.from({ length: 40 }, (_, i) => i + 1)
  assert.equal(CATALOG_PAGE_SIZE, 24)
  assert.deepEqual(paginateCatalog(records, 1).entries, records.slice(0, 24))
  assert.deepEqual(paginateCatalog(records, 2).entries, records.slice(24))
  assert.equal(paginateCatalog(records, 2).totalPages, 2)
})
test('catalog pagination clamps page changes and handles empty results', () => {
  assert.equal(paginateCatalog([], 10).current, 1)
  assert.equal(paginateCatalog([], 10).entries.length, 0)
  assert.equal(paginateCatalog([1, 2], 10).current, 1)
  assert.equal(paginateCatalog(Array.from({length: 50}, (_, i) => i), -2).current, 1)
})
test('page selector stays compact for larger catalogues', () => {
  assert.deepEqual(pageNumbers(1, 2), [1, 2])
  assert.deepEqual(pageNumbers(5, 20), [1, '…', 4, 5, 6, '…', 20])
  assert.deepEqual(pageNumbers(20, 20), [1, '…', 19, 20])
})
