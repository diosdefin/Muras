import { UNKNOWN_POPULATION } from '../../src/data/population.js'
import { emptyContent } from '../../src/data/species-content.js'

// Entirely synthetic, reserved for temporary test projects. The IDs and citations
// simulate upstream contracts; they are not claims about real taxa or documents.
export function syntheticCandidate(number) {
  const id = `synthetic-${number}`, scientificName = `Testophyta taxon${number}`, taxonId = `gbif:${80000000 + number}`
  const sources = [{ id: 'synthetic-evidence', title: 'SYNTHETIC TEST ONLY', publisher: 'Temporary test fixture',
    url: `https://example.invalid/test/${number}`, accessedAt: '2026-10-14', language: 'en', taxonId,
    supports: ['scientificName', 'group', 'taxonomy.genus', 'nationalRedBook.listed', 'nationalRedBook.edition', 'nationalRedBook.year', 'regions.0', 'content.shortDescription', 'content.overview'] }]
  const national = { listed: true, category: null, edition: 'Synthetic historical edition (историческая тестовая запись)', year: 2006, sourceIds: ['synthetic-evidence'] }
  const draft = { id, scientificName, names: { ky: null, uz: null, ru: null, en: null },
    taxonomy: { kingdom: null, phylum: null, class: null, order: null, family: null, genus: 'Testophyta' }, group: 'plants',
    nationalRedBook: national, iucn: { category: null, year: null, sourceIds: [] }, habitat: null,
    regions: [{ code: 'KG', type: 'country', names: { ky: null, uz: null, ru: null, en: null }, sourceIds: ['synthetic-evidence'] }],
    threats: null, conservationMeasures: null, population: structuredClone(UNKNOWN_POPULATION), images: [], sources,
    verified: false, lastReviewedAt: null, content: { ...emptyContent(),
      shortDescription: { text: { ky: null, uz: null, ru: 'Синтетическое описание для теста.', en: null }, sourceIds: ['synthetic-evidence'] },
      overview: { text: { ky: null, uz: null, ru: 'Синтетический полный текст только для временного каталога теста.', en: null }, sourceIds: ['synthetic-evidence'] } } }
  return { id, originalScientificName: scientificName, acceptedScientificName: scientificName, rank: 'SPECIES', group: 'plants',
    nationalRedBook: { ...national, basis: 'historical_edition', claimsCurrentLegalStatus: false },
    countryOccurrence: { countryCode: 'KG', confirmed: true, sourceIds: ['synthetic-evidence'] },
    taxonomyEvidence: { canonicalName: scientificName, rank: 'SPECIES', status: 'ACCEPTED', matchType: 'EXACT', taxonId, sourceId: 'synthetic-evidence' },
    taxonomySourceIds: ['synthetic-evidence'], sources, draft, contradictions: [], missingData: [], materials: [] }
}
