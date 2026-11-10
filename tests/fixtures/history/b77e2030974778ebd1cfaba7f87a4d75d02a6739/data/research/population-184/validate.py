"""Validate the research package and protected base commit; never writes data."""
import json,hashlib,subprocess,collections
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def read(p):return json.loads((ROOT/p).read_text(encoding='utf-8-sig'))
def sha(b):return hashlib.sha256(b).hexdigest()
def validate_document(doc):
    assert doc['notForPublication'] is True and doc['independentScientificApproval'] is False
    records=doc['records'];assert len(records)==184 and len({r['speciesId'] for r in records})==184
    sources={s['id']:s for s in doc['sources']};eids=[]
    cat=read('data/species.source.json');existing={r['id']:r for r in cat['catalog']}
    assert set(existing)=={r['speciesId'] for r in records}
    for r in records:
        assert r['scientificName']==existing[r['speciesId']]['scientificName']
        assert r['taxonRank'] in ('SPECIES','SUBSPECIES') and r['taxonomyEvidence']
        assert r['scientificReviewStatus']=='pending' and r['verified'] is False and r['lastReviewedAt'] is None
        assert r['type']=='unknown' and all(r[k] is None for k in ('value','min','max','year'))
        assert r['checkpoint']['scanStatus']=='section_read'
        assert len(r['checkpoint']['populationSectionSHA256'])==64
        for e in r['estimates']:
            eids.append(e['evidenceId'])
            for key in ('type','value','min','max','unit','territory','year','publicationYear','sourceId','sourceUrl','sourcePage','methodology','evidenceQuoteOrParaphrase','researchStatus','scientificReviewStatus','limitations'):assert key in e
            assert e['sourceId'] in sources and e['sourceUrl']==sources[e['sourceId']]['url']
            assert e['scientificReviewStatus']==e['reviewStatus']=='pending' and e['verified'] is False and e['lastReviewedAt'] is None
            assert e['type'] in ('unknown','approximate') # No documented full exact census found in this audit.
            assert not (e['value'] is not None and (e['min'] is not None or e['max'] is not None))
            if e['min'] is not None:assert e['max']>=e['min']>=0
            if e['researchCategory']=='A':
                assert e['methodology'] and e['territory'] and e['sourcePage'] and (e['year'] or e['observationPeriod'])
                assert e['researchStatus']=='READY_FOR_REVIEW' and e['scope']=='KG'
                assert e['sourceId']=='slr-2026'
            if e.get('reportedBound') or e.get('reportedNumericRange'):
                assert e['type']=='unknown' and all(e[k] is None for k in ('value','min','max'))
        expected='A' if any(e['researchCategory']=='A' for e in r['estimates']) else ('B' if r['estimates'] else 'C')
        assert r['researchCategory']==expected
    assert len(eids)==len(set(eids))
    counts=dict(collections.Counter(r['researchCategory'] for r in records))
    assert counts==doc['coverage']['categoryCounts'] and sum(counts.values())==184
    assert len(cat['demoArchive'])==2 and len(cat['catalog'])==184
    assert all(r['population']['type']=='unknown' and r['population']['reviewStatus']=='pending' and r['verified'] is False for r in cat['catalog'])
    return counts
if __name__=='__main__':
    doc=read('data/research/population-184-evidence-audit.json');counts=validate_document(doc)
    base=doc['sourceCommit']
    files=subprocess.check_output(['git','ls-tree','-r','--name-only',base],cwd=ROOT,text=True,encoding='utf-8').splitlines()
    changed=subprocess.check_output(['git','diff',base,'--name-only'],cwd=ROOT,text=True,encoding='utf-8').splitlines()
    assert not [p for p in changed if p in files],changed
    protected={p:sha((ROOT/p).read_bytes()) for p in files if p.startswith(('data/','public/','assets/','src/'))}
    assert sha(json.dumps(protected,sort_keys=True,separators=(',',':')).encode())==doc['integrity']['protectedManifestSHA256']
    for s in doc['sources']:
        rec=s.get('downloadReceipt')
        if rec and rec.get('status')=='cached' and (ROOT/rec['cache']).exists():assert sha((ROOT/rec['cache']).read_bytes())==rec['sha256']
    # In-memory negative probes: approvals and source substitutions must be rejected.
    for mutation in ['approval','range','source','name']:
        bad=json.loads(json.dumps(doc));record=bad['records'][0];e=record['estimates'][0]
        if mutation=='approval':e['scientificReviewStatus']='approved'
        elif mutation=='range':e['value']=300
        elif mutation=='source':e['sourceId']='invented-primary-source'
        else:record['scientificName']='Parent taxon substituted'
        try:validate_document(bad)
        except AssertionError:pass
        else:raise AssertionError('Negative probe passed: '+mutation)
    print(json.dumps({'status':'PASS','records':184,'categories':counts,'claims':len([e for r in doc['records'] for e in r['estimates']]),'protectedFilesUnchanged':len(protected),'negativeProbes':4},ensure_ascii=False))
