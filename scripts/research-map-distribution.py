"""Checkpoint/resume preparation for the 184-taxon distribution review.
Reads the existing book and audited taxon crosswalk; never infers an oblast from a map dot.
Usage: python scripts/research-map-distribution.py scan --render; finalize [--publish]
Manual decisions and visual review receipts are versioned inputs, never inferred from dots.
"""
import argparse, hashlib, json, re, os
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
CACHE=ROOT/'.generated/map-184'
BOOK=ROOT/'.generated/research/redbook.pdf'
BOOK_SHA='f517212f7ce12fcf5c30f2cf73edc5a842b3ded15dea232b844fbe7ce2525cf8'
def read(p):return json.loads((ROOT/p).read_text(encoding='utf-8-sig'))
def sha(b):return hashlib.sha256(b).hexdigest()
def atomic(path,data):
 path.parent.mkdir(parents=True,exist_ok=True);tmp=path.with_suffix(path.suffix+'.tmp');tmp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');os.replace(tmp,path)
def scan(render=False):
 if sha(BOOK.read_bytes())!=BOOK_SHA:raise ValueError('Book checksum mismatch')
 source=read('data/species.source.json');catalog=source['catalog']
 if len(catalog)!=184 or len(source['demoArchive'])!=2:raise ValueError('Unexpected catalog')
 inventory=read('data/research/catalog-200-inventory.json');cross={r['catalogId']:r for r in inventory['publishedCrosswalk']}
 accounts=read('data/research/redbook-master-national-lists.json')['lists'][0]['records'];by_page={r['russianAccountPage']:r for r in accounts}
 pages={p['page']:p['text'] for p in read('.generated/research/redbook-pages.json')}
 records=[];private=[]
 for order,item in enumerate(catalog):
  if item['id'] in cross and cross[item['id']]['bookRecords']:
   linked=cross[item['id']]['bookRecords'];account=next(r for r in accounts if r['recordId']==linked[0]['recordId']);basis='existing_audited_inventory_crosswalk'
  else:
   anchors=[int(m.group(1)) for s in item['sources'] if '282.pdf' in s.get('url','') and(m:=re.search(r'#page=(\d+)',s['url']))]
   choices=[by_page[p] for p in anchors if p in by_page]
   if not choices:raise ValueError('No national account: '+item['id'])
   account=choices[0];basis='existing_published_national_source_page';linked=[]
  ky,ru=account['pdfPage'],account['russianAccountPage'];text=pages[ru]
  m=re.search(r'(?:Распространение\s+общее\s+и\s+в\s+стране\s*\.|Ареал[.:])(.+?)(?=\n(?:Места обитания|Места произрастания|Местообит|Численность|Особенности|Лимитирующ|Образ жизни|Биолог|Размнож|Статус|Описание|Условия|Меры |Жизн|Эколог)|\Z)',text,re.S|re.I)
  distribution=m.group(0) if m else text
  # Internal text cache is not included in the research deliverable.
  private.append({'order':order+1,'id':item['id'],'name':item['scientificName'],'historical':account['scientificName'],'group':item['group'],'ky':ky,'ru':ru,'distribution':distribution,'fullText':text})
  records.append({'speciesId':item['id'],'acceptedScientificName':item['scientificName'],'historicalScientificName':account['scientificName'],'group':item['group'],'primarySource':'book-2006','sourcePage':ru,'pairedPage':ky,'nationalRecordId':account['recordId'],'taxonCorrespondenceBasis':basis,'additionalAccountIds':[r['recordId']for r in linked[1:]],'sourceUrl':f'https://macrolepidoptera.ru/lnk/282.pdf#page={ru}','sourceTextSha256':sha(text.encode()),'localityEvidence':[],'oblastIds':[],'evidenceType':'historical-national-account','historicalPeriod':{'classification':'HISTORICAL','publicationYear':2006,'observationYear':None},'confidence':'unresolved','reviewStatus':'not_yet_reviewed','unresolvedQuestions':[],'visualReview':{'page':ky,'status':'pending','mapPointsUsedForAdministrativeInference':False}})
  atomic(CACHE/'checkpoint.json',{'catalogSha256':sha((ROOT/'data/species.source.json').read_bytes()),'bookSha256':BOOK_SHA,'scanned':len(records),'total':184,'lastSpeciesId':item['id']})
 atomic(CACHE/'extracts.json',private)
 registry={'schemaVersion':1,'documentType':'muras-full-regional-distribution-review','task':'27.2','sourceCommit':'b83a48c3b7b362bd6a93661ebb8dcb4415fcce74','checkedAt':'2026-10-28','book':{'url':'https://macrolepidoptera.ru/lnk/282.pdf','sha256':BOOK_SHA,'pages':543,'localCache':'.generated/research/redbook.pdf'},'status':'research_in_progress','records':records}
 draft=CACHE/'scan.json'
 if draft.exists() and read('.generated/map-184/scan.json')!=registry:raise ValueError('Scan changed; investigate instead of overwriting')
 atomic(draft,registry)
 if render:
  import pypdfium2 as pdf
  from PIL import Image,ImageDraw,ImageFont
  document=pdf.PdfDocument(BOOK);font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',15)
  for start in range(0,len(records),24):
   sheet=Image.new('RGB',(1400,1320),'white');draw=ImageDraw.Draw(sheet)
   for j,r in enumerate(records[start:start+24]):
    cache=CACHE/f"map-{r['pairedPage']}.png"
    if not cache.exists():
     page=document[r['pairedPage']-1];im=page.render(scale=1.7).to_pil();w,h=im.size;im=im.crop((int(w*.48),int(h*.115),int(w*.95),int(h*.335)));im.thumbnail((340,174));im.save(cache);page.close()
    im=Image.open(cache);x=(j%4)*350;y=(j//4)*220;sheet.paste(im,(x,y+42));draw.text((x+3,y+2),f"{start+j+1}. {r['speciesId']}",fill='black',font=font);draw.text((x+3,y+21),f"KY {r['pairedPage']} / RU {r['sourcePage']}",fill='black',font=font)
   sheet.save(CACHE/f'maps-{start+1:03}-{min(start+24,184):03}.png')
 print(json.dumps({'scanned':len(records),'bookSha256':BOOK_SHA,'contactSheets':8 if render else None}))

BASE='b83a48c3b7b362bd6a93661ebb8dcb4415fcce74'
REGIONS=['batken','osh','jalal-abad','naryn','issyk-kul','chuy','talas']
DATE='2026-10-28'
INPUT='data/research/map-184/'
CANONICAL='data/geography/occurrences.source.json'
def norm(s):return re.sub(r'[\W_]+','',s.lower().replace('ё','е'))
def finalize(publish=False):
 import subprocess,copy,collections
 import pypdfium2 as pdfium
 def gitjson(path):return json.loads(subprocess.check_output(['git','show',BASE+':'+path],cwd=ROOT))
 catalog=read('data/species.source.json')
 if catalog!=gitjson('data/species.source.json'):raise ValueError('Protected catalog changed')
 if sha(BOOK.read_bytes())!=BOOK_SHA:raise ValueError('Book changed')
 original=gitjson(CANONICAL);payload=copy.deepcopy(original)
 registry=read('.generated/map-184/scan.json');entries={r['speciesId']:r for r in registry['records']}
 taxa={s['id']:s for s in catalog['catalog']}
 links=read(INPUT+'reviewed-links.json')['links'];admin=read(INPUT+'administrative-sources.json')['sources'];secondary=read(INPUT+'secondary-review.json')
 if len(entries)!=184:raise ValueError('Incomplete scan')
 visual=read(INPUT+'visual-review.json')
 if visual['bookSha256']!=BOOK_SHA or len(visual['maps'])!=184:raise ValueError('Visual review receipt mismatch')
 document=pdfium.PdfDocument(str(BOOK));texts={}
 for r in entries.values():
  page=document[r['sourcePage']-1];tp=page.get_textpage();text=tp.get_text_range();tp.close();page.close();texts[r['speciesId']]=text
  r['directPdfTextSha256']=sha(text.encode())
  image=CACHE/f"map-{r['pairedPage']}.png"
  if not image.exists() or sha(image.read_bytes())!=visual['maps'].get(str(r['pairedPage'])):raise ValueError('Reviewed map changed or missing')
  r['visualReview'].update(status='inspected',checkedAt=DATE,mapImageSha256=sha(image.read_bytes()),conclusion='Схематическая карта проверена; точки без административных границ не использованы для определения области.')
 document.close()
 sourceIds={s['id'] for s in payload['sources']};pairs={(r['speciesId'],r['regionId']) for r in payload['records']}
 new=[];corroborations=[]
 def source(s):
  if s['id'] not in sourceIds:payload['sources'].append(s);sourceIds.add(s['id'])
 def admit(record,proof):
  sid=record['speciesId'];key=(sid,record['regionId']);proof.update(speciesId=sid,regionId=record['regionId'],reviewStatus='documented_pending_review')
  entries[sid]['localityEvidence'].append(proof)
  if key in pairs:corroborations.append(proof);return
  pairs.add(key);payload['records'].append(record);new.append(proof)
 def record(sid,region,srcs,evidence,locator,year,period,temporal,refs=None):
  r=dict(speciesId=sid,regionId=region,sourceIds=srcs,evidence=evidence,locator=locator,observationYear=year,observationPeriod=period,temporalContext=temporal,reviewStatus='documented_pending_review',localityPrecision='oblast',precisionLimits='Только область; свидетельство не устанавливает постоянное обитание, современное присутствие или численность.')
  if refs:r.update(administrativeBasis={'type':'documented-locality','sourceIds':refs},evidenceId=f'map-184:{sid}:{region}')
  return r
 for x in links:
  r=entries[x['speciesId']];page=x['sourcePage'];cue=x['localityCue'];refs=x['administrativeSourceIds']
  if page!=r['sourcePage'] or norm(cue) not in norm(texts[x['speciesId']]):raise ValueError('PDF cue mismatch: '+str(x))
  bridge=x.get('taxonomyBridge',{})
  if bridge.get('accountScopeCue') and norm(bridge['accountScopeCue']) not in norm(texts[x['speciesId']]):raise ValueError('Subspecies scope not supported')
  src=f'redbook-2006-regional-{page}'
  source(dict(id=src,title=f"Красная книга Кыргызской Республики, 2006. {r['historicalScientificName']}",url=r['sourceUrl'],year=2006,kind='historical-national-account',locator=f'PDF с. {page}: распространение и существующая охрана; карта с. {r["pairedPage"]}',checkedAt=DATE,speciesId=r['speciesId'],historicalScientificName=r['historicalScientificName'],accountPage=page,pairedPage=r['pairedPage'],bookPdfSha256=BOOK_SHA))
  year=x.get('observationYear');period=str(year) if year else 'Исторический очерк 2006 года; дата конкретного наблюдения не указана.'
  evidence=f"Исторический очерк указывает местность «{cue}»; область сопоставлена по отдельному административному источнику. Это не подтверждение присутствия в 2026 году."
  proof=dict(x,evidenceType='historical-national-account',sourceIds=[src]+refs,sourceUrl=r['sourceUrl'],directPdfTextSha256=r['directPdfTextSha256'],publicationYear=2006)
  admit(record(r['speciesId'],x['regionId'],[src]+refs,evidence,f'PDF с. {page}; административное сопоставление: '+', '.join(refs),year,period,'historical',refs),proof)
 for x in secondary['gbifSearch']['records']:
  ev=x.get('selectedEvidence')
  if not ev:continue
  sid=x['speciesId'];key=ev['occurrenceKey'];src=f'gbif-specimen-{key}';year=int(ev['eventDate'][:4])
  if not any(s.get('taxonId')==ev['acceptedTaxonId'] for s in taxa[sid]['sources']):raise ValueError('Specimen taxon mismatch')
  verbatim=CACHE/'gbif'/f'verbatim-{key}.json'
  if sha(verbatim.read_bytes())!=ev['snapshotSha256']:raise ValueError('Specimen evidence changed')
  source(dict(id=src,title=f"{ev['institutionCode']}. Образец {ev['catalogNumber']}",url=ev['url'],year=None,kind='preserved-specimen',locator='Каталожная запись и исходная административная этикетка издателя',checkedAt=DATE,catalogNumber=ev['catalogNumber'],taxonId=ev['acceptedTaxonId'],scientificName=taxa[sid]['scientificName'],administrativeRegionId=ev['regionId']))
  r=record(sid,ev['regionId'],[src],'Каталогизированный образец из Кыргызстана; область указана издателем. Отдельная находка не устанавливает популяцию.','Каталожная запись: '+ev['institutionCode'],year,ev['eventDate'],'recent' if year>2006 else 'historical')
  if re.fullmatch(r'\d{4}-\d{2}-\d{2}',ev['eventDate']):r['observationDate']=ev['eventDate']
  admit(r,dict(ev,evidenceType='preserved-specimen',sourceIds=[src],observationYear=year,period='RECENT' if year>2006 else 'HISTORICAL'))
 for category in ['monitoring','wetlandSource']:
  block=secondary[category];s=block['source'] if category=='monitoring' else block
  sid=s['id'];src=dict(id=sid,title=s['title'],url=s['url'],year=s.get('publicationYear'),kind='regional-monitoring-report',locator='Основной текст и справка о фауне Беш-Таш' if category=='monitoring' else 'PDF p.1, Son-Kol Lake; most recent RIS information 2010',checkedAt=DATE)
  if s.get('publicationDate'):src['publicationDate']=s['publicationDate']
  if s.get('informationYear'):src['informationYear']=s['informationYear']
  source(src)
  for x in block['records']:
   if x.get('status')=='needs_evidence':
    entries[x['speciesId']]['localityEvidence'].append(dict(x,evidenceType='rejected-rank-mismatch',sourceUrl=s['url'],sourcePage=s.get('page'),reviewStatus='needs_evidence'))
    continue
   refs=x['administrativeSourceIds'];speciesId=x['speciesId']
   evidence='Документированный региональный список фауны; дата отдельного наблюдения неизвестна.' if x['observationYear'] is None else 'Документированная регистрация фотоловушкой в сентябре 2025 года.'
   r=record(speciesId,x['regionId'],[sid]+refs,evidence,x.get('locator','PDF p.1, Son-Kol Lake'),x['observationYear'],x['observationPeriod'],'recent' if x['observationYear'] is not None else 'undated',refs)
   admit(r,dict(x,evidenceType=x.get('evidenceType','published-regional-fauna-list'),sourceIds=[sid]+refs,sourceUrl=s['url'],publicationYear=s.get('publicationYear'),informationYear=s.get('informationYear'),sourceSnapshotSha256=s['snapshotSha256'],period='RECENT' if x['observationYear'] is not None else 'UNDATED_OBSERVATION',sourceTagConflict=s.get('sourceTagConflict')))
 used={i for r in payload['records'] for i in r['sourceIds']}
 regionsByAdmin={'admin-protected':REGIONS,'admin-tourism':REGIONS,'admin-lakes':['naryn','issyk-kul'],'admin-chuy':['chuy'],'admin-naryn':['naryn'],'admin-jalal':['jalal-abad'],'admin-osh':['osh'],'admin-batken':['batken'],'admin-talas':['talas'],'admin-alai':['osh']}
 for s in admin:
  if s['id'] in used:source(dict(id=s['id'],title=s['title'],url=s['url'],year=None,kind='administrative-reference',locator=s['locator'],checkedAt=DATE,administrativeRegionIds=regionsByAdmin[s['id']]))
 for old in original['records']:
  sid=old['speciesId'];year=old['observationYear']
  entries[sid]['localityEvidence'].append(dict(evidenceType='preserved-legacy-link',regionId=old['regionId'],sourceIds=old['sourceIds'],observationYear=year,period='RECENT' if year>2006 else 'HISTORICAL',note='Исходный объект сохранён буквально, включая историческую coarse temporalContext из задачи 27.1; исследовательская классификация дат учитывает фактический год.'))
 search={x['speciesId']:x for x in secondary['gbifSearch']['records']}
 assessments={x['speciesId']:x for x in read(INPUT+'unresolved-assessments.json')['records']}
 for sid,r in entries.items():
  r['oblastIds']=[i for i in REGIONS if (sid,i) in pairs]
  r['reviewStatus']='documented_pending_review' if r['oblastIds'] else 'needs_evidence';r['confidence']='documentary_supported' if r['oblastIds'] else 'unresolved'
  r['historicalPeriod']['additionalPeriods']=sorted({x.get('period','HISTORICAL') for x in r['localityEvidence']})
  if sid in search:r['supplementarySearch']=search[sid]
  r['unresolvedQuestions']=['Независимая научная проверка и актуальное состояние популяции в 2026 году не установлены.']
  r['unresolvedQuestions'].extend(p['reason'] for p in r['localityEvidence'] if p.get('reviewStatus')=='needs_evidence' and p.get('reason'))
  if not r['oblastIds']:
   assessment=assessments[sid]
   if assessment['sourcePage']!=r['sourcePage']:raise ValueError('Unresolved source mismatch')
   r['namedGeography']=assessment['namedGeography'];r['unresolvedQuestions'].append(assessment['reason'])
   r['localityEvidence'].append(dict(evidenceType='reviewed-national-account-not-admitted',sourcePage=r['sourcePage'],directPdfTextSha256=r['directPdfTextSha256'],decision='needs_evidence',reason=assessment['reason'],namedGeography=assessment['namedGeography']))
   r['unresolvedQuestions'].append('Нужна точная местность и независимое административное сопоставление либо каталогизированный образец/надёжное наблюдение.')
  if any(x.get('observationYear') is None for x in r['localityEvidence']):r['unresolvedQuestions'].append('Для части исторических/списочных сведений дата отдельного наблюдения неизвестна; год издания не подставлялся.')
 proposed=CACHE/'proposed-occurrences.json';atomic(proposed,payload)
 code="import{readFileSync}from'node:fs';import{validateRegionalEvidence}from'./src/data/geography/model.js';const d=JSON.parse(readFileSync(process.argv[1])),s=JSON.parse(readFileSync('data/species.source.json')).catalog,e=validateRegionalEvidence(d,s);if(e.length){console.error(JSON.stringify(e));process.exit(1)}"
 subprocess.run([os.environ.get('NODE_BINARY','node'),'--input-type=module','-e',code,str(proposed)],cwd=ROOT,check=True)
 current=read(CANONICAL)
 if current!=original and current!=payload:raise ValueError('Unexpected regional source change')
 if publish:atomic(ROOT/CANONICAL,payload)
 counts=dict(reviewed=184,linksBefore=len(original['records']),linksAfter=len(payload['records']),newLinks=len(new),bookNewLinks=sum(p['evidenceType']=='historical-national-account' for p in new),otherNewLinks=sum(p['evidenceType']!='historical-national-account' for p in new),mappedSpecies=sum(bool(r['oblastIds']) for r in entries.values()),multiOblastSpecies=sum(len(r['oblastIds'])>1 for r in entries.values()),needsEvidence=sum(not r['oblastIds'] for r in entries.values()),byRegion={i:sum(r['regionId']==i for r in payload['records']) for i in REGIONS})
 registry.update(status='completed',publicationApplied=publish or current==payload,independentScientificApproval=None,counts=counts,corroborations=corroborations,newLinkEvidence=new,inputs=[INPUT+f for f in ['reviewed-links.json','administrative-sources.json','secondary-review.json','preservation.json','unresolved-assessments.json','visual-review.json']],limits=['Все 184 схемы визуально просмотрены; точки не геокодированы по предположению.','RECENT обозначает наблюдение/образец после 2006 года с известной датой. Датированные списки с неизвестной датой наблюдения имеют UNDATED_OBSERVATION; присутствие в 2026 году не доказано.','Старые шесть объектов, включая coarse temporalContext, сохранены буквально; более точные временные определения находятся только в исследовательском реестре.','GBIF: ограниченный поиск до 100 образцов на точный таксон; отсутствие результата не доказывает отсутствие вида.','Непрочитанные документы и недоступные PDF не использовались как содержательное доказательство.'],reproducibility={'scan':'python scripts/research-map-distribution.py scan --render','validate':'python scripts/research-map-distribution.py finalize','publish':'python scripts/research-map-distribution.py finalize --publish; npm run data','catalogSha256':sha((ROOT/'data/species.source.json').read_bytes()),'regionalPayloadLfSha256':sha(json.dumps(payload,ensure_ascii=False,indent=2).encode()+b'\n'),'inputLfSha256':{INPUT+f:sha((ROOT/INPUT/f).read_bytes().replace(b'\r\n',b'\n')) for f in ['reviewed-links.json','administrative-sources.json','secondary-review.json','preservation.json','unresolved-assessments.json','visual-review.json']}})
 atomic(ROOT/'data/research/map-184-full-distribution.json',registry)
 atomic(CACHE/'checkpoint.json',dict(status='completed',reviewed=184,publicationApplied=publish or current==payload,counts=counts))
 print(json.dumps(counts,ensure_ascii=False))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('command',choices=['scan','finalize']);p.add_argument('--render',action='store_true');p.add_argument('--publish',action='store_true');a=p.parse_args()
 if a.command=='scan':scan(a.render)
 else:finalize(a.publish)
