import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { createDraftRepository, browserStorage } from './data/repository.js'
import { createLocalAdminAPI } from './data/local-api.js'
import { clone, deleteSpecies, duplicateSpecies, emptySpecies, exportSource, importSource, publicationErrors, setPath, uniqueId } from './data/model.js'

export function useAdminEditor({ repository = null, api = createLocalAdminAPI(), delay = 400 } = {}) {
  const local = !repository
  const baseRevision = ref(null), draftRevision = ref('missing'), draftAvailable = ref(false), legacyAvailable = ref(false), migrationAvailable = ref(false), plan = ref(null), applied = ref(false)
  const document = shallowRef(null), original = shallowRef(null), assets = ref([]), selectedIndex = ref(-1)
  const dirty = ref(false), message = ref(''), details = ref([]), saving = ref(false)
  const current = computed(() => document.value?.catalog[selectedIndex.value] || null)
  let timer = null, revision = 0, queue = Promise.resolve(), pending = 0
  const envelope = () => ({ original:original.value, current:document.value, assets:assets.value })
  function save(checkpoint = false) {
    if (!document.value) return Promise.resolve(false)
    const snapshot=clone(envelope()), token=revision, snapshotBase=baseRevision.value
    pending++;saving.value=true
    queue=queue.then(async()=>{
      try {
        if (local) { const result = await api.saveDraft({ envelope:snapshot, baseRevision:snapshotBase, draftRevision:draftRevision.value, checkpoint }); draftRevision.value=result.revision; draftAvailable.value=true }
        else await repository.save(snapshot, { checkpoint })
        if(token===revision){dirty.value=false;message.value=local?'admin.files.draftSaved':'admin.saved'}
        return true
      } catch(error) { dirty.value=true; message.value=error.message; return false }
      finally { pending--;saving.value=pending>0 }
    })
    return queue
  }
  function changed() {
    revision++;dirty.value=true; plan.value=null; details.value=[]; clearTimeout(timer); saving.value=true
    timer=setTimeout(()=>save(),delay)
  }
  function install(value) {
    revision++;clearTimeout(timer); document.value=value.current; original.value=value.original; assets.value=value.assets || []
    selectedIndex.value=-1; dirty.value=false; saving.value=pending>0; details.value=[]; plan.value=null; if (local && value.baseRevision) baseRevision.value=value.baseRevision; message.value='admin.restored'
  }
  async function load() {
    const token=revision
    try {
      if (local) {
        const result=await api.catalog(); if(token!==revision)return
        baseRevision.value=result.revision;install({original:clone(result.document),current:clone(result.document),assets:[],baseRevision:result.revision});message.value='admin.files.loaded'
        const saved=await api.draft();draftRevision.value=saved.revision;draftAvailable.value=Boolean(saved.envelope);migrationAvailable.value=Boolean((await api.latestMigration()).envelope)
        try{legacyAvailable.value=Boolean(browserStorage()?.getItem('redbook.admin.draft.v1'))}catch{legacyAvailable.value=false}
      } else { const value=await repository.load(); if(value && token===revision)install(value) }
    }
    catch(error) { if(local||token===revision)message.value=error.message.startsWith('admin.')?error.message:local?'admin.error.localServer':'admin.error.draft' }
  }
  function importText(text, confirmed) {
    if(document.value && !confirmed)return false
    try {
      const value=importSource(text); install({original:local?clone(original.value):clone(value),current:clone(value),assets:[]}); dirty.value=true
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
    assets.value=[...assets.value,...assets.value.filter(a=>a.speciesIndex===index).map(a=>({...a,id:local?a.id:crypto.randomUUID(),speciesIndex:selectedIndex.value}))]
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
    if(local)return load()
    document.value=clone(original.value);assets.value=[];selectedIndex.value=-1;changed();return save(true)
  }
  async function restorePrevious(confirmed) {
    if(!confirmed)return false
    try { const previous=local?(await api.previous()).envelope:await repository.previous(); if(!previous){message.value='admin.noPrevious';return false};install(previous);dirty.value=true;return save(true) }
    catch(error) { message.value=error.message.startsWith('admin.')?error.message:'admin.error.draft';return false }
  }
  function validate() { details.value=publicationErrors(document.value,assets.value);message.value=details.value.length?'admin.error.export':'admin.valid';return !details.value.length }
  async function exportText() {
    try { const text=exportSource(document.value,assets.value); await save(true); message.value='admin.exported';return text }
    catch(error) { message.value=error.message;details.value=error.details || [];return null }
  }
  async function loadDraft() {
    try { const saved=await api.draft();draftRevision.value=saved.revision;if(!saved.envelope){message.value='admin.noPrevious';return false};install(saved.envelope);return true }
    catch(e){message.value=e.message;return false}
  }
  async function migrateLegacy() {
    try { const value=createDraftRepository(browserStorage()).load();if(!value)return false;await api.migrate(value);migrationAvailable.value=true;message.value='admin.files.migrated';return true }
    catch(e){message.value=e.message;return false}
  }
  async function loadLegacyDraft(){try{const value=await api.latestMigration();if(!value.envelope)return false;install(value.envelope);dirty.value=true;message.value='admin.files.legacyOpened';return true}catch(e){message.value=e.message;return false}}
  async function exportBundle() {
    if(!await save(true))return null
    try{return JSON.stringify(await api.exportBundle(),null,2)+'\n'}catch(e){message.value=e.message;return null}
  }
  async function importBundle(text) {
    try{const bundle=JSON.parse(text),result=await api.importBundle({bundle,draftRevision:draftRevision.value});draftRevision.value=result.revision;draftAvailable.value=true;install(result.envelope);message.value='admin.files.draftRestored';return true}
    catch(e){message.value=e.message.startsWith('admin.')?e.message:'admin.error.json';details.value=e.details||[];return false}
  }
  async function prepareApply() {
    const token=revision;plan.value=null;saving.value=true
    try{const result=await api.prepare({document:clone(document.value),baseRevision:baseRevision.value});if(token!==revision){message.value='admin.files.changedDuringCheck';return false};plan.value=result;message.value='admin.files.valid';details.value=[];return true}
    catch(e){message.value=e.message;details.value=e.details||[];return false}
    finally{saving.value=pending>0}
  }
  async function applyPlan() {
    if(!plan.value)return false
    const token=revision,selected=plan.value;saving.value=true
    try{const result=await api.apply({token:selected.token,baseRevision:selected.baseRevision,confirmed:true});baseRevision.value=result.revision;original.value=clone(result.document);applied.value=true;plan.value=null
      if(token===revision){install({current:clone(result.document),original:clone(result.document),assets:[],baseRevision:result.revision});await save(true)}
      message.value='admin.files.applied';return true
    }catch(e){message.value=e.message;details.value=e.details||[];return false}finally{saving.value=pending>0}
  }
  function setAssets(value) { assets.value=value;changed() }
  function beforeUnload(event) { if(dirty.value){event.preventDefault();event.returnValue=''} }
  onMounted(()=>{load();window.addEventListener('beforeunload',beforeUnload)})
  onBeforeUnmount(()=>{clearTimeout(timer);if(dirty.value)save();window.removeEventListener('beforeunload',beforeUnload)})
  return {document,original,assets,current,selectedIndex,dirty,saving,message,details,save,load,importText,update,add,duplicate,remove,reset,restorePrevious,validate,exportText,setAssets,baseRevision,draftRevision,draftAvailable,legacyAvailable,migrationAvailable,loadLegacyDraft,plan,applied,loadDraft,migrateLegacy,exportBundle,importBundle,prepareApply,applyPlan,api,local}
}
