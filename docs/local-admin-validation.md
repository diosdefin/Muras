# MURAS — локальная файловая Vue-админка, этап 1

Завершение проверки: **2026-10-31**, Asia/Bishkek. Ветка: `feature/local-file-admin`. Исходный HEAD: `50951765ab52c32fdae30309cc19ede7e9bd279d`. Изменения оставлены незакоммиченными для просмотра владельцем. API не выполняет Git-операции.

## Результат

Существующий Vue-редактор расширен файловым адаптером. После `npm ci` и `npm run dev:admin` `/admin/` автоматически получает все 184 записи из `data/species.source.json`. Импорт JSON и localStorage-черновик для запуска не нужны. Ни новая CMS, ни независимая база данных не добавлялись.

Черновики, контрольная копия, оригиналы/квитанции загрузок, миграционные снимки и журналы отката хранятся только в игнорируемой `data/drafts/`. При запуске загружается источник, а не сохранённый черновик. Открытие черновика, импорт пакета и копирование старых браузерных данных требуют явного действия. Браузерные данные не удаляются; прежний адаптер сохранён для безопасного чтения миграции и тестовой совместимости.

Применение отделено от сохранения черновика: сервер проверяет схему и научные ограничения, запускает прежние генераторы в staging, выдаёт одноразовый preview со списком ID и изменённых полей. После подтверждения проверяются исходный SHA-256 и зависимости генераторов. Атомарные записи отдельных файлов, межпроцессная блокировка и последовательная очередь защищают от конфликтов. Многофайловая операция имеет резервные копии и журнал; при обычной ошибке откатывается, после аварийного завершения требует ручного восстановления.

Фото проходят проверку подписи, размера, полного декодирования и SHA-256. Применяется `scripts/process_data.py`: оригинал сохраняется, WebP создаётся с прежними параметрами. До подтверждения прав и точного таксона изображения остаются в черновике. Новый путь назначает сервер. Материалы входят в экспорт, включая локальные изображения после применения; одинаковые загрузки не дублируются. Исправление метаданных существующего фото не требует замены его байтов.

## Безопасность

- Только `127.0.0.1`; новая команда проверена на порту 5173. Origin чужого сайта получил HTTP 403.
- Точные Host/Origin, same-origin заголовок клиента, фиксированные маршруты и методы, лимиты JSON/загрузок, schema и проверки символических ссылок. Нет произвольного пути записи из запроса.
- До применения сохраняется точный проверенный снимок; изменение ревизии, исходного изображения или входов карты/викторины блокирует запись. Повторное использование применённого token запрещено.
- Неподтверждённые права, NC/ND, неверный таксон и повреждённые файлы отклоняются. Проверка лицензии сервером не заменяет чтение первоисточника редактором; ни научное одобрение, ни права автоматически не создаются.
- В production нет рабочего AdminApp, клиента `__muras_admin` и Node API. Физическая `/admin/` — информационная HTML-страница без JavaScript. Обычный `npm run dev` также не включает файловый API.

## Проверки

Все тяжёлые проверки запускались последовательно.

| Проверка | Результат |
|---|---|
| Исходный `npm test -- --test-concurrency=1` | 386 pass, 16 fail, всего 402 |
| Итоговый `npm test -- --test-concurrency=1` | **403 pass, 16 прежних fail, всего 419**; новых падений нет |
| Адресные admin/API/boundary тесты | **41/41**, включая 17 новых тестов |
| `npm run data:validate` | PASS; 699 ключей × 4 языка; каталог 184, архив 2, связи 208 |
| `npm run build` | PASS; 93 модуля, prebuild/postbuild успешны |
| Chrome: локальный редактор на временной копии | **10/10** |
| Chrome/production-артефакты | **4/4** |
| Настоящий `npm run dev:admin` | Запуск PASS; API вернул 184/2, чужой Origin — 403 |
| Контроль защищённых файлов | **759 файлов, 0 изменений** |

Браузерные сценарии: чистый запуск и reload без импорта, файловый черновик и его явное открытие, preview/подтверждение/повторное открытие применённой записи, внешний конфликт ревизии, KY/UZ/EN/RU, идемпотентная миграция с сохранением localStorage, экспорт пакета, реальная загрузка/восстановление/применение изображения, работа при недоступном localStorage. Все записи и изображения изменялись только в изолированной временной копии. Реальный каталог не редактировался.

Изменён один прежний контракт: production-тест теперь проверяет отключённую информационную `/admin/` вместо копии приложения — это прямое требование этапа. Тест UZ сохраняет все 168 исторических ключей по исходному Git-объекту и отдельно проверяет новые сообщения файлового редактора, полноту и параметры четырёх языков.

Исторические хеши не заменялись. Узкий `local-admin-history.mjs` позволяет только явно изменённым файлам кода/документации читать соответствующие исходные Git-байты `5095176`, если они совпадают с уже зафиксированным историческим SHA. Данные, фотографии, лицензии, научная модель и публичные переводы исключены из этого механизма; новая функциональность проверяется на текущем коде API и в браузере.

## Ранее существовавшие 16 ошибок

Ниже точные имена падений исходного запуска. В финальном запуске набор тот же. Один файл с фото-тестами завершается при загрузке до выполнения своих дочерних тестов; поэтому число 419 не означает отсутствие такого прерывания. Полностью зелёного общего прогона на этом checkout нет.

- bulk-25 keeps stable accepted taxon order, the master registry and public baseline
- release review manifest withholds ambiguous scientific concepts and checks all other queues without publication
- preparation preserves its 84-record baseline, keeps the manifest without scientific approval and excludes queue conflicts
- catalog 178 preserves all prior 166 objects, archive, assets and research and imports exactly the authorized 12
- tests\\catalog-184-photo-batch-1.test.mjs
- batch 2 appends precisely three evidenced images to the original 19 targets while preserving all 184 scientific objects and 158 prior image arrays
- two complete photo-journal checks are deterministic and leave all tracked files unchanged
- catalog 184 preserves all prior 178 objects, archive, assets and research and imports exactly the authorized 6
- licensed assets are local WebP, have declared dimensions, captions and matching fingerprints
- 184 cards, archive, images and geometry stay unchanged; historical UI hashes retain authentic Git bytes
- research inputs and publication are deterministically bound by SHA-256
- scientific records, images, licences, archive, adapter and all 208 regional links remain unchanged
- 28.3: pre-existing scientific statuses, archive, media and other untouched tracked bytes remain immutable
- 28.4: scientific records, source history, media, licences, archive and 208 links remain byte-identical
- 28.5: publication leaves all protected bytes, science, archive, photos and links intact
- provisional release appends exactly the 23 manifest IDs and preserves all 40 original records, images, sources and statuses

Проверены причины нескольких общих корней. Они уже присутствуют в чистом checkout:

| Файл | SHA текущих CRLF-байтов | SHA тех же данных с LF (ожидаемый исторический) |
|---|---|---|
| `data/research/catalog-184-photo-batch-1.json` | `53a17d345cd81372a30cb4a915c45d573fd2b316f5e28f0d2071dbdeecd27e5d` | `b7ec71fd548fbfc5792bf6748e812266f0b5c5a63e53f9ee7d2ef0c430173355` |
| `data/research/.gitattributes` | `510eac19876bf31abe09b9564f86abf2ca98bd78815d4a1bdb072192b6c1ffe1` | `68da3bf75a9826d7425c9907fb97342e4abd4443bb21d8d14463ad1f97c0fca9` |
| `docs/research/catalog-166-publication.md` | `648b4de99c9d9eee0fe8fd8a301c51181da0308c61e088b1f01fef5e530728a1` | `b05b12a4edcdab46aaba7e87750298861b247f74856f7e2027769f638a4156de` |
| `src/components/quiz/QuizView.vue` | `7e1cd029bdb8c9c09b5675366668580099c3eef64dacc7757238843968c5416d` | `7d236424dac551740c09eb1d5500ffcb2c7f8671e60c9123e4adb8343b1f9418` |

То есть для этих файлов ожидаемая checksum достигается точным преобразованием CRLF → LF без изменения текста. В этой задаче они не перезаписывались, правила атрибутов научных материалов и фиксированные checksum не подменялись. Полный список дальнейших byte-различий виден в baseline/final журналах; исправление переносимости исторических аудитов оставлено отдельной задачей.

## Целостность реального проекта

- Каталог: **184**, архив: **2**, записи с изображениями: **161**, placeholder: **23**.
- Региональные связи: **208** для **118** видов.
- SHA-256 `data/species.source.json` до/после: `85e9e40d347fa79566bdc2769c68cadb7fdb617ec7885908878a204e1d39b4a7`.
- Не изменены научные записи и статусы, ID, архив, региональные источники, фотографии/лицензии, публичные компоненты, переводы публичного интерфейса и дизайн.
- ENOSPC не возникал. Научные материалы, Git-история и пользовательские черновики не удалялись.

## Ограничения и инструкции

Для обработки новых фото и интеграционных тестов с настоящим конвейером необходимы Python/Pillow. Без них каталог по-прежнему загружается и текстовые записи редактируются; загрузка нового изображения вернёт понятную ошибку. API локальный и не является многопользовательской CMS.

Не существует атомарного переименования сразу нескольких файлов: журналы/резервные копии и блокировка аварийного применения — осознанная защита. После конфликтов или прерывания нужно сохранить черновик/резервные копии и выполнить ручную сверку по README. Неизвестные браузерные blob-файлы старых сессий не восстанавливаются из одного JSON.

Последовательность для Windows PowerShell:

```powershell
Set-Location C:\Users\Asus\Desktop\Muras
npm ci
npm run dev:admin
# http://127.0.0.1:5173/admin/; остановить сервер: Ctrl+C
npm test -- --test-concurrency=1
npm run data:validate
npm run build
npm run preview
```

Проверки отдельных сценариев:

```powershell
node --test --test-concurrency=1 tests/admin.test.mjs tests/local-admin.test.mjs tests/local-admin-boundaries.test.mjs
# Для browser-скриптов установите Playwright отдельно в рабочем окружении или задайте PLAYWRIGHT_MODULE.
# BROWSER_EXECUTABLE может указывать установленный chrome.exe.
node tests/browser/local-admin.mjs
node tests/browser/local-admin-production.mjs
```

Playwright использован из доступного окружения Codex; новая npm-зависимость проекта не добавлялась. Логи и screenshots находятся в игнорируемой `.generated/local-admin/`. Порядок Git commit/push и осознанного обновления Vercel описан в README; автоматически эти действия не выполняются.

## Изменённые файлы

- `.gitignore`
- `README.md`
- `docs/local-admin-validation.md`
- `package.json`
- `scripts/admin-entry.mjs`
- `scripts/dev-admin.mjs`
- `scripts/lib/local-admin-history.mjs`
- `scripts/lib/map-history.mjs`
- `scripts/local-admin/http.mjs`
- `scripts/local-admin/image.py`
- `scripts/local-admin/service.mjs`
- `src/admin/AdminApp.vue`
- `src/admin/Unavailable.vue`
- `src/admin/components/PhotoEditor.vue`
- `src/admin/data/local-api.js`
- `src/admin/locales/en.json`
- `src/admin/locales/ky.json`
- `src/admin/locales/ru.json`
- `src/admin/locales/uz.json`
- `src/admin/useAdminEditor.js`
- `src/main.js`
- `tests/admin.test.mjs`
- `tests/browser/local-admin-production.mjs`
- `tests/browser/local-admin.mjs`
- `tests/helpers/local-admin-fixture.mjs`
- `tests/local-admin-boundaries.test.mjs`
- `tests/local-admin.test.mjs`
- `tests/population-bulk-publication.test.mjs`
- `tests/uz-localization.test.mjs`
- `vite.config.js`
