<script setup>
import {useLocale} from '../../composables/useLocale.js'
import { LANGUAGES } from '../../data/localization.js'
import {claimPaths,textValue} from '../data/model.js'
const props=defineProps({species:{type:Object,required:true}});const emit=defineEmits(['change']);const {t}=useLocale()
const update=(index,path,value)=>emit('change',['sources',index,...path],value)
function add(){const used=new Set(props.species.sources.map(s=>s.id));let n=1;while(used.has(`source-${n}`))n++;emit('change',['sources'],[...props.species.sources,{id:`source-${n}`,title:null,publisher:null,url:null,accessedAt:null,supports:[]}])}
function support(index,path,checked){const list=props.species.sources[index].supports;update(index,['supports'],checked?[...new Set([...list,path])]:list.filter(p=>p!==path))}
function version(index,lang,key,value){const source=props.species.sources[index],versions={...source.versions};versions[lang]={language:lang,title:null,url:null,verified:false,...versions[lang],[key]:value};update(index,['versions'],versions)}
function removeVersion(index,lang){const versions={...props.species.sources[index].versions};delete versions[lang];update(index,['versions'],versions)}
</script>
<template>
  <p class="admin-notice">{{ t('admin.sourceHint') }}</p>
  <article v-for="(source,index) in species.sources" :key="index" class="admin-subpanel">
    <h3>{{ source.id || t('admin.untitled') }}</h3><div class="admin-form-grid">
      <label>ID<input :value="source.id" @input="update(index,['id'],$event.target.value)" /></label>
      <label>{{ t('admin.sourceTitle') }}<input :value="source.title || ''" @input="update(index,['title'],textValue($event.target.value))" /></label>
      <label>{{ t('admin.publisher') }}<input :value="source.publisher || ''" @input="update(index,['publisher'],textValue($event.target.value))" /></label>
      <label>URL<input type="url" :value="source.url || ''" @input="update(index,['url'],textValue($event.target.value))" /></label>
      <label>{{ t('admin.authors') }}<textarea :value="Array.isArray(source.authors)?source.authors.join('\n'):source.authors || ''" rows="2" @input="update(index,['authors'],$event.target.value.split('\n').map(v=>v.trim()).filter(Boolean))" /></label>
      <label>{{ t('admin.publishedAt') }}<input type="date" :value="source.publishedAt || ''" @change="update(index,['publishedAt'],textValue($event.target.value))" /></label>
      <label>{{ t('admin.accessedAt') }}<input type="date" :value="source.accessedAt || ''" @change="update(index,['accessedAt'],textValue($event.target.value))" /></label>
      <label>{{ t('admin.originalLanguage') }}<select :value="source.language || ''" @change="update(index,['language'],textValue($event.target.value))"><option value="">{{ t('admin.unknown') }}</option><option v-for="lang in LANGUAGES" :key="lang" :value="lang">{{ lang.toUpperCase() }}</option></select></label>
    </div>
    <details><summary>{{ t('admin.supports') }}</summary><p class="admin-hint">{{ t('admin.supportsHint') }}</p><div class="admin-claims"><label v-for="path in claimPaths(species)" :key="path"><input type="checkbox" :checked="source.supports.includes(path)" @change="support(index,path,$event.target.checked)" /><code>{{ path }}</code></label></div></details>
    <details><summary>{{ t('admin.versions') }}</summary><section v-for="lang in LANGUAGES" :key="lang" class="admin-subpanel"><h4>{{ lang.toUpperCase() }}</h4><label>{{ t('admin.sourceTitle') }}<input :value="source.versions?.[lang]?.title || ''" @input="version(index,lang,'title',textValue($event.target.value))" /></label><label>URL<input type="url" :value="source.versions?.[lang]?.url || ''" @input="version(index,lang,'url',textValue($event.target.value))" /></label><label class="admin-check"><input type="checkbox" :checked="source.versions?.[lang]?.verified===true" @change="version(index,lang,'verified',$event.target.checked)" />{{ t('admin.versionReviewed') }}</label><button v-if="source.versions?.[lang]" type="button" @click="removeVersion(index,lang)">{{ t('admin.removeField') }}</button></section></details>
    <button type="button" @click="emit('change',['sources'],species.sources.filter((_,i)=>i!==index))">{{ t('admin.removeSource') }}</button>
  </article><button type="button" @click="add">{{ t('admin.addSource') }}</button>
</template>
