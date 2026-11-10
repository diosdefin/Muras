import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { gitShow } from '../../scripts/lib/git-history.mjs'
import { assertTranslationOnlyEvolution } from '../../scripts/lib/translation-integrity.mjs'
const base = JSON.parse(gitShow('5f253100ac61c825b72b9fb22ca9b4a45f7aa953','data/species.source.json'))
const batch = JSON.parse(readFileSync(new URL('../../data/localization/batch-001.json',import.meta.url)))
const next = JSON.parse(readFileSync(new URL('../../data/localization/batch-002.json',import.meta.url)))
const checkpoint = JSON.parse(gitShow(next.baselineCommit,'data/species.source.json'))
const third = JSON.parse(readFileSync(new URL('../../data/localization/batch-003.json',import.meta.url)))
const thirdBase = JSON.parse(gitShow(third.baselineCommit,'data/species.source.json'))
const fourth = JSON.parse(readFileSync(new URL('../../data/localization/batch-004.json',import.meta.url)))
const fourthBase = JSON.parse(gitShow(fourth.baselineCommit,'data/species.source.json'))
// Batches 005 onward are discovered automatically; each one is verified against its own baseline commit.
const LATER = readdirSync(new URL('../../data/localization/',import.meta.url)).filter(f=>/^batch-\d{3}\.json$/.test(f)&&Number(f.slice(6,9))>=5).sort().map(f=>{
 const journal=JSON.parse(readFileSync(new URL('../../data/localization/'+f,import.meta.url)))
 return {file:'data/localization/'+f,journal,base:JSON.parse(gitShow(journal.baselineCommit,'data/species.source.json'))}
})
export const LATER_TRANSLATIONS = LATER
export const unwindLaterTranslations = document => LATER.slice().reverse().reduce((doc,{journal,base})=>assertTranslationOnlyEvolution(base,doc,journal),document)
const current = JSON.parse(readFileSync(new URL('../../data/species.source.json',import.meta.url)))
// Verify the entire live source first. The historical view removes only exact,
// journalled additions and never changes the pinned historical checksum/evidence.
let checked = false
export const TRANSLATION_JOURNALS = new Set([...['001','002','003','004'].map(id => 'data/localization/batch-' + id + '.json'),...LATER.map(x=>x.file)])
export const TRANSLATED_CATALOGUES = new Set(['data/species.source.json','public/data/species.json'])
export function beforeTranslations(document, { requireTranslations = false } = {}) {
 if (!checked) {
  assertTranslationOnlyEvolution(base,assertTranslationOnlyEvolution(checkpoint,assertTranslationOnlyEvolution(thirdBase,assertTranslationOnlyEvolution(fourthBase,unwindLaterTranslations(current),fourth),third),next),batch)
  checked = true
 }
 const copy = structuredClone(document)
 const records = Array.isArray(copy) ? copy : copy.catalog || [copy]
 for (const c of [...batch.changes,...next.changes,...third.changes,...fourth.changes,...LATER.flatMap(x=>x.journal.changes)]) {
  const s=records.find(s=>s.id===c.id),old=base.catalog.find(s=>s.id===c.id)
  if(!s)continue
  const keys=c.path.split('.'),lang=keys.pop()
  const at=o=>keys.reduce((v,k)=>v?.[k],o)
  const target=at(s),previous=at(old)
  if(!requireTranslations && (!target||target[lang]==null||target[lang]===''))continue
  assert.ok(target, c.id+' '+c.path)
  assert.equal(target[lang],c.text,'Only documented translation additions may be viewed historically')
  if(Object.hasOwn(previous,lang))target[lang]=previous[lang];else delete target[lang]
 }
 return copy
}
