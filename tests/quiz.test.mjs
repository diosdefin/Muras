import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir, mkdtemp, rm, cp } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { ref } from 'vue'
import { PROJECT_ROOT, generateAllData } from '../scripts/build-data.mjs'
import { prepareQuiz, publishQuiz } from '../scripts/build-quiz.mjs'
import { DIFFICULTIES, questionPhoto, questionSources, validateQuestions } from '../src/data/quiz/model.js'
import { attemptResult, createAttempt, mistakeQuestions, nextQuestion, recordAnswer, shuffle } from '../src/data/quiz/engine.js'
import { appendHistory, HISTORY_KEY, readHistory } from '../src/data/quiz/history.js'
import { useQuiz } from '../src/composables/useQuiz.js'

const bank = JSON.parse(await readFile(join(PROJECT_ROOT, 'src/data/quiz/questions.json'), 'utf8'))
const catalog = JSON.parse(await readFile(join(PROJECT_ROOT, 'public/data/species.json'), 'utf8'))
const sourceDocument = JSON.parse(await readFile(join(PROJECT_ROOT, 'data/species.source.json'), 'utf8'))
const clock = () => '2026-10-12T10:00:00.000Z'
const random = () => 0
const copy = () => structuredClone(bank)
function memoryStorage() {
  const data = new Map()
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }
}
function complete(attempt, correctIds = []) {
  for (const question of attempt.questions) {
    const id = correctIds.includes(question.id) ? question.correctAnswerId : question.options.find(o => o.id !== question.correctAnswerId).id
    attempt = nextQuestion(recordAnswer(attempt, question.id, id), clock)
  }
  return attempt
}

test('18 sourced questions, six per level; no species verification or population claims added', () => {
  assert.deepEqual(validateQuestions(bank, catalog), [])
  assert.equal(bank.length, 18)
  for (const level of DIFFICULTIES) assert.equal(bank.filter(q => q.difficulty === level.id).length, 6)
  assert.ok(bank.every(q => q.options.length === 4 && q.factPaths.every(p => !p.startsWith('population') && !p.startsWith('nationalRedBook'))))
  assert.ok(catalog.every(s => s.verified === false))
  for (const q of bank) assert.equal(questionSources(q, catalog).length, q.sourceIds.length)
})

test('identification and scientific answer keys agree with their actual catalogue fields', () => {
  const fields = {
    'beginner-snow-leopard-photo': 'names.ru', 'beginner-manul-photo': 'names.ru',
    'beginner-eagle-photo': 'names.ru', 'beginner-vulture-photo': 'names.ru',
    'beginner-saker-kyrgyz-name': 'names.ru', 'beginner-greig-kyrgyz-name': 'names.ru',
    'expert-saker-scientific-name': 'scientificName', 'expert-greig-scientific-name': 'scientificName',
    'expert-saker-family': 'taxonomy.family', 'expert-tulip-family': 'taxonomy.family',
    'expert-eagle-order': 'taxonomy.order', 'expert-apple-reserves': 'names.ru',
  }
  for (const [id, path] of Object.entries(fields)) {
    const q = bank.find(q => q.id === id)
    const species = catalog.find(s => s.id === q.speciesId)
    const fact = path.split('.').reduce((entry, key) => entry[key], species)
    assert.equal(q.options.find(o => o.id === q.correctAnswerId).text, fact)
  }
})

test('malformed records, missing fields, unknown levels and duplicated questions are rejected', () => {
  assert.match(validateQuestions(null, catalog).join('\n'), /массив/)
  const d = copy(); d.push(null); d.push(d[0]); delete d[1].explanation; d[2].difficulty = 'unknown'
  const errors = validateQuestions(d, catalog).join('\n')
  assert.match(errors, /объект/); assert.match(errors, /обязательное поле/)
  assert.match(errors, /уникальный/); assert.match(errors, /повторяющийся вопрос/); assert.match(errors, /неизвестный уровень/)
})

test('four distinct options and a valid correct answer ID are mandatory', () => {
  const d = copy(); d[0].options.pop(); d[1].correctAnswerId = 'absent'; d[2].options[1] = d[2].options[0]
  const errors = validateQuestions(d, catalog).join('\n')
  assert.match(errors, /ровно четыре/); assert.match(errors, /одним из вариантов/); assert.match(errors, /повторяющийся вариант/)
})

test('archive species, unknown references and unrelated scientific sources are rejected', () => {
  const d = copy(); d[0].speciesId = 'amur-tiger'; d[1].sourceIds = ['missing']
  d.find(q => q.id === 'expert-saker-family').sourceIds = ['decree-170']
  const errors = validateQuestions(d, catalog).join('\n')
  assert.match(errors, /национального каталога/); assert.match(errors, /существующие источники/); assert.match(errors, /нет подтверждения поля taxonomy.family/)
})

test('null facts and malformed source references fail cleanly rather than crashing', () => {
  for (const sourceIds of [null, 123, {}, 'decree-170']) {
    const d = copy(); d[0].sourceIds = sourceIds
    assert.match(validateQuestions(d, catalog).join('\n'), /sourceIds/)
  }
  const d = copy(); d[0].factPaths = ['population.estimate']
  assert.match(validateQuestions(d, catalog).join('\n'), /нет подтверждения/)
})

test('quiz photos reuse approved metadata; absent and revoked photos have a safe null fallback', () => {
  const q = bank.find(q => q.image)
  assert.ok(questionPhoto(q, catalog).path.startsWith('/images/approved/'))
  const c = structuredClone(catalog); c[0].images[0].licenseVerified = false
  assert.equal(questionPhoto(q, c), null)
  assert.equal(questionPhoto(q, []), null)
  assert.equal(questionPhoto(bank.find(q => !q.image), catalog), null)
  assert.match(validateQuestions([q], c).join('\n'), /разрешённое фото/)
  const d = copy(); d[0].image.speciesImageIndex = 100
  assert.match(validateQuestions(d, catalog).join('\n'), /разрешённое фото/)
})

test('question and answer shuffling preserves inputs and never repeats questions', () => {
  const before = JSON.stringify(bank)
  const attempt = createAttempt(bank, 'beginner', { random })
  const original = bank.filter(q => q.difficulty === 'beginner')
  assert.equal(attempt.questions.length, 6)
  assert.equal(new Set(attempt.questions.map(q => q.id)).size, 6)
  assert.notDeepEqual(attempt.questions.map(q => q.id), original.map(q => q.id))
  assert.notDeepEqual(attempt.questions[0].options, original[1].options)
  assert.deepEqual(new Set(shuffle([1,2,3], random)), new Set([1,2,3]))
  assert.equal(JSON.stringify(bank), before)
})

test('at most ten questions, with honest counts for a smaller pool', () => {
  const larger = Array.from({ length: 15 }, (_, i) => ({ ...bank[0], id: `fixture-${i}` }))
  assert.equal(createAttempt(larger, 'beginner', { random }).questions.length, 10)
  assert.equal(new Set(createAttempt(larger, 'beginner', { random }).questions.map(q => q.id)).size, 10)
  assert.equal(createAttempt([bank[0], bank[0]], 'beginner', { random }).questions.length, 1)
  assert.throws(() => createAttempt([], 'beginner'), /нет подходящих/)
  assert.throws(() => createAttempt(bank, 'missing'), /Неизвестный уровень/)
})

test('repeated clicks, invalid answers and stale question events cannot award points or skip a question', () => {
  let a = createAttempt(bank, 'beginner', { random }); const q = a.questions[0]
  assert.equal(nextQuestion(a), a)
  assert.equal(recordAnswer(a, q.id, 'missing'), a)
  a = recordAnswer(a, q.id, q.correctAnswerId)
  assert.equal(recordAnswer(a, q.id, q.options.find(o => o.id !== q.correctAnswerId).id), a)
  assert.equal(Object.keys(a.answers).length, 1)
  a = nextQuestion(a)
  assert.equal(nextQuestion(a), a)
  assert.equal(recordAnswer(a, q.id, q.correctAnswerId), a)
  assert.equal(Object.values(a.answers).filter(x => x.correct).length, 1)
})

test('complete results calculate 100, zero and rounded mixed percentages correctly', () => {
  const a = createAttempt(bank, 'expert', { random })
  assert.equal(attemptResult(a), null)
  const perfect = complete(a, a.questions.map(q => q.id))
  assert.deepEqual(attemptResult(perfect), { difficulty: 'expert', mode: 'standard', total: 6, correct: 6, skipped: 0, percent: 100, completedAt: clock() })
  assert.equal(attemptResult(complete(a)).percent, 0)
  const mixed = complete(a, a.questions.slice(0, 4).map(q => q.id))
  assert.equal(attemptResult(mixed).percent, 67)
  assert.equal(nextQuestion(perfect), perfect)
  assert.equal(recordAnswer(perfect, perfect.questions[5].id, 'missing'), perfect)
})

test('a missing-photo skip earns no points and is included in the retry set', () => {
  let a = createAttempt([bank[0]], 'beginner')
  a = nextQuestion(recordAnswer(a, bank[0].id, null), clock)
  assert.equal(attemptResult(a).correct, 0); assert.equal(attemptResult(a).skipped, 1)
  assert.equal(attemptResult(a).percent, 0)
  assert.deepEqual(mistakeQuestions(a).map(q => q.id), [bank[0].id])
})

test('Vue composable records a completion once, restarts cleanly and repeats only mistakes', () => {
  const storage = memoryStorage(); let writes = 0
  const counted = { getItem: storage.getItem, setItem: (key, value) => { writes++; storage.setItem(key, value) } }
  const quiz = useQuiz(ref(bank), { storage: counted, random, now: clock })
  quiz.start('researcher')
  const initialIds = quiz.attempt.value.questions.map(q => q.id)
  for (let index = 0; index < 6; index++) {
    const q = quiz.currentQuestion.value
    quiz.answer(q.id, index < 4 ? q.correctAnswerId : q.options.find(o => o.id !== q.correctAnswerId).id)
    quiz.next()
  }
  quiz.next(); quiz.next()
  assert.equal(writes, 1); assert.equal(quiz.result.value.percent, 67)
  assert.equal(quiz.stage.value, 'result')
  const wrongIds = quiz.mistakes.value.map(q => q.id)
  assert.equal(wrongIds.length, 2)
  quiz.repeatMistakes()
  assert.equal(quiz.attempt.value.mode, 'mistakes')
  assert.deepEqual(new Set(quiz.attempt.value.questions.map(q => q.id)), new Set(wrongIds))
  assert.equal(quiz.progress.value, 0); assert.deepEqual(quiz.attempt.value.answers, {})
  for (let index = 0; index < 2; index++) { const q = quiz.currentQuestion.value; quiz.answer(q.id, q.correctAnswerId); quiz.next() }
  assert.equal(quiz.result.value.percent, 100); assert.equal(quiz.mistakes.value.length, 0)
  quiz.repeatMistakes(); assert.equal(quiz.stage.value, 'result')
  quiz.restart()
  assert.equal(quiz.attempt.value.mode, 'standard'); assert.equal(quiz.stage.value, 'question')
  assert.deepEqual(new Set(quiz.attempt.value.questions.map(q => q.id)), new Set(initialIds))
  assert.deepEqual(quiz.attempt.value.answers, {}); assert.equal(quiz.result.value, null)
  quiz.selectDifficulty(); assert.equal(quiz.stage.value, 'selection')
  assert.equal(readHistory(storage).results.length, 2)
})

test('storage persistence restores results, filters malformed data and caps history', () => {
  const storage = memoryStorage()
  const result = attemptResult(complete(createAttempt(bank, 'expert')))
  let results = []
  for (let index = 0; index < 25; index++) results = appendHistory(results, result, storage).results
  assert.equal(results.length, 20); assert.equal(readHistory(storage).results.length, 20)
  storage.setItem(HISTORY_KEY, JSON.stringify({ version: 1, results: [result, null, { ...result, percent: 200 }, { ...result, correct: -1 }] }))
  assert.deepEqual(readHistory(storage).results, [result])
  storage.setItem(HISTORY_KEY, '{broken')
  assert.deepEqual(readHistory(storage).results, [])
  storage.setItem(HISTORY_KEY, JSON.stringify({ version: 999, results: [result] }))
  assert.deepEqual(readHistory(storage).results, [])
})

test('blocked storage, private mode and quota errors do not prevent quiz completion', () => {
  const blocked = { getItem() { throw new Error('SecurityError') }, setItem() { throw new Error('QuotaExceededError') } }
  assert.equal(readHistory(blocked).available, false)
  assert.equal(readHistory(null).available, false)
  const quiz = useQuiz(ref([bank[0]]), { storage: blocked, now: clock })
  quiz.start('beginner'); const q = quiz.currentQuestion.value; quiz.answer(q.id, q.correctAnswerId); quiz.next()
  assert.equal(quiz.result.value.percent, 100); assert.equal(quiz.storageAvailable.value, false)
  assert.equal(quiz.history.value.length, 1)
})

test('generation validates quiz before overwriting data and detects a stale public question bank', async () => {
  const root = await mkdtemp(join(tmpdir(), 'redbook-quiz-test-'))
  try {
    await mkdir(join(root, 'data'), { recursive: true })
    await mkdir(join(root, 'src/data/quiz'), { recursive: true })
    await cp(join(PROJECT_ROOT, 'data/geography'), join(root, 'data/geography'), { recursive: true })
    const document = structuredClone(sourceDocument)
    document.catalog.forEach(s => { s.images = [] }) // No private/photo assets needed in this isolated fixture.
    await writeFile(join(root, 'data/species.source.json'), JSON.stringify(document))
    const questions = copy().filter(q => q.difficulty === 'researcher')
    const questionPath = join(root, 'src/data/quiz/questions.json')
    await writeFile(questionPath, JSON.stringify(questions))
    await generateAllData(root)
    const before = await readFile(join(root, 'public/data/species.json'), 'utf8')
    await generateAllData(root, { check: true })
    const prepared = await prepareQuiz(root, document.catalog)
    await writeFile(join(root, 'public/data/quiz.json'), prepared.payload.replace(/\n/g, '\r\n'))
    await publishQuiz(root, prepared, { check: true })
    await writeFile(join(root, 'public/data/quiz.json'), '[]')
    await assert.rejects(publishQuiz(root, prepared, { check: true }), /отсутствует или устарел/)
    questions[0].sourceIds = ['unknown']; await writeFile(questionPath, JSON.stringify(questions))
    await assert.rejects(generateAllData(root), /Некорректная викторина/)
    assert.equal(await readFile(join(root, 'public/data/species.json'), 'utf8'), before)
    assert.equal(await readFile(join(root, 'public/data/quiz.json'), 'utf8'), '[]')
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('public questions exactly match the single editorial bank', async () => {
  const generated = JSON.parse(await readFile(join(PROJECT_ROOT, 'public/data/quiz.json'), 'utf8'))
  assert.deepEqual(generated, bank)
  assert.deepEqual(validateQuestions(generated, catalog), [])
})
