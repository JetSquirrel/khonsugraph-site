---
description: Установите KhonsuGraph, создайте граф и импортируйте небольшой пример CSV.
---
# Начало работы

## Установка

Готовые пакеты доступны в [GitHub Releases](https://github.com/JetSquirrel/KhonsuGraph/releases). В процессе выпуска собираются DMG для macOS на Apple silicon и ZIP для 64-битной Windows. Пакеты для Windows не подписаны; последнее обновление движка проверялось на macOS, а не на Windows.

В macOS откройте DMG и скопируйте приложение в папку Applications. В Windows распакуйте ZIP целиком, сохранив папку `plugins` рядом с исполняемым файлом.

Кнопка **Command line & AI** (значок робота) в строке заголовка приложения устанавливает команду `khonsu` в PATH и может добавить навык агента в Claude Code. Исполняемый файл приложения также принимает подкоманды CLI напрямую.

```sh
khonsu --version
```

## Создание небольшого графа

Скачайте [hosts.csv](/samples/hosts.csv) и [dependencies.csv](/samples/dependencies.csv) в одну рабочую папку. В них описаны три хоста и две зависимости.

Выполните эти команды в этой папке. На время импорта граф должен быть закрыт в настольном приложении.

```sh
khonsu init graphs/demo
khonsu source add --db graphs/demo --plugin csv --name demo \
  -c node_file=hosts.csv -c node_label=Host -c node_id_column=id \
  -c edge_file=dependencies.csv -c edge_type=DEPENDS_ON \
  -c edge_source_column=source -c edge_target_column=target --test
khonsu plugin sync --source demo --dry-run
khonsu plugin sync --source demo
```

Первая синхронизация показывает количество и примеры записей, ничего не записывая; вторая импортирует граф. `source add` сохраняет пути к CSV как абсолютные, поэтому последующие синхронизации работают из любой папки.

## Запросы и исследование

```sh
khonsu schema --db graphs/demo
khonsu query --db graphs/demo --cypher \
  "MATCH (a:Host)-[r:DEPENDS_ON]->(b:Host) RETURN a, r, b"
khonsu open graphs/demo
```

В редакторе запросов настольного приложения выполните тот же запрос на Cypher. Если возвращать узлы и связи целиком, графовый холст получает всё необходимое, чтобы показать соединения.

Дальше читайте раздел [запросы](./queries) или переходите к [первому дашборду](./dashboards).

## Сборка из исходного кода

Из клона репозитория приложения:

```sh
cargo build --workspace
cargo run -p khonsugraph
```

Приложение использует Rust, GPUI и HawDB. Сведения о сборке релизных пакетов и настройке для отдельных платформ см. в README репозитория.
