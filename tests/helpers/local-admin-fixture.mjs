import {mkdtemp,cp,mkdir,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {resolve,join,dirname,relative} from 'node:path'
import assert from 'node:assert/strict'
export const repository=resolve(import.meta.dirname,'../..')
export async function localAdminFixture(){
 const root=await mkdtemp(join(tmpdir(),'muras-admin-test-'))
 for(const file of ['data/species.source.json','data/geography','data/archive','src/data/quiz/questions.json','assets/images','public/data','public/images/approved']){const target=join(root,file);await mkdir(dirname(target),{recursive:true});await cp(join(repository,file),target,{recursive:true})}
 return {root,async cleanup(){const rel=relative(tmpdir(),root);assert.ok(rel.startsWith('muras-admin-test-')&&!rel.includes('..')&&!rel.includes('/')&&!rel.includes('\\'));await rm(root,{recursive:true,force:true})}}
}
