# MURAS №25.10 — финальная проверка пакета 184

Дата: **2026-10-28**, Asia/Bishkek. Ветка: **feature/catalog-200**. Проверенный исходный и текущий HEAD до коммита этого отчёта: **89b431671c66104b66d9e050e653432582f7fb34**. Исходный Git status: **clean**. Каталог **178**, архив **2**.

**Итог: BLOCKED_RESOURCES — окончательная готовность к публикации не подтверждена.** Сам пакет проходит повторные технические проверки: ровно 6 допустимых кандидатов, совпавшие fingerprints, два одинаковых read-only dry-run с прогнозом **178 → 184**, **0 ошибок и дубликатов**. Тяжёлые финальные проверки остановлены до запуска по прямому условию задания о недостатке места; файлы не удалялись.

## Пакет и контрольные суммы

| Объект | Фактическое значение |
|---|---|
| Registry | `data/research/catalog-187-content-registry.json` |
| Manifest | `data/research/catalog-187-review-manifest.json` |
| SHA-256 manifest | **ea602571d211f948738d5016c70fd235f01d211b144e324687764a99906922f7** |
| registryFingerprint | **e464a27088b435607d373d58154fff1fcb385ad55ba3d294765c17384c4800e6** |
| SHA-256 registry | **30a22dc3960bba6996af6529127f19dd9bf58663166528fb2bc18570378bb73d** |
| Источник содержания и решений | `docs/research/catalog-187-preparation.md`; `data/research/catalog-200-final-taxonomy-review.json` |

Оба заданных контрольных значения совпали. Registry, manifest, drafts и их fingerprints не изменены. Никакого нового таксона или повторной полной инвентаризации не создавалось.

## Точная допустимая шестёрка

| ID | Принятое имя | Ранг / GBIF | Исторический очерк 2006 | Изображение |
|---|---|---|---|---|
| `sorbaria-olgae` | Sorbaria tomentosa | SPECIES / gbif:3012117 | с.126–127 | placeholder |
| `dorema-microcarpum` | Ferula namanganica | SPECIES / gbif:295893852 | с.174–175 | placeholder |
| `tianschaniella-umbellifera` | Tianschaniella umbellulifera | SPECIES / gbif:10874182 | с.200–201 | placeholder |
| `parnassius-loxias-tashkorensis` | Parnassius loxias loxias | SUBSPECIES / gbif:307395113 | с.266–267 | placeholder |
| `parnassius-apollo-merzbacheri` | Parnassius apollo merzbacheri | SUBSPECIES / gbif:177946994 | с.268–269 | placeholder |
| `cuon-alpinus` | Cuon alpinus | SPECIES / gbif:2434317 | с.496–497 | фотография |

**Среди этих шести: 1 фотография, 5 placeholder.** Суммарные числа по девяти черновикам не использованы для оценки допустимой партии.

Проверены национальные именные очерки, выбранные в №25.8 концепты, научные имена, ранги и реальные идентификаторы сохранённых первоисточников. Точные записи Catalogue of Life / ENA, представленные в GBIF, не объявлены backbone-ключами и не заменены родительскими `nubKey` или `parentKey`. Поддержка таких точных принятых записей уже существует в валидаторе; никаких его изменений не потребовалось.

Пересечения ID, принятых имён и таксономических ссылок с существующим каталогом и архивом штатным pipeline не обнаружены. Пара вида/подвида также проверяется штатным импортёром. Воспроизведение пакета `prepare-catalog-187 --verify` и офлайн-аудит `validate-catalog-187-preparation` прошли; все material SHA-256, draftSha256 и checkedFingerprint актуальны. Источники и их sourceIds сохранены.

У каждого из шести заполнены названия и краткие описания KY/UZ/RU/EN; русский обзор и поддерживаемые источниками разделы сохранены. Латинские fallback-названия не выдаются за народные. verified:false, lastReviewedAt:null, scientificReviewStatus:pending, population:unknown. В существующей модели pending находится в исследовательском registry/manifest и population.reviewStatus; несуществующее корневое поле публичного объекта и фиктивная publication не добавлялись. Исторические национальные категории имеют год 2006, IUCN остаётся отдельно и не подменяет национальную оценку.

У Cuon alpinus генетическая проба 2019 года и публикация 2022 года не означают подтверждённую современную постоянную популяцию Кыргызстана. У Sorbaria историческая охрана формы olgae не распространена автоматически на мировой ареал tomentosa. Ранги обоих Parnassius сохранены подвидовыми.

Фотография Cuon: Hans Hillewaert, [конкретный файл Commons](https://commons.wikimedia.org/wiki/File:Cuon_alpinus_(Dhole).jpg), **CC BY-SA 3.0**, 1350×1800. WebP SHA-256 **e52d745554b52850ff6f4f3e70ae24f430c390ab920e610e6a89ffb000f25b47** совпал. Контейнер, размеры и отсутствие EXIF/XMP проверены, полное декодирование PIL прошло. Авторство, лицензия, атрибуция, модификации и подпись о зарубежном животном в неволе сохранены. Фотография не представлена национальным свидетельством.

## Три исключённых из возможной публикации черновика

| ID | Текущее состояние | Причина |
|---|---|---|
| `papilio-alexanor-voldemar` | needs_evidence; taxonomyEvidence:null | Нет точного принятого подвидового ключа: найденный синоним ведёт к видовому alexanor. |
| `megalodontes-kuznetzovi` | needs_evidence; taxonomyEvidence:null | Не установлен точный принятый GBIF вида; профильная научная ссылка не превращена в числовой ключ. |
| `polochrum-pamirepandum` | needs_evidence; taxonomyEvidence:null | Нет точного принятого GBIF вида; repandum и родовой ключ не подставляются. |

Все три отсутствуют в candidateIds допустимого manifest и в опубликованных 178. Их научное READY №25.8 не подменяет технический допуск. Состояния старого и текущего registry не изменены.

## Два независимых read-only dry-run

Выполнены последовательно, в отдельных процессах, существующим импортёром без `--apply`:

```powershell
npm run data:bulk:check -- --registry data/research/catalog-187-content-registry.json --report .generated/catalog-184-readiness/bulk-check.json
npm run data:batch:import -- --input .generated/catalog-184-readiness/preview.json --report .generated/catalog-184-readiness/dry-run-1.json
npm run data:batch:import -- --input .generated/catalog-184-readiness/preview.json --report .generated/catalog-184-readiness/dry-run-2.json
```

Preview-пакет сформирован только из шести candidateIds неизменённого manifest и соответствующих draftFile / taxonomyEvidence registry. Подготовка такого локального read-only входа не создаёт owner authorization.

| Показатель | Dry-run 1 | Dry-run 2 |
|---|---|---|
| Исходный каталог | 178 | 178 |
| Добавления | 6 | 6 |
| Потенциальный итог | 184 | 184 |
| Ошибки | 0 | 0 |
| Дубликаты | 0 | 0 |
| rejected / unchanged | 0 / 0 | 0 / 0 |
| applied | false | false |

Отчёты совпали целиком. Пять предупреждений относятся только к допустимым placeholder, не к ошибкам данных. Branch guard проверен непосредственно: feature/catalog-200 разрешена, main запрещена. Защищённый provisional-командный путь не запускался, поскольку в этой задаче нет разрешения владельца на публикацию.

## Свободное место и ENOSPC

При начальной проверке C: свободно **206733312 байт (197.16 MiB)**. Во время подробного сканирования: **204558336 байт (195.08 MiB)**. Перед сохранением отчёта: **202637312 байт (193.25 MiB)**. Значения изменяются из-за работы ОС и других процессов.

Проведён только read-only подсчёт размеров; symlink/junction не обходились, ошибок чтения не было. Остатков временных каталогов тестов с префиксами muras-/redbook- в системном Temp не обнаружено. Значит, утверждать, что место занято забытыми fixture текущих тестов, оснований нет.

| Проверенное расположение | Занято, байт | MiB | Решение |
|---|---|---|---|
| `.generated` целиком | 647233008 | 617.25 | не удалялось; содержит научные источники, исходники изображений и другие материалы |
| `.generated/bulk-originals` | 156976377 | 149.70 | воспроизводимость полного содержимого не доказана, не трогать |
| `.generated/hero-motion-video` | 78677960 | 75.03 | воспроизводимость полного содержимого не доказана, не трогать |
| `.generated/snow-leopard-2-video` | 64430213 | 61.45 | воспроизводимость полного содержимого не доказана, не трогать |
| `.generated/research` | 60397184 | 57.60 | воспроизводимость полного содержимого не доказана, не трогать |
| `.generated/catalog-125-originals` | 48854858 | 46.59 | воспроизводимость полного содержимого не доказана, не трогать |
| `%TEMP%` целиком | 278269177 | 265.38 | не удалялось |
| `%TEMP%/vscode-stable-user-x64` | 248800963 | 237.28 | активность/возможность штатной очистки отдельно не установлена; не удалялось |
| `%TEMP%/node-compile-cache` | 7353664 | 7.01 | активность/возможность штатной очистки отдельно не установлена; не удалялось |

Причина остановки установлена по коду `tests/helpers/historical-pipeline.mjs`: каждый historical fixture копирует data, assets, docs/evidence и public/licenses. Их фактический суммарный размер **94998350 байт (90.60 MiB)**. Три файла тестов используют этот helper: catalog-84-publication, catalog-100-publication и provisional-catalog. Три одновременно существующие копии требуют **284995050 байт (271.79 MiB)** только для исходных файлов. Это уже больше свободного места, без сгенерированных фотографий/каталога, других fixture, накладных расходов NTFS и резерва ОС.

Текущий `npm test` запускает `node --test tests/*.test.mjs` с параллельной обработкой файлов. В №25.9 при таком же уровне свободного места уже наблюдался ENOSPC. По прямому условию №25.10 небезопасный повтор не запускался, цепочка тяжёлых проверок остановлена. ENOSPC в этом задании заново не вызывался; достаточность ресурсов пока не восстановлена. Предыдущие 326/326 в последовательном режиме — исторический результат №25.9, не новые тесты №25.10.

### Безопасный план продолжения

1. Сохранить весь исследовательский материал, .generated, архивы, изображения/лицензии, Git и незакоммиченные файлы. Автоматического удаления нет.
2. Владелец может освободить место штатными средствами Windows за пределами защищённых материалов. Для `%TEMP%/vscode-stable-user-x64` сначала необходимо установить принадлежность и завершение установки; наличие имени каталога само по себе не является разрешением удалить его. Полная воспроизводимость содержимого не подтверждена.
3. Консервативный рабочий ориентир — обеспечить не менее **2 GiB свободного места** на томе Temp и проекта. Это рекомендуемый запас, не заявленная точная пиковая потребность тестов. Альтернатива — отдельно согласованный запуск с Temp на реально проверенном свободном томе.
4. После восстановления ресурсов повторить исходный HEAD/clean-status, manifest SHA-256, registryFingerprint и оба dry-run. Затем последовательно выполнить npm test, npm run data, npm run data, npm run build и итоговую проверку сохранности. Для запрета внутреннего параллелизма можно отдельно согласовать последовательный вызов Node с флагом перед путями; скрытой подмены npm test или ослабления проверок здесь нет.

## Результаты проверок №25.10

| Проверка | Фактический результат |
|---|---|
| Ветка / HEAD / начальный Git | совпали, clean |
| Manifest / registryFingerprint | совпали |
| Воспроизведение --verify и аудит пакета | прошли |
| data:bulk:check | 9 рассмотрено, 6 допустимо, 3 needs_evidence, 0 rejected |
| Два dry-run | прошли, результаты идентичны |
| Фото / лицензия / полное декодирование | прошли |
| npm test | **не запускался: остановка на resource gate** |
| npm run data, первый и второй | **не запускались после остановки** |
| npm run build | **не запускался после остановки** |
| Исходный каталог / архив | 178 / 2, без изменений |

Все **1120 исходных tracked-файлов** побайтно совпали с начальным снимком. Включены все 178 объектов, архив, фотографии, лицензии, registry, manifest, fingerprints и исходный код. SHA-256 source остаётся **088f8f2fc78462a1721e293974b1054dc7a80b215f25bd111be3565318948f60**. Для коммита создаётся только этот отчёт; проверочных изменений кода не потребовалось.

## Будущие команды защищённого импорта — не выполнялись

Применимы только **после снятия resource-блокировки, прохождения всех финальных проверок и получения отдельного настоящего разрешения владельца**, относящегося к указанным SHA-256, registryFingerprint и ровно шести candidateIds. Задание №25.10 такого разрешения не даёт. Ниже — воспроизводимые CLI-команды для последующей разрешённой задачи, а не запись решения владельца.

```powershell
$ownerDecisionId = Read-Host 'ID из отдельного реального решения владельца'
$ownerReason = Read-Host 'Точный текст разрешения владельца с SHA-256 manifest и registryFingerprint'
$decisionDate = Get-Date -Format 'yyyy-MM-dd'
$manifestSha = 'ea602571d211f948738d5016c70fd235f01d211b144e324687764a99906922f7'
$registryFp = 'e464a27088b435607d373d58154fff1fcb385ad55ba3d294765c17384c4800e6'
if ([string]::IsNullOrWhiteSpace($ownerDecisionId) -or [string]::IsNullOrWhiteSpace($ownerReason) -or -not $ownerReason.Contains($manifestSha) -or -not $ownerReason.Contains($registryFp)) {
  throw 'Нужно отдельное настоящее решение владельца для точного неизменённого пакета'
}
npm run data:bulk:provisional -- --registry data/research/catalog-187-content-registry.json --manifest data/research/catalog-187-review-manifest.json --mode dry-run --owner-role project_owner --decision-id $ownerDecisionId --date $decisionDate --reason $ownerReason
if ($LASTEXITCODE -ne 0) { throw "Защищённый dry-run не прошёл" }
# Следующая команда — только в отдельно разрешённой задаче после успешного dry-run 178 -> 184.
npm run data:bulk:provisional -- --registry data/research/catalog-187-content-registry.json --manifest data/research/catalog-187-review-manifest.json --mode apply --owner-role project_owner --decision-id $ownerDecisionId --date $decisionDate --reason $ownerReason
```

Дата решения — фактическая местная дата последующей разрешённой операции; reason берётся из реального отдельного разрешения, не сочиняется этим отчётом. Нет вымышленных авторизаций, научных рецензентов или scientific approval. После будущего импорта остаются verified:false, pending, lastReviewedAt:null и неподтверждённая population:unknown.

## Git и завершение

HEAD до фиксации отчёта: **89b431671c66104b66d9e050e653432582f7fb34**. До создания отчёта Git был чистым. После него единственное изменение — `docs/research/catalog-184-release-readiness.md`; оно сохраняется отдельным коммитом. Фактический итоговый HEAD и Git status сообщаются после коммита в ответе владельцу.

Выполнение прекращено на установленном пользователем resource gate. Provisional import, approve, apply, merge, push и deployment не выполнялись; следующая партия не начиналась.
