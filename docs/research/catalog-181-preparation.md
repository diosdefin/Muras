# MURAS №25.5 — подготовка кандидатов после разрешения конфликтов

Дата: **22 октября 2026**, Asia/Bishkek. Ветка: **feature/catalog-200**.
Исходный HEAD проверен: **903a932a8b7577b85d9c3734bee03ce512e0b72e**, рабочее дерево было чистым.

Подготовлены ровно **15 черновиков из READY задачи №25.4**. Из них **12 ready_for_review**, **3 needs_evidence**. Чужие NEEDS_EVIDENCE, DUPLICATE и EXCLUDED не включены. В публичном каталоге по-прежнему **166 записей**, в архиве **2**. Импорт и научное одобрение не выполнялись. Возможный размер после отдельного разрешения на нынешний допустимый пакет — **178**, а не 181; префикс файлов сохраняет исходное название задачи.

## Состав

Страницы относятся к исходному PDF второго издания Красной книги КР 2006 года; книжные очерки и позиции постановления не приравниваются автоматически. Исторические имена, авторство, ранги, ссылки на национальные страницы и отдельные позиции постановления сохранены в registry и национальном evidence-файле.

| ID | Современное имя | Ранг | Группа | Страницы 2006 | Результат | Изображение |
|---|---|---|---|---|---|---|
| anemone-obtusiloba | Anemonastrum obtusilobum | вид | растения | 110–111 | ready_for_review | фото |
| berberis-kaschgarica | Berberis ulicina | вид | растения | 114–115 | ready_for_review | placeholder |
| primula-macrocalyx | Primula veris subsp. macrocalyx | подвид | растения | 180–181 | ready_for_review | фото |
| sonjagaster-coronatus | Thecagaster coronata | вид | членистоногие | 250–251 | ready_for_review | placeholder |
| papilio-alexanor-voldemar | Papilio alexanor voldemar | подвид | членистоногие | 270–271 | needs_evidence | placeholder |
| megalodontes-kuznetzovi | Megalodontes kuznetzovi | вид | членистоногие | 276–277 | needs_evidence | placeholder |
| polochrum-pamirepandum | Polochrum pamirepandum | вид | членистоногие | 278–279 | needs_evidence | placeholder |
| capoetobrama-kuschakewitschi-orientalis | Capoetobrama kuschakewitschi | вид | рыбы | 302–303 | ready_for_review | placeholder |
| schizothorax-issykkuli | Schizothorax pseudoaksaiensis | вид | рыбы | 308–309 | ready_for_review | placeholder |
| diptychus-dybowskii-lansdelli | Gymnodiptychus dybowskii | вид | рыбы | 310–311 | ready_for_review | placeholder |
| eryx-tataricus | Eryx miliaris | вид | пресмыкающиеся | 340–341 | ready_for_review | placeholder |
| terpsiphone-paradisi | Terpsiphone paradisi leucogaster | подвид | птицы | 470–471 | ready_for_review | placeholder |
| otonycteris-hemprichi | Otonycteris leucophaea | вид | млекопитающие | 492–493 | ready_for_review | placeholder |
| cervus-elaphus-asiaticus | Cervus canadensis | вид | млекопитающие | 512–513 | ready_for_review | placeholder |
| allactaga-saltator | Orientallactaga sibirica | вид | млекопитающие | 524–525 | ready_for_review | placeholder |

Всего: растения **3**, членистоногие **4**, рыбы **3**, пресмыкающиеся **1**, птицы **1**, млекопитающие **3**. Среди 12 допустимых: соответственно **3 / 1 / 3 / 1 / 1 / 3**. Фотографий **2**, placeholder **13**; в допустимом пакете **2 + 10**, у отложенных **0 + 3**. Placeholder означает пустой список images и предусмотренное интерфейсом обозначение отсутствия снимка, а не новый фиктивный файл.

## Новые блокировки и точность таксономии

Предыдущие научные решения №25.4 сохранены. READY разрешал подготовку, но не гарантировал прохождение всех требований существующего импортёра.

- **papilio-alexanor-voldemar**: национальный отдельный очерк и ревизия 2025 года обосновывают подготовку подвида. В ограниченном поиске GBIF найден SYNONYM SUBSPECIES, перенаправляющий к SPECIES Papilio alexanor. Точный принятый подвидовой идентификатор не установлен. Родительский вид не подставлен. Отдельное противоречие книжного voldemar и judeus из постановления остаётся явно записанным; книга не объявлена доказательством их тождества.
- **megalodontes-kuznetzovi**: профильный WaspWeb поддерживает вид, однако точный принятый числовой GBIF-ключ не найден. Идентификатор профильного сайта не преобразован в вымышленный gbif: ID.
- **polochrum-pamirepandum**: профильный источник различает его и P. repandum, но точная принятая видовая запись GBIF не установлена. Родовой ключ и ключ другого вида не использованы.

У этих трёх сохраняются полноценные черновики, sourceIds и причины needs_evidence. Manifest перечисляет их отдельно в withheldCandidates и исключает из candidateIds. Ожидаемые диагностические ошибки bulk для каждого: отсутствие точного принятого таксона с идентификатором и нерешённый обязательный пробел. Это не объявлено научным опровержением вида. Архитектура и требования pipeline не менялись.

Для остальных 12 сохранены реальные ответы GET GBIF species с точным canonicalName, ACCEPTED и соответствующим рангом. EXACT означает локальное строгое равенство имени и ранга, а не вымышленный ответ API match. Дополнительно к первичным решениям №25.4 использованы конкретные исходные чек-листы через GBIF:

- Thecagaster coronata: [Catalogue of Life, GBIF 296781457](https://api.gbif.org/v1/species/296781457).
- Cervus canadensis: [ITIS, GBIF 134092547](https://api.gbif.org/v1/species/134092547), именно SPECIES. Подвидовой backbone-ключ C. elaphus canadensis не заменяет этот вид.
- Orientallactaga sibirica: [NCBI Taxonomy, GBIF 104051133](https://api.gbif.org/v1/species/104051133), именно SPECIES. BACKBONE_MATCH_NONE в исходной записи не скрыт. Род и научное решение взяты из MDD; авторство (J.R.Forster, 1778) взято из профильного источника, а не приписано пустому полю NCBI. Предварительно найденный BIN iBOL не принят как номенклатурный авторитет.

Полные записи выбранных таксонов сохранены в catalog-181-taxonomy.json. Для метаданных всего Catalogue of Life исключены только огромные общие контакты и библиография; проекция явно помечена, сохранены исходный fingerprint разобранного ответа и количества пропущенных элементов. Это не сокращение самих таксономических ответов.

## Содержание и научные ограничения

На каждый из 15 черновиков подготовлены короткие описания KY/UZ/RU/EN и русский обзор **168–231 слово** с источниками. Длинные разделы других языков имеют null; существующий scientificContent честно возвращает русский текст с признаком fallback. При отсутствии подтверждённого узбекского названия используется принятое латинское имя. Кыргызские заголовки проверены в национальной книге; для расширенного современного понятия Cervus canadensis оставлено латинское имя. Непроверенные народные названия не придуманы.

Биология, местообитания и угрозы заполнены только по названным источникам. Неизвестные разделы оставлены null. Историческая национальная категория сопровождается 2006 годом и исходным понятием охраны, не распространяется автоматически на весь современный вид и не выдаётся за действующий правовой статус или IUCN. В частности:

- У рыб буквально сохранены **2 [CR:C]**, **2 [EN:D]**, **2 [CR:D]**: буквенные категории взяты из очерков, цифра не конвертировалась автоматически.
- У Otonycteris историческое **VII / Lower Risk – Least Concern / LR/lc** сохранено в edition и доказательствах; category остаётся null. Современная национальная LC не назначена. Внешний вид дополнен [англоязычным руководством Зоомузея МГУ](https://zmmu.msu.ru/bats/rusbats/e_guide/othemp_e.htm).
- Разночтения фенологии Berberis, размерности чашечки Primula, месяцев нереста/объёмов старого промысла Gymnodiptychus и охраны Eryx в Токмакском заказнике не исправлялись догадкой. Спорные детали не вошли в утверждённые факты черновика.
- Возможное исчезновение исторической чуйской формы Capoetobrama, старые находки Otonycteris и старые учёты Cervus не представлены как подтверждённое современное присутствие либо численность. Доли попадания Allactaga в капканы не превращены в число особей.
- Возможная будущая синонимия Thecagaster с T. brevistigma названа гипотезой. Принадлежность Primula к подвиду и Terpsiphone к leucogaster сохранена; видовое расширение этих карточек не выполнено.

Все черновики: **verified:false**, **lastReviewedAt:null**, population строго соответствует **UNKNOWN_POPULATION**, reviewStatus **pending**. **scientificReviewStatus:pending** и **independentScientificReview:pending** записаны в каждом элементе исследовательского registry; manifest также pending. Использована действующая схема проекта: корневое поле scientificReviewStatus у публичного объекта вида не поддерживается, а publication потребовало бы реального решения владельца. Поэтому ни лишнее поле, ни вымышленный publication не добавлены. ownerAuthorization и scientificApproval — null; publicationAllowed — false; approval каждого кандидата — null.

## Две фотографии

Ограниченный поиск Commons выполнен для трёх растений, без повторного поиска прежних 166 изображений. GBIF и профильные источники использовались для таксономии. У других кандидатов отсутствие проверенного снимка оставлено явным.

| Черновик | Автор и конкретный источник | Лицензия | WebP | SHA-256 |
|---|---|---|---|---|
| anemone-obtusiloba | Hedwig Storch; [Commons 5668.JPG](https://commons.wikimedia.org/wiki/File:Blaue_Himalaya-Anemone_(Anemone_obtusiloba)_5668.JPG) | CC BY-SA 3.0 | 1800×1428, 123074 байт | 461a2aa25ab5d3b30178ad6975abf0102ff3e8ba79ccabf1aaa46e98cb8533d8 |
| primula-macrocalyx | Krzysztof Ziarnek, Kenraiz; [Commons kz06.jpg](https://commons.wikimedia.org/wiki/File:Primula_veris_subsp._macrocalyx_kz06.jpg) | CC BY-SA 4.0 | 1350×1800, 308678 байт | d5ec59b08be3673d41303d12740da3b57a899dcf35ad9a015345de287abceacd |

Первый снимок — выращенный экземпляр в ботаническом саду Акюрейри, Исландия, 2010 год; второй — Армения, 2016 год. Подписи прямо исключают их использование как свидетельства нахождения в Кыргызстане. Идентичность проверена по описаниям файлов и документированному переходу имени, без заявления о независимом определении экземпляра. Оригиналы и WebP просмотрены. Использован штатный scripts/process_data.py, max-edge 1800, quality 82. Записаны источник, автор, версия страницы, лицензия, атрибуция, модификации, размеры и контрольные суммы; производные сохраняют BY-SA. Полное декодирование обоих WebP прошло, EXIF/XMP отсутствуют. Общий размер новых изображений **431752 байта**. Эти файлы не экспортированы в public/dist.

## Пакет и контрольные суммы

- Registry: **data/research/catalog-181-content-registry.json** — 15 кандидатов, обработка 5 + 5 + 5.
- Manifest: **data/research/catalog-181-review-manifest.json** — 12 допустимых, 3 отложенных.
- Черновики: **data/research/catalog-181-content/drafts/**; редакционная основа: **data/research/catalog-181-content/facts.json**.
- Привязка к №25.4: SHA-256 **ff663aa68037ab8cfedce7af7412a9d84867b275c1d2f0009afecbb80299bc5c**.
- **SHA-256 manifest: 0ba2e9ea7922b13b10baed4b37ea48fb61befe766c170120379ccb51c6c1882e**.
- **registryFingerprint: 3acddc2f7f4f682e37f258e3ac1610f7646a4a63ac767f8ec04b17b9940ab42c**.
- SHA-256 registry: **797b8e530bc1934101a735e93d904ed1eca74728942b9ecb324b62c6249fa125**.
- SHA-256 прежнего data/species.source.json: **79197b9323386983951a56c889b5246884a5d9a17bc203b94ad077bd96892360**.

Индивидуальные draftSha256 и checkedFingerprint всех 15 проверены. Массив candidateIds содержит только 12 ready_for_review. Новые имена, исторические имена и GBIF-идентификаторы сопоставлены с опубликованными данными, архивом и друг с другом; прежние решения о синонимии из №25.4 переиспользованы. Дубликатов не обнаружено.

Доказательства: **docs/evidence/catalog-181-{baseline,national-accounts,taxonomy,taxonomy-search,images,photo-search,bulk-check,import-dry-run,preparation-audit,validation}.json**. Исходные исследования не переписывались.

## Проверки

| Проверка | Результат |
|---|---|
| npm run data:bulk:resume / data:bulk:check | 15 обработано, 12 допустимо, 3 отложено, 0 rejected, 0 approved/imported |
| Два data:batch:import без --apply | 12 возможных добавлений, 0 ошибок; before 166, after 178, mode preview, applied false |
| Повторяемость dry-run | отчёты побайтово одинаковы; 10 предупреждений об ожидаемом placeholder |
| npm test | **321/321**, 0 ошибок, 0 пропусков |
| npm run data | каталог **166**, архив **2** |
| npm run data:validate | успешно; **620 ключей × 4 языка**; данные соответствуют source |
| npm run build | успешно, включая prebuild и postbuild; **dist 34096208 байт** (~32,52 MiB) |
| node scripts/prepare-catalog-181.mjs --verify | воспроизводит все 15 черновиков и исследовательскую часть registry без записи |
| node scripts/validate-catalog-181-preparation.mjs | успешный независимый read-only аудит; свежий check совпадает по всем содержательным полям |
| Неизменность | все **1040 прежних файлов**, кроме оговорённого .gitattributes, совпадают побайтово; 166 объектов, 2 архивных объекта и прежние изображения сохранены |
| Единственное изменение прежнего файла | .gitattributes: добавлены только LF-правила новых fingerprinted JSON задачи №25.5 |

В ходе подготовки отклонён некорректный путь CLI-отчёта вне .generated; использован штатный разрешённый путь. Один запуск dry-run не стартовал из-за тайм-аута автоматической проверки разрешения; отдельный повтор прошёл. Предварительные ошибки самого нового аудитора (проверка отсутствующего служебного поля dataset, регистра подписи и недетерминированных metrics) исправлены; данные и защиты ради аудита не ослаблялись. Остающиеся три блокировки перечислены выше.

## Коммиты и итоговое состояние

Завершённый исследовательский пакет и проверенные fingerprints зафиксированы коммитом **1c6b24a48da81db7cc8a38f8099fd348dbf78222**. После него git status был чистым. Настоящий отчёт сохраняется следующим отдельным коммитом. Фактический итоговый HEAD этого последнего коммита сообщается в финальном ответе и воспроизводимо определяется командой:

```powershell
git log -1 --format=%H -- docs/research/catalog-181-preparation.md
```

После фиксации отчёта проверяется чистота git status и повторно выполняется read-only аудит. Новые публичные карточки не созданы. Approve, apply, provisional import, merge, push и deployment не выполнялись. Следующая партия не начиналась.
