import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { PROJECT_ROOT } from './build-data.mjs'
import { taxonNameKey } from './lib/bulk-import.mjs'
import { digest, createRegistry, validateRegistry, createTaxonIndex, createQueueConflicts } from './lib/research-pipeline.mjs'

// Offline research preparation only. No network, approval, catalog writes or descriptions.
export function prepareMasterCandidates(lists, taxonomy, selection, source, materialHashes) {
  if (lists.documentType !== 'redbook-national-source-lists' || !Array.isArray(selection.recordIds) || selection.recordIds.length > 60) throw new Error('Нужны национальные перечни и выборка до 60 позиций')
  const book = lists.lists.find(s => s.sourceId === 'book-2006').records
  const law = lists.lists.find(s => s.sourceId === 'decree-170-2009').records
  const index = createTaxonIndex(source), existing = [], candidates = []
  // These bridges are documented by the existing scientific records/evidence.
  // The bustard is a concept overlap (parent/subspecies), never a synonym merge.
  const bridges = { 'Panthera uncia': 'Uncia uncia', 'Testudo horsfieldii': 'Agrionemys horsfieldi',
    'Glyptosternon reticulatum': 'Glyptosternum reticulatum', 'Albatrellus tianschanicus': 'Scutiger tianschanicus',
    'Abies sibirica semenovii': 'Abies semenovii', 'Otis tarda tarda': 'Otis tarda' }
  for (const s of source.catalog) {
    const nationalName = bridges[s.scientificName] || s.scientificName
    const record = book.find(r => taxonNameKey(r.scientificName) === taxonNameKey(nationalName))
    if (!record) throw new Error(`Не установлена национальная позиция существующей записи ${s.id}`)
    existing.push({ speciesId: s.id, scientificName: s.scientificName, nationalRecordId: record.recordId,
      nationalName: record.scientificName, group: s.group, sourceUrl: record.sourceUrl,
      relationship: s.id === 'great-bustard' || s.id === 'semenovs-fir' ? 'national_species_existing_subspecies_concept_overlap' :
        bridges[s.scientificName] ? 'documented_historical_name_bridge' : 'same_scientific_name',
      bridgeEvidence: s.sources.filter(r => r.supports.includes('scientificName')).map(r => ({ id: r.id, url: r.url })) })
  }
  const represented = new Set(existing.map(r => r.nationalRecordId))
  const candidateGaps = {
    326: 'Bufo viridis в национальном источнике — исторический комплекс; AMNH отмечает присутствие Bufotes viridis s.str. в KG как вероятное/спорное. Не подменять национальный концепт современным видом.',
    40: 'GBIF объединяет Dictyophora duplicata с Phallus indusiatus; микологические публикации обсуждают отдельный P. duplicatus и комплекс P. indusiatus s.l. Требуется специализированная сверка национального очерка.',
    392: 'В очереди также Falco pelegrinoides, который GBIF относит к Falco peregrinus pelegrinoides. Национальные два очерка нельзя автоматически импортировать как независимые непересекающиеся современные таксоны.',
    394: 'GBIF принимает Falco peregrinus pelegrinoides в ранге SUBSPECIES, национальный заголовок Falco pelegrinoides имеет ранг SPECIES; требуется разрешить пересечение с Falco peregrinus.'
  }
  for (const id of selection.recordIds) {
    const b = book.find(r => r.recordId === id)
    if (!b || represented.has(id)) throw new Error(`Выбрана отсутствующая или уже представленная позиция ${id}`)
    const evidence = taxonomy.records.findLast(r => r.nationalRecordId === id && r.requestedName === b.scientificName)
    if (!evidence) throw new Error(`Нет сохранённого таксономического запроса ${id}`)
    const match = evidence.match?.data, accepted = evidence.accepted?.data
    const resolved = match?.status === 'ACCEPTED' ? match : accepted
    const exact = match?.matchType === 'EXACT' && ['ACCEPTED', 'SYNONYM'].includes(match.status) &&
      taxonNameKey(match.canonicalName) === taxonNameKey(b.scientificName) &&
      (resolved?.status === 'ACCEPTED' || resolved?.taxonomicStatus === 'ACCEPTED') && resolved.rank === b.rank
    const contradictions = candidateGaps[b.pdfPage] ? [candidateGaps[b.pdfPage]] : []
    const usable = exact && !candidateGaps[b.pdfPage]
    const acceptedName = usable ? resolved.canonicalName : null
    const usageKey = usable ? resolved.usageKey || resolved.key : null
    const matchingLaw = law.filter(r => r.scientificName && r.group === b.group &&
      [b.scientificName, ...b.sameAccountAlternativeNames].some(n => taxonNameKey(n) === taxonNameKey(r.scientificName.replace(/\([^)]*\)/g, ''))))
    const scientificSources = [{ id: 'national-book', title: 'Красная книга Кыргызской Республики, 2-е издание, 2006',
      publisher: 'ГАОСЛХ при Правительстве КР; Биолого-почвенный институт НАН КР; ЭД «Алейне»',
      url: b.sourceUrl, accessedAt: '2026-10-14', language: 'ru',
      supports: ['nationalRedBook.listed', 'nationalRedBook.edition', 'nationalRedBook.year', 'group', 'regions.0', 'originalScientificName'] }]
    for (const [i, r] of matchingLaw.entries()) scientificSources.push({ id: `national-list-${i + 1}`,
      title: `Постановление №170 от 28.04.2005, редакция №471 от 25.07.2009: приложение ${r.annex}, строка ${r.row}`,
      publisher: 'Правительство Кыргызской Республики; документальная копия FAOLEX', url: r.sourceUrl,
      accessedAt: '2026-10-14', language: 'ru', supports: ['nationalRedBook.listed', 'nationalSourceRecords'] })
    const taxSource = { id: 'gbif-taxonomy', title: `GBIF Backbone: ${evidence.requestedName}`, publisher: 'GBIF',
      url: evidence.accepted?.url || evidence.match?.url, accessedAt: evidence.accessedAt, language: 'en',
      supports: usable ? ['scientificName'] : ['taxonomyResearch'] }
    if (usageKey) taxSource.taxonId = `gbif:${usageKey}`
    if (taxSource.url) scientificSources.push(taxSource)
    if (b.pdfPage === 326) scientificSources.push({ id: 'amnh-concept', title: 'Amphibian Species of the World 6.2: Bufotes viridis',
      publisher: 'American Museum of Natural History', url: 'https://amphibiansoftheworld.amnh.org/Amphibia/Anura/Bufonidae/Bufotes/Bufotes-viridis',
      accessedAt: '2026-10-14', language: 'en', supports: ['taxonomyResearch', 'contradictions'] })
    if (b.pdfPage === 40) scientificSources.push({ id: 'mycology-concept', title: 'Some New Records of Stinkhorns (Phallaceae) from Hollongapar Gibbon Wildlife Sanctuary, Assam, India (2014)',
      publisher: 'Journal of Mycology', url: 'https://onlinelibrary.wiley.com/doi/10.1155/2014/490847',
      accessedAt: '2026-10-14', language: 'en', supports: ['taxonomyResearch', 'contradictions'] })
    candidates.push({ id: b.scientificName.toLowerCase().replaceAll(' ', '-'), originalScientificName: b.scientificName,
      acceptedScientificName: acceptedName, rank: b.rank, group: b.group,
      nationalRedBook: { listed: true, category: null, edition: 'Красная книга Кыргызской Республики, 2-е издание 2006 (историческая национальная запись)',
        year: 2006, sourceIds: ['national-book'], basis: 'historical_edition', claimsCurrentLegalStatus: false },
      nationalSourceRecords: [b.recordId, ...matchingLaw.map(r => r.recordId)],
      nationalConfirmation: { confirmed: true, basis: 'individually_indexed_national_account', pdfPages: [b.pdfPage, b.russianAccountPage],
        year: 2006, currentLegalStatus: null },
      countryOccurrence: { countryCode: 'KG', confirmed: true, sourceIds: ['national-book'], basis: 'historical_national_account',
        sourceYear: 2006, taxonConcept: 'name_as_used_in_national_source', currentPresenceConfirmed: null },
      taxonomyEvidence: usable ? { canonicalName: acceptedName, rank: resolved.rank, status: 'ACCEPTED', matchType: 'EXACT',
        taxonId: `gbif:${usageKey}`, sourceId: 'gbif-taxonomy' } : null,
      taxonomySourceIds: usable ? ['gbif-taxonomy'] : [], sources: scientificSources,
      taxonomyResearch: { evidenceRecordId: id, requestedName: evidence.requestedName, matchType: match?.matchType || null,
        status: match?.status || null, proposedAcceptedName: resolved?.canonicalName || null, proposedRank: resolved?.rank || null,
        resolution: usable ? match.status === 'SYNONYM' ? 'exact_documented_synonym_same_rank' : 'exact_accepted_same_rank' : 'requires_resolution' },
      contradictions, missingData: usable ? [] : ['Точное принятое имя и национальная таксономическая концепция требуют сверки; FUZZY/NONE и изменение ранга не приняты автоматически'],
      publicationGaps: ['Публикационный черновик не подготовлен', 'Описания KY/UZ/RU/EN не подготовлены', 'Нужен независимый научный и редакторский просмотр', 'Фотография не исследовалась; возможен placeholder'],
      materials: Object.entries(materialHashes).map(([path, sha256]) => ({ path, sha256 })), draft: null, verified: false,
      priority: usable ? 'next_account_research' : 'taxonomic_concept_review' })
  }
  // Order complete scientific evidence first. Then keep the unresolved national
  // positions separately within the last batches, rather than hiding their gaps.
  candidates.sort((a,b) => Number(Boolean(b.taxonomyEvidence) && !b.contradictions.length) - Number(Boolean(a.taxonomyEvidence) && !a.contradictions.length) ||
    book.find(r => r.recordId === a.nationalSourceRecords[0]).pdfPage - book.find(r => r.recordId === b.nationalSourceRecords[0]).pdfPage)
  const registry = createRegistry(candidates, { registryId: 'redbook-master-60', batchSize: 25 })
  validateRegistry(registry)
  const conflicts = createQueueConflicts(registry)
  if (conflicts.size) throw new Error(`Дубли/пересечения внутри первой очереди: ${[...conflicts.keys()].join(', ')}`)
  for (const c of candidates) {
    for (const name of [c.originalScientificName, c.acceptedScientificName].filter(Boolean)) {
      const key=taxonNameKey(name)
      if (index.names.has(key) || [...index.names].some(([n]) => n.startsWith(`${key} `) || key.startsWith(`${n} `)) ||
        index.taxonIds.has(c.taxonomyEvidence?.taxonId) || index.ids.has(c.id)) throw new Error(`Кандидат дублирует каталог/архив: ${c.id}`)
    }
  }
  const selected = new Set(selection.recordIds)
  const reconciliation = { schemaVersion: 1, documentType: 'redbook-master-reconciliation', notForPublication: true,
    researchedAt: '2026-10-14', existing,
    bookPositions: book.map(r => ({ nationalRecordId: r.recordId, scientificName: r.scientificName, group: r.group,
      status: represented.has(r.recordId) ? 'represented_in_muras' : selected.has(r.recordId) ? 'selected_candidate' :
        r.pdfPage === 92 ? 'confirmed_synonym_of_selected_candidate' : 'requires_research',
      existingId: existing.find(e => e.nationalRecordId === r.recordId)?.speciesId || null,
      candidateId: candidates.find(c => c.nationalSourceRecords[0] === r.recordId)?.id || null,
      ...(r.pdfPage === 92 ? { synonymOfCandidate: 'tulipa-korolkowii', evidence: 'docs/evidence/redbook-master-taxonomy.json: book-2006-92 -> gbif:5299568' } : {}) })),
    sourceComparison: book.map(b => {
      const matching = law.filter(r => r.scientificName && r.group === b.group &&
        [b.scientificName, ...b.sameAccountAlternativeNames].some(n => taxonNameKey(n) === taxonNameKey(r.scientificName.replace(/\([^)]*\)/g, ''))))
      return { bookRecordId: b.recordId, decreeRecordIds: matching.map(r=>r.recordId),
        state: matching.length === 1 ? 'same_name_or_same_account_alternative' : 'needs_spelling_or_concept_reconciliation' }
    }),
    groups: ['mammals','birds','reptiles','amphibians','fish','arthropods','plants','fungi'].map(group => ({ group,
      nationalBookPositions: book.filter(r=>r.group===group).length, national2009ListedPositions: law.filter(r=>r.group===group&&r.scientificName).length,
      existing: source.catalog.filter(s=>s.group===group).length, selected: candidates.filter(c=>c.group===group).length,
      taxonomyResolved: candidates.filter(c=>c.group===group&&c.taxonomyEvidence).length })),
    counts: { bookPositions: book.length, existingRecords: existing.length, nationalPositionsOutsideMuras: book.length - existing.length,
      selectedCandidates: candidates.length, taxonomyResolved: candidates.filter(c=>c.taxonomyEvidence).length,
      taxonomyNeedsReview: candidates.filter(c=>!c.taxonomyEvidence).length, outsideSelectedQueue: book.length - existing.length - candidates.length,
      confirmedSynonymOutsideQueue: 1 },
    batches: Array.from({length: Math.ceil(candidates.length/25)},(_,i)=>({ batchId:`redbook-master-60-${i+1}`,number:i+1,
      candidates:candidates.slice(i*25,(i+1)*25).map(c=>({id:c.id,originalScientificName:c.originalScientificName,acceptedScientificName:c.acceptedScientificName,
        nationalSourceRecords:c.nationalSourceRecords,degreeOfReadiness:c.taxonomyEvidence?'scientific_evidence_collected_no_draft':'needs_taxonomic_evidence',
        duplicateCheck:'no_catalog_archive_or_queue_duplicate',gaps:[...c.missingData,...c.contradictions,...c.publicationGaps]})) })) }
  return { candidates, reconciliation }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const read = async path => JSON.parse(await readFile(resolve(PROJECT_ROOT,path),'utf8'))
    const materialPaths=['data/research/redbook-master-national-lists.json','docs/evidence/redbook-master-taxonomy.json','docs/evidence/redbook-master-sources.json']
    const materialHashes=Object.fromEntries(await Promise.all(materialPaths.map(async path=>[path,digest(await readFile(resolve(PROJECT_ROOT,path)))])))
    const result=prepareMasterCandidates(await read(materialPaths[0]), await read(materialPaths[1]),
      await read('data/research/redbook-master-selection.json'), await read('data/species.source.json'), materialHashes)
    await writeFile(resolve(PROJECT_ROOT,'data/research/redbook-master-candidates.json'),JSON.stringify(result.candidates,null,2)+'\n')
    await writeFile(resolve(PROJECT_ROOT,'data/research/redbook-master-reconciliation.json'),JSON.stringify(result.reconciliation,null,2)+'\n')
    console.log(JSON.stringify(result.reconciliation.counts,null,2))
  } catch(error) { console.error(error.message); process.exitCode=1 }
}
