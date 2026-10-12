// Keep resize, DPR and accessibility listeners paired with explicit cleanup.
export function observeVisualization(element, { view, Observer, resize, motionChanged }) {
  const disposers = []
  function listen(query, handler) {
    if (query.addEventListener) {
      query.addEventListener('change', handler)
      return () => query.removeEventListener('change', handler)
    }
    query.addListener?.(handler)
    return () => query.removeListener?.(handler)
  }
  const motion = view.matchMedia('(prefers-reduced-motion: reduce)')
  disposers.push(listen(motion, motionChanged))
  let stopResolution = () => {}
  function watchResolution() {
    stopResolution()
    const query = view.matchMedia(`(resolution: ${view.devicePixelRatio || 1}dppx)`)
    stopResolution = listen(query, () => { resize(); watchResolution() })
  }
  watchResolution()
  view.addEventListener('resize', resize)
  disposers.push(() => view.removeEventListener('resize', resize))
  if (Observer) {
    const observer = new Observer(resize)
    observer.observe(element)
    disposers.push(() => observer.disconnect())
  }
  return { reducedMotion: () => motion.matches, dispose: () => { stopResolution(); disposers.forEach(stop => stop()) } }
}
