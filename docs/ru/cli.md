---
description: Командная строка khonsu печатает JSON после каждой команды, поэтому Claude Code и другие ИИ-агенты могут изучать граф, выполнять запросы, прослеживать пути и писать дашборды.
---
# CLI и ИИ-агенты

Настольное приложение и CLI используют один исполняемый файл. Без аргументов `khonsugraph` открывает приложение; с подкомандой он выполняет её и завершается. Кнопка **Command line & AI** в строке заголовка (значок робота) устанавливает `khonsu` в PATH и может установить навык для Claude Code.

[Навык агента](https://github.com/JetSquirrel/KhonsuGraph/tree/main/skills/khonsugraph) учит агентов рабочему процессу, который начинается со схемы, и поддерживаемому подмножеству Cypher.

## Справочник команд

| Команда | Назначение |
| --- | --- |
| `khonsu init DIR` | Создать пустой граф |
| `khonsu schema --db DIR` | Показать метки, связи, свойства и таблицы |
| `khonsu query --db DIR --cypher "…"` | Выполнить одну инструкцию Cypher только на чтение |
| `khonsu query --db DIR --sql "…"` | Выполнить одну инструкцию SQL только на чтение |
| `khonsu query --db DIR --file query.cypher` | Выполнить файл запроса; расширение `.sql` выбирает SQL |
| `khonsu explain --db DIR --cypher "…"` | Объяснить запрос |
| `khonsu explore --db DIR --from NODE [--to NODE]` | [Обойти граф от узла](./investigations#explore) и сообщить путь |
| `khonsu evidence --db DIR --node NODE --rel REL` | Показать, [что подтверждает запись](./investigations#evidence) |
| `khonsu analyze ALGORITHM --db DIR` | Запустить [графовый алгоритм](./analysis): PageRank, сообщества, компоненты и другое |
| `khonsu investigation save FILE --db DIR --from NODE` | [Сохранить расследование](./investigations#saved-investigations); `reopen FILE` запускает его снова |
| `khonsu snapshot save FILE --db DIR` | Сохранить записи графа; [`snapshot diff A B`](./investigations#snapshots) сравнивает два снимка |
| `khonsu rebuild --db DIR` | Пересобрать граф старого формата из его источников данных |
| `khonsu plugin list` | Показать плагины и разрешения |
| `khonsu plugin describe ID` | Показать поля конфигурации плагина и типы вывода |
| `khonsu plugin search [WORDS]` | Показать, что предлагают [маркетплейсы](./marketplace) |
| `khonsu plugin install ID --yes` | Установить плагин по имени из маркетплейса и одобрить его |
| `khonsu plugin install DIR --yes` | Установить каталог или ZIP с плагином и подтвердить его разрешения |
| `khonsu plugin update` | Обновить плагины, установленные из маркетплейса; `--dry-run` только показывает изменения |
| `khonsu marketplace list` | Показать маркетплейсы; `add` и `remove` изменяют список |
| `khonsu plugin sync --source ID` | Синхронизировать источник; `--dry-run` показывает предварительный результат, `--incremental` и `--append` добавляют без удаления |
| `khonsu plugin analyze ID ANALYSIS --db DIR` | Запустить [анализ плагина](./investigations#plugin-analyses), например `exposure` в AWS |
| `khonsu source list` | Показать настроенные источники |
| `khonsu source add --db DIR --plugin ID --name NAME -c key=value` | Настроить источник; `--test` сначала проверяет его |
| `khonsu source remove ID` | Удалить источник |
| `khonsu check FILE --db DIR` | Проверить дашборд на графе |
| `khonsu comments FILE` | Показать комментарии к графикам, ответить на них и закрыть их |
| `khonsu presence FILE --doing editing --plot NAME` | Сообщить окну, какие графики вы редактируете |
| `khonsu open DIR` | Открыть граф в настольном приложении |
| `khonsu open FILE.dash` | Открыть дашборд |
| `khonsu open --state` | Прочитать граф и вкладки работающего окна |

`--db` по умолчанию берётся из `KHONSU_DB`, а затем — последний граф, открытый в приложении. В автоматизации указывайте путь явно. Для записи запросами нужен `--write`.

## Вывод и ошибки

Каждая команда печатает в stdout один объект JSON; `--pretty` добавляет отступы. Ход синхронизации выводится в stderr строками JSON. Результаты запросов содержат `columns`, `rows`, `row_count`, `truncated` и `elapsed_ms`, а также `graph`, если возвращаются узлы или связи.

`--max-rows` по умолчанию равно 200 и обрезает отображаемый результат. Оно не уменьшает объём работы при выполнении запроса. Всегда проверяйте `truncated` и используйте запросы с ограничениями.

При сбое возвращается объект `error` с полями `kind` и `message` и необязательным `detail`. Прежде чем толковать stdout, проверьте код возврата: 1 означает ошибку выполнения, 2 — ошибку использования или описания дашборда.

## Цикл проверки

```sh
khonsu comments overview.dash
khonsu presence overview.dash --doing editing --plot dependencies
# Отредактируйте файл .dash, затем проверьте его.
khonsu check overview.dash --db graphs/demo
# Используйте реальный ID комментария, полученный первой командой.
khonsu comments overview.dash --reply c1 --text "Updated the graph panel" --resolve
khonsu presence overview.dash --doing idle
```

Пока приложение держит граф, запросы на чтение, `check` и `plugin sync` выполняются через окно и возвращают `via_window: true`. Запись запросами, `explore` и `investigation` требуют, чтобы граф был свободен. Не удаляйте блокировки, чтобы обойти это ограничение. См. [устранение неполадок](./troubleshooting).
