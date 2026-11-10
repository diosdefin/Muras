import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { validateQuestions } from '../src/data/quiz/model.js'

export async function prepareQuiz(root, catalog) {
  let questions
  try { questions = JSON.parse(await readFile(resolve(root, 'src/data/quiz/questions.json'), 'utf8')) }
  catch (error) { throw new Error(`Не удалось прочитать src/data/quiz/questions.json: ${error.message}`) }
  const errors = validateQuestions(questions, catalog)
  if (errors.length) throw new Error(`Некорректная викторина:\n- ${errors.join('\n- ')}`)
  return { questions, payload: `${JSON.stringify(questions, null, 2)}\n` }
}

export async function publishQuiz(root, prepared, { check = false, validateOnly = false } = {}) {
  if (validateOnly) return
  const path = resolve(root, 'public/data/quiz.json')
  if (check) {
    let actual
    try { actual = await readFile(path, 'utf8') } catch { actual = null }
    if (actual?.replace(/\r\n/g, '\n') !== prepared.payload) throw new Error('public/data/quiz.json: отсутствует или устарел. Выполните npm run data')
  } else {
    await mkdir(resolve(root, 'public/data'), { recursive: true })
    await writeFile(path, prepared.payload, 'utf8')
  }
}
