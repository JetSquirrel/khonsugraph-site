---
description: Lokale HawDB-Graphen mit Cypher, SQL, Plugins und überprüfbaren Dashboards erkunden.
---
# KhonsuGraph-Dokumentation

KhonsuGraph ist eine Local-First-Desktop-Werkbank für HawDB-Graphen. Öffnen Sie ein Graphverzeichnis, prüfen Sie dessen Schema, fragen Sie Beziehungen in Cypher oder Tabellen in SQL im PostgreSQL-Dialekt ab und verwandeln Sie das Ergebnis in ein Dashboard.

Es ist ein unabhängiges Projekt, das auf HawDB aufbaut und unter Apache-2.0 veröffentlicht ist.

## Hier beginnen

- [Installieren und die erste Abfrage ausführen](./getting-started)
- [CSV importieren oder AWS verbinden](./data-sources)
- [Cypher-Unterstützung und Abfragegrenzen verstehen](./queries)
- [Ein .dash-Dashboard erstellen](./dashboards)
- [Mit einem KI-Agenten über die CLI arbeiten](./cli)
- [Die Beispiel-Dashboards erkunden](./examples)

## Was lokal bleibt

Graphspeicherung und Abfrageausführung laufen auf Ihrem Rechner. Quellen-Plugins kontaktieren die von Ihnen konfigurierten Systeme. Ein externer KI-Agent hat eigene Einstellungen zur Datenverarbeitung; prüfen Sie diese, wenn Sie Abfrageergebnisse mit ihm teilen.

Die aktuelle Quelle bindet HawDB auf **0.12.0**. Diese Anleitungen beschreiben diesen Stand; das Verhalten installierter Releases kann abweichen. Siehe das [Quell-Repository](https://github.com/JetSquirrel/KhonsuGraph).
