import { canPublishImage } from '../species-model.js'

export const DIFFICULTIES = [
  { id: 'beginner', label: 'Начинающий', description: 'Узнайте виды по фотографиям и названиям.', number: '01' },
  { id: 'researcher', label: 'Исследователь', description: 'Местообитания, угрозы и способы охраны.', number: '02' },
  { id: 'expert', label: 'Эксперт', description: 'Научные названия, классификация и охрана.', number: '03' },
]
export const QUESTION_LIMIT = 10

export function questionSpecies(question, species) {
  return species.find(item => item.id === question.speciesId) || null
}

export function questionPhoto(question, species) {
  const image = questionSpecies(question, species)?.images?.[question.image?.speciesImageIndex]
  return question.image && canPublishImage(image) ? image : null
}

export function questionSources(question, species) {
  return questionSpecies(question, species)?.sources.filter(source => question.sourceIds.includes(source.id)) || []
}

export function validateQuestions(questions, catalog) {
  const errors = []
  const fail = (path, message) => errors.push(`${path}: ${message}`)
  const text = value => typeof value === 'string' && value.trim().length > 0
  const fields = ['id', 'difficulty', 'question', 'options', 'correctAnswerId', 'explanation', 'speciesId', 'sourceIds', 'image', 'factPaths']
  if (!Array.isArray(questions)) return ['quiz: ожидается массив вопросов']
  if (!Array.isArray(catalog)) return ['quiz: каталог видов недоступен']
  const ids = new Set()
  const prompts = new Set()
  questions.forEach((q, index) => {
    const p = `quiz[${index}]`
    if (!q || typeof q !== 'object' || Array.isArray(q)) { fail(p, 'ожидается объект вопроса'); return }
    for (const field of fields) if (!(field in q)) fail(`${p}.${field}`, 'обязательное поле отсутствует')
    for (const key of Object.keys(q)) if (!fields.includes(key)) fail(`${p}.${key}`, 'неизвестное поле')
    if (!text(q.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(q.id) || ids.has(q.id)) fail(`${p}.id`, 'нужен уникальный безопасный id')
    ids.add(q.id)
    if (!DIFFICULTIES.some(level => level.id === q.difficulty)) fail(`${p}.difficulty`, 'неизвестный уровень')
    for (const key of ['question', 'explanation', 'speciesId']) if (!text(q[key])) fail(`${p}.${key}`, 'ожидается непустая строка')
    const prompt = text(q.question) ? q.question.trim().toLocaleLowerCase('ru') : null
    if (prompt && prompts.has(prompt)) fail(`${p}.question`, 'повторяющийся вопрос')
    prompts.add(prompt)
    if (!Array.isArray(q.options) || q.options.length !== 4) fail(`${p}.options`, 'требуются ровно четыре варианта')
    else {
      const optionIds = new Set()
      const optionTexts = new Set()
      q.options.forEach((option, n) => {
        if (!option || typeof option !== 'object' || !text(option.id) || !text(option.text)) { fail(`${p}.options[${n}]`, 'нужны id и text'); return }
        if (optionIds.has(option.id) || optionTexts.has(option.text.trim().toLocaleLowerCase('ru'))) fail(`${p}.options[${n}]`, 'повторяющийся вариант')
        optionIds.add(option.id); optionTexts.add(option.text.trim().toLocaleLowerCase('ru'))
      })
      if (!text(q.correctAnswerId) || !optionIds.has(q.correctAnswerId)) fail(`${p}.correctAnswerId`, 'правильный ответ должен быть одним из вариантов')
    }
    const species = questionSpecies(q, catalog)
    if (!species) { fail(`${p}.speciesId`, 'неизвестный вид национального каталога'); return }
    const refs = Array.isArray(q.sourceIds) ? q.sourceIds : []
    if (!Array.isArray(q.sourceIds) || !q.sourceIds.length || new Set(q.sourceIds).size !== q.sourceIds.length || q.sourceIds.some(id => !species.sources.some(s => s.id === id))) {
      fail(`${p}.sourceIds`, 'нужны уникальные ссылки на существующие источники этого вида')
    }
    if (!Array.isArray(q.factPaths) || !q.factPaths.length || q.factPaths.some(path => !text(path))) fail(`${p}.factPaths`, 'укажите подтверждаемые поля каталога')
    else for (const path of q.factPaths) {
      const value = path.split('.').reduce((entry, key) => entry?.[key], species)
      if (value == null || !species.sources.some(s => refs.includes(s.id) && s.supports.includes(path))) {
        fail(`${p}.factPaths`, `нет подтверждения поля ${path} в указанных источниках`)
      }
    }
    if (q.image !== null && (!q.image || typeof q.image !== 'object' || !Number.isInteger(q.image.speciesImageIndex) || q.image.speciesImageIndex < 0 || !questionPhoto(q, catalog))) {
      fail(`${p}.image`, 'нужна ссылка speciesImageIndex на разрешённое фото вида или null')
    }
  })
  return errors
}
