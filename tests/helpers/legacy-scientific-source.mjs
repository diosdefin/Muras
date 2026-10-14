// Snapshot checks retain all old facts, ignoring only this explicitly authorized
// content extension and its additional citations. Task 21.3 explicitly fills four
// formerly empty photo arrays; their rights/assets and the original 21 images are
// checked independently against the pre-photo audit in species-photos.test.mjs.
// No production code uses this view.
export function legacyScientificSource(source) {
  const copy = structuredClone(source)
  for (const species of [...copy.catalog, ...copy.demoArchive]) {
    delete species.content
    if (['kolpakowskis-tulip','christophs-clouded-yellow','semenovs-fir','great-bustard'].includes(species.id)) species.images = []
    species.sources = species.sources.filter(s => !s.id.startsWith('encyclopedia-'))
    for (const source of species.sources) source.supports = source.supports.filter(path => !path.startsWith('content.'))
  }
  return copy
}
