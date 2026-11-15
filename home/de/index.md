# KhonsuGraph — Für Jäger gebaut.

Den Verbindungen folgen. Die Beweise aufdecken.

Eine quelloffene, local-first Werkbank für Graphuntersuchungen in Sicherheit, Infrastruktur und darüber hinaus. Folgen Sie Verbindungen in HawDB-Graphen mit Cypher und SQL, verbinden Sie Ihre Daten und bauen Sie Dashboards mit Ihrem KI-Agenten.

## EINE GESCHICHTE DER ERKUNDUNG

Die Geschichte der Erforschung des Unbekannten ist auch eine Geschichte des Spurenlesens.

### DIE ALTE WILDNIS — Jäger folgten Spuren.

In einer Wildnis ohne Karten lasen Jäger Fußabdrücke im Boden, abgebrochene Zweige und Spuren, die Tiere hinterlassen hatten.

Ein einzelner Fußabdruck sagt wenig. Mit dem nächsten verbunden, offenbaren die Spuren einen Weg: wo ein Tier gewesen ist und wohin es gehen könnte.

Verbinden Sie die Spuren. Eine Richtung beginnt sich abzuzeichnen.

### DAS ALTE ÄGYPTEN — Reisende blickten zum Mond.

In der altägyptischen Mythologie ist Khonsu der Gott des Mondes, der Reise und des Schutzes. Sein Name bedeutet „Reisender“ und erinnert an die Reise des Mondes über den Nachthimmel.

Wenn die Sonne untergeht, zeigt das Mondlicht Reisenden einen Weg durch die Dunkelheit.

Dunkelheit heißt nicht, dass es keinen Weg gibt. Nur, dass er noch gefunden werden muss.

### DAS ZEITALTER DER ENTDECKUNGEN — Entdecker folgten den Sternen.

Auf der Suche nach Gewürzen und Seewegen nach Osten segelten Navigatoren in unbekannte Gewässer.

Sie lasen die Positionen der Sterne zusammen mit Winden, Strömungen und Reiseaufzeichnungen, um auf offener See ihren Kurs zu finden.

Ein einzelner Stern ist nur ein Lichtpunkt. Verbunden werden Sterne zu einer Karte, nach der man navigiert.

### HEUTE — Wir folgen digitalen Spuren.

Heute folgen Threat Hunter Spuren durch die digitale Welt. Ihre Dunkelheit verbirgt sich in gewaltigen Datenmengen.

Sicherheitsanalysten rekonstruieren Angriffe aus Protokollen. SREs verfolgen Dienstabhängigkeiten, um Ursachen zu finden und ihre Auswirkungen zu verstehen. Prüfer folgen Transaktionen und Beziehungen zwischen Entitäten, um Anomalien und Risiken aufzudecken.

Scheinbar unverbundene Ereignisse, Assets und Identitäten offenbaren ihre Geschichte durch ihre Verbindungen.

Von Spuren in der Wildnis über Karten des Nachthimmels bis zu Netzwerken digitaler Beziehungen – haben wir immer dasselbe getan: Hinweise verbinden. Die Wahrheit finden.

Das ist KhonsuGraph. Für Jäger gebaut.

- **Threat Hunter**: Angriffspfade und Bedrohungen verfolgen.
- **SREs**: Ursachen und Abhängigkeiten nachverfolgen.
- **Betrugsermittler**: Auffällige Transaktionen und versteckte Verbindungen verfolgen.
- **Forschende**: Muster in komplexen Netzwerken erkunden.

KhonsuGraph — Built for Hunters. Für Jäger gebaut.

## Quellen verbinden

Importieren Sie Knoten und Beziehungen aus CSV, synchronisieren Sie AWS-Ressourcen, kopieren Sie eine Neo4j- oder Cartography-Datenbank oder schreiben Sie ein Plugin für Ihr eigenes System.

[Datenquellen](https://khonsugraph.com/docs/de/data-sources)

## Mit Cypher oder SQL fragen

Prüfen Sie das Schema, schreiben Sie eine Abfrage und sehen Sie das Ergebnis als Tabelle oder als Graphen, den Sie erkunden können.

[Ihren Graphen abfragen](https://khonsugraph.com/docs/de/queries)

## Dem Pfad folgen

Gehen Sie von jedem Knoten nach außen, begrenzt durch Hops und Beziehungstypen, und ermitteln Sie den kürzesten Pfad zu einem Ziel.

[Einen Pfad verfolgen](https://khonsugraph.com/docs/de/investigations)

## Wesentliches finden

Bewerten Sie Knoten mit PageRank und Betweenness, finden Sie Communities und Komponenten und messen Sie kürzeste Pfade. Die Ergebnisse stimmen mit networkx überein.

[Den Graphen analysieren](https://khonsugraph.com/docs/de/analysis)

## Belege sichern

Jeder Datensatz nennt die Quelle, die ihn geschrieben hat, und den Zeitpunkt. Speichern Sie eine Untersuchung, öffnen Sie sie nach Datenänderungen erneut und prüfen Sie, ob die Schlussfolgerung noch gilt.

[Eine Untersuchung speichern](https://khonsugraph.com/docs/de/investigations#saved-investigations)

## Das Ergebnis teilen

Machen Sie aus Abfragen eine Klartextdatei .dash mit Graph-Panels, Diagrammen, Tabellen und gemeinsamen Filtern.

[Ein Dashboard bauen](https://khonsugraph.com/docs/de/dashboards)

## Was ist KhonsuGraph?

KhonsuGraph ist eine kostenlose, quelloffene Desktop-Werkbank für lokale HawDB-Graphen. Sie vereint Cypher- und SQL-Abfragen im PostgreSQL-Dialekt, eine Graph-Zeichenfläche, Datenquellen-Plugins und Klartext-Dashboards.

## Verlässt mein Graph meinen Rechner?

Speicherung und Abfragen laufen auf Ihrem Computer. Quellen-Plugins können die von Ihnen konfigurierten Systeme kontaktieren, etwa AWS. Wenn Sie einen externen KI-Agenten verwenden, gelten dessen eigene Datenschutz- und Datenverarbeitungseinstellungen.

## Welche Plattformen werden unterstützt?

Das Projekt bietet Release-Pakete für macOS auf Apple silicon und 64-Bit-Windows. Verfügbare Pakete finden Sie in den GitHub Releases. Windows-Pakete sind nicht signiert; die letzte Engine-Aktualisierung wurde unter macOS validiert.

## Ist das ein offizielles HawDB-Produkt?

Nein. KhonsuGraph ist ein unabhängiges Projekt auf Basis von HawDB. Es ist kostenlos und quelloffen unter der Apache-2.0-Lizenz.

## Kann ich jede Cypher-Abfrage verwenden?

KhonsuGraph nutzt die von HawDB unterstützte Cypher-Syntax, die sich von anderen Graphdatenbanken unterscheidet. Unterstützte Muster und aktuelle Einschränkungen finden Sie im Abfrage-Leitfaden.

## Worin unterscheidet es sich von Neo4j Browser oder Bloom?

KhonsuGraph ist eine Desktop-App mit eigener eingebetteter Graph-Engine, HawDB, sodass kein Datenbankserver betrieben werden muss. Sie bietet Pfadexploration, Belege auf Datensatzebene, Graphalgorithmen und eine JSON-Kommandozeile für KI-Agenten. Das Neo4j-Plugin kann eine bestehende Neo4j-Datenbank, auch eine von Cartography gefüllte, in einen lokalen Graphen kopieren.

## Funktioniert es mit Claude Code und anderen KI-Agenten?

Ja. Die khonsu-Kommandozeile gibt bei jedem Befehl strukturiertes JSON aus, sodass jeder Agent mit Shell-Zugriff sie nutzen kann; die App kann zudem einen Agent-Skill für Claude Code installieren. Der Agent liest das Schema, führt Abfragen aus und schreibt Dashboards; Sie prüfen das Ergebnis im Fenster.

[GitHub](https://github.com/JetSquirrel/KhonsuGraph)
