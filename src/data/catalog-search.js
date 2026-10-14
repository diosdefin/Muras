import { groupLabel, localized, regionNames, STATUS_DETAILS } from './presentation.js'
import { availableGroups } from './species-groups.js'

export function normalizeSearch(value) {
  return typeof value === 'string' ? value.normalize('NFC').toLowerCase().replace(/ё/g, 'е')
    .replace(/[’‘ʻʼ`']/g, "'").trim().replace(/\s+/g, ' ') : ''
}

// Latin aliases only. Original Kyrgyz Cyrillic remains distinct (ө/о, ү/у, ң/н).
const transliteration = { а:'a', б:'b', в:'v', г:'g', д:'d', е:'e', ж:'zh', з:'z', и:'i', й:'y', к:'k', л:'l', м:'m', н:'n', ң:'ng', о:'o', ө:'ö', п:'p', р:'r', с:'s', т:'t', у:'u', ү:'ü', ф:'f', х:'kh', ц:'ts', ч:'ch', ш:'sh', щ:'shch', ъ:'', ы:'y', ь:'', э:'e', ю:'yu', я:'ya' }
const latin = value => [...value].map(char => transliteration[char] ?? char).join('')
const asciiLatin = value => value.replace(/ö/g, 'o').replace(/ü/g, 'u')
const words = value => value.split(/[^\p{L}\p{N}]+/u).filter(Boolean)

export function createSearchIndex(catalog) {
  return catalog.map((species, order) => {
    const names = [...Object.entries(species.names || {}), ['la', species.scientificName]]
    const aliases = []
    for (const [language, name] of names) {
      const text = normalizeSearch(name)
      if (!text) continue
      aliases.push({ text, tokens: words(text), name, language, transliterated: false })
      if (['ru', 'ky'].includes(language)) {
        for (const variant of new Set([latin(text), asciiLatin(latin(text))])) {
          if (variant !== text) aliases.push({ text: variant, tokens: words(variant), name, language, transliterated: true })
        }
      }
    }
    return { species, order, aliases }
  })
}

const protectedPair = (a, b) => ['өо', 'оө', 'үу', 'уү', 'ңн', 'нң'].includes(a + b)
export function typoDistance(a, b, limit = 2) {
  const foldProtected = value => value.replace(/ө/g, 'о').replace(/ү/g, 'у').replace(/ң/g, 'н')
  if (a !== b && foldProtected(a) === foldProtected(b)) return limit + 1
  if (Math.abs(a.length - b.length) > limit) return limit + 1
  const rows = [Array.from({ length: b.length + 1 }, (_, n) => n)]
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : protectedPair(a[i - 1], b[j - 1]) ? limit + 1 : 1
      row[j] = Math.min(rows[i - 1][j] + 1, row[j - 1] + 1, rows[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) row[j] = Math.min(row[j], rows[i - 2][j - 2] + 1)
    }
    rows.push(row)
  }
  return rows[a.length][b.length]
}

function directScore(alias, query, tokens) {
  if (alias.text === query) return 0
  if (alias.text.startsWith(query)) return 1
  if (alias.text.includes(query)) return 2
  if (tokens.length > 1 && tokens.every(token => alias.tokens.some(word => word.includes(token)))) return 3
  return Infinity
}
function fuzzyScore(alias, tokens) {
  // Avoid speculative correction of short abbreviations or transliteration variants.
  if (alias.transliterated || tokens.some(token => token.length < 4)) return Infinity
  let total = 0
  const used = new Set()
  for (const token of tokens) {
    const budget = token.length >= 8 ? 2 : 1
    let best = Infinity, bestIndex = -1
    alias.tokens.forEach((word, index) => {
      if (used.has(index) || /[а-яөүң]/u.test(token) !== /[а-яөүң]/u.test(word)) return
      const distance = typoDistance(token, word, budget)
      if (distance < best) { best = distance; bestIndex = index }
    })
    if (best > budget) return Infinity
    used.add(bestIndex); total += best
  }
  return total > 0 && total <= 2 ? total : Infinity
}

export function searchSpecies(index, value) {
  const query = normalizeSearch(value), tokens = words(query)
  if (!query) return index.map(item => ({ species: item.species, kind: 'all', matchedName: null, language: 'ru' }))
  if (query.length > 120 || !tokens.length) return []
  const collect = fuzzy => index.map(item => {
    let best = null
    for (const alias of item.aliases) {
      const score = fuzzy ? fuzzyScore(alias, tokens) : directScore(alias, query, tokens) + (alias.transliterated ? 4 : 0)
      if (Number.isFinite(score) && (!best || score < best.score)) best = { score, species: item.species, order: item.order, matchedName: alias.name, language: alias.language, matchedLanguages: [alias.language], kind: fuzzy ? 'fuzzy' : alias.transliterated ? 'transliteration' : 'direct' }
      else if (Number.isFinite(score) && score === best?.score && !best.matchedLanguages.includes(alias.language)) best.matchedLanguages.push(alias.language)
    }
    return best
  }).filter(Boolean).sort((a, b) => a.score - b.score || a.order - b.order)
  const direct = collect(false)
  return direct.length ? direct : collect(true)
}

export function matchesCatalogFilters(species, { status = 'ALL', region = 'ALL', group = 'ALL' } = {}) {
  const regions = regionNames(species)
  return (status === 'ALL' || (species.iucn?.category || 'UNKNOWN') === status) &&
    (group === 'ALL' || species.group === group) &&
    (region === 'ALL' || regions.includes(region) || region === 'Регион неизвестен' && !regions.length)
}
export function catalogOptions(catalog) {
  const presentStatuses = new Set(catalog.map(species => species.iucn?.category || 'UNKNOWN'))
  const presentGroups = availableGroups(catalog)
  return {
    statuses: [{ value: 'ALL', label: 'Все категории' }, ...Object.entries(STATUS_DETAILS).filter(([key]) => presentStatuses.has(key)).map(([value, detail]) => ({ value, label: `IUCN ${value} · ${detail.label}` })), ...(presentStatuses.has('UNKNOWN') ? [{ value: 'UNKNOWN', label: 'IUCN · статус неизвестен' }] : [])],
    groups: [{ value: 'ALL', label: 'Все группы' }, ...presentGroups.map(value => ({ value, label: groupLabel({ group: value }) }))],
    regions: ['ALL', ...new Set(catalog.flatMap(species => regionNames(species).length ? regionNames(species) : ['Регион неизвестен']))],
  }
}
export const PAGE_SIZE = 12
export function catalogPage(results, limit = PAGE_SIZE) {
  const count = Number.isFinite(limit) ? Math.max(PAGE_SIZE, Math.floor(limit)) : PAGE_SIZE
  return { entries: results.slice(0, count), remaining: Math.max(0, results.length - count) }
}
export function briefDescription(species) {
  const text = localized(species.habitat?.description)
  return text ? text.split(/(?<=[.!?])\s+/u)[0] : 'Сведения о местообитании пока не подтверждены.'
}
