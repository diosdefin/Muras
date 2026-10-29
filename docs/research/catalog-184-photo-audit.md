# MURAS №26.1 — аудит изображений каталога 184

Дата: **2026-10-28**, Asia/Bishkek. Ветка **feature/release-preparation**, исходный HEAD **ef042660dc785f89ecb106f1494a3079972c7dd1**, исходное дерево **clean**. Подтверждены **184** опубликованные записи и **2** архивные записи. Изменены только результаты этого аудита; импорт и замена изображений не выполнялись.

**Изображение есть у 146/184 записей (79,35%); placeholder — у 38/184 (20,65%).** Из 146 изображений: **106 фотографий** (в том числе **4 музейных**), **39 гербарных изображений** и **1 историческая научная иллюстрация**. Всего изображений фотографического происхождения, если отдельно включить гербарии, — **145**. Наличие WebP само по себе не является критерием фотографии. Среди 102 остальных фотографий не заявляется, что каждый организм был живым или снят в природе.

Полный машиночитаемый результат: [data/research/catalog-184-photo-audit.json](../../data/research/catalog-184-photo-audit.json). В records ровно 184 строки; для каждого опубликованного изображения сохранены автор/правообладатель, originalPage, лицензия и URL, атрибуция, изменения, исходный и публичный путь, размеры, байты, SHA-256, результат декодирования, предмет изображения и ссылки на конкретные сохранённые доказательства. Исходная структура image metadata не изменена.

## Метод и границы проверки

Проверены канонический source, публичная проекция и архив; каждый selected image сопоставлен по SHA-256 либо точной странице источника с прежними receipt/metadata. Использованы **57 файлов доказательств**, прежде всего commons-photos, species-photo-preparation, task23-photo-images, catalog-100-photo-final-updates и блоки catalog-125/150/167/181/187. Для ранних файлов дополнительно прочитаны локальные кэши task18/task19; относящиеся к выбранному файлу сведения о странице, описании, авторе и лицензии извлечены в JSON, с SHA-256 кэша. Локальный кэш не выдаётся за новую загрузку первоисточника; неизвестная дата доступа остаётся null.

- Для всех **146** выбранных файлов проверены фактический WebP-контейнер, размеры, SHA-256, отсутствие EXIF/XMP, полнота лицензии и соответствие её URL. Хеш каждой публичной копии совпал с исходным.
- Pillow **11.1.0** полностью декодировал **292 файла**: 146 исходных WebP и 146 публичных копий. Ошибок декодирования нет. В public/images/approved ровно 146 файлов; пропавших, лишних и повторных SHA-256 нет.
- Все 146 изображений просмотрены на трёх контактных листах. Это позволяет проверить класс медиа и явный предмет изображения; не заменяет чтение каждой этикетки в полном разрешении и независимую таксономическую экспертизу. Типы гербарий/музей/рисунок определены совместно по пикселям, подписи и прежним доказательствам, а не по расширению.
- Проверка соответствия таксону документальная: точная подпись источника, ваучер/номер образца, сохранённое научное решение и оговорки каталога. Самостоятельная переидентификация всех организмов не заявляется. В JSON разделены documentedSubjects и independentTaxonomicDetermination:false.
- Установленные ограничения сохранены. Фотография зарубежного организма, зоопарка, гербарный лист или музейный экземпляр не становится свидетельством современной популяции Кыргызстана.

Нового массового поиска фотографий не было. В интернете сверены только официальные правила источников и документация responsive images; поисковые ссылки в плане не означают, что изображение найдено или разрешено.

## Распределение по группам

Фотографии в таблице включают музейные снимки, но не гербарии и рисунок.

| Группа | Всего | С изображением | Фотография | Гербарий | Научная иллюстрация | Placeholder |
|---|---|---|---|---|---|---|
| Млекопитающие | 22 | 18 | 17 | 0 | 1 | 4 |
| Птицы | 55 | 54 | 54 | 0 | 0 | 1 |
| Растения | 76 | 61 | 22 | 39 | 0 | 15 |
| Пресмыкающиеся | 6 | 4 | 4 | 0 | 0 | 2 |
| Земноводные | 1 | 1 | 1 | 0 | 0 | 0 |
| Членистоногие | 14 | 5 | 5 | 0 | 0 | 9 |
| Грибы | 3 | 2 | 2 | 0 | 0 | 1 |
| Рыбы | 7 | 1 | 1 | 0 | 0 | 6 |
| **Всего** | **184** | **146** | **106** | **39** | **1** | **38** |

Четыре подтверждённые музейные фотографии: **christophs-clouded-yellow** (Colias, экземпляр), **rossomyrmex-proformicarum** (AntWeb CASENT0178514), **accipiter-badius** (яйца), **numenius-tenuirostris** (skin specimen ZMA.AVES.1670). Гербарии не выдаются за живые растения. Единственный рисунок — **barbastella-leucomelas**, историческая таблица 28b, 1826–1828.

## Обнаруженные ограничения и проблемы

**Повреждённых публичных файлов, несовпавших размеров/SHA-256 и технически неполных опубликованных лицензий не обнаружено.** Это не повторное независимое заключение о каждой исторической лицензии; проверка опирается на сохранённые документы конкретных файлов.

1. **Непубличная legacy-ссылка irbis.** В каноническом массиве есть второй старый JPEG без подтверждённых автора/лицензии и SHA-256. Это один из 147 исходных image-объектов, но он правильно исключён canPublishImage; опубликованы 146 изображений. Старый JPEG не удалён и не опубликован.
2. **Определение и региональные концепты.** У eurasian-lynx снимок Lynx lynx из шведского зоопарка не доказывает L. l. isabellinus; у barbastella-leucomelas национальный концепт требует проверки; у eduards-fritillary уже записана необходимость ботанической проверки. Эти оговорки нельзя терять при будущей замене. Новая экспертиза не проведена и ошибки не «исправлялись» догадкой.
3. **Тип медиа не структурирован в модели.** Действующая функция speciesPhoto выбирает любое разрешённое изображение. Часть общих подписей/alt использует термин «фото» даже для исторического рисунка или гербария; подробные русские подписи разграничивают типы. Исправление модели/UI — возможная отдельная задача, не часть этого аудита.
4. **Оговорки подписей доступны по-русски.** Все 146 media имеют RU-подпись; отдельных KY/UZ/EN-подписей нет. Это не ошибка схемы: общие названия и краткие описания карточек проходят четыре языка. Для будущей работы полезен перевод именно оговорок о гербарии, музее и происхождении, без изменения научных фактов.
5. **Credit не всегда имя фотографа.** Для части гербарных и музейных файлов авторская строка честно обозначает учреждение/правообладателя, а фотограф неизвестен. Нельзя выдумывать человека; сохранять роль credit и номер экземпляра.
6. **giant-robber-fly.** Сохранённое наблюдение определено как Satanas gigas, но способ съёмки/живое состояние насекомого не установлены. HUMAN_OBSERVATION не доказывает, что это фотография живого организма. Учтён как фотография с такой оговоркой.
7. **Производительность.** Отдельных размеров и миниатюр нет; даже небольшая карточка/карта получает тот же WebP, что и подробная страница. Подробнее ниже.

## Полный перечень 38 placeholder и направления поиска

Для каждой строки в JSON есть три отдельные поисковые ссылки: **Wikimedia Commons**, **GBIF** (сначала точный таксон/ранг, затем медиа), **iNaturalist**. Четвёртое направление — перечисленные ниже научные/университетские коллекции, гербарии и музеи. Это возможные направления; наличие экземпляра и доступной лицензии в указанном учреждении этим аудитом не подтверждено. Для LE01013870 и ранее найденных ваучеров приведены сохранённые ориентиры из прежних задач.

**A — 3:** предварительно высокая вероятность на уровне принятого видового названия; не проверенная текущим поиском доступность, не гарантия прав или локальной формы. **B — 20:** приоритет точных экземпляров, гербариев и коллекционного поиска. **C — 15:** существенный конфликт прав/определения, редкий точный ранг или необходимость специалиста/правообладателя. Категории основаны на прежних результатах и характере препятствий, без числовой выдуманной вероятности.

### Млекопитающие — 4

| ID | Научное имя в каталоге | Приоритет | Точная задача поиска / препятствие | Коллекции и дополнительные источники |
|---|---|---|---|---|
| `menzbiers-marmot` | Marmota menzbieri | **C** | Ранее подходящие снимки имели CC BY-NC; автоматическое повторное использование этим pipeline не разрешено. | Правообладатели ранее найденных фото; специалисты по Marmota и зоологические коллекции. |
| `otonycteris-hemprichi` | Otonycteris leucophaea | **B** | Проверять Otonycteris leucophaea; не переносить фото O. hemprichii без документированной идентичности. | Хироптерологические коллекции ЗИН/NHM и профильный специалист. |
| `cervus-elaphus-asiaticus` | Cervus canadensis | **A** | Широкий принятый вид Cervus canadensis предварительно перспективен; общее видовое фото допустимо только с честной подписью без доказательства местной формы asiaticus. | Commons, GBIF/iNaturalist; музейные коллекции для исторической формы. |
| `allactaga-saltator` | Orientallactaga sibirica | **B** | Нужен Orientallactaga sibirica; не подменять другими Allactaga и не приписывать фото историческому saltator без основания. | Зоологические коллекции грызунов ЗИН, университетские коллекции. |

### Птицы — 1

| ID | Научное имя в каталоге | Приоритет | Точная задача поиска / препятствие | Коллекции и дополнительные источники |
|---|---|---|---|---|
| `terpsiphone-paradisi` | Terpsiphone paradisi leucogaster | **B** | Нужна документированная подвидовая идентификация Terpsiphone paradisi leucogaster; видового ключа недостаточно. | Орнитологические коллекции NHM/ЗИН; наблюдения с точным подвидовым определением. |

### Растения — 15

| ID | Научное имя в каталоге | Приоритет | Точная задача поиска / препятствие | Коллекции и дополнительные источники |
|---|---|---|---|---|
| `delphinium-knorringianum` | Delphinium knorringianum | **C** | Известный лист LE без установленной лицензии конкретного изображения. | Гербарий LE, сектор Средней Азии; куратор и правообладатель скана. |
| `crataegus-knorringiana` | Crataegus knorringiana | **C** | Ранее фото CC BY-NC; KOR13264 требует проверки прав и определения. | Гербарий KOR / RCIN; правообладатель снимка и специалист Crataegus. |
| `primula-eugeniae` | Primula eugeniae | **C** | Сохранён конфликт: GBIF CC BY-SA против all rights reserved у Digitarium; не считать разрешённым. | Гербарий H / Luomus, University of Helsinki; Digitarium / University of Eastern Finland. |
| `iskandera-alaica` | Iskandera alaica | **B** | Ограниченный прежний поиск не дал одновременно права и определение; перспективнее типовые/гербарные листы. | Гербарии LE, MW, TASH и научные ботанические коллекции. |
| `sclerotiaria-pentaceros` | Sclerotiaria pentaceros | **C** | Национальный очерк предупреждает о сомнительных сборах; нужен проверенный тип/ваучер и специалист. | Типовые коллекции LE/MW; специалист Apiaceae и правообладатель скана. |
| `scutellaria-nepetoides` | Scutellaria nepetoides | **B** | В прошлой ограниченной выборке подходящий файл не установлен. | Гербарии MW, LE, TASH; ботаник по Scutellaria. |
| `lonicera-paradoxa` | Lonicera paradoxa | **B** | Нужна точная этикетка/определение; прежний ограниченный поиск отрицательный. | Гербарии MW, LE, TASH, K и университетские коллекции. |
| `campanula-eugeniae` | Campanula eugeniae | **B** | Нужен точный гербарный или полевой ваучер с правами. | Гербарии MW, LE, TASH, K; специалист Campanulaceae. |
| `sorbus-persica` | Hedlundia persica | **B** | Известные медиа CC BY-NC; открытый гербарный материал нужно искать по Hedlundia persica и подтверждённой синонимии. | Гербарии MW, LE, TASH, K; специалист Sorbus/Hedlundia. |
| `otostegia-schennikovii` | Moluccella olgae | **C** | Фото широкого Moluccella olgae не доказывает узкий исторический O. schennikovii; прежний результат изображал сообщество. | Типовой гербарий и специалист Lamiaceae; подтверждение исторического концепта и прав. |
| `centaurea-alaica` | Rhaponticoides alaica | **B** | Прежний ограниченный поиск отрицательный; нужна точная этикетка Rhaponticoides alaica. | Гербарии MW, LE, TASH и типовые ботанические коллекции. |
| `berberis-kaschgarica` | Berberis ulicina | **B** | Проверять Berberis ulicina и документированную связь исторического названия; не принимать любой похожий барбарис. | Гербарии MW, LE, K; специалист Berberis. |
| `sorbaria-olgae` | Sorbaria tomentosa | **A** | На уровне принятого Sorbaria tomentosa поиск предварительно перспективен; фото широкого вида не удостоверяет местную форму olgae. | Commons, ботанические сады, GBIF/iNaturalist; гербарий для исторической формы. |
| `dorema-microcarpum` | Ferula namanganica | **B** | Нужен Ferula namanganica с документированной связью Dorema microcarpum; не использовать похожие Ferula. | Гербарии LE, MW, TASH, K; специалист Apiaceae. |
| `tianschaniella-umbellifera` | Tianschaniella umbellulifera | **B** | Проверять Tianschaniella umbellulifera и тип; не подставлять похожие зонтичные. | Тип LE01013870 как поисковый ориентир из подготовленного пакета; гербарий LE, права на конкретный скан проверяются заново. |

### Пресмыкающиеся — 2

| ID | Научное имя в каталоге | Приоритет | Точная задача поиска / препятствие | Коллекции и дополнительные источники |
|---|---|---|---|---|
| `vipera-ursinii-renardi` | Vipera renardi | **A** | Предварительно перспективен поиск на уровне принятого вида Vipera renardi; прежние находки ещё не прошли весь аудит. Не использовать другие Vipera ursinii. | Commons, GBIF/iNaturalist; при спорном определении герпетологические коллекции. |
| `eryx-tataricus` | Eryx miliaris | **B** | Связь исторического tataricus с Eryx miliaris требует сохранения оговорок; ошибочное определение внешне сходного удавчика недопустимо. | Герпетологические коллекции ЗИН и научные университетские коллекции. |

### Членистоногие — 9

| ID | Научное имя в каталоге | Приоритет | Точная задача поиска / препятствие | Коллекции и дополнительные источники |
|---|---|---|---|---|
| `relict-spider` | Tricholathys relicta | **C** | Нет открытых прав на рисунки первоописания; Tricholathys relictoides относится к другому виду. | Арахнологические коллекции ЗИН; правообладатель первоописания / Tethys Entomological Research. |
| `vigorous-ground-beetle` | Carabus validus | **C** | У конкретных галерейных фото свободная лицензия не подтверждена. | Carabidae.org и коллекции Carabidae ЗИН; запрос разрешения и точного определения. |
| `fergana-ground-beetle` | Carabus ferghanicus | **C** | У известной галереи Copyright без открытой лицензии. | Коллекция Gorodinski / правообладатель; коллекции Carabidae ЗИН. |
| `masaris-longicornis` | Masaris longicornis | **C** | Открытый доступ к рисунку не подтверждает лицензию; ранее notspecified/restricted. | Зоологические коллекции и авторы ревизии Masaris; издатель/правообладатель рисунка. |
| `prionus-tschitscherini` | Pogonarthron tschitscherini | **C** | Ранее найдены CC BY-NC либо файлы без явной открытой лицензии. | Коллекции Cerambycidae; фотограф и правообладатель; поиск Pogonarthron tschitscherini. |
| `kirgisobia-bohnei` | Kirgizobia bohnei | **C** | Ранее нет точного Commons/GBIF-медиа; редкий таксон требует специалиста. | Энтомологические коллекции Кыргызстана и ЗИН; авторы первоописания Kirgizobia. |
| `sonjagaster-coronatus` | Thecagaster coronata | **B** | Нужен подтверждённый Thecagaster coronata; историческое родовое имя требует документированной связи. | Одонатологические музейные/университетские коллекции, ЗИН. |
| `parnassius-loxias-tashkorensis` | Parnassius loxias loxias | **B** | Нужна точная номинативная форма P. loxias loxias по принятому решению; общий P. loxias другого подвида недостаточен. | Музейные коллекции Lepidoptera ННПМ НАН Украины/ЗИН и авторы профильных ревизий. |
| `parnassius-apollo-merzbacheri` | Parnassius apollo merzbacheri | **C** | Точный подвид merzbacheri, не любой P. apollo; вероятно понадобятся специалист и коллекционный экземпляр. | Типовые коллекции Parnassius и специалист; кураторы Lepidoptera ЗИН/ННПМ НАН Украины. |

### Грибы — 1

| ID | Научное имя в каталоге | Приоритет | Точная задача поиска / препятствие | Коллекции и дополнительные источники |
|---|---|---|---|---|
| `tien-shan-scutiger` | Albatrellus tianschanicus | **C** | Ранее обнаружены спорные определения и отсутствие открытой лицензии; исключить A. flettii. | HKAS/BJFC, авторы ревизии Albatrellus и миколог. |

### Рыбы — 6

| ID | Научное имя в каталоге | Приоритет | Точная задача поиска / препятствие | Коллекции и дополнительные источники |
|---|---|---|---|---|
| `pike-asp` | Aspiolucius esocinus | **B** | Нужны первичный рисунок/скан или точный музейный экземпляр; найденный ранее журнал поступлений не изображает рыбу. | Ихтиологические коллекции NHM London; первоиздание Кесслера 1874; ETYFish как указатель, не разрешение. |
| `turkestan-catfish` | Glyptosternon reticulatum | **C** | NRM40236 без явной лицензии медиа; снимки G. oschanini не заменяют G. reticulatum. | Swedish Museum of Natural History (NRM), ихтиолог и правообладатель конкретного файла. |
| `barbus-capito-conocephalus` | Luciobarbus conocephalus | **B** | Потенциальные изображения ранее не прошли совместную проверку первичного файла, таксона и прав. | Ихтиологические коллекции NRM/NHM/ЗИН; искать Luciobarbus conocephalus и документированные исторические имена. |
| `capoetobrama-kuschakewitschi-orientalis` | Capoetobrama kuschakewitschi | **B** | Проверять принятый вид и историческую orientalis; общий видовой снимок не подтверждает местную форму. | Ихтиологические коллекции NHM/NRM/ЗИН и научные ревизии с лицензированными рисунками. |
| `schizothorax-issykkuli` | Schizothorax pseudoaksaiensis | **B** | Принятое Schizothorax pseudoaksaiensis связано с историческим концептом issykkuli; нужна явная подпись, без утверждения локальной популяции. | Ихтиологические коллекции Кыргызстана, ЗИН, NRM; GBIF после сверки концепта. |
| `diptychus-dybowskii-lansdelli` | Gymnodiptychus dybowskii | **B** | Не смешивать общий Gymnodiptychus dybowskii с недоказанной исторической формой lansdelli. | Ихтиологические коллекции и специалисты Central Asian Cyprinidae. |

Ранее отрицательные поиски в JSON снабжены локальными ссылками, статусами и известными датами. Их счётчики не объявляются современным полным числом изображений в интернете. Не повторять одинаковые запросы без изменения имени/источника/лицензионной ситуации. Отдельно сохранять конфликт Digitarium/Primula, возможные чужие Glyptosternon и точный ранг Parnassius/Terpsiphone.

## План двух партий

Рекомендуемый размер первой партии — **19 таксонов для ограниченного поиска**. Это не обязательство подготовить ровно 19 пригодных изображений.

**Партия 1: 3 A + 16 B.** Начать с трёх принятых видовых концептов и точных гербарных/коллекционных направлений, для которых уже определён следующий шаг. Сложные исторические формы, неразрешённые права и часть подвидовых определений отложены. Состав:

- `vipera-ursinii-renardi`
- `cervus-elaphus-asiaticus`
- `sorbaria-olgae`
- `iskandera-alaica`
- `scutellaria-nepetoides`
- `lonicera-paradoxa`
- `campanula-eugeniae`
- `sorbus-persica`
- `centaurea-alaica`
- `berberis-kaschgarica`
- `dorema-microcarpum`
- `tianschaniella-umbellifera`
- `eryx-tataricus`
- `allactaga-saltator`
- `otonycteris-hemprichi`
- `sonjagaster-coronatus`
- `barbus-capito-conocephalus`
- `pike-asp`
- `parnassius-loxias-tashkorensis`

**Партия 2: 4 B + 15 C, всего 19.** Сначала уточнить точные концепты четырёх B; для C подготовить перечень конкретных ваучеров, файлов и вопросов специалистам/правообладателям. Запросы никому не отправлялись. Состав:

- `capoetobrama-kuschakewitschi-orientalis`
- `schizothorax-issykkuli`
- `diptychus-dybowskii-lansdelli`
- `terpsiphone-paradisi`
- `turkestan-catfish`
- `relict-spider`
- `tien-shan-scutiger`
- `menzbiers-marmot`
- `vigorous-ground-beetle`
- `fergana-ground-beetle`
- `delphinium-knorringianum`
- `masaris-longicornis`
- `prionus-tschitscherini`
- `crataegus-knorringiana`
- `primula-eugeniae`
- `sclerotiaria-pentaceros`
- `kirgisobia-bohnei`
- `otostegia-schennikovii`
- `parnassius-apollo-merzbacheri`

Внутри каждой будущей партии идти небольшими блоками 4–5 файлов: поиск → точное имя/ранг/синоним → чтение первичной страницы и лицензии **конкретного медиа** → документирование автора, creditRole, номера экземпляра и исходных размеров/hash → визуальный просмотр → локальный WebP существующим pipeline → контроль полного неизменного научного объекта. Сохранять placeholder, если любой этап не пройден. Фото вида/родителя/другого подвида не выдавать за нужный таксон. Для широких принятых видов A нельзя обещать, что снимок показывает историческую кыргызстанскую форму; такая фотография требует честной подписи.

## Правила лицензий и WebP

Текущий canPublishImage требует licenseVerified:true, path, author, originalPage, license, licenseUrl, attribution и массив modifications. build-data публикует только прошедшие этот фильтр изображения; принадлежность файла к Commons/GBIF сама по себе его не заменяет.

- [Commons](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia): проверять условия конкретной страницы, автора и выбранной лицензии; соблюдать атрибуцию и ShareAlike там, где он требуется.
- [GBIF](https://techdocs.gbif.org/en/data-publishing/multimedia-publishing): медиа размещаются у поставщиков; лицензия изображения может отличаться от лицензии occurrence. Нужны media-level сведения и исходная страница, а не только общий dataset license.
- [iNaturalist](https://help.inaturalist.org/en/support/solutions/articles/151000169918-can-i-use-the-photos-and-sounds-that-are-posted-on-inaturalist-): права принадлежат авторам; лицензия каждого photo проверяется отдельно. CC BY-NC по умолчанию не входит в существующий разрешённый автоматический путь MURAS.

Новые файлы: документированные CC BY/CC BY-SA 2.0–4.0, CC0 либо отдельно поддержанные Public domain/Apache 2.0 с нужными доказательствами и уведомлениями. NC, ND, отсутствующая лицензия и просто открытый доступ не становятся разрешением этого pipeline. Исторические написания CC0 1.0/CC0, http/https и завершающие slash сопоставлены только внутри аудита; существующие метаданные не переписаны. Apache LICENSE/NOTICE проверены по SHA-256.

Штатный scripts/process_data.py optimize_image: качество по умолчанию **82**, max-edge по умолчанию **1200**, допустимы **256–2400**; в подготовленных пакетах часто выбран **1800**. Без апскейла, сохранение пропорций, EXIF-transpose, RGB WebP; SHA-256 и размеры результата записываются в metadata. Фото не публикуется одним вызовом оптимизатора. Для гербариев сохранять полный доступный оригинал вне public, номер/этикетку и видимую подпись; уменьшенная карточка не заменяет исследовательский исходник. Оптимизация или генерация новых WebP в этом задании не выполнялась.

## Размеры медиа и мобильный интернет

Учитываются только **146 уникальных опубликованных файлов public/images/approved**, без архивов, hero-видео, CSS/JS, копий в assets и dist. Локальное дублирование source/public не суммируется с сетевой нагрузкой. Один общий placeholder SVG — **702 байт**, кэшируется как отдельный общий URL.

| Метрика | Факт |
|---|---|
| Суммарный WebP payload | **31705262 байт / 30.24 MiB** |
| Средний WebP | **217159 байт / 212.07 KiB** |
| Медиана | 178.02 KiB |
| Минимум / максимум | 17.71 / 926.06 KiB |
| Первая иллюстрированная страница, 24 файла | **5791736 байт / 5.52 MiB** |
| Самые тяжёлые любые 24 файла | 12.08 MiB |
| Если добавить 19 файлов по нынешнему среднему | +3.93 MiB |
| Если добавить все 38 по нынешнему среднему | +7.87 MiB |

Оценка только полезной нагрузки: все изображения при **1 Mbit/s** требуют примерно **254 с**, первая страница 24 — около **46 с**; при 5 Mbit/s — примерно 9.3 с. Это арифметический сценарий без RTT, TLS, конкурирующих запросов и кэша; не замер реальной скорости пользователя. Lazy loading означает, что все 24 файла не обязательно скачиваются сразу, а весь каталог не загружается одним просмотром.

Самые тяжёлые файлы:

| ID | Байты | KiB |
|---|---|---|
| `spiraeanthus-schrenkianus` | 948284 | 926.06 |
| `rhinolophus-bocharicus` | 944586 | 922.45 |
| `korzhinskys-pear` | 912428 | 891.04 |
| `allactaga-severtzovi` | 837150 | 817.53 |
| `tulipa-tetraphylla` | 661122 | 645.63 |

Lazy loading уже есть у SpeciesCard.vue и превью карты: loading=lazy, decoding=async, указаны width/height. Это полезно сохранить. В SpeciesVisualization.vue/деталях загрузка обычная, контроллер создаёт Image при монтировании; основное видимое изображение страницы не следует автоматически откладывать. CSS-кадрирование и композиция не уменьшают сетевой файл.

**Рекомендация для отдельной задачи:** измерить WebP card **480/960 px**, detail **1200/1800 px**, отдельные малые варианты карты и srcset/sizes. [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images) описывает выбор размера браузером; здесь нет обещания фиксированного процента экономии без фактического сравнения качества/байтов. Для гербария оставить доступ к читаемому большому листу. Никакие thumbnails, настройки загрузки, CSS, Vue-компоненты или image metadata не изменены.

## Проверки и сохранность

- **npm test — 331/331**, 0 ошибок, 0 пропусков, exit 0; около 26.80 с. Среди них проверки фотографий, лицензий, WebP, карточек и сохранности прежних релизов.
- **node scripts/build-data.mjs --check — exit 0:** 184 каталога, 2 архива, 18 викторины, 7 областей, 2 региональных свидетельства. Использован read-only режим; данные не перегенерировались.
- **node scripts/validate-locales.mjs — exit 0:** 620 ключей × 4 языка.
- Аудит 146 контейнеров и 292 полных декодирований пройден. SHA-256 каждого исходного и публичного выбранного файла совпал с метаданными; повторяющихся SHA-256 нет.
- **Все 1129 исходных tracked-файлов побайтно неизменны**, включая 184 объекта, архив из двух, фотографии, лицензии, научные статусы, переводы и интерфейс. Изображения в source/public имеют ту же метаинформацию, что до задачи.
- Все 184 verified:false; population.reviewStatus:pending у всех. У 144 provisional records scientificReviewStatus:pending; у остальных поле publication отсутствует. lastReviewedAt:null у 175, прежняя дата 2026-10-12 у девяти сохранена; аудит ничего не повышает до научного одобрения.
- Source SHA-256: **cee3277b598a87b40126fc24064a6c5c05487a8d107cd7a95d401ad1d380a881**; public species SHA-256: **74a09270cafbf4444f750fe64e9a2e9966b52d0cef4187814b6b22ba043fedd4**; archive SHA-256: **9741b9905ccae70935268bfe41daa790f23674417bfc69451a06e35c68eeb5e0**.

Логи и контрольный снимок: .generated/catalog-184-photo-audit/. Контрольные суммы логов и конкретных файлов доказательств включены в JSON. Полная production build в исследовательской задаче не требовалась и не запускалась; код не изменялся. ENOSPC не возник. Научные материалы, фотографии и кэши не удалялись.

В коммит входят **только** docs/research/catalog-184-photo-audit.md и data/research/catalog-184-photo-audit.json. Исходный HEAD указан выше; точный хеш коммита результатов сообщается после его создания. Merge, push, deployment и импорт изображений не выполнялись. Следующая партия не начиналась.

## Индекс всех 184 записей

Автор, конкретный источник/лицензия, пути, размеры, SHA-256 и основания определения для каждой строки находятся в одноимённом records[].images[] JSON-аудита. Здесь — компактный контроль полноты, включая 38 placeholder.

| ID | Научное имя в каталоге | Группа | Тип медиа |
|---|---|---|---|
| `irbis` | Panthera uncia | Млекопитающие | фотография |
| `argali` | Ovis ammon | Млекопитающие | фотография |
| `manul` | Otocolobus manul | Млекопитающие | фотография |
| `golden-eagle` | Aquila chrysaetos | Птицы | фотография |
| `bearded-vulture` | Gypaetus barbatus | Птицы | фотография |
| `saker-falcon` | Falco cherrug | Птицы | фотография |
| `greigs-tulip` | Tulipa greigii | Растения | фотография |
| `kaufmanns-tulip` | Tulipa kaufmanniana | Растения | фотография |
| `sievers-apple` | Malus sieversii | Растения | фотография |
| `central-asian-tortoise` | Testudo horsfieldii | Пресмыкающиеся | фотография |
| `central-asian-frog` | Rana asiatica | Земноводные | фотография |
| `predatory-bush-cricket` | Saga pedo | Членистоногие | фотография |
| `dog-stinkhorn` | Mutinus caninus | Грибы | фотография |
| `marbled-polecat` | Vormela peregusna | Млекопитающие | фотография |
| `black-stork` | Ciconia nigra | Птицы | фотография |
| `ibisbill` | Ibidorhyncha struthersii | Птицы | фотография |
| `eduards-fritillary` | Fritillaria eduardii | Растения | фотография |
| `european-glass-lizard` | Pseudopus apodus | Пресмыкающиеся | фотография |
| `dalmatian-pelican` | Pelecanus crispus | Птицы | фотография |
| `eurasian-lynx` | Lynx lynx | Млекопитающие | фотография |
| `kolpakowskis-tulip` | Tulipa kolpakowskiana | Растения | фотография |
| `ostrowskis-tulip` | Tulipa ostrowskiana | Растения | фотография |
| `pike-asp` | Aspiolucius esocinus | Рыбы | placeholder |
| `turkestan-catfish` | Glyptosternon reticulatum | Рыбы | placeholder |
| `christophs-clouded-yellow` | Colias christophi | Членистоногие | музейная фотография |
| `relict-spider` | Tricholathys relicta | Членистоногие | placeholder |
| `tien-shan-scutiger` | Albatrellus tianschanicus | Грибы | placeholder |
| `menzbiers-marmot` | Marmota menzbieri | Млекопитающие | placeholder |
| `semenovs-fir` | Abies sibirica semenovii | Растения | гербарий |
| `great-bustard` | Otis tarda tarda | Птицы | фотография |
| `said-alievs-toad-agama` | Phrynocephalus saidalievi | Пресмыкающиеся | фотография |
| `vigorous-ground-beetle` | Carabus validus | Членистоногие | placeholder |
| `pskem-onion` | Allium pskemense | Растения | фотография |
| `kostychevs-pasque-flower` | Pulsatilla kostyczewii | Растения | фотография |
| `indian-crested-porcupine` | Hystrix indica | Млекопитающие | фотография |
| `fergana-ground-beetle` | Carabus ferghanicus | Членистоногие | placeholder |
| `giant-robber-fly` | Satanas gigas | Членистоногие | фотография |
| `korzhinskys-pear` | Pyrus korshinskyi | Растения | фотография |
| `cinereous-vulture` | Aegypius monachus | Птицы | фотография |
| `egyptian-vulture` | Neophron percnopterus | Птицы | фотография |
| `eminium-regelii` | Eminium regelii | Растения | фотография |
| `eremurus-zenaidae` | Eremurus zenaidae | Растения | гербарий |
| `eremurus-zoae` | Eremurus zoae | Растения | гербарий |
| `allium-dodecadontum` | Allium dodecadontum | Растения | гербарий |
| `allium-semenovii` | Allium semenovii | Растения | фотография |
| `tulipa-affinis` | Tulipa fosteriana | Растения | фотография |
| `tulipa-korolkowii` | Tulipa korolkowii | Растения | гербарий |
| `tulipa-platystemon` | Tulipa platystemon | Растения | гербарий |
| `tulipa-tetraphylla` | Tulipa tetraphylla | Растения | фотография |
| `tulipa-zenaidae` | Tulipa lehmanniana | Растения | гербарий |
| `juno-orchioides` | Iris orchioides | Растения | фотография |
| `iridodictyum-kolpakowskianum` | Iris kolpakowskiana | Растения | фотография |
| `thesium-minkwitzianum` | Chrysothesium minkwitzianum | Растения | гербарий |
| `delphinium-knorringianum` | Delphinium knorringianum | Растения | placeholder |
| `urocerus-sah` | Urocerus sah | Членистоногие | фотография |
| `masaris-longicornis` | Masaris longicornis | Членистоногие | placeholder |
| `varanus-griseus-caspius` | Varanus griseus caspius | Пресмыкающиеся | фотография |
| `lyrurus-tetrix` | Lyrurus tetrix | Птицы | фотография |
| `cygnus-cygnus` | Cygnus cygnus | Птицы | фотография |
| `aythya-nyroca` | Aythya nyroca | Птицы | фотография |
| `mergus-serrator` | Mergus serrator | Птицы | фотография |
| `oxyura-leucocephala` | Oxyura leucocephala | Птицы | фотография |
| `gavia-arctica` | Gavia arctica | Птицы | фотография |
| `ciconia-ciconia` | Ciconia ciconia | Птицы | фотография |
| `platalea-leucorodia` | Platalea leucorodia | Птицы | фотография |
| `pelecanus-onocrotalus` | Pelecanus onocrotalus | Птицы | фотография |
| `phalacrocorax-pygmaeus` | Microcarbo pygmaeus | Птицы | фотография |
| `falco-naumanni` | Falco naumanni | Птицы | фотография |
| `falco-rusticolus` | Falco rusticolus | Птицы | фотография |
| `pandion-haliaetus` | Pandion haliaetus | Птицы | фотография |
| `haliaeetus-leucoryphus` | Haliaeetus leucoryphus | Птицы | фотография |
| `haliaeetus-albicilla` | Haliaeetus albicilla | Птицы | фотография |
| `gyps-himalayensis` | Gyps himalayensis | Птицы | фотография |
| `gyps-fulvus` | Gyps fulvus | Птицы | фотография |
| `circaetus-gallicus` | Circaetus gallicus | Птицы | фотография |
| `circus-macrourus` | Circus macrourus | Птицы | фотография |
| `neomys-fodiens` | Neomys fodiens | Млекопитающие | фотография |
| `rhinolophus-bocharicus` | Rhinolophus bocharicus | Млекопитающие | фотография |
| `barbastella-leucomelas` | Barbastella leucomelas | Млекопитающие | научная иллюстрация |
| `tadarida-teniotis` | Tadarida teniotis | Млекопитающие | фотография |
| `ursus-arctos` | Ursus arctos | Млекопитающие | фотография |
| `martes-foina` | Martes foina | Млекопитающие | фотография |
| `lutra-lutra` | Lutra lutra | Млекопитающие | фотография |
| `allactaga-elater` | Allactaga elater | Млекопитающие | фотография |
| `dictyocephalus-attenuatus` | Dictyocephalos attenuatus | Грибы | фотография |
| `prionus-tschitscherini` | Pogonarthron tschitscherini | Членистоногие | placeholder |
| `rossomyrmex-proformicarum` | Rossomyrmex proformicarum | Членистоногие | музейная фотография |
| `barbus-brachycephalus` | Luciobarbus brachycephalus | Рыбы | фотография |
| `allochrusa-gypsophiloides` | Acanthophyllum gypsophiloides | Растения | гербарий |
| `corydalis-pseudoadunca` | Corydalis pseudoadunca | Растения | гербарий |
| `fumariola-turkestanica` | Fumariola turkestanica | Растения | гербарий |
| `rhodiola-litwinowii` | Rhodiola litwinowii | Растения | гербарий |
| `sibiraea-tianschanica` | Sibiraea tianschanica | Растения | гербарий |
| `crataegus-knorringiana` | Crataegus knorringiana | Растения | placeholder |
| `ammopiptanthus-nanus` | Ammopiptanthus nanus | Растения | гербарий |
| `colutea-brachyptera` | Colutea brachyptera | Растения | гербарий |
| `primula-eugeniae` | Primula eugeniae | Растения | placeholder |
| `physochlaina-alaica` | Physochlaina alaica | Растения | гербарий |
| `incarvillea-olgae` | Incarvillea olgae | Растения | фотография |
| `saussurea-involucrata` | Saussurea involucrata | Растения | гербарий |
| `silene-sussamyrica` | Silene sussamyrica | Растения | гербарий |
| `iskandera-alaica` | Iskandera alaica | Растения | placeholder |
| `spiraeanthus-schrenkianus` | Spiraeanthus schrenckianus | Растения | фотография |
| `chesneya-villosa` | Chesneya villosa | Растения | гербарий |
| `hedysarum-chaitocarpum` | Hedysarum chaitocarpum | Растения | гербарий |
| `zygophyllum-kaschgaricum` | Zygophyllum kaschgaricum | Растения | фотография |
| `sclerotiaria-pentaceros` | Sclerotiaria pentaceros | Растения | placeholder |
| `bupleurum-rosulare` | Bupleurum rosulare | Растения | гербарий |
| `hyalolaena-intermedia` | Hyalolaena intermedia | Растения | гербарий |
| `seseli-eryngioides` | Seseli eryngioides | Растения | гербарий |
| `seseli-korshinskyi` | Seseli korshinskyi | Растения | гербарий |
| `cnidiocarpa-alaica` | Cnidiocarpa alaica | Растения | гербарий |
| `pastinacopsis-glacialis` | Pastinacopsis glacialis | Растения | гербарий |
| `kaufmannia-semenovii` | Kaufmannia semenovii | Растения | гербарий |
| `acantholimon-compactum` | Acantholimon compactum | Растения | гербарий |
| `scutellaria-andrachnoides` | Scutellaria andrachnoides | Растения | гербарий |
| `scutellaria-nepetoides` | Scutellaria nepetoides | Растения | placeholder |
| `salvia-korolkowii` | Salvia korolkowii | Растения | гербарий |
| `nathaliella-alaica` | Nathaliella alaica | Растения | гербарий |
| `lonicera-paradoxa` | Lonicera paradoxa | Растения | placeholder |
| `campanula-eugeniae` | Campanula eugeniae | Растения | placeholder |
| `lamyropappus-schakaptaricus` | Lamyropappus schakaptaricus | Растения | гербарий |
| `trichanthemis-aulieatensis` | Trichanthemis aulieatensis | Растения | гербарий |
| `trichanthemis-aurea` | Trichanthemis aurea | Растения | гербарий |
| `lepidolopha-komarowii` | Lepidolopha komarowii | Растения | гербарий |
| `barbus-capito-conocephalus` | Luciobarbus conocephalus | Рыбы | placeholder |
| `vipera-ursinii-renardi` | Vipera renardi | Пресмыкающиеся | placeholder |
| `kirgisobia-bohnei` | Kirgizobia bohnei | Членистоногие | placeholder |
| `anser-indica` | Anser indicus | Птицы | фотография |
| `accipiter-badius` | Accipiter badius | Птицы | музейная фотография |
| `aquila-clanga` | Aquila clanga | Птицы | фотография |
| `aquila-nipalensis` | Aquila nipalensis | Птицы | фотография |
| `aquila-heliaca` | Aquila heliaca | Птицы | фотография |
| `hieraaetus-fasciatus` | Aquila fasciata | Птицы | фотография |
| `hieraaetus-pennatus` | Hieraaetus pennatus | Птицы | фотография |
| `tetrax-tetrax` | Tetrax tetrax | Птицы | фотография |
| `crex-crex` | Crex crex | Птицы | фотография |
| `anthropoides-virgo` | Anthropoides virgo | Птицы | фотография |
| `burhinus-oedicnemus` | Burhinus oedicnemus | Птицы | фотография |
| `vanellus-gregarius` | Vanellus gregarius | Птицы | фотография |
| `glareola-nordmanni` | Glareola nordmanni | Птицы | фотография |
| `strix-aluco` | Strix aluco | Птицы | фотография |
| `syrrhaptes-paradoxus` | Syrrhaptes paradoxus | Птицы | фотография |
| `pterocles-alchata` | Pterocles alchata | Птицы | фотография |
| `pterocles-orientalis` | Pterocles orientalis | Птицы | фотография |
| `columba-leuconota` | Columba leuconota | Птицы | фотография |
| `columba-eversmanni` | Columba eversmanni | Птицы | фотография |
| `bubo-bubo` | Bubo bubo | Птицы | фотография |
| `gazella-subgutturosa` | Gazella subgutturosa | Млекопитающие | фотография |
| `dendrocopos-leucopterus` | Dendrocopos leucopterus | Птицы | фотография |
| `sorbus-persica` | Hedlundia persica | Растения | placeholder |
| `amygdalus-petunnikowii` | Prunus petunnikowii | Растения | фотография |
| `kosopoljanskia-turkestanica` | Schrenkia turkestanica | Растения | гербарий |
| `alajja-anomala` | Eriophyton anomalum | Растения | гербарий |
| `otostegia-schennikovii` | Moluccella olgae | Растения | placeholder |
| `salvia-vvedenskyi` | Salvia vvedenskii | Растения | гербарий |
| `stemmacantha-aulieatensis` | Leuzea aulieatensis | Растения | гербарий |
| `centaurea-alaica` | Rhaponticoides alaica | Растения | placeholder |
| `pyrethrum-leontopodium` | Richteria leontopodium | Растения | фотография |
| `phoenicopterus-roseus` | Phoenicopterus roseus | Птицы | фотография |
| `chlamydotis-macqueenii` | Chlamydotis macqueenii | Птицы | фотография |
| `numenius-tenuirostris` | Numenius tenuirostris | Птицы | музейная фотография |
| `larus-ichtyaetus` | Ichthyaetus ichthyaetus | Птицы | фотография |
| `dendrocopos-major` | Dendrocopos major | Птицы | фотография |
| `hemiechinus-hypomelas` | Paraechinus hypomelas | Млекопитающие | фотография |
| `allactaga-severtzovi` | Allactaga severtzovi | Млекопитающие | фотография |
| `anemone-obtusiloba` | Anemonastrum obtusilobum | Растения | фотография |
| `berberis-kaschgarica` | Berberis ulicina | Растения | placeholder |
| `primula-macrocalyx` | Primula veris subsp. macrocalyx | Растения | фотография |
| `sonjagaster-coronatus` | Thecagaster coronata | Членистоногие | placeholder |
| `capoetobrama-kuschakewitschi-orientalis` | Capoetobrama kuschakewitschi | Рыбы | placeholder |
| `schizothorax-issykkuli` | Schizothorax pseudoaksaiensis | Рыбы | placeholder |
| `diptychus-dybowskii-lansdelli` | Gymnodiptychus dybowskii | Рыбы | placeholder |
| `eryx-tataricus` | Eryx miliaris | Пресмыкающиеся | placeholder |
| `terpsiphone-paradisi` | Terpsiphone paradisi leucogaster | Птицы | placeholder |
| `otonycteris-hemprichi` | Otonycteris leucophaea | Млекопитающие | placeholder |
| `cervus-elaphus-asiaticus` | Cervus canadensis | Млекопитающие | placeholder |
| `allactaga-saltator` | Orientallactaga sibirica | Млекопитающие | placeholder |
| `sorbaria-olgae` | Sorbaria tomentosa | Растения | placeholder |
| `dorema-microcarpum` | Ferula namanganica | Растения | placeholder |
| `tianschaniella-umbellifera` | Tianschaniella umbellulifera | Растения | placeholder |
| `parnassius-loxias-tashkorensis` | Parnassius loxias loxias | Членистоногие | placeholder |
| `parnassius-apollo-merzbacheri` | Parnassius apollo merzbacheri | Членистоногие | placeholder |
| `cuon-alpinus` | Cuon alpinus | Млекопитающие | фотография |
