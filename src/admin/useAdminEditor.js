import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { createDraftRepository, browserStorage } from './data/repository.js'
import { clone, deleteSpecies, duplicateSpecies, emptySpecies, exportSource, importSource, publicationErrors, setPath, uniqueId } from './data/model.js'

export function useAdminEditor({ repository = createDraftRepository(browserStorage()), delay = 400 } = {}) {
  const document = shallowRef(null), original = shallowRef(null), assets = ref([]), selectedIndex = ref(-1)
  const dirty = ref(false), message = ref(''), details = ref([]), saving = ref(false)
  const current = computed(() => document.value?.catalog[selectedIndex.value] || null)
  let timer = null, revision = 0, queue = Promise.resolve(), pending = 0
  const envelope = () => ({ original:original.value, current:document.value, assets:assets.value })
  function save(checkpoint = false) {
    if (!document.value) return Promise.resolve(false)
    const snapshot=clone(envelope()), token=revision
    pending++;saving.value=true
    queue=queue.then(async()=>{
      try {
        await repository.save(snapshot, { checkpoint })
        if(token===revision){dirty.value=false;message.value='admin.saved'}
        return true
      } catch(error) { dirty.value=true; message.value=error.message; return false }
      finally { pending--;saving.value=pending>0 }
    })
    return queue
  }
  function changed() {
    revision++;dirty.value=true; details.value=[]; clearTimeout(timer); saving.value=true
    timer=setTimeout(()=>save(),delay)
  }
  function install(value) {
    revision++;clearTimeout(timer); document.value=value.current; original.value=value.original; assets.value=value.assets || []
    selectedIndex.value=-1; dirty.value=false; details.value=[]; message.value='admin.restored'
  }
  async function load() {
    const token=revision
    try { const value=await repository.load(); if(value && token===revision)install(value) }
    catch(error) { if(token===revision)message.value=error.message.startsWith('admin.')?error.message:'admin.error.draft' }
  }
  function importText(text, confirmed) {
    if(document.value && !confirmed)return false
    try {
      const value=importSource(text); install({original:clone(value),current:clone(value),assets:[]}); dirty.value=true
      return save(true)
    } catch(error) { message.value=error.message; details.value=error.details || []; return false }
  }
  function update(path, value) {
    if (!current.value) return
    if (!Number.isFinite(value) && typeof value === 'number') { message.value='admin.error.number'; return }
    document.value=setPath(document.value,['catalog',selectedIndex.value,...path],value); changed()
    if (path[0]==='population' && path[1]!=='reviewStatus' && current.value.population.type!=='unknown') document.value=setPath(document.value,['catalog',selectedIndex.value,'population','reviewStatus'],'pending')
  }
  function add() {
    if (!document.value) return
    document.value={...document.value,catalog:[...document.value.catalog,emptySpecies(uniqueId(document.value))]}
    selectedIndex.value=document.value.catalog.length-1; changed()
  }
  function duplicate(index) {
    document.value=duplicateSpecies(document.value,index); selectedIndex.value=document.value.catalog.length-1
    assets.value=[...assets.value,...assets.value.filter(a=>a.speciesIndex===index).map(a=>({...a,id:crypto.randomUUID(),speciesIndex:selectedIndex.value}))]
    changed()
  }
  async function remove(index, confirmed) {
    if(!confirmed)return false
    const record=document.value.catalog[index]
    await save(true)
    index=document.value.catalog.indexOf(record)
    if(index<0)return false
    document.value=deleteSpecies(document.value,index,true)
    assets.value=assets.value.filter(a=>a.speciesIndex !== index).map(a=>a.speciesIndex > index ? {...a,speciesIndex:a.speciesIndex-1} : a)
    selectedIndex.value=-1;changed();return true
  }
  function reset(confirmed) {
    if(!confirmed || !original.value)return false
    document.value=clone(original.value);assets.value=[];selectedIndex.value=-1;changed();return save(true)
  }
  async function restorePrevious(confirmed) {
    if(!confirmed)return false
    try { const previous=await repository.previous(); if(!previous){message.value='admin.noPrevious';return false};install(previous);dirty.value=true;return save(true) }
    catch(error) { message.value=error.message.startsWith('admin.')?error.message:'admin.error.draft';return false }
  }
  function validate() { details.value=publicationErrors(document.value,assets.value);message.value=details.value.length?'admin.error.export':'admin.valid';return !details.value.length }
  async function exportText() {
    try { const text=exportSource(document.value,assets.value); await save(true); message.value='admin.exported';return text }
    catch(error) { message.value=error.message;details.value=error.details || [];return null }
  }
  function setAssets(value) { assets.value=value;changed() }
  function beforeUnload(event) { if(dirty.value){event.preventDefault();event.returnValue=''} }
  onMounted(()=>{load();window.addEventListener('beforeunload',beforeUnload)})
  onBeforeUnmount(()=>{clearTimeout(timer);if(dirty.value)save();window.removeEventListener('beforeunload',beforeUnload)})
  return {document,original,assets,current,selectedIndex,dirty,saving,message,details,save,load,importText,update,add,duplicate,remove,reset,restorePrevious,validate,exportText,setAssets}
}
