import json,hashlib,re,collections,subprocess
from pathlib import Path
from evidence import CLAIMS,SOURCES,EXCLUDED
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'data/research/population-184-evidence-audit.json'
def read(path):return json.loads((ROOT/path).read_text(encoding='utf-8-sig'))
def digest(data):return hashlib.sha256(data).hexdigest()
rows=read('.generated/population-184/scan.json')
searches=read('data/research/population-184/search-log.json')
source_catalogue=read('data/species.source.json')
catalogue={r['id']:r for r in source_catalogue['catalog']}
by_search={sid:r for r in searches for sid in r['speciesIds']}
assert len(rows)==len(catalogue)==len(by_search)==184
for c in CLAIMS:
    c['scientificName']=catalogue[c['speciesId']]['scientificName']
    c['taxonRank']=next(r['taxonRanks'][0] for r in rows if r['speciesId']==c['speciesId'])
    c['reviewStatus']='pending'
    if c.get('boundQualifier'):
        c['reportedNumericRange']={'min':c['min'],'max':c['max'],'qualifier':c.pop('boundQualifier')}
        c['type']='unknown';c['value']=c['min']=c['max']=c['method']=None
    if c['speciesId']=='cervus-elaphus-asiaticus' or c.get('appliesToWholeCatalogTaxon') is False:
        c['taxonMatchStatus']='historical_or_subtaxon_concept_requires_review'
    else:c['taxonMatchStatus']='catalogue_taxon_or_explicit_local_population'
    if c['sourceId']=='slr-2026':c['assessmentReferenceYear']=2024
# All research records are isolated from the production population adapter.
records=[]
for r in rows:
    sid=r['speciesId'];section=r['populationSection'];cs=[c for c in CLAIMS if c['speciesId']==sid]
    category='A' if any(c['researchCategory']=='A' for c in cs) else ('B' if cs else 'C')
    trimmed=re.sub(r'\[[\d, –-]+\]','',section)
    metrics=[]
    if sid in EXCLUDED:
        kind,number,reason=EXCLUDED[sid]
        src='golden-eagle-2023' if sid=='golden-eagle' else ('lonicera-2024' if sid=='lonicera-paradoxa' else ('otter-review-2025' if sid=='lutra-lutra' else 'redbook-2006'))
        if sid=='korzhinskys-pear': src='pear-genetics-2025'
        metrics.append(dict(type=kind,reportedMetric=number,reason=reason,sourceId=src,sourceUrl=SOURCES[src]['url'],sourcePage=(r['sourcePage'] if src=='redbook-2006' else {'golden-eagle-2023':'slides 2–3','lonicera-2024':'446','otter-review-2025':'Kyrgyzstan section','pear-genetics-2025':'abstract'}[src])))
    # Automatic flags route the already-read numerical contexts to explicit exclusion buckets.
    if re.search(r'\d',trimmed) and not metrics and not cs:
        if re.search(r'кв\.?\s*км|м2|м 2|га|транссект|маршрут|экз./м',trimmed,re.I):
            kind,reason='density_or_route_count','Плотность или регистрация на маршруте; нет полного популяционного охвата и протокола.'
        elif re.search(r'стая|стай|пролет|пролёт|пролете|встреч|отмечен|скоплен|селится',trimmed,re.I):
            kind,reason='encounters_or_aggregation','Группы, встречи или сезонные регистрации; не доказанная полная популяция.'
        else:kind,reason='historical_context_or_specimens','Числовой контекст исторических сведений/выборки; пригодная абсолютная оценка не установлена.'
        metrics.append(dict(type=kind,reportedMetric=None,reason=reason,sourceId='redbook-2006',sourceUrl=SOURCES['redbook-2006']['url'],sourcePage=r['sourcePage'],auditBasis='Числовой контекст проверен в исходном очерке; текст и его SHA сохранены в checkpoint.'))
    if sid=='sievers-apple':
        metrics[0]['reportedMetric']='16700 ha (2000)'
        metrics[0]['reason']='Площадь лесов, не число деревьев.'
        metrics.append(dict(type='genetic_sample',reportedMetric='173 trees / 15 populations in four countries',reason='Многострановая генетическая выборка, не национальная численность.',sourceId='apple-genetics-2020',sourceUrl=SOURCES['apple-genetics-2020']['url'],sourcePage='research summary'))
    if sid in ('martes-foina','menzbiers-marmot','cinereous-vulture','gyps-fulvus','gyps-himalayensis'):
        metrics.append(dict(type='unresolved_statistical_group',reportedMetric=None,reason='Строки «куница», «сурок», «гриф» таблицы 4.19 не присвоены конкретному виду без идентификационного основания.',sourceId='stat-environment-2025',sourceUrl=SOURCES['stat-environment-2025']['url'],sourcePage='таблица 4.19'))
    reason=('Есть оценка с описанной методикой для независимого рассмотрения; публикация запрещена.' if category=='A' else ('Численные претензии сохранены отдельно, существенные пробелы перечислены для каждой.' if category=='B' else ('В изученных источниках не установлена пригодная абсолютная оценка численности; '+('числовые показатели исключены по указанным причинам.' if metrics else 'очерк содержит качественную характеристику или сообщает об отсутствии данных.'))))
    record=dict(speciesId=sid,scientificName=r['scientificName'],historicalScientificName=r['historicalScientificName'],taxonRank=r['taxonRanks'][0],group=r['group'],taxonomyEvidence=r['rankEvidence'],taxonIds=sorted(set(s['taxonId'] for s in catalogue[sid]['sources'] if s.get('taxonId'))),researchCategory=category,researchStatus={'A':'READY_FOR_REVIEW','B':'NEEDS_EVIDENCE','C':'NO_RELIABLE_ESTIMATE_FOUND'}[category],scientificReviewStatus='pending',verified=False,lastReviewedAt=None,type='unknown',value=None,min=None,max=None,unit=None,territory=None,year=None,publicationYear=2006,sourceId='redbook-2006',sourceUrl=SOURCES['redbook-2006']['url'],sourcePage=r['sourcePage'],method=None,methodology=None,evidenceQuoteOrParaphrase=reason,limitations=['Категория C означает результат ограниченного документированного поиска, а не доказательство отсутствия всех исследований или нулевой популяции.'] if category=='C' else ['Ни одна оценка не допущена к публичному отображению.'],estimates=cs,excludedMetrics=metrics,checkpoint={k:r[k] for k in ['nationalRecordId','sourcePage','bookSHA256','pageTextSHA256','populationSectionSHA256','scanStatus']},webSearch=dict(batch=by_search[sid]['batch'],query=by_search[sid]['queries'][by_search[sid]['speciesIds'].index(sid)]['q'],receipt='data/research/population-184/search-log.json',coverage='exact accepted catalogue name; pooled search results are leads, not individually validated sources'),reviewedSources=sorted(set(['redbook-2006']+[c['sourceId'] for c in cs]+[m['sourceId'] for m in metrics])))
    records.append(record)
counts=dict(collections.Counter(r['researchCategory'] for r in records))
bookfile=ROOT/'.generated/research/redbook.pdf'
assert digest(bookfile.read_bytes())==SOURCES['redbook-2006']['sha256']
for source in SOURCES.values():
    receipt=source.get('downloadReceipt')
    if receipt and receipt.get('status')=='cached':assert digest((ROOT/receipt['cache']).read_bytes())==receipt['sha256']
base=read('data/research/population-184/baseline.json')
changed=[path for path,expected in base['hashes'].items() if not (ROOT/path).is_file() or digest((ROOT/path).read_bytes())!=expected]
assert not changed,changed
protected={path:h for path,h in base['hashes'].items() if path.startswith(('data/','public/','assets/','src/'))}
manifest_sha=digest(json.dumps(protected,sort_keys=True,separators=(',',':')).encode())
assert len(source_catalogue['demoArchive'])==2
assert all(s['population']['type']=='unknown' and s['population']['reviewStatus']=='pending' and s['verified'] is False for s in source_catalogue['catalog'])
# Review status must never be approved by the research build.
assert all(c['scientificReviewStatus']==c['reviewStatus']=='pending' for c in CLAIMS)
assert all(c['type']!='exact' for c in CLAIMS)
doc=dict(schemaVersion=1,documentType='muras-population-evidence-audit',task='28.2',sourceCommit=base['head'],researchedAt='2026-10-29',notForPublication=True,publicDataChanged=False,independentScientificApproval=False,coverage=dict(catalogue=184,archive=2,bookAccountsRead=184,exactNameSearches=184,rankResolved=184,categoryCounts=counts,estimateClaims=len(CLAIMS),readyForReviewEstimates=sum(c['researchCategory']=='A' for c in CLAIMS),groups=dict(collections.Counter(r['group'] for r in records))),conventions=dict(fieldMapping={'populationType':'type','lowerBound':'min','upperBound':'max','estimatedValue':'value','observationYear':'year','scientificReviewStatus_in_population':'reviewStatus','algorithm_type':'method','method_description':'methodology'},rangeEncoding='type=approximate, value=null, min/max; sourceReportedCentralEstimate is separate, never a computed midpoint.',unknownYear='null; observationPeriod, assessmentReferenceYear and statisticalReferenceYear do not replace a field year.',openBounds='reportedBound / reportedNumericRange; type unknown when no closed interval is supported.',recordTypeUnknown='Record-level type/value/min/max/year remain unknown: no selected public estimate. Research claims are in estimates[].',A='Sufficient information to submit the stated estimate for independent review; not scientific approval or technical import readiness.',B='Population claim exists but year/method/coverage/identification/primary report is insufficient.',C='No reliable absolute population estimate established in the reviewed materials; density/encounters/collections may exist.',scope='Finite audit: every national account and exact-name query reviewed, selected full sources examined; not an exhaustive systematic review of all literature.'),sources=list(SOURCES.values()),integrity=dict(baselineHead=base['head'],baselineTrackedFiles=len(base['hashes']),unchangedTrackedFiles=len(base['hashes']),changedTrackedFiles=changed,protectedFiles=len(protected),protectedManifestSHA256=manifest_sha,catalogueSourceSHA256=protected['data/species.source.json'],cataloguePublicSHA256=protected['public/data/species.json'],allPublicPopulationUnknown=True),records=records)
OUT.write_bytes((json.dumps(doc,ensure_ascii=False,indent=2)+'\n').encode())
print(json.dumps({'records':len(records),'categories':counts,'claims':len(CLAIMS),'A_claims':doc['coverage']['readyForReviewEstimates'],'unchangedTrackedFiles':len(base['hashes']),'protectedFiles':len(protected),'sha256':digest(OUT.read_bytes())},ensure_ascii=False))
