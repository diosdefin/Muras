// Shareable public profile routes; keep the published species id as the stable slug.
const SPECIES_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function speciesPath(id) {
  if (typeof id !== 'string' || !SPECIES_ID.test(id)) throw new TypeError('Invalid species id')
  return `/species/${id}`
}

export function speciesIdFromPath(pathname) {
  if (typeof pathname !== 'string') return null
  const match = /^\/species\/([^/]+)\/?$/.exec(pathname)
  if (!match) return null
  try {
    const id = decodeURIComponent(match[1])
    return SPECIES_ID.test(id) ? id : null
  } catch { return null }
}
