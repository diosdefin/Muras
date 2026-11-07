# Аудит переводов KY / RU / UZ / EN

Дата последней партии: 07.11.2026. Каталог 184, архив 2. Партии 001 и 002 отправлены в origin/feature/local-file-admin; партия 003 подготовлена на основе `aefd128`.

## Методика

Считается фактический текст каждого применимого поля, без fallback. null-раздел не считается недостающим научным фактом. Латинское научное имя вместо народного не засчитывается переводом. Полное совпадение с RU и подозрительный алфавит требуют просмотра (не автоматический приговор ошибочности). Для KY название страны Кыргызстан совпадает с RU закономерно. Числа не означают независимую лингвистическую проверку.

## Матрица до → после

В ячейке: присутствующие / применимые значения. Сомнительные копии и латинские fallback не входят в числитель. Архив включён.

| Поле | KY | RU | UZ | EN |
|---|---:|---:|---:|---:|
| names | 74/186 → 74/186 | 184/186 → 184/186 | 0/186 → 0/186 | 153/186 → 153/186 |
| content.shortDescription | 184/184 → 184/184 | 184/184 → 184/184 | 184/184 → 184/184 | 184/184 → 184/184 |
| content.overview | 0/184 → 20/184 | 184/184 → 184/184 | 0/184 → 20/184 | 0/184 → 20/184 |
| content.appearance | 0/127 → 17/127 | 127/127 → 127/127 | 0/127 → 17/127 | 0/127 → 17/127 |
| content.ecology | 0/176 → 20/176 | 176/176 → 176/176 | 0/176 → 20/176 | 0/176 → 20/176 |
| content.diet | 0/87 → 14/87 | 87/87 → 87/87 | 0/87 → 14/87 | 0/87 → 14/87 |
| content.reproduction | 0/161 → 20/161 | 161/161 → 161/161 | 0/161 → 20/161 | 0/161 → 20/161 |
| content.distribution | 0/184 → 20/184 | 184/184 → 184/184 | 0/184 → 20/184 | 0/184 → 20/184 |
| habitat.description | 1/183 → 20/183 | 183/183 → 183/183 | 0/183 → 20/183 | 1/183 → 20/183 |
| threats[].text | 2/202 → 29/202 | 202/202 → 202/202 | 0/202 → 29/202 | 2/202 → 29/202 |
| conservationMeasures[].text | 1/200 → 22/200 | 200/200 → 200/200 | 0/200 → 22/200 | 1/200 → 22/200 |
| regions[].names | 184/184 → 184/184 | 184/184 → 184/184 | 144/184 → 164/184 | 184/184 → 184/184 |
| images[].caption | 0/161 → 17/161 | 161/161 → 161/161 | 0/161 → 17/161 | 0/161 → 17/161 |

## Все записи и точка продолжения

В ячейках — фактически присутствующие/применимые блоки. Неподтверждённые народные названия остаются незаполненными. Полный машинный список каждого незавершённого поля: `.generated/localization/translation-audit.json` (воспроизводится командой ниже).

| ID | Набор | KY | RU | UZ | EN | Все 4 языка |
|---|---|---:|---:|---:|---:|---|
| irbis | catalog | 15/15 | 15/15 | 14/15 | 15/15 | нет |
| argali | catalog | 14/14 | 14/14 | 13/14 | 14/14 | нет |
| manul | catalog | 14/14 | 14/14 | 13/14 | 14/14 | нет |
| golden-eagle | catalog | 14/14 | 14/14 | 13/14 | 14/14 | нет |
| bearded-vulture | catalog | 14/14 | 14/14 | 13/14 | 14/14 | нет |
| saker-falcon | catalog | 14/14 | 14/14 | 13/14 | 14/14 | нет |
| greigs-tulip | catalog | 13/13 | 13/13 | 12/13 | 13/13 | нет |
| kaufmanns-tulip | catalog | 13/13 | 13/13 | 12/13 | 13/13 | нет |
| sievers-apple | catalog | 14/14 | 14/14 | 13/14 | 14/14 | нет |
| central-asian-tortoise | catalog | 12/12 | 12/12 | 11/12 | 12/12 | нет |
| central-asian-frog | catalog | 12/12 | 12/12 | 11/12 | 12/12 | нет |
| predatory-bush-cricket | catalog | 12/12 | 12/12 | 11/12 | 12/12 | нет |
| dog-stinkhorn | catalog | 12/12 | 12/12 | 11/12 | 12/12 | нет |
| marbled-polecat | catalog | 13/13 | 13/13 | 12/13 | 13/13 | нет |
| black-stork | catalog | 13/13 | 13/13 | 12/13 | 13/13 | нет |
| ibisbill | catalog | 3/13 | 13/13 | 1/13 | 3/13 | нет |
| eduards-fritillary | catalog | 12/12 | 12/12 | 11/12 | 12/12 | нет |
| european-glass-lizard | catalog | 13/13 | 13/13 | 12/13 | 13/13 | нет |
| dalmatian-pelican | catalog | 3/12 | 12/12 | 1/12 | 3/12 | нет |
| eurasian-lynx | catalog | 3/13 | 13/13 | 1/13 | 3/13 | нет |
| kolpakowskis-tulip | catalog | 3/12 | 12/12 | 1/12 | 3/12 | нет |
| ostrowskis-tulip | catalog | 3/12 | 12/12 | 1/12 | 3/12 | нет |
| pike-asp | catalog | 12/12 | 12/12 | 11/12 | 12/12 | нет |
| turkestan-catfish | catalog | 12/12 | 12/12 | 11/12 | 12/12 | нет |
| christophs-clouded-yellow | catalog | 3/13 | 13/13 | 1/13 | 3/13 | нет |
| relict-spider | catalog | 3/10 | 10/10 | 1/10 | 3/10 | нет |
| tien-shan-scutiger | catalog | 11/11 | 11/11 | 10/11 | 11/11 | нет |
| menzbiers-marmot | catalog | 3/11 | 11/11 | 1/11 | 3/11 | нет |
| semenovs-fir | catalog | 3/12 | 12/12 | 1/12 | 3/12 | нет |
| great-bustard | catalog | 3/12 | 12/12 | 1/12 | 3/12 | нет |
| said-alievs-toad-agama | catalog | 3/12 | 12/12 | 1/12 | 3/12 | нет |
| vigorous-ground-beetle | catalog | 3/11 | 11/11 | 1/11 | 3/11 | нет |
| pskem-onion | catalog | 3/12 | 12/12 | 1/12 | 3/12 | нет |
| kostychevs-pasque-flower | catalog | 3/11 | 11/11 | 1/11 | 3/11 | нет |
| indian-crested-porcupine | catalog | 3/12 | 12/12 | 1/12 | 3/12 | нет |
| fergana-ground-beetle | catalog | 3/11 | 11/11 | 1/11 | 3/11 | нет |
| giant-robber-fly | catalog | 3/13 | 13/13 | 1/13 | 3/13 | нет |
| korzhinskys-pear | catalog | 3/12 | 12/12 | 1/12 | 3/12 | нет |
| cinereous-vulture | catalog | 3/12 | 12/12 | 1/12 | 3/12 | нет |
| egyptian-vulture | catalog | 3/12 | 12/12 | 1/12 | 3/12 | нет |
| eminium-regelii | catalog | 2/14 | 14/14 | 2/14 | 3/14 | нет |
| eremurus-zenaidae | catalog | 2/13 | 13/13 | 2/13 | 3/13 | нет |
| eremurus-zoae | catalog | 2/13 | 13/13 | 2/13 | 3/13 | нет |
| allium-dodecadontum | catalog | 2/14 | 14/14 | 2/14 | 3/14 | нет |
| allium-semenovii | catalog | 2/13 | 13/13 | 2/13 | 3/13 | нет |
| tulipa-affinis | catalog | 2/14 | 14/14 | 2/14 | 2/14 | нет |
| tulipa-korolkowii | catalog | 2/14 | 14/14 | 2/14 | 3/14 | нет |
| tulipa-platystemon | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| tulipa-tetraphylla | catalog | 2/13 | 13/13 | 2/13 | 3/13 | нет |
| tulipa-zenaidae | catalog | 2/14 | 14/14 | 2/14 | 2/14 | нет |
| juno-orchioides | catalog | 2/14 | 14/14 | 2/14 | 2/14 | нет |
| iridodictyum-kolpakowskianum | catalog | 2/12 | 12/12 | 2/12 | 2/12 | нет |
| thesium-minkwitzianum | catalog | 2/13 | 13/13 | 2/13 | 2/13 | нет |
| delphinium-knorringianum | catalog | 2/11 | 11/11 | 2/11 | 3/11 | нет |
| urocerus-sah | catalog | 2/14 | 14/14 | 2/14 | 3/14 | нет |
| masaris-longicornis | catalog | 2/13 | 13/13 | 2/13 | 3/13 | нет |
| varanus-griseus-caspius | catalog | 2/13 | 13/13 | 2/13 | 3/13 | нет |
| lyrurus-tetrix | catalog | 2/14 | 14/14 | 2/14 | 3/14 | нет |
| cygnus-cygnus | catalog | 2/15 | 15/15 | 2/15 | 3/15 | нет |
| aythya-nyroca | catalog | 2/13 | 13/13 | 2/13 | 3/13 | нет |
| mergus-serrator | catalog | 2/15 | 15/15 | 2/15 | 3/15 | нет |
| oxyura-leucocephala | catalog | 2/14 | 14/14 | 2/14 | 3/14 | нет |
| gavia-arctica | catalog | 2/15 | 15/15 | 2/15 | 3/15 | нет |
| ciconia-ciconia | catalog | 2/13 | 13/13 | 2/13 | 3/13 | нет |
| platalea-leucorodia | catalog | 2/11 | 11/11 | 2/11 | 3/11 | нет |
| pelecanus-onocrotalus | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| phalacrocorax-pygmaeus | catalog | 2/11 | 11/11 | 2/11 | 3/11 | нет |
| falco-naumanni | catalog | 2/11 | 11/11 | 2/11 | 3/11 | нет |
| falco-rusticolus | catalog | 2/10 | 10/10 | 2/10 | 3/10 | нет |
| pandion-haliaetus | catalog | 2/11 | 11/11 | 2/11 | 3/11 | нет |
| haliaeetus-leucoryphus | catalog | 2/10 | 10/10 | 2/10 | 3/10 | нет |
| haliaeetus-albicilla | catalog | 2/10 | 10/10 | 2/10 | 3/10 | нет |
| gyps-himalayensis | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| gyps-fulvus | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| circaetus-gallicus | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| circus-macrourus | catalog | 2/11 | 11/11 | 2/11 | 3/11 | нет |
| neomys-fodiens | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| rhinolophus-bocharicus | catalog | 2/13 | 13/13 | 2/13 | 3/13 | нет |
| barbastella-leucomelas | catalog | 2/9 | 9/9 | 2/9 | 3/9 | нет |
| tadarida-teniotis | catalog | 2/11 | 11/11 | 2/11 | 3/11 | нет |
| ursus-arctos | catalog | 2/11 | 11/11 | 2/11 | 3/11 | нет |
| martes-foina | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| lutra-lutra | catalog | 2/9 | 9/9 | 2/9 | 3/9 | нет |
| allactaga-elater | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| dictyocephalus-attenuatus | catalog | 2/10 | 10/10 | 2/10 | 3/10 | нет |
| prionus-tschitscherini | catalog | 2/11 | 11/11 | 2/11 | 3/11 | нет |
| rossomyrmex-proformicarum | catalog | 2/11 | 11/11 | 2/11 | 3/11 | нет |
| barbus-brachycephalus | catalog | 2/13 | 13/13 | 2/13 | 3/13 | нет |
| allochrusa-gypsophiloides | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| corydalis-pseudoadunca | catalog | 2/10 | 10/10 | 2/10 | 3/10 | нет |
| fumariola-turkestanica | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| rhodiola-litwinowii | catalog | 2/11 | 11/11 | 2/11 | 3/11 | нет |
| sibiraea-tianschanica | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| crataegus-knorringiana | catalog | 2/11 | 11/11 | 2/11 | 3/11 | нет |
| ammopiptanthus-nanus | catalog | 2/11 | 11/11 | 2/11 | 3/11 | нет |
| colutea-brachyptera | catalog | 2/11 | 11/11 | 2/11 | 3/11 | нет |
| primula-eugeniae | catalog | 2/10 | 10/10 | 2/10 | 3/10 | нет |
| physochlaina-alaica | catalog | 2/11 | 11/11 | 2/11 | 3/11 | нет |
| incarvillea-olgae | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| saussurea-involucrata | catalog | 2/11 | 11/11 | 2/11 | 3/11 | нет |
| silene-sussamyrica | catalog | 2/11 | 11/11 | 2/11 | 2/11 | нет |
| iskandera-alaica | catalog | 2/11 | 11/11 | 2/11 | 2/11 | нет |
| spiraeanthus-schrenkianus | catalog | 2/12 | 12/12 | 2/12 | 2/12 | нет |
| chesneya-villosa | catalog | 2/13 | 13/13 | 2/13 | 2/13 | нет |
| hedysarum-chaitocarpum | catalog | 2/12 | 12/12 | 2/12 | 2/12 | нет |
| zygophyllum-kaschgaricum | catalog | 2/12 | 12/12 | 2/12 | 2/12 | нет |
| sclerotiaria-pentaceros | catalog | 2/11 | 11/11 | 2/11 | 2/11 | нет |
| bupleurum-rosulare | catalog | 2/11 | 11/11 | 2/11 | 2/11 | нет |
| hyalolaena-intermedia | catalog | 2/11 | 11/11 | 2/11 | 2/11 | нет |
| seseli-eryngioides | catalog | 2/11 | 11/11 | 2/11 | 2/11 | нет |
| seseli-korshinskyi | catalog | 2/11 | 11/11 | 2/11 | 2/11 | нет |
| cnidiocarpa-alaica | catalog | 2/11 | 11/11 | 2/11 | 2/11 | нет |
| pastinacopsis-glacialis | catalog | 2/12 | 12/12 | 2/12 | 2/12 | нет |
| kaufmannia-semenovii | catalog | 2/12 | 12/12 | 2/12 | 2/12 | нет |
| acantholimon-compactum | catalog | 2/12 | 12/12 | 2/12 | 2/12 | нет |
| scutellaria-andrachnoides | catalog | 2/12 | 12/12 | 2/12 | 2/12 | нет |
| scutellaria-nepetoides | catalog | 2/11 | 11/11 | 2/11 | 2/11 | нет |
| salvia-korolkowii | catalog | 2/12 | 12/12 | 2/12 | 2/12 | нет |
| nathaliella-alaica | catalog | 2/12 | 12/12 | 2/12 | 2/12 | нет |
| lonicera-paradoxa | catalog | 2/11 | 11/11 | 2/11 | 2/11 | нет |
| campanula-eugeniae | catalog | 2/12 | 12/12 | 2/12 | 2/12 | нет |
| lamyropappus-schakaptaricus | catalog | 2/12 | 12/12 | 2/12 | 2/12 | нет |
| trichanthemis-aulieatensis | catalog | 2/12 | 12/12 | 2/12 | 2/12 | нет |
| trichanthemis-aurea | catalog | 2/12 | 12/12 | 2/12 | 2/12 | нет |
| lepidolopha-komarowii | catalog | 2/12 | 12/12 | 2/12 | 2/12 | нет |
| barbus-capito-conocephalus | catalog | 2/13 | 13/13 | 2/13 | 3/13 | нет |
| vipera-ursinii-renardi | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| kirgisobia-bohnei | catalog | 2/10 | 10/10 | 2/10 | 3/10 | нет |
| anser-indica | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| accipiter-badius | catalog | 2/13 | 13/13 | 2/13 | 3/13 | нет |
| aquila-clanga | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| aquila-nipalensis | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| aquila-heliaca | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| hieraaetus-fasciatus | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| hieraaetus-pennatus | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| tetrax-tetrax | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| crex-crex | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| anthropoides-virgo | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| burhinus-oedicnemus | catalog | 2/13 | 13/13 | 2/13 | 3/13 | нет |
| vanellus-gregarius | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| glareola-nordmanni | catalog | 2/11 | 11/11 | 2/11 | 3/11 | нет |
| strix-aluco | catalog | 2/13 | 13/13 | 2/13 | 3/13 | нет |
| syrrhaptes-paradoxus | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| pterocles-alchata | catalog | 2/10 | 10/10 | 2/10 | 3/10 | нет |
| pterocles-orientalis | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| columba-leuconota | catalog | 2/10 | 10/10 | 2/10 | 3/10 | нет |
| columba-eversmanni | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| bubo-bubo | catalog | 2/14 | 14/14 | 2/14 | 3/14 | нет |
| gazella-subgutturosa | catalog | 3/11 | 11/11 | 2/11 | 3/11 | нет |
| dendrocopos-leucopterus | catalog | 3/12 | 12/12 | 2/12 | 3/12 | нет |
| sorbus-persica | catalog | 3/14 | 14/14 | 2/14 | 3/14 | нет |
| amygdalus-petunnikowii | catalog | 3/13 | 13/13 | 2/13 | 3/13 | нет |
| kosopoljanskia-turkestanica | catalog | 3/11 | 11/11 | 2/11 | 3/11 | нет |
| alajja-anomala | catalog | 3/11 | 11/11 | 2/11 | 3/11 | нет |
| otostegia-schennikovii | catalog | 3/11 | 11/11 | 2/11 | 3/11 | нет |
| salvia-vvedenskyi | catalog | 3/12 | 12/12 | 2/12 | 3/12 | нет |
| stemmacantha-aulieatensis | catalog | 3/12 | 12/12 | 2/12 | 3/12 | нет |
| centaurea-alaica | catalog | 3/10 | 10/10 | 2/10 | 3/10 | нет |
| pyrethrum-leontopodium | catalog | 3/12 | 12/12 | 2/12 | 3/12 | нет |
| phoenicopterus-roseus | catalog | 3/13 | 13/13 | 2/13 | 3/13 | нет |
| chlamydotis-macqueenii | catalog | 3/14 | 14/14 | 2/14 | 3/14 | нет |
| numenius-tenuirostris | catalog | 3/11 | 11/11 | 2/11 | 3/11 | нет |
| larus-ichtyaetus | catalog | 3/13 | 13/13 | 2/13 | 3/13 | нет |
| dendrocopos-major | catalog | 3/11 | 11/11 | 2/11 | 3/11 | нет |
| hemiechinus-hypomelas | catalog | 3/13 | 13/13 | 2/13 | 3/13 | нет |
| allactaga-severtzovi | catalog | 3/11 | 11/11 | 2/11 | 3/11 | нет |
| anemone-obtusiloba | catalog | 3/12 | 12/12 | 2/12 | 3/12 | нет |
| berberis-kaschgarica | catalog | 3/12 | 12/12 | 2/12 | 3/12 | нет |
| primula-macrocalyx | catalog | 3/12 | 12/12 | 2/12 | 3/12 | нет |
| sonjagaster-coronatus | catalog | 3/12 | 12/12 | 2/12 | 3/12 | нет |
| capoetobrama-kuschakewitschi-orientalis | catalog | 3/12 | 12/12 | 2/12 | 3/12 | нет |
| schizothorax-issykkuli | catalog | 3/12 | 12/12 | 2/12 | 3/12 | нет |
| diptychus-dybowskii-lansdelli | catalog | 3/13 | 13/13 | 2/13 | 3/13 | нет |
| eryx-tataricus | catalog | 3/12 | 12/12 | 2/12 | 3/12 | нет |
| terpsiphone-paradisi | catalog | 3/10 | 10/10 | 2/10 | 2/10 | нет |
| otonycteris-hemprichi | catalog | 3/12 | 12/12 | 2/12 | 2/12 | нет |
| cervus-elaphus-asiaticus | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| allactaga-saltator | catalog | 3/12 | 12/12 | 2/12 | 3/12 | нет |
| sorbaria-olgae | catalog | 3/11 | 11/11 | 2/11 | 3/11 | нет |
| dorema-microcarpum | catalog | 3/12 | 12/12 | 2/12 | 3/12 | нет |
| tianschaniella-umbellifera | catalog | 3/12 | 12/12 | 2/12 | 3/12 | нет |
| parnassius-loxias-tashkorensis | catalog | 3/12 | 12/12 | 2/12 | 3/12 | нет |
| parnassius-apollo-merzbacheri | catalog | 3/13 | 13/13 | 2/13 | 3/13 | нет |
| cuon-alpinus | catalog | 2/12 | 12/12 | 2/12 | 3/12 | нет |
| amur-tiger | archive | 0/1 | 0/1 | 0/1 | 0/1 | нет |
| whooping-crane | archive | 0/1 | 0/1 | 0/1 | 1/1 | нет |

## Выполнено и ограничения

Полностью заполнены все имеющиеся основные тексты на четырёх языках (без поля names): irbis, argali, manul, golden-eagle, bearded-vulture, saker-falcon, greigs-tulip, kaufmanns-tulip, sievers-apple, central-asian-tortoise, central-asian-frog, predatory-bush-cricket, dog-stinkhorn, marbled-polecat, black-stork, eduards-fritillary, european-glass-lizard, pike-asp, turkestan-catfish, tien-shan-scutiger. Это не утверждение о завершении всех народных названий. Полностью завершённых записей со всеми names: 0.

Полная локализация каталога не завершена. Независимая вычитка KY/UZ/EN не проводилась. Научные факты, русский оригинал, ссылки, категории, численность, статусы и лицензии сохранены.

## Партия 003: прогресс относительно 002

| Язык | До | После | Добавлено |
|---|---:|---:|---:|
| KY | 562/2219 | 641/2219 | 79 |
| RU | 2217/2219 | 2217/2219 | 0 |
| UZ | 460/2219 | 547/2219 | 87 |
| EN | 641/2219 | 720/2219 | 79 |

| ID | Научное имя | Добавлено KY / UZ / EN | Оставшиеся поля и названия |
|---|---|---:|---|
| pike-asp | Aspiolucius esocinus | 9 / 10 / 9 | names.uz (missing) |
| turkestan-catfish | Glyptosternon reticulatum | 9 / 10 / 9 | names.uz (missing) |
| tien-shan-scutiger | Albatrellus tianschanicus | 8 / 9 / 8 | names.uz (missing) |
| manul | Otocolobus manul | 11 / 12 / 11 | names.uz (missing) |
| bearded-vulture | Gypaetus barbatus | 11 / 12 / 11 | names.uz (missing) |
| saker-falcon | Falco cherrug | 11 / 12 / 11 | names.uz (missing) |
| marbled-polecat | Vormela peregusna | 10 / 11 / 10 | names.uz (missing) |
| black-stork | Ciconia nigra | 10 / 11 / 10 | names.uz (missing) |

В партии переведены все имеющиеся основные блоки, включая обзоры целиком, исторические ограничения, сведения о среде, охране и подписи к фото. Не добавлены неподтверждённые народные названия; отсутствующие научные разделы не заполнялись.

Для ручной вычитки:

- Проверить узбекские народные названия всех восьми видов; поле names.uz оставлено как в исходнике. В связном тексте для неподтверждённых названий использованы научные имена.
- pike-asp и turkestan-catfish: соответствие уже имеющихся KY названий «Кашка» и «Лакка» конкретным видам; термины «реофил», «нагула», «елец», «голец», «жировой плавник», «хирономиды» и «подёнки»; написание гидронимов в UZ.
- tien-shan-scutiger: «плодовое тело», «лопастной край», «трофическая группа» и написание Заилийского Алатау.
- manul и marbled-polecat: «сырты», названия мелких млекопитающих (пищухи, полёвки, песчанки, суслики, тушканчики) и различие ночной, сумеречной и утренне-вечерней активности между источниками.
- bearded-vulture, saker-falcon и black-stork: названия «Көк жору, балта жутар», передача различия оседлости и кочёвок, а также «водно-болотные угодья» и «минизаказники».

Порядок партии: три оставшиеся записи первой очереди, затем первые пять карточек с неполными текстами в порядке каталога.

Точная следующая запись: **ibisbill**. После исчерпания первой очереди брать незавершённые тексты в порядке каталога. Уже заполненные ячейки и неподтверждённые названия не переписывать.

## Проверки партии 003

- Профильные тесты локализации: 8/8. Проверены порядок очереди, отсутствие кириллицы в новых текстах UZ/EN, сохранение абзацев, имён и научных полей.
- Полный набор: 418/434 в изолированной проверочной копии с теми же байтами рабочих файлов и без локальных черновиков. По именам совпали все 16 прежних падений; новых нет. Пробные прогоны в рабочем окружении прерывались из-за нехватки места и ошибок копирования временных файлов; исторические контрольные суммы не менялись.
- `npm run data`, `npm run data:validate` и `npm run build`: успешно. Проверено 704 ключа на четырёх языках, 184 записи, 2 архивные записи и 208 региональных свидетельств.
- Chrome: 59/59 сценариев. У pike-asp, turkestan-catfish, tien-shan-scutiger и black-stork проверены оба абзаца обзора и атрибут языка на KY/RU/UZ/EN. У ibisbill проверена честная подстановка русского текста. Ошибок страницы нет.
- Журналы обратимо отделяют новые переводы от исходных данных; 755 защищённых файлов совпали по исходным SHA-256.

## Остальные публичные тексты

UI-словари и админка проходят проверку паритета ключей/подстановок на четырёх языках. ScientificText отмечает язык fallback, многоабзацные тексты используют contentParagraphs. Имена в карточках/страницах получают lang фактического источника. Названия регионов на странице вида теперь используют тот же ScientificText. Поиск индексирует имеющиеся языки, карта и викторина используют действующие словари/переводы; недостающий научный перевод не считается заполненным из-за интерфейсного перевода.

Библиографические title/publisher, URL, scientificName, taxonomy, авторы/лицензии/attribution и оригинальные названия документов не переводились. Исторические nationalRedBook.edition, изменения фото и исследовательские примечания остаются оригинальными и не выдаются за перевод. Population и региональные свидетельства не менялись. Отдельного нового народного названия не добавлено.

## Как продолжить

```powershell
npm run translations:audit -- --write
npm run dev:admin
# В админке: фильтр незавершённых переводов, отдельные KY/RU/UZ/EN поля.
# Неполный черновик сохраняется без статуса завершения.
npm run data
npm run data:validate
npm run build
```

Журнал хранит точные добавленные поля, тексты и SHA-256 русского оригинала; следующий пакет создавать отдельно, не заменяя первый и не меняя оригинал. Перед обновлением проверить сохранность фактов, дат, sourceIds, ссылок, фото/лицензий, статусов и русского текста относительно checkpoint. Отчёт генерируется кодом, поэтому продолжение не требует повторного перевода уже заполненных полей. Исторический отчёт первой партии сохранён в `STAGE_3_VALIDATION.md`. Проверки текущей партии приведены выше.
