---
description: Beispielhafte Graphuntersuchungen auf öffentlichen Datensätzen. Eine Angriffskette aus Sysmon-Protokollen, ein Service-Blast-Radius, das ICIJ-Offshore-Leaks-Netzwerk, ein Bitcoin-Vertrauensnetzwerk und AWS-Exposure.
---
# Beispiele

Das [Anwendungs-Repository](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples) enthält Dashboards und Skripte, die Graphen aus öffentlichen Datensätzen vorbereiten. Eine `.dash`-Datei allein enthält nicht ihre Datenbank.

## Öffentliche Datensätze

| Dashboard | Frage | Quelldaten | Graph |
| --- | --- | --- | --- |
| [Sicherheits-Angriffskette](#attack-chain) | Welche Angriffskette verbirgt sich in rauschhaften Host-Protokollen? | MITRE ATT&CK und OTRF Security-Datasets | 1.838 Knoten, 20.591 Beziehungen |
| [SRE-Blast-Radius](#blast-radius) | Was reißt ein ausfallender Dienst mit? | Google Online Boutique Service-Manifeste | 12 Dienste, 16 Aufrufpfade |
| [Netzwerk von Offshore-Firmen](#offshore-network) | Wer steht hinter einer Gruppe von Firmen? | ICIJ Offshore Leaks | 5.577 Knoten, 6.515 Beziehungen |
| [Vertrauensnetzwerk von Konten](#trust-network) | Vor welchen Konten warnen andere? | SNAP Bitcoin-OTC-Bewertungen | 5.881 Konten, 35.592 Bewertungen |
| Mieten in Bahnhofsnähe | Welche Wohnungen liegen nahe einer MTR-Station? | OpenStreetMap-MTR-Daten und Inside Airbnb Hong Kong | 5.730 Knoten, 17.119 Beziehungen |

Jede Quelle behält ihre eigene Lizenz. Das Erscheinen im ICIJ-Datensatz bedeutet keine Rechtswidrigkeit. Herkunft und Lizenzierung finden Sie in der README des examples-Verzeichnisses.

## Angriffskette {#attack-chain}

Für Sicherheitsingenieure und Threat Hunter. `security/attack_chain.dash` verbindet MITRE ATT&CK (Gruppen, Software, Techniken, Gegenmaßnahmen) mit zwei OTRF-Sysmon-Aufzeichnungen, Empire Mimikatz und Covenant PowerShell Remoting. Ereignisse zur Prozess-Erstellung und zum LSASS-Zugriff sind mit den Techniken verknüpft, auf die sie hinweisen. Wählen Sie eine Technik, um zu sehen, welche bekannten Gruppen sie verwenden und wie Sie sie abmildern; wählen Sie einen Prozess, um zu sehen, was er gestartet hat und womit er verbunden war.

Erstellen Sie es mit den Befehlen unten, mit `security` anstelle von `sre` und `attack_chain.dash` als Dashboard.

## Offshore-Netzwerk {#offshore-network}

Für Ermittlerinnen und Ermittler. `investigation/offshore_network.dash` bildet Firmenvertreter, Firmen und Intermediäre aus der ICIJ-Offshore-Leaks-Datenbank ab (Panama Papers, Hongkong, 2012–2015). Wählen Sie einen Firmenvertreter, um seine Firmen zu sehen, und finden Sie die Intermediäre, die die meisten gegründet haben.

Erstellen Sie es mit `investigation` anstelle von `sre`.

## Vertrauensnetzwerk {#trust-network}

Für Prüferinnen und Prüfer. `audit/trust_network.dash` untersucht, wer wen im Bitcoin-OTC-Vertrauensnetzwerk bewertet. Die [Graphenanalyse](./analysis) findet die Konten, auf denen das Netzwerk beruht:

```sh
khonsu analyze pagerank --db graphs/audit --type TRUSTS --top 10
```

Erstellen Sie es mit `audit` anstelle von `sre`.

## Service-Blast-Radius {#blast-radius}

Für SRE: welche Dienste eine ausfallende Abhängigkeit aufrufen, direkt oder über andere. Aus einem Checkout des App-Repositories:

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

## AWS-Exposure ohne Live-Konto {#aws-exposure}

Für Cloud-Sicherheitsingenieure: Was die Konfiguration eines AWS-Kontos ins Internet öffnet, von einem Internet-CIDR über Sicherheitsgruppen und Load Balancer bis zu Instanzen und den Rollen, die sie übernehmen.

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

Ab 0.3.0 meldet `khonsu plugin analyze aws exposure --db graphs/aws` Befunde mit der Regel und den dahinterliegenden Feldern, und `khonsu explore` verfolgt den Pfad. Siehe [Untersuchungen](./investigations).
