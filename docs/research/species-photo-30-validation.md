# Фотографии 30 записей — задача №21.3

Дата: 14 октября 2026 года. Ветка `feature/species-content`, исходный HEAD `1351122`.
Перед началом дерево было чистым, ветка и HEAD соответствовали заданию. Новая ветка,
merge, push и deployment не выполнялись.

**Было 21/30, стало 25/30. Добавлены четыре ресурса. Пять placeholder сохранены.**
Это 23 фотографии живых организмов, один музейный снимок насекомого и один
оцифрованный гербарный снимок. Они не выдаются за фотографии живых организмов
в природе. Не утверждается, что свободных фотографий оставшихся видов нигде нет.

## Аудит всех 30 записей: до → после

Исходный аудит выполнен **до** поиска и изменения данных, сохранён в
`docs/evidence/species-photo-baseline.json`. Девять пустых arrays совпали с указанным
списком: колпаковский тюльпан, обе рыбы, желтушка, паук, скутигер, сурок, пихта и дрофа.
У всех первоначальных 21 ресурсов найден файл, SHA совпал и существующий допуск
`canPublishImage` выполнен. Это проверка текущих метаданных, не повторная независимая
экспертиза всех прежних лицензий. Неподтверждённые исторические фото в исходных массивах
не допускаются генератором и не заменяют выбранное `speciesPhoto`.

Ни у одного исходного изображения не подтверждена ошибка пути, licenseVerified или
публичной проекции. Для девяти записей причина placeholder — пустой `images`, а не
скрытый корректный файл. Исправлений компонента или CSS не понадобилось.

| ID | Научное имя | Реальное фото: до → после | Файл после | Допуск модели | Карточка / диалог / страница | Причина / итог |
| --- | --- | --- | --- | --- | --- | --- |
| irbis | Panthera uncia | Да → Да | Да, SHA проверен | Да | Фото / фото / фото | Исходное фото сохранено; технической ошибки нет |
| argali | Ovis ammon | Да → Да | Да, SHA проверен | Да | Фото / фото / фото | Исходное фото сохранено; технической ошибки нет |
| manul | Otocolobus manul | Да → Да | Да, SHA проверен | Да | Фото / фото / фото | Исходное фото сохранено; технической ошибки нет |
| golden-eagle | Aquila chrysaetos | Да → Да | Да, SHA проверен | Да | Фото / фото / фото | Исходное фото сохранено; технической ошибки нет |
| bearded-vulture | Gypaetus barbatus | Да → Да | Да, SHA проверен | Да | Фото / фото / фото | Исходное фото сохранено; технической ошибки нет |
| saker-falcon | Falco cherrug | Да → Да | Да, SHA проверен | Да | Фото / фото / фото | Исходное фото сохранено; технической ошибки нет |
| greigs-tulip | Tulipa greigii | Да → Да | Да, SHA проверен | Да | Фото / фото / фото | Исходное фото сохранено; технической ошибки нет |
| kaufmanns-tulip | Tulipa kaufmanniana | Да → Да | Да, SHA проверен | Да | Фото / фото / фото | Исходное фото сохранено; технической ошибки нет |
| sievers-apple | Malus sieversii | Да → Да | Да, SHA проверен | Да | Фото / фото / фото | Исходное фото сохранено; технической ошибки нет |
| central-asian-tortoise | Testudo horsfieldii | Да → Да | Да, SHA проверен | Да | Фото / фото / фото | Исходное фото сохранено; технической ошибки нет |
| central-asian-frog | Rana asiatica | Да → Да | Да, SHA проверен | Да | Фото / фото / фото | Исходное фото сохранено; технической ошибки нет |
| predatory-bush-cricket | Saga pedo | Да → Да | Да, SHA проверен | Да | Фото / фото / фото | Исходное фото сохранено; технической ошибки нет |
| dog-stinkhorn | Mutinus caninus | Да → Да | Да, SHA проверен | Да | Фото / фото / фото | Исходное фото сохранено; технической ошибки нет |
| marbled-polecat | Vormela peregusna | Да → Да | Да, SHA проверен | Да | Фото / фото / фото | Исходное фото сохранено; технической ошибки нет |
| black-stork | Ciconia nigra | Да → Да | Да, SHA проверен | Да | Фото / фото / фото | Исходное фото сохранено; технической ошибки нет |
| ibisbill | Ibidorhyncha struthersii | Да → Да | Да, SHA проверен | Да | Фото / фото / фото | Исходное фото сохранено; технической ошибки нет |
| eduards-fritillary | Fritillaria eduardii | Да → Да | Да, SHA проверен | Да | Фото / фото / фото | Исходное фото сохранено; технической ошибки нет |
| european-glass-lizard | Pseudopus apodus | Да → Да | Да, SHA проверен | Да | Фото / фото / фото | Исходное фото сохранено; технической ошибки нет |
| dalmatian-pelican | Pelecanus crispus | Да → Да | Да, SHA проверен | Да | Фото / фото / фото | Исходное фото сохранено; технической ошибки нет |
| eurasian-lynx | Lynx lynx | Да → Да | Да, SHA проверен | Да | Фото / фото / фото | Исходное фото сохранено; технической ошибки нет |
| kolpakowskis-tulip | Tulipa kolpakowskiana | Нет → Да | Да, SHA проверен | Да | Фото / фото / фото | Добавлен разрешённый ресурс; см. сведения ниже |
| ostrowskis-tulip | Tulipa ostrowskiana | Да → Да | Да, SHA проверен | Да | Фото / фото / фото | Исходное фото сохранено; технической ошибки нет |
| pike-asp | Aspiolucius esocinus | Нет → Нет | — | — | Placeholder / placeholder / placeholder | images пуст; причина отказа ниже |
| turkestan-catfish | Glyptosternon reticulatum | Нет → Нет | — | — | Placeholder / placeholder / placeholder | images пуст; причина отказа ниже |
| christophs-clouded-yellow | Colias christophi | Нет → Да | Да, SHA проверен | Да | Фото / фото / фото | Добавлен разрешённый ресурс; см. сведения ниже |
| relict-spider | Tricholathys relicta | Нет → Нет | — | — | Placeholder / placeholder / placeholder | images пуст; причина отказа ниже |
| tien-shan-scutiger | Albatrellus tianschanicus | Нет → Нет | — | — | Placeholder / placeholder / placeholder | images пуст; причина отказа ниже |
| menzbiers-marmot | Marmota menzbieri | Нет → Нет | — | — | Placeholder / placeholder / placeholder | images пуст; причина отказа ниже |
| semenovs-fir | Abies sibirica semenovii | Нет → Да | Да, SHA проверен | Да | Фото / фото / фото | Добавлен разрешённый ресурс; см. сведения ниже |
| great-bustard | Otis tarda tarda | Нет → Да | Да, SHA проверен | Да | Фото / фото / фото | Добавлен разрешённый ресурс; см. сведения ниже |

Фактическая загрузка проверена в браузере во всех 30 карточках, диалогах и страницах
на 375 px: 25 допущенных WebP и 5 штатных SVG placeholder; naturalWidth > 0.
SSR всех трёх компонентов также проверяет все 30 записей.

## Новые фотографии, происхождение и права

| ID | Автор / институциональная атрибуция | Оригинальная страница | Лицензия | WebP | Контекст |
| --- | --- | --- | --- | --- | --- |
| kolpakowskis-tulip | Guy Waterval | [Страница](https://commons.wikimedia.org/wiki/File:Tulipa_kolpakowskiana_Regel_(Liliaceae)-1F.JPG) | [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0) | 1334×1800 | Культивируемое растение |
| christophs-clouded-yellow | Josef Grieshuber | [Страница](https://commons.wikimedia.org/wiki/File:Colias_christophi_christophi_male_03_dorsal_side_ZISP.jpg) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | 1800×1350 | Музейный экземпляр |
| great-bustard | Charles J. Sharp | [Страница](https://commons.wikimedia.org/wiki/File:Great_bustard_(Otis_tarda_tarda)_female_in_flight.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | 1800×1199 | Самка в полёте, подвид указан |
| semenovs-fir | Moscow Digital Herbarium — Moscow State University (institutional credit; photographer not specified) | [Страница](https://plant.depo.msu.ru/open/public/en/item/MW0895964) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | 1264×1800 | Гербарный снимок |

Commons: прочитаны оригинальные file-description/revisions и licensing, сверены
imageinfo/extmetadata, автор, дата/ревизия, прямое определение вида/подвида и размеры.
Веб-инструмент не смог открыть часть страниц, но оригинальный wikitext и отрисованные
лицензионные метаданные доступны через открытый MediaWiki API; это не поисковый сниппет.
Ревизии, description, artist statement hash, SHA оригинала, изменения и просмотр пикселей
сохранены в `docs/evidence/species-photo-preparation.json`.

- Тюльпан: автор файла прямо указывает Tulipa kolpakowskiana. Кадр культивируемого
  растения, не подтверждение кыргызстанской встречаемости. Географическая часть
  исходной подписи спорная; она не переносится в научную модель. Нужна независимая
  ботаническая проверка определения; `verified` вида остаётся false.
- Желтушка: фотография коллекционного самца Colias christophi christophi Зоологического
  института РАН. Это настоящий экземпляр, не рисунок Seitz или почтовая марка. Самец
  музейный, поэтому окраска и поза не выдаются за наблюдение живого животного.
- Пихта: точный таксон Abies sibirica subsp. semenovii указан в записи и на этикетке
  MW0895964. На индивидуальной странице МГУ прямо указан CC-BY 4.0. Сохранена
  институциональная атрибуция Moscow Digital Herbarium / Moscow State University
  и рекомендованная ссылка Seregin A. P. (Ed.), 2026. Имя индивидуального фотографа
  не указано (null в квитанции); редактор и собиратель не объявлены фотографами.
  Это ограничение явно записано в author/attribution. Новых сведений о регионах нет.
- Дрофа: подпись Charles J. Sharp прямо определяет Otis tarda tarda. Видовая фотография
  без такого уточнения не подставлялась. Венгрия — место снимка, не новый регион MURAS.

Оптимизация выполнена существующим `scripts/process_data.py`: без апскейла и изменения
пропорций, длинная сторона ≤1800 px, WebP quality 82, удалены EXIF/XMP. Три кадра
подготовлены `prepare-batch-images.mjs` с дополнительным проверенным фото-пакетом;
гербарный оригинал обработан тем же `--optimize-input / --optimize-output` механизмом.
Локальные пиксели просмотрены до присвоения их каталогу. Все 21 прежних images массивы
и файлы сохранены без изменений. Авторство и лицензии находятся в прежнем раскрываемом
блоке; ссылка на оригинальную страницу работает через существующий интерфейс.

## Apache и ShareAlike

У Apache 2.0 проверен официальный текст лицензии и Permission оригинального файла.
В публичный dist входят `/licenses/photos/Apache-2.0.txt` и
`/licenses/photos/kolpakowskis-tulip-NOTICE.txt`. NOTICE сохраняет **дословный** copyright
из Commons revision 1131423728, атрибуцию и заметку об изменениях; правообладатель
не назначается проектом. Изначальная команда сохранения generic copyright была
отклонена автоматической проверкой как неподтверждённая. После отдельной сверки
оригинального Permission уведомление извлечено из ответа источника, а не придумано;
повторное действие одобрено, нерешённого блокирования нет.

Для `public/licenses/photos/*.txt` в `.gitattributes` указано `-text`: Git сохраняет
точные байты лицензии и NOTICE, не заменяя LF на CRLF при Windows checkout.
Иначе их SHA-256 из квитанции не совпал бы после такой автоконвертации.

Производные WebP/отображаемые изменения желтушки сохраняют CC BY-SA 3.0, дрофы —
CC BY-SA 4.0; это явно указано в attribution. Гербарный снимок остаётся CC BY 4.0,
тюльпан — Apache 2.0. Метаданные modifications перечисляют сжатие, CSS cover и
учебные изменения Canvas. Лицензия изображения не распространяется автоматически
на код всей платформы и не означает одобрение проекта автором.

Небольшое расширение существующего подготовщика: `--research` задаёт проверенный
фото-пакет, не вторую базу видов; Apache допускается только при сохранённых LICENSE /
NOTICE с SHA. Проверяются совпадение оригинальной страницы и соответствие URL типу
лицензии. NC, ND и All rights reserved не принимаются этим процессом. Генератор
по-прежнему читает только `data/species.source.json`; схема images не изменилась.

## Оставшиеся placeholder

| ID | Почему не добавлено | Проверенные направления |
| --- | --- | --- |
| pike-asp | Найдены марки/конверты; реальная фотография с допустимыми правами не установлена | Commons, iNaturalist, научные поисковые результаты |
| turkestan-catfish | Commons — рисунок/марки; iNaturalist — reserved либо NC и неполное определение; FishBase не дал подтверждённой свободной лицензии фото | Commons, три наблюдения iNaturalist, FishBase |
| relict-spider | Допущенного фото нужного вида не найдено; Tricholathys relictoides — другой вид | Commons, iNaturalist, World Spider Catalog, новая статья о роде |
| tien-shan-scutiger | На fungi.su есть изображение, но автор и свободная лицензия именно фото не установлены | Commons, iNaturalist, fungi.su |
| menzbiers-marmot | Commons — марки; все пять найденных фото iNaturalist имеют CC BY-NC | Commons, iNaturalist, UCLA Marmot Burrow |

Ссылки и документированные отказы: `docs/evidence/species-photo-rejections.json`.
Не скачивались и не публиковались кадры с NC/ND/неизвестными правами. Дополнительно
отклонены: тюльпаны с категорией Tulipa altaica, Flickr Ian Lawson (reserved), Harvard
Colias (CC BY-NC-SA, хотя код сайта имеет Apache), снимки Plantarium с reserved/NC.
Не копировались иллюстрации Красной книги, марки или чужие фотографии похожих видов.

## Кадрирование и браузер

CSS, компоненты, маршруты и движок Canvas не менялись. У нового тюльпана композиция
`x=.5,y=.08,zoom=1`, у гербарной ветви `x=.5,y=.12,zoom=1` для card/detail;
дрофа и желтушка используют центр без увеличения. Исходные файлы не кадрированы.
Для гербария в компактном cover-кадре показана верхняя часть ветви, не весь лист;
полный лист с этикеткой доступен на оригинальной странице. Исходная пропорция
изображения не искажается. Нельзя по одному кадру гарантировать полноту всех
диагностических признаков организма.

Production preview localhost:4191, встроенный браузер Chromium-семейства:

- Все 30 карточек, диалогов и страниц: ресурсы реально загружены на 375 px.
- Каталог и четыре новые страницы: 375 / 768 / 1440 px; изображения загрузились,
  object-fit=cover, документ без горизонтального переполнения.
- Диалог тюльпана: три ширины, автор/лицензия/NOTICE доступны, содержимое не выходит
  по горизонтали. Enter открывает карточки, Escape закрывает их.
- На четырёх новых фото Canvas запускается, получает ненулевые размеры и возвращается
  к обычной фотографии; используется существующий unknown-эффект, без новых чисел.
- Ошибок/предупреждений в захваченной консоли нет. Протокол:
  `docs/evidence/species-photo-browser.json`. Скриншоты вне production-дерева:
  photos-tulip-desktop.jpg, photos-bustard-desktop.jpg, photos-bustard-mobile.jpg.
- Safari, физические устройства и юридическая/таксономическая независимая экспертиза
  не выполнялись. Прежние оговорки определения старых фотографий сохранены.

## Автоматические проверки

- `npm test`: **243/243**, 236 прежних тестов + 7 новых. Ни один тест не удалён.
- `npm run data` дважды: успешно, 30 видов / 2 архивных примера / 18 вопросов.
- `npm run data:validate`: успешно, 610 ключей × 4 языка, корректная проекция.
- `npm run build`: успешно, 100 модулей; admin/index.html, все 25 WebP и обе
  текстовые Apache-квитанции входят в dist. Локальные оригиналы / source / резервные
  копии не входят в production.

Прежние snapshot-тесты сохраняют проверки исторической партии и её четырёх фото,
но учитывают разрешённое заполнение четырёх пустых arrays. Новый аудит отдельно
проверяет неизменность 21 исходных arrays, файлов и всех научных полей 30 записей
(включая энциклопедический content) через pre-task SHA. Архив неизменен.
Дополнительные тесты проверяют paths, bytes, размеры, SHA, отсутствие устаревших
approved-файлов, права/URL, Apache LICENSE/NOTICE, отсутствие фото и реальный SSR
карточки/диалога/страницы для всех 30 записей.

## Изменённые файлы

- .gitattributes — сохранение точных байтов LICENSE/NOTICE на Windows.
- data/species.source.json, public/data/species.json — только четыре images массива.
- assets/images/species/{kolpakowskis-tulip,christophs-clouded-yellow,semenovs-fir,great-bustard}.webp.
- public/images/approved/{kolpakowskis-tulip,christophs-clouded-yellow,semenovs-fir,great-bustard}-1.webp.
- public/licenses/photos/Apache-2.0.txt, public/licenses/photos/kolpakowskis-tulip-NOTICE.txt.
- scripts/prepare-batch-images.mjs — проверенный фото-пакет / Apache-артефакты / URL.
- tests/species-photos.test.mjs; tests/data.test.mjs; tests/bulk-import.test.mjs;
  tests/helpers/legacy-scientific-source.mjs — новое покрытие и расширение исторических expectations.
- docs/evidence/species-photo-{baseline,research,preparation,rejections,browser}.json.
- docs/research/species-photo-30-validation.md — этот отчёт.

Научные описания, численность, статусы, verified, география, локализация, вопросы,
дизайн и код интерфейса не изменены. Итоговый локальный коммит создаётся после проверок;
его хеш приведён в сообщении, собственный хеш не включается в тот же коммит.
