import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { validateQuestions } from '../src/data/quiz/model.js'

// Later question batches are published separately (public/data/quiz-extra.json), so the
// original, checksum-verified question bank and its public projection stay byte-identical.
export const QUIZ_BATCHES = ['src/data/quiz/questions-batch-2.json', 'src/data/quiz/questions-batch-3.json', 'src/data/quiz/questions-batch-4.json']

export async function prepareQuiz(root, catalog) {
  let questions
  try { questions = JSON.parse(await readFile(resolve(root, 'src/data/quiz/questions.json'), 'utf8')) }
  catch (error) { throw new Error(`Не удалось прочитать src/data/quiz/questions.json: ${error.message}`) }
  const extra = []
  for (const batch of QUIZ_BATCHES) {
    let text
    try { text = await readFile(resolve(root, batch), 'utf8') } catch { continue }
    try { extra.push(...JSON.parse(text)) } catch (error) { throw new Error(`Не удалось прочитать ${batch}: ${error.message}`) }
  }
  // Validated together: ids and question texts are unique across the whole bank.
  const errors = validateQuestions([...questions, ...extra], catalog)
  if (errors.length) throw new Error(`Некорректная викторина:\n- ${errors.join('\n- ')}`)
  return { questions, extra, payload: `${JSON.stringify(questions, null, 2)}\n`, extraPayload: `${JSON.stringify(extra, null, 2)}\n` }
}

export async function publishQuiz(root, prepared, { check = false, validateOnly = false } = {}) {
  if (validateOnly) return
  const path = resolve(root, 'public/data/quiz.json')
  const extraPath = resolve(root, 'public/data/quiz-extra.json')
  const hasExtra = prepared.extra?.length > 0
  if (check) {
    let actual
    try { actual = await readFile(path, 'utf8') } catch { actual = null }
    if (actual?.replace(/\r\n/g, '\n') !== prepared.payload) throw new Error('public/data/quiz.json: отсутствует или устарел. Выполните npm run data')
    if (hasExtra) {
      let extra
      try { extra = await readFile(extraPath, 'utf8') } catch { extra = null }
      if (extra?.replace(/\r\n/g, '\n') !== prepared.extraPayload) throw new Error('public/data/quiz-extra.json: отсутствует или устарел. Выполните npm run data')
    }
  } else {
    await mkdir(resolve(root, 'public/data'), { recursive: true })
    await writeFile(path, prepared.payload, 'utf8')
    if (hasExtra) await writeFile(extraPath, prepared.extraPayload, 'utf8')
  }
}
