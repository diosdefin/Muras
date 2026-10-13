<script setup>
import { useLocale } from '../../composables/useLocale.js'
import { computed } from 'vue'
import { EMPTY_NAMES, TAXONOMY, textValue } from '../data/model.js'
import { editableGroups } from '../../data/species-groups.js'
import { IUCN_CATEGORIES } from '../../data/species-model.js'
import { groupLabel } from '../../data/presentation.js'
import LocalizedFields from './LocalizedFields.vue'
import SourcePicker from './SourcePicker.vue'
const props=defineProps({species:{type:Object,required:true},tab:{type:String,required:true}})
const emit=defineEmits(['change']);const {t,language}=useLocale()
const groups=computed(()=>editableGroups([props.species]))
const update=(path,value)=>emit('change',path,value)
const number=event=>event.target.value === '' ? null : event.target.valueAsNumber
function habitat(lang,value){update(['habitat'],{...(props.species.habitat || {sourceIds:[]}),description:{...(props.species.habitat?.description || EMPTY_NAMES),[lang]:value}})}
function add(field){const value=field==='regions'?{code:null,type:'country',names:{...EMPTY_NAMES},sourceIds:[]}:{text:{...EMPTY_NAMES},sourceIds:[]};update([field],[...(props.species[field]||[]),value])}
function remove(field,index){const list=props.species[field].filter((_,i)=>i!==index);update([field],list.length?list:null)}
</script>
<template>
  <section v-if="tab === 'basic'" class="admin-form-grid">
    <label>ID<input :value="species.id" type="text" @input="update(['id'],$event.target.value)" /><small>{{ t('admin.idHint') }}</small></label>
    <label>{{ t('admin.scientificName') }}<input :value="species.scientificName || ''" lang="la" type="text" @input="update(['scientificName'],textValue($event.target.value))" /></label>
    <LocalizedFields :label="t('admin.names')" :value="species.names" @change="(lang,value)=>update(['names',lang],value)" />
    <label>{{ t('ui.m054') }}<select :value="species.group || ''" @change="update(['group'],textValue($event.target.value))"><option value="">{{ t('admin.unknown') }}</option><option v-for="group in groups" :key="group" :value="group">{{ groupLabel({group},language) }}</option></select></label>
    <label v-for="(rank,i) in TAXONOMY" :key="rank">{{ t(`ui.m${String(55+i).padStart(3,'0')}`) }}<input :value="species.taxonomy[rank] || ''" lang="la" type="text" @input="update(['taxonomy',rank],textValue($event.target.value))" /></label>
    <label class="admin-check"><input type="checkbox" :checked="species.verified" @change="update(['verified'],$event.target.checked)" />{{ t('admin.verified') }}</label>
    <label>{{ t('admin.lastReviewed') }}<input type="date" :value="species.lastReviewedAt || ''" @change="update(['lastReviewedAt'],textValue($event.target.value))" /></label>
    <p class="admin-hint admin-span">{{ t('admin.reviewHint') }}</p>
  </section>
  <section v-else-if="tab === 'description'" class="admin-description">
    <LocalizedFields :label="t('ui.m065')" :value="species.habitat?.description" multiline @change="habitat" />
    <SourcePicker v-if="species.habitat" :sources="species.sources" :value="species.habitat.sourceIds" @change="update(['habitat','sourceIds'],$event)" />
    <section v-for="field in ['regions','threats','conservationMeasures']" :key="field" class="admin-repeater">
      <h3>{{ t({regions:'ui.m246',threats:'ui.m069',conservationMeasures:'ui.m070'}[field]) }}</h3>
      <article v-for="(entry,index) in species[field] || []" :key="index" class="admin-subpanel">
        <div v-if="field === 'regions'" class="admin-form-grid"><label>{{ t('admin.regionCode') }}<input :value="entry.code || ''" @input="update([field,index,'code'],textValue($event.target.value))" /></label><label>{{ t('admin.regionType') }}<select :value="entry.type" @change="update([field,index,'type'],$event.target.value)"><option value="country">{{ t('admin.country') }}</option><option value="region">{{ t('ui.m028') }}</option></select></label></div>
        <LocalizedFields :label="t(field==='regions'?'admin.names':'admin.statement')" :value="field==='regions'?entry.names:entry.text" multiline @change="(lang,value)=>update([field,index,field==='regions'?'names':'text',lang],value)" />
        <SourcePicker :sources="species.sources" :value="entry.sourceIds" @change="update([field,index,'sourceIds'],$event)" />
        <button type="button" @click="remove(field,index)">{{ t('admin.removeField') }}</button>
      </article>
      <button type="button" @click="add(field)">{{ t('admin.addStatement') }}</button>
    </section>
  </section>
  <section v-else class="admin-form-grid">
    <fieldset class="admin-span"><legend>{{ t('admin.national') }}</legend><div class="admin-form-grid">
      <label>{{ t('admin.listed') }}<select :value="species.nationalRedBook.listed === null ? '' : String(species.nationalRedBook.listed)" @change="update(['nationalRedBook','listed'],$event.target.value===''?null:$event.target.value==='true')"><option value="">{{ t('admin.unknown') }}</option><option value="true">{{ t('admin.yes') }}</option><option value="false">{{ t('admin.no') }}</option></select></label>
      <label>{{ t('admin.category') }}<input :value="species.nationalRedBook.category || ''" @input="update(['nationalRedBook','category'],textValue($event.target.value))" /></label>
      <label>{{ t('admin.edition') }}<input :value="species.nationalRedBook.edition || ''" @input="update(['nationalRedBook','edition'],textValue($event.target.value))" /></label>
      <label>{{ t('ui.m161') }}<input type="number" min="1500" max="2100" :value="species.nationalRedBook.year" @input="update(['nationalRedBook','year'],number($event))" /></label>
    </div><SourcePicker :sources="species.sources" :value="species.nationalRedBook.sourceIds" @change="update(['nationalRedBook','sourceIds'],$event)" /></fieldset>
    <fieldset class="admin-span"><legend>IUCN</legend><div class="admin-form-grid"><label>{{ t('admin.category') }}<select :value="species.iucn.category || ''" @change="update(['iucn','category'],textValue($event.target.value))"><option value="">{{ t('admin.unknown') }}</option><option v-for="category in IUCN_CATEGORIES" :key="category" :value="category">{{ category }} · {{ t(`status.${category}`) }}</option></select></label><label>{{ t('ui.m161') }}<input type="number" min="1500" max="2100" :value="species.iucn.year" @input="update(['iucn','year'],number($event))" /></label></div><SourcePicker :sources="species.sources" :value="species.iucn.sourceIds" @change="update(['iucn','sourceIds'],$event)" /></fieldset>
  </section>
</template>
