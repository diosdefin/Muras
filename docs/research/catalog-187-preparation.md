# MURAS №25.9 — подготовка девяти READY-кандидатов

Дата: **2026-10-28**, Asia/Bishkek. Ветка: **feature/catalog-200**. Исходный HEAD: **841110e08bbd262d3624a5553f39e682cf921c93**; исходное дерево было чистым. Каталог: **178**, архив: **2**.

**Подготовлены 9 содержательных черновиков. Технически допустимы 6, заблокированы 3.** Два независимых read-only dry-run дали **178 → 184**, **6 additions**, **0 errors**, **0 duplicates**. В текущем каталоге по-прежнему **178** записей. Число 187 в имени пакета обозначает исходную цель, а не результат импорта.

## Точный состав и таксономические идентификаторы

Использованы только девять READY из [решений №25.8](../../data/research/catalog-200-final-taxonomy-review.json). Все их ID, принятые имена и ранги связаны с SHA-256 этого файла. Другие 13 NEEDS_EVIDENCE не готовились. Реестры и fingerprints прежней подготовки, 178 опубликованных объектов, архив и прежние лицензии/изображения не изменены.

| ID | Научное имя; авторство | Ранг | GBIF ID / источник | Результат | Фото |
|---|---|---|---|---|---|
| `sorbaria-olgae` | Sorbaria tomentosa; (Lindl.) Rehder | SPECIES | [gbif:3012117](https://api.gbif.org/v1/species/3012117) | ready_for_review | placeholder |
| `dorema-microcarpum` | Ferula namanganica; Sennikov | SPECIES | [gbif:295893852](https://api.gbif.org/v1/species/295893852) | ready_for_review | placeholder |
| `tianschaniella-umbellifera` | Tianschaniella umbellulifera; B.Fedtsch. ex Popov, 1951 | SPECIES | [gbif:10874182](https://api.gbif.org/v1/species/10874182) | ready_for_review | placeholder |
| `parnassius-loxias-tashkorensis` | Parnassius loxias loxias; Püngeler, 1901 | SUBSPECIES | [gbif:307395113](https://api.gbif.org/v1/species/307395113) | ready_for_review | placeholder |
| `parnassius-apollo-merzbacheri` | Parnassius apollo merzbacheri; Fruhstorfer, 1906 | SUBSPECIES | [gbif:177946994](https://api.gbif.org/v1/species/177946994) | ready_for_review | placeholder |
| `cuon-alpinus` | Cuon alpinus; (Pallas, 1811) | SPECIES | [gbif:2434317](https://api.gbif.org/v1/species/2434317) | ready_for_review | 1 |
| `papilio-alexanor-voldemar` | Papilio alexanor voldemar; Kreuzberg, 1989 | SUBSPECIES | не установлен | needs_evidence | placeholder |
| `megalodontes-kuznetzovi` | Megalodontes kuznetzovi; Dovnar-Zapolskij, 1930 | SPECIES | не установлен | needs_evidence | placeholder |
| `polochrum-pamirepandum` | Polochrum pamirepandum; Kurzenko, 1986 | SPECIES | не установлен | needs_evidence | placeholder |

Всего: **3 растения, 5 членистоногих, 1 млекопитающее**. В допустимом наборе: **3 растения, 2 членистоногих, 1 млекопитающее**. Все три удержанных кандидата — членистоногие.

Точные принятые записи Catalogue of Life найдены для **Ferula namanganica (295893852, SPECIES)** и **Parnassius loxias loxias (307395113, SUBSPECIES)**; ENA taxonomy — для **P. apollo merzbacheri (177946994, SUBSPECIES)**. Это реальные ключи конкретных научных datasets в GBIF. Они не объявлены принятыми backbone-ключами. Отмеченные API issues `BACKBONE_MATCH_NONE` / `CLASSIFICATION_NOT_APPLIED` сохранены в доказательствах и описании источников; имя и ранг проверены непосредственно в записи. Переход национального концепта обоснован ревизиями №25.8, а не одним ответом агрегатора. `nubKey`, `parentKey` и ключи другого ранга не подставлялись.

Действующий валидатор уже принимает точные принятые записи указанного вида/подвида из научных GBIF datasets. Модель, импортёр, публичный интерфейс и branch guard не изменялись. Защита `feature/catalog-200` проверена; `main` остаётся запрещённой.

## Содержание, языки и научные ограничения

У всех девяти есть названия и краткие описания **KY/UZ/RU/EN**, русский обзор **189–327 слов**, исторический национальный источник и библиография. Названия UZ оставлены точными принятыми латинскими именами: непроверенные народные названия не сочинялись. KY-заголовки проверены визуально по книге; для Cuon alpinus выбран латинский fallback, поскольку книжное «Чөө» может быть неоднозначным. Краткие переводы редакционные и сохраняют pending, без заявления об независимой лингвистической экспертизе. Длинные разделы на других языках имеют null и используют штатный русский fallback.

Биология, местообитания, питание, размножение и угрозы пересказаны только в пределах конкретного национального очерка/указанной научной работы. Неподтверждённые детали не заполняются по аналогии. Для Sorbaria угрозы оставлены null: предположение английской версии о выпасе не повышено до установленной причины. Для Cuon раздел внешности null: научное морфологическое описание заново не реконструировано.

- **Sorbaria:** видовой охват tomentosa с явной исторической местной формой olgae / var. tomentosa; разновидность не превращена в подвид или вторую карточку. Книжная находка 1871 года не представлена как подтверждённая современная популяция.
- **Ferula:** гомотипный переход от Dorema microcarpum документирован; несовпадение стран современного POWO и исторического национального очерка не скрыто. Разночтение сроков плодоношения не исправлено догадкой.
- **Tianschaniella:** документированная связь правильного имени с книгой и тип LE01013870. Различающиеся календарные сроки языковых версий прямо отмечены.
- **Parnassius loxias:** выбран номинативный подвид по Huang 2023; исторические сведения tashkorensis не распространены на весь вид. Год протолога 1983/1984 остаётся библиографическим вопросом.
- **P. apollo merzbacheri:** сохранён подвид, синонимия chryseis документирована. Разночтения размаха крыльев и библиографического года не унифицированы; историческая III / LR-nt не превращена в современную IUCN NT.
- **Cuon:** тип ЗИН из Ат-Баши, 1907, и генетическая проба **2019**, анализ **2021**, публикация **2022** разграничены. Современная постоянная/размножающаяся популяция и численность в Кыргызстане не подтверждены.

Все новые материалы: **verified:false**, **lastReviewedAt:null**, **scientificReviewStatus:pending**, независимая проверка pending, **population:unknown**. В действующей схеме публичного объекта нет корневого scientificReviewStatus; pending явно сохранён в каждом элементе исследовательского registry и manifest, а в черновиках — population.reviewStatus. Поле публикации не создавалось: его нельзя заполнять без отдельного настоящего решения владельца. ownerAuthorization и scientificApproval — null. Национальные категории снабжены историческим 2006 годом и не подменены IUCN.

## Три заблокированных кандидата

- **papilio-alexanor-voldemar:** подвид научно поддерживается ревизией 2025, но GBIF возвращает синонимический SUBSPECIES, ведущий к видовому alexanor. Ключ родителя не назначен.
- **megalodontes-kuznetzovi:** национальное имя и ревизионная синонимия подтверждены; ограниченный точный поиск GBIF не дал принятого видового reference.
- **polochrum-pamirepandum:** самостоятельный вид отличается от repandum в научном перечне 2024 и музейной базе; точный принятый ключ нужного ранга не установлен.

Все три имеют содержательные черновики, но **needs_evidence** в этом registry и отсутствуют в candidateIds допустимого manifest. Это технические блокировки идентификаторов при сохранённом научном READY №25.8. Альтернативные namespace, DOI или общий URL списка не превращены в вымышленные GBIF ID. Прежний пакет №25.5 также не изменён.

## Конкретные источники

- [Красная книга КР 2006](https://macrolepidoptera.ru/lnk/282.pdf): Sorbaria **126–127**, Dorema **174–175**, Tianschaniella **200–201**, P. loxias **266–267**, P. apollo **268–269**, Papilio **270–271**, Megalodontes **276–277**, Polochrum **278–279**, Cuon **496–497**. Сохранённый PDF повторно не скачивался; hash и именные привязки — [national accounts](../evidence/catalog-187-national-accounts.json). Постановление №170/2005 с изменениями №471/2009 учитывается отдельно по таблице №25.8; действующим правовым реестром 2026 года не объявлено.
- [Song & Hong 2021, ревизия Sorbaria, с.17](https://doi.org/10.11646/phytotaxa.487.1.1).
- [Puchałka et al. 2023, Dorema внутри Ferula](https://link.springer.com/article/10.1007/s00606-023-01857-z), [POWO Ferula namanganica](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:77331188-1).
- [Овчинникова 2015, типификация, с.164–170](https://www.binran.ru/files/journals/Novitates/2015_46/NSPV-46_20-Ovchinnikova.pdf), [WWF 2017, таблица 2, с.9](https://files.worldwildlife.org/wwfcmsprod/files/Publication/file/7fw9zpus8w_AHM_Kyrgyzstan_Climate_Vulnerability_Assessment_WEB_Final.pdf).
- [Huang 2023, обе именные обработки Parnassius](https://www.researchgate.net/publication/376002146_Contributions_to_the_study_of_butterflies_from_Xinjiang_-1_the_genus_Parnassius_LatreiLLe_1804_Lepidoptera_Papilionidae_by), [каталог типовых экземпляров ННПМ НАН Украины, с.71](https://museumkiev.org/upload/zoo/Catalog_types_Zoological_museum_2001.pdf).
- [Nazari et al. 2025, voldemar stat. rev.](https://doi.org/10.1093/biolinnean/blaf078).
- [Taeger 1998, каталог Megalodontes](https://www.researchgate.net/publication/269992346_Die_Megalodontesidae_Europas_Hymenoptera_Symphyta).
- [Lopes et al. 2024, таблица Sapygidae, с.450](https://doi.org/10.11646/zootaxa.5507.3.3), [музейный WaspWeb](https://www.waspweb.org/Pompiloidea/Sapygidae/Classification/Classification_world_Sapygidae.htm).
- [ЗИН, тип Cuon №23894](https://www.zin.ru/collections/Mammalia/catalog_en.html?taxon_id=1030631073673807), [Cancellare et al. 2022](https://www.canids.org/CBC/24/Dhole_distribution_Kyrgyzstan.pdf), [GenBank MZ813093](https://www.ncbi.nlm.nih.gov/nuccore/MZ813093).

Полные ссылки, sourceIds, способы доступа и ограничения чтения — в черновиках и неизменённом индексе №25.8. У таксонных API-ответов сохранены полные записи; из metadata datasets сохранены относящиеся к проверке библиографические поля и hash полного JSON. Общая многомегабайтная библиография всего Catalogue of Life и контакты всех участников не включены в пакет девяти кандидатов.

## Изображение и placeholder

Всего **1 фотография и 8 placeholder**. Только среди шести допущенных: **1 фотография и 5 placeholder**. Снимок [Cuon alpinus (Dhole).jpg](https://commons.wikimedia.org/wiki/File:Cuon_alpinus_(Dhole).jpg): **Hans Hillewaert**, **CC BY-SA 3.0**, ревизия **1156232029**, животное в неволе в Великобритании, 7 июля 2010. Полный источник, авторство и подпись не используются как доказательство нахождения в Кыргызстане.

WebP подготовлен штатным `scripts/process_data.py`, max-edge 1800, quality 82; **1350×1800**, **186812 байт**. SHA-256: **e52d745554b52850ff6f4f3e70ae24f430c390ab920e610e6a89ffb000f25b47**. SHA-256 оригинала: **a76fbdbb3170c167a1acf3ec07267860baf281df956f1b254dfeae18a6539616**. Оригинал и результат просмотрены; контейнер проверен, EXIF/XMP отсутствуют. Атрибуция, лицензия и модификации сохранены в объекте изображения и [receipt](../evidence/catalog-187-images.json).

Ограниченный поиск касался только новых кандидатов; прежние 178 не исследовались повторно. Для восьми не включён проверенный лицензированный файл. Это не заявление, что таких фотографий не существует. Подмена снимками родительского вида либо других таксонов не выполнялась. Новый WebP не опубликован.

## Registry, manifest и воспроизводимость

- Registry: **data/research/catalog-187-content-registry.json**.
- Manifest: **data/research/catalog-187-review-manifest.json**.
- Черновики и редакционные факты: **data/research/catalog-187-content/**.
- **SHA-256 manifest: ea602571d211f948738d5016c70fd235f01d211b144e324687764a99906922f7**.
- **registryFingerprint: e464a27088b435607d373d58154fff1fcb385ad55ba3d294765c17384c4800e6**.
- SHA-256 registry: **30a22dc3960bba6996af6529127f19dd9bf58663166528fb2bc18570378bb73d**.
- Источник решений: **data/research/catalog-200-final-taxonomy-review.json**, SHA-256 **93c0b979d51aea0553cc39087cad14a88ac29a535da2f96eb36f8fc308205f2f**.

Пакет обработан партиями **3 + 3 + 3** существующими `data:bulk:resume` и `data:bulk:check`. Все индивидуальные draftSha256 и checkedFingerprint проверены, материалы привязаны SHA-256. Состояния: ready_for_review **6**, needs_evidence **3**, approved_for_import **0**, imported **0**, rejected **0**. Имя documentType manifest соответствует существующему контракту; technicalReadinessOnly:true и все научные статусы pending явно исключают трактовку как научного одобрения.

Для повторной офлайн-проверки без записи каталога:

```powershell
node scripts/prepare-catalog-187.mjs --verify
node scripts/validate-catalog-187-preparation.mjs
npm run data:bulk:check -- --registry data/research/catalog-187-content-registry.json
```

Новые локальные `.gitattributes` в data/research и docs/evidence задают LF только для новых путей catalog-187. Существующие правила и все прежние файлы не менялись. Контрольные суммы staged JSON побайтно совпали с рабочими файлами.

## Dry-run и итоговые проверки

В двух отдельных Node-процессах выполнен существующий `npm run data:batch:import` с preview-пакетом из шести допустимых черновиков и без `--apply`. Отчёты [dry-runs](../evidence/catalog-187-dry-runs.json) идентичны целиком, applied:false. Разрешение владельца не создавалось и для этих preview не имитировалось.

| Проверка | Результат |
|---|---|
| Два dry-run | 178 исходных; 6 additions; прогноз 184; 0 errors; 0 duplicates |
| npm test, исходный параллельный запуск | 325/326; ENOSPC при записи временного fixture |
| npm test с флагом после glob | ресурсный сбой сохранился; подробности в validation |
| node --test --test-concurrency=1 tests/*.test.mjs | **326/326**, 0 ошибок, 0 пропусков |
| npm run data, два раза | оба успешны; 178 каталог, 2 архив |
| npm run build | успешно; в dist 178 записей |
| Офлайн-аудит пакета и --verify | успешно; 9 исходных READY, 6 допустимых, 3 удержанных, fingerprints совпали |
| Побайтная сохранность | **1094/1094** прежних tracked-файлов идентичны, включая 300 файлов изображений |
| dist | 169 файлов; 34692982 байт |

На диске C оставалось около 200 MiB, поэтому одновременные временные копии тестов упирались в ENOSPC. Полный тот же набор успешно выполнен последовательным запуском, с флагом Node перед путями тестов. Ни тесты, ни код проекта, ни настройки раннера ради прохождения не редактировались; файлы старых задач не удалялись. Это инфраструктурная проблема параллельного запуска, а не пропущенная проверка. Полные итоги и hash логов: [validation](../evidence/catalog-187-validation.json).

SHA-256 исходного каталога остаётся **088f8f2fc78462a1721e293974b1054dc7a80b215f25bd111be3565318948f60**. Все 178 объектов, архив, старые научные статусы, фотографии, источники, лицензии, прежние registry/manifest и fingerprints побайтно неизменны.

## Коммиты и Git

Коммит подготовленного пакета: **6410ac3291c534010e808dec061995084ed69ec9** — `Prepare nine catalog-187 drafts with six eligible and three identifier holds`. **HEAD пакета при составлении отчёта: 6410ac3291c534010e808dec061995084ed69ec9**, Git status: **clean**, проверено после коммита. Этот отчёт сохраняется отдельным завершающим коммитом; его фактический hash и окончательный HEAD сообщаются после фиксации, в итоговом ответе задания.

Approve, apply, provisional import, merge, push и deployment не выполнялись. Новая партия не начата.
