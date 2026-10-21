import { readFile, writeFile, mkdir, rename, open, unlink } from 'node:fs/promises'
import { resolve, dirname, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { planBatchImport } from './lib/bulk-import.mjs'
import { canPublishImage } from '../src/data/species-model.js'
import { PROJECT_ROOT } from './build-data.mjs'

const hash=bytes=>createHash('sha256').update(bytes).digest('hex')
export const IMPORT_BRANCHES = ['feature/catalog-expansion', 'feature/species-content', 'feature/bulk-import', 'feature/bulk-import-next', 'feature/catalog-150']
export const canApplyOnBranch = branch => IMPORT_BRANCHES.includes(branch)
const confined=(root,path)=>{const target=resolve(root,path),rel=relative(root,target);if(!rel||rel.startsWith('..')||rel.includes(':'))throw new Error(`Путь вне проекта: ${path}`);return target}
export function webpMetadata(bytes){
  if(bytes.length<20||bytes.subarray(0,4).toString()!=='RIFF'||bytes.subarray(8,12).toString()!=='WEBP'||bytes.readUInt32LE(4)+8!==bytes.length)throw new Error('Повреждённый контейнер WebP')
  let size,privateMetadata=false
  for(let offset=12;offset+8<=bytes.length;){
    const kind=bytes.subarray(offset,offset+4).toString(),length=bytes.readUInt32LE(offset+4),p=offset+8
    if(p+length>bytes.length)throw new Error('Повреждённый chunk WebP')
    if(kind==='EXIF'||kind==='XMP ')privateMetadata=true
    if(kind==='VP8X'&&length>=10)size={width:bytes.readUIntLE(p+4,3)+1,height:bytes.readUIntLE(p+7,3)+1}
    if(kind==='VP8 '&&length>=10&&bytes.subarray(p+3,p+6).equals(Buffer.from([0x9d,0x01,0x2a])))size={width:bytes.readUInt16LE(p+6)&0x3fff,height:bytes.readUInt16LE(p+8)&0x3fff}
    if(kind==='VP8L'&&length>=5&&bytes[p]===0x2f){const bits=bytes.readUInt32LE(p+1);size={width:(bits&0x3fff)+1,height:((bits>>>14)&0x3fff)+1}}
    offset=p+length+(length%2)
  }
  if(!size||!size.width||!size.height)throw new Error('Не удалось прочитать размеры WebP')
  return {...size,privateMetadata}
}
export async function inspectAssets(root,species) {
  const errors=[]
  for(const image of species.images){
    // The batch publishes only reviewed assets; private legacy images stay in existing records.
    if(!canPublishImage(image)){errors.push('Фото пакета не имеет подтверждённых прав и полных метаданных');continue}
    try{
      const bytes=await readFile(confined(root,image.path))
      const metadata=webpMetadata(bytes)
      if(metadata.width!==image.width||metadata.height!==image.height)errors.push(`${image.path}: размеры не совпадают с WebP`)
      if(metadata.privateMetadata)errors.push(`${image.path}: удалите EXIF/XMP перед публикацией`)
      if(!image.sha256||hash(bytes)!==image.sha256)errors.push(`${image.path}: SHA-256 отсутствует или не совпадает`)
      if(!Number.isInteger(image.width)||!Number.isInteger(image.height))errors.push(`${image.path}: отсутствуют размеры`)
    }catch(error){errors.push(`${image.path}: ${error.message}`)}
  }
  return errors
}

export async function importBatchFile(root,batchPath,{apply=false,expectedBatchSha256,requireAllValid=false}={}){
  const path=confined(root,'data/species.source.json'), lockPath=`${path}.import.lock`
  let lock,tempPath
  try{
    if(apply)lock=await open(lockPath,'wx')
    const before=await readFile(path), batchBytes=await readFile(confined(root,batchPath))
    if(batchBytes.length>16*1024*1024)throw new Error('Пакет превышает 16 MiB')
    if(expectedBatchSha256!==undefined&&hash(batchBytes)!==expectedBatchSha256)throw new Error('Пакет изменился после редакторской проверки; запись отменена')
    const batch=JSON.parse(batchBytes.toString('utf8').replace(/^\uFEFF/,''))
    const plan=await planBatchImport(JSON.parse(before.toString('utf8')),batch,{validateAssets:s=>inspectAssets(root,s)})
    if(requireAllValid&&plan.counts.rejected)throw new Error(`Весь пакет отменён: ${plan.results.filter(r=>r.status==='rejected').map(r=>`${r.candidateId}: ${r.errors.join('; ')}`).join('\n')}`)
    const report={...plan,sourceSha256:hash(before),mode:apply?'apply':'preview',applied:false};delete report.proposedSource
    if(apply&&plan.counts.added){
      const backup=confined(root,`.generated/import-backups/${batch.batchId}-${hash(before).slice(0,16)}.json`)
      await mkdir(dirname(backup),{recursive:true})
      await writeFile(backup,before,{flag:'wx'}).catch(async error=>{if(error.code!=='EEXIST'||hash(await readFile(backup))!==hash(before))throw error})
      const nextPath=`${path}.${batch.batchId}.pending`
      await writeFile(nextPath,JSON.stringify(plan.proposedSource,null,2)+'\n',{flag:'wx'});tempPath=nextPath
      if(hash(await readFile(path))!==hash(before))throw new Error('Каталог изменился после просмотра; запись отменена')
      await rename(tempPath,path);tempPath=null;report.applied=true
    }
    return report
  }finally{
    if(tempPath)await unlink(tempPath).catch(()=>{})
    if(lock){await lock.close();await unlink(lockPath)}
  }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{
    const args=process.argv.slice(2),arg=name=>args[args.indexOf(name)+1]
    if(!args.includes('--input'))throw new Error('Использование: node scripts/import-species-batch.mjs --input пакет.json [--apply] [--report отчёт.json]. Без --apply только просмотр.')
    if(args.includes('--apply')&&!canApplyOnBranch(execFileSync('git',['branch','--show-current'],{cwd:PROJECT_ROOT,encoding:'utf8'}).trim()))throw new Error(`Запись разрешена только в ${IMPORT_BRANCHES.join(' / ')}`)
    const report=await importBatchFile(PROJECT_ROOT,arg('--input'),{apply:args.includes('--apply')})
    if(args.includes('--report')){const p=confined(PROJECT_ROOT,arg('--report'));await mkdir(dirname(p),{recursive:true});await writeFile(p,JSON.stringify(report,null,2)+'\n')}
    console.log(JSON.stringify(report,null,2))
    if(report.counts.rejected)process.exitCode=2 // Partial rejection is reported even when the valid subset was applied.
  }catch(error){console.error(`Импорт отменён: ${error.message}`);process.exitCode=1}
}
