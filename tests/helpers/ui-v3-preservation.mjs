// UI v3 is an explicit, narrowly scoped presentation revision.
// Immutable scientific evidence remains verified by all original historical Git snapshots.
// This helper checks BOTH the previous UI bytes and the exact approved replacement;
// it never permits an arbitrary edit to a protected file.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { PROJECT_ROOT } from '../../scripts/build-data.mjs'
const manifest = JSON.parse(readFileSync(new URL('../../data/research/ui-v3-release.json', import.meta.url), 'utf8'))

const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const toLF = bytes => Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n'))
const matches = (bytes, fingerprint) => sha(bytes) === fingerprint || sha(toLF(bytes)) === fingerprint
export const UI_V3_FILES = new Set(Object.keys(manifest.files))

export function assertUiV3File(path) {
  const entry = manifest.files[path]
  assert.ok(entry && UI_V3_FILES.has(path), `${path}: not in scoped UI v3 manifest`)
  assert.equal(manifest.baseCommit, 'ce646a90262e9cf1b0636bdd1963251aa74981b1')
  const current = readFileSync(`${PROJECT_ROOT}/${path}`)
  assert.ok(matches(current, entry.after), `${path}: UI v3 differs from approved replacement`)
  if (entry.before) {
    const previous = execFileSync('git', ['show', `${manifest.baseCommit}:${path}`], {cwd: PROJECT_ROOT, windowsHide: true})
    assert.ok(matches(previous, entry.before), `${path}: original UI Git snapshot differs`)
  } else {
    // New UI files must not exist in the historical commit.
    let exists = false
    try { execFileSync('git', ['cat-file', '-e', `${manifest.baseCommit}:${path}`], {cwd: PROJECT_ROOT, windowsHide: true, stdio:'ignore'}); exists = true }
    catch { /* expected */ }
    assert.equal(exists, false, `${path}: supposedly new UI path exists in base commit`)
  }
  return true
}
