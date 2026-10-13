import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

// The injectable controller also makes unsupported/rejected API paths testable.
export function createLessonFullscreen(getElement, {
  ownerDocument = typeof document === 'undefined' ? null : document,
  onExternalExit = () => {}, onFocus = () => {},
} = {}) {
  const isFullscreen = ref(false)
  const message = ref('')
  const supported = computed(() => ownerDocument?.fullscreenEnabled !== false &&
    typeof getElement()?.requestFullscreen === 'function' && typeof ownerDocument?.exitFullscreen === 'function')
  let expectedExit = false
  let connected = false
  let pending = false
  let entryTask = null
  function sync() {
    const wasFullscreen = isFullscreen.value
    isFullscreen.value = !!getElement() && ownerDocument?.fullscreenElement === getElement()
    if (wasFullscreen && !isFullscreen.value) {
      const external = !expectedExit
      expectedExit = false
      if (external) onExternalExit()
      else onFocus()
    }
  }
  async function enter() {
    if (pending || isFullscreen.value) return
    message.value = ''
    if (!supported.value) {
      message.value = 'Полноэкранный режим недоступен. Урок работает в обычном окне; можно использовать полноэкранную команду браузера.'
      return
    }
    pending = true; expectedExit = false
    try {
      entryTask = Promise.resolve(getElement().requestFullscreen())
      await entryTask
      sync(); onFocus()
    }
    catch { message.value = 'Браузер не разрешил полноэкранный режим. Продолжайте урок в обычном окне.' }
    finally { pending = false }
  }
  async function exit() {
    // A quick navigation click must not leave a later fullscreen request on a hidden view.
    if (pending && entryTask) { try { await entryTask } catch { /* enter reports failure */ } }
    if (!getElement() || ownerDocument?.fullscreenElement !== getElement()) return true
    expectedExit = true
    try { await ownerDocument.exitFullscreen(); sync(); return true }
    catch {
      expectedExit = false
      message.value = 'Не удалось выйти из полноэкранного режима. Используйте Escape или команду браузера.'
      return false
    }
  }
  function connect() {
    if (connected) return
    ownerDocument?.addEventListener('fullscreenchange', sync); connected = true
  }
  function dispose() {
    ownerDocument?.removeEventListener('fullscreenchange', sync); connected = false
  }
  return { isFullscreen, supported, message, enter, exit, toggle: () => isFullscreen.value ? exit() : enter(), connect, dispose }
}

export function useLessonFullscreen(element, options) {
  const control = createLessonFullscreen(() => element.value, options)
  onMounted(control.connect)
  onBeforeUnmount(() => { control.dispose(); void control.exit() })
  return control
}
