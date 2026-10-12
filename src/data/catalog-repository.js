import { validateSpecies } from './species-model.js'

// The UI consumes validated records, independently of static JSON or a future API.
export async function loadSpeciesCatalog({ url = `${import.meta.env?.BASE_URL || '/'}data/species.json`, fetcher = globalThis.fetch, signal } = {}) {
  const response = await fetcher(url, { signal })
  if (!response.ok) throw new Error(`Не удалось загрузить данные: ${response.status}`)
  const records = await response.json()
  const errors = validateSpecies(records, 'catalog', { publicData: true })
  if (errors.length) throw new Error(`Некорректные данные каталога: ${errors[0]}`)
  return records
}
