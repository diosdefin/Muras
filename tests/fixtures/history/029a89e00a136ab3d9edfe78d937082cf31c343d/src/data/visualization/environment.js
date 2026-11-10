// Keep resize, DPR and accessibility listeners paired with explicit cleanup.
export function observeVisualization(element, { view, Observer, VisibilityObserver, resize, motionChanged, visibilityChanged = () => {} }) {
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
  let inViewport = true
  const reportVisibility = () => visibilityChanged(inViewport && !view.document?.hidden)
  if (view.document) {
    view.document.addEventListener('visibilitychange', reportVisibility)
    disposers.push(() => view.document.removeEventListener('visibilitychange', reportVisibility))
  }
  if (VisibilityObserver) {
    const observer = new VisibilityObserver(entries => {
      inViewport = entries.some(entry => entry.isIntersecting); reportVisibility()
    })
    observer.observe(element)
    disposers.push(() => observer.disconnect())
  }
  reportVisibility()
  view.addEventListener('resize', resize)
  disposers.push(() => view.removeEventListener('resize', resize))
  if (Observer) {
    const observer = new Observer(resize)
    observer.observe(element)
    disposers.push(() => observer.disconnect())
  }
  return { reducedMotion: () => motion.matches, dispose: () => { stopResolution(); disposers.forEach(stop => stop()) } }
}
