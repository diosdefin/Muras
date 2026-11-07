import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { assertTranslationOnlyEvolution } from '../../scripts/lib/translation-integrity.mjs'
const base = JSON.parse(execFileSync('git',['show','5f253100ac61c825b72b9fb22ca9b4a45f7aa953:data/species.source.json'],{maxBuffer:16*1024*1024}))
const batch = JSON.parse(readFileSync(new URL('../../data/localization/batch-001.json',import.meta.url)))
const next = JSON.parse(readFileSync(new URL('../../data/localization/batch-002.json',import.meta.url)))
const checkpoint = JSON.parse(execFileSync('git',['show',next.baselineCommit+':data/species.source.json'],{maxBuffer:16*1024*1024}))
const current = JSON.parse(readFileSync(new URL('../../data/species.source.json',import.meta.url)))
// Verify the entire live source first. The historical view removes only exact,
// journalled additions and never changes the pinned historical checksum/evidence.
assertTranslationOnlyEvolution(base,assertTranslationOnlyEvolution(checkpoint,current,next),batch)
export function beforeTranslations(document) {
 const copy = structuredClone(document)
 const records = Array.isArray(copy) ? copy : copy.catalog || [copy]
 for (const c of [...batch.changes,...next.changes]) {
  const s=records.find(s=>s.id===c.id),old=base.catalog.find(s=>s.id===c.id)
  if(!s)continue
  const keys=c.path.split('.'),lang=keys.pop()
  const at=o=>keys.reduce((v,k)=>v?.[k],o)
  const target=at(s),previous=at(old)
  if(!target)continue
  if(target[lang]==null||target[lang]==='')continue
  assert.equal(target[lang],c.text,'Only documented translation additions may be viewed historically')
  if(Object.hasOwn(previous,lang))target[lang]=previous[lang];else delete target[lang]
 }
 return copy
}
