# MURAS №25.6 — предпубликационная готовность пакета 166 → 178

Дата проверки: **28 октября 2026 года**, Asia/Bishkek.

Пакет №25.5 прошёл техническую предпубликационную проверку: **12 допустимых кандидатов**, **2 фотографии**, **10 placeholder**. Публичный каталог остался на **166 записях**, архив — **2**. Новые карточки не опубликованы. Готовность не означает независимое научное одобрение или разрешение владельца на импорт.

## Исходное состояние и сохранность

- Фактический каталог проекта теперь находится в **C:\Users\Asus\Desktop\Muras**; прежняя папка Redbook отсутствует. Проверка выполнена в существующем репозитории, новая ветка или копия не создавалась.
- Ветка: **feature/catalog-200**.
- Ожидаемый и фактический текущий HEAD: **3fb5c04641e291948f3e3b8d70cf08c693b2b5ec**. HEAD в этой задаче не менялся.
- До проверок git status --porcelain=v1 пустой. Прочитаны отчёт №25.5, фактические registry/manifest, привязанные решения №25.4 и сохранённые национальные, таксономические и фотографические доказательства.
- Все **1074 ранее отслеживаемых файла** сверены по SHA-256 до и после проверок и сборки: **1074/1074 побайтово неизменны**, включая архив, исследования, код импортёра и все прежние изображения. Дополнительно прошёл существующий аудит №25.5 относительно его исходной базы.
- Исходный source и public/dist содержат **166** записей. План импортёра сохраняет первые 166 объектов в том же порядке, весь архив и остальные поля source без изменений: проверено deepEqual.
- SHA-256 data/species.source.json: **79197b9323386983951a56c889b5246884a5d9a17bc203b94ad077bd96892360**.

## Неизменённый пакет и контрольные суммы

Registry: **data/research/catalog-181-content-registry.json** — 15 исследовательских черновиков: 12 ready_for_review и 3 needs_evidence.

Manifest: **data/research/catalog-181-review-manifest.json** — ровно 12 элементов в candidateIds и candidates; отложенные перечислены только в withheldCandidates.

| Контроль | Фактическое значение | Сравнение с №25.5 |
|---|---|---|
| SHA-256 manifest | **0ba2e9ea7922b13b10baed4b37ea48fb61befe766c170120379ccb51c6c1882e** | совпадает |
| registryFingerprint, канонический fingerprint существующего pipeline | **3acddc2f7f4f682e37f258e3ac1610f7646a4a63ac767f8ec04b17b9940ab42c** | совпадает |
| SHA-256 файла registry | **797b8e530bc1934101a735e93d904ed1eca74728942b9ecb324b62c6249fa125** | совпадает |

Индивидуальные draftSha256, checkedFingerprint и SHA-256 материалов проверены существующим local adapter и checkRegistry. Реестр, manifest, тексты и изображения не пересоздавались и не исправлялись. Контрольные суммы отчёта №25.5 сверены с фактическими файлами до запуска dry-run.

## Точные 12 допущенных ID

Страницы относятся к сохранённому национальному документу 2006 года. Названия и ранги сохранены согласно решениям №25.4; SPECIES — вид, SUBSPECIES — подвид.

| ID | Принятое имя | Ранг | Точный taxon ID | Страницы книги | Изображение |
|---|---|---|---|---|---|
| anemone-obtusiloba | Anemonastrum obtusilobum | SPECIES | gbif:10404690 | 110–111 | фото |
| berberis-kaschgarica | Berberis ulicina | SPECIES | gbif:3980999 | 114–115 | placeholder |
| primula-macrocalyx | Primula veris subsp. macrocalyx | SUBSPECIES | gbif:5832513 | 180–181 | фото |
| sonjagaster-coronatus | Thecagaster coronata | SPECIES | gbif:296781457 | 250–251 | placeholder |
| capoetobrama-kuschakewitschi-orientalis | Capoetobrama kuschakewitschi | SPECIES | gbif:4286997 | 302–303 | placeholder |
| schizothorax-issykkuli | Schizothorax pseudoaksaiensis | SPECIES | gbif:4286958 | 308–309 | placeholder |
| diptychus-dybowskii-lansdelli | Gymnodiptychus dybowskii | SPECIES | gbif:2362516 | 310–311 | placeholder |
| eryx-tataricus | Eryx miliaris | SPECIES | gbif:2465319 | 340–341 | placeholder |
| terpsiphone-paradisi | Terpsiphone paradisi leucogaster | SUBSPECIES | gbif:6086394 | 470–471 | placeholder |
| otonycteris-hemprichi | Otonycteris leucophaea | SPECIES | gbif:7584928 | 492–493 | placeholder |
| cervus-elaphus-asiaticus | Cervus canadensis | SPECIES | gbif:134092547 | 512–513 | placeholder |
| allactaga-saltator | Orientallactaga sibirica | SPECIES | gbif:104051133 | 524–525 | placeholder |

**Не допущены и не заменены другими таксонами:** papilio-alexanor-voldemar, megalodontes-kuznetzovi, polochrum-pamirepandum. Все три сохраняют needs_evidence и причины №25.5. В preview отсутствуют. Их неполнота не скрывается за результатом проверки допустимой дюжины.

## Научные сведения, языки и фотографии

У 12 кандидатов проверены точное имя, ранг и реальный принятый GBIF usage ID в сохранённых ответах первоисточников. Для Thecagaster используется Catalogue of Life, для Cervus — ITIS, для Orientallactaga — NCBI Taxonomy через GBIF; эти исходные чек-листы не выдаются за backbone match. Синонимия и национальные понятия взяты из №25.4, ссылки на научные и национальные источники, sourceIds и fingerprints сохранены. Новый поиск таксонов не проводился. Дубликатов ID, имён, GBIF ID и пересечений вид/подвид с каталогом, архивом и внутри допустимой партии не обнаружено.

Все 12 имеют verified:false, lastReviewedAt:null, population:unknown без численной оценки, независимую проверку pending. scientificReviewStatus:pending хранится в исследовательском registry и manifest согласно действующей схеме. Черновики не содержат фиктивного publication; будущий защищённый provisional importer сам добавляет publication.scientificReviewStatus:pending и independentReviewer:null при реальном разрешении владельца. Национальная категория относится к историческому году и охранявшемуся понятию; не назначена новая IUCN-оценка и не утверждается современное присутствие только на основании книги 2006 года.

Названия и краткие описания доступны на **KY/UZ/RU/EN**. Неподтверждённые узбекские народные названия заменены латинским научным именем; кыргызский fallback для Cervus прозрачен. Длинный научный текст реально русский; KY/UZ/EN длинные разделы null, действующий scientificContent явно возвращает русский fallback. Источники и соответствие sourceIds проверены. Это технический и документальный контроль существующих переводов, а не независимая филологическая или научная подпись.

**Именно среди допустимых 12: 2 фотографии и 10 placeholder**; остальные три исследовательских черновика в эти числа не включены. Placeholder — пустой images и существующее обозначение интерфейса, без фотографии чужого вида.

| ID | Автор | Лицензия конкретного файла | WebP | SHA-256 |
|---|---|---|---|---|
| anemone-obtusiloba | Hedwig Storch | CC BY-SA 3.0 | 1800×1428 | 461a2aa25ab5d3b30178ad6975abf0102ff3e8ba79ccabf1aaa46e98cb8533d8 |
| primula-macrocalyx | Krzysztof Ziarnek, Kenraiz | CC BY-SA 4.0 | 1350×1800 | d5ec59b08be3673d41303d12740da3b57a899dcf35ad9a015345de287abceacd |

Метаданные и лицензии сверены с неизменёнными [сохранёнными Commons receipts](../evidence/catalog-181-images.json), атрибуциями и исходными страницами файлов в черновиках. Оба локальных WebP полностью декодированы повторно; размеры и SHA совпадают, EXIF/XMP отсутствуют. Фотографии из Исландии и Армении подписаны как зарубежные и не подтверждают современную популяцию в Кыргызстане. Изображения прежних 166 карточек не менялись; новые изображения не утекли в public/dist.

## Branch guard и два read-only dry-run

Существующий allowlist явно содержит feature/catalog-200. Проверено: main, master, произвольная feature/arbitrary и feature/catalog-201 запрещены. Правок allowlist, импортёра и тестов не потребовалось. Существующие тесты tests/provisional-publication.test.mjs и tests/catalog-166-publication.test.mjs проверяют разрешение catalog-200 и запрет main.

Пакет preview собран только из manifest.candidateIds и неизменённых черновиков; approval и publication не добавлялись. Выполнены команды:

```powershell
npm run data:batch:import -- --input .generated/catalog-178/preview.json --report .generated/catalog-178/dry-run-1.json
npm run data:batch:import -- --input .generated/catalog-178/preview.json --report .generated/catalog-178/dry-run-2.json
```

| Показатель | Первый запуск | Повторный запуск |
|---|---:|---:|
| Исходные записи | 166 | 166 |
| Допустимые добавления | 12 | 12 |
| Прогноз итога | 178 | 178 |
| Ошибки / rejected | 0 | 0 |
| Повторы / unchanged | 0 | 0 |
| Изменены прежние объекты | 0 | 0 |
| applied | false | false |

Оба отчёта **побайтово идентичны**, SHA-256 каждого: **93c8e7dfeb17ce6ec02194d7ad6ee43983c0e911c3895c1ab956fb1870670357**. Десять предупреждений — ожидаемые placeholder. Режим **preview**, без --apply. Owner-authorized provisional dry-run также не вызывался: он требует явных реквизитов разрешения, которых текущая задача не предоставляет.

## Обязательные проверки

| Команда / проверка | Результат |
|---|---|
| npm test | **321/321**, 0 ошибок, 0 пропусков; exit 0 |
| npm run data, первый запуск | exit 0; каталог 166, архив 2 |
| npm run data, второй запуск | exit 0; каталог 166, архив 2; оба лога побайтово одинаковы |
| npm run build | exit 0, prebuild/build/postbuild завершены; dist **34096208 байт** |
| node scripts/validate-catalog-181-preparation.mjs | до и после проверок — успешно; свежий bulk check совпадает с сохранённым содержательным отчётом |
| node scripts/prepare-catalog-181.mjs --verify | успешная read-only воспроизводимость черновиков и registry |
| Свежий checkRegistry | 15 проверено: 12 ready_for_review, 3 needs_evidence; 0 rejected/approved/imported |
| Сохранность | 166 исходных объектов, 2 архивных, все прежние фотографии и 1074 tracked-файла неизменны |

Рабочие отчёты и логи этой проверки сохранены в игнорируемой папке **.generated/catalog-178/**: candidate-audit.json, bulk-check.json, initial-tracked-files.json, preview.json, dry-run-1.json, dry-run-2.json, npm-test.log, data-1.log, data-2.log, build.log. Ранее зафиксированные evidence-файлы №25.5 не изменялись.

## Точная команда для будущего отдельного разрешения

**Команда ниже не выполнялась.** Текущая задача не предоставляет разрешение владельца. ID, дата и текст решения здесь не придуманы. После отдельного явного разрешения на указанные выше **12 ID, SHA-256 manifest и registryFingerprint**, при повторной проверке неизменности пакета и рабочей ветки, из корня проекта можно вызвать существующий защищённый pipeline:

```powershell
$ownerDecisionId = Read-Host "ID отдельного фактического решения владельца (slug)"
$ownerDecisionDate = Read-Host "Фактическая дата этого решения, YYYY-MM-DD"
$ownerAuthorizationText = Read-Host "Точный текст отдельного разрешения владельца на этот manifest с сохранением scientificReviewStatus pending"

npm run data:bulk:provisional -- `
  --registry data/research/catalog-181-content-registry.json `
  --manifest data/research/catalog-181-review-manifest.json `
  --mode apply `
  --owner-role project_owner `
  --decision-id $ownerDecisionId `
  --date $ownerDecisionDate `
  --reason $ownerAuthorizationText `
  --report .generated/catalog-178/owner-provisional.json
if ($LASTEXITCODE -ne 0) { throw "Защищённый импорт остановлен; не обходить проверку" }
```

Read-Host запрашивает реквизиты уже полученного отдельного решения, а не создаёт его. Дата должна быть фактической датой этого решения; 28 октября не назначено датой разрешения автоматически. Причина должна явно разрешать предварительную образовательную публикацию manifest SHA-256 **0ba2e9ea7922b13b10baed4b37ea48fb61befe766c170120379ccb51c6c1882e**, сохраняя отсутствие независимого научного одобрения и scientificReviewStatus pending. Manifest должен остаться тем же файлом с registryFingerprint **3acddc2f7f4f682e37f258e3ac1610f7646a4a63ac767f8ec04b17b9940ab42c**.

Защищённый provisional importer заново сверяет manifest, registry, индивидуальные fingerprints, draft SHA и технический допуск, проверяет branch guard, пишет действительное owner-решение в журнал и выполняет атомарный пакет только при отсутствии блокеров. Флаг --mode apply выше является исключительно частью будущей инструкции. Обычный data:bulk:apply с научным approve вместо неё не предлагается.

## Завершение

Текущий HEAD: **3fb5c04641e291948f3e3b8d70cf08c693b2b5ec**; коммит в рамках этой задачи не создавался. Из неигнорируемых файлов создан только настоящий отчёт docs/research/catalog-178-release-readiness.md; ранее отслеживаемые файлы не изменены. После записи отчёта проверяется git status и повторно сверяются контрольные суммы. Apply, approve, provisional import, merge, push и deployment не выполнялись. Новые кандидаты не исследовались. Научное одобрение и owner authorization не создавались.
