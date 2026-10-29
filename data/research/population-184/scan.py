"""Read-only source scan with SHA-keyed checkpoint/resume. No catalogue writes.
Run from repository root: python data/research/population-184/scan.py
"""
import json, hashlib, re
from pathlib import Path
import pypdfium2 as pdfium
ROOT = Path(__file__).resolve().parents[3]
def load(p):
    return json.loads((ROOT / p).read_text(encoding="utf-8-sig"))
def sha(b):
    return hashlib.sha256(b).hexdigest()
book_path = ROOT / ".generated/research/redbook.pdf"
book_sha = sha(book_path.read_bytes())
assert book_sha == "f517212f7ce12fcf5c30f2cf73edc5a842b3ded15dea232b844fbe7ce2525cf8"
catalogue = load("data/species.source.json")["catalog"]
mapping = {r["speciesId"]: r for r in load("data/research/map-184-full-distribution.json")["records"]}
cache = ROOT / ".generated/population-184/checkpoints"
cache.mkdir(parents=True, exist_ok=True)
rank_evidence = {}
def walk(obj, source, pointer=""):
    if isinstance(obj, dict):
        rank = obj.get("rank")
        names = [obj.get(k) for k in ("canonicalName", "acceptedScientificName", "scientificName")]
        if rank in ("SPECIES", "SUBSPECIES"):
            for name in names:
                if isinstance(name, str):
                    rank_evidence.setdefault(name, []).append({"rank":rank,"file":source,"pointer":pointer})
        for k, v in obj.items(): walk(v, source, pointer + "/" + k)
    elif isinstance(obj, list):
        for i, v in enumerate(obj): walk(v, source, pointer + "/" + str(i))
for folder in ("data/research", "docs/evidence"):
    for path in sorted((ROOT / folder).glob("*.json")):
        if path.name.startswith("population-184"): continue
        walk(json.loads(path.read_text(encoding="utf-8-sig")), path.relative_to(ROOT).as_posix())
book = pdfium.PdfDocument(str(book_path))
rows = []
for item in catalogue:
    sid, name = item["id"], item["scientificName"]
    mapping_row = mapping[sid]
    page_num = mapping_row["sourcePage"]
    checkpoint = cache / (sid + ".json")
    if checkpoint.exists():
        previous = json.loads(checkpoint.read_text(encoding="utf-8"))
        if previous["bookSHA256"] == book_sha and previous["scientificName"] == name and previous["sourcePage"] == page_num:
            rows.append(previous); continue
    page = book[page_num-1]
    tp = page.get_textpage()
    full = tp.get_text_range()
    tp.close(); page.close()
    match = re.search(r"Численност[ь]?\s*[.:](.*?)(?=\n(?:Лимитирующ|Образ жизни|Размнож|Разведение|Меры|Культив|Условия|Принятые|Предлагаемые|Numbers)|\Z)",full,re.S)
    section = re.sub(r"\s+", " ", match.group(1)).strip() if match else None
    evidence = rank_evidence.get(name, [])
    ranks = sorted(set(e["rank"] for e in evidence))
    row = {"speciesId":sid,"scientificName":name,"group":item["group"],"historicalScientificName":mapping_row["historicalScientificName"],"nationalRecordId":mapping_row["nationalRecordId"],"sourcePage":page_num,"bookSHA256":book_sha,"pageTextSHA256":sha(full.encode()),"populationSectionSHA256":sha(section.encode()) if section else None,"populationSection":section,"taxonRanks":ranks,"rankEvidence":evidence[:5],"scanStatus":"section_read" if section else "needs_manual_heading_review"}
    checkpoint.write_bytes((json.dumps(row,ensure_ascii=False,indent=2)+"\n").encode())
    rows.append(row)
book.close()
output = ROOT / ".generated/population-184/scan.json"
output.write_bytes((json.dumps(rows,ensure_ascii=False,indent=2)+"\n").encode())
assert len(rows) == 184 and len(set(r["speciesId"] for r in rows)) == 184
print(json.dumps({"scanned":len(rows),"missingHeadings":[r["speciesId"] for r in rows if not r["populationSection"]],"rankUnresolved":[[r["speciesId"],r["taxonRanks"]] for r in rows if len(r["taxonRanks"])!=1]}, ensure_ascii=False))
