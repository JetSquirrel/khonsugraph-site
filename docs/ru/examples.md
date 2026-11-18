---
description: Примеры графовых расследований на публичных наборах данных. Цепочка атаки по журналам Sysmon, радиус поражения сервисов, сеть ICIJ Offshore Leaks, сеть доверия Bitcoin и открытость AWS.
---
# Примеры

В [репозитории приложения](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples) есть дашборды и скрипты, которые готовят графы из публичных наборов данных. Сам файл `.dash` не содержит своей базы данных.

## Публичные наборы данных

| Дашборд | Вопрос | Исходные данные | Граф |
| --- | --- | --- | --- |
| [Цепочка атаки](#attack-chain) | Какая цепочка атаки скрывается в шумных журналах хостов? | MITRE ATT&CK и OTRF Security-Datasets | 1 838 узлов, 20 591 связь |
| [Радиус поражения SRE](#blast-radius) | Что утягивает за собой падающий сервис? | манифесты сервисов Google Online Boutique | 12 сервисов, 16 путей вызовов |
| [Сеть офшорных компаний](#offshore-network) | Кто стоит за группой компаний? | ICIJ Offshore Leaks | 5 577 узлов, 6 515 связей |
| [Сеть доверия между аккаунтами](#trust-network) | На какие аккаунты жалуются другие? | оценки SNAP Bitcoin OTC | 5 881 аккаунт, 35 592 оценки |
| Аренда жилья рядом с транспортом | Какое жильё находится рядом со станцией MTR? | данные MTR из OpenStreetMap и Inside Airbnb Hong Kong | 5 730 узлов, 17 119 связей |

Каждый источник сохраняет собственную лицензию. Наличие в наборе данных ICIJ не означает нарушения закона. Сведения о происхождении данных и лицензировании см. в README примеров в репозитории.

## Цепочка атаки {#attack-chain}

Для инженера по безопасности или охотника за угрозами. `security/attack_chain.dash` объединяет MITRE ATT&CK (группы, программное обеспечение, техники, меры защиты) с двумя записями OTRF Sysmon — Empire Mimikatz и Covenant PowerShell remoting. События создания процессов и доступа к LSASS связываются с техниками, на которые они указывают. Выберите технику, чтобы увидеть, какие известные группы её используют и как от неё защититься; выберите процесс, чтобы увидеть, что он породил и с чем соединился.

Соберите его командами ниже, подставив `security` вместо `sre` и `attack_chain.dash` в качестве дашборда.

## Офшорная сеть {#offshore-network}

Для исследователя. `investigation/offshore_network.dash` отображает директоров, компании и посредников из базы ICIJ Offshore Leaks (Panama Papers, Гонконг, 2012–2015). Выберите директора, чтобы увидеть его компании, и найдите посредников, которые зарегистрировали больше всего компаний.

Соберите его, подставив `investigation` вместо `sre`.

## Сеть доверия {#trust-network}

Для аудитора. `audit/trust_network.dash` исследует, кто кого оценивает в сети доверия Bitcoin OTC. [Анализ графов](./analysis) находит аккаунты, на которых держится сеть:

```sh
khonsu graph analyze pagerank --db graphs/audit --type TRUSTS --top 10
```

Соберите его, подставив `audit` вместо `sre`.

## Радиус поражения сервисов {#blast-radius}

Для SRE: какие сервисы вызывают падающую зависимость — напрямую или через другие. Из клона репозитория приложения:

```sh
sh examples/datasets/fetch.sh scratch/datasets/raw
node examples/datasets/build.mjs sre scratch/datasets/raw scratch/datasets/sre
khonsu graph init graphs/sre
khonsu source add --db graphs/sre --plugin csv --name sre-data \
  -c 'nodes=[{"path":"'"$PWD"'/scratch/datasets/sre/nodes.csv","label_column":"label","id_column":"id"}]' \
  -c 'edges=[{"path":"'"$PWD"'/scratch/datasets/sre/edges.csv","type_column":"type","source_column":"source","target_column":"target","id_column":"id"}]'
khonsu plugin sync --source sre-data
khonsu dash check examples/sre/blast_radius.dash --db graphs/sre
khonsu open graphs/sre
khonsu open examples/sre/blast_radius.dash
```

Скрипт загрузки скачивает публичные данные. `$PWD` делает пути к CSV абсолютными — это требуется плагину CSV для `nodes` и `edges`. Замените `sre` на каталоги других историй, как описано в README примеров.

## Открытость AWS без реального аккаунта {#aws-exposure}

Для инженера по облачной безопасности: что конфигурация аккаунта AWS открывает в интернет — от CIDR интернета через группы безопасности и балансировщики нагрузки до инстансов и ролей, которые они принимают.

Сохранённые ответы AWS CLI для плагина AWS лежат в репозитории [khonsugraph-marketplace](https://github.com/JetSquirrel/khonsugraph-marketplace). Склонируйте его рядом с репозиторием приложения и выполняйте команды из корня репозитория приложения:

```sh
khonsu graph init graphs/aws
khonsu plugin install aws --yes
khonsu source add --db graphs/aws --plugin aws --name aws-fixture \
  -c "fixture_dir=$PWD/../khonsugraph-marketplace/plugins/aws/tests/fixture" -c regions=us-east-1
khonsu plugin sync --source aws-fixture
khonsu dash check examples/aws/exposure.dash --db graphs/aws
khonsu open graphs/aws
khonsu open examples/aws/exposure.dash
```

Также можно <a href="/docs/samples/exposure.dash" download>скачать дашборд открытости</a>. Для него нужен импортированный граф AWS.

Начиная с 0.3.0 команда `khonsu plugin analyze aws exposure --db graphs/aws` сообщает находки вместе с правилом и полями для каждой, а `khonsu graph explore` прослеживает путь. См. [расследования](./investigations).
