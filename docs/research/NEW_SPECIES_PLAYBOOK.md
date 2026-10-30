# NEW_SPECIES_PLAYBOOK — исследование и публикация новых видов MURAS

Проверено по коду 31.10.2026: исходный HEAD `50951765ab52c32fdae30309cc19ede7e9bd279d`, ветка `feature/local-file-admin`, незакоммиченная локальная админка этапа 1 сохранена. База: 184 записи, 2 архивные, 161 с изображением, 23 placeholder, 208 региональных свидетельств. Это инструкция, не разрешение на публикацию и не новый научный перечень.

## 1. Инструменты и независимость от компьютера

Все команды PowerShell выполняются **из корня текущего checkout**. Имя каталога не участвует в алгоритме: PROJECT_ROOT вычисляется относительно scripts/build-data.mjs. Нужны Git, Node версии из `.nvmrc` (зависимости — `package-lock.json`, установка `npm ci`), для оптимизации фото Python и Pillow из `scripts/requirements.txt`. Точные зависимости и первоначальная установка описаны в `DEPENDENCIES.md` и README.

| Инструмент | Назначение и ограничения |
|---|---|
| `scripts/lib/research-pipeline.mjs` | createRegistry/validateRegistry/checkRegistry, состояния, canonical JSON fingerprint, локальное планирование; не научная экспертиза |
| `scripts/lib/local-research-adapter.mjs` | Локальные draft/draftFile и materials SHA-256, безопасные пути, строгий UTF-8, инспекция прав/лицензий |
| `scripts/bulk-pipeline.mjs` / `data:bulk:*` | init, check, report, resume, approve, reject, apply, provisional; locks, контрольные точки |
| `scripts/lib/bulk-import.mjs` | planBatchImport: точная идентичность, архив, вид/подвид, схема; только добавление |
| `scripts/import-species-batch.mjs` | Технический preview/apply пакетов; backup, SHA/CAS, блокировка, branch guard в CLI |
| `scripts/lib/provisional-publication.mjs` | Owner-authorized publication по точному manifest, registry/draft fingerprints; научная проверка pending |
| `scripts/prepare-research-batch.mjs` | Старый рецепт research-batch-selection для catalog-candidates.json + taxonomy evidence; не универсальный конструктор нового реестра |
| `scripts/prepare-batch-images.mjs` | Проверенный Commons-рецепт → оригиналы/квитанции/локальный WebP, resume без молчаливой перезаписи |
| `scripts/process_data.py` | optimize_image, фактические размеры/SHA-256, удаление EXIF/XMP; Pillow |
| `src/data/species-model.js`, `species-content.js`, `population.js` | Реальная схема, поддержка источниками, языки, честные unknown |
| `scripts/discover-research-candidates.mjs` | Новый офлайн stdout-отчёт сопоставления мастер-реестра; не research check/правовой перечень |
| `npm run dev:admin` | Локальная админка этапа 1 для редактирования/проверки; не заменяет национальные доказательства и bulk approval |

Ядро, локальный адаптер, import planner и bulk CLI не требуют Supabase, Vercel, Chrome или сетевого аккаунта. Сеть нужна отдельно для получения первоисточников/Commons. WebP-подготовка использует публичный Commons API и Python, а не браузер пользователя. В User-Agent prepare-batch-images.mjs осталась историческая GitHub-ссылка со старым именем проекта: это строка контакта, не файловая зависимость; в этом этапе исторический скрипт не переписывается. Старые абсолютные пути встречаются в архивных инструкциях/логах; не выполнять их буквально. Никаких новых абсолютных путей рабочего компьютера в командах этого руководства.

## 2. Найти кандидата, не создать дубликат

Начать с `data/research/redbook-master-national-lists.json`, `redbook-master-reconciliation.json`, `redbook-master-registry.json`; затем с более поздних `catalog-200-inventory.json`, `catalog-200-conflict-resolution.json`, `catalog-200-final-taxonomy-review.json` и их отчётов. Это исторические исследовательские слои, не актуальное юридическое заключение. Старый master содержит 60 кандидатов и не является полным инвентарём всех отсутствующих видов. Сохранённые NEEDS_EVIDENCE/EXCLUDED/DUPLICATE не повышать автоматически.

```powershell
npm run research:discover
# Чистый JSON без заголовков npm, только отчёт в ignored .generated:
New-Item -ItemType Directory -Force .generated | Out-Null
npm run --silent research:discover > .generated/research-discovery.json
# Другой существующий bulk-research-registry:
npm run research:discover -- --registry data/research/catalog-187-content-registry.json
```

Discovery не делает сетевых запросов и не изменяет файлов. Сопоставляет ID, принятые и исходные имена, сохранённые taxon IDs, конфликты вида/подвида и всей очереди с catalog **и demoArchive**. `existing_match_requires_review` — обнаруженная связь, `identity_conflict` — конфликт/пересечение, `needs_research` — отсутствие найденной связи, а не доказательство новизны или национального включения. Неизвестные ему синонимы требуют ручного поиска в национальных документах, ревизиях и прежних пакетах. storedState не переоценивается. Проверить ID, исходное имя и авторство, гомотипные/гетеротипные синонимы, accepted name и ранг, стабильные идентификаторы и исторический taxon concept. Не объединять вид и подвид и не подставлять parentKey/nubKey другого ранга.

## 3. Национальный первоисточник и таксономия

Для каждого кандидата прочитать конкретный очерк Красной книги КР (например, второе издание 2006) и документированную позицию исторического постановления №170 (2005), изменения №471 (2009), если применимо. Записать печатную страницу **и** PDF page index/ссылку, номер приложения/строки, точное историческое имя, авторство, цитируемую категорию и год. Отдельные очерки, номера постановления и исключённые позиции не считать одним и тем же набором. Доступность URL не доказывает, что прочитан оригинал.

В кандидате `nationalRedBook` содержит `listed`, `category`, `edition`, `year`, `sourceIds`, плюс `basis: historical_edition` и `claimsCurrentLegalStatus: false`. Для `current_legal_list` требуются отдельное актуальное правовое подтверждение, `claimsCurrentLegalStatus: true` и поддержка `nationalRedBook.currentLegalStatus`. Исторический документ не объявляется действующим правовым реестром. Национальная категория не переносится в `iucn`: у IUCN собственные таксон, территория, дата и источник.

Подтвердить acceptedScientificName, авторство и SPECIES/SUBSPECIES по ревизии/научной базе. GBIF — идентификатор конкретного принятого taxon dataset, не автоматическая гарантия корректности. `taxonomyEvidence`: canonicalName, rank, status ACCEPTED, matchType EXACT, taxonId `gbif:<число>` либо поддерживаемый `iucn-gbif:<число>`, sourceId; источник с этим taxonId должен поддерживать scientificName. Учитывать и фиксировать API issues/различия backbone vs dataset. Ранг должен соответствовать числу частей canonical name; не менять валидатор ради кандидата.

Для countryOccurrence указать KG, источник исторического/современного присутствия и пределы вывода. Книжная находка 1907 года не подтверждает нынешнюю популяцию. `confirmed: true` допустимо лишь для подтверждённого исходного утверждения с описанием его исторического охвата. Не выводить современную численность или размножение из единичной находки.

## 4. Источники и доказательства

Каждый source: уникальный id, title, publisher, URL HTTP(S), реальная дата accessedAt в YYYY-MM-DD, language при наличии, supports — точный список подтверждаемых полей. Например, `scientificName`, `nationalRedBook.listed`, `regions.0`, `content.ecology`; источник, не подтверждающий экологию, не получает этот supports. Для страниц/строк, авторства, метода и ограничений использовать точное библиографическое название/notes, не вымышленного издателя. Сохранить библиографию, сам документ/ответ, URL и дату получения. У недоступного оригинала честно отметить пределы чтения, не выдавать snippet за полную проверку.

`materials` содержит `{ "path": "относительный/путь", "sha256": "64 hex" }`; каждый файл проверяется по точным байтам. readLocal ограничивает каждый вход 16 MiB и запрещает выход за корень через symlink. Большой PDF нельзя молча подставить в materials: сохранить оригинал с raw SHA в исследовательском архиве, подготовить проверяемый локальный фрагмент/снимок допустимого размера с указанием исходного документа и границ чтения; не ослаблять лимит и не объявлять непрочитанный оригинал проверенным. Отдельный `draftFile` также входит в fingerprint с raw SHA. Сохранять EOL оригиналов: CRLF/LF меняют byte SHA, хотя canonical JSON fingerprint может совпадать. Не обновлять исторические суммы ради зелёного теста и не заменять старые evidence современными ответами. Старые и новые доказательства хранить рядом с датами/решениями. Не публиковать секреты, подписанные приватные URL или личные данные наблюдателей без проверки.

```powershell
Get-FileHash -Algorithm SHA256 data/research/evidence/document.pdf
# Canonical fingerprint реестра (это НЕ raw SHA файла):
node --input-type=module -e "import{readFileSync}from'node:fs';import{fingerprint}from'./scripts/lib/research-pipeline.mjs';console.log(fingerprint(JSON.parse(readFileSync(process.argv[1],'utf8'))))" data/research/your-registry.json
```

## 5. Реестр и модель вида

Пример `data/research/templates/new-species-candidate.example.json` — валидный bulk-research-registry с пустым pending-черновиком, **не реальный таксон и не допустимый импорт**. Slug `replace-with-documented-id` заменить документированным ID; научные значения до исследования null. Шаблон проходит структурный validateRegistry/validateSpecies, но обязан не проходить researchErrors/publication readiness.

```powershell
$registry = 'data/research/new-species-work.registry.json'
npm run data:bulk:prepare -- --input data/research/templates/new-species-candidate.example.json --registry $registry --id new-species-work --batch-size 20
```

Команда создаёт новый файл исключительно (`wx`), не перезаписывает старый; init сбрасывает входные состояния/approval. После заполнения кандидата использовать inline `draft` **или** `draftFile`, не оба. Реестр ограничен 200 кандидатами, партия 1–25. Списки contradictions/missingData не очищать до разрешения конкретного противоречия доказательствами.

| Поле draft | Реальное представление |
|---|---|
| id / scientificName / group | slug, принятое canonical name, группа из species-groups.js |
| names | `{ky, uz, ru, en}`: строка с доказательством либо null; местные названия не сочинять |
| taxonomy | kingdom/phylum/class/order/family/genus: строка или null с supports |
| nationalRedBook | listed/category/edition/year/sourceIds; **без** служебных basis/claimsCurrentLegalStatus, которые остаются в кандидате |
| iucn | category/year/sourceIds, null если нет соответствующего глобального assessment |
| habitat | null или description (4 языка), sourceIds |
| regions | null до исследования; для готового нового вида country KG с names и sourceIds; новые региональные связи — отдельный доказательный процесс |
| threats / conservationMeasures | null или непустые массивы `{text: {ky,uz,ru,en}, sourceIds}` |
| population | Точная форма UNKNOWN_POPULATION из population.js; type unknown, value/min/max null, reviewStatus pending, неподтверждённые поля null, sourceIds [] |
| images / sources | [] до подготовки, затем доказанные метаданные и библиография |
| verified / lastReviewedAt | false / null; импорт не является независимой научной проверкой |
| content | shortDescription/overview/appearance/ecology/diet/reproduction/distribution, каждый null или `{text:{ky,uz,ru,en},sourceIds}` |

Краткий текст — до 300 знаков на язык, раздел — до 20000; хотя бы один настоящий текст и источники нужны для ненулевого раздела. Подготовить полноценный русский обзор и проверенные краткие тексты KY/UZ/RU/EN; отсутствующие переводы оставить null с честным штатным fallback и отметить в readiness. Название по-латыни как явно обозначенный fallback не выдаётся за народное имя. Не добавлять отсутствующее в схеме корневое `scientificReviewStatus`: в черновике pending сохраняется в population.reviewStatus и исследовательском пакете; при provisional publisher добавляет **publication.scientificReviewStatus: pending**, independentReviewer null. Не заполнять publication заранее.

## 6. Фото и воспроизводимость медиа

Искать точный таксон (включая подвид) в Commons, коллекциях, гербариях, GBIF/iNaturalist. Сайт-агрегатор не даёт автоматических прав на конкретный файл. Проверить оригинальную страницу/версию, автора, exact subject, оригинальный файл, лицензию и её URL/версию, условия атрибуции/ShareAlike. Не использовать похожий вид, AI-имитацию, неизвестные права, NC/ND без отдельного правового решения. Фото из зоопарка не подтверждает местонахождение в Кыргызстане. Гербарий/иллюстрацию подписывать по реальному типу. Отсутствие допустимого фото оставляет `images: []`, placeholder разрешён.

В старом photoResearch-рецепте prepare-batch-images проверяет rightsConfirmed/originalPageRead/eligibleForNextEditorialStage, совпадение страницы, автора/лицензии и таксона. Лицензии: CC BY/BY-SA 2.0/3.0/4.0, CC0; PD требует документированного PD-self; Apache 2.0 требует локальные LICENSE/NOTICE, copyright и SHA. Не выставлять эти признаки на основании одного поиска.

```powershell
# Только если уже подготовлен проверенный research-batch-selection и photoResearch:
npm run data:batch:photos -- --selection data/research/your-photo-selection.json --research data/research/your-photo-research.json --output .generated/your-image-receipts.json --python python
# Вариант прямого использования того же оптимизатора для проверенного оригинала:
python scripts/process_data.py --optimize-input .generated/your-original.jpg --optimize-output assets/images/species/your-species.webp --max-edge 1800 --quality 82
```

Вручную просмотреть готовые пиксели; `receipt.visualReview.reviewed: true` фиксировать только после настоящего просмотра, не как независимое подтверждение определения. Сохранить originalPage, original/source URL, author, license/licenseUrl, attribution, modifications, licenseVerified, path, width/height, sha256, caption KY/UZ/RU/EN (неизвестное null). В квитанции — исходные размеры, originalSha256, дата, metadata URL/revision. Сохранять исходные фото и квитанции; `.generated` может содержать единственные originals и не должна чиститься как обычный cache. Оптимизация 1800px quality82 без upscaling/EXIF/XMP не заменяет контроль резкости и научной читаемости. Повторная подготовка не должна молча заменять файл. При дополнении опубликованного вида сохранить все прежние изображения/лицензии и append-only фото-журнал с новыми доказательствами.

## 7. Состояния, проверки и редактор

| Состояние | Значение |
|---|---|
| pending | Вход принят, проверки ещё не выполнены |
| needs_evidence | Нет научного подтверждения/таксономии/источников либо есть обязательные пробелы |
| research_ready | Исследовательские проверки пройдены, но полного допустимого draft ещё нет или модель не прошла финальную проверку |
| needs_photo | Переданное фото не прошло проверку; пустое images само по себе не блокирует готовность |
| ready_for_review | Полный технически допустимый draft, требуется явный просмотр редактора |
| approved_for_import | Настоящий редактор одобрил **текущий** candidateFingerprint с датой и основанием |
| imported | Импортировано, повторное совпадение идемпотентно |
| rejected | Дубликат, конфликт или явное отклонение с причиной; не удалять историю |

```powershell
node scripts/bulk-pipeline.mjs --help
npm run data:bulk:check -- --registry $registry
npm run data:bulk:report -- --registry $registry --report .generated/new-species-check.json
# Не read-only: сохраняет диагностику/черновики, каталог не публикует.
npm run data:bulk:resume -- --registry $registry
```

check/report без --report только читают входные файлы и выводят stdout; с --report пишут лишь `.generated`. Это технический dry-run, не решение. Exit2 — rejected, exit1 — ошибка; deferred может иметь exit0, поэтому читать states/errors, а не только exit code. Нужны все актуальные fingerprints, отсутствие дубликатов/блокеров и просмотр конкретного draft/источников/фото. Никакое storedState, AI-резюме или скрипт не является независимым одобрением.

Следующие команды — **для будущего отдельного разрешённого действия**, не запускать автоматически из руководства. Переменные должны содержать реальные данные, не вымышленные подписи:

```powershell
# После фактического решения редактора:
$decisionDate = Get-Date -Format 'yyyy-MM-dd'
npm run data:bulk:approve -- --registry $registry --candidate $candidateId --reviewer $actualEditor --date $decisionDate --reason $actualReason
# Альтернатива при отклонении:
npm run data:bulk:reject -- --registry $registry --candidate $candidateId --reason $actualReason
# Повторная техническая проверка перед применением:
npm run data:bulk:check -- --registry $registry
# Только в отдельно разрешённой ветке и после просмотра всех одобренных записей:
npm run data:bulk:apply -- --registry $registry --batch 1
```

approve не устанавливает verified и не выдумывает независимую научную рецензию; изменение evidence/draft отменяет старый fingerprint. Основной путь публикации — data:bulk. Низкоуровневый `data:batch:import` сам не собирает доказательства редакторского решения, а export-функция importBatchFile не проверяет Git-ветку (проверка у CLI). Не использовать прямой вызов как обход workflow. Существующие старые рецепты можно просмотреть без записи каталога:

```powershell
npm run data:batch:prepare -- --selection data/research/your-reviewed-selection.json --images .generated/your-image-receipts.json --output .generated/your-reviewed-batch.json
npm run data:batch:import -- --input .generated/your-reviewed-batch.json --report .generated/your-batch-preview.json
```

Для **owner-authorized provisional** нужен отдельный настоящий допуск владельца на точный неизменный пакет. Импортёр требует manifest documentType `independent-scientific-review-manifest`, schemaVersion1, registry, canonical registryFingerprint, упорядоченные candidateIds/candidates, каждый checkedFingerprint/draftFile/draftSha256 и withheldCandidates. Название формата не означает, что научная проверка выполнена. Универсального CLI-генератора manifest сейчас нет: собрать из актуального check/adapter с отдельной проверкой соответствия, не копировать суммы старого пакета. Сохранить raw SHA-256 manifest, проверить все local materials/drafts, исключённые ID и состав разрешения. Самостоятельное создание owner authorization запрещено.

```powershell
# Лишь после отдельного настоящего решения владельца на эти manifest + registry:
Get-FileHash -Algorithm SHA256 $manifest
npm run data:bulk:provisional -- --registry $registry --manifest $manifest --mode dry-run --owner-role project_owner --decision-id $actualDecisionId --date $decisionDate --reason $actualOwnerReason
# После успешного dry-run и сверки неизменности разрешённого пакета:
npm run data:bulk:provisional -- --registry $registry --manifest $manifest --mode apply --owner-role project_owner --decision-id $actualDecisionId --date $decisionDate --reason $actualOwnerReason
```

Даже provisional dry-run требует действительного основания владельца: для обычного исследования пользоваться check/report. При применении создаётся `data/research/publication-decisions/<decisionId>.json`, связанный с manifest SHA/registry/candidate/draft, и provisional publication с pending/null reviewer. Нельзя менять verified, lastReviewedAt или население ради допуска. При требовании дополнительных доказательств остановиться, не обходить защиту. После импорта повторный защищённый preview должен дать 0 additions и unchanged по той же партии.

## 8. Обновление уже опубликованного вида

Bulk importer только добавляет: существующий ID с отличающимися данными отвергается. Не удалять старую карточку/источники для повторного импорта. Для нового научного источника сохранить датированный research record, прежние bibliographic evidence/decisions, описать что и почему меняется, проверить taxon identity и запросить явное редакционное решение. Затем использовать существующий локальный редактор (`npm run dev:admin`, save draft → validate/preview → явный apply) либо отдельно согласованное изменение источника с теми же валидаторами. Новая админка не снимает исторические научные ограничения: тесты неизменности могут намеренно блокировать обновление до документированного решения и отдельной задачи. Этап 2 не даёт разрешения на такие обновления.

Локальные draft/checkpoint/migration originals не подменяют опубликованные evidence. Не стирать исходный источник, не переиспользовать ID решения для другой версии, не сбрасывать rejected/pending в approved. Новое доказательство хранить с датой и границами применимости. Population unknown не равно нулю или вымиранию; диапазон не заменять средним; глобальную оценку не переносить на KG.

## 9. Будущие ветки и защита main

Фактический IMPORT_BRANCHES в scripts/import-species-batch.mjs: feature/catalog-expansion, feature/species-content, feature/bulk-import, feature/bulk-import-next, feature/catalog-150, feature/catalog-200. Текущая feature/local-file-admin и feature/release-preparation не разрешены для bulk apply. Список исторически узкий; это ожидаемая блокировка, не причина запускать функцию напрямую. В этом этапе allowlist **не менялся**.

Безопасный ближайший механизм: в отдельной разрешённой задаче добавить **одно точное имя** будущей ветки, сохранить запрет main/master/detached HEAD/произвольных feature и протестировать CLI apply/provisional apply на временном Git-проекте до любого каталожного изменения. Решение владельца всё равно привязано к пакету, а не к самому названию ветки. Запрет произвольного feature/* остаётся.

Для масштабирования можно отдельно спроектировать reviewable policy-файл точных branch → registry + manifest SHA + срок/decision ID, с независимым deny main/master, строгим parser, fail-closed отсутствием/просрочкой и повторной сверкой HEAD/пакета перед записью. Не доверять переменной окружения или имени feature как разрешению. Это **предложение, не реализованная защита**. Требуемые тесты: разрешённая точная ветка, main/master всегда запрещены даже при policy, другая/пустая/detached ветка, устаревшее решение, чужой SHA/registry, повреждённая policy, отсутствие побочных записей при отказе, backup/idempotence и CAS. Уже есть bulk-pipeline/provisional-publication tests; research-discovery tests дополнительно фиксируют текущие разрешённые и запрещённые имена.

## 10. Проверки, Git и долгосрочное сохранение

Сначала проверить место на диске и сохранить исходные raw SHA защищённых файлов. Не запускать тяжёлые проверки параллельно. По завершении подготовки каталог остаётся прежним; импорт — только отдельная задача с решением.

```powershell
Get-PSDrive -PSProvider FileSystem
node --test tests/research-discovery.test.mjs
node --test tests/bulk-pipeline.test.mjs tests/provisional-publication.test.mjs
npm test
npm run data
npm run data
npm run data:validate
npm run build
git diff --check
git status --short
git diff --stat
# Только после разрешения зафиксировать конкретный проверенный пакет:
git add -- data/research/your-registry.json docs/research/your-preparation.md
git commit -m 'Prepare documented species research packet'
```

Это инструкция для будущих задач: в текущем этапе commit/merge/push/import не выполняются. Перед публичной Git-публикацией отдельно проверить diff, лицензии, отсутствие secrets/private data, тесты, ветку и разрешение; отправка/merge/deploy — отдельные явно разрешённые операции. Не коммитить пользовательские drafts или весь `.generated` автоматически.

На новом компьютере восстановить Git и проверенные научные originals/materials, закреплённые зависимости и Python; npm ci → локальные проверки. Доступность внешних URL через 5–10 лет не гарантирована. Нужны независимые проверенные архивные копии первоисточников, оригиналов/лицензий, истории решений и локальных evidence, SHA-инвентарь и защищённое хранение. .generated, Git stash и browser localStorage обычным clone не восстанавливаются. Факт их наличия фиксирует `.generated/audits/muras1-comparison.md`; старую папку не удалять, перенос выполнять только после отдельного согласования.

Пока отсутствуют: универсальный валидируемый manifest-builder CLI; единый экспорт/проверка полного research-архива; полное автоматическое разрешение исторических синонимов (оно не должно заменять науку); независимая рецензия/переводческая экспертиза; современный юридический аудит национального перечня. Исторические исследования и реальные approvals нельзя воспроизвести одной установкой npm.
