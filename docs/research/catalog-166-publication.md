# MURAS — предварительная публикация каталога 166, задача 25.3

Дата решения владельца и выполнения: **21.10.2026**, Asia/Bishkek. Ветка **feature/catalog-200**, исходный HEAD **8e92593a313d96450013207b47f6b1891f0030f4**. Перед началом рабочее дерево было чистым; опубликовано 150 записей.

## Результат

Существующий data:bulk:provisional успешно опубликовал **ровно 16** разрешённых записей. Source, public и dist содержат **166 записей**; прежние **150 объектов** и архив из двух примеров сохранены без изменений. У партии **13 лицензированных изображений** и **3 placeholder**. Группы новой партии: **9 растений, 5 птиц, 2 млекопитающих**.

**kosopoljanskia-hebecarpa не опубликован** и остаётся needs_evidence. Разночтение исторических VU/EN не исправлялось. В разрешённом списке manifest этого ID нет; он сохранён только в withheldCandidates.

Коммит успешного импорта: **066cb069e44d45cab84fcd3d6e6cf7a908531a0f**.

## Точные опубликованные ID

| ID | Принятое имя | Группа | Иллюстрация |
| --- | --- | --- | --- |
| sorbus-persica | Hedlundia persica | plants | placeholder |
| amygdalus-petunnikowii | Prunus petunnikowii | plants | 1 |
| kosopoljanskia-turkestanica | Schrenkia turkestanica | plants | 1 |
| alajja-anomala | Eriophyton anomalum | plants | 1 |
| otostegia-schennikovii | Moluccella olgae | plants | placeholder |
| salvia-vvedenskyi | Salvia vvedenskii | plants | 1 |
| stemmacantha-aulieatensis | Leuzea aulieatensis | plants | 1 |
| centaurea-alaica | Rhaponticoides alaica | plants | placeholder |
| pyrethrum-leontopodium | Richteria leontopodium | plants | 1 |
| phoenicopterus-roseus | Phoenicopterus roseus | birds | 1 |
| chlamydotis-macqueenii | Chlamydotis macqueenii | birds | 1 |
| numenius-tenuirostris | Numenius tenuirostris | birds | 1 |
| larus-ichtyaetus | Ichthyaetus ichthyaetus | birds | 1 |
| dendrocopos-major | Dendrocopos major | birds | 1 |
| hemiechinus-hypomelas | Paraechinus hypomelas | mammals | 1 |
| allactaga-severtzovi | Allactaga severtzovi | mammals | 1 |

Placeholder: sorbus-persica, otostegia-schennikovii, centaurea-alaica. Ни один другой кандидат и ни одна следующая партия не добавлены.

## Разрешение и неизменность пакета

Использован штатный provisional importer, owner-role **project_owner**, mode **apply**, decision-id **muras-25-3-owner-provisional**, date **2026-10-21**. Журнал: **data/research/publication-decisions/muras-25-3-owner-provisional.json**. Reason дословно:

> отдельное разрешение владельца на предварительную образовательную публикацию manifest SHA-256 a56943c3295e3619a6e5c6d418071b813cc89970499e655b1cf923bbf428aefe; независимая научная проверка остаётся pending.

Manifest: **data/research/catalog-167-review-manifest.json**. Registry: **data/research/catalog-167-content-registry.json**. До применения проверены ожидаемый HEAD, чистота Git, SHA-256 manifest, registryFingerprint, все 16 draftSha256/checkedFingerprint, SHA материалов, отсутствие дубликатов и held ID.

registryFingerprint остаётся:

```text
2aa4ae2a31a6a84375eb9f463091a744f06a02683981e0015e4b538027de7a78
```

Manifest, registry, все подготовленные черновики и прежние научные документы **не изменялись**. Сравнение каждой новой записи с соответствующим черновиком допускает единственное добавление — штатный объект publication. Подтверждена побайтовая идентичность рабочих файлов и Git-объектов коммита для source, public, manifest, registry, журнала и черновиков.

Branch guard уже явно разрешал feature/catalog-200, поэтому его менять не потребовалось. Main по-прежнему запрещён; тест сохранён. Дополнительного разрешения или блокера штатный provisional importer не запросил. Защита, список допустимых веток и импортёр не переписывались.

## Научный статус и источники

Все новые записи имеют verified: false, lastReviewedAt: null, publication.status: provisional, scientificReviewStatus: pending, independentReviewer: null; научное одобрение в журнале — null. Population.type: unknown и reviewStatus: pending, неподтверждённые числа отсутствуют. Национальные категории сопровождаются историческим годом **2006**.

Для каждой записи сохранены источники и библиография подготовленного пакета: национальный очерк **Красной книги КР, 2-е издание 2006** ([первичный PDF](https://macrolepidoptera.ru/lnk/282.pdf)), документированная редакция **постановления №170 от 2005 года с изменениями 2009 года** ([FAOLEX](https://faolex.fao.org/docs/pdf/kyr104340.pdf)), точные сохранённые GBIF-ответы и дополнительные POWO, гербарные и научные источники, указанные в individual sources. Исторические документы не объявлены актуальным правовым перечнем на 2026 год; новое исследование не проводилось.

Ограничения сохранены:

- Numenius tenuirostris: глобальное **EX, 2025** по окончательному обновлению BirdLife отделено от исторической национальной **CR, 2006**. Музейное изображение не выдаётся за живую современную птицу; национальный population не заменён вымышленным значением.
- Paraechinus hypomelas и Allactaga severtzovi: историческое включение не утверждает современную подтверждённую популяцию Кыргызстана. Старые национальные сведения и расхождения со списками стран MDD явно оговорены.
- Dendrocopos major: старые коллекционные сведения и местная форма brevirostris не превращены в новую современную популяцию или дополнительную карточку подвида.
- Moluccella olgae: текст ограничен национальным историческим Otostegia schennikovii; широкая принятая концепция не подменяет узкую.
- Phoenicopterus roseus и Chlamydotis macqueenii не подменены современными американским P. ruber и африканским C. undulata.
- UZ: именем служит подтверждённое научное название; непроверенные народные названия не придуманы. Краткие описания имеются на KY/UZ/RU/EN, длинные разделы — на русском с языковой маркировкой fallback.

Все 13 изображений перенесены из уже проверенного пакета без изменения байтов. Источники конкретных изображений: квитанции **docs/evidence/catalog-167-block-1-images.json**, **catalog-167-block-2-images.json**, **catalog-167-block-3-images.json** и individual images/sources публичных записей. В них сохранены авторы/поставщики, первичные страницы, лицензии, определения и SHA-256. Среди иллюстраций четыре гербарных листа МГУ, музейный экземпляр Naturalis и зарубежные фотографии с явными подписями контекста.

Все 13 публичных WebP полностью декодированы Pillow, размеры и SHA совпадают, EXIF/XMP и повреждений нет. Все прежние фотографии и оригиналы неизменны. В публичном каталоге всего 143 уникальных лицензированных WebP, повторных SHA нет.

## Проверки и совместимость

| Проверка | Итог |
| --- | --- |
| Provisional dry-run перед импортом | processed 16, added 16, unchanged 0, rejected 0; applied false |
| Штатный apply | added 16, rejected 0; applied true |
| Повторный provisional dry-run | **added 0, unchanged 16, rejected 0**, applied false |
| npm test | **321/321**, ошибок 0 |
| npm run data, первый финальный запуск | успешно, каталог 166 |
| npm run data, второй финальный запуск | успешно, каталог 166; байты идентичны |
| npm run build | успешно, 104 модуля |
| Source/public/dist | по 166 записей; public и dist совпадают |
| Пагинация | **24/24/24/24/24/24/22**, обычный и photo-first порядок, без пропусков/повторов |
| Поиск и фильтры | KY/UZ/RU/EN, все опубликованные имена; группы, статусы и региональные пересечения |
| Компоненты новых записей | **192 SSR-рендера**: 16 × 4 языка × карточка/модальное окно/страница |
| Локальный HTTP preview | все 16 маршрутов — 200; 13 WebP — 200 с совпадающим SHA; placeholder — 200 |
| Размер dist | **34096208 байт**, около 32.52 MiB |

Первый полный запуск выявил семь несовместимых тестовых допущений/ограничений. Они устранены до финального успешного запуска:

- Проверки релиза 150 переведены на его **побайтовый снимок** data/backups/catalog-166; новый tests/catalog-166-publication.test.mjs проверяет живые 166 записей. Старые ожидаемые научные хеши не менялись.
- У нового кыргызского имени «Брандттын кирписи» есть буквальная подстрока «ирпис». Существующее правило прямого совпадения подавляет fuzzy-подстановку ирбиса. Логика поиска не изменена; тесты теперь явно проверяют этот случай и сохраняют прочие проверки опечаток.
- Для кроншнепа тестируется подтверждённый год глобальной оценки 2025, а не прежнее предположение, что у всех записей год null. Новые non-Commons media сопоставляются с разрешёнными квитанциями и SHA.
- Форматированный исходник вырос до **2197672 байт**, превысив прежний лимит админ-редактора 2 MiB. Минимально установлен конечный лимит **4 MiB**; проверки схемы, небезопасных ключей, завышенного размера и draft-envelope сохранены и протестированы, полный цикл импорта/экспорта админ-редактора проходит. Это отдельный ограниченный редактор, не provisional importer.
- Старые checksum-проверки модели админ-редактора используют **точный прежний файл** data/backups/catalog-166/admin-model.js с прежним SHA-256 61dd00662bbaaea0f2d64cd218c9891109ad4f46914bcbe3a99ffc705880372c. Проверки не пропущены; исторические данные не переписаны.

Из исходных 1008 отслеживаемых файлов **995** побайтово неизменны. Разрешённые отличия перечислены в docs/evidence/catalog-166-preservation.json: два файла опубликованных данных, минимальное ограничение админ-редактора/комментарий, регрессионные проверки/исторический аудитор и LF-правило новых квитанций. Дизайн, карта, анимации, перевод интерфейса, реализация поиска и прежние 150 карточек не менялись.

## Контрольные суммы

| Файл | SHA-256 |
| --- | --- |
| data/species.source.json | 79197b9323386983951a56c889b5246884a5d9a17bc203b94ad077bd96892360 |
| public/data/species.json | ccc17e1b7592b1c5aa11c129a6935e3472ca7bf0b6ed940904fb06e89d484b4c |
| data/research/catalog-167-review-manifest.json | a56943c3295e3619a6e5c6d418071b813cc89970499e655b1cf923bbf428aefe |
| data/research/catalog-167-content-registry.json | af04c03391ef2fe7e06fd49ef1319b2fb1d739438b3f822f59124786f81f971e |
| data/research/publication-decisions/muras-25-3-owner-provisional.json | 46ecdab8c21f147154ad122b3b506366641a99eca7ebe104fad403f47cf630f7 |

Исходный source 150: **a5c78f317609a07e630c87791080234d850c2d5aa488ecfc93f3bb728770a1d4**; его точная копия сохранена в data/backups/catalog-166/species.source.json. Все индивидуальные fingerprints остаются в неизменённом manifest и журнале решения.

Машинные результаты: docs/evidence/catalog-166-publication-audit.json, catalog-166-preservation.json, catalog-166-preparation-audit.json (проверка до импорта), catalog-166-pre-import-dry-run.json, catalog-166-import-result.json, catalog-166-repeat-dry-run.json, catalog-166-http-smoke.json.

## Git и оставшиеся вопросы

Коммит импорта и проверок: **066cb069e44d45cab84fcd3d6e6cf7a908531a0f**. Перед добавлением этого отчёта git status был чистым; отчёт сохраняется отдельным следующим локальным коммитом, его HEAD и окончательная чистота дерева сообщаются в итоговом ответе.

Незакрытый научный вопрос — только ранее удержанный kosopoljanskia-hebecarpa (VU/EN); он не опубликован. Для разрешённых 16 нет оставшихся блокеров импорта, тестов или сборки. Научная проверка всех новых записей остаётся pending.

Merge, push и deployment не выполнялись. Локальный preview после проверки закрыт. Следующие виды не исследовались.
