// UI v4 (hero animations + phone adaptation) is an explicit, narrowly scoped
// presentation revision on top of UI v3. Immutable scientific evidence remains
// verified by all original historical Git snapshots. This helper checks BOTH the
// previous bytes stored in Git and the exact approved replacement; it never
// permits an arbitrary edit to a protected file.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { PROJECT_ROOT } from '../../scripts/build-data.mjs'
const manifest = JSON.parse(readFileSync(new URL('../../data/research/ui-v4-release.json', import.meta.url), 'utf8'))

const sha = bytes => createHash('sha256').update(bytes).digest('hex')
// Accept the same text payload in either LF (Git) or CRLF (Windows checkout) form.
const matches = (bytes, fingerprint) => {
  if (sha(bytes) === fingerprint) return true
  const lf = bytes.toString('utf8').replace(/\r\n/g, '\n')
  return sha(Buffer.from(lf)) === fingerprint || sha(Buffer.from(lf.replace(/\n/g, '\r\n'))) === fingerprint
}
export const UI_V4_BASE = manifest.baseCommit
export const UI_V4_FILES = new Set(Object.keys(manifest.files))
export const uiV4BaseBytes = path => execFileSync('git', ['show', `${UI_V4_BASE}:${path}`], { cwd: PROJECT_ROOT, windowsHide: true })

export function assertUiV4File(path) {
  const entry = manifest.files[path]
  assert.ok(entry && UI_V4_FILES.has(path), `${path}: not in scoped UI v4 manifest`)
  assert.equal(manifest.baseCommit, 'f2f7adaabe33eeaeb928f81d58ad163893391b14')
  const current = readFileSync(`${PROJECT_ROOT}/${path}`)
  assert.ok(matches(current, entry.after), `${path}: differs from the approved UI v4 replacement`)
  if (entry.before) {
    assert.ok(matches(uiV4BaseBytes(path), entry.before), `${path}: original Git snapshot differs`)
  } else {
    // New UI files must not exist in the base commit.
    let exists = false
    try { execFileSync('git', ['cat-file', '-e', `${UI_V4_BASE}:${path}`], { cwd: PROJECT_ROOT, windowsHide: true, stdio: 'ignore' }); exists = true }
    catch { /* expected */ }
    assert.equal(exists, false, `${path}: supposedly new UI path exists in base commit`)
  }
  return true
}
