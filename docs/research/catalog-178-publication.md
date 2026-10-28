# MURAS №25.7 — предварительный образовательный импорт 166 → 178

Дата выполнения и решения владельца: **28 октября 2026 года**, Asia/Bishkek.
Ветка: **feature/catalog-200**. Проект: **C:\Users\Asus\Desktop\Muras**.

**Результат: 178 записей**, добавлены ровно **12 разрешённых кандидатов**. Прежние **166 исходных и 166 публичных объектов**, архив из **2 объектов** и все прежние фотографии сохранены без изменений. В новой партии **2 фотографии и 10 placeholder**. Все новые записи provisional, verified:false, scientificReviewStatus:pending, lastReviewedAt:null; численность unknown.

## Исходное состояние и коммит готовности

Исходный HEAD точно совпал с заданием: **3fb5c04641e291948f3e3b8d70cf08c693b2b5ec**. Единственным незакоммиченным файлом был docs/research/catalog-178-release-readiness.md из №25.6. Он проверен по фактическому manifest/registry и сохранён отдельным коммитом **1c70598115828ad8452cbc15bc94c6c03a8ea7de**. После него рабочее дерево было чистым. Manifest и registry не менялись ни при сохранении отчёта, ни при импорте.

## Пакет и контрольные суммы

| Объект | Путь / контрольная сумма |
|---|---|
| Manifest | data/research/catalog-181-review-manifest.json |
| SHA-256 manifest | **0ba2e9ea7922b13b10baed4b37ea48fb61befe766c170120379ccb51c6c1882e** |
| Registry | data/research/catalog-181-content-registry.json |
| registryFingerprint | **3acddc2f7f4f682e37f258e3ac1610f7646a4a63ac767f8ec04b17b9940ab42c** |
| SHA-256 registry | 797b8e530bc1934101a735e93d904ed1eca74728942b9ecb324b62c6249fa125 |
| SHA-256 исходного source, 166 | 79197b9323386983951a56c889b5246884a5d9a17bc203b94ad077bd96892360 |
| SHA-256 итогового source, 178 | 088f8f2fc78462a1721e293974b1054dc7a80b215f25bd111be3565318948f60 |
| SHA-256 итогового public/data/species.json | 1bfe3899a1e83aed43d2bbb5f62dc5d01fb257c153934374c6a3f0862a1d1162 |

Индивидуальные draftSha256, checkedFingerprint, материал каждого кандидата, научное имя, ранг и точный taxon ID заново проверены штатным pipeline. Значения совпали с разрешением владельца и отчётами №25.5/25.6. Подгонка контрольных сумм или замена кандидатов не выполнялась.

## Полный список импортированных ID

| ID | Научное имя | Ранг | Изображение |
|---|---|---|---|
| anemone-obtusiloba | Anemonastrum obtusilobum | SPECIES | фото |
| berberis-kaschgarica | Berberis ulicina | SPECIES | placeholder |
| primula-macrocalyx | Primula veris subsp. macrocalyx | SUBSPECIES | фото |
| sonjagaster-coronatus | Thecagaster coronata | SPECIES | placeholder |
| capoetobrama-kuschakewitschi-orientalis | Capoetobrama kuschakewitschi | SPECIES | placeholder |
| schizothorax-issykkuli | Schizothorax pseudoaksaiensis | SPECIES | placeholder |
| diptychus-dybowskii-lansdelli | Gymnodiptychus dybowskii | SPECIES | placeholder |
| eryx-tataricus | Eryx miliaris | SPECIES | placeholder |
| terpsiphone-paradisi | Terpsiphone paradisi leucogaster | SUBSPECIES | placeholder |
| otonycteris-hemprichi | Otonycteris leucophaea | SPECIES | placeholder |
| cervus-elaphus-asiaticus | Cervus canadensis | SPECIES | placeholder |
| allactaga-saltator | Orientallactaga sibirica | SPECIES | placeholder |

**Не опубликованы:** papilio-alexanor-voldemar, megalodontes-kuznetzovi, polochrum-pamirepandum. Их состояние в неизменённом registry остаётся needs_evidence. Они отсутствуют в исходном и публичном каталогах, включая dist.

## Действительное решение владельца и защищённый импорт

Основание: явное отдельное разрешение владельца в задании **№25.7**, распространяющееся только на указанные SHA-256 manifest, registryFingerprint и 12 допущенных ID. Использован существующий **npm run data:bulk:provisional** с параметрами:

- mode: **apply**, однократно;
- owner-role: **project_owner**;
- decision-id: **muras-25-7-owner-provisional**;
- date: **2026-10-28**;
- registry и manifest — точные пути из таблицы выше;
- reason: **Явное разрешение владельца MURAS из задания №25.7 на однократную предварительную образовательную публикацию исключительно 12 кандидатов manifest SHA-256 0ba2e9ea7922b13b10baed4b37ea48fb61befe766c170120379ccb51c6c1882e; registryFingerprint 3acddc2f7f4f682e37f258e3ac1610f7646a4a63ac767f8ec04b17b9940ab42c; прежние 166 записей не изменять; независимое научное одобрение отсутствует, scientificReviewStatus pending.**

Защищённый dry-run предшествовал единственному apply. Branch guard явно разрешает feature/catalog-200 и запрещает main, master и посторонние feature-ветки; allowlist и защиты не менялись. Дополнительное подтверждение система не потребовала. Подмена обычным импортом или научным approve не выполнялась.

Журнал, созданный самим pipeline: **data/research/publication-decisions/muras-25-7-owner-provisional.json**. Все 12 записей журнала содержат фактическую дату, роль владельца, точные fingerprints и draft SHA, scientificReviewStatus:pending, independentReviewer:null. scientificApproval — null. Научная подпись или личность эксперта не создавались.

| Режим | processed | added | unchanged | rejected | applied |
|---|---:|---:|---:|---:|---|
| Защищённый dry-run до импорта | 12 | 12 | 0 | 0 | false |
| Единственный защищённый apply | 12 | 12 | 0 | 0 | true |
| Повторный защищённый dry-run | 12 | 0 | 12 | 0 | false |

Повторный dry-run не публиковал записи снова. Решение владельца касается предварительной образовательной публикации в каталоге проекта и не является deployment.

## Сохранность данных, источники и лицензии

Резервные копии до импорта: **data/backups/catalog-178/species.source.json**, **public-species.json**, **baseline.json**. Baseline привязан к коммиту готовности и содержит контрольные суммы 1075 ранее отслеживаемых файлов. Дополнительная штатная резервная копия импортёра находится в .generated/import-backups/.

DeepEqual подтвердил неизменность первых 166 исходных объектов в исходном порядке, всех 166 прежних публичных объектов, архива и всех прочих полей source. **1072 ранее отслеживаемых файла совпадают побайтово**. Три изменённых прежних файла: data/species.source.json и public/data/species.json, куда добавлены карточки, и tests/catalog-166-publication.test.mjs, переведённый на неизменённый снимок релиза 166. Его прежние строгие проверки сохранены, новый файл tests/catalog-178-publication.test.mjs проверяет текущий релиз. Модель данных, импортёр, интерфейс, поиск, фильтры, карта, дизайн и прежние изображения не редактировались.

Два новых публичных WebP — точные копии подготовленных изображений:

| ID | Автор | Лицензия | Размеры | SHA-256 |
|---|---|---|---|---|
| anemone-obtusiloba | Hedwig Storch | CC BY-SA 3.0 | 1800×1428 | 461a2aa25ab5d3b30178ad6975abf0102ff3e8ba79ccabf1aaa46e98cb8533d8 |
| primula-macrocalyx | Krzysztof Ziarnek, Kenraiz | CC BY-SA 4.0 | 1350×1800 | d5ec59b08be3673d41303d12740da3b57a899dcf35ad9a015345de287abceacd |

Исходные страницы Commons, лицензии, авторы и атрибуции сохранены в карточках и [фотографических доказательствах №25.5](../evidence/catalog-181-images.json). Обе фотографии зарубежные, подписи не выдают их за национальные находки. Оригинальные assets и их public/dist-копии полностью декодированы повторно. Все **145** лицензированных публичных WebP проверены по размерам, контейнеру, отсутствию EXIF/XMP, SHA-256 и отсутствию повторяющихся хешей.

Placeholder используется у остальных десяти карточек через пустой images и существующее обозначение интерфейса. Источники и историческое национальное включение сохранены. Новая IUCN-оценка не назначена: у 12 новых iucn.category/year — null. Национальные категории сопровождаются 2006 годом и исходным охранявшимся понятием. Историческая запись не объявлена подтверждением современной популяции; неподтверждённая численность во всех полях остаётся unknown/null.

## Проверки результата

| Проверка | Фактический результат |
|---|---|
| npm test | **326/326**, 0 ошибок, 0 пропусков, exit 0 |
| Пять новых проверок релиза 178 | все прошли; старые 321 тест сохранены |
| npm run data, первый запуск | каталог 178, архив 2, exit 0; выполнен перед тестами для синхронизации публичного экспорта |
| npm run data, второй запуск | каталог 178, архив 2, exit 0; логи двух запусков побайтово одинаковы |
| npm run build | prebuild/build/postbuild успешно, exit 0 |
| Размер dist | **34692982 байт**, каталог 178; public и dist данные совпадают |
| KY/UZ/RU/EN | поиск по названиям всех 178 записей прошёл; новые краткие описания доступны на четырёх языках |
| Научные тексты | русский обзор; незаполненные длинные переводы остаются null с явно обозначенным русским fallback |
| Фильтры | группы, статус, регион и отрицательные сценарии новых карточек прошли |
| Маршруты | speciesPath/speciesIdFromPath для всех 178 записей прошли |
| Пагинация | **24/24/24/24/24/24/24/10**, 8 страниц, 178 уникальных ID без пропусков и повторов |
| Карточки/модальные окна/страницы | SSR всех 12 новых видов × 4 языка × 3 компонента; фото/placeholder, атрибуция, исторический год и pending проверены |
| Повтор защищённого dry-run | **0 additions / 12 unchanged / 0 errors**, source и registry не меняет |
| Административный импорт JSON | итоговый source проходит существующий размерный предел и модель без их изменения |

Проверки UI выполнены через реальные Vue-компоненты и SSR; отдельный ручной браузерный обход не проводился. Блокирующих технических проблем после импорта не выявлено. Независимая научная и языковая экспертиза этим тестированием не предоставляется.

Зафиксированные receipts: **docs/evidence/catalog-178-protected-before.json**, **catalog-178-protected-import.json**, **catalog-178-protected-repeat.json**, **catalog-178-preservation.json**, **catalog-178-validation.json**. Рабочие логи команд — .generated/catalog-178-publication/. Воспроизводимая проверка релиза: node --test tests/catalog-178-publication.test.mjs.

## Коммиты, HEAD и Git status

1. **1c70598115828ad8452cbc15bc94c6c03a8ea7de** — сохранён проверенный отчёт готовности №25.6, без изменения manifest и registry.
2. **2ab7e9bf1834d3b119b828f4203c672c7963b28f** — успешный импорт 12 карточек, журнал действительного решения владельца, резервные копии, публичные изображения, результаты проверок и тесты.

**HEAD на момент записи отчёта: 2ab7e9bf1834d3b119b828f4203c672c7963b28f.** После импортного коммита git status --porcelain=v1 пустой. Настоящий итоговый отчёт сохраняется следующим отдельным коммитом. Его фактический финальный HEAD приводится в итоговом ответе и определяется командой git log -1 --format=%H -- docs/research/catalog-178-publication.md. После этого коммита проверяются пустой git status, итоговое число записей и неизменность контрольных сумм.

Merge, push и deployment не выполнялись. Другая партия не начиналась. Разрешение не распространялось на три needs_evidence или на иной пакет; они не импортированы.
