<script setup>
import './locales/index.js'
import './admin.css'
import {computed,nextTick,onBeforeUnmount,onMounted,ref,watch} from 'vue'
import {useLocale,syncLocaleMetadata} from '../composables/useLocale.js'
import {loadSpeciesCatalog} from '../data/catalog-repository.js'
import {createSearchIndex,searchSpecies} from '../data/catalog-search.js'
import {groupLabel,speciesName} from '../data/presentation.js'
import {useAdminEditor} from './useAdminEditor.js'
import {MAX_JSON_BYTES} from './data/model.js'
import {editableGroups} from '../data/species-groups.js'
import {createImageSession} from './data/images.js'
import SpeciesFields from './components/SpeciesFields.vue'
import SourcesEditor from './components/SourcesEditor.vue'
import PopulationEditor from './components/PopulationEditor.vue'
import PhotoEditor from './components/PhotoEditor.vue'
import BrandLogo from '../components/BrandLogo.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
const {t,language,siteLanguage,setLanguage}=useLocale();syncLocaleMetadata({admin:true})
const editor=useAdminEditor()
const {document:source,current,selectedIndex,dirty,saving,message,details,assets}=editor
const published=ref([]),loading=ref(true),query=ref(''),group=ref('ALL'),review=ref('ALL'),population=ref('ALL')
const tab=ref('basic'),guide=ref(false),confirmation=ref(null),importInput=ref(null),heading=ref(null)
const session=createImageSession(),revision=ref(0)
const {draftAvailable,legacyAvailable,migrationAvailable,plan,applied}=editor
const bundleInput=ref(null)
const changeCount=computed(()=>plan.value?plan.value.diff.added.length+plan.value.diff.removed.length+plan.value.diff.modified.length:0)
async function applyChanges(){if(await ask('admin.files.apply','admin.files.confirmApply',{count:changeCount.value}))await editor.applyPlan()}
async function restoreFileDraft(){if(await ask('admin.files.restoreDraft','admin.files.confirmRestore')){await editor.loadDraft();session.retain(assets.value.map(a=>a.id));revision.value++}}
async function openLegacy(){if(await ask('admin.files.openLegacy','admin.files.confirmRestore')){await editor.loadLegacyDraft();session.retain([]);revision.value++}}
async function migrate(){if(await ask('admin.files.migrate','admin.files.confirmMigrate'))await editor.migrateLegacy()}
async function importBundle(event){const file=event.target.files?.[0];event.target.value='';if(!file)return;if(file.size>80*1024*1024){message.value='admin.error.bundleSize';return};if(!await ask('admin.files.importBundle','admin.files.confirmRestore'))return;await editor.importBundle(await file.text());session.retain(assets.value.map(a=>a.id));revision.value++}
watch(()=>assets.value.map(a=>a.id).join(','),async()=>{for(const a of assets.value){if(session.get(a.id))continue;try{const url=await editor.api.preview(a.id);if(!assets.value.some(item=>item.id===a.id)){URL.revokeObjectURL(url);continue};session.put(a.id,{url,size:a.size});revision.value++}catch{message.value='admin.error.imageIntegrity'}}})
const catalog=computed(()=>source.value?.catalog || published.value)
const groups=computed(()=>editableGroups(catalog.value))
const searchIndex=computed(()=>createSearchIndex(catalog.value))
const indices=computed(()=>new Map(catalog.value.map((record,index)=>[record,index])))
const rows=computed(()=>searchSpecies(searchIndex.value,query.value).filter(({species:s})=>
  (group.value==='ALL'||s.group===group.value)&&(review.value==='ALL'||String(s.verified)===review.value)&&
  (population.value==='ALL'||s.population.type===population.value)).map(result=>({...result,index:indices.value.get(result.species)})))
const page=ref(1),pageSize=50,visibleRows=computed(()=>rows.value.slice((page.value-1)*pageSize,page.value*pageSize))
watch([query,group,review,population,()=>catalog.value.length],()=>{page.value=1})
const tabs=['basic','description','conservation','population','photos','sources']
const publicUrl=import.meta.env.BASE_URL
let resolveConfirmation=null
function ask(title,messageText,values={}){return new Promise(resolve=>{confirmation.value={title:t(title),message:t(messageText,values)};resolveConfirmation=resolve})}
function confirmed(result){confirmation.value=null;resolveConfirmation?.(result);resolveConfirmation=null}
async function edit(index){selectedIndex.value=index;guide.value=false;tab.value='basic';await nextTick();heading.value?.focus()}
async function remove(index){if(await ask('admin.delete','admin.confirmDelete',{name:speciesName(catalog.value[index],language.value)}))await editor.remove(index,true);session.retain(assets.value.map(a=>a.id))}
async function importFile(event){
 const file=event.target.files?.[0];event.target.value='';if(!file)return
 if(file.size>MAX_JSON_BYTES){message.value='admin.error.jsonSize';return}
 if(source.value&&!await ask('admin.import','admin.confirmImport'))return
 try{await editor.importText(await file.text(),true);session.retain(assets.value.map(a=>a.id));revision.value++;query.value='';group.value=review.value=population.value='ALL';guide.value=false}
 catch{message.value='admin.error.json'}
}
async function exportFile(){const text=await editor.exportBundle();if(!text)return;const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),link=window.document.createElement('a');link.href=url;link.download='muras-draft-bundle.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
async function reset(){if(await ask('admin.reset','admin.confirmReset')){await editor.reset(true);session.retain(assets.value.map(a=>a.id));revision.value++}}
async function restore(){if(await ask('admin.restorePrevious','admin.confirmRestore')){await editor.restorePrevious(true);session.retain(assets.value.map(a=>a.id));revision.value++}}
function setAssets(value){editor.setAssets(value);session.retain(value.map(a=>a.id))}
const issue=value=>{const match=value.match(/admin\.[\w.]+$/);return match?value.slice(0,match.index)+t(match[0]):value}
function moveTab(item,delta){tab.value=tabs[(tabs.indexOf(item)+tabs.length+delta)%tabs.length];nextTick(()=>window.document.getElementById(`tab-${tab.value}`)?.focus())}
onMounted(async()=>{try{published.value=await loadSpeciesCatalog()}catch{message.value='admin.error.publicCatalog'}finally{loading.value=false}})
onBeforeUnmount(()=>{session.dispose();resolveConfirmation?.(false)})
</script>
<template>
  <div class="admin-app">
    <a class="skip-link" href="#admin-main">{{ t('ui.m004') }}</a>
    <aside class="admin-sidebar"><a class="admin-brand" :href="publicUrl"><span class="sr-only">MURAS </span><BrandLogo /><span>Admin · {{ t('admin.title') }}</span></a><nav :aria-label="t('admin.navigation')"><button type="button" :aria-current="!guide?'page':undefined" @click="guide=false;selectedIndex=-1">{{ t('admin.species') }}</button><button type="button" :aria-current="guide?'page':undefined" @click="guide=true">{{ t('admin.guide') }}</button></nav><p>{{ t('admin.localOnly') }}</p></aside>
    <div class="admin-workspace">
      <header class="admin-header"><div><strong>{{ t('admin.title') }}</strong><span class="admin-save-status" role="status">{{ !source?t('admin.noDocument'):saving?t('admin.saving'):dirty?t('admin.unsaved'):t('admin.files.loaded') }}</span></div><label><span class="sr-only">{{ t('chooseLanguage') }}</span><select :value="siteLanguage" :aria-label="t('chooseLanguage')" @change="setLanguage($event.target.value)"><option value="ky" lang="ky">Кыргызча (KY)</option><option value="uz" lang="uz">Oʻzbekcha (UZ)</option><option value="ru" lang="ru">Русский (RU)</option><option value="en" lang="en">English (EN)</option></select></label></header>
      <main id="admin-main" class="admin-main">
        <h1 ref="heading" tabindex="-1">{{ guide?t('admin.guide'):current?t('admin.editSpecies'):t('admin.species') }}</h1>
        <p class="admin-notice">{{ t('admin.files.localNotice') }}</p>
        <div class="admin-toolbar"><input ref="importInput" type="file" accept=".json,application/json" hidden aria-hidden="true" tabindex="-1" @change="importFile" /><button type="button" @click="importInput.click()">{{ t('admin.import') }}</button><button type="button" :disabled="!source" @click="editor.save(true)">{{ t('admin.save') }}</button><button type="button" :disabled="!source" @click="editor.prepareApply">{{ t('admin.validate') }}</button><button type="button" :disabled="!source" @click="exportFile">{{ t('admin.files.exportBundle') }}</button><button type="button" @click="restore">{{ t('admin.restorePrevious') }}</button><button type="button" :disabled="!source" @click="reset">{{ t('admin.reset') }}</button></div>
        <div class="admin-toolbar"><button type="button" :disabled="!source||saving" @click="bundleInput.click()">{{ t('admin.files.importBundle') }}</button><input ref="bundleInput" type="file" accept=".json,application/json" hidden @change="importBundle" /><button type="button" :disabled="!draftAvailable||saving" @click="restoreFileDraft">{{ t('admin.files.restoreDraft') }}</button><button v-if="migrationAvailable" type="button" :disabled="saving" @click="openLegacy">{{ t('admin.files.openLegacy') }}</button><button v-if="legacyAvailable" type="button" :disabled="saving" @click="migrate">{{ t('admin.files.migrate') }}</button></div>
        <p v-if="applied" class="admin-notice">{{ t('admin.files.notPushed') }}</p>
        <section v-if="plan" class="admin-panel" data-testid="apply-preview"><h2>{{ t('admin.files.preview') }}</h2><p v-if="!changeCount">{{ t('admin.files.noChanges') }}</p><ul><li v-for="id in plan.diff.added" :key="'add-'+id">{{ t('admin.files.added') }}: {{ id }}</li><li v-for="id in plan.diff.removed" :key="'remove-'+id">{{ t('admin.files.removed') }}: {{ id }}</li><li v-for="item in plan.diff.modified" :key="item.id">{{ item.id }}: {{ item.fields.join(', ') }}</li></ul><button type="button" class="admin-primary" :disabled="!changeCount||saving" @click="applyChanges">{{ t('admin.files.apply') }}</button></section>
        <p v-if="message" class="admin-status" role="status">{{ t(message) }}</p>
        <details v-if="details.length" class="admin-validation" open><summary>{{ t('admin.validationIssues') }} · {{ details.length }}</summary><ul><li v-for="(detail,index) in details" :key="index" :lang="detail.match(/admin\.[\w.]+$/)?language:'ru'">{{ issue(detail) }}</li></ul></details>
        <section v-if="guide" class="admin-panel admin-guide"><h2>{{ t('admin.publishGuide') }}</h2><ol><li v-for="step in 6" :key="step">{{ t(`admin.step.${step}`) }}</li></ol><p>{{ t('admin.filesGuide') }}</p><p>{{ t('admin.staticGuide') }}</p><p>{{ t('admin.dependenciesGuide') }}</p></section>
        <section v-else-if="current" class="admin-panel">
          <div class="admin-editor-heading"><div><h2>{{ speciesName(current,language) }}</h2><p class="admin-hint">{{ current.id }} · {{ t('admin.draft') }}</p></div><button type="button" @click="selectedIndex=-1">{{ t('admin.backToList') }}</button></div>
          <div class="admin-tabs" role="tablist" :aria-label="t('admin.editorTabs')"><button v-for="item in tabs" :id="`tab-${item}`" :key="item" type="button" role="tab" :aria-selected="tab===item" :tabindex="tab===item?0:-1" :aria-controls="`panel-${item}`" @click="tab=item" @keydown.right.prevent="moveTab(item,1)" @keydown.left.prevent="moveTab(item,-1)">{{ t(`admin.tab.${item}`) }}</button></div>
          <div :id="`panel-${tab}`" role="tabpanel" :aria-labelledby="`tab-${tab}`" class="admin-editor-panel">
            <SpeciesFields v-if="['basic','description','conservation'].includes(tab)" :species="current" :tab="tab" @change="editor.update" />
            <PopulationEditor v-else-if="tab==='population'" :species="current" :ask="ask" @change="editor.update" />
            <SourcesEditor v-else-if="tab==='sources'" :species="current" @change="editor.update" />
            <PhotoEditor v-else :key="selectedIndex" :species="current" :species-index="selectedIndex" :published="published" :assets="assets" :session="session" :revision="revision" :ask="ask" :upload="editor.api.upload" :media-preview="editor.api.preview" @change="editor.update" @assets="setAssets" @file="revision++" />
          </div>
        </section>
        <section v-else class="admin-panel">
          <p v-if="!source" class="admin-notice">{{ t('admin.sourceRequiredHint') }}</p>
          <div class="admin-list-heading"><h2>{{ t('admin.species') }} · {{ catalog.length }}</h2><button class="admin-primary" type="button" :disabled="!source" @click="editor.add();tab='basic'">{{ t('admin.addSpecies') }}</button></div>
          <div class="admin-list-filters"><label>{{ t('ui.m044') }}<input v-model="query" type="search" :placeholder="t('admin.searchHint')" /></label><label>{{ t('ui.m054') }}<select v-model="group"><option value="ALL">{{ t('ui.m140') }}</option><option v-for="value in groups" :key="value" :value="value">{{ groupLabel({group:value},language) }}</option></select></label><label>{{ t('admin.verification') }}<select v-model="review"><option value="ALL">{{ t('admin.all') }}</option><option value="true">{{ t('ui.m096') }}</option><option value="false">{{ t('ui.m097') }}</option></select></label><label>{{ t('admin.populationType') }}<select v-model="population"><option value="ALL">{{ t('admin.all') }}</option><option v-for="kind in ['exact','approximate','unknown']" :key="kind" :value="kind">{{ t(`admin.population.${kind}`) }}</option></select></label></div>
          <p v-if="loading" role="status">{{ t('ui.m032') }}</p><p v-else-if="!rows.length" class="admin-empty">{{ t('admin.noMatches') }}</p>
          <table v-else class="admin-table"><thead><tr><th>{{ t('admin.names') }}</th><th>{{ t('ui.m054') }}</th><th>{{ t('admin.verification') }}</th><th>{{ t('admin.populationType') }}</th><th>{{ t('admin.actions') }}</th></tr></thead><tbody><tr v-for="row in visibleRows" :key="row.index"><td :data-label="t('admin.names')"><strong>{{ speciesName(row.species,language) }}</strong><span lang="la">{{ row.species.scientificName || '—' }}</span><small>{{ row.species.id }}</small></td><td :data-label="t('ui.m054')">{{ groupLabel(row.species,language) }}</td><td :data-label="t('admin.verification')">{{ row.species.verified?t('ui.m096'):t('ui.m097') }}</td><td :data-label="t('admin.populationType')">{{ t(`admin.population.${row.species.population.type}`) }}</td><td :data-label="t('admin.actions')"><div class="admin-row-actions"><button type="button" :disabled="!source" :aria-label="`${t('admin.edit')} — ${speciesName(row.species,language)}`" @click="edit(row.index)">{{ t('admin.edit') }}</button><button type="button" :disabled="!source" :aria-label="`${t('admin.duplicate')} — ${speciesName(row.species,language)}`" @click="editor.duplicate(row.index);tab='basic'">{{ t('admin.duplicate') }}</button><button type="button" :disabled="!source" :aria-label="`${t('admin.delete')} — ${speciesName(row.species,language)}`" @click="remove(row.index)">{{ t('admin.delete') }}</button></div></td></tr></tbody></table>
          <div v-if="rows.length>pageSize" class="admin-actions"><button type="button" :disabled="page===1" @click="page--">{{ t('ui.m101') }}</button><p role="status">{{ t('admin.page') }} {{ page }} / {{ Math.ceil(rows.length/pageSize) }}</p><button type="button" :disabled="page*pageSize>=rows.length" @click="page++">{{ t('ui.m102') }}</button></div>
        </section>
      </main>
    </div>
    <ConfirmDialog v-if="confirmation" :title="confirmation.title" :message="confirmation.message" @done="confirmed" />
  </div>
</template>
