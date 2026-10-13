<script setup>
import { useLocale } from '../../composables/useLocale.js'
const props=defineProps({sources:{type:Array,required:true},value:{type:Array,default:()=>[]},label:{type:String,default:''}})
const emit=defineEmits(['change']);const {t}=useLocale()
function change(id, checked){emit('change',checked?[...new Set([...props.value,id])]:props.value.filter(v=>v!==id))}
</script>
<template><fieldset class="admin-source-picker"><legend>{{ label || t('admin.sourceIds') }}</legend><p v-if="!sources.length" class="admin-hint">{{ t('admin.noSources') }}</p><label v-for="(source,index) in sources" :key="index"><input type="checkbox" :checked="value.includes(source.id)" @change="change(source.id,$event.target.checked)" /><span>{{ source.id }} · {{ source.title || t('admin.untitled') }}</span></label></fieldset></template>
