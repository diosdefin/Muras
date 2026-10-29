# MURAS №28.2 — исследование численности 184 таксонов

Дата проверки: 29 октября 2026 года (Asia/Bishkek). Ветка: `feature/release-preparation`.
Исходный HEAD: `218f849c732cc411a8a1b0d40d5506b379b617e0`. В начале Git чистый; каталог 184, архив 2.

## Результат

Обработаны все **184** очерка и выполнены **184** запроса по точным принятым названиям. **A — 1 таксон, B — 23, C — 160.** Сохранено **91 отдельное численное утверждение**, из них **8 оценок одного таксона** готовы к передаче на независимое рассмотрение. Это национальная и семь региональных оценок взрослых ирбисов. Числа B являются непроверенными претензиями, а не допущенными значениями.

Ни одна оценка не опубликована. Все новые исследовательские записи `verified: false`, `scientificReviewStatus: pending`, `lastReviewedAt: null`; все 184 публичных `population` остались `unknown`. `READY_FOR_REVIEW` не означает научного одобрения, разрешения владельца или технической готовности к импорту.

| Группа | Всего | A | B | C |
|---|---:|---:|---:|---:|
| mammals | 22 | 1 | 8 | 13 |
| birds | 55 | 0 | 12 | 43 |
| plants | 76 | 0 | 3 | 73 |
| reptiles | 6 | 0 | 0 | 6 |
| amphibians | 1 | 0 | 0 | 1 |
| arthropods | 14 | 0 | 0 | 14 |
| fungi | 3 | 0 | 0 | 3 |
| fish | 7 | 0 | 0 | 7 |

## Источники и границы исследования

Повторная таксономическая инвентаризация не проводилась. Использованы сохранённые соответствия национальных очерков, таксономические receipts, прежние заметки `catalog-40-population-notes.json` и исходный PDF. Для всех 184 названий проверены существующие доказательства ранга: 177 видов и 7 подвидов. Семь подвидов не получили численность родительского вида.

`search-log.json` содержит 46 контрольных точек по четыре индивидуальных запроса, их точный текст и найденные URL. Результаты четырёх запросов в одной точке возвращены общим списком: наличие URL в списке не означает подтверждение для всех четырёх видов. Зацепки не считались прочитанными первоисточниками. После поиска прочитаны выбранные профильные научные статьи и официальные таблицы; доступ и ограничения отдельно указаны в `sources.json`, `download-log.json` и `access-log.json`.

Это конечный документированный аудит доступных материалов, **не исчерпывающий систематический обзор всей мировой литературы**. C означает, что пригодная оценка не установлена в изученном наборе; не означает нулевую численность и не доказывает отсутствие иных исследований. Публикация за 2016 год может быть переизданием работы 1976 года. Годы публикации, полевого периода, оценки и статистической отчётности разделены.

Красная книга: PDF SHA-256 `f517212f7ce12fcf5c30f2cf73edc5a842b3ded15dea232b844fbe7ce2525cf8`. Страницы каждого очерка и SHA-256 извлечённого текста сохранены в каждой записи. Единственная опечатка заголовка «Численност.» на с.253 учтена сканером; никаких изменений первоисточника нет.

| Источник | Доступ / значение для аудита |
|---|---|
| [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf) — Красная книга Кыргызской Республики, второе издание | local_full_pdf; публикация 2006 |
| [slr-2026](https://publicera.kb.se/slr/article/download/63883/51550) — Kubanychbekov et al. Snow Leopard (Panthera uncia) Status in Kyrgyzstan | local_full_pdf; публикация 2026 |
| [slt-kyrgyzstan](https://snowleopard.org/our-work/where-we-work/kyrgyzstan/) — Snow Leopard Trust: Kyrgyzstan | web_full_page; публикация не установлена |
| [gslep-habitat](https://globalsnowleopard.org/the-snow-leopard/cat-facts/snow-leopard-habitat/) — GSLEP: Snow Leopard Habitat | web_full_page; публикация не установлена |
| [cacip-2025](https://centralasiaclimateportal.org/there-are-285-snow-leopards-living-in-kyrgyzstan/) — CACIP: There are 285 snow leopards living in Kyrgyzstan | web_full_page; публикация 2025 |
| [news-24kg-2024](https://24.kg/english/315254_285_snow_leopards_live_on_the_territory_of_Kyrgyzstan____/) — 24.kg: 285 snow leopards live on the territory of Kyrgyzstan | search_excerpt_only_then_403; публикация 2024 |
| [stat-sdg](https://stat.gov.kg/media/publicationarchive/6de87cb2-b960-4797-b036-ad26e6eaa6cb.pdf) — Нацстатком: Статистика ЦУР Кыргызской Республики 2015–2024 | local_full_pdf; публикация 2025 |
| [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx) — Нацстатком: Окружающая среда 2020–2024, приложение | local_full_workbook; публикация 2025 |
| [kumtor-nov-2024](https://www.kumtor.kg/ru/kumt%D3%A9rd%D2%AFn-arkarlary/) — Кумтор: Архары Кумтора | web_full_page; публикация 2024 |
| [kumtor-jun-2024](https://www.kumtor.kg/ru/b%D2%AFg%D2%AFn-b%D2%AFtk%D2%AFl-d%D2%AFjn%D3%A9l%D2%AFk-ajlana-ch%D3%A9jr%D3%A9n%D2%AF-korgoo-k%D2%AFn%D2%AF/) — Кумтор: Всемирный день охраны окружающей среды | web_full_page; публикация 2024 |
| [tca-2024](https://timesca.com/kyrgyzstans-eco-activists-question-official-data-on-rare-animals/) — The Times of Central Asia: Eco-Activists Question Official Data on Rare Animals | web_full_page; публикация 2024 |
| [salvia-2022](https://helda.helsinki.fi/server/api/core/bitstreams/b40734c5-386b-4d3a-8ca4-0210701f6ecd/content) — Sennikov & Turdiboev: Species conservation profile and revision of Salvia korolkowii | local_full_pdf; публикация 2022 |
| [lonicera-2024](https://smujo.id/biodiv/article/download/16106/7517) — Daminova et al. Distribution and conservation of Lonicera paradoxa | web_full_pdf_local_download_403; публикация 2024 |
| [golden-eagle-2023](https://www.brcc.kz/wp-content/uploads/2023/12/20-Ostashchenko-GE.pdf) — Ostashchenko & Zakharov: About the population of the golden eagle in the Eastern Kyrgyz Range | local_full_pdf; публикация 2023 |
| [otter-review-2025](https://www.iucnosgbull.org/Volume42/Savage_et_al_2025.html) — Savage et al. The Status of the Eurasian Otter in Central Asia | web_full_article; публикация 2025 |
| [ammopiptanthus-esia-2025](https://documents1.worldbank.org/curated/en/099081525111754925/pdf/P509251-29eba9a5-eb9a-4f46-8977-75794c51070f.pdf) — Kambarata-1 ESIA Volume III Book 3.1, Appendix 8-B | web_table_excerpt; публикация 2025 |
| [camca-2025](https://camcaproject.org/wp-content/uploads/2025/09/CAMCA_KGZ_Rus_Online_18082025-1.pdf) — camca-2025 | unavailable; публикация не установлена |
| [arabaev-sarychat](https://jarchy.arabaev.kg/admin-admin/fotogalere/1654075639_%202.pdf) — arabaev-sarychat | unavailable; публикация не установлена |
| [bustard-2022](https://eurasianbustardalliance.org/wp-content/uploads/2022/09/Sandgrouse-44-1-BUSTARD-SPECIAL-SECTION-complete.pdf) — Kulagin: Status of the Great Bustard Otis tarda tarda in Kyrgyzstan | web_full_article; публикация 2022 |
| [ibisbill-1976-reprint](https://sciup.org/serpokljuv-ibidorhyncha-struthersii-v-kirgizii-140156760) — Янушевич и Кыдыралиев: Серпоклюв в Киргизии; переиздание 2016 | web_full_article; публикация 2016 |
| [irbis-news-511](https://report.kg/jekologija/60272-v-kyrgyzstane-naschityvaetsja-511-snezhnyh-barsov.html) — Report.kg: В Кыргызстане насчитывается 511 снежных барсов | search_excerpt_only; публикация 2025 |
| [pear-genetics-2025](https://onlinelibrary.wiley.com/doi/pdf/10.1111/mec.17813) — Genetic study of Pyrus korshinskyi species complex | search_abstract_excerpt; публикация 2025 |
| [apple-genetics-2020](https://english.egi.cas.cn/rp/202011/t20201109_248789.html) — CAS report on genomic sampling of Malus sieversii | search_full_summary; публикация 2020 |

## A: все оценки, допустимые для передачи на независимое рассмотрение

Источник: Kubanychbekov et al., *Snow Leopard Reports* 5 (2026), DOI [10.56510/slr.v5.63883](https://publicera.kb.se/slr/article/view/63883), с.28. Полевой период **2020–2024**, публикация **2026-02-20**. Метод — многосессионная пространственная capture–recapture модель по фотоловушкам. Единица — **взрослые особи**. Национальный интервал — **95% CI**; для региональных диапазонов уровень доверия в подписи рисунка не указан.

| Территория | Исходная оценка | Интервал источника | Полевая дата |
|---|---:|---:|---|
| Кыргызстан | ≈300 взрослых | 246–366 | 2020–2024 |
| Кыргызстан, Таласская область | ≈15 взрослых | 12–19 | 2020–2024 |
| Кыргызстан, Чуйская область | ≈23 взрослых | 19–28 | 2020–2024 |
| Кыргызстан, Джалал-Абадская область | ≈46 взрослых | 38–56 | 2020–2024 |
| Кыргызстан, Иссык-Кульская область | ≈72 взрослых | 60–88 | 2020–2024 |
| Кыргызстан, Нарынская область | ≈62 взрослых | 47–81 | 2020–2024 |
| Кыргызстан, Ошская область | ≈50 взрослых | 40–62 | 2020–2024 |
| Кыргызстан, Баткенская область | ≈31 взрослых | 23–43 | 2020–2024 |

Авторская точечная оценка сохранена отдельно от интервала; среднее по границам не рассчитывалось. Региональные значения не суммируются для замены национального результата. Число регистраций фотоловушек и количество индивидуально опознанных животных — данные выборки, не популяция страны.

Ограничения: отдельный исходный отчёт PASK 2024 не получен; публикация прямо сообщает об отсутствии внешнего peer review. Редакционное рассмотрение журнала и упомянутое в статье согласование PASK не являются независимой экспертизой MURAS. Нужна отдельная проверка исходного отчёта, модели, границ территории и возрастного охвата.

## B: исторические и современные неподтверждённые утверждения

Следующая таблица перечисляет **все** сохранённые B-утверждения, включая исторические, глобальные, локальные и отчётные. Подробные причины и ограничения находятся в `records[].estimates[].limitations`. Знак ≈ означает, что документированного полного точного учёта не установлено; целые числа ведомственной отчётности не объявлены exact. Открытые пределы сохранены в `reportedBound` / `reportedNumericRange`, числовые поля модели для них пусты.

| ID / evidenceId | Число и единица | Территория | Год поля / период | Год публикации | Источник, страница |
|---|---|---|---|---:|---|
| irbis / slt-150-500 | 150–500 individuals | Кыргызстан | не установлен | не установлен | [slt-kyrgyzstan](https://snowleopard.org/our-work/where-we-work/kyrgyzstan/), раздел страницы |
| irbis / gslep-150-500 | 150–500 individuals | Кыргызстан | полевой неизвестен; evaluation 2001 | не установлен | [gslep-habitat](https://globalsnowleopard.org/the-snow-leopard/cat-facts/snow-leopard-habitat/), раздел страницы |
| irbis / gslep-global | 4000–6500 individuals | Мировой ареал | не установлен | не установлен | [gslep-habitat](https://globalsnowleopard.org/the-snow-leopard/cat-facts/snow-leopard-habitat/), раздел страницы |
| irbis / presentation-2024 | 234–349; авторская точка ≈285 individuals | Кыргызстан | 2020–2024 | 2025 | [cacip-2025](https://centralasiaclimateportal.org/there-are-285-snow-leopards-living-in-kyrgyzstan/), раздел страницы |
| irbis / book-1980s | ≈1400 individuals | Кыргызстан | начало 1980-х; точные полевые годы не установлены | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 511 |
| irbis / book-koshkarev | 600–700 individuals | Кыргызстан | не установлен | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 511 |
| irbis / book-late | 150–250 (не превышает диапазона 150–250; не точный закрытый интервал) individuals | Кыргызстан | не установлен | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 511 |
| irbis / book-global | 5000–7000 individuals | Мировой ареал | не установлен | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 511 |
| irbis / kumtor-irbis-18 | ≈18 individuals | Рудник Кумтор и окрестности, Кыргызстан | не установлен | 2024 | [kumtor-jun-2024](https://www.kumtor.kg/ru/b%D2%AFg%D2%AFn-b%D2%AFtk%D2%AFl-d%D2%AFjn%D3%A9l%D2%AFk-ajlana-ch%D3%A9jr%D3%A9n%D2%AF-korgoo-k%D2%AFn%D2%AF/), раздел страницы |
| irbis / stat-protected-2024-irbis | ≈143 individuals | Государственные природные заповедники и природные парки Кыргызстана | полевой неизвестен; отчётный 2024 | 2025 | [stat-sdg](https://stat.gov.kg/media/publicationarchive/6de87cb2-b960-4797-b036-ad26e6eaa6cb.pdf), 116 |
| irbis / news-511-2024 | ≈511 individuals | Кыргызстан | полевой неизвестен; отчётный 2024 | 2025 | [irbis-news-511](https://report.kg/jekologija/60272-v-kyrgyzstane-naschityvaetsja-511-snezhnyh-barsov.html), раздел страницы |
| argali / kumtor-argali-2500 | ≈2500 individuals | Сарычат-Эрташский заповедник, Кыргызстан | не установлен | 2024 | [kumtor-jun-2024](https://www.kumtor.kg/ru/b%D2%AFg%D2%AFn-b%D2%AFtk%D2%AFl-d%D2%AFjn%D3%A9l%D2%AFk-ajlana-ch%D3%A9jr%D3%A9n%D2%AF-korgoo-k%D2%AFn%D2%AF/), раздел страницы |
| argali / kumtor-nov-bound | > 140 individuals | Нижняя зона рудника Кумтор, Кыргызстан | 2024 | 2024 | [kumtor-nov-2024](https://www.kumtor.kg/ru/kumt%D3%A9rd%D2%AFn-arkarlary/), абзац о ноябре 2024 |
| argali / book-pamir | 8000–10000 individuals | Кыргызстан, памирская форма горного барана | не установлен | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 517 |
| argali / book-tianshan-bound | <= 1000 individuals | Кыргызстан, тянь-шанская форма горного барана | не установлен | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 517 |
| argali / stat-hunting-argali-2020 | ≈16986 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2020 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.16-4.19!B49 |
| argali / stat-hunting-argali-2021 | ≈17507 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2021 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.16-4.19!C49 |
| argali / stat-hunting-argali-2022 | ≈19110 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2022 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.16-4.19!D49 |
| argali / stat-hunting-argali-2023 | ≈18558 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2023 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.16-4.19!E49 |
| argali / stat-hunting-argali-2024 | ≈15960 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2024 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.16-4.19!F49 |
| manul / book-sarychat | 10–12 individuals | Сарычат, Кыргызстан; обследовано 14000 га | 1977–1979 | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 507 |
| golden-eagle / stat-hunting-golden-eagle-2020 | ≈297 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2020 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.19 прод-4.21!B25 |
| golden-eagle / stat-hunting-golden-eagle-2021 | ≈339 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2021 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.19 прод-4.21!C25 |
| golden-eagle / stat-hunting-golden-eagle-2022 | ≈395 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2022 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.19 прод-4.21!D25 |
| golden-eagle / stat-hunting-golden-eagle-2023 | ≈395 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2023 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.19 прод-4.21!E25 |
| golden-eagle / stat-hunting-golden-eagle-2024 | ≈248 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2024 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.19 прод-4.21!F25 |
| marbled-polecat / stat-protected-2024-marbled-polecat | ≈7 individuals | Государственные природные заповедники и природные парки Кыргызстана | полевой неизвестен; отчётный 2024 | 2025 | [stat-sdg](https://stat.gov.kg/media/publicationarchive/6de87cb2-b960-4797-b036-ad26e6eaa6cb.pdf), 116 |
| black-stork / book-storks-bound | <= 25 pairs | Кыргызстан | не установлен | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 375 |
| ibisbill / book-ibisbill-old | 23–25 pairs | Кыргызстан | не установлен | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 443 |
| ibisbill / book-ibisbill-revised | >= 200 pairs | Кыргызстан | не установлен | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 443 |
| ibisbill / book-chon-kemin | 20–22 pairs | Чон-Кемин, Кыргызстан | не установлен | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 443 |
| ibisbill / book-alabash | 6–9 pairs | Алабашская долина, Кыргызстан | не установлен | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 443 |
| ibisbill / ibisbill-1976-Ат-Баши | 4–5 breeding pairs | Кыргызстан, пойма Ат-Баши | не установлен | 2016 | [ibisbill-1976-reprint](https://sciup.org/serpokljuv-ibidorhyncha-struthersii-v-kirgizii-140156760), 5026–5027 |
| ibisbill / ibisbill-1976-Ак-Сай | 4–5 breeding pairs | Кыргызстан, пойма Ак-Сай | не установлен | 2016 | [ibisbill-1976-reprint](https://sciup.org/serpokljuv-ibidorhyncha-struthersii-v-kirgizii-140156760), 5026–5027 |
| ibisbill / ibisbill-1976-Кара-Куджур | 2–3 breeding pairs | Кыргызстан, пойма Кара-Куджур | не установлен | 2016 | [ibisbill-1976-reprint](https://sciup.org/serpokljuv-ibidorhyncha-struthersii-v-kirgizii-140156760), 5026–5027 |
| eurasian-lynx / stat-hunting-eurasian-lynx-2020 | ≈1175 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2020 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.19 прод-4.21!B16 |
| eurasian-lynx / stat-hunting-eurasian-lynx-2021 | ≈1082 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2021 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.19 прод-4.21!C16 |
| eurasian-lynx / stat-hunting-eurasian-lynx-2022 | ≈1307 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2022 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.19 прод-4.21!D16 |
| eurasian-lynx / stat-hunting-eurasian-lynx-2023 | ≈1444 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2023 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.19 прод-4.21!E16 |
| eurasian-lynx / stat-hunting-eurasian-lynx-2024 | ≈897 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2024 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.19 прод-4.21!F16 |
| menzbiers-marmot / book-marmot-ru | ≈1503 individuals | Беш-Аральский заповедник и упомянутые горные участки, Кыргызстан; границы итога неясны | не установлен | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 519, RU |
| menzbiers-marmot / book-marmot-en | ≈10000 individuals | Беш-Аральский заповедник, Кыргызстан | 1999 | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 519, EN |
| great-bustard / bustard-season-breeding | 1–2 individuals | Кыргызстан; сезон breeding | не установлен | 2022 | [bustard-2022](https://eurasianbustardalliance.org/wp-content/uploads/2022/09/Sandgrouse-44-1-BUSTARD-SPECIAL-SECTION-complete.pdf), 84 (PDF 86), Table 1 |
| great-bustard / bustard-season-migration_gathering | 4–10 individuals | Кыргызстан; сезон migration_gathering | не установлен | 2022 | [bustard-2022](https://eurasianbustardalliance.org/wp-content/uploads/2022/09/Sandgrouse-44-1-BUSTARD-SPECIAL-SECTION-complete.pdf), 84 (PDF 86), Table 1 |
| great-bustard / bustard-season-wintering | 2–5 individuals | Кыргызстан; сезон wintering | не установлен | 2022 | [bustard-2022](https://eurasianbustardalliance.org/wp-content/uploads/2022/09/Sandgrouse-44-1-BUSTARD-SPECIAL-SECTION-complete.pdf), 84 (PDF 86), Table 1 |
| lyrurus-tetrix / stat-hunting-lyrurus-tetrix-2020 | ≈62 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2020 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.19 прод-4.21!B21 |
| lyrurus-tetrix / stat-hunting-lyrurus-tetrix-2021 | ≈76 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2021 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.19 прод-4.21!C21 |
| lyrurus-tetrix / stat-hunting-lyrurus-tetrix-2022 | ≈51 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2022 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.19 прод-4.21!D21 |
| lyrurus-tetrix / stat-hunting-lyrurus-tetrix-2023 | ≈65 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2023 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.19 прод-4.21!E21 |
| cygnus-cygnus / book-whooper-bound | <= 1400 individuals | Иссык-Куль, Кыргызстан; осень | не установлен | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 363 |
| mergus-serrator / book-merganser | 10–15 (вероятно не превышает 10–15; не измеренный точный интервал) breeding pairs | Кыргызстан | не установлен | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 367 |
| gavia-arctica / book-diver | 5–6 breeding pairs | Кыргызстан | не установлен | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 371 |
| ciconia-ciconia / book-white-stork | 10–20 pairs | Кыргызстан | не установлен | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 377 |
| ciconia-ciconia / book-white-stork-global-subspecies | 1000–2000 individuals | Ареал исторического азиатского подвида; не вся Ciconia ciconia | не установлен | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 377 |
| haliaeetus-albicilla / book-sea-eagle | 25–30 (по меньшей мере 25–30; не точный закрытый интервал) individuals | Кыргызстан, зимующие птицы | не установлен | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 401 |
| ursus-arctos / book-fergana-bear | 200–250 individuals | Восточные склоны Ферганского хребта, Кыргызстан, около 200000 га | 1964 | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 499 |
| ursus-arctos / book-sarychelek-bear | ≈26 individuals | Сары-Челекский заповедник, Кыргызстан, участок 10000–12000 га | не установлен | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 499 |
| ursus-arctos / stat-hunting-ursus-arctos-2020 | ≈247 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2020 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.19 прод-4.21!B9 |
| ursus-arctos / stat-hunting-ursus-arctos-2021 | ≈200 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2021 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.19 прод-4.21!C9 |
| ursus-arctos / stat-hunting-ursus-arctos-2022 | ≈227 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2022 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.19 прод-4.21!D9 |
| ursus-arctos / stat-hunting-ursus-arctos-2023 | ≈314 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2023 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.19 прод-4.21!E9 |
| ursus-arctos / stat-hunting-ursus-arctos-2024 | ≈269 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2024 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.19 прод-4.21!F9 |
| lutra-lutra / stat-protected-2024-lutra-lutra | ≈6 individuals | Государственные природные заповедники и природные парки Кыргызстана | полевой неизвестен; отчётный 2024 | 2025 | [stat-sdg](https://stat.gov.kg/media/publicationarchive/6de87cb2-b960-4797-b036-ad26e6eaa6cb.pdf), 116 |
| ammopiptanthus-nanus / book-ammopiptanthus | ≈15000 individuals | Кыргызстан | 1979 | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 147 |
| ammopiptanthus-nanus / esia-ammopiptanthus-table | 3000–4000 individuals | Кыргызстан | не установлен | 2025 | [ammopiptanthus-esia-2025](https://documents1.worldbank.org/curated/en/099081525111754925/pdf/P509251-29eba9a5-eb9a-4f46-8977-75794c51070f.pdf), 44, Appendix 8-B |
| ammopiptanthus-nanus / esia-ammopiptanthus-rationale | 3000–5000 individuals | Кыргызстан | не установлен | 2025 | [ammopiptanthus-esia-2025](https://documents1.worldbank.org/curated/en/099081525111754925/pdf/P509251-29eba9a5-eb9a-4f46-8977-75794c51070f.pdf), 44, Appendix 8-B |
| salvia-korolkowii / salvia-global-bound | < 10000 mature individuals | Мировой ареал: Узбекистан, Казахстан, Кыргызстан | не установлен | 2022 | [salvia-2022](https://helda.helsinki.fi/server/api/core/bitstreams/b40734c5-386b-4d3a-8ca4-0210701f6ecd/content), 12–13 (PDF 13–14) |
| lonicera-paradoxa / book-lonicera-1969 | ≈22 individuals | Алайский хребет, Кыргызстан | 1969 | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 207 |
| lonicera-paradoxa / book-lonicera-1973 | ≈12 individuals | Алайский хребет, Кыргызстан | 1973 | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 207 |
| lonicera-paradoxa / book-lonicera-global | 30–40 (не превышает 30–40; не доказанный закрытый интервал) shrubs | Известные местонахождения мирового ареала | не установлен | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 207 |
| lonicera-paradoxa / lonicera-2024-global | 70–75 (no more than 70–75) plants of various ages | Известные местонахождения Pamir-Alay, несколько стран | не установлен | 2024 | [lonicera-2024](https://smujo.id/biodiv/article/download/16106/7517), 446 (PDF 8) |
| anser-indica / book-sonkul-geese | 44–49 individuals | Сон-Куль, Кыргызстан | 1992–1996 | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 361 |
| anser-indica / book-chatyrkul-geese | 282–342 individuals | Чатыр-Куль, Кыргызстан | 1997–2003 | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 361 |
| anser-indica / book-chatyrkul-undated | 300–350 individuals | Чатыр-Куль, Кыргызстан | не установлен | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 361 |
| anthropoides-virgo / book-demoiselle-bound | < 100 breeding pairs | Кыргызстан | не установлен | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 439 |
| cervus-elaphus-asiaticus / book-naryn-maral-1983 | ≈130 individuals | Нарынская популяция марала, Кыргызстан; включая выходы за заповедник | 1983 | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 513 |
| cervus-elaphus-asiaticus / book-naryn-maral-1985 | ≈150 individuals | Нарынская популяция марала, Кыргызстан; включая выходы за заповедник | 1985 | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 513 |
| cervus-elaphus-asiaticus / book-naryn-maral-2003 | ≈280 individuals | Нарынская популяция марала, Кыргызстан; включая выходы за заповедник | 2003 | 2006 | [redbook-2006](https://macrolepidoptera.ru/lnk/282.pdf), 513 |
| cervus-elaphus-asiaticus / stat-hunting-cervus-elaphus-asiaticus-2020 | ≈101 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2020 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.16-4.19!B53 |
| cervus-elaphus-asiaticus / stat-hunting-cervus-elaphus-asiaticus-2021 | ≈118 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2021 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.16-4.19!C53 |
| cervus-elaphus-asiaticus / stat-hunting-cervus-elaphus-asiaticus-2022 | ≈62 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2022 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.16-4.19!D53 |
| cervus-elaphus-asiaticus / stat-hunting-cervus-elaphus-asiaticus-2023 | ≈61 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2023 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.16-4.19!E53 |
| cervus-elaphus-asiaticus / stat-hunting-cervus-elaphus-asiaticus-2024 | ≈47 individuals | Отчитавшиеся охотничьи хозяйства Кыргызстана; переменный охват | полевой неизвестен; отчётный 2024 | 2025 | [stat-environment-2025](https://www.stat.gov.kg/media/publicationarchive/faecd7b0-d26a-47a9-888b-8d8e3be0a62b.xlsx), таблица 4.19, Т. 4.16-4.19!F53 |

Исторические численные утверждения (Красная книга и текст 1976 года): **36**. Их полный список: `book-1980s`, `book-koshkarev`, `book-late`, `book-global`, `book-pamir`, `book-tianshan-bound`, `book-sarychat`, `book-storks-bound`, `book-ibisbill-old`, `book-ibisbill-revised`, `book-chon-kemin`, `book-alabash`, `ibisbill-1976-Ат-Баши`, `ibisbill-1976-Ак-Сай`, `ibisbill-1976-Кара-Куджур`, `book-marmot-ru`, `book-marmot-en`, `book-whooper-bound`, `book-merganser`, `book-diver`, `book-white-stork`, `book-white-stork-global-subspecies`, `book-sea-eagle`, `book-fergana-bear`, `book-sarychelek-bear`, `book-ammopiptanthus`, `book-lonicera-1969`, `book-lonicera-1973`, `book-lonicera-global`, `book-sonkul-geese`, `book-chatyrkul-geese`, `book-chatyrkul-undated`, `book-demoiselle-bound`, `book-naryn-maral-1983`, `book-naryn-maral-1985`, `book-naryn-maral-2003`.

Утверждения с территорией внутри Кыргызстана: **85**, включая локальные и неполные ведомственные показатели; это не 85 национальных оценок. Все они перечислены выше и в JSON с `scope: KG`.

Глобальные / многогосударственные / подвидовые оценки, которые нельзя переносить на Кыргызстан: `gslep-global`, `book-global`, `book-white-stork-global-subspecies`, `salvia-global-bound`, `book-lonicera-global`, `lonicera-2024-global`.

## Существенные расхождения и исключённые показатели

- **Ирбис, 150–500:** страница Snow Leopard Trust не устанавливает год и метод. В таблице GSLEP указано evaluation 2001; это не доказанная дата полевых работ. Начало программы SLT и footer сайта не используются как даты учёта.
- **Ирбис, версии результатов:** атрибутированное сообщение о презентации 2024 года даёт 285 и 234–349; публикация 2026 года даёт другую модельную оценку. Сообщение о 511 за отчётный 2024 год имеет непроверенную методику и возрастной охват. Разные версии не усредняются и не доказывают увеличение численности.
- **Сурок Мензбира:** русский очерк с.519 приводит 1503 без ясного года; английское резюме — около 10000 по заповедному учёту 1999 года. Границы охвата и исходные отчёты требуют проверки. Численность серого сурка не переносится на M. menzbieri.
- **Аммопиптант:** 15000 относится к 1979 году. ESIA 2025 содержит 3000–4000 в таблице и 3000–5000 в пояснении, без установленного полевого года. Ни одна версия не выбрана автоматически.
- **Дрофа, Otis tarda tarda:** статья Kulagin 2022 даёт экспертные сезонные диапазоны, но опорный полевой год не указан; текст и таблица расходятся по современному гнездованию. Категория B. Ненахождение птиц в книге не заменено нулём.
- **Серпоклюв:** репринт 2016 воспроизводит сообщение 1976, а не новый учёт. Локальные числа пар не суммируются в национальное число особей.
- **Выдра:** государственная статистика относится к охраняемым территориям; обзор IUCN OSG 2025 сообщает ненахождение следов летом 2023 лишь в одном бассейне. Это не подтверждение национального нуля или исчезновения.
- **Жимолость:** мировой ориентир 70–75 не является численностью КР; Шахимардан — узбекский анклав. В статье 2024 различаются периоды работ в abstract, Methods и Discussion. Три найденных растения в кыргызской части — находки, не полный учёт страны.
- **Охотничьи хозяйства:** таблица 4.19 — отдельный охват; 2024 не подставлен как точная полевая дата. Смена числа отчитавшихся хозяйств и площади не позволяет считать ряд доказанным трендом всей страны. Строки «гриф», «куница», «сурок» не назначены произвольному виду.
- **Подвиды и исторические концепции:** числа форм архара, азиатского белого аиста и местного марала сохранены с ограничениями. Нельзя объявлять их оценками всего принятого вида или присваивать подвидам число родительского вида.
- **Непопуляционные данные:** плотность на га/км², встречи на маршруте, группировки, повторные наблюдения, отлов на усилие, количество генотипированных растений, ex situ коллекции, площадь леса, проценты и масса улова исключены из оценок популяции. GBIF occurrence counts не используются.
- **Джейран:** подтверждённая современная устойчивая популяция в Кыргызстане не заявлена; казахстанские числа не перенесены в КР.

Локально недоступны PDF CAMCA и Сарычат-Эрташских учётов (HTTP 403), PDF Lonicera также вернул 403 при скачивании, но прочитан через web. Статья о мануле недоступна из-за перенаправления; PDF о пеликане превышает лимит web. Исходная ссылка Kabar недоступна; 24.kg повторно вернул 403. Эти ограничения не обходились, поисковые фрагменты не становились допущенными данными.

## Совместимость модели и отдельный допуск

Использованы имена существующей модели: `type`, `value`, `min`, `max`, `unit`, `territory`, `year`, `method`, `reviewStatus`. Диапазон — `approximate` с `min/max`, без искусственного `range`-типа. Описательная методика хранится в `methodology`. Для каждого утверждения есть собственные источники, страница, год публикации и ограничения. На уровне таксона значения остаются unknown, выбранной публичной оценки нет.

Для многолетних исследований `year=null`, а настоящий период хранится в `observationPeriod`. Отчётный год — `statisticalReferenceYear`, год оценки — `assessmentYear` / `assessmentReferenceYear`. Эти метаданные не подменяют поле наблюдения. **Ни одна A-запись сейчас не является готовым объектом для импорта в действующую модель с одним годом.** Отдельное редакционное решение о представлении периода требуется до любого будущего численного отображения; валидатор не изменён.

План: (1) передать восемь A-оценок ирбиса независимому специалисту с запросом PASK 2024 и проверкой методики; (2) отдельно разрешить возрастной охват, временную маркировку и версии результатов; (3) запросить протоколы для 23 B-таксонов, начиная с официальных локальных учётов и исторических конфликтов; (4) для C оставить unknown и планировать целевые обращения к специалистам; (5) только после документированного научного review и отдельного редакционного допуска готовить самостоятельную задачу отображения. Разрешения и подписи экспертов в этом пакете отсутствуют.

## Полный реестр 184 таксонов

| ID | Принятое научное имя | Ранг | Группа | Категория | Страница книги | Утверждений |
|---|---|---|---|---|---:|---:|
| irbis | Panthera uncia | SPECIES | mammals | A | 511 | 19 |
| argali | Ovis ammon | SPECIES | mammals | B | 517 | 9 |
| manul | Otocolobus manul | SPECIES | mammals | B | 507 | 1 |
| golden-eagle | Aquila chrysaetos | SPECIES | birds | B | 425 | 5 |
| bearded-vulture | Gypaetus barbatus | SPECIES | birds | C | 403 | 0 |
| saker-falcon | Falco cherrug | SPECIES | birds | C | 389 | 0 |
| greigs-tulip | Tulipa greigii | SPECIES | plants | C | 81 | 0 |
| kaufmanns-tulip | Tulipa kaufmanniana | SPECIES | plants | C | 83 | 0 |
| sievers-apple | Malus sieversii | SPECIES | plants | C | 137 | 0 |
| central-asian-tortoise | Testudo horsfieldii | SPECIES | reptiles | C | 331 | 0 |
| central-asian-frog | Rana asiatica | SPECIES | amphibians | C | 329 | 0 |
| predatory-bush-cricket | Saga pedo | SPECIES | arthropods | C | 253 | 0 |
| dog-stinkhorn | Mutinus caninus | SPECIES | fungi | C | 43 | 0 |
| marbled-polecat | Vormela peregusna | SPECIES | mammals | B | 503 | 1 |
| black-stork | Ciconia nigra | SPECIES | birds | B | 375 | 1 |
| ibisbill | Ibidorhyncha struthersii | SPECIES | birds | B | 443 | 7 |
| eduards-fritillary | Fritillaria eduardii | SPECIES | plants | C | 75 | 0 |
| european-glass-lizard | Pseudopus apodus | SPECIES | reptiles | C | 337 | 0 |
| dalmatian-pelican | Pelecanus crispus | SPECIES | birds | C | 383 | 0 |
| eurasian-lynx | Lynx lynx | SPECIES | mammals | B | 509 | 5 |
| kolpakowskis-tulip | Tulipa kolpakowskiana | SPECIES | plants | C | 85 | 0 |
| ostrowskis-tulip | Tulipa ostrowskiana | SPECIES | plants | C | 89 | 0 |
| pike-asp | Aspiolucius esocinus | SPECIES | fish | C | 301 | 0 |
| turkestan-catfish | Glyptosternon reticulatum | SPECIES | fish | C | 313 | 0 |
| christophs-clouded-yellow | Colias christophi | SPECIES | arthropods | C | 265 | 0 |
| relict-spider | Tricholathys relicta | SPECIES | arthropods | C | 249 | 0 |
| tien-shan-scutiger | Albatrellus tianschanicus | SPECIES | fungi | C | 45 | 0 |
| menzbiers-marmot | Marmota menzbieri | SPECIES | mammals | B | 519 | 2 |
| semenovs-fir | Abies sibirica semenovii | SUBSPECIES | plants | C | 61 | 0 |
| great-bustard | Otis tarda tarda | SUBSPECIES | birds | B | 431 | 3 |
| said-alievs-toad-agama | Phrynocephalus saidalievi | SPECIES | reptiles | C | 333 | 0 |
| vigorous-ground-beetle | Carabus validus | SPECIES | arthropods | C | 259 | 0 |
| pskem-onion | Allium pskemense | SPECIES | plants | C | 71 | 0 |
| kostychevs-pasque-flower | Pulsatilla kostyczewii | SPECIES | plants | C | 113 | 0 |
| indian-crested-porcupine | Hystrix indica | SPECIES | mammals | C | 521 | 0 |
| fergana-ground-beetle | Carabus ferghanicus | SPECIES | arthropods | C | 257 | 0 |
| giant-robber-fly | Satanas gigas | SPECIES | arthropods | C | 273 | 0 |
| korzhinskys-pear | Pyrus korshinskyi | SPECIES | plants | C | 133 | 0 |
| cinereous-vulture | Aegypius monachus | SPECIES | birds | C | 411 | 0 |
| egyptian-vulture | Neophron percnopterus | SPECIES | birds | C | 405 | 0 |
| eminium-regelii | Eminium regelii | SPECIES | plants | C | 63 | 0 |
| eremurus-zenaidae | Eremurus zenaidae | SPECIES | plants | C | 65 | 0 |
| eremurus-zoae | Eremurus zoae | SPECIES | plants | C | 67 | 0 |
| allium-dodecadontum | Allium dodecadontum | SPECIES | plants | C | 69 | 0 |
| allium-semenovii | Allium semenovii | SPECIES | plants | C | 73 | 0 |
| tulipa-affinis | Tulipa fosteriana | SPECIES | plants | C | 77 | 0 |
| tulipa-korolkowii | Tulipa korolkowii | SPECIES | plants | C | 87 | 0 |
| tulipa-platystemon | Tulipa platystemon | SPECIES | plants | C | 91 | 0 |
| tulipa-tetraphylla | Tulipa tetraphylla | SPECIES | plants | C | 95 | 0 |
| tulipa-zenaidae | Tulipa lehmanniana | SPECIES | plants | C | 97 | 0 |
| juno-orchioides | Iris orchioides | SPECIES | plants | C | 99 | 0 |
| iridodictyum-kolpakowskianum | Iris kolpakowskiana | SPECIES | plants | C | 101 | 0 |
| thesium-minkwitzianum | Chrysothesium minkwitzianum | SPECIES | plants | C | 103 | 0 |
| delphinium-knorringianum | Delphinium knorringianum | SPECIES | plants | C | 109 | 0 |
| urocerus-sah | Urocerus sah | SPECIES | arthropods | C | 275 | 0 |
| masaris-longicornis | Masaris longicornis | SPECIES | arthropods | C | 281 | 0 |
| varanus-griseus-caspius | Varanus griseus caspius | SUBSPECIES | reptiles | C | 335 | 0 |
| lyrurus-tetrix | Lyrurus tetrix | SPECIES | birds | B | 359 | 4 |
| cygnus-cygnus | Cygnus cygnus | SPECIES | birds | B | 363 | 1 |
| aythya-nyroca | Aythya nyroca | SPECIES | birds | C | 365 | 0 |
| mergus-serrator | Mergus serrator | SPECIES | birds | B | 367 | 1 |
| oxyura-leucocephala | Oxyura leucocephala | SPECIES | birds | C | 369 | 0 |
| gavia-arctica | Gavia arctica | SPECIES | birds | B | 371 | 1 |
| ciconia-ciconia | Ciconia ciconia | SPECIES | birds | B | 377 | 2 |
| platalea-leucorodia | Platalea leucorodia | SPECIES | birds | C | 379 | 0 |
| pelecanus-onocrotalus | Pelecanus onocrotalus | SPECIES | birds | C | 381 | 0 |
| phalacrocorax-pygmaeus | Microcarbo pygmaeus | SPECIES | birds | C | 385 | 0 |
| falco-naumanni | Falco naumanni | SPECIES | birds | C | 387 | 0 |
| falco-rusticolus | Falco rusticolus | SPECIES | birds | C | 391 | 0 |
| pandion-haliaetus | Pandion haliaetus | SPECIES | birds | C | 397 | 0 |
| haliaeetus-leucoryphus | Haliaeetus leucoryphus | SPECIES | birds | C | 399 | 0 |
| haliaeetus-albicilla | Haliaeetus albicilla | SPECIES | birds | B | 401 | 1 |
| gyps-himalayensis | Gyps himalayensis | SPECIES | birds | C | 407 | 0 |
| gyps-fulvus | Gyps fulvus | SPECIES | birds | C | 409 | 0 |
| circaetus-gallicus | Circaetus gallicus | SPECIES | birds | C | 413 | 0 |
| circus-macrourus | Circus macrourus | SPECIES | birds | C | 415 | 0 |
| neomys-fodiens | Neomys fodiens | SPECIES | mammals | C | 485 | 0 |
| rhinolophus-bocharicus | Rhinolophus bocharicus | SPECIES | mammals | C | 487 | 0 |
| barbastella-leucomelas | Barbastella leucomelas | SPECIES | mammals | C | 491 | 0 |
| tadarida-teniotis | Tadarida teniotis | SPECIES | mammals | C | 495 | 0 |
| ursus-arctos | Ursus arctos | SPECIES | mammals | B | 499 | 7 |
| martes-foina | Martes foina | SPECIES | mammals | C | 501 | 0 |
| lutra-lutra | Lutra lutra | SPECIES | mammals | B | 505 | 1 |
| allactaga-elater | Allactaga elater | SPECIES | mammals | C | 523 | 0 |
| dictyocephalus-attenuatus | Dictyocephalos attenuatus | SPECIES | fungi | C | 39 | 0 |
| prionus-tschitscherini | Pogonarthron tschitscherini | SPECIES | arthropods | C | 261 | 0 |
| rossomyrmex-proformicarum | Rossomyrmex proformicarum | SPECIES | arthropods | C | 283 | 0 |
| barbus-brachycephalus | Luciobarbus brachycephalus | SPECIES | fish | C | 305 | 0 |
| allochrusa-gypsophiloides | Acanthophyllum gypsophiloides | SPECIES | plants | C | 107 | 0 |
| corydalis-pseudoadunca | Corydalis pseudoadunca | SPECIES | plants | C | 117 | 0 |
| fumariola-turkestanica | Fumariola turkestanica | SPECIES | plants | C | 119 | 0 |
| rhodiola-litwinowii | Rhodiola litwinowii | SPECIES | plants | C | 123 | 0 |
| sibiraea-tianschanica | Sibiraea tianschanica | SPECIES | plants | C | 125 | 0 |
| crataegus-knorringiana | Crataegus knorringiana | SPECIES | plants | C | 139 | 0 |
| ammopiptanthus-nanus | Ammopiptanthus nanus | SPECIES | plants | B | 147 | 3 |
| colutea-brachyptera | Colutea brachyptera | SPECIES | plants | C | 149 | 0 |
| primula-eugeniae | Primula eugeniae | SPECIES | plants | C | 179 | 0 |
| physochlaina-alaica | Physochlaina alaica | SPECIES | plants | C | 199 | 0 |
| incarvillea-olgae | Incarvillea olgae | SPECIES | plants | C | 205 | 0 |
| saussurea-involucrata | Saussurea involucrata | SPECIES | plants | C | 213 | 0 |
| silene-sussamyrica | Silene sussamyrica | SPECIES | plants | C | 105 | 0 |
| iskandera-alaica | Iskandera alaica | SPECIES | plants | C | 121 | 0 |
| spiraeanthus-schrenkianus | Spiraeanthus schrenckianus | SPECIES | plants | C | 129 | 0 |
| chesneya-villosa | Chesneya villosa | SPECIES | plants | C | 151 | 0 |
| hedysarum-chaitocarpum | Hedysarum chaitocarpum | SPECIES | plants | C | 153 | 0 |
| zygophyllum-kaschgaricum | Zygophyllum kaschgaricum | SPECIES | plants | C | 155 | 0 |
| sclerotiaria-pentaceros | Sclerotiaria pentaceros | SPECIES | plants | C | 159 | 0 |
| bupleurum-rosulare | Bupleurum rosulare | SPECIES | plants | C | 165 | 0 |
| hyalolaena-intermedia | Hyalolaena intermedia | SPECIES | plants | C | 167 | 0 |
| seseli-eryngioides | Seseli eryngioides | SPECIES | plants | C | 169 | 0 |
| seseli-korshinskyi | Seseli korshinskyi | SPECIES | plants | C | 171 | 0 |
| cnidiocarpa-alaica | Cnidiocarpa alaica | SPECIES | plants | C | 173 | 0 |
| pastinacopsis-glacialis | Pastinacopsis glacialis | SPECIES | plants | C | 177 | 0 |
| kaufmannia-semenovii | Kaufmannia semenovii | SPECIES | plants | C | 183 | 0 |
| acantholimon-compactum | Acantholimon compactum | SPECIES | plants | C | 185 | 0 |
| scutellaria-andrachnoides | Scutellaria andrachnoides | SPECIES | plants | C | 187 | 0 |
| scutellaria-nepetoides | Scutellaria nepetoides | SPECIES | plants | C | 189 | 0 |
| salvia-korolkowii | Salvia korolkowii | SPECIES | plants | B | 195 | 1 |
| nathaliella-alaica | Nathaliella alaica | SPECIES | plants | C | 203 | 0 |
| lonicera-paradoxa | Lonicera paradoxa | SPECIES | plants | B | 207 | 4 |
| campanula-eugeniae | Campanula eugeniae | SPECIES | plants | C | 209 | 0 |
| lamyropappus-schakaptaricus | Lamyropappus schakaptaricus | SPECIES | plants | C | 211 | 0 |
| trichanthemis-aulieatensis | Trichanthemis aulieatensis | SPECIES | plants | C | 219 | 0 |
| trichanthemis-aurea | Trichanthemis aurea | SPECIES | plants | C | 221 | 0 |
| lepidolopha-komarowii | Lepidolopha komarowii | SPECIES | plants | C | 225 | 0 |
| barbus-capito-conocephalus | Luciobarbus conocephalus | SPECIES | fish | C | 307 | 0 |
| vipera-ursinii-renardi | Vipera renardi | SPECIES | reptiles | C | 345 | 0 |
| kirgisobia-bohnei | Kirgizobia bohnei | SPECIES | arthropods | C | 263 | 0 |
| anser-indica | Anser indicus | SPECIES | birds | B | 361 | 3 |
| accipiter-badius | Accipiter badius | SPECIES | birds | C | 417 | 0 |
| aquila-clanga | Aquila clanga | SPECIES | birds | C | 419 | 0 |
| aquila-nipalensis | Aquila nipalensis | SPECIES | birds | C | 421 | 0 |
| aquila-heliaca | Aquila heliaca | SPECIES | birds | C | 423 | 0 |
| hieraaetus-fasciatus | Aquila fasciata | SPECIES | birds | C | 427 | 0 |
| hieraaetus-pennatus | Hieraaetus pennatus | SPECIES | birds | C | 429 | 0 |
| tetrax-tetrax | Tetrax tetrax | SPECIES | birds | C | 435 | 0 |
| crex-crex | Crex crex | SPECIES | birds | C | 437 | 0 |
| anthropoides-virgo | Anthropoides virgo | SPECIES | birds | B | 439 | 1 |
| burhinus-oedicnemus | Burhinus oedicnemus | SPECIES | birds | C | 441 | 0 |
| vanellus-gregarius | Vanellus gregarius | SPECIES | birds | C | 445 | 0 |
| glareola-nordmanni | Glareola nordmanni | SPECIES | birds | C | 449 | 0 |
| strix-aluco | Strix aluco | SPECIES | birds | C | 465 | 0 |
| syrrhaptes-paradoxus | Syrrhaptes paradoxus | SPECIES | birds | C | 453 | 0 |
| pterocles-alchata | Pterocles alchata | SPECIES | birds | C | 455 | 0 |
| pterocles-orientalis | Pterocles orientalis | SPECIES | birds | C | 457 | 0 |
| columba-leuconota | Columba leuconota | SPECIES | birds | C | 459 | 0 |
| columba-eversmanni | Columba eversmanni | SPECIES | birds | C | 461 | 0 |
| bubo-bubo | Bubo bubo | SPECIES | birds | C | 463 | 0 |
| gazella-subgutturosa | Gazella subgutturosa | SPECIES | mammals | C | 515 | 0 |
| dendrocopos-leucopterus | Dendrocopos leucopterus | SPECIES | birds | C | 467 | 0 |
| sorbus-persica | Hedlundia persica | SPECIES | plants | C | 141 | 0 |
| amygdalus-petunnikowii | Prunus petunnikowii | SPECIES | plants | C | 143 | 0 |
| kosopoljanskia-turkestanica | Schrenkia turkestanica | SPECIES | plants | C | 163 | 0 |
| alajja-anomala | Eriophyton anomalum | SPECIES | plants | C | 191 | 0 |
| otostegia-schennikovii | Moluccella olgae | SPECIES | plants | C | 193 | 0 |
| salvia-vvedenskyi | Salvia vvedenskii | SPECIES | plants | C | 197 | 0 |
| stemmacantha-aulieatensis | Leuzea aulieatensis | SPECIES | plants | C | 215 | 0 |
| centaurea-alaica | Rhaponticoides alaica | SPECIES | plants | C | 217 | 0 |
| pyrethrum-leontopodium | Richteria leontopodium | SPECIES | plants | C | 223 | 0 |
| phoenicopterus-roseus | Phoenicopterus roseus | SPECIES | birds | C | 373 | 0 |
| chlamydotis-macqueenii | Chlamydotis macqueenii | SPECIES | birds | C | 433 | 0 |
| numenius-tenuirostris | Numenius tenuirostris | SPECIES | birds | C | 447 | 0 |
| larus-ichtyaetus | Ichthyaetus ichthyaetus | SPECIES | birds | C | 451 | 0 |
| dendrocopos-major | Dendrocopos major | SPECIES | birds | C | 469 | 0 |
| hemiechinus-hypomelas | Paraechinus hypomelas | SPECIES | mammals | C | 483 | 0 |
| allactaga-severtzovi | Allactaga severtzovi | SPECIES | mammals | C | 527 | 0 |
| anemone-obtusiloba | Anemonastrum obtusilobum | SPECIES | plants | C | 111 | 0 |
| berberis-kaschgarica | Berberis ulicina | SPECIES | plants | C | 115 | 0 |
| primula-macrocalyx | Primula veris subsp. macrocalyx | SUBSPECIES | plants | C | 181 | 0 |
| sonjagaster-coronatus | Thecagaster coronata | SPECIES | arthropods | C | 251 | 0 |
| capoetobrama-kuschakewitschi-orientalis | Capoetobrama kuschakewitschi | SPECIES | fish | C | 303 | 0 |
| schizothorax-issykkuli | Schizothorax pseudoaksaiensis | SPECIES | fish | C | 309 | 0 |
| diptychus-dybowskii-lansdelli | Gymnodiptychus dybowskii | SPECIES | fish | C | 311 | 0 |
| eryx-tataricus | Eryx miliaris | SPECIES | reptiles | C | 341 | 0 |
| terpsiphone-paradisi | Terpsiphone paradisi leucogaster | SUBSPECIES | birds | C | 471 | 0 |
| otonycteris-hemprichi | Otonycteris leucophaea | SPECIES | mammals | C | 493 | 0 |
| cervus-elaphus-asiaticus | Cervus canadensis | SPECIES | mammals | B | 513 | 8 |
| allactaga-saltator | Orientallactaga sibirica | SPECIES | mammals | C | 525 | 0 |
| sorbaria-olgae | Sorbaria tomentosa | SPECIES | plants | C | 127 | 0 |
| dorema-microcarpum | Ferula namanganica | SPECIES | plants | C | 175 | 0 |
| tianschaniella-umbellifera | Tianschaniella umbellulifera | SPECIES | plants | C | 201 | 0 |
| parnassius-loxias-tashkorensis | Parnassius loxias loxias | SUBSPECIES | arthropods | C | 267 | 0 |
| parnassius-apollo-merzbacheri | Parnassius apollo merzbacheri | SUBSPECIES | arthropods | C | 269 | 0 |
| cuon-alpinus | Cuon alpinus | SPECIES | mammals | C | 497 | 0 |

## Воспроизводимость и целостность

Пакет: `data/research/population-184-evidence-audit.json`; supporting files: `data/research/population-184/`. Научные документы и растровые проверки PDF остаются в `.generated/population-184/`; они не добавляются в публичные ресурсы. Точные URL, размеры и SHA-256 загруженных документов сохранены в `download-log.json`. Новый `data/.gitattributes` закрепляет LF только для итогового JSON аудита; атрибуты внутри supporting-пакета закрепляют его собственные файлы. Прежние gitattributes не изменены.

Команды повторной локальной проверки (корень проекта; Python с pypdfium2 и openpyxl):

```powershell
python data/research/population-184/scan.py
python data/research/population-184/evidence.py
python data/research/population-184/assemble.py
python data/research/population-184/validate.py
```

Сканер использует SHA-ключи и checkpoint/resume по каждому ID. Повторная сборка JSON дала идентичный SHA-256. Автоматических сетевых повторов нет. На новой машине сначала потребуются документы по сохранённым URL с проверкой SHA и копия исходного репозитория с теми же байтами checkout; живой поисковый индекс не обещан побайтово воспроизводимым. Сохранённые receipts фиксируют фактически выполненные запросы.

После npm-проверок побайтово совпали **1194 ранее отслеживаемых файла**, в том числе **765 файлов** под `data/`, `public/`, `assets/`, `src/`. Исходные 184 объекта, архив из 2 записей, изображения, лицензии, научные статусы, переводы и география не изменены. Сохранено 208 региональных связей для 118 видов, 161 запись с изображениями и 23 placeholder. Все публичные population.reviewStatus остаются pending.

- `data/species.source.json`: `22cab3d3dbad13cb44343646081fbcf9880d9fe244956e694314e808e1593935`.
- `public/data/species.json`: `8c87e8254851ad70ecafd256f6f8138a65d8181660b03abe20121233655ea532`.
- SHA-256 полного protected manifest: `c46d80dbd8404b9f442ef579ab226c105e7583328d3334fec279dab4650f186b`.
- SHA-256 итогового исследовательского JSON: `f6b3dd70922761a38d53e159d81b7a13d185eed8e01ea0980dba1a0358b83e9f`.

## Проверки

Проверки выполнены последовательно:

| Команда | Результат |
|---|---|
| `npm test -- --test-concurrency=1` | **372/372 PASS**, 0 skipped / todo / failed; 69.1 s |
| `npm run data` | PASS: каталог 184, архив 2, викторина 18, области 7, региональных свидетельств 208 |
| `npm run data:validate` | PASS: 631 ключ × 4 языка; данные соответствуют исходникам |
| `npm run build` | PASS: production build, 105 модулей; postbuild PASS |
| Исследовательский `validate.py` | PASS: 184 ID, ранги, источники, 91 утверждение, A/B/C; 4 отрицательных пробы |

Отрицательные пробы в памяти отвергают фиктивное одобрение, точку одновременно с диапазоном, подмену источника и научного имени. Повторная проверка не пишет в каталог. Браузерные сценарии задачи №28.1 не перезапускались: UI/визуализация в этой задаче не изменены. Никаких вымышленных публичных fixture не добавлялось.

Свободно на C: около 9.35 GB в начале и **9,251,631,104 байта** после тестов и сборки; ENOSPC не возникала. Исследовательские материалы и история Git не удалялись.

На момент подготовки отчёта HEAD равен исходному `218f849c732cc411a8a1b0d40d5506b379b617e0`; изменения Git ограничены новыми исследовательскими файлами и этим отчётом. Хеш создаваемого коммита проверяется после фиксации командой `git log -1 --format=%H -- docs/research/population-184-evidence-audit.md` и сообщается владельцу вместе с итоговым `git status`. Самореферентный хеш внутрь собственного коммита не записывается. Merge, push, deployment, approve/apply и импорт не выполнялись.
