// Offline draft authoring only. Validation/checkpoints use the existing bulk pipeline.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { digest, fingerprint } from './lib/research-pipeline.mjs'
import { validateSpecies } from '../src/data/species-model.js'
import { UNKNOWN_POPULATION } from '../src/data/population.js'
const read = async p => JSON.parse(await readFile(p, 'utf8'))
const save = async (p, v) => { await mkdir(dirname(p), { recursive: true }); await writeFile(p, JSON.stringify(v, null, 2) + '\n') }
const n = Number(process.argv[2])
if (!Number.isInteger(n) || n < 1 || n > 5) throw new Error('Нужен номер блока 1..5')
const manifest = await read('data/research/bulk-25-content-manifest.json')
const master = await read('data/research/redbook-master-registry.json')
if (fingerprint(master) !== manifest.masterRegistryFingerprint) throw new Error('Исходный мастер-реестр изменился')
const registryPath = 'data/research/bulk-25-content-registry.json'
const registry = await read(registryPath)
const block = manifest.blocks[n - 1]
const factsPath = `data/research/bulk-25-content/block-${n}-facts.json`
const facts = await read(factsPath)
if (JSON.stringify(facts.records.map(f => f.id)) !== JSON.stringify(block.candidateIds)) throw new Error('Порядок фактов не совпадает с manifest')
const tax = await read('docs/evidence/redbook-master-taxonomy.json')
const pages = await read('.generated/research/redbook-pages.json')
const receiptsPath = `docs/evidence/bulk-25-block-${n}-images.json`
const receipts = await read(receiptsPath)
const local = ru => ({ ky: null, uz: null, ru, en: null })
const evidencePath = `docs/evidence/bulk-25-block-${n}-accounts.json`
const accounts = { schemaVersion: 1, documentType: 'cached-national-accounts', publicationAllowed: false,
  source: 'https://macrolepidoptera.ru/lnk/282.pdf', pdfSha256: 'f517212f7ce12fcf5c30f2cf73edc5a842b3ded15dea232b844fbe7ce2525cf8',
  records: block.candidateIds.map(id => { const c = master.candidates.find(c => c.id === id); return {
    candidateId: id, originalScientificName: c.originalScientificName, acceptedScientificName: c.acceptedScientificName,
    pages: c.nationalConfirmation.pdfPages.map(page => pages.find(p => p.page === page)) } }) }
// Never rewrite unchanged successful evidence or drafts on resume.
const saveUnchanged = async (p, v) => {
  const next = JSON.stringify(v, null, 2) + '\n'
  const old = await readFile(p, 'utf8').catch(e => { if (e.code !== 'ENOENT') throw e; return null })
  if (old === next) return false
  await mkdir(dirname(p), { recursive: true }); await writeFile(p, next); return true
}
await saveUnchanged(evidencePath, accounts)
let prepared = 0, reused = 0
for (const f of facts.records) {
  const c = registry.candidates.find(c => c.id === f.id)
  const original = master.candidates.find(c => c.id === f.id)
  const t = tax.records.find(r => r.nationalRecordId === c.taxonomyResearch.evidenceRecordId)
  const classification = t?.accepted?.data || t?.match?.data
  if (!classification || classification.canonicalName !== c.acceptedScientificName) throw new Error(`${c.id}: cached accepted taxonomy missing`)
  const taxonomy = Object.fromEntries(['kingdom', 'phylum', 'class', 'order', 'family', 'genus'].map(k => [k, classification[k] || null]))
  const section = key => f[key] ? { text: key === 'shortDescription' ? f[key] : local(f[key]), sourceIds: ['national-book'] } : null
  const content = Object.fromEntries(['shortDescription', 'overview', 'appearance', 'ecology', 'diet', 'reproduction', 'distribution'].map(k => [k, section(k)]))
  const sources = structuredClone(original.sources)
  const national = sources.find(s => s.id === 'national-book')
  national.supports.push('names.ru', 'habitat', ...Object.keys(content).filter(k => content[k]).map(k => `content.${k}`),
    ...(f.threats || []).map((_, i) => `threats.${i}`), ...(f.conservation || []).map((_, i) => `conservationMeasures.${i}`))
  const gbif = sources.find(s => s.id === c.taxonomyEvidence.sourceId)
  gbif.supports.push(...Object.keys(taxonomy).filter(k => taxonomy[k]).map(k => `taxonomy.${k}`))
  if (c.originalScientificName !== c.acceptedScientificName) {
    gbif.supports.push('content.overview')
    content.overview.sourceIds.push(gbif.id)
  }
  // Detailed historic accounts remain tied to the name used in 2006, not all
  // populations of a subsequently enlarged accepted species concept.
  const nationalRedBook = structuredClone(original.nationalRedBook)
  if (c.originalScientificName !== c.acceptedScientificName) nationalRedBook.edition += `; запись под именем ${c.originalScientificName}`
  nationalRedBook.category = f.category || null
  if (f.category) national.supports.push('nationalRedBook.category')
  const { basis, claimsCurrentLegalStatus, ...publishedNational } = nationalRedBook
  const receipt = receipts.receipts.find(r => r.candidateId === c.id)
  if (!receipt) throw new Error(`${c.id}: missing photo decision`)
  const image = receipt.status === 'prepared' ? receipt.image : null
  if (image && receipt.visualReview?.reviewed !== true) throw new Error(`${c.id}: visual image review pending`)
  if (image) sources.push({ id: 'photo-commons', title: receipt.metadata.description || c.acceptedScientificName,
    publisher: 'Wikimedia Commons; ' + image.author, url: image.originalPage, accessedAt: '2026-10-14',
    supports: ['images.0.caption'], language: 'en' })
  const species = { id: c.id, scientificName: c.acceptedScientificName, names: { ru: f.nameRu, ky: null, uz: null, en: null },
    taxonomy, group: c.group, nationalRedBook: publishedNational, iucn: { category: null, year: null, sourceIds: [] },
    habitat: f.habitat ? { description: local(f.habitat), sourceIds: ['national-book'] } : null,
    regions: [{ type: 'country', code: 'KG', names: { ru: 'Кыргызстан', ky: 'Кыргызстан', uz: 'Qirgʻiziston', en: 'Kyrgyzstan' }, sourceIds: ['national-book'] }],
    threats: f.threats?.length ? f.threats.map(ru => ({ text: local(ru), sourceIds: ['national-book'] })) : null,
    conservationMeasures: f.conservation?.length ? f.conservation.map(ru => ({ text: local(ru), sourceIds: ['national-book'] })) : null,
    population: structuredClone(UNKNOWN_POPULATION), images: image ? [image] : [], sources, verified: false, lastReviewedAt: null, content }
  const errors = validateSpecies([species])
  if (errors.length) throw new Error(`${c.id}: ${errors.join('; ')}`)
  const path = `data/research/bulk-25-content/drafts/${c.id}.json`
  if (await saveUnchanged(path, species)) prepared++; else reused++
  const materials = await Promise.all([factsPath, evidencePath, receiptsPath].map(async path => ({ path, sha256: digest(await readFile(path)) })))
  Object.assign(c, { sources, nationalRedBook, draft: null, draftFile: path, materials: [...original.materials, ...materials],
    publicationGaps: ['Независимая научная/редакторская проверка и отдельное разрешение на импорт отсутствуют',
      'Названия KY/UZ/EN не подтверждены: используется научное имя', ...(image ? [] : ['Фото: placeholder'])],
    editorialNotes: f.editorialNotes || [], missingFacts: f.missingFacts || [], incidentalPopulationEvidence: f.populationEvidence || [],
    preparation: { status: 'prepared', sourceMasterId: c.id, factsFingerprint: fingerprint(f), draftSha256: digest(await readFile(path)) } })
}
block.status = 'prepared_for_check'
await save(registryPath, registry)
await save('data/research/bulk-25-content-manifest.json', manifest)
console.log(JSON.stringify({ block: n, newlyWritten: prepared, reused, approvalChanged: false, catalogChanged: false }))
