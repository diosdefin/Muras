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

1. Replace each `historicalBytes(<sha>, <path>)` use with a committed copy: either the file itself under
   `tests/fixtures/history/<name>` or only its SHA-256 receipt (where the test just compares bytes).
   Files: `tests/helpers/{historical-pipeline,photo-amendment,photo-batch-2,population-publication-evolution,
   ui-v3-preservation,ui-v4-release,map-evolution,population-evolution,translation-evolution}.mjs`,
   `scripts/lib/{map-history,local-admin-history,historical-checksum}.mjs`,
   `data/research/population-*/verify.mjs`, `scripts/audit-bulk-25-release.mjs`, `scripts/validate-catalog-*.mjs`.
2. Keep the intent of each test (nothing scientific may change silently); replace "compare with commit X" by
   "compare with receipt Y committed in the repository".
3. Remove the hard-coded 40-hex commit constants listed in `TESTING.md`.
4. Gate: run `npm test` from a fresh `git clone --depth 1` copy; it must be green.

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
