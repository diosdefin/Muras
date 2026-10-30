import test from 'node:test'
import {execFileSync} from 'node:child_process'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { createSSRApp, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createServer } from 'vite'
import { LANGUAGES, LOCALE_STORAGE_KEY, localizedQuestion, localizedSource, readLanguage, saveLanguage, scientificContent, searchContentLanguage, validateSourceLocalization } from '../src/data/localization.js'
import { messages, tr } from '../src/locales/index.js'
import { brandMetadata } from '../src/data/brand.js'
import { createSearchIndex, normalizeSearch, searchSpecies } from '../src/data/catalog-search.js'
import { speciesName, speciesNameLanguage } from '../src/data/presentation.js'
import { validateSource } from '../src/data/species-model.js'
import { validateQuestions } from '../src/data/quiz/model.js'
import { useQuiz } from '../src/composables/useQuiz.js'
import { claimPaths, editableShape, emptySpecies, exportSource, importSource, setPath } from '../src/admin/data/model.js'
import { siteLanguage, useLocale } from '../src/composables/useLocale.js'
import { validateMessages, checkLocales } from '../scripts/validate-locales.mjs'
import { legacyScientificSource } from './helpers/legacy-scientific-source.mjs'

const read = path => readFile(new URL(path, import.meta.url), 'utf8').then(JSON.parse)
const source = await read('../data/species.source.json')
const catalog = await read('../public/data/species.json')
const questions = await read('../src/data/quiz/questions.json')
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex')
const memory = () => { const values = new Map(); return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) } }

test('four locale choices retain KY default and every legacy stored language in the same storage key', () => {
  assert.deepEqual(LANGUAGES, ['ky', 'uz', 'ru', 'en'])
  assert.equal(LOCALE_STORAGE_KEY, 'redbook.locale.v1')
  const storage = memory()
  assert.equal(readLanguage(storage), 'ky')
  for (const language of LANGUAGES) {
    assert.equal(saveLanguage(storage, language), true)
    assert.equal(readLanguage(storage), language)
  }
  assert.equal(saveLanguage(storage, 'UZ'), false)
  assert.equal(readLanguage(storage), 'en')
  assert.equal(readLanguage({ getItem: () => 'uz' }), 'uz')
  assert.equal(readLanguage({ getItem: () => 'unknown' }), 'ky')
})

test('UZ switch reacts immediately while invalid languages cannot replace the current language', async () => {
  const { setLanguage, t } = useLocale(siteLanguage)
  try {
    setLanguage('uz'); await nextTick()
    assert.equal(siteLanguage.value, 'uz')
    assert.equal(t('ui.m010'), 'Xarita')
    setLanguage('invalid'); assert.equal(siteLanguage.value, 'uz')
    setLanguage('ru'); await nextTick(); assert.equal(t('ui.m010'), 'Карта')
  } finally { siteLanguage.value = 'ky' }
})

test('public and admin UZ dictionaries have complete keys and exact interpolation parity', async () => {
  const publicMessages = {}, adminMessages = {}
  for (const language of LANGUAGES) {
    publicMessages[language] = await read(`../src/locales/${language}.json`)
    adminMessages[language] = await read(`../src/admin/locales/${language}.json`)
  }
  assert.ok(Object.keys(publicMessages.uz).length >= 435)
  // Retain all 168 historical keys; explicitly permit the local file editor's new messages.
  const legacyAdmin=JSON.parse(execFileSync('git',['show','50951765ab52c32fdae30309cc19ede7e9bd279d:src/admin/locales/uz.json'],{encoding:'utf8'}))
  assert.equal(Object.keys(legacyAdmin).length,168)
  for(const key of Object.keys(legacyAdmin))assert.ok(Object.hasOwn(adminMessages.uz,key),key)
  const newKeys=Object.keys(adminMessages.uz).filter(key=>!Object.hasOwn(legacyAdmin,key))
  assert.ok(newKeys.length>0&&newKeys.every(key=>key.startsWith('admin.files.')||key.startsWith('admin.error.')))
  for(const key of ['admin.files.apply','admin.files.draftSaved','admin.files.openLegacy','admin.error.conflict','admin.error.recovery'])assert.ok(adminMessages.uz[key])
  assert.deepEqual(validateMessages(publicMessages), [])
  assert.deepEqual(validateMessages(adminMessages), [])
  assert.equal(await checkLocales(), Object.keys(publicMessages.ru).length + Object.keys(adminMessages.ru).length)
  for (const text of [...Object.values(publicMessages.uz), ...Object.values(adminMessages.uz)]) {
    assert.equal(text, text.normalize('NFC'))
    assert.ok(!/[\uFFFD]|[А-Яа-яЁё]/u.test(text), text)
  }
  const broken = structuredClone(publicMessages); delete broken.uz['ui.m010']
  assert.ok(validateMessages(broken).some(error => error.startsWith('uz')))
  broken.uz['ui.m010'] = 'Xarita'; broken.uz['ui.m035'] = '{wrong}'
  assert.ok(validateMessages(broken).some(error => error.includes('параметры')))
})

test('Uzbek metadata uses uz/uz_UZ and keeps three alternate locales without a fictitious URL', () => {
  const value = brandMetadata(messages, 'uz')
  assert.equal(value.language, 'uz'); assert.equal(value.locale, 'uz_UZ')
  assert.equal(value.title, messages.uz.pageTitle)
  assert.equal(value.description, messages.uz['ui.m018'])
  assert.deepEqual(value.alternateLocales, ['ky_KG', 'ru_RU', 'en_GB'])
  assert.equal(value.url, undefined)
  assert.ok(brandMetadata(messages, 'uz', { admin: true }).title.startsWith('Muras Admin'))
})

test('all 30 source records and archive remain byte-logically identical to the task starting point', () => {
  assert.equal(hash(legacyScientificSource({...source,catalog:source.catalog.slice(0,30)})), '52e69ac766a536e158d5b3ea0780db66c25f02944644de0871a9383fe85e2fb0')
  assert.ok(source.catalog.length >= 30); assert.equal(catalog.length, source.catalog.length)
  assert.deepEqual(validateSource(source), [])
  for (const s of [...source.catalog.slice(0, 30), ...source.demoArchive]) {
    assert.ok(!s.names.uz)
    assert.equal(s.verified, false)
  }
})

test('optional UZ is compatible with old records but requires valid text and a source for new names', () => {
  const copy = structuredClone(source), s = copy.catalog[0]
  s.names.uz = null
  s.habitat.description.uz = null
  s.regions[0].names.uz = null
  s.threats[0].text.uz = null
  s.conservationMeasures[0].text.uz = null
  s.images[0].caption.uz = null
  assert.deepEqual(validateSource(copy), [])
  s.names.uz = 'Sinov nomi' // Synthetic validator fixture, never published.
  assert.ok(validateSource(copy).some(error => error.includes('names.uz') && error.includes('источник')))
  s.sources[0].supports.push('names.uz')
  assert.deepEqual(validateSource(copy), [])
  s.names.uz = 12; assert.ok(validateSource(copy).some(error => error.includes('names.uz')))
  s.names.uz = null; s.habitat.description.uz = false
  assert.ok(validateSource(copy).some(error => error.includes('description.uz')))
  s.habitat.description.uz = null; s.names.xx = null
  assert.ok(validateSource(copy).some(error => error.includes('неизвестный язык')))
})

test('admin import/export is lossless for the legacy source and allows optional UZ in drafts', () => {
  const imported = importSource(JSON.stringify(source))
  assert.deepEqual(JSON.parse(exportSource(imported)), source)
  assert.equal(editableShape(imported), true)
  const draft = emptySpecies('uz-test-draft')
  assert.equal(draft.names.uz, null)
  assert.ok(claimPaths(draft).includes('names.uz'))
  const changed = setPath(imported, ['catalog', 0, 'names', 'uz'], null)
  assert.equal(editableShape(changed), true)
  assert.deepEqual(JSON.parse(exportSource(changed)), changed)
  assert.deepEqual(imported, source)
})

test('UZ search normalizes all common apostrophes in oʻ/gʻ independently of the interface language', () => {
  // Deliberately synthetic text: does not assert a vernacular name for a real species.
  const fixture = { id: 'uz-search-fixture', names: { ru: null, ky: null, en: null, uz: 'Oʻzbek gʻozining sinov nomi' }, scientificName: 'Testus fixture' }
  const index = createSearchIndex([fixture])
  for (const mark of ["'", 'ʻ', 'ʼ', '’', '‘', '`']) {
    const query = `O${mark}zbek g${mark}ozining sinov nomi`
    assert.equal(normalizeSearch(query), "o'zbek g'ozining sinov nomi")
    const result = searchSpecies(index, query)[0]
    assert.equal(result.species.id, fixture.id); assert.equal(result.kind, 'direct')
    assert.deepEqual(result.matchedLanguages, ['uz'])
    for (const language of LANGUAGES) assert.equal(searchContentLanguage(result, language), 'uz')
  }
  assert.equal(searchSpecies(index, 'GʻOZINING')[0].species.id, fixture.id)
  const fuzzy = createSearchIndex([{ ...fixture, names: { uz: 'Sinovjon' } }])
  assert.equal(searchSpecies(fuzzy, 'Sinvojon')[0].kind, 'fuzzy')
  assert.equal(searchContentLanguage(searchSpecies(fuzzy, 'Sinvojon')[0], 'uz'), 'uz')
})

test('actual catalog remains searchable in KY/RU/EN/Latin while UZ never synthesizes aliases', () => {
  const index = createSearchIndex(catalog)
  for (const s of catalog) for (const name of [...Object.values(s.names), s.scientificName].filter(Boolean)) {
    assert.ok(searchSpecies(index, name).some(result => result.species.id === s.id), name)
  }
  for (const entry of index) {
    const uz = entry.aliases.filter(alias => alias.language === 'uz')
    if (!entry.species.names.uz) assert.deepEqual(uz, [])
    else assert.ok(uz.every(alias => alias.name === entry.species.names.uz && !alias.transliterated))
  }
  const leopard = searchSpecies(index, 'ирбис')[0]
  assert.equal(searchContentLanguage(leopard, 'uz'), 'ru')
  assert.equal(searchContentLanguage(searchSpecies(index, 'Panthera uncia')[0], 'uz'), 'uz')
})

test('UZ scientific fallback labels the actual language; absent science stays null and URLs stay original', () => {
  for (const s of catalog) {
    const expected = s.names.uz ? { text: s.names.uz, language: 'uz', fallback: false } : { text: s.names.ru, language: 'ru', fallback: true }
    assert.deepEqual(scientificContent(s.names, 'uz'), expected)
    assert.equal(speciesName(s, 'uz'), expected.text)
    assert.equal(speciesNameLanguage(s, 'uz'), expected.language)
    for (const original of s.sources) assert.equal(localizedSource(original, 'uz').url, original.url)
  }
  assert.deepEqual(scientificContent(null, 'uz'), { text: null, language: 'und', fallback: false })
  assert.equal(scientificContent({ en: 'Original', ru: null, ky: null }, 'uz').language, 'en')
  assert.equal(speciesNameLanguage({ names: {}, scientificName: 'Testus fixture' }, 'uz'), 'la')
  const original = { url: 'https://example.org/original', title: 'Original', language: 'en', versions: { uz: { url: 'https://example.org/uz', title: 'Sinov', language: 'uz', verified: true } } }
  assert.deepEqual(validateSourceLocalization(original), [])
  assert.equal(localizedSource(original, 'uz').url, original.versions.uz.url)
  original.versions.uz.verified = false
  assert.ok(validateSourceLocalization(original).length)
  assert.equal(localizedSource(original, 'uz').url, original.url)
  assert.equal(scientificContent({ uz: 'Sinov' }, 'en').language, 'uz')
})

test('18 complete UZ quiz translations preserve every old question, answer, image and source', () => {
  const originals = structuredClone(questions)
  for (const q of originals) delete q.translations.uz
  assert.equal(hash(originals), '12a909d6e5e93c606dfe009aab8fbf2dd29571dcdc2f480706807757a5de5570')
  assert.deepEqual(validateQuestions(questions, catalog), [])
  assert.equal(questions.length, 18)
  for (const q of questions) {
    const display = localizedQuestion(q, 'uz')
    assert.equal(display.fallback, false); assert.equal(display.language, 'uz')
    assert.equal(display.options.length, 4)
    assert.deepEqual(display.options.map(option => option.id), q.options.map(option => option.id))
    assert.equal(display.correctAnswerId, q.correctAnswerId)
    if (q.difficulty === 'researcher') assert.ok(display.options.every(option => option.language === 'uz'))
    if (q.difficulty === 'beginner' || q.id === 'expert-apple-reserves') assert.ok(display.options.every(option => option.language === 'ru'))
  }
  const absent = structuredClone(questions[0]); delete absent.translations.uz
  assert.equal(localizedQuestion(absent, 'uz').fallback, true)
  for (const corrupt of [q => delete q.translations.uz.options[q.correctAnswerId], q => q.translations.uz.correctAnswerId = 'wrong', q => q.translations.uz.optionLanguages = { badId: 'uz' }]) {
    const copy = structuredClone(questions); corrupt(copy[0]); assert.ok(validateQuestions(copy, catalog).length)
  }
})

test('changing to UZ during a quiz preserves shuffled answers, progress, scores and restart', () => {
  const quiz = useQuiz(ref(questions), { storage: memory(), random: () => .4 })
  quiz.start('researcher')
  const first = quiz.currentQuestion.value, attempt = quiz.attempt.value
  const view = localizedQuestion(first, 'uz')
  assert.equal(quiz.attempt.value, attempt)
  assert.deepEqual(view.options.map(o => o.id), first.options.map(o => o.id))
  quiz.answer(first.id, first.correctAnswerId)
  quiz.answer(first.id, first.options.find(o => o.id !== first.correctAnswerId).id)
  assert.equal(quiz.currentAnswer.value.correct, true)
  quiz.next(); assert.equal(quiz.progress.value, 1)
  while (quiz.stage.value === 'question') { const q = quiz.currentQuestion.value; quiz.answer(q.id, q.correctAnswerId); quiz.next() }
  assert.equal(quiz.result.value.percent, 100); assert.equal(quiz.result.value.correct, 6)
  quiz.restart(); assert.equal(quiz.progress.value, 0); assert.equal(quiz.currentAnswer.value, null)
})

test('SSR renders UZ in catalog/profile/modal/quiz/lesson/support/map/admin without invented names', async () => {
  const vite = await createServer({ server: { middlewareMode: true, ws: false, hmr: false, watch: null }, appType: 'custom', logLevel: 'error' })
  try {
    const { siteLanguage: language } = await vite.ssrLoadModule('/src/composables/useLocale.js')
    language.value = 'uz'
    const cases = [
      ['SpeciesCard.vue', { species: catalog[0] }, 'Batafsil'],
      ['SpeciesModal.vue', { species: catalog[0] }, 'Ilmiy manbalar'],
      ['SpeciesPage.vue', { species: catalog[0] }, 'Ushbu tur haqida'],
      ['quiz/QuizView.vue', { species: catalog, questions }, 'Boshlovchi'],
      ['quiz/QuizQuestion.vue', { species: catalog, question: questions[6] }, questions[6].translations.uz.question],
      ['lesson/LessonView.vue', { species: catalog }, 'Dars rejimi'],
      ['support/SupportView.vue', { species: catalog, speciesId: 'irbis' }, 'Xayriyalar qabuli hali ochilmagan'],
      ['map/MapSection.vue', { species: catalog }, 'Yetti viloyat. Yagona tabiat.'],
    ]
    for (const [file, props, expected] of cases) {
      const Component = (await vite.ssrLoadModule(`/src/components/${file}`)).default
      const html = await renderToString(createSSRApp(Component, props))
      assert.ok(html.includes(expected), `${file}: ${expected}`)
      assert.ok(!/\{p\d\}|sourceLanguageName\.|language\.uz/.test(html), file)
      if (['SpeciesCard.vue', 'SpeciesModal.vue', 'SpeciesPage.vue', 'lesson/LessonView.vue', 'support/SupportView.vue'].includes(file)) {
        assert.ok(html.includes('lang="ru"'), file)
        if(file!=='SpeciesCard.vue' || !catalog[0].content?.shortDescription?.text.uz)assert.ok(html.includes('Maʼlumot tili: Ruscha.'), file)
      }
    }
    const Editor = (await vite.ssrLoadModule('/src/admin/components/LocalizedFields.vue')).default
    const html = await renderToString(createSSRApp(Editor, { label: 'Nomlar', value: catalog[0].names }))
    assert.ok(html.indexOf('>KY<') < html.indexOf('>UZ<'))
    assert.ok(html.indexOf('>UZ<') < html.indexOf('>RU<'))
    assert.ok(html.indexOf('>RU<') < html.indexOf('>EN<'))
    assert.ok(html.includes('lang="uz"'))
    // The SPA metadata watcher needs a document; provide the head-only DOM in this SSR test.
    const originalDocument = globalThis.document
    globalThis.document = { documentElement: {}, title: '', querySelector: () => null, querySelectorAll: () => [],
      createElement: () => ({ setAttribute() {} }), head: { appendChild() {} } }
    try {
      const App = (await vite.ssrLoadModule('/src/admin/AdminApp.vue')).default
      const admin = await renderToString(createSSRApp(App))
      assert.ok(admin.includes('Oʻzbekcha (UZ)')); assert.ok(admin.includes('Muharrir paneli'))
      assert.equal(globalThis.document.documentElement.lang, 'uz')
    } finally { globalThis.document = originalDocument }
  } finally { await vite.close() }
})
