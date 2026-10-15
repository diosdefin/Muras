// Read-only remote research. Image processing remains prepare-batch-images.mjs.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
const args = process.argv.slice(2)
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback
const registry = JSON.parse(await readFile(option('--registry', 'data/research/bulk-25-content-registry.json'), 'utf8'))
const path = option('--output', 'docs/evidence/bulk-25-photo-search.json')
const evidence = JSON.parse(await readFile(path, 'utf8').catch(() => '{"schemaVersion":1,"records":[]}'))
evidence.documentType = 'unpublished-photo-search-evidence'
for (const c of registry.candidates) {
  if (evidence.records.some(r => r.candidateId === c.id && r.complete)) continue
  const r = { candidateId: c.id, accessedAt: new Date().toISOString().slice(0, 10), queries: [], complete: false }
  for (const name of new Set([c.acceptedScientificName, c.originalScientificName])) {
    const url = new URL('https://commons.wikimedia.org/w/api.php')
    url.search = new URLSearchParams({ action: 'query', format: 'json', generator: 'search',
      gsrsearch: `"${name}"`, gsrnamespace: '6', gsrlimit: '3', prop: 'imageinfo|revisions',
      iiprop: 'url|size|extmetadata', rvprop: 'ids|content', rvslots: 'main' })
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'MurasEditorial/1.0 (scientific draft research)' }, signal: AbortSignal.timeout(25000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error.info)
      r.queries.push({ name, url: String(url), httpStatus: res.status, data })
    } catch (e) { r.queries.push({ name, url: String(url), error: e.message }) }
    await new Promise(resolve => setTimeout(resolve, 7000))
  }
  r.complete = r.queries.every(q => !q.error)
  evidence.records = evidence.records.filter(q => q.candidateId !== c.id)
  evidence.records.push(r)
  await mkdir('docs/evidence', { recursive: true })
  await writeFile(path, JSON.stringify(evidence, null, 2) + '\n')
  console.log(c.id, r.queries.map(q => q.error || Object.values(q.data.query?.pages || {}).map(p => p.title).join('; ') || 'no exact search result').join(' | '))
}
