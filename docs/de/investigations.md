---
description: Verfolgen Sie Pfade durch einen Graphen mit khonsu explore, führen Sie die Belege hinter jedem Datensatz an, speichern Sie eine Untersuchung und prüfen Sie sie nach Datenänderungen erneut.
---
# Untersuchungen

Eine Untersuchung folgt Beziehungen von einem Ausgangspunkt zu einer Antwort: welcher Pfad vom Internet zu dieser Instanz führt, was ein ausfallender Dienst mitreißt, wer hinter einer Firma steht. KhonsuGraph hält vier Dinge getrennt, damit die Antwort später überprüft werden kann: den Pfad, die Belege für jeden Datensatz darauf, die gespeicherte Untersuchung und das, was sich seither im Graphen geändert hat.

Diese Befehle sind in KhonsuGraph 0.3.0 hinzugekommen. Führen Sie `khonsu --version` aus, um Ihren Stand zu sehen.

## Einem Pfad folgen {#explore}

`khonsu explore` geht von einem oder mehreren Knoten nach außen, ohne den ganzen Graphen zu laden. Im Fenster heißt derselbe Durchlauf **Path Explorer** und läuft auf einer Zeichenfläche.

```sh
khonsu explore --db graphs/aws \
  --from shop/cidr:internet \
  --to shop/123456789012:us-east-1:i-web1 \
  --type ROUTES_TO,FORWARDS_TO
```

`--from` und `--to` nehmen eine `khonsu_id` (die stabile ID, die jeder synchronisierte Datensatz trägt) oder eine numerische Knoten-ID. Die IDs oben sind illustrativ und stammen aus einem AWS-Graphen wie in [den Beispielen](./examples#aws-exposure); lesen Sie Ihre eigenen mit einer Abfrage wie `MATCH (c:Cidr) RETURN c.khonsu_id LIMIT 5`.

| Option | Bedeutung | Standard |
| --- | --- | --- |
| `--from NODE` | Ein Startknoten. Für mehrere wiederholen | Erforderlich |
| `--to NODE` | Meldet unter den Ergebnissen des Durchlaufs einen Pfad mit den wenigsten Sprüngen zu diesem Knoten | Keine |
| `--direction out\|in\|both` | Entlang der Pfeile, gegen sie oder beides | `out` |
| `--type A,B` | Nur diesen Beziehungstypen folgen | Jeder Typ |
| `--max-hops N` | Schritte von einem Start, höchstens 16 | 3 |
| `--max-nodes N` | Zurückgegebene Knoten, höchstens 2.000 | 200 |
| `--max-edges N` | Zurückgegebene Beziehungen, höchstens 5.000 | 500 |

Jeder Sprung in der Ausgabe hat einen `text` wie `Internet -[ROUTES_TO]-> shop`. Lesen Sie zuerst `complete`. Steht dort false, benennt `limits` die Obergrenze, die den Durchlauf abgeschnitten hat; ein fehlender Pfad bedeutet dann „nicht innerhalb dieser Obergrenzen“, nicht „kein Pfad“. Ein Wert über einer Obergrenze wird abgelehnt statt abgesenkt.

Ein Pfad ist ein Kandidat, der in den Daten gefunden wurde. Er ist kein Beweis dafür, dass etwas erreichbar ist, und das Fehlen eines Pfades ist kein Beweis für Sicherheit.

## Belege {#evidence}

`khonsu evidence` sagt, was einen Knoten oder eine Beziehung stützt: welche Quelle und welches Plugin den Datensatz geschrieben haben, wann er sich zuletzt geändert hat und ob die letzte Synchronisierung dieser Quelle vollständig war.

```sh
khonsu evidence --db graphs/aws --node shop/123456789012:us-east-1:i-web1
```

| Feld | Bedeutung |
| --- | --- |
| `evidence_id` | `node:<khonsu_id>` oder `rel:<khonsu_id>`. Führen Sie diese an, wenn Sie einen Befund berichten |
| `source`, `plugin` | Was den Datensatz geschrieben hat |
| `record_written_at` | Wann sich der Datensatz zuletzt geändert hat, nicht wann er zuletzt gesehen wurde |
| `source_last_successful_sync` | Unbekannt, wenn die letzte Synchronisierung der Quelle fehlgeschlagen ist |
| `source_coverage` | Der letzte Lauf der Quelle: `complete`, `partial`, `failed` oder `cancelled`, und etwaige Lücken |
| `assertion` | `explicit` (eine Quelle hat es gemeldet), `derived` oder `unknown` |
| `properties`, `redacted` | Die eigenen Eigenschaften des Datensatzes und die als mögliche Geheimnisse maskierten Namen |

Ein Herkunftsfeld ist entweder mit einem Wert bekannt oder ausdrücklich unbekannt; nichts wird geschätzt. Mit `--to` ergänzt `khonsu explore` `path.evidence`, einen abgeleiteten Datensatz, der die Beleg-IDs auflistet, auf denen der Pfad beruht.

Wie stark eine Beziehung bekannt ist, ist eine Konvention in ihren eigenen Eigenschaften. `confidence` ist `confirmed`, `inferred` oder `unconfirmed`, und `evidence` sagt, was sie gezeigt hat. Ein Pfad ist so stark wie sein schwächster Sprung: Eine `unconfirmed`-Beziehung macht den Pfad unbestätigt.

## Plugin-Analysen {#plugin-analyses}

Ein Plugin kann Regeln für seine eigene Domäne mitbringen. `khonsu plugin describe ID` listet sie auf, und `khonsu plugin analyze` führt eine aus:

```sh
khonsu plugin analyze aws exposure --db graphs/aws --verdict potential-exposure --pretty
```

Die AWS-Analyse `exposure` gibt Befunde mit einem Urteil `potential_exposure`, `insufficient_data` oder `not_indicated` zurück. Jeder Befund nennt seine Regel, die geprüften Bedingungen mit den dahinterliegenden Feldern, was er nicht bewerten konnte (`unknowns`), was die Regel nicht liest (`assumptions`) und einen `walk`, den Sie an `khonsu explore` übergeben können. Ein Befund beschreibt eine Konfiguration. Er sagt nicht, dass eine Ressource erreichbar oder sicher ist.

## Gespeicherte Untersuchungen {#saved-investigations}

Eine gespeicherte Untersuchung bewahrt die Startpunkte und Filter eines Durchlaufs, den gewählten Pfad, eine Abfrage und ein Dashboard in einer eigenen Datei auf. Das Speichern schreibt nichts in den Graphen.

```sh
khonsu investigation save web.investigation --db graphs/aws \
  --from shop/cidr:internet --to shop/123456789012:us-east-1:i-web1 \
  --type ROUTES_TO,FORWARDS_TO --max-hops 4
khonsu investigation reopen web.investigation
```

Erneutes Öffnen führt den Durchlauf auf dem Graphen in seinem jetzigen Zustand erneut aus und sagt, wie sich das vom Zeitpunkt des Speicherns unterscheidet. Lesen Sie zuerst `graph_state`:

| `graph_state` | Bedeutung |
| --- | --- |
| `unchanged` | Der Graph enthält, was er beim Speichern enthielt |
| `changed` | Etwas unterscheidet sich. `differences` gibt an, was es kann, und ist keine vollständige Liste |
| `not_compared` | Der Graph enthält über 200.000 Knoten oder Beziehungen, wurde daher nicht gehasht, und die Anzahlen stimmen überein |

Eine geänderte Antwort ersetzt die gespeicherte nie stillschweigend. `path_same` sagt, ob der Pfad noch auf denselben Datensätzen beruht. `missing_seeds` und `target_missing` benennen gespeicherte Datensätze, die verschwunden sind. `unsure` listet Datensätze, die auf einem geänderten Graphen nur über eine interne ID gefunden wurden. `incomplete_sources` benennt Quellen, deren letzte Synchronisierung nicht vollständig war.

Eine erneute Synchronisierung, die nichts ändert, hinterlässt den Graphen `unchanged`: Der Vergleich umfasst Labels, Typen, Enden und Eigenschaften und lässt interne IDs und Synchronisierungszeiten aus.

Die Datei ist JSON. Sie enthält den Pfad des Graphen, IDs der Datenquellen, stabile Datensatz-IDs und Filter. Sie enthält nie Quellkonfiguration oder Anmeldedaten. Der Pfad des Graphen kann einen Benutzernamen enthalten, prüfen Sie ihn daher, bevor Sie eine Datei weitergeben.

## Snapshots und Diff {#snapshots}

Ein Snapshot bewahrt die Datensätze eines Graphen nach stabiler ID in einer Datei auf, sodass Sie später fragen können, was sich geändert hat. Snapshots werden von Hand erstellt; beim Ausführen einer Synchronisierung wird keiner erstellt.

```sh
khonsu snapshot save monday.snapshot.json --db graphs/aws
khonsu plugin sync --source shop
khonsu snapshot save tuesday.snapshot.json --db graphs/aws
khonsu snapshot diff monday.snapshot.json tuesday.snapshot.json --pretty
khonsu snapshot check monday.snapshot.json --db graphs/aws
```

| Liste | Bedeutung |
| --- | --- |
| `added` | Nur im späteren Snapshot |
| `removed` | Verschwunden, und die letzte Synchronisierung der Quelle war im späteren Snapshot vollständig |
| `not_seen` | Fehlt im späteren Snapshot, ohne Anhaltspunkt, dass die Quelle vollständig gelesen wurde. Der Datensatz kann noch existieren |
| `changed` | Dieselbe stabile ID mit anderen Eigenschaften, Labels oder Enden |

Ein Datensatz ist nur dann `removed`, wenn der spätere Snapshot das belegen kann. Nach einer teilweisen oder fehlgeschlagenen Synchronisierung bleibt er in `not_seen`, und `warnings` sagt, warum.

Ein Snapshot enthält weder den Pfad des Graphen noch Quellkonfiguration oder Anmeldedaten, und alles, was wie ein Geheimnis aussieht, wird maskiert. Er enthält aber die übrigen Eigenschaften Ihrer Daten, behandeln Sie die Datei daher wie den Graphen.

## Im Fenster

Wählen Sie einen Knoten auf einer Zeichenfläche und verwenden Sie **Path Explorer**, um von ihm aus weiterzugehen. **Save investigation…** behält die aktuellen Filter, die Startpunkte des letzten Durchlaufs, den Pfad zum ausgewählten Knoten und die Abfrage des Tabs. **Graph > Open investigation…** oder `khonsu open web.investigation` öffnet eine Untersuchung in einem neuen Tab. Alles, was vom Zeitpunkt des Speicherns abweicht, erscheint als Warnung auf der Zeichenfläche.

## Grenzen

- `khonsu explore` und `khonsu investigation` benötigen den Graphen frei. Sie schlagen mit der Art `locked` fehl, solange das Fenster ihn geöffnet hat; verwenden Sie stattdessen Path Explorer im Fenster.
- Ein Graph mit über 200.000 Knoten oder Beziehungen kann nicht als Snapshot gespeichert werden und schlägt mit der Art `too_large` fehl.
- Von Hand geschriebene Datensätze haben keine stabile ID. Sie werden gezählt, aber in einem Diff nicht verglichen.
- Das Fenster hat noch keine Ansicht für Snapshots oder Diffs.

Die [CLI-Referenz](./cli) listet jeden Befehl auf. Für Zentralität, Communities und kürzeste Pfade über den ganzen Graphen siehe [Graphanalyse](./analysis).
