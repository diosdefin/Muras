import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { translationCompleteness, translationCell } from '../src/data/translation-completeness.js'
import { assertTranslationOnlyEvolution } from '../scripts/lib/translation-integrity.mjs'
import { contentParagraphs } from '../src/data/species-content.js'
import { scientificContent, LANGUAGES } from '../src/data/localization.js'
const before = JSON.parse(execFileSync('git',['show','5f253100ac61c825b72b9fb22ca9b4a45f7aa953:data/species.source.json'],{maxBuffer:16*1024*1024}))
const source = JSON.parse(await readFile(new URL('../data/species.source.json',import.meta.url)))
const batch = JSON.parse(await readFile(new URL('../data/localization/batch-001.json',import.meta.url)))
const next = JSON.parse(await readFile(new URL('../data/localization/batch-002.json',import.meta.url)))
const checkpoint = JSON.parse(execFileSync('git',['show',next.baselineCommit+':data/species.source.json'],{maxBuffer:16*1024*1024}))
const combined = {...batch,selectedIds:[...batch.selectedIds,...next.selectedIds],changes:[...batch.changes,...next.changes]}
test('all 184 scientific records and two archives preserve facts, source IDs, Russian originals, existing translations and image licences',()=>{
 assertTranslationOnlyEvolution(before,assertTranslationOnlyEvolution(checkpoint,source,next),batch)
 assert.equal(source.catalog.length,184);assert.equal(source.demoArchive.length,2)
})
test('unknown names and fallback copies are never counted as completed translations; empty future species stays incomplete',()=>{
 assert.equal(translationCell({field:'names',value:{ru:null,ky:null,en:null,uz:null}},'uz',null),'missing')
 assert.equal(translationCell({field:'content.overview',value:{ru:'Русский текст',ky:'Русский текст'}},'ky'),'same_as_russian_requires_review')
 assert.equal(translationCell({field:'names',value:{ru:'Ирбис',en:'Panthera uncia'}},'en','Panthera uncia'),'scientific_name_fallback')
 assert.equal(translationCompleteness({names:{},images:[]}).complete,false)
})
test('four translated bodies retain paragraphs, historical years and real language selection without claiming unknown Uzbek names',()=>{
 for(const id of ['irbis','argali','golden-eagle','eduards-fritillary']){
  const s=source.catalog.find(s=>s.id===id),c=translationCompleteness(s)
  for(const l of LANGUAGES){assert.ok(c.languages[l].bodyComplete,`${id} ${l}`);assert.equal(scientificContent(s.content.overview.text,l).language,l);assert.equal(contentParagraphs(s.content.overview,l).length,2);assert.ok(s.content.overview.text[l].includes('2006'))}
  assert.equal(c.languages.uz.complete,false);assert.ok(!s.names.uz)
 }
})
test('fallback keeps the actual Russian language rather than mislabelling it as Uzbek or English',()=>{
 for(const l of ['ky','uz','en']) assert.deepEqual(scientificContent({ru:'Оригинал',ky:null,en:null},l),{text:'Оригинал',language:'ru',fallback:true})
})
test('tampering with science, source URLs, Russian text, licence or a translated historical year fails the independent preservation check',()=>{
 for(const mutate of [s=>s.catalog[0].verified=true,s=>s.catalog[0].sources[0].url='https://example.invalid',s=>s.catalog[0].content.overview.text.ru+=' text',s=>s.catalog[0].images[0].sha256='0'.repeat(64),s=>s.catalog[0].images[0].license=null,s=>s.demoArchive.pop(),s=>s.catalog[0].content.overview.text.en+=' 2026']){
  const copy=structuredClone(source);mutate(copy);assert.throws(()=>assertTranslationOnlyEvolution(before,copy,combined))
 }
})

test('changing both a translated year and its journal cannot conceal a change of historical meaning',()=>{
 const copy=structuredClone(source),journal=structuredClone(combined)
 const entry=journal.changes.find(c=>c.id==='irbis'&&c.path==='content.overview.text.en')
 entry.text=entry.text.replace('2006','2026');copy.catalog[0].content.overview.text.en=entry.text
 assert.throws(()=>assertTranslationOnlyEvolution(before,copy,journal),/Numbers and historical years/)
})

test('batch 002 fills every existing body block, keeps source paragraph boundaries and leaves names untouched',()=>{
 assert.equal(next.selectedIds.length,8)
 for(const id of next.selectedIds){
  const item=source.catalog.find(s=>s.id===id),old=checkpoint.catalog.find(s=>s.id===id)
  const completeness=translationCompleteness(item)
  assert.deepEqual(item.names,old.names,id)
  for(const language of LANGUAGES){
   assert.ok(completeness.languages[language].bodyComplete,id+' '+language)
   for(const section of Object.values(item.content).filter(Boolean)){
    assert.equal(scientificContent(section.text,language).language,language)
    assert.equal(contentParagraphs(section,language).length,contentParagraphs(section,'ru').length)
   }
  }
 }
})
