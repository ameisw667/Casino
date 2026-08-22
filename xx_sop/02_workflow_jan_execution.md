# Workflow-Jan Execution

> **Zweck:** Freigegebene Arbeit vom Plan bis zur Verifikation ausführen.

## 1 — Start-Gate

- Nutzerauftrag, Scope und zugehörigen Plan lesen. Für Plan-Dateien gilt `03_workflow_jan_planungsdateien.md`.
- Passende SOP und Kontextreferenz über den Router bestimmen und vor der Änderung lesen.
- Vor Terminal-, Remote- oder Schreibaktionen [Execution-Umgebungen](../xx_docs/03_execution_environment_reference.md) lesen.
- Prüfen, ob der Plan `Execution-Ready` ist oder der Nutzer die Umsetzung ausdrücklich freigegeben hat.
- Bei Architektur, Scope, Migrationsreihenfolge, externer Autorität oder nicht umkehrbaren Aktionen anhalten und nachfragen.

## 2 — Umsetzungsplan

- Anforderungen aus zwei passenden Perspektiven prüfen, etwa Architektur/Security oder Logik/UX.
- Dateien, Abhängigkeiten, Fehlerfälle, Prüfschritte und Jan-Aufgaben benennen.
- Für Auth-, Datenbank-, Wallet- oder Nutzerinput-Pfade Security-Prüfung und Negativtests einplanen.
- Erst ausführen, wenn keine materielle Unsicherheit offen ist.

## 3 — Umsetzung

- Änderungen im freigegebenen Scope ausführen; reversible Detailentscheidungen mit Annahme dokumentieren.
- Neue Abhängigkeit, Datenklasse, API-Grenze oder Scope-Erweiterung gegen Plan und Kontextreferenz prüfen.
- Plattformfreigaben nur als technische Bestätigungsregel behandeln; sie ersetzen keine Nutzerfreigabe für K4/K5.
- Bei Abweichung mit materieller Auswirkung anhalten und Entscheidung einholen.

## 4 — Verifikation

- Passende Tests, Typprüfung, Lint und Build nach Risiko ausführen.
- Diff gegen Plan, Nicht-Scope und Sicherheitsgrenzen prüfen.
- Nur aktuelle Befehlsausgaben als Nachweis für Test-, Build- oder Live-Behauptungen verwenden.

## 5 — Dokumentation und Abschluss

- Zuständige Plan-Datei, SOP oder Kontextreferenz im selben Schritt aktualisieren; Live-Status nur in der Statusquelle behaupten.
- Planstatus: vor Start `Execution-Ready`, während Umsetzung `In Execution`, nach Verifikation `Executed (archiviert)`.
- Abschluss erst nach Dokumentationsupdate und passender Verifikation melden.
