#!/usr/bin/env python3
"""Create lightweight copies (WebP + AVIF, longest side 640 px) of the licensed photos.

Originals under public/images/{approved,areas}/ are never modified: their SHA-256 and
licence records stay valid. Copies go to public/images/thumbs/<same relative path>.
Run: python3 scripts/make-thumbs.py   (needs Pillow with WebP and AVIF support)
"""
import json, hashlib, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'public' / 'images'
OUT = SRC / 'thumbs'
SIDE = 640
FOLDERS = ('approved', 'areas')

def main():
    manifest = {}
    for folder in FOLDERS:
        for src in sorted((SRC / folder).glob('*.webp')):
            rel = f'{folder}/{src.name}'
            with Image.open(src) as im:
                im = im.convert('RGB')
                w, h = im.size
                scale = min(1, SIDE / max(w, h))
                size = (max(1, round(w * scale)), max(1, round(h * scale)))
                if size != (w, h):
                    im = im.resize(size, Image.LANCZOS)
                dest = OUT / folder
                dest.mkdir(parents=True, exist_ok=True)
                webp = dest / src.name
                avif = dest / (src.stem + '.avif')
                im.save(webp, 'WEBP', quality=80, method=6)
                im.save(avif, 'AVIF', quality=55, speed=6)
            manifest[rel] = {
                'width': size[0], 'height': size[1],
                'webpBytes': webp.stat().st_size, 'avifBytes': avif.stat().st_size,
                'originalBytes': src.stat().st_size,
                'originalSha256': hashlib.sha256(src.read_bytes()).hexdigest(),
            }
    (OUT / 'manifest.json').write_text(json.dumps(manifest, indent=1, sort_keys=True) + '\n', encoding='utf-8')
    tot = lambda k: sum(v[k] for v in manifest.values())
    print(len(manifest), 'photos; original', tot('originalBytes') // 1024, 'KB; webp', tot('webpBytes') // 1024, 'KB; avif', tot('avifBytes') // 1024, 'KB')

if __name__ == '__main__':
    sys.exit(main())
