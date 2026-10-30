# Этап 2 — аудит старой папки и сохранение исследовательского конвейера

Дата: 31.10.2026. Ветка `feature/local-file-admin`, HEAD `50951765ab52c32fdae30309cc19ede7e9bd279d`. Изменения админки этапа 1 остаются незакоммиченными. Ветка не переключалась; импорт, перенос Muras1, удаление, commit, merge, push и deployment не выполнялись.

## Аудит двух папок

Полный локальный отчёт: `.generated/audits/muras1-comparison.md`; машинная инвентаризация всех путей/размеров/SHA: `.generated/audits/muras1-comparison.json`. Эти файлы ignored, не являются переносом старых данных. В старой папке ничего не создавалось и не изменялось.

Сравнены 1290 файлов Muras и 4523 Muras1, исключая `.git` и обычные technical directories из содержательной части. 1236 совпадают побайтово по одинаковому пути. 17 отличий — изменения админки этапа 1; ещё 5 только EOL. Каталог/архив и все существующие data/assets/public, научные источники/реестры/статусы/география и публичные переводы совпадают. Опасного конфликта каталога не найдено.

В Muras1 3265 уникальных по пути файлов, 858948267 байт (819.16 MiB); 3263 из них в `.generated`. Это не только кеш: обнаружены 18 PDF, исходные изображения, снимки ответов/лицензий, исследовательские scripts/drafts, исторические backups и журналы проверки. Полный список каждого файла с размером/SHA и объяснением находится в аудите; пути ниже — основные группы, а не исчерпывающий перечень.

| Ценные уникальные материалы Muras1 | Файлов | Байт |
|---|---:|---:|
| `.generated/research/` | 78 | 60397184 |
| `.generated/bulk-originals/` | 73 | 167465293 |
| `.generated/catalog-125-originals/` | 20 | 48854858 |
| `.generated/catalog-150-sources/` | 12 | 16187235 |
| `.generated/catalog-184-photo-batch-1/` | 54 | 48581929 |
| `.generated/catalog-184-photo-batch-2/` | 53 | 36397235 |
| `.generated/import-backups/` | 11 | 13299740 |
| `.generated/population-184/` | 251 | 56681660 |
| `.generated/population-184-bulk/` | 84 | 21524242 |
| `.generated/task22-master/` | 29 | 23831611 |

Примеры первоисточников: `.generated/research/redbook.pdf`, `.generated/task22-master/book-2006.pdf`, `.generated/population-184/stat-sdg.pdf`, `.generated/population-184-bulk/nr7-2026.pdf`; оригиналы в `.generated/*/originals` и `bulk-originals`; backups в `.generated/import-backups`. Повторяющиеся байты под разными путями отмечены, ничего не дедуплицировалось.

Два untracked вне .generated: `MURAS-UI-v3-INSTALL.txt` (2441 байт) и `MURAS-dependencies-patch.zip` (1787 байт). ZIP прочитан без извлечения: оба члена (`DEPENDENCIES.md`, `.nvmrc`) эквивалентны текущим после учёта CRLF/LF. Инструкцию UI не применять поверх новой админки.

Три Git commit-объекта достижимы только в старом репозитории: stash `muras-hero-animation-wip` и два его служебных родителя. Stash содержит незавершённые сцены/скрипты/тесты, evidence и исходные JPG; 279 blob-версий отсутствуют по точному SHA среди текущих рабочих файлов. Это не означает 279 новых научных документов: часть — исторические версии/EOL. Список refs, путей, размеров и SHA — в аудите. Остальные исторические коммиты уже достижимы в новом клоне, но старые локальные refs сохранять при архивировании.

**Удалять Muras1 или считать её полностью восстановимой через clone нельзя.** Безопасно планировать полную приватную резервную копию со всеми ignored/untracked и `.git`/stash, проверив SHA. Такая копия и перенос требуют отдельного согласования и здесь не выполнялись. node_modules/dist/pycache — вероятно воспроизводимые технические материалы; .generated так не классифицируется. Chrome/localStorage не открывались и не изменялись, их сохранность архивом папки не обеспечивается.

Эвристический secret scan нашёл подписанные S3 URL в поисковых ответах и apikey-поля в сохранённых сторонних HTML. Значения не выводились и не копировались в отчёты/Git. Это требует ручной проверки перед передачей архива, но не является доказанной утечкой действующего приватного ключа. Скан ограничен UTF-8 файлами до 5 MiB и именами файлов, бинарные/большие файлы и Git-история не сертифицированы на отсутствие секретов.

## Сохранённый процесс и новый discovery

- `NEW_SPECIES_PLAYBOOK.md`: фактические инструменты/команды/форматы, национальные первоисточники и taxonomy, sourceIds/supports, четыре языка и null/fallback, WebP/лицензии/SHA, состояния, редакторский и отдельный provisional workflow, обновление опубликованного вида с сохранением evidence, проверки/Git/архивирование.
- `RESEARCH_CHECKLIST.md`: практический список проверок и явных решений.
- `data/research/templates/new-species-candidate.example.json`: структурно валидный pending-scaffold без выдуманного вида/численности/источников; не проходит research readiness и не может попасть в одобренный пакет.
- `npm run research:discover`: переиспользует createTaxonIndex/createQueueConflicts/taxonNameKey/validateRegistry/readLocal; stdout JSON, никаких записей или сети. Отклоняет apply и пути вне data/research. Не заменяет научный check или национальную инвентаризацию.

Два реальных запуска discovery идентичны: каталог 184, архив 2, мастер-реестр 60, existing_match_requires_review 53, needs_research 7, identity_conflict 0. Семь unmatched ID ниже — старые нерешённые концепции, **не разрешённая следующая партия**:

- `tulipa-anadroma` (Tulipa anadroma → Tulipa tschimganica; сохранённое состояние research_ready).
- `dictyophora-duplicata` (Dictyophora duplicata → None; сохранённое состояние needs_evidence).
- `bufo-viridis` (Bufo viridis → None; сохранённое состояние needs_evidence).
- `novoeumeces-schneideri-princeps` (Novoeumeces schneideri princeps → None; сохранённое состояние needs_evidence).
- `spalerosophis-diadema-schiraziana` (Spalerosophis diadema schiraziana → None; сохранённое состояние needs_evidence).
- `falco-peregrinus` (Falco peregrinus → None; сохранённое состояние needs_evidence).
- `falco-pelegrinoides` (Falco pelegrinoides → None; сохранённое состояние needs_evidence).

Инвентарь существующих инструментов — таблица в playbook. Нового импортёра, схемы или валидатора не создано. Ядро офлайн и не зависит от Supabase/Vercel/Chrome или названия папки; фотографический downloader отдельно требует сеть/Python. В User-Agent старого image preparer есть историческая GitHub-ссылка, без файловой зависимости. Для большой PDF-архивации учтён фактический лимит readLocal 16 MiB.

Пока отсутствуют универсальный manifest-builder CLI, единый проверяемый export всего research-архива, полное автоматическое сопоставление исторических концепций, независимые рецензии и современный юридический аудит. Нельзя обещать научную воспроизводимость только через npm ci.

Branch allowlist не изменён. Текущая ветка и main/master остаются запрещены для bulk apply. Предложен точный допуск одной будущей ветки отдельной reviewable правкой с тестами; масштабируемая package-bound policy описана как будущий проект, не реализованная функция. Сохранены все существующие барьеры и тесты.

## Проверки и неизменность

| Проверка | Результат |
|---|---|
| Новые discovery tests + существующие bulk/provisional | 22/22 PASS, skip/todo 0 |
| npm test | 426 всего; 410 PASS, 16 прежних failures, новых 0 |
| npm run data (1) | PASS: 184 / архив 2 / links 208 |
| npm run data (2) | PASS: тот же результат |
| npm run data:validate | PASS: 699 ключей × 4 языка, генерация актуальна |
| npm run build | PASS, Vite production + статический недоступный admin |
| git diff --check | PASS |
| Контроль 758 защищённых исходных файлов | 0 изменений |
| Все 1290 исходных файлов текущей папки из аудита | единственная изменённая версия — package.json, добавлена одна npm-команда |
| Git HEAD/status/refs Muras1 | совпадают с исходными |

Source SHA-256: `85e9e40d347fa79566bdc2769c68cadb7fdb617ec7885908878a204e1d39b4a7`. Каталог остаётся 184, архив 2, медиа 161/23, региональные свидетельства 208. Научные поля/переводы/изображения/лицензии/архив неизменны. В package.json все значения этапа 1 сохранены, добавлено только scripts.research:discover. Остальные файлы админки этапа 1 сохранились побайтово. Свободно до аудита 7641751552 байт, после проверок 7658840064 байт (это наблюдение; сторонняя активность может менять диск). ENOSPC не было.

### Ранее существовавшие failures

Полный набор совпадает с `.generated/local-admin/final-test.log`; сравнение — `.generated/audits/stage2-failure-comparison.json`. Те же 16 ошибок были и на исходном HEAD до этапа 1 (см. docs/local-admin-validation.md). Ранее диагностированные причины — raw SHA исторических текстов при различии CRLF/LF в клоне; контрольные суммы не подменялись, исторические evidence и исходные файлы не нормализовывались. Полный suite **не зелёный**. Имена ошибок:

1. `bulk-25 keeps stable accepted taxon order, the master registry and public baseline`
2. `release review manifest withholds ambiguous scientific concepts and checks all other queues without publication`
3. `preparation preserves its 84-record baseline, keeps the manifest without scientific approval and excludes queue conflicts`
4. `catalog 178 preserves all prior 166 objects, archive, assets and research and imports exactly the authorized 12`
5. `tests\catalog-184-photo-batch-1.test.mjs`
6. `batch 2 appends precisely three evidenced images to the original 19 targets while preserving all 184 scientific objects and 158 prior image arrays`
7. `two complete photo-journal checks are deterministic and leave all tracked files unchanged`
8. `catalog 184 preserves all prior 178 objects, archive, assets and research and imports exactly the authorized 6`
9. `licensed assets are local WebP, have declared dimensions, captions and matching fingerprints`
10. `184 cards, archive, images and geometry stay unchanged; historical UI hashes retain authentic Git bytes`
11. `research inputs and publication are deterministically bound by SHA-256`
12. `scientific records, images, licences, archive, adapter and all 208 regional links remain unchanged`
13. `28.3: pre-existing scientific statuses, archive, media and other untouched tracked bytes remain immutable`
14. `28.4: scientific records, source history, media, licences, archive and 208 links remain byte-identical`
15. `28.5: publication leaves all protected bytes, science, archive, photos and links intact`
16. `provisional release appends exactly the 23 manifest IDs and preserves all 40 original records, images, sources and statuses`

## Точный список изменений этапа 2

Из уже существующих файлов изменён только `package.json`: добавлена команда research:discover поверх изменений этапа 1. Созданы:

- `scripts/discover-research-candidates.mjs`
- `tests/research-discovery.test.mjs`
- `data/research/templates/new-species-candidate.example.json`
- `docs/research/NEW_SPECIES_PLAYBOOK.md`
- `docs/research/RESEARCH_CHECKLIST.md`
- `docs/research/research-pipeline-preservation-validation.md` (этот отчёт)

Созданы локальные ignored-результаты (не перенос из Muras1):

- `.generated/audits/muras1-comparison.json`
- `.generated/audits/muras1-comparison.md`
- `.generated/audits/research-discovery-1.json`
- `.generated/audits/research-discovery-2.json`
- `.generated/audits/research-targeted-tests.log`
- `.generated/audits/stage2-build.log`
- `.generated/audits/stage2-command-results.json`
- `.generated/audits/stage2-data-1.log`
- `.generated/audits/stage2-data-2.log`
- `.generated/audits/stage2-data-validate.log`
- `.generated/audits/stage2-failure-comparison.json`
- `.generated/audits/stage2-integrity.json`
- `.generated/audits/stage2-protected-before.json`
- `.generated/audits/stage2-test.log`

Остальной dirty/untracked status — сохранённые изменения этапа 1; их полный список отделён в исходной JSON-инвентаризации и docs/local-admin-validation.md. Commit не создавался: незакоммиченная работа этапа 1 не объединялась автоматически с этапом 2. Итоговый HEAD прежний, ветка feature/local-file-admin, Git ожидаемо dirty. Никаких операций публикации или новых исследований видов не выполнялось.
