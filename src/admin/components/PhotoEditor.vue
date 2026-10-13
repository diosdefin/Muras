<script setup>
import {computed,onBeforeUnmount,ref} from 'vue'
import {useLocale} from '../../composables/useLocale.js'
import {compositionStyle,imageComposition,panComposition} from '../../data/image-composition.js'
import {newImage,previewUrl,safeHttpUrl,textValue} from '../data/model.js'
import {inspectImage} from '../data/images.js'
import SpeciesVisualization from '../../components/SpeciesVisualization.vue'
import LocalizedFields from './LocalizedFields.vue'
const props=defineProps({species:{type:Object,required:true},speciesIndex:{type:Number,required:true},published:{type:Array,required:true},assets:{type:Array,required:true},session:{type:Object,required:true},revision:Number,ask:{type:Function,required:true}})
const emit=defineEmits(['change','assets','file']);const {t}=useLocale()
const index=ref(0),view=ref('detail'),fileInput=ref(null),loading=ref(false),error=ref(''),failed=ref(false)
const photo=computed(()=>props.species.images[index.value] || null)
const asset=computed(()=>props.assets.find(a=>a.speciesIndex===props.speciesIndex&&a.index===index.value))
const url=computed(()=>{props.revision;return props.session.get(asset.value?.id)||previewUrl(props.species,index.value,props.published)})
const composition=computed(()=>imageComposition(photo.value,view.value))
const zoomWarning=computed(()=>photo.value && Math.min(photo.value.width||0,photo.value.height||0)/composition.value.zoom<600)
let pointer=null,targetIndex=null
let uploadController=null
const update=(path,value)=>emit('change',['images',index.value,...path],value)
function compose(value){if(photo.value)update(['compositions',view.value],value)}
function start(event){if(!url.value||failed.value)return;const box=event.currentTarget.getBoundingClientRect(),image=event.currentTarget.querySelector('img');pointer={id:event.pointerId,x:event.clientX,y:event.clientY,value:{...composition.value},box,width:image.naturalWidth,height:image.naturalHeight};event.currentTarget.setPointerCapture(event.pointerId)}
function move(event){if(!pointer||event.pointerId!==pointer.id)return;compose(panComposition(pointer.value,event.clientX-pointer.x,event.clientY-pointer.y,pointer.width,pointer.height,pointer.box.width,pointer.box.height))}
function end(){pointer=null}
function pick(replaceIndex){targetIndex=replaceIndex;fileInput.value.value='';fileInput.value.click()}
async function selected(event){
 const file=event.target.files?.[0];if(!file)return;loading.value=true;error.value=''
 let inspected
 try {
  uploadController?.abort();uploadController=new AbortController()
  inspected=await inspectImage(file,{signal:uploadController.signal})
  const existing=targetIndex===null?null:props.species.images[targetIndex]
  const same=existing?.sha256===inspected.sha256
  if(existing&&!same&&!await props.ask('admin.replacePhoto','admin.replacePhotoHint')){URL.revokeObjectURL(inspected.url);return}
  const nextIndex=targetIndex===null?props.species.images.length:targetIndex
  const image=same?existing:{...newImage(),width:inspected.width,height:inspected.height,sha256:inspected.sha256}
  const images=props.species.images.slice();images[nextIndex]=image
  const id=crypto.randomUUID()
  props.session.put(id,inspected)
  const previous=props.assets.find(a=>a.speciesIndex===props.speciesIndex&&a.index===nextIndex)
  const descriptor={id,speciesIndex:props.speciesIndex,index:nextIndex,fileName:inspected.fileName,size:inspected.size,sha256:inspected.sha256,prepared:Boolean(same&&(previous?.prepared||previewUrl(props.species,nextIndex,props.published)))}
  emit('change',['images'],images);emit('assets',[...props.assets.filter(a=>a!==previous),descriptor]);emit('file');index.value=nextIndex;failed.value=false
 }catch(e){error.value=e.message.startsWith('admin.')?e.message:'admin.error.imageDecode'}finally{loading.value=false}
}
async function remove(){if(!await props.ask('admin.removePhoto','admin.removePhotoHint'))return;const removed=index.value;emit('change',['images'],props.species.images.filter((_,i)=>i!==removed));emit('assets',props.assets.filter(a=>a.speciesIndex!==props.speciesIndex||a.index!==removed).map(a=>a.speciesIndex===props.speciesIndex&&a.index>removed?{...a,index:a.index-1}:a));index.value=0;failed.value=false}
onBeforeUnmount(()=>{end();uploadController?.abort()})
</script>
<template>
  <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" hidden aria-hidden="true" tabindex="-1" @change="selected" />
  <p class="admin-notice">{{ t('admin.photoRules') }}</p>
  <div class="admin-actions"><button type="button" :disabled="loading" @click="pick(null)">{{ t('admin.addPhoto') }}</button><label v-if="species.images.length">{{ t('admin.photoSelect') }}<select :value="index" @change="index=Number($event.target.value);failed=false"><option v-for="(image,i) in species.images" :key="i" :value="i">{{ i+1 }} · {{ image.path || t('admin.localPreview') }}</option></select></label></div>
  <p v-if="error" class="admin-error" role="alert">{{ t(error) }}</p><p v-if="loading" role="status">{{ t('ui.m032') }}</p>
  <template v-if="photo">
    <div class="admin-photo-layout">
      <section class="admin-subpanel"><h3>{{ t('admin.composition') }}</h3><label>{{ t('admin.frame') }}<select v-model="view"><option value="card">{{ t('admin.preview.card') }}</option><option value="detail">{{ t('admin.preview.detail') }}</option><option value="lesson">{{ t('admin.preview.lesson') }}</option></select></label>
        <div class="admin-crop" :data-view="view" @pointerdown.prevent="start" @pointermove="move" @pointerup="end" @pointercancel="end" @lostpointercapture="end">
          <img v-if="url&&!failed" :src="url" :style="compositionStyle(photo,view)" :width="photo.width" :height="photo.height" :alt="t('admin.dragPhoto')" draggable="false" @error="failed=true" /><p v-else>{{ t('admin.imageUnavailable') }}</p>
        </div><p class="admin-hint">{{ t('admin.dragHint') }}</p>
        <label v-for="key in ['zoom','x','y']" :key="key" class="admin-range">{{ t(`admin.control.${key}`) }}<output>{{ composition[key].toFixed(2) }}{{ key==='zoom'?'×':'' }}</output><input type="range" :min="key==='zoom'?1:0" :max="key==='zoom'?3:1" :step="key==='zoom'?0.05:0.01" :value="composition[key]" @input="compose({...composition,[key]:Number($event.target.value)})" /></label>
        <button type="button" @click="compose({x:0.5,y:0.5,zoom:1})">{{ t('admin.resetComposition') }}</button>
        <p v-if="zoomWarning" class="admin-notice">{{ t('admin.zoomWarning') }}</p>
      </section>
      <section class="admin-subpanel"><h3>{{ t('admin.photoMetadata') }}</h3><div class="admin-form-grid">
        <label>{{ t('admin.filePath') }}<input :value="photo.path || ''" placeholder="assets/images/species/photo.webp" @input="update(['path'],textValue($event.target.value))" /></label>
        <label>{{ t('admin.author') }}<input :value="photo.author || ''" @input="update(['author'],textValue($event.target.value))" /></label>
        <label>{{ t('admin.originalPage') }}<input type="url" :value="photo.originalPage || ''" @input="update(['originalPage'],textValue($event.target.value))" /></label>
        <label>{{ t('admin.license') }}<input :value="photo.license || ''" @input="update(['license'],textValue($event.target.value))" /></label>
        <label>{{ t('admin.licenseUrl') }}<input type="url" :value="photo.licenseUrl || ''" @input="update(['licenseUrl'],textValue($event.target.value))" /></label>
        <label>{{ t('admin.attribution') }}<textarea :value="photo.attribution || ''" rows="2" @input="update(['attribution'],textValue($event.target.value))" /></label>
        <label>{{ t('admin.modifications') }}<textarea :value="(photo.modifications||[]).join('\n')" rows="2" @input="update(['modifications'],$event.target.value.split('\n').map(v=>v.trim()).filter(Boolean))" /></label>
        <label class="admin-check"><input type="checkbox" :checked="photo.licenseVerified" @change="update(['licenseVerified'],$event.target.checked)" />{{ t('admin.licenseReviewed') }}</label>
      </div><LocalizedFields :label="t('admin.caption')" :value="photo.caption" multiline @change="(lang,value)=>update(['caption'],{ru:null,ky:null,en:null,...photo.caption,[lang]:value})" />
      <label v-if="asset" class="admin-check"><input type="checkbox" :checked="asset.prepared" @change="emit('assets',assets.map(a=>a===asset?{...a,prepared:$event.target.checked}:a))" />{{ t('admin.filePrepared') }}</label>
      <p v-if="asset&&!asset.prepared" class="admin-notice">{{ t('admin.filePendingHint') }}</p>
      <div class="admin-actions"><a v-if="safeHttpUrl(photo.originalPage)" :href="safeHttpUrl(photo.originalPage)" target="_blank" rel="noopener noreferrer">{{ t('ui.m083') }}</a><button type="button" @click="pick(index)">{{ t('admin.chooseFile') }}</button><button type="button" @click="remove">{{ t('admin.removePhoto') }}</button></div>
      </section>
    </div>
    <h3>{{ t('admin.previews') }}</h3><p class="admin-hint">{{ t('admin.previewHint') }}</p>
    <div v-if="url&&!failed" class="admin-previews">
      <section><h4>{{ t('admin.preview.card') }}</h4><div class="admin-preview-frame"><img :src="url" :style="compositionStyle(photo,'card')" :alt="t('admin.preview.card')" /></div></section>
      <section><h4>{{ t('admin.preview.detail') }}</h4><div class="admin-preview-frame"><img :src="url" :style="compositionStyle(photo,'detail')" :alt="t('admin.preview.detail')" /></div></section>
      <section><h4>{{ t('admin.preview.canvas') }}</h4><SpeciesVisualization :photo="photo" :preview-url="url" :name="species.scientificName || species.id" :population-type="species.population.type" :species-id="`${species.id}:${index}`" /></section>
      <section><h4>{{ t('admin.preview.lesson') }}</h4><div v-if="photo.compositions?.lesson" class="admin-preview-frame"><img :src="url" :style="compositionStyle(photo,'lesson')" :alt="t('admin.preview.lesson')" /></div><img v-else class="admin-whole-image" :src="url" :alt="t('admin.preview.lesson')" /><p class="admin-hint">{{ t('admin.lessonFrameHint') }}</p></section>
    </div>
  </template><p v-else class="admin-empty">{{ t('admin.noPhotos') }}</p>
</template>
