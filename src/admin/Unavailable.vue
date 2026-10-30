<script setup>
import {useLocale} from '../composables/useLocale.js'
const {language}=useLocale()
const publicUrl=import.meta.env.BASE_URL
const labels={ru:'Редактор доступен только локально. Запустите npm run dev:admin в репозитории.',ky:'Редактор жергиликтүү режимде гана жеткиликтүү. Репозиторийде npm run dev:admin иштетиңиз.',uz:'Muharrir faqat mahalliy rejimda mavjud. Repozitoriyda npm run dev:admin buyrugʻini ishga tushiring.',en:'The editor is available locally only. Run npm run dev:admin in the repository.'}
</script>
<template><main style="padding:3rem;max-width:48rem;margin:auto"><h1>MURAS</h1><p>{{ labels[language] }}</p><a :href="publicUrl">MURAS →</a></main></template>
