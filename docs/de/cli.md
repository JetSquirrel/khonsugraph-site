---
description: Die Kommandozeile khonsu gibt bei jedem Befehl JSON aus, sodass Claude Code und andere KI-Agenten einen Graphen prüfen, ihn abfragen, Pfade verfolgen und Dashboards schreiben können.
---
# CLI & KI-Agenten

Die Desktop-App und die CLI verwenden dieselbe ausführbare Datei. Ohne Argumente öffnet `khonsugraph` die App; mit einem Unterbefehl führt sie den Befehl aus und beendet sich. Die Schaltfläche **Kommandozeile & KI** in der Titelleiste (das Roboter-Symbol) installiert `khonsu` im PATH und kann die Skill für Claude Code installieren.

Die [Agent-Skill](https://github.com/JetSquirrel/KhonsuGraph/tree/main/skills/khonsugraph) vermittelt Agenten den schema-orientierten Arbeitsablauf und die unterstützte Cypher-Teilmenge.

## Befehlsreferenz

| Befehl | Zweck |
| --- | --- |
| `khonsu graph init DIR` | Einen leeren Graphen erstellen |
| `khonsu schema --db DIR` | Labels, Beziehungen, Eigenschaften und Tabellen prüfen |
| `khonsu query --db DIR --cypher "…"` | Eine schreibgeschützte Cypher-Anweisung ausführen |
| `khonsu query --db DIR --sql "…"` | Eine schreibgeschützte SQL-Anweisung ausführen |
| `khonsu query --db DIR --file query.cypher` | Eine Abfragedatei ausführen; `.sql` wählt SQL |
| `khonsu query --db DIR --semantic --cypher "…"` | [In den Begriffen der Ontologie abfragen](./ontology#semantic): `Device`, `Account`, `runs_on` |
| `khonsu query --db DIR --validate-only --cypher "…"` | [Eine Anweisung](./ontology#validate) gegen den Graphen prüfen, ohne sie auszuführen |
| `khonsu graph explain --db DIR --cypher "…"` | Eine Abfrage erklären |
| `khonsu graph ontology describe [--db DIR]` | [Konzepte](./ontology) auflisten und welche Labels eines Graphen sie abdecken |
| `khonsu graph ontology resolve WORD…` | Sagen, was Wörter bedeuten: Konzepte, Synonyme und die zugehörigen Labels |
| `khonsu graph ontology check --db DIR --entities a,b` | Ob ein Graph Datensätze zu jedem Gegenstand einer Frage enthält |
| `khonsu graph ontology path --from A --to B [--db DIR]` | Wie zwei Konzepte zusammenhängen, als Cypher-Muster |
| `khonsu graph explore --db DIR --from NODE [--to NODE]` | [Von einem Knoten nach außen gehen](./investigations#explore) und einen Pfad melden |
| `khonsu graph evidence --db DIR --node NODE --rel REL` | [Was einen Datensatz stützt](./investigations#evidence) anzeigen |
| `khonsu graph analyze ALGORITHM --db DIR` | Einen [Graphalgorithmus](./analysis) ausführen: PageRank, Communities, Komponenten und mehr |
| `khonsu investigate save FILE --db DIR --from NODE` | [Eine Untersuchung speichern](./investigations#saved-investigations); `reopen FILE` führt sie erneut aus |
| `khonsu graph snapshot save FILE --db DIR` | Die Datensätze des Graphen aufbewahren; [`snapshot diff A B`](./investigations#snapshots) vergleicht zwei |
| `khonsu graph rebuild --db DIR` | Einen Graphen im alten Format aus seinen Datenquellen neu erstellen |
| `khonsu plugin list` | Plugins und Berechtigungen auflisten |
| `khonsu plugin describe ID` | Konfigurationsfelder und Ausgabetypen eines Plugins anzeigen |
| `khonsu plugin search [WORDS]` | Auflisten, was die [Marketplaces](./marketplace) anbieten |
| `khonsu plugin install ID --yes` | Ein Plugin per Namen aus einem Marketplace installieren und genehmigen |
| `khonsu plugin install DIR --yes` | Ein Plugin-Verzeichnis oder -ZIP installieren und seine Berechtigungen genehmigen |
| `khonsu plugin update` | Aus einem Marketplace installierte Plugins aktualisieren; `--dry-run` zeigt nur eine Vorschau |
| `khonsu plugin marketplace list` | Marketplaces auflisten; `add` und `remove` ändern sie |
| `khonsu plugin sync --source ID` | Eine Quelle synchronisieren; `--dry-run` zeigt eine Vorschau, `--incremental` und `--append` fügen hinzu, ohne zu entfernen |
| `khonsu plugin analyze ID ANALYSIS --db DIR` | Die [Analyse eines Plugins](./investigations#plugin-analyses) ausführen, etwa AWS `exposure` |
| `khonsu source list` | Konfigurierte Quellen auflisten |
| `khonsu source add --db DIR --plugin ID --name NAME -c key=value` | Eine Quelle konfigurieren; `--test` prüft sie zuerst |
| `khonsu source remove ID` | Eine Quelle entfernen |
| `khonsu dash check FILE --db DIR` | Ein Dashboard gegen einen Graphen validieren |
| `khonsu dash comments FILE` | Diagramm-Kommentare auflisten, beantworten und erledigen |
| `khonsu dash presence FILE --doing editing --plot NAME` | Dem Fenster zeigen, welche Diagramme Sie bearbeiten |
| `khonsu open DIR` | Einen Graphen in der Desktop-App öffnen |
| `khonsu open FILE.dash` | Ein Dashboard öffnen |
| `khonsu open --state` | Den Graphen und die Tabs des laufenden Fensters lesen |

`--db` verwendet standardmäßig `KHONSU_DB`, danach den zuletzt in der App geöffneten Graphen. Verwenden Sie in der Automatisierung einen expliziten Pfad. Schreibende Abfragen erfordern `--write`.

## Ausgabe und Fehler

Jeder Befehl gibt ein JSON-Objekt auf stdout aus; `--pretty` rückt es ein. Der Fortschritt der Synchronisierung wird als JSON Lines auf stderr ausgegeben. Abfrageergebnisse enthalten `columns`, `rows`, `row_count`, `truncated` und `elapsed_ms`, zusätzlich `graph`, wenn Knoten oder Beziehungen zurückgegeben werden.

`--max-rows` ist standardmäßig 200 und schneidet das angezeigte Ergebnis ab. Es verringert nicht den Aufwand der Abfrageausführung. Prüfen Sie stets `truncated` und verwenden Sie begrenzte Abfragen.

Fehlschläge enthalten ein `error`-Objekt mit `kind` und `message` sowie optional `detail`. Prüfen Sie den Exit-Status, bevor Sie stdout interpretieren: 1 bedeutet einen Ausführungsfehler; 2 bedeutet einen Fehler in der Nutzung oder in der Dashboard-Spezifikation.

Ab dem Release nach 0.3.0 bedeutet Exit-Status 2 auch eine Abfrage, die [nicht zum Graphen passt](./ontology#validate) (`invalid_query`), 3, dass der Graph keine Datensätze zu einem Gegenstand der Frage enthält (`not_investigable`), und 4, dass ein Mensch bestätigen muss (`needs_confirmation`).

## Die Genehmigung bleibt bei einem Menschen {#approval}

Ab dem Release nach 0.3.0 ist die Genehmigung der Berechtigungen eines Plugins die Entscheidung eines Menschen. Führt ein Agent `khonsu plugin install … --yes`, `plugin update` oder `plugin approve` aus, wird das Plugin installiert oder aktualisiert, aber nicht genehmigt, und der Befehl endet mit 4 und der Art `needs_confirmation` und nennt die Plugins. Bitten Sie den Menschen, sie in der App oder im eigenen Terminal zu genehmigen. Ein Agent wird an `KHONSU_AGENT` oder an den Variablen erkannt, die Claude Code, Codex, Cursor und Gemini CLI setzen.

## Ein Überprüfungszyklus

```sh
khonsu dash comments overview.dash
khonsu dash presence overview.dash --doing editing --plot dependencies
# Die .dash-Datei bearbeiten und anschließend validieren.
khonsu dash check overview.dash --db graphs/demo
# Eine tatsächliche Kommentar-ID verwenden, die der erste Befehl zurückgegeben hat.
khonsu dash comments overview.dash --reply c1 --text "Updated the graph panel" --resolve
khonsu dash presence overview.dash --doing idle
```

Solange die App einen Graphen hält, laufen Leseabfragen, `dash check` und `plugin sync` über das Fenster und geben `via_window: true` zurück. Schreibende Abfragen, `graph explore` und `investigate` benötigen den Graphen frei. Entfernen Sie keine Sperren, um einen Schreibvorgang zu erzwingen. Siehe [Fehlerbehebung](./troubleshooting).
