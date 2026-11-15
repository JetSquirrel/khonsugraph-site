---
description: Wandeln Sie CSV-Dateien und AWS-Ressourcen mithilfe von Quellen-Plugins in Knoten und Beziehungen um.
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

Das AWS-Plugin verwendet die AWS CLI, um VPCs, Subnetze, Sicherheitsgruppen, Instanzen, Load Balancer und IAM-Rollen zu lesen. Installieren und konfigurieren Sie zuerst die AWS CLI und verwenden Sie dann ein schreibgeschütztes Profil, das Sie kontrollieren. `regions` ist eine durch Kommas getrennte Liste, etwa `us-east-1,eu-west-1`.

```sh
khonsu init graphs/aws
khonsu plugin describe aws
khonsu source add --db graphs/aws --plugin aws --name aws-demo \
  -c profile=readonly -c regions=us-east-1 --test
khonsu plugin sync --source aws-demo --dry-run
khonsu plugin sync --source aws-demo
```

Dies greift auf das konfigurierte AWS-Konto zu. Für eine Offline-Durchführung verwenden Sie stattdessen die gespeicherten Fixtures im App-Repository; siehe [Beispiele](./examples).

Das <a href="/docs/samples/exposure.dash" download>AWS-Exposure-Dashboard</a> verfolgt `Cidr → SecurityGroup ← Instance → Role` anhand der Beziehungen, die dieses Plugin importiert.

## Semantik der Synchronisierung {#sync-semantics}

- Stabile IDs sorgen dafür, dass wiederholte Importe vorhandene Datensätze aktualisieren.
- Eine vollständige Synchronisierung entfernt zuvor von dieser Quelle importierte Datensätze, die im neuen Ergebnis fehlen.
- Eine inkrementelle Synchronisierung fügt Datensätze nur hinzu oder aktualisiert sie, sofern das Plugin dies unterstützt.
- Eine fehlgeschlagene Synchronisierung kann bereits geschriebene Datensätze beibehalten. Die nächste erfolgreiche Synchronisierung gleicht sie ab.
- Eine Beziehung mit einem unbekannten Endpunkt wird übersprungen und in `skipped_edges` gezählt.

Importierte Datensätze enthalten `khonsu_id`, `khonsu_source`, `khonsu_plugin` und `khonsu_synced_at`. Graphschreibvorgänge und Synchronisierungen erfordern exklusiven Zugriff: Schließen Sie den Graphen zuerst in der App.

## Andere Systeme

Installieren Sie ein Plugin erst, nachdem Sie seine Berechtigungen geprüft haben. Berechtigungen sind Deklarationen, keine Betriebssystem-Sandbox. Vertrauliche Konfigurationsfelder werden im Systemschlüsselbund gespeichert. Siehe [Plugin-Entwicklung](./plugins).
