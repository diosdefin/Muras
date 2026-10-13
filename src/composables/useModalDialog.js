import { onBeforeUnmount, onMounted } from 'vue'

// showModal makes the background inert; these additions preserve scroll and focus.
export function useModalDialog(dialog, closeButton) {
  let opener
  let scrollPosition
  let bodyStyles
  let htmlOverflow
  const styleKeys = ['position', 'top', 'left', 'right', 'width', 'overflow', 'paddingRight']

  function focusableElements() {
    return [...dialog.value.querySelectorAll('button, a[href], input, select, textarea, summary, [tabindex]')]
      .filter(element => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length &&
        !element.closest('details:not([open]) > :not(summary)'))
  }

  function trapFocus(event) {
    if (event.key !== 'Tab') return
    const elements = focusableElements()
    const first = elements[0]
    const last = elements.at(-1)
    if (!first) { event.preventDefault(); closeButton.value.focus(); return }
    if (event.shiftKey && (document.activeElement === first || !dialog.value.contains(document.activeElement))) {
      event.preventDefault(); last.focus()
    } else if (!event.shiftKey && (document.activeElement === last || !dialog.value.contains(document.activeElement))) {
      event.preventDefault(); first.focus()
    }
  }

  function keepFocusInside(event) {
    if (dialog.value?.open && !dialog.value.contains(event.target)) closeButton.value.focus({ preventScroll: true })
  }

  onMounted(() => {
    opener = document.activeElement
    scrollPosition = { x: window.scrollX, y: window.scrollY }
    bodyStyles = Object.fromEntries(styleKeys.map(key => [key, document.body.style[key]]))
    htmlOverflow = document.documentElement.style.overflow
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    const padding = parseFloat(getComputedStyle(document.body).paddingRight) || 0
    Object.assign(document.body.style, {
      position: 'fixed', top: `-${scrollPosition.y}px`, left: `-${scrollPosition.x}px`,
      right: '0', width: '100%', overflow: 'hidden', paddingRight: `${padding + scrollbar}px`,
    })
    document.documentElement.style.overflow = 'hidden'
    dialog.value.showModal()
    closeButton.value.focus({ preventScroll: true })
    dialog.value.addEventListener('keydown', trapFocus)
    document.addEventListener('focusin', keepFocusInside)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('focusin', keepFocusInside)
    dialog.value?.removeEventListener('keydown', trapFocus)
    dialog.value?.close()
    if (bodyStyles) Object.assign(document.body.style, bodyStyles)
    document.documentElement.style.overflow = htmlOverflow ?? ''
    if (scrollPosition) window.scrollTo(scrollPosition.x, scrollPosition.y)
    if (opener?.isConnected) opener.focus({ preventScroll: true })
  })
}
