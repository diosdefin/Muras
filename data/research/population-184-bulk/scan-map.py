"""Read only cached Map.kg pages; exact name matching and source lineage only."""
from pathlib import Path
from lxml import html
import json,re,hashlib
ROOT=Path(__file__).resolve().parents[3]
CACHE=ROOT/'.generated/population-184-bulk'
old=json.loads((ROOT/'data/research/population-184-evidence-audit.json').read_text(encoding='utf-8'))
names={r['speciesId']:{r['scientificName'].lower(),r['historicalScientificName'].lower()} for r in old['records']}
log=json.loads((CACHE/'map-fetch-log.json').read_text(encoding='utf-8'))
receipts=[];matches=[]
for rec in log:
    if rec['status']!='cached' or 'map-article-' not in rec['cache']:continue
    raw=(ROOT/rec['cache']).read_bytes();assert hashlib.sha256(raw).hexdigest()==rec['sha256']
    tree=html.fromstring(raw.decode('utf-8'))
    body=tree.xpath('//div[contains(concat(" ",normalize-space(@class)," ")," full_story ")]')
    if not body:continue
    body=body[0];text=body.text_content();headers=[];last=0
    for h in body.xpath('.//b|.//strong|.//h2|.//h3|.//div[@class="quote"]'):
        ht=' '.join(h.text_content().split())
        if len(ht)>300 or not re.search(r"\b[A-Z][a-z]+ [a-z][a-z-]+",ht):continue
        at=text.find(h.text_content(),last)
        if at<0:continue
        headers.append((at,ht));last=at+len(h.text_content())
    count=0
    for i,(at,heading) in enumerate(headers):
        end=headers[i+1][0] if i+1<len(headers) else len(text)
        segment=text[at:end]
        pop=re.search(r"Численност[ь]?\s*[.:](.+?)(?=(?:Лимитирующие факторы|Образ жизни|Разведение|Культивирование|Меры охраны|Источник)|$)",segment,re.S)
        if not pop:continue
        poptext=' '.join(pop.group(1).split());count+=1
        for sid,aliases in names.items():
            found=next((name for name in sorted(aliases,key=len,reverse=True) if re.search(r"(?<![a-z])"+re.escape(name)+r"(?![a-z])",heading.lower())),None)
            if found:
                matches.append(dict(speciesId=sid,url=rec['url'],sourceHeading=heading,matchedName=found,section='Численность',populationSectionSHA256=hashlib.sha256(poptext.encode()).hexdigest(),populationSection=poptext,pageSHA256=rec['sha256'],lineage='secondary page; Red Book republication unless explicitly otherwise cited',sourcePagePublicationIsNotObservationYear=True))
    receipts.append(dict(**rec,populationSections=count))
(CACHE/'map-matches.json').write_bytes((json.dumps(matches,ensure_ascii=False,indent=2)+'\n').encode())
# Commit locators and digests, not the copyright text of full accounts.
public=[{k:v for k,v in m.items() if k!='populationSection'} for m in matches]
(ROOT/'data/research/population-184-bulk/map-crosswalk.json').write_bytes((json.dumps(dict(pages=receipts,matches=public),ensure_ascii=False,indent=2)+'\n').encode())
print(json.dumps(dict(articlePages=len(receipts),matchedSections=len(matches),uniqueTaxa=len(set(m['speciesId'] for m in matches))),ensure_ascii=False))
