import { clone, editableShape, importSource, MAX_JSON_BYTES } from './model.js'
export const DRAFT_KEY = 'redbook.admin.draft.v1'
export const PREVIOUS_KEY = 'redbook.admin.previous.v1'
// A draft retains two complete documents plus bounded asset metadata.
// The imported source still has the independent MAX_JSON_BYTES limit.
export const MAX_DRAFT_BYTES = 2 * MAX_JSON_BYTES + 64 * 1024
export function createDraftRepository(storage) {
  function read(key) {
    const text = storage?.getItem(key)
    if (!text) return null
    if (new TextEncoder().encode(text).length > MAX_DRAFT_BYTES) throw new Error('admin.error.jsonSize')
    const envelope = JSON.parse(text)
    if (envelope.version !== 1 || !editableShape(envelope.current) || !Array.isArray(envelope.assets) || envelope.assets.some(a=>
      !a || typeof a.id!=='string' || !Number.isInteger(a.speciesIndex) || a.speciesIndex<0 || !Number.isInteger(a.index) || a.index<0 ||
      !Number.isInteger(a.size) || a.size<=0 || a.size>20*1024*1024 || typeof a.fileName!=='string' || !/^[a-f0-9]{64}$/.test(a.sha256) || typeof a.prepared!=='boolean' ||
      Object.keys(a).some(k=>!['id','speciesIndex','index','size','fileName','sha256','prepared'].includes(k)))) throw new Error('admin.error.draft')
    importSource(JSON.stringify(envelope.original))
    if(JSON.stringify(envelope.current.demoArchive)!==JSON.stringify(envelope.original.demoArchive))throw new Error('admin.error.draft')
    return envelope
  }
  return {
    load: () => read(DRAFT_KEY), previous: () => read(PREVIOUS_KEY),
    save(envelope, { checkpoint = false } = {}) {
      if (!storage) throw new Error('admin.error.storage')
      const value = JSON.stringify({ ...clone(envelope), version: 1 })
      if (new TextEncoder().encode(value).length > MAX_DRAFT_BYTES) throw new Error('admin.error.jsonSize')
      let previous, backup
      try { previous = storage.getItem(DRAFT_KEY); backup = storage.getItem(PREVIOUS_KEY) }
      catch(error) { throw new Error('admin.error.storage', { cause:error }) }
      try {
        if (checkpoint && previous) storage.setItem(PREVIOUS_KEY, previous)
        storage.setItem(DRAFT_KEY, value)
      } catch(error) {
        try { if (checkpoint) { if (backup === null) storage.removeItem(PREVIOUS_KEY); else storage.setItem(PREVIOUS_KEY, backup) } } catch { /* Report failure, never claim success. */ }
        throw new Error('admin.error.storage', { cause:error })
      }
    },
    clear(confirmed) { if (!confirmed) return false; storage?.removeItem(DRAFT_KEY); storage?.removeItem(PREVIOUS_KEY); return true },
  }
}
export function browserStorage() { try { return globalThis.localStorage } catch { return null } }
// Replace this repository with a REST adapter later; UI continues to use import/load/save/export operations.
