// Builds public/data/protected-areas.json from the reviewed source and verifies photo files.
// Usage: node scripts/build-protected-areas.mjs [--check]
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { validateAreas } from '../src/data/protected-areas.js'
const root = new URL('../', import.meta.url)
const source = JSON.parse(await readFile(new URL('data/protected-areas/areas.source.json', root), 'utf8'))
const species = new Set(JSON.parse(await readFile(new URL('data/species.source.json', root), 'utf8')).catalog.map(s => s.id))
const errors = validateAreas(source.areas, species)
for (const area of source.areas) for (const photo of area.photos) {
  const bytes = await readFile(new URL(`public/${photo.path}`, root)).catch(() => null)
  if (!bytes) errors.push(`${area.id}: missing file ${photo.path}`)
  else if (createHash('sha256').update(bytes).digest('hex') !== photo.sha256) errors.push(`${area.id}: sha256 mismatch ${photo.path}`)
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1) }
// Public payload: editorial notes (conflicts, open questions, confidence) stay in the source only.
const pub = { schemaVersion: source.schemaVersion, areas: source.areas.map(({ conflicts, open_questions, confidence, ...area }) => ({
  ...area, sources: area.sources.map(({ supports, ...s }) => s),
  photos: area.photos.map(({ sourceFileUrl, depictionEvidence, licenseVerified, licenseVerifiedAt, primary, ...p }, i) => ({ ...p, primary: Boolean(primary) })) })) }
const text = JSON.stringify(pub) + '\n'
const target = new URL('public/data/protected-areas.json', root)
if (process.argv.includes('--check')) {
  const current = await readFile(target, 'utf8').catch(() => '')
  if (current.replace(/\r\n/g, '\n') !== text) { console.error('public/data/protected-areas.json is stale: run npm run data:areas'); process.exit(1) }
} else await writeFile(target, text)
console.log(`Территории проверены: ${source.areas.length}, фото ${source.areas.reduce((n, a) => n + a.photos.length, 0)}.`)
