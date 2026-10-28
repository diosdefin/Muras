# MURAS №25.4 — решения по научным конфликтам

Дата решения: 2026-10-22, Asia/Bishkek. Ветка: `feature/catalog-200`. Исходный HEAD: `e5b7427bc3f25074711255945398d8fbaef1483e`.

Рассмотрены все **34 исходных B** и отдельно **kosopoljanskia-hebecarpa** из удержанного пакета №25.2. Результат: **READY 15; NEEDS_EVIDENCE 19; DUPLICATE 1; EXCLUDED 0**. Опубликованный каталог остаётся на **166**, архив — **2**.

READY разрешает начать подготовку образовательного черновика в указанном национальном охвате. Это не научное одобрение, техническая готовность или разрешение публикации. Новые карточки, registry и manifest не создавались. Импорт, approve, apply, merge, push и deployment не выполнялись.

## Основание и границы проверки

Исходная инвентаризация, прежние научные решения и пакеты сохранены без правок. Для каждого решения JSON хранит точный индекс кандидата, прежнюю категорию и причину, исторические имена и ранги, ссылки на старые ответы GBIF, новые доказательства, уверенность и оставшиеся вопросы. Удержанная Schrenkia сохраняет отдельно исходную категорию A и более поздний needs_evidence из №25.2.

Национальное включение проверено по сохранённой оригинальной книге 2006 года и консолидированному постановлению №170/2005 с изменениями №471/2009. Это разные документы; постановление не объявлено проверенным правовым реестром 2026 года. Пронумерованная строка, очерк книги, современный вид и локальная единица охраны не приравниваются автоматически.

Сравнение выполнено со всеми 166 опубликованными записями и двумя архивными: научные имена, исторические имена из прежней таблицы соответствий и фактически опубликованных пакетов, непустые GBIF-ключи, доказанная синонимия и отношения вида/подвида. Отдельно проверены все 595 пар между 35 случаями. Потенциальная синонимия не записана как доказанная.

Для имени требуется явная именная/типовая связь. Родовой HIGHERRANK, fuzzy-совпадение и простое удаление третьего эпитета не являются такой связью. Смена рода допустима при доказанной преемственности того же вида. Подвидовой ключ не выдаётся за видовой при выборе другого стандарта. При переходе к более широкому принятому виду исторический национальный очерк остаётся явно ограниченным местной названной формой.

Новые запросы GBIF сохранены с полными ответами. Старые точные запросы переиспользованы, включая catalog-125; прежние evidence, fingerprints, registry и manifest не перезаписаны. Доступность каждого внешнего источника обозначена отдельно: первичная страница, индексированный текст, аннотация, повторно использованное прежнее доказательство или неудачный запрос.

## Все 34 исходных кандидата B

Страница в таблице — национальный очерк, не страница внешней базы. Полные причины, позиции постановления и точные локаторы приведены в решениях ниже и в JSON.

| ID | Историческое имя → выбранное современное имя | Ранг исторический → выбранный | Решение | Конфликт; источники |
|---|---|---|---|---|
| `dictyophora-duplicata` (с.40–41) | Dictyophora duplicata → не выбран; альтернативы не разрешены | SPECIES → не выбран | **NEEDS_EVIDENCE** | синонимия; неоднозначная идентификация. [mycokeys-2019](https://mycokeys.pensoft.net/article_preview.php?id=35324&skip_redirect=1), [mycology-2014](https://onlinelibrary.wiley.com/doi/10.1155/2014/490847) |
| `tulipa-anadroma` (с.78–79) | Tulipa anadroma → не выбран; альтернативы не разрешены | SPECIES → не выбран | **NEEDS_EVIDENCE** | гибрид/неопределённый таксон; синонимия. [powo-tulipa](https://powo.science.kew.org/taxon/542821-1) |
| `anemone-obtusiloba` (с.110–111) | Anemone obtusiloba → Anemonastrum obtusilobum | SPECIES → SPECIES | **READY** | синонимия. [powo-anemone](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:60476974-2), [ipni-anemone](https://www.ipni.org/n/708529-1) |
| `berberis-kaschgarica` (с.114–115) | Berberis kaschgarica → Berberis ulicina | SPECIES → SPECIES | **READY** | синонимия. [powo-berberis-old](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:106805-1), [powo-berberis](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:107162-1) |
| `sorbaria-olgae` (с.126–127) | Sorbaria olgae → не выбран; альтернативы не разрешены | SPECIES → не выбран | **NEEDS_EVIDENCE** | синонимия; вид/подвид/разновидность. [powo-sorbaria](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:741579-1), [sorbaria-revision](https://doi.org/10.11646/phytotaxa.487.1.1) |
| `pyrus-asiae-mediae` (с.130–131) | Pyrus asiae-mediae → Pyrus asiae-mediae | SPECIES → SPECIES | **NEEDS_EVIDENCE** | гибрид/неопределённый таксон. [powo-pyrus](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:730696-1), [bgci-pyrus](https://www.bgci.org/wp/wp-content/uploads/2019/04/Red_List_Central_Asia_2009.pdf#page=20) |
| `malus-niedzwetzkyana` (с.134–135) | Malus niedzwetzkyana → Malus domestica | SPECIES → SPECIES | **DUPLICATE** | дублирование опубликованного таксона; синонимия. [powo-malus-n](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:726346-1), [powo-malus-s](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:726400-1) |
| `sophora-griffithii-korolkowii` (с.144–145) | Sophora griffithii korolkowii → не выбран; альтернативы не разрешены | SUBSPECIES → не выбран | **NEEDS_EVIDENCE** | вид/подвид/разновидность; неоднозначная идентификация. [powo-sophora](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:1119529-2) |
| `vitis-usunachmatica` (с.156–157) | Vitis usunachmatica → не выбран; альтернативы не разрешены | SPECIES → не выбран | **NEEDS_EVIDENCE** | синонимия; неоднозначная идентификация. [powo-vitis](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:30478388-2) |
| `dorema-microcarpum` (с.174–175) | Dorema microcarpum → не выбран; альтернативы не разрешены | SPECIES → не выбран | **NEEDS_EVIDENCE** | синонимия; неоднозначная идентификация. [powo-ferula](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:77331188-1) |
| `primula-macrocalyx` (с.180–181) | Primula macrocalyx → Primula veris subsp. macrocalyx | SPECIES → SUBSPECIES | **READY** | вид/подвид/разновидность; синонимия. [powo-primula](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:702229-1), [grin-primula](https://pgrc-rpc.agr.gc.ca/gringlobal/taxon/taxonomydetail?id=29651) |
| `tianschaniella-umbellifera` (с.200–201) | Tianschaniella umbellifera → не выбран; альтернативы не разрешены | SPECIES → не выбран | **NEEDS_EVIDENCE** | документированное разночтение написания; неоднозначная идентификация. [powo-tianschaniella](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:120865-1) |
| `sonjagaster-coronatus` (с.250–251) | Sonjagaster coronatus → Thecagaster coronata | SPECIES → SPECIES | **READY** | вид/подвид/разновидность; синонимия. [odonata-2024](https://pisum.icgbio.ru/kosterin/pdf/schneider_et_al_2024.pdf) |
| `cephalota-galathea` (с.254–255) | Cephalota galatea → Cephalota galatea | SPECIES → SPECIES | **NEEDS_EVIDENCE** | документированное разночтение написания. [carabidae-1995](https://www.zin.ru/animalia/coleoptera/pdf/kryzhanovskij_et_al_1995.pdf) |
| `parnassius-loxias-tashkorensis` (с.266–267) | Parnassius loxias tashkorensis → не выбран; альтернативы не разрешены | SUBSPECIES → не выбран | **NEEDS_EVIDENCE** | вид/подвид/разновидность; документированное разночтение написания. [loxias-original-reference](https://repository.naturalis.nl/pub/318175/ZM1993067015.pdf) |
| `parnassius-apollo-merzbacheri` (с.268–269) | Parnassius apollo merzbacheri → не выбран; альтернативы не разрешены | SUBSPECIES → не выбран | **NEEDS_EVIDENCE** | вид/подвид/разновидность; неоднозначная идентификация. [mcz-merzbacheri](https://mczbase.mcz.harvard.edu/name/Parnassius%20apollo%20merzbacheri), [parnassius-types-1966](https://www.persee.fr/doc/bsef_0037-928x_1966_num_71_7_20893) |
| `papilio-alexanor-voldemar` (с.270–271) | Papilio alexanor voldemar → Papilio alexanor voldemar | SUBSPECIES → SUBSPECIES | **READY** | вид/подвид/разновидность; расхождение исторических документов. [papilio-2025](https://doi.org/10.1093/biolinnean/blaf078) |
| `megalodontes-kuznetzovi` (с.276–277) | Megalodontes kuznetzovi → Megalodontes kuznetzovi | SPECIES → SPECIES | **READY** | отсутствие точного вида в backbone. [wasp-megalodontes](https://www.waspweb.org/Pamphilioidea/Megalodontesidae/Megalodontes/index.htm) |
| `polochrum-pamirepandum` (с.278–279) | Polochrum pamirepandum → Polochrum pamirepandum | SPECIES → SPECIES | **READY** | отсутствие точного вида в backbone. [wasp-polochrum](https://www.waspweb.org/Pompiloidea/Sapygidae/Classification/Classification_world_Sapygidae.htm) |
| `capoetobrama-kuschakewitschi-orientalis` (с.302–303) | Capoetobrama kuschakewitschi orientalis → Capoetobrama kuschakewitschi | SUBSPECIES → SPECIES | **READY** | вид/подвид/разновидность; синонимия. [itis-capoetobrama](https://www.itis.gov/ITISWebService/jsonservice/getFullRecordFromTSN?tsn=688845) |
| `schizothorax-issykkuli` (с.308–309) | Schizothorax issykkuli → Schizothorax pseudoaksaiensis | SPECIES → SPECIES | **READY** | синонимия; вид/подвид/разновидность. [eschmeyer-issykkuli](https://researcharchive.calacademy.org/research/ichthyology/catalog/fishcatget.asp?spid=48193) |
| `diptychus-dybowskii-lansdelli` (с.310–311) | Diptychus dybowskii lansdelli → Gymnodiptychus dybowskii | SUBSPECIES → SPECIES | **READY** | синонимия; вид/подвид/разновидность. [eschmeyer-lansdelli](https://researcharchive.calacademy.org/research/ichthyology/catalog/fishcatget.asp?spid=48488) |
| `bufo-viridis` (с.326–327) | Bufo viridis → не выбран; альтернативы не разрешены | SPECIES → не выбран | **NEEDS_EVIDENCE** | неоднозначная идентификация. [asw-bufotes](https://amphibiansoftheworld.amnh.org/Amphibia/Anura/Bufonidae/Bufotes/Bufotes-viridis) |
| `novoeumeces-schneideri-princeps` (с.338–339) | Novoeumeces schneideri princeps → Eumeces schneiderii princeps | SUBSPECIES → SUBSPECIES | **NEEDS_EVIDENCE** | вид/подвид/разновидность; неоднозначная идентификация. [rdb-eumeces](https://reptile-database.reptarium.cz/Eumeces/schneiderii) |
| `eryx-tataricus` (с.340–341) | Eryx tataricus → Eryx miliaris | SPECIES → SPECIES | **READY** | синонимия. [rdb-eryx](https://reptile-database.reptarium.cz/Eryx/miliaris) |
| `spalerosophis-diadema-schiraziana` (с.342–343) | Spalerosophis diadema schiraziana → Spalerosophis diadema schirazianus | SUBSPECIES → SUBSPECIES | **NEEDS_EVIDENCE** | вид/подвид/разновидность; расхождение исторических документов. [rdb-spalerosophis](https://reptile-database.reptarium.cz/Spalerosophis/diadema) |
| `falco-peregrinus` (с.392–393) | Falco peregrinus → Falco peregrinus | SPECIES → SPECIES | **NEEDS_EVIDENCE** | вид/подвид/разновидность; пересечение вида и включённого подвида. [ioc-falcons](https://www.worldbirdnames.org/new/updates/proposed-splits/) |
| `falco-pelegrinoides` (с.394–395) | Falco pelegrinoides → не выбран; альтернативы не разрешены | SPECIES → не выбран | **NEEDS_EVIDENCE** | вид/подвид/разновидность; пересечение вида и включённого подвида. [ioc-falcons](https://www.worldbirdnames.org/new/updates/proposed-splits/) |
| `terpsiphone-paradisi` (с.470–471) | Terpsiphone paradisi → Terpsiphone paradisi leucogaster | SPECIES → SUBSPECIES | **READY** | вид/подвид/разновидность. [osme-terpsiphone](https://osme.org/wp-content/uploads/2025/03/ORL-10.2-Part-C-Passerines.pdf#page=3), [itis-terpsiphone](https://itis.gov/servlet/SingleRpt/SingleRpt?search_topic=TSN&search_value=920668) |
| `rhinolophus-hipposideros` (с.488–489) | Phinolophus hipposideros → не выбран; альтернативы не разрешены | SPECIES → не выбран | **NEEDS_EVIDENCE** | неоднозначная идентификация; вид/подвид/разновидность. [mdd-rhino](https://www.mammaldiversity.org/taxon/1004693/), [mdd-midas](https://www.mammaldiversity.org/taxon/1006733/) |
| `otonycteris-hemprichi` (с.492–493) | Otonycteris hemprichi → Otonycteris leucophaea | SPECIES → SPECIES | **READY** | неоднозначная идентификация; синонимия. [msu-otonycteris](https://zmmu.msu.ru/bats/rusbats/e_guide/othemp_e.htm), [otonycteris-revision](https://doi.org/10.3161/150811010X504617) |
| `cuon-alpinus` (с.496–497) | Cuon alpinus → Cuon alpinus | SPECIES → SPECIES | **NEEDS_EVIDENCE** | неоднозначная идентификация. Национальный очерк с.497; доказательство для снятия сомнения не найдено. |
| `cervus-elaphus-asiaticus` (с.512–513) | Cervus elaphus asiaticus → Cervus canadensis | SUBSPECIES → SPECIES | **READY** | вид/подвид/разновидность; синонимия. [mdd-cervus](https://www.mammaldiversity.org/taxon/1006312/), [cervus-2018](https://brill.com/view/journals/ctoz/87/1/article-p1_1.pdf) |
| `allactaga-saltator` (с.524–525) | Allactaga saltator → Orientallactaga sibirica | SPECIES → SPECIES | **READY** | синонимия. [mdd-jerboa](https://www.mammaldiversity.org/taxon/1001964/) |

## Обоснования по ID

### dictyophora-duplicata — NEEDS_EVIDENCE

**Национальная позиция:** книга 2006, с.40–41; прил./поз. 1-93. Группа: грибы. Исходная категория B сохранена.

**Прежняя блокировка:** GBIF связывает имя с Phallus indusiatus, тогда как микологические источники обсуждают Phallus duplicatus и комплекс indusiatus; национальный концепт не разрешён.

**Решение:** Синонимика 2019 года частично объясняет ответ GBIF, но комплекс indusiatus и альтернативная трактовка duplicatus не позволяют переопределить национальные находки только по имени.

**Для снятия блока:** Проверить современный типовой/молекулярный концепт duplicatus и indusiatus и его применимость к документированному кыргызскому материалу.

**Уверенность:** включение в исторический национальный источник — высокая; современная идентичность или применимость остаётся неразрешённой. Высокая уверенность в обоснованности удержания не означает подтверждение одного из конкурирующих имён.

- [mycokeys-2019](https://mycokeys.pensoft.net/article_preview.php?id=35324&skip_redirect=1) — MycoBank 245788; taxonomic treatment of Phallus indusiatus; article 35324. Доступ: `web_indexed_primary_text_only`.
- [mycology-2014](https://onlinelibrary.wiley.com/doi/10.1155/2014/490847) — DOI 10.1155/2014/490847; earlier audit referenced by inventory B. Доступ: `existing_primary_review_reused`.

### tulipa-anadroma — NEEDS_EVIDENCE

**Национальная позиция:** книга 2006, с.78–79; прил./поз. 1-12. Группа: растения. Исходная категория B сохранена.

**Прежняя блокировка:** Прежнее противоречие национального эндемичного T. anadroma и более широкого T. tschimganica не разрешено. Синоним GBIF не снимает сохранённый блок.

**Решение:** POWO и GBIF выбирают разные видовые/гибридные концепты. Национальный эндемик не объявляется автоматически ни синонимом, ни самостоятельным негибридным видом.

**Для снятия блока:** Нужна предметная ревизия anadroma / tschimganica с типами и кыргызским материалом; выбор одного агрегатора не снимает конфликт.

**Уверенность:** включение в исторический национальный источник — высокая; современная идентичность или применимость остаётся неразрешённой. Высокая уверенность в обоснованности удержания не означает подтверждение одного из конкурирующих имён.

- [powo-tulipa](https://powo.science.kew.org/taxon/542821-1) — Taxonomy; alternative taxonomy; Christenhusz et al. 2013, Bot. J. Linn. Soc. 172:280–328. Доступ: `web_indexed_primary_text`.

### anemone-obtusiloba — READY

**Национальная позиция:** книга 2006, с.110–111; прил./поз. 1-29. Группа: растения. Исходная категория B сохранена.

**Прежняя блокировка:** Сохранённый GBIF HIGHERRANK относится к роду Anemonastrum, а не к точному принятому виду. Нельзя использовать идентификатор рода или догадку о комбинации.

**Решение:** Гомотипная комбинация с тем же базионимом D.Don установлена POWO/IPNI; новый точный GBIF-запрос дал SPECIES, а не прежний род Anemonastrum. Национальное видовое имя сохраняется как исторический синоним.

**Сохраняемые ограничения:** При подготовке не приписывать очерку автоматически один из четырёх современных подвидов.

**Уверенность:** включение в исторический национальный источник — высокая; именная связь — высокая в явно указанном объёме и выбранной таксономической модели. Независимой научной проверки карточки нет.

- [powo-anemone](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:60476974-2) — Taxonomy; Homotypic Synonyms; Distribution; Phytoneuron 2018-55:7. Доступ: `web_primary_page_text`.
- [ipni-anemone](https://www.ipni.org/n/708529-1) — IPNI 708529-1. Доступ: `web_indexed_primary_text`.

### berberis-kaschgarica — READY

**Национальная позиция:** книга 2006, с.114–115; прил./поз. 1-32. Группа: растения. Исходная категория B сохранена.

**Прежняя блокировка:** GBIF предлагает Berberis ulicina вместо национального B. kaschgarica; отдельная проверка соответствия национального именного концепта современному виду не выполнена.

**Решение:** POWO по ревизии Harber 2020 явно включает национальное имя Rupr. в B. ulicina и указывает Кыргызстан; GBIF согласен на уровне принятого вида. Можно готовить карточку с сохранением узкого исторического охвата kaschgarica.

**Сохраняемые ограничения:** Объяснить отличие принятой здесь синонимии от обработки Кыргызстана 2011 года; исторические признаки не распространять на весь вид без отдельного источника.

**Уверенность:** включение в исторический национальный источник — высокая; именная связь — высокая в явно указанном объёме и выбранной таксономической модели. Независимой научной проверки карточки нет.

- [powo-berberis-old](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:106805-1) — Publications; Sert. Tiansch.:38 (1869). Доступ: `web_indexed_primary_text`.
- [powo-berberis](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:107162-1) — Heterotypic Synonyms; Distribution. Доступ: `web_indexed_primary_text`.

### sorbaria-olgae — NEEDS_EVIDENCE

**Национальная позиция:** книга 2006, с.126–127; прил./поз. 1-42. Группа: растения. Исходная категория B сохранена.

**Прежняя блокировка:** GBIF объединяет Sorbaria olgae с S. tomentosa. Границы узкого национального таксона и расширенного принятого вида требуют источниковой сверки; нет основания автоматически расширять очерк.

**Решение:** Уточнён конфликт: POWO ведёт к разновидности S. tomentosa var. tomentosa, GBIF — к виду S. tomentosa. Найдена профильная ревизия, но её полный текст не был доступен.

**Для снятия блока:** Прочесть таксономическую обработку и типификацию olgae в Song & Hong 2021; обосновать допустимый ранг и объём национального концепта.

**Уверенность:** включение в исторический национальный источник — высокая; современная идентичность или применимость остаётся неразрешённой. Высокая уверенность в обоснованности удержания не означает подтверждение одного из конкурирующих имён.

- [powo-sorbaria](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:741579-1) — Taxonomy; Publications. Доступ: `web_indexed_primary_text`.
- [sorbaria-revision](https://doi.org/10.11646/phytotaxa.487.1.1) — Phytotaxa 487(1):1–25; 22 February 2021. Доступ: `publisher_abstract_only`.

### pyrus-asiae-mediae — NEEDS_EVIDENCE

**Национальная позиция:** книга 2006, с.130–131; прил./поз. 1-39. Группа: растения. Исходная категория B сохранена.

**Прежняя блокировка:** Прежний блок: EXACT ACCEPTED в GBIF не разрешает опубликованную проблему возможной гибридной природы и самостоятельности национального Pyrus asiae-mediae.

**Решение:** Признание в POWO/GBIF не разрешает прямо опубликованное BGCI сомнение в самостоятельности таксона. Гибридность не объявлена доказанной, исключение не производится.

**Для снятия блока:** Нужна ревизия типового материала и самостоятельности; проверить отношение к опубликованному Pyrus korshinskyi, не объявляя их синонимами по предположению.

**Уверенность:** включение в исторический национальный источник — высокая; современная идентичность или применимость остаётся неразрешённой. Высокая уверенность в обоснованности удержания не означает подтверждение одного из конкурирующих имён.

- [powo-pyrus](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:730696-1) — Taxonomy; Homotypic Synonyms; Distribution. Доступ: `web_indexed_primary_text`.
- [bgci-pyrus](https://www.bgci.org/wp/wp-content/uploads/2019/04/Red_List_Central_Asia_2009.pdf#page=20) — Printed p.18, entry Pyrus asiae-mediae. Доступ: `web_indexed_primary_pdf_text`.

### malus-niedzwetzkyana — DUPLICATE

**Национальная позиция:** книга 2006, с.134–135; прил./поз. 1-38. Группа: растения. Исходная категория B сохранена.

**Прежняя блокировка:** Новый GBIF относит Malus niedzwetzkyana к M. domestica. Требуется сверка национального дикорастущего концепта с культурным/расширенным видом; родительская культурная яблоня не добавляется автоматически.

**Решение:** POWO сводит оба конкретных имени M. niedzwetzkyana Dieck и опубликованное M. sieversii (Ledeb.) M.Roem. к M. domestica. Авторский точный запрос GBIF для sieversii также ведёт к 3001244 — тому же ключу, что национальный niedzwetzkyana. Вторую карточку того же принятого вида не готовить.

**Сохраняемые ограничения:** Решение относится к принятой здесь видовой модели POWO/GBIF, не отрицает различие исторических охраняемых форм; существующая карточка sievers-apple в этой задаче не изменяется.

**Уверенность:** включение в исторический национальный источник — высокая; именная связь — высокая в явно указанном объёме и выбранной таксономической модели. Независимой научной проверки карточки нет.

- [powo-malus-n](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:726346-1) — Taxonomy. Доступ: `web_indexed_primary_text`.
- [powo-malus-s](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:726400-1) — Taxonomy; Fam. Nat. Syn. Monogr. 3:216 (1847). Доступ: `web_indexed_primary_text`.

### sophora-griffithii-korolkowii — NEEDS_EVIDENCE

**Национальная позиция:** книга 2006, с.144–145; прил./поз. 1-50. Группа: растения. Исходная категория B сохранена.

**Прежняя блокировка:** Национальные Styphnolobium korolkowii / Sophora griffithii ssp. korolkowii / Sophora korolkowii не разрешены: GBIF предлагает Styphnolobium japonicum. Ранг, тип и применимость этой синонимии необходимо проверить по ревизии.

**Решение:** Проверено авторство Koehne, но современная синонимика с S. japonicum и введённый ареал не объясняют исторический естественный кустарниковый концепт книги. Сходство эпитетов недостаточно.

**Для снятия блока:** Сопоставить тип Sophora korolkowii Dieck ex Koehne, комбинацию Yakovlev и национальный griffithii ssp. korolkowii; разрешить видовой/подвидовой ранг и природный/интродуцированный концепт.

**Уверенность:** включение в исторический национальный источник — высокая; современная идентичность или применимость остаётся неразрешённой. Высокая уверенность в обоснованности удержания не означает подтверждение одного из конкурирующих имён.

- [powo-sophora](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:1119529-2) — Heterotypic Synonyms; Distribution; Deut. Dendrol.:323 (1893). Доступ: `web_indexed_primary_text`.

### vitis-usunachmatica — NEEDS_EVIDENCE

**Национальная позиция:** книга 2006, с.156–157; прил./поз. 1-54. Группа: растения. Исходная категория B сохранена.

**Прежняя блокировка:** GBIF предлагает Vitis gmelinii; соответствие национального V. usunachmatica и современного видового концепта не подтверждено специальной обработкой. Нет автоматической подмены более широким виноградом.

**Решение:** POWO предлагает V. vinifera, GBIF — V. gmelinii. Одной страны в ареале недостаточно для переноса очерка дикого усун-ахматского винограда на культурный или расширенный вид.

**Для снятия блока:** Документировать типовую связь usunachmatica с gmelinii/vinifera и современный ранг местного дикорастущего концепта.

**Уверенность:** включение в исторический национальный источник — высокая; современная идентичность или применимость остаётся неразрешённой. Высокая уверенность в обоснованности удержания не означает подтверждение одного из конкурирующих имён.

- [powo-vitis](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:30478388-2) — Heterotypic Synonyms; Novosti Sist. Vyssh. Rast. 20:133 (1983). Доступ: `web_indexed_primary_text`.

### dorema-microcarpum — NEEDS_EVIDENCE

**Национальная позиция:** книга 2006, с.174–175; прил./поз. 1-64. Группа: растения. Исходная категория B сохранена.

**Прежняя блокировка:** POWO принимает Ferula namanganica как гомотипную замену Dorema microcarpum, GBIF выбирает Ferula microcarpum; POWO перечисляет только Узбекистан. Нужно согласовать валидное имя, ключ GBIF и национальный географический концепт.

**Решение:** Гомотипность Dorema microcarpum / Ferula namanganica сохраняется как доказательство имени, но национальная привязка и валидное принятое имя Ferula microcarpum в GBIF требуют совместного решения.

**Для снятия блока:** Сверить заменяющее имя и его публикацию, тип и кыргызский материал; разъяснить отсутствие Кыргызстана в приведённом охвате POWO.

**Уверенность:** включение в исторический национальный источник — высокая; современная идентичность или применимость остаётся неразрешённой. Высокая уверенность в обоснованности удержания не означает подтверждение одного из конкурирующих имён.

- [powo-ferula](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:77331188-1) — docs/evidence/catalog-200-source-review.json#powo-ferula. Доступ: `existing_primary_review_reused`.

### primula-macrocalyx — READY

**Национальная позиция:** книга 2006, с.180–181; прил./поз. 1-65. Группа: растения. Исходная категория B сохранена.

**Прежняя блокировка:** GBIF меняет национальный SPECIES Primula macrocalyx на SUBSPECIES Primula veris macrocalyx. Требуются явный выбор принятого ранга и проверка объёма национального очерка; P. veris целиком не подставляется.

**Решение:** Именная преемственность Bunge и комбинация Lüdi подтверждены профильными ботаническими реестрами; принят именно подвид macrocalyx. Новый точный GBIF-запрос подтверждает ключ и ранг SUBSPECIES.

**Сохраняемые ограничения:** Не подставлять P. veris целиком; историческую категорию очерка связывать с macrocalyx и годом 2006.

**Уверенность:** включение в исторический национальный источник — высокая; именная связь — высокая в явно указанном объёме и выбранной таксономической модели. Независимой научной проверки карточки нет.

- [powo-primula](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:702229-1) — Taxonomy; Fl. Altaic. 1:209 (1829); Flora Europaea 3 (1972). Доступ: `web_primary_page_text`.
- [grin-primula](https://pgrc-rpc.agr.gc.ca/gringlobal/taxon/taxonomydetail?id=29651) — Taxonomy detail 29651. Доступ: `web_indexed_primary_text`.

### tianschaniella-umbellifera — NEEDS_EVIDENCE

**Национальная позиция:** книга 2006, с.200–201; прил./поз. 1-76. Группа: растения. Исходная категория B сохранена.

**Прежняя блокировка:** Точный запрос Tianschaniella umbellifera вернул NONE; современная комбинация и точный идентификатор не установлены.

**Решение:** Для правильного ботанического имени T. umbellulifera теперь получен точный видовой ключ 10874182. Однако книга печатает umbellifera; сходство, одинаковый род и близкое авторство сами по себе не заменяют документированного исправления/типовой связи.

**Для снятия блока:** Нужен региональный первичный источник, непосредственно связывающий написание национального очерка umbellifera с umbellulifera; затем выбрать между Tianschaniella и гомотипной Lappula.

**Уверенность:** включение в исторический национальный источник — высокая; современная идентичность или применимость остаётся неразрешённой. Высокая уверенность в обоснованности удержания не означает подтверждение одного из конкурирующих имён.

- [powo-tianschaniella](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:120865-1) — Taxonomy; Homotypic Synonyms; Bot. Mater. Gerb. 14:338 (1951). Доступ: `web_indexed_primary_text`.

### sonjagaster-coronatus — READY

**Национальная позиция:** книга 2006, с.250–251; прил./поз. 4-1. Группа: членистоногие. Исходная категория B сохранена.

**Прежняя блокировка:** Пересмотрен сохранённый блок: Cordulegaster/Thecagaster coronata и возможная связь с T. brevistigma обсуждаются Schneider et al. 2024; в перечне другой родительский ранг C. insignis ssp. coronatus. Нужна ревизия границ таксона.

**Решение:** Ревизия 2024 года прослеживает прежнее положение coronata внутри insignis, принимает отдельный вид Thecagaster coronata и исследует образец 636 из Кыргызстана. GBIF Cordulegaster coronata — родовая альтернатива того же вида. Возможное будущее объединение с brevistigma не выполнено авторами.

**Сохраняемые ограничения:** Явно сохранить обсуждаемую авторами близость к brevistigma; не создавать отдельные карточки для Sonjagaster/Cordulegaster/Thecagaster coronata.

**Уверенность:** включение в исторический национальный источник — высокая; именная связь — высокая в явно указанном объёме и выбранной таксономической модели. Независимой научной проверки карточки нет.

- [odonata-2024](https://pisum.icgbio.ru/kosterin/pdf/schneider_et_al_2024.pdf) — Insects 15:622, DOI 10.3390/insects15080622; PDF pp.3,5 (specimen 636, PP792850/PQ120578),17,27–29; table 3, p.29. Доступ: `existing_primary_pdf_read_in_full_relevant_sections`.

### cephalota-galathea — NEEDS_EVIDENCE

**Национальная позиция:** книга 2006, с.254–255; прил./поз. 4-3. Группа: членистоногие. Исходная категория B сохранена.

**Прежняя блокировка:** Пересмотрен сохранённый блок galatea / galathea: GBIF EXACT исправленного написания не снимает разночтение первичного каталога galatea Thieme 1881 / galathea auct.

**Решение:** Национальное galatea согласуется с профильным каталогом 1995 года; GBIF выбирает galathea. Не найдено первичное номенклатурное обоснование этой поправки, поэтому ключ galathea не выдаётся за доказанную идентичность.

**Для снятия блока:** Проверить протолог Thieme 1881, правильное первоначальное написание и документированное отношение к galathea auct.; связать с конкретным ключом без fuzzy-подмены.

**Уверенность:** включение в исторический национальный источник — высокая; современная идентичность или применимость остаётся неразрешённой. Высокая уверенность в обоснованности удержания не означает подтверждение одного из конкурирующих имён.

- [carabidae-1995](https://www.zin.ru/animalia/coleoptera/pdf/kryzhanovskij_et_al_1995.pdf) — Printed p.24, subgenus Cephalota, no.14. Доступ: `web_indexed_primary_pdf_text_only`.

### parnassius-loxias-tashkorensis — NEEDS_EVIDENCE

**Национальная позиция:** книга 2006, с.266–267; прил./поз. 4-9. Группа: членистоногие. Исходная категория B сохранена.

**Прежняя блокировка:** Национальный подвид Parnassius loxias tashkorensis GBIF сводит к виду P. loxias; подвид нельзя заменить родительским видом без обоснования национального именного концепта.

**Решение:** Найдена конкретная ссылка на описание tashkorensis, но есть разница дат 1983/1984. Сохранённый GBIF-синоним родительского P. loxias не определяет действительный подвидовой концепт.

**Для снятия блока:** Получить и проверить оригинальное описание pp.157–162, корректную дату и современную ревизию подвида с национальными местонахождениями.

**Уверенность:** включение в исторический национальный источник — высокая; современная идентичность или применимость остаётся неразрешённой. Высокая уверенность в обоснованности удержания не означает подтверждение одного из конкурирующих имён.

- [loxias-original-reference](https://repository.naturalis.nl/pub/318175/ZM1993067015.pdf) — Reference: Kreuzberg 1983, pp.157–162; not a reviewed original description. Доступ: `web_indexed_bibliographic_reference_only`.

### parnassius-apollo-merzbacheri — NEEDS_EVIDENCE

**Национальная позиция:** книга 2006, с.268–269; прил./поз. 4-10. Группа: членистоногие. Исходная категория B сохранена.

**Прежняя блокировка:** Национальный подвид Parnassius apollo merzbacheri GBIF сводит к P. apollo; родительский вид не является автоматической заменой.

**Решение:** MCZ хранит подвид merzbacheri, но без подтверждающих экземпляров на странице; историческая типовая обработка даёт альтернативную связь с chryseis. Родительский ключ apollo не снимает эту предметную неопределённость.

**Для снятия блока:** Сверить тип merzbacheri, chryseis и национальные границы подвида по полной современной ревизии; не назначать весь P. apollo.

**Уверенность:** включение в исторический национальный источник — высокая; современная идентичность или применимость остаётся неразрешённой. Высокая уверенность в обоснованности удержания не означает подтверждение одного из конкурирующих имён.

- [mcz-merzbacheri](https://mczbase.mcz.harvard.edu/name/Parnassius%20apollo%20merzbacheri) — Name Authority MCZ; Subspecies; no cited MCZ specimens. Доступ: `web_indexed_primary_collection_database`.
- [parnassius-types-1966](https://www.persee.fr/doc/bsef_0037-928x_1966_num_71_7_20893) — Bull. Soc. Entomol. France 71(7), record 20893. Доступ: `web_indexed_primary_fragment_only`.

### papilio-alexanor-voldemar — READY

**Национальная позиция:** книга 2006, с.270–271; прил./поз. 4-11. Группа: членистоногие. Исходная категория B сохранена.

**Прежняя блокировка:** Двойной блок: GBIF сводит voldemar к P. alexanor; перечень указывает judeus, а книга на с.271 прямо отрицает достоверность judeus в Кыргызстане. Это конфликт двух источников, не синонимия и не два готовых кандидата.

**Решение:** Подвид voldemar прямо восстановлен молекулярной ревизией 2025 года; книга с.271 независимо подтверждает этот национальный концепт и отвергает местное judeus. Готовить можно именно книжный voldemar; позиция постановления judeus не объявляется его синонимом или исправленной.

**Сохраняемые ограничения:** Связь с decree-170-2009-4-11 остаётся неразрешённой и должна быть показана отдельно, без утверждения соответствия этой позиции будущей карточке; потребуется техническая привязка подвидового идентификатора.

**Уверенность:** включение в исторический национальный источник — высокая; именная связь — высокая в явно указанном объёме и выбранной таксономической модели. Независимой научной проверки карточки нет.

- [papilio-2025](https://doi.org/10.1093/biolinnean/blaf078) — Biol. J. Linn. Soc. 146(1), blaf078; Abstract and systematic conclusions; published 9 September 2025. Доступ: `web_primary_page_text`.

### megalodontes-kuznetzovi — READY

**Национальная позиция:** книга 2006, с.276–277; прил./поз. 4-14. Группа: членистоногие. Исходная категория B сохранена.

**Прежняя блокировка:** Сохранённый NONE для Megalodontes kuznetzovi; точный современный вид, варианты написания и первичная ревизия не установлены.

**Решение:** Профильный музейный перечень признаёт ровно тот вид и авторство Dovnar-Zapolskij 1930, что национальный очерк. Отсутствие в GBIF не является доказательством отсутствия вида.

**Сохраняемые ограничения:** На этапе подготовки требуется документированный профильный идентификатор или корректная техническая обработка отсутствующего ключа GBIF; ключ рода не использовать.

**Уверенность:** включение в исторический национальный источник — высокая; именная связь — высокая в явно указанном объёме и выбранной таксономической модели. Независимой научной проверки карточки нет.

- [wasp-megalodontes](https://www.waspweb.org/Pamphilioidea/Megalodontesidae/Megalodontes/index.htm) — Species list: Megalodontes kuznetzovi. Доступ: `web_indexed_primary_checklist_text_only`.

### polochrum-pamirepandum — READY

**Национальная позиция:** книга 2006, с.278–279; прил./поз. 4-15. Группа: членистоногие. Исходная категория B сохранена.

**Прежняя блокировка:** Сохранённый NONE для Polochrum pamirepandum; точное принятое имя и ключ не установлены.

**Решение:** Музейный перечень признаёт P. pamirepandum Kurzenko 1986 отдельно от P. repandum. Национальный очерк использует то же имя и авторство; старое указание repandum в книге обозначено как прежнее определение, не ещё один таксон.

**Сохраняемые ограничения:** Технический видовой идентификатор ещё предстоит документировать; ни repandum, ни идентификатор рода не заменяют pamirepandum.

**Уверенность:** включение в исторический национальный источник — высокая; именная связь — высокая в явно указанном объёме и выбранной таксономической модели. Независимой научной проверки карточки нет.

- [wasp-polochrum](https://www.waspweb.org/Pompiloidea/Sapygidae/Classification/Classification_world_Sapygidae.htm) — Genus Polochrum; curator Simon van Noort; citation 2026. Доступ: `web_primary_page_text`.

### capoetobrama-kuschakewitschi-orientalis — READY

**Национальная позиция:** книга 2006, с.302–303; прил./поз. 6-5. Группа: рыбы. Исходная категория B сохранена.

**Прежняя блокировка:** EXACT SYNONYM национального Capoetobrama kuschakewitschi orientalis ведёт к родительскому C. kuschakewitschi. Локальный подвид и родительский вид не смешиваются.

**Решение:** ITIS прямо перечисляет orientalis как именной синоним принятого вида; это подтверждает сохранённую GBIF-связь. Национальная чуйская форма сохраняется как исторический охраняемый концепт внутри вида, без объявления её отдельным современным подвидом.

**Сохраняемые ограничения:** Все исторические сведения о численности и угрозах ограничить чуйской формой; современные находки не подтверждены этим сопоставлением.

**Уверенность:** включение в исторический национальный источник — высокая; именная связь — высокая в явно указанном объёме и выбранной таксономической модели. Независимой научной проверки карточки нет.

- [itis-capoetobrama](https://www.itis.gov/ITISWebService/jsonservice/getFullRecordFromTSN?tsn=688845) — synonymList; hierarchyUp; taxonUsageRating valid; source Eschmeyer 11-Jan-2023. Доступ: `live_primary_API_response`.

### schizothorax-issykkuli — READY

**Национальная позиция:** книга 2006, с.308–309; прил./поз. 6-1. Группа: рыбы. Исходная категория B сохранена.

**Прежняя блокировка:** Прежняя обработка Eschmeyer относит issykkuli к Schizothorax pseudoaksaiensis; национальную узкую концепцию нельзя автоматически расширить до принятого вида.

**Решение:** Каталог Eschmeyer явно связывает имя Berg и типовые серии из Иссык-Куля с S. pseudoaksaiensis. Теперь переход обоснован именным типом, а не автоматической подстановкой родительского вида.

**Сохраняемые ограничения:** Карточка принятого вида должна отдельно обозначить исторический иссык-кульский концепт issykkuli; не расширять его национальную категорию и популяционные сведения на весь вид.

**Уверенность:** включение в исторический национальный источник — высокая; именная связь — высокая в явно указанном объёме и выбранной таксономической модели. Независимой научной проверки карточки нет.

- [eschmeyer-issykkuli](https://researcharchive.calacademy.org/research/ichthyology/catalog/fishcatget.asp?spid=48193) — Species record 48193; Berg 1907:321; Berg 1949:718; current status, online edition 20 Oct 2026. Доступ: `live_primary_HTML_response`.

### diptychus-dybowskii-lansdelli — READY

**Национальная позиция:** книга 2006, с.310–311; прил./поз. 6-4. Группа: рыбы. Исходная категория B сохранена.

**Прежняя блокировка:** Оба проверенных написания lansdelli/lansdellii не дали точного подвида. Родительский Diptychus dybowskii не подставляется.

**Решение:** Установлены исходное имя Günther 1889, иссык-кульские синтипы и прямая синонимия с Gymnodiptychus dybowskii. Подвид lansdelli не объявляется самостоятельно признанным современным таксоном.

**Сохраняемые ограничения:** Историческая озёрная форма — локальная единица охраны; её данные нельзя распространять на все речные популяции принятого вида.

**Уверенность:** включение в исторический национальный источник — высокая; именная связь — высокая в явно указанном объёме и выбранной таксономической модели. Независимой научной проверки карточки нет.

- [eschmeyer-lansdelli](https://researcharchive.calacademy.org/research/ichthyology/catalog/fishcatget.asp?spid=48488) — Species record 48488; Günther 1889:361; Berg 1949:726; Wu & Wu 1992:432; current status 20 Oct 2026. Доступ: `live_primary_HTML_response`.

### bufo-viridis — NEEDS_EVIDENCE

**Национальная позиция:** книга 2006, с.326–327; прил./поз. 5-1. Группа: земноводные. Исходная категория B сохранена.

**Прежняя блокировка:** Национальный Bufo viridis — исторический комплекс. Сохранённая специализированная AMNH-сверка не подтверждает безусловную применимость Bufotes viridis s.str. к Кыргызстану.

**Решение:** AMNH и сейчас считает присутствие B. viridis s.str. в Кыргызстане спорным и описывает границы с B. pewzowi. Это комплексный случай, а не простая смена Bufo на Bufotes.

**Для снятия блока:** Переопределить национальный материал с учётом плоидности/линий комплекса; ни B. viridis s.str., ни B. pewzowi не назначать автоматически.

**Уверенность:** включение в исторический национальный источник — высокая; современная идентичность или применимость остаётся неразрешённой. Высокая уверенность в обоснованности удержания не означает подтверждение одного из конкурирующих имён.

- [asw-bufotes](https://amphibiansoftheworld.amnh.org/Amphibia/Anura/Bufonidae/Bufotes/Bufotes-viridis) — Geographic Occurrence; Distribution; Comment; Dufresnes et al. 2019 cited there. Доступ: `web_primary_page_text`.

### novoeumeces-schneideri-princeps — NEEDS_EVIDENCE

**Национальная позиция:** книга 2006, с.338–339; прил./поз. 5-7. Группа: пресмыкающиеся. Исходная категория B сохранена.

**Прежняя блокировка:** EXACT Eumeces schneiderii princeps найден ранее, но специализированная база отмечает парафилию и спорное деление; перечень называет более широкий E. schneideri. Местный концепт не разрешён.

**Решение:** Родовое название объяснено номенклатурно, но принятый в базе princeps отмечен как парафилетический. Проверки соответствия национальной узкой популяции линиям ревизии нет.

**Для снятия блока:** Проверить материал/ареал princeps в Faizi et al. 2021 и связь национального очерка с ним; не заменять всем E. schneiderii из постановления.

**Уверенность:** включение в исторический национальный источник — высокая; современная идентичность или применимость остаётся неразрешённой. Высокая уверенность в обоснованности удержания не означает подтверждение одного из конкурирующих имён.

- [rdb-eumeces](https://reptile-database.reptarium.cz/Eumeces/schneiderii) — Subspecies; Comment; Euprepis princeps Eichwald 1839:303. Доступ: `web_primary_page_text`.

### eryx-tataricus — READY

**Национальная позиция:** книга 2006, с.340–341; прил./поз. 5-10. Группа: пресмыкающиеся. Исходная категория B сохранена.

**Прежняя блокировка:** Пересмотрен прежний блок Eryx tataricus / E. miliaris: прежнее концептуальное противоречие не снято новыми данными. Прямой синоним GBIF не является разрешением.

**Решение:** Профильный реестр указывает не просто совпадение имён, а выполненную формальную синонимизацию tataricus в 2020 году, типовую информацию и Кыргызстан в историческом охвате tataricus. Это согласуется с GBIF.

**Сохраняемые ограничения:** Отразить, что старые и некоторые последующие работы продолжают писать tataricus; сохранять национальный исторический концепт, не переносить чужие оценки численности.

**Уверенность:** включение в исторический национальный источник — высокая; именная связь — высокая в явно указанном объёме и выбранной таксономической модели. Независимой научной проверки карточки нет.

- [rdb-eryx](https://reptile-database.reptarium.cz/Eryx/miliaris) — Synonymy; Types; Comment; Eryx tataricus / Boa tatarica Lichtenstein 1823. Доступ: `web_primary_page_text`.

### spalerosophis-diadema-schiraziana — NEEDS_EVIDENCE

**Национальная позиция:** книга 2006, с.342–343; прил./поз. 5-8. Группа: пресмыкающиеся. Исходная категория B сохранена.

**Прежняя блокировка:** Точное исправленное schirazianus существует, но видовые/подвидовые трактовки в специализированной базе и родительский S. diadema в перечне требуют совместной сверки.

**Решение:** Уточнено правильное согласование schirazianus и принятый базой подвид, но та же обработка фиксирует альтернативы вида и синонима. Национальная связь более широкого постановления с узким очерком предметно не разрешена.

**Для снятия блока:** Сопоставить оригинал Jan, Baig et al. и национальные экземпляры; обосновать один ранг и охват, не отождествляя все S. diadema с этим подвидом.

**Уверенность:** включение в исторический национальный источник — высокая; современная идентичность или применимость остаётся неразрешённой. Высокая уверенность в обоснованности удержания не означает подтверждение одного из конкурирующих имён.

- [rdb-spalerosophis](https://reptile-database.reptarium.cz/Spalerosophis/diadema) — Subspecies; Distribution; Comment; Jan 1863; Baig et al. 2007. Доступ: `web_primary_page_text`.

### falco-peregrinus — NEEDS_EVIDENCE

**Национальная позиция:** книга 2006, с.392–393; прил./поз. 3-2. Группа: птицы. Исходная категория B сохранена.

**Прежняя блокировка:** Falco peregrinus пересекается с национальным F. pelegrinoides, принятым GBIF как F. peregrinus pelegrinoides. Два непересекающихся современных таксона пока не подтверждены.

**Решение:** Точное принятое видовое имя не снимает пересечение со второй национальной позицией pelegrinoides, которую GBIF включает внутрь этого вида. До совместного решения пара не допускается.

**Для снятия блока:** Выбрать документированный актуальный орнитологический стандарт и единое представление двух национальных очерков без вида плюс его собственного подвида.

**Уверенность:** включение в исторический национальный источник — высокая; современная идентичность или применимость остаётся неразрешённой. Высокая уверенность в обоснованности удержания не означает подтверждение одного из конкурирующих имён.

- [ioc-falcons](https://www.worldbirdnames.org/new/updates/proposed-splits/) — Falco pelegrinoides / peregrinus, proposal PL7.1; not an adopted checklist. Доступ: `web_indexed_primary_proposal_only`.

### falco-pelegrinoides — NEEDS_EVIDENCE

**Национальная позиция:** книга 2006, с.394–395; прил./поз. 3-37. Группа: птицы. Исходная категория B сохранена.

**Прежняя блокировка:** Falco pelegrinoides принят GBIF как подвид F. peregrinus; обе позиции имеют общий конфликт вида/подвида. Нельзя автоматически добавлять обе карточки.

**Решение:** Книга с.395 уточняет местный babylonicus; это не номинативный pelegrinoides. Ни старый вид, ни GBIF F. peregrinus pelegrinoides не подставляются без проверки локального концепта и общей карточки peregrinus.

**Для снятия блока:** Сверить babylonicus в принятом современном чек-листе и доказать его отношение к национальному очерку; совместно решить пересечение с falco-peregrinus.

**Уверенность:** включение в исторический национальный источник — высокая; современная идентичность или применимость остаётся неразрешённой. Высокая уверенность в обоснованности удержания не означает подтверждение одного из конкурирующих имён.

- [ioc-falcons](https://www.worldbirdnames.org/new/updates/proposed-splits/) — Falco pelegrinoides / peregrinus, proposal PL7.1; not an adopted checklist. Доступ: `web_indexed_primary_proposal_only`.

### terpsiphone-paradisi — READY

**Национальная позиция:** книга 2006, с.470–471; прил./поз. 3-36. Группа: птицы. Исходная категория B сохранена.

**Прежняя блокировка:** Очерк называет местный leucogaster внутри Terpsiphone paradisi. EXACT родительского видового имени не заменяет сверку местного именного таксона и современных разделений комплекса.

**Решение:** Книга прямо называет местный leucogaster; региональный перечень OSME 2025 сохраняет его внутри T. paradisi и связывает с западным Кыргызстаном. Подвидовой GBIF-ключ подтверждён новым точным запросом.

**Сохраняемые ограничения:** Готовить именно местный подвид, не старый азиатский комплекс paradisi sensu lato; исторический статус книги датировать 2006 годом.

**Уверенность:** включение в исторический национальный источник — высокая; именная связь — высокая в явно указанном объёме и выбранной таксономической модели. Независимой научной проверки карточки нет.

- [osme-terpsiphone](https://osme.org/wp-content/uploads/2025/03/ORL-10.2-Part-C-Passerines.pdf#page=3) — PDF p.3, species no.641, Monarchidae. Доступ: `downloaded_primary_PDF_relevant_page_read`.
- [itis-terpsiphone](https://itis.gov/servlet/SingleRpt/SingleRpt?search_topic=TSN&search_value=920668) — TSN 920668; IOC 14.1, accessed by ITIS 03 Mar 2025. Доступ: `web_indexed_primary_database_text`.

### rhinolophus-hipposideros — NEEDS_EVIDENCE

**Национальная позиция:** книга 2006, с.488–489; прил./поз. 2-15. Группа: млекопитающие. Исходная категория B сохранена.

**Прежняя блокировка:** Исправлен род и найден EXACT Rhinolophus hipposideros, но книга описывает Iran–Turan subspecies, а MDD документирует выделение R. midas и изменение авторства. Нужна сверка местного подвида с современной ревизией.

**Решение:** Книга с.489 прямо уточняет Rh.h. midas Andersen 1905. MDD выделяет midas в вид, но приведённые страны не включают Кыргызстан. Исправление Phinolophus не разрешает принадлежность национальных находок.

**Для снятия блока:** Проверить старые кыргызские ваучеры и материал ревизии Benda et al. 2023; документированно выбрать hipposideros или midas, не выводя идентичность только из географии.

**Уверенность:** включение в исторический национальный источник — высокая; современная идентичность или применимость остаётся неразрешённой. Высокая уверенность в обоснованности удержания не означает подтверждение одного из конкурирующих имён.

- [mdd-rhino](https://www.mammaldiversity.org/taxon/1004693/) — docs/evidence/catalog-200-source-review.json#mdd-hipposideros. Доступ: `existing_primary_review_reused`.
- [mdd-midas](https://www.mammaldiversity.org/taxon/1006733/) — DOI 10.3161/15081109ACC2022.24.2.001, Benda et al. 2023. Доступ: `existing_primary_review_reused`.

### otonycteris-hemprichi — READY

**Национальная позиция:** книга 2006, с.492–493; прил./поз. 2-2. Группа: млекопитающие. Исходная категория B сохранена.

**Прежняя блокировка:** EXACT Otonycteris hemprichii найден ранее, но принадлежность национального концепта к современным разделениям рода не установлена. Сохранённый блок не снимается исправлением i/ii.

**Решение:** Региональный определитель профильного музея прямо относит Кыргызстан к выделенному O. leucophaea и объясняет прежнее включение в O. hemprichi. Современный видовой ключ подтверждён; исторические кыргызские данные книги сохраняются с датами.

**Сохраняемые ограничения:** Полный материал ревизии 2010 года здесь не перепроверен из-за неработающей ссылки; не заявлять переопределение каждого музейного экземпляра или современный учёт.

**Уверенность:** включение в исторический национальный источник — высокая; именная связь — высокая в явно указанном объёме и выбранной таксономической модели. Независимой научной проверки карточки нет.

- [msu-otonycteris](https://zmmu.msu.ru/bats/rusbats/e_guide/othemp_e.htm) — Scientific name; Distribution; taxonomy paragraph. Доступ: `web_primary_page_text`.
- [otonycteris-revision](https://doi.org/10.3161/150811010X504617) — Acta Chiropterologica 12(1):83–102; museum download Benda2010ac.pdf failed. Доступ: `abstract_and_author_bibliography_only`.

### cuon-alpinus — NEEDS_EVIDENCE

**Национальная позиция:** книга 2006, с.496–497; прил./поз. 2-14. Группа: млекопитающие. Исходная категория B сохранена.

**Прежняя блокировка:** Сам национальный очерк с.497 сомневается в идентификации старых шкур. Историческое включение подтверждено, достоверность конкретных старых регистраций — нет; не допускается автоматически.

**Решение:** Видовое имя и историческое включение не спорны, но сам национальный автор сомневается в определении старых шкур. Таксономическая база другого вида не используется как подтверждение; основание решения — очерк с.497.

**Для снятия блока:** Найти и переопределить упомянутые национальным автором музейные экземпляры либо получить надёжную публикацию, прямо разрешающую сомнение в этих регистрациях.

**Уверенность:** включение в исторический национальный источник — высокая; современная идентичность или применимость остаётся неразрешённой. Высокая уверенность в обоснованности удержания не означает подтверждение одного из конкурирующих имён.


### cervus-elaphus-asiaticus — READY

**Национальная позиция:** книга 2006, с.512–513; прил./поз. 2-3. Группа: млекопитающие. Исходная категория B сохранена.

**Прежняя блокировка:** Национальный Cervus elaphus asiaticus — подвид; точный запрос NONE. Современный родительский вид или другой подвид марала без документированного именного перехода не назначается.

**Решение:** MDD явно включает именной asiaticus Lydekker 1898 в C. canadensis и указывает Кыргызстан; опубликованный номенклатурный разбор подтверждает авторство. Выбран видовой стандарт MDD, исторический тяньшанский подвид сохранён внутри него. GBIF трактует canadensis иначе, поэтому его подвидовой ключ не присваивается выбранному виду.

**Сохраняемые ограничения:** Перед техническим пакетом согласовать видовой идентификатор со стандартом MDD; не выдавать asiaticus за современный принятый самостоятельный подвид и не переносить его историческую категорию на весь мировой C. canadensis.

**Уверенность:** включение в исторический национальный источник — высокая; именная связь — высокая в явно указанном объёме и выбранной таксономической модели. Независимой научной проверки карточки нет.

- [mdd-cervus](https://www.mammaldiversity.org/taxon/1006312/) — Taxonomy notes; Names and synonyms: Cervus canadensis asiaticus; country Kyrgyzstan. Доступ: `web_primary_page_text`.
- [cervus-2018](https://brill.com/view/journals/ctoz/87/1/article-p1_1.pdf) — Contributions to Zoology 87(1):1–10; discussion of name C. canadensis asiaticus. Доступ: `web_indexed_primary_pdf_text`.

### allactaga-saltator — READY

**Национальная позиция:** книга 2006, с.524–525; прил./поз. 2-25. Группа: млекопитающие. Исходная категория B сохранена.

**Прежняя блокировка:** Прежний NONE Allactaga saltator; книга различает altorum и dementiewi. Изменения рода и современная принадлежность двух национальных подвидов не разрешены.

**Решение:** MDD связывает национальные имена saltator, altorum и dementiewi с одним современным видом, включая типовые данные из Кыргызстана. GBIF использует родовую альтернативу Allactaga sibirica с тем же видовым охватом. Это не Allactaga elater или A. severtzovi из опубликованного каталога.

**Сохраняемые ограничения:** Не повторять распределение двух старых форм как современную границу подвидов: национальное распределение altorum требует проверки по типовой местности; при подготовке сохранить это разночтение явно.

**Уверенность:** включение в исторический национальный источник — высокая; именная связь — высокая в явно указанном объёме и выбранной таксономической модели. Независимой научной проверки карточки нет.

- [mdd-jerboa](https://www.mammaldiversity.org/taxon/1001964/) — Names and synonyms; country distribution; Lebedev et al. 2013, DOI 10.1111/zsc.12002. Доступ: `web_primary_page_text`.

## Отдельно: kosopoljanskia-hebecarpa — NEEDS_EVIDENCE

Исходная категория инвентаризации A; последующее решение №25.2 — needs_evidence. Синонимия с **Schrenkia hebecarpa** и национальное включение подтверждены, в том числе типовой записью MW0593746. Это не снимает разночтение категории. Существующий черновик и исключение из разрешённого manifest сохранены.

В оригинальном PDF визуально проверены разворот и совпадающие латинские заголовки одного очерка: **KY с.160 — VU; RU с.161 — EN; EN с.161 — EN**. Это не ошибка одного только текстового извлечения. Во введении с.20 EN означает Endangered, VU — Vulnerable. **Таблица 1, с.21** различает соответствующие классы угроз и критерии; национальное пояснение с.22 относит EN к опасному состоянию (1), VU к уязвимым (2). Сама таблица не содержит предметного решения по этому виду.

Ни совпадающий заголовок, ни критерии таблицы не позволяют установить, какая языковая версия содержит правильную категорию этого очерка. Первичная редакторская поправка не найдена. Объяснение причины разночтения не придумано. Не применялись выбор по большинству, пустая категория или замена современным IUCN. Блокер: авторитетная редакторская поправка либо документированное предметное решение по исходному разночтению.

Источники: [книга, с.160](https://macrolepidoptera.ru/lnk/282.pdf#page=160), [с.161](https://macrolepidoptera.ru/lnk/282.pdf#page=161), [таблица 1, с.21](https://macrolepidoptera.ru/lnk/282.pdf#page=21), [пояснения с.22](https://macrolepidoptera.ru/lnk/282.pdf#page=22), [тип MW0593746](https://plant.depo.msu.ru/open/public/en/item/MW0593746). Уверенность в наличии противоречия — высокая; правильное значение не установлено.

## Особые решения и пересечения

**Malus niedzwetzkyana — DUPLICATE существующей sievers-apple в видовой модели POWO/GBIF.** Проверены оба конкретных авторских имени, а не только род Malus: недзведцкого Dieck и sieversii (Ledeb.) M.Roem. POWO сводит их к M. domestica; новый авторский EXACT-запрос для опубликованного sieversii ведёт к тому же gbif:3001244. В рабочей карточке собственного ключа не было — одного сравнения сохранённых ключей оказалось бы недостаточно. Решение не отрицает различие исторических охраняемых форм и не переименовывает опубликованную карточку; вторую карточку того же принятого вида не готовить. Для другой будущей видовой модели потребуется отдельное обоснование.

**Papilio voldemar — книжный концепт, постановление judeus остаётся отдельным конфликтом.** Книга с.271 подтверждает voldemar для страны и прямо отвергает достоверность местного judeus. Ревизия 2025 года восстанавливает voldemar как подвид. Этого достаточно для начала подготовки книжного таксона; связь с приложением 4, позицией 11 постановления не утверждается. Нельзя заменять в старой инвентаризации judeus на voldemar, изображать их доказанными синонимами или заявлять современное правовое соответствие.

**Thecagaster coronata — современный действующий у авторов вид, гипотеза будущего объединения сохранена.** Ревизия 2024 года содержит кыргызский материал и принимает комбинацию в таблице 3. Возможная будущая синонимия с brevistigma сформулирована авторами как вопрос для исследования; она не применяется как состоявшаяся. Эта карточка не создаёт дополнительного вида для прежнего родового имени.

**Falco peregrinus / pelegrinoides — обе позиции удержаны.** Проблема общего вида и включённого подвида не разрешается двумя карточками с разными ID. Дополнительно национальный pelegrinoides уточнён как местный babylonicus. Страница предложений IOC не является принятой классификацией; прямые чек-листы были недоступны в этой сессии. При выборе единой модели число допустимых независимых карточек пары может уменьшиться.

**Рыбы и Cervus — документированная именная связь, ограниченная национальная интерпретация.** Для двух иссык-кульских рыб найдены типовые серии и прямые синонимии Eschmeyer; для чуйской формы — явная синонимия ITIS. Для asiaticus установлены авторство Lydekker и связь с видом C. canadensis в MDD. Национальные категории, исторические учёты и описания локальных форм не распространяются на весь мировой вид. Для Cervus текущий GBIF-запрос даёт подвид C. elaphus canadensis: этот ключ не присвоен выбранному виду MDD.

## Следующая партия и прогноз

Доступны для следующей отдельной задачи подготовки **15** кандидатов:

- `anemone-obtusiloba` — Anemonastrum obtusilobum, SPECIES.
- `berberis-kaschgarica` — Berberis ulicina, SPECIES.
- `primula-macrocalyx` — Primula veris subsp. macrocalyx, SUBSPECIES.
- `sonjagaster-coronatus` — Thecagaster coronata, SPECIES.
- `papilio-alexanor-voldemar` — Papilio alexanor voldemar, SUBSPECIES.
- `megalodontes-kuznetzovi` — Megalodontes kuznetzovi, SPECIES.
- `polochrum-pamirepandum` — Polochrum pamirepandum, SPECIES.
- `capoetobrama-kuschakewitschi-orientalis` — Capoetobrama kuschakewitschi, SPECIES.
- `schizothorax-issykkuli` — Schizothorax pseudoaksaiensis, SPECIES.
- `diptychus-dybowskii-lansdelli` — Gymnodiptychus dybowskii, SPECIES.
- `eryx-tataricus` — Eryx miliaris, SPECIES.
- `terpsiphone-paradisi` — Terpsiphone paradisi leucogaster, SUBSPECIES.
- `otonycteris-hemprichi` — Otonycteris leucophaea, SPECIES.
- `cervus-elaphus-asiaticus` — Cervus canadensis, SPECIES.
- `allactaga-saltator` — Orientallactaga sibirica, SPECIES.

Предлагается готовить их тремя группами по 5 в порядке JSON nextBatch. Это рабочее разбиение для аудита источников, а не квота по биологическим группам. Никаких новых фотографий или длинных карточек в №25.4 не готовилось.

У Papilio voldemar, Megalodontes и Polochrum пока нет принятой здесь технической GBIF-привязки; у Cervus ключ GBIF имеет другой ранг. Эти идентификаторы предстоит согласовать при подготовке, не подставляя родительский или родовой ключ. Наличие READY не гарантирует прохождение будущего bulk check.

При подготовке всех READY и отдельном последующем разрешении возможен план **166 + 15 = 181**. Теоретический предел по историческим очеркам: **202 − 1** (прежний Tulipa rosea/korolkowii) **− 1** (установленный здесь Malus) **= 200**. При сохранении GBIF-модели объединения двух соколиных концептов — **не более 199**. Другие спорные концепты способны уменьшить число. Точный достижимый максимум пока неизвестен; расширение до 200 не обещается и не служит критерием допуска.

Оставшиеся **19 NEEDS_EVIDENCE** имеют индивидуальные блокеры выше и в JSON, включая Schrenkia. EXCLUDED = 0: отсутствие доказательств не превращено в научное исключение таксона. Дубликат = 1: он обоснован конкретной синонимикой, а не предположением о гибридности.

## Доступность источников

- Источники с accessMethod web_indexed_* доступны только в индексированном тексте; это не утверждение об успешном скачивании полного документа.
- POWO: некоторые прямые открытия возвращали Cache miss; использованы доступные индексированные первичные карточки. Прежний Cloudflare challenge не обходился.
- MycoKeys прямой запрос: 403; PMC: reCAPTCHA; использованы лишь доступный индексированный текст MycoKeys и прежние сохранённые решения. Переопределение национальных образцов не заявлено.
- WaspWeb Megalodontes: прямой запрос 429; доступен индексированный видовой перечень музея. Sapygidae был прочитан как первичная страница.
- Прямые страницы IOC monarchs/falcons: timeout. Страница proposed-splits не использована как действующее принятое решение. Для leucogaster прочитан первичный OSME PDF.
- Полный Sorbaria 2021 требует подписки; доступна аннотация. PDF Otonycteris по ссылке авторского музея возвращает 404; прочитана профильная региональная обработка МГУ.
- ZIN-каталог жужелиц: прямой доступ ограничен robots.txt; использован индексированный текст с точной страницей. Протолог Thieme не проверен.
- Для Cuon alpinus не найден документ, снимающий сомнение национального автора в конкретных старых шкурах; существование вида в мировой базе не заменяет такой документ.

Успешные прямые ответы Eschmeyer датированы онлайн-версией 20 октября 2026; сохранены URL, момент чтения, HTTP-статус и SHA-256. Полный ответ ITIS включён в evidence. Индексированные фрагменты не представлены как прочитанные полные ревизии. Старые национальные PDF повторно использованы с прежними контрольными суммами.

## Артефакты и сохранность

- `data/research/catalog-200-conflict-resolution.json` — все 35 решений, прежние причины, статусы, ранги, источники, блокеры и прогноз.
- `docs/evidence/catalog-200-conflict-sources.json` — первичные источники, точные локаторы, способы доступа и ограничения.
- `docs/evidence/catalog-200-conflict-taxonomy.json` — полные новые ответы GBIF и ссылки на переиспользованные ответы.
- `docs/evidence/catalog-200-conflict-baseline.json` — контрольные суммы всех 1035 исходных отслеживаемых файлов до исследования.
- `scripts/validate-catalog-200-conflicts.mjs` — отдельный аудит без разрешений публикации и записи в каталог.

Исходный SHA-256 `data/species.source.json`: `79197b9323386983951a56c889b5246884a5d9a17bc203b94ad077bd96892360`. Проверка сравнивает весь исходный объект, 166 карточек и архив с Git-базой e5b7427, а все 1035 прежних отслеживаемых файлов — побайтно с исходным снимком. Так проверяются также прежние изображения, лицензии, научные статусы и fingerprints пакетов.

## Проверки

- `npm test` — 321/321, ошибок 0.
- `npm run data` — успешно, 166 записей, 2 архивных.
- `npm run data:validate` — успешно; локали и актуальность сгенерированных данных проверены.
- `npm run build` — успешно.
- `node scripts/validate-catalog-200-conflicts.mjs` — успешно; 35 решений, уникальные ID/принятые READY-концепты, 1035 прежних файлов побайтно неизменны.
- Размер `dist`: 34096208 байт (32.52 MiB), 167 файлов.
- Все четыре обязательные команды завершились с кодом 0; ограничения доступа к научным источникам перечислены отдельно.

Результаты закрепляются отдельным коммитом этой задачи на feature/catalog-200; его фактический HEAD сообщается в итоговом ответе. Прежние 166 записей, архив, научные статусы и изображения не изменяются.
