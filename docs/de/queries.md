---
description: Fragen Sie einen lokalen Graphen in Cypher und Tabellen in PostgreSQL-SQL ab. Unterstützte Cypher-Klauseln, kürzeste Pfade, Parameter und aktuelle HawDB-Grenzen.
---
# Cypher & SQL

## Vor der Abfrage prüfen

```sh
khonsu schema --db graphs/demo
```

Das Ergebnis listet Labels, Beziehungstypen, Eigenschaftsnamen, Anzahlen, Beziehungsmuster und SQL-Tabellen auf. Verwenden Sie diese Namen, statt das Schema eines anderen Graphen anzunehmen.

## Verbindungen zurückgeben

```cypher
MATCH (a:Host)-[r:DEPENDS_ON]->(b:Host)
RETURN a, r, b
LIMIT 20
```

Wenn Sie ganze Knoten und Beziehungen zurückgeben, erhalten Sie sowohl Tabellenwerte als auch Graphelemente. Wenn Sie nur `a.name` zurückgeben, erhalten Sie eine skalare Spalte, keinen verbundenen Graphen. In der CLI erscheinen Graphelemente in einem separaten `graph`-Objekt.

Cypher unterstützt `MATCH`, `OPTIONAL MATCH`, `WHERE`, `RETURN [DISTINCT]`, `ORDER BY`, `SKIP`, `LIMIT`, `WITH`, `UNWIND`, `CASE` und begrenzte Muster variabler Länge. Mit `--write` stehen außerdem `CREATE`, `MERGE`, `SET`, `DELETE` und `DETACH DELETE` zur Verfügung. Zum Beispiel mit einem Service-Graphen:

```cypher
MATCH (a:Service)-[:CALLS*1..4]->(b:Service)
RETURN a, b
LIMIT 50
```

Dies gibt Endpunkte zurück. Fragen Sie Beziehungen mit einem Sprung separat ab, um die dazwischenliegenden Verbindungen zu zeichnen.

## Kürzeste Pfade

```cypher
MATCH p = shortestPath((a:Host {name: 'web'})-[:CALLS*..6]->(b:Host {name: 'db'}))
RETURN p, length(p) AS hops
```

`allShortestPaths`, `nodes(p)` und `relationships(p)` funktionieren ebenfalls. Beide Endpunkte müssen durch eine Eigenschaftszuordnung, ein `WHERE` oder eine vorherige Klausel gebunden sein. Wenn Sie `p` zurückgeben, wird der Pfad auf der Zeichenfläche gezeichnet. Ein unbegrenztes `*` endet nach 256 Sprüngen und schlägt fehl, statt zu melden, dass kein Pfad existiert.

Um von einem Knoten mit Obergrenzen für Sprünge und Größe nach außen zu gehen, verwenden Sie [`khonsu graph explore`](./investigations#explore). Für gewichtete Pfade, Zentralität und Communities siehe [Graphanalyse](./analysis).

## SQL und Parameter

SQL-Abfragen arbeiten auf Tabellen im selben HawDB-Verzeichnis und verwenden SQL im PostgreSQL-Dialekt. Ein Graphimport bedeutet nicht, dass eine gleichnamige SQL-Tabelle existiert. Prüfen Sie zuerst `schema`. Das folgende Beispiel erfordert eine Tabelle `assets`:

```sh
khonsu query --db graphs/demo --sql "SELECT * FROM assets LIMIT 20"
khonsu query --db graphs/demo --cypher \
  'MATCH (h:Host) WHERE h.name = $name RETURN h' -p name=web-01
```

Werte für `-p` werden, wenn möglich, als JSON geparst, andernfalls als Zeichenketten. SQL verwendet Positionsparameter (`$1` mit `-p 1=value`).

## Aktuelle Einschränkungen {#current-limitations}

KhonsuGraph 0.3.0 verwendet HawDB 0.29.0, dessen Cypher sich von anderen Graphdatenbanken unterscheidet:

- `labels()`, `keys()`, `properties()`, `CALL db.*` und `SHOW` werden nicht unterstützt. Verwenden Sie `khonsu schema` für Metadaten.
- `count`, `sum`, `collect`, `min`, `max` und `avg` sind die unterstützten Aggregatfunktionen, auch über Ausdrücke.
- Ein Lesevorgang beginnt mit `MATCH` oder `UNWIND`. Ein bloßes `RETURN 1` wird nicht geparst, und `OPTIONAL MATCH` kann nicht die erste Klausel sein.
- Muster variabler Länge erfordern einen Beziehungstyp und keine Beziehungsvariable. Ein Muster ohne Beziehungstyp funktioniert nur für einen Sprung.
- Pfadvariablen funktionieren nur bei `shortestPath` und `allShortestPaths`.
- Zeichenketten lassen sich nicht mit `+` verketten, und `toLower`, `toUpper`, `reduce`, `any`, `all`, `none` und `exists` stehen nicht zur Verfügung.
- `CREATE` nimmt ein Muster pro Anweisung. `LOAD CSV` ist abgeschaltet; bringen Sie Dateien mit einer [Datenquelle](./data-sources) ein.
- Skalares `IN`, Listenverständnisse, `json_value()` auf JSON-Text, Datumsangaben und Zeitdauern sowie `SET` auf Beziehungseigenschaften werden unterstützt.
- Lesevorgänge haben eine Ausführungsobergrenze von 100.000 Zeilen. `--max-rows` begrenzt nur die angezeigten Zeilen nach der Ausführung, verwenden Sie daher zusätzlich `LIMIT` in der Abfrage.
- Vektorwerte werden als JSON-Zahlenarrays zurückgegeben. Spalten kommen in der Reihenfolge des `RETURN` zurück; lesen Sie sie dennoch über ihren Namen.
- `WHERE true` funktioniert in Cypher, aber nicht in SQL.

Ein Graph, der vor HawDB 0.25 geschrieben wurde, also von KhonsuGraph 0.2.0 oder früher, kann von dieser Version nicht gelesen werden; siehe [Fehlerbehebung](./troubleshooting#old-format).

## Lese- und Schreibzugriff

CLI-Abfragen sind standardmäßig schreibgeschützt. `--write` aktiviert Schreibvorgänge ausdrücklich. Jeweils ein Prozess besitzt ein Graphverzeichnis. Solange die App den Graphen geöffnet hat, werden CLI-Leseabfragen und Dashboard-Prüfungen über dieses Fenster geleitet. Schreibvorgänge und Synchronisierungen erfordern, dass der Graph dort geschlossen ist.
