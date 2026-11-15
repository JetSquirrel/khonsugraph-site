---
description: Installieren Sie KhonsuGraph, erstellen Sie einen Graphen und importieren Sie ein kleines CSV-Beispiel.
---
# Erste Schritte

## Installieren

Verfügbare Pakete finden Sie unter [GitHub Releases](https://github.com/JetSquirrel/KhonsuGraph/releases). Der Release-Workflow erstellt ein macOS-DMG für Apple silicon und ein 64-Bit-Windows-ZIP. Windows-Pakete sind nicht signiert; das letzte Engine-Upgrade wurde unter macOS validiert, nicht unter Windows.

Unter macOS öffnen Sie das DMG und kopieren die App in den Ordner „Programme“. Unter Windows entpacken Sie das gesamte ZIP und behalten dabei den Ordner `plugins` neben der ausführbaren Datei bei.

Die Schaltfläche **Kommandozeile & KI** (das Roboter-Symbol) in der Titelleiste der App installiert den Befehl `khonsu` im PATH und kann die Agent-Skill für Claude Code hinzufügen. Die ausführbare Datei der App akzeptiert auch direkt CLI-Unterbefehle.

```sh
khonsu --version
```

## Einen kleinen Graphen erstellen

Laden Sie [hosts.csv](/samples/hosts.csv) und [dependencies.csv](/samples/dependencies.csv) in denselben Arbeitsordner herunter. Sie beschreiben drei Hosts und zwei Abhängigkeiten.

Führen Sie diese Befehle in diesem Ordner aus. Halten Sie den Graphen während des Imports in der Desktop-App geschlossen.

```sh
khonsu init graphs/demo
khonsu source add --db graphs/demo --plugin csv --name demo \
  -c node_file=hosts.csv -c node_label=Host -c node_id_column=id \
  -c edge_file=dependencies.csv -c edge_type=DEPENDS_ON \
  -c edge_source_column=source -c edge_target_column=target --test
khonsu plugin sync --source demo --dry-run
khonsu plugin sync --source demo
```

Die erste Synchronisierung zeigt eine Vorschau der Anzahlen und Beispiele, ohne zu schreiben; die zweite importiert den Graphen. `source add` speichert die CSV-Pfade als absolute Pfade, sodass spätere Synchronisierungen aus jedem Ordner funktionieren.

## Abfragen und erkunden

```sh
khonsu schema --db graphs/demo
khonsu query --db graphs/demo --cypher \
  "MATCH (a:Host)-[r:DEPENDS_ON]->(b:Host) RETURN a, r, b"
khonsu open graphs/demo
```

Führen Sie im Abfrageeditor der Desktop-App dieselbe Cypher-Abfrage aus. Wenn Sie ganze Knoten und Beziehungen zurückgeben, erhält die Zeichenfläche des Graphen die Informationen, die sie benötigt, um Verbindungen anzuzeigen.

Fahren Sie fort mit [Abfragen](./queries) oder [Ihrem ersten Dashboard](./dashboards).

## Aus dem Quellcode bauen

Aus einem Checkout des App-Repositories:

```sh
cargo build --workspace
cargo run -p khonsugraph
```

Die App verwendet Rust, GPUI und HawDB. Hinweise zur Release-Verpackung und zur plattformspezifischen Einrichtung finden Sie in der README des Repositories.
