<script setup>
import { useLocale } from '../../composables/useLocale.js'
import { populationTransition, textValue } from '../data/model.js'
import SourcePicker from './SourcePicker.vue'
const props=defineProps({species:{type:Object,required:true},ask:{type:Function,required:true}})
const emit=defineEmits(['change']);const {t}=useLocale()
const update=(field,value)=>emit('change',['population',field],value)
async function type(value){const result=populationTransition(props.species.population,value);if(result.needsConfirmation && !await props.ask('admin.confirmPopulation','admin.populationDiscard'))return;emit('change',['population'],populationTransition(props.species.population,value,true).population)}
async function mode(value){const p=props.species.population;const discard=value==='single'?p.min!==null||p.max!==null:p.value!==null;if(discard&&!await props.ask('admin.confirmPopulation','admin.populationDiscard'))return;emit('change',['population'],{...p,value:null,min:null,max:null});range.value=value==='range'}
import {ref,watch} from 'vue'
const range=ref(props.species.population.min !== null || props.species.population.max !== null)
watch(()=>props.species.population.type,()=>{range.value=props.species.population.min!==null||props.species.population.max!==null})
const numeric=e=>e.target.value===''?null:e.target.valueAsNumber
</script>
<template>
  <div class="admin-population-types" role="group" :aria-label="t('admin.populationType')"><button v-for="kind in ['exact','approximate','unknown']" :key="kind" type="button" :aria-pressed="species.population.type===kind" @click="type(kind)">{{ t(`admin.population.${kind}`) }}</button></div>
  <p class="admin-notice">{{ t('admin.populationRules') }}</p>
  <p v-if="species.population.type==='unknown'" class="admin-hint">{{ t('admin.unknownPopulation') }}</p>
  <div class="admin-form-grid">
    <template v-if="species.population.type!=='unknown'">
      <label v-if="species.population.type==='approximate'">{{ t('admin.estimateMode') }}<select :value="range?'range':'single'" @change="mode($event.target.value)"><option value="single">≈ value</option><option value="range">min–max</option></select></label>
      <label v-if="species.population.type==='exact'||!range">{{ t('admin.value') }}<input type="number" min="0" :step="species.population.type==='exact'?1:'any'" :value="species.population.value" @input="update('value',numeric($event))" /></label>
      <template v-else><label>min<input type="number" min="0" step="any" :value="species.population.min" @input="update('min',numeric($event))" /></label><label>max<input type="number" min="0" step="any" :value="species.population.max" @input="update('max',numeric($event))" /></label></template>
    </template>
    <label>{{ t('ui.m160') }}<input :value="species.population.territory || ''" @input="update('territory',textValue($event.target.value))" /></label>
    <label>{{ t('ui.m161') }}<input type="number" min="1500" :max="new Date().getFullYear()" :value="species.population.year" @input="update('year',numeric($event))" /></label>
    <label>{{ t('ui.m162') }}<input :value="species.population.unit || ''" @input="update('unit',textValue($event.target.value))" /></label>
    <label>{{ t('admin.method') }}<select :value="species.population.method || ''" :disabled="species.population.type==='unknown'" @change="update('method',textValue($event.target.value))"><option value="">{{ t('admin.unknown') }}</option><option value="complete-count">{{ t('population.exact') }}</option><option value="estimate">{{ t('population.approximate') }}</option></select></label>
    <label>{{ t('admin.reviewStatus') }}<select :value="species.population.reviewStatus" @change="update('reviewStatus',$event.target.value)"><option v-for="status in ['pending','approved','rejected']" :key="status" :value="status">{{ t(`admin.review.${status}`) }}</option></select></label>
  </div>
  <SourcePicker :sources="species.sources" :value="species.population.sourceIds" @change="update('sourceIds',$event)" />
</template>
