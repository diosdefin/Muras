import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { localizedBlocks } from '../../src/data/translation-completeness.js'
const sha = s => createHash('sha256').update(s).digest('hex')
const at = (obj, path) => path.split('.').reduce((o, k) => o[k], obj)
// A translation is an addition to an empty non-Russian cell. All other bytes-as-data
// (including Russian texts, references, image identities, statuses and archive) stay protected.
export function assertTranslationOnlyEvolution(before, after, batch) {
 const restored = structuredClone(after), seen = new Set()
 assert.equal(batch.documentType, 'editorial-translation-batch')
 assert.equal(batch.scientificApproval, null)
 for (const c of batch.changes) {
  assert.ok(batch.selectedIds.includes(c.id))
  const key = `${c.id}:${c.path}`; assert.ok(!seen.has(key)); seen.add(key)
  assert.match(c.path, /\.(ky|uz|en)$/)
  const old = before.catalog.find(s => s.id === c.id), current = after.catalog.find(s => s.id === c.id)
  const path = c.path.split('.'), lang = path.pop(), parent = path.join('.')
  assert.ok(old && current)
  assert.ok(localizedBlocks(old).some(b => b.path === parent && b.value), 'Only existing localized blocks may be translated')
  const previous = at(old, parent), actual = at(current, parent), target = at(restored.catalog.find(s => s.id === c.id), parent)
  assert.ok(previous[lang] == null || previous[lang] === '', 'Existing translations cannot be silently replaced')
  assert.equal(sha(previous.ru), c.sourceRussianSha256)
  assert.equal(actual[lang], c.text)
  assert.ok(typeof c.text === 'string' && c.text.trim() && c.text !== previous.ru)
  assert.deepEqual(c.text.match(/\d+/g) || [], previous.ru.match(/\d+/g) || [], 'Numbers and historical years must survive translation')
  if (Object.hasOwn(previous, lang)) target[lang] = previous[lang]; else delete target[lang]
 }
 assert.deepEqual(restored, before, 'Only journalled translations may change; all science, sources, archive and media metadata remain intact')
 return restored
}
