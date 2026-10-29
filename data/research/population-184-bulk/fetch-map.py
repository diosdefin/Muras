"""Sequential cached Map.kg Red Book corpus; no repeated successful downloads."""
from pathlib import Path
import json,requests,hashlib,re,time
from urllib.parse import urljoin,urlparse
from lxml import html
ROOT=Path(__file__).resolve().parents[3]
CACHE=ROOT/'.generated/population-184-bulk'
CACHE.mkdir(exist_ok=True)
session=requests.Session()
LOG=CACHE/'map-fetch-log.json'
log=json.loads(LOG.read_text(encoding='utf-8')) if LOG.exists() else []
def fetch(url,name):
    path=CACHE/name
    old=next((r for r in log if r['url']==url),None)
    if old and old['status']=='unavailable':return None
    try:
        if not path.exists():
            r=session.get(url,timeout=40);r.raise_for_status();path.write_bytes(r.content)
        raw=path.read_bytes()
        rec=dict(url=url,cache=path.relative_to(ROOT).as_posix(),status='cached',sha256=hashlib.sha256(raw).hexdigest(),bytes=len(raw))
        tree=html.fromstring(raw.decode("utf-8"))
        rec['title']=' '.join(tree.xpath('//h1//text()') or tree.xpath('//title//text()'))[:250]
        if old:log.remove(old)
        log.append(rec)
        LOG.write_bytes((json.dumps(log,ensure_ascii=False,indent=2)+'\n').encode())
        return tree
    except Exception as e:
        if old:log.remove(old)
        log.append(dict(url=url,cache=None,status='unavailable',error=str(e)))
        LOG.write_bytes((json.dumps(log,ensure_ascii=False,indent=2)+'\n').encode())
        return None
links=set()
for i in range(1,5):
    url='https://map.kg/krasnaja-kniga/'+('' if i==1 else 'page/'+str(i)+'/')
    tree=fetch(url,'map-index-'+str(i)+'.html')
    if tree is not None:
        for href in tree.xpath('//a/@href'):
            target=urljoin(url,href)
            if urlparse(target).hostname=='map.kg' and '/krasnaja-kniga/' in target and target.endswith('.html'):
                links.add(target.replace('/ru/krasnaja-kniga/','/krasnaja-kniga/'))
for n,url in enumerate(sorted(links),1):
    ident=re.search(r'/(\d+)-',url).group(1)
    tree=fetch(url,'map-article-'+ident+'.html')
    if tree is not None:
        # Preserve full page text locally; matching/extraction is performed separately.
        (CACHE/('map-article-'+ident+'.txt')).write_bytes(tree.text_content().encode())
    if n%5==0:print('Map corpus checkpoint',n,'/',len(links),flush=True)
print('Map corpus complete:',len(links),'article URLs;',sum(r['status']=='cached' for r in log),'cached pages',flush=True)
