// Author only the task-25.5 research packet. No approval/import/public-catalog writes.
import fs from 'node:fs'
import assert from 'node:assert/strict'
import { createRegistry, digest, fingerprint } from './lib/research-pipeline.mjs'
import { taxonNameKey } from './lib/bulk-import.mjs'
import { validateSpecies } from '../src/data/species-model.js'
import { UNKNOWN_POPULATION } from '../src/data/population.js'
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'))
const verify=process.argv.includes('--verify')
const researchOnly=r=>({...r,candidates:r.candidates.map(({state,diagnostics,checkedFingerprint,...c})=>c)})
const save=(p,v)=>{
 if(verify){
  const actual=read(p)
  assert.deepEqual(p===registryPath?researchOnly(actual):actual,p===registryPath?researchOnly(v):v,`Reproduction differs: ${p}`)
 }else fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n')
}
const sha=p=>digest(fs.readFileSync(p))
const registryPath='data/research/catalog-181-content-registry.json'
if(!verify&&fs.existsSync(registryPath))throw Error('Registry exists; refusing to overwrite fingerprinted research. Use --verify for a read-only reproduction.')
const decisions=read('data/research/catalog-200-conflict-resolution.json')
const selected=decisions.decisions.filter(d=>d.status==='READY')
const facts=read('data/research/catalog-181-content/facts.json')
const taxonomy=read('docs/evidence/catalog-181-taxonomy.json')
const sourceIndex=read('docs/evidence/catalog-200-conflict-sources.json')
const images=read('docs/evidence/catalog-181-images.json')
const nationalAccountsPath='docs/evidence/catalog-181-national-accounts.json'
const existingAccounts=fs.existsSync(nationalAccountsPath)?read(nationalAccountsPath):null
const pages=existingAccounts?null:read('.generated/catalog-181/accounts.json')
assert.equal(selected.length,15)
assert.deepEqual(facts.records.map(f=>f.id),selected.map(c=>c.id))
assert.equal(read('data/species.source.json').catalog.length,166)
const lang=ru=>({ky:null,uz:null,ru,en:null})
const section=(text,sourceIds)=>text?{text:lang(text),sourceIds}:null
const rankFields=['kingdom','phylum','class','order','family','genus']
const publisher=id=>id.startsWith('powo')||id.startsWith('ipni')?'Royal Botanic Gardens, Kew':id.startsWith('grin')?'USDA ARS GRIN; AAFC':id.startsWith('wasp')?'Iziko South African Museum / WaspWeb':id.startsWith('eschmeyer')?'California Academy of Sciences':id.startsWith('rdb')?'The Reptile Database':id.startsWith('osme')?'Ornithological Society of the Middle East, the Caucasus and Central Asia':id.startsWith('itis')?'Integrated Taxonomic Information System':id.startsWith('msu')?'Зоологический музей МГУ':id.startsWith('mdd')?'American Society of Mammalogists / Mammal Diversity Database':id==='papilio-2025'?'Biological Journal of the Linnean Society / Oxford University Press':id==='odonata-2024'?'Insects / MDPI':id==='cervus-2018'?'Contributions to Zoology / Brill':'Научный источник; издатель указан по ссылке'
const accounts=existingAccounts?.records??selected.map(d=>{
 const f=facts.records.find(f=>f.id===d.id),p=pages.find(p=>p.id===d.id)
 return {candidateId:d.id,originalScientificName:d.historicalScientificName,pages:d.nationalSources.bookPages,bookYear:2006,bookPdfSha256:sourceIndex.primaryPdfs.find(x=>x.id==='book-2006').sha256,urls:d.nationalSources.bookPages.map(n=>`https://macrolepidoptera.ru/lnk/282.pdf#page=${n}`),originalTextSha256:p.texts.map(t=>({page:t.page,sha256:digest(t.text)})),historicalCategoryLines:p.texts.map(t=>({page:t.page,lines:t.text.match(/(?:Статус[уы]?|Status)[^\n]{0,190}/g)?.slice(0,3)??[]})),literalKyrgyzHeading:f.id==='cervus-elaphus-asiaticus'?'Бугу (эркеги), Марал (ургаачысы)':f.ky,kyrgyzHeadingVisuallyRead:true,selectedKyrgyzName:f.ky,kyrgyzScientificNameFallback:f.ky===d.acceptedScientificName,modernPresenceConfirmed:null,decreeReferencesPreservedSeparately:d.nationalSources.references.filter(r=>r.sourceId==='decree-170-2009'),decreeNotUsedToOverrideBookConcept:true}
})
save('docs/evidence/catalog-181-national-accounts.json',{schemaVersion:1,source:'Красная книга Кыргызской Республики, 2-е издание, 2006',records:accounts,fullBookTextNotDuplicated:true,scientificReviewStatus:'pending'})
const materialPaths=['data/research/catalog-200-conflict-resolution.json','docs/evidence/catalog-200-conflict-sources.json','docs/evidence/catalog-181-taxonomy.json','docs/evidence/catalog-181-taxonomy-search.json','docs/evidence/catalog-181-national-accounts.json','docs/evidence/catalog-181-images.json','docs/evidence/catalog-181-photo-search.json','docs/evidence/catalog-181-baseline.json','data/research/catalog-181-content/facts.json']
const materials=materialPaths.map(path=>({path,sha256:sha(path)}))
if(!verify)fs.mkdirSync('data/research/catalog-181-content/drafts',{recursive:true})
const candidates=[]
for(const d of selected){
 const f=facts.records.find(f=>f.id===d.id),a=accounts.find(a=>a.candidateId===d.id),record=taxonomy.records.find(x=>x.candidateId===d.id)
 const good=record&&record.httpStatus===200&&record.data.taxonomicStatus==='ACCEPTED'&&record.data.rank===d.acceptedRank&&taxonNameKey(record.data.canonicalName)===taxonNameKey(d.acceptedScientificName)
 if(!f.blocker)assert.ok(good,`${d.id}: real accepted taxon evidence missing`)
 const ranks=good?Object.fromEntries(rankFields.map(k=>[k,record.data[k]??null])):{kingdom:'Animalia',phylum:'Arthropoda',class:'Insecta',order:f.order,family:f.family,genus:f.genus}
 const national={listed:true,category:f.category,edition:`Красная книга Кыргызской Республики, 2-е издание 2006 (исторический национальный очерк ${d.historicalScientificName}, с.${a.pages.join('–')}); ${a.historicalCategoryLines[1].lines[0]?.split(/[.。]/)[0]??'историческая категория'}`,year:2006,sourceIds:['national-book']}
 const supports=['nationalRedBook.listed','nationalRedBook.category','nationalRedBook.edition','nationalRedBook.year','group','regions.0','originalScientificName','names.ru','habitat',...['shortDescription','overview','ecology','reproduction','distribution','diet'].map(k=>`content.${k}`),...f.threats.map((_,i)=>`threats.${i}`),...f.conservation.map((_,i)=>`conservationMeasures.${i}`)]
 if(f.appearance&&d.id!=='otonycteris-hemprichi')supports.push('content.appearance')
 const sources=[{id:'national-book',title:`Красная книга Кыргызской Республики, 2006; ${d.historicalScientificName}, с.${a.pages.join('–')}`,publisher:'ГАОСЛХ при Правительстве КР; НАН КР',url:a.urls[1],accessedAt:'2026-10-22',language:'ru',supports,notes:'Использована сохранённая исходная книга; редакционные переводы кратких описаний KY/UZ/EN не являются цитатами. Исторический очерк не подтверждает текущее присутствие.'}]
 if(f.ky!==d.acceptedScientificName)sources.push({id:'national-ky',title:`Кыргыз Республикасынын Кызыл китеби, ${a.pages[0]}-бет; проверенный кыргызский заголовок`,publisher:'ГАОСЛХ при Правительстве КР; НАН КР',url:a.urls[0],accessedAt:'2026-10-22',language:'ky',supports:['names.ky']})
 for(const id of d.evidenceSourceIds){
  const s=sourceIndex.sources.find(s=>s.id===id);assert.ok(s)
  sources.push({id,title:s.title,publisher:publisher(id),url:s.url,accessedAt:s.accessedOn,language:'en',supports:['scientificName','content.overview'],notes:`${s.locator}; переиспользованы доказательства №25.4 (${s.accessMethod}). Полный текст недоступного источника не объявлен заново прочитанным.`})
 }
 if(d.id==='otonycteris-hemprichi')sources.find(s=>s.id==='msu-otonycteris').supports.push('content.appearance')
 if(d.id==='sonjagaster-coronatus')sources.find(s=>s.id==='odonata-2024').supports.push('content.distribution')
 if(d.id==='terpsiphone-paradisi')sources.find(s=>s.id==='osme-terpsiphone').supports.push('content.distribution')
 let taxon=null
 if(good){
  const dataset=taxonomy.datasets.find(x=>x.key===record.data.datasetKey)
  const s={id:'gbif-taxonomy',title:`${dataset.data.title}: ${record.data.scientificName}; exact ${record.data.rank}`,publisher:`GBIF / ${dataset.data.title}`,url:record.url,accessedAt:'2026-10-22',language:'en',taxonId:`gbif:${record.data.key}`,supports:['scientificName','names.uz','content.overview',...rankFields.filter(k=>ranks[k]).map(k=>`taxonomy.${k}`)],notes:'Источник — реальная запись указанного чек-листа. EXACT означает локальную строгую проверку canonicalName и rank; не вымышленный ответ API match. nubKey другого ранга не подставлен.'}
  if(f.ky===d.acceptedScientificName)s.supports.push('names.ky')
  sources.push(s)
  taxon={canonicalName:record.data.canonicalName,rank:record.data.rank,status:'ACCEPTED',matchType:'EXACT',taxonId:s.taxonId,sourceId:s.id}
 }else{
  const naming=sources.find(s=>s.id!=='national-book'&&s.id!=='national-ky');naming.supports.push('names.uz',...rankFields.map(k=>`taxonomy.${k}`))
 }
 const modernEn=['eryx-tataricus','cervus-elaphus-asiaticus','allactaga-saltator'].includes(d.id)
 const enSource=modernEn?sources.find(s=>s.id===({ 'eryx-tataricus':'rdb-eryx','cervus-elaphus-asiaticus':'mdd-cervus','allactaga-saltator':'mdd-jerboa'}[d.id])):sources[0]
 if(f.en===d.acceptedScientificName)(sources.find(s=>s.id==='gbif-taxonomy')??sources.find(s=>s.supports.includes('scientificName'))).supports.push('names.en')
 else enSource.supports.push('names.en')
 sources.find(s=>s.id===d.evidenceSourceIds[0]).supports.push('content.shortDescription')
 const scope=`Национальная ${f.category??'буквально сохранённая в издании'} категория относится к историческому очерку 2006 года и названной местной единице охраны. Она не является глобальной оценкой всего современного таксона или проверенным действующим правовым статусом. Современная численность неизвестна; независимая научная проверка ожидается.`
 const overview=[f.intro,[f.appearance,f.habitat,f.ecology].filter(Boolean).join(' '),[f.diet,f.reproduction].filter(Boolean).join(' '),f.distribution,[...f.threats,...f.conservation].join(' '),scope].filter(Boolean).join('\n\n')
 const overviewSources=['national-book',...d.evidenceSourceIds,...(good?['gbif-taxonomy']:[])]
 const image=images.receipts.find(r=>r.candidateId===d.id)?.image
 if(image)sources.push({id:'photo-commons',title:`${images.receipts.find(r=>r.candidateId===d.id).documentedSubject}; ${image.author}`,publisher:'Wikimedia Commons; автор указан в атрибуции',url:image.originalPage,accessedAt:'2026-10-22',language:null,supports:['images.0.caption'],notes:'Лицензия конкретного файла и исходное определение проверены; зарубежный снимок не подтверждает национальное включение.'})
 const draft={id:d.id,scientificName:d.acceptedScientificName,names:{ru:f.ru,ky:f.ky,uz:d.acceptedScientificName,en:f.en},taxonomy:ranks,group:d.group,nationalRedBook:national,iucn:{category:null,year:null,sourceIds:[]},habitat:{description:lang(f.habitat),sourceIds:['national-book']},regions:[{code:'KG',type:'country',names:{ru:'Кыргызстан',ky:'Кыргызстан',uz:'Qirgʻiziston',en:'Kyrgyzstan'},sourceIds:['national-book']}],threats:f.threats.length?f.threats.map(t=>({text:lang(t),sourceIds:['national-book']})):null,conservationMeasures:f.conservation.map(t=>({text:lang(t),sourceIds:['national-book']})),population:structuredClone(UNKNOWN_POPULATION),images:image?[image]:[],sources,verified:false,lastReviewedAt:null,content:{shortDescription:{text:f.short,sourceIds:['national-book',d.evidenceSourceIds[0]]},overview:section(overview,overviewSources),appearance:section(f.appearance,[d.id==='otonycteris-hemprichi'?'msu-otonycteris':'national-book']),ecology:section(f.ecology,['national-book']),diet:section(f.diet,['national-book']),reproduction:section(f.reproduction,['national-book']),distribution:section(f.distribution,['national-book',...(d.id==='sonjagaster-coronatus'?['odonata-2024']:d.id==='terpsiphone-paradisi'?['osme-terpsiphone']:[])])}}
 const errors=validateSpecies([draft]);assert.deepEqual(errors,[],d.id)
 const draftFile=`data/research/catalog-181-content/drafts/${d.id}.json`;save(draftFile,draft)
 candidates.push({id:d.id,originalScientificName:d.historicalScientificName,acceptedScientificName:d.acceptedScientificName,rank:d.acceptedRank,group:d.group,nationalRedBook:{...national,basis:'historical_edition',claimsCurrentLegalStatus:false},countryOccurrence:{countryCode:'KG',confirmed:true,basis:'historical_national_account',sourceYear:2006,currentPresenceConfirmed:null,sourceIds:['national-book']},taxonomyEvidence:taxon,taxonomySourceIds:good?['gbif-taxonomy',...d.evidenceSourceIds]:d.evidenceSourceIds,sources,contradictions:f.blocker?[f.blocker]:[],missingData:[],materials,draftFile,verified:false,lastReviewedAt:null,scientificReviewStatus:'pending',independentScientificReview:'pending',sourceDecision:{file:'data/research/catalog-200-conflict-resolution.json',sha256:sha('data/research/catalog-200-conflict-resolution.json'),id:d.id,originalStatus:'READY',acceptedName:d.acceptedScientificName,rank:d.acceptedRank},nationalConfirmation:a,authorship:{value:good?record.data.authorship||'(J.R.Forster, 1778)':f.author,sourceIds:good&&record.data.authorship?['gbif-taxonomy']:d.evidenceSourceIds},namePolicy:{ky:f.ky===d.acceptedScientificName?'accepted_scientific_name_fallback':'visually_confirmed_historical_book_heading',uz:'accepted_scientific_name_fallback_no_unverified_vernacular',en:f.en===d.acceptedScientificName?'accepted_scientific_name_fallback':modernEn?'confirmed_specialist_source_name':'historical_book_heading'},contentLanguage:{shortDescriptions:['ky','uz','ru','en'],longSections:'ru',otherLongLanguages:null,scientificFallback:'ru, explicitly labelled by existing UI'},editorialNotes:f.notes??[],unknownFacts:['Современная национальная численность и сохранение исторических местонахождений не подтверждены.',...(f.appearance?[]:['Внешность не реконструирована без подходящего описания.'])],preparation:{date:'2026-10-22',draftSha256:sha(draftFile),draftSemanticFingerprint:fingerprint(draft)},approval:null})
}
const registry=createRegistry(candidates,{registryId:'catalog-181-content',batchSize:5})
registry.sourceCommit=read('docs/evidence/catalog-181-baseline.json').sourceCommit
registry.scientificApproval=null;registry.ownerAuthorization=null;registry.publicationAllowed=false
save(registryPath,registry)
console.log(JSON.stringify({drafts:candidates.length,expectedTechnicallyReady:candidates.filter(c=>c.taxonomyEvidence).length,held:candidates.filter(c=>!c.taxonomyEvidence).map(c=>c.id),catalogChanged:false}))
