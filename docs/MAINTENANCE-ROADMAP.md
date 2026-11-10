# Maintenance roadmap (repository clean-up)

Status on 2026-11-10: `main` is the only branch (all feature branches were merged and deleted; their tips are kept in
the local backup bundle). History has 171 commits and is **intentionally not rewritten yet**, because ~18 test files read
old commits (see `docs/TESTING.md`, section 3).

## Done

- Full backup (zip + `git bundle --all`) outside Git, with SHA-256 sums.
- Merged branches deleted locally; `git gc` run (`.git` 84 MB → 65 MB).
- Documentation: `TESTING.md`, `ARCHITECTURE.md`, `DEPLOYMENT.md`, `LICENSES.md`, `LICENSE` (MIT for code).
- Host-neutral deployment files in `deploy/`; the maintenance tool `scripts/update-ui-manifest.py` is now in the repo.

## Remaining work, in order

### Step A. Make tests independent of Git history (prerequisite for everything below)

Goal: `npm test` passes in a repository with a single squashed commit.

Recommended design (analysed 2026-11-10): one shared module instead of ~15 separate `git show` call sites.

1. Add `scripts/lib/git-history.mjs` exporting `gitShow(sha, path)`, `gitExists(sha, path)` and `gitListFiles(sha)`.
   Lookup order: committed fixture `tests/fixtures/history/<sha>/<path>` first, then real `git` (only when the fixture is missing).
   Record mode (`MURAS_RECORD_HISTORY=1`): every call that falls through to real `git` writes its result into the fixtures folder.
2. Replace every direct `execFileSync('git', ['show'|'cat-file'|'ls-files'|'diff', ...])` in the files below by the module.
   Tests/helpers: `tests/helpers/{photo-amendment,translation-evolution,ui-v3-preservation,ui-v4-release,historical-pipeline}.mjs`,
   `tests/{catalog-translation,local-admin-boundaries,uz-localization,population-activation,catalog-184-photo-batch-1,catalog-184-photo-batch-2}.test.mjs`
   (`historicalBytes`/`historicalCatalogueBytes` helpers are the main entry points; find them with `git grep historicalBytes`).
   Scripts: `scripts/lib/{local-admin-history,map-history}.mjs`, `scripts/audit-translations.mjs`, `scripts/validate-catalog-{181,200-inventory,200-conflicts}*.mjs`,
   `scripts/research-map-distribution.py`, `data/research/population-184/validate.py`.
   Production code that only asks "which branch am I on" (`bulk-pipeline.mjs`, `import-species-batch.mjs`) stays as is.
3. Record the fixtures once on a full clone: `MURAS_RECORD_HISTORY=1 npm test -- --test-concurrency=1`, commit `tests/fixtures/history/`.
   If the folder gets large (> 30 MB), store only SHA-256 receipts for tests that merely compare bytes, and full files only where content is parsed.
4. Replace `git diff --name-status <BASE>` in `population-activation` by a committed list of the files that existed at BASE.
5. Keep the meaning of every test (nothing scientific may change silently). Do not delete tests or edit stored SHA-256 values.
6. Gate: `git clone --depth 1 . /tmp/check && cd /tmp/check && npm ci && npm test` must be green.
   Also change `fetch-depth: 0` in `.github/workflows/ci.yml` to `1` and update the history section of `docs/TESTING.md`.

### Step B. Move evidence out of the main tree (optional, after A)

After step A the receipts do not need the files they describe. Candidates (about 100 MB in total):
`data/backups/` (30 MB), `docs/evidence/` (25 MB), `data/research/` (16 MB), `assets/images/species/` (36 MB).
Move them to a separate archive (private repository, release asset or Zenodo), keep a short `docs/PROVENANCE.md` that
explains what existed and how to verify it, and keep the pipeline (`scripts/`) plus a small sample dataset.
Update the receipts and the allow-lists in `tests/population-activation.test.mjs` accordingly.

### Step C. Rewrite history

Only after A is green: create a curated history (15–25 Conventional-Commit messages, one author identity) with
`git checkout --orphan`, or squash by milestones. Tag it `v1.0`. Keep the backup bundle. Do not force-push over `main`
without a second copy of the old history (the bundle in `_backup/` or a separate private repository).

### Step D. Repository polish

- English `README.md` with screenshots, feature list, architecture diagram, quick start, provenance section.
- GitHub Actions: `npm ci`, `npm run data:validate`, `npm test`, `npm run build`.
- Consistent folder layout (move one-off `prepare-*`/`validate-catalog-*` scripts to `scripts/archive/` once step A removes their coupling).
- Short statement about tooling used during development (AI-assisted) in the README; keep it factual.

## Rules for any clean-up task

- Never run `git reset --hard` or `git clean` on the working tree; never delete `data/drafts/` or `animal/` without a backup.
- Keep SHA-256 receipts and licence/attribution fields intact.
- Stage with `git -c core.autocrlf=true add …` on Windows.
- Run `npm test` before and after; do not edit tests to make them pass without recording why in the commit message.
