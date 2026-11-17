---
description: Beheben Sie fehlende CLI-Befehle, Graph-Sperren, leere Graph-Panels und Fehler bei der Abfragevalidierung.
---
# Fehlerbehebung

## khonsu wird nicht gefunden

Verwenden Sie **Kommandozeile & KI** (das Roboter-Symbol) in der Titelleiste der App und öffnen Sie Ihr Terminal erneut. Unter macOS können Sie die Binärdatei der App direkt aufrufen:

```sh
/Applications/KhonsuGraph.app/Contents/MacOS/khonsugraph --version
```

Unter Windows behalten Sie `khonsu.exe` zusammen mit dem Rest des entpackten Pakets bei und fügen dieses Verzeichnis dem PATH hinzu, oder Sie rufen es über den vollständigen Pfad auf.

## Der Graph ist gesperrt

Jeweils ein Prozess besitzt ein HawDB-Graphverzeichnis. Lesevorgänge und Dashboard-Prüfungen werden über das laufende Fenster geleitet, aber Schreibvorgänge und Quellen-Synchronisierungen erfordern, dass der Graph frei ist. Schließen Sie den Graphen im anderen Prozess. Löschen Sie niemals `khonsugraph.lock`, `owner.hawdb.lock` oder Datenbankdateien, um eine Sperre zu umgehen.

## Der Graph meldet old_format {#old-format}

HawDB 0.25 hat sein Speicherformat geändert und liest keinen älteren Graphen, daher lässt sich ein von KhonsuGraph 0.2.0 oder früher geschriebener Graph nicht mit der Art `old_format` öffnen. `khonsu graph rebuild --db DIR` erstellt ihn aus seinen Datenquellen neu und behält das alte Verzeichnis daneben als `DIR.hawdb-old`. Alles, was von Hand statt durch eine Synchronisierung geschrieben wurde, wird nicht übernommen.

## Ein Graph-Panel ist leer

Geben Sie ganze Knoten und Beziehungen zurück (`RETURN a, r, b`) statt nur Namen. Prüfen Sie, ob Sie den Graphen geöffnet haben, für den das Dashboard geschrieben wurde. Verwenden Sie `khonsu schema --db DIR` und führen Sie die Abfrage direkt aus, um Labels und Ergebnis zu verifizieren.

## Eine Abfrage oder ein Dashboard schlägt fehl

Führen Sie `khonsu dash check FILE --db DIR` aus und lesen Sie alle gemeldeten Fehler. Ein Diagramm verweist möglicherweise auf eine fehlende Spalte; ein importierter Datensatz verwendet möglicherweise andere Labels. Einige Cypher-Funktionen werden nicht unterstützt: siehe [Abfrageeinschränkungen](./queries#current-limitations).

Wenn ein Lesevorgang sein Budget überschreitet, schränken Sie ihn mit Prädikaten und `LIMIT` ein. Allein das Verringern von `--max-rows` senkt die Ausführungskosten nicht.

## Eine Quelle kann nicht synchronisiert werden

Führen Sie `khonsu plugin describe ID` aus und prüfen Sie die Konfigurationsfelder. Stellen Sie sicher, dass die mitgelieferten Plugins neben der ausführbaren Datei verbleiben. Pfade für einzelne CSV-Dateien werden beim Hinzufügen der Quelle als absolute Pfade gespeichert. Pfade im JSON von `nodes` und `edges` werden so gespeichert, wie sie angegeben wurden, und müssen absolut sein. AWS erfordert die AWS CLI und ein zugängliches, konfiguriertes Profil, sofern keine Fixtures verwendet werden. Schreiben Sie `regions` als durch Kommas getrennten Text, nicht als JSON-Array. Wird das AWS- oder Neo4j-Plugin nach einem Update über 0.3.0 hinaus nicht gefunden, installieren Sie es aus dem [Marketplace](./marketplace#install).

Eine fehlgeschlagene Synchronisierung kann bereits geschriebene Datensätze hinterlassen. Beheben Sie die Ursache und synchronisieren Sie dann erneut, um sie abzugleichen. Prüfen Sie `skipped_edges` auf unaufgelöste Endpunkte.

## Ein Problem melden

Geben Sie die App-Version, das Betriebssystem, den Befehl und die Fehlerart in einem [GitHub-Issue](https://github.com/JetSquirrel/KhonsuGraph/issues) an. Entfernen Sie Anmeldedaten und private Graphwerte aus Reproduktionen.
