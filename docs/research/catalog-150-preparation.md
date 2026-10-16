# MURAS — подготовка каталога 150, задача 24.3

Дата: 16.10.2026. Подготовлены **23 кандидата**, из них **23 ready_for_review**, **20 изображений**, **3 placeholder**. Импорт не выполнялся. Возможный размер каталога после отдельного разрешённого импорта этого пакета — **148**, а не 150.

Рабочая ветка — feature/catalog-150. В начале работы проверены ожидаемый HEAD e3219fc63d6ed22a4260bc420cdfe2a77fe7718a и чистое дерево. Источник, public и итоговый dist содержат **125 записей**. Число **100 на основном сайте** взято из условия задачи; сайт не обновлялся. Старые 125 записей сохранены побайтно; проверены SHA-256 всех **233 файлов** исходного контрольного снимка. Дизайн, поиск, фильтры, карта, анимации, код импортёра и branch guard не менялись. В .gitattributes добавлены только правила LF для новых материалов с контрольными суммами.

## Национальная инвентаризация и отбор

Использованы сохранённые PDF Красной книги КР 2006 года и постановления №170 от 28.04.2005 в копии с изменениями №471 от 25.07.2009. Официальные PDF повторно не скачивались; их SHA-256 совпали с ранее сохранёнными.

[Полная инвентаризация](C:/Users/Asus/Desktop/Redbook/data/research/catalog-150-national-inventory.json) сохраняет 202 национальных очерка и все 219 позиций нормативной копии: 202 включённые и 17 исключённых. Из 202 очерков 125 сопоставлены с рабочим каталогом, **77 ещё не представлены**; из них выбраны 23, остальные 54 не объявлены готовыми. Исторические списки не считаются подтверждением действующего юридического статуса в 2026 году.

Сопоставлялись ID, научные имена, документированные варианты, GBIF ID, ранги и прежние очереди. Единственное продолжение прежнего кандидата — anser-indica из master-registry со статусом needs_evidence и без черновика. Старый реестр не переписывался. Архивные записи также участвовали в штатной проверке дубликатов.

Приоритетные группы проверялись раньше птиц. Прежние нерешённые вопросы по комплексу Bufo viridis, Dictyophora duplicata, Schizothorax issykkuli и Diptychus dybowskii lansdelli не подменялись принятием родительского вида; использован прежний [аудит доказательств](C:/Users/Asus/Desktop/Redbook/docs/evidence/catalog-100-needs-evidence-audit.json).

Для трёх новых приоритетных таксонов отдельно подтверждены связи имён:

- Barbus capito conocephalus → Luciobarbus conocephalus: исторический именной подвид признан видом; это не импорт родительского L. capito. Использованы [Eschmeyer’s Catalog of Fishes](https://researcharchive.calacademy.org/research/ichthyology/catalog/fishcatget.asp?spid=1489) и [обработка Artaev et al. 2025](https://zenodo.org/records/20514636). Прямая загрузка treatment.html вернула 403; содержание страницы обработки прочитано через web, скачанный файл не заявляется.
- Vipera ursinii renardi → Vipera renardi: документированное изменение ранга того же именного таксона Christoph, 1861; синонимия и Кыргызстан сверены с [Reptile Database](https://reptile-database.reptarium.cz/Vipera/renardi). Современный местный подвид не назначался.
- Kirgisobia bohnei → Kirgizobia bohnei: исправлено написание рода для того же bohnei Danilevsky, 1992; проверен [первичный каталог Danilevsky 2015, PDF с.18](https://www.zin.ru/animalia/coleoptera/pdf/danilevsky_2015_catalogue_palaearctic_cerambycoidea.pdf#page=18).

Anser indica сопоставлен с Anser indicus; для Hieraaetus fasciatus сохранён EXACT SYNONYM и отдельный EXACT ACCEPTED Aquila fasciata. Для остальных выбранных имён сохранены точные принятые ответы GBIF. Подвидовые замечания внутри видовых очерков птиц не стали дополнительными карточками.

[Ответы GBIF](C:/Users/Asus/Desktop/Redbook/docs/evidence/catalog-150-taxonomy.json), [решения отбора](C:/Users/Asus/Desktop/Redbook/docs/evidence/catalog-150-selection-decisions.json), [квитанции дополнительных источников](C:/Users/Asus/Desktop/Redbook/docs/evidence/catalog-150-source-receipts.json).

## Полный состав

Группы: рыбы — 1; рептилии — 1; членистоногие — 1; птицы — 20. Блоки: 5 / 5 / 5 / 5 / 3. Страница — русский очерк Красной книги 2006; парная кыргызская страница сохранена в evidence.

| Блок | ID | Принятое имя | Группа | Стр. | Изображение |
|---|---|---|---|---:|---|
| 1 | barbus-capito-conocephalus | Luciobarbus conocephalus | рыбы | 307 | placeholder |
| 1 | vipera-ursinii-renardi | Vipera renardi | рептилии | 345 | placeholder |
| 1 | kirgisobia-bohnei | Kirgizobia bohnei | членистоногие | 263 | placeholder |
| 1 | anser-indica | Anser indicus | птицы | 361 | Commons |
| 1 | accipiter-badius | Accipiter badius | птицы | 417 | Commons, музейные яйца |
| 2 | aquila-clanga | Aquila clanga | птицы | 419 | Commons |
| 2 | aquila-nipalensis | Aquila nipalensis | птицы | 421 | Commons |
| 2 | aquila-heliaca | Aquila heliaca | птицы | 423 | Commons |
| 2 | hieraaetus-fasciatus | Aquila fasciata | птицы | 427 | Commons |
| 2 | hieraaetus-pennatus | Hieraaetus pennatus | птицы | 429 | Commons |
| 3 | tetrax-tetrax | Tetrax tetrax | птицы | 435 | Commons |
| 3 | crex-crex | Crex crex | птицы | 437 | Commons |
| 3 | anthropoides-virgo | Anthropoides virgo | птицы | 439 | Commons |
| 3 | burhinus-oedicnemus | Burhinus oedicnemus | птицы | 441 | Commons |
| 3 | vanellus-gregarius | Vanellus gregarius | птицы | 445 | iNaturalist |
| 4 | glareola-nordmanni | Glareola nordmanni | птицы | 449 | iNaturalist |
| 4 | strix-aluco | Strix aluco | птицы | 465 | iNaturalist |
| 4 | syrrhaptes-paradoxus | Syrrhaptes paradoxus | птицы | 453 | iNaturalist |
| 4 | pterocles-alchata | Pterocles alchata | птицы | 455 | Commons |
| 4 | pterocles-orientalis | Pterocles orientalis | птицы | 457 | iNaturalist |
| 5 | columba-leuconota | Columba leuconota | птицы | 459 | iNaturalist |
| 5 | columba-eversmanni | Columba eversmanni | птицы | 461 | iNaturalist |
| 5 | bubo-bubo | Bubo bubo | птицы | 463 | iNaturalist |

У всех имеются русское и английское названия из национального очерка, принятые научные имена в полях KY/UZ и краткие описания KY/UZ/RU/EN. Неподтверждённые народные названия не создавались. Краткие переводы требуют редакторской проверки. Русские обзоры и разделы опираются на сохранённые очерки; неизвестные признаки внешности, питание или размножение оставлены null. Расхождения RU/EN, например месяц рождения дикобраза при предварительном рассмотрении и сведения о гнезде белогрудого голубя, не сглаживались вымышленными фактами.

Национальная категория в каждой карточке обозначена как историческая, 2006 года; современная IUCN-категория оставлена null. Численность — unknown, reviewStatus pending. Новых координат нет, регион — только KG с историческим источником. verified false, lastReviewedAt null; scientificReviewStatus pending сохранён в исследовательском реестре. Публикационный объект с решением владельца в черновики не добавлялся.

## Изображения

Подготовлены **20 WebP, 2 424 828 байт**: 12 Commons и 8 iNaturalist. Это 19 снимков живых птиц и один музейный снимок яиц тювика с соответствующей подписью. Сохранены автор, страница источника, прямой URL, лицензия, атрибуция, размеры, SHA-256 оригинала и WebP, тип изображения и обработка. Лицензии — CC BY 2.0/4.0 и CC BY-SA 2.0/3.0/4.0; условия SA отражены в атрибуциях. EXIF/XMP удалены. Все выбранные изображения просмотрены; независимое определение специалистом остаётся pending.

Commons ограничивал загрузки HTTP 429. Для восьми видов использованы отдельные первичные изображения iNaturalist с проверенными photo.license_code и авторскими атрибуциями. HTML-страницы iNaturalist возвращали 403; проверка выполнена через первичный API. Версия 4.0 подтверждена [официальным LicenseModule на фиксированном коммите](https://github.com/inaturalist/inaturalist/blob/2c2bec7eee618a3c7ec8b984c16ac3d457a19985/app/models/shared/license_module.rb), а не лицензией набора наблюдений.

Для более наглядного фото журавля подтверждён [Grus virgo → Anthropoides virgo](C:/Users/Asus/Desktop/Redbook/docs/evidence/catalog-150-photo-synonym.json): EXACT SYNONYM того же GBIF ID. Кадр пера филина заменён живой птицей; снимок филина сделан издалека. Чёрно-белый снимок неясыти подписан без интерпретации цвета оперения. Иностранные изображения не выдаются за современные находки в Кыргызстане.

Placeholder: barbus-capito-conocephalus и vipera-ursinii-renardi — потенциальные файлы найдены, но точное определение и права первичного изображения не доведены до совместного допуска; kirgisobia-bohnei — в ограниченном поиске Commons точных результатов нет, GBIF вернул 0 изображений.

[Поиск Commons](C:/Users/Asus/Desktop/Redbook/docs/evidence/catalog-150-photo-search.json), [дополнительный поиск](C:/Users/Asus/Desktop/Redbook/docs/evidence/catalog-150-photo-secondary-search.json), [первичные фото iNaturalist](C:/Users/Asus/Desktop/Redbook/docs/evidence/catalog-150-photo-primary-fallback.json), [версия лицензий](C:/Users/Asus/Desktop/Redbook/docs/evidence/catalog-150-inaturalist-license-map.json). Окончательные решения находятся в catalog-150-block-1-images.json … catalog-150-block-5-images.json. Файлы photo-selection фиксируют первоначальные попытки Commons; фактические источники итоговых изображений определяются квитанциями images и аудитом.

## Удержанные вне пакета

- tulipa-anadroma, eryx-tataricus, pyrus-asiae-mediae: прежние конкретные противоречия не разрешены; автоматического допуска нет.
- sonjagaster-coronatus: [Schneider et al. 2024, с.27–29](https://doi.org/10.3390/insects15080622) обсуждают не только перенос в Thecagaster, но и возможное объединение с T. brevistigma; границы таксона требуют уточнения.
- cephalota-galathea: не разрешено разночтение galatea/galathea в первичном каталоге и GBIF.
- larus-ichtyaetus: исходный ответ FUZZY SYNONYM не принят как допуск.
- cuon-alpinus: сам очерк сомневается в определении старых находок; включение в книгу не превращено в доказательство достоверного присутствия.
- hystrix-indica: штатный check обнаружил уже существующий indian-crested-porcupine в рабочем каталоге по имени и GBIF ID; повторная карточка удалена из отбора.

## Проверки и целостность

- Штатные author, check и resume: **23 ready_for_review**, 0 deferred/rejected, 0 approved/imported.
- Дубликаты по ID, именам, GBIF ID и пересечению вид/подвид относительно 125 записей, архива и внутри пакета: 0.
- validateSpecies, обязательные поля, sourceIds, четыре кратких описания, размеры/контейнер/лицензии/SHA изображений: ошибок нет.
- Обычный data:batch:import без --apply: **processed 23, added 23, unchanged 0, rejected 0, mode preview, applied false**. Это прогноз; фактических добавлений 0.
- npm test: **311/311**, ошибок 0.
- npm run data:validate: успешно, 620 ключей × 4 языка; каталог 125, архив 2.
- npm run build: успешно, 104 модуля; source/public/dist — 125.
- После сборки повторный check подтвердил все fingerprints. 233 исходных файла совпали по SHA-256. Новые изображения не экспортированы в public/dist.
- Проверены Git blobs manifest, реестра и всех 23 черновиков: контрольные суммы соответствуют рабочим файлам. Branch guard сохранил feature/catalog-150 разрешённой и main запрещённой.

[Полный аудит](C:/Users/Asus/Desktop/Redbook/docs/evidence/catalog-150-audit.json), [финальная диагностика](C:/Users/Asus/Desktop/Redbook/docs/evidence/catalog-150-final-validation.json), [dry-run](C:/Users/Asus/Desktop/Redbook/docs/evidence/catalog-150-import-dry-run.json), [результаты команд и SHA журналов](C:/Users/Asus/Desktop/Redbook/docs/evidence/catalog-150-test-validation.json).

## Manifest и будущее отдельное решение

[Manifest](C:/Users/Asus/Desktop/Redbook/data/research/catalog-150-review-manifest.json) содержит точный список 23 ID, индивидуальные draftSha256 и checkedFingerprint.

- SHA-256 manifest: **85bed9d67e06af5bbcdcd47ff8947d5deb70658c48bd89ea23e7bc4da43f5d82**
- registryFingerprint: **8fb1b765c25494f80ec996d6679aee1f0100ad50763cda3682a1f46ac8717f71**
- [Реестр](C:/Users/Asus/Desktop/Redbook/data/research/catalog-150-content-registry.json); [план блоков](C:/Users/Asus/Desktop/Redbook/data/research/catalog-150-content-manifest.json).
- ownerAuthorization null, scientificApproval null, independentReview pending, publicationAllowed false.

Ниже только шаблон будущей команды из корня проекта. Она не запускалась. ID и дата должны происходить из нового отдельного решения владельца на указанный SHA-256; прежнее разрешение задачи 24.2 относится к другому manifest.

~~~powershell
npm run data:bulk:provisional -- --registry data/research/catalog-150-content-registry.json --manifest data/research/catalog-150-review-manifest.json --mode apply --owner-role project_owner --decision-id "<ID_НОВОГО_РЕШЕНИЯ>" --date "<YYYY-MM-DD>" --reason "Отдельное разрешение владельца на предварительную публикацию manifest SHA-256 85bed9d67e06af5bbcdcd47ff8947d5deb70658c48bd89ea23e7bc4da43f5d82; независимое научное одобрение отсутствует, scientificReviewStatus pending."
~~~

## Локальные коммиты

- 8e8e4a49b908d6df46cd09c32fba646d7795ae6d — исследование, инвентаризация и первые пять черновиков.
- 807a3945a378ba252597e4387557af1ea3721bc2 — блок 2.
- 70054f70a960502d7b35622a655f9db7302d5275 — блок 3.
- 2153dbf936c34939a9e40c31fdb33f23b6e56acf — блок 4.
- 4470e6b9a8fca30b3c60184035221b2ea217c7d3 — последние три кандидата.
- 60ea8827f7430d76547765a21747e2fb6f746f6f — итоговый аудит и manifest.

Сам отчёт сохраняется отдельным документационным коммитом; его хеш определяется git log -1 -- docs/research/catalog-150-preparation.md. После него выполняется финальная проверка чистоты Git.

Approve, apply, provisional import, merge, push и deployment не выполнялись. Следующая партия не начиналась. Работа остановлена после подготовки и сохранения отчёта.
