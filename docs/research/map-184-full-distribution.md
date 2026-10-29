# MURAS №27.2 — полное исследование областного распространения 184 таксонов

Дата: 2026-10-28, Asia/Bishkek. Результат: **COMPLETED — документально допустимая часть опубликована**.
Ветка `feature/release-preparation`; исходный чистый HEAD `b83a48c3b7b362bd6a93661ebb8dcb4415fcce74`.
Этот коммит включает этап 27.1 и следует после фотоэтапа `43ff31186ea54eafdb6eec654c50828fb4c99eb3`; откатов и переключений не было.
Исходная проверка дала 357 тестов: указанное в задании число 348 относится к фотоэтапу, после которого добавлены девять тестов карты.

## Фактический результат

| Показатель | Результат |
|---|---:|
| Таксонов исследовано, текст и карта национального очерка | 184 / 184 |
| Хотя бы одна допустимая областная связь | 118 |
| Несколько подтверждённых областей | 53 |
| Уникальных пар до / после | 6 / 208 |
| Новых опубликованных пар | 202 |
| Новых пар по книге 2006 года и административному сопоставлению | 189 |
| Новых пар по дополнительным источникам | 13 |
| Книжных соответствий рассмотрено / подтверждают уже существующую пару | 191 / 2 |
| Видов без достаточного областного доказательства, needs_evidence | 66 |
| Новых видов / изменений научных карточек | 0 / 0 |
| Каталог / архив | 184 / 2 |
| Записей с изображениями / placeholder | 161 / 23 |

Все 208 опубликованных региональных свидетельств имеют `documented_pending_review`, точность только `oblast`.
Независимое научное одобрение не устанавливалось. 66 таксонов без связи остаются исследовательскими записями; это не утверждение об отсутствии видов.
Дополнительно отклонена одна предложенная пара дрофа—Нарын: Ramsar определяет только родительский вид, а карточка относится к подвиду.
Отложенный список поэтому включает 66 непривязанных таксонов и отдельный недопустимый перенос родительского таксона; это разные единицы подсчёта.

| Область | Уникальных видов, они же пары в данной области |
|---|---:|
| Баткенская | 8 |
| Ошская | 15 |
| Джалал-Абадская | 39 |
| Нарынская | 26 |
| Иссык-Кульская | 51 |
| Чуйская | 48 |
| Таласская | 21 |

Сумма областных чисел — 208, а не 118: один вид может иметь несколько независимо подтверждённых областей.

## Первичный источник и метод

Использована уже сохранённая оригинальная Красная книга Кыргызской Республики, второе издание, 2006:
[PDF](https://macrolepidoptera.ru/lnk/282.pdf), 543 страницы, 20 136 649 байт.
SHA-256: `f517212f7ce12fcf5c30f2cf73edc5a842b3ded15dea232b844fbe7ce2525cf8`.
Локальный файл `.generated/research/redbook.pdf` не скачивался повторно и не удалялся.
Номера в таблицах ниже — страницы PDF; отдельно сохранена соседняя кыргызская страница со схемой.

Для всех 184 карточек использованы существующие национальный мастер-реестр и аудированная таблица соответствий инвентаризации.
Исторические названия не заменены современными задним числом: оба имени, nationalRecordId и основание соответствия сохранены в JSON.
Русский текст каждого очерка повторно извлечён непосредственно из проверенного PDF; его SHA-256 сохранён отдельно от прежнего текстового кэша.
Каждая принятая местность проверена по тексту страницы. Учитывались распространение и явно существующая охрана в названном ООПТ; предложения создать охрану не считались находкой.

Просмотрены все 184 схемы на восьми контактных листах, дополнительно проверены отдельные полные страницы.
Визуальный просмотр выполнен Codex и не является независимой научной экспертизой.
Карта книги не имеет достаточной административной сетки и геодезического контроля: приблизительное положение точки не использовалось для назначения области.
Контрольные суммы просмотренных карт и листов зафиксированы в `data/research/map-184/visual-review.json`.

Научный очерк и административный справочник выполняют разные роли. Сам справочник не доказывает присутствие вида.
Хребты, бассейны рек, «повсеместно» и общий горный ареал не разнесены автоматически по всем пересекаемым областям.
Города Бишкек и Ош сами по себе не приравнены к соответствующим областям. В случае джейрана Ляйлякский район исторической Ошской области сопоставлен с современной Баткенской; национальный архив документирует образование области в 1999 году.
Геометрия проекта, включая её исходную дату 2017 года, не изменена.

## Административные источники

Для каждой новой книжной пары конкретные идентификаторы справочников находятся в `administrativeSourceIds` исследовательского решения и `administrativeBasis` канонической записи.

| ID | Источник и проверенный раздел | Ограничения доступа |
|---|---|---|
| `admin-protected` | [CAIAG. Национальная база ООПТ: таблицы заповедников и природных парков](https://wildlife.caiag.kg/drupal_wa/?q=ru/node/18); Таблицы: место расположения каждого названного ООПТ | primary_html_downloaded_and_read |
| `admin-chuy` | [МЧС КР. Чуйская область: территория, рельеф и гидрография](https://www.mchs.gov.kg/ru/structures_old/kr-okm-chui-oblusu-boyuncha-bashkarmalygy/); О территории; Рельеф: Чуйская, Суусамырская, Чон-Кеминская и Кичи-Кеминская долины | primary_html_downloaded_and_read |
| `admin-naryn` | [МЧС КР. Нарынская область: природные условия](https://www.mchs.gov.kg/ru/structures_old/kr-okm-naryn-oblusu-boyuncha-bashkarmalygy/); Рельеф: Ат-Башы-Каракоюнская, Сон-Кельская, Чатыр-Кельская, Кочкорская, Джумгальская, Средненарынская впадины | primary_html_downloaded_and_read |
| `admin-jalal` | [МЧС КР. Джалал-Абадская область: территория и природные условия](https://www.mchs.gov.kg/ru/structures_old/kr-okm-zhalal-abad-oblusu-boyuncha-bashkarmalygy/img/); Административное деление; рельеф: Кетмень-Тюбинская и Тогуз-Тороузская впадины; города | primary_html_downloaded_and_read |
| `admin-tourism` | [Департамент туризма КР. Цифровые навигации](https://tourism.gov.kg/digital-navigation/); Списки природных объектов по областям: Чычкан, Токтогульское водохранилище, Бабаш-Ата, Кировское водохранилище, Айгул-Тоо | primary_html_downloaded_and_read |
| `admin-osh` | [Кабинет Министров КР. Ошская область](https://www.gov.kg/ru/region/osh); Административное устройство: Алайский, Чон-Алайский, Араванский районы; Гульча, Узген | primary_indexed_text; direct access limited |
| `admin-batken` | [Национальный статистический комитет КР. Баткенская область](https://www.stat.gov.kg/ru/batkenskaya-oblast/); Административное устройство: Баткенский, Кадамжайский, Лейлекский районы; Баткен, Сулюкта, Кадамжай | primary_page_text_read_via_web; direct retrieval limited |
| `admin-talas` | [Кабинет Министров КР. Таласская область](https://www.gov.kg/ru/region/talas); Административное устройство Таласской области | primary_indexed_text; direct access limited |
| `admin-lakes` | [Ramsar. Annotated list: Kyrgyzstan](https://rsis.ramsar.org/sites/default/files/rsiswp_search/exports/Ramsar-Sites-annotated-summary-Kyrgyzstan.pdf); PDF p.1 Chatyr Kul and Son-Kol; p.2 Issyk-Kul; only administrative fields used for crosswalk | primary_pdf_downloaded_and_read; both pages checked |
| `admin-alai` | [Алайская районная государственная администрация](https://alay.gov.kg/ru/главная/); Алайская долина; Ошская область, Алайский район | primary_html_downloaded_and_read |

Некоторые PDF по старым адресам МЧС возвращали 404; их непрочитанное содержимое не использовалось.
Для части государственных страниц доступен первичный текст через веб-поиск, прямое получение страницы ограничено; это явно отмечено в JSON.
Трансграничный Сары-Джаз и совпадение названий хребта/области не использовались как достаточное административное доказательство.

## Дополнительные источники и качество

Для 75 таксонов с пробелами после книжного обзора выполнен ограниченный поиск музейных/гербарных образцов GBIF: точный сохранённый taxon ID, country KG, PRESERVED_SPECIMEN, до 100 результатов на запрос.
69 запросов получены, три ограничены доступом, у трёх карточек отсутствовал подходящий точный сохранённый GBIF ID для такого запроса.
Это не исчерпывающая перепись GBIF и не свидетельство отсутствия остальных находок.
Отобраны шесть каталогизированных образцов. Для каждого сохранены идентичность/ранг, исходная административная этикетка, страна, учреждение, номер, дата, issues, URL исходной записи и SHA-256 её снимка.

| Таксон каталога | Образец | Область | Дата сбора | Проверяемый источник |
|---|---|---|---|---|
| `cinereous-vulture` | NHMD: NHMD000875335 | Нарынская | 1920-01 | [GBIF 3460302047](https://www.gbif.org/occurrence/3460302047), [исходные поля](https://api.gbif.org/v1/occurrence/3460302047/verbatim) |
| `allium-semenovii` | US: US 2090191 | Иссык-Кульская | 1936-07-04 | [GBIF 2625864765](https://www.gbif.org/occurrence/2625864765), [исходные поля](https://api.gbif.org/v1/occurrence/2625864765/verbatim) |
| `haliaeetus-leucoryphus` | MZH: http://id.luomus.fi/KS.UL2560 | Иссык-Кульская | 1896-07-20 | [GBIF 3446855612](https://www.gbif.org/occurrence/3446855612), [исходные поля](https://api.gbif.org/v1/occurrence/3446855612/verbatim) |
| `sibiraea-tianschanica` | MICH: 1749873 | Иссык-Кульская | 1962-08-23 | [GBIF 5833161152](https://www.gbif.org/occurrence/5833161152), [исходные поля](https://api.gbif.org/v1/occurrence/5833161152/verbatim) |
| `kaufmannia-semenovii` | RBGE: E00662335 | Иссык-Кульская | 2013-05-01 | [GBIF 890179680](https://www.gbif.org/occurrence/890179680), [исходные поля](https://api.gbif.org/v1/occurrence/890179680/verbatim) |
| `pyrethrum-leontopodium` | MICH: 1816639 | Чуйская | 1917-07-10 | [GBIF 6160574399](https://www.gbif.org/occurrence/6160574399), [исходные поля](https://api.gbif.org/v1/occurrence/6160574399/verbatim) |

Исходное `1920-01` сохранено как месяц: день не придуман. Отсутствующая дата публикации музейного каталога остаётся null.
У Naryn/NHMD неопределённость координаты 8 км существенно меньше приблизительного расстояния до границы 56,9 км; основа решения — также административное поле издателя.
У записей без координат или известной uncertainty использована только однозначная исходная область, а координатный вывод не делался.
Kaufmannia brachyanthera сопоставлена с принятым Kaufmannia semenovii по точному acceptedTaxonId, не по похожему названию.
У Haliaeetus сохранён флаг TAXON_CONCEPT_ID_NOT_FOUND: это проблема внешней концепции, а не TAXON_MATCH_HIGHERRANK; точное исходное имя и каталогизированная запись проверены отдельно.
Сомнительные higher-rank совпадения не приняты.

Отклонены: Rhinolophus bocharicus с uncertainty 10 км при расстоянии до границы около 1,9 км; Ammopiptanthus с полем «Chuy or Naryn»; исторические «Osh» до образования Баткенской области без точной реконструкции; записи без каталожного номера; неподтверждённые таксономические соответствия.
Закрытые/искажённые координаты iNaturalist не использованы. Отдельная музейная находка не считается доказательством постоянного обитания или размера популяции.

[МПРЭТН КР, 02.10.2025](https://www.mnr.gov.kg/ru/posts/news/v-bes-tasskom-gosudarstvennom-prirodnom-parke-zafiksirovany-dikie-zivotnye): пять пар с Таласской областью.
Ирбис и архар — фотоловушки сентября 2025; беркут, балобан, рысь — отдельная справка о фауне, даты конкретных наблюдений не приведены.
У страницы ошибочный тег «Чуйская область»: текст называет Беш-Таш и Таласскую долину, принадлежность парка независимо подтверждена CAIAG. Тег не использован.
Медведь в этом источнике не указан и из него не добавлялся.

[Ramsar, сводный PDF](https://rsis.ramsar.org/sites/default/files/rsiswp_search/exports/Ramsar-Sites-annotated-summary-Kyrgyzstan.pdf), p.1, Son-Kol Lake: две пары с Нарынской областью — Ciconia nigra и Falco cherrug.
Фактическая сноска PDF: «Most recent RIS information: 2010». Это год информации, не дата наблюдения и не вымышленный год публикации PDF.
Otis tarda из той же справки не перенесён на карточку Otis tarda tarda; отрицательное решение сохранено в secondary-review и основном реестре.

## Время, таксономические рамки и старые черновики

Новые пары: 194 HISTORICAL, три RECENT с известным годом (образец 2013 и две регистрации 2025), пять UNDATED_OBSERVATION (списки фауны с датированным источником/информацией, но без даты наблюдения).
В исследовательской классификации всех 208 пар: 195 исторических, восемь поздних датированных, пять списочных без даты наблюдения.
Ни одна категория не означает подтверждённого присутствия в 2026 году.
Год издания книги не подставляется вместо неизвестного года находки. `observationYear: null` сопровождается честным `observationPeriod`.
Прежние шесть канонических объектов сохранены буквально, включая coarse `temporalContext: historical` для пяти сведений 2022 года; уточнённая исследовательская классификация не переписывает эти объекты.

Пихта: [GBIF synonyms 2685655](https://api.gbif.org/v1/species/2685655/synonyms) явно связывает Abies semenovii с принятым подвидом Abies sibirica semenovii; не присвоен ID родительского вида.
Дрофа в очерке с.431 явно определена как номинативный подвид, мухоловка в очерке с.471 — как T. p. leucogaster. Их книжные локальные сведения относятся к этим явно указанным рамкам; отдельная более поздняя публикация уровня вида такого права автоматически не получает.
Primula macrocalyx использует уже документированную в карточке синонимию с Primula veris subsp. macrocalyx.

Четыре черновика 27.1 не переписаны: пихта получила новое книжное доказательство с явным таксономическим мостом; Campanula eugeniae и Berberis kaschgarica остаются без допустимой областной связи; Tulipa anadroma не подставлена вместо установленного каталожного таксона.
Два ранних частных черновика чёрного аиста также сохранены без изменения флагов разрешения. Новые связи чёрного аиста основаны на отдельно проверенном очерке с.375 и Ramsar, а не на автоматическом переносе старого черновика.

## Все новые опубликованные соответствия

Исторические локальности ниже — исследовательская аргументация из опубликованной книги. Точные координаты не копируются.
Публичная проекция обобщает текст записи до уровня области; научные страницы/изображения не использованы как доказательство местной современной популяции.
Все записи в этой таблице — `documented_pending_review`.

| speciesId | Область | Источник и точное место | Доказательство / дата |
|---|---|---|---|
| `irbis` | Джалал-Абадская | [Книга, PDF с.511](https://macrolepidoptera.ru/lnk/282.pdf#page=511); `admin-protected` | Сарычелекского; дата находки неизвестна |
| `irbis` | Нарынская | [Книга, PDF с.511](https://macrolepidoptera.ru/lnk/282.pdf#page=511); `admin-protected` | Нарынского; дата находки неизвестна |
| `irbis` | Иссык-Кульская | [Книга, PDF с.511](https://macrolepidoptera.ru/lnk/282.pdf#page=511); `admin-protected` | Сарычат; дата находки неизвестна |
| `irbis` | Чуйская | [Книга, PDF с.511](https://macrolepidoptera.ru/lnk/282.pdf#page=511); `admin-protected` | Алаарчинском; дата находки неизвестна |
| `argali` | Иссык-Кульская | [Книга, PDF с.517](https://macrolepidoptera.ru/lnk/282.pdf#page=517); `admin-protected` | Сарычат; дата находки неизвестна |
| `argali` | Джалал-Абадская | [Книга, PDF с.517](https://macrolepidoptera.ru/lnk/282.pdf#page=517); `admin-protected` | Беш-Аральского; дата находки неизвестна |
| `argali` | Нарынская | [Книга, PDF с.517](https://macrolepidoptera.ru/lnk/282.pdf#page=517); `admin-lakes` | Сон-Куль; дата находки неизвестна |
| `argali` | Ошская | [Книга, PDF с.517](https://macrolepidoptera.ru/lnk/282.pdf#page=517); `admin-alai`, `admin-osh` | Алайскую долину; дата находки неизвестна |
| `manul` | Чуйская | [Книга, PDF с.507](https://macrolepidoptera.ru/lnk/282.pdf#page=507); `admin-chuy` | Кеминского; дата находки неизвестна |
| `manul` | Иссык-Кульская | [Книга, PDF с.507](https://macrolepidoptera.ru/lnk/282.pdf#page=507); `admin-lakes` | Иссыккульской котловины; дата находки неизвестна |
| `manul` | Нарынская | [Книга, PDF с.507](https://macrolepidoptera.ru/lnk/282.pdf#page=507); `admin-protected` | Нарынского; дата находки неизвестна |
| `greigs-tulip` | Чуйская | [Книга, PDF с.81](https://macrolepidoptera.ru/lnk/282.pdf#page=81); `admin-chuy` | Кичи-Кемин; дата находки неизвестна |
| `sievers-apple` | Чуйская | [Книга, PDF с.137](https://macrolepidoptera.ru/lnk/282.pdf#page=137); `admin-chuy` | Чон-Кемин; дата находки неизвестна |
| `central-asian-tortoise` | Чуйская | [Книга, PDF с.331](https://macrolepidoptera.ru/lnk/282.pdf#page=331); `admin-chuy` | Чуйской; дата находки неизвестна |
| `central-asian-tortoise` | Таласская | [Книга, PDF с.331](https://macrolepidoptera.ru/lnk/282.pdf#page=331); `admin-talas` | Таласской; дата находки неизвестна |
| `central-asian-frog` | Чуйская | [Книга, PDF с.329](https://macrolepidoptera.ru/lnk/282.pdf#page=329); `admin-chuy` | Чуйской долине; дата находки неизвестна |
| `central-asian-frog` | Иссык-Кульская | [Книга, PDF с.329](https://macrolepidoptera.ru/lnk/282.pdf#page=329); `admin-lakes` | котловине; дата находки неизвестна |
| `central-asian-frog` | Нарынская | [Книга, PDF с.329](https://macrolepidoptera.ru/lnk/282.pdf#page=329); `admin-naryn` | Кочкорской долине; дата находки неизвестна |
| `predatory-bush-cricket` | Чуйская | [Книга, PDF с.253](https://macrolepidoptera.ru/lnk/282.pdf#page=253); `admin-chuy` | Чуйская долина; дата находки неизвестна |
| `dog-stinkhorn` | Иссык-Кульская | [Книга, PDF с.43](https://macrolepidoptera.ru/lnk/282.pdf#page=43); `admin-lakes` | озера Иссык-Куль; дата находки неизвестна |
| `marbled-polecat` | Чуйская | [Книга, PDF с.503](https://macrolepidoptera.ru/lnk/282.pdf#page=503); `admin-chuy` | Чуйской; дата находки неизвестна |
| `marbled-polecat` | Таласская | [Книга, PDF с.503](https://macrolepidoptera.ru/lnk/282.pdf#page=503); `admin-talas` | Таласской; дата находки неизвестна |
| `black-stork` | Иссык-Кульская | [Книга, PDF с.375](https://macrolepidoptera.ru/lnk/282.pdf#page=375); `admin-lakes` | Прииссыккулье; дата находки неизвестна |
| `black-stork` | Таласская | [Книга, PDF с.375](https://macrolepidoptera.ru/lnk/282.pdf#page=375); `admin-tourism` | Кировского водохранилища; 1996 |
| `ibisbill` | Чуйская | [Книга, PDF с.443](https://macrolepidoptera.ru/lnk/282.pdf#page=443); `admin-chuy` | Чон-Кемин; дата находки неизвестна |
| `ibisbill` | Иссык-Кульская | [Книга, PDF с.443](https://macrolepidoptera.ru/lnk/282.pdf#page=443); `admin-protected` | Каракол; дата находки неизвестна |
| `ibisbill` | Нарынская | [Книга, PDF с.443](https://macrolepidoptera.ru/lnk/282.pdf#page=443); `admin-naryn` | Ат-Баши; дата находки неизвестна |
| `ibisbill` | Ошская | [Книга, PDF с.443](https://macrolepidoptera.ru/lnk/282.pdf#page=443); `admin-alai`, `admin-osh` | Алай; дата находки неизвестна |
| `eduards-fritillary` | Баткенская | [Книга, PDF с.75](https://macrolepidoptera.ru/lnk/282.pdf#page=75); `admin-batken`, `admin-tourism` | Баткен; дата находки неизвестна |
| `european-glass-lizard` | Чуйская | [Книга, PDF с.337](https://macrolepidoptera.ru/lnk/282.pdf#page=337); `admin-chuy` | Чуйской долине; дата находки неизвестна |
| `european-glass-lizard` | Таласская | [Книга, PDF с.337](https://macrolepidoptera.ru/lnk/282.pdf#page=337); `admin-talas` | Таласской обл; дата находки неизвестна |
| `european-glass-lizard` | Джалал-Абадская | [Книга, PDF с.337](https://macrolepidoptera.ru/lnk/282.pdf#page=337); `admin-protected` | Беш-Аральского; дата находки неизвестна |
| `dalmatian-pelican` | Чуйская | [Книга, PDF с.383](https://macrolepidoptera.ru/lnk/282.pdf#page=383); `admin-chuy` | Чуйской долине; дата находки неизвестна |
| `dalmatian-pelican` | Иссык-Кульская | [Книга, PDF с.383](https://macrolepidoptera.ru/lnk/282.pdf#page=383); `admin-lakes` | Иссык-Куле; дата находки неизвестна |
| `kolpakowskis-tulip` | Иссык-Кульская | [Книга, PDF с.85](https://macrolepidoptera.ru/lnk/282.pdf#page=85); `admin-lakes` | Прииссыккулье; дата находки неизвестна |
| `pike-asp` | Джалал-Абадская | [Книга, PDF с.301](https://macrolepidoptera.ru/lnk/282.pdf#page=301); `admin-tourism` | Токтогульском водохранилище; дата находки неизвестна |
| `turkestan-catfish` | Нарынская | [Книга, PDF с.313](https://macrolepidoptera.ru/lnk/282.pdf#page=313); `admin-naryn` | Джумгал; дата находки неизвестна |
| `turkestan-catfish` | Ошская | [Книга, PDF с.313](https://macrolepidoptera.ru/lnk/282.pdf#page=313); `admin-osh` | Узгеном; дата находки неизвестна |
| `tien-shan-scutiger` | Иссык-Кульская | [Книга, PDF с.45](https://macrolepidoptera.ru/lnk/282.pdf#page=45); `admin-lakes` | котловина озера Иссык-Куль; дата находки неизвестна |
| `menzbiers-marmot` | Джалал-Абадская | [Книга, PDF с.519](https://macrolepidoptera.ru/lnk/282.pdf#page=519); `admin-protected` | Бешаральском; дата находки неизвестна |
| `semenovs-fir` | Джалал-Абадская | [Книга, PDF с.61](https://macrolepidoptera.ru/lnk/282.pdf#page=61); `admin-protected` | Сары-Челекском; дата находки неизвестна |
| `semenovs-fir` | Таласская | [Книга, PDF с.61](https://macrolepidoptera.ru/lnk/282.pdf#page=61); `admin-protected` | Беш-Таш; дата находки неизвестна |
| `great-bustard` | Чуйская | [Книга, PDF с.431](https://macrolepidoptera.ru/lnk/282.pdf#page=431); `admin-chuy` | Чуйской; дата находки неизвестна |
| `great-bustard` | Иссык-Кульская | [Книга, PDF с.431](https://macrolepidoptera.ru/lnk/282.pdf#page=431); `admin-lakes` | Иссыккульской; дата находки неизвестна |
| `great-bustard` | Ошская | [Книга, PDF с.431](https://macrolepidoptera.ru/lnk/282.pdf#page=431); `admin-osh` | Узгена; дата находки неизвестна |
| `said-alievs-toad-agama` | Баткенская | [Книга, PDF с.333](https://macrolepidoptera.ru/lnk/282.pdf#page=333); `admin-batken` | Баткенской области; дата находки неизвестна |
| `kostychevs-pasque-flower` | Ошская | [Книга, PDF с.113](https://macrolepidoptera.ru/lnk/282.pdf#page=113); `admin-alai`, `admin-osh` | Алайская долина; дата находки неизвестна |
| `indian-crested-porcupine` | Чуйская | [Книга, PDF с.521](https://macrolepidoptera.ru/lnk/282.pdf#page=521); `admin-chuy` | Чон-Кемине; дата находки неизвестна |
| `indian-crested-porcupine` | Джалал-Абадская | [Книга, PDF с.521](https://macrolepidoptera.ru/lnk/282.pdf#page=521); `admin-protected` | Сарычелекском; дата находки неизвестна |
| `indian-crested-porcupine` | Таласская | [Книга, PDF с.521](https://macrolepidoptera.ru/lnk/282.pdf#page=521); `admin-protected` | Беш-Таш; дата находки неизвестна |
| `indian-crested-porcupine` | Ошская | [Книга, PDF с.521](https://macrolepidoptera.ru/lnk/282.pdf#page=521); `admin-protected` | Кара-Шоро; дата находки неизвестна |
| `fergana-ground-beetle` | Джалал-Абадская | [Книга, PDF с.257](https://macrolepidoptera.ru/lnk/282.pdf#page=257); `admin-jalal` | Жалалабата; дата находки неизвестна |
| `giant-robber-fly` | Чуйская | [Книга, PDF с.273](https://macrolepidoptera.ru/lnk/282.pdf#page=273); `admin-chuy` | Чуйская долина; дата находки неизвестна |
| `giant-robber-fly` | Таласская | [Книга, PDF с.273](https://macrolepidoptera.ru/lnk/282.pdf#page=273); `admin-talas` | Талас; дата находки неизвестна |
| `giant-robber-fly` | Иссык-Кульская | [Книга, PDF с.273](https://macrolepidoptera.ru/lnk/282.pdf#page=273); `admin-lakes` | Иссык-Кульской котловины; дата находки неизвестна |
| `eremurus-zoae` | Чуйская | [Книга, PDF с.67](https://macrolepidoptera.ru/lnk/282.pdf#page=67); `admin-chuy` | Кегеты; дата находки неизвестна |
| `allium-dodecadontum` | Джалал-Абадская | [Книга, PDF с.69](https://macrolepidoptera.ru/lnk/282.pdf#page=69); `admin-protected` | Сары-Челекском; дата находки неизвестна |
| `tulipa-affinis` | Баткенская | [Книга, PDF с.77](https://macrolepidoptera.ru/lnk/282.pdf#page=77); `admin-batken` | Сулюкты; дата находки неизвестна |
| `thesium-minkwitzianum` | Джалал-Абадская | [Книга, PDF с.103](https://macrolepidoptera.ru/lnk/282.pdf#page=103); `admin-protected` | Беш-Аральском; дата находки неизвестна |
| `urocerus-sah` | Джалал-Абадская | [Книга, PDF с.275](https://macrolepidoptera.ru/lnk/282.pdf#page=275); `admin-protected` | Сары-Челекском; дата находки неизвестна |
| `urocerus-sah` | Ошская | [Книга, PDF с.275](https://macrolepidoptera.ru/lnk/282.pdf#page=275); `admin-protected` | Кыргыз-Ата; дата находки неизвестна |
| `varanus-griseus-caspius` | Чуйская | [Книга, PDF с.335](https://macrolepidoptera.ru/lnk/282.pdf#page=335); `admin-chuy` | Чуйской; дата находки неизвестна |
| `varanus-griseus-caspius` | Таласская | [Книга, PDF с.335](https://macrolepidoptera.ru/lnk/282.pdf#page=335); `admin-talas` | Таласской; дата находки неизвестна |
| `varanus-griseus-caspius` | Джалал-Абадская | [Книга, PDF с.335](https://macrolepidoptera.ru/lnk/282.pdf#page=335); `admin-jalal` | Кок-Янгак; 1992 |
| `lyrurus-tetrix` | Чуйская | [Книга, PDF с.359](https://macrolepidoptera.ru/lnk/282.pdf#page=359); `admin-chuy` | Чон-Кемина; дата находки неизвестна |
| `lyrurus-tetrix` | Иссык-Кульская | [Книга, PDF с.359](https://macrolepidoptera.ru/lnk/282.pdf#page=359); `admin-lakes` | Иссык-Кульской котловины; дата находки неизвестна |
| `cygnus-cygnus` | Нарынская | [Книга, PDF с.363](https://macrolepidoptera.ru/lnk/282.pdf#page=363); `admin-lakes` | Сон-Куль; дата находки неизвестна |
| `cygnus-cygnus` | Иссык-Кульская | [Книга, PDF с.363](https://macrolepidoptera.ru/lnk/282.pdf#page=363); `admin-lakes` | Иссык-Куль; дата находки неизвестна |
| `aythya-nyroca` | Чуйская | [Книга, PDF с.365](https://macrolepidoptera.ru/lnk/282.pdf#page=365); `admin-chuy` | Чуйской долине; дата находки неизвестна |
| `aythya-nyroca` | Иссык-Кульская | [Книга, PDF с.365](https://macrolepidoptera.ru/lnk/282.pdf#page=365); `admin-lakes` | Прииссыккулье; дата находки неизвестна |
| `mergus-serrator` | Иссык-Кульская | [Книга, PDF с.367](https://macrolepidoptera.ru/lnk/282.pdf#page=367); `admin-lakes` | Иссык-Куль; дата находки неизвестна |
| `gavia-arctica` | Иссык-Кульская | [Книга, PDF с.371](https://macrolepidoptera.ru/lnk/282.pdf#page=371); `admin-lakes` | Иссык-Куле; дата находки неизвестна |
| `ciconia-ciconia` | Чуйская | [Книга, PDF с.377](https://macrolepidoptera.ru/lnk/282.pdf#page=377); `admin-chuy` | Чуйской долины; дата находки неизвестна |
| `ciconia-ciconia` | Джалал-Абадская | [Книга, PDF с.377](https://macrolepidoptera.ru/lnk/282.pdf#page=377); `admin-jalal` | Жалал-Абадской; 2004 |
| `ciconia-ciconia` | Ошская | [Книга, PDF с.377](https://macrolepidoptera.ru/lnk/282.pdf#page=377); `admin-osh` | Ошской областей; дата находки неизвестна |
| `ciconia-ciconia` | Баткенская | [Книга, PDF с.377](https://macrolepidoptera.ru/lnk/282.pdf#page=377); `admin-batken` | Баткенской области; 2004 |
| `ciconia-ciconia` | Иссык-Кульская | [Книга, PDF с.377](https://macrolepidoptera.ru/lnk/282.pdf#page=377); `admin-lakes` | Иссык-Куль; 1971 |
| `platalea-leucorodia` | Чуйская | [Книга, PDF с.379](https://macrolepidoptera.ru/lnk/282.pdf#page=379); `admin-chuy` | Чуйской долине; дата находки неизвестна |
| `platalea-leucorodia` | Иссык-Кульская | [Книга, PDF с.379](https://macrolepidoptera.ru/lnk/282.pdf#page=379); `admin-lakes` | Иссыккульской котловине; дата находки неизвестна |
| `pelecanus-onocrotalus` | Чуйская | [Книга, PDF с.381](https://macrolepidoptera.ru/lnk/282.pdf#page=381); `admin-chuy` | Чуйской долине; дата находки неизвестна |
| `phalacrocorax-pygmaeus` | Чуйская | [Книга, PDF с.385](https://macrolepidoptera.ru/lnk/282.pdf#page=385); `admin-chuy` | Чуйской долине; дата находки неизвестна |
| `falco-naumanni` | Иссык-Кульская | [Книга, PDF с.387](https://macrolepidoptera.ru/lnk/282.pdf#page=387); `admin-lakes` | Иссыккульской котловине; дата находки неизвестна |
| `falco-naumanni` | Джалал-Абадская | [Книга, PDF с.387](https://macrolepidoptera.ru/lnk/282.pdf#page=387); `admin-tourism` | Арстанбапа; дата находки неизвестна |
| `falco-rusticolus` | Чуйская | [Книга, PDF с.391](https://macrolepidoptera.ru/lnk/282.pdf#page=391); `admin-chuy` | Чуйской долине; дата находки неизвестна |
| `falco-rusticolus` | Иссык-Кульская | [Книга, PDF с.391](https://macrolepidoptera.ru/lnk/282.pdf#page=391); `admin-lakes` | Прииссыккулье; дата находки неизвестна |
| `pandion-haliaetus` | Чуйская | [Книга, PDF с.397](https://macrolepidoptera.ru/lnk/282.pdf#page=397); `admin-chuy` | Чуйской долине; 2002 |
| `pandion-haliaetus` | Иссык-Кульская | [Книга, PDF с.397](https://macrolepidoptera.ru/lnk/282.pdf#page=397); `admin-lakes` | Иссык-Куль; 1957 |
| `pandion-haliaetus` | Нарынская | [Книга, PDF с.397](https://macrolepidoptera.ru/lnk/282.pdf#page=397); `admin-naryn` | Атбаши; 1957 |
| `pandion-haliaetus` | Джалал-Абадская | [Книга, PDF с.397](https://macrolepidoptera.ru/lnk/282.pdf#page=397); `admin-protected` | Сары-Челека; 1955 |
| `haliaeetus-albicilla` | Чуйская | [Книга, PDF с.401](https://macrolepidoptera.ru/lnk/282.pdf#page=401); `admin-chuy` | Чуйской долине; дата находки неизвестна |
| `haliaeetus-albicilla` | Иссык-Кульская | [Книга, PDF с.401](https://macrolepidoptera.ru/lnk/282.pdf#page=401); `admin-lakes` | Иссык-Куле; дата находки неизвестна |
| `circaetus-gallicus` | Чуйская | [Книга, PDF с.413](https://macrolepidoptera.ru/lnk/282.pdf#page=413); `admin-chuy` | Чуйской; дата находки неизвестна |
| `circaetus-gallicus` | Таласская | [Книга, PDF с.413](https://macrolepidoptera.ru/lnk/282.pdf#page=413); `admin-talas` | Таласской; дата находки неизвестна |
| `circaetus-gallicus` | Иссык-Кульская | [Книга, PDF с.413](https://macrolepidoptera.ru/lnk/282.pdf#page=413); `admin-lakes` | Прииссыккулье; дата находки неизвестна |
| `circaetus-gallicus` | Джалал-Абадская | [Книга, PDF с.413](https://macrolepidoptera.ru/lnk/282.pdf#page=413); `admin-protected` | Сарычелекского; дата находки неизвестна |
| `circus-macrourus` | Иссык-Кульская | [Книга, PDF с.415](https://macrolepidoptera.ru/lnk/282.pdf#page=415); `admin-lakes` | Иссыкульская котловина; дата находки неизвестна |
| `circus-macrourus` | Нарынская | [Книга, PDF с.415](https://macrolepidoptera.ru/lnk/282.pdf#page=415); `admin-naryn` | Ат-Баши; дата находки неизвестна |
| `neomys-fodiens` | Чуйская | [Книга, PDF с.485](https://macrolepidoptera.ru/lnk/282.pdf#page=485); `admin-chuy` | Чуйской долине; дата находки неизвестна |
| `neomys-fodiens` | Иссык-Кульская | [Книга, PDF с.485](https://macrolepidoptera.ru/lnk/282.pdf#page=485); `admin-lakes` | Иссыккульской котловине; дата находки неизвестна |
| `barbastella-leucomelas` | Ошская | [Книга, PDF с.491](https://macrolepidoptera.ru/lnk/282.pdf#page=491); `admin-osh` | Ошской; дата находки неизвестна |
| `barbastella-leucomelas` | Баткенская | [Книга, PDF с.491](https://macrolepidoptera.ru/lnk/282.pdf#page=491); `admin-batken` | Баткенской областей; дата находки неизвестна |
| `lutra-lutra` | Иссык-Кульская | [Книга, PDF с.505](https://macrolepidoptera.ru/lnk/282.pdf#page=505); `admin-lakes` | Иссык-Куля; дата находки неизвестна |
| `lutra-lutra` | Ошская | [Книга, PDF с.505](https://macrolepidoptera.ru/lnk/282.pdf#page=505); `admin-alai`, `admin-osh` | Алайской долине; дата находки неизвестна |
| `allactaga-elater` | Чуйская | [Книга, PDF с.523](https://macrolepidoptera.ru/lnk/282.pdf#page=523); `admin-chuy` | Чуйской; дата находки неизвестна |
| `allactaga-elater` | Таласская | [Книга, PDF с.523](https://macrolepidoptera.ru/lnk/282.pdf#page=523); `admin-talas` | Таласской; дата находки неизвестна |
| `rossomyrmex-proformicarum` | Чуйская | [Книга, PDF с.283](https://macrolepidoptera.ru/lnk/282.pdf#page=283); `admin-chuy` | Чуйской долины; дата находки неизвестна |
| `barbus-brachycephalus` | Чуйская | [Книга, PDF с.305](https://macrolepidoptera.ru/lnk/282.pdf#page=305); `admin-chuy` | Приграничные с Казахстаном участки р.Чу; дата находки неизвестна |
| `allochrusa-gypsophiloides` | Джалал-Абадская | [Книга, PDF с.107](https://macrolepidoptera.ru/lnk/282.pdf#page=107); `admin-protected` | Беш-Аральском; дата находки неизвестна |
| `crataegus-knorringiana` | Джалал-Абадская | [Книга, PDF с.139](https://macrolepidoptera.ru/lnk/282.pdf#page=139); `admin-tourism` | Чичкан; дата находки неизвестна |
| `primula-eugeniae` | Джалал-Абадская | [Книга, PDF с.179](https://macrolepidoptera.ru/lnk/282.pdf#page=179); `admin-tourism` | Баубаш-Ата; дата находки неизвестна |
| `iskandera-alaica` | Ошская | [Книга, PDF с.121](https://macrolepidoptera.ru/lnk/282.pdf#page=121); `admin-alai`, `admin-osh` | Алайская долина; дата находки неизвестна |
| `spiraeanthus-schrenkianus` | Джалал-Абадская | [Книга, PDF с.129](https://macrolepidoptera.ru/lnk/282.pdf#page=129); `admin-jalal` | Майлы-Суу; дата находки неизвестна |
| `chesneya-villosa` | Иссык-Кульская | [Книга, PDF с.151](https://macrolepidoptera.ru/lnk/282.pdf#page=151); `admin-lakes` | Иссык-Кульской котловины; дата находки неизвестна |
| `bupleurum-rosulare` | Таласская | [Книга, PDF с.165](https://macrolepidoptera.ru/lnk/282.pdf#page=165); `admin-talas` | верховья реки Талас; дата находки неизвестна |
| `hyalolaena-intermedia` | Джалал-Абадская | [Книга, PDF с.167](https://macrolepidoptera.ru/lnk/282.pdf#page=167); `admin-protected` | Беш-Аральского; дата находки неизвестна |
| `seseli-eryngioides` | Джалал-Абадская | [Книга, PDF с.169](https://macrolepidoptera.ru/lnk/282.pdf#page=169); `admin-protected` | Беш-Аральском; дата находки неизвестна |
| `seseli-korshinskyi` | Джалал-Абадская | [Книга, PDF с.171](https://macrolepidoptera.ru/lnk/282.pdf#page=171); `admin-jalal` | Кетмень-Тюбинскую котловину; дата находки неизвестна |
| `pastinacopsis-glacialis` | Чуйская | [Книга, PDF с.177](https://macrolepidoptera.ru/lnk/282.pdf#page=177); `admin-chuy` | Шамси; дата находки неизвестна |
| `lamyropappus-schakaptaricus` | Джалал-Абадская | [Книга, PDF с.211](https://macrolepidoptera.ru/lnk/282.pdf#page=211); `admin-jalal` | Таш-Кумыра; дата находки неизвестна |
| `trichanthemis-aurea` | Баткенская | [Книга, PDF с.221](https://macrolepidoptera.ru/lnk/282.pdf#page=221); `admin-batken` | Кадамжай; дата находки неизвестна |
| `barbus-capito-conocephalus` | Чуйская | [Книга, PDF с.307](https://macrolepidoptera.ru/lnk/282.pdf#page=307); `admin-chuy` | Приграничные с Казахстаном участки р. Чу; дата находки неизвестна |
| `vipera-ursinii-renardi` | Чуйская | [Книга, PDF с.345](https://macrolepidoptera.ru/lnk/282.pdf#page=345); `admin-chuy` | Чуйской; дата находки неизвестна |
| `vipera-ursinii-renardi` | Таласская | [Книга, PDF с.345](https://macrolepidoptera.ru/lnk/282.pdf#page=345); `admin-talas` | Таласской; дата находки неизвестна |
| `vipera-ursinii-renardi` | Джалал-Абадская | [Книга, PDF с.345](https://macrolepidoptera.ru/lnk/282.pdf#page=345); `admin-jalal` | Кетмень-Тюбинской котловине; дата находки неизвестна |
| `vipera-ursinii-renardi` | Нарынская | [Книга, PDF с.345](https://macrolepidoptera.ru/lnk/282.pdf#page=345); `admin-naryn` | Средне-Нарынской впадине; дата находки неизвестна |
| `anser-indica` | Нарынская | [Книга, PDF с.361](https://macrolepidoptera.ru/lnk/282.pdf#page=361); `admin-lakes` | Сон-Куль; дата находки неизвестна |
| `accipiter-badius` | Чуйская | [Книга, PDF с.417](https://macrolepidoptera.ru/lnk/282.pdf#page=417); `admin-chuy` | Чуйской долине; дата находки неизвестна |
| `aquila-clanga` | Чуйская | [Книга, PDF с.419](https://macrolepidoptera.ru/lnk/282.pdf#page=419); `admin-chuy` | Чуйской долине; дата находки неизвестна |
| `aquila-clanga` | Иссык-Кульская | [Книга, PDF с.419](https://macrolepidoptera.ru/lnk/282.pdf#page=419); `admin-lakes` | Иссыккульской котловине; дата находки неизвестна |
| `aquila-heliaca` | Чуйская | [Книга, PDF с.423](https://macrolepidoptera.ru/lnk/282.pdf#page=423); `admin-chuy` | Чуйской долине; дата находки неизвестна |
| `aquila-heliaca` | Иссык-Кульская | [Книга, PDF с.423](https://macrolepidoptera.ru/lnk/282.pdf#page=423); `admin-lakes` | Прииссыккулье; дата находки неизвестна |
| `tetrax-tetrax` | Чуйская | [Книга, PDF с.435](https://macrolepidoptera.ru/lnk/282.pdf#page=435); `admin-chuy` | Чуйской долине; дата находки неизвестна |
| `tetrax-tetrax` | Иссык-Кульская | [Книга, PDF с.435](https://macrolepidoptera.ru/lnk/282.pdf#page=435); `admin-lakes` | Прииссыккулье; дата находки неизвестна |
| `crex-crex` | Чуйская | [Книга, PDF с.437](https://macrolepidoptera.ru/lnk/282.pdf#page=437); `admin-chuy` | Чуйской долине; дата находки неизвестна |
| `crex-crex` | Иссык-Кульская | [Книга, PDF с.437](https://macrolepidoptera.ru/lnk/282.pdf#page=437); `admin-lakes` | Иссыккульской котловине; дата находки неизвестна |
| `crex-crex` | Нарынская | [Книга, PDF с.437](https://macrolepidoptera.ru/lnk/282.pdf#page=437); `admin-naryn` | Атбаши; дата находки неизвестна |
| `anthropoides-virgo` | Чуйская | [Книга, PDF с.439](https://macrolepidoptera.ru/lnk/282.pdf#page=439); `admin-chuy` | Чуйской долине; дата находки неизвестна |
| `anthropoides-virgo` | Иссык-Кульская | [Книга, PDF с.439](https://macrolepidoptera.ru/lnk/282.pdf#page=439); `admin-lakes` | Иссык-Кульской области; дата находки неизвестна |
| `anthropoides-virgo` | Нарынская | [Книга, PDF с.439](https://macrolepidoptera.ru/lnk/282.pdf#page=439); `admin-lakes` | Сон-Куль; дата находки неизвестна |
| `anthropoides-virgo` | Джалал-Абадская | [Книга, PDF с.439](https://macrolepidoptera.ru/lnk/282.pdf#page=439); `admin-jalal` | Кетмень-Тюбинской котловинах; дата находки неизвестна |
| `burhinus-oedicnemus` | Чуйская | [Книга, PDF с.441](https://macrolepidoptera.ru/lnk/282.pdf#page=441); `admin-chuy` | Чуйской; дата находки неизвестна |
| `burhinus-oedicnemus` | Таласская | [Книга, PDF с.441](https://macrolepidoptera.ru/lnk/282.pdf#page=441); `admin-talas` | Таласской; дата находки неизвестна |
| `burhinus-oedicnemus` | Иссык-Кульская | [Книга, PDF с.441](https://macrolepidoptera.ru/lnk/282.pdf#page=441); `admin-lakes` | Иссык-Кульской котловине; дата находки неизвестна |
| `vanellus-gregarius` | Иссык-Кульская | [Книга, PDF с.445](https://macrolepidoptera.ru/lnk/282.pdf#page=445); `admin-lakes` | Иссык-Куль; дата находки неизвестна |
| `strix-aluco` | Чуйская | [Книга, PDF с.465](https://macrolepidoptera.ru/lnk/282.pdf#page=465); `admin-chuy` | Чуйской долине; дата находки неизвестна |
| `strix-aluco` | Джалал-Абадская | [Книга, PDF с.465](https://macrolepidoptera.ru/lnk/282.pdf#page=465); `admin-protected` | Сарычелекского; дата находки неизвестна |
| `strix-aluco` | Ошская | [Книга, PDF с.465](https://macrolepidoptera.ru/lnk/282.pdf#page=465); `admin-osh` | Узгена; дата находки неизвестна |
| `syrrhaptes-paradoxus` | Иссык-Кульская | [Книга, PDF с.453](https://macrolepidoptera.ru/lnk/282.pdf#page=453); `admin-lakes` | Иссык-Куль; дата находки неизвестна |
| `syrrhaptes-paradoxus` | Нарынская | [Книга, PDF с.453](https://macrolepidoptera.ru/lnk/282.pdf#page=453); `admin-naryn` | Ат-Баши; дата находки неизвестна |
| `pterocles-alchata` | Нарынская | [Книга, PDF с.455](https://macrolepidoptera.ru/lnk/282.pdf#page=455); `admin-naryn` | Нарынской области; дата находки неизвестна |
| `pterocles-orientalis` | Иссык-Кульская | [Книга, PDF с.457](https://macrolepidoptera.ru/lnk/282.pdf#page=457); `admin-lakes` | Иссык-Куль; дата находки неизвестна |
| `pterocles-orientalis` | Нарынская | [Книга, PDF с.457](https://macrolepidoptera.ru/lnk/282.pdf#page=457); `admin-naryn` | Ат-Баши; дата находки неизвестна |
| `columba-leuconota` | Ошская | [Книга, PDF с.459](https://macrolepidoptera.ru/lnk/282.pdf#page=459); `admin-alai`, `admin-osh` | Алайской долины; 1985 |
| `columba-eversmanni` | Чуйская | [Книга, PDF с.461](https://macrolepidoptera.ru/lnk/282.pdf#page=461); `admin-chuy` | Чуйской; дата находки неизвестна |
| `columba-eversmanni` | Таласская | [Книга, PDF с.461](https://macrolepidoptera.ru/lnk/282.pdf#page=461); `admin-talas` | Таласской; дата находки неизвестна |
| `bubo-bubo` | Иссык-Кульская | [Книга, PDF с.463](https://macrolepidoptera.ru/lnk/282.pdf#page=463); `admin-lakes` | Прииссыккулье; дата находки неизвестна |
| `bubo-bubo` | Нарынская | [Книга, PDF с.463](https://macrolepidoptera.ru/lnk/282.pdf#page=463); `admin-naryn` | Ат-Баши; дата находки неизвестна |
| `bubo-bubo` | Чуйская | [Книга, PDF с.463](https://macrolepidoptera.ru/lnk/282.pdf#page=463); `admin-chuy` | Чуйская долина; 2002 |
| `bubo-bubo` | Джалал-Абадская | [Книга, PDF с.463](https://macrolepidoptera.ru/lnk/282.pdf#page=463); `admin-jalal` | Джалал-Абадская обл; дата находки неизвестна |
| `bubo-bubo` | Ошская | [Книга, PDF с.463](https://macrolepidoptera.ru/lnk/282.pdf#page=463); `admin-protected` | Кыргызатинский; дата находки неизвестна |
| `gazella-subgutturosa` | Иссык-Кульская | [Книга, PDF с.515](https://macrolepidoptera.ru/lnk/282.pdf#page=515); `admin-lakes` | Иссык-Куля; дата находки неизвестна |
| `gazella-subgutturosa` | Баткенская | [Книга, PDF с.515](https://macrolepidoptera.ru/lnk/282.pdf#page=515); `admin-batken` | Ляйлякском районе Ошской области; 1975 |
| `dendrocopos-leucopterus` | Нарынская | [Книга, PDF с.467](https://macrolepidoptera.ru/lnk/282.pdf#page=467); `admin-naryn` | Ат-Баши; дата находки неизвестна |
| `kosopoljanskia-turkestanica` | Таласская | [Книга, PDF с.163](https://macrolepidoptera.ru/lnk/282.pdf#page=163); `admin-talas` | верховьях реки Талас; дата находки неизвестна |
| `kosopoljanskia-turkestanica` | Нарынская | [Книга, PDF с.163](https://macrolepidoptera.ru/lnk/282.pdf#page=163); `admin-naryn` | Джумгал; дата находки неизвестна |
| `alajja-anomala` | Джалал-Абадская | [Книга, PDF с.191](https://macrolepidoptera.ru/lnk/282.pdf#page=191); `admin-jalal` | Тогуз-Торо; дата находки неизвестна |
| `salvia-vvedenskyi` | Джалал-Абадская | [Книга, PDF с.197](https://macrolepidoptera.ru/lnk/282.pdf#page=197); `admin-tourism` | Чичкан; дата находки неизвестна |
| `phoenicopterus-roseus` | Иссык-Кульская | [Книга, PDF с.373](https://macrolepidoptera.ru/lnk/282.pdf#page=373); `admin-lakes` | Иссык-Куле; 2003 |
| `chlamydotis-macqueenii` | Иссык-Кульская | [Книга, PDF с.433](https://macrolepidoptera.ru/lnk/282.pdf#page=433); `admin-lakes` | Иссыккульской котловине; дата находки неизвестна |
| `numenius-tenuirostris` | Иссык-Кульская | [Книга, PDF с.447](https://macrolepidoptera.ru/lnk/282.pdf#page=447); `admin-lakes` | Иссыккульской котловине; дата находки неизвестна |
| `larus-ichtyaetus` | Чуйская | [Книга, PDF с.451](https://macrolepidoptera.ru/lnk/282.pdf#page=451); `admin-chuy` | Чуйской долине; дата находки неизвестна |
| `larus-ichtyaetus` | Иссык-Кульская | [Книга, PDF с.451](https://macrolepidoptera.ru/lnk/282.pdf#page=451); `admin-lakes` | Иссыккульской котловине; дата находки неизвестна |
| `larus-ichtyaetus` | Нарынская | [Книга, PDF с.451](https://macrolepidoptera.ru/lnk/282.pdf#page=451); `admin-lakes` | Сон-Куле; дата находки неизвестна |
| `primula-macrocalyx` | Чуйская | [Книга, PDF с.181](https://macrolepidoptera.ru/lnk/282.pdf#page=181); `admin-chuy` | Кегеты; дата находки неизвестна |
| `sonjagaster-coronatus` | Джалал-Абадская | [Книга, PDF с.251](https://macrolepidoptera.ru/lnk/282.pdf#page=251); `admin-protected` | Сары-Челекский; дата находки неизвестна |
| `capoetobrama-kuschakewitschi-orientalis` | Чуйская | [Книга, PDF с.303](https://macrolepidoptera.ru/lnk/282.pdf#page=303); `admin-chuy` | низовьев р. Чу до г. Бишкек; дата находки неизвестна |
| `schizothorax-issykkuli` | Иссык-Кульская | [Книга, PDF с.309](https://macrolepidoptera.ru/lnk/282.pdf#page=309); `admin-lakes` | оз. Иссык-Куль; дата находки неизвестна |
| `diptychus-dybowskii-lansdelli` | Иссык-Кульская | [Книга, PDF с.311](https://macrolepidoptera.ru/lnk/282.pdf#page=311); `admin-lakes` | оз. Иссык-Куль; дата находки неизвестна |
| `eryx-tataricus` | Чуйская | [Книга, PDF с.341](https://macrolepidoptera.ru/lnk/282.pdf#page=341); `admin-chuy` | Чуйская долина; дата находки неизвестна |
| `eryx-tataricus` | Таласская | [Книга, PDF с.341](https://macrolepidoptera.ru/lnk/282.pdf#page=341); `admin-talas` | Таласской долины; дата находки неизвестна |
| `eryx-tataricus` | Джалал-Абадская | [Книга, PDF с.341](https://macrolepidoptera.ru/lnk/282.pdf#page=341); `admin-jalal` | Кетмень-Тюбинская; дата находки неизвестна |
| `eryx-tataricus` | Баткенская | [Книга, PDF с.341](https://macrolepidoptera.ru/lnk/282.pdf#page=341); `admin-batken` | Баткенской области; дата находки неизвестна |
| `terpsiphone-paradisi` | Джалал-Абадская | [Книга, PDF с.471](https://macrolepidoptera.ru/lnk/282.pdf#page=471); `admin-protected` | Сары-Челекском; дата находки неизвестна |
| `otonycteris-hemprichi` | Джалал-Абадская | [Книга, PDF с.493](https://macrolepidoptera.ru/lnk/282.pdf#page=493); `admin-jalal` | Таш-Кумыра; 1966 |
| `otonycteris-hemprichi` | Ошская | [Книга, PDF с.493](https://macrolepidoptera.ru/lnk/282.pdf#page=493); `admin-osh` | Араванского района; 1992 |
| `cervus-elaphus-asiaticus` | Нарынская | [Книга, PDF с.513](https://macrolepidoptera.ru/lnk/282.pdf#page=513); `admin-protected` | Нарынского; 2003 |
| `allactaga-saltator` | Иссык-Кульская | [Книга, PDF с.525](https://macrolepidoptera.ru/lnk/282.pdf#page=525); `admin-lakes` | Иссыккульской котловине; дата находки неизвестна |
| `allactaga-saltator` | Нарынская | [Книга, PDF с.525](https://macrolepidoptera.ru/lnk/282.pdf#page=525); `admin-naryn` | Кочкорской долине; дата находки неизвестна |
| `tianschaniella-umbellifera` | Нарынская | [Книга, PDF с.201](https://macrolepidoptera.ru/lnk/282.pdf#page=201); `admin-lakes` | Чатыр-Кель; дата находки неизвестна |
| `cinereous-vulture` | Нарынская | [GBIF 3460302047](https://www.gbif.org/occurrence/3460302047) | NHMD NHMD000875335; 1920-01 |
| `allium-semenovii` | Иссык-Кульская | [GBIF 2625864765](https://www.gbif.org/occurrence/2625864765) | US US 2090191; 1936-07-04 |
| `haliaeetus-leucoryphus` | Иссык-Кульская | [GBIF 3446855612](https://www.gbif.org/occurrence/3446855612) | MZH http://id.luomus.fi/KS.UL2560; 1896-07-20 |
| `sibiraea-tianschanica` | Иссык-Кульская | [GBIF 5833161152](https://www.gbif.org/occurrence/5833161152) | MICH 1749873; 1962-08-23 |
| `kaufmannia-semenovii` | Иссык-Кульская | [GBIF 890179680](https://www.gbif.org/occurrence/890179680) | RBGE E00662335; 2013-05-01 |
| `pyrethrum-leontopodium` | Чуйская | [GBIF 6160574399](https://www.gbif.org/occurrence/6160574399) | MICH 1816639; 1917-07-10 |
| `irbis` | Таласская | [mnr-besh-tash-2025](https://www.mnr.gov.kg/ru/posts/news/v-bes-tasskom-gosudarstvennom-prirodnom-parke-zafiksirovany-dikie-zivotnye) | Первый абзац, фотоловушки сентября 2025; сентябрь 2025 |
| `argali` | Таласская | [mnr-besh-tash-2025](https://www.mnr.gov.kg/ru/posts/news/v-bes-tasskom-gosudarstvennom-prirodnom-parke-zafiksirovany-dikie-zivotnye) | Первый абзац, фотоловушки сентября 2025; сентябрь 2025 |
| `golden-eagle` | Таласская | [mnr-besh-tash-2025](https://www.mnr.gov.kg/ru/posts/news/v-bes-tasskom-gosudarstvennom-prirodnom-parke-zafiksirovany-dikie-zivotnye) | Справочно: абзац о животном мире парка; Дата отдельного наблюдения не приведена; опубликованный в 2025 году список фауны парка. |
| `saker-falcon` | Таласская | [mnr-besh-tash-2025](https://www.mnr.gov.kg/ru/posts/news/v-bes-tasskom-gosudarstvennom-prirodnom-parke-zafiksirovany-dikie-zivotnye) | Справочно: абзац о животном мире парка; Дата отдельного наблюдения не приведена; опубликованный в 2025 году список фауны парка. |
| `eurasian-lynx` | Таласская | [mnr-besh-tash-2025](https://www.mnr.gov.kg/ru/posts/news/v-bes-tasskom-gosudarstvennom-prirodnom-parke-zafiksirovany-dikie-zivotnye) | Справочно: абзац о животном мире парка; Дата отдельного наблюдения не приведена; опубликованный в 2025 году список фауны парка. |
| `black-stork` | Нарынская | [ramsar-sonkol-ris2010](https://rsis.ramsar.org/sites/default/files/rsiswp_search/exports/Ramsar-Sites-annotated-summary-Kyrgyzstan.pdf) | PDF p.1, Son-Kol Lake; Список фауны участка; most recent RIS information 2010. Дата отдельного наблюдения и дата публикации сводного PDF неизвестны. |
| `saker-falcon` | Нарынская | [ramsar-sonkol-ris2010](https://rsis.ramsar.org/sites/default/files/rsiswp_search/exports/Ramsar-Sites-annotated-summary-Kyrgyzstan.pdf) | PDF p.1, Son-Kol Lake; Список фауны участка; most recent RIS information 2010. Дата отдельного наблюдения и дата публикации сводного PDF неизвестны. |

Два дополнительных книжных соответствия не увеличили счётчик: kaufmanns-tulip—Джалал-Абад (с.83) и tianschaniella-umbellifera—Иссык-Куль (с.201). Они сохранены в `corroborations`; прежние источники и даты канонических пар не заменены.

## 66 таксонов needs_evidence

Для каждого сохранены исходный очерк, просмотренная схема, названные местности, результат дополнительного поиска при наличии и конкретная причина отказа.
Здесь «недостаточно» относится к доказательствам текущего пакета, а не к отсутствию вида в природе или невозможности будущего подтверждения.

| ID / принятое имя | Страница PDF | Названная география | Причина |
|---|---:|---|---|
| `bearded-vulture` — Gypaetus barbatus | 403 | крупные хребты Тянь-Шаня и Памиро-Алая | Общий горный ареал без однозначных областных местонахождений. |
| `ostrowskis-tulip` — Tulipa ostrowskiana | 89 | Киргизский хребет | Хребет не заменяет административную принадлежность конкретного сбора. |
| `christophs-clouded-yellow` — Colias christophi | 265 | перевалы Кара-Казык, Тенгизбай; западный Алай | Для перевалов не сохранено достаточного административного доказательства; восток Туркестанского указан предположительно, Киргизский хребет оспорен самой книгой. |
| `relict-spider` — Tricholathys relicta | 249 | окрестности Кёль-Укёк; западный Терскей | Нужна проверенная административная идентификация именно этого озера, а не похожего топонима. |
| `vigorous-ground-beetle` — Carabus validus | 259 | средний Ферганский хребет; Кокерим, Ак-Шийрак-Западный, Чаарташ | Несколько склонов и отрогов; область конкретной популяции документально не установлена. |
| `pskem-onion` — Allium pskemense | 71 | Чаткальский хребет | Трансграничный хребет без локализованного сбора. |
| `korzhinskys-pear` — Pyrus korshinskyi | 133 | Чаткальский и Ферганский хребты | Названия хребтов не доказывают все пересекаемые области. |
| `egyptian-vulture` — Neophron percnopterus | 405 | Кыргызстан в целом, низкие горные пояса | Национальное обобщение «повсеместно» не развернуто в семь отдельных доказанных областей. |
| `eminium-regelii` — Eminium regelii | 63 | Ферганский, Чаткальский, Ат-Ойнокский хребты; Северный Памиро-Алай | Общий орографический ареал; нет документированного областного сопоставления точки/местности. |
| `eremurus-zenaidae` — Eremurus zenaidae | 65 | Ферганский и Алайский хребты | Общая орография без достаточной областной локализации. |
| `tulipa-korolkowii` — Tulipa korolkowii | 87 | северный склон Туркестанского хребта | Межгосударственный и межобластной склон требует конкретного кыргызстанского местонахождения. |
| `tulipa-platystemon` — Tulipa platystemon | 91 | перевал Сары-бия, Алайский хребет | Не закреплено независимое административное доказательство точного перевала. |
| `tulipa-tetraphylla` — Tulipa tetraphylla | 95 | Внутренний Тянь-Шань | Физико-географический район шире одной области. |
| `tulipa-zenaidae` — Tulipa lehmanniana | 97 | Киргизский хребет | Горный хребет без локальности; дополнительная GBIF-запись не разрешает имя/ранг и происхождение автоматически. |
| `juno-orchioides` — Iris orchioides | 99 | Кыргызский и Таласский хребты | Нет конкретной областной локальности; найденная дополнительная запись без каталожного номера не соответствует строгому маршруту образца. |
| `iridodictyum-kolpakowskianum` — Iris kolpakowskiana | 101 | предгорья Таласского и Киргизского хребтов | Ферганское указание сама книга считает требующим проверки; остальные предгорья недостаточно локализованы. |
| `delphinium-knorringianum` — Delphinium knorringianum | 109 | Атойнокский, Туркестанский, Алайский хребты | Склоны и отроги без надежного сопоставления с конкретной областью. |
| `masaris-longicornis` — Masaris longicornis | 281 | Таласский, Алайский, Терскей; предполагаемый синоним M. tianshanicus с Иссык-Куля | Иссык-Кульское указание связано с вероятной, а не доказанной синонимией; оставшиеся хребты не заменяют локальную привязку. |
| `oxyura-leucocephala` — Oxyura leucocephala | 369 | предполагаемый пролёт через Иссык-Кульскую котловину и Чуйскую долину | Два направления в книге предположительны; ноябрьская встреча 2005 года не локализована однозначно между ними. |
| `gyps-himalayensis` — Gyps himalayensis | 407 | хребты Тянь-Шаня и Алая | Перечислены крупные хребты без отдельного областного доказательства. |
| `gyps-fulvus` — Gyps fulvus | 409 | северная и южная окраины Тянь-Шаня | Обобщенный ареал, дополнительно отмечена интерградация с кумаем. |
| `rhinolophus-bocharicus` — Rhinolophus bocharicus | 487 | северные предгорья Алайского и Туркестанского; Кеклик-Тоо | Точное современное областное сопоставление не закреплено; неопределённость музейной точки 10 км превышает расстояние до границы около 1,9 км. |
| `tadarida-teniotis` — Tadarida teniotis | 495 | окрестности города Ош; Кыргызстан в целом | Город Ош сам по себе не доказывает Ошскую область; общереспубликанское обобщение не дает семь локальных подтверждений. |
| `ursus-arctos` — Ursus arctos | 499 | многие хребты Тянь-Шаня и Памиро-Алая | Широкий ареал и перечень хребтов без достаточной областной конкретизации. |
| `martes-foina` — Martes foina | 501 | горные хребты Кыргызстана | Общая формулировка без независимого локального доказательства для области. |
| `dictyocephalus-attenuatus` — Dictyocephalos attenuatus | 39 | Северный Кыргызстан | Макрорегион без определенной области и локальности. |
| `prionus-tschitscherini` — Pogonarthron tschitscherini | 261 | предгорья вокруг Ферганской долины; Кичик-Алай, Ферганский, Чаткальский | Разорванный ареал не разнесен по областям без конкретных подтверждений. |
| `corydalis-pseudoadunca` — Corydalis pseudoadunca | 117 | Талды-Суу, Суфи-Курган, Ак-Босога, Талдык; истоки Кызыл-Суу | Нужна документированная привязка перечисленных конкретных объектов, а не присвоение всей системы Алая одной области. |
| `fumariola-turkestanica` — Fumariola turkestanica | 119 | Шахимардан, Исфайрамсай; Арпалык, Лянгар, Янги-Сай, Аушир, Курбан-Коль | Трансграничные бассейны и анклав; необходимо отделить кыргызстанские находки от Узбекистана и проверить конкретную область. |
| `rhodiola-litwinowii` — Rhodiola litwinowii | 123 | Кыргызский, Таласский, Чаткальский, Ферганский, Алайский, Туркестанский хребты | Один перечень крупных хребтов не доказывает областные пары. |
| `ammopiptanthus-nanus` — Ammopiptanthus nanus | 147 | Кавак-Тоо, Джумгал-Тоо; бассейн Кокомерена | Не подтверждена область конкретной популяции; поле GBIF «Chuy or Naryn» неоднозначно и не разделено на две связи. |
| `colutea-brachyptera` — Colutea brachyptera | 149 | Ферганский и Алайский хребты | Дополнительные сборы с историческим «Osh» до образования Баткенской области требуют реконструкции; горный ареал недостаточен. |
| `physochlaina-alaica` — Physochlaina alaica | 199 | реки Исфара, Сох, Шахимардан; Туркестанский и Алайский хребты | Трансграничные речные долины: необходимы точные кыргызстанские местности и административное сопоставление. |
| `incarvillea-olgae` — Incarvillea olgae | 205 | междуречье Шахимардана и Соха на северном Алае | Широкое междуречье с анклавами; надёжная областная локальность в сохранённом пакете не установлена. |
| `saussurea-involucrata` — Saussurea involucrata | 213 | Чон-Аксу, Торпу, Чон-Ашуу, ледник Петрова; верховья Сары-Джаза, Иныльчека, Куйлю | Не получена достаточно точная административная перекрёстная ссылка для каждого объекта; бассейны и хребты не приравнены автоматически к Иссык-Кульской области. |
| `silene-sussamyrica` — Silene sussamyrica | 105 | южный Суусамырский хребет; Кавак-Тоо, Молдо-Тоо, Кокийрим | Название Суусамырского хребта не равнозначно подтверждённой Чуйской Суусамырской долине. |
| `zygophyllum-kaschgaricum` — Zygophyllum kaschgaricum | 155 | Центральный Тянь-Шань, Сары-Джаз | Не закреплено независимое областное доказательство именно кыргызстанской части указанного местонахождения. |
| `sclerotiaria-pentaceros` — Sclerotiaria pentaceros | 159 | западная оконечность Киргизского хребта | Единственный типовой сбор без достаточной локализации; прочие сборы сама книга считает сомнительными. |
| `cnidiocarpa-alaica` — Cnidiocarpa alaica | 173 | район Карамыка на границе с Таджикистаном; южный Алай | Нужна отдельная административная и государственная локализация точного сбора. |
| `acantholimon-compactum` — Acantholimon compactum | 185 | междуречье Ляйляка и Шахимардана; северные предгорья | Название большого междуречья не позволяет присвоить область каждой популяции. |
| `scutellaria-andrachnoides` — Scutellaria andrachnoides | 187 | Нарын в предгорьях кыргызстанской Ферганской долины | Река проходит несколько областей; не подменять нижнее течение Нарынской областью по одинаковому названию. |
| `scutellaria-nepetoides` — Scutellaria nepetoides | 189 | бассейн Шахимардана, Алайский хребет | Требуется отделить анклав/зарубежную часть бассейна и установить точную кыргызстанскую местность. |
| `salvia-korolkowii` — Salvia korolkowii | 195 | бассейн Чаткала в Кыргызстане | Бассейн не заменяет доказанного административного местонахождения; дополнительная запись без каталожного номера не принята. |
| `nathaliella-alaica` — Nathaliella alaica | 203 | Шахимардан, Исфайрам-Сай, Курбан-Куль | Нужна точная административная локализация кыргызстанской части трансграничных местонахождений. |
| `lonicera-paradoxa` — Lonicera paradoxa | 207 | Кёк-Суу выше Курбан-Кёля; северный Алай | Нужен независимый административный источник для конкретного ущелья; современная дополнительная запись без номера образца не принята. |
| `campanula-eugeniae` — Campanula eugeniae | 209 | Таласский и Ферганский хребты | Крупные хребты не преобразованы в области без конкретного места. |
| `trichanthemis-aulieatensis` — Trichanthemis aulieatensis | 219 | Ичкили-Тоо, Ак-Таш, Кара-Арча; запад Киргизского хребта | Повторяющиеся топонимы требуют точного сопоставления; зарубежные места не использованы как кыргызстанские. |
| `lepidolopha-komarowii` — Lepidolopha komarowii | 225 | район слияния Кара-Суу и Нарына | Нужна точная идентификация одноимённой реки Кара-Суу и отдельная административная ссылка. |
| `kirgisobia-bohnei` — Kirgizobia bohnei | 263 | северо-восточные отроги Алая; бассейн Тара | Отроги и речной бассейн недостаточно административно локализованы сохранёнными источниками. |
| `aquila-nipalensis` — Aquila nipalensis | 421 | пролёт через Кыргызстан | В книге нет достаточного конкретного областного свидетельства; пролет не равен оседлому обитанию. |
| `hieraaetus-fasciatus` — Aquila fasciata | 427 | предполагаемое гнездование на юге Кыргызстана | Национальная формулировка вероятностная; GBIF higher-rank/неоднозначная местность не устраняет проблему. |
| `hieraaetus-pennatus` — Hieraaetus pennatus | 429 | горные леса Кыргызстана | Описание местообитания без регионально локализованной регистрации. |
| `glareola-nordmanni` — Glareola nordmanni | 449 | долинная часть Кыргызстана на пролёте | Общее указание без идентифицируемой конкретной области. |
| `otostegia-schennikovii` — Moluccella olgae | 193 | Карагаты, Ак-Шийрак-Западный, Молдо-Тоо; Шекафтар | Для конкретных мест не закреплено отдельное административное доказательство; исторический «Osh» музейных данных нельзя автоматически считать современной Ошской областью. |
| `stemmacantha-aulieatensis` — Leuzea aulieatensis | 215 | запад Киргизского хребта; Эчкилетау, Акташ, Кара-Коюн | Неоднозначные/повторяющиеся названия требуют проверки точной локальности и области. |
| `centaurea-alaica` — Rhaponticoides alaica | 217 | долина Тара, Ферганский и Алайский хребты | Не сохранено достаточного отдельного административного сопоставления места сбора. |
| `dendrocopos-major` — Dendrocopos major | 469 | Тескей Ала-Тоо, Киргизский хребет; сбор 1876 года | Горные местонахождения слишком широки; текесские сборы 1912 года указаны для Казахстана и не перенесены в Кыргызстан. |
| `hemiechinus-hypomelas` — Paraechinus hypomelas | 483 | предгорья Ошской, Баткенской, Джалал-Абадской областей, предположительно | Слово «вероятно» относится ко всем трём областям: ни одна не опубликована как подтверждённая. |
| `allactaga-severtzovi` — Allactaga severtzovi | 527 | запад Ферганской долины; Западный и Северный Тянь-Шань | Общий региональный ареал шире отдельных административных областей. |
| `anemone-obtusiloba` — Anemonastrum obtusilobum | 111 | Терскей Ала-Тоо, Сары-Джаз, Центральный Тянь-Шань | Нет отдельного достаточного административного доказательства для точной кыргызстанской локальности. |
| `berberis-kaschgarica` — Berberis ulicina | 115 | кыргызстанский бассейн Сары-Джаза | Нужно закрепить область конкретного находящегося в Кыргызстане сбора, не выводя её из общего знания о бассейне. |
| `sorbaria-olgae` — Sorbaria tomentosa | 127 | северный Алай близ Шахимардана | Трансграничное окружение анклава требует точной кыргызстанской точки/местности и административного сопоставления. |
| `dorema-microcarpum` — Ferula namanganica | 175 | склоны Чаткальского, Ферганского, Алайского хребтов к Ферганской долине | Несколько хребтов и склонов без достаточной локальной административной привязки. |
| `parnassius-loxias-tashkorensis` — Parnassius loxias loxias | 267 | левые притоки Сары-Джаза; Каинды-Катта, Уроккыр, Иныльчек-Тоо | Китайские находки номинативного подвида не перенесены; для точного кыргызстанского подвида не закреплено независимое областное сопоставление. |
| `parnassius-apollo-merzbacheri` — Parnassius apollo merzbacheri | 269 | Кыргызский, Джумгальский, Кастекский, Заилийский, Кунгей, Терскей | Карта и охрана родительского P. apollo не перенесены автоматически на подвид; указание Ат-Баши сама книга отвергает. |
| `cuon-alpinus` — Cuon alpinus | 497 | предполагаемые встречи в Тянь-Шане и Алае | Книга описывает возможное былое обитание и предполагаемые встречи; зарубежные регистрации не превращены в подтверждённые областные связи Кыргызстана. |

## Pipeline, воспроизводимость и защита данных

Единственный публичный источник региональных свидетельств — `data/geography/occurrences.source.json`.
Его проверяют существующие `validateRegionalEvidence`, `prepareMap` / `publishMap` и общий `npm run data`; второй географический каталог или обходной транспорт не создавался.
В региональном генераторе нет отдельного owner-authorized apply: условие остановки из задания не возникло. Species bulk importer, approve и provisional import не вызывались.

Валидатор ограниченно расширен для конкретных исторических очерков, административных справочников и региональных сообщений.
Исторический источник требует фиксированный SHA книги, точный URL страницы уже существующей карточки и speciesId, соседнюю страницу карты, историческую временную рамку, административное доказательство и ID исследовательского решения.
Административный справочник сам по себе не может подтвердить находку. Неизвестная дата допустима только для документированных очерков/списков с объяснением; строгие даты и точный таксон музейных образцов сохранены.
RECENT требует известный год после 2006; списки без даты наблюдения отдельно имеют undated. Координаты и лишние вложенные поля отвергаются.

Скрипт `scripts/research-map-distribution.py` работает пакетно, использует сохранённый PDF и промежуточные карты, атомарный checkpoint/resume в `.generated/map-184/`.
Фиксированные входы решений, административных источников, визуального просмотра и причин отказа находятся в `data/research/map-184/`; итоговый реестр — `data/research/map-184-full-distribution.json`.
Неожиданное изменение канонического регионального источника останавливает публикацию.

```powershell
python scripts/research-map-distribution.py scan --render
python scripts/research-map-distribution.py finalize
# Только после проверки исследовательских решений в рамках разрешённого задания:
python scripts/research-map-distribution.py finalize --publish
npm run data
```

Нужны Python с pypdfium2/Pillow, Node и уже сохранённый проверенный PDF. Просмотр схем — отдельная зафиксированная процедура, а не автоматическая интерпретация точек.
Повторная finalize без publish дала идентичные байты канонического источника, публичного JSON, исследовательского реестра и обоих файлов каталога.
Новые inputLfSha256 / regionalPayloadLfSha256 определены для UTF-8 с нормализацией CRLF→LF, чтобы перенос строк Windows не менял смысловую привязку. Старые контрольные суммы не пересчитаны.

374 исходных файла данных, фотографий, лицензий, геометрии, компонентов и локалей сверены с первоначальными сырыми хешами; соответствие аутентичным Git-объектам с исходными окончаниями строк проверяется тестом.
Сравнение всех первоначально отслеживаемых файлов выявило изменения только региональных JSON, регионального валидатора и необходимых тестовых фикстур.
Ни одна из 184 карточек, архив из двух записей, научные статусы, переводы, источники карточек, media metadata и фото не изменились.

SHA-256 исходного каталога: `22cab3d3dbad13cb44343646081fbcf9880d9fe244956e694314e808e1593935`.
SHA-256 публичного каталога: `8c87e8254851ad70ecafd256f6f8138a65d8181660b03abe20121233655ea532`.
SHA-256 локального канонического регионального файла: `bc439cb62781cafdf632679f1a2d3d67f2af28d842099d72b6105c715eeecbba`.
SHA-256 публичного регионального JSON: `7789bdde826bcb60b5fbf7f9d392cd76019f95b091f8f37cadcda789e5103c91`.
SHA-256 локального итогового исследовательского JSON: `e776abbfe289528c662536dd511bc605d71494cbae1354a06a196204cbf29312`.

## Интерфейс и проверки

Компоненты Vue, App, CSS, геометрия, локали и региональный repository не менялись.
На главной странице существующее preview намеренно показывает две миниатюры. Полный `/map` выводит все допустимые пары выбранной области через v-for без slice/лимита.
Браузерная проверка подтвердила все 208 строк и маршруты, семь областей, поиск KY/UZ/RU/EN/Latin, фильтры всех групп, мобильную ширину 390px и переход preview→полная карта с 48 записями Чуйской области.
Существующий компонент даты оставляет отдельное поле наблюдения пустым при неизвестном годе; честное объяснение неизвестной даты содержится в тексте свидетельства и метаданных. Выдуманная дата ради заполнения этого поля не добавлялась; интерфейс не переделывался.
Ошибок JavaScript в браузере — 0. Скриншоты просмотрены, локальный preview остановлен.

Обязательные команды выполнены последовательно, тяжёлые проверки не запускались параллельно:

| Проверка | Результат |
|---|---|
| `npm test -- --test-concurrency=1` | 368/368 PASS, 0 failed/skipped/todo |
| `npm run data` | PASS: 184, архив 2, викторина 18, области 7, связи 208 |
| `npm run data:validate` | PASS; 628 ключей × 4 языка; generated outputs актуальны |
| `npm run build` | PASS, production build и postbuild |
| Браузерный `tests/browser/map-full-distribution.mjs` | 5/5 сценариев, ошибок 0 |
| Повторная finalize | Побайтово идентичные результаты |
| `git diff --check` | PASS |

Исторические тесты 27.1 теперь воспроизводят свой неизменный шестисвязный Git-снимок; ранний приватный черновик проверяется в контексте той публикации.
Исторический pipeline использует подлинный двухсвязный источник своего этапа вместо новых связей с отсутствовавшими тогда видами.
Старые исторические хеши не обновлялись и снимки не подменялись текущими; текущий набор отдельно проверяется новыми тестами полноты, таксономических рамок, дат, приватности, дублей, источников и неизменности данных.
Первые пять диагностических ошибок касались исторической фикстуры (2), различия CRLF/Git LF (2), выбора первой из нескольких областей джейрана в новом тесте (1); научные карточки ради тестов не исправлялись.

Свободно перед завершающими проверками: 7 190 888 448 байт (около 6,70 GiB); после: 9,180,557,312 байт (около 8.55 GiB).
ENOSPC не возникала. Научные материалы, .generated, фотографии и Git-история не удалялись.
Размер dist: 38,583,711 байт (около 36.80 MiB).
Логи, снимки страниц и checkpoint сохранены в `.generated/map-184/`; они не включают изменения публичного каталога видов.

## Коммиты и Git

Коммит завершённого исследования, данных и тестов: `654badc65a69c70d7e5f848e6071a0c5ba93080f` — `Research all 184 taxa and publish documented oblast evidence`.
После него рабочее дерево было чистым. Второй коммит содержит только этот отчёт.
Хеш итогового коммита отчёта разрешается без самоссылочного изменения файла командой:

```powershell
git log -1 --format=%H -- docs/research/map-184-full-distribution.md
git rev-parse HEAD
git status --short
```

Итоговый HEAD после коммита отчёта сообщается владельцу в результате задачи; ожидаемое итоговое `git status --short` — пусто.
Merge, push и deployment не выполнялись. Новые виды, фотографии и следующая задача по численности не начинались.
