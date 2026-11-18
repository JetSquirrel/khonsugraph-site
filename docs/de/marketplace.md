---
description: KhonsuGraph-Plugins aus einem Marketplace per Namen finden, installieren und aktualisieren, Downloads prüfen und eigene Plugins veröffentlichen.
---
# Marketplace

Ein Marketplace listet Plugins nach Namen. Für jedes Plugin nennt er die Version, die deklarierten Berechtigungen und ein Paket pro Plattform mit seiner SHA-256. KhonsuGraph kann einen Marketplace aus einem lokalen Ordner, einem GitHub-Repository oder von einer HTTPS-Adresse lesen.

::: info Im nächsten Release
Der Marketplace kommt mit dem Release nach 0.3.0. Ab diesem Release ist CSV das einzige Plugin, das mit der App ausgeliefert wird. AWS und Neo4j werden wie SQL und DuckLocal aus dem offiziellen Marketplace installiert. In 0.3.0 werden AWS und Neo4j noch mit der App ausgeliefert.
:::

## Ein Plugin installieren {#install}

```sh
khonsu plugin search              # was die Marketplaces anbieten
khonsu plugin install aws --yes   # herunterladen, prüfen, installieren, genehmigen
khonsu plugin update              # installierte Plugins aktualisieren
```

In der App zeigt **Add Data Source… → More Plugins…** dieselbe Liste. Ein dort installiertes oder aktualisiertes Plugin führt weiter zum Genehmigungsdialog und dann zu seinem Quellformular.

Wenn zwei Marketplaces dieselbe ID listen, geben Sie an, welchen Sie meinen: `khonsu plugin install sql@official`. `khonsu plugin update --dry-run` meldet nur, was sich ändern würde.

## Offizielle Plugins {#official}

| Plugin | Was es liest |
| --- | --- |
| `sql` | PostgreSQL-, MySQL- und SQLite-Tabellen, von Hand oder anhand von Primär- und Fremdschlüsseln zugeordnet |
| `ducklocal` | Parquet-, CSV-, JSON- und DuckDB-Tabellen, gelesen über DuckLocal |
| `aws` | VPCs, Subnetze, Sicherheitsgruppen, Instanzen, Load Balancer und IAM-Rollen über die schreibgeschützt genutzte AWS CLI. Es bietet die Exposure-Analyse und das Template `aws.exposure` |
| `neo4j` | Eine Neo4j-Datenbank, etwa eine von Cartography gefüllte, kopiert über ihre HTTP-API |

Jede Installation beginnt mit dem Marketplace `official`. Er wird von `marketplace.khonsugraph.com` ausgeliefert und aus dem Repository [khonsugraph-marketplace](https://github.com/JetSquirrel/khonsugraph-marketplace) gebaut, das Quellcode und README jedes Plugins enthält. Das CSV-Plugin bleibt eingebaut.

## Was geprüft wird {#checks}

- Das Paket muss zur SHA-256 passen, die der Marketplace listet, und das gelistete Plugin in der gelisteten Version enthalten. Andernfalls wird nichts installiert, und was vorher installiert war, bleibt.
- Indizes und Pakete werden nur über HTTPS gelesen.
- Installieren ist nicht Genehmigen. Ein Plugin aus einem Marketplace braucht vor dem Ausführen eine Genehmigung, nach einem Update erneut. `--yes` genehmigt im selben Schritt. Von einem KI-Agenten ausgeführt, genehmigt es nichts und endet mit 4; siehe [Genehmigung](./cli#approval).

Ein Marketplace sagt, wo ein Paket liegt und welchen Hash es hat. Er macht das Plugin nicht sicher. Prüfen Sie die deklarierten Berechtigungen vor der Genehmigung; sie sind Deklarationen, keine Sandbox. Siehe [Plugin-Entwicklung](./plugins).

## Einen Marketplace hinzufügen {#add}

```sh
khonsu plugin marketplace add acme/khonsu-plugins   # owner/repo auf GitHub
khonsu plugin marketplace add https://plugins.example.com  # beliebige HTTPS-Adresse
khonsu plugin marketplace add ~/work/team-plugins   # ein Ordner
khonsu plugin marketplace list
khonsu plugin marketplace remove team-plugins
```

`khonsu plugin marketplace remove official` schaltet den offiziellen Marketplace ab, `khonsu plugin marketplace restore` stellt ihn wieder her.

## Ein Plugin veröffentlichen {#publish}

```sh
khonsu plugin publish ./my-plugin --to ~/work/team-plugins
```

Das packt das Plugin in den Ordner und trägt es in dessen `marketplace.json` ein. Committen und pushen Sie den Ordner oder laden Sie ihn auf einen statischen Host. Andere fügen ihn einmal mit `khonsu plugin marketplace add` hinzu und installieren dann per Namen. Wird dieselbe Version erneut veröffentlicht, ersetzt das das Paket dieser Plattform, sodass jede Plattform ihren eigenen Build veröffentlichen kann. Siehe die [vollständige Marketplace-Referenz](https://github.com/JetSquirrel/KhonsuGraph/blob/main/docs/marketplace.md).
