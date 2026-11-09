// Historical release audits must read the original map when replaying pre-27.1 releases.
// This never exempts live catalog science, photos, licenses, boundaries or research material.
import { readFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'
import { checkoutBytesMatching } from './historical-checksum.mjs'
import { digest } from './research-pipeline.mjs'
import { localAdminHistoricalBytes } from './local-admin-history.mjs'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
export const MAP_APPLICATION_FILES = new Set([
  // Task 28.1 also evolves presentation/lifecycle files; their earlier scientific-release checksums stay pinned.
  'src/admin/components/PhotoEditor.vue', 'src/components/SpeciesVisualization.vue',
  // Task 28.4 changes metadata rendering; preserve its authentic old release bytes.
  'src/components/PopulationInfo.vue',
  'src/components/lesson/LessonView.vue',
  'src/components/SpeciesModal.vue', 'src/components/SpeciesPage.vue',
  'src/composables/useImageVisualization.js', 'src/data/visualization/engine.js',
  'data/geography/occurrences.source.json', 'public/data/geography/occurrences.json',
  'src/components/support/SupportView.vue', 'src/components/support/support.css', 'src/style.css',
  'scripts/build-map.mjs', 'src/App.vue', 'src/data/geography/model.js',
  'src/components/map/MapSection.vue', 'src/components/map/RegionMap.vue', 'src/components/map/RegionPanel.vue',
  'src/components/map/RegionalSpecies.vue', 'src/components/map/map.css',
  'src/locales/ky.json', 'src/locales/uz.json', 'src/locales/ru.json', 'src/locales/en.json',
])
export async function historicalMapBytes(root, path, sha256) {
  const beforeLocalEditor = localAdminHistoricalBytes(root, path, sha256)
  if (beforeLocalEditor) return beforeLocalEditor
  if (!MAP_APPLICATION_FILES.has(path)) {
    const bytes = await readFile(resolve(root, path))
    return checkoutBytesMatching(path, bytes, sha256) || uiV4PreviousBytes(root, path, bytes, sha256) || bytes
  }
  // The regional-map view was a UI-only edit after map publication.
  // Its pre-UI bytes are still pinned by the old checksum and are available
  // at the immutable 28.5 HEAD, not necessarily at the initial map commit.
  const snapshot = path === 'src/components/map/RegionMap.vue'
    ? 'ce646a90262e9cf1b0636bdd1963251aa74981b1'
    : '43ff31186ea54eafdb6eec654c50828fb4c99eb3'
  let bytes = execFileSync('git', ['show', `${snapshot}:${path}`], { cwd: root, windowsHide: true })
  bytes = checkoutBytesMatching(path, bytes, sha256) || bytes
  assert.equal(digest(bytes), sha256, `original map snapshot: ${path}`)
  return bytes
}

// UI v4 is a pinned presentation revision (data/research/ui-v4-release.json). Only when the live
// file is exactly the approved replacement do older release audits replay its pre-v4 Git bytes.
function uiV4PreviousBytes(root, path, bytes, sha256) {
  const manifest = JSON.parse(readFileSync(resolve(root, 'data/research/ui-v4-release.json'), 'utf8'))
  const entry = manifest.files[path]
  if (!entry?.before) return null
  const lf = createHash('sha256').update(bytes.toString('utf8').replace(/\r\n/g, '\n')).digest('hex')
  if (lf !== entry.after) return null
  const previous = execFileSync('git', ['show', `${manifest.baseCommit}:${path}`], { cwd: root, windowsHide: true })
  return checkoutBytesMatching(path, previous, sha256)
}
