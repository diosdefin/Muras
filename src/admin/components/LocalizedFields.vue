<script setup>
import { useLocale } from '../../composables/useLocale.js'
defineProps({ label:{type:String,required:true},value:{type:Object,default:null},multiline:Boolean })
const emit=defineEmits(['change'])
const {t}=useLocale()
</script>
<template><fieldset class="admin-localized"><legend>{{ label }}</legend><label v-for="lang in ['ky','ru','en']" :key="lang"><span>{{ lang.toUpperCase() }}</span><textarea v-if="multiline" :value="value?.[lang] || ''" :lang="lang" rows="3" @input="emit('change',lang,$event.target.value || null)" /><input v-else :value="value?.[lang] || ''" :lang="lang" type="text" @input="emit('change',lang,$event.target.value || null)" /></label></fieldset></template>
