import { onBeforeUnmount, onMounted } from 'vue'

// Phone / tablet bottom-sheet behaviour for a modal <dialog>:
// - it slides up when opened and slides away when dismissed (a quick ~0.25 s, so iOS never keeps the page locked);
// - while its content is scrolled to the very top it can be pulled down with one
//   finger and released to close; a short pull springs back;
// - if the content is scrolled down, a downward swipe only scrolls the content
//   back up — it never closes the card.
// Desktop (mouse, wide screens) keeps the immediate behaviour.
const OPEN_MS = 380
const CLOSE_MS = 240
const SNAP_MS = 320
const EASE_OUT = 'cubic-bezier(.22, 1, .36, 1)'
const IGNORE = 'input, select, textarea, canvas, [data-sheet-ignore]'

export function useSheetDismiss(dialogRef, { onClose, scroller = '.modal-scroll', media = '(max-width: 1023.98px)' } = {}) {
  let gesture = null
  let closing = false

  const node = () => dialogRef.value
  const matches = query => typeof window !== 'undefined' && window.matchMedia?.(query).matches
  const enabled = () => matches(media)
  // Users who ask for reduced motion still get the gesture, with brief transitions.
  const duration = ms => matches('(prefers-reduced-motion: reduce)') ? Math.min(ms, 200) : ms
  const animate = (keyframes, options, pseudoElement) => {
    try { return node()?.animate(keyframes, pseudoElement ? { ...options, pseudoElement } : options) || null } catch { return null }
  }

  function start(event) {
    if (closing || !enabled() || event.touches.length !== 1 || event.target.closest?.(IGNORE)) return
    const area = node()?.querySelector(scroller)
    if (area && area.scrollTop > 0) return
    const touch = event.touches[0]
    gesture = { x: touch.clientX, y: touch.clientY, dy: 0, dragging: false, lastY: touch.clientY, lastTime: event.timeStamp, velocity: 0 }
  }

  function move(event) {
    if (!gesture) return
    const touch = event.touches[0]
    const dx = touch.clientX - gesture.x
    const dy = touch.clientY - gesture.y
    if (!gesture.dragging) {
      // Sideways or upward movement belongs to the content, not to the sheet.
      if ((Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) || dy < -4) { gesture = null; return }
      if (dy < 8) return
      const area = node()?.querySelector(scroller)
      if (area && area.scrollTop > 0) { gesture = null; return }
      gesture.dragging = true
    }
    event.preventDefault()
    const elapsed = event.timeStamp - gesture.lastTime
    if (elapsed > 0) gesture.velocity = (touch.clientY - gesture.lastY) / elapsed
    gesture.lastY = touch.clientY
    gesture.lastTime = event.timeStamp
    gesture.dy = Math.max(0, dy)
    node().style.transform = `translateY(${gesture.dy}px)`
  }

  function end() {
    if (!gesture) return
    const { dragging, dy, velocity } = gesture
    gesture = null
    if (!dragging) return
    const height = node().getBoundingClientRect().height
    if (dy > Math.min(140, height * 0.2) || (velocity > 0.6 && dy > 40)) dismiss(dy)
    else {
      node().style.transform = ''
      animate([{ transform: `translateY(${dy}px)` }, { transform: 'translateY(0)' }], { duration: duration(SNAP_MS), easing: EASE_OUT })
    }
  }

  // Animated close on phones and tablets; immediate elsewhere.
  function dismiss(from = 0) {
    if (closing) return
    const dialog = node()
    if (!dialog || !enabled() || typeof dialog.animate !== 'function') { onClose(); return }
    closing = true
    const options = { duration: duration(CLOSE_MS), easing: EASE_OUT, fill: 'forwards' }
    const slide = animate([{ transform: `translateY(${from}px)` }, { transform: `translateY(${window.innerHeight}px)` }], options)
    animate([{ opacity: 1 }, { opacity: 0 }], options, '::backdrop')
    dialog.style.transform = ''
    if (!slide) { onClose(); return }
    slide.onfinish = () => onClose()
  }

  onMounted(() => {
    const dialog = node()
    if (!dialog) return
    dialog.addEventListener('touchstart', start, { passive: true })
    dialog.addEventListener('touchmove', move, { passive: false })
    dialog.addEventListener('touchend', end)
    dialog.addEventListener('touchcancel', end)
    if (enabled() && dialog.open) {
      animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: duration(OPEN_MS), easing: EASE_OUT })
      animate([{ opacity: 0 }, { opacity: 1 }], { duration: duration(OPEN_MS * 0.6), easing: 'ease-out' }, '::backdrop')
    }
  })

  onBeforeUnmount(() => {
    const dialog = node()
    if (!dialog) return
    dialog.removeEventListener('touchstart', start)
    dialog.removeEventListener('touchmove', move)
    dialog.removeEventListener('touchend', end)
    dialog.removeEventListener('touchcancel', end)
  })

  return { dismiss: () => dismiss(0) }
}
