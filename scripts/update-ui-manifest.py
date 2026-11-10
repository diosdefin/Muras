#!/usr/bin/env python3
"""Maintenance tool: register changed presentation files in the UI v4 manifest.

Run from the repository root AFTER editing a hash-guarded file on purpose:
    python3 scripts/update-ui-manifest.py src/App.vue src/locales/ru.json
It records the file in data/research/ui-v4-release.json and tests/ui-v4-release.test.mjs
and recomputes every "after" hash. See docs/TESTING.md ("Making an intentional change").
"""
import json, hashlib, os, subprocess, sys, re
from pathlib import Path
m = json.load(open('data/research/ui-v4-release.json', encoding='utf-8'))
base = m['baseCommit']
history = Path(__file__).with_name('lib') / 'git-history.mjs'
node = os.environ.get('NODE_BINARY', 'node')
def query(command, path):
    return subprocess.check_output([node, str(history), command, base, path])
def sha(b): return hashlib.sha256(b.replace(b'\r\n', b'\n')).hexdigest()
for p in sys.argv[1:]:
    if p not in m['files']:
        before = sha(query('show', p)) if json.loads(query('exists', p)) else None
        m['files'][p] = {'before': before, 'after': None}
for p, e in m['files'].items(): e['after'] = sha(open(p, 'rb').read())
m['files'] = dict(sorted(m['files'].items()))
raw = open('data/research/ui-v4-release.json', encoding='utf-8', newline='').read()
out = json.dumps(m, ensure_ascii=False, indent=2) + '\n'
open('data/research/ui-v4-release.json', 'w', encoding='utf-8', newline='').write(out.replace('\n', '\r\n') if '\r\n' in raw else out)
t = open('tests/ui-v4-release.test.mjs', encoding='utf-8', newline='').read()
nl = '\r\n' if '\r\n' in t else '\n'
head = 'assert.deepEqual([...UI_V4_FILES].sort(), ['
a = t.index(head) + len(head); b = t.index('  ])', a)
items = sorted(set(re.findall(r"'([^']+)'", t[a:b])) | set(sys.argv[1:]))
t = t[:a] + nl + ''.join(f"    '{i}',{nl}" for i in items) + t[b:]
open('tests/ui-v4-release.test.mjs', 'w', encoding='utf-8', newline='').write(t)
print('files', len(m['files']))
