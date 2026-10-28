# MURAS №26.2B — исправление тестов первой партии изображений

Дата: 2026-10-28, Asia/Bishkek. Ветка: feature/release-preparation. Исходный HEAD: ffca52781c27b08f5c889dd417d781e2d4854663; начальный Git status чистый. Фактический репозиторий: C:/Users/Asus/Desktop/Muras.

**Результат: 341/341 тестов, 0 ошибок, 0 skip, 0 todo. Каталог 184, архив 2; 158 записей с изображениями, 26 placeholder. Все 12 добавленных изображений сохранены: 8 фотографий и 4 гербария.** Научные данные, фотографии, лицензии и прежние исследовательские журналы в этой задаче не изменялись.

## Диагностика семи исходных ошибок

Повторный полный npm test на исходном HEAD подтвердил 324 pass / 7 fail из 331. Полный подробный вывод сохранён в .generated/catalog-184-photo-test-fix/npm-test-before.log; он включает actual/expected и stack trace каждой ошибки. Журнал игнорируется Git и не заменяет приведённую ниже диагностику.

| № исходного теста | Имя и файл | Контракт; ожидание и фактический результат | Причина и решение |
|---|---|---|---|
| 77 | a repeat of the same owner decision is a read-only dry-run with zero additions and 25 unchanged records; tests/catalog-150-publication.test.mjs:131 | Ожидались processed 25 / added 0 / unchanged 25 / rejected 0; фактически исключение «barbus-capito-conocephalus: нет актуального технического допуска без научного одобрения». | Старое решение №24.4 содержит исходный пустой images. checkRegistry сравнивает весь черновик с нынешней записью, имеющей отдельное позднее фото. Отказ импортёра корректен; исторический replay перенесён на уже сохранённый неизменённый 150-record source из data/backups/catalog-166. |
| 81 | the same owner decision repeats as a read-only dry-run with zero additions and all 16 unchanged; tests/catalog-166-publication.test.mjs:145 | Ожидались 16 / 0 / 16 / 0; фактически такой же отказ для sorbus-persica. | Исходный пакет №25.3 не включает новое изображение. Replay выполняется на прежнем 166-record source из data/backups/catalog-178; старые fingerprints и решение сохранены. |
| 86 | replaying the actual owner decision is read-only and returns zero additions and 12 unchanged; tests/catalog-178-publication.test.mjs:146 | Ожидались 12 / 0 / 12 / 0; фактически отказ для berberis-kaschgarica. | Решение №25.7 привязано к исходным изображениям. Использован существующий 178-record source из data/backups/catalog-184. |
| 88 | catalog 184 preserves all prior 178 objects, archive, assets and research and imports exactly the authorized 6; tests/catalog-184-publication.test.mjs:34 | Ожидалось полное равенство прежних 178 объектов снимку до импорта; фактически у 9 из них появились первые изображения. Также три из последних шести теперь имеют отдельно добавленные images. | Научные поля совпадают, но сравнение исторического релиза с живым каталогом смешивало разные даты. Исторический релиз 184 читается из неизменяемого Git-объекта 63f8e43d7d6b504079412c03c7cbf6eda421567a с прежними проверенными SHA-256. Отдельная новая проверка сопоставляет живой каталог с этой базой и допускает ровно документированные первые изображения. |
| 89 | 184 live records have complete pagination, four-language search, routes, filters and unchanged licensed assets; tests/catalog-184-publication.test.mjs:88 | Первая ошибка: actual 4 !== expected 1 изображению среди последних шести. Остальные исторические ожидания: 5 placeholder в шестёрке и 146 медиа во всём каталоге; нынешние числа соответственно 2 и 158. | Исторические числа 1/5/146 оставлены без изменения и проверяют исторический source/public. Текущий каталог отдельно проверяется на 158/26, поиск, фильтры, маршруты и пагинацию 24/24/24/24/24/24/24/16. |
| 91 | replaying the actual owner decision is read-only and returns zero additions and 6 unchanged; tests/catalog-184-publication.test.mjs:144 | Ожидались 6 / 0 / 6 / 0; фактически отказ для sorbaria-olgae. | Решение №25.11 не разрешает автоматически новую версию объекта с фото. Исторический replay теперь использует исходный 184-record source. Импортёр и правила допуска не изменены. |
| 150 | licensed assets are local WebP, have declared dimensions, captions and matching fingerprints; tests/data.test.mjs:240, assertion 266 | Ожидалось true для конкретного разрешённого источника/фото-журнала; фактически false. Размеры и байты WebP сами по себе прошли до этой проверки. | Тест читал только прежние журналы и manifests, новый catalog-184-photo-batch-1.json отсутствовал. Теперь его записи принимаются после строгой сверки исходного пустого массива, научных полей, конкретных первичных лицензий, авторов, связи каталог/журнал и байтов обоих WebP. Общий domain allowlist не расширялся. |

Для четырёх отказов цепочка: publication test → scripts/bulk-pipeline.mjs → scripts/lib/provisional-publication.mjs → checkRegistry в scripts/lib/research-pipeline.mjs. Участвуют data/species.source.json, соответствующие неизменённые registry/manifest/draft и data/research/publication-decisions/muras-24-4-, muras-25-3-, muras-25-7-, muras-25-11-owner-provisional.json. Ни один из этих пакетов или алгоритмов не исправлялся ради зелёного результата.

Это разные причины: четыре защитных отказа импортёра являются правильным поведением при неверно выбранной живой базе теста; два сравнения использовали исторические ожидания для изменённого состава медиа; один тест не интегрировал новый доказательный журнал. После отдельной проверки файлов, лицензий и научной идентичности нарушений, требующих снятия этих 12 изображений с публикации, не обнаружено.

## Сохранённые исторические гарантии

Изменены только пять существующих test-файлов; добавлены tests/helpers/photo-amendment.mjs и tests/catalog-184-photo-batch-1.test.mjs. Использован существующий historicalPipeline: изолированная временная копия получает подлинный исторический source, replay выполняется в dry-run, затем копия удаляется штатным finally. Разрешение владельца заново не создаётся.

Старые snapshots, manifests, draft fingerprints и зафиксированные SHA-256 не обновлялись. Полные старые изображения и лицензии продолжают сравниваться с исходными массивами и реальными байтами. Живые научные поля всех 184 объектов сравниваются целиком без images; архив и прочие корневые поля сравниваются целиком.

Checksum старого test-кода, который теперь законно изменяется, проверяется по его подлинному историческому Git-объекту; данные, research и assets в тех же циклах по-прежнему проверяются в рабочем каталоге. Windows baseline хранит исходные рабочие байты: при необходимости восстанавливаются CRLF только с обязательным совпадением прежнего фиксированного SHA. У исторического tests/catalog-166-publication.test.mjs единственный CRLF был в строке 22; этот конкретный исходный формат также воспроизводится и проверяется по прежнему SHA. Старые контрольные суммы не заменены новыми.

Новый журнал закреплён за Git-объектом ffca52781c27b08f5c889dd417d781e2d4854663. Переписывание его лицензий, первичных доказательств или хешей не становится новым основанием для публикации. Первое изображение разрешается только у одной из ровно 12 существующих записей с исходным images: []; старый непустой массив должен совпасть полностью. Изолированные исторические оригиналы с неизвестной лицензией остаются в backup, проверяются побайтно и не допускаются в public.

Новый отрицательный replay тест использует все четыре старых решения на живом каталоге: каждый вызов по-прежнему отвергается, tracked-файлы не изменяются. Поведение защищённого импортёра сохранено.

## Повторный аудит 12 изображений

Изучены docs/research/catalog-184-photo-audit.md и data/research/catalog-184-photo-audit.json, а также оба отчёта/журнала catalog-184-photo-batch-1. Все 12 опубликованных файлов визуально просмотрены повторно. Проверены 12 локальных оригиналов и 24 WebP (assets/public): полный Pillow decode, размеры, исходные и опубликованные SHA-256. Нового поиска изображений не было.

| ID | Принятое имя каталога | Тип | Авторство | Источник и лицензия | WebP |
|---|---|---|---|---|---|
| vipera-ursinii-renardi | Vipera renardi | Фотография | Matvey | [Источник](https://commons.wikimedia.org/wiki/File:Juvenile_Vipera_renardi_retreating.jpg), [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 1800×1013 |
| cervus-elaphus-asiaticus | Cervus canadensis | Фотография | Dmitry A. Mottl | [Источник](https://commons.wikimedia.org/wiki/File:Altai_maral_2.jpg), [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 1800×1200 |
| sorbaria-olgae | Sorbaria tomentosa | Фотография | Sten Porse | [Источник](https://commons.wikimedia.org/wiki/File:Sorbaria-tomentosa-flowers.JPG), [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 1232×792 |
| campanula-eugeniae | Campanula eugeniae | Гербарий | Royal Botanic Gardens, Kew (правообладатель коллекции; фотограф не указан) | [Источник](https://www.gbif.org/occurrence/5058366279), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | 1350×1800 |
| sorbus-persica | Hedlundia persica | Гербарий | ELAR corporation (Moscow, Russia); Moscow State University (правообладатель) | [Источник](https://plant.depo.msu.ru/open/public/item/MW0839339), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | 1276×1800 |
| berberis-kaschgarica | Berberis ulicina | Гербарий | Ingrid P. Lin; Smithsonian Institution, National Museum of Natural History (коллекция) | [Источник](https://www.gbif.org/occurrence/1320618564), [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 1368×1800 |
| dorema-microcarpum | Ferula namanganica | Фотография | Komiljon Sh. Tojibaev et al. (2022; авторский коллектив статьи) | [Источник](https://natureconservation.pensoft.net/article/84834/), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | 493×880 |
| tianschaniella-umbellifera | Tianschaniella umbellulifera | Гербарий | Royal Botanic Garden Edinburgh (коллекция и поставщик изображения; фотограф не указан) | [Источник](https://www.gbif.org/occurrence/1061254332), [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 1280×1800 |
| eryx-tataricus | Eryx miliaris | Фотография | Benny Trapp | [Источник](https://commons.wikimedia.org/wiki/File:BennyTrapp_Eryx_miliaris.jpg), [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) | 1800×1129 |
| allactaga-saltator | Orientallactaga sibirica | Фотография | Jan Ebr & Ivana Ebrová | [Источник](https://commons.wikimedia.org/wiki/File:Orientallactaga_sibirica.jpg), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | 1453×1260 |
| sonjagaster-coronatus | Thecagaster coronata | Фотография | Askar Akhmedov | [Источник](https://www.inaturalist.org/photos/519688055), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | 1355×1800 |
| barbus-capito-conocephalus | Luciobarbus conocephalus | Фотография | Murodjon Rakhmonov | [Источник](https://www.inaturalist.org/photos/390287886), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | 1800×811 |

По каждому из 12 первичных URL получен HTTP 200 и повторно проверены конкретные сведения. Commons: совпали revision ID, авторские сведения и лицензии пяти файлов. Для четырёх гербариев проверен media.license именно выбранного StillImage, идентификатор образца и принятое имя; лицензия occurrence/dataset вместо лицензии фото не использовалась. Для двух iNaturalist проверены конкретный photo ID, cc-by, species-level determination и research grade, а версия CC BY 4.0 дополнительно подтверждена точным медиа в соответствующей записи GBIF. Для Dorema повторно получен XML статьи: SHA совпал с сохранённым, лицензия CC BY 4.0 и привязка к Figure 3A подтверждены.

Особые ограничения:

- Cervus canadensis, Sorbaria tomentosa, Eryx miliaris и Vipera renardi сверены с уже принятыми видовыми концепциями каталога. Изображения не определяют исторические местные формы asiaticus, olgae, tataricus или старый национальный подвид. Это прямо отражено в captions; научные имена и ранги не менялись для подгонки под фотографии. Снимок алтайского марала документирован Commons как C. canadensis sibiricus и используется на уровне принятого в MURAS вида C. canadensis.
- Berberis kaschgarica → B. ulicina, Sorbus persica → Hedlundia persica и Dorema microcarpum → Ferula namanganica связаны с уже сохранёнными таксономическими решениями. Tianschaniella umbellifera на этикетке E00714915 — документированное историческое написание принятого T. umbellulifera.
- У Thecagaster GBIF агрегирует наблюдение на уровне рода; вид взят из точного первичного iNaturalist-наблюдения 288955114 с несколькими текущими species-level identifications, а не из родового GBIF taxon ID.
- На цветовых шкалах Kew, NMNH и RBGE видна старая copyright/all rights reserved надпись. Она не удалялась. Основание повторного использования — явная отдельная лицензия конкретного цифрового файла, опубликованная учреждением через media.license. Это подтверждение разрешения на цифровой файл, а не вывод о свободе всего сайта или всех коллекций.
- У Kew и RBGE индивидуальный фотограф не назван: сохранено честное указание коллекции/правообладателя. Dorema имеет авторскую атрибуцию статьи, DOI, Figure 3A и указание выделения панели; отдельный фотограф не выдуман. Краткая библиографическая форма Tojibaev et al. в attribution и расширенное пояснение роли коллектива в author описывают один и тот же кредит.
- Все определения ограничены доказательствами источников. Независимая таксономическая экспертиза и современное состояние кыргызстанских популяций этой проверкой не устанавливаются. Прежние verified, scientificReviewStatus, lastReviewedAt, nationalRedBook и population сохранены.

### Исходные и итоговые SHA-256

Полные URL оригиналов, primaryEvidence, оригинальные размеры, лицензии и размеры файлов сохранены в неизменённом data/research/catalog-184-photo-batch-1.json. Все пары хешей ниже пересчитаны по локальным файлам; опубликованные копии имеют те же WebP SHA.

| ID | Оригинал SHA-256 | WebP SHA-256 |
|---|---|---|
| vipera-ursinii-renardi | eed3c605359b9276d251272866d716b14b5974c185bdb3e49ba41faace13a10a | bc5ba72ae5500b79fcf276a4e8ac3b20667a6c7252c3b9644a1726c64339feb8 |
| cervus-elaphus-asiaticus | 79e5973166b2af39b7abda3c4a05c2e73579c9b9cbd940ea4ccd89a5bc337913 | 5924cdd5e75c79c3e5cd020f1ca1ba4597d950dd1a0dc6f00417249de9e04d52 |
| sorbaria-olgae | df893cabbf454d438199dffb66315666339a0a6ade3ec59e138b68cc827ff184 | 0a4f23ee21bbb0ad169618006f711688b62ee4bf0868b15b89ef2c6a98213ea8 |
| campanula-eugeniae | 04ec4039fd7823d525093dfe00e1d0389ac26783db77f8355021fe6c6599ce36 | 6d721dd475db7ffa8481a824c8635ad710066436907c5e3b033361348b453962 |
| sorbus-persica | d71c1a60a994b57a30bd6b02cf05ab9dd15f4fea474ad256bac4a00240367496 | ba3ba124886b567765ea065b1060351ecd04a2cc13e340535282eee85e0e583d |
| berberis-kaschgarica | dfc2a894c0d4b7311ad19af1687b0a1a104191e5a5e4eed38b099397c8dfa4ff | a36568be9db9c2a4ee9b4ed5b95e75d05d1731343e157af0681c820ed1e7ad47 |
| dorema-microcarpum | 33679346d8848a4ce4367d392e6cd1f827117c1be4097be957ce878a0b176233 | 230d8889e36d41daf1cff843426656b7e7fb509a670472a6c559b4960b196f2d |
| tianschaniella-umbellifera | 52f604f86fa62fd3bca8de54a2a5ea7c193239c8568dcc8a70499d6590b3f11a | 32ac313c1422e57f35c49cdfebcee6bb93149c3c7ba2197d47c22db43b21fec8 |
| eryx-tataricus | c86a0e4226be1de9b2d2319be2630c20455c4949c6f333c14faf6d414da1e535 | 9a41582f445496593e0e45c70ebd925f22fbd877173e02d15b4050753a8bfd2c |
| allactaga-saltator | 6ff7d0cd9f171c1e712821516bcbfa0b9972af148d1f67110c4f2b8529bac1e8 | de8aca33682df2fbdfd80dc0f349f4de11dd5dfe51ddf2e354706f1fae94b01c |
| sonjagaster-coronatus | 9bcd528bb489891aae26c80bbce2f8faac668ec8f1bf5dfc66be694c231bbf6d | 68ce232be7d7a583b862fcc8932c1a4705ffe9f844cefed4c280cf044f46fe41 |
| barbus-capito-conocephalus | e04ddfd779065ad25871bb54cf07ac7ce7701289d17c5d39f9aa2a042e64c18b | fd0a7fed77d2a97f1ece26a424a75880decd90d80939fe24d8c1915d4de4fde9 |

Исходный Kew JPEG имеет 101756928 пикселей. Pillow выдал штатное DecompressionBombWarning; файл полностью декодирован, лимит не отключался. Повреждений нет.

## Регрессии

Добавлены 10 тестов, покрывающие все семь требуемых гарантий и интеграцию:

1. Все научные поля, архив, 146 прежних image arrays и старые байты неизменны.
2. Фото-событие не разрешает изменение науки/архива, даже после переписывания scientificFingerprint.
3. Замена старого массива, source или public WebP отклоняется.
4. Добавление допускается только к исторически пустому массиву; повторное событие не принимается.
5. Каждый новый файл требует собственных имени, original SHA и первичного разрешения конкретного медиа.
6. Повреждение любой из 24 новых копий вызывает ошибку. Подмена другим корректным WebP с пересчитанными хешами/размерами и переписанным журналом тоже отклоняется.
7. Удаление лицензии одновременно из каталога и журнала не скрывается обновлением данных; замена исходного SHA также отклоняется.
8. Две последовательные проверки дают один результат и не изменяют ни один tracked-файл.
9. Все четыре старых owner-решения продолжают отвергать нынешние изменённые объекты в read-only режиме.
10. Живые 184 записи сохраняют поиск KY/UZ/RU/EN, фильтры, маршруты, пагинацию; 12 × 4 × 3 = 144 SSR-рендера проверяют изображения и атрибуцию карточки, модального окна и страницы. Pending disclosure проверяется для соответствующих записей. Браузерная визуальная инспекция интерфейса не заявляется.

## Итоговые проверки и целостность

Все тяжёлые команды выполнены строго последовательно:

| Команда | Результат |
|---|---|
| npm test | exit 0; 341 tests, 341 pass, 0 fail, 0 skipped, 0 todo; 44.37 с |
| npm run data | exit 0; каталог 184, архив 2 |
| npm run data | exit 0; каталог 184, архив 2; тот же SHA-256 публичного JSON |
| npm run build | exit 0; production build, 104 модуля, prebuild валидация четырёх языков |

После сборки dist/data/species.json глубоко равен текущему public/data/species.json. Все 158 подключённых dist WebP совпали по SHA с публичными файлами. Атрибуция и лицензии всех опубликованных медиа проходят canPublishImage. Суммарный объём подключённых WebP: 34083070 байт; он не изменился относительно начала этой задачи.

Контрольные суммы сохранённых данных:

- data/species.source.json: e079d24d0dc1b23bf40cab66a19f2276deb0a5940a4eefc4c1d6e810a7c0139c
- public/data/species.json: 0eebd3129fa441592dabcf665cf0e9f1807fb500ea6525e918ec3f8cdd078a1d
- JSON source без catalog.images, включая неизменённый архив: 74c9c54ba95374d0a578e2c1c0260d94598b323fceb8e3615d5a0c541df8b085
- data/research/catalog-184-photo-batch-1.json: b7ec71fd548fbfc5792bf6748e812266f0b5c5a63e53f9ee7d2ef0c430173355

Все 1124 прочих старых tracked-файла из исходного снимка до фото-партии, исключая два каталожных вывода и пять теперь исправленных test-файлов, побайтно совпали со своими прежними SHA. В этой задаче сами source/public не менялись вообще; их SHA совпадают с ffca5278. Все прежние 146 image arrays и их байты, старые научные источники, лицензии и snapshots сохранены. Архив содержит ровно 2 записи.

Диск C: при начале диагностики свободно 9210007552 байт; непосредственно перед финальной последовательностью 8341864448 байт, после неё 8345116672 байт. ENOSPC не возник. Исследовательские материалы, .generated и Git-история не удалялись. Подробные диагностические и финальные логи находятся в .generated/catalog-184-photo-test-fix/.

## Коммит и завершение

Исправления и этот отчёт фиксируются одним коммитом с сообщением **Fix historical photo regressions without relaxing provenance checks**. Исходный HEAD указан в начале. Собственный будущий SHA не встраивается в содержимое коммита; точный хеш созданного коммита и итоговый HEAD сообщаются владельцу после фиксации. Для воспроизведения: git log -1 --format=%H -- docs/research/catalog-184-photo-batch-1-test-fix.md; после завершения это также git rev-parse HEAD.

Перед фиксацией Git содержит только пять необходимых изменений тестов, два новых тестовых файла и этот отчёт; source, public, assets, архив, research-пакеты, Vue и дизайн отсутствуют в diff. Git status после коммита проверяется на чистоту и сообщается владельцу. Новые научные подписи и разрешения не создавались. Вторая партия, merge, push и deployment не выполнялись.
