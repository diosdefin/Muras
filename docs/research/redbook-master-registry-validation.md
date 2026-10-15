# MURAS — единый научный реестр, задача №22.2

Дата: 14.10.2026. Ветка: `feature/bulk-import`. Исходный HEAD:
`3bc15e090af4139dbee75352e06c253232459231`; рабочее дерево в начале было чистым.
Это исследовательские данные, не публичные карточки. Реальных импортов — 0.

## Точный результат

Из национального издания извлечены **202 индивидуальные позиции**; из документальной
копии редакции постановления 2009 года — **219 пронумерованных строк**, в том числе
**17 исключённых строк без восстановленных названий** и **202 активные позиции этой редакции**.
Это число национальных позиций, а не число независимых принятых современных видов.

С 40 существующими записями MURAS сопоставлены 40 национальных очерков; учтены научные
имена, документированные исторические связи и пересечения вида/подвида. Вне каталога
остаются 162 позиции книги. Из них выбраны **60 новых национально подтверждённых
кандидатов**: 46 с собранной точной таксономической базой, 14 требуют её уточнения.
Ещё 102 позиции находятся вне первой очереди; среди них уже выявлен один синонимический
дубль выбранного кандидата, остальные 101 не прошли индивидуальную таксономическую проверку.

В bulk-реестре: `research_ready:46`, `needs_evidence:14`, все другие состояния — 0.
Публикационных черновиков, `ready_for_review`, `approved_for_import` и `imported` — 0.
По технической семантике CLI все 60 отложены, поскольку даже у 46 нет публикационного
`draft`. Отложенный черновик не означает неподтверждённое национальное включение.
Ни одна запись не получает `verified:true` или редакторское одобрение автоматически.

## Национальные источники и степень достоверности

| Источник | Год / орган | Полный текст и достоверность | Состав |
|---|---|---|---|
| [Красная книга Кыргызской Республики, 2-е издание](https://macrolepidoptera.ru/lnk/282.pdf) | 2006; ГАОСЛХ при Правительстве КР, Биолого-почвенный институт НАН КР, ЭД «Алейне»; ISBN 9967-23-367-2 | Доступен скан официального издания на стороннем зеркале. Прочитаны и визуально проверены титул/выходные данные, разделы и указатель; 543 страницы PDF, в выходных данных 544 печатные страницы. Высокая достоверность исторического документа. | 202 очерка; растения 83, грибы 4, членистоногие 18, рыбы 7, амфибии 2, рептилии 8, птицы 57, млекопитающие 23 |
| [Постановление №170 от 28.04.2005, редакция №471 от 25.07.2009 — FAOLEX](https://faolex.fao.org/docs/pdf/kyr104340.pdf) | 2005 / 2009; Правительство КР, документальная копия FAO | Доступны все 13 страниц. Таблицы растровые; все приложения просмотрены и транскрибированы по страницам. Высокая документальная достоверность копии; актуальность правовой редакции 2026 не подтверждена. | 219 строк нумерации, 17 исключённых, 202 активные позиции копии 2009 |
| [Официальная карточка №170, ЦБД Минюста](https://cbd.minjust.gov.kg/7-10707/edition/354076/ru) | Правительство КР / Минюст | Web получил оболочку приложения без документа; прямой fetch также не дал текст. Актуальная редакция и история изменений не прочитаны. | Не установлено по текущей официальной карточке |
| [Самостоятельная карточка №471](https://prg.kz/document/?doc_id=30453813) | 25.07.2009; Правительство КР, коммерческая правовая карточка | Получено название/карточка, полного текста изменений нет. Самостоятельный текст не использован для восстановления удалённых названий. | Не подсчитывался; изменения подтверждены в консолидации FAOLEX |
| [Положение о Красной книге, №189](https://faolex.fao.org/docs/pdf/kyr159554.pdf) | 11.04.2016; Правительство КР / FAOLEX | Доступны 5 страниц. Регламентирует порядок ведения/пересмотра; не является новым поимённым списком. | 0 позиций списка, поскольку документ не содержит перечня |
| [Минприроды о начале обновления](https://mnr.gov.kg/ru/posts/news/ministerstvo-prirodnyx-resursov-ekologii-i-texniceskogo-nadzora-kyrgyzskoi-respubliki-sovmestno-s-nacionalnoi-akademiei-nauk-pristupaet-k-rabote-po-obnovleniyu-krasnoi-knigi) | 09.06.2026; МПРЭТН КР | Официальное сообщение о проекте на 24 месяца. Не утверждает новый перечень. В сообщении число 89 для растений и грибов расходится с 87 активными позициями двух прочитанных перечней. Расхождение сохранено. | Только агрегированные числа, поимённого перечня нет |
| [План мероприятий Кабинета Министров до 2030 года](https://www.gov.kg/files/news/froala/d412d342177879ebbdb4663781a6e8a71c6b92ec.pdf#page=270) | Орган: Кабинет Министров, gov.kg; точный год данного PDF не установлен | Web PDF reader читает 284 страницы; прямой fetch не удался. Пункт 877, с.270–271 планирует обновление перечня/книжной версии на I кв.2027 – IV кв.2029. План не является принятым новым списком. | Новый состав таксонов не приведён |

Сведения раздельно сохранены в `docs/evidence/redbook-master-sources.json`:
URL, издатель, год/дата при наличии, доступность, способ чтения, степень достоверности,
HTTP-результаты, размер и SHA-256 скачанных документов. Свежий PDF книги совпал с
предыдущим кешем: `f517212f7ce12fcf5c30f2cf73edc5a842b3ded15dea232b844fbe7ce2525cf8`.
PDF постановления: `1e47f07208cf45d90096f0b9775fd625dd2102e06b42cf69610a49cc57f21be4`.

## Что именно сравнивалось

Полностью извлечены **состав очерков книги 2006** и **таблицы консолидации 2009**.
Номера приложений/строк и страниц сохранены в
`data/research/redbook-master-national-lists.json`. В книге одна запись относится
к паре KY/RU страниц; альтернативные имена одного очерка из латинского указателя
сохранены отдельно и не увеличивают число записей.

В приложении 1 постановления 99 номеров: среди них 6 грибных номеров 90–95
(2 исключены) и 93 растительных номера (10 исключены). Приложение 2: 26 номеров,
3 исключены; приложение 3: 59 номеров, 2 исключены. Приложения 4–6: 18, 10, 7
номеров, без исключённых строк в просмотренной копии. Поэтому считать количество
охраняемых позиций по последнему номеру строки неправильно.

183 очерка имеют прямое совпадение научного имени или альтернативного имени того
же очерка с таблицей 2009. **19** требуют отдельной орфографической/таксономической
сверки между источниками. Одинаковая сумма 202 не означает полностью тождественные
имена, ранги и концепции. Исходные написания не заменены автоматически современными.
Опечатка указателя `Barbestella leucomelas` сохранена; для кандидата взято
`Barbastella leucomelas` из заголовка очерка с.490–491 и национальной таблицы.

Отдельного полного текста перечня 2005 **до** редакции 2009 не получено: названия
17 удалённых строк остаются `null`, они не восстановлены догадками. Альтернативный
[файл с 2007 в URL](https://fauna.kg/wp-content/uploads/2020/07/Red_Book_KR-2-2007.pdf)
не прочитан; год в имени URL не принят за доказательство другого издания.
Вторичное сообщение об изменениях 2019 года не подтверждено поимённым официальным
актом и не использовано для новых включений. Отсутствие найденного акта не доказывает,
что изменений после 2009 не было. Правовой статус на 14.10.2026 остаётся отдельной
задачей проверки актуальной официальной редакции.

## Покрытие восьми групп

Распределение соответствует фактическим источникам и выбранным очеркам; равномерного
числа видов не задавалось. Приоритет отдан национально подтверждённым индивидуальным
очеркам с сохранившимися страницами. В многочисленных группах взяты ранние оставшиеся
очерки; малые группы представлены доступными ещё не внесёнными концепциями, даже
если их современная таксономия остаётся нерешённой.

| Группа | Книга 2006 | Активные позиции копии 2009 | Уже в MURAS | Новая очередь | Точная таксономическая база | Требуют сверки |
|---|---:|---:|---:|---:|---:|---:|
| Млекопитающие | 23 | 23 | 7 | 10 | 8 | 2 |
| Птицы | 57 | 57 | 9 | 22 | 19 | 3 |
| Пресмыкающиеся | 8 | 8 | 3 | 4 | 2 | 2 |
| Земноводные | 2 | 2 | 1 | 1 | 0 | 1 |
| Рыбы | 7 | 7 | 2 | 2 | 0 | 2 |
| Членистоногие | 18 | 18 | 6 | 4 | 2 | 2 |
| Растения | 83 | 83 | 10 | 15 | 15 | 0 |
| Грибы | 4 | 4 | 2 | 2 | 0 | 2 |
| **Всего** | **202** | **202** | **40** | **60** | **46** | **14** |

## Сопоставление с существующими 40

`redbook-master-reconciliation.json` содержит индивидуальную связь каждого
существующего ID с национальным очерком. Помимо совпадающих имён, сохранены связи:
Uncia uncia / Panthera uncia; Agrionemys horsfieldi / Testudo horsfieldii;
Glyptosternum reticulatum / Glyptosternon reticulatum; Scutiger tianschanicus /
Albatrellus tianschanicus. Доказательства — научные ссылки существующих карточек
и ранее сохранённые таксономические свидетельства; русские названия не используются
как единственный ключ.

Abies semenovii / Abies sibirica semenovii и Otis tarda / Otis tarda tarda
отмечены как пересечения национального видового концепта и существующего подвида,
а не как разрешение добавить родительский вид. Текущие карточки не редактируются.
Фото присутствуют у 32 записей, файлов 33 (два у ирбиса); все сохранены.

## Таксономические результаты и конфликты

Выполнен ограниченный последовательный проход официального API GBIF: 62 сохранённых
первичных запроса имени (61 национальная позиция, с отдельным запросом исправленного
по заголовку Barbastella). EXACT SYNONYM дополнен записью acceptedUsageKey.
Это только номенклатурные свидетельства, **не** доказательства национального включения.
IUCN, численность, питание, размножение, фото и наблюдения массово не запрашивались.
Все ответы/URL/даты сохранены в `docs/evidence/redbook-master-taxonomy.json`.

Tulipa rosea и Tulipa korolkowii имеют один принятый GBIF taxonId `gbif:5299568`.
T. rosea не создаёт второй кандидат: национальная позиция с.92–93 остаётся в исходном
списке со ссылкой на выбранный T. korolkowii; в очередь вместо неё взят национальный
Delphinium knorringianum. Файл выбора сохраняет эту правку и основания.

В 46 случаях собраны EXACT-имя и ACCEPTED-запись того же ранга, включая подтверждённые
синонимы. Принятые имена — по указанному источнику GBIF; это не самостоятельная
экспертная ревизия мировой таксономии. Редакторское/научное одобрение ещё необходимо.
В 14 случаях принятое имя **национальной концепции** остаётся `null`, а предложения
GBIF сохранены отдельно и не подставлены вместо неё:

| Национальное имя | Match | Предложение GBIF | Причина отложения |
|---|---|---|---|
| Dictyocephalus attenuatus | NONE | нет точного результата | Нет EXACT принятого таксона того же ранга; требуется номенклатурная сверка, без автоматического исправления. |
| Dictyophora duplicata | EXACT | Phallus indusiatus | GBIF объединяет Dictyophora duplicata с Phallus indusiatus; микологические публикации обсуждают отдельный P. duplicatus и комплекс P. indusiatus s.l. Требуется специализированная сверка национального очерка. |
| Sonjagaster coronatus | NONE | нет точного результата | Нет EXACT принятого таксона того же ранга; требуется номенклатурная сверка, без автоматического исправления. |
| Prionus tschitscherini | NONE | нет точного результата | Нет EXACT принятого таксона того же ранга; требуется номенклатурная сверка, без автоматического исправления. |
| Schizothorax issykkuli | NONE | нет точного результата | Нет EXACT принятого таксона того же ранга; требуется номенклатурная сверка, без автоматического исправления. |
| Diptychus dybowskii lansdelli | NONE | нет точного результата | Нет EXACT принятого таксона того же ранга; требуется номенклатурная сверка, без автоматического исправления. |
| Bufo viridis | EXACT | Bufotes viridis | Bufo viridis в национальном источнике — исторический комплекс; AMNH отмечает присутствие Bufotes viridis s.str. в KG как вероятное/спорное. Не подменять национальный концепт современным видом. |
| Novoeumeces schneideri princeps | NONE | нет точного результата | Нет EXACT принятого таксона того же ранга; требуется номенклатурная сверка, без автоматического исправления. |
| Spalerosophis diadema schiraziana | FUZZY | Spalerosophis diadema schirazianus | Нет EXACT принятого таксона того же ранга; требуется номенклатурная сверка, без автоматического исправления. |
| Anser indica | FUZZY | Anser indicus | Нет EXACT принятого таксона того же ранга; требуется номенклатурная сверка, без автоматического исправления. |
| Falco peregrinus | EXACT | Falco peregrinus | В очереди также Falco pelegrinoides, который GBIF относит к Falco peregrinus pelegrinoides. Национальные два очерка нельзя автоматически импортировать как независимые непересекающиеся современные таксоны. |
| Falco pelegrinoides | EXACT | Falco peregrinus pelegrinoides | GBIF принимает Falco peregrinus pelegrinoides в ранге SUBSPECIES, национальный заголовок Falco pelegrinoides имеет ранг SPECIES; требуется разрешить пересечение с Falco peregrinus. |
| Otonycteris hemprichi | FUZZY | Otonycteris hemprichii | Нет EXACT принятого таксона того же ранга; требуется номенклатурная сверка, без автоматического исправления. |
| Allactaga saltator | NONE | нет точного результата | Нет EXACT принятого таксона того же ранга; требуется номенклатурная сверка, без автоматического исправления. |

Для Bufo viridis дополнительно прочитан первичный специализированный
[справочник AMNH](https://amphibiansoftheworld.amnh.org/Amphibia/Anura/Bufonidae/Bufotes/Bufotes-viridis),
который отмечает неопределённость присутствия современного B. viridis s.str. в KG.
Для Dictyophora duplicata сопоставлены
[микологическая работа 2014](https://onlinelibrary.wiley.com/doi/10.1155/2014/490847)
и [исследование комплекса 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6785576/).
Их различающиеся концепции требуют специалиста; они не подтверждают национальное
включение, которое здесь подтверждено индивидуальными страницами книги.
У Falco pelegrinoides GBIF меняет ранг на подвид F. peregrinus; обе связанные позиции
оставлены на проверку, автоматическое разрешение вида/подвида не сделано.

Встречаемость каждого кандидата проверена по разделу «Распространение общее и в стране»
соответствующего очерка. `countryOccurrence.confirmed:true` относится к историческому
имени/концепции национального источника 2006 года; `currentPresenceConfirmed:null`.
Книга различает гнездование, пролёт, старые находки и отсутствие современных данных.
Эти различия не превращены в подтверждённые наблюдения 2026 года, координаты или карту.

## Формат и сохранённые материалы

- `data/research/redbook-master-national-lists.json` — оба полных исходных списка,
  страницы, заголовки/альтернативы, 17 исключённых номеров, без восстановления имён.
- `data/research/redbook-master-selection.json` — 60 выбранных национальных ID и
  основания выбора, синонимического исключения и исправления опечатки указателя.
- `data/research/redbook-master-candidates.json` — вход существующего bulk CLI.
- `data/research/redbook-master-registry.json` — действующий bulk-research-registry:
  60 кандидатов, `batchSize:25`, состояния и диагностические контрольные точки.
- `data/research/redbook-master-reconciliation.json` — сопоставление 40 записей,
  статусы всех 202 очерков, сравнение редакций, покрытие групп и перечень партий.
- `docs/evidence/redbook-master-sources.json`, `redbook-master-taxonomy.json`,
  `redbook-master-pipeline-report.json`, `redbook-master-catalog-baseline.json` —
  проверяемые свидетельства, результаты CLI и контрольный снимок каталога.

Полные PDF/HTML кешируются в игнорируемой `.generated/task22-master`; структурные
исследовательские результаты и ответы GBIF сохранены в Git. Книга была прочитана
пакетно из общего кеша, а не перечитана для каждого кандидата. Все кандидаты ссылаются
на три общих локальных материала с SHA-256; LF-правила в `.gitattributes` сохраняют
проверяемые байты на Windows. Скрипт `prepare-redbook-master-registry.mjs` работает
только offline и не изменяет действующий реестр/решения редактора или каталог.

## Партии для следующего этапа

Ниже 25 + 25 + 10. В первой партии научная база собрана у всех 25, во второй у 21
(4 требуют сверки), в третьей все 10 требуют таксономической сверки. У всех отсутствуют
публикационный draft, подготовленные тексты KY/UZ/RU/EN и независимый просмотр.
Фото не исследовались и не загружались; допустим placeholder по текущей модели.
Дубликаты каталога/архива и очереди — 0. Содержимое отдельных batch-N.json создаётся
существующим resume в `.generated/bulk-pipeline/redbook-master-60`.

### redbook-master-60-1: 25 позиций

| ID | Имя национального источника | Принятое имя по проверенному свидетельству | Национальный первоисточник | Состояние |
|---|---|---|---|---|
| `eminium-regelii` | Eminium regelii | Eminium regelii | [2006, с.63](https://macrolepidoptera.ru/lnk/282.pdf#page=63) | research_ready |
| `eremurus-zenaidae` | Eremurus zenaidae | Eremurus zenaidae | [2006, с.65](https://macrolepidoptera.ru/lnk/282.pdf#page=65) | research_ready |
| `eremurus-zoae` | Eremurus zoae | Eremurus zoae | [2006, с.67](https://macrolepidoptera.ru/lnk/282.pdf#page=67) | research_ready |
| `allium-dodecadontum` | Allium dodecadontum | Allium dodecadontum | [2006, с.69](https://macrolepidoptera.ru/lnk/282.pdf#page=69) | research_ready |
| `allium-semenovii` | Allium semenovii | Allium semenovii | [2006, с.73](https://macrolepidoptera.ru/lnk/282.pdf#page=73) | research_ready |
| `tulipa-affinis` | Tulipa affinis | Tulipa fosteriana | [2006, с.77](https://macrolepidoptera.ru/lnk/282.pdf#page=77) | research_ready |
| `tulipa-anadroma` | Tulipa anadroma | Tulipa tschimganica | [2006, с.79](https://macrolepidoptera.ru/lnk/282.pdf#page=79) | research_ready |
| `tulipa-korolkowii` | Tulipa korolkowii | Tulipa korolkowii | [2006, с.87](https://macrolepidoptera.ru/lnk/282.pdf#page=87) | research_ready |
| `tulipa-platystemon` | Tulipa platystemon | Tulipa platystemon | [2006, с.91](https://macrolepidoptera.ru/lnk/282.pdf#page=91) | research_ready |
| `tulipa-tetraphylla` | Tulipa tetraphylla | Tulipa tetraphylla | [2006, с.95](https://macrolepidoptera.ru/lnk/282.pdf#page=95) | research_ready |
| `tulipa-zenaidae` | Tulipa zenaidae | Tulipa lehmanniana | [2006, с.97](https://macrolepidoptera.ru/lnk/282.pdf#page=97) | research_ready |
| `juno-orchioides` | Juno orchioides | Iris orchioides | [2006, с.99](https://macrolepidoptera.ru/lnk/282.pdf#page=99) | research_ready |
| `iridodictyum-kolpakowskianum` | Iridodictyum kolpakowskianum | Iris kolpakowskiana | [2006, с.101](https://macrolepidoptera.ru/lnk/282.pdf#page=101) | research_ready |
| `thesium-minkwitzianum` | Thesium minkwitzianum | Chrysothesium minkwitzianum | [2006, с.103](https://macrolepidoptera.ru/lnk/282.pdf#page=103) | research_ready |
| `delphinium-knorringianum` | Delphinium knorringianum | Delphinium knorringianum | [2006, с.109](https://macrolepidoptera.ru/lnk/282.pdf#page=109) | research_ready |
| `urocerus-sah` | Urocerus sah | Urocerus sah | [2006, с.275](https://macrolepidoptera.ru/lnk/282.pdf#page=275) | research_ready |
| `masaris-longicornis` | Masaris longicornis | Masaris longicornis | [2006, с.281](https://macrolepidoptera.ru/lnk/282.pdf#page=281) | research_ready |
| `varanus-griseus-caspius` | Varanus griseus caspius | Varanus griseus caspius | [2006, с.335](https://macrolepidoptera.ru/lnk/282.pdf#page=335) | research_ready |
| `eryx-tataricus` | Eryx tataricus | Eryx miliaris | [2006, с.341](https://macrolepidoptera.ru/lnk/282.pdf#page=341) | research_ready |
| `lyrurus-tetrix` | Lyrurus tetrix | Lyrurus tetrix | [2006, с.359](https://macrolepidoptera.ru/lnk/282.pdf#page=359) | research_ready |
| `cygnus-cygnus` | Cygnus cygnus | Cygnus cygnus | [2006, с.363](https://macrolepidoptera.ru/lnk/282.pdf#page=363) | research_ready |
| `aythya-nyroca` | Aythya nyroca | Aythya nyroca | [2006, с.365](https://macrolepidoptera.ru/lnk/282.pdf#page=365) | research_ready |
| `mergus-serrator` | Mergus serrator | Mergus serrator | [2006, с.367](https://macrolepidoptera.ru/lnk/282.pdf#page=367) | research_ready |
| `oxyura-leucocephala` | Oxyura leucocephala | Oxyura leucocephala | [2006, с.369](https://macrolepidoptera.ru/lnk/282.pdf#page=369) | research_ready |
| `gavia-arctica` | Gavia arctica | Gavia arctica | [2006, с.371](https://macrolepidoptera.ru/lnk/282.pdf#page=371) | research_ready |

### redbook-master-60-2: 25 позиций

| ID | Имя национального источника | Принятое имя по проверенному свидетельству | Национальный первоисточник | Состояние |
|---|---|---|---|---|
| `ciconia-ciconia` | Ciconia ciconia | Ciconia ciconia | [2006, с.377](https://macrolepidoptera.ru/lnk/282.pdf#page=377) | research_ready |
| `platalea-leucorodia` | Platalea leucorodia | Platalea leucorodia | [2006, с.379](https://macrolepidoptera.ru/lnk/282.pdf#page=379) | research_ready |
| `pelecanus-onocrotalus` | Pelecanus onocrotalus | Pelecanus onocrotalus | [2006, с.381](https://macrolepidoptera.ru/lnk/282.pdf#page=381) | research_ready |
| `phalacrocorax-pygmaeus` | Phalacrocorax pygmaeus | Microcarbo pygmaeus | [2006, с.385](https://macrolepidoptera.ru/lnk/282.pdf#page=385) | research_ready |
| `falco-naumanni` | Falco naumanni | Falco naumanni | [2006, с.387](https://macrolepidoptera.ru/lnk/282.pdf#page=387) | research_ready |
| `falco-rusticolus` | Falco rusticolus | Falco rusticolus | [2006, с.391](https://macrolepidoptera.ru/lnk/282.pdf#page=391) | research_ready |
| `pandion-haliaetus` | Pandion haliaetus | Pandion haliaetus | [2006, с.397](https://macrolepidoptera.ru/lnk/282.pdf#page=397) | research_ready |
| `haliaeetus-leucoryphus` | Haliaeetus leucoryphus | Haliaeetus leucoryphus | [2006, с.399](https://macrolepidoptera.ru/lnk/282.pdf#page=399) | research_ready |
| `haliaeetus-albicilla` | Haliaeetus albicilla | Haliaeetus albicilla | [2006, с.401](https://macrolepidoptera.ru/lnk/282.pdf#page=401) | research_ready |
| `gyps-himalayensis` | Gyps himalayensis | Gyps himalayensis | [2006, с.407](https://macrolepidoptera.ru/lnk/282.pdf#page=407) | research_ready |
| `gyps-fulvus` | Gyps fulvus | Gyps fulvus | [2006, с.409](https://macrolepidoptera.ru/lnk/282.pdf#page=409) | research_ready |
| `circaetus-gallicus` | Circaetus gallicus | Circaetus gallicus | [2006, с.413](https://macrolepidoptera.ru/lnk/282.pdf#page=413) | research_ready |
| `circus-macrourus` | Circus macrourus | Circus macrourus | [2006, с.415](https://macrolepidoptera.ru/lnk/282.pdf#page=415) | research_ready |
| `neomys-fodiens` | Neomys fodiens | Neomys fodiens | [2006, с.485](https://macrolepidoptera.ru/lnk/282.pdf#page=485) | research_ready |
| `rhinolophus-bocharicus` | Rhinolophus bocharicus | Rhinolophus bocharicus | [2006, с.487](https://macrolepidoptera.ru/lnk/282.pdf#page=487) | research_ready |
| `barbastella-leucomelas` | Barbastella leucomelas | Barbastella leucomelas | [2006, с.491](https://macrolepidoptera.ru/lnk/282.pdf#page=491) | research_ready |
| `tadarida-teniotis` | Tadarida teniotis | Tadarida teniotis | [2006, с.495](https://macrolepidoptera.ru/lnk/282.pdf#page=495) | research_ready |
| `ursus-arctos` | Ursus arctos | Ursus arctos | [2006, с.499](https://macrolepidoptera.ru/lnk/282.pdf#page=499) | research_ready |
| `martes-foina` | Martes foina | Martes foina | [2006, с.501](https://macrolepidoptera.ru/lnk/282.pdf#page=501) | research_ready |
| `lutra-lutra` | Lutra lutra | Lutra lutra | [2006, с.505](https://macrolepidoptera.ru/lnk/282.pdf#page=505) | research_ready |
| `allactaga-elater` | Allactaga elater | Allactaga elater | [2006, с.523](https://macrolepidoptera.ru/lnk/282.pdf#page=523) | research_ready |
| `dictyocephalus-attenuatus` | Dictyocephalus attenuatus | не установлено для национальной концепции | [2006, с.39](https://macrolepidoptera.ru/lnk/282.pdf#page=39) | needs_evidence |
| `dictyophora-duplicata` | Dictyophora duplicata | не установлено для национальной концепции | [2006, с.41](https://macrolepidoptera.ru/lnk/282.pdf#page=41) | needs_evidence |
| `sonjagaster-coronatus` | Sonjagaster coronatus | не установлено для национальной концепции | [2006, с.251](https://macrolepidoptera.ru/lnk/282.pdf#page=251) | needs_evidence |
| `prionus-tschitscherini` | Prionus tschitscherini | не установлено для национальной концепции | [2006, с.261](https://macrolepidoptera.ru/lnk/282.pdf#page=261) | needs_evidence |

### redbook-master-60-3: 10 позиций

| ID | Имя национального источника | Принятое имя по проверенному свидетельству | Национальный первоисточник | Состояние |
|---|---|---|---|---|
| `schizothorax-issykkuli` | Schizothorax issykkuli | не установлено для национальной концепции | [2006, с.309](https://macrolepidoptera.ru/lnk/282.pdf#page=309) | needs_evidence |
| `diptychus-dybowskii-lansdelli` | Diptychus dybowskii lansdelli | не установлено для национальной концепции | [2006, с.311](https://macrolepidoptera.ru/lnk/282.pdf#page=311) | needs_evidence |
| `bufo-viridis` | Bufo viridis | не установлено для национальной концепции | [2006, с.327](https://macrolepidoptera.ru/lnk/282.pdf#page=327) | needs_evidence |
| `novoeumeces-schneideri-princeps` | Novoeumeces schneideri princeps | не установлено для национальной концепции | [2006, с.339](https://macrolepidoptera.ru/lnk/282.pdf#page=339) | needs_evidence |
| `spalerosophis-diadema-schiraziana` | Spalerosophis diadema schiraziana | не установлено для национальной концепции | [2006, с.343](https://macrolepidoptera.ru/lnk/282.pdf#page=343) | needs_evidence |
| `anser-indica` | Anser indica | не установлено для национальной концепции | [2006, с.361](https://macrolepidoptera.ru/lnk/282.pdf#page=361) | needs_evidence |
| `falco-peregrinus` | Falco peregrinus | не установлено для национальной концепции | [2006, с.393](https://macrolepidoptera.ru/lnk/282.pdf#page=393) | needs_evidence |
| `falco-pelegrinoides` | Falco pelegrinoides | не установлено для национальной концепции | [2006, с.395](https://macrolepidoptera.ru/lnk/282.pdf#page=395) | needs_evidence |
| `otonycteris-hemprichi` | Otonycteris hemprichi | не установлено для национальной концепции | [2006, с.493](https://macrolepidoptera.ru/lnk/282.pdf#page=493) | needs_evidence |
| `allactaga-saltator` | Allactaga saltator | не установлено для национальной концепции | [2006, с.525](https://macrolepidoptera.ru/lnk/282.pdf#page=525) | needs_evidence |

Для каждой позиции точные дополнительные ссылки на национальные строки 2009 при
совпадении, основные пробелы и степень готовности находятся также в массиве
`batches[].candidates` файла reconciliation и в диагностике реестра. При расхождении
написаний между источниками не подставляется предположительная ссылка на строку.

## Реально выполненные команды PowerShell

После offline подготовки выполнены prepare, check, report, resume:

```powershell
Set-Location 'C:\Users\Asus\Desktop\Redbook'
node scripts/prepare-redbook-master-registry.mjs

# Создание нового реестра. Сейчас он уже создан; повтор защищён EEXIST.
npm run data:bulk:prepare -- --input data/research/redbook-master-candidates.json --registry data/research/redbook-master-registry.json --id redbook-master-60 --batch-size 25
npm run data:bulk:check -- --registry data/research/redbook-master-registry.json --report .generated/task22-master/pipeline-check.json
npm run data:bulk:report -- --registry data/research/redbook-master-registry.json --report .generated/task22-master/pipeline-report.json
npm run data:bulk:resume -- --registry data/research/redbook-master-registry.json

# Дальнейшая повторная проверка только первой партии.
npm run data:bulk:check -- --registry data/research/redbook-master-registry.json --batch 1

node --test tests/redbook-master-registry.test.mjs
npm test
npm run data:validate
npm run build
```

Путь реестра использует дефисы: фактический CLI не разрешает дополнительные точки
в basename. Команды approve/apply на реальном реестре **не выполнялись**.
Check/report не меняют реестр и исходные научные данные. Resume сохраняет только
исследовательские состояния и черновые очереди, не публичные виды.

## Испытания и неизменность

Три новых предметных теста проверяют 202/219/17, полноту нумерации, запрет восстановления
исключённых названий, 40 индивидуальных fingerprints, синоним T. rosea, пересечения
родителя/подвида, неизменность источника, offline повторяемость, SHA-256 материалов,
60 реальных национальных ссылок, 46/14 состояний, 25/25/10 партий и отсутствие одобрения.
Исследовательский draft нельзя передать старому импортёру как species-import-batch.

Результаты полного запуска: `npm test` — **270/270**, `npm run data:validate` —
**614 ключей × 4 языка**, каталог 40, архив 2; `npm run build` — успешная production-сборка.
Ограниченная среда препятствует чтению родительских каталогов esbuild; тесты Vue и сборка
выполнены с разрешённым расширенным доступом, конфигурация сайта не изменялась.

Повторная offline подготовка даёт одинаковые candidates/reconciliation и не переписывает
реестр. Повторное создание уже существующего реестра возвращает EEXIST, сохраняя его
байты. Повторный check/resume не добавляет кандидатов и сохраняет 46/14 результатов.
Все 152 ранее отслеживаемых файла в data/public/src побайтно совпадают с исходным снимком.
Новые исследовательские файлы в data/research не входят в публичную генерацию.
40 карточек, архив, 33 фото и лицензии, четыре языка, поиск, маршруты видов, численность
и карта сохранены; существующие тесты и сборка это подтверждают. Ручной браузерный
прогон отдельно не проводился.

## Следующие 20–25 записей

Начать с `redbook-master-60-1`: прочитать полные очерки и независимые современные
первичные источники, уточнить статус/таксономическую концепцию и ограничения
исторической встречаемости, затем подготовить корректный draft по действующей модели.
Нужны sourced короткие KY/UZ/RU/EN и полное описание, с `sources.supports`;
неизвестные народные названия — null. Отсутствующие оценки популяции остаются unknown,
независимая популяционная проверка — pending. Отдельно исследовать допустимые фото,
авторов и лицензии либо использовать placeholder. Перед публичным импортом —
независимый редакторский просмотр и явное актуальное approve, затем строгий check/apply.

Для второго/третьего пакета сначала разрешить 14 отмеченных научных пробелов.
Для заявления о действующем национальном правовом статусе нужен доступный полный
официальный актуальный перечень и история его изменений. Историческая книга/копия
2009, GBIF и новость о будущей работе этого заявления не заменяют.

Merge, push и deployment не выполнялись.
