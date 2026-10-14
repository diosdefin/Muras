import { readFile, realpath } from 'node:fs/promises'
import { resolve, relative, isAbsolute } from 'node:path'
import { TextDecoder } from 'node:util'
import { digest, safeJson } from './research-pipeline.mjs'
import { inspectAssets } from '../import-species-batch.mjs'

export function confined(root, path) {
  if (typeof path !== 'string' || !path.trim()) throw new Error('Нужен локальный путь')
  const target = resolve(root, path), rel = relative(root, target)
  if (!rel || rel === '..' || rel.startsWith(`..\\`) || rel.startsWith('../') || isAbsolute(rel) || rel.includes(':')) throw new Error(`Путь вне проекта: ${path}`)
  return target
}
export async function readLocal(root, path) {
  const target = confined(root, path)
  // A lexical path alone would let a symlink read unrelated local files.
  confined(await realpath(root), await realpath(target))
  const bytes = await readFile(target)
  if (bytes.length > 16 * 1024 * 1024) throw new Error('Локальный материал превышает 16 MiB')
  return bytes
}
export const decodeUtf8 = bytes => new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, '')
export function parseJson(bytes) {
  const value = JSON.parse(decodeUtf8(bytes))
  if (!safeJson(value)) throw new Error('Нужен безопасный JSON без служебных ключей')
  return value
}

// An adapter returns evidence only; no network, approval, taxonomy guessing or writes.
// Future remote adapters must be explicitly invoked and save reviewable local snapshots.
export function createLocalAdapter(root) {
  const files = new Map()
  let reads = 0
  const read = path => {
    const key = confined(root, path)
    if (!files.has(key)) { reads++; files.set(key, readLocal(root, path)) }
    return files.get(key)
  }
  return { kind: 'local', get reads() { return reads },
    async load(c) {
      if (c.draft && c.draftFile) throw new Error('Укажите только draft или draftFile')
      const draftBytes = c.draftFile ? await read(c.draftFile) : null
      const draft = draftBytes ? parseJson(draftBytes) : c.draft
      if (draft && (typeof draft !== 'object' || Array.isArray(draft))) throw new Error('draft должен быть объектом вида')
      if (!Array.isArray(c.materials)) throw new Error('materials должен быть списком локальных материалов')
      const materials = []
      for (const material of c.materials) {
        if (!material || !/^[a-f0-9]{64}$/.test(material.sha256 || '')) throw new Error('Материал требует path и SHA-256')
        const actual = digest(await read(material.path))
        if (actual !== material.sha256) throw new Error(`Материал изменён: ${material.path}`)
        materials.push({ path: material.path, sha256: actual })
      }
      return { draft: draft || null, draftSha256: draftBytes ? digest(draftBytes) : null, materials }
    } }
}

export async function inspectPipelineAssets(root, species) {
  const errors = await inspectAssets(root, species)
  for (const image of species.images) {
    try {
      await readLocal(root, image.path)
      const cc = /^CC BY(-SA)? ([234]\.0)$/.exec(image.license || '')
      const uri = new URL(image.licenseUrl)
      if (cc) {
        if (uri.hostname !== 'creativecommons.org' || uri.pathname !== `/licenses/by${cc[1] ? '-sa' : ''}/${cc[2]}/` || uri.search || uri.hash) throw new Error('URL не соответствует лицензии CC')
      } else if (image.license === 'CC0') {
        if (uri.hostname !== 'creativecommons.org' || uri.pathname !== '/publicdomain/zero/1.0/' || uri.search || uri.hash) throw new Error('URL не соответствует CC0')
      } else if (image.license === 'Public domain') {
        if (image.licenseUrl !== 'https://commons.wikimedia.org/wiki/Template:PD-self') throw new Error('Public domain требует документированного PD-self')
      } else if (image.license === 'Apache License 2.0') {
        if (image.licenseUrl !== 'https://www.apache.org/licenses/LICENSE-2.0' || !image.licenseArtifacts?.copyrightNotice) throw new Error('Apache требует LICENSE/NOTICE и copyright')
        for (const [pathKey, hashKey] of [['licensePath', 'licenseSha256'], ['noticePath', 'noticeSha256']]) {
          if (digest(await readLocal(root, image.licenseArtifacts[pathKey])) !== image.licenseArtifacts[hashKey]) throw new Error('LICENSE/NOTICE изменён')
        }
      } else throw new Error('Лицензия требует отдельного документального допуска')
    } catch (error) { errors.push(`${image.path}: ${error.message}`) }
  }
  return errors
}
