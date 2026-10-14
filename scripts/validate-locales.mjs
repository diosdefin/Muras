import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { LANGUAGES } from '../src/data/localization.js'
export function validateMessages(messages) {
  const errors = [], keys = Object.keys(messages.ru || {}).sort()
  const slots = text => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort().join(',')
  for (const lang of LANGUAGES) {
    const dict = messages[lang]
    if (!dict || typeof dict !== 'object' || Array.isArray(dict)) { errors.push(`${lang}: ожидается словарь`); continue }
    if (JSON.stringify(Object.keys(dict).sort()) !== JSON.stringify(keys)) errors.push(`${lang}: набор ключей отличается от ru`)
    for (const key of keys) {
      if (typeof dict[key] !== 'string' || !dict[key].trim()) errors.push(`${lang}.${key}: пустой или некорректный перевод`)
      else if (typeof messages.ru[key] === 'string' && slots(dict[key]) !== slots(messages.ru[key])) errors.push(`${lang}.${key}: параметры перевода отличаются от ru`)
    }
  }
  return errors
}
export async function validateMessageReferences(root, keys) {
  const errors = []
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = resolve(dir, entry.name)
      if (entry.isDirectory()) await walk(path)
      else if (/\.(vue|js)$/.test(entry.name)) {
        const code = await readFile(path, 'utf8')
        for (const match of code.matchAll(/\bt\(\s*['"]([^'"]+)['"]/g)) {
          if (!keys.has(match[1])) errors.push(`${path}: неизвестный ключ ${match[1]}`)
        }
      }
    }
  }
  await walk(resolve(root, 'src'))
  return errors
}
export async function checkLocales(root = process.cwd()) {
  const messages = {}
  for (const language of LANGUAGES) {
    const publicMessages = JSON.parse(await readFile(resolve(root, 'src/locales', `${language}.json`), 'utf8'))
    const adminMessages = JSON.parse(await readFile(resolve(root, 'src/admin/locales', `${language}.json`), 'utf8'))
    if (Object.keys(adminMessages).some(key => !key.startsWith('admin.'))) throw new Error('Ключи админки должны начинаться с admin.')
    messages[language] = { ...publicMessages, ...adminMessages }
  }
  const errors = [...validateMessages(messages), ...await validateMessageReferences(root, new Set(Object.keys(messages.ru)))]
  if (errors.length) throw new Error(`Некорректные переводы:\n${errors.join('\n')}`)
  return Object.keys(messages.ru).length
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { console.log(`Переводы проверены: ${await checkLocales()} ключей × ${LANGUAGES.length} языка.`) }
  catch(error) { console.error(error.message); process.exitCode = 1 }
}
