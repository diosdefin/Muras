import { compositionCrop, DEFAULT_COMPOSITION, validComposition } from '../image-composition.js'

export const ANIMATION_DURATION = 900
// Desaturation carries no numeric meaning; unknown never means zero or extinction.
export const UNKNOWN_DESATURATION = 1
export function backingSize(width, height, dpr = 1) {
  if (![width, height].every(v => Number.isFinite(v) && v > 0)) return null
  const density = Number.isFinite(dpr) && dpr > 0 ? Math.min(2, dpr) : 1
  const scale = Math.min(density, 1800 / Math.max(width, height), Math.sqrt(2000000 / (width * height)))
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) }
}
export function renderFrame(canvas, scratch, source, amount, size, dpr, { composition = DEFAULT_COMPOSITION, effect = 'unknown' } = {}) {
  const backing = backingSize(size?.width, size?.height, dpr)
  if (!backing || !source?.naturalWidth || !source?.naturalHeight) return false
  const context = canvas.getContext('2d'), small = scratch.getContext('2d')
  if (!context || !small) return false
  if (canvas.width !== backing.width) canvas.width = backing.width
  if (canvas.height !== backing.height) canvas.height = backing.height
  const crop = compositionCrop(source.naturalWidth, source.naturalHeight, size.width / size.height, composition)
  const progress = Math.max(0, Math.min(1, Number(amount) || 0))
  const supportsFilter = typeof context.filter === 'string'
  context.clearRect(0, 0, canvas.width, canvas.height)
  if (supportsFilter) context.filter = 'none'
  if (effect === 'unknown' || progress === 0) {
    if (supportsFilter) context.filter = effect === 'unknown' ? `grayscale(${progress * UNKNOWN_DESATURATION})` : 'none'
    context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high'
    context.drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height)
    if (supportsFilter) context.filter = 'none'
  } else {
    // Artistic detail is independent of population value; always sample the immutable original.
    const maximum = Math.min(crop.width, canvas.width)
    const cols = Math.max(24, Math.round(maximum * (24 / Math.max(24, maximum)) ** progress))
    const rows = Math.max(1, Math.round(cols * size.height / size.width))
    if (scratch.width !== cols) scratch.width = cols
    if (scratch.height !== rows) scratch.height = rows
    small.imageSmoothingEnabled = true; small.imageSmoothingQuality = 'high'
    small.drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, cols, rows)
    context.imageSmoothingEnabled = false
    context.drawImage(scratch, 0, 0, cols, rows, 0, 0, canvas.width, canvas.height)
  }
  return true
}

export function createVisualization({ canvas, createCanvas, createImage, requestFrame, cancelFrame,
  measure, getDpr = () => 1,
  reducedMotion = () => false, onState = () => {} }) {
  const scratch = createCanvas()
  let source = null, frame = null, transition = null, disposed = false, generation = 0, visible = true
  let composition = DEFAULT_COMPOSITION
  let state = { mode: 'photo', amount: 0, effect: 'unknown', loading: false, ready: false, error: '' }
  const publish = () => onState({ ...state })
  function cancelFrameOnly() { if (frame !== null) cancelFrame(frame); frame = null }
  function cancel() { cancelFrameOnly(); transition = null }
  function releaseSource() {
    if (source) { source.onload = null; source.onerror = null; source.removeAttribute?.('src'); source = null }
  }
  function fail(message) { cancel(); state.mode = 'photo'; state.amount = 0; state.ready = false; state.error = message; publish() }
  function draw() {
    const size = measure()
    if (!backingSize(size?.width, size?.height)) return false
    if (!renderFrame(canvas, scratch, source, state.amount, size, getDpr(), { composition, effect: state.effect })) throw new Error('Canvas недоступен')
    return true
  }
  function schedule() {
    if (disposed || !visible || !state.ready || frame !== null) return
    const token = generation
    frame = requestFrame(timestamp => {
      if (disposed || !visible || !state.ready || token !== generation) return
      frame = null
      if (transition) {
        transition.startedAt ??= timestamp
        const progress = reducedMotion() ? 1 : Math.max(0, Math.min(1, (timestamp - transition.startedAt) / ANIMATION_DURATION))
        state.amount = transition.from + (transition.to - transition.from) * (progress * progress * (3 - 2 * progress))
        if (progress >= 1) { state.mode = transition.to ? 'active' : 'photo'; transition = null }
      }
      try {
        if (!draw()) {
          if (transition) { transition.from = state.amount; transition.startedAt = null }
          return
        }
      } catch { fail('Интерактивная визуализация недоступна. Можно изучать обычную фотографию.'); return }
      publish()
      if (transition) schedule()
    })
  }
  function change(to) {
    if (disposed || !state.ready) return false
    cancel()
    if (reducedMotion()) {
      state.amount = to; state.mode = to ? 'active' : 'photo'
      try { if (visible) draw() } catch { fail('Интерактивная визуализация недоступна. Можно изучать обычную фотографию.'); return false }
      publish(); return true
    }
    if (state.amount === to) { state.mode = to ? 'active' : 'photo'; publish(); return true }
    transition = { from: state.amount, to, startedAt: null }
    state.mode = to ? 'animating' : 'restoring'
    schedule(); return true
  }
  function load(path, options = {}) {
    if (disposed) return
    generation += 1; cancel(); releaseSource()
    canvas.width = canvas.height = scratch.width = scratch.height = 0
    composition = options.composition || DEFAULT_COMPOSITION
    state = { mode: 'photo', amount: 0, effect: ['exact', 'approximate'].includes(options.type) ? options.type : 'unknown', loading: Boolean(path), ready: false, error: '', grayscaleFallback: false }
    publish()
    if (!path) return
    const token = generation, next = createImage(); source = next
    next.onload = () => {
      if (disposed || token !== generation) return
      state.loading = false
      try {
        const context = canvas.getContext('2d')
        state.ready = Boolean(next.naturalWidth && next.naturalHeight && context && scratch.getContext('2d'))
        state.grayscaleFallback = Boolean(context && typeof context.filter !== 'string')
      } catch { state.ready = false }
      if (!state.ready) state.error = 'Интерактивная визуализация недоступна. Можно изучать обычную фотографию.'
      publish()
    }
    next.onerror = () => {
      if (disposed || token !== generation) return
      state.loading = false; fail('Фотография недоступна. Интерактив появится после восстановления файла.')
    }
    next.src = path
  }
  return {
    load, start: () => change(1), restore: () => change(0),
    setComposition(value) {
      if (disposed || !validComposition(value)) return false
      if (['x','y','zoom'].every(key => value[key] === composition[key])) return true
      composition = value
      if (state.mode !== 'photo') schedule()
      return true
    },
    resize() { if (!disposed && state.mode !== 'photo') schedule() },
    motionChanged() { if (transition && reducedMotion()) change(transition.to) },
    visibilityChanged(value) {
      if (disposed || visible === value) return
      visible = value
      if (!visible) {
        cancelFrameOnly()
        if (transition) { transition.from = state.amount; transition.startedAt = null }
      } else { if (state.mode !== 'photo') schedule() }
    },
    dispose() {
      disposed = true; generation += 1; cancel(); releaseSource()
      canvas.width = canvas.height = scratch.width = scratch.height = 0
    },
  }
}
