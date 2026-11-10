# Testing guide

`npm test` runs `node --test tests/*.test.mjs` (56 files, about 480 tests, 1.5–2 minutes on a laptop).
This document explains what the tests protect, which of them depend on Git history, and how to
change a protected file on purpose without fighting the suite.

## 1. Running

```powershell
npm ci
npm test                          # everything
node --test tests/protected-areas.test.mjs   # one file
npm run data:validate             # locale keys + generated-data check (also part of `npm run build`)
```

Requirements: Node.js 22+, a Git checkout (shallow is sufficient), and free disk space
(some tests copy the repository into `%TEMP%\muras-*`; delete those folders if the disk fills up).
Python is needed only for the image/research scripts, not for tests.

## 2. What the tests protect

The project is an educational catalogue, so the suite mainly guards **data integrity and provenance**:

| Group | Typical files | Guards |
| --- | --- | --- |
| Data model and validation | `data`, `population`, `population-integration`, `catalog-*-publication`, `bulk-*`, `provisional-*` | Scientific records keep sources, licences, unknown values stay unknown, imports are append-only and repeatable |
| Search, filters, pagination | `catalog-search`, `catalog-pagination`, `catalog-visual-order`, `species-routes` | Four-language search, 24 cards per page, stable URLs |
| Localisation | `localization`, `uz-localization`, `catalog-translation`, `quiz` | Same keys and placeholders in `ky/ru/uz/en`; translations never change science |
| Map | `map`, `map-activation`, `map-full-distribution` | 208 documented regional links; no invented occurrences |
| Population visualisation | `population-*`, `visualization*` | A number is shown only with an owner decision and exact source fingerprint |
| UI components (server-side rendering) | `species-photos`, `species-content`, `species-groups`, `first-batch`, `release`, `lesson`, `support`, `branding` | Real Vue components render in four languages, photos or placeholders, credits |
| Admin (local only) | `admin`, `local-admin*` | Editor exists only in `npm run dev:admin`; production has a static page without scripts |
| New features | `protected-areas`, `pwa-thumbs` | Protected-area data and photos; lightweight photo copies, service worker, offline file list |

## 3. Historical test fixtures

The release checks compare historical catalogues, photos, licences and archives with their original
SHA-256 receipts. `scripts/lib/git-history.mjs` reads committed fixtures in
`tests/fixtures/history/<commit>/` first and falls back to Git for a missing fixture.
A depth-one checkout can run the suite. Tests that audit the current index still need a Git
checkout.

Each commit directory contains the exact original blobs where the tests read content, SHA-256
receipts where they compare only a digest, and tree inventories where they check path existence
or compare the tracked working tree with a base commit. Large snapshots are stored as gzip files
and read back as their original bytes. The population activation test still
detects modifications and removals of protected paths, and applies the existing allow-list to
additions. The original release digests remain pinned.

Record new fixtures in a full checkout, with the original commits available:

```sh
MURAS_RECORD_HISTORY=1 npm test -- --test-concurrency=1
```

In PowerShell, set `$env:MURAS_RECORD_HISTORY = '1'` before running the test command and clear it
with `Remove-Item Env:MURAS_RECORD_HISTORY` afterwards. Review and commit the new fixtures.
Maintenance scripts that query additional old objects can record them through the same module.
Historical branch and ancestry checks in the standalone preparation audits still need their
original Git refs.

These commit IDs remain the provenance of the fixtures:

| Constant (commit) | Used by |
| --- | --- |
| `029a89e…` population-activation base | `tests/population-activation.test.mjs` |
| `c043497…` population-publication base | `tests/population-publication-gate.test.mjs`, `tests/helpers/population-publication-evolution.mjs` |
| `b77e203…` six-estimate publication | `data/research/population-six-publication/verify.mjs` |
| `b83a48c…`, `43ff311…`, `ce646a9…` map releases | `tests/map*.test.mjs`, `tests/first-batch.test.mjs`, `tests/species-groups.test.mjs`, `scripts/lib/map-history.mjs`, `tests/helpers/ui-v3-preservation.mjs` |
| `63f8e43…`, `ffca527…`, `c2999c6…` catalogue-184 photo batches | `tests/helpers/photo-amendment.mjs`, `tests/helpers/photo-batch-2.mjs`, `tests/catalog-184-*.test.mjs` |
| `f2f7ada…` UI v4 base | `tests/helpers/ui-v4-release.mjs` |
| `5095176…` local admin base | `scripts/lib/local-admin-history.mjs` |
| `1a213f4…`, `903a932…`, `841110e…`, `e5b7427…`, `5c26da5…`, `b83a48c…` | `scripts/audit-bulk-25-release.mjs`, `scripts/validate-catalog-*.mjs`, `scripts/research-map-distribution.py` |

## 4. Tests that depend on tracked "baseline" files

Many tests compare the working tree with `baseline.json` receipts (path → SHA-256) stored in:

- `data/backups/catalog-166|178|184/baseline.json`
- `data/research/population-184/`, `population-184-bulk/`, `population-publication/`, `population-six-publication/` (`baseline.json`)
- `docs/evidence/*.json` (catalogue-167, catalogue-181 preservation receipts)

Almost every file under `assets/`, `data/backups/`, `docs/evidence/` and `data/research/` is listed in one of them,
so **moving or deleting these files breaks tests**. They are the "evidence trail"; do not tidy them casually.
Safe to remove from the repository only after the receipts are rewritten (see `docs/MAINTENANCE-ROADMAP.md`).

## 5. Tests that need Vite

About 20 files start a Vite server in SSR mode (`createServer`, `ssrLoadModule`) to render the real Vue
components. They need the optional Rollup binary for your platform (`npm ci` installs it). On Linux
containers without it they fail with `Cannot find module @rollup/rollup-linux-x64-gnu`; that is an
environment issue, not a project bug.

## 6. Guard mechanisms (how "intentional change" works)

1. **Hash receipts** (`baseline.json`): see section 4. `scripts/lib/historical-checksum.mjs` accepts
   the same text in LF or CRLF form (Windows checkouts) but nothing else.
2. **Design scope** (`scripts/lib/ui-design-scope.mjs`): the list `intentionalUiRevision` names the presentation
   files that were edited on purpose after the scientific snapshots (for example `src/App.vue`, locale files,
   `src/data/catalog-search.js`). It is **not** a waiver for data, photos, licences or geometry.
3. **UI v3 / v4 manifests** (`data/research/ui-v3-release.json`, `ui-v4-release.json`, tests
   `ui-v3-preservation`, `ui-v4-release`): list files that changed since the base commit, with the previous
   (`before`) and approved (`after`) SHA-256. Editing such a file requires updating the manifest.
4. **`revisedTests` sets** inside `catalog-178/184-publication` and `population-bulk-publication` tests: files that
   are compared against their historical Git version instead of the live one.
5. **Allow-lists for new files** in `tests/population-activation.test.mjs` (`allowedChange`): which paths may be *added*
   under `data/`, `public/`, `assets/` without counting as a mutation (for example `public/images/thumbs/`).

## 7. Making an intentional change

Example: you edit `src/App.vue` or a locale file.

1. Make the change and run `npm test`.
2. If `ui-v4-release` (or `ui-v3-preservation`) fails because the file hash changed, register it:
   `python3 scripts/update-ui-manifest.py src/App.vue` (recomputes every `after` hash and the file list in the test).
3. If a historical test fails with "`<path>` … expected", add the path to the matching set: `intentionalUiRevision`
   (design) and, where a test compares against Git, to its `revisedTests`.
4. If a new file under `public/` or `data/` is rejected by `population-activation`, extend `allowedChange`
   (only for non-scientific content; data/photos need their own validators).
5. New locale keys: add them to **all four** files (`ky`, `ru`, `uz`, `en`) with identical `{p0}` placeholders;
   `npm run data:validate` checks it.
6. Windows: stage with `git -c core.autocrlf=true add …`, otherwise CRLF blobs enter history.

## 8. Adding a test

Put it in `tests/<topic>.test.mjs` (Node's built-in `node:test` and `node:assert/strict`). Prefer
self-contained fixtures. Avoid new tests that read old commits; use a small committed receipt instead.

## 9. Test map

| File | Tests | Reads Git history | Needs Vite | Uses baseline receipts |
| --- | --- | --- | --- | --- |
| `admin.test.mjs` | 24 |  | yes |  |
| `branding.test.mjs` | 5 |  |  |  |
| `bulk-25-content.test.mjs` | 6 |  |  |  |
| `bulk-import.test.mjs` | 11 |  | yes |  |
| `bulk-pipeline.test.mjs` | 10 |  |  |  |
| `catalog-100-photo-final.test.mjs` | 3 |  | yes |  |
| `catalog-100-photos.test.mjs` | 4 |  | yes |  |
| `catalog-100-preparation.test.mjs` | 4 |  | yes |  |
| `catalog-100-publication.test.mjs` | 3 |  |  |  |
| `catalog-125-publication.test.mjs` | 3 |  | yes |  |
| `catalog-150-publication.test.mjs` | 4 | yes | yes | yes |
| `catalog-166-publication.test.mjs` | 5 | yes | yes | yes |
| `catalog-178-publication.test.mjs` | 5 | yes | yes | yes |
| `catalog-184-photo-batch-1.test.mjs` | 10 | yes | yes |  |
| `catalog-184-photo-batch-2.test.mjs` | 7 |  | yes |  |
| `catalog-184-publication.test.mjs` | 5 | yes | yes | yes |
| `catalog-84-preparation.test.mjs` | 4 |  | yes |  |
| `catalog-84-publication.test.mjs` | 2 |  |  |  |
| `catalog-expansion-40.test.mjs` | 11 |  | yes | yes |
| `catalog-pagination.test.mjs` | 3 |  |  |  |
| `catalog-search.test.mjs` | 16 |  |  |  |
| `catalog-translation.test.mjs` | 12 | yes |  |  |
| `catalog-visual-order.test.mjs` | 2 |  |  |  |
| `data.test.mjs` | 23 |  |  |  |
| `first-batch.test.mjs` | 6 | yes | yes |  |
| `lesson.test.mjs` | 12 |  |  |  |
| `local-admin-boundaries.test.mjs` | 4 | yes |  | yes |
| `local-admin.test.mjs` | 14 |  | yes |  |
| `localization.test.mjs` | 14 |  |  |  |
| `map-activation.test.mjs` | 9 | yes | yes |  |
| `map-full-distribution.test.mjs` | 11 | yes |  |  |
| `map.test.mjs` | 11 | yes |  |  |
| `population-activation.test.mjs` | 4 | yes | yes |  |
| `population-bulk-publication.test.mjs` | 9 | yes |  | yes |
| `population-integration.test.mjs` | 4 |  |  |  |
| `population-publication-gate.test.mjs` | 21 | yes |  | yes |
| `population-six-publication.test.mjs` | 8 |  |  |  |
| `population.test.mjs` | 14 |  |  |  |
| `protected-areas.test.mjs` | 6 |  |  |  |
| `provisional-catalog.test.mjs` | 5 |  | yes |  |
| `provisional-publication.test.mjs` | 5 |  |  |  |
| `pwa-thumbs.test.mjs` | 5 |  |  |  |
| `quiz.test.mjs` | 17 |  |  |  |
| `redbook-master-registry.test.mjs` | 3 |  |  | yes |
| `release.test.mjs` | 3 |  | yes |  |
| `research-discovery.test.mjs` | 7 |  |  |  |
| `species-content.test.mjs` | 12 |  | yes |  |
| `species-groups.test.mjs` | 8 | yes | yes |  |
| `species-photos.test.mjs` | 7 |  | yes | yes |
| `species-routes.test.mjs` | 3 |  |  |  |
| `support.test.mjs` | 22 |  |  |  |
| `ui-v3-preservation.test.mjs` | 1 | yes |  |  |
| `ui-v4-release.test.mjs` | 21 |  |  |  |
| `uz-localization.test.mjs` | 13 | yes | yes |  |
| `visualization-core.test.mjs` | 15 |  |  |  |
| `visualization.test.mjs` | 4 |  |  |  |

Columns are derived from the code (search for `historicalBytes`, `checkoutBytesMatching`, `createServer`, `baseline.json`); a test may also reach history indirectly through helpers in `tests/helpers/`.
