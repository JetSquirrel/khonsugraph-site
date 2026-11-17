---
description: Dokumentation für KhonsuGraph, die quelloffene Desktop-Werkbank für Graphuntersuchungen. Abfragen in Cypher und SQL, Pfade verfolgen, Belege anführen und Dashboards erstellen.
---
# KhonsuGraph Dokumentation

KhonsuGraph ist eine quelloffene, Local-First-Desktop-Werkbank für Graphuntersuchungen, die auf HawDB aufbaut. Bringen Sie Daten über Plugins ein, fragen Sie Beziehungen in Cypher oder Tabellen in SQL im PostgreSQL-Dialekt ab, folgen Sie Pfaden auf einer Zeichenfläche, bewahren Sie die Belege hinter jedem Datensatz auf und verwandeln Sie das Ergebnis in ein Dashboard.

Es ist ein unabhängiges Projekt, das auf HawDB aufbaut und unter Apache-2.0 veröffentlicht ist.

## Hier beginnen

- [Installieren und die erste Abfrage ausführen](./getting-started)
- [CSV importieren, AWS verbinden oder eine Neo4j-Datenbank kopieren](./data-sources)
- [Plugins per Namen aus einem Marketplace installieren](./marketplace)
- [Cypher-Unterstützung und Abfragegrenzen verstehen](./queries)
- [Einen Pfad verfolgen, Belege anführen und eine Untersuchung speichern](./investigations)
- [Knoten bewerten und Communities mit der Graphanalyse finden](./analysis)
- [Ein .dash-Dashboard erstellen](./dashboards)
- [Mit einem KI-Agenten über die CLI arbeiten](./cli)
- [Die Beispiel-Dashboards erkunden](./examples)

## Was lokal bleibt

Graphspeicherung und Abfrageausführung laufen auf Ihrem Rechner. Quellen-Plugins kontaktieren die von Ihnen konfigurierten Systeme. Ein externer KI-Agent hat eigene Einstellungen zur Datenverarbeitung; prüfen Sie diese, wenn Sie Abfrageergebnisse mit ihm teilen.

Diese Anleitungen beschreiben KhonsuGraph **0.3.0**, das HawDB auf **0.29.0** festlegt. Pfaderkundung, Belege, gespeicherte Untersuchungen, Snapshots und das Neo4j-Plugin sind in 0.3.0 hinzugekommen; ein früheres Release enthält sie nicht. Führen Sie `khonsu --version` aus, um Ihren Stand zu sehen, und sehen Sie sich das [Quell-Repository](https://github.com/JetSquirrel/KhonsuGraph) an.
