---
description: Schreiben Sie Graph-Dashboards als reine Textdateien im .dash-Format und überprüfen Sie sie mit einem Agenten.
---
# Dashboards

Eine `.dash`-Datei ist reiner Text: benannte Abfragen, Diagramme und Filter. Sie liest den Graphen, der aktuell in der App geöffnet ist. Daten werden separat über Plugins importiert; es gibt keinen `source`-Block.

## Ihr erstes Graph-Panel

Nachdem Sie [Erste Schritte](./getting-started) abgeschlossen haben, speichern Sie dies als `overview.dash`:

```hcl
query "dependencies" {
  cypher = "MATCH (a:Host)-[r:DEPENDS_ON]->(b:Host) RETURN a, r, b"
}

plot "dependencies" {
  type = "graph"
  query = query.dependencies
  caption = name
  width = 12
}
```

```sh
khonsu check overview.dash --db graphs/demo
khonsu open graphs/demo
khonsu open overview.dash
```

`check` führt jede Abfrage schreibgeschützt aus, validiert die Spalten der Diagramme und probiert Filter mit tatsächlichen Werten aus. Beheben Sie jeden gemeldeten Fehler, bevor Sie das Dashboard öffnen oder teilen.

## Diagramme und Layout

Zu den Diagrammtypen gehören `table`, `bar`, `line`, `area`, `scatter`, `pie`, `map`, `card`, `text` und `graph`. `width` umfasst 1–12 Spalten. Graph-Abfragen geben ganze Knoten und Beziehungen zurück; `caption` wählt die Knoteneigenschaft aus, die als Label angezeigt wird. `group` kann Knoten nach einer Eigenschaft gruppieren.

## Gemeinsame Filter

Eine Tabellenzeile, ein Balken oder ein Graphknoten kann einen Filter steuern. In diesem Beispiel gibt eine Tabellenabfrage `service` zurück, und eine andere Abfrage verwendet `WHERE $service`:

```hcl
filter "service" {
  plot = plot.services
  column = service
  match = "s.name"
}
```

Der Platzhalter muss eine vollständige `WHERE`-Bedingung sein, optional durch `AND` verknüpft. In Cypher wird der ausgewählte Wert mit dem Ausdruck `match` verglichen; in SQL wird er mit der Spalte selbst verglichen, sodass `match` nicht benötigt wird. Eine nicht ausgewählte Bedingung wird entfernt; das Ursprungsdiagramm filtert sich nicht selbst. Die vollständigen [Beispiele im Repository](./examples) enthalten diese verknüpften Abfragen und Diagramme.

## Mit einem Agenten überprüfen

Kommentieren Sie ein Diagramm in der App. Ein Agent liest die Kommentare, bearbeitet die Datei, führt `check` aus und antwortet. Kommentare liegen neben dem Dashboard in `FILE.comments.json`. Mithilfe der Präsenz lässt sich erkennen, welche Diagramme der Agent gerade bearbeitet, und das Fenster zeichnet neu, wenn sich die Datei ändert.

```sh
khonsu comments overview.dash
khonsu presence overview.dash --doing editing --plot dependencies
khonsu check overview.dash --db graphs/demo
khonsu presence overview.dash --doing idle
```

Das Format kennt keine beliebigen Funktionen, Bedingungen oder datenabhängige Gestaltung. Die Befehle für die Überprüfung finden Sie unter [CLI & Agenten](./cli).
