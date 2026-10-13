// Stable IDs are independent of localized labels. New records use these eight groups.
export const GROUPS = Object.freeze([
  'mammals', 'birds', 'plants', 'fish', 'reptiles', 'amphibians', 'arthropods', 'fungi',
])
// A broader historical group, retained losslessly on import. Never alias it to Arthropoda.
export const LEGACY_GROUPS = Object.freeze(['invertebrates'])
const acceptedGroups = Object.freeze([...GROUPS, ...LEGACY_GROUPS])
const translationKeys = Object.freeze({
  mammals: 'ui.m141', birds: 'ui.m142', plants: 'ui.m143',
  fish: 'group.fish', reptiles: 'group.reptiles', amphibians: 'group.amphibians',
  arthropods: 'group.arthropods', fungi: 'group.fungi', invertebrates: 'group.invertebrates',
})

export function isSpeciesGroup(value) { return acceptedGroups.includes(value) }
export function groupTranslationKey(value) {
  return Object.hasOwn(translationKeys, value) ? translationKeys[value] : 'group.unknown'
}
export function availableGroups(records = []) {
  const present = new Set(records.map(record => record.group))
  return acceptedGroups.filter(group => present.has(group))
}
export function editableGroups(records = []) {
  return [...GROUPS, ...availableGroups(records).filter(group => LEGACY_GROUPS.includes(group))]
}
