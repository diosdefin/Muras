import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { PROJECT_ROOT } from './build-data.mjs'
import { LANGUAGES } from '../src/data/localization.js'
import { translationCompleteness } from '../src/data/translation-completeness.js'
export function auditTranslations(source) {
 const matrix = {}, records = []
 for (const [collection, list] of [['catalog', source.catalog], ['archive', source.demoArchive]]) for (const s of list) {
  const row = { collection, scientificName:s.scientificName, ...translationCompleteness(s) }; records.push(row)
  for (const lang of LANGUAGES) for (const c of row.languages[lang].cells) {
   const field=matrix[c.field] ||= Object.fromEntries(LANGUAGES.map(l=>[l,{}]));field[lang][c.state]=(field[lang][c.state]||0)+1
  }
 }
 return {catalog:source.catalog.length,archive:source.demoArchive.length,matrix,records}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const args=process.argv.slice(2);if(args.some(a=>a!=='--write')||args.length>1)throw Error('Only --write is supported')
 const source=JSON.parse(await readFile(resolve(PROJECT_ROOT,'data/species.source.json'),'utf8'))
 const baseline=JSON.parse(execFileSync('git',['show','5f253100ac61c825b72b9fb22ca9b4a45f7aa953:data/species.source.json'],{cwd:PROJECT_ROOT,maxBuffer:16*1024*1024}))
 const before=auditTranslations(baseline),after=auditTranslations(source)
 if(!args.length){console.log(JSON.stringify(after,null,2))}else{
  const lines=['# Аудит переводов KY / RU / UZ / EN','','Дата: 31.10.2026. Каталог 184, архив 2. Контрольный коммит этапов 1–2: `5f253100ac61c825b72b9fb22ca9b4a45f7aa953`, отправлен в origin/feature/local-file-admin.','',
   '## Методика','','Считается фактический текст каждого применимого поля, без fallback. null-раздел не считается недостающим научным фактом. Латинское научное имя вместо народного не засчитывается переводом. Полное совпадение с RU и подозрительный алфавит требуют просмотра (не автоматический приговор ошибочности). Для KY название страны Кыргызстан совпадает с RU закономерно. Числа не означают независимую лингвистическую проверку.','',
   '## Матрица до → после','','В ячейке: присутствующие / применимые значения. Сомнительные копии и латинские fallback не входят в числитель. Архив включён.','','| Поле | KY | RU | UZ | EN |','|---|---:|---:|---:|---:|']
  const cell=(a,k,l)=>{const v=a.matrix[k]?.[l]||{};return `${v.present||0}/${Object.entries(v).filter(([key])=>key!=='not_applicable').reduce((n,[,x])=>n+x,0)}`}
  for(const k of Object.keys(after.matrix))lines.push(`| ${k} | ${['ky','ru','uz','en'].map(l=>`${cell(before,k,l)} → ${cell(after,k,l)}`).join(' | ')} |`)
  lines.push('','## Все записи и точка продолжения','','В ячейках — фактически присутствующие/применимые блоки. Неподтверждённые народные названия остаются незаполненными. Полный машинный список каждого незавершённого поля: `.generated/localization/translation-audit.json` (воспроизводится командой ниже).','','| ID | Набор | KY | RU | UZ | EN | Все 4 языка |','|---|---|---:|---:|---:|---:|---|')
  for(const row of after.records)lines.push(`| ${row.id} | ${row.collection} | ${['ky','ru','uz','en'].map(l=>`${row.languages[l].filled}/${row.languages[l].total}`).join(' | ')} | ${row.complete?'да':'нет'} |`)
  const bodies=after.records.filter(r=>LANGUAGES.every(l=>r.languages[l].bodyComplete)).map(r=>r.id)
  lines.push('','## Выполнено и ограничения','',`Полностью заполнены все имеющиеся основные тексты на четырёх языках (без поля names): ${bodies.join(', ')||'нет'}. Это не утверждение о завершении всех народных названий. Полностью завершённых записей со всеми names: ${after.records.filter(r=>r.complete).length}.`,
   '', 'Первая очередь из 15 видов зафиксирована в `data/localization/batch-001.json`. Переведены четыре обязательных вида: irbis, argali, golden-eagle, eduards-fritillary. Остальные 11 в этой очереди ещё не переведены полностью; далее — остальные записи и архив. 100% готовность не достигнута. Независимая вычитка KY/UZ/EN требуется; неуверенные народные названия не придуманы.','',
   'Точная следующая запись: **greigs-tulip**, затем kaufmanns-tulip, sievers-apple, central-asian-tortoise, central-asian-frog, predatory-bush-cricket, dog-stinkhorn, european-glass-lizard, pike-asp, turkestan-catfish, tien-shan-scutiger. Перед продолжением читать issues для каждого ID, существующие значения не переписывать. После этой очереди выбирать следующие 15–25 по списку незавершённых ID.','',
   '## Остальные публичные тексты','','UI-словари и админка проходят проверку паритета ключей/подстановок на четырёх языках. ScientificText отмечает язык fallback, многоабзацные тексты используют contentParagraphs. Имена в карточках/страницах получают lang фактического источника. Названия регионов на странице вида теперь используют тот же ScientificText. Поиск индексирует имеющиеся языки, карта и викторина используют действующие словари/переводы; недостающий научный перевод не считается заполненным из-за интерфейсного перевода.','',
   'Библиографические title/publisher, URL, scientificName, taxonomy, авторы/лицензии/attribution и оригинальные названия документов не переводились. Исторические nationalRedBook.edition, изменения фото и исследовательские примечания остаются оригинальными и не выдаются за перевод. Population и региональные свидетельства не менялись. Отдельного нового народного названия не добавлено.','',
   '## Как продолжить','','```powershell','npm run translations:audit -- --write','npm run dev:admin','# В админке: фильтр незавершённых переводов, отдельные KY/RU/UZ/EN поля.','# Неполный черновик сохраняется без статуса завершения.','npm run data','npm run data:validate','npm run build','```','','Журнал хранит точные добавленные поля, тексты и SHA-256 русского оригинала; следующий пакет создавать отдельно, не заменяя первый и не меняя оригинал. Перед обновлением проверить сохранность фактов, дат, sourceIds, ссылок, фото/лицензий, статусов и русского текста относительно checkpoint. Отчёт генерируется кодом, поэтому продолжение не требует повторного перевода уже заполненных полей. Результаты браузера/тестов и точные изменённые файлы — в `STAGE_3_VALIDATION.md`.','')
  await mkdir(resolve(PROJECT_ROOT,'docs/localization'),{recursive:true});await mkdir(resolve(PROJECT_ROOT,'.generated/localization'),{recursive:true})
  await writeFile(resolve(PROJECT_ROOT,'docs/localization/TRANSLATION_AUDIT.md'),lines.join('\n'))
  await writeFile(resolve(PROJECT_ROOT,'.generated/localization/translation-audit.json'),JSON.stringify({before,after},null,2)+'\n')
  console.log(JSON.stringify({beforeComplete:before.records.filter(r=>r.complete).length,afterComplete:after.records.filter(r=>r.complete).length,bodyComplete:bodies}))
 }
}
