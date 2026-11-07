# Этап 3 — выполненная локализация и точка продолжения

**Актуальная точка продолжения (07.11.2026): `semenovs-fir`.** Результаты партий 002–004 сохранены отдельными журналами в `data/localization/`; актуальные метрики и проверки партии 004 — в [аудите](TRANSLATION_AUDIT.md). Сначала завершена первая редакционная очередь, затем используется порядок каталога. Новые тексты записывать в следующий отдельный журнал, сохраняя русские оригиналы и их SHA-256. Обновить проверку цепочки журналов и запустить аудит после валидаторов. Ниже сохранён исторический отчёт партии 001; его очередь и показатели отражают состояние на 31.10.2026.

Партия 004: 8 видов, 224 новых текста (KY +72, UZ +80, EN +72). По двум прогонам подтверждены 419/435 тестов, оставшиеся 16 — те же исторические падения. Chrome: 75/75. Валидация и сборка прошли; перечни ID, пропусков и терминов приведены в актуальном аудите.

Дата: 31.10.2026. **Этап выполнен частично; полного перевода каталога нет.** Проинвентаризированы все 184 вида и 2 архивные записи, обработана первая часть очереди (4 обязательных вида из запланированных 15).

## Контрольный коммит этапов 1–2

`5f253100ac61c825b72b9fb22ca9b4a45f7aa953` — feat: preserve local file editor and offline research workflow. Коммит содержит 36 проверенных файлов, без .generated, drafts, dumps, архивов и обнаруженных секретов. Выполнен `git push -u origin feature/local-file-admin`; origin/feature/local-file-admin указывает на этот же SHA. main остаётся `50951765ab52c32fdae30309cc19ede7e9bd279d`. Merge и удаление веток не выполнялись. Muras1 не открывался для переноса и не изменялся.

## До → после

Подробная матрица каждого поля и все 186 ID — [TRANSLATION_AUDIT.md](TRANSLATION_AUDIT.md). Считаются присутствующие тексты, а не fallback; совпадения с русским оригиналом требуют проверки. Общая база — 2219 применимых блоков на язык. Латинское имя не выдано за народный перевод. Два исходных русских заголовка, совпадающих с латинским научным именем, также не засчитаны полноценным переводом; русский оригинал оставлен неизменным.

| Язык | До | После | Добавлено |
|---|---:|---:|---:|
| KY | 446/2219 | 485/2219 | 39 |
| RU | 2217/2219 | 2217/2219 | 0 |
| UZ | 328/2219 | 375/2219 | 47 |
| EN | 525/2219 | 564/2219 | 39 |

Добавлено **125 отдельных переводов**. Основные тексты полностью заполнены на KY/RU/UZ/EN у:

- `irbis` — ирбис;
- `argali` — архар;
- `golden-eagle` — беркут;
- `eduards-fritillary` — рябчик Эдуарда.

Включены обзор (два абзаца), имеющиеся внешность/экология/питание/размножение/распространение, habitat, threats, conservationMeasures, название страны и имеющиеся подписи изображений. diet у растения и отсутствующая подпись второго изображения ирбиса не выдуманы. Существующие заполненные переводы не заменялись. Сохранены исторический 2006 год, ограничения современности данных, подвидовая оговорка для монгольского архара, неопределённость происхождения/определения растения на Commons и требование проверки наблюдений об опылении.

**Полностью завершённых карточек со всеми подтверждёнными народными названиями: 0.** У обработанных четырёх UZ names остаются неподтверждёнными и пустыми. Переводы — редакционные, независимая лингвистическая вычитка KY/UZ/EN не заявляется. Научная проверка не предоставлялась.

## Что осталось и почему нет заявления о 100%

Объём всего корпуса (2219 применимых блоков × 4 языка) не позволяет в этом проходе обоснованно подготовить и проверить оставшиеся длинные переводы. Непроверенные тексты не размножались шаблоном, не копировались из RU под другим языковым ключом и не объявлялись завершёнными. Из очереди 15 видов ещё не обработаны 11; затем остаются остальные виды и архив. У четырёх обработанных видов остаются вопросы названий.

Точная очередь продолжения:

1. `greigs-tulip`
2. `kaufmanns-tulip`
3. `sievers-apple`
4. `central-asian-tortoise`
5. `central-asian-frog`
6. `predatory-bush-cricket`
7. `dog-stinkhorn`
8. `european-glass-lizard`
9. `pike-asp`
10. `turkestan-catfish`
11. `tien-shan-scutiger`

После этой очереди брать следующие 15–25 из audit.records с незавершёнными языками, не включать обработанный текст повторно. Все 186 записей и их текущие счётчики приведены в TRANSLATION_AUDIT; подробные path/state для каждого языка воспроизводятся в `.generated/localization/translation-audit.json`.

### Названия, требующие подтверждения или просмотра

Ниже автоматические сигналы полноты, а не новые таксономические решения. missing — перевод отсутствует; scientific_name_fallback — записано латинское имя; same_as_russian_requires_review — совпадает с RU и может оказаться допустимым общим названием, но не считается автоматически переведённым. Авторитетные языковые источники для новых имён в этой задаче не искались, новые народные названия не присваивались.

| ID | Языки и причина |
|---|---|
| irbis | UZ: missing |
| argali | UZ: missing |
| manul | UZ: missing |
| golden-eagle | UZ: missing |
| bearded-vulture | UZ: missing |
| saker-falcon | UZ: missing |
| greigs-tulip | UZ: missing |
| kaufmanns-tulip | UZ: missing |
| sievers-apple | UZ: missing |
| central-asian-tortoise | UZ: missing |
| central-asian-frog | UZ: missing |
| predatory-bush-cricket | UZ: missing |
| dog-stinkhorn | UZ: missing |
| marbled-polecat | UZ: missing |
| black-stork | UZ: missing |
| ibisbill | UZ: missing |
| eduards-fritillary | UZ: missing |
| european-glass-lizard | UZ: missing |
| dalmatian-pelican | UZ: missing |
| eurasian-lynx | UZ: missing |
| kolpakowskis-tulip | UZ: missing |
| ostrowskis-tulip | UZ: missing |
| pike-asp | UZ: missing |
| turkestan-catfish | UZ: missing |
| christophs-clouded-yellow | UZ: missing |
| relict-spider | UZ: missing |
| tien-shan-scutiger | UZ: missing |
| menzbiers-marmot | UZ: missing |
| semenovs-fir | UZ: missing |
| great-bustard | UZ: missing |
| said-alievs-toad-agama | UZ: missing |
| vigorous-ground-beetle | UZ: missing |
| pskem-onion | UZ: missing |
| kostychevs-pasque-flower | UZ: missing |
| indian-crested-porcupine | UZ: missing |
| fergana-ground-beetle | UZ: missing |
| giant-robber-fly | UZ: missing |
| korzhinskys-pear | UZ: missing |
| cinereous-vulture | UZ: missing |
| egyptian-vulture | UZ: missing |
| eminium-regelii | KY: missing; UZ: missing |
| eremurus-zenaidae | KY: missing; UZ: missing |
| eremurus-zoae | KY: missing; UZ: missing |
| allium-dodecadontum | KY: missing; UZ: missing |
| allium-semenovii | KY: missing; UZ: missing |
| tulipa-affinis | KY: missing; UZ: missing; EN: missing |
| tulipa-korolkowii | KY: missing; UZ: missing |
| tulipa-platystemon | KY: missing; UZ: missing |
| tulipa-tetraphylla | KY: missing; UZ: missing |
| tulipa-zenaidae | KY: missing; UZ: missing; EN: missing |
| juno-orchioides | KY: missing; UZ: missing; EN: missing |
| iridodictyum-kolpakowskianum | KY: missing; UZ: missing; EN: missing |
| thesium-minkwitzianum | KY: missing; UZ: missing; EN: missing |
| delphinium-knorringianum | KY: missing; UZ: missing |
| urocerus-sah | KY: missing; UZ: missing |
| masaris-longicornis | KY: missing; UZ: missing |
| varanus-griseus-caspius | KY: missing; UZ: missing |
| lyrurus-tetrix | KY: missing; UZ: missing |
| cygnus-cygnus | KY: missing; UZ: missing |
| aythya-nyroca | KY: missing; UZ: missing |
| mergus-serrator | KY: missing; UZ: missing |
| oxyura-leucocephala | KY: missing; UZ: missing |
| gavia-arctica | KY: missing; UZ: missing |
| ciconia-ciconia | KY: missing; UZ: missing |
| platalea-leucorodia | KY: missing; UZ: missing |
| pelecanus-onocrotalus | KY: missing; UZ: missing |
| phalacrocorax-pygmaeus | KY: missing; UZ: missing |
| falco-naumanni | KY: missing; UZ: missing |
| falco-rusticolus | KY: missing; UZ: missing |
| pandion-haliaetus | KY: missing; UZ: missing |
| haliaeetus-leucoryphus | KY: missing; UZ: missing |
| haliaeetus-albicilla | KY: missing; UZ: missing |
| gyps-himalayensis | KY: missing; UZ: missing |
| gyps-fulvus | KY: missing; UZ: missing |
| circaetus-gallicus | KY: missing; UZ: missing |
| circus-macrourus | KY: missing; UZ: missing |
| neomys-fodiens | KY: missing; UZ: missing |
| rhinolophus-bocharicus | KY: missing; UZ: missing |
| barbastella-leucomelas | KY: missing; UZ: missing |
| tadarida-teniotis | KY: missing; UZ: missing |
| ursus-arctos | KY: missing; UZ: missing |
| martes-foina | KY: missing; UZ: missing |
| lutra-lutra | KY: missing; UZ: missing |
| allactaga-elater | KY: missing; UZ: missing |
| dictyocephalus-attenuatus | KY: missing; UZ: missing |
| prionus-tschitscherini | KY: missing; UZ: missing |
| rossomyrmex-proformicarum | KY: missing; UZ: missing |
| barbus-brachycephalus | KY: missing; UZ: missing |
| allochrusa-gypsophiloides | KY: missing; UZ: missing |
| corydalis-pseudoadunca | KY: missing; UZ: missing |
| fumariola-turkestanica | KY: missing; UZ: missing |
| rhodiola-litwinowii | KY: missing; UZ: missing |
| sibiraea-tianschanica | KY: missing; UZ: missing |
| crataegus-knorringiana | KY: missing; UZ: missing |
| ammopiptanthus-nanus | KY: missing; UZ: missing |
| colutea-brachyptera | KY: missing; UZ: missing |
| primula-eugeniae | KY: missing; UZ: missing |
| physochlaina-alaica | KY: missing; UZ: missing |
| incarvillea-olgae | KY: missing; UZ: missing |
| saussurea-involucrata | KY: missing; UZ: missing |
| silene-sussamyrica | KY: scientific_name_fallback; UZ: scientific_name_fallback; EN: scientific_name_fallback |
| iskandera-alaica | KY: scientific_name_fallback; UZ: scientific_name_fallback; EN: scientific_name_fallback |
| spiraeanthus-schrenkianus | KY: scientific_name_fallback; UZ: scientific_name_fallback; EN: scientific_name_fallback |
| chesneya-villosa | KY: scientific_name_fallback; UZ: scientific_name_fallback; EN: scientific_name_fallback |
| hedysarum-chaitocarpum | KY: scientific_name_fallback; UZ: scientific_name_fallback; EN: scientific_name_fallback |
| zygophyllum-kaschgaricum | KY: scientific_name_fallback; UZ: scientific_name_fallback; EN: scientific_name_fallback |
| sclerotiaria-pentaceros | KY: scientific_name_fallback; UZ: scientific_name_fallback; EN: scientific_name_fallback |
| bupleurum-rosulare | KY: scientific_name_fallback; UZ: scientific_name_fallback; EN: scientific_name_fallback |
| hyalolaena-intermedia | KY: scientific_name_fallback; UZ: scientific_name_fallback; EN: scientific_name_fallback |
| seseli-eryngioides | KY: scientific_name_fallback; UZ: scientific_name_fallback; EN: scientific_name_fallback |
| seseli-korshinskyi | KY: scientific_name_fallback; UZ: scientific_name_fallback; EN: scientific_name_fallback |
| cnidiocarpa-alaica | KY: scientific_name_fallback; UZ: scientific_name_fallback; EN: scientific_name_fallback |
| pastinacopsis-glacialis | KY: scientific_name_fallback; UZ: scientific_name_fallback; EN: scientific_name_fallback |
| kaufmannia-semenovii | KY: scientific_name_fallback; UZ: scientific_name_fallback; EN: scientific_name_fallback |
| acantholimon-compactum | KY: scientific_name_fallback; UZ: scientific_name_fallback; EN: scientific_name_fallback |
| scutellaria-andrachnoides | KY: scientific_name_fallback; UZ: scientific_name_fallback; EN: scientific_name_fallback |
| scutellaria-nepetoides | KY: scientific_name_fallback; UZ: scientific_name_fallback; EN: scientific_name_fallback |
| salvia-korolkowii | KY: scientific_name_fallback; UZ: scientific_name_fallback; EN: scientific_name_fallback |
| nathaliella-alaica | KY: scientific_name_fallback; UZ: scientific_name_fallback; EN: scientific_name_fallback |
| lonicera-paradoxa | KY: scientific_name_fallback; UZ: scientific_name_fallback; EN: scientific_name_fallback |
| campanula-eugeniae | KY: scientific_name_fallback; UZ: scientific_name_fallback; EN: scientific_name_fallback |
| lamyropappus-schakaptaricus | KY: scientific_name_fallback; UZ: scientific_name_fallback; EN: scientific_name_fallback |
| trichanthemis-aulieatensis | KY: scientific_name_fallback; UZ: scientific_name_fallback; EN: scientific_name_fallback |
| trichanthemis-aurea | KY: scientific_name_fallback; UZ: scientific_name_fallback; EN: scientific_name_fallback |
| lepidolopha-komarowii | KY: scientific_name_fallback; UZ: scientific_name_fallback; EN: scientific_name_fallback |
| barbus-capito-conocephalus | KY: scientific_name_fallback; UZ: scientific_name_fallback |
| vipera-ursinii-renardi | KY: scientific_name_fallback; UZ: scientific_name_fallback |
| kirgisobia-bohnei | KY: scientific_name_fallback; UZ: scientific_name_fallback |
| anser-indica | KY: scientific_name_fallback; UZ: scientific_name_fallback |
| accipiter-badius | KY: scientific_name_fallback; UZ: scientific_name_fallback |
| aquila-clanga | KY: scientific_name_fallback; UZ: scientific_name_fallback |
| aquila-nipalensis | KY: scientific_name_fallback; UZ: scientific_name_fallback |
| aquila-heliaca | KY: scientific_name_fallback; UZ: scientific_name_fallback |
| hieraaetus-fasciatus | KY: scientific_name_fallback; UZ: scientific_name_fallback |
| hieraaetus-pennatus | KY: scientific_name_fallback; UZ: scientific_name_fallback |
| tetrax-tetrax | KY: scientific_name_fallback; UZ: scientific_name_fallback |
| crex-crex | KY: scientific_name_fallback; UZ: scientific_name_fallback |
| anthropoides-virgo | KY: scientific_name_fallback; UZ: scientific_name_fallback |
| burhinus-oedicnemus | KY: scientific_name_fallback; UZ: scientific_name_fallback |
| vanellus-gregarius | KY: scientific_name_fallback; UZ: scientific_name_fallback |
| glareola-nordmanni | KY: scientific_name_fallback; UZ: scientific_name_fallback |
| strix-aluco | KY: scientific_name_fallback; UZ: scientific_name_fallback |
| syrrhaptes-paradoxus | KY: scientific_name_fallback; UZ: scientific_name_fallback |
| pterocles-alchata | KY: scientific_name_fallback; UZ: scientific_name_fallback |
| pterocles-orientalis | KY: scientific_name_fallback; UZ: scientific_name_fallback |
| columba-leuconota | KY: scientific_name_fallback; UZ: scientific_name_fallback |
| columba-eversmanni | KY: scientific_name_fallback; UZ: scientific_name_fallback |
| bubo-bubo | KY: scientific_name_fallback; UZ: scientific_name_fallback |
| gazella-subgutturosa | UZ: scientific_name_fallback |
| dendrocopos-leucopterus | UZ: scientific_name_fallback |
| sorbus-persica | UZ: scientific_name_fallback |
| amygdalus-petunnikowii | UZ: scientific_name_fallback |
| kosopoljanskia-turkestanica | UZ: scientific_name_fallback |
| alajja-anomala | UZ: scientific_name_fallback |
| otostegia-schennikovii | UZ: scientific_name_fallback |
| salvia-vvedenskyi | UZ: scientific_name_fallback |
| stemmacantha-aulieatensis | UZ: scientific_name_fallback |
| centaurea-alaica | UZ: scientific_name_fallback |
| pyrethrum-leontopodium | UZ: scientific_name_fallback |
| phoenicopterus-roseus | UZ: scientific_name_fallback |
| chlamydotis-macqueenii | UZ: scientific_name_fallback |
| numenius-tenuirostris | UZ: scientific_name_fallback |
| larus-ichtyaetus | UZ: scientific_name_fallback |
| dendrocopos-major | UZ: scientific_name_fallback |
| hemiechinus-hypomelas | UZ: scientific_name_fallback |
| allactaga-severtzovi | UZ: scientific_name_fallback |
| anemone-obtusiloba | UZ: scientific_name_fallback |
| berberis-kaschgarica | UZ: scientific_name_fallback |
| primula-macrocalyx | UZ: scientific_name_fallback |
| sonjagaster-coronatus | UZ: scientific_name_fallback |
| capoetobrama-kuschakewitschi-orientalis | UZ: scientific_name_fallback |
| schizothorax-issykkuli | UZ: scientific_name_fallback |
| diptychus-dybowskii-lansdelli | UZ: scientific_name_fallback |
| eryx-tataricus | UZ: scientific_name_fallback |
| terpsiphone-paradisi | UZ: scientific_name_fallback; EN: scientific_name_fallback |
| otonycteris-hemprichi | UZ: scientific_name_fallback; EN: scientific_name_fallback |
| cervus-elaphus-asiaticus | KY: scientific_name_fallback; UZ: scientific_name_fallback |
| allactaga-saltator | UZ: scientific_name_fallback |
| sorbaria-olgae | UZ: scientific_name_fallback |
| dorema-microcarpum | UZ: scientific_name_fallback |
| tianschaniella-umbellifera | UZ: scientific_name_fallback |
| parnassius-loxias-tashkorensis | UZ: scientific_name_fallback |
| parnassius-apollo-merzbacheri | UZ: scientific_name_fallback |
| cuon-alpinus | KY: scientific_name_fallback; UZ: scientific_name_fallback |
| amur-tiger | KY: missing; RU: missing; UZ: missing; EN: missing |
| whooping-crane | KY: missing; RU: missing; UZ: missing |

## Админка и публичный интерфейс

Единый translationCompleteness используется аудитом и Vue-админкой. У каждого вида видны KY/RU/UZ/EN filled/total, есть фильтр незавершённых переводов (всех или определённого языка), предупреждение и пустые языковые поля с пометкой. LocalizedFields сохраняет отдельное редактирование каждого языка. Сохранение неполного черновика остаётся файловым и не присваивает готовность. Проверена новая пустая запись синтетическим тестом: её нельзя считать полностью переведённой.

На странице вида названия регионов используют ScientificText и явно обозначают реальный язык fallback. Существующие многоабзацный рендеринг и переключение языка переиспользованы. Фото, дизайн, карта, уроки и викторина не переделывались. Библиографические названия/ссылки/авторство/лицензии остаются оригинальными, не замаскированы под локализацию.

## Защита фактов и исторических тестов

Каждая из 125 ячеек в data/localization/batch-001.json привязана к ID, точному пути, тексту и SHA-256 русского оригинала. assertTranslationOnlyEvolution разрешает только добавление в ранее пустой KY/UZ/EN ключ существующего локализованного блока, проверяет годы/числа, затем восстанавливает именно эти ключи и сравнивает весь документ с неизменяемым Git checkpoint. Это подтверждает сохранность русского текста, старых переводов, ID/научных имён, population/verified/reviewStatus, всех sourceIds/URL, состава регионов, архива, путей/SHA/прав фотографий и остальных данных.

Файлы медиа, лицензий, исследований и географии также сверены с исходным SHA-инвентарём этапа 2: ни одного изменения за пределами разрешённых переводов source/public JSON и изменений UI. Каталог остаётся 184, архив 2, изображения 161, placeholder 23, региональные свидетельства 208.

Исторические тесты first-batch/species-photos/map-activation/UZ и helpers legacy-scientific-source/photo-* уточнены: перед историческим сравнением проверяется **весь живой источник**, затем удаляются только точные добавления из журнала. Все прежние снимки, зафиксированные контрольные суммы и проверки порчи изображений/лицензий остаются. Скрыть изменение научных полей или лицензии этой проекцией нельзя. Старые SSR UZ-сценарии продолжают проверять исторический fallback; живые переводы проверяются новыми тестами и реальным браузером. Проверка порядка языковых inputs теперь использует lang-атрибуты вместо хрупкого соседства текста с HTML-тегом.

## Проверки

| Проверка | Результат |
|---|---|
| npm test -- --test-concurrency=1 | 432 всего, 416 PASS, 16 прежних ошибок; новых 0, skip/todo 0 |
| Новые регрессии переводов | 6/6 PASS внутри общего запуска |
| npm run data | PASS; public JSON актуализирован |
| npm run data:validate | PASS: 704 ключа × 4 языка; 184/2, links 208 |
| npm run build | PASS, production build |
| Реальный браузер: каталог/модальное окно/страницы/админка/языки/fallback/draft | 27/27 PASS, page errors 0 |
| Реальный production browser: редактор отсутствует, POST отказан, каталог сохранён | 4/4 PASS |
| git diff --check | PASS |

Первые браузерные попытки выявили ошибку селектора теста (ID относился к заголовку, а не секции); селектор исправлен на aria-labelledby, после чего все 27 сценариев прошли. Это не скрытый дефект данных. Браузер использовал отдельные временные context и файловую копию API; Chrome-профиль пользователя и рабочие drafts не изменялись. ENOSPC не было.

Все 16 ранее существовавших failures совпадают с этапом 2 по именам. Они не исправлялись заменой исторических SHA или снимков:

1. `bulk-25 keeps stable accepted taxon order, the master registry and public baseline`
2. `release review manifest withholds ambiguous scientific concepts and checks all other queues without publication`
3. `preparation preserves its 84-record baseline, keeps the manifest without scientific approval and excludes queue conflicts`
4. `catalog 178 preserves all prior 166 objects, archive, assets and research and imports exactly the authorized 12`
5. `tests\catalog-184-photo-batch-1.test.mjs`
6. `batch 2 appends precisely three evidenced images to the original 19 targets while preserving all 184 scientific objects and 158 prior image arrays`
7. `two complete photo-journal checks are deterministic and leave all tracked files unchanged`
8. `catalog 184 preserves all prior 178 objects, archive, assets and research and imports exactly the authorized 6`
9. `licensed assets are local WebP, have declared dimensions, captions and matching fingerprints`
10. `184 cards, archive, images and geometry stay unchanged; historical UI hashes retain authentic Git bytes`
11. `research inputs and publication are deterministically bound by SHA-256`
12. `scientific records, images, licences, archive, adapter and all 208 regional links remain unchanged`
13. `28.3: pre-existing scientific statuses, archive, media and other untouched tracked bytes remain immutable`
14. `28.4: scientific records, source history, media, licences, archive and 208 links remain byte-identical`
15. `28.5: publication leaves all protected bytes, science, archive, photos and links intact`
16. `provisional release appends exactly the 23 manifest IDs and preserves all 40 original records, images, sources and statuses`

## Продолжение без повторной работы

1. Проверить текущий Git status; checkpoint 5f25310 и origin feature сохранены, работа этапа 3 пока в рабочем дереве.
2. Запустить npm run translations:audit -- --write; смотреть реальные issues, а не fallback.
3. Начать с greigs-tulip; русский оригинал и sourceIds не переписывать, заполнять только отсутствующие переводы. Создать отдельный batch-002 с привязкой к исходным RU SHA; предыдущий журнал не заменять.
4. Подтверждать народные названия отдельно по реальным источникам; до подтверждения оставлять null. Переведённый рассказ и подтверждённое местное название учитывать раздельно.
5. Повторить строгую проверку допустимых изменений, валидаторы и браузер для законченной партии, обновить аудит. Для продолжения historical helper расширять только новым явно разрешённым проверяемым журналом, без снятия защит и обновления старых сумм.
6. Merge/main/deployment и перенос Muras1 не выполнять без отдельного решения.

## Точные изменённые файлы этапа 3

- `data/species.source.json`
- `package.json`
- `public/data/species.json`
- `src/admin/AdminApp.vue`
- `src/admin/components/LocalizedFields.vue`
- `src/admin/locales/en.json`
- `src/admin/locales/ky.json`
- `src/admin/locales/ru.json`
- `src/admin/locales/uz.json`
- `src/components/SpeciesPage.vue`
- `tests/first-batch.test.mjs`
- `tests/helpers/legacy-scientific-source.mjs`
- `tests/helpers/photo-amendment.mjs`
- `tests/helpers/photo-batch-2.mjs`
- `tests/map-activation.test.mjs`
- `tests/species-photos.test.mjs`
- `tests/uz-localization.test.mjs`
- `data/localization/batch-001.json`
- `docs/localization/STAGE_3_VALIDATION.md`
- `docs/localization/TRANSLATION_AUDIT.md`
- `scripts/audit-translations.mjs`
- `scripts/lib/translation-integrity.mjs`
- `src/data/translation-completeness.js`
- `tests/browser/catalog-localization.mjs`
- `tests/catalog-translation.test.mjs`
- `tests/helpers/translation-evolution.mjs`

Локальные журналы/результаты тестов, исходный рабочий снимок и JSON-аудит находятся в ignored `.generated/localization/` и не добавлены в Git. HEAD: `5f253100ac61c825b72b9fb22ca9b4a45f7aa953`; ветка feature/local-file-admin. Git dirty содержит только перечисленную работу этапа 3. После checkpoint этапов 1–2 новые коммиты/push не выполнялись.
