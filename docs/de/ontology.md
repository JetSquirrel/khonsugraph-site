---
description: Mit Ontologie- und Mapping-Dateien festhalten, was die Labels eines Graphen bedeuten, prüfen, ob ein Graph eine Frage beantworten kann, herausfinden, wie Konzepte zusammenhängen, und in den Begriffen der Ontologie abfragen.
---
# Ontologie

Die Labels eines Graphen sagen, woher Datensätze kommen: `Host`, `EntraUser`, `WazuhAgent`. Die Ontologie sagt, was sie sind: ein `Device`, ein `Account`. Damit lässt sich eine Frage in denselben Begriffen stellen, egal aus welchen Quellen der Graph gebaut wurde, und Sie oder ein KI-Agent können vor dem Schreiben einer Abfrage herausfinden, ob ein Graph sie beantworten kann.

::: info Im nächsten Release
Die Ontologie-Befehle, `--semantic` und `--validate-only` kommen mit dem Release nach 0.3.0.
:::

Die Ontologie liegt in Dateien, nie im Graphen. Ein Graph enthält, was seine Datenquellen geschrieben haben, und [`khonsu graph rebuild`](./troubleshooting#old-format) baut ihn aus ihnen neu auf; was nur im Graphen stünde, ginge verloren.

## Konzepte und Mappings {#files}

**Eine Ontologie-Datei** (`*.ontology.json`) deklariert Konzepte und die zwischen ihnen erlaubten Beziehungen:

```json
{
  "format": "khonsu-ontology",
  "version": 1,
  "id": "attack",
  "revision": "0.1.0",
  "concepts": [
    { "name": "Technique", "description": "An ATT&CK technique.", "synonyms": ["ttp"] }
  ],
  "relationships": [
    { "name": "indicates", "from": "Entity", "to": "Technique" }
  ]
}
```

Ein Konzept kann andere erweitern (`extends`), und eine Beziehung gilt für alles, was ihre Enden erweitert: `holds` von `Agent` zu `Account` verbindet auch eine `Person` mit einem `Account`.

**Eine Mapping-Datei** (`*.mapping.json`) sagt, was die Labels und Beziehungstypen eines Graphen sind:

```json
{
  "format": "khonsu-mapping",
  "version": 1,
  "id": "security-example",
  "revision": "1",
  "status": "draft",
  "labels": [{ "label": "Host", "concept": "Device" }],
  "relationship_types": [{ "type": "RAN_ON", "relationship": "runs_on" }]
}
```

Alles ist `draft`, bis ein Mensch es prüft und `"status": "certified"` setzt. Antworten führen unter `drafts` die Entwürfe auf, auf denen sie beruhen.

## Woher die Bibliothek kommt {#library}

In dieser Reihenfolge, wobei die erste Kopie einer ID gewinnt:

1. **Eingebaut**: etwa zwanzig Konzepte, die jede Untersuchung teilt, etwa `Person`, `Organization`, `Account`, `Device`, `Process`, `IPAddress`, `Domain`, `Event` und `Observation`, und die Beziehungen zwischen ihnen.
2. `ontology/` im Konfigurationsordner von KhonsuGraph.
3. `ontology/` im Ordner jedes installierten Plugins, sodass ein Plugin die Bedeutung der Labels mitliefert, die es schreibt.
4. Jedes übergebene `--ontology PATH`, eine Datei oder ein Ordner.

Eine unbrauchbare Datei wird unter `problems` gemeldet und ausgelassen; der Rest wird trotzdem geladen. Das Sicherheitsbeispiel im Repository enthält ein [ATT&CK-Paket und ein Mapping](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples/security/ontology).

## Vor der Abfrage fragen {#commands}

```sh
khonsu graph ontology describe --db graphs/sec            # was gemappt ist und was nicht
khonsu graph ontology resolve machine login ip            # was Wörter bedeuten
khonsu graph ontology check --db graphs/sec --entities account,device,ip
khonsu graph ontology path --from Account --to Device --db graphs/sec
```

- **describe** listet die Konzepte und Beziehungen, oder mit `--concept` ein Konzept vollständig. Mit `--db` vergleicht es die Bibliothek mit dem Graphen: gemappte Labels (mit Anzahl), nicht gemappte Labels und Beziehungstypen sowie gemappte, aber fehlende Labels.
- **resolve** sagt, was jedes Wort bedeutet: ein Konzept oder eine Beziehung nach Name oder Synonym, oder ein Label, dem ein Mapping eine Bedeutung gibt. Ein Wort ohne Bedeutung erhält `suggestions`.
- **check** sagt, ob der Graph Datensätze zu jedem Gegenstand einer Frage enthält. Ein Begriff steht als `unknown_term`, `no_mapping` oder `not_in_graph` unter `missing`, und der Befehl endet dann mit **3** und der Art `not_investigable`.
- **path** liefert die Wege mit den wenigsten Schritten von einem Konzept zum anderen: über die deklarierten Beziehungen und mit `--db` über die Muster, die der Graph tatsächlich enthält, jeweils als Cypher-`pattern`, bereit für `MATCH`. Ein Weg zeigt, wie die Daten zusammenhängen, nicht, dass entlang des Weges etwas geschehen ist.

Jede Antwort enthält `ontology_versions`: die verwendeten Dateien mit ID, Revision und Herkunft.

## In den Begriffen der Ontologie abfragen {#semantic}

```sh
khonsu query --db graphs/sec --semantic --cypher \
  "MATCH (t:Technique)<-[:indicates]-(p:Process)-[:runs_on]->(d:Device) RETURN t.name, d.name"
```

Mit `--semantic` wird ein als Label verwendetes Konzept zu allen Labels dieses Graphen, die auf das Konzept oder seine Erweiterungen gemappt sind, und eine Beziehung zu den auf sie gemappten Typen: `(d:Device)` wird zu `(d:Host:Server)` und `[:runs_on]` zu `[:EXEC_ON|RAN_ON]`. Labels, die der Graph bereits hat, bleiben unverändert. Ein Konzept, das im Graphen nichts trägt, endet mit 3, statt keine Zeilen zurückzugeben. Das Ergebnis enthält `semantic` mit der ausgeführten Anweisung, jeder Ersetzung und den verwendeten Entwürfen. Eine semantische Abfrage liest nur.

## Eine Abfrage prüfen, ohne sie auszuführen {#validate}

```sh
khonsu query --db graphs/sec --validate-only --cypher "MATCH (h:Host)-[:RAN_ON]->(p:Process) RETURN p"
```

`--validate-only` prüft eine Anweisung gegen den Graphen und führt nichts aus; `--semantic` führt dieselbe Prüfung vor jeder Abfrage durch.

| Art | Schwere | Bedeutung |
| --- | --- | --- |
| `unknown_label`, `unknown_type` | Fehler | Der Graph hat kein solches Label und keinen solchen Beziehungstyp; `suggestions` nennt ähnliche Namen |
| `wrong_direction` | Fehler | Der Graph enthält das Muster nur in umgekehrter Richtung |
| `no_such_pattern` | Fehler | Der Graph enthält das Muster in keiner Richtung |
| `unbounded` | Warnung | Ein Muster variabler Länge ohne Obergrenze |
| `cartesian` | Warnung | Teile eines `MATCH` teilen keine Variable, sodass jedes Paar ihrer Zeilen zurückkommt |

Ein Fehler endet mit 2, der Art `invalid_query` und den Problemen unter `error.detail`; Warnungen werden gemeldet, und die Anweisung läuft. Die vollständige Referenz steht im [Quell-Repository](https://github.com/JetSquirrel/KhonsuGraph/blob/main/docs/ontology.md).
