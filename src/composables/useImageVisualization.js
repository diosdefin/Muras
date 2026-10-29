import { onBeforeUnmount, ref, watch } from 'vue'
import { createVisualization } from '../data/visualization/engine.js'
import { observeVisualization } from '../data/visualization/environment.js'

const idle = () => ({ mode: 'photo', amount: 0, effect: 'unknown', loading: false, ready: false, error: '' })
// No image decoder, Canvas context, observers or RAF until an explicit start.
export function useImageVisualization(canvas, container, input) {
  const state = ref(idle())
  let controller, environment, pendingStart = false, disposed = false
  function release() {
    pendingStart = false
    environment?.dispose(); controller?.dispose()
    environment = controller = null
  }
  function restore() { release(); state.value = idle() }
  function start() {
    if (disposed || !canvas.value || !input.value.path || !['exact', 'approximate'].includes(input.value.type)) return false
    release(); pendingStart = true
    controller = createVisualization({
      canvas: canvas.value, createCanvas: () => document.createElement('canvas'), createImage: () => new Image(),
      requestFrame: callback => window.requestAnimationFrame(callback), cancelFrame: id => window.cancelAnimationFrame(id),
      measure: () => container.value.getBoundingClientRect(), getDpr: () => window.devicePixelRatio,
      reducedMotion: () => environment?.reducedMotion() || false,
      onState(value) {
        state.value = value
        if (value.error) release()
        else if (value.ready && pendingStart) { pendingStart = false; controller.start() }
      },
    })
    environment = observeVisualization(container.value, { view: window, Observer: window.ResizeObserver, VisibilityObserver: window.IntersectionObserver,
      resize: controller.resize, motionChanged: controller.motionChanged, visibilityChanged: controller.visibilityChanged })
    controller.load(input.value.path, input.value)
    return true
  }
  watch(input, (value, previous) => {
    if (value.path !== previous?.path || value.type !== previous?.type || value.id !== previous?.id) restore()
    else controller?.setComposition(value.composition)
  }, { flush: 'sync' })
  onBeforeUnmount(() => { disposed = true; release() })
  return { state, start, restore }
}
