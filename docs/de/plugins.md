---
description: Entwickeln Sie ein Datenquellen-Plugin in einer beliebigen Sprache mithilfe des JSON-Lines-Protokolls.
---
# Plugin-Entwicklung

Ein Plugin ist eine separate ausführbare Datei, die Knoten und Beziehungen über stdin/stdout mit JSON Lines ausgibt. Der Host schreibt die Datensätze in HawDB. Ein Plugin muss den Graphen nicht selbst öffnen.

Protokollversion 1 ist experimentell und kann sich vor 1.0 ändern. Die [vollständige Protokollreferenz](https://github.com/JetSquirrel/KhonsuGraph/blob/main/docs/plugins.md) wird zusammen mit der Anwendung gepflegt.

## Paketstruktur

```text
folders/
  khonsu-plugin.json
  plugin.py
```

```json
{
  "id": "folders",
  "name": "Folders",
  "version": "0.1.0",
  "protocol": 1,
  "entry": ["python3", "plugin.py"],
  "description": "A folder tree as nodes and CONTAINS relationships",
  "permissions": {"read_files": true, "commands": ["python3"]}
}
```

Die ausführbare Datei läuft mit dem Plugin-Ordner als Arbeitsverzeichnis. Das kleinste vollständige Beispiel ist das [Python-Plugin „folders“](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples/plugins/folders) im Repository.

## Operationen

| Operation | Eingabe | Ausgabe |
| --- | --- | --- |
| `describe` | Keine | Konfigurationsschema, Berechtigungen und Ausgabetypen |
| `test` | Anfrage mit Konfiguration und Geheimnissen | `test_result` oder `error` |
| `sync` | Anfrage mit Konfiguration, Geheimnissen, Modus und Cursor | Datensätze und Fortschritt, dann `done` oder `error` |

Jede Nachricht ist ein JSON-Objekt in einer eigenen Zeile mit einem Feld `type`. Diagnoseausgaben gehören auf stderr. Halten Sie IDs zwischen Synchronisierungen stabil; Beziehungsendpunkte verweisen auf Knoten-IDs derselben Quelle. Beenden Sie erfolgreiche Synchronisierungen mit `done`.

## Berechtigungen und Geheimnisse

Deklarieren Sie Netzwerkzugriff, Dateizugriffe und Befehle im Manifest. KhonsuGraph zeigt diese Deklarationen zur Genehmigung an, schottet den Prozess aber **nicht** in einer Sandbox ab. Markieren Sie vertrauliche Konfigurationsfelder mit `secret: true`, um den Systemschlüsselbund zu verwenden.

Installieren Sie ein Plugin-Verzeichnis oder -ZIP erst nach der Prüfung:

```sh
khonsu plugin install ./folders --yes
khonsu plugin describe folders
```

`--yes` genehmigt die deklarierten Berechtigungen. Von einem KI-Agenten ausgeführt, [genehmigt es nichts](./cli#approval). Das Installationsprogramm kopiert das Plugin; installieren Sie es nach Änderungen an der Quelle erneut. Lesen Sie [Semantik der Synchronisierung](./data-sources#sync-semantics), bevor Sie eine vollständige oder inkrementelle Synchronisierung implementieren.

## Ein Plugin teilen {#share}

Damit andere Ihr Plugin per Namen installieren können, veröffentlichen Sie es in einem Marketplace. Siehe [Ein Plugin veröffentlichen](./marketplace#publish).
