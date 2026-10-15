# MURAS №23 — фотографии каталога из 100 записей

Дата: 2026-10-15. Ветка: feature/bulk-import-next. Исходный HEAD: d7b5d56e4cab493b6db0b0f97cbc479b6b4baf6f; рабочее дерево при начале было чистым.

## Результат

Было 43 фотографии у 43 карточек и 57 placeholder. Добавлено 42 фотографии. Теперь **85 карточек с фото (85%) и 15 placeholder**; в каталоге по-прежнему 100 записей. В число фото входят документированные гербарные и музейные образцы, явно обозначенные в подписях. Из новых файлов: 17 через Commons и 25 через GBIF с лицензией конкретного media. Новых фото музейных/гербарных образцов: 16.

Научные данные, численность, категории, переводы, статусы verified/pending, источники, архив, маршруты и интерфейс не менялись. Все прежние 43 массива images и байты публичных фотографий сохранены. Проверка: [task23-scientific-preservation.json](../evidence/task23-scientific-preservation.json).

## Проверки

- npm test: 301/301, включая четыре новых регрессионных проверки всех 100 записей и рендер 100 карточек/модальных окон/страниц на KY/UZ/RU/EN.
- npm run data: две итоговые генерации; результат повторяем без изменения species.json.
- npm run build: успешно (Vite 5,42 с; prebuild/data и postbuild также прошли).
- Полное декодирование 173 файлов assets/public (включая SVG): повреждений нет. Все 42 оригинала сохранены, SHA-256 совпадают. Среди 85 опубликованных фото нет одинаковых SHA и пар с dHash distance ≤4. Это эвристическая проверка близких изображений, не биологическое определение.
- Поиск по четырём языкам, фильтры, идентификаторы всех 100 маршрутов и страницы 24/24/24/24/4 проверены.
- Локальный production HTTP: все 100 маршрутов возвращают SPA-документ, все 85 WebP возвращают 200 и совпадают по SHA-256; placeholder.svg также 200. Это дополнено реальным рендером Vue-компонентов в тестах. Попытка встроенного браузера завершилась ошибкой его среды «failed to write kernel assets ... os error 3»; интерактивный визуальный проход в браузере не выполнен. Все новые исходные изображения просмотрены контактными листами.
- Исторические тесты публикации 63/84/100 выполняются на неизменяемых снимках соответствующих выпусков. Производственные проверки импортёра не ослаблялись: старый manifest не разрешает перезаписать позднее добавленные images. Отдельный тест подтверждает отказ такого повтора на текущих изменённых карточках. Старые manifest, fingerprints и научные подписи не переписывались.
- Во время частых повторных записей Windows несколько раз вернул UNKNOWN при открытии файла; финальные запуски проверены отдельно с интервалом.

## Права и научные ограничения

Для каждого нового файла журнал [catalog-100-photo-updates.json](../../data/research/catalog-100-photo-updates.json) содержит ID, точное scientificName, документированное определение источника, автора/правообладателя, страницы и исходный URL, версию лицензии, исходные размеры, оригинальную и WebP SHA-256, статус технического визуального просмотра. Полные ответы API и квитанции сохранены в docs/evidence/task23-*.json; они относятся к конкретным файлам. Лицензия набора GBIF или наблюдения iNaturalist не подменяет лицензию изображения. Независимое определение/одобрение не заявляются.

Использованы CC0 (2), CC BY 2.0 (2), CC BY 4.0 (27), CC BY-SA 2.0 (2), CC BY-SA 3.0 (2) и CC BY-SA 4.0 (7); конкретная версия указана в карточке и журнале. Для BY-SA обозначена лицензия производного WebP. WebP уменьшены до 1800 px без апскейла, quality 82, удалены EXIF/XMP, без изменения пропорций. Для коллекций Kew правообладатель указан как правообладатель, фотограф не выдуман. Rossomyrmex: April Nobile, from www.AntWeb.org, CASENT0178514; сохранена обратная ссылка на AntWeb. Применена явная [CC BY 4.0 AntWeb permission](https://commons.wikimedia.org/wiki/Template:AntWeb_permission), относящаяся к данному файлу; старая строка BY-SA/GFDL в GBIF не использовалась как основание.

Изображения видов вне Кыргызстана и зоопарков не выдаются за национальные наблюдения или определения местных подвидов. Ursus arctos и Lutra lutra опубликованы в существующей модели как виды; иллюстрации общего вида прямо не подтверждают национальную форму/популяцию. Научные оговорки исходных карточек сохранены. Гербарные листы сопоставлены с определениями, номерами образцов и видимыми этикетками; это не новая таксономическая ревизия. Отклонены спектрограмма Tadarida и след Ursus, музейные журналы вместо животных, марки и портрет энтомолога; список причин сохранён. Ранее отклонённый allium-semenovii.webp оставлен неизменным; новый CC0-файл имеет отдельное имя allium-semenovii-task23.webp.

Commons использован первым для всех 57 пробелов. При HTTP 429 выдерживались паузы; повторный ограниченный поиск категорий прекращён при новом 429. Обход ограничений не применялся. API iNaturalist/GBIF и коллекции дополнили поиск. HTTP 403 MNHN/iNaturalist не обходились; для Luciobarbus выбран другой разрешённый файл Commons. Ни Ecostan, ни Google Images, ни фотографии родственных видов не использовались.

Оригиналы приватно сохранены в .generated/bulk-originals и D:/Muras-task-23-originals-01a13a83; точные пути и хеши — task23-image-validation.json. Они не входят в public/dist. Полные метаданные происхождения и лицензий сохранены в Git. Дополнительных огромных оригиналов в public нет. Старое архивное irbis.jpg без лицензии/SHA отмечено отдельно в baseline.legacyReferences; в публичный каталог не включалось и не изменялось.

## Полная таблица 100 ID

«Кандидат найден» означает наличие поисковой находки, а не разрешение использовать её. Для прежних 43 фото повторная замена не проводилась.

| ID | Текущее состояние (до → после) | Фотокандидат | Источник | Лицензия | Решение | Причина отказа / ограничения |
|---|---|---|---|---|---|---|
| irbis | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Snow_leopard_family.jpg) | CC BY-SA 4.0 | сохранено | Без замены |
| argali | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Ovis_ammon_350434313.jpg) | CC0 1.0 | сохранено | Без замены |
| manul | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Otocolobus_manul.jpg) | CC BY-SA 4.0 | сохранено | Без замены |
| golden-eagle | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Golden_Eagle_flying.jpg) | CC BY 2.0 | сохранено | Без замены |
| bearded-vulture | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Gipeto_adulto.jpg) | CC BY-SA 4.0 | сохранено | Без замены |
| saker-falcon | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Falco_cherrug.jpg) | CC BY 3.0 | сохранено | Без замены |
| greigs-tulip | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Tulipa_greigii_(Aksu_Zhabagly_Nature_Reserve,_Kazakhstan).png) | CC BY-SA 4.0 | сохранено | Без замены |
| kaufmanns-tulip | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Tulipa_kaufmanniana2.jpg) | CC BY-SA 3.0 | сохранено | Без замены |
| sievers-apple | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Malus_sieversii_-_Botanical_Garden_in_Kaisaniemi,_Helsinki_-_DSC03582.JPG) | CC0 1.0 | сохранено | Без замены |
| central-asian-tortoise | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:%D0%9A%D0%BE%D0%BD%D0%B0%D0%B5%D0%B2%D1%81%D0%BA%D0%B8%D0%B9_%D0%BE%D0%BA%D1%80%D1%83%D0%B3,_%D1%87%D0%B5%D1%80%D0%B5%D0%BF%D0%B0%D1%85%D0%B0_(5).jpg) | CC BY-SA 4.0 | сохранено | Без замены |
| central-asian-frog | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Central_Asian_Frog_imported_from_iNaturalist_photo_198887129_on_9_January_2023.jpg) | CC BY 4.0 | сохранено | Без замены |
| predatory-bush-cricket | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Sagapedo_2.jpg) | CC BY-SA 3.0 | сохранено | Без замены |
| dog-stinkhorn | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Mutinus_caninus_3873978.jpg) | CC BY 4.0 | сохранено | Без замены |
| marbled-polecat | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Marbled_Polecat,_Sultansazl%C4%B1%C4%9F%C4%B1_Mill%C3%AE_Park%C4%B1,_Kayseri,_Turkey_1.jpg) | CC BY 4.0 | сохранено | Без замены |
| black-stork | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Black_stork_(Ciconia_nigra)_India.jpg) | CC BY-SA 4.0 | сохранено | Без замены |
| ibisbill | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Ibisbill_flying.jpg) | CC BY-SA 4.0 | сохранено | Без замены |
| eduards-fritillary | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Fritillaria_eduardii_2,_Elok,_Faizobod_District.jpg) | CC BY-SA 4.0 | сохранено | Без замены |
| european-glass-lizard | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:K._Kalaentzis_Pseudopus_apodus.jpg) | CC BY-SA 4.0 | сохранено | Без замены |
| dalmatian-pelican | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Krauskopfpelikan_(Pelecanus_crispus)_in_Mazedonien.jpg) | CC BY-SA 2.0 | сохранено | Без замены |
| eurasian-lynx | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Lynx_lynx-4.JPG) | Public domain | сохранено | Без замены |
| kolpakowskis-tulip | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Tulipa_kolpakowskiana_Regel_(Liliaceae)-1F.JPG) | Apache License 2.0 | сохранено | Без замены |
| ostrowskis-tulip | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Naziranildi_Ushkonyr_25.jpg) | CC BY-SA 4.0 | сохранено | Без замены |
| pike-asp | placeholder → placeholder | да, не допущен | [кандидат](https://www.gbif.org/occurrence/1057512046) | http://creativecommons.org/licenses/by/4.0/; Public domain | unresolved | Найдены почтовое изображение и страница музейного журнала, не фотография рыбы. |
| turkestan-catfish | placeholder → placeholder | да, не допущен | [кандидат](https://www.inaturalist.org/photos/379818708) | http://creativecommons.org/licenses/by/4.0/; http://creativecommons.org/licenses/by-nc/4.0/ | unresolved | Свободные фото GBIF исходно определены как Glyptosternon oschanini; в Commons также найден рисунок Exostoma stoliczkae. Подмена Glyptosternon reticulatum не допускается без подтверждения специалиста. |
| christophs-clouded-yellow | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Colias_christophi_christophi_male_03_dorsal_side_ZISP.jpg) | CC BY-SA 3.0 | сохранено | Без замены |
| relict-spider | placeholder → placeholder | не найден | — | — | unresolved | Подходящий точно определённый фотокандидат не найден в ограниченном поиске. |
| tien-shan-scutiger | placeholder → placeholder | не найден | — | — | unresolved | Точно определённая фотография Albatrellus tianschanicus с подтверждёнными правами не найдена. |
| menzbiers-marmot | placeholder → placeholder | да, не допущен | [кандидат](https://www.inaturalist.org/photos/531815648) | http://creativecommons.org/licenses/by-nc/4.0/; Public domain | unresolved | Найденные фотографии iNaturalist имеют CC BY-NC; марки не заменяют фотографию животного. |
| semenovs-fir | фото → фото | да | [страница](https://plant.depo.msu.ru/open/public/en/item/MW0895964) | CC BY 4.0 | сохранено | Без замены |
| great-bustard | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Great_bustard_(Otis_tarda_tarda)_female_in_flight.jpg) | CC BY-SA 4.0 | сохранено | Без замены |
| said-alievs-toad-agama | placeholder → placeholder | не найден | — | — | unresolved | Фотографии точного таксона с проверенной лицензией не найдены; родственные агамы не используются. |
| vigorous-ground-beetle | placeholder → placeholder | не найден | — | — | unresolved | Нет подходящей фотографии точно определённого Carabus validus. |
| pskem-onion | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Allium_pskemense_kz02.jpg) | CC BY-SA 4.0 | сохранено | Без замены |
| kostychevs-pasque-flower | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Pulsatilla_kostyczewii.JPG) | Public domain | сохранено | Без замены |
| indian-crested-porcupine | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Hystrix_indica_365302751.jpg) | CC BY 4.0 | сохранено | Без замены |
| fergana-ground-beetle | placeholder → placeholder | не найден | — | — | unresolved | Нет подходящей фотографии точно определённого Carabus ferghanicus. |
| giant-robber-fly | фото → фото | да | [страница](https://www.inaturalist.org/photos/106836074) | CC BY 4.0 | сохранено | Без замены |
| korzhinskys-pear | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Pyrus_korshinskyi_(Kazakh_Pear)_in_blossom.jpg) | CC BY-SA 4.0 | сохранено | Без замены |
| cinereous-vulture | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Cinereous_Vulture_in_Jodbeed_Gadhwala_Conservation_Reserve_November_2025_by_Tisha_Mukherjee_01.jpg) | CC BY-SA 4.0 | сохранено | Без замены |
| egyptian-vulture | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Neophron-1.jpg) | CC BY-SA 4.0 | сохранено | Без замены |
| eminium-regelii | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Eminium_regelii_(Flora_of_Tajikistan).png) | CC BY 4.0 | сохранено | Без замены |
| eremurus-zenaidae | placeholder → фото | да | [страница](https://www.gbif.org/occurrence/1798984809) | CC BY 4.0 | добавлено | Коллекционный образец; см. подпись |
| eremurus-zoae | placeholder → фото | да | [страница](https://www.gbif.org/occurrence/890174658) | CC0 | добавлено | Коллекционный образец; см. подпись |
| allium-dodecadontum | placeholder → фото | да | [страница](https://www.gbif.org/occurrence/4538769806) | CC BY 4.0 | добавлено | Коллекционный образец; см. подпись |
| allium-semenovii | placeholder → фото | да | [страница](https://www.gbif.org/occurrence/5938499084) | CC0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| tulipa-affinis | placeholder → фото | да | [страница](https://www.gbif.org/occurrence/5760160153) | CC BY 4.0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| tulipa-korolkowii | placeholder → фото | да | [страница](https://www.gbif.org/occurrence/1798987403) | CC BY 4.0 | добавлено | Коллекционный образец; см. подпись |
| tulipa-platystemon | placeholder → фото | да | [страница](https://www.gbif.org/occurrence/1798987500) | CC BY 4.0 | добавлено | Коллекционный образец; см. подпись |
| tulipa-tetraphylla | placeholder → фото | да | [страница](https://www.gbif.org/occurrence/4891787049) | CC BY 4.0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| tulipa-zenaidae | placeholder → placeholder | да, не допущен | [кандидат](https://www.inaturalist.org/photos/628215659) | http://creativecommons.org/licenses/by-nc/4.0/; Public domain; CC BY 2.0 | unresolved | Названия/категории Commons и агрегированный GBIF taxon могут указывать Tulipa lehmanniana, тогда как исходные определения ряда наблюдений — Tulipa behmiana. Требуется проверка ботаника; автоматически не отождествляются. |
| juno-orchioides | placeholder → фото | да | [страница](https://www.gbif.org/occurrence/6251520992) | CC BY 4.0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| iridodictyum-kolpakowskianum | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Iridodictyum_kolpakowskianum.jpg) | CC BY 2.0 | сохранено | Без замены |
| thesium-minkwitzianum | placeholder → фото | да | [страница](https://www.gbif.org/occurrence/1798990591) | CC BY 4.0 | добавлено | Коллекционный образец; см. подпись |
| delphinium-knorringianum | placeholder → placeholder | не найден | — | — | unresolved | Подходящая фотография точного таксона с подтверждёнными правами не найдена. |
| urocerus-sah | placeholder → фото | да | [страница](https://www.gbif.org/occurrence/5890192818) | CC BY 4.0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| masaris-longicornis | placeholder → placeholder | не найден | — | — | unresolved | Подходящая фотография не найдена; дополнительный запрос категории Commons остановлен после HTTP 429 без обхода ограничения. |
| varanus-griseus-caspius | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Varanus_griseus_caspius_Kattakum2_(1).jpg) | CC BY-SA 4.0 | сохранено | Без замены |
| lyrurus-tetrix | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Birkhahn.jpg) | CC BY-SA 3.0 | сохранено | Без замены |
| cygnus-cygnus | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Cygnus_cygnus_070416_IOL.jpg) | CC BY-SA 3.0 | сохранено | Без замены |
| aythya-nyroca | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Ferruginous_Pochard_Aythya_nyroca_Male_by_Dr._Raju_Kasambe_DSCN2746_(12).jpg) | CC BY-SA 4.0 | сохранено | Без замены |
| mergus-serrator | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Mergus_serrator_-New_Jersey_-USA_-winter-8.jpg) | CC BY-SA 2.0 | сохранено | Без замены |
| oxyura-leucocephala | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Oxyura_leucocephala,_Clot-de-Galvany,_Alicante_16.jpg) | CC BY-SA 2.0 | сохранено | Без замены |
| gavia-arctica | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Gavia_arctica_(Black-throated_Loon_or_Black-throated_Diver)_on_nest.jpg) | CC BY 2.0 | сохранено | Без замены |
| ciconia-ciconia | placeholder → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Ciconia_ciconia_-_01.jpg) | CC BY-SA 3.0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| platalea-leucorodia | placeholder → фото | да | [страница](https://commons.wikimedia.org/wiki/File:%D0%9A%D0%BE%D1%81%D0%B0%D1%80%D1%96_%D0%B2_%D0%B4%D0%B5%D0%BB%D1%8C%D1%82%D1%96_%D0%94%D1%83%D0%BD%D0%B0%D1%8E.jpg) | CC BY-SA 4.0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| pelecanus-onocrotalus | placeholder → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Pelikan_Walvis_Bay.jpg) | CC BY 2.0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| phalacrocorax-pygmaeus | placeholder → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Microcarbo_pygmaeus_-_Pygmy_cormorant.jpg) | CC BY-SA 4.0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| falco-naumanni | placeholder → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Falco_naumanni_154137489.jpg) | CC BY 4.0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| falco-rusticolus | placeholder → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Falco_rusticolus_white_cropped.jpg) | CC BY-SA 2.0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| pandion-haliaetus | placeholder → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Pandion_haliaetus_-_Osprey.jpg) | CC BY-SA 4.0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| haliaeetus-leucoryphus | placeholder → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Pallas%27s_Fish-eagle_Haliaeetus_leucoryphus_by_Dr._Raju_Kasambe_IMG_0582_(10).CR2.JPG) | CC BY-SA 4.0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| haliaeetus-albicilla | placeholder → фото | да | [страница](https://commons.wikimedia.org/wiki/File:White_tailed_eagle_raftsund_square_crop.jpg) | CC BY 4.0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| gyps-himalayensis | placeholder → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Himalayan_Vulture_(by_a_road)_(2926948182).jpg) | CC BY 2.0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| gyps-fulvus | placeholder → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Gyps_fulvus_-Basque_Country-8.jpg) | CC BY-SA 2.0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| circaetus-gallicus | placeholder → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Circaetus_gallicus_-_Short-toed_snake-eagle%C4%B1_02-1.jpg) | CC BY-SA 4.0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| circus-macrourus | placeholder → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Pallid_Harrier_imported_from_iNaturalist_photo_389994827_on_16_June_2024.jpg) | CC BY 4.0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| neomys-fodiens | placeholder → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Neomys_fodiens_(Varsinais-Suomi,_Finland)_1.jpg) | CC BY-SA 4.0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| rhinolophus-bocharicus | placeholder → фото | да | [страница](https://www.gbif.org/occurrence/6334155860) | CC BY 4.0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| barbastella-leucomelas | placeholder → placeholder | да, не допущен | [кандидат](https://www.gbif.org/occurrence/4155636538) | http://creativecommons.org/licenses/by-nc-sa/4.0/; http://creativecommons.org/publicdomain/zero/1.0/; Public domain | unresolved | Найдены спектрограмма с NC и музейные журналы CC0, но не фотография самой летучей мыши. Подвид/популяция не подменяются. |
| tadarida-teniotis | placeholder → фото | да | [страница](https://www.gbif.org/occurrence/5062777348) | CC BY 4.0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| ursus-arctos | placeholder → фото | да | [страница](https://www.gbif.org/occurrence/6234168737) | CC BY 4.0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| martes-foina | placeholder → фото | да | [страница](https://www.gbif.org/occurrence/6130572313) | CC BY 4.0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| lutra-lutra | placeholder → фото | да | [страница](https://www.gbif.org/occurrence/5938148785) | CC BY 4.0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| allactaga-elater | placeholder → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Allactaga_elater_Plzen_zoo_02.2011.jpg) | CC BY-SA 3.0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| dictyocephalus-attenuatus | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:StalkdPuffb_0012.jpg) | CC BY-SA 3.0 | сохранено | Без замены |
| prionus-tschitscherini | placeholder → placeholder | да, не допущен | [кандидат](https://www.inaturalist.org/photos/219882251) | http://creativecommons.org/licenses/by-nc/4.0/; Public domain | unresolved | Фотография Pogonarthron tschitscherini имеет CC BY-NC. Портрет энтомолога из Commons отклонён. |
| rossomyrmex-proformicarum | placeholder → фото | да | [страница](https://www.antweb.org/specimenImages.do?name=casent0178514) | CC BY 4.0 | добавлено | Коллекционный образец; см. подпись |
| barbus-brachycephalus | placeholder → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Luciobarbus_brachycephalus_1.jpg) | CC BY-SA 4.0 | добавлено | Иллюстрация документированного вида; не подтверждает местный подвид |
| allochrusa-gypsophiloides | placeholder → фото | да | [страница](https://www.gbif.org/occurrence/1798999903) | CC BY 4.0 | добавлено | Коллекционный образец; см. подпись |
| corydalis-pseudoadunca | placeholder → фото | да | [страница](https://www.gbif.org/occurrence/5910609069) | CC BY 4.0 | добавлено | Коллекционный образец; см. подпись |
| fumariola-turkestanica | placeholder → фото | да | [страница](https://www.gbif.org/occurrence/1799004881) | CC BY 4.0 | добавлено | Коллекционный образец; см. подпись |
| rhodiola-litwinowii | placeholder → фото | да | [страница](https://www.gbif.org/occurrence/1697330368) | CC BY 4.0 | добавлено | Коллекционный образец; см. подпись |
| sibiraea-tianschanica | placeholder → фото | да | [страница](https://www.gbif.org/occurrence/3004115426) | CC BY 4.0 | добавлено | Коллекционный образец; см. подпись |
| crataegus-knorringiana | placeholder → placeholder | да, не допущен | [кандидат](https://www.inaturalist.org/photos/310934409) | http://creativecommons.org/licenses/by-nc/4.0/ | unresolved | Найденная фотография iNaturalist имеет CC BY-NC 4.0. |
| ammopiptanthus-nanus | placeholder → фото | да | [страница](https://www.gbif.org/occurrence/1799014190) | CC BY 4.0 | добавлено | Коллекционный образец; см. подпись |
| colutea-brachyptera | placeholder → фото | да | [страница](https://www.gbif.org/occurrence/1799015268) | CC BY 4.0 | добавлено | Коллекционный образец; см. подпись |
| primula-eugeniae | placeholder → placeholder | да, не допущен | [кандидат](https://www.gbif.org/occurrence/3440006443) | http://creativecommons.org/licenses/by-sa/4.0/ | unresolved | Гербарный фотокандидат C.542927 имеет CC BY-SA 4.0, но в записи media отсутствуют автор и правообладатель; нужна проверка атрибуции и этикетки. |
| physochlaina-alaica | placeholder → фото | да | [страница](https://www.gbif.org/occurrence/912519006) | CC BY 4.0 | добавлено | Коллекционный образец; см. подпись |
| incarvillea-olgae | фото → фото | да | [страница](https://commons.wikimedia.org/wiki/File:Incarvillea_olgae_Inkarwilla_Olgi_2020-07-22_02.jpg) | CC BY-SA 4.0 | сохранено | Без замены |
| saussurea-involucrata | placeholder → фото | да | [страница](https://www.gbif.org/occurrence/1697343677) | CC BY 4.0 | добавлено | Коллекционный образец; см. подпись |

## Нерешённые случаи и прямые ссылки

### pike-asp — Aspiolucius esocinus

Найдены почтовое изображение и страница музейного журнала, не фотография рыбы.

- [Кандидат / запись источника](https://www.gbif.org/occurrence/1057512046) — Aspius esocinus Kessler, 1874; http://creativecommons.org/licenses/by/4.0/.
- [Кандидат / запись источника](https://commons.wikimedia.org/wiki/File:Aspiolucius_esocinus.jpg) — File:Aspiolucius esocinus.jpg; Public domain.
- [Кандидат / запись источника](https://commons.wikimedia.org/wiki/File:Aspiolucius_esocinus_2021_cover_of_Kyrgyzstan.jpg) — File:Aspiolucius esocinus 2021 cover of Kyrgyzstan.jpg; Public domain.

### turkestan-catfish — Glyptosternon reticulatum

Свободные фото GBIF исходно определены как Glyptosternon oschanini; в Commons также найден рисунок Exostoma stoliczkae. Подмена Glyptosternon reticulatum не допускается без подтверждения специалиста.

- [Кандидат / запись источника](https://www.inaturalist.org/photos/379818708) — Glyptosternon oschanini (Herzenstein, 1889); http://creativecommons.org/licenses/by/4.0/.
- [Кандидат / запись источника](https://www.inaturalist.org/photos/379818743) — Glyptosternon oschanini (Herzenstein, 1889); http://creativecommons.org/licenses/by/4.0/.
- [Кандидат / запись источника](https://www.inaturalist.org/photos/379818781) — Glyptosternon oschanini (Herzenstein, 1889); http://creativecommons.org/licenses/by/4.0/.
- [Кандидат / запись источника](https://www.inaturalist.org/photos/426239666) — Glyptosternon oschanini (Herzenstein, 1889); http://creativecommons.org/licenses/by-nc/4.0/.

### relict-spider — Tricholathys relicta

Подходящий точно определённый фотокандидат не найден в ограниченном поиске.

Подходящий прямой фотокандидат не найден; сохранены отрицательные ответы поиска в task23-photo-search-*.json и task23-gbif-search.json.

### tien-shan-scutiger — Albatrellus tianschanicus

Точно определённая фотография Albatrellus tianschanicus с подтверждёнными правами не найдена.

Подходящий прямой фотокандидат не найден; сохранены отрицательные ответы поиска в task23-photo-search-*.json и task23-gbif-search.json.

### menzbiers-marmot — Marmota menzbieri

Найденные фотографии iNaturalist имеют CC BY-NC; марки не заменяют фотографию животного.

- [Кандидат / запись источника](https://www.inaturalist.org/photos/531815648) — Marmota menzbieri (Kashkarov, 1925); http://creativecommons.org/licenses/by-nc/4.0/.
- [Кандидат / запись источника](https://www.inaturalist.org/photos/395629308) — Marmota menzbieri (Kashkarov, 1925); http://creativecommons.org/licenses/by-nc/4.0/.
- [Кандидат / запись источника](https://www.inaturalist.org/photos/347458480) — Marmota menzbieri (Kashkarov, 1925); http://creativecommons.org/licenses/by-nc/4.0/.
- [Кандидат / запись источника](https://commons.wikimedia.org/wiki/File:1987_CPA_5828.jpg) — File:1987 CPA 5828.jpg; Public domain.

### said-alievs-toad-agama — Phrynocephalus saidalievi

Фотографии точного таксона с проверенной лицензией не найдены; родственные агамы не используются.

Подходящий прямой фотокандидат не найден; сохранены отрицательные ответы поиска в task23-photo-search-*.json и task23-gbif-search.json.

### vigorous-ground-beetle — Carabus validus

Нет подходящей фотографии точно определённого Carabus validus.

Подходящий прямой фотокандидат не найден; сохранены отрицательные ответы поиска в task23-photo-search-*.json и task23-gbif-search.json.

### fergana-ground-beetle — Carabus ferghanicus

Нет подходящей фотографии точно определённого Carabus ferghanicus.

Подходящий прямой фотокандидат не найден; сохранены отрицательные ответы поиска в task23-photo-search-*.json и task23-gbif-search.json.

### tulipa-zenaidae — Tulipa lehmanniana

Названия/категории Commons и агрегированный GBIF taxon могут указывать Tulipa lehmanniana, тогда как исходные определения ряда наблюдений — Tulipa behmiana. Требуется проверка ботаника; автоматически не отождествляются.

- [Кандидат / запись источника](https://www.inaturalist.org/photos/628215659) — Tulipa lehmanniana Merckl.; http://creativecommons.org/licenses/by-nc/4.0/.
- [Кандидат / запись источника](https://www.inaturalist.org/photos/633691757) — Tulipa zenaidae Vved.; http://creativecommons.org/licenses/by-nc/4.0/.
- [Кандидат / запись источника](https://www.inaturalist.org/photos/633691799) — Tulipa zenaidae Vved.; http://creativecommons.org/licenses/by-nc/4.0/.
- [Кандидат / запись источника](https://www.inaturalist.org/photos/636374441) — Tulipa behmiana Regel; http://creativecommons.org/licenses/by-nc/4.0/.

### delphinium-knorringianum — Delphinium knorringianum

Подходящая фотография точного таксона с подтверждёнными правами не найдена.

Подходящий прямой фотокандидат не найден; сохранены отрицательные ответы поиска в task23-photo-search-*.json и task23-gbif-search.json.

### masaris-longicornis — Masaris longicornis

Подходящая фотография не найдена; дополнительный запрос категории Commons остановлен после HTTP 429 без обхода ограничения.

Подходящий прямой фотокандидат не найден; сохранены отрицательные ответы поиска в task23-photo-search-*.json и task23-gbif-search.json.

### barbastella-leucomelas — Barbastella leucomelas

Найдены спектрограмма с NC и музейные журналы CC0, но не фотография самой летучей мыши. Подвид/популяция не подменяются.

- [Кандидат / запись источника](https://www.gbif.org/occurrence/4155636538) — Barbastella leucomelas (Cretzschmar, 1826); http://creativecommons.org/licenses/by-nc-sa/4.0/.
- [Кандидат / запись источника](https://www.gbif.org/occurrence/1319535445) — Barbastella leucomelas (Cretzschmar, 1826); http://creativecommons.org/publicdomain/zero/1.0/.
- [Кандидат / запись источника](https://www.gbif.org/occurrence/1321871552) — Barbastella leucomelas (Cretzschmar, 1826); http://creativecommons.org/publicdomain/zero/1.0/.
- [Кандидат / запись источника](https://commons.wikimedia.org/wiki/File:Vespertilio_leucomelas.jpg) — File:Vespertilio leucomelas.jpg; Public domain.

### prionus-tschitscherini — Pogonarthron tschitscherini

Фотография Pogonarthron tschitscherini имеет CC BY-NC. Портрет энтомолога из Commons отклонён.

- [Кандидат / запись источника](https://www.inaturalist.org/photos/219882251) — Pogonarthron tschitscherini (Semenov, 1890); http://creativecommons.org/licenses/by-nc/4.0/.
- [Кандидат / запись источника](https://commons.wikimedia.org/wiki/File:Tschitscherin.png) — File:Tschitscherin.png; Public domain.

### crataegus-knorringiana — Crataegus knorringiana

Найденная фотография iNaturalist имеет CC BY-NC 4.0.

- [Кандидат / запись источника](https://www.inaturalist.org/photos/310934409) — Crataegus knorringiana Pojark.; http://creativecommons.org/licenses/by-nc/4.0/.

### primula-eugeniae — Primula eugeniae

Гербарный фотокандидат C.542927 имеет CC BY-SA 4.0, но в записи media отсутствуют автор и правообладатель; нужна проверка атрибуции и этикетки.

- [Кандидат / запись источника](https://www.gbif.org/occurrence/3440006443) — Primula eugeniae Fed.; http://creativecommons.org/licenses/by-sa/4.0/.

## Размеры и коммиты

Размеры — сумма файлов, в байтах; assets включает прежние приватные материалы, dist — полный результат сборки.

| Каталог | До | После |
|---|---:|---:|
| assets | 11171580 | 20948768 |
| dist | 12565924 | 22403647 |

Промежуточные коммиты (пять законченных партий; дополнительный тушканчик сохранён с третьей):

- `57f17c10903a66e5f0f03292463677a415ba57a6 feat(photos): restore first 12 catalog photographs`
- `e3c8a1c6e5764d234277f30346cc140613b4bd23 feat(photos): restore nine catalog animal and herbarium images`
- `545d821db6c09ed08418ae09609cf0f83ad9c12c feat(photos): illustrate nine plants and resolve jerboa photo`
- `117dce3dec3f1ed2fbff43a1a4b351ae29727a71 feat(photos): add eight documented herbarium illustrations`
- `18807c5879cf53cabf24c59600243288e6230199 feat(photos): illustrate barbel and two arthropod species`

Итоговый коммит проверки и отчёта указан в сообщении о завершении; собственный хеш не встраивается в изменяемый им файл. Merge, push и deployment не выполнялись.
