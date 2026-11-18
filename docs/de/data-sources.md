---
description: Wandeln Sie CSV-Dateien, AWS-Konten sowie Neo4j- oder Cartography-Datenbanken mit Datenquellen-Plugins in einen lokalen Graphen aus Knoten und Beziehungen um.
---
# Datenquellen

Plugins verwandeln ein externes System in Knoten und Beziehungen. KhonsuGraph führt das Plugin als separaten Prozess aus und schreibt die Datensätze in den Graphen.

## CSV

Das integrierte CSV-Plugin ordnet Zeilen Knoten und Beziehungen zu. Wählen Sie stabile Spalten für ID, Quelle und Ziel; andere Spalten werden zu Eigenschaften. Numerische und boolesche Werte werden standardmäßig abgeleitet. Setzen Sie `infer_types=false`, um Text beizubehalten.

Den vollständigen Import finden Sie unter [Erste Schritte](./getting-started). Für gemischte Knoten-Labels oder Beziehungstypen verwenden Sie die JSON-Konfiguration `nodes` und `edges`. Pfade in diesem JSON müssen absolut sein: Das Plugin läuft aus seinem eigenen Ordner, und nur die Felder für einzelne Dateien werden für Sie in absolute Pfade umgewandelt.

```sh
khonsu plugin describe csv
khonsu source add --db graphs/demo --plugin csv --name mixed \
  -c 'nodes=[{"path":"'"$PWD"'/nodes.csv","label_column":"label","id_column":"id"}]' \
  -c 'edges=[{"path":"'"$PWD"'/edges.csv","type_column":"type","source_column":"source","target_column":"target","id_column":"id"}]'
```

## AWS

Ab dem Release nach 0.3.0 wird das AWS-Plugin aus dem [Marketplace](./marketplace) installiert, statt mit der App ausgeliefert zu werden: `khonsu plugin install aws --yes`. In 0.3.0 wird es mit der App ausgeliefert.

Das AWS-Plugin verwendet die AWS CLI, um VPCs, Subnetze, Sicherheitsgruppen, Instanzen, Load Balancer und IAM-Rollen zu lesen. Installieren und konfigurieren Sie zuerst die AWS CLI und verwenden Sie dann ein schreibgeschütztes Profil, das Sie kontrollieren. `regions` ist eine durch Kommas getrennte Liste, etwa `us-east-1,eu-west-1`.

```sh
khonsu graph init graphs/aws
khonsu plugin install aws --yes
khonsu plugin describe aws
khonsu source add --db graphs/aws --plugin aws --name aws-demo \
  -c profile=readonly -c regions=us-east-1 --test
khonsu plugin sync --source aws-demo --dry-run
khonsu plugin sync --source aws-demo
```

Dies greift auf das konfigurierte AWS-Konto zu. Für einen Offline-Durchlauf verwenden Sie stattdessen die gespeicherten Antworten im Repository [khonsugraph-marketplace](https://github.com/JetSquirrel/khonsugraph-marketplace); siehe [Beispiele](./examples).

Das <a href="/docs/samples/exposure.dash" download>AWS-Exposure-Dashboard</a> verfolgt `Cidr → SecurityGroup ← Instance → Role` anhand der Beziehungen, die dieses Plugin importiert.

## Neo4j und Cartography {#neo4j}

Ab dem Release nach 0.3.0 wird das Neo4j-Plugin aus dem [Marketplace](./marketplace) installiert, statt mit der App ausgeliefert zu werden: `khonsu plugin install neo4j --yes`. In 0.3.0 wird es mit der App ausgeliefert.

Das Neo4j-Plugin, in 0.3.0 hinzugekommen, kopiert die Knoten und Beziehungen einer Neo4j-Datenbank über die HTTP-API von Neo4j in einen lokalen Graphen. Es sendet ausschließlich Leseabfragen. Sein wichtigster Anwendungsfall ist [Cartography](https://github.com/cartography-cncf/cartography), das AWS, GCP, Azure, Kubernetes, GitHub, Okta und mehr in Neo4j zusammenführt; jede Neo4j-Datenbank funktioniert.

```sh
khonsu graph init graphs/infra
khonsu plugin install neo4j --yes
khonsu source add --db graphs/infra --plugin neo4j --name infra \
  -c url=http://127.0.0.1:7474 -c password=... --test
khonsu plugin sync --source infra
```

Die Adresse ist die HTTP-Adresse von Neo4j, standardmäßig 7474, nicht `bolt://`. Das Passwort wird im Systemschlüsselbund aufbewahrt, und eine Rolle mit Lesezugriff genügt.

HawDB hat ein Label pro Knoten, daher übernimmt jeder Knoten eines seiner Neo4j-Labels, meist das seltenste, und behält alle in `neo4j_labels`. Wenn `MATCH (p:AWSPrincipal)` nichts zurückgibt, versuchen Sie `MATCH (p) WHERE 'AWSPrincipal' IN p.neo4j_labels`. Für Neo4j geschriebene Abfragen müssen möglicherweise angepasst werden; siehe [Abfrageeinschränkungen](./queries#current-limitations) und die [README des Plugins](https://github.com/JetSquirrel/khonsugraph-marketplace/tree/main/plugins/neo4j).

## Semantik der Synchronisierung {#sync-semantics}

- Stabile IDs sorgen dafür, dass wiederholte Importe vorhandene Datensätze aktualisieren.
- Eine vollständige Synchronisierung entfernt zuvor von dieser Quelle importierte Datensätze, die im neuen Ergebnis fehlen.
- Eine inkrementelle Synchronisierung fügt Datensätze nur hinzu oder aktualisiert sie, sofern das Plugin dies unterstützt. `--append` bewirkt dasselbe für jede Quelle: Verwenden Sie es, wenn die Dateien nur das enthalten, was seit der letzten Synchronisierung neu ist.
- Ein unveränderter Datensatz wird nicht erneut geschrieben, daher zählen `nodes_written` und `edges_written` im Synchronisierungsbericht nur Änderungen.
- Eine fehlgeschlagene Synchronisierung kann bereits geschriebene Datensätze beibehalten. Die nächste erfolgreiche Synchronisierung gleicht sie ab.
- Eine Beziehung mit einem unbekannten Endpunkt wird übersprungen und in `skipped_edges` gezählt.

Importierte Datensätze enthalten `khonsu_id`, `khonsu_source`, `khonsu_plugin` und `khonsu_synced_at`; [Belege](./investigations#evidence) lesen sie wieder aus. Solange die App den Graphen geöffnet hat, läuft `khonsu plugin sync` über das Fenster, das den Fortschritt anzeigt und seine geöffneten Dashboards erneut ausführt. Schreibende Abfragen erfordern, dass der Graph dort geschlossen ist.

## Andere Systeme

Installieren Sie ein Plugin erst, nachdem Sie seine Berechtigungen geprüft haben. Berechtigungen sind Deklarationen, keine Betriebssystem-Sandbox. Vertrauliche Konfigurationsfelder werden im Systemschlüsselbund gespeichert. Siehe [Plugin-Entwicklung](./plugins).
