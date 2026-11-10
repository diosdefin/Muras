// Static pre-render for search engines. Runs after `vite build` and turns dist/index.html
// (the empty single-page shell) into one real HTML file per page and language:
//   /, /map, /territories, /species/<id>, /territories/<id>   (Kyrgyz, the default)
//   the same set under /uz, /ru and /en
// Each file carries its own <title>, description, canonical address, hreflang alternates,
// Open Graph tags and JSON-LD, plus a plain-HTML copy of the page text inside #app that the
// Vue app replaces on start. It also writes dist/sitemap.xml with every page and its alternates.
// The application itself is unchanged: it still boots from the same bundle.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { LANGUAGES, scientificContent } from '../src/data/localization.js'
import { languagePath } from '../src/data/language-routes.js'
import {
  HOME_ROUTE, MAP_ROUTE, SEO_TEXT, SITE_ORIGIN, TERRITORIES_ROUTE, absoluteUrl, metadataTags, pageMetadata,
  routeToPath, speciesRoute, territoryRoute,
} from '../src/data/seo.js'
import { groupLabel, nationalStatus, speciesName, statusDetails } from '../src/data/presentation.js'
import { areaDescription, areaName } from '../src/data/protected-areas.js'

const escape = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const attributes = values => Object.entries(values).map(([name, value]) => ` ${name}="${escape(value)}"`).join('')

function serialize(tag) {
  if (tag.tag === 'script') return `<script${attributes(tag.attrs)} data-seo>${tag.text.replace(/</g, '\\u003c')}</script>`
  return `<${tag.tag}${attributes(tag.attrs)} data-seo>`
}

// Plain-HTML copy of the page, visually hidden while the app starts; shown if scripts are disabled.
function fallbackHtml(route, language, data, species, areas) {
  const text = SEO_TEXT[language]
  const link = (path, label) => `<a href="${escape(languagePath(path, language))}">${escape(label)}</a>`
  const nav = `<nav>${[link('/', text.crumbHome), link('/map', text.crumbMap), link('/territories', text.crumbTerritories)].join(' · ')}</nav>`
  const meta = pageMetadata(route, language, data)
  const heading = meta.title.replace(/ [|—] MURAS$/, '')
  let body = `<h1>${escape(heading)}</h1><p>${escape(meta.description)}</p>`
  if (route.name === 'species' && data.species) {
    const record = data.species
    const habitat = scientificContent(record.habitat?.description, language).text
    body = `<h1>${escape(speciesName(record, language))}</h1><p><i>${escape(record.scientificName)}</i></p>`
      + `<p>${escape(groupLabel(record, language))} · ${escape(statusDetails(record, language).label)}</p>`
      + `<p>${escape(nationalStatus(record, language))}</p>${habitat ? `<p>${escape(habitat)}</p>` : ''}`
  } else if (route.name === 'home') {
    body += `<ul>${species.map(record => `<li>${link(routeToPath(speciesRoute(record.id)), `${speciesName(record, language)} (${record.scientificName})`)}</li>`).join('')}</ul>`
  } else if (route.name === 'territories') {
    body += `<ul>${areas.map(area => `<li>${link(routeToPath(territoryRoute(area.id)), areaName(area, language))}</li>`).join('')}</ul>`
  } else if (route.name === 'territory' && data.area) {
    body = `<h1>${escape(areaName(data.area, language))}</h1><p>${escape(areaDescription(data.area, language))}</p>`
  }
  return `<div class="seo-fallback" data-seo-fallback>${nav}<main>${body}</main></div>`
}

const HIDE_FALLBACK = '<style data-seo>.seo-fallback{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}</style>'
  + '<noscript><style data-seo>.seo-fallback{position:static;width:auto;height:auto;overflow:visible;clip:auto;white-space:normal;padding:24px}</style></noscript>'

// Returns the shell to its un-rendered state so running the step twice gives the same files.
export function resetTemplate(html) {
  return html
    .replace(/<noscript><style data-seo>[\s\S]*?<\/style><\/noscript>\s*/g, '')
    .replace(/<style data-seo>[\s\S]*?<\/style>\s*/g, '')
    .replace(/<script[^>]*\sdata-seo>[\s\S]*?<\/script>\s*/g, '')
    .replace(/<(?:meta|link)[^>]*\sdata-seo>\s*/g, '')
    .replace(/<div id="app">[\s\S]*?<\/main><\/div><\/div>/, '<div id="app"></div>')
    .replace(/\s*<\/head>/, '\n  </head>')
}

export function renderPage(template, route, language, data, species, areas) {
  const meta = pageMetadata(route, language, data)
  const head = [`<title>${escape(meta.title)}</title>`, ...metadataTags(meta).map(serialize), HIDE_FALLBACK].join('\n    ')
  const html = template
    .replace(/<html lang="[^"]*"/, `<html lang="${language}"`)
    .replace(/<title>[\s\S]*?<\/title>\s*/g, '')
    .replace(/<meta\s+(?:name="(?:description|twitter:[^"]*)"|property="og:[^"]*")[^>]*>\s*/g, '')
    .replace(/<link\s+rel="canonical"[^>]*>\s*/g, '')
    .replace(/\s*<\/head>/, () => `\n    ${head}\n  </head>`)
    .replace('<div id="app"></div>', () => `<div id="app">${fallbackHtml(route, language, data, species, areas)}</div>`)
  if (!html.includes('data-seo-fallback') || !html.includes('rel="canonical"')) throw new Error('Pre-render template has no <head> or #app container')
  return { html, meta }
}

function sitemap(entries) {
  const urls = entries.map(({ path, language, alternates }) => [
    '  <url>',
    `    <loc>${escape(absoluteUrl(path, language))}</loc>`,
    ...alternates.map(alternate => `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${escape(alternate.href)}"/>`),
    '  </url>',
  ].join('\n'))
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`
}

export async function prerender(root = process.cwd()) {
  const dist = resolve(root, 'dist')
  const template = resetTemplate(await readFile(resolve(dist, 'index.html'), 'utf8'))
  const species = JSON.parse(await readFile(resolve(root, 'public/data/species.json'), 'utf8'))
  const areas = JSON.parse(await readFile(resolve(root, 'public/data/protected-areas.json'), 'utf8')).areas
  const routes = [
    { route: HOME_ROUTE, data: { speciesCount: species.length } },
    { route: MAP_ROUTE, data: {} },
    { route: TERRITORIES_ROUTE, data: {} },
    ...species.map(record => ({ route: speciesRoute(record.id), data: { species: record } })),
    ...areas.map(area => ({ route: territoryRoute(area.id), data: { area } })),
  ]
  const entries = []
  for (const { route, data } of routes) {
    for (const language of LANGUAGES) {
      const { html, meta } = renderPage(template, route, language, data, species, areas)
      const address = languagePath(routeToPath(route), language)
      const file = resolve(dist, `.${address.endsWith('/') ? address : `${address}/`}index.html`)
      await mkdir(dirname(file), { recursive: true })
      await writeFile(file, html)
      entries.push({ path: routeToPath(route), language, alternates: meta.alternates })
    }
  }
  await writeFile(resolve(dist, 'sitemap.xml'), sitemap(entries))
  return { pages: entries.length, origin: SITE_ORIGIN }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { pages } = await prerender()
  console.log(`SEO: ${pages} pages pre-rendered (${LANGUAGES.length} languages), sitemap.xml written`)
}
