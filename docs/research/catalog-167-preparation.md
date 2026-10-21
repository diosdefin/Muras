# MURAS — подготовка кандидатов для каталога 167, задача 25.2

Дата: **21.10.2026**, Asia/Bishkek. Ветка: **feature/catalog-200**. Исходный HEAD: **09bab0d0d63aabb5899f0033d5d2033979816ed2**, перед началом дерево было чистым. Исходный и итоговый опубликованный каталог — **150 записей**, архив — 2.

## Результат

Сохранены черновики **всех 17 исходных кандидатов A** из инвентаризации 25.1, без подмены другими таксонами. Группы: **10 растений, 5 птиц, 2 млекопитающих**. После финальной проверки **16 ready_for_review**, **1 needs_evidence**: **kosopoljanskia-hebecarpa / Schrenkia hebecarpa**. Независимого научного одобрения, разрешения владельца на этот пакет и импортированных записей — **0**.

У Schrenkia hebecarpa первоисточник противоречив: на кыргызской с. 160 стоит **VU**, на русской с. 161 и в английском резюме — **EN**. Расхождение подтверждено просмотром отрисованных страниц, а не только извлечённым текстом. Историческое включение и самостоятельный вид подтверждены; спор касается категории. По условию задачи кандидат удержан в **needs_evidence**, категория null, черновик сохранён, из manifest будущей публикации он исключён. Нужна предметная редакторская сверка/документированное разрешение разночтения; выбор категории большинством языковых версий не выполнялся.

Таким образом, нынешний manifest способен довести каталог только до **166**, а не 167. Внешне файл по-прежнему называется catalog-167 как пакет задачи; его фактический состав — **16**. Семнадцатый кандидат не подменён и не допущен ради целевого числа.

## Полный исходный список и готовность

| ID | Историческое → принятое имя | Группа | Страницы книги 2006 | Итог | Иллюстрация |
| --- | --- | --- | --- | --- | --- |
| sorbus-persica | Sorbus persica → Hedlundia persica | plants | 140–141 | ready_for_review | placeholder |
| amygdalus-petunnikowii | Amygdalus petunnikowii → Prunus petunnikowii | plants | 142–143 | ready_for_review | изображение |
| kosopoljanskia-hebecarpa | Kosopoljanskia hebecarpa → Schrenkia hebecarpa | plants | 160–161 | needs_evidence | placeholder |
| kosopoljanskia-turkestanica | Kosopoljanskia turkestanica → Schrenkia turkestanica | plants | 162–163 | ready_for_review | изображение |
| alajja-anomala | Alajja anomala → Eriophyton anomalum | plants | 190–191 | ready_for_review | изображение |
| otostegia-schennikovii | Otostegia schennikovii → Moluccella olgae | plants | 192–193 | ready_for_review | placeholder |
| salvia-vvedenskyi | Salvia vvedenskyi → Salvia vvedenskii | plants | 196–197 | ready_for_review | изображение |
| stemmacantha-aulieatensis | Stemmacantha aulieatensis → Leuzea aulieatensis | plants | 214–215 | ready_for_review | изображение |
| centaurea-alaica | Centaurea alaica → Rhaponticoides alaica | plants | 216–217 | ready_for_review | placeholder |
| pyrethrum-leontopodium | Pyrethrum leontopodium → Richteria leontopodium | plants | 222–223 | ready_for_review | изображение |
| phoenicopterus-roseus | Phoenicopterus ruber → Phoenicopterus roseus | birds | 372–373 | ready_for_review | изображение |
| chlamydotis-macqueenii | Chlamydotis undulata → Chlamydotis macqueenii | birds | 432–433 | ready_for_review | изображение |
| numenius-tenuirostris | Numenius tenuirostris → Numenius tenuirostris | birds | 446–447 | ready_for_review | изображение |
| larus-ichtyaetus | Larus ichtyaetus → Ichthyaetus ichthyaetus | birds | 450–451 | ready_for_review | изображение |
| dendrocopos-major | Dendrocopos major → Dendrocopos major | birds | 468–469 | ready_for_review | изображение |
| hemiechinus-hypomelas | Hemiechinus hypomelas → Paraechinus hypomelas | mammals | 482–483 | ready_for_review | изображение |
| allactaga-severtzovi | Allactaga severtzovi → Allactaga severtzovi | mammals | 526–527 | ready_for_review | изображение |

У всех 17 — видовой ранг SPECIES. Точные GBIF-ключи, исторические названия, национальные позиции постановления и происхождение повторно использованных ответов записаны в registry, taxonomy и индивидуальных национальных accounts. Состав строго совпадает с 17 A; 34 B и дубликат C не включались.

## Тексты и научные ограничения

Для каждого черновика подготовлены краткие описания KY/UZ/RU/EN, русское энциклопедическое введение и подтверждённые тематические разделы. Кыргызские названия сверены с визуальными заголовками книги. **В UZ именем служит принятое научное название**, поскольку подтверждённых узбекских народных названий в материалах нет; краткие описания переведены на узбекский. Непроверенные народные названия не придуманы. EN — заголовки книги с нормализацией орфографии; Asian Houbara подтверждено IFHC. Полные длинные тексты подготовлены на русском; пустые другие языки длинных разделов не выдаются за переведённые.

Во всех черновиках verified: false, lastReviewedAt: null, population.type: unknown, population.reviewStatus: pending; в исследовательском registry scientificReviewStatus и independentScientificReview — pending. Корневое поле scientificReviewStatus в публичную модель не добавлялось. Обязательная независимая проверка не подменена подготовкой редактором. Неизученные рацион, размножение или угрозы остаются null/объяснены в missingFacts. Новые неподтверждённые координаты и численные оценки отсутствуют.

Существенные оговорки:

- **Numenius tenuirostris**: в финальном обновлении BirdLife от 10.10.2025 подтверждено глобальное вымирание. В карточке отдельно указаны глобальная **EX, 2025** и историческая национальная **CR, 2006**. Старое предположение книги о будущих залётах не представлено как современное. Музейное изображение явно подписано. Источник: [BirdLife, окончательное обновление 2025](https://www.birdlife.org/news/2025/10/10/restoring-habitats-key-to-fighting-extinctions/).
- **Otostegia schennikovii → Moluccella olgae**: гетеротипная синонимия подтверждена POWO. Описание и исторические места ограничены национальным O. schennikovii, а не всем принятым видом. Разночтения географического текста языковых версий не исправлялись догадками; фотография широкого M. olgae не подставлена.
- **Leuzea aulieatensis / Rhaponticum aulieatense / Stemmacantha aulieatensis** — гомотипные комбинации одного вида. Предпочтения GBIF и POWO показаны раздельно. Сомнительный размер семянок в сантиметрах из книги не скопирован и не исправлен вымышленной размерностью.
- **Phoenicopterus roseus** и **Chlamydotis macqueenii** определены по прямо названным местным roseus/macqueenii в исторических очерках. Современные американский P. ruber и африканский C. undulata не подставлены.
- **Paraechinus hypomelas**, **Allactaga severtzovi**, **Dendrocopos major**: исторические сведения не объявлены подтверждённой современной популяцией Кыргызстана. У двух млекопитающих сохранена оговорка об отсутствии KG в современном списке стран MDD; это не трактуется как доказанное отсутствие вида. Казахстанские маршрутные плотности тушканчика не перенесены в национальную численность.
- **Larus ichtyaetus**: применено уже сохранённое документальное разрешение орфографии и синонимии; прежний ID сохранён. Дополнительный кандидат под исправленным родом не создан.
- Историческое LR/lc тушканчика сохранено в описании издания, без произвольного преобразования в современный код национальной категории.

Книга 2006 года и документированная редакция постановления №170 с изменениями 2009 года подтверждают **историческое** включение. Они не объявлены актуальным правовым реестром 2026 года. Новое исследование остальных национальных позиций не проводилось.

## Изображения

Подготовлено **13 WebP** общим размером **2 548 164 байта**, **4 placeholder** среди 17 черновиков. В допущенной части manifest: **13 изображений + 3 placeholder**; отложенный Schrenkia hebecarpa имеет ещё один placeholder.

Четыре скана гербария МГУ: Schrenkia turkestanica, Eriophyton anomalum, Salvia vvedenskii, Rhaponticum aulieatense. Их автор сканов ELAR corporation, правообладатель Moscow State University и лицензия CC BY 4.0 записаны из конкретных media GBIF и страниц коллекции. Prunus petunnikowii — фото Алексей Ябс из Узбекистана, CC0, с проверкой конкретного фото и определения iNaturalist. Richteria — подписанное изображение из Illustrated Flora of Tajikistan, CC BY 4.0. Остальные семь — лицензированные Commons-изображения птиц и млекопитающих, включая музейный экземпляр кроншнепа.

У экземпляра Naturalis поле Artist в метаданных ошибочно содержит систематического автора Vieillot, 1817. Он **не назван фотографом**: атрибуция дана коллекции/поставщику Naturalis, фотограф не указан, музейный номер и исторические данные сохранены. Текущая лицензия страницы — CC0; прежний BY-SA в закомментированном старом исходнике отмечен в квитанции.

Для каждого принятого изображения сохранены первичная страница, автор/поставщик, лицензия, URL лицензии, определение таксона, контекст, исходный и WebP SHA-256, размеры, преобразования и результат визуального просмотра. Зарубежные фотографии и исторические гербарные листы не используются как доказательство современной кыргызстанской популяции. Все 13 WebP декодированы и проверены, EXIF/XMP отсутствуют.

Причины placeholder:

- sorbus-persica: Commons дал нерелевантные каталоги; проверенные iNaturalist/GBIF-фото имеют NC, который не входит в поддерживаемые лицензии существующего обработчика.
- kosopoljanskia-hebecarpa: лицензия и автор скана подтверждены, но MW0593744 превышает лимит существующего обработчика **30 MiB**; после одного повтора выбран placeholder. Другие сборы не перебирались ради изображения.
- otostegia-schennikovii: нет подтверждённого изображения узкого национального концепта; снимок сообщества и широкого принятого вида не заменяет его.
- centaurea-alaica: ограниченный поиск Commons, GBIF и iNaturalist не дал подходящих изображений.

Прежние 150 изображений повторно не исследовались и не заменялись. Новые файлы не попали в публичный экспорт или dist.

## Registry, manifest и fingerprints

- Registry: **data/research/catalog-167-content-registry.json** — все 17, с одним needs_evidence.
- Manifest: **data/research/catalog-167-review-manifest.json** — 16 допущенных, 1 явно withheld.
- Исходный research registry: data/research/catalog-167-research-registry.json.
- Состав/блоки: data/research/catalog-167-content-manifest.json.
- Черновики: data/research/catalog-167-content/drafts/*.json.
- Источниковое решение: docs/evidence/catalog-167-final-source-decisions.json.

SHA-256 окончательного manifest:

```text
a56943c3295e3619a6e5c6d418071b813cc89970499e655b1cf923bbf428aefe
```

registryFingerprint:

```text
2aa4ae2a31a6a84375eb9f463091a744f06a02683981e0015e4b538027de7a78
```

Все индивидуальные checkedFingerprint, draftSha256 и SHA-256 материалов совпадают. Fingerprints предыдущих блоков проверялись перед каждым следующим блоком. Финальные осознанные отличия от промежуточных checkpoint: документированный источниковый блок Schrenkia hebecarpa и замена латинской c на кириллическую с в русском слове «Кыргызстанские» у дятла. Научные сведения последним исправлением не изменены. Аудит проверяет эти исключения отдельно; старые черновики прежних релизов не затронуты.

Manifest publicationAllowed: false, ownerAuthorization: null, scientificApproval: null. Прежние разрешения владельца на другие пакеты к нему не применяются.

## Проверки

| Проверка | Результат |
| --- | --- |
| npm test | **316/316**, ошибок 0 |
| npm run data, первый запуск | каталог 150, архив 2; успешно |
| npm run data, второй запуск | каталог 150, архив 2; успешно; байты выходов совпадают |
| npm run build | успешно, 104 модуля |
| Проверка инвентаризации 25.1 | 421 историческая позиция, A/B/C 17/34/1; прежние связи целы |
| bulk check/resume | 16 ready_for_review, 1 needs_evidence, 0 approved, 0 imported |
| Обычный dry-run | processed 16, added 16, unchanged 0, rejected 0; applied false |
| Аудит исходных файлов | 946 из 949 прежних файлов побайтово неизменны; три разрешённых изменения ниже |
| Защищённые данные/исследования/изображения | все 707 прежних файлов совпадают с начальным SHA-256 |
| Размер dist | **31 327 320 байт** (около 29,88 MiB), публичный каталог 150 |

Обычный dry-run выполнен существующим data:batch:import **без --apply**, через пакет .generated/catalog-167/preview.json, собранный из существующих bulk checkpoint. Отложенный кандидат исключён. Это технический просмотр, а не provisional import или разрешение публикации.

Branch guard изменён только явным добавлением feature/catalog-200 в существующий allowlist; main, master и произвольные feature-ветки по-прежнему запрещены. Добавлен соответствующий тест. Другие изменённые прежние файлы: этот тест и .gitattributes с LF-правилами новых fingerprinted JSON. Импортёр не переписан, модель, интерфейс, карта и дизайн не менялись.

Воспроизводимый read-only аудит: node scripts/validate-catalog-167-preparation.mjs. Подробные результаты: docs/evidence/catalog-167-preparation-audit.json, catalog-167-final-check.json, catalog-167-import-dry-run.json, catalog-167-validation.json и catalog-167-preservation.json. Промежуточные ошибки схемы источников/формата preview исправлены до успешного аудита; EPERM realpath обычной песочницы разрешён авторизованным повтором той же команды. Один источниковый конфликт остаётся открытым и блокирует семнадцатого кандидата.

## Коммиты и состояние Git

Подготовка выполнялась блоками **6 + 6 + 5** с промежуточными коммитами:

```text
d3e43d4 Allow catalog-200 branch explicitly for future reviewed imports
d19cddc Prepare first six catalog-167 candidates from inventory A
866ea2b Prepare second six catalog-167 candidates with historical concept limits
2135050 Prepare final five historical candidates and document curlew extinction
546ed98 Audit catalog-167 packet and withhold one unresolved national category
```

Коммит окончательного пакета и manifest: **546ed987bb74d07b9b1e99117d16ba9460619895**. Настоящий отчёт сохраняется следующим отдельным локальным коммитом; его фактический hash выводится в итоговом ответе и доступен через git log -1 --format=%H -- docs/research/catalog-167-preparation.md. Перед добавлением отчёта рабочее дерево чистое. После его коммита требуется чистый git status; фактическая проверка сообщается в итоговом ответе.

Approve, apply, provisional import, merge, push и deployment не выполнялись. Новая ветка не создавалась, следующая партия не начиналась.
