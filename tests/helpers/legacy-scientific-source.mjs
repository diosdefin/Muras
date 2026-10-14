// Snapshot checks retain all old facts, ignoring only this explicitly authorized
// content extension and its additional citations. No production code uses this view.
export function legacyScientificSource(source) {
  const copy = structuredClone(source)
  for (const species of [...copy.catalog, ...copy.demoArchive]) {
    delete species.content
    species.sources = species.sources.filter(s => !s.id.startsWith('encyclopedia-'))
    for (const source of species.sources) source.supports = source.supports.filter(path => !path.startsWith('content.'))
  }
  return copy
}
