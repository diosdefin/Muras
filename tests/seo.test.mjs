import test from 'node:test'
import assert from 'node:assert/strict'
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { LANGUAGES } from '../src/data/localization.js'
import { languageFromPath, languagePath, splitLanguagePath } from '../src/data/language-routes.js'
import {
  HOME_ROUTE, MAP_ROUTE, SITE_ORIGIN, TERRITORIES_ROUTE, absoluteUrl, applySeoMetadata, metadataTags, pageMetadata,
  routeFromPath, routeToPath, speciesRoute, territoryRoute,
} from '../src/data/seo.js'
import { prerender, resetTemplate } from '../scripts/prerender-seo.mjs'

const read = async path => JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'))
const species = await read('public/data/species.json')
const areas = (await read('public/data/protected-areas.json')).areas

test('a language prefix is split off and added back without loss; Kyrgyz stays unprefixed', () => {
  assert.deepEqual(splitLanguagePath('/ru/species/irbis'), { language: 'ru', path: '/species/irbis' })
  assert.deepEqual(splitLanguagePath('/uz'), { language: 'uz', path: '/' })
  assert.deepEqual(splitLanguagePath('/en/'), { language: 'en', path: '/' })
  assert.deepEqual(splitLanguagePath('/species/irbis'), { language: null, path: '/species/irbis' })
  assert.deepEqual(splitLanguagePath('/ruby'), { language: null, path: '/ruby' })
  assert.deepEqual(splitLanguagePath('/admin'), { language: null, path: '/admin' })
  assert.equal(languageFromPath('/uz/map'), 'uz')
  assert.equal(languageFromPath('/map'), null)
  for (const language of LANGUAGES) for (const path of ['/', '/map', '/territories', '/species/irbis', '/territories/issyk-kul-reserve']) {
    assert.equal(splitLanguagePath(languagePath(path, language)).path, path)
    assert.equal(languageFromPath(languagePath(path, language)), language === 'ky' ? null : language)
  }
  assert.equal(languagePath('/', 'ky'), '/')
  assert.equal(languagePath('/', 'ru'), '/ru/')
  assert.equal(languagePath('/species/irbis', 'en'), '/en/species/irbis')
  assert.equal(languagePath('/ru/map', 'uz'), '/uz/map', 'an already prefixed path is re-prefixed, never doubled')
})

test('routes round-trip through their paths and unknown paths fall back to home', () => {
  for (const route of [HOME_ROUTE, MAP_ROUTE, TERRITORIES_ROUTE, speciesRoute('irbis'), territoryRoute('issyk-kul-reserve')]) {
    assert.deepEqual(routeFromPath(routeToPath(route)), route)
  }
  assert.deepEqual(routeFromPath('/map/'), MAP_ROUTE)
  assert.deepEqual(routeFromPath('/nonsense'), HOME_ROUTE)
  assert.deepEqual(routeFromPath('/species/'), HOME_ROUTE)
})

test('every page gets a distinct canonical address, a reciprocal hreflang set and the Red Book in its title', () => {
  const home = Object.fromEntries(LANGUAGES.map(language => [language, pageMetadata(HOME_ROUTE, language, { speciesCount: species.length })]))
  assert.match(home.ru.title, /Красная книга Кыргызстана/)
  assert.match(home.ky.title, /Кыргызстандын Кызыл китеби/)
  assert.match(home.uz.title, /Qirgʻiziston Qizil kitobi/)
  assert.match(home.en.title, /Red Book of Kyrgyzstan/)
  assert.equal(new Set(LANGUAGES.map(language => home[language].canonical)).size, 4)
  assert.equal(home.ky.canonical, `${SITE_ORIGIN}/`)
  assert.equal(home.ru.canonical, `${SITE_ORIGIN}/ru/`)
  for (const language of LANGUAGES) {
    const { alternates, canonical } = home[language]
    assert.equal(alternates.length, 5)
    assert.ok(alternates.some(item => item.hreflang === language && item.href === canonical), 'self-reference')
    assert.equal(alternates.find(item => item.hreflang === 'x-default').href, `${SITE_ORIGIN}/`)
    assert.deepEqual(alternates, home.ky.alternates, 'identical alternate set on every language version')
  }
  const titles = new Map()
  for (const language of LANGUAGES) for (const record of species) {
    const meta = pageMetadata(speciesRoute(record.id), language, { species: record })
    assert.ok(meta.title.length > 10 && meta.title.length <= 120, `${record.id} ${language}: title length`)
    assert.ok(meta.description.length >= 40 && meta.description.length <= 200, `${record.id} ${language}: description length ${meta.description.length}`)
    assert.ok(meta.canonical.endsWith(`/species/${record.id}`))
    assert.ok(!titles.has(`${language}|${meta.title}`), `${language}: duplicate title ${meta.title} (${record.id} / ${titles.get(`${language}|${meta.title}`)})`)
    titles.set(`${language}|${meta.title}`, record.id)
    assert.ok(!/undefined|null|\[object/.test(meta.title + meta.description), `${record.id} ${language}`)
  }
  for (const language of LANGUAGES) for (const area of areas) {
    const meta = pageMetadata(territoryRoute(area.id), language, { area })
    assert.ok(meta.description.length >= 20 && meta.canonical.endsWith(`/territories/${area.id}`), `${area.id} ${language}`)
  }
})

test('a route whose record is missing degrades to the home page instead of inventing a page', () => {
  const meta = pageMetadata(speciesRoute('no-such-species'), 'ru', {})
  assert.equal(meta.canonical, `${SITE_ORIGIN}/ru/`)
  assert.equal(pageMetadata(HOME_ROUTE, 'invalid', {}).language, 'ky')
})

test('structured data is valid JSON-LD with the site name, breadcrumbs and no invented fields', () => {
  const home = pageMetadata(HOME_ROUTE, 'ru', { speciesCount: species.length })
  assert.equal(home.jsonLd[0]['@type'], 'WebSite')
  assert.equal(home.jsonLd[0].name, 'MURAS')
  assert.ok(home.jsonLd[0].alternateName.includes('Мурас'))
  const irbis = pageMetadata(speciesRoute('irbis'), 'ru', { species: species.find(record => record.id === 'irbis') })
  assert.deepEqual(irbis.jsonLd.map(entry => entry['@type']), ['Taxon', 'BreadcrumbList'])
  assert.equal(irbis.jsonLd[0].name, 'Ирбис')
  assert.ok(irbis.jsonLd[0].alternateName.includes('Panthera uncia'))
  assert.match(irbis.jsonLd[0].image ?? '', /^https:\/\/muras\.dev\/images\//)
  assert.equal(irbis.jsonLd[1].itemListElement.at(-1).item, irbis.canonical)
  for (const tag of metadataTags(irbis).filter(item => item.tag === 'script')) JSON.parse(tag.text)
})

test('metadata is applied to a live document in place and never duplicates tags', () => {
  const elements = []
  const make = tag => {
    const element = { tag, attrs: {}, children: [], textContent: '', remove() { elements.splice(elements.indexOf(element), 1) },
      setAttribute(name, value) { element.attrs[name] = value }, getAttribute: name => element.attrs[name] }
    return element
  }
  const matches = (element, selector) => {
    const parts = [...selector.matchAll(/\[([\w:-]+)(?:="([^"]*)")?\]/g)]
    return element.tag === selector.match(/^[a-z]+/)[0] && parts.every(([, name, value]) => value === undefined ? name in element.attrs : element.attrs[name] === value)
  }
  const document = {
    documentElement: { lang: 'ky' }, title: '',
    head: { appendChild: element => elements.push(element) },
    querySelector: selector => elements.find(element => matches(element, selector)) || null,
    querySelectorAll: selector => elements.filter(element => matches(element, selector)),
    createElement: make,
  }
  const apply = (route, language, data) => applySeoMetadata(document, pageMetadata(route, language, data))
  assert.equal(apply(HOME_ROUTE, 'ky', { speciesCount: 184 }), true)
  const before = elements.length
  assert.equal(apply(speciesRoute('irbis'), 'ru', { species: species.find(record => record.id === 'irbis') }), true)
  assert.equal(apply(HOME_ROUTE, 'ky', { speciesCount: 184 }), true)
  assert.equal(elements.length, before, 'repeated updates reuse the same tags')
  assert.equal(document.documentElement.lang, 'ky')
  assert.equal(document.querySelectorAll('link[rel="canonical"]').length, 1)
  assert.equal(document.querySelectorAll('link[rel="alternate"][hreflang]').length, 5)
  assert.equal(applySeoMetadata({}, pageMetadata(HOME_ROUTE, 'ky', {})), false, 'a partial DOM is ignored, not thrown')
  assert.equal(applySeoMetadata(null, pageMetadata(HOME_ROUTE, 'ky', {})), false)
})

test('pre-render writes every page in every language with one title, one canonical and a crawlable body; sitemap lists them all', async () => {
  const root = await mkdtemp(join(tmpdir(), 'muras-seo-'))
  try {
    await mkdir(join(root, 'dist'), { recursive: true })
    await mkdir(join(root, 'public/data'), { recursive: true })
    await cp(new URL('../index.html', import.meta.url), join(root, 'dist/index.html'))
    for (const file of ['species.json', 'protected-areas.json']) await cp(new URL(`../public/data/${file}`, import.meta.url), join(root, 'public/data', file))
    const shell = await readFile(join(root, 'dist/index.html'), 'utf8')
    const summary = await prerender(root)
    const routes = 3 + species.length + areas.length
    assert.equal(summary.pages, routes * LANGUAGES.length)

    const page = async path => readFile(join(root, 'dist', path), 'utf8')
    const irbisRu = await page('ru/species/irbis/index.html')
    assert.match(irbisRu, /<html lang="ru"/)
    assert.match(irbisRu, /<title>Ирбис \(Panthera uncia\) — Красная книга Кыргызстана \| MURAS<\/title>/)
    assert.ok(irbisRu.includes(`<link rel="canonical" href="${SITE_ORIGIN}/ru/species/irbis" data-seo>`))
    assert.ok(irbisRu.includes(`hreflang="x-default" href="${SITE_ORIGIN}/species/irbis"`))
    assert.match(irbisRu, /<h1>Ирбис<\/h1>/)
    assert.match(await page('uz/species/irbis/index.html'), /<html lang="uz"/)
    assert.match(await page('en/map/index.html'), /<title>Map of Red Book species of Kyrgyzstan by region — MURAS<\/title>/)

    const kyHome = await page('index.html')
    assert.match(kyHome, /<html lang="ky"/)
    assert.ok(kyHome.includes(`<link rel="canonical" href="${SITE_ORIGIN}/" data-seo>`))
    assert.equal((kyHome.match(/<li><a href="\/species\//g) || []).length, species.length, 'home lists every species as a crawlable link')
    assert.ok((await page('ru/index.html')).includes(`href="/ru/species/irbis"`))

    for (const path of ['index.html', 'ru/index.html', 'map/index.html', 'uz/territories/index.html', `en/species/${species[0].id}/index.html`]) {
      const html = await page(path)
      assert.equal((html.match(/<title>/g) || []).length, 1, path)
      assert.equal((html.match(/rel="canonical"/g) || []).length, 1, path)
      assert.equal((html.match(/name="description"/g) || []).length, 1, path)
      assert.equal((html.match(/property="og:title"/g) || []).length, 1, path)
      assert.ok(!html.includes('<div id="app"></div>'), path)
      for (const block of html.matchAll(/<script type="application\/ld\+json" data-seo>([\s\S]*?)<\/script>/g)) JSON.parse(block[1])
    }

    const sitemap = await page('sitemap.xml')
    const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1])
    assert.equal(locations.length, routes * LANGUAGES.length)
    assert.equal(new Set(locations).size, locations.length, 'no duplicate URLs')
    assert.ok(locations.includes(`${SITE_ORIGIN}/`) && locations.includes(`${SITE_ORIGIN}/en/territories/${areas[0].id}`))
    for (const record of species) for (const language of LANGUAGES) assert.ok(locations.includes(absoluteUrl(`/species/${record.id}`, language)), `${language} ${record.id}`)
    assert.ok(!/admin/.test(sitemap))
    assert.equal((sitemap.match(/hreflang="x-default"/g) || []).length, locations.length)

    // Re-running the step on already rendered output gives the same files (npm run postbuild can be repeated).
    assert.ok(resetTemplate(kyHome).includes('<div id="app"></div>') && !resetTemplate(kyHome).includes('data-seo'))
    assert.ok(shell.includes('<div id="app"></div>'))
    await prerender(root)
    assert.equal(await page('index.html'), kyHome)
    assert.equal(await page('ru/species/irbis/index.html'), irbisRu)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('the source shell stays free of any invented domain; only generated pages name the canonical address', async () => {
  const source = await readFile(new URL('../index.html', import.meta.url), 'utf8')
  assert.ok(!/rel="canonical"|og:url|og:image|hreflang/.test(source))
  const robots = await readFile(new URL('../public/robots.txt', import.meta.url), 'utf8')
  const pkg = await read('package.json')
  assert.match(pkg.scripts.postbuild, /prerender-seo\.mjs/)
})
