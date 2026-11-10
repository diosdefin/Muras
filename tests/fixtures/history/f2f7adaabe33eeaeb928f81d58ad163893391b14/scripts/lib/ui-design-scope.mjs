/**
 * MURAS 100 design revision: these presentation-only paths were intentionally
 * modified after the 22.x scientific release snapshots were recorded.
 * Historical hashes remain untouched as evidence of what the earlier release
 * actually contained. This list is NOT a blanket waiver for scientific data,
 * source documents, licensed photo files, map geometry or import records.
 */
export const intentionalUiRevision = new Set([
  'src/App.vue',
  'src/components/CatalogSearch.vue',
  'src/components/catalog.css',
  'src/components/map/MapOverviewPanel.vue',
  'src/components/map/MapSection.vue',
  'src/components/map/map.css',
  'src/data/catalog-pagination.js',
  'src/locales/en.json',
  'src/locales/ky.json',
  'src/locales/ru.json',
  'src/locales/uz.json',
])
export const isHistoricalEvidenceUnchanged = path => !intentionalUiRevision.has(path)
