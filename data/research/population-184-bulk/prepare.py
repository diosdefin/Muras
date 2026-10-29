"""Task 28.3: prepare a source-documented research packet, never publish data."""
import json,hashlib,copy,re,collections
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
HERE=ROOT/'data/research/population-184-bulk'
CACHE=ROOT/'.generated/population-184-bulk'
def load(p):return json.loads((ROOT/p).read_text(encoding='utf-8-sig'))
def sha(b):return hashlib.sha256(b).hexdigest()
def canon(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def save(p,o):(ROOT/p).write_bytes((json.dumps(o,ensure_ascii=False,indent=2)+'\n').encode())
base=load('data/research/population-184-bulk/baseline.json')
old=load('data/research/population-184-evidence-audit.json')
assert sha((ROOT/'data/research/population-184-evidence-audit.json').read_bytes())=='f6b3dd70922761a38d53e159d81b7a13d185eed8e01ea0980dba1a0358b83e9f'
source=load('data/species.source.json');catalog={s['id']:s for s in source['catalog']}
scan={r['speciesId']:r for r in load('.generated/population-184/scan.json')}
mapdata=load('data/research/population-184-bulk/map-crosswalk.json')
assert len(catalog)==len(scan)==184 and len(source['demoArchive'])==2
sources=copy.deepcopy(old['sources'])
for s in sources:
    s['sourceConfirmationStatus']='DOCUMENT_CONTENT_PREVIOUSLY_CHECKED' if s['access'].startswith(('local_full','web_full','primary')) else 'PARTIAL_OR_ACCESS_LIMITED'
    s['scientificReviewStatus']='pending'
sources.extend([
 dict(id='nr7-2026',title='Kyrgyzstan Seventh National Report, Russian ORT export',url='https://ort.cbd.int/national-reports/nr7/2183E018-5EB6-CF13-E45A-95A7680BA4C5',retrievedUrl='https://cdn.climatepolicyradar.org/navigator/KGZ/2026/kyrgyzstan-7th-national-report-nr7-2026_3e568ecdddf41a70a877f597e51963d5.pdf',publicationYear=2026,publicationYearBasis='Export captured 2026-03-16; first publication day not established',printSnapshotAt='2026-03-16',sha256='c16d081cbc229657e8e3a76e076750b06684ea3cbdf10a8a7f9b7a3a375016e8',pages=[48,49],sourceConfirmationStatus='MIRROR_BYTES_CHECKED_OFFICIAL_REPORT_ANNOUNCEMENT_CORROBORATED',scientificReviewStatus='pending',limitations=['Official ORT endpoint could not be retrieved; archived copy is hashed and visually inspected.','Official MNR announcement corroborates preparation, not byte identity of this export.','The report mentions approved census methods but does not provide taxon-specific protocols or detection corrections.']),
 dict(id='mnr-nr7-announcement',title='Минприроды: подготовлен Седьмой национальный доклад',url='https://mnr.gov.kg/ru/posts/news/kyrgyzstan-zaversil-podgotovku-sedmogo-nacionalnogo-doklada-po-realizacii-konvencii-oon-o-biologiceskom-raznoobrazii',publicationYear=2026,publishedAt='2026-02-27',sourceConfirmationStatus='OFFICIAL_ANNOUNCEMENT_READ',scientificReviewStatus='pending',limitations=['Not a primary numerical census table; no numerical claims copied from this announcement.']),
 dict(id='super-60956',title='Super-Info №1118, 9–15 May 2024: Red Book animals',url='https://www.super.kg/article/show/60956',publicationYear=2024,publicationPeriod={'start':'2024-05-09','end':'2024-05-15'},sourceConfirmationStatus='SECONDARY_ARTICLE_READ_VIA_WEB_LOCAL_DNS_FAILURE',scientificReviewStatus='pending',limitations=['Article says as of 2024, not field year 2024.','Several numbers equal the NR7 2023 column; this cross-check does not rewrite the article.','Common names and missing field protocols limit identification and reliability.','No article images or full text redistributed; source photograph permissions are not inferred.'])])
source_map={s['id']:s for s in sources}
READY_OLD={'slr-national-adults','slr-region-15','slr-region-23','slr-region-46','slr-region-72','slr-region-62','slr-region-50','slr-region-31','book-sarychat','book-marmot-en','book-fergana-bear','book-lonicera-1969','book-lonicera-1973','book-sonkul-geese','book-chatyrkul-geese'}
claims=[];decisions=[]
def format_ru(c):
    unit={'individuals':'особей','adult individuals':'взрослых особей','pairs':'пар','breeding pairs':'гнездящихся пар','shrubs':'кустов','plants of various ages':'растений разных возрастов'}.get(c['unit'],c['unit'])
    if c['type']=='unknown':return None
    if c['type']=='range':return f"{c['min']}–{c['max']} {unit}"
    return ('≈ ' if c['type']=='approximate' else '')+str(c['value'])+' '+unit
for record in old['records']:
 for e in record['estimates']:
    c=copy.deepcopy(e);c['acceptedScientificName']=record['scientificName'];c['sourceName']=c.get('sourceLabel') or (record['historicalScientificName'] if c['sourceId']=='redbook-2006' else record['scientificName'])
    c['origin']='audit-28.2';c['originalEvidenceFingerprint']=sha(canon(e));c['originalAuditCategory']=e['researchCategory']
    c['sourceConfirmationStatus']=source_map[c['sourceId']]['sourceConfirmationStatus']
    c['sourceReadiness']='READY_SOURCE_DOCUMENTED' if c['evidenceId'] in READY_OLD else 'NEEDS_EVIDENCE'
    c['sourceReadinessReason']='Число, территория и полевой год/период определены в прочитанном источнике; методические ограничения сохранены.' if c['sourceReadiness']=='READY_SOURCE_DOCUMENTED' else 'Сохраняется неопределённость даты, охвата, таксона, исходного источника либо открытого числового предела.'
    if c['evidenceId']=='book-ammopiptanthus':c['sourceReadinessReason']='Год 1979 известен, но точные территориальные границы подсчёта в очерке не заданы достаточно явно; первичный протокол нужен.'
    if c['type']=='approximate' and c['value'] is None:
        if c.get('sourceReportedCentralEstimate') is not None:
            interval={'min':c['min'],'max':c['max']};c['value']=c['sourceReportedCentralEstimate'];c['min']=c['max']=None
            if c.get('uncertainty',{}).get('kind')=='confidence_interval':interval['level']=c['uncertainty']['level'];c['confidenceInterval']=interval
            else:c['uncertaintyInterval']=interval
        else:c['type']='range'
    c['scientificReviewStatus']=e['scientificReviewStatus'];c['reviewStatus']=e['reviewStatus'];c['lastReviewedAt']=None;c['verified']=False
    c['displayLabelRu']=format_ru(c)
    decisions.append(dict(evidenceId=e['evidenceId'],originalFingerprint=c['originalEvidenceFingerprint'],sourceReadiness=c['sourceReadiness'],reason=c['sourceReadinessReason'],observationYear=c['year'],observationPeriod=c.get('observationPeriod'),publicationYear=c['publicationYear'],sourceConfirmationStatus=c['sourceConfirmationStatus'],scientificReviewStatus=c['scientificReviewStatus']))
    claims.append(c)
assert len(decisions)==91
# New annual series, taken from inspected rows 1–8. Rows 9–10 are outside the catalogue.
annual=[
 ('argali','Архар Марко Поло',[14545,16125,17616,18219,18092,18005,19129],48,'subtaxon_only'),
 ('argali','Архар тяньшанский',[4060,4509,4688,4459,3020,3136,3328],48,'subtaxon_only'),
 ('argali','Архар Северцова',[55,68,69,95,128,136,141],48,'subtaxon_only'),
 ('cervus-elaphus-asiaticus','Марал',[475,542,567,589,710,689,704],48,'historical_concept_unresolved'),
 ('irbis','Барс',[331,336,386,402,449,459,511],49,'exact_catalogue_species'),
 ('eurasian-lynx','Рысь',[1187,1465,1310,1540,1789,1775,1937],49,'exact_catalogue_species'),
 ('golden-eagle','Беркут',[352,421,476,577,531,548,655],49,'exact_catalogue_species'),
 ('varanus-griseus-caspius','Варан серый',[65,65,57,64,59,69,130],49,'parent_species_not_subspecies')]
new_facts=[]
for row,(sid,name,values,page,match) in enumerate(annual,1):
    for year,value in zip(range(2018,2025),values):
        ready=match=='exact_catalogue_species'
        c=dict(evidenceId=f'nr7-row-{row}-{year}',speciesId=sid,acceptedScientificName=catalog[sid]['scientificName'],scientificName=catalog[sid]['scientificName'],taxonRank=next(r['taxonRank'] for r in old['records'] if r['speciesId']==sid),sourceName=name,sourceId='nr7-2026',sourceUrl=source_map['nr7-2026']['url'],retrievedUrl=source_map['nr7-2026']['retrievedUrl'],sourcePage=f'{page}; national monitoring table row {row}',type='approximate',value=value,min=None,max=None,unit='individuals',territory='Кыргызстан; государственный мониторинг ООПТ и охотничьих угодий',year=year,observationPeriod=None,publicationYear=2026,publicationYearBasis='ORT export captured 2026-03-16; first publication date unknown',method='estimate',methodology='Ежегодные весенние/зимние учёты. На с.49 прямо сказано: годы таблицы — годы учётных работ; зимний учёт 2024 использован в 2025.',taxonMatchStatus=match,sourceReadiness='READY_SOURCE_DOCUMENTED' if ready else 'NEEDS_EVIDENCE',sourceReadinessReason='Сверены строка, столбец года учёта и соответствие принятому виду; независимая проверка отсутствует.' if ready else 'Нельзя переносить данные формы/родительского вида на весь вид/подвид; требуется точное соответствие концепта.',sourceConfirmationStatus=source_map['nr7-2026']['sourceConfirmationStatus'],scientificReviewStatus='pending',reviewStatus='pending',verified=False,lastReviewedAt=None,origin='new-source-28.3',scope='KG',evidenceQuoteOrParaphrase='Годовое значение из таблицы национального доклада; целочисленная запись не доказывает полный точный учёт.',limitations=copy.deepcopy(source_map['nr7-2026']['limitations'])+(['Значение не применимо автоматически ко всему таксону карточки.'] if not ready else []))
        c['displayLabelRu']=format_ru(c);claims.append(c);new_facts.append(c)
# Secondary claims remain secondary, even where the 2023 official column agrees.
news=[('argali','Марко Поло аркары',18005,'subtaxon_only'),('argali','Тянь-Шань аркары',3136,'subtaxon_only'),('argali','Северцев аркары',136,'subtaxon_only'),('cervus-elaphus-asiaticus','Марал',689,'historical_concept_unresolved'),('irbis','Илбирс',459,'exact_catalogue_species'),('eurasian-lynx','Сүлөөсүн',1775,'exact_catalogue_species'),('ursus-arctos','Аюу',612,'catalogue_common_name'),('manul','Мадыл',11,'catalogue_common_name'),('lutra-lutra','Кундуз',17,'catalogue_common_name'),('indian-crested-porcupine','Чүткөр (дикобраз)',355,'catalogue_common_name'),('martes-foina','Суусар',4004,'ambiguous_common_name'),('varanus-griseus-caspius','Эчкемер',69,'parent_species_not_subspecies'),('golden-eagle','Бүркүт',548,'exact_catalogue_species'),('gazella-subgutturosa','Жейрен',44,'introduced_cohort_not_national_wild_population')]
for i,(sid,name,value,match) in enumerate(news,1):
    c=dict(evidenceId=f'super-60956-{i}',speciesId=sid,acceptedScientificName=catalog[sid]['scientificName'],scientificName=catalog[sid]['scientificName'],taxonRank=next(r['taxonRank'] for r in old['records'] if r['speciesId']==sid),sourceName=name,sourceId='super-60956',sourceUrl=source_map['super-60956']['url'],sourcePage='КЫЗЫЛ КИТЕПТЕГИЛЕРДИН УЧУРДАГЫ САНЫ' if sid!='gazella-subgutturosa' else 'СЫРТТАН АЛЫНЫП КЕЛГЕН ЖЕЙРЕНДЕР ЭМНЕ БОЛДУ?',type='approximate',value=value,min=None,max=None,unit='individuals',territory='Кыргызстан (журналистское сообщение)' if sid!='gazella-subgutturosa' else 'Реинтродуцированная группа в Кыргызстане; точная территория/режим содержания не указаны',year=None,observationPeriod=None,reportedReferenceYear=2024,publicationYear=2024,method='estimate',methodology=None,taxonMatchStatus=match,sourceReadiness='NEEDS_EVIDENCE',sourceReadinessReason='As of 2024 не является полевым годом; исходный протокол и точный охват не получены.',sourceConfirmationStatus=source_map['super-60956']['sourceConfirmationStatus'],scientificReviewStatus='pending',reviewStatus='pending',verified=False,lastReviewedAt=None,origin='new-source-28.3',scope='KG',limitations=['Вторичный источник. Поле year остаётся null.','Не присвоен новый GBIF ID; неоднозначное название не означает подтверждённого определения.'])
    agreeing=[a for a in claims if a['sourceId']=='nr7-2026' and a['speciesId']==sid and a['value']==value and a['year']==2023]
    if agreeing:c['consistentWithNR7ObservationYear']=2023;c['dateCrosscheck']='Число совпадает со столбцом 2023; это сопоставление, а не явное указание полевого года в самой статье.'
    if sid=='gazella-subgutturosa':c['introducedIndividualsIn2021']=15;c['limitations'].append('44 не объявлены современной устойчивой дикой популяцией страны; реинтродукция, режим и таксон требуют первичного подтверждения.')
    c['displayLabelRu']=format_ru(c);claims.append(c);new_facts.append(c)
# Never assign the ambiguous vulture word to an arbitrary species.
unmatched=[dict(sourceId='super-60956',sourceName='Жору',value=191,year=None,reportedReferenceYear=2024,reason='Нельзя отличить Aegypius/Gyps и присвоить конкретному ID.'),dict(sourceId='nr7-2026',sourceName='Козерог / Косуля',sourcePage=49,reason='Не входят в текущие 184 таксона; карточки не создавались.')]
# Density and route data remain a separate metric family, ineligible for population pixels.
DENSITIES=[
 ('kaufmanns-tulip',None,None,10,'individuals/m²','местные сообщества',None,'upper_bound'),
 ('eduards-fritillary',None,None,100,'shoots_or_specimens/100m²','локальные агрегации Кыргызстана',None,'upper_bound_genets_not_shoots'),
 ('central-asian-frog',None,400,500,'individuals/ha','Ананьево—Тюп, Кыргызстан',{'startYear':1984,'endYear':1985},'density'),
 ('central-asian-frog',24,None,None,'individuals/ha','Кочкорская долина',None,'density'),
 ('central-asian-frog',6,None,None,'individuals/ha','Джумгальская котловина',None,'density'),
 ('central-asian-frog',17,None,None,'individuals/ha','Чуйская долина',None,'density'),
 ('turkestan-catfish',None,1,4,'individuals/metre_of_river','реки Кыргызстана; точный участок не указан',None,'linear_density'),
 ('christophs-clouded-yellow',None,2,4,'adults/100m²','ненарушенные местообитания, пик лёта',None,'density'),
 ('bearded-vulture',None,0.01,0.4,'individuals/km²','север Кыргызстана',None,'density'),
 ('cinereous-vulture',None,0.02,0.04,'individuals/km²','альпийский пояс Восточного Прииссыккулья',None,'density'),
 ('egyptian-vulture',0.002,None,None,'individuals/km²','Восточное Прииссыккулье',None,'density'),
 ('menzbiers-marmot',None,200,400,'individuals/km²','отдельные участки Чаткальского хребта',{'verbatim':'1960-е годы; точные годы не установлены'},'density'),
 ('menzbiers-marmot',None,None,28,'individuals/km²','Чон-Булак, Беш-Арал',None,'upper_bound'),
 ('menzbiers-marmot',None,23,26,'individuals/km²','другие горные участки; без полного охвата',None,'density'),
 ('falco-naumanni',0.03,None,None,'individuals/km²','еловые леса Иссык-Кульской котловины',None,'density'),
 ('gyps-himalayensis',None,0.1,0.9,'individuals/km²','Тескей Ала-Тоо и Центральный Тянь-Шань',{'verbatim':'конец 1980-х; точные годы не установлены'},'density'),
 ('gyps-fulvus',None,0.5,1,'individuals/km²','Данги Туя-Муюн, Араванский район',{'startYear':1992,'endYear':1992},'density'),
 ('ursus-arctos',None,0.6,0.8,'individuals/1000ha','орехоплодовые леса Чаткальского хребта',{'verbatim':'1970-е годы'},'density'),
 ('martes-foina',None,None,1,'individuals/10km²','Кыргызстан; точный участок не задан',None,'exclusive_upper_bound'),
 ('fumariola-turkestanica',15,None,None,'individuals/100m²','локальные оптимальные местообитания',None,'density'),
 ('aquila-clanga',0.007,None,None,'individuals/km²','еловые леса Восточного Прииссыккулья',None,'density'),
 ('crex-crex',2,None,None,'individuals/km²','прибрежные заросли Иссык-Куля',None,'density'),
 ('crex-crex',3,None,None,'individuals/km²','поля, Кыргызстан',None,'density'),
 ('dendrocopos-leucopterus',None,1,3,'individuals/km²','орехоплодовые леса и сады Ферганского хребта и долины',None,'density'),
 ('sonjagaster-coronatus',3.5,None,None,'adults/ha','пойменный лес Курпсая',None,'density'),
 ('parnassius-loxias-tashkorensis',None,1,3,'adults/1000m²','ненарушенные места исторической концепции подвида',None,'density_taxon_concept_requires_review'),
 ('parnassius-apollo-merzbacheri',None,100,120,'adults/ha','ненарушенные места, пик лёта',None,'density'),
 ('said-alievs-toad-agama',None,6,9,'encounters/hour_on_3km_x_2m_transect','предгорья Тахтобоза',None,'encounter_rate'),
 ('vigorous-ground-beetle',None,3,4,'adults/search_day','точные участки и усилие не заданы',None,'encounter_rate'),
 ('fergana-ground-beetle',None,3,6,'encounters/10km_route_day','точные участки не заданы',None,'encounter_rate'),
 ('european-glass-lizard',None,None,6,'encounters/10km_transect','подходящие биотопы Кыргызстана',None,'route_upper_bound'),
 ('central-asian-tortoise',46,None,None,'encounters/10km_x_10m_transect','Майли-Сай',None,'transect_count'),
 ('vipera-ursinii-renardi',None,None,3,'encounters/20km_x_4m_transect','Кыргызстан',None,'transect_upper_bound'),
 ('eryx-tataricus',None,None,2,'encounters/10km_x_4m_transect','Чуйская долина',None,'transect_upper_bound')]
metrics=[]
for i,(sid,value,lo,hi,unit,territory,period,kind) in enumerate(DENSITIES,1):
 metrics.append(dict(metricId=f'book-metric-{i}',speciesId=sid,acceptedScientificName=catalog[sid]['scientificName'],sourceName=scan[sid]['historicalScientificName'],metricType=kind,value=value,min=lo,max=hi,unit=unit,territory=territory,observationPeriod=period,year=None,publicationYear=2006,sourceId='redbook-2006',sourceUrl=source_map['redbook-2006']['url'],sourcePage=scan[sid]['sourcePage'],notPopulationEstimate=True,eligibleForPixelation=False,scientificReviewStatus='pending',limitations=['Не экстраполировано на всю площадь ареала.','Год публикации не заменяет полевой год; отсутствие даты сохранено.']))
metrics.append(dict(metricId='book-lynx-inverted-density',speciesId='eurasian-lynx',acceptedScientificName=catalog['eurasian-lynx']['scientificName'],metricType='source_numeric_order_conflict',reportedNumericText='0.1–0.02 individuals/1000ha',sourceId='redbook-2006',sourcePage=509,notPopulationEstimate=True,eligibleForPixelation=False,limitations=['Порядок границ в исходнике не исправлен автоматически.']))
# Correct source names for common-name sources rather than fabricating Latin on their behalf.
for c in claims:
 if c['sourceId'] in ('slt-kyrgyzstan','gslep-habitat','cacip-2025','news-24kg-2024'):c['sourceName']='Snow leopard'
 if c['sourceId'] in ('kumtor-jun-2024','kumtor-nov-2024'):c['sourceName']='архар' if c['speciesId']=='argali' else 'снежный барс'
 if c['sourceId']=='stat-sdg':c['sourceName']={'irbis':'снежный барс','marbled-polecat':'перевязка','lutra-lutra':'речная выдра'}[c['speciesId']]
 if c['sourceId']=='irbis-news-511':c['sourceName']='снежный барс'
# Each claim is bound independently; no arbitrary choice of a single competing estimate.
for c in claims:
 c['fingerprint']=sha(canon(c))
records=[]
for prior in old['records']:
 sid=prior['speciesId'];est=[c for c in claims if c['speciesId']==sid];ready=[c for c in est if c['sourceReadiness']=='READY_SOURCE_DOCUMENTED']
 status='READY_SOURCE_DOCUMENTED' if ready else ('NEEDS_EVIDENCE' if est else 'UNKNOWN')
 record=dict(speciesId=sid,acceptedScientificName=catalog[sid]['scientificName'],taxonRank=prior['taxonRank'],group=prior['group'],previousAuditCategory=prior['researchCategory'],researchStatus=status,scientificReviewStatus='pending',verified=False,lastReviewedAt=None,hasImage=bool(catalog[sid]['images']),estimates=est,metrics=[m for m in metrics if m['speciesId']==sid],priorExcludedMetrics=prior['excludedMetrics'],mapCorroborations=[m for m in mapdata['matches'] if m['speciesId']==sid],checks=dict(previousClaimsReassessed=len(prior['estimates']),bookPopulationSectionSHA256=scan[sid]['populationSectionSHA256'],bookSourcePage=scan[sid]['sourcePage'],mapStatus='exact_name_sections_found' if any(m['speciesId']==sid for m in mapdata['matches']) else 'no_exact_population_section_in_32_page_corpus',nationalTableStatus='row_checked' if any(c['sourceId']=='nr7-2026' for c in est) else 'not_in_table_rows_1_to_10',scientificPopulationUnchanged=True),pixelation=dict(currentlyPermitted=False,afterIndependentAndEditorialAdmission=bool(ready and catalog[sid]['images']),placeholder=not bool(catalog[sid]['images'])))
 records.append(record)
ready_claims=[c for c in claims if c['sourceReadiness']=='READY_SOURCE_DOCUMENTED']
previous_ready_ids={c['speciesId'] for c in claims if c['origin']=='audit-28.2' and c['sourceReadiness']=='READY_SOURCE_DOCUMENTED'}
ready_ids={r['speciesId'] for r in records if r['researchStatus']=='READY_SOURCE_DOCUMENTED'}
old_number_ids={r['speciesId'] for r in old['records'] if r['estimates']};new_number_ids={r['speciesId'] for r in records if r['estimates']}
# In-memory existing-model drafts only. These cannot authorize publication or alter the catalogue.
candidates=[]
for c in ready_claims:
 paths=['type','method','territory','year','unit']+(['min','max'] if c['type']=='range' else ['value'])
 ref=dict(id='population-research-'+c['evidenceId'],title=source_map[c['sourceId']]['title'],publisher='Research reference — source documented, MURAS review pending',url=c['sourceUrl'],accessedAt='2026-10-29',supports=['population.'+p for p in paths])
 population=dict(type='approximate' if c['type']=='range' else c['type'],value=c['value'],min=c['min'],max=c['max'],territory=c['territory'],year=c['year'],unit=c['unit'],sourceIds=[ref['id']],reviewStatus='pending',method='estimate')
 candidates.append(dict(speciesId=c['speciesId'],evidenceId=c['evidenceId'],evidenceFingerprint=c['fingerprint'],population=population,sources=[ref],context=dict(observationPeriod=c.get('observationPeriod'),publicationYear=c['publicationYear'],confidenceInterval=c.get('confidenceInterval'),uncertaintyInterval=c.get('uncertaintyInterval'),sourceReadiness=c['sourceReadiness'],scientificReviewStatus='pending'),notForApply=True))
counts=dict(collections.Counter(r['researchStatus'] for r in records))
protection={p:h for p,h in base['hashes'].items() if p.startswith(('data/','public/','assets/','src/')) and p!='data/.gitattributes'}
changed=[p for p,h in protection.items() if not (ROOT/p).exists() or sha((ROOT/p).read_bytes())!=h]
assert not changed,changed
packet=dict(schemaVersion=1,documentType='population-bulk-source-documentation-packet',task='28.3',notForPublication=True,sourceCommit=base['head'],researchedAt='2026-10-29',priorAudit=dict(path='data/research/population-184-evidence-audit.json',sha256=sha((ROOT/'data/research/population-184-evidence-audit.json').read_bytes()),claimsReassessed=91,scientificCategoryCounts={'A':1,'B':23,'C':160}),counts=dict(taxa=184,archive=2,photos=161,placeholders=23,regionalLinks=208,sourceReadiness=counts,totalClaims=len(claims),readyClaims=len(ready_claims),readyTypes=dict(collections.Counter(c['type'] for c in ready_claims)),allClaimTypes=dict(collections.Counter(c['type'] for c in claims)),densityAndRouteMetrics=len(metrics),taxaWithNumericalClaims=len(new_number_ids),previousTaxaWithNumericalClaims=len(old_number_ids),newNumericalLeadIds=sorted(new_number_ids-old_number_ids),baselineUnderSameSourceCriterion=len(previous_ready_ids),newReadyIdsUnderSameCriterion=sorted(ready_ids-previous_ready_ids),readyDeltaAgainstOldScientificA=len(ready_ids)-1,readyDeltaCaveat='READY_SOURCE_DOCUMENTED is broader than old scientific A; delta against A is not newly researched taxa.',potentialPixelationAfterAllAdmissions=sum(r['pixelation']['afterIndependentAndEditorialAdmission'] for r in records),pixelationPermittedNow=0,publishedNow=0,grayscaleOnDemandNow=161),publication=dict(state='BLOCKED_BY_EXISTING_WORKFLOW',applied=False,ownerAuthorization=None,independentScientificApproval=None,reason=['Current populationPresentation displays numeric facts only when reviewStatus=approved.','The owner provisional workflow adds species; existing-ID mutations are rejected.','No existing source-documented-pending population display authorization exists.','A single public population cannot store all alternative estimates, confidence intervals or observation periods.'],requiredFutureModelChanges=['Separate sourceDocumentationStatus from scientificReviewStatus and a fingerprint-bound owner publication decision.','Explicit observationPeriod and publicationYear; preserve year semantics.','Central estimate and confidence/uncertainty interval stored independently.','Read-only display policy for authorized source-documented estimates; independent review stays pending.','Guarded atomic population-patch workflow for existing IDs with immutable taxon/scientific/media fields; no approval invented.','An estimated range accuracy label on KY/UZ/RU/EN without changing the numeric range into a point.']),sources=sources,records=records,unmatchedClaims=unmatched,integrity=dict(baselineHead=base['head'],unchangedPriorTrackedFiles=sum(sha((ROOT/p).read_bytes())==h for p,h in base['hashes'].items()),intentionalPriorFileChanges=[p for p,h in base['hashes'].items() if sha((ROOT/p).read_bytes())!=h],protectedFileCount=len(protection),changedProtectedFiles=changed,protectedManifestSHA256=sha(canon(protection)),sourceCatalogueSHA256=sha((ROOT/'data/species.source.json').read_bytes()),publicCatalogueSHA256=sha((ROOT/'public/data/species.json').read_bytes())),limits=['No new per-species repeat searches; all book checkpoints and 91 prior claims reused.','Map.kg 65 matched sections / 24 taxa do not cover the entire catalogue; 184 primary book accounts do.','CAIAG: no saved species-population dataset located; glacier/human-population metrics are not substituted.','No article/PDF images redistributed or media metadata changed.'])
registry_fp=sha(canon(packet));packet['registryFingerprint']=registry_fp
save('data/research/population-184-bulk-publication.json',packet)
save('data/research/population-184-bulk/reassessment-91.json',dict(sourceCommit=base['head'],decisions=decisions))
save('data/research/population-184-bulk/pending-population-drafts.json',dict(notForApply=True,ownerAuthorization=None,scientificReviewStatus='pending',candidates=candidates))
save('data/research/population-184-bulk/manifest.json',dict(schemaVersion=1,documentType='population-source-documentation-review-manifest',notForApply=True,registry='data/research/population-184-bulk-publication.json',registrySHA256=sha((ROOT/'data/research/population-184-bulk-publication.json').read_bytes()),registryFingerprint=registry_fp,speciesIds=sorted(ready_ids),estimates=[dict(speciesId=c['speciesId'],evidenceId=c['evidenceId'],fingerprint=c['fingerprint']) for c in ready_claims],ownerAuthorization=None,scientificApproval=None,workflowStatus='Existing workflow cannot update these populations or display pending facts.'))
print(json.dumps(packet['counts'],ensure_ascii=False))
print('registryFingerprint',registry_fp,'manifest SHA256',sha((HERE/'manifest.json').read_bytes()))
