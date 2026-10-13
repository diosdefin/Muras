<script setup>
import { ref } from 'vue'
import { useModalDialog } from '../../composables/useModalDialog.js'
import { useLocale } from '../../composables/useLocale.js'
defineProps({title:{type:String,required:true},message:{type:String,required:true}})
const emit=defineEmits(['done']);const dialog=ref(null),cancel=ref(null);const {t}=useLocale()
useModalDialog(dialog,cancel)
function backdrop(event){if(event.target===dialog.value){const r=dialog.value.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)emit('done',false)}}
</script>
<template><dialog ref="dialog" class="admin-confirm" aria-labelledby="admin-confirm-title" @cancel.prevent="emit('done',false)" @click="backdrop"><h2 id="admin-confirm-title">{{ title }}</h2><p>{{ message }}</p><div class="admin-actions"><button ref="cancel" type="button" @click="emit('done',false)">{{ t('admin.cancel') }}</button><button type="button" class="admin-primary" @click="emit('done',true)">{{ t('admin.confirm') }}</button></div></dialog></template>
