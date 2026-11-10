# MURAS

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.24115386.svg)](https://doi.org/10.5281/zenodo.24115386) [![License: MIT](https://img.shields.io/badge/code-MIT-green.svg)](LICENSE)

**An educational atlas of the rare species and protected territories of Kyrgyzstan** — a static single-page
web app (Vue 3 + Vite) with a four-language interface (Kyrgyz, Russian, Uzbek, English), an interactive map,
a quiz, a lesson mode and offline support.

> MURAS is an educational project. It is not an official legal register and not a new edition of the national Red Book.
> National classifications and IUCN categories are stored separately; independent scientific review is a separate procedure.

## What is inside

- **Species catalogue** — 184 records with scientific names, sources, national and IUCN status, licensed photographs
  (or an honest placeholder), four-language search with typo tolerance, filters and stable URLs (`/species/<id>`).
- **Map** — seven oblasts with 208 documented regional links; no occurrence is inferred without evidence.
- **Protected territories** — 24 reserves, national parks and biosphere areas with photographs, founding years and quoted sources.
- **Quiz and lesson mode** — a sourced question bank and a fullscreen presentation mode for teachers.
- **Offline PWA** — installable; catalogue, map and territories work without a network. Lightweight WebP/AVIF photo
  copies are used on slow connections.
- **Local editor** — a separate admin tool that exists only in local development and never ships to production.

## Design principles

- **Unknown stays unknown.** Missing data is never rendered as zero; population numbers appear only with an owner decision
  bound to a SHA-256 fingerprint of the exact source.
- **Provenance first.** Every photo records author, licence, source page and file hash; every claim references a source.
- **Translations never change science.** Names, ids, numbers and sources are preserved byte-logically.
- **No vendor lock-in.** The build is a plain static folder; see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Tech stack

Vue 3 · Vite 6 · Tailwind CSS 3 · Node.js 22 · `node:test` · Python 3 + Pillow (image scripts only) · service worker (no libraries).

## Quick start

Requirements: Node.js 22 LTS and npm.

```bash
git clone https://github.com/diosdefin/Muras.git
cd Muras
npm ci
npm run dev          # public site with hot reload
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server (generates data first) |
| `npm run build` | Validates locales and data, builds `dist/`, writes the static `/admin/` page and the offline file list |
| `npm run preview` | Serves `dist/` locally |
| `npm test` | Full test suite (about 480 tests; needs the full Git history, see below) |
| `npm run data:validate` | Locale key parity + generated-data check |
| `npm run data:areas` | Rebuilds the protected-areas projection |
| `npm run dev:admin` | Local editor at `http://127.0.0.1:5173/admin/` (read [README.ru.md](README.ru.md) for the workflow) |
| `python3 scripts/make-thumbs.py` | Recreates the lightweight photo copies |

## Project layout

```
src/          Vue app: components, composables, pure data logic, locales (ky/ru/uz/en), local admin
public/       Static files: generated JSON, licensed photos, thumbnails, icons, service worker, manifest
data/         Source of truth (species, protected areas, geography) plus research receipts
scripts/      Data pipeline, importers, validators, tooling
tests/        node:test suite
docs/         Architecture, testing guide, deployment, licences, validation reports
deploy/       nginx and Docker files for non-Vercel hosting
```

Details: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Testing

`npm test` guards data integrity: scientific records, licences, photo hashes, translations and the map must not change
silently. Historical comparisons use committed fixtures (`tests/fixtures/history/`), so a shallow clone (`--depth 1`) is enough.
How the guards work and how to change a protected file on purpose: [docs/TESTING.md](docs/TESTING.md).

## Deployment

Any static host works; the only requirement is a single-page-app fallback to `index.html`.
Vercel is used today. Ready-made instructions for nginx/Docker, Netlify, Cloudflare Pages and GitHub Pages:
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Documentation

| Document | Purpose |
| --- | --- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Folder map, data pipeline, design principles |
| [docs/TESTING.md](docs/TESTING.md) | Running tests, history- and receipt-dependent tests, intentional changes |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Host-independent deployment |
| [docs/LICENSES.md](docs/LICENSES.md) | Licences of code, photos, data and map geometry |
| [docs/MAINTENANCE-ROADMAP.md](docs/MAINTENANCE-ROADMAP.md) | Repository clean-up plan and status |
| [README.ru.md](README.ru.md) | Russian README: local editor, drafts, photo workflow, recovery |

## Licence

Source code: MIT (see [LICENSE](LICENSE)). Photographs, species data and map geometry keep their own licences
(CC0, CC BY, CC BY-SA, ODbL); attribution is recorded per file. See [docs/LICENSES.md](docs/LICENSES.md).
