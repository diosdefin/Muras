import { localized } from './presentation.js'

// Excerpts are taken verbatim from existing records, never generated facts.
export function firstSentence(value) {
  const text = localized(value)
  if (!text) return null
  return text.match(/^.*?[.!?](?:\s|$)/s)?.[0].trim() || text
}

export function sourcesFor(species, ids = []) {
  return species?.sources?.filter(source => ids.includes(source.id)) || []
}

export function sourceNumber(species, id) {
  const index = species?.sources?.findIndex(source => source.id === id) ?? -1
  return index >= 0 ? index + 1 : null
}

export function lessonKey(event, element) {
  if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return null
  const target = event.target
  if (!element?.contains(target) || target?.closest?.('input, textarea, select, button, a, summary, [contenteditable]:not([contenteditable="false"]), [role="button"], [role="slider"], [role="combobox"], [role="textbox"], [role="tab"], [role="menuitem"]')) return null
  return { ArrowLeft: 'previous', ArrowRight: 'next', Escape: 'exit' }[event.key] || null
}

export function lessonTabTarget(event, root, activeElement, elements) {
  if (event.key !== 'Tab' || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return null
  const first = elements[0]
  const last = elements.at(-1)
  if (!first) return root
  if (activeElement === root || !root.contains(activeElement)) return event.shiftKey ? last : first
  if (event.shiftKey && activeElement === first) return last
  if (!event.shiftKey && activeElement === last) return first
  return null
}
