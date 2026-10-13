import { readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import { resolve, dirname, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { PROJECT_ROOT } from './build-data.mjs'

const digest=bytes=>createHash('sha256').update(bytes).digest('hex')
const confined=path=>{const p=resolve(PROJECT_ROOT,path),rel=relative(PROJECT_ROOT,p);if(!rel||rel.startsWith('..')||rel.includes(':'))throw new Error('Путь вне проекта');return p}
const stripHtml=s=>String(s||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').trim()
async function request(url){
  for(let n=0;n<4;n++){
    const response=await fetch(url,{headers:{'User-Agent':'MurasEditorial/1.0 (github.com/diosdefin/Redbook)'},signal:AbortSignal.timeout(60000)})
    if(response.status!==429){if(!response.ok)throw new Error(`HTTP ${response.status}`);return response}
    const delay=Math.min(120,Math.max(30,Number(response.headers.get('retry-after'))||30))
    console.error(`Wikimedia rate limit: пауза ${delay}s`);await new Promise(r=>setTimeout(r,delay*1000))
  }throw new Error('Ограничение частоты после четырёх попыток')
}
export function checkCommonsMetadata(candidate,page){
  const expected=candidate.photoResearch?.photo,info=page?.imageinfo?.[0],wikitext=page?.revisions?.[0]?.slots?.main?.['*']||''
  if(!expected?.rightsConfirmed||!expected.originalPageRead||!expected.eligibleForNextEditorialStage)throw new Error('Нет предварительного документального допуска фотографии')
  const license=info?.extmetadata?.LicenseShortName?.value,author=stripHtml(info?.extmetadata?.Artist?.value)
  if(license!==expected.license||!author||!author.includes(expected.author.replace(/ \(.*\)$/,'')))throw new Error('Автор/лицензия не совпадают с проверенным исследованием')
  if(!/^(CC BY(?:-SA)? [234]\.0|CC0|Public domain)$/.test(license))throw new Error('Лицензия требует отдельной обработки уведомлений; placeholder')
  if(license==='Public domain'&&!/\{\{PD-self(?:\||\}\})/i.test(wikitext))throw new Error('Public domain без документированного PD-self не принимается автоматически')
  const subject=candidate.photoResearch.photo.subjectAsDocumented
  const plain=stripHtml(info.extmetadata.ImageDescription?.value),categories=info.extmetadata.Categories?.value||''
  if(![plain,categories,wikitext.match(/\[\[Category:[^\]]+\]\]/g)?.join(' ')||''].some(t=>t.replaceAll('_',' ').includes(subject.replace(/ по .*$/,''))))
    throw new Error('Описание/категория не содержит проверяемое определение таксона')
  return {license,author:expected.author,artistStatementSha256:digest(Buffer.from(author)),licenseUrl:license==='Public domain'?'https://commons.wikimedia.org/wiki/Template:PD-self':info.extmetadata.LicenseUrl?.value,
    originalPage:info.descriptionurl,revisionId:page.revisions[0].revid,width:info.width,height:info.height,description:plain}
}

export async function prepareBatchImages(selection,{python='python',output='.generated/bulk-images.json'}={}){
  if(selection?.schemaVersion!==1||selection.documentType!=='research-batch-selection'||!Array.isArray(selection.candidates))throw new Error('Некорректный рецепт фотографий')
  const research=JSON.parse(await readFile(resolve(PROJECT_ROOT,'data/research/catalog-candidates.json'),'utf8'))
  const previous=JSON.parse(await readFile(confined(output),'utf8').catch(error=>{if(error.code==='ENOENT')return '{}';throw error}))
  const receipts=[]
  for(const item of selection.candidates.filter(c=>c.decision==='include')){
    const saved=item.photo==='research'&&previous.batchId===selection.batchId&&previous.receipts?.find(r=>r.candidateId===item.id&&r.status==='prepared')
    if(saved){
      const candidate=research.candidates.find(c=>c.id===item.id),expected=candidate?.photoResearch?.photo
      if(!expected?.rightsConfirmed||!expected.eligibleForNextEditorialStage||saved.image.license!==expected.license||saved.image.author!==expected.author)throw new Error(`${item.id}: квитанция не соответствует актуальному исследовательскому допуску`)
      const bytes=await readFile(confined(saved.image.path))
      if(digest(bytes)!==saved.image.sha256)throw new Error(`${item.id}: сохранённая фотография изменилась; повторная загрузка отменена`)
      receipts.push(saved);continue
    }
    const result={candidateId:item.id,status:'placeholder',reason:item.photoNote||'Нет допустимой фотографии в исследовании'}
    receipts.push(result)
    if(item.photo!=='research')continue
    try{
      const c=research.candidates.find(c=>c.id===item.id),p=c?.photoResearch?.photo
      if(!p)throw new Error('Не найдена страница проверенной фотографии')
      const title=decodeURIComponent(new URL(p.originalPage).pathname.split('/wiki/')[1]).replaceAll('_',' ')
      const api=new URL('https://commons.wikimedia.org/w/api.php')
      api.search=new URLSearchParams({action:'query',format:'json',titles:title,prop:'imageinfo|revisions',iiprop:'url|size|extmetadata',rvprop:'ids|content',rvslots:'main'})
      const data=await (await request(api)).json(),page=Object.values(data.query?.pages||{})[0]
      const metadata=checkCommonsMetadata(c,page)
      const original=confined(`.generated/bulk-originals/${item.id}.jpg`)
      await mkdir(dirname(original),{recursive:true})
      const response=await request(page.imageinfo[0].url)
      if(Number(response.headers.get('content-length'))>30*1024*1024)throw new Error('Оригинал превышает 30 MiB')
      const bytes=new Uint8Array(await response.arrayBuffer())
      if(bytes.length>30*1024*1024)throw new Error('Оригинал превышает 30 MiB')
      await writeFile(original,bytes)
      const path=`assets/images/species/${item.id}.webp`,target=confined(path)
      // Never overwrite a local original silently on a later preparation run.
      try{await stat(target);throw new Error('WebP уже существует: используйте сохранённую квитанцию или отдельно проверьте обновление')}catch(error){if(error.code!=='ENOENT')throw error}
      const optimized=JSON.parse(execFileSync(python,[resolve(PROJECT_ROOT,'scripts/process_data.py'),'--optimize-input',original,'--optimize-output',target,'--max-edge','1800','--quality','82'],{encoding:'utf8'}))
      Object.assign(result,{status:'prepared',reason:null,metadata:{...metadata,metadataUrl:String(api),accessedAt:new Date().toISOString().slice(0,10),originalSha256:digest(bytes)},
        image:{path,width:optimized.width,height:optimized.height,sha256:optimized.sha256,author:metadata.author,
          originalPage:metadata.originalPage,license:metadata.license,licenseUrl:metadata.licenseUrl,
          attribution:`${page.title.replace(/^File:/,'')} — ${metadata.author}, ${metadata.license}; Wikimedia Commons.${metadata.license.includes('SA')?' Производные изображения распространяются под той же лицензией.':''}`,
          modifications:['Уменьшение без апскейла до 1800 px; WebP quality 82; удаление EXIF/XMP.','CSS cover и индивидуальная композиция, где указана; учебная пикселизация/обесцвечивание canvas не отражают фактическую численность.'],
          licenseVerified:true,caption:{ru:[p.context,item.photoNote].filter(Boolean).join(' '),ky:null,en:null}}})
      console.error(`${item.id}: подготовлен WebP ${optimized.bytes} байт; нужен визуальный просмотр`)
    }catch(error){result.reason=error.message;console.error(`${item.id}: placeholder — ${error.message}`)}
    await mkdir(dirname(confined(output)),{recursive:true});await writeFile(confined(output),JSON.stringify({schemaVersion:1,batchId:selection.batchId,receipts},null,2)+'\n')
    await new Promise(r=>setTimeout(r,5000))
  }
  await mkdir(dirname(confined(output)),{recursive:true});await writeFile(confined(output),JSON.stringify({schemaVersion:1,batchId:selection.batchId,receipts},null,2)+'\n')
  return receipts
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{const args=process.argv.slice(2),arg=k=>args[args.indexOf(k)+1];if(!args.includes('--selection'))throw new Error('Нужен --selection; необязательно --python и --output')
    const selection=JSON.parse(await readFile(confined(arg('--selection')),'utf8'))
    const result=await prepareBatchImages(selection,{python:args.includes('--python')?arg('--python'):'python',output:args.includes('--output')?arg('--output'):'.generated/bulk-images.json'})
    console.log(`Фото подготовлены: ${result.filter(r=>r.status==='prepared').length}; placeholders: ${result.filter(r=>r.status==='placeholder').length}`)
  }catch(error){console.error(error.message);process.exitCode=1}
}
