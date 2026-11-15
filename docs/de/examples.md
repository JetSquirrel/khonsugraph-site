---
description: Erkunden Sie Dashboards aus dem Repository für AWS-Exposure, Service-Abhängigkeiten, Sicherheit und Vertrauensnetzwerke.
---
# Beispiele

Das [Anwendungs-Repository](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples) enthält Dashboards und Skripte, die Graphen aus öffentlichen Datensätzen vorbereiten. Eine `.dash`-Datei allein enthält nicht ihre Datenbank.

## Öffentliche Datensätze

| Dashboard | Quelldaten |
| --- | --- |
| Sicherheits-Angriffskette | MITRE ATT&CK und OTRF Security-Datasets |
| SRE-Blast-Radius | Google Online Boutique service manifests |
| Netzwerk von Offshore-Firmen | ICIJ Offshore Leaks |
| Vertrauensnetzwerk von Konten | SNAP Bitcoin OTC ratings |
| Mieten in Bahnhofsnähe | OpenStreetMap MTR data and Inside Airbnb Hong Kong |

Jede Quelle behält ihre eigene Lizenz. Das Erscheinen im ICIJ-Datensatz bedeutet keine Rechtswidrigkeit. Herkunft und Lizenzierung finden Sie in der README des examples-Verzeichnisses.

## Einen Service-Graphen erstellen

Aus einem Checkout des App-Repositories:

```sh
sh examples/datasets/fetch.sh scratch/datasets/raw
node examples/datasets/build.mjs sre scratch/datasets/raw scratch/datasets/sre
khonsu init graphs/sre
khonsu source add --db graphs/sre --plugin csv --name sre-data \
  -c 'nodes=[{"path":"'"$PWD"'/scratch/datasets/sre/nodes.csv","label_column":"label","id_column":"id"}]' \
  -c 'edges=[{"path":"'"$PWD"'/scratch/datasets/sre/edges.csv","type_column":"type","source_column":"source","target_column":"target","id_column":"id"}]'
khonsu plugin sync --source sre-data
khonsu check examples/sre/blast_radius.dash --db graphs/sre
khonsu open graphs/sre
khonsu open examples/sre/blast_radius.dash
```

Das Fetch-Skript lädt öffentliche Daten herunter. `$PWD` hält die CSV-Pfade absolut, was das CSV-Plugin für `nodes` und `edges` benötigt. Ersetzen Sie `sre` durch die anderen Story-Verzeichnisse, wie in der README des examples-Verzeichnisses beschrieben.

## AWS ohne Live-Konto

Das App-Repository enthält gespeicherte Antworten der AWS CLI. Führen Sie die Befehle aus seinem Stammverzeichnis aus:

```sh
khonsu init graphs/aws
khonsu source add --db graphs/aws --plugin aws --name aws-fixture \
  -c "fixture_dir=$PWD/plugins/aws/tests/fixture" -c regions=us-east-1
khonsu plugin sync --source aws-fixture
khonsu check examples/aws/exposure.dash --db graphs/aws
khonsu open graphs/aws
khonsu open examples/aws/exposure.dash
```

Sie können das Exposure-Dashboard auch <a href="/docs/samples/exposure.dash" download>herunterladen</a>. Es erfordert den importierten AWS-Graphen.
