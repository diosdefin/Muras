import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createVisualization } from '../data/visualization/engine.js'
import { observeVisualization } from '../data/visualization/environment.js'

export function useImageVisualization(canvas, container, path) {
  const state = ref({ mode: 'photo', detail: 100, loading: true, ready: false, error: '', restorationCount: 0 })
  let controller, environment
  onMounted(() => {
    controller = createVisualization({
      canvas: canvas.value, createCanvas: () => document.createElement('canvas'), createImage: () => new Image(),
      requestFrame: callback => window.requestAnimationFrame(callback), cancelFrame: id => window.cancelAnimationFrame(id),
      measure: () => canvas.value.getBoundingClientRect(), getDpr: () => window.devicePixelRatio,
      reducedMotion: () => environment?.reducedMotion() || false, onState: value => { state.value = value },
    })
    environment = observeVisualization(container.value, { view: window, Observer: window.ResizeObserver,
      resize: controller.resize, motionChanged: controller.motionChanged })
    controller.load(path.value)
  })
  watch(path, value => controller?.load(value), { flush: 'sync' })
  onBeforeUnmount(() => { environment?.dispose(); controller?.dispose() })
  return { state, start: () => controller?.start(), setDetail: value => controller?.setDetail(value), restore: () => controller?.restore() }
}
