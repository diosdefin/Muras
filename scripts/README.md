# scripts/

Build, data and maintenance tooling. **Do not move or rename files here without reading the note at the end.**

## Used by `npm run …` (active)

| Script | Command | Purpose |
| --- | --- | --- |
| `build-data.mjs` (+ `build-map.mjs`, `build-quiz.mjs`) | `data`, `predev`, `prebuild`, `data:validate` | Generates `public/data/*` from `data/*.source.json`; `--check` verifies nothing drifted |
| `build-protected-areas.mjs` | `data:areas` | Protected-areas dataset |
| `validate-locales.mjs` | `prebuild`, `data:validate` | Key parity of `src/locales/{ru,ky,uz,en}.json` |
| `admin-entry.mjs` | `postbuild` | Static `/admin` page and `dist/precache.json` for the service worker |
| `dev-admin.mjs`, `local-admin/` | `dev:admin` | Local-only editor (never part of the production build) |
| `process_data.py`, `make-thumbs.py` | `data:images` | Photo processing and lightweight thumbnails (`requirements.txt`) |
| `prepare-research-batch.mjs`, `prepare-batch-images.mjs`, `import-species-batch.mjs` | `data:batch:*` | Prepare, photograph and import a reviewed batch of species |
| `bulk-pipeline.mjs` | `data:bulk:*` | Reviewed bulk research pipeline (data-collection engine) |
| `discover-research-candidates.mjs` | `research:discover` | Candidate discovery for new taxa |
| `audit-translations.mjs` | `translations:audit` | Translation coverage report |
| `update-ui-manifest.py` | manual | Re-registers intentional UI changes in `data/research/ui-v4-release.json` |
| `test.mjs` | `test` | Test runner |

## `lib/`

- Runtime helpers of the pipelines: `bulk-import`, `research-pipeline`, `local-research-adapter`,
  `provisional-publication`, `translation-integrity`.
- Test support: `git-history` (committed history fixtures), `historical-checksum`, `local-admin-history`,
  `map-history`, `ui-design-scope` (UI change guard).

## Historical one-off scripts (kept, not run routinely)

They produced the evidence of past catalogue releases and are exercised by tests and SHA-256 receipts:
`prepare-bulk-25-content`, `check-bulk-25-content`, `research-bulk-25-photos`, `audit-bulk-25-release`,
`prepare-redbook-master-registry`, `prepare-catalog-181`, `prepare-catalog-187`,
`validate-catalog-167-preparation`, `validate-catalog-181-preparation`, `validate-catalog-187-preparation`,
`validate-catalog-200-conflicts`, `validate-catalog-200-inventory`, `research-map-distribution.py`.

## Why nothing is moved to an `archive/` folder

Receipts in `data/research/*/baseline.json`, `docs/evidence/*.json`, tests and committed history fixtures refer to these
exact paths and bytes. Moving a file changes a path that a receipt pins and fails the release tests. See
`docs/TESTING.md` ("Making an intentional change") before touching any of them.
