// Search-engine metadata shared by the running app and the static pre-render step
// (scripts/prerender-seo.mjs), so a crawler and a browser always see the same title,
// description, canonical address, language alternates and structured data.
import { LANGUAGES, scientificContent, validLanguage } from './localization.js'
import { DEFAULT_LANGUAGE, languagePath } from './language-routes.js'
import { speciesIdFromPath, speciesPath } from './species-routes.js'
import { areaIdFromPath, areaPath, areaDescription, areaName, isAreasListPath, primaryPhoto } from './protected-areas.js'
import { groupLabel, speciesName, speciesPhoto, statusDetails } from './presentation.js'
import { OG_LOCALES } from './brand.js'

export const SITE_ORIGIN = 'https://muras.dev'
export const SITE_NAME = 'MURAS'
export const DEFAULT_SHARE_IMAGE = '/icons/icon-512.png'
export const HREFLANG = Object.freeze({ ky: 'ky', uz: 'uz', ru: 'ru', en: 'en' })

// Titles and descriptions are written for search results, not for the interface, so they live here
// rather than in the locale files. They name the Red Book of Kyrgyzstan in every language.
export const SEO_TEXT = Object.freeze({
  ky: {
    suffix: 'Кыргызстандын Кызыл китеби | MURAS',
    homeTitle: 'MURAS — Кыргызстандын Кызыл китеби: сейрек жана жоголуп бара жаткан түрлөр',
    home: count => `Кыргызстандын Кызыл китеби онлайн: сейрек жана жоголуп бара жаткан өсүмдүктөр, жаныбарлар, козу карындар — сүрөт, коргоо абалы, таралышы.${count ? ` Түрлөр: ${count}.` : ''}`,
    mapTitle: 'Кыргызстандын Кызыл китебиндеги түрлөрдүн картасы — MURAS',
    map: 'Кыргызстандын облустары боюнча Кызыл китептеги сейрек түрлөр: ар бир аймакта документтештирилген түрлөр жана алардын булактары.',
    territoriesTitle: 'Кыргызстандын корукторлору жана улуттук парктары — MURAS',
    territories: 'Мамлекеттик жаратылыш корукторунун жана улуттук парктардын тизмеси: жайгашкан жери, аянты жана ал жерде корголгон сейрек түрлөр.',
    territorySuffix: 'Кыргызстандын корголуучу аймактары | MURAS',
    crumbHome: 'MURAS', crumbMap: 'Карта', crumbTerritories: 'Корголуучу аймактар',
  },
  uz: {
    suffix: 'Qirgʻiziston Qizil kitobi | MURAS',
    homeTitle: 'MURAS — Qirgʻiziston Qizil kitobi: noyob va yoʻqolib borayotgan turlar',
    home: count => `Qirgʻiziston Qizil kitobi onlayn: noyob va yoʻqolib borayotgan oʻsimlik, hayvon va zamburugʻlar — suratlar, muhofaza holati, tarqalishi.${count ? ` Turlar: ${count}.` : ''}`,
    mapTitle: 'Qirgʻiziston Qizil kitobidagi turlar xaritasi — MURAS',
    map: 'Qirgʻiziston viloyatlari boʻyicha Qizil kitobdagi noyob turlar: har bir hududda hujjatlashtirilgan turlar va ularning manbalari.',
    territoriesTitle: 'Qirgʻiziston qoʻriqxonalari va milliy bogʻlari — MURAS',
    territories: 'Davlat qoʻriqxonalari va milliy bogʻlar roʻyxati: joylashuvi, maydoni va u yerda muhofaza etiladigan noyob turlar.',
    territorySuffix: 'Qirgʻizistonning muhofaza etiladigan hududlari | MURAS',
    crumbHome: 'MURAS', crumbMap: 'Xarita', crumbTerritories: 'Muhofaza etiladigan hududlar',
  },
  ru: {
    suffix: 'Красная книга Кыргызстана | MURAS',
    homeTitle: 'MURAS — Красная книга Кыргызстана: редкие и исчезающие виды',
    home: count => `Красная книга Кыргызстана онлайн: редкие и исчезающие виды растений, животных и грибов — фото, статус охраны, ареалы.${count ? ` Видов в каталоге: ${count}.` : ''}`,
    mapTitle: 'Карта видов Красной книги Кыргызстана по областям — MURAS',
    map: 'Редкие виды из Красной книги Кыргызстана по областям: какие виды документально подтверждены в каждом регионе и на какие источники это опирается.',
    territoriesTitle: 'Заповедники и национальные парки Кыргызстана — MURAS',
    territories: 'Государственные заповедники и национальные парки Кыргызстана: расположение, площадь и редкие виды, которые там охраняются.',
    territorySuffix: 'Охраняемые территории Кыргызстана | MURAS',
    crumbHome: 'MURAS', crumbMap: 'Карта', crumbTerritories: 'Охраняемые территории',
  },
  en: {
    suffix: 'Red Book of Kyrgyzstan | MURAS',
    homeTitle: 'MURAS — Red Book of Kyrgyzstan: rare and endangered species',
    home: count => `Red Book of Kyrgyzstan online: rare and endangered plants, animals and fungi — photos, conservation status, ranges.${count ? ` Species in the catalogue: ${count}.` : ''}`,
    mapTitle: 'Map of Red Book species of Kyrgyzstan by region — MURAS',
    map: 'Rare species from the Red Book of Kyrgyzstan by region: which species are documented in each oblast and the sources behind it.',
    territoriesTitle: 'Nature reserves and national parks of Kyrgyzstan — MURAS',
    territories: 'State nature reserves and national parks of Kyrgyzstan: location, area and the rare species they protect.',
    territorySuffix: 'Protected areas of Kyrgyzstan | MURAS',
    crumbHome: 'MURAS', crumbMap: 'Map', crumbTerritories: 'Protected areas',
  },
})

export const HOME_ROUTE = Object.freeze({ name: 'home' })
export const MAP_ROUTE = Object.freeze({ name: 'map' })
export const TERRITORIES_ROUTE = Object.freeze({ name: 'territories' })
export const speciesRoute = id => ({ name: 'species', id })
export const territoryRoute = id => ({ name: 'territory', id })

// Unprefixed route path for a route object (the language prefix is added separately).
export function routeToPath(route) {
  switch (route?.name) {
    case 'map': return '/map'
    case 'territories': return '/territories'
    case 'species': return speciesPath(route.id)
    case 'territory': return areaPath(route.id)
    default: return '/'
  }
}

// Inverse of routeToPath for an unprefixed pathname; unknown paths fall back to the home route.
export function routeFromPath(pathname) {
  const path = typeof pathname === 'string' ? pathname : '/'
  const speciesId = speciesIdFromPath(path)
  if (speciesId) return speciesRoute(speciesId)
  const areaId = areaIdFromPath(path)
  if (areaId) return territoryRoute(areaId)
  if (isAreasListPath(path)) return TERRITORIES_ROUTE
  if (path.replace(/\/$/, '') === '/map') return MAP_ROUTE
  return HOME_ROUTE
}

export const absoluteUrl = (path, language) => `${SITE_ORIGIN}${languagePath(path, language)}`

function shorten(text, max = 158) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  const space = cut.lastIndexOf(' ')
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:—-]+$/, '')}…`
}

const displayName = (species, language) => {
  const name = speciesName(species, language)
  return name === species.scientificName ? name : `${name} (${species.scientificName})`
}

function speciesDescription(species, language) {
  const habitat = scientificContent(species.habitat?.description, language).text
  const head = `${displayName(species, language)} — ${groupLabel(species, language)}, ${statusDetails(species, language).label}.`
  return shorten(habitat ? `${head} ${habitat}` : head)
}

const imageUrl = path => (typeof path === 'string' && path.startsWith('/') ? `${SITE_ORIGIN}${path}` : null)

function breadcrumb(language, items) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: item.url })),
  }
}

// Everything a page needs for search engines. `data` carries what the route needs: { species, area, speciesCount }.
export function pageMetadata(route, language, data = {}) {
  const lang = validLanguage(language) ? language : DEFAULT_LANGUAGE
  const text = SEO_TEXT[lang]
  const species = route?.name === 'species' ? data.species : null
  const area = route?.name === 'territory' ? data.area : null
  // A route whose record is missing degrades to the home page instead of inventing content.
  const effective = species ? route : area ? route : route?.name === 'map' || route?.name === 'territories' ? route : HOME_ROUTE
  const path = routeToPath(effective)
  const canonical = absoluteUrl(path, lang)
  const home = { name: text.crumbHome, url: absoluteUrl('/', lang) }
  let title = text.homeTitle
  let description = text.home(data.speciesCount)
  let image = `${SITE_ORIGIN}${DEFAULT_SHARE_IMAGE}`
  let type = 'website'
  const jsonLd = []

  if (effective.name === 'home') {
    jsonLd.push({
      '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, alternateName: ['Мурас', 'Muras', 'MURAS Red Book of Kyrgyzstan'],
      url: `${SITE_ORIGIN}/`, inLanguage: LANGUAGES.map(code => HREFLANG[code]), description,
    })
  } else if (effective.name === 'map') {
    title = text.mapTitle; description = text.map
    jsonLd.push(breadcrumb(lang, [home, { name: text.crumbMap, url: canonical }]))
  } else if (effective.name === 'territories') {
    title = text.territoriesTitle; description = text.territories
    jsonLd.push(breadcrumb(lang, [home, { name: text.crumbTerritories, url: canonical }]))
  } else if (species) {
    const name = speciesName(species, lang)
    title = `${displayName(species, lang)} — ${text.suffix}`
    description = speciesDescription(species, lang)
    type = 'article'
    const photo = imageUrl(speciesPhoto(species)?.path)
    if (photo) image = photo
    const others = [...new Set([species.scientificName, ...LANGUAGES.map(code => speciesName(species, code))].filter(value => value && value !== name))]
    jsonLd.push({
      '@context': 'https://schema.org', '@type': 'Taxon', name, alternateName: others, description, url: canonical,
      ...(photo ? { image: photo } : {}),
    }, breadcrumb(lang, [home, { name, url: canonical }]))
  } else if (area) {
    const name = areaName(area, lang)
    title = `${name} — ${text.territorySuffix}`
    description = shorten(areaDescription(area, lang) || name)
    const photo = imageUrl(primaryPhoto(area)?.path)
    if (photo) image = photo
    jsonLd.push({
      '@context': 'https://schema.org', '@type': 'Place', name, description, url: canonical,
      containedInPlace: { '@type': 'Country', name: lang === 'ru' ? 'Кыргызстан' : lang === 'ky' ? 'Кыргызстан' : lang === 'uz' ? 'Qirgʻiziston' : 'Kyrgyzstan' },
      ...(photo ? { image: photo } : {}),
    }, breadcrumb(lang, [home, { name: text.crumbTerritories, url: absoluteUrl('/territories', lang) }, { name, url: canonical }]))
  }

  const alternates = [
    ...LANGUAGES.map(code => ({ hreflang: HREFLANG[code], href: absoluteUrl(path, code) })),
    { hreflang: 'x-default', href: absoluteUrl(path, DEFAULT_LANGUAGE) },
  ]
  return { language: lang, path, canonical, alternates, title, description: shorten(description, 200), image, type, jsonLd, route: effective }
}

// Flat list of tags for <head>. `unique` tags replace an existing tag matching `selector`;
// tags with a `group` are removed and re-added as a set (language alternates, structured data).
export function metadataTags(meta) {
  const locale = OG_LOCALES[meta.language]
  const tags = [
    { tag: 'meta', selector: 'meta[name="description"]', attrs: { name: 'description', content: meta.description } },
    { tag: 'link', selector: 'link[rel="canonical"]', attrs: { rel: 'canonical', href: meta.canonical } },
    { tag: 'meta', selector: 'meta[property="og:title"]', attrs: { property: 'og:title', content: meta.title } },
    { tag: 'meta', selector: 'meta[property="og:description"]', attrs: { property: 'og:description', content: meta.description } },
    { tag: 'meta', selector: 'meta[property="og:type"]', attrs: { property: 'og:type', content: meta.type } },
    { tag: 'meta', selector: 'meta[property="og:url"]', attrs: { property: 'og:url', content: meta.canonical } },
    { tag: 'meta', selector: 'meta[property="og:image"]', attrs: { property: 'og:image', content: meta.image } },
    { tag: 'meta', selector: 'meta[property="og:locale"]', attrs: { property: 'og:locale', content: locale } },
    { tag: 'meta', selector: 'meta[name="twitter:card"]', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
    { tag: 'meta', selector: 'meta[name="twitter:title"]', attrs: { name: 'twitter:title', content: meta.title } },
    { tag: 'meta', selector: 'meta[name="twitter:description"]', attrs: { name: 'twitter:description', content: meta.description } },
    { tag: 'meta', selector: 'meta[name="twitter:image"]', attrs: { name: 'twitter:image', content: meta.image } },
  ]
  for (const code of LANGUAGES) if (code !== meta.language) tags.push({ tag: 'meta', group: 'og-locale-alternate', attrs: { property: 'og:locale:alternate', content: OG_LOCALES[code] } })
  for (const alternate of meta.alternates) tags.push({ tag: 'link', group: 'hreflang', attrs: { rel: 'alternate', hreflang: alternate.hreflang, href: alternate.href } })
  meta.jsonLd.forEach(entry => tags.push({ tag: 'script', group: 'jsonld', attrs: { type: 'application/ld+json' }, text: JSON.stringify(entry) }))
  return tags
}

const GROUP_SELECTORS = Object.freeze({
  'og-locale-alternate': 'meta[property="og:locale:alternate"]',
  hreflang: 'link[rel="alternate"][hreflang]',
  jsonld: 'script[type="application/ld+json"][data-seo]',
})

// Applies the metadata to a live document. Never throws: a missing or partial DOM (tests, embedded
// renderers) must not break the page, and metadata is only a progressive enhancement.
export function applySeoMetadata(document, meta) {
  try {
    if (!document?.head || typeof document.querySelector !== 'function' || typeof document.createElement !== 'function') return false
    document.documentElement.lang = meta.language
    document.title = meta.title
    const set = (element, tag) => {
      for (const [name, value] of Object.entries(tag.attrs)) element.setAttribute(name, value)
      if (tag.text !== undefined) element.textContent = tag.text
      element.setAttribute('data-seo', '')
    }
    for (const selector of Object.values(GROUP_SELECTORS)) document.querySelectorAll(selector).forEach(element => element.remove())
    for (const tag of metadataTags(meta)) {
      let element = tag.selector ? document.querySelector(tag.selector) : null
      if (!element) { element = document.createElement(tag.tag); document.head.appendChild(element) }
      set(element, tag)
    }
    return true
  } catch { return false }
}
