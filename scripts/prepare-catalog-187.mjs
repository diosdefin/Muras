// Reproduce task 25.9 private drafts/registry from frozen evidence. Never import or approve.
import fs from 'node:fs'
import assert from 'node:assert/strict'
import {createRegistry,digest,fingerprint} from './lib/research-pipeline.mjs'
import {taxonNameKey} from './lib/bulk-import.mjs'
import {validateSpecies} from '../src/data/species-model.js'
import {UNKNOWN_POPULATION} from '../src/data/population.js'
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),sha=p=>digest(fs.readFileSync(p))
const verify=process.argv.includes('--verify'),registryPath='data/research/catalog-187-content-registry.json'
const strip=r=>({...r,candidates:r.candidates.map(({state,approval,diagnostics,checkedFingerprint,...c})=>c)})
const save=(p,v)=>{if(verify)assert.deepEqual(p===registryPath?strip(read(p)):read(p),p===registryPath?strip(v):v,p);else fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n')}
if(!verify&&fs.existsSync(registryPath))throw Error('Frozen registry exists; use --verify to reproduce without writes')
const decisionPath='data/research/catalog-200-final-taxonomy-review.json',decisions=read(decisionPath),selected=decisions.decisions.filter(d=>d.status==='READY')
const factsPath='data/research/catalog-187-content/facts.json',facts=read(factsPath)
const taxonomyPath='docs/evidence/catalog-187-taxonomy.json',taxonomy=read(taxonomyPath)
const nationalPath='docs/evidence/catalog-187-national-accounts.json',national=read(nationalPath)
const images=read('docs/evidence/catalog-187-images.json')
const recent=read('docs/evidence/catalog-200-final-sources.json'),prior=read('docs/evidence/catalog-200-conflict-sources.json')
const source=read('data/species.source.json')
assert.equal(source.catalog.length,178);assert.equal(source.demoArchive.length,2)
assert.equal(selected.length,9);assert.deepEqual(facts.records.map(f=>f.id),selected.map(c=>c.id))
const langs=ru=>({ky:null,uz:null,ru,en:null}),section=(text,sourceIds)=>text?{text:langs(text),sourceIds}:null
const rankKeys=['kingdom','phylum','class','order','family','genus']
const materialPaths=[decisionPath,'docs/evidence/catalog-200-final-sources.json','docs/evidence/catalog-200-conflict-sources.json',factsPath,taxonomyPath,nationalPath,'docs/evidence/catalog-187-images.json','docs/evidence/catalog-187-photo-search.json','docs/evidence/catalog-187-baseline.json']
const materials=materialPaths.map(path=>({path,sha256:sha(path)})),candidates=[]
for(const d of selected){
 const f=facts.records.find(f=>f.id===d.id),a=national.records.find(a=>a.candidateId===d.id)
 const key=taxonomy.selectedGbifKeys[d.id],entry=taxonomy.requests.find(t=>t.key===key),record=entry?.data
 const good=entry?.httpStatus===200&&record?.taxonomicStatus==='ACCEPTED'&&record.rank===d.acceptedRank&&taxonNameKey(record.canonicalName)===taxonNameKey(d.acceptedScientificName)
 if(key)assert.ok(good,d.id+' real accepted exact taxon')
 const ranks=good?Object.fromEntries(rankKeys.map(k=>[k,record[k]||null])):{kingdom:'Animalia',phylum:'Arthropoda',class:'Insecta',order:f.order,family:f.family,genus:f.genus}
 const statusText=a.statusLines.find(x=>x.page===a.pages.at(-1)).lines.find(t=>t.startsWith('Статус'))||a.statusLines.flatMap(x=>x.lines)[0]
 const n={listed:true,category:f.category,edition:'Красная книга Кыргызской Республики, 2-е издание 2006 (исторический национальный очерк '+d.historicalScientificName+', с.'+a.pages.join('–')+'); '+statusText,year:2006,sourceIds:['national-book']}
 const bioFields=['overview','shortDescription','ecology','reproduction','distribution',...(f.appearance?['appearance']:[]),...(f.diet?['diet']:[])]
 const supported=['nationalRedBook.listed','nationalRedBook.category','nationalRedBook.edition','nationalRedBook.year','group','regions.0','originalScientificName','names.ru','habitat',...bioFields.map(k=>'content.'+k),...f.threats.map((_,i)=>'threats.'+i),...f.conservation.map((_,i)=>'conservationMeasures.'+i)]
 if(f.ky!==d.acceptedScientificName)supported.push('names.ky')
 if(f.en!==d.acceptedScientificName&&d.id!=='cuon-alpinus')supported.push('names.en')
 const sources=[{id:'national-book',title:'Красная книга Кыргызской Республики, 2-е издание, 2006; '+d.historicalScientificName+', с.'+a.pages.join('–'),publisher:'ГАОСЛХ при Правительстве КР; НАН КР',url:a.urls.at(-1),accessedAt:'2026-10-28',language:'ru',supports:supported,notes:'Исторические сведения местного очерка. Названия KY проверены по первоисточнику, краткие описания KY/UZ/EN — редакционные переводы, не цитаты. Современное присутствие и правовой статус не заявлены.'}]
 const scientificSources=[]
 for(const id of d.taxonomySourceIds.filter(id=>id!=='gbif-fresh')){
  const s=id.startsWith('previous:')?prior.sources.find(s=>'previous:'+s.id===id):recent.sources.find(s=>s.id===id)
  assert(s,'Missing scientific source '+id)
  const sid=id.replace('previous:','previous-');scientificSources.push(sid)
  const supports=['scientificName','content.overview','content.shortDescription']
  if(d.id==='cuon-alpinus'&&['cuon-2022','genbank-cuon'].includes(id))supports.push('content.distribution')
  if(d.id==='cuon-alpinus'&&id==='cuon-2022')supports.push('names.en','conservationMeasures.0')
  sources.push({id:sid,title:s.title,publisher:'Издатель / научное учреждение указан в библиографическом названии и первоисточнике',url:s.url,accessedAt:s.accessedOn||'2026-10-28',language:'en',supports,notes:(s.locator||'Именная обработка')+'; '+(s.accessMethod||'переиспользованный научный источник')+'. Пределы чтения и доступа сохранены в отчёте №25.8; непрочитанный оригинал не объявлен проверенным заново.'})
 }
 let t=null
 if(good){
  const dataset=taxonomy.requests.find(t=>t.datasetKey===record.datasetKey&&!t.key)?.data;assert(dataset?.title)
  const s={id:'gbif-taxonomy',title:dataset.title+': '+record.scientificName+'; exact '+record.rank,publisher:'GBIF / '+dataset.title,url:entry.url,accessedAt:'2026-10-28',language:'en',taxonId:'gbif:'+record.key,supports:['scientificName','names.uz','content.overview',...rankKeys.filter(k=>ranks[k]).map(k=>'taxonomy.'+k)],notes:'Реальная принятая запись указанного dataset. EXACT — локальная строгая проверка canonicalName/rank, не вымышленный API match. nubKey/parentKey не подставлены. Issues: '+(record.issues||[]).join(', ')}
  if(f.ky===d.acceptedScientificName)s.supports.push('names.ky')
  if(f.en===d.acceptedScientificName)s.supports.push('names.en')
  sources.push(s);t={canonicalName:record.canonicalName,rank:record.rank,status:'ACCEPTED',matchType:'EXACT',taxonId:s.taxonId,sourceId:s.id}
 }else{
  const naming=sources.find(s=>scientificSources.includes(s.id));assert(naming)
  naming.supports.push('names.uz',...rankKeys.map(k=>'taxonomy.'+k))
  if(f.ky===d.acceptedScientificName)naming.supports.push('names.ky')
  if(f.en===d.acceptedScientificName)naming.supports.push('names.en')
 }
 const scope='Национальная категория относится к местной исторической единице охраны, описанной в 2006 году. Она не является глобальной оценкой всего принятого таксона, современной категорией IUCN или проверенным правовым статусом 2026 года. Современная национальная численность остаётся неизвестной; независимая научная проверка ожидается.'
 const overview=[f.intro,[f.appearance,f.habitat,f.ecology].filter(Boolean).join(' '),[f.diet,f.reproduction].filter(Boolean).join(' '),f.distribution,[...f.threats,...f.conservation].join(' '),scope].filter(Boolean).join('\n\n')
 assert(overview.split(/\s+/u).length>=150,d.id+' overview')
 const image=images.receipts.find(x=>x.candidateId===d.id)?.image
 if(image)sources.push({id:'photo-commons',title:'Cuon alpinus в неволе, 2010; Hans Hillewaert',publisher:'Wikimedia Commons; Hans Hillewaert',url:image.originalPage,accessedAt:'2026-10-28',language:'en',supports:['images.0.caption'],notes:'Лицензия и определение конкретного файла проверены; зарубежное животное в неволе не подтверждает национальную встречаемость.'})
 const draft={id:d.id,scientificName:d.acceptedScientificName,names:{ru:f.ru,ky:f.ky,uz:d.acceptedScientificName,en:f.en},taxonomy:ranks,group:d.group,nationalRedBook:n,iucn:{category:null,year:null,sourceIds:[]},habitat:{description:langs(f.habitat),sourceIds:['national-book']},regions:[{code:'KG',type:'country',names:{ru:'Кыргызстан',ky:'Кыргызстан',uz:'Qirgʻiziston',en:'Kyrgyzstan'},sourceIds:['national-book']}],threats:f.threats.length?f.threats.map(x=>({text:langs(x),sourceIds:['national-book']})):null,conservationMeasures:f.conservation.map(x=>({text:langs(x),sourceIds:d.id==='cuon-alpinus'?['national-book','cuon-2022']:['national-book']})),population:structuredClone(UNKNOWN_POPULATION),images:image?[image]:[],sources,verified:false,lastReviewedAt:null,content:{shortDescription:{text:f.short,sourceIds:['national-book',d.id==='cuon-alpinus'?'cuon-2022':scientificSources[0]]},overview:section(overview,['national-book',...scientificSources,...(good?['gbif-taxonomy']:[])]),appearance:section(f.appearance,['national-book']),ecology:section(f.ecology,['national-book']),diet:section(f.diet,['national-book']),reproduction:section(f.reproduction,['national-book']),distribution:section(f.distribution,['national-book',...(d.id==='cuon-alpinus'?['cuon-2022','genbank-cuon']:[])])}}
 assert.deepEqual(validateSpecies([draft]),[],d.id)
 const draftFile='data/research/catalog-187-content/drafts/'+d.id+'.json';save(draftFile,draft)
 const blocker=good?null:f.blocker||'Нет допустимого точного принятого GBIF нужного ранга; альтернативный namespace не поддерживается существующей моделью. Научная идентичность не отвергается.'
 candidates.push({id:d.id,originalScientificName:d.historicalScientificName,acceptedScientificName:d.acceptedScientificName,rank:d.acceptedRank,group:d.group,nationalRedBook:{...n,basis:'historical_edition',claimsCurrentLegalStatus:false},countryOccurrence:{countryCode:'KG',confirmed:true,basis:'historical_national_account',sourceYear:2006,currentPresenceConfirmed:null,sourceIds:['national-book']},taxonomyEvidence:t,taxonomySourceIds:[...(good?['gbif-taxonomy']:[]),...scientificSources],sources,contradictions:[],missingData:blocker?[blocker]:[],materials,draftFile,verified:false,lastReviewedAt:null,scientificReviewStatus:'pending',independentScientificReview:'pending',upstreamScientificStatus:'READY',blockerType:blocker?'exact_identifier_unsupported':null,sourceDecision:{file:decisionPath,sha256:sha(decisionPath),id:d.id,originalStatus:'READY',acceptedName:d.acceptedScientificName,rank:d.acceptedRank},nationalConfirmation:a,authorship:{value:f.author,sourceIds:good&&record.authorship?['gbif-taxonomy']:scientificSources},namePolicy:{ru:'historical_national_heading_or_explicit_historical_scope',ky:f.ky===d.acceptedScientificName?'exact_scientific_name_fallback_no_new_vernacular':'visually_checked_book_heading',uz:'exact_accepted_scientific_name_fallback_no_invented_vernacular',en:f.en===d.acceptedScientificName?'scientific_name_fallback':d.id==='cuon-alpinus'?'confirmed_primary_paper_common_name':'historical_book_heading'},contentLanguage:{shortDescriptions:['ky','uz','ru','en'],longSections:'ru',otherLongLanguages:null},editorialNotes:f.notes||[],preparation:{date:'2026-10-28',draftSha256:sha(draftFile),draftSemanticFingerprint:fingerprint(draft)},approval:null})
}
const registry=createRegistry(candidates,{registryId:'catalog-187-content',batchSize:3})
registry.sourceCommit=read('docs/evidence/catalog-187-baseline.json').sourceCommit
registry.sourceDecisionSha256=sha(decisionPath);registry.scientificApproval=null;registry.ownerAuthorization=null;registry.publicationAllowed=false
save(registryPath,registry)
console.log(JSON.stringify({drafts:9,expectedTechnicallyReady:candidates.filter(c=>c.taxonomyEvidence).length,held:candidates.filter(c=>!c.taxonomyEvidence).map(c=>c.id),verified:false,scientificReviewStatus:'pending',catalogChanged:false}))
