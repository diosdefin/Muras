import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
import { validateSpecies } from '../src/data/species-model.js'
import { UNKNOWN_POPULATION } from '../src/data/population.js'
import { taxonNameKey } from './lib/bulk-import.mjs'
import { PROJECT_ROOT } from './build-data.mjs'

const ranks=['kingdom','phylum','class','order','family','genus']
const localized=text=>({ru:text,ky:null,en:null})
const inside=(root,path)=>{const p=resolve(root,path),rel=relative(root,p);if(!rel||rel.startsWith('..')||rel.includes(':'))throw new Error('Путь вне проекта');return p}

export function prepareResearchBatch(research, selection, { taxonomyEvidence={records:[]}, imageEvidence={receipts:[]} }={}){
  if(research?.documentType!=='research-candidates'||selection?.schemaVersion!==1||selection.documentType!=='research-batch-selection'||!Array.isArray(selection.candidates))throw new Error('Нужны исследовательский документ и рецепт research-batch-selection')
  const batch={schemaVersion:1,documentType:'species-import-batch',batchId:selection.batchId,records:[]}
  for(const item of selection.candidates){
    const entry={candidateId:item.id,species:null}
    batch.records.push(entry)
    try{
      const c=research.candidates.find(c=>c.id===item.id)
      if(!c)throw new Error('Кандидат отсутствует в исследовании')
      if(item.decision==='defer'){entry.deferredReason=item.reason||'Нет решения научного редактора';continue}
      if(item.decision!=='include')throw new Error('Неизвестное решение рецепта')
      if(c.countryOccurrence?.countryCode!=='KG'||c.nationalRedBook?.listed!==true)throw new Error('Не подтверждены Кыргызстан и национальное включение в исследовательской записи')
      const extra=taxonomyEvidence.records.find(e=>e.candidateId===item.id&&e.sourceId===item.selectedTaxonomy)
      const match=extra?.data||c.taxonomyResearch.snapshot
      if(match.status!=='ACCEPTED'||match.matchType!=='EXACT'||!['SPECIES','SUBSPECIES'].includes(match.rank)||!match.usageKey)throw new Error('Нет точного принятого таксона; автоматическое объединение концепций запрещено')
      const scientificName=match.canonicalName
      if(item.selectedTaxonomy&&!extra)throw new Error('Выбранное таксономическое свидетельство отсутствует')
      const ranksEvidence=item.taxonomyRanks==='iucn'?taxonomyEvidence.records.find(e=>e.candidateId===item.id&&e.sourceId==='iucn-selected-ranks'):null
      if(item.taxonomyRanks==='iucn'&&(!ranksEvidence||ranksEvidence.data.taxonomicStatus!=='ACCEPTED'||taxonNameKey(ranksEvidence.data.canonicalName)!==taxonNameKey(scientificName)))throw new Error('Ранги IUCN не соответствуют выбранному таксону')
      const rankSnapshot=ranksEvidence?.data||match, taxonomy=Object.fromEntries(ranks.map(r=>[r,rankSnapshot[r]||null]))
      const taxSourceId=extra?.sourceId||'gbif-match',rankSourceId=ranksEvidence?.sourceId||taxSourceId,taxonId=`gbif:${match.usageKey}`
      // A species assessment never becomes an assessment of its national subspecies.
      const exactAssessment=c.iucn.matchState==='exact_accepted_record'&&taxonNameKey(c.iucn.assessedTaxon)===taxonNameKey(scientificName)
      const iucn={category:exactAssessment?c.iucn.category:null,year:null,sourceIds:exactAssessment?c.iucn.sourceIds:[]}
      const receipt=imageEvidence.receipts.find(r=>r.candidateId===item.id),images=[]
      if(item.photo==='research'&&receipt?.status==='prepared'){
        if(receipt.visualReview?.reviewed!==true)throw new Error('Фотография подготовлена, но визуальный просмотр не зафиксирован')
        if(taxonNameKey(c.photoResearch?.photo?.subjectAsDocumented?.replace(/ по .*$/,''))!==taxonNameKey(scientificName))throw new Error('Определение фотографии не соответствует выбранному видовому/подвидовому таксону')
        const image=structuredClone(receipt.image)
        if(item.composition)image.compositions={card:item.composition,detail:item.composition}
        images.push(image)
      }
      const s={id:c.id,scientificName,names:{ru:c.names.ru,ky:c.names.ky,en:c.names.en},taxonomy,group:c.group,
        nationalRedBook:{listed:c.nationalRedBook.listed,category:c.nationalRedBook.category,
          edition:`${c.nationalRedBook.edition.replace('второе издание','2-е издание')} (историческая национальная запись)`,year:c.nationalRedBook.year,sourceIds:c.nationalRedBook.sourceIds},
        iucn,habitat:c.habitat?{description:structuredClone(c.habitat.description),sourceIds:c.habitat.sourceIds}:null,
        regions:[{code:'KG',type:'country',names:{ru:'Кыргызстан',ky:'Кыргызстан',en:'Kyrgyzstan'},sourceIds:['book-2006']}],
        threats:c.threats?.length?c.threats.map(t=>({text:t.text,sourceIds:t.sourceIds})):null,
        conservationMeasures:c.conservationMeasures.recommended?.length?c.conservationMeasures.recommended.map(m=>({text:localized(`Рекомендации издания ${m.sourceYear??c.nationalRedBook.year} года: ${m.text.ru}`),sourceIds:m.sourceIds})):null,
        population:structuredClone(UNKNOWN_POPULATION),images,sources:[],verified:false,lastReviewedAt:null}
      if(c.id==='pike-asp')s.habitat.description.ru+=' Историческая запись; современные находки в Кыргызстане не подтверждены использованными источниками.'
      const originals=[...c.sources,...[extra,ranksEvidence].filter(Boolean).map(e=>({id:e.sourceId,title:`GBIF: selected exact taxon — ${scientificName}`,publisher:e.sourceId==='iucn-selected-ranks'?'IUCN / GBIF':'GBIF',url:e.url,accessedAt:e.accessedAt,supports:[]}))]
      for(const old of originals){
        const supports=[]
        for(const lang of ['ru','ky','en'])if(c.nameSourceIds[lang].includes(old.id))supports.push(`names.${lang}`)
        if(old.id==='book-2006')supports.push('group','nationalRedBook.listed','nationalRedBook.category','nationalRedBook.edition','nationalRedBook.year','habitat','regions.0',
          ...s.threats?.map((_,i)=>`threats.${i}`)||[],...s.conservationMeasures?.map((_,i)=>`conservationMeasures.${i}`)||[])
        if(c.countryOccurrence.sourceIds.includes(old.id))supports.push('regions.0')
        if(old.id===taxSourceId)supports.push('scientificName')
        if(old.id===rankSourceId)supports.push(...ranks.filter(r=>taxonomy[r]).map(r=>`taxonomy.${r}`))
        if(iucn.sourceIds.includes(old.id))supports.push('iucn.category')
        if(old.id==='commons-file'&&images.length)supports.push('images.0.caption')
        if(!supports.length)continue
        const source={...old,supports:[...new Set(supports)],language:['book-2006','decree-170'].includes(old.id)?'ru':old.id==='commons-file'?null:'en'}
        if(old.id===taxSourceId){source.taxonId=taxonId;source.title=`GBIF Backbone: exact accepted ${match.rank.toLowerCase()} — ${scientificName}`}
        if(old.id.startsWith('iucn'))source.title=`IUCN Red List 2026-1: ${scientificName} — ${old.id==='iucn-selected-ranks'?'taxonomy':'global assessment'} via GBIF`
        if(old.id==='rufford-2022')source.title='Rufford: Menzbir Marmot — final evaluation report (2022)'
        if(old.id==='mnr-besh-aral-2025')source.language='ru'
        if(old.id==='book-2006')source.notes=[`Историческое имя очерка: ${c.scientificName}. Исторические данные 2006 года не подтверждают текущий правовой перечень или численность.`,...c.gapsAndContradictions,
          item.photoNote,receipt?.reason,!exactAssessment&&c.iucn.category?`Оценка IUCN ${c.iucn.category} относится к ${c.iucn.assessedTaxon}, а не к ${scientificName}; в карточке оставлено null.`:null].filter(Boolean).join(' ')
        if(old.id==='commons-file'){source.url=images[0].originalPage;source.publisher=`Wikimedia Commons; ${images[0].author}`;source.notes=`Описание и лицензия прочитаны, revision ${receipt.metadata.revisionId}; пиксели просмотрены, независимая идентификация не заменена.`}
        s.sources.push(source)
      }
      const errors=validateSpecies([s]);if(errors.length)throw new Error(errors.join('; '))
      entry.species=s;entry.taxonomyEvidence={canonicalName:scientificName,rank:match.rank,status:match.status,matchType:match.matchType,taxonId,sourceId:taxSourceId}
    }catch(error){entry.deferredReason=`Ошибка подготовки: ${error.message}`}
  }
  return batch
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{
    const args=process.argv.slice(2),arg=k=>args[args.indexOf(k)+1]
    if(!args.includes('--selection')||!args.includes('--output'))throw new Error('Нужны --selection рецепт.json --output пакет.json; необязательно --images квитанции.json')
    const read=async p=>JSON.parse(await readFile(inside(PROJECT_ROOT,p),'utf8'))
    const selection=await read(arg('--selection'))
    const batch=prepareResearchBatch(await read('data/research/catalog-candidates.json'),selection,{taxonomyEvidence:await read(selection.taxonomyEvidenceFile),imageEvidence:args.includes('--images')?await read(arg('--images')):{receipts:[]}})
    const output=inside(PROJECT_ROOT,arg('--output'));await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(batch,null,2)+'\n')
    console.log(`Пакет подготовлен: ${batch.records.filter(r=>r.species).length} записей, ${batch.records.filter(r=>!r.species).length} отложенных. Каталог не изменён.`)
    for(const r of batch.records.filter(r=>!r.species))console.log(`${r.candidateId}: ${r.deferredReason}`)
  }catch(error){console.error(error.message);process.exitCode=1}
}
