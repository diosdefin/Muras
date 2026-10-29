// Historical release audits must read the original map when replaying pre-27.1 releases.
// This never exempts live catalog science, photos, licenses, boundaries or research material.
import { readFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'
import { digest } from './research-pipeline.mjs'
export const MAP_APPLICATION_FILES = new Set([
  // Task 28.1 also evolves presentation/lifecycle files; their earlier scientific-release checksums stay pinned.
  'src/admin/components/PhotoEditor.vue', 'src/components/SpeciesVisualization.vue',
  // Task 28.4 changes metadata rendering; preserve its authentic old release bytes.
  'src/components/PopulationInfo.vue',
  'src/components/lesson/LessonView.vue',
  'src/components/SpeciesModal.vue', 'src/components/SpeciesPage.vue',
  'src/composables/useImageVisualization.js', 'src/data/visualization/engine.js',
  'data/geography/occurrences.source.json', 'public/data/geography/occurrences.json',
  'scripts/build-map.mjs', 'src/App.vue', 'src/data/geography/model.js',
  'src/components/map/MapSection.vue', 'src/components/map/RegionPanel.vue',
  'src/components/map/RegionalSpecies.vue', 'src/components/map/map.css',
  'src/locales/ky.json', 'src/locales/uz.json', 'src/locales/ru.json', 'src/locales/en.json',
])
export async function historicalMapBytes(root, path, sha256) {
  if (!MAP_APPLICATION_FILES.has(path)) return readFile(resolve(root, path))
  let bytes = execFileSync('git', ['show', `43ff31186ea54eafdb6eec654c50828fb4c99eb3:${path}`], { cwd: root, windowsHide: true })
  if (digest(bytes) !== sha256) bytes = Buffer.from(bytes.toString('utf8').replace(/\r?\n/g, '\r\n'))
  assert.equal(digest(bytes), sha256, `original map snapshot: ${path}`)
  return bytes
}
