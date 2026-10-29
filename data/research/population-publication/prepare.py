"""Task 28.4 selection from the immutable 28.3 packet. No authorization or catalogue writes."""
import json,hashlib,copy
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def read(p):return json.loads((ROOT/p).read_text(encoding='utf-8-sig'))
def digest(o):return hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def save(p,o):(ROOT/p).write_bytes((json.dumps(o,ensure_ascii=False,indent=2)+'\n').encode())
p=read('data/research/population-184-bulk-publication.json');catalog={s['id']:s for s in read('data/species.source.json')['catalog']};sources={s['id']:s for s in p['sources']}
selection={
'irbis':('slr-national-adults','Национальная модель SCR с явным периодом, возрастной группой и 95% ДИ. Ведомственные учёты с неуточнённым возрастным охватом и региональные модели имеют иной охват; не усреднены и не заменяют эту оценку.'),
'manul':('book-sarychat','Единственная датированная локальная оценка в готовом наборе. Только исторический участок Сарычата 14000 га, 1977–1979; отсутствие встреч в 1998 не названо вымиранием.'),
'golden-eagle':('nr7-row-7-2024','Конечная датированная строка единого ряда государственного мониторинга ООПТ и охотугодий 2018–2024. Выбор ограничен этим охватом и протоколом; меньшие значения охотхозяйств с иным охватом не заменены. Это не полный учёт всех птиц страны.'),
'eurasian-lynx':('nr7-row-6-2024','Конечная датированная строка единого ряда государственного мониторинга ООПТ и охотугодий 2018–2024. Выбор основан на явной полевой дате и охвате, не величине числа; статистика только охотхозяйств не эквивалентна.'),
'ursus-arctos':('book-fergana-bear','Датированное охотобследование определённой площади около 200000 га восточных склонов Ферганского хребта в 1964. Историческая локальная оценка; не современная национальная численность.'),
'lonicera-paradoxa':('book-lonicera-1973','Источник явно описывает снижение одной алайской группы с 22 в 1969 до 12 в 1973; выбран конечный результат этого описанного сравнения. Это не общий итог по всем четырём очагам. Единица «экземпляров» сохранена как specimens.')}
display_limits={
'irbis':['Только взрослые особи; возрастной охват других учётов отличается.','Полевой период 2020–2024 сохранён целиком; современная численность 2026 не установлена.','Исходный отчёт PASK 2024 не получен.'],
'manul':['Сам очерк называет общие сведения о виде случайными, ограниченными и зачастую недостоверными.','Это локальный исторический учёт Сарычата на 14000 га в 1977–1979; не численность всего Кыргызстана.','В мае–июне 1998 в тех же местах встреч не было; это не доказательство нулевой популяции или вымирания.'],
'ursus-arctos':['Охотобследование 1964; около 200000 га восточных склонов Ферганского хребта.','Полнота учёта и поправки обнаруживаемости не подтверждены; это приблизительный исторический диапазон.'],
'lonicera-paradoxa':['Только описанная алайская группа; не все очаги распространения.','В книге число экземпляров снизилось с 22 (1969) до 12 (1973); методика и современная численность не установлены.']}
excluded={'menzbiers-marmot':'Несогласованные RU 1503 и EN около 10000/1999 в одной книге; точное различие охвата/методики не разрешено. Нельзя произвольно выбрать английскую оценку.', 'anser-indica':'Две документированные локальные популяции разных озёр/периодов: Сон-Куль 44–49/1992–1996 и Чатыр-Куль 282–342/1997–2003. Не установлен содержательный приоритет одной для общей карточки; не суммировать и не выбирать большую/свежую автоматически.'}
assessments=[];candidates=[]
for r in p['records']:
 if r['researchStatus']!='READY_SOURCE_DOCUMENTED':continue
 sid=r['speciesId'];est=[copy.deepcopy(c) for c in r['estimates'] if c['sourceReadiness']=='READY_SOURCE_DOCUMENTED'];chosen=selection.get(sid);candidate=None
 if chosen:
  c=next(c for c in est if c['evidenceId']==chosen[0]);ref=sources[c['sourceId']]
  unit='specimens' if sid=='lonicera-paradoxa' else c['unit']
  scope='KG_NATIONAL' if sid=='irbis' else ('KG_MONITORING' if c['sourceId']=='nr7-2026' else 'KG_LOCAL')
  identity={'speciesId':sid,'acceptedScientificName':r['acceptedScientificName'],'taxonRank':r['taxonRank'],'taxonIds':sorted({s['taxonId'] for s in catalog[sid]['sources'] if s.get('taxonId')})}
  estimate={k:copy.deepcopy(c.get(k)) for k in ['type','value','min','max','territory','year','observationPeriod','publicationYear','method','confidenceInterval','uncertaintyInterval']}
  estimate.update(unit=unit,scope=scope)
  candidate=dict(schemaVersion=1,documentType='documented-population-candidate',identity=identity,sourceReadiness='READY_SOURCE_DOCUMENTED',scientificReviewStatus='pending',verified=False,lastReviewedAt=None,populationPublicationStatus='unpublished',estimate=estimate,source=dict(id=ref['id'],title=ref['title'],url=c['sourceUrl'],retrievedUrl=ref.get('retrievedUrl'),sourcePage=c['sourcePage'],sourceName=c['sourceName'],sourceConfirmationStatus=c['sourceConfirmationStatus'],sha256=ref.get('sha256')),documentation=dict(evidenceId=c['evidenceId'],evidenceFingerprint=c['fingerprint'],researchRegistryFingerprint=p['registryFingerprint'],taxonMatchConfirmed=True,territoryMatchConfirmed=True,methodology=c.get('methodology'),unitNormalization='Source account says экземпляров; research unit individuals retained in original evidence, display unit specimens.' if sid=='lonicera-paradoxa' else None,limitations=copy.deepcopy(display_limits.get(sid,c['limitations']))+(['Возрастной охват не уточнён; численность не названа полным точным подсчётом всех особей страны.'] if c['sourceId']=='nr7-2026' else [])+['Независимая научная проверка MURAS ожидается.']),selectionReason=chosen[1])
  candidate['candidateFingerprint']=digest(candidate);candidates.append(candidate)
 assessments.append(dict(speciesId=sid,acceptedScientificName=r['acceptedScientificName'],eligible=chosen is not None,hasImage=r['hasImage'],primaryEvidenceId=chosen[0] if chosen else None,reason=chosen[1] if chosen else excluded[sid],readyEstimates=est,alternativeEvidenceIds=[c['evidenceId'] for c in est if not chosen or c['evidenceId']!=chosen[0]],withheldOtherEvidenceIds=[c['evidenceId'] for c in r['estimates'] if c['sourceReadiness']!='READY_SOURCE_DOCUMENTED']))
manifest=dict(schemaVersion=1,documentType='population-publication-selection',researchRegistryFingerprint=p['registryFingerprint'],candidates=sorted([dict(speciesId=c['identity']['speciesId'],candidateFingerprint=c['candidateFingerprint']) for c in candidates],key=lambda r:r['speciesId']))
manifest['fingerprint']=digest(manifest)
packet=dict(schemaVersion=1,documentType='population-publication-preparation',sourceCommit='c043497581bb3a5722830a22a2177b97a4594a1e',sourceRegistry='data/research/population-184-bulk-publication.json',sourceRegistryFingerprint=p['registryFingerprint'],preparedAt='2026-10-29',ownerAuthorization=None,populationPublicationStatus='unpublished',counts=dict(reviewedTaxa=8,reviewedEstimates=36,eligibleTaxa=len(candidates),eligibleWithImages=sum(a['eligible'] and a['hasImage'] for a in assessments),excludedTaxa=len(excluded),alternativeEstimates=36-len(candidates),published=0),selectionManifest=manifest,candidates=candidates,assessments=assessments)
packet['registryFingerprint']=digest(packet)
save('data/research/population-publication-candidates.json',packet)
print(json.dumps(packet['counts']),packet['registryFingerprint'],manifest['fingerprint'])
