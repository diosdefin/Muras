# MURAS №26.2 — изображения первой партии каталога 184

Дата: **2026-10-28**, Asia/Bishkek. Ветка: **feature/release-preparation**. Проверенный исходный HEAD: **63f8e43d7d6b504079412c03c7cbf6eda421567a**, исходное дерево clean. Было 184 записи, архив 2, 146 записей с изображениями и 38 placeholder.

**Подключено 12 допустимых изображений: 8 фотографий и 4 гербария; научных иллюстраций в новой партии нет. Теперь 158/184 записей с изображениями и 26 placeholder.** Из выбранных 19 у семи placeholder сохранён; остальные 19 таксонов следующей партии не затрагивались. Научные поля всех 184 объектов и прежние 146 image arrays полностью сохранены.

**Статус проверки: MEDIA_CONNECTED_TEST_COMPATIBILITY_BLOCKED.** Файлы, права, текущая модель данных, data ×2, production build и отдельная проверка отображения прошли. Полный неизменённый suite: **324/331, 7 падений**. Они связаны с историческими image-снимками, повтором прежних owner-пакетов после отдельно разрешённого изменения медиа и закрытым списком прежних фото-журналов. По прямому запрету задания тесты не менялись; этот результат не объявляется зелёным релизом. Production-валидаторы, guard и импортёр не ослаблялись.

## Состав: все 3 A и 16 B в порядке аудита

Отбор точно совпадает с batches[0].ids в [аудите №26.1](catalog-184-photo-audit.md) / [его JSON](../../data/research/catalog-184-photo-audit.json). Случайных замен, добавления новых видов и перестановки каталога нет. «Найдено пригодных» означает 12 конкретных проверенных файлов, а не общее число результатов поисковиков.

| № | ID | Принятое имя в неизменённом каталоге | Приоритет | Результат | Источник / лицензия или причина отказа |
|---|---|---|---|---|---|
| 1 | `vipera-ursinii-renardi` | Vipera renardi | A | Подключена фотография | [источник](https://commons.wikimedia.org/wiki/File:Juvenile_Vipera_renardi_retreating.jpg), [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| 2 | `cervus-elaphus-asiaticus` | Cervus canadensis | A | Подключена фотография | [источник](https://commons.wikimedia.org/wiki/File:Altai_maral_2.jpg), [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| 3 | `sorbaria-olgae` | Sorbaria tomentosa | A | Подключена фотография | [источник](https://commons.wikimedia.org/wiki/File:Sorbaria-tomentosa-flowers.JPG), [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| 4 | `iskandera-alaica` | Iskandera alaica | B | Placeholder | Точные гербарные медиа MO имеют CC BY-NC-SA 3.0; свободное разрешение конкретного файла не найдено. Материалы Plantarium не дают автоматического разрешения. |
| 5 | `scutellaria-nepetoides` | Scutellaria nepetoides | B | Placeholder | У точного TASH002760 нет media-level лицензии; сайт TASH требует письменное разрешение на воспроизведение. Фото Plantarium — all rights reserved. |
| 6 | `lonicera-paradoxa` | Lonicera paradoxa | B | Placeholder | TASH003106/TASH135331 не имеют явной лицензии медиа; LE01056033 идентифицирован, но свободное разрешение на скан не установлено. Доступность просмотра не даёт права публикации. |
| 7 | `campanula-eugeniae` | Campanula eugeniae | B | Подключён гербарий | [источник](https://www.gbif.org/occurrence/5058366279), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 8 | `sorbus-persica` | Hedlundia persica | B | Подключён гербарий | [источник](https://plant.depo.msu.ru/open/public/item/MW0839339), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 9 | `centaurea-alaica` | Rhaponticoides alaica | B | Placeholder | В ограниченном поиске по Rhaponticoides alaica и Centaurea alaica точного доступного лицензированного изображения не найдено; научная статья о роде сама по себе не заменяет файл вида. |
| 10 | `berberis-kaschgarica` | Berberis ulicina | B | Подключён гербарий | [источник](https://www.gbif.org/occurrence/1320618564), [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| 11 | `dorema-microcarpum` | Ferula namanganica | B | Подключена фотография | [источник](https://natureconservation.pensoft.net/article/84834/), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 12 | `tianschaniella-umbellifera` | Tianschaniella umbellulifera | B | Подключён гербарий | [источник](https://www.gbif.org/occurrence/1061254332), [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| 13 | `eryx-tataricus` | Eryx miliaris | B | Подключена фотография | [источник](https://commons.wikimedia.org/wiki/File:BennyTrapp_Eryx_miliaris.jpg), [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| 14 | `allactaga-saltator` | Orientallactaga sibirica | B | Подключена фотография | [источник](https://commons.wikimedia.org/wiki/File:Orientallactaga_sibirica.jpg), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 15 | `otonycteris-hemprichi` | Otonycteris leucophaea | B | Placeholder | У точных iNaturalist-фото Otonycteris leucophaea CC BY-NC 4.0; в музейной галерее МГУ разрешение на повторное использование конкретных фото не указано. O. hemprichii не подставлялся. |
| 16 | `sonjagaster-coronatus` | Thecagaster coronata | B | Подключена фотография | [источник](https://www.inaturalist.org/photos/519688055), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 17 | `barbus-capito-conocephalus` | Luciobarbus conocephalus | B | Подключена фотография | [источник](https://www.inaturalist.org/photos/390287886), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 18 | `pike-asp` | Aspiolucius esocinus | B | Placeholder | Commons выдаёт марки/конверты, GBIF — музейный журнал поступлений, не организм. Точная свободная фотография либо первичный научный рисунок с проверенными правами не установлены; рыба другого вида не подставлялась. |
| 19 | `parnassius-loxias-tashkorensis` | Parnassius loxias loxias | B | Placeholder | Файл Commons определён только как Parnassius loxias; нужный номинативный подвид loxias loxias документально не установлен. Музейный университетский список содержит лишь видовой ранг. Родительский вид не подставлялся. |

Новые изображения по группам: **6 растений** (4 гербария и 2 фотографии), **2 пресмыкающихся**, **2 млекопитающих**, **1 членистоногое**, **1 рыба**. Полный каталог сохраняет 184 ID и прежние научные названия/ранги. Отдельно названные 8 фотографий не включают четыре гербарных скана.

## Поиск и проверка источников

Для всех 19 выполнены отдельные ограниченные запросы Commons, GBIF taxon/media, iNaturalist taxa/observations, а также отдельный GBIF-поиск PRESERVED_SPECIMEN для гербарных, музейных и университетских коллекций. Использовались точные принятые имена и сохранённые исторические синонимы. Для нового GBIF dataset key не подставлялся родительский/похожий таксон. Запросы имеют URL, HTTP status, SHA-256 ответа и счётчики в [фото-журнале](../../data/research/catalog-184-photo-batch-1.json); счётчик occurrence не считается числом допустимых изображений.

Дополнительно проверены первичные страницы LE, TASH, зоологического музея МГУ, Kew/POWO, университетской энтомологической коллекции Токио и научной статьи Tojibaev et al. (2022). В коллекционном поиске обнаружены конкретные медиа Kew, MSU, Smithsonian NMNH, RBGE, Meise и MO. Не каждое из них имеет разрешение: MO NC, TASH без media.license и LE без установленной лицензии не публиковались. Подтверждение права в dataset/occurrence не переносилось автоматически на само изображение.

Использованы пять Commons-файлов через существующий prepare-batch-images.mjs и шесть непосредственно документированных медиа коллекций/наблюдений с обработкой существующим scripts/process_data.py. Двенадцатый файл — фотография из **Figure 3A**, статья [Tojibaev et al. 2022](https://doi.org/10.3897/natureconservation.49.84834), явная **CC BY 4.0** в XML permissions. Из полной таблицы 1512×1767 точно выделена только панель A: **(0, 0, 493, 880)**. Соседние виды не включены; геометрия и окраска растения не изменены. Дорисовка/генерация изображений не применялась.

Не использованы NC/ND, неизвестные права, марки, спектрограммы, музейные журналы вместо организмов и фотографии только родительского таксона вместо нужного подвида. Авторы/кураторы не получали сообщений и запросов разрешения от этого задания.

## Документальное определение и оговорки

- **Cervus canadensis / Sorbaria tomentosa:** выбран снимок с документированной видовой принадлежностью. Не объявляется доказательством исторической формы asiaticus/olgae либо кыргызстанской популяции. Американский подвид nannodes не использован. Для марала выбран Altai maral 2.jpg с известным автором, а не файл с ошибочным Artist:no rights reserved.
- **Berberis:** на этикетке и в музейной записи историческое Berberis kaschgarica, образец US 2879014 / 01121980. Связь с принятым Berberis ulicina уже сохранена в научном пакете; новую синонимию это задание не устанавливает.
- **Tianschaniella:** ваучер E00714915; на старой этикетке написано umbellifera, в записи RBGE/GBIF — принятое umbellulifera. Сохранено существующее документированное решение проекта, а не переопределён таксон по сходству.
- **Thecagaster coronata:** первичное iNaturalist-наблюдение имеет точное видовое имя и research grade; лицензия конкретного фото 519688055 — CC BY 4.0. GBIF-интерпретатор свёл комбинацию к роду; этот родовой результат не использован как видовое определение. Опора — первичная запись iNaturalist, точная photo ID и совпавшая media-level лицензия.
- **Ferula namanganica:** первичная подпись панели — Dorema microcarpum, подтверждённая проектом связь исторического имени сохранена. Указан коллектив авторов статьи; отдельный фотограф в подписи не назван и не выдуман.
- Все четыре гербарных файла подписаны именно как гербарий, с номером экземпляра/штрихкодом. Не выдаются за живое растение и современную численность. Для фотографий источников не устанавливались новые местонахождения.

Некоторые физические цветовые шкалы гербарных листов содержат старый печатный copyright/all rights reserved. Эти надписи не удалялись. Разрешение взято из **явного media.license конкретного цифрового файла**, опубликованного учреждением: Kew/MSU CC BY 4.0, Smithsonian/RBGE CC0. Это отличается от отказанного TASH, где для файла media.license отсутствует и текущие условия требуют письменного разрешения. Имена неизвестных фотографов не сочинялись: credit явно указывает учреждение/правообладателя.

Техническая/документальная проверка фото не является независимой научной переидентификацией или одобрением карточек. verified, scientificReviewStatus, publication, population, национальные категории и последние даты проверки не изменены.

## Файлы, авторство, исходные размеры и контрольные суммы

В каждой строке ниже указан SHA-256 скачанного исходного файла и итогового WebP. «Исходный» означает фактически доставленный сервером файл; для IIIF/Smithsonian URL может задавать серверную rendition. Размер мастер-TIFF/камерного RAW не выдумывается.

| ID | Автор / точная роль credit | Исходный размер → WebP | Байты WebP |
|---|---|---|---|
| `vipera-ursinii-renardi` | Matvey | 3840×2160 → 1800×1013 | 452492 |
| `cervus-elaphus-asiaticus` | Dmitry A. Mottl | 3888×2592 → 1800×1200 | 235536 |
| `sorbaria-olgae` | Sten Porse | 1232×792 → 1232×792 | 79964 |
| `campanula-eugeniae` | Royal Botanic Gardens, Kew (правообладатель коллекции; фотограф не указан) | 8736×11648 → 1350×1800 | 92712 |
| `sorbus-persica` | ELAR corporation (Moscow, Russia); Moscow State University (правообладатель) | 3736×5272 → 1276×1800 | 187528 |
| `berberis-kaschgarica` | Ingrid P. Lin; Smithsonian Institution, National Museum of Natural History (коллекция) | 1520×2000 → 1368×1800 | 288174 |
| `dorema-microcarpum` | Komiljon Sh. Tojibaev et al. (2022; авторский коллектив статьи) | 1512×1767 → 493×880 | 159458 |
| `tianschaniella-umbellifera` | Royal Botanic Garden Edinburgh (коллекция и поставщик изображения; фотограф не указан) | 2912×4096 → 1280×1800 | 67136 |
| `eryx-tataricus` | Benny Trapp | 3969×2490 → 1800×1129 | 261434 |
| `allactaga-saltator` | Jan Ebr & Ivana Ebrová | 1453×1260 → 1453×1260 | 165620 |
| `sonjagaster-coronatus` | Askar Akhmedov | 1542×2048 → 1355×1800 | 199460 |
| `barbus-capito-conocephalus` | Murodjon Rakhmonov | 2048×923 → 1800×811 | 188294 |

**vipera-ursinii-renardi**. Исходный SHA-256: `eed3c605359b9276d251272866d716b14b5974c185bdb3e49ba41faace13a10a`. WebP SHA-256: `bc5ba72ae5500b79fcf276a4e8ac3b20667a6c7252c3b9644a1726c64339feb8`. [Страница изображения](https://commons.wikimedia.org/wiki/File:Juvenile_Vipera_renardi_retreating.jpg); [исходный файл](https://upload.wikimedia.org/wikipedia/commons/9/9a/Juvenile_Vipera_renardi_retreating.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original); [лицензия CC0](https://creativecommons.org/publicdomain/zero/1.0/).

**cervus-elaphus-asiaticus**. Исходный SHA-256: `79e5973166b2af39b7abda3c4a05c2e73579c9b9cbd940ea4ccd89a5bc337913`. WebP SHA-256: `5924cdd5e75c79c3e5cd020f1ca1ba4597d950dd1a0dc6f00417249de9e04d52`. [Страница изображения](https://commons.wikimedia.org/wiki/File:Altai_maral_2.jpg); [исходный файл](https://upload.wikimedia.org/wikipedia/commons/3/32/Altai_maral_2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original); [лицензия CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).

**sorbaria-olgae**. Исходный SHA-256: `df893cabbf454d438199dffb66315666339a0a6ade3ec59e138b68cc827ff184`. WebP SHA-256: `0a4f23ee21bbb0ad169618006f711688b62ee4bf0868b15b89ef2c6a98213ea8`. [Страница изображения](https://commons.wikimedia.org/wiki/File:Sorbaria-tomentosa-flowers.JPG); [исходный файл](https://upload.wikimedia.org/wikipedia/commons/7/70/Sorbaria-tomentosa-flowers.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original); [лицензия CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).

**campanula-eugeniae**. Исходный SHA-256: `04ec4039fd7823d525093dfe00e1d0389ac26783db77f8355021fe6c6599ce36`. WebP SHA-256: `6d721dd475db7ffa8481a824c8635ad710066436907c5e3b033361348b453962`. [Страница изображения](https://www.gbif.org/occurrence/5058366279); [исходный файл](https://d2jcv3kl45hlgi.cloudfront.net/1cbffa57060410b44a51238c9a9ac792.jpg); [лицензия CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**sorbus-persica**. Исходный SHA-256: `d71c1a60a994b57a30bd6b02cf05ab9dd15f4fea474ad256bac4a00240367496`. WebP SHA-256: `ba3ba124886b567765ea065b1060351ecd04a2cc13e340535282eee85e0e583d`. [Страница изображения](https://plant.depo.msu.ru/open/public/item/MW0839339); [исходный файл](https://plant.depo.msu.ru/open/public/item/MW0839339/img/0.jpg?gbif); [лицензия CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**berberis-kaschgarica**. Исходный SHA-256: `dfc2a894c0d4b7311ad19af1687b0a1a104191e5a5e4eed38b099397c8dfa4ff`. WebP SHA-256: `a36568be9db9c2a4ee9b4ed5b95e75d05d1731343e157af0681c820ed1e7ad47`. [Страница изображения](https://www.gbif.org/occurrence/1320618564); [исходный файл](https://collections.nmnh.si.edu/media/?i=10319955&h=2000); [лицензия CC0](https://creativecommons.org/publicdomain/zero/1.0/).

**dorema-microcarpum**. Исходный SHA-256: `33679346d8848a4ce4367d392e6cd1f827117c1be4097be957ce878a0b176233`. WebP SHA-256: `230d8889e36d41daf1cff843426656b7e7fb509a670472a6c559b4960b196f2d`. [Страница изображения](https://natureconservation.pensoft.net/article/84834/); [исходный файл](https://binary.pensoft.net/fig/705892/oo/file.jpg); [лицензия CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**tianschaniella-umbellifera**. Исходный SHA-256: `52f604f86fa62fd3bca8de54a2a5ea7c193239c8568dcc8a70499d6590b3f11a`. WebP SHA-256: `32ac313c1422e57f35c49cdfebcee6bb93149c3c7ba2197d47c22db43b21fec8`. [Страница изображения](https://www.gbif.org/occurrence/1061254332); [исходный файл](https://iiif.rbge.org.uk/herb/iiif/E00714915/full/1600,/0/default.jpg); [лицензия CC0](https://creativecommons.org/publicdomain/zero/1.0/).

**eryx-tataricus**. Исходный SHA-256: `c86a0e4226be1de9b2d2319be2630c20455c4949c6f333c14faf6d414da1e535`. WebP SHA-256: `9a41582f445496593e0e45c70ebd925f22fbd877173e02d15b4050753a8bfd2c`. [Страница изображения](https://commons.wikimedia.org/wiki/File:BennyTrapp_Eryx_miliaris.jpg); [исходный файл](https://upload.wikimedia.org/wikipedia/commons/2/2d/BennyTrapp_Eryx_miliaris.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original); [лицензия CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).

**allactaga-saltator**. Исходный SHA-256: `6ff7d0cd9f171c1e712821516bcbfa0b9972af148d1f67110c4f2b8529bac1e8`. WebP SHA-256: `de8aca33682df2fbdfd80dc0f349f4de11dd5dfe51ddf2e354706f1fae94b01c`. [Страница изображения](https://commons.wikimedia.org/wiki/File:Orientallactaga_sibirica.jpg); [исходный файл](https://upload.wikimedia.org/wikipedia/commons/c/c6/Orientallactaga_sibirica.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original); [лицензия CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**sonjagaster-coronatus**. Исходный SHA-256: `9bcd528bb489891aae26c80bbce2f8faac668ec8f1bf5dfc66be694c231bbf6d`. WebP SHA-256: `68ce232be7d7a583b862fcc8932c1a4705ffe9f844cefed4c280cf044f46fe41`. [Страница изображения](https://www.inaturalist.org/photos/519688055); [исходный файл](https://inaturalist-open-data.s3.amazonaws.com/photos/519688055/original.jpg); [лицензия CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**barbus-capito-conocephalus**. Исходный SHA-256: `e04ddfd779065ad25871bb54cf07ac7ce7701289d17c5d39f9aa2a042e64c18b`. WebP SHA-256: `fd0a7fed77d2a97f1ece26a424a75880decd90d80939fe24d8c1915d4de4fde9`. [Страница изображения](https://www.inaturalist.org/photos/390287886); [исходный файл](https://inaturalist-open-data.s3.amazonaws.com/photos/390287886/original.jpeg); [лицензия CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

Метаданные содержат original URL, image page, автора/credit, версию лицензии, license URL, атрибуцию, список изменений и SHA-256. Для ShareAlike сохранено требование той же лицензии на производные. Полные фактические значения, первичные media-записи и проверяемые связи — в records[] фото-журнала. Исходники приватно сохранены в .generated/catalog-184-photo-batch-1/originals/ либо .generated/bulk-originals/ и не включаются в public/dist.

## Сохранность данных

Снимок начала: .generated/catalog-184-photo-batch-1/before.json, HEAD 63f8e43d7d6b504079412c03c7cbf6eda421567a. В source изменены только images двенадцати выбранных объектов, причём все двенадцать arrays до задачи были пусты.

- Каталог: **184 → 184**, архив: **2 → 2**; порядок и ID сохранены.
- Все 184 объекта без images глубоко равны исходным. То же проверено для публичной проекции. Общий SHA-256 JSON source без catalog.images: **74c9c54ba95374d0a578e2c1c0260d94598b323fceb8e3615d5a0c541df8b085**, до/после совпадает.
- Все прежние **146 image arrays** глубоко равны исходным. Их локальные файлы, публичные копии и license artifacts побайтно неизменны.
- Все **1129** прежних tracked-файлов кроме source/public JSON побайтно совпали со снимком. В частности, не менялись ни тесты, ни Vue, ни дизайн/карта/уроки, ни переводы, ни научные пакеты, ни архив, ни источники и лицензии прежних фото.
- Научное одобрение не создавалось. Поля publication.researchFingerprint и прежние owner decisions не переписаны; новый журнал хранит отдельное разрешённое фото-изменение №26.2.

Source SHA-256 до: **cee3277b598a87b40126fc24064a6c5c05487a8d107cd7a95d401ad1d380a881**; после: **e079d24d0dc1b23bf40cab66a19f2276deb0a5940a4eefc4c1d6e810a7c0139c**. Public species SHA-256 до: **74a09270cafbf4444f750fe64e9a2e9966b52d0cef4187814b6b22ba043fedd4**; после: **0eebd3129fa441592dabcf665cf0e9f1807fb500ea6525e918ec3f8cdd078a1d**.

## Размер опубликованных медиа

| Метрика | До | После |
|---|---|---|
| Записей с изображениями | **146** | **158** |
| Placeholder | **38** | **26** |
| Уникальных публичных WebP | 146 | 158 |
| Общий размер WebP | **31705262 байт / 30.24 MiB** | **34083070 байт / 32.50 MiB** |

Прирост: **2377808 байт / 2.27 MiB**. Новые WebP не более 1800 px по длинной стороне, без апскейла; панель Dorema осталась 493×880. Полноразмерные 17.5 MB Kew JPEG и остальные оригиналы не попали в public. Декорации, фоновые изображения и анимации не создавались.

## Проверки

После подключения public сформирован штатным node scripts/build-data.mjs. Затем строго последовательно выполнены все четыре требуемые команды:

| № | Команда | Фактический результат |
|---|---|---|
| 1 | npm test | **exit 1: 324 pass / 7 fail / 0 skipped**, из 331; около 27.05 с |
| 2 | npm run data | **exit 0**, каталог 184, архив 2 |
| 3 | npm run data | **exit 0**, повторно 184 / 2, идентичный результат |
| 4 | npm run build | **exit 0**, 104 модуля, production build завершён |

Prebuild: **620 ключей × 4 языка**. Отдельные проверки новой партии:

- 12 исходных и 12 публичных WebP полностью декодированы Pillow, размеры/SHA-256 совпали; повреждений нет.
- 12 файлов проходят canPublishImage и inspectPipelineAssets. Все 158 публичных SHA-256 уникальны.
- **12/12 HTTP 200** по реальным публичным путям через Vite, байты ответа совпали с SHA-256.
- **144 SSR-рендера**: 12 видов × 4 языка × карточка/модальное окно/страница. Проверены фото и полная атрибуция в деталях; браузерная визуальная инспекция интерфейса не заявляется.
- Поиск названий **всех 184** записей в KY/UZ/RU/EN прошёл; маршруты новых изображённых видов корректны. Поиск не изменялся.
- dist содержит 184 записи; все 12 новых медиа в dist имеют те же SHA-256.
- ENOSPC не возник. На финальном измерении свободно **9217908736 байт**, около **8.58 GiB**. Тяжёлые проверки не запускались параллельно; материалы и Git-история не удалялись.

У исходного Kew-файла 101756928 пикселей Pillow выдал штатное DecompressionBombWarning; это предупреждение, не ошибка. Лимиты не ослаблялись. Первый запрос скачивания Vipera завершился timeout; единственный ограниченный повтор штатного pipeline прошёл.

### Семь неуспешных тестов — сохранены без обхода

| № теста | Файл / строка | Причина |
|---|---|---|
| 77 | `tests/catalog-150-publication.test.mjs:131` | Повтор старого разрешения на живом каталоге отвергает отдельно добавленное фото barbus-capito-conocephalus. |
| 81 | `tests/catalog-166-publication.test.mjs:145` | Повтор старого разрешения отвергает новое фото sorbus-persica. |
| 86 | `tests/catalog-178-publication.test.mjs:146` | Повтор старого разрешения отвергает новое фото berberis-kaschgarica. |
| 88 | `tests/catalog-184-publication.test.mjs:34` | Старое сравнение объектов целиком включает ранее пустые images; научные поля отдельно совпадают. |
| 89 | `tests/catalog-184-publication.test.mjs:88` | Историческое ожидание 1 фото среди последних 6 и общего числа 146; теперь в шестёрке 4 фото, всего 158. |
| 91 | `tests/catalog-184-publication.test.mjs:144` | Повтор старого разрешения отвергает фото sorbaria-olgae; исходный защищённый pipeline не ослаблен. |
| 150 | `tests/data.test.mjs:240` | Закрытый список источников читает только прежние фото-журналы, без нового catalog-184-photo-batch-1.json. URL и SHA новых файлов не подменялись ради прохождения. |

Тест №150 проверяет не только корректность файла, но и происхождение по списку старых журналов; новый журнал №26.2 он пока не читает. URL не подменялись на Commons, файлы не записывались в старые решения и старые научные черновики ради прохождения. Защищённый bulk importer по-прежнему отвергает повтор старого неизменённого owner-пакета против изменённых позднее images; это не обходилось. Отдельная проверка подтверждает разрешённый объём нынешней фото-правки и всю прежнюю науку.

Для зелёного suite понадобится отдельно разрешённая актуализация исторических регрессионных проверок/подключения нового фото-журнала с сохранением отрицательных проверок. В №26.2 она **не выполнялась**, поскольку раздел 5 прямо запрещает изменение тестов. Семь падений остаются известным ограничением результата и должны быть учтены перед релизом.

## Git и завершение

Исходный HEAD: **63f8e43d7d6b504079412c03c7cbf6eda421567a**. В рабочей области — два изменённых каталожных JSON, 12 новых WebP в assets, 12 их публичных копий, новый фото-журнал и этот отчёт. В коммит входят только эти разрешённые результаты; тесты, model/importer/UI и прежние исследовательские документы не менялись. Фактический хеш созданного коммита, итоговый HEAD и Git status сообщаются после фиксации; собственный будущий хеш не встраивается в содержимое отчёта.

**Итог: 12 подключено, 7 из выбранных 19 остались placeholder; полный каталог 158 с изображениями / 26 placeholder.** Результат не считается прошедшим все тесты: suite 324/331. Merge, push, deployment и следующая партия не выполнялись.
