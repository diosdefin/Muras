import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { UI_V4_FILES, assertUiV4File } from './helpers/ui-v4-release.mjs'
import { createAttempt, finishAttempt, attemptResult } from '../src/data/quiz/engine.js'
import { validateQuestions } from '../src/data/quiz/model.js'
import { readSeen, rememberSeen } from '../src/data/quiz/history.js'

test('UI v4 changes exactly the approved presentation files and preserves original Git blobs', () => {
  assert.deepEqual([...UI_V4_FILES].sort(), [
    'index.html',
    'public/data/quiz-extra.json',
    'scripts/admin-entry.mjs',
    'scripts/build-data.mjs',
    'scripts/build-quiz.mjs',
    'scripts/lib/ui-design-scope.mjs',
    'src/App.vue',
    'src/admin/data/model.js',
    'src/components/BrandLogo.vue',
    'src/components/HeroIllustrations.vue',
    'src/components/SourceLink.vue',
    'src/components/SpeciesCard.vue',
    'src/components/SpeciesModal.vue',
    'src/components/SpeciesPage.vue',
    'src/components/SpeciesVisualization.vue',
    'src/components/areas/areas.css',
    'src/components/lesson/LessonView.vue',
    'src/components/map/MapOverviewPanel.vue',
    'src/components/map/MapSection.vue',
    'src/components/map/RegionMap.vue',
    'src/components/map/RegionPanel.vue',
    'src/components/map/RegionalSpecies.vue',
    'src/components/map/map.css',
    'src/components/quiz/QuizQuestion.vue',
    'src/components/quiz/QuizResult.vue',
    'src/components/quiz/QuizView.vue',
    'src/components/support/SupportStub.vue',
    'src/composables/useQuiz.js',
    'src/composables/useSheetDismiss.js',
    'src/data/catalog-search.js',
    'src/data/presentation.js',
    'src/data/quiz/engine.js',
    'src/data/quiz/history.js',
    'src/data/quiz/questions-batch-2.json',
    'src/data/quiz/questions-batch-3.json',
    'src/data/quiz/questions-batch-4.json',
    'src/data/uz-names.json',
    'src/locales/en.json',
    'src/locales/ky.json',
    'src/locales/ru.json',
    'src/locales/uz.json',
    'src/main.js',
    'src/styles/mobile.css',
    'src/styles/ornaments.css',
    'tests/map-activation.test.mjs',
    'vercel.json',
  ])
  for (const path of UI_V4_FILES) assert.equal(assertUiV4File(path), true, path)
})

test('hero playback is not blocked forever by the OS reduced-motion switch', () => {
  const source = readFileSync(new URL('../src/components/HeroIllustrations.vue', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /prefers-reduced-motion/)
  assert.match(source, /const active = computed\(\(\) => intersecting\.value && pageVisible\.value\)/)
  assert.match(source, /const gapDuration = 4000/)
})

test('hero switches seamlessly over a permanent poster after preloading all clips into the browser cache', () => {
  const source = readFileSync(new URL('../src/components/HeroIllustrations.vue', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
  const template = source.slice(source.indexOf('<template>'), source.indexOf('</template>'))
  // The poster is always rendered underneath; only one video element exists.
  assert.match(template, /<img :src="poster"/)
  assert.doesNotMatch(template, /v-if|Transition/)
  assert.equal(template.match(/<video/g).length, 1)
  // No fades or captions: the layer is toggled on the still boundary frames.
  assert.doesNotMatch(source, /transition:/)
  assert.doesNotMatch(template, /hero-art-footer|hero-art-navigation/)
  assert.match(source, /caches\.open\(cacheName\)/)
  assert.match(source, /URL\.createObjectURL/)
  assert.match(source, /for \(const scene of scenes\) \{\n    if \(disposed\) return\n    try \{\n      ready\.push\(await download/)
})

test('phone adaptation is confined to small screens and imported after every component stylesheet', () => {
  const app = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
  const imports = app.split('\n').filter(line => line.startsWith('import '))
  assert.equal(imports.at(-1), "import './styles/mobile.css'")
  const css = readFileSync(new URL('../src/styles/mobile.css', import.meta.url), 'utf8')
  // Everything except the section focus reset lives inside the phone media query.
  const outside = css.replace(/@media \(max-width: 767px\) \{[\s\S]*\}\s*$/, '')
  assert.doesNotMatch(outside, /font-size|padding|margin|display/)
  assert.match(css, /\.hero \.eyebrow \{ white-space: nowrap;/)
  assert.match(css, /\.catalog-density \{ flex: 0 0 auto; margin-left: auto; \}/)
})

test('support page shows a localized in-development notice on every screen until it is finished', () => {
  const stub = readFileSync(new URL('../src/components/support/SupportStub.vue', import.meta.url), 'utf8')
  for (const language of ['ky', 'uz', 'ru', 'en']) assert.match(stub, new RegExp(`\\b${language}: \\{ title: '`))
  assert.match(stub, /<section id="support" class="support-stub page-container" tabindex="-1"/)
  const app = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')
  assert.match(app, /<SupportStub v-if="mountedViews\.has\('support'\)" v-show="activeView === 'support'"/)
  assert.doesNotMatch(app, /<SupportView /)
})

test('the Catalogue navigation item returns to the top of the home page without an anchor', () => {
  const app = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')
  assert.match(app, /<a class="header-link" href="\/" [^>]*@click\.prevent="showHome\(\)">\{\{ t\('ui\.m009'\) \}\}<\/a>/)
})

test('map lists species only for a chosen region, each category once, without a panel search', () => {
  const panel = readFileSync(new URL('../src/components/map/RegionPanel.vue', import.meta.url), 'utf8')
  assert.match(panel, /<p v-if="!region" class="map-empty map-choose-region">/)
  assert.doesNotMatch(panel, /map-species-search|PAGE_SIZE/)
  assert.match(panel, /const PREVIEW = 6/)
  const card = readFileSync(new URL('../src/components/map/RegionalSpecies.vue', import.meta.url), 'utf8')
  assert.match(card, /<details class="regional-more">/)
  const css = readFileSync(new URL('../src/components/map/map.css', import.meta.url), 'utf8')
  assert.match(css, /\.map-preview \.map-region-gallery \{[^}]*overscroll-behavior: auto;/)
})

test('the MURAS logo is a single-colour vector that keeps every existing header box size', () => {
  const logo = readFileSync(new URL('../src/components/BrandLogo.vue', import.meta.url), 'utf8')
  assert.match(logo, /<svg class="brand-logo" viewBox="0 0 [\d.]+ [\d.]+" width="180" height="44" preserveAspectRatio="xMinYMid meet" aria-hidden="true"/)
  assert.match(logo, /<path fill="currentColor" fill-rule="evenodd" d="M/)
  assert.doesNotMatch(logo, /<image|data:image|<text/)
  assert.match(logo, /\.brand-logo \{ display:block; width:180px; height:44px; flex-shrink:0; \}/)
})

test('catalogue has no region filter; the map preview hint mentions only the map', () => {
  const app = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')
  assert.doesNotMatch(app, /region-filter/)
  const map = readFileSync(new URL('../src/components/map/RegionMap.vue', import.meta.url), 'utf8')
  assert.match(map, /preview \? t\('mapPreview\.regionPrompt'\) : t\('ui\.m136'\)/)
})

test('lesson keeps credits, sources and statuses but drops repeated or unclear labels', () => {
  const lesson = readFileSync(new URL('../src/components/lesson/LessonView.vue', import.meta.url), 'utf8')
  for (const removed of ["t('ui.m098')", "t('ui.m100')", 'regionNames(']) assert.ok(!lesson.includes(removed), removed)
  for (const kept of ['<LessonPhoto', '<LessonReferences', 'nationalStatus(current', 'statusDetails(current', 'current.sources', "t('ui.m097')"]) assert.ok(lesson.includes(kept), kept)
  assert.match(lesson, /@touchstart\.passive="touchStart" @touchend="touchEnd"/)
  const link = readFileSync(new URL('../src/components/SourceLink.vue', import.meta.url), 'utf8')
  assert.match(link, /v-if="content\.language && content\.language !== language"/)
})

test('"Finish test" completes the attempt; unanswered questions count as skipped mistakes', () => {
  const options = [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }]
  const bank = ['q1', 'q2', 'q3'].map(id => ({ id, difficulty: 'beginner', correctAnswerId: 'a', options }))
  let attempt = createAttempt(bank, 'beginner', { random: () => 0 })
  attempt = { ...attempt, answers: { [attempt.questions[0].id]: { answerId: 'a', correct: true, skipped: false } } }
  const finished = finishAttempt(attempt, () => '2026-11-09T00:00:00.000Z')
  assert.equal(finished.completedAt, '2026-11-09T00:00:00.000Z')
  assert.deepEqual(attemptResult(finished), { difficulty: 'beginner', mode: 'standard', total: 3, correct: 1, skipped: 2, percent: 33, completedAt: '2026-11-09T00:00:00.000Z' })
  assert.equal(finishAttempt(finished), finished)
  const quiz = readFileSync(new URL('../src/components/quiz/QuizView.vue', import.meta.url), 'utf8')
  assert.match(quiz, /class="quiz-secondary quiz-finish" @click="finish">\{\{ t\('quiz\.finish'\) \}\}/)
  assert.doesNotMatch(quiz, /quiz-back/)
  const lesson = readFileSync(new URL('../src/components/lesson/LessonView.vue', import.meta.url), 'utf8')
  assert.doesNotMatch(lesson, /t\('ui\.m103'\)/)
})

test('map cards have one compact corner action that opens the species card', () => {
  const card = readFileSync(new URL('../src/components/map/RegionalSpecies.vue', import.meta.url), 'utf8')
  assert.match(card, /<button type="button" class="regional-explore" aria-haspopup="dialog" :aria-label="t\('ui\.m125'/)
  assert.doesNotMatch(card, /map-species-page|regional-actions/)
})

test('species card can be pulled down to close on touch screens, only from the top of its content', () => {
  const sheet = readFileSync(new URL('../src/composables/useSheetDismiss.js', import.meta.url), 'utf8')
  assert.match(sheet, /const OPEN_MS = 380/)
  assert.match(sheet, /const CLOSE_MS = 240/)
  assert.match(sheet, /if \(area && area\.scrollTop > 0\) return/)
  assert.match(sheet, /dialog\.addEventListener\('touchmove', move, \{ passive: false \}\)/)
  const modal = readFileSync(new URL('../src/components/SpeciesModal.vue', import.meta.url), 'utf8')
  assert.match(modal, /const \{ dismiss \} = useSheetDismiss\(dialog, \{ onClose: \(\) => emit\('close'\) \}\)/)
})

test('quiz keeps the next step at hand, hides the page intro during a test and folds the review', () => {
  const view = readFileSync(new URL('../src/components/quiz/QuizView.vue', import.meta.url), 'utf8')
  assert.match(view, /<header v-if="stage === 'selection'" class="quiz-heading">/)
  const question = readFileSync(new URL('../src/components/quiz/QuizQuestion.vue', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
  assert.match(question, /<div v-if="answer" class="quiz-actions quiz-next-bar">/)
  assert.match(question, /\.quiz-next-bar \{\n  position: sticky; bottom: 0;/)
  assert.match(question, /<details v-if="sources\.length" class="quiz-sources-details">/)
  const result = readFileSync(new URL('../src/components/quiz/QuizResult.vue', import.meta.url), 'utf8')
  assert.match(result, /<details v-if="mistakes\.length" class="quiz-review">/)
})

test('hero media offers no download menu; lesson fullscreen stays available on phones', () => {
  const hero = readFileSync(new URL('../src/components/HeroIllustrations.vue', import.meta.url), 'utf8')
  assert.match(hero, /@contextmenu\.prevent/)
  assert.match(hero, /controlslist="nodownload/)
  assert.match(hero, /pointer-events: none;/)
  const css = readFileSync(new URL('../src/styles/mobile.css', import.meta.url), 'utf8')
  assert.match(css, /\.lesson-tools > \.lesson-fullscreen \{/)
  assert.doesNotMatch(css, /\.lesson-tools > button, \.lesson-actions/)
})

test('quiz batches 2–4 bring the bank to 100, are valid together with the original bank, sourced, and published byte-for-byte', () => {
  const read = path => JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'))
  const raw = read('public/data/species.json'), catalog = Array.isArray(raw) ? raw : raw.catalog
  const original = read('src/data/quiz/questions.json')
  const batch2 = read('src/data/quiz/questions-batch-2.json'), batch3 = read('src/data/quiz/questions-batch-3.json'), batch4 = read('src/data/quiz/questions-batch-4.json')
  const batch = [...batch2, ...batch3, ...batch4]
  assert.equal(original.length, 18)
  assert.deepEqual([batch2.length, batch3.length, batch4.length], [25, 31, 26])
  assert.equal(original.length + batch.length, 100)
  assert.deepEqual(validateQuestions([...original, ...batch], catalog), [])
  assert.deepEqual(read('public/data/quiz-extra.json'), batch)
  for (const question of batch) {
    assert.ok(question.sourceIds.length && question.factPaths.length, question.id)
    for (const lang of ['ky', 'uz', 'en']) assert.ok(question.translations[lang]?.question && question.translations[lang]?.explanation, question.id + ' ' + lang)
  }
  const levels = Object.groupBy(batch, question => question.difficulty)
  assert.deepEqual(Object.fromEntries(Object.entries(levels).map(([k, v]) => [k, v.length])), { beginner: 30, expert: 23, researcher: 29 })
})

test('new quiz sessions start with questions the visitor has not answered yet', () => {
  const options = [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }]
  const bank = Array.from({ length: 14 }, (_, n) => ({ id: 'q' + n, difficulty: 'beginner', correctAnswerId: 'a', options }))
  const seen = new Set(['q0', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'])
  const attempt = createAttempt(bank, 'beginner', { random: () => 0.5, seen })
  assert.deepEqual(attempt.questions.slice(0, 4).map(q => q.id).sort(), ['q10', 'q11', 'q12', 'q13'])
  const memory = new Map(), storage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) }
  rememberSeen(readSeen(storage), 'q3', storage)
  assert.deepEqual([...readSeen(storage)], ['q3'])
})

test('first-visit splash shows only the logo, never blocks longer than 1.5 s and is skipped later in the session', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const logo = readFileSync(new URL('../src/components/BrandLogo.vue', import.meta.url), 'utf8')
  const splash = html.match(/<div id="splash"[^>]*>([\s\S]*?)<\/div>/)
  assert.ok(splash, 'splash markup')
  assert.equal(splash[1].match(/ d="([^"]+)"/)[1], logo.match(/ d="([^"]+)"/)[1])
  assert.ok(!/<text|[А-Яа-яA-Za-z]{3,}<\/|<img/.test(splash[1].replace(/<\/?(svg|path)[^>]*>/g, '')), 'logo only')
  assert.match(html, /setTimeout\(window\.murasHideSplash, 1500\)/)
  assert.match(html, /sessionStorage\.getItem\('muras\.splash\.v1'\)/)
  assert.match(html, /prefers-reduced-motion: reduce/)
  assert.match(readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8'), /isLoading\.value = false\s+window\.murasHideSplash\?\.\(\)/)
})
test('on phones the quiz group chips become a dropdown with the same options', () => {
  const view = readFileSync(new URL('../src/components/quiz/QuizView.vue', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
  assert.match(view, /<GroupFilter class="quiz-groups-chips" v-model="group" :options="groupOptions"/)
  assert.match(view, /<CustomSelect class="quiz-groups-select" v-model="group" :options="groupOptions"/)
  assert.match(view, /@media \(max-width: 767px\) \{\n  \.quiz-groups :deep\(\.quiz-groups-chips\) \{ display: none; \}\n  \.quiz-groups \{ position: relative; z-index: 5; \}\n  \.quiz-groups-select \{ display: block; \}/)
})
test('Kyrgyz ornaments are decorative CSS only and load before the phone overrides', () => {
  const css = readFileSync(new URL('../src/styles/ornaments.css', import.meta.url), 'utf8')
  const app = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')
  assert.ok(app.indexOf("import './styles/ornaments.css'") < app.indexOf("import './styles/mobile.css'"))
  assert.match(app, /class="catalog-message catalog-empty"/)
  for (const selector of ['.eyebrow .red-rule', '.page-footer::before', '.page-footer::after', '.catalog-message.catalog-empty::before', '.muras-loading::before', '.quiz-result .quiz-percent::before', '.region-map .map-compass', '.species-page .profile-section::after', '.profile-not-found::before']) assert.ok(css.includes(selector + ' {'), selector)
  assert.doesNotMatch(css, /font-size|https?:\/\/(?!www\.w3\.org)/)
  for (const uri of css.match(/svg\+xml,[^\s]+/g)) assert.ok(!uri.includes('"', uri.length - 2) || !uri.slice(8, -2).includes('"'), 'unescaped quote in data URI')
  assert.match(css, /pointer-events: none/)
})
test('tündük loader honours reduced motion and the quiz ring follows the score', () => {
  const css = readFileSync(new URL('../src/styles/ornaments.css', import.meta.url), 'utf8')
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{ \.muras-loading::before \{ animation: none; \} \}/)
  assert.match(css, /calc\(var\(--quiz-p, 0\) \* 1%\)/)
  assert.match(readFileSync(new URL('../src/components/quiz/QuizResult.vue', import.meta.url), 'utf8'), /class="quiz-percent" :style="\{ '--quiz-p': result\.percent \}"/)
  for (const file of ['src/App.vue', 'src/components/lesson/LessonView.vue', 'src/components/map/MapSection.vue', 'src/components/quiz/QuizView.vue', 'src/components/SpeciesPage.vue'])
    assert.match(readFileSync(new URL('../' + file, import.meta.url), 'utf8'), /muras-loading" role="status"/, file)
})
