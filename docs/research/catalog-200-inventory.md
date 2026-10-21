# MURAS — инвентаризация оставшихся таксонов, задача 25.1

Дата: **21.10.2026**. Ветка **feature/catalog-200**. Исходный HEAD и main: **5c26da5a3b235d93143a62dee2f70b906a09e070**. Перед началом дерево было чистым, source/public содержали по **150 записей**, архив — 2. Публичные карточки, черновики публикации, фотографии и очереди импорта не создавались.

## Результат и единицы подсчёта

Проверена **421 историческая позиция**: 202 отдельных очерка книги и 219 пронумерованных строк консолидированного постановления. Из последних 202 не исключены в копии 2009 года, 17 помечены исключёнными. Эти суммы нельзя складывать как число биологических видов: документы в значительной части описывают одни концепции.

Существующие **150 уникальных таксонов каталога** сопоставлены с 150 первичными очерками. Дополнительно подтверждено, что очерк **Tulipa rosea** покрывается уже опубликованным **T. korolkowii**: совпадает GBIF 5299568, синонимия подтверждена POWO. Поэтому покрыт **151 очерк**, а не только 150. После удаления этого дубликата остаётся **51 не представленная концепция**, из которых только **17 имеют A**; **34 имеют B**.

| Счётчик | Число |
| --- | ---: |
| Проверенные очерки книги 2006 | 202 |
| Все номера постановления 2005 в документированной редакции 2009 | 219 |
| Неисключённые строки редакции 2009 / исключённые номера | 202 / 17 |
| Всего проверенных строк/очерков | 421 |
| Уникальные опубликованные таксоны, имеющие связь с национальными очерками | 150 |
| Очерки, покрытые каталогом с учётом дополнительного синонима | 151 |
| Первоначальные пробелы при сравнении исторических имён | 52 |
| **A — достаточно доказательств для будущей подготовки** | **17** |
| **B — конкретный конфликт или недостающее доказательство** | **34** |
| **C — дубликат среди этих 52 имён** | **1** |
| Дополнительные C: исторически исключённые номера, не кандидаты | 17 |

Итого **A/B/C = 17/34/1 среди 52 первоначальных пробелов имён**. Семнадцать исключённых номеров — отдельная статистика строк источника; они не объявляются 17 установленными таксонами и не добавляются к числу отсутствующих уникальных видов.

| Группа | Очерки книги | Таксоны каталога | A | B | C-дубликат |
| --- | --- | --- | --- | --- | --- |
| растения | 83 | 61 | 10 | 11 | 1 |
| грибы | 4 | 3 | 0 | 1 | 0 |
| членистоногие | 18 | 11 | 0 | 7 | 0 |
| рыбы | 7 | 4 | 0 | 3 | 0 |
| амфибии | 2 | 1 | 0 | 1 | 0 |
| рептилии | 8 | 5 | 0 | 3 | 0 |
| птицы | 57 | 49 | 5 | 3 | 0 |
| млекопитающие | 23 | 16 | 2 | 5 | 0 |

## Источники и метод

Использованы [Красная книга КР, второе издание, 2006](https://macrolepidoptera.ru/lnk/282.pdf) и [постановление №170 от 28.04.2005 в консолидированной копии с изменениями №471 от 25.07.2009](https://faolex.fao.org/docs/pdf/kyr104340.pdf). Повторная загрузка этих PDF не требовалась: SHA-256 существующих копий совпали с проверенными значениями:

- Книга: **f517212f7ce12fcf5c30f2cf73edc5a842b3ded15dea232b844fbe7ce2525cf8**.
- Постановление: **1e47f07208cf45d90096f0b9775fd625dd2102e06b42cf69610a49cc57f21be4**.

Повторно использованы полная прежняя транскрипция, инвентаризация 125, все 13 реестров с массивом candidates, опубликованные пакеты 84/100/125/150, архив и прежние аудиты исключения. Сохранено 29 новых записей запросов GBIF. При первоначальном выборе кэшей был пропущен catalog-125-taxonomy.json: финальная сверка включила его 54 ответа, в том числе 28 относящихся к остатку. Из 29 новых запросов 15 повторили прежний lookup имени; 13 дополнили отсутствовавшую принятую запись, два (первоначальный Salvia vvedenskyi и Tianschaniella umbellifera) не дали новых сведений. Это лишние повторные обращения, а не новое исследование этих имён. В итоговой доказательной базе сохранены оба происхождения; прежние файлы не переписаны. Остальные уточнения связаны с конкретным местным именным таксоном, орфографией или проверкой транскрипции. Классификация от включения пакета 125 не изменилась.

Сопоставлены исходные имена, альтернативы того же очерка, подтверждённая синонимия, GBIF ID, ранги вида/подвида, существующие ID и прежние очереди. Сравнение включает архив: amur-tiger (научное имя не задано) и whooping-crane (Grus americana); совпадений остатка с ними нет. Отсутствующее имя и неизвестный ключ не считались совпадением.

У 17 прежних карточек нет сохранённого поля GBIF taxonId; их национальные связи проверены по именам и ранее документированным переходам. Список этих ID приведён в catalogIdentityCheck JSON и отмечен в таблице ниже. Пустой ключ не означает отсутствующий таксон и не считается совпадением с другим пустым ключом. Среди сохранённых GBIF-ключей опубликованного каталога коллизий нет; пересечений вида/подвида по опубликованным научным именам также нет. Новые ключи старым карточкам не назначались.

**A означает разрешимость будущей подготовки, а не готовую карточку, разрешение на импорт или независимое научное одобрение.** Для B принятое имя национальной концепции оставлено null; предложения баз сохранены отдельно. Гомотипные комбинации одного вида не образуют несколько кандидатов. Различие исторического ранга и современного ранга не скрывается; родительский вид не подставляется вместо неразрешённого подвида.

Родовые альтернативы Leuzea/Rhaponticum относятся к одному явно связанному именной типом виду и записаны раздельно по источникам. Это отличается от нерешённого объёма вида/подвида или гибридного комплекса.

Исторические документы **не объявлены актуальным правовым реестром на 2026 год**. Текущая редакция законодательства и современное присутствие отсутствующих видов не подтверждались. Полный отдельный поимённый текст редакции 2005 до исключений недоступен в проверенных материалах; названия исключённых строк не реконструированы. Отсутствие современной страны в базе не является доказательством отсутствия вида.

## A — отсутствующие подтверждённые таксоны для подготовки

В таблице приведены именно 17 самостоятельных кандидатов. Краткие имена источников раскрыты ниже; для каждого кандидата JSON сохраняет точные URL национальных документов, номер запроса, ранги, предложения баз и основания.

| ID (предварительный) | Историческое → принятое имя | Группа / ранг книги | КК, страницы; П170 прил.стр. | Основание решения | Доп. источники |
| --- | --- | --- | --- | --- | --- |
| sorbus-persica | Sorbus persica → Hedlundia persica | растения / SPECIES | 140–141; 1.43 | Гомотипная комбинация Hedlundia persica подтверждена EXACT SYNONYM GBIF и POWO; это один вид, не новая карточка для каждого рода. | T4; powo-hedlundia |
| amygdalus-petunnikowii | Amygdalus petunnikowii → Prunus petunnikowii | растения / SPECIES | 142–143; 1.45 | Prunus petunnikowii: тот же именной таксон и видовой ранг; гомотипия и Кыргызстан подтверждены POWO и GBIF. | T4; powo-prunus |
| kosopoljanskia-hebecarpa | Kosopoljanskia hebecarpa → Schrenkia hebecarpa | растения / SPECIES | 160–161; 1.63 | Schrenkia hebecarpa: перенос того же вида; GBIF и первичная запись изотипа MW0593746 связывают оба имени. | T4; msu-schrenkia-hebecarpa |
| kosopoljanskia-turkestanica | Kosopoljanskia turkestanica → Schrenkia turkestanica | растения / SPECIES | 162–163; 1.55 | Schrenkia turkestanica: гомотипная комбинация и Кыргызстан подтверждены региональным научным каталогом 2022, с.43, и GBIF. | T4; schrenkia-central-asia |
| alajja-anomala | Alajja anomala → Eriophyton anomalum | растения / SPECIES | 190–191; 1.69 | Eriophyton anomalum: первичная таксономическая работа документирует комбинацию, прежнюю Erianthera anomala и кыргызстанские образцы; GBIF даёт точный вид. | T4; eriophyton-corrections |
| otostegia-schennikovii | Otostegia schennikovii → Moluccella olgae | растения / SPECIES | 192–193; 1.70 | Moluccella olgae: EXACT SYNONYM и явная гетеротипная синонимия в POWO. Национальные описания остаются ограничены историческим O. schennikovii, без распространения всех его признаков на расширенный вид. | T4; powo-moluccella |
| salvia-vvedenskyi | Salvia vvedenskyi → Salvia vvedenskii | растения / SPECIES | 196–197; 1.72 | Написание vvedenskyi E. Nikit. сверено с Salvia vvedenskii Nikitina в POWO и исходной Flora Kirgizskoi SSR; выполнен отдельный EXACT, исходный FUZZY не является основанием допуска. | T4; powo-salvia |
| stemmacantha-aulieatensis | Stemmacantha aulieatensis → Leuzea aulieatensis | растения / SPECIES | 214–215; 1.86 | GBIF предпочитает Leuzea aulieatensis, POWO Rhaponticum aulieatense. Гомотипные комбинации одного вида связаны явно; альтернативное родовое положение записано, а не превращено в два кандидата. | T4; powo-rhaponticum |
| centaurea-alaica | Centaurea alaica → Rhaponticoides alaica | растения / SPECIES | 216–217; 1.87 | EXACT SYNONYM GBIF связывает Centaurea alaica Iljin с видовой комбинацией Rhaponticoides alaica (Iljin) Negaresh; исходный национальный очерк сохранён. | T4 |
| pyrethrum-leontopodium | Pyrethrum leontopodium → Richteria leontopodium | растения / SPECIES | 222–223; 1.89 | Richteria leontopodium: явная гомотипная синонимия POWO и точный ответ GBIF; самостоятельный вид отсутствует в каталоге. | T4; powo-richteria |
| phoenicopterus-roseus | Phoenicopterus ruber → Phoenicopterus roseus | птицы / SPECIES | 372–373; 3.9 | Национальный текст прямо называет местный P. ruber roseus Pallas 1811, перечень — P. roseus. EXACT ACCEPTED относится к этому именному таксону; современный американский P. ruber не используется. | T4 |
| chlamydotis-macqueenii | Chlamydotis undulata → Chlamydotis macqueenii | птицы / SPECIES | 432–433; 3.30 | Очерк явно ограничивает Кыргызстан C. undulata macqueenii (J.E. Gray 1832); точный принятый C. macqueenii сохраняет этот именной таксон. Современный C. undulata целиком не подставляется. | T4 |
| numenius-tenuirostris | Numenius tenuirostris → Numenius tenuirostris | птицы / SPECIES | 446–447; 3.58 | Однозначный видовой очерк и национальная строка; EXACT ACCEPTED SPECIES GBIF. Подготовка допустима только с историческими сведениями; современное присутствие и актуальная глобальная оценка здесь не устанавливались. | T4 |
| larus-ichtyaetus | Larus ichtyaetus → Ichthyaetus ichthyaetus | птицы / SPECIES | 450–451; 3.49 | Прежний блок из-за FUZZY снят документальной сверкой: в перечне Larus ichthyaetus, тот же Pallas 1773; теперь сохранены EXACT SYNONYM и EXACT ACCEPTED. Это не автоматическое принятие похожего имени. | T5; T4 |
| dendrocopos-major | Dendrocopos major → Dendrocopos major | птицы / SPECIES | 468–469; 3.25 | Самостоятельный видовой очерк и строка перечня, EXACT ACCEPTED SPECIES. Упомянутый в книге brevirostris не создаёт второй карточки; редкие старые находки не объявляются современной популяцией. | T4 |
| hemiechinus-hypomelas | Hemiechinus hypomelas → Paraechinus hypomelas | млекопитающие / SPECIES | 482–483; 2.8 | Книга прямо пишет Hemiechinus (Paraechinus) hypomelas; принятый вид точно подтверждён прежним GBIF. Прежняя отсрочка относилась к отсутствию современного KG в MDD, а задача 25.1 учитывает историческое включение. Допуск только к подготовке с currentPresenceConfirmed null. | T3 |
| allactaga-severtzovi | Allactaga severtzovi → Allactaga severtzovi | млекопитающие / SPECIES | 526–527; 2.24 | Одинаковое видовое имя в книге, перечне и сохранённом EXACT ACCEPTED GBIF. Отсутствие Кыргызстана в современном списке MDD не отменяет национальный исторический очерк и не доказывает отсутствие вида. Современное присутствие остаётся неизвестным. | T3 |

Местные roseus и macqueenii прямо названы в текстах соответствующих очерков; более широкие исторические заголовки P. ruber и C. undulata не превращаются в современные самостоятельные карточки. Hemiechinus/Paraechinus hypomelas и Allactaga severtzovi получили A в рамках **исторической** цели этой задачи: прежняя отсрочка касалась современного перечня стран, а не отсутствия национального очерка или валидного видового имени. Современное присутствие остаётся null. Никакие данные о численности, находках 2026 года или координатах не добавлены.

## B — полный перечень неразрешённых концепций

| ID (предварительный) | Историческое → принятое имя | Группа / ранг книги | КК, страницы; П170 прил.стр. | Основание решения | Доп. источники |
| --- | --- | --- | --- | --- | --- |
| dictyophora-duplicata | Dictyophora duplicata → не разрешено | грибы / SPECIES | 40–41; 1.93 | GBIF связывает имя с Phallus indusiatus, тогда как микологические источники обсуждают Phallus duplicatus и комплекс indusiatus; национальный концепт не разрешён. | T1; T2 |
| tulipa-anadroma | Tulipa anadroma → не разрешено | растения / SPECIES | 78–79; 1.12 | Прежнее противоречие национального эндемичного T. anadroma и более широкого T. tschimganica не разрешено. Синоним GBIF не снимает сохранённый блок. | T1; T2 |
| anemone-obtusiloba | Anemone obtusiloba → не разрешено | растения / SPECIES | 110–111; 1.29 | Сохранённый GBIF HIGHERRANK относится к роду Anemonastrum, а не к точному принятому виду. Нельзя использовать идентификатор рода или догадку о комбинации. | T2; T3 |
| berberis-kaschgarica | Berberis kaschgarica → не разрешено | растения / SPECIES | 114–115; 1.32 | GBIF предлагает Berberis ulicina вместо национального B. kaschgarica; отдельная проверка соответствия национального именного концепта современному виду не выполнена. | T2 |
| sorbaria-olgae | Sorbaria olgae → не разрешено | растения / SPECIES | 126–127; 1.42 | GBIF объединяет Sorbaria olgae с S. tomentosa. Границы узкого национального таксона и расширенного принятого вида требуют источниковой сверки; нет основания автоматически расширять очерк. | T2 |
| pyrus-asiae-mediae | Pyrus asiae-mediae → не разрешено | растения / SPECIES | 130–131; 1.39 | Прежний блок: EXACT ACCEPTED в GBIF не разрешает опубликованную проблему возможной гибридной природы и самостоятельности национального Pyrus asiae-mediae. | T2 |
| malus-niedzwetzkyana | Malus niedzwetzkyana → не разрешено | растения / SPECIES | 134–135; 1.38 | Новый GBIF относит Malus niedzwetzkyana к M. domestica. Требуется сверка национального дикорастущего концепта с культурным/расширенным видом; родительская культурная яблоня не добавляется автоматически. | T4 |
| sophora-griffithii-korolkowii | Sophora griffithii korolkowii → не разрешено | растения / SUBSPECIES | 144–145; 1.50 | Национальные Styphnolobium korolkowii / Sophora griffithii ssp. korolkowii / Sophora korolkowii не разрешены: GBIF предлагает Styphnolobium japonicum. Ранг, тип и применимость этой синонимии необходимо проверить по ревизии. | T4 |
| vitis-usunachmatica | Vitis usunachmatica → не разрешено | растения / SPECIES | 156–157; 1.54 | GBIF предлагает Vitis gmelinii; соответствие национального V. usunachmatica и современного видового концепта не подтверждено специальной обработкой. Нет автоматической подмены более широким виноградом. | T4 |
| dorema-microcarpum | Dorema microcarpum → не разрешено | растения / SPECIES | 174–175; 1.64 | POWO принимает Ferula namanganica как гомотипную замену Dorema microcarpum, GBIF выбирает Ferula microcarpum; POWO перечисляет только Узбекистан. Нужно согласовать валидное имя, ключ GBIF и национальный географический концепт. | T4; powo-ferula |
| primula-macrocalyx | Primula macrocalyx → не разрешено | растения / SPECIES | 180–181; 1.65 | GBIF меняет национальный SPECIES Primula macrocalyx на SUBSPECIES Primula veris macrocalyx. Требуются явный выбор принятого ранга и проверка объёма национального очерка; P. veris целиком не подставляется. | T2; T3 |
| tianschaniella-umbellifera | Tianschaniella umbellifera → не разрешено | растения / SPECIES | 200–201; 1.76 | Точный запрос Tianschaniella umbellifera вернул NONE; современная комбинация и точный идентификатор не установлены. | T4 |
| sonjagaster-coronatus | Sonjagaster coronatus → не разрешено | членистоногие / SPECIES | 250–251; 4.1 | Пересмотрен сохранённый блок: Cordulegaster/Thecagaster coronata и возможная связь с T. brevistigma обсуждаются Schneider et al. 2024; в перечне другой родительский ранг C. insignis ssp. coronatus. Нужна ревизия границ таксона. | T1; T2; T5 |
| cephalota-galathea | Cephalota galatea → не разрешено | членистоногие / SPECIES | 254–255; 4.3 | Пересмотрен сохранённый блок galatea / galathea: GBIF EXACT исправленного написания не снимает разночтение первичного каталога galatea Thieme 1881 / galathea auct. | T2; T5 |
| parnassius-loxias-tashkorensis | Parnassius loxias tashkorensis → не разрешено | членистоногие / SUBSPECIES | 266–267; 4.9 | Национальный подвид Parnassius loxias tashkorensis GBIF сводит к виду P. loxias; подвид нельзя заменить родительским видом без обоснования национального именного концепта. | T3 |
| parnassius-apollo-merzbacheri | Parnassius apollo merzbacheri → не разрешено | членистоногие / SUBSPECIES | 268–269; 4.10 | Национальный подвид Parnassius apollo merzbacheri GBIF сводит к P. apollo; родительский вид не является автоматической заменой. | T3 |
| papilio-alexanor-voldemar | Papilio alexanor voldemar → не разрешено | членистоногие / SUBSPECIES | 270–271; 4.11 | Двойной блок: GBIF сводит voldemar к P. alexanor; перечень указывает judeus, а книга на с.271 прямо отрицает достоверность judeus в Кыргызстане. Это конфликт двух источников, не синонимия и не два готовых кандидата. | T3 |
| megalodontes-kuznetzovi | Megalodontes kuznetzovi → не разрешено | членистоногие / SPECIES | 276–277; 4.14 | Сохранённый NONE для Megalodontes kuznetzovi; точный современный вид, варианты написания и первичная ревизия не установлены. | T2; T5 |
| polochrum-pamirepandum | Polochrum pamirepandum → не разрешено | членистоногие / SPECIES | 278–279; 4.15 | Сохранённый NONE для Polochrum pamirepandum; точное принятое имя и ключ не установлены. | T2; T3 |
| capoetobrama-kuschakewitschi-orientalis | Capoetobrama kuschakewitschi orientalis → не разрешено | рыбы / SUBSPECIES | 302–303; 6.5 | EXACT SYNONYM национального Capoetobrama kuschakewitschi orientalis ведёт к родительскому C. kuschakewitschi. Локальный подвид и родительский вид не смешиваются. | T2; T3 |
| schizothorax-issykkuli | Schizothorax issykkuli → не разрешено | рыбы / SPECIES | 308–309; 6.1 | Прежняя обработка Eschmeyer относит issykkuli к Schizothorax pseudoaksaiensis; национальную узкую концепцию нельзя автоматически расширить до принятого вида. | T1; T2 |
| diptychus-dybowskii-lansdelli | Diptychus dybowskii lansdelli → не разрешено | рыбы / SUBSPECIES | 310–311; 6.4 | Оба проверенных написания lansdelli/lansdellii не дали точного подвида. Родительский Diptychus dybowskii не подставляется. | T1; T2 |
| bufo-viridis | Bufo viridis → не разрешено | амфибии / SPECIES | 326–327; 5.1 | Национальный Bufo viridis — исторический комплекс. Сохранённая специализированная AMNH-сверка не подтверждает безусловную применимость Bufotes viridis s.str. к Кыргызстану. | T1; T2 |
| novoeumeces-schneideri-princeps | Novoeumeces schneideri princeps → не разрешено | рептилии / SUBSPECIES | 338–339; 5.7 | EXACT Eumeces schneiderii princeps найден ранее, но специализированная база отмечает парафилию и спорное деление; перечень называет более широкий E. schneideri. Местный концепт не разрешён. | T1; T2 |
| eryx-tataricus | Eryx tataricus → не разрешено | рептилии / SPECIES | 340–341; 5.10 | Пересмотрен прежний блок Eryx tataricus / E. miliaris: прежнее концептуальное противоречие не снято новыми данными. Прямой синоним GBIF не является разрешением. | T1; T2 |
| spalerosophis-diadema-schiraziana | Spalerosophis diadema schiraziana → не разрешено | рептилии / SUBSPECIES | 342–343; 5.8 | Точное исправленное schirazianus существует, но видовые/подвидовые трактовки в специализированной базе и родительский S. diadema в перечне требуют совместной сверки. | T1; T2 |
| falco-peregrinus | Falco peregrinus → не разрешено | птицы / SPECIES | 392–393; 3.2 | Falco peregrinus пересекается с национальным F. pelegrinoides, принятым GBIF как F. peregrinus pelegrinoides. Два непересекающихся современных таксона пока не подтверждены. | T1; T2 |
| falco-pelegrinoides | Falco pelegrinoides → не разрешено | птицы / SPECIES | 394–395; 3.37 | Falco pelegrinoides принят GBIF как подвид F. peregrinus; обе позиции имеют общий конфликт вида/подвида. Нельзя автоматически добавлять обе карточки. | T1; T2 |
| terpsiphone-paradisi | Terpsiphone paradisi → не разрешено | птицы / SPECIES | 470–471; 3.36 | Очерк называет местный leucogaster внутри Terpsiphone paradisi. EXACT родительского видового имени не заменяет сверку местного именного таксона и современных разделений комплекса. | T4 |
| rhinolophus-hipposideros | Phinolophus hipposideros → не разрешено | млекопитающие / SPECIES | 488–489; 2.15 | Исправлен род и найден EXACT Rhinolophus hipposideros, но книга описывает Iran–Turan subspecies, а MDD документирует выделение R. midas и изменение авторства. Нужна сверка местного подвида с современной ревизией. | T4; mdd-hipposideros; mdd-midas |
| otonycteris-hemprichi | Otonycteris hemprichi → не разрешено | млекопитающие / SPECIES | 492–493; 2.2 | EXACT Otonycteris hemprichii найден ранее, но принадлежность национального концепта к современным разделениям рода не установлена. Сохранённый блок не снимается исправлением i/ii. | T1; T2 |
| cuon-alpinus | Cuon alpinus → не разрешено | млекопитающие / SPECIES | 496–497; 2.14 | Сам национальный очерк с.497 сомневается в идентификации старых шкур. Историческое включение подтверждено, достоверность конкретных старых регистраций — нет; не допускается автоматически. | T5 |
| cervus-elaphus-asiaticus | Cervus elaphus asiaticus → не разрешено | млекопитающие / SUBSPECIES | 512–513; 2.3 | Национальный Cervus elaphus asiaticus — подвид; точный запрос NONE. Современный родительский вид или другой подвид марала без документированного именного перехода не назначается. | T4 |
| allactaga-saltator | Allactaga saltator → не разрешено | млекопитающие / SPECIES | 524–525; 2.25 | Прежний NONE Allactaga saltator; книга различает altorum и dementiewi. Изменения рода и современная принадлежность двух национальных подвидов не разрешены. | T1; T2 |

Ранее заблокированные Tulipa anadroma, Eryx tataricus, Pyrus asiae-mediae, Dictyophora duplicata, Sonjagaster coronatus, Cephalota galatea, рыбные и подвидовые комплексы пересмотрены по сохранённым основаниям и остаются B. Cuon alpinus не принят по одному факту включения в книгу: сам источник сомневается в старых определениях. Прежний блок Larus ichtyaetus снят только после сверки точного написания в национальном постановлении и двух точных ответов GBIF.

Anser indica, Vipera ursinii renardi, Kirgisobia bohnei и другие уже опубликованные кандидаты не предлагаются повторно. Прежнее исключение Hystrix indica как дубликата актуально: запись indian-crested-porcupine присутствует в релизе 150 и отражена в общей таблице.

## C — повтор и исключённые номера

| ID (предварительный) | Историческое → принятое имя | Группа / ранг книги | КК, страницы; П170 прил.стр. | Основание решения | Доп. источники |
| --- | --- | --- | --- | --- | --- |
| tulipa-rosea | Tulipa rosea → Tulipa korolkowii | растения / SPECIES | 92–93; 1.19 | Tulipa rosea — подтверждённый синоним уже опубликованного Tulipa korolkowii, тот же GBIF 5299568. Отдельная карточка дублировала бы таксон; национальный очерк и строка остаются в таблице источников. | T1; T2; powo-tulipa-rosea |

Исторически исключённые строки редакции 2009 сохранены отдельно. В каждой исходное научное имя **null**, причина — явная отметка об исключении №471/2009; это не основание удалить какую-либо нынешнюю карточку и не список новых видов.

| ID исходной строки | Группа | Приложение / номер | PDF страница | Латинское имя | Решение |
| --- | --- | --- | --- | --- | --- |
| decree-170-2009-1-3 | растения | 1 / 3 | 2 | не установлено | C: исторически исключённая строка |
| decree-170-2009-1-4 | растения | 1 / 4 | 2 | не установлено | C: исторически исключённая строка |
| decree-170-2009-1-10 | растения | 1 / 10 | 2 | не установлено | C: исторически исключённая строка |
| decree-170-2009-1-23 | растения | 1 / 23 | 3 | не установлено | C: исторически исключённая строка |
| decree-170-2009-1-35 | растения | 1 / 35 | 3 | не установлено | C: исторически исключённая строка |
| decree-170-2009-1-46 | растения | 1 / 46 | 4 | не установлено | C: исторически исключённая строка |
| decree-170-2009-1-53 | растения | 1 / 53 | 4 | не установлено | C: исторически исключённая строка |
| decree-170-2009-1-60 | растения | 1 / 60 | 5 | не установлено | C: исторически исключённая строка |
| decree-170-2009-1-80 | растения | 1 / 80 | 6 | не установлено | C: исторически исключённая строка |
| decree-170-2009-1-88 | растения | 1 / 88 | 6 | не установлено | C: исторически исключённая строка |
| decree-170-2009-1-94 | грибы | 1 / 94 | 6 | не установлено | C: исторически исключённая строка |
| decree-170-2009-1-95 | грибы | 1 / 95 | 6 | не установлено | C: исторически исключённая строка |
| decree-170-2009-2-9 | млекопитающие | 2 / 9 | 8 | не установлено | C: исторически исключённая строка |
| decree-170-2009-2-13 | млекопитающие | 2 / 13 | 8 | не установлено | C: исторически исключённая строка |
| decree-170-2009-2-23 | млекопитающие | 2 / 23 | 8 | не установлено | C: исторически исключённая строка |
| decree-170-2009-3-3 | птицы | 3 / 3 | 9 | не установлено | C: исторически исключённая строка |
| decree-170-2009-3-34 | птицы | 3 / 34 | 10 | не установлено | C: исторически исключённая строка |

## Разночтения национальных документов

183 связи получены по исходному имени либо альтернативе того же очерка; ещё 19 разобраны индивидуально. Документальная связь строки и очерка **не объявляет их современные видовые понятия тождественными**. В JSON для этих связей modernIdentityAsserted false; современная идентичность проверяется отдельно по карточке или решению кандидата.

| Книга | Перечень | Тип связи | Ограничение |
| --- | --- | --- | --- |
| Dictyocephalus attenuatus; с.39 | decree-170-2009-1-91 | documented_spelling | Dictyocephalus / Dictyocephalos; прежнее подтверждённое исправление рода. |
| Dictyophora duplicata; с.41 | decree-170-2009-1-93 | documentary_spelling | duplicata / duplicate; одинаковая позиция весёлки, но современная видовая концепция не разрешена. |
| Silene sussamyrica; с.105 | decree-170-2009-1-28 | documentary_spelling_not_taxonomic_proof | sussamyrica / susamyrense: соответствие национальных строк смолёвки суусамырской; самостоятельное доказательство синонимии этой опечатки отсутствует. |
| Sophora griffithii korolkowii; с.145 | decree-170-2009-1-50 | rank_and_name_conflict | Книга даёт Sophora griffithii ssp. korolkowii и Styphnolobium korolkowii; перечень Sophora korolkowii. Не приравнивается к предложенному GBIF S. japonicum. |
| Sonjagaster coronatus; с.251 | decree-170-2009-4-1 | named_taxon_rank_conflict | coronatus Morton 1916 в другом роде/ранге; не подтверждение современного Cordulegaster insignis целиком. |
| Cephalota galatea; с.255 | decree-170-2009-4-3 | unresolved_nomenclatural_spelling | galatea / galathea: разночтение остаётся B, не автоматический EXACT-допуск. |
| Papilio alexanor voldemar; с.271 | decree-170-2009-4-11 | contradictory_local_subspecies | Перечень называет judeus, книга voldemar и прямо считает указание judeus в Кыргызстане недостоверным (с.271). Идентичность подвидов не утверждается. |
| Novoeumeces schneideri princeps; с.339 | decree-170-2009-5-7 | broader_decree_concept | Книга — princeps, перечень — родительский Eumeces schneideri; локальная подвидовая идентичность не разрешена. |
| Spalerosophis diadema schiraziana; с.343 | decree-170-2009-5-8 | broader_decree_concept | Книга — schiraziana, перечень — Spalerosophis diadema; родительский вид не создаётся вместо национального подвида. |
| Vipera ursinii renardi; с.345 | decree-170-2009-5-9 | historical_local_concept_only | Vipera ursini в строке степной гадюки — историческое широкое имя; опубликованная запись относится к именному renardi, не ко всему современному V. ursinii. |
| Anser indica; с.361 | decree-170-2009-3-27 | historical_combination | Eulabeia indica / Anser indica / Anser indicus, горный гусь; используется ранее проверенная опубликованная запись. |
| Phoenicopterus ruber; с.373 | decree-170-2009-3-9 | explicit_local_named_subspecies | Книга прямо указывает местный P. ruber roseus; перечень P. roseus, точный принятый вид GBIF. Современный P. ruber не добавляется. |
| Aquila nipalensis; с.421 | decree-170-2009-3-44 | historical_local_concept_only | В строке «степной орёл» написано Aquila rapax; книга и существующая карточка относятся к A. nipalensis. Это не самостоятельное подтверждение современного A. rapax. |
| Vanellus gregarius; с.445 | decree-170-2009-3-6 | visually_corrected_transcription | На скане с.9, строка 6: Chettusia gregaria, а не grigna старой транскрипции. EXACT SYNONYM связывает gregaria с опубликованным Vanellus gregarius. Исходный старый файл не переписан. |
| Larus ichtyaetus; с.451 | decree-170-2009-3-49 | documented_spelling_and_combination | Larus ichthyaetus в перечне исправляет ichtyaetus книги; точный синоним и принятое Ichthyaetus ichthyaetus подтверждены GBIF. |
| Rhinolophus bocharicus; с.487 | decree-170-2009-2-5 | documentary_genus_spelling | Rinolophus / Rhinolophus bocharicus, бухарский подковонос; сохранены оба исходных написания. |
| Phinolophus hipposideros; с.489 | decree-170-2009-2-15 | unresolved_local_species_concept | Phinolophus / Rinolophus / Rhinolophus hipposideros; исправление рода не разрешает ревизию комплекса и местного подвида. |
| Otocolobus manul; с.507 | decree-170-2009-2-17 | historical_combination | Felis manul / Otocolobus manul, ранее подтверждённая связь опубликованной карточки. |
| Gazella subgutturoza; с.515 | decree-170-2009-2-7 | documented_spelling | subgutturoza / subgutturosa; документальная сверка уже выполнена при подготовке релиза 150. |

Важное уточнение транскрипции: на оригинальном скане постановления, **с.9, приложение 3, строка 6, написано Chettusia gregaria**, а не grigna из старого JSON. Новый EXACT SYNONYM ведёт к Vanellus gregarius, GBIF 5229138, совпадающему с действующей карточкой. Старый национальный список связан fingerprints прежних пакетов, поэтому не переписан; исправление сохранено отдельным полем transcriptionReview в новой инвентаризации. Это исправление источниковой транскрипции, не новая карточка.

Для Aquila rapax в строке «степной орёл» и Vipera ursini в строке степной гадюки сохраняется связь с национальным локальным очерком, но не утверждается самостоятельное подтверждение современных широких A. rapax или V. ursinii. Papilio alexanor judeus и voldemar связаны как **противоречащие** национальные указания, а не как доказанные синонимы; книга прямо отвергает достоверность местного judeus. Надёжно подтверждённого самостоятельного дополнительного таксона сверх очерков из этих строк не выведено.

## Реальный запас и предел расширения

**Документально доступный сейчас запас — 17 A**. После отдельной подготовки, проверки и нового разрешения это могло бы дать **167 записей**. Это не выполненный импорт и не оценка общего разнообразия страны.

При модели «не более одной карточки на национальный очерк» исходные 202 очерка минус подтверждённое объединение T. rosea/T. korolkowii дают **верхнюю рамку 201**. Текущая GBIF-модель F. pelegrinoides как подвида F. peregrinus не допускает две пересекающиеся карточки; при сохранении этой модели условная рамка снижается до **200**, то есть максимум 50 дополнительных карточек относительно 150.

**Достижение 200 не подтверждено**: 34 B могут содержать другие объединения, ошибки применения имён и недопустимые расширения. Точный достижимый максимум оставлен null. Если будет обоснован иной современный стандарт разделения соколов либо действительно самостоятельная позиция другого национального документа, рамка пересчитывается; число 200 не является обязательной квотой.

## План партий без искусственного допуска

Безусловной партии 20–25 сейчас нет: готовы к будущей подготовке только 17 A. Не следует начинать изготовление карточек или искать изображения до следующей отдельной задачи.

**Условная партия 1: 25 записей** — все 17 A плюс восемь резервов B ниже. Для минимальной партии 20 необходимо положительно разрешить хотя бы три резерва; для 25 — все восемь. До разрешения они остаются B, их допуск не гарантирован.

| Резерв B | Что должно быть решено |
| --- | --- |
| primula-macrocalyx | GBIF меняет национальный SPECIES Primula macrocalyx на SUBSPECIES Primula veris macrocalyx. Требуются явный выбор принятого ранга и проверка объёма национального очерка; P. veris целиком не подставляется. |
| terpsiphone-paradisi | Очерк называет местный leucogaster внутри Terpsiphone paradisi. EXACT родительского видового имени не заменяет сверку местного именного таксона и современных разделений комплекса. |
| dorema-microcarpum | POWO принимает Ferula namanganica как гомотипную замену Dorema microcarpum, GBIF выбирает Ferula microcarpum; POWO перечисляет только Узбекистан. Нужно согласовать валидное имя, ключ GBIF и национальный географический концепт. |
| berberis-kaschgarica | GBIF предлагает Berberis ulicina вместо национального B. kaschgarica; отдельная проверка соответствия национального именного концепта современному виду не выполнена. |
| sorbaria-olgae | GBIF объединяет Sorbaria olgae с S. tomentosa. Границы узкого национального таксона и расширенного принятого вида требуют источниковой сверки; нет основания автоматически расширять очерк. |
| vitis-usunachmatica | GBIF предлагает Vitis gmelinii; соответствие национального V. usunachmatica и современного видового концепта не подтверждено специальной обработкой. Нет автоматической подмены более широким виноградом. |
| rhinolophus-hipposideros | Исправлен род и найден EXACT Rhinolophus hipposideros, но книга описывает Iran–Turan subspecies, а MDD документирует выделение R. midas и изменение авторства. Нужна сверка местного подвида с современной ревизией. |
| otonycteris-hemprichi | EXACT Otonycteris hemprichii найден ранее, но принадлежность национального концепта к современным разделениям рода не установлена. Сохранённый блок не снимается исправлением i/ii. |

**Условная партия 2: 25 записей** — только после индивидуального положительного разрешения следующих B:

- dictyophora-duplicata
- tulipa-anadroma
- anemone-obtusiloba
- pyrus-asiae-mediae
- malus-niedzwetzkyana
- sophora-griffithii-korolkowii
- tianschaniella-umbellifera
- sonjagaster-coronatus
- cephalota-galathea
- parnassius-loxias-tashkorensis
- parnassius-apollo-merzbacheri
- papilio-alexanor-voldemar
- megalodontes-kuznetzovi
- polochrum-pamirepandum
- capoetobrama-kuschakewitschi-orientalis
- schizothorax-issykkuli
- diptychus-dybowskii-lansdelli
- bufo-viridis
- novoeumeces-schneideri-princeps
- eryx-tataricus
- spalerosophis-diadema-schiraziana
- falco-peregrinus
- cuon-alpinus
- cervus-elaphus-asiaticus
- allactaga-saltator

Falco pelegrinoides удержан как альтернатива F. peregrinus, а не 51-я новая независимая карточка при текущей модели. Если потребуется выбрать подвид вместо вида, план меняется отдельным решением. Партии 25+25 являются условным исследовательским планом; они не зарегистрированы в data:bulk и не содержат одобрений. При меньшем доказанном запасе партии уменьшаются, а не дополняются сомнительными видами.

## Полная таблица соответствий 150 опубликованных записей

Список содержит **все 150 ID** в порядке каталога. Книга: пара KY/RU страниц, исторический ранг. Постановление: приложение.номер в проверенной консолидированной копии. Дополнительный очерк T. rosea указан у T. korolkowii. Оговорки к разночтениям и широким историческим именам приведены выше; связь не расширяет существующую карточку до родительского вида.

| ID каталога | Имя каталога / GBIF | Книга: историческое имя, страницы, ранг | П170: приложение.строка |
| --- | --- | --- | --- |
| irbis | Panthera uncia; ключ не указан в прежней карточке | Uncia uncia (510–511; SPECIES) | 2.11 |
| argali | Ovis ammon; ключ не указан в прежней карточке | Ovis ammon (516–517; SPECIES) | 2.6 |
| manul | Otocolobus manul; ключ не указан в прежней карточке | Otocolobus manul (506–507; SPECIES) | 2.17 |
| golden-eagle | Aquila chrysaetos; ключ не указан в прежней карточке | Aquila chrysaetos (424–425; SPECIES) | 3.21 |
| bearded-vulture | Gypaetus barbatus; ключ не указан в прежней карточке | Gypaetus barbatus (402–403; SPECIES) | 3.22 |
| saker-falcon | Falco cherrug; ключ не указан в прежней карточке | Falco cherrug (388–389; SPECIES) | 3.16 |
| greigs-tulip | Tulipa greigii; ключ не указан в прежней карточке | Tulipa greigii (80–81; SPECIES) | 1.13 |
| kaufmanns-tulip | Tulipa kaufmanniana; ключ не указан в прежней карточке | Tulipa kaufmanniana (82–83; SPECIES) | 1.14 |
| sievers-apple | Malus sieversii; ключ не указан в прежней карточке | Malus sieversii (136–137; SPECIES) | 1.97 |
| central-asian-tortoise | Testudo horsfieldii; ключ не указан в прежней карточке | Agrionemys horsfieldi (330–331; SPECIES) | 5.3 |
| central-asian-frog | Rana asiatica; ключ не указан в прежней карточке | Rana asiatica (328–329; SPECIES) | 5.2 |
| predatory-bush-cricket | Saga pedo; ключ не указан в прежней карточке | Saga pedo (252–253; SPECIES) | 4.2 |
| dog-stinkhorn | Mutinus caninus; ключ не указан в прежней карточке | Mutinus caninus (42–43; SPECIES) | 1.92 |
| marbled-polecat | Vormela peregusna; ключ не указан в прежней карточке | Vormela peregusna (502–503; SPECIES) | 2.20 |
| black-stork | Ciconia nigra; ключ не указан в прежней карточке | Ciconia nigra (374–375; SPECIES) | 3.50 |
| ibisbill | Ibidorhyncha struthersii; ключ не указан в прежней карточке | Ibidorhyncha struthersii (442–443; SPECIES) | 3.38 |
| eduards-fritillary | Fritillaria eduardii; ключ не указан в прежней карточке | Fritillaria eduardii (74–75; SPECIES) | 1.11 |
| european-glass-lizard | Pseudopus apodus; gbif:2468350 | Pseudopus apodus (336–337; SPECIES) | 5.4 |
| dalmatian-pelican | Pelecanus crispus; gbif:2480353 | Pelecanus crispus (382–383; SPECIES) | 3.7 |
| eurasian-lynx | Lynx lynx; gbif:2435240 | Lynx lynx (508–509; SPECIES) | 2.19 |
| kolpakowskis-tulip | Tulipa kolpakowskiana; gbif:5299376 | Tulipa kolpakowskiana (84–85; SPECIES) | 1.15 |
| ostrowskis-tulip | Tulipa ostrowskiana; gbif:5299338 | Tulipa ostrowskiana (88–89; SPECIES) | 1.18 |
| pike-asp | Aspiolucius esocinus; gbif:2363766 | Aspiolucius esocinus (300–301; SPECIES) | 6.2 |
| turkestan-catfish | Glyptosternon reticulatum; gbif:2341221 | Glyptosternum reticulatum (312–313; SPECIES) | 6.3 |
| christophs-clouded-yellow | Colias christophi; gbif:5137697 | Colias christophi (264–265; SPECIES) | 4.8 |
| relict-spider | Tricholathys relicta; gbif:2144820 | Tricholathys relicta (248–249; SPECIES) | 4.18 |
| tien-shan-scutiger | Albatrellus tianschanicus; gbif:2551839 | Scutiger tianschanicus (44–45; SPECIES) | 1.90 |
| menzbiers-marmot | Marmota menzbieri; gbif:2437367 | Marmota menzbieri (518–519; SPECIES) | 2.22 |
| semenovs-fir | Abies sibirica semenovii; gbif:2685655 | Abies semenovii (60–61; SPECIES) | 1.1 |
| great-bustard | Otis tarda tarda; gbif:7191393 | Otis tarda (430–431; SPECIES) | 3.29 |
| said-alievs-toad-agama | Phrynocephalus saidalievi; gbif:10782470 | Phrynocephalus saidalievi (332–333; SPECIES) | 5.6 |
| vigorous-ground-beetle | Carabus validus; gbif:8881643 | Carabus validus (258–259; SPECIES) | 4.5 |
| pskem-onion | Allium pskemense; gbif:2856107 | Allium pskemense (70–71; SPECIES) | 1.7 |
| kostychevs-pasque-flower | Pulsatilla kostyczewii; gbif:3929258 | Pulsatilla kostyczewii (112–113; SPECIES) | 1.30 |
| indian-crested-porcupine | Hystrix indica; gbif:5219884 | Hystrix indica (520–521; SPECIES) | 2.10 |
| fergana-ground-beetle | Carabus ferghanicus; gbif:7630772 | Carabus ferghanicus (256–257; SPECIES) | 4.4 |
| giant-robber-fly | Satanas gigas; gbif:1661565 | Satanas gigas (272–273; SPECIES) | 4.12 |
| korzhinskys-pear | Pyrus korshinskyi; gbif:5363093 | Pyrus korshinskyi (132–133; SPECIES) | 1.40 |
| cinereous-vulture | Aegypius monachus; gbif:5229165 | Aegypius monachus (410–411; SPECIES) | 3.51 |
| egyptian-vulture | Neophron percnopterus; gbif:2480696 | Neophron percnopterus (404–405; SPECIES) | 3.45 |
| eminium-regelii | Eminium regelii; gbif:2867729 | Eminium regelii (62–63; SPECIES) | 1.2 |
| eremurus-zenaidae | Eremurus zenaidae; gbif:2778824 | Eremurus zenaidae (64–65; SPECIES) | 1.5 |
| eremurus-zoae | Eremurus zoae; gbif:2778815 | Eremurus zoae (66–67; SPECIES) | 1.6 |
| allium-dodecadontum | Allium dodecadontum; gbif:2857164 | Allium dodecadontum (68–69; SPECIES) | 1.9 |
| allium-semenovii | Allium semenovii; gbif:2857114 | Allium semenovii (72–73; SPECIES) | 1.8 |
| tulipa-affinis | Tulipa fosteriana; gbif:5299364 | Tulipa affinis (76–77; SPECIES) | 1.16 |
| tulipa-korolkowii | Tulipa korolkowii; gbif:5299568 | Tulipa korolkowii (86–87; SPECIES); Tulipa rosea (92–93; SPECIES) | 1.17; 1.19 |
| tulipa-platystemon | Tulipa platystemon; gbif:5299510 | Tulipa platystemon (90–91; SPECIES) | 1.21 |
| tulipa-tetraphylla | Tulipa tetraphylla; gbif:5299660 | Tulipa tetraphylla (94–95; SPECIES) | 1.22 |
| tulipa-zenaidae | Tulipa lehmanniana; gbif:5299646 | Tulipa zenaidae (96–97; SPECIES) | 1.20 |
| juno-orchioides | Iris orchioides; gbif:5298228 | Juno orchioides (98–99; SPECIES) | 1.24 |
| iridodictyum-kolpakowskianum | Iris kolpakowskiana; gbif:5299049 | Iridodictyum kolpakowskianum (100–101; SPECIES) | 1.25 |
| thesium-minkwitzianum | Chrysothesium minkwitzianum; gbif:3788694 | Thesium minkwitzianum (102–103; SPECIES) | 1.26 |
| delphinium-knorringianum | Delphinium knorringianum; gbif:3930642 | Delphinium knorringianum (108–109; SPECIES) | 1.31 |
| urocerus-sah | Urocerus sah; gbif:4492202 | Urocerus sah (274–275; SPECIES) | 4.13 |
| masaris-longicornis | Masaris longicornis; gbif:1312316 | Masaris longicornis (280–281; SPECIES) | 4.16 |
| varanus-griseus-caspius | Varanus griseus caspius; gbif:9553489 | Varanus griseus caspius (334–335; SUBSPECIES) | 5.5 |
| lyrurus-tetrix | Lyrurus tetrix; gbif:2473682 | Lyrurus tetrix (358–359; SPECIES) | 3.13 |
| cygnus-cygnus | Cygnus cygnus; gbif:2498347 | Cygnus cygnus (362–363; SPECIES) | 3.33 |
| aythya-nyroca | Aythya nyroca; gbif:2498259 | Aythya nyroca (364–365; SPECIES) | 3.18 |
| mergus-serrator | Mergus serrator; gbif:2498375 | Mergus serrator (366–367; SPECIES) | 3.28 |
| oxyura-leucocephala | Oxyura leucocephala; gbif:2498302 | Oxyura leucocephala (368–369; SPECIES) | 3.1 |
| gavia-arctica | Gavia arctica; gbif:2481959 | Gavia arctica (370–371; SPECIES) | 3.52 |
| ciconia-ciconia | Ciconia ciconia; gbif:2481912 | Ciconia ciconia (376–377; SPECIES) | 3.20 |
| platalea-leucorodia | Platalea leucorodia; gbif:2480801 | Platalea leucorodia (378–379; SPECIES) | 3.4 |
| pelecanus-onocrotalus | Pelecanus onocrotalus; gbif:2480350 | Pelecanus onocrotalus (380–381; SPECIES) | 3.35 |
| phalacrocorax-pygmaeus | Microcarbo pygmaeus; gbif:10095118 | Phalacrocorax pygmaeus (384–385; SPECIES) | 3.54 |
| falco-naumanni | Falco naumanni; gbif:9584698 | Falco naumanni (386–387; SPECIES) | 3.43 |
| falco-rusticolus | Falco rusticolus; gbif:8069880 | Falco rusticolus (390–391; SPECIES) | 3.5 |
| pandion-haliaetus | Pandion haliaetus; gbif:2480726 | Pandion haliaetus (396–397; SPECIES) | 3.41 |
| haliaeetus-leucoryphus | Haliaeetus leucoryphus; gbif:2480453 | Haliaeetus leucoryphus (398–399; SPECIES) | 3.12 |
| haliaeetus-albicilla | Haliaeetus albicilla; gbif:2480449 | Haliaeetus albicilla (400–401; SPECIES) | 3.11 |
| gyps-himalayensis | Gyps himalayensis; gbif:9561629 | Gyps himalayensis (406–407; SPECIES) | 3.42 |
| gyps-fulvus | Gyps fulvus; gbif:2480389 | Gyps fulvus (408–409; SPECIES) | 3.17 |
| circaetus-gallicus | Circaetus gallicus; gbif:2480666 | Circaetus gallicus (412–413; SPECIES) | 3.32 |
| circus-macrourus | Circus macrourus; gbif:2480491 | Circus macrourus (414–415; SPECIES) | 3.55 |
| neomys-fodiens | Neomys fodiens; gbif:2435767 | Neomys fodiens (484–485; SPECIES) | 2.18 |
| rhinolophus-bocharicus | Rhinolophus bocharicus; gbif:4266846 | Rhinolophus bocharicus (486–487; SPECIES) | 2.5 |
| barbastella-leucomelas | Barbastella leucomelas; gbif:2432581 | Barbastella leucomelas (490–491; SPECIES) | 2.1 |
| tadarida-teniotis | Tadarida teniotis; gbif:2433009 | Tadarida teniotis (494–495; SPECIES) | 2.26 |
| ursus-arctos | Ursus arctos; gbif:2433433 | Ursus arctos (498–499; SPECIES) | 2.4 |
| martes-foina | Martes foina; gbif:5218887 | Martes foina (500–501; SPECIES) | 2.12 |
| lutra-lutra | Lutra lutra; gbif:2433753 | Lutra lutra (504–505; SPECIES) | 2.21 |
| allactaga-elater | Allactaga elater; gbif:2439489 | Allactaga elater (522–523; SPECIES) | 2.16 |
| dictyocephalus-attenuatus | Dictyocephalos attenuatus; gbif:2530276 | Dictyocephalus attenuatus (38–39; SPECIES) | 1.91 |
| prionus-tschitscherini | Pogonarthron tschitscherini; gbif:1147213 | Prionus tschitscherini (260–261; SPECIES) | 4.6 |
| rossomyrmex-proformicarum | Rossomyrmex proformicarum; gbif:1319076 | Rossomyrmex proformicarum (282–283; SPECIES) | 4.17 |
| barbus-brachycephalus | Luciobarbus brachycephalus; gbif:2363090 | Barbus brachycephalus (304–305; SPECIES) | 6.6 |
| allochrusa-gypsophiloides | Acanthophyllum gypsophiloides; gbif:7267544 | Allochrusa gypsophiloides (106–107; SPECIES) | 1.27 |
| corydalis-pseudoadunca | Corydalis pseudoadunca; gbif:5531646 | Corydalis pseudoadunca (116–117; SPECIES) | 1.33 |
| fumariola-turkestanica | Fumariola turkestanica; gbif:3602966 | Fumariola turkestanica (118–119; SPECIES) | 1.96 |
| rhodiola-litwinowii | Rhodiola litwinowii; gbif:7552101 | Rhodiola litwinowii (122–123; SPECIES) | 1.36 |
| sibiraea-tianschanica | Sibiraea tianschanica; gbif:3032448 | Sibiraea tianschanica (124–125; SPECIES) | 1.41 |
| crataegus-knorringiana | Crataegus knorringiana; gbif:3015001 | Crataegus knorringiana (138–139; SPECIES) | 1.37 |
| ammopiptanthus-nanus | Ammopiptanthus nanus; gbif:2943139 | Ammopiptanthus nanus (146–147; SPECIES) | 1.47 |
| colutea-brachyptera | Colutea brachyptera; gbif:2956464 | Colutea brachyptera (148–149; SPECIES) | 1.49 |
| primula-eugeniae | Primula eugeniae; gbif:5640822 | Primula eugeniae (178–179; SPECIES) | 1.66 |
| physochlaina-alaica | Physochlaina alaica; gbif:3799874 | Physochlaina alaica (198–199; SPECIES) | 1.75 |
| incarvillea-olgae | Incarvillea olgae; gbif:4091178 | Incarvillea olgae (204–205; SPECIES) | 1.77 |
| saussurea-involucrata | Saussurea involucrata; gbif:5404194 | Saussurea involucrata (212–213; SPECIES) | 1.81 |
| silene-sussamyrica | Silene sussamyrica; gbif:8240880 | Silene sussamyrica (104–105; SPECIES) | 1.28 |
| iskandera-alaica | Iskandera alaica; gbif:3044433 | Iskandera alaica (120–121; SPECIES) | 1.34 |
| spiraeanthus-schrenkianus | Spiraeanthus schrenckianus; gbif:3853299 | Spiraeanthus schrenkianus (128–129; SPECIES) | 1.44 |
| chesneya-villosa | Chesneya villosa; gbif:5353648 | Chesneya villosa (150–151; SPECIES) | 1.48 |
| hedysarum-chaitocarpum | Hedysarum chaitocarpum; gbif:2960817 | Hedysarum chaitocarpum (152–153; SPECIES) | 1.51 |
| zygophyllum-kaschgaricum | Zygophyllum kaschgaricum; gbif:3987348 | Zygophyllum kaschgaricum (154–155; SPECIES) | 1.52 |
| sclerotiaria-pentaceros | Sclerotiaria pentaceros; gbif:3635755 | Sclerotiaria pentaceros (158–159; SPECIES) | 1.98 |
| bupleurum-rosulare | Bupleurum rosulare; gbif:3636584 | Bupleurum rosulare (164–165; SPECIES) | 1.56 |
| hyalolaena-intermedia | Hyalolaena intermedia; gbif:3640167 | Hyalolaena intermedia (166–167; SPECIES) | 1.57 |
| seseli-eryngioides | Seseli eryngioides; gbif:3631410 | Seseli eryngioides (168–169; SPECIES) | 1.59 |
| seseli-korshinskyi | Seseli korshinskyi; gbif:8119721 | Seseli korshinskyi (170–171; SPECIES) | 1.58 |
| cnidiocarpa-alaica | Cnidiocarpa alaica; gbif:3638564 | Cnidiocarpa alaica (172–173; SPECIES) | 1.61 |
| pastinacopsis-glacialis | Pastinacopsis glacialis; gbif:3634712 | Pastinacopsis glacialis (176–177; SPECIES) | 1.62 |
| kaufmannia-semenovii | Kaufmannia semenovii; gbif:8286447 | Kaufmannia semenovii (182–183; SPECIES) | 1.67 |
| acantholimon-compactum | Acantholimon compactum; gbif:4090676 | Acantholimon compactum (184–185; SPECIES) | 1.68 |
| scutellaria-andrachnoides | Scutellaria andrachnoides; gbif:5610043 | Scutellaria andrachnoides (186–187; SPECIES) | 1.73 |
| scutellaria-nepetoides | Scutellaria nepetoides; gbif:5608807 | Scutellaria nepetoides (188–189; SPECIES) | 1.74 |
| salvia-korolkowii | Salvia korolkowii; gbif:3898694 | Salvia korolkowii (194–195; SPECIES) | 1.71 |
| nathaliella-alaica | Nathaliella alaica; gbif:3737145 | Nathaliella alaica (202–203; SPECIES) | 1.99 |
| lonicera-paradoxa | Lonicera paradoxa; gbif:5599068 | Lonicera paradoxa (206–207; SPECIES) | 1.78 |
| campanula-eugeniae | Campanula eugeniae; gbif:5411287 | Campanula eugeniae (208–209; SPECIES) | 1.79 |
| lamyropappus-schakaptaricus | Lamyropappus schakaptaricus; gbif:3098608 | Lamyropappus schakaptaricus (210–211; SPECIES) | 1.84 |
| trichanthemis-aulieatensis | Trichanthemis aulieatensis; gbif:3150861 | Trichanthemis aulieatensis (218–219; SPECIES) | 1.82 |
| trichanthemis-aurea | Trichanthemis aurea; gbif:3150867 | Trichanthemis aurea (220–221; SPECIES) | 1.83 |
| lepidolopha-komarowii | Lepidolopha komarowii; gbif:5388509 | Lepidolopha komarowii (224–225; SPECIES) | 1.85 |
| barbus-capito-conocephalus | Luciobarbus conocephalus; gbif:11619334 | Barbus capito conocephalus (306–307; SUBSPECIES) | 6.7 |
| vipera-ursinii-renardi | Vipera renardi; gbif:8568628 | Vipera ursinii renardi (344–345; SUBSPECIES) | 5.9 |
| kirgisobia-bohnei | Kirgizobia bohnei; gbif:1157491 | Kirgisobia bohnei (262–263; SPECIES) | 4.7 |
| anser-indica | Anser indicus; gbif:2498035 | Anser indica (360–361; SPECIES) | 3.27 |
| accipiter-badius | Accipiter badius; gbif:2480610 | Accipiter badius (416–417; SPECIES) | 3.14 |
| aquila-clanga | Aquila clanga; gbif:2480509 | Aquila clanga (418–419; SPECIES) | 3.56 |
| aquila-nipalensis | Aquila nipalensis; gbif:2480513 | Aquila nipalensis (420–421; SPECIES) | 3.44 |
| aquila-heliaca | Aquila heliaca; gbif:2480500 | Aquila heliaca (422–423; SPECIES) | 3.8 |
| hieraaetus-fasciatus | Aquila fasciata; gbif:5844449 | Hieraaetus fasciatus (426–427; SPECIES) | 3.53 |
| hieraaetus-pennatus | Hieraaetus pennatus; gbif:2480685 | Hieraaetus pennatus (428–429; SPECIES) | 3.10 |
| tetrax-tetrax | Tetrax tetrax; gbif:5228228 | Tetrax tetrax (434–435; SPECIES) | 3.46 |
| crex-crex | Crex crex; gbif:4408498 | Crex crex (436–437; SPECIES) | 3.57 |
| anthropoides-virgo | Anthropoides virgo; gbif:2474936 | Anthropoides virgo (438–439; SPECIES) | 3.31 |
| burhinus-oedicnemus | Burhinus oedicnemus; gbif:2482100 | Burhinus oedicnemus (440–441; SPECIES) | 3.15 |
| vanellus-gregarius | Vanellus gregarius; gbif:5229138 | Vanellus gregarius (444–445; SPECIES) | 3.6 |
| glareola-nordmanni | Glareola nordmanni; gbif:2480758 | Glareola nordmanni (448–449; SPECIES) | 3.59 |
| strix-aluco | Strix aluco; gbif:9282206 | Strix aluco (464–465; SPECIES) | 3.40 |
| syrrhaptes-paradoxus | Syrrhaptes paradoxus; gbif:2480208 | Syrrhaptes paradoxus (452–453; SPECIES) | 3.39 |
| pterocles-alchata | Pterocles alchata; gbif:2480204 | Pterocles alchata (454–455; SPECIES) | 3.23 |
| pterocles-orientalis | Pterocles orientalis; gbif:2480193 | Pterocles orientalis (456–457; SPECIES) | 3.48 |
| columba-leuconota | Columba leuconota; gbif:5231842 | Columba leuconota (458–459; SPECIES) | 3.24 |
| columba-eversmanni | Columba eversmanni; gbif:2495464 | Columba eversmanni (460–461; SPECIES) | 3.26 |
| bubo-bubo | Bubo bubo; gbif:5959092 | Bubo bubo (462–463; SPECIES) | 3.47 |
| gazella-subgutturosa | Gazella subgutturosa; gbif:5220146 | Gazella subgutturoza (514–515; SPECIES) | 2.7 |
| dendrocopos-leucopterus | Dendrocopos leucopterus; gbif:2478035 | Dendrocopos leucopterus (466–467; SPECIES) | 3.19 |

## Научные ссылки и сохранённые свидетельства

- **T1** — [docs/evidence/redbook-master-taxonomy.json](../evidence/redbook-master-taxonomy.json). Дата и точный запрос указаны в taxonomyEvidence JSON; старые ответы не переписывались.
- **T2** — [docs/evidence/catalog-100-taxonomy.json](../evidence/catalog-100-taxonomy.json). Дата и точный запрос указаны в taxonomyEvidence JSON; старые ответы не переписывались.
- **T3** — [docs/evidence/catalog-150b-taxonomy.json](../evidence/catalog-150b-taxonomy.json). Дата и точный запрос указаны в taxonomyEvidence JSON; старые ответы не переписывались.
- **T4** — [docs/evidence/catalog-200-taxonomy.json](../evidence/catalog-200-taxonomy.json). Дата и точный запрос указаны в taxonomyEvidence JSON; старые ответы не переписывались.
- **T5** — [docs/evidence/catalog-150-taxonomy.json](../evidence/catalog-150-taxonomy.json). Дата и точный запрос указаны в taxonomyEvidence JSON; старые ответы не переписывались.

Дополнительно включены [54 прежних ответа пакета 125](../evidence/catalog-125-taxonomy.json) и [его аудит отбора](../evidence/catalog-125-selection-audit.json), включая исходное обоснование блока Pyrus asiae-mediae. Точные номера этих записей добавлены в taxonomyEvidence соответствующих кандидатов JSON; первоначальные дополнительные запросы не заменяют старые свидетельства.

Новые первичные номенклатурные уточнения сохранены в [catalog-200-source-review.json](../evidence/catalog-200-source-review.json):

- **powo-tulipa-rosea** — [Royal Botanic Gardens, Kew](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:543063-1). Tulipa rosea Vved. is treated as a synonym of Tulipa korolkowii; agrees with the previous exact GBIF synonym and the already published taxon key 5299568.
- **powo-hedlundia** — [Royal Botanic Gardens, Kew](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:77195028-1). Hedlundia persica accepted; Sorbus persica is a homotypic synonym. Kyrgyzstan is included in the distribution.
- **powo-prunus** — [Royal Botanic Gardens, Kew](https://powo.science.kew.org/taxon/730106-1). Prunus petunnikowii accepted; Amygdalus petunnikowii is a homotypic synonym. Kyrgyzstan is included.
- **msu-schrenkia-hebecarpa** — [Moscow State University Digital Herbarium](https://plant.depo.msu.ru/open/public/en/item/MW0593746). Type of Kosopoljanskia hebecarpa catalogued under accepted Schrenkia hebecarpa; country Kyrgyzstan. Used only for identity, not photograph preparation.
- **schrenkia-central-asia** — [Plant Diversity of Central Asia 1 (2022), 21–51; University of Helsinki repository](https://helda.helsinki.fi/server/api/core/bitstreams/4fafafb0-212f-40ce-b6be-8a2a11afff58/content). Page 43 gives the homotypic combination Schrenkia turkestanica = Kosopoljanskia turkestanica and distribution including Talas, Kyrgyzstan.
- **eriophyton-corrections** — [Sennikov, Lazkov, Uotila & Weber, Taxonomic corrections and new records in vascular plants of Kyrgyzstan (2011)](https://helda.helsinki.fi/server/api/core/bitstreams/a8938a1f-689d-4736-9f81-ea5dfbdd10ea/content). Documents Eriophyton anomalum as a new combination from Erianthera anomala, discusses the former Alajja concepts and Kyrgyz specimens. No extra taxon is created for the alternative genera.
- **powo-moluccella** — [Royal Botanic Gardens, Kew](https://powo.science.kew.org/taxon/77112830-1). Moluccella olgae accepted, with Otostegia schennikovii a heterotypic synonym. The accepted range includes Kyrgyzstan and Tajikistan. A future card must restrict historical descriptions to the national named concept.
- **powo-salvia** — [Royal Botanic Gardens, Kew](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:457526-1). Salvia vvedenskii Nikitina accepted; original publication Flora Kirgizskoi SSR 10:377 (1962), range Kyrgyzstan. National Salvia vvedenskyi E. Nikit. is reconciled by the same author and a subsequent exact GBIF query, not by fuzzy matching alone.
- **powo-rhaponticum** — [Royal Botanic Gardens, Kew](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:241384-1). Rhaponticum aulieatense accepted by POWO; Leuzea aulieatensis and Stemmacantha aulieatensis are homotypic alternatives. GBIF chooses Leuzea; the genus preference differs but the named species and rank are linked explicitly. The national account itself gives Rhaponticum as an alternative.
- **powo-richteria** — [Royal Botanic Gardens, Kew](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:241476-1). Richteria leontopodium accepted; Pyrethrum leontopodium a homotypic synonym; distribution includes Kyrgyzstan.
- **powo-ferula** — [Royal Botanic Gardens, Kew](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:77331188-1). Dorema microcarpum is a homotypic synonym of Ferula namanganica in POWO, whereas the GBIF response chooses Ferula microcarpum. POWO lists Uzbekistan only. Preferred valid name, GBIF linkage and the national geographic concept need a combined review; retained in B.
- **mdd-hipposideros** — [American Society of Mammalogists; Mammal Diversity Database](https://www.mammaldiversity.org/taxon/1004693/). Rhinolophus hipposideros previously included R. midas; current authorship is André 1797 rather than the commonly cited Bechstein dates. Exact GBIF spelling alone cannot settle the national account's Iran–Turan subspecies concept.
- **mdd-midas** — [American Society of Mammalogists; Mammal Diversity Database](https://www.mammaldiversity.org/taxon/1006733/). Rhinolophus midas is split from R. hipposideros, with Iran and Oman in its country list; cites Benda et al. 2023, DOI 10.3161/15081109ACC2022.24.2.001. No automatic transfer of Kyrgyz records to either species.

Прежние научные конфликты и библиография повторно использованы из [аудита needs_evidence](../evidence/catalog-100-needs-evidence-audit.json), [решений отбора 150](../evidence/catalog-150-selection-decisions.json) и [отбора двух дополнений](../evidence/catalog-150b-selection-decisions.json). Для B сохранены указатели на прежние квитанции научных источников. Прямой API POWO возвратил защитную страницу; обход не выполнялся, использован доступный первичный текст страниц через web. Фотографии не загружались и не исследовались.

## Проверки и сохранность

- Отдельный валидатор: **421 уникальная исходная позиция**, полное покрытие всех исходных записей и 150 опубликованных ID; ссылки, классы, отсутствие A-дубликатов, исключённые строки и условные партии согласованы.
- **npm test: 315/315**, ошибок 0.
- **npm run data:validate: успешно**, 620 ключей × 4 языка, каталог 150, архив 2.
- **npm run build: успешно**, 104 модуля, source/public/dist по 150 записей.
- Исходные и публичные объекты 150 записей побайтно/структурно совпадают с базовым релизом; прежние материалы, черновики, manifest и изображения не переписывались. [Контроль сохранности](../evidence/catalog-200-preservation.json) проверяет все 943 ранее отслеживаемых файла; единственное предусмотренное изменение старого файла — .gitattributes с LF-правилами только для новых catalog-200 JSON. Производственный код не изменён.
- Новая [инвентаризация JSON](../../data/research/catalog-200-inventory.json) содержит все 421 исходную строку/очерк, 150 соответствий, 52 решения, архив и доказательства с контрольными суммами. Проверка: node scripts/validate-catalog-200-inventory.mjs.

Коммит этой инвентаризации определяется git log -1 -- docs/research/catalog-200-inventory.md и сообщается в итоговом ответе. Финальная проверка Git выполняется после коммита.

Provisional import, approve, apply, merge, push и deployment не выполнялись. Новых публичных карточек, длинных описаний и фотопакетов нет. Работа остановлена после завершения инвентаризации.
