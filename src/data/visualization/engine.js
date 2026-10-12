export const RESTORE_DURATION = 650
export function normalizeDetail(value) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : 100
}

export function backingSize(width, height, dpr = 1) {
  if (![width, height].every(v => Number.isFinite(v) && v > 0)) return null
  const density = Number.isFinite(dpr) && dpr > 0 ? Math.min(3, dpr) : 1
  const scale = Math.min(density, 2400 / Math.max(width, height), Math.sqrt(4000000 / (width * height)))
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) }
}

export function containRect(sourceWidth, sourceHeight, width, height) {
  if (![sourceWidth, sourceHeight, width, height].every(v => Number.isFinite(v) && v > 0)) return null
  const scale = Math.min(width / sourceWidth, height / sourceHeight)
  const w = sourceWidth * scale, h = sourceHeight * scale
  return { x: (width - w) / 2, y: (height - h) / 2, width: w, height: h }
}

export function renderFrame(canvas, scratch, source, detail, size, dpr) {
  const backing = backingSize(size?.width, size?.height, dpr)
  if (!backing || !source?.naturalWidth || !source?.naturalHeight) return false
  const context = canvas.getContext('2d'), small = scratch.getContext('2d')
  if (!context || !small) return false
  if (canvas.width !== backing.width) canvas.width = backing.width
  if (canvas.height !== backing.height) canvas.height = backing.height
  const rect = containRect(source.naturalWidth, source.naturalHeight, canvas.width, canvas.height)
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#eef1e9'
  context.fillRect(0, 0, canvas.width, canvas.height)
  if (normalizeDetail(detail) >= 100) {
    context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high'
    context.drawImage(source, 0, 0, source.naturalWidth, source.naturalHeight, rect.x, rect.y, rect.width, rect.height)
  } else {
    const max = Math.max(8, Math.min(source.naturalWidth, rect.width))
    const cols = Math.max(8, Math.round(8 * (max / 8) ** (normalizeDetail(detail) / 100)))
    const rows = Math.max(1, Math.round(cols * source.naturalHeight / source.naturalWidth))
    scratch.width = cols; scratch.height = rows
    small.imageSmoothingEnabled = true; small.imageSmoothingQuality = 'high'
    // Always sample the immutable full photograph, never a previous pixelated frame.
    small.drawImage(source, 0, 0, source.naturalWidth, source.naturalHeight, 0, 0, cols, rows)
    context.imageSmoothingEnabled = false
    context.drawImage(scratch, 0, 0, cols, rows, rect.x, rect.y, rect.width, rect.height)
  }
  return true
}

export function createVisualization({ canvas, createCanvas, createImage, requestFrame, cancelFrame,
  measure, getDpr = () => 1, reducedMotion = () => false, onState = () => {} }) {
  const scratch = createCanvas()
  let source = null, frame = null, restoration = null, disposed = false, generation = 0
  let state = { mode: 'photo', detail: 100, loading: false, ready: false, error: '', restorationCount: 0 }
  const publish = () => onState({ ...state })
  const cancel = () => { if (frame !== null) cancelFrame(frame); frame = null; restoration = null }
  function releaseSource() {
    if (source) { source.onload = null; source.onerror = null; source.removeAttribute?.('src'); source = null }
  }
  function finish() {
    cancel(); state.mode = 'photo'; state.detail = 100; state.restorationCount += 1; publish()
  }
  function schedule() {
    if (disposed || !state.ready || frame !== null) return
    frame = requestFrame(timestamp => {
      frame = null
      if (disposed || !state.ready) return
      if (restoration) {
        restoration.startedAt ??= timestamp
        const progress = Math.max(0, Math.min(1, (timestamp - restoration.startedAt) / RESTORE_DURATION))
        state.detail = restoration.from + (100 - restoration.from) * (1 - (1 - progress) ** 3)
        publish()
        if (progress >= 1 || reducedMotion()) { finish(); return }
      }
      try {
        const size = measure()
        // A temporarily hidden frame can be redrawn when ResizeObserver reports its size.
        if (backingSize(size?.width, size?.height)) {
          if (!renderFrame(canvas, scratch, source, state.detail, size, getDpr())) throw new Error('Canvas недоступен')
        }
      } catch {
        cancel(); state.mode = 'photo'; state.ready = false; state.error = 'Интерактивная визуализация недоступна. Можно изучать обычную фотографию.'; publish(); return
      }
      if (restoration) schedule()
    })
  }
  function load(path) {
    if (disposed) return
    generation += 1; cancel(); releaseSource()
    state = { mode: 'photo', detail: 100, loading: Boolean(path), ready: false, error: '', restorationCount: 0 }
    publish()
    if (!path) return
    const token = generation, next = createImage()
    source = next
    next.onload = () => {
      if (disposed || token !== generation) return
      state.loading = false
      try { state.ready = Boolean(next.naturalWidth && next.naturalHeight && canvas.getContext('2d') && scratch.getContext('2d')) }
      catch { state.ready = false }
      if (!state.ready) state.error = 'Интерактивная визуализация недоступна. Можно изучать обычную фотографию.'
      publish()
    }
    next.onerror = () => {
      if (disposed || token !== generation) return
      cancel(); state.mode = 'photo'; state.loading = false; state.ready = false
      state.error = 'Фотография недоступна. Интерактив появится после восстановления файла.'; publish()
    }
    next.src = path
  }
  return {
    load,
    start() {
      if (disposed || !state.ready) return false
      cancel(); state.mode = 'active'; state.detail = 35; publish(); schedule(); return true
    },
    setDetail(value) {
      if (disposed || !state.ready || state.mode === 'photo') return false
      if (restoration) cancel()
      state.mode = 'active'; state.detail = normalizeDetail(value); publish(); schedule(); return true
    },
    restore() {
      if (disposed || !state.ready || state.mode !== 'active') return false
      if (reducedMotion() || state.detail >= 100) { finish(); return true }
      cancel(); state.mode = 'restoring'; restoration = { from: state.detail, startedAt: null }
      publish(); schedule(); return true
    },
    resize() { if (!disposed && state.mode !== 'photo') schedule() },
    motionChanged() { if (restoration && reducedMotion()) finish() },
    dispose() {
      disposed = true; generation += 1; cancel(); releaseSource()
      canvas.width = canvas.height = scratch.width = scratch.height = 0
    },
  }
}
