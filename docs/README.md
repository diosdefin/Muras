# Documentation index

## Start here

| Document | Content |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Structure of the app, data flow, build output |
| [TESTING.md](TESTING.md) | What the tests protect, history fixtures, baselines, how to make an intentional change |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Static hosting on any provider (Vercel, nginx, Docker) |
| [LICENSES.md](LICENSES.md) | Licences of code, data and photographs |
| [MAINTENANCE-ROADMAP.md](MAINTENANCE-ROADMAP.md) | Repository clean-up status and decisions |
| [data-model.md](data-model.md) | Species record structure |
| [../scripts/README.md](../scripts/README.md) | Script catalogue |

## Features and validation reports (Russian, historical)

`ui-validation`, `catalog-ux-validation`, `quiz-validation`, `lesson-validation`, `support-validation`,
`support-architecture`, `visualization-validation`, `population-visualization`, `branding-validation`,
`localization-validation`, `uz-localization-validation`, `admin-validation`, `local-admin-validation`,
`map-research`, `release-readiness`, `manual-qa-checklist`, `catalog-expansion`, `species-research`,
`backend-migration` (proposal), `vercel-deployment`.

## Folders

| Folder | Content |
| --- | --- |
| `research/` | Preparation and audit reports for each catalogue release |
| `evidence/` | Machine-readable receipts (SHA-256), pinned by tests; do not edit |
| `localization/`, `ui/`, `quality/` | Translation tracking, UI notes, test stabilisation report |

## Historical files in the repository root

`MURAS-UI-100-INSTALL.txt` and `DEPENDENCIES.md` are kept in the root on purpose. They are installation notes from
earlier design and dependency updates (Russian, for a former local setup) and are not part of the application.
Older release receipts in `docs/evidence/` and `data/` pin their exact paths and bytes, so moving or editing them
would invalidate those receipts and the tests that read them. See `MAINTENANCE-ROADMAP.md` (Step D).
