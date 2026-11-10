// UI v3 is an explicit, narrowly scoped presentation revision.
// Immutable scientific evidence remains verified by all original historical Git snapshots.
// This helper checks BOTH the previous UI bytes and the exact approved replacement;
// it never permits an arbitrary edit to a protected file.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { gitExists, gitShow } from '../../scripts/lib/git-history.mjs'
import { createHash } from 'node:crypto'
import { PROJECT_ROOT } from '../../scripts/build-data.mjs'
import { UI_V4_FILES, uiV4BaseBytes } from './ui-v4-release.mjs'
const manifest = JSON.parse(readFileSync(new URL('../../data/research/ui-v3-release.json', import.meta.url), 'utf8'))

const sha = bytes => createHash('sha256').update(bytes).digest('hex')
// Git stores normalized LF text, whereas the historical manifests were signed
// using a Windows CRLF checkout. Check both representations without changing
// the pinned digest or accepting a different text payload.
const normalizedText = bytes => bytes.toString('utf8').replace(/\r\n/g, '\n')
const matches = (bytes, fingerprint) => {
  if (sha(bytes) === fingerprint) return true
  const lf = normalizedText(bytes)
  return sha(Buffer.from(lf)) === fingerprint ||
    sha(Buffer.from(lf.replace(/\n/g, '\r\n'))) === fingerprint
}
export const UI_V3_FILES = new Set(Object.keys(manifest.files))

export function assertUiV3File(path) {
  const entry = manifest.files[path]
  assert.ok(entry && UI_V3_FILES.has(path), `${path}: not in scoped UI v3 manifest`)
  assert.equal(manifest.baseCommit, 'ce646a90262e9cf1b0636bdd1963251aa74981b1')
  // A file revised again by UI v4 keeps its v3 result in the v4 base commit;
  // ui-v4-release.mjs pins the exact v4 replacement separately.
  const current = UI_V4_FILES.has(path) ? uiV4BaseBytes(path) : readFileSync(`${PROJECT_ROOT}/${path}`)
  assert.ok(matches(current, entry.after), `${path}: UI v3 differs from approved replacement`)
  if (entry.before) {
    const previous = gitShow(manifest.baseCommit, path)
    assert.ok(matches(previous, entry.before), `${path}: original UI Git snapshot differs`)
  } else {
    // New UI files must not exist in the historical commit.
    assert.equal(gitExists(manifest.baseCommit, path), false, `${path}: supposedly new UI path exists in base commit`)
  }
  return true
}
