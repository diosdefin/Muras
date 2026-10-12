export const WALL_KEY = 'redbook.support.demo.v1'
export const WALL_LIMIT = 50
export const ALIAS_HINT = 'Используйте 2–32 буквы, цифры, пробелы, дефис или подчёркивание. Без контактов и ссылок.'

export function normalizeAlias(value) {
  return typeof value === 'string' ? value.normalize('NFC').trim().replace(/ +/g, ' ') : ''
}

export function validAlias(value) {
  return typeof value === 'string' && value === normalizeAlias(value) &&
    [...value].length >= 2 && [...value].length <= 32 &&
    /^[\p{L}\p{M}\p{N} _-]+$/u.test(value) && /[\p{L}]/u.test(value) &&
    (value.match(/\p{N}/gu)?.length || 0) < 7
}

const aliasKey = entry => `${entry.speciesId || ''}:${entry.alias.toLocaleLowerCase('ru')}`
function validEntry(entry, speciesIds) {
  return entry && typeof entry === 'object' && !Array.isArray(entry) &&
    Object.keys(entry).length === 4 && typeof entry.id === 'string' && /^[a-zA-Z0-9-]{1,80}$/.test(entry.id) &&
    validAlias(entry.alias) && (entry.speciesId === null || speciesIds.includes(entry.speciesId)) &&
    typeof entry.createdAt === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(entry.createdAt) &&
    !Number.isNaN(Date.parse(entry.createdAt)) && new Date(entry.createdAt).toISOString() === entry.createdAt
}

export function readWall(storage, speciesIds) {
  const result = { entries: [], available: Boolean(storage), hasSavedData: false, notice: '' }
  if (!storage) return result
  let raw
  try { raw = storage.getItem(WALL_KEY) }
  catch { return { ...result, available: false } }
  if (raw === null) return result
  result.hasSavedData = true
  try {
    if (raw.length > 40000) throw new Error('Oversized demo data')
    const document = JSON.parse(raw)
    if (document?.version !== 1 || !Array.isArray(document.entries)) throw new Error('Unknown format')
    const ids = new Set(), aliases = new Set()
    for (const entry of document.entries) {
      if (!validEntry(entry, speciesIds) || ids.has(entry.id) || aliases.has(aliasKey(entry)) || result.entries.length >= WALL_LIMIT) continue
      result.entries.push({ ...entry }); ids.add(entry.id); aliases.add(aliasKey(entry))
    }
    if (result.entries.length !== document.entries.length) result.notice = 'Некорректные локальные демозаписи пропущены. Можно очистить весь демосписок.'
  } catch { result.notice = 'Сохранённый демосписок не удалось прочитать. Можно очистить его и начать заново.' }
  return result
}

// Persist first: a failed deletion must never be announced as successful.
export function writeWall(storage, entries) {
  try {
    if (!storage) return false
    if (entries.length) storage.setItem(WALL_KEY, JSON.stringify({ version: 1, entries }))
    else storage.removeItem(WALL_KEY)
    return true
  } catch { return false }
}

export function addWallEntry(entries, { alias, speciesId = null, acknowledged = false }, speciesIds,
  { makeId = () => globalThis.crypto?.randomUUID?.() || `demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`, now = () => new Date().toISOString() } = {}) {
  const name = normalizeAlias(alias)
  if (!validAlias(name)) return { error: ALIAS_HINT }
  if (!acknowledged) return { error: 'Подтвердите, что добавляете только локальную демозапись.' }
  if (speciesId !== null && !speciesIds.includes(speciesId)) return { error: 'Выбранный вид недоступен. Выберите вид из каталога.' }
  if (entries.length >= WALL_LIMIT) return { error: `В демосписке может быть не больше ${WALL_LIMIT} записей. Удалите ненужные записи.` }
  const entry = { id: makeId(), alias: name, speciesId, createdAt: now() }
  if (entries.some(item => aliasKey(item) === aliasKey(entry))) return { error: 'Этот псевдоним уже есть в выбранном демосписке.' }
  if (!validEntry(entry, speciesIds) || entries.some(item => item.id === entry.id)) return { error: 'Не удалось создать демозапись. Попробуйте ещё раз.' }
  return { entries: [...entries, entry] }
}

export function wallEntries(entries, speciesId = null, scope = 'all') {
  return scope === 'species' ? entries.filter(entry => speciesId && entry.speciesId === speciesId) : [...entries]
}
