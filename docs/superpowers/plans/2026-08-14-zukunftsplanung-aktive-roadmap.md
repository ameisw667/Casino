# Zukunftsplanung: Aktive Roadmap und Archivindex — Implementierungsplan

> **Für agentische Ausführung:** Dieser Plan wurde in derselben Session erstellt, selbst geprüft und inline ausgeführt. Die Checkboxen dokumentieren die abgeschlossene Dokumentations-Execution.

**Ziel:** worldmap/05_ZUKUNFTSPLANUNG.md zeigt in der Jan-Übersicht nur aktive oder noch offene Vorhaben; abgeschlossene Initiativen bleiben über einen zentralen Docs-Archivindex und ihre Detailnachweise auffindbar.

**Architektur:** Die Worldmap-Datei ist die kurze Arbeitsoberfläche. docs/archive/05_ZUKUNFTSPLANUNG_ARCHIV.md ist der historische Index für abgeschlossene 05-Initiativen; Scope, Migrationen und Verifikation bleiben in den bestehenden docs/architecture/- bzw. docs/status-reports/-Dateien. Es werden ausschließlich Markdown-Dokumente und Querverweise geändert.

**Tech Stack:** Markdown, relative Repository-Links, PowerShell/rg-Konsistenzprüfungen; keine Runtime-, Dependency-, ENV- oder Datenbankänderung.

**Spec:** Nutzeranforderung zur Archivierung der Punkte 1.1, 1.2, 1.4, 1.5, 1.6, 1.7, 1.9, 2.2, 2.5 und 2.7; zusätzliches Herauslösen bereits abgeschlossener 2.4-Historie; Kürzung der Jan-Tabelle; vollständige Selbstprüfung und direkte Execution.

## Globale Constraints

- Die aktive Jan-Tabelle enthält nur offene, laufende oder noch nicht abschließend verifizierte Initiativen.
- Die zehn ausdrücklich genannten Punkte werden aus der Jan-Tabelle entfernt und im Docs-Archivindex erhalten.
- 2.4 wird ebenfalls nicht als aktiver Plan geführt, weil der technische Abschluss bereits im kanonischen docs/architecture/05_2.4_CHATBOT_LLM_ERWEITERUNG.md liegt.
- 2.7 wird als technisch abgeschlossen archiviert; die 24-Stunden-Kostenplausibilisierung bleibt als Restprüfung im Archiv sichtbar.
- 1.10, 2.6, 2.8, Outbox, 2.9, 1.13, 1.14, Trigger.dev, 2.10, 2.11 und 3.1–3.3 bleiben aktive Planungs-/Execution-Themen.
- Die Punkt-IDs P01–P24 bleiben stabil; archivierte IDs werden nicht neu nummeriert.
- Die Jan-Tabelle enthält nur Entscheidungsspalten: Punkt, Phase/Nr., Status, Idee, nächster Schritt, Aufwand, Risiko, Impact, Lerneffekt, DB-Migration, Money-Pfad und Go-Live-Typ.
- Keine Source-Dateien, Migrationen, ENV-Dateien, Produktionsdaten oder Abhängigkeiten werden geändert.
- Vorbestehende Worktree-Änderungen bleiben unangetastet.

## Review vor der Execution

### Perspektive 1: Jan / Nutzer

- Die erste Tabelle beantwortet ohne Detaillektüre: Was ist offen, welchen Status hat es und was passiert als Nächstes?
- Abgeschlossene Punkte verschwinden aus der täglichen Arbeitsfläche, bleiben aber historisch nachvollziehbar.
- Die Detailtiefe bleibt im Abschnitt 3 und in den Docs; die Übersicht wiederholt keine Security-, ROI- oder Abhängigkeitstexte.

### Perspektive 2: Dokumentationsstruktur

- worldmap/05_ZUKUNFTSPLANUNG.md ist die aktive Roadmap.
- docs/archive/05_ZUKUNFTSPLANUNG_ARCHIV.md ist der zentrale Abschlussindex.
- Die bereits vorhandene kanonische 2.4-Datei unter docs/architecture/ bleibt die einzige Detailquelle; der entfernte Worldmap-Pfad darf nicht mehr verlinkt werden.
- Abschnitt 3 und das Risiko-Register führen nur noch aktive Initiativen.

### Perspektive 3: Ausführungs- und Konsistenzprüfung

- Jede aktive Detailüberschrift muss in der gekürzten Jan-Tabelle oder als klar markierte Phase-3-/Nachtragsinitiative vertreten sein.
- Jede archivierte Initiative muss genau einen Archivindex-Eintrag und einen existierenden Detailnachweis besitzen.
- Trigger.dev darf nicht nur im Fließtext stehen, sondern muss auch als aktiver Tabellenpunkt erscheinen.
- 2.7 darf nach der Archivierung nicht gleichzeitig als aktiv und archiviert formuliert sein.
- Relative Links werden nach der Bereinigung geprüft.

**Review-Ergebnis:** Die drei Perspektiven sind vereinbar. Die Execution-Variante lautet: Archivindex korrigieren, aktive Übersicht neu schneiden, abgeschlossene Detailblöcke und alte Risiken aus der aktiven Roadmap entfernen, Querverweise synchronisieren, anschließend Fehler-/Konsistenz-Audit ausführen.

## Dateistruktur

**Ändern:**

- worldmap/05_ZUKUNFTSPLANUNG.md — Header, Jan-Tabelle, aktive Detailpläne, Risiko-Register, Audit- und Revisionshinweise.
- docs/archive/05_ZUKUNFTSPLANUNG_ARCHIV.md — Abschlussindex um 2.7 ergänzen und Restprüfungen außerhalb der aktiven Tabelle präzisieren.
- 01_WORLDMAP_STATUS.md — aktive Roadmap und Archivindex verlinken; alten 2.4-Worldmap-Pfad entfernen.
- docs/superpowers/plans/2026-08-14-zukunftsplanung-aktive-roadmap.md — diesen ausgeführten Plan mit dem tatsächlichen Scope synchron halten.

**Nicht ändern:**

- src/**, supabase/**, package.json, .env*, Produktionskonfiguration und bestehende Detailnachweise.

## Ausführung

### Task 1: Archivindex und Abschlussstatus

**Dateien:** docs/archive/05_ZUKUNFTSPLANUNG_ARCHIV.md

- [x] Die zehn Nutzerpunkte 1.1, 1.2, 1.4, 1.5, 1.6, 1.7, 1.9, 2.2, 2.5, 2.7 aufnehmen.
- [x] Den bereits abgeschlossenen Punkt 2.4 ebenfalls als archivierte Detailquelle führen.
- [x] 2.7 als technisch produktiv abgeschlossen kennzeichnen und die 24-Stunden-Kostenplausibilisierung als Restprüfung erhalten.
- [x] 1.10 als einzige ausdrücklich noch laufende Restprüfung außerhalb der kurzen Tabelle ausweisen.

### Task 2: Jan-Tabelle kürzen

**Datei:** worldmap/05_ZUKUNFTSPLANUNG.md

- [x] Die abgeschlossenen Zeilen aus der aktiven Tabelle entfernen.
- [x] Trigger.dev als P22 ergänzen, weil der Detailplan vorhanden war, aber der Tabellenpunkt fehlte.
- [x] Die Tabelle auf 13 Entscheidungsspalten und aktive Zeilen reduzieren.
- [x] Lange historische Erläuterungen durch Archivregel, Reihenfolge und Scope-Hinweis ersetzen.
- [x] Punkt-IDs stabil halten, damit alte Gesprächs- und Dokumentverweise nicht brechen.

### Task 3: Aktiven Detailplan und Risiko-Register bereinigen

**Datei:** worldmap/05_ZUKUNFTSPLANUNG.md

- [x] Detailblöcke für 1.1, 1.2, 1.4, 1.5, 1.6, 1.7, 1.9, 1.11, 2.2, 2.4, 2.5 und 2.7 aus Abschnitt 3 entfernen.
- [x] Den aktiven Detailplan-Hinweis auf den Archivindex setzen.
- [x] Archivierte Risiken für 2.4 und 1.9 aus dem aktiven Risiko-Register entfernen; allgemeine Risiken und Risiken aktiver Initiativen behalten.
- [x] Risiko-Register und Abschnitt 3 sprachlich auf aktive Initiativen begrenzen.

### Task 4: Querverweise synchronisieren

**Datei:** 01_WORLDMAP_STATUS.md

- [x] Die Kurzbeschreibung der Zukunftsplanung auf die aktive Kurz-Roadmap aktualisieren.
- [x] Den alten 2.4-Worldmap-Eintrag durch den Docs-Archivindex ersetzen.
- [x] Den kanonischen 2.4-Detailnachweis unter docs/architecture/ erhalten.
- [x] Zwei weitere vorbestehende Statuszeilen mit entfernten Commit-Quelldateien als archivierte, nicht verlinkte Historie gekennzeichnet.

## Next-Level-Fehleraudit

Die folgenden Fehlerfälle wurden vor dem Abschluss gezielt berücksichtigt:

- [x] Archivierte Zeile bleibt aktiv: Prüfung, dass keine archivierte Nummer in der Jan-Tabelle erscheint.
- [x] Aktiver Detailplan fehlt in der Tabelle: Trigger.dev wurde als P22 ergänzt; aktive Nachtragsinitiativen werden gegen die Tabelle abgeglichen.
- [x] 2.7 widersprüchlicher Status: 2.7 erscheint nicht mehr als aktive Zeile; die offene Kostenprüfung bleibt ausschließlich im Archivhinweis.
- [x] Broken Link nach 2.4-Verschiebung: Alle Vorkommen des alten Worldmap-Pfads wurden gesucht und der Statusindex korrigiert.
- [x] Vorbestehende tote R1-/R2-Commit-Links im Statusindex wurden als entfernte Quelldateien gekennzeichnet.
- [x] Stabile Referenzen brechen: Punkt-IDs werden nicht neu nummeriert.
- [x] Tabelle wächst wieder unkontrolliert: Spaltenumfang und Archivregel sind direkt vor der Tabelle festgehalten.
- [x] Historie wird versehentlich gelöscht: Die zehn Nutzerpunkte, 2.4 und 2.7 bleiben über Archivindex und Detaildateien nachvollziehbar.
- [x] Runtime-Scope wird überschritten: Geänderte Dateien liegen ausschließlich in Markdown-Dokumentation.

## Verifikation

- [x] Test-Path für alle Archiv- und Detailnachweise.
- [x] rg-Prüfung auf den alten 2.4-Worldmap-Pfad.
- [x] rg-Prüfung auf archivierte Nummern in der aktiven Jan-Tabelle.
- [x] Abgleich der aktiven Tabellen-Punkt-IDs mit den aktiven Detailüberschriften.
- [x] git diff --check ausgeführt; verbleibende Warnungen stammen aus vorbestehenden Dateien außerhalb dieses Dokumentations-Scope.
- [x] Durch diese Execution wurden src/, supabase/, package.json und ENV-Dateien nicht verändert; bereits vorhandene Worktree-Änderungen bleiben vorbestehend.

## Execution-Ergebnis

Die Roadmap ist bereinigt: Die Jan-Übersicht führt nur noch aktive Vorhaben, die zehn abgeschlossenen Nutzerpunkte sowie 2.4 und 2.7 sind im Docs-Archivindex erhalten. Der aktive Plan ist kürzer, Trigger.dev ist als eigener Tabellenpunkt sichtbar, der alte 2.4-Pfad ist entfernt, und das zusätzliche Fehleraudit deckt Status-, Link-, Traceability- und Scope-Regressions ab.
