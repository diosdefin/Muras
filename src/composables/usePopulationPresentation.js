import { computed, onScopeDispose, shallowRef, toRaw, watch } from 'vue'
import { populationPresentation, UNKNOWN_POPULATION } from '../data/population.js'
import { documentedPopulationPresentation } from '../data/population-publication.js'

export function usePopulationPresentation(props, language) {
 const documented = shallowRef(null)
 let revision = 0
 watch(() => [props.populationPublication,props.speciesId,props.scientificName,props.taxonIds,language.value], () => {
  const current = ++revision
  documented.value = null // Revocation/changes hide previous facts synchronously, before any hashing.
  if (!props.populationPublication) return
  let snapshot
  try { snapshot = JSON.parse(JSON.stringify(toRaw(props.populationPublication))) } catch { return }
  const identity = {speciesId:props.speciesId,acceptedScientificName:props.scientificName,taxonIds:props.taxonIds || []}
  documentedPopulationPresentation(snapshot,identity,language.value).then(value => { if (current === revision) documented.value = value }).catch(() => {})
 }, {immediate:true,deep:true,flush:'sync'})
 onScopeDispose(() => { revision++ })
 return computed(() => props.populationPublication ? documented.value || populationPresentation(UNKNOWN_POPULATION,[],language.value) : populationPresentation(props.population,props.sources,language.value))
}
