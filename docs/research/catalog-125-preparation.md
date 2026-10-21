# MURAS — задача 24.1: подготовка каталога до 125 записей

Подготовлено **25 из 25** новых непубличных кандидатов: **25 растений**. Все технически допустимы для передачи на отдельное решение владельца; это **не независимое научное одобрение**. Подготовлено **20 изображений: 18 гербарных сканов и 2 фотографии растений**, все CC BY 4.0. **5 placeholder**. В исходном, публичном и собранном каталогах остаётся **ровно 100 записей**, фактически добавлено **0**.

## Начальное состояние и объём изменений

Проверены git branch --show-current и git status: ветка feature/catalog-150, дерево было чистым. Исходный HEAD: f9b1cd7f2854b71317a57bdb753c4db1a31c2207. Сверены основной источник, публичный каталог, модель, команды data:bulk:*, master-60, прежние очереди, научные документы и PDF. Старые research_ready не принимались за новое научное решение.

Изменены только новые частные данные, материалы исследования, изображения в assets и правила LF для новых JSON в .gitattributes. Правила нужны для сохранения fingerprints при Windows checkout. Компоненты Vue, стили, карта, поиск, фильтры, футер, анимации и существующие утилиты не изменены. Новые инструменты не создавались. Все пять блоков обработаны существующим prepare-bulk-25-content.mjs; после каждого использованы check/resume и отдельный Git-коммит. Оптимизация изображений выполнена существующим process_data.py.

## Точный состав

Группа всех строк — plants. Грибы, рыбы, амфибии, рептилии, членистоногие, птицы и млекопитающие — 0 новых кандидатов. Выбраны документированные растения из приоритетной группы; число 25 не достигалось переносом спорных концепций других групп.

В таблице указана страница русского очерка книги 2006 года и строка приложения 1 исторической редакции перечня 2009 года. «Не сопоставлен» означает отсутствие принятой здесь документальной связи, а не отсутствие вида в правовом документе.

| ID | Научное имя | Книга, с. | Перечень, строка | Изображение |
| --- | --- | ---: | --- | --- |
| silene-sussamyrica | Silene sussamyrica | 105 | не сопоставлен | гербарий |
| iskandera-alaica | Iskandera alaica | 121 | 34 | placeholder |
| spiraeanthus-schrenkianus | Spiraeanthus schrenckianus | 129 | 44 | фото растения |
| chesneya-villosa | Chesneya villosa | 151 | не сопоставлен | гербарий |
| hedysarum-chaitocarpum | Hedysarum chaitocarpum | 153 | 51 | гербарий |
| zygophyllum-kaschgaricum | Zygophyllum kaschgaricum | 155 | 52 | фото растения |
| sclerotiaria-pentaceros | Sclerotiaria pentaceros | 159 | 98 | placeholder |
| bupleurum-rosulare | Bupleurum rosulare | 165 | 56 | гербарий |
| hyalolaena-intermedia | Hyalolaena intermedia | 167 | 57 | гербарий |
| seseli-eryngioides | Seseli eryngioides | 169 | 59 | гербарий |
| seseli-korshinskyi | Seseli korshinskyi | 171 | 58 | гербарий |
| cnidiocarpa-alaica | Cnidiocarpa alaica | 173 | 61 | гербарий |
| pastinacopsis-glacialis | Pastinacopsis glacialis | 177 | 62 | гербарий |
| kaufmannia-semenovii | Kaufmannia semenovii | 183 | 67 | гербарий |
| acantholimon-compactum | Acantholimon compactum | 185 | 68 | гербарий |
| scutellaria-andrachnoides | Scutellaria andrachnoides | 187 | 73 | гербарий |
| scutellaria-nepetoides | Scutellaria nepetoides | 189 | 74 | placeholder |
| salvia-korolkowii | Salvia korolkowii | 195 | 71 | гербарий |
| nathaliella-alaica | Nathaliella alaica | 203 | 99 | гербарий |
| lonicera-paradoxa | Lonicera paradoxa | 207 | 78 | placeholder |
| campanula-eugeniae | Campanula eugeniae | 209 | 79 | placeholder |
| lamyropappus-schakaptaricus | Lamyropappus schakaptaricus | 211 | 84 | гербарий |
| trichanthemis-aulieatensis | Trichanthemis aulieatensis | 219 | 82 | гербарий |
| trichanthemis-aurea | Trichanthemis aurea | 221 | 83 | гербарий |
| lepidolopha-komarowii | Lepidolopha komarowii | 225 | 85 | гербарий |

## Национальные источники и таксономия

1. [Красная книга Кыргызской Республики, 2-е издание, 2006](https://macrolepidoptera.ru/lnk/282.pdf), главный редактор Э. Дж. Шукуров; ГАОСЛХ при Правительстве КР, Биолого-почвенный институт НАН КР, ЭД «Алейне». Индивидуальные очерки подтверждают историческое национальное включение всех 25 кандидатов. Категории карточек взяты из конкретных очерков и явно привязаны к историческому изданию.
2. [Постановление Правительства КР №170 от 28.04.2005 в редакции №471 от 25.07.2009, копия FAOLEX](https://faolex.fao.org/docs/pdf/kyr104340.pdf). По точному имени дополнительно сопоставлены 23 позиции. Для Silene sussamyrica и Chesneya villosa основание в этом пакете — индивидуальные национальные очерки; неподтверждённые связи с написаниями перечня не добавлены.

**Актуальность правового перечня на 2026 год не установлена.** Исторические документы не названы действующим реестром. Ecostan не использовался как государственный источник. Книга и перечень повторно взяты из кеша; их полные SHA-256 совпали с прежними:

- книга: f517212f7ce12fcf5c30f2cf73edc5a842b3ded15dea232b844fbe7ce2525cf8;
- перечень: 1e47f07208cf45d90096f0b9775fd625dd2102e06b42cf69610a49cc57f21be4.

Полные тексты соответствующих пар страниц сохранены в [блоках 1](../evidence/catalog-125-block-1-accounts.json), [2](../evidence/catalog-125-block-2-accounts.json), [3](../evidence/catalog-125-block-3-accounts.json), [4](../evidence/catalog-125-block-4-accounts.json), [5](../evidence/catalog-125-block-5-accounts.json). Русские страницы дополнительно отрисованы и просмотрены из локального PDF. Библиографические сведения, URL страниц, sourceIds и supports входят в каждый черновик.

[Свежие ответы GBIF](../evidence/catalog-125-taxonomy.json) сохранены 16.10.2026, включая отрицательные и неоднозначные результаты отбора. Все 25 выбранных принятых имён имеют EXACT, ACCEPTED и ранг SPECIES. У 24 сохранено точное национальное написание; у таволгоцвета подтверждена цепочка Spiraeanthus schrenkianus → acceptedUsageKey 3853299 → EXACT ACCEPTED Spiraeanthus schrenckianus того же ранга. Изменение ранга и неподтверждённые синонимы не использованы.

[Дополнительная сверка IUCN checklist через GBIF](../evidence/catalog-125-iucn-crosscheck.json) дала три точные принятые записи с совпадающим nubKey: Zygophyllum kaschgaricum — DD, Salvia korolkowii — VU, Lonicera paradoxa — EN. Эти международные категории отделены от национальных; год индивидуальной оценки во всех трёх случаях null. Это проверка опубликованного checklist через GBIF, а не live-проверка индивидуальных страниц IUCN. Для остальных category/year оставлены null; нулевая выдача ограниченного поиска не трактуется как NE.

## Содержание, языки и ограничения

Для всех 25 подготовлены название и краткое описание KY/UZ/RU/EN, русский обзор, внешний вид, местообитание, экология, известные сведения о размножении, историческое распространение и рекомендации охраны. В KY/UZ/EN названиях использовано научное имя; народные названия не конструировались. Переводы кратких описаний — редакционные черновики, независимое языковое одобрение отсутствует. Полные разделы KY/UZ/EN остаются null, как допускает схема и объём задачи.

Все черновики имеют verified:false, lastReviewedAt:null, population.type:unknown, population.reviewStatus:pending; числовые поля, год, метод и территория оценки численности — null. Реестр и manifest сохраняют независимую научную проверку pending и approval:null. Свойство publication отсутствует до отдельно разрешённой публикации. Координаты новых местонахождений не создавались. Старые количественные сообщения о жимолости не превращены в современную оценку.

Если конкретные угрозы не установлены источником, threats:null: Silene sussamyrica, Bupleurum rosulare, Hyalolaena intermedia, Seseli eryngioides, Seseli korshinskyi, Cnidiocarpa alaica. Неизвестные способы размножения не заменены общими предположениями о роде.

Оговорки сохранены в самих текстах и missingFacts: расходящиеся местонахождения таволгоцвета в двух языковых сводках; фенология Acantholimon compactum, Scutellaria nepetoides и Lonicera paradoxa; биологические сведения Silene sussamyrica. Расхождения не скрыты и не выданы за современное полевое подтверждение. Sclerotiaria pentaceros включён как историческая национальная запись принятого вида, а не как доказанная современная популяция.

## Фотографии

По каждому выбранному таксону проведён ограниченный автоматический поиск Commons, GBIF и iNaturalist; для таволгоцвета проверены обе подтверждённые орфографии. GBIF также дал изображения научных гербарных коллекций. Первичные карточки МГУ и индивидуальные фото iNaturalist проверены перед загрузкой; лицензия записи наблюдения не подменяла лицензию фото. Неподходящие по правам находки и нерелевантные результаты Commons не использованы.

Подготовлены 20 WebP общим объёмом **5 169 580 байт** в assets/images/species. В public и dist новые файлы не попали. Все 20 — CC BY 4.0; сохранены автор, правообладатель, первичный URL, атрибуция, тип изображения, SHA-256 оригинала и WebP, размеры и описание обработки. EXIF/XMP удалены. У гербарных образцов указан тип и номер; они не представлены как живые растения или современные национальные находки. Пиксели и доступные этикетки просмотрены; независимое определение специалистом по-прежнему pending.

Синоним Pseudoglossanthis aulieatensis для гербарного фото Trichanthemis aulieatensis подтверждён [тем же национальным очерком и отдельным ответом GBIF](../evidence/catalog-125-photo-synonym.json). Исходный снимок подписан с указанием синонима. Снимок Lepidolopha komarowii из Казахстана не выдаётся за находку в Кыргызстане.

Placeholder сохраняют:

- iskandera-alaica — В ограниченной выборке не найдено изображения с проверяемыми правами и определением.
- sclerotiaria-pentaceros — Национальный очерк предупреждает о сомнительных сборах; изображения нетиповых образцов требуют экспертной сверки.
- scutellaria-nepetoides — В ограниченной выборке не найдено изображения с проверяемыми правами и определением.
- lonicera-paradoxa — В ограниченной выборке не найдено изображения с проверяемыми правами и определением.
- campanula-eugeniae — В ограниченной выборке не найдено изображения с проверяемыми правами и определением.

[Поиск Commons](../evidence/catalog-125-photo-search.json), [поиск GBIF/iNaturalist](../evidence/catalog-125-photo-secondary-search.json), [подготовка и первичные метаданные](../evidence/catalog-125-photo-preparation.json). Окончательные визуальные отметки находятся в block-1-images.json … block-5-images.json; сводка лицензий, размеров и SHA — в [аудите](../evidence/catalog-125-audit.json).

## Заблокированные и невыбранные

Среди выбранных 25 технически заблокированных нет. Для передачи редактору явно удержаны вне партии:

- pyrus-asiae-mediae: очерк с.131 обсуждает систематическое положение и возможное гибридное происхождение. Одного EXACT ACCEPTED в GBIF недостаточно. Кандидат заменён до завершения первого блока.
- tulipa-anadroma: прежнее противоречие национальной концепции и принятого таксона не разрешено этой задачей.
- eryx-tataricus: прежнее противоречие связи национальной концепции с Eryx miliaris не разрешено этой задачей.

Их старые реестры не изменялись. Остальные неоднозначные результаты GBIF не были автоматически допущены ради числа 25. [Протокол отбора](../evidence/catalog-125-selection-audit.json) содержит решения и страницу отклонённой груши.

## Итоговый аудит и проверки

- Существующие pipeline/check/resume: **25 ready_for_review**, 0 deferred/rejected, 0 approved_for_import, 0 imported.
- Дубли по ID, принятому и исходному имени, taxonId и пересечению вид/подвид относительно 100 опубликованных и 2 архивных записей: 0. Пересечения с шестью прежними исследовательскими очередями: 0.
- validateSpecies, обязательные поля, ссылки sourceIds, четыре названия и четыре кратких описания: без ошибок. Полные русские разделы присутствуют. Изображения прошли проверку лицензий, размеров, контейнера, SHA-256 и отсутствия EXIF/XMP.
- npm test: **306/306**, ошибок 0.
- npm run data:validate: успешно; 620 ключей × 4 языка; каталог 100, архив 2.
- npm run build: успешно; 104 модуля; dist/data/species.json содержит 100 записей, новых изображений кандидатов в dist нет.
- Штатный data:batch:import **без --apply**: processed 25, added 25, unchanged 0, rejected 0, mode:preview, applied:false. Это прогноз добавления; фактически источник не записывался.
- Повторный check: все 25 fingerprints совпали с manifest. **193** исходных файла каталога/public/assets сравнены по SHA-256 после сборки; изменённых 0.

[Результаты команд](../evidence/catalog-125-test-validation.json), [итоговая диагностика](../evidence/catalog-125-final-validation.json), [dry-run](../evidence/catalog-125-import-dry-run.json), [полный аудит](../evidence/catalog-125-audit.json). Полные журналы npm сохранены в .generated/catalog-125-*.log; их SHA-256 записаны в результатах команд.

В этой среде sandbox блокировал realpath корня проекта; проверки успешно выполнены с разрешённым повышением среды. Отказ автоматической проверки разрешений не происходил. Каталог от этого не изменялся.

## Manifest и будущее отдельное решение

Готовый [manifest](../../data/research/catalog-125-review-manifest.json): data/research/catalog-125-review-manifest.json.

- SHA-256 manifest: **e2cb306acf708d13fe53e0ec3ddcdd620489593b4c96d640abd8121ebbc7e1dd**.
- registryFingerprint: **6b89e1b5e569e2bf23c0a7313e2a0802c73f63fafccdeb895dbabd3baf55f9da**.
- Реестр: data/research/catalog-125-content-registry.json.
- Черновики: data/research/catalog-125-content/drafts/.
- В manifest сохранены 25 индивидуальных draftSha256 и checkedFingerprint; независимая проверка каждого pending. ownerAuthorization:null, scientificApproval:null.

**Сейчас импорт на feature/catalog-150 запрещён существующим branch guard.** Разрешены feature/catalog-expansion, feature/species-content, feature/bulk-import, feature/bulk-import-next. Защита не менялась и не обходилась. До реального импорта владелец должен отдельно разрешить конкретный manifest с указанным SHA и перенос этого неизменного пакета на разрешённую ветку, например существующую feature/bulk-import-next. Переключение веток, перенос и импорт не выполнялись. Альтернатива — отдельная задача на изменение разрешённых веток с проверками.

Следующая точная команда приведена **только для будущего отдельного разрешения владельца**, на разрешённой ветке и при совпадении manifest/registry/draft fingerprints. Она не запускалась. Дата должна соответствовать фактическому решению владельца; ниже дата подготовки пакета.

~~~powershell
npm run data:bulk:provisional -- --registry data/research/catalog-125-content-registry.json --manifest data/research/catalog-125-review-manifest.json --mode apply --owner-role project_owner --decision-id muras-24-1-owner-provisional --date 2026-10-16 --reason "Отдельное решение владельца на предварительную публикацию manifest SHA-256 e2cb306acf708d13fe53e0ec3ddcdd620489593b4c96d640abd8121ebbc7e1dd; независимое научное одобрение отсутствует, scientificReviewStatus pending."
~~~

При изменении любого связанного материала требуется повторный check и обновлённый manifest до решения. Научное approve не выдавалось; apply, data:bulk:provisional, merge, push и deployment не выполнялись.

## Локальные коммиты подготовки и аудита

- 5ec3be608da7a548cc8859eab4abf9c4b7ac8bb3 data: prepare catalog 125 research and first five plant drafts
- be42f0585a2d52c4847e8d9637a9e685f8b7d2d1 data: prepare catalog 125 plant block 2
- cf6635e97a00e6d7b5a42004f342e8dc49260d47 data: prepare catalog 125 plant block 3
- 74473b37eaf9cc0a341b3280cf9dd3898c2446d8 data: prepare catalog 125 plant block 4
- a48d567bf6e1ebc5f2450bd71a35f8c557d11155 data: prepare catalog 125 plant block 5
- fa7371e27cfc26a0b1a576ff0388e6509a6b2e1c data: audit catalog 125 manifest and preserve unpublished batch

Сам отчёт сохраняется следующим отдельным документационным коммитом; его фактический хеш доступен через git log -1 -- docs/research/catalog-125-preparation.md. Работа остановлена после подготовки, проверки и сохранения отчёта.
