---
description: Führen Sie PageRank, Betweenness, Louvain-Communities, Zusammenhangskomponenten, k-Core und kürzeste Pfade auf einem lokalen Graphen mit khonsu analyze aus.
---
# Graphenanalyse

Eine Cypher-Abfrage beantwortet Fragen zu benannten Mustern. `khonsu analyze` beantwortet Fragen zur Gestalt des Graphen: Welcher Knoten ist am zentralsten, welche Gruppen bilden sich, wie hängen zwei Knoten zusammen. Die Berechnung erfolgt im Arbeitsspeicher und folgt den Definitionen von networkx, sodass die Ergebnisse auf demselben Graphen mit networkx übereinstimmen.

```sh
khonsu analyze summary --db graphs/audit
khonsu analyze pagerank --db graphs/audit --type TRUSTS --top 10
khonsu analyze communities --db graphs/investigation
```

Beginnen Sie bei einem unbekannten Graphen mit `summary`.

## Algorithmen

| Befehl | Beantwortet | Optionen |
| --- | --- | --- |
| `summary` | Größe, Dichte, Komponenten, Clustering, größter Kern und Durchmesser | |
| `degree` | Welche Knoten die meisten Beziehungen haben | `--top N` |
| `pagerank` | Auf welche Knoten der übrige Graph zeigt | `--alpha 0.85`, `--weight PROP` |
| `betweenness` | Welche Knoten auf den meisten kürzesten Pfaden liegen | `--sample K` |
| `closeness` | Welche Knoten am wenigsten Sprünge von allem anderen entfernt sind | `--undirected` |
| `components` | Welche Teile des Graphen getrennt sind | `--strong` |
| `communities` | Welche Gruppen dicht verbunden sind (Louvain) | `--resolution 1.0`, `--seed 42` |
| `clustering` | Wie oft die Nachbarn eines Knotens einander kennen | |
| `kcore` | Den dicht verbundenen Kern des Graphen | |
| `path` | Den kürzesten Pfad zwischen zwei Knoten | `--from ID --to ID` |

`path` nimmt numerische Knoten-IDs: Geben Sie `id(n)` aus einer Abfrage zurück oder lesen Sie `_id` in einem Ergebnis.

## Den Teilgraphen wählen

Standardmäßig liest ein Algorithmus den ganzen Graphen. Verengen Sie ihn auf drei Arten:

```sh
khonsu analyze betweenness --db graphs/sre --label Service
khonsu analyze pagerank --db graphs/audit --type TRUSTS
khonsu analyze pagerank --db graphs/security \
  --cypher "MATCH (a:Process)-[r:SPAWNED]->(b:Process) RETURN a, r, b"
```

- `--label` behält Knoten mit diesen Labels und die Beziehungen zwischen ihnen.
- `--type` behält diese Beziehungen und, ohne `--label`, nur die Knoten, die sie verbinden.
- `--cypher` analysiert genau die Knoten und Beziehungen, die eine Abfrage vollständig zurückgibt.

Beziehungen sind gerichtet, sofern Sie nicht `--undirected` übergeben. Clustering, Kerne und Communities lesen sie immer in beide Richtungen. `--weight PROP` liest eine numerische Beziehungseigenschaft als Gewicht für PageRank oder als Länge für Pfade, Betweenness und Closeness. Ein fehlender Wert zählt als 1.

## Ausgabe

Jeder Lauf gibt ein JSON-Objekt mit `algorithm`, dem gelesenen `graph` (`nodes`, `relationships`, `directed`, `weighted`), `load_ms`, `elapsed_ms` und `rows` aus.

Knotenzeilen sind `{id, labels, name, <score>}`, die besten zuerst, begrenzt durch `--top`. `components` und `communities` geben Gruppen mit ihrer `size` und den ersten zehn `members` zurück; Communities ergänzen `modularity`. `path` gibt `found`, `hops`, `length` und die Knoten des Pfades zurück.

Betweenness ist bis 5.000 Knoten exakt und wird darüber aus 500 Quellen als Stichprobe berechnet. `sampled_sources` ist null, wenn das Ergebnis exakt ist; weisen Sie darauf hin, wenn Sie ein Ergebnis aus einer Stichprobe berichten.

## Analyse oder Cypher?

Cypher bietet `shortestPath` und `allShortestPaths` zwischen zwei gebundenen Knoten; siehe [Cypher & SQL](./queries). Verwenden Sie `khonsu analyze path`, wenn der Pfad ein Gewicht berücksichtigen soll, und die anderen Algorithmen, wenn die Frage den ganzen Graphen betrifft statt eines Musters. Um von einem Knoten mit Obergrenzen für Sprünge und Größe nach außen zu gehen, verwenden Sie [`khonsu explore`](./investigations#explore).
