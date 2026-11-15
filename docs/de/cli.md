---
description: Die Kommandozeile khonsu gibt bei jedem Befehl JSON aus, sodass Claude Code und andere KI-Agenten einen Graphen prüfen, ihn abfragen, Pfade verfolgen und Dashboards schreiben können.
---
# CLI & KI-Agenten

Die Desktop-App und die CLI verwenden dieselbe ausführbare Datei. Ohne Argumente öffnet `khonsugraph` die App; mit einem Unterbefehl führt sie den Befehl aus und beendet sich. Die Schaltfläche **Kommandozeile & KI** in der Titelleiste (das Roboter-Symbol) installiert `khonsu` im PATH und kann die Skill für Claude Code installieren.

Die [Agent-Skill](https://github.com/JetSquirrel/KhonsuGraph/tree/main/skills/khonsugraph) vermittelt Agenten den schema-orientierten Arbeitsablauf und die unterstützte Cypher-Teilmenge.

## Befehlsreferenz

| Befehl | Zweck |
| --- | --- |
| `khonsu init DIR` | Einen leeren Graphen erstellen |
| `khonsu schema --db DIR` | Labels, Beziehungen, Eigenschaften und Tabellen prüfen |
| `khonsu query --db DIR --cypher "…"` | Eine schreibgeschützte Cypher-Anweisung ausführen |
| `khonsu query --db DIR --sql "…"` | Eine schreibgeschützte SQL-Anweisung ausführen |
| `khonsu query --db DIR --file query.cypher` | Eine Abfragedatei ausführen; `.sql` wählt SQL |
| `khonsu explain --db DIR --cypher "…"` | Eine Abfrage erklären |
| `khonsu explore --db DIR --from NODE [--to NODE]` | [Von einem Knoten nach außen gehen](./investigations#explore) und einen Pfad melden |
| `khonsu evidence --db DIR --node NODE --rel REL` | [Was einen Datensatz stützt](./investigations#evidence) anzeigen |
| `khonsu analyze ALGORITHM --db DIR` | Einen [Graphalgorithmus](./analysis) ausführen: PageRank, Communities, Komponenten und mehr |
| `khonsu investigation save FILE --db DIR --from NODE` | [Eine Untersuchung speichern](./investigations#saved-investigations); `reopen FILE` führt sie erneut aus |
| `khonsu snapshot save FILE --db DIR` | Die Datensätze des Graphen aufbewahren; [`snapshot diff A B`](./investigations#snapshots) vergleicht zwei |
| `khonsu rebuild --db DIR` | Einen Graphen im alten Format aus seinen Datenquellen neu erstellen |
| `khonsu plugin list` | Plugins und Berechtigungen auflisten |
| `khonsu plugin describe ID` | Konfigurationsfelder und Ausgabetypen eines Plugins anzeigen |
| `khonsu plugin install DIR --yes` | Ein Plugin-Verzeichnis oder -ZIP installieren und seine Berechtigungen genehmigen |
| `khonsu plugin sync --source ID` | Eine Quelle synchronisieren; `--dry-run` zeigt eine Vorschau, `--incremental` und `--append` fügen hinzu, ohne zu entfernen |
| `khonsu plugin analyze ID ANALYSIS --db DIR` | Die [Analyse eines Plugins](./investigations#plugin-analyses) ausführen, etwa AWS `exposure` |
| `khonsu source list` | Konfigurierte Quellen auflisten |
| `khonsu source add --db DIR --plugin ID --name NAME -c key=value` | Eine Quelle konfigurieren; `--test` prüft sie zuerst |
| `khonsu source remove ID` | Eine Quelle entfernen |
| `khonsu check FILE --db DIR` | Ein Dashboard gegen einen Graphen validieren |
| `khonsu comments FILE` | Diagramm-Kommentare auflisten, beantworten und erledigen |
| `khonsu presence FILE --doing editing --plot NAME` | Dem Fenster zeigen, welche Diagramme Sie bearbeiten |
| `khonsu open DIR` | Einen Graphen in der Desktop-App öffnen |
| `khonsu open FILE.dash` | Ein Dashboard öffnen |
| `khonsu open --state` | Den Graphen und die Tabs des laufenden Fensters lesen |

`--db` verwendet standardmäßig `KHONSU_DB`, danach den zuletzt in der App geöffneten Graphen. Verwenden Sie in der Automatisierung einen expliziten Pfad. Schreibende Abfragen erfordern `--write`.

## Ausgabe und Fehler

Jeder Befehl gibt ein JSON-Objekt auf stdout aus; `--pretty` rückt es ein. Der Fortschritt der Synchronisierung wird als JSON Lines auf stderr ausgegeben. Abfrageergebnisse enthalten `columns`, `rows`, `row_count`, `truncated` und `elapsed_ms`, zusätzlich `graph`, wenn Knoten oder Beziehungen zurückgegeben werden.

`--max-rows` ist standardmäßig 200 und schneidet das angezeigte Ergebnis ab. Es verringert nicht den Aufwand der Abfrageausführung. Prüfen Sie stets `truncated` und verwenden Sie begrenzte Abfragen.

Fehlschläge enthalten ein `error`-Objekt mit `kind` und `message` sowie optional `detail`. Prüfen Sie den Exit-Status, bevor Sie stdout interpretieren: 1 bedeutet einen Ausführungsfehler; 2 bedeutet einen Fehler in der Nutzung oder in der Dashboard-Spezifikation.

## Ein Überprüfungszyklus

```sh
khonsu comments overview.dash
khonsu presence overview.dash --doing editing --plot dependencies
# Die .dash-Datei bearbeiten und anschließend validieren.
khonsu check overview.dash --db graphs/demo
# Eine tatsächliche Kommentar-ID verwenden, die der erste Befehl zurückgegeben hat.
khonsu comments overview.dash --reply c1 --text "Updated the graph panel" --resolve
khonsu presence overview.dash --doing idle
```

Solange die App einen Graphen hält, laufen Leseabfragen, `check` und `plugin sync` über das Fenster und geben `via_window: true` zurück. Schreibende Abfragen, `explore` und `investigation` benötigen den Graphen frei. Entfernen Sie keine Sperren, um einen Schreibvorgang zu erzwingen. Siehe [Fehlerbehebung](./troubleshooting).
