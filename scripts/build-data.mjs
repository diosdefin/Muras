import { readFile, writeFile, mkdir, rm, rename, readdir } from 'node:fs/promises'
import { resolve, dirname, relative, extname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { canPublishImage, validateSource, validateSpecies } from '../src/data/species-model.js'

export const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function safePath(root, path) {
  const target = resolve(root, path)
  const rel = relative(root, target)
  if (!rel || rel.startsWith('..') || rel.includes(':')) throw new Error(`Путь выходит за каталог проекта: ${path}`)
  return target
}

export async function generateData(root = PROJECT_ROOT, { check = false, validateOnly = false } = {}) {
  const sourcePath = resolve(root, 'data/species.source.json')
  let source
  try { source = JSON.parse(await readFile(sourcePath, 'utf8')) }
  catch (error) { throw new Error(`Не удалось прочитать data/species.source.json: ${error.message}`) }
  const errors = validateSource(source)
  if (errors.length) throw new Error(`Некорректные данные:\n- ${errors.join('\n- ')}`)
  // Read all allowed assets before changing outputs. Unknown licences never reach public.
  const assets = []
  const catalog = source.catalog.map(species => ({
    ...species,
    images: species.images.filter(canPublishImage).map((image, index) => {
      const original = safePath(root, image.path)
      const name = `${species.id}-${index + 1}${extname(image.path).toLowerCase()}`
      assets.push({ original, name })
      return { ...image, path: `/images/approved/${name}` }
    }),
  }))
  for (const asset of assets) {
    try { asset.bytes = await readFile(asset.original) }
    catch { throw new Error(`Разрешённое изображение не найдено: ${relative(root, asset.original)}`) }
  }
  const publicErrors = validateSpecies(catalog, 'publicCatalog', { publicData: true })
  if (publicErrors.length) throw new Error(publicErrors.join('\n'))
  const payload = `${JSON.stringify(catalog, null, 2)}\n`
  const archivePayload = `${JSON.stringify(source.demoArchive, null, 2)}\n`
  if (validateOnly) return { catalog, archive: source.demoArchive }
  if (check) {
    for (const [path, expected] of [['public/data/species.json', payload], ['data/archive/demo-species.generated.json', archivePayload]]) {
      let actual
      try { actual = await readFile(resolve(root, path), 'utf8') } catch { actual = null }
      if (actual?.replace(/\r\n/g, '\n') !== expected) throw new Error(`${path}: отсутствует или устарел. Выполните npm run data:generate`)
    }
    for (const asset of assets) {
      const bytes = await readFile(resolve(root, 'public/images/approved', asset.name))
      if (!bytes.equals(asset.bytes)) throw new Error(`Публичное фото ${asset.name} устарело`)
    }
    let existing = []
    try { existing = await readdir(resolve(root, 'public/images/approved')) } catch (error) { if (error.code !== 'ENOENT') throw error }
    if (existing.some(name => !assets.some(asset => asset.name === name))) throw new Error('public/images/approved: найдены устаревшие или неподтверждённые изображения')
    return { catalog, archive: source.demoArchive }
  }
  const approved = safePath(root, 'public/images/approved')
  const staged = safePath(root, 'public/images/.approved-stage')
  try {
    // These are exclusively generated directories; safePath confines removal to root.
    await rm(staged, { recursive: true, force: true })
    await mkdir(staged, { recursive: true })
    for (const asset of assets) await writeFile(resolve(staged, asset.name), asset.bytes)
    await mkdir(resolve(root, 'public/data'), { recursive: true })
    await mkdir(resolve(root, 'data/archive'), { recursive: true })
    await rm(approved, { recursive: true, force: true })
    await rename(staged, approved)
    await writeFile(resolve(root, 'public/data/species.json'), payload, 'utf8')
    await writeFile(resolve(root, 'data/archive/demo-species.generated.json'), archivePayload, 'utf8')
  } finally { await rm(staged, { recursive: true, force: true }) }
  return { catalog, archive: source.demoArchive }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const result = await generateData(PROJECT_ROOT, {
      check: process.argv.includes('--check'), validateOnly: process.argv.includes('--validate-only'),
    })
    console.log(`Данные проверены: каталог ${result.catalog.length}, архив ${result.archive.length}.`)
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}
