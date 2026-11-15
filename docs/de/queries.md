---
description: Fragen Sie Graphen in Cypher und Tabellen in SQL ab, und verstehen Sie die Zeichenfläche sowie aktuelle HawDB-Grenzen.
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

Cypher unterstützt `MATCH`, `OPTIONAL MATCH`, `WHERE`, `RETURN [DISTINCT]`, `ORDER BY`, `SKIP`, `LIMIT`, `WITH` und begrenzte Muster variabler Länge. Mit `--write` stehen außerdem `CREATE`, `MERGE`, `SET`, `DELETE` und `DETACH DELETE` zur Verfügung. Zum Beispiel mit einem Service-Graphen:

```cypher
MATCH (a:Service)-[:CALLS*1..4]->(b:Service)
RETURN a, b
LIMIT 50
```

Dies gibt Endpunkte zurück. Fragen Sie Beziehungen mit einem Sprung separat ab, um die dazwischenliegenden Verbindungen zu zeichnen.

## SQL und Parameter

SQL-Abfragen arbeiten auf Tabellen im selben HawDB-Verzeichnis und verwenden SQL im PostgreSQL-Dialekt. Ein Graphimport bedeutet nicht, dass eine gleichnamige SQL-Tabelle existiert. Prüfen Sie zuerst `schema`. Das folgende Beispiel erfordert eine Tabelle `assets`:

```sh
khonsu query --db graphs/demo --sql "SELECT * FROM assets LIMIT 20"
khonsu query --db graphs/demo --cypher \
  'MATCH (h:Host) WHERE h.name = $name RETURN h' -p name=web-01
```

Werte für `-p` werden, wenn möglich, als JSON geparst, andernfalls als Zeichenketten. SQL verwendet Positionsparameter (`$1` mit `-p 1=value`).

## Aktuelle Einschränkungen {#current-limitations}

Der geprüfte Quellstand verwendet HawDB 0.12.0:

- Cypher `sum()`, `labels()`, `keys()`, `properties()`, `shortestPath`, Pfadvariablen, `CALL db.*` und `SHOW` werden von diesem Ablauf nicht unterstützt. Verwenden Sie `khonsu schema` für Metadaten.
- `count`, `collect`, `min`, `max` und `avg` sind unterstützte Aggregatfunktionen.
- Muster variabler Länge erfordern einen Beziehungstyp und keine Beziehungsvariable.
- Auf `UNWIND` muss eine Schreibklausel folgen; ein eigenständiges, schreibgeschütztes `UNWIND` und `WHERE true` werden nicht unterstützt.
- `OPTIONAL MATCH`, skalares `IN`, `json_value()` auf JSON-Text und `SET` auf Beziehungseigenschaften werden unterstützt.
- Lesevorgänge haben eine Ausführungsobergrenze von 100.000 Zeilen. `--max-rows` begrenzt nur die angezeigten Zeilen nach der Ausführung, verwenden Sie daher zusätzlich `LIMIT` in der Abfrage.
- Vektorwerte werden als JSON-Zahlenarrays zurückgegeben. Lesen Sie Ergebnisspalten über ihren Namen; die Engine kann sie umordnen.

## Lese- und Schreibzugriff

CLI-Abfragen sind standardmäßig schreibgeschützt. `--write` aktiviert Schreibvorgänge ausdrücklich. Jeweils ein Prozess besitzt ein Graphverzeichnis. Solange die App den Graphen geöffnet hat, werden CLI-Leseabfragen und Dashboard-Prüfungen über dieses Fenster geleitet. Schreibvorgänge und Synchronisierungen erfordern, dass der Graph dort geschlossen ist.
