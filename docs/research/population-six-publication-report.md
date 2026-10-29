# MURAS №28.5 — редакционная публикация шести оценок численности

Дата решения: **2026-10-29**, Asia/Bishkek. Результат: **EDITORIALLY_PUBLISHED — 6 оценок**, независимая научная проверка **pending**. Production deployment не выполнялся.

## Разрешение и существующий workflow

Владелец явно разрешил публикацию только шести первичных кандидатов пакета №28.4 в сообщении задачи №28.5 в текущем диалоге. Запись решения: `data/research/population-six-publication/owner-decision.json`, ID `muras-28-5-owner-editorial`, роль `project_owner`. Для каждого таксона записаны evidenceId, candidateFingerprint, evidenceFingerprint, дата и основание. Личность независимого рецензента не создавалась.

Публичный пакет: `src/data/population-editorial-release.json`. Он содержит неизменённые шесть кандидатов и selectionManifest, а также отдельный ownerAuthorization. `App.vue` передаёт его в уже существующие `populationPublicationContexts`, `checkPopulationPublication`, `documentedPopulationPresentation` и `usePopulationPresentation`. Используются прежние `SpeciesVisualization`, `PopulationInfo`, `SpeciesModal`, `SpeciesPage`, Canvas и RAF. Новый импортёр или параллельный механизм одобрения не создавались. Валидаторы и научная модель не изменялись.

Подготовительный исследовательский пакет остаётся историческим: ownerAuthorization=null, unpublished, 0 публикаций в его собственном снимке. Шесть редакционно допущенных оценок поступают в приложение отдельным контекстом; `data/species.source.json` и `public/data/species.json` не переписываются.

## Опубликованные оценки

Все шесть: scientificReviewStatus=pending, verified=false, lastReviewedAt=null в контексте документированной оценки. Подпись интерфейса сохранена из существующих переводов: «По опубликованному источнику, независимая проверка MURAS ожидается»; ограничения также явно указывают ожидание независимой научной проверки.

| ID / научное имя | Выбранная оценка | Тип / единицы | Территория | Учёт | Публикация | Источник |
|---|---|---|---|---|---|---|
| `irbis` / Panthera uncia | ≈ 300 взрослых особей | approximate / adult individuals | Кыргызстан | 2020–2024 | 2026 | [Panthera uncia, 28 (PDF 3), §2](https://publicera.kb.se/slr/article/download/63883/51550) |
| `manul` / Otocolobus manul | 10–12 особей · оценочный диапазон | range / individuals | Сарычат, Кыргызстан; обследовано 14000 га | 1977–1979 | 2006 | [Otocolobus manul, 507](https://macrolepidoptera.ru/lnk/282.pdf) |
| `golden-eagle` / Aquila chrysaetos | ≈ 655 особей | approximate / individuals | Кыргызстан; государственный мониторинг ООПТ и охотничьих угодий | 2024 | 2026 | [Беркут, 49; national monitoring table row 7](https://ort.cbd.int/national-reports/nr7/2183E018-5EB6-CF13-E45A-95A7680BA4C5) |
| `eurasian-lynx` / Lynx lynx | ≈ 1 937 особей | approximate / individuals | Кыргызстан; государственный мониторинг ООПТ и охотничьих угодий | 2024 | 2026 | [Рысь, 49; national monitoring table row 6](https://ort.cbd.int/national-reports/nr7/2183E018-5EB6-CF13-E45A-95A7680BA4C5) |
| `ursus-arctos` / Ursus arctos | 200–250 особей · оценочный диапазон | range / individuals | Восточные склоны Ферганского хребта, Кыргызстан, около 200000 га | 1964 | 2006 | [Ursus arctos, 499](https://macrolepidoptera.ru/lnk/282.pdf) |
| `lonicera-paradoxa` / Lonicera paradoxa | ≈ 12 экземпляров | approximate / specimens | Алайский хребет, Кыргызстан | 1973 | 2006 | [Lonicera paradoxa, 207](https://macrolepidoptera.ru/lnk/282.pdf) |

У ирбиса ≈ 300 — оценка взрослых особей; **95% доверительный интервал 246–366** сохранён отдельно. Он не заменяет оценку и не представлен как диапазон общей численности. Диапазоны манула 10–12 и медведя 200–250 не превращены в средние значения. У жимолости сохранены экземпляры, а не выдуманная численность всей популяции.

| Таксон | Идентификатор оценки | candidateFingerprint SHA-256 |
|---|---|---|
| `irbis` | `slr-national-adults` | `bdead02ea49c8cb05754dc7ba542d7ce0c2c3255a8dd2aa22556f20c3cb4f4d3` |
| `manul` | `book-sarychat` | `c68e3e18af1f5164f720363ae7b8e820e0b44940d1377b7ca60d889996bfa25b` |
| `golden-eagle` | `nr7-row-7-2024` | `6d49a9da29482245df44fdef0704013df3b4bc0f4ff00371117ceeb609a7b349` |
| `eurasian-lynx` | `nr7-row-6-2024` | `f70945304702b162e8b3cd8492f51376ac05c08a3d2662d826f9b88f64386bb9` |
| `ursus-arctos` | `book-fergana-bear` | `6c92cf640d95209dfb0d9c14eb4e232fc118bbfafcdf2fe909e67652126071e6` |
| `lonicera-paradoxa` | `book-lonicera-1973` | `abde5790a0eeeb9e55aa0b0b6ba0ea00eb8e7a62117fc666d5b003b081aabd1c` |

## Контрольные суммы и целостность

- Подготовительный пакет: `data/research/population-publication-candidates.json`.
- SHA-256 файла: `9b949266a1b96b2d39277040898f175fb071f98fb517c873e7855075418df8c1`.
- registryFingerprint: `13f2c5b5f958dda341502a84e00782a59310745ebfdd146880fae9df56696de8`.
- selectionManifest.fingerprint: `6e7af629fdae99d30b5c2da3ffd72a162babe57787f7db9b2fd5d22f50616b1a` (канонический SHA-256 содержимого без собственного fingerprint).
- Исходный реестр: `data/research/population-184-bulk-publication.json`; его fingerprint `7b482286e9b5c4c67ecf50c1f09ea45b1cbd3fdecf6adc2306673fe037bd96e8`.
- SHA-256 `data/species.source.json`: `22cab3d3dbad13cb44343646081fbcf9880d9fe244956e694314e808e1593935`.
- SHA-256 `public/data/species.json`: `8c87e8254851ad70ecafd256f6f8138a65d8181660b03abe20121233655ea532`.

Исходная ветка `feature/release-preparation`, HEAD `b77e2030974778ebd1cfaba7f87a4d75d02a6739`, Git был чистым. Проверены **1030 защищённых файлов** относительно снимка до изменений: изменённых файлов **0**. Сохранены все **184** объекта, **2** архивных объекта, **208** региональных связей, **161** изображение и **23** placeholder, лицензии, статусы, таксономия, переводы, уроки, викторина и 30 альтернативных оценок. Прежний read-only verifier задачи №28.4 также проходит с нулём ошибок.

## Отображение и отзыв

Для `irbis`, `manul`, `golden-eagle`, `eurasian-lynx`, `ursus-arctos` фотография изначально цветная; Canvas имеет нулевой буфер до нажатия. Кнопка запускает прежнюю символическую пикселизацию, показывает оценку, территорию, период учёта, год публикации, единицы, источник и оговорки. Повторное нажатие возвращает исходную фотографию и освобождает буферы. Пиксели не обозначают буквальное количество особей.

Для `lonicera-paradoxa` сохранён placeholder: ≈ 12 экземпляров показаны текстом, кнопка отключена, Canvas отсутствует. Остальные **178** таксонов не получают числовых оценок из этого разрешения; unknown остаётся неизвестной численностью с CSS grayscale по запросу при наличии фотографии.

Отзыв предусмотрен прежним gate: `populationPublicationStatus: revoked` в отдельном решении скрывает числа и источники и освобождает Canvas/RAF. Для текущего статического размещения новый отозванный release нужно пересобрать, распространить и перезагрузить страницу; уже открытые старые копии не получают сетевой push. Доверенный REST/host может заменить реактивный `populationPublicationRelease` в App (null запрещает все оценки) для немедленного отзыва в текущем сеансе. Отзыв следует документировать отдельным событием, сохраняя исходное решение в истории. Контрольные суммы кандидатов или научные статусы ради отзыва менять не нужно.

Допуск не переносится на альтернативу, другой таксон или будущий исследовательский пакет. Изменение числа, источника, checksum либо identity блокирует отображение. Даже заново вычисленный fingerprint изменённого кандидата не совпадает с шестью fingerprints реального решения.

## Проверки

- `npm test -- --test-concurrency=1`: **410/410**, 0 ошибок, 0 skip/todo; добавлены 8 регрессионных тестов реального решения.
- `npm run data`: PASS, каталог 184 / архив 2 / связи 208.
- Повторный `npm run data`: PASS, результат идентичен, защищённые файлы неизменны.
- `npm run build`: PASS, Vite 6.4.4, 108 модулей, prebuild и postbuild успешны.
- Переводы: **645 ключей × 4 языка**, без изменений файлов локализации.
- Chrome, production preview: **10/10** сценариев реального входа, включая все 6 маршрутов, 5 рабочих Canvas, placeholder, unknown, модальное окно, KY/UZ/RU/EN, мобильный экран 390px.
- Chrome, существующий компонентный стенд: **8/8** сценариев — отсутствие разрешения, отзыв/гонка хеширования, повреждение, taxon ID, 4 языка, modal/page/App, reduced motion, освобождение Canvas/RAF. Его синтетические решения остаются исключительно тестовыми и не входят в production release.
- `node data/research/population-six-publication/verify.mjs`: 6 допущенных, 5 с фото, 1 placeholder, 178 прочих unknown; errors=[]; повторная проверка не меняет файлы.
- После добавления файлов в Git index: историческая защита `population-activation` и новый аудит решения — **12/12** (повторная адресная проверка, входит в общее покрытие 410 тестов).
- `git diff --check`: PASS.

Результаты сохранены в `data/research/population-six-publication/checks.json`. Сценарии: `tests/browser/population-six-publication.mjs` и прежний `tests/browser/population-publication.mjs`. Скриншоты каждого из шести видов и подробные логи находятся в игнорируемой `.generated/population-six-publication/`. Свободное место до работы: 8 047 357 952 байт, после проверок: 8 180 547 584 байт. ENOSPC не возникал; материалы не удалялись.

## Научные ограничения

Редакционный допуск не является независимым научным одобрением. Исторические локальные значения 1964, 1973 и 1977–1979 не описывают современную национальную численность. Мониторинг NR7 не представлен как полный подсчёт всей страны; возрастной охват не уточняется вымышленными фактами. Национальная оценка ирбиса относится к взрослым особям за 2020–2024, а не к точной численности 2026 года. Прежние ограничения документов сохранены и видимы. Новое исследование численности не проводилось.

## Git

Единый коммит задачи включает редакционное решение, отдельный release, минимальное подключение App, read-only аудит, тесты и этот отчёт. Итоговый HEAD — коммит, содержащий этот отчёт; точный SHA сообщается в итоговом ответе после фиксации (вписывание собственного SHA в содержимое коммита создало бы циклическую зависимость). Проверяемое определение:

```powershell
git log -1 --format=%H -- docs/research/population-six-publication-report.md
git rev-parse HEAD
git status --porcelain
```

Перед фиксацией изменён только `src/App.vue`; добавлены отдельный release, каталог аудита, два новых тестовых файла и этот отчёт. После коммита выполняется финальная проверка чистоты Git. Merge, push, deployment и новые исследования не выполнялись.
