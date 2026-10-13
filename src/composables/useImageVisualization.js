import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createVisualization } from '../data/visualization/engine.js'
import { observeVisualization } from '../data/visualization/environment.js'

export function useImageVisualization(canvas, container, input) {
  const state = ref({ mode: 'photo', amount: 0, effect: 'unknown', loading: true, ready: false, error: '' })
  let controller, environment
  onMounted(() => {
    controller = createVisualization({
      canvas: canvas.value, createCanvas: () => document.createElement('canvas'), createImage: () => new Image(),
      requestFrame: callback => window.requestAnimationFrame(callback), cancelFrame: id => window.cancelAnimationFrame(id),
      // Canvas is initially display:none; measure the stable image frame instead.
      measure: () => container.value.getBoundingClientRect(), getDpr: () => window.devicePixelRatio,
      reducedMotion: () => environment?.reducedMotion() || false, onState: value => { state.value = value },
    })
    environment = observeVisualization(container.value, { view: window, Observer: window.ResizeObserver, VisibilityObserver: window.IntersectionObserver,
      resize: controller.resize, motionChanged: controller.motionChanged, visibilityChanged: controller.visibilityChanged })
    controller.load(input.value.path, input.value)
  })
  watch(input, (value, previous) => {
    if (value.path !== previous?.path || value.type !== previous?.type || value.id !== previous?.id) controller?.load(value.path, value)
    else controller?.setComposition(value.composition)
  }, { flush: 'sync' })
  onBeforeUnmount(() => { environment?.dispose(); controller?.dispose() })
  return { state, start: () => controller?.start(), restore: () => controller?.restore() }
}
