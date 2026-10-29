import { POPULATION_EVOLVING_FILES } from './population-evolution.mjs'
// Task 27.1 evolves map application code, not the historical publication snapshots.
// Old hashes still validate authentic old Git objects. Live science/assets remain checked.
export const MAP_EVOLVING_FILES = new Set([
  ...POPULATION_EVOLVING_FILES,
  'data/geography/occurrences.source.json', 'public/data/geography/occurrences.json',
  'scripts/build-map.mjs', 'src/App.vue', 'src/data/geography/model.js',
  'src/components/map/MapSection.vue', 'src/components/map/RegionPanel.vue',
  'src/components/map/RegionalSpecies.vue', 'src/components/map/map.css',
  'src/locales/ky.json', 'src/locales/uz.json', 'src/locales/ru.json', 'src/locales/en.json',
  'scripts/audit-bulk-25-release.mjs', 'tests/bulk-25-content.test.mjs',
  'tests/catalog-100-preparation.test.mjs', 'tests/provisional-catalog.test.mjs',
  'tests/helpers/historical-pipeline.mjs',
  'tests/map.test.mjs', 'tests/first-batch.test.mjs', 'tests/species-groups.test.mjs',
])
