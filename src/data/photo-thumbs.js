// Lightweight copies of licensed photos live in public/images/thumbs/ (see scripts/make-thumbs.py).
// Originals are never replaced; a thumbnail is only a faster way to show the same photo.
const COPIED = /^\/?images\/(approved|areas)\/([^/]+)\.webp$/

export function thumbPaths(path) {
  const match = typeof path === 'string' ? COPIED.exec(path) : null
  if (!match) return null
  const base = `images/thumbs/${match[1]}/${match[2]}`
  return { webp: `${base}.webp`, avif: `${base}.avif` }
}

// Slow or metered connection: Chrome/Android expose it through the Network Information API.
export function connectionIsConstrained(connection = globalThis.navigator?.connection) {
  if (!connection) return false
  return connection.saveData === true || ['slow-2g', '2g', '3g'].includes(connection.effectiveType)
}

// One-time check whether this browser decodes AVIF (decides which thumbnail format to keep offline).
let avifSupport
export function supportsAvif() {
  avifSupport ??= new Promise(resolve => {
    const probe = new Image()
    probe.onload = () => resolve(probe.width === 2)
    probe.onerror = () => resolve(false)
    probe.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADrbWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAAAAAAAOcGl0bQAAAAAAAQAAAB5pbG9jAAAAAEQAAAEAAQAAAAEAAAETAAAAJAAAAChpaW5mAAAAAAABAAAAGmluZmUCAAAAAAEAAGF2MDFDb2xvcgAAAABqaXBycAAAAEtpcGNvAAAAFGlzcGUAAAAAAAAAAgAAAAIAAAAQcGl4aQAAAAADCAgIAAAADGF2MUOBAAwAAAAAE2NvbHJuY2x4AAEADQAGgAAAABdpcG1hAAAAAAAAAAEAAQQBAoMEAAAALG1kYXQSAAoIGAA2iAhoNCAyFhrHh4XhzDDDAoAAAJA1jjx+ybZmPIA='
  })
  return avifSupport
}
