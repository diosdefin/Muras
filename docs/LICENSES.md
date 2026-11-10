# Licences and attribution

| Part | Licence | Where recorded |
| --- | --- | --- |
| Source code (`src/`, `scripts/`, `tests/`, configs) | MIT, see `/LICENSE` | `LICENSE` |
| Species photographs | Per photo: CC0, public domain, CC BY, CC BY-SA (Wikimedia Commons and similar) | `images[]` in `data/species.source.json` (author, licence, source page, SHA-256) |
| Protected-area photographs | CC BY / CC BY-SA from Wikimedia Commons only | `data/protected-areas/areas.source.json` |
| Lightweight photo copies (`public/images/thumbs/`) | Derivatives of the photos above, same licence; changes are noted in the attribution text | `public/images/thumbs/manifest.json` links each copy to the SHA-256 of its original |
| Map geometry | ODbL 1.0 (OpenStreetMap contributors) | `public/data/geography/ODbL-1.0.txt` |
| Scientific text and names | Cited sources per record; IUCN categories are quoted, not re-licensed | `sources[]` of each record |

Rules that the project enforces in tests:

- Only photos with a reusable licence are published; unconfirmed licences are never publishable.
- CC BY-SA attributions must say that modified versions are shared under the same terms.
- Original photo files are never overwritten: their SHA-256 is recorded and checked.

This is a project convention, not legal advice. Before reusing any photo outside this site, read its own licence page.
