# Architecture

MURAS is a static single-page app (Vue 3 + Vite + Tailwind). There is no server and no database:
everything is generated from source JSON at build time and served as files.

```
data/*.source.json ──► scripts/build-data.mjs ──► public/data/*.json ──► Vite build ──► dist/
(editable science)        (validate + project)     (public projection)    (static site)
```

## Folder map

| Path | What it is | Notes |
| --- | --- | --- |
| `src/` | Application code | `components/` (Vue), `composables/` (state), `data/` (pure logic, no DOM), `locales/` (ky/ru/uz/en), `admin/` (local editor) |
| `public/` | Files served as-is | `data/` generated JSON, `images/approved|areas/` licensed photos, `images/thumbs/` lightweight copies, `icons/`, `sw.js`, `manifest.webmanifest` |
| `data/species.source.json` | **Source of truth** for the 184 species | Edited only through the importer/admin, validated by `scripts/build-data.mjs` |
| `data/protected-areas/` | Source for 24 protected territories | Built by `npm run data:areas` |
| `data/geography/` | Regional links and oblast geometry (ODbL) | Evidence-based; no invented occurrences |
| `data/localization/` | Translation batches (journals) | Audit trail for ky/uz/en texts |
| `data/research/` | Research registries, packets, receipts | Evidence trail; **referenced by tests**, see `docs/TESTING.md` |
| `data/backups/` | Byte-exact copies of earlier catalogue states | Referenced by tests |
| `data/drafts/` | Local editor drafts | Git-ignored, never published |
| `assets/images/species/` | Source copies of species photos used by the image pipeline (`scripts/prepare-batch-images.mjs`, local editor); the published files are `public/images/approved/` | 163 WebP files, hash receipts referenced by tests |
| `scripts/` | Data pipeline, importers, validators, thumbnails | `lib/` holds helpers (history checks, bulk import) |
| `tests/` | `node:test` suite | See `docs/TESTING.md` |
| `docs/` | Documentation, validation reports, `evidence/` receipts | This file, `TESTING.md`, `DEPLOYMENT.md`, `LICENSES.md` |
| `deploy/` | Host-neutral deployment examples | nginx, Docker |
| `_backup/` (local, ignored) | Full backup made before maintenance | Not part of the repository |

## Data pipeline

1. `data/species.source.json` holds records with `sources[]`, `images[]` (licence, author, SHA-256),
   national classification and IUCN as **separate** fields, and `population` objects that default to `unknown`.
2. `npm run data` (`scripts/build-data.mjs`) validates everything (unknown fields, dangling sources,
   unapproved photos, unsafe URLs) and writes `public/data/species.json`, `quiz.json`, the map projection.
   Invalid input stops generation **before** overwriting previous output.
3. Photos live only as local WebP files with recorded fingerprints; `scripts/make-thumbs.py` creates the
   lightweight WebP/AVIF copies (originals are never touched).
4. The build (`npm run build`) validates locales, regenerates data, runs Vite, then `scripts/admin-entry.mjs`
   writes the static `/admin/` page and `dist/precache.json` for the service worker.

## Principles encoded in the code

- **Unknown stays unknown.** A missing number is never rendered as zero or "extinct"; a population is shown only
  with an owner decision bound to a SHA-256 of the exact source (`src/data/population-publication.js`).
- **National and global status are separate** (national classification vs IUCN).
- **Translations never change science.** Names, ids, sources and numbers are preserved byte-logically.
- **Local editor only.** The write API exists only under `npm run dev:admin`; production serves a static notice.

## Offline support

`public/sw.js` keeps the app shell, JSON data and viewed photos; `useOfflineSave` stores all lightweight photo copies
on request. `usePhotoQuality` switches pages to the light copy on slow or offline connections.
The service worker is same-origin only and never touches `/admin`.

## Routes

`/`, `/map`, `/species/:id`, `/territories`, `/territories/:id` are client-side routes. Any host must answer
them with `index.html` (see `docs/DEPLOYMENT.md`). `/admin/` is a real static file.
