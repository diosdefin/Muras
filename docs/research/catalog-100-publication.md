# MURAS — задача 22.8: предварительный импорт до 100 записей

2026-10-15 выполнен один предварительный импорт **16 записей**, каталог **84 → 100**. Добавлены 12 растений, 2 членистоногих, 1 рыба и 1 гриб. Новых опубликованных фотографий **2**, новых placeholder **14**.

Ветка `feature/bulk-import-next`, начальный HEAD `3e645572daf6dd22aaa36568aa327dc098813b4a`; перед началом Git был чистым. SHA-256 разрешённого manifest и fingerprints всех 16 кандидатов совпали. Dry-run перед импортом: processed16, added16, rejected0; состав полностью соответствует manifest.

- Manifest: `data/research/catalog-100-review-manifest.json`.
- SHA-256: `592f264f91bb1628d7ff6e84925395dfd6894517348fc6df07eb16870b9ac74b`.
- Fingerprint реестра: `199bf605537d623a9de0f975a42483ef4b3e4b0b0fafabc122e41da0f4252c32`.
- Журнал: `data/research/publication-decisions/muras-22-7-owner-provisional.json`.

Разрешение владельца на конкретный manifest зарегистрировано отдельно от научной экспертизы: дата 2026-10-15, роль project_owner. Журнал содержит для каждого ID fingerprint, SHA черновика и основание: «Отдельное разрешение владельца на manifest SHA-256 592f264f91bb1628d7ff6e84925395dfd6894517348fc6df07eb16870b9ac74b; научная экспертиза не выполнена.»

У всех 16 publication.status:provisional, scientificReviewStatus:pending, independentReviewer:null, verified:false, lastReviewedAt:null, population.type:unknown, population.reviewStatus:pending. Каждый научный объект полностью совпадает с разрешённым черновиком; добавлены только поля публикационного решения. Неизвестные факты и исторические национальные категории сохранены. Независимое научное одобрение не создавалось.

Добавленные ID:

- dictyocephalus-attenuatus
- prionus-tschitscherini
- rossomyrmex-proformicarum
- barbus-brachycephalus
- allochrusa-gypsophiloides
- corydalis-pseudoadunca
- fumariola-turkestanica
- rhodiola-litwinowii
- sibiraea-tianschanica
- crataegus-knorringiana
- ammopiptanthus-nanus
- colutea-brachyptera
- primula-eugeniae
- physochlaina-alaica
- incarvillea-olgae
- saussurea-involucrata

## Сохранность

Прежние 84 исходных и публичных объекта полностью совпадают со снимками `data/backups/catalog-100/`. Архив неизменён. Все 318 контрольных SHA подготовки проверены: два агрегатных файла сопоставлены с резервными копиями, остальные — с текущими оригиналами. Старые фотографии, источники, таксономические материалы, модель, интерфейс, карта и викторина не менялись. Manifest, исследовательский реестр и частные черновики не изменялись. `tulipa-anadroma` и `eryx-tataricus` не добавлены.

Две разрешённые фотографии скопированы существующим генератором в `public/images/approved`; SHA совпадают с проверенными WebP. Лицензии CC BY-SA 3.0 (Fizzy+lifting, гриб) и CC BY-SA 4.0 (Agnieszka Kwiecień, Nova, инкарвиллея), авторство и подписи сохранены. Изображения не выдаются за кыргызстанские полевые наблюдения.

## Проверки

- `npm test`: **297/297**, failed0, skipped0; прежние 294 проверки также прошли. Для временных файлов использована изолированная папка D:, команда тестов не менялась.
- `npm run data` дважды: каталог100, архив2, викторина18, области7, региональные свидетельства2. Файлы public/data после двух запусков побайтово одинаковы.
- `npm run build`: успешно, 102 модуля; проверка локалей и postbuild прошли.
- Поиск KY/UZ/RU/EN и идентичность маршрутов проверены для всех 100 записей. Проверены фильтры и пагинация **24/24/24/24/4** без повторов и потерь.
- Vue SSR всех 16 новых карточек, модальных окон и страниц проверен на четырёх языках: фотографии/placeholder и существующая отметка необходимости редакторской проверки.
- Локальный production-preview: 100 прямых SPA-маршрутов вернули HTTP200 и оболочку приложения; все 43 опубликованных изображения вернули HTTP200 и совпадающие SHA, placeholder также HTTP200. Содержимое видовых компонентов проверено отдельно SSR; ручной браузерный обход не заявляется. Локальный сервер закрыт.
- Повторный запуск существующего provisional-конвейера только в dry-run: **added0, unchanged16, rejected0**. Исходный файл после проверки неизменён. Научных approved_for_import:0.

Регрессионные тесты прошлых этапов используют их неизменяемые снимки; новые проверки подтверждают фактический каталог100 и сохранность всех прежних84. Публикационные барьеры и научные проверки не отключались.

Доказательства: `docs/evidence/catalog-100-publication-validation.json`, `catalog-100-import-repeat.json`, `catalog-100-http-validation.json`. Научные оговорки подготовки сохранены в `docs/research/catalog-100-preparation.md`.

Merge, push и deployment не выполнялись. Работа завершена после импорта и проверки этого пакета.
