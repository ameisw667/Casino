# Workflow-Jan Option-Gate

> **Zweck:** Vor jeder größeren Implementierung oder Architektur-Entscheidung genau 3 technisch lauffähige Optionen strukturiert aufbereiten und Jan zur Auswahl vorlegen.

---

## 1 — Optionen-Generierung

Vor jeder Umsetzung genau 3 relevanteste, distinkte, technisch lauffähige Optionen erstellen:

- **Option 1 (Empfohlen)**: Höchster Nutzen bei minimaler Code- und DB-Komplexität.
- **Option 2**: Alternative Architektur (z. B. höhere Modularität oder erweiterter Funktionsumfang).
- **Option 3**: Minimaler Schnellpfad oder abweichender Standard-Ansatz.

---

## 2 — Schematische Aufbereitung

Aufbereitung nach dem standardisierten `Jan-Optionen-Schema`:

- Vergleichstabelle zur Entscheidungsfindung in unter 30 Sekunden.
- 3-Zeilen-Detailblock je Option für technische Klarheit.

### Tabellen-Standard (Pflicht für LLM-Output)

| Option | Konzept & Architektur | Nutzen (Jan / System) | Aufwand & Komplexität | Overengineering-Risiko | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Option 1 (Empfohlen)** | <Kurzbeschreibung> | <Konkreter Mehrwert> | <z. B. 1 Datei, 0 Migrationen> | Niedrig | ✅ Empfohlen |
| **Option 2** | <Kurzbeschreibung> | <Konkreter Mehrwert> | <z. B. 3 Dateien, 1 RPC> | Mittel | ⚪ Alternative |
| **Option 3** | <Kurzbeschreibung> | <Konkreter Mehrwert> | <z. B. Refactor, 1 Tabelle> | Hoch | ❌ Nicht empfohlen |

---

## 3 — Optionen-Selbstprüfung

Prüfung vor Ausgabe:

1. **Lerneffekt für Jan**: Lerneffekt für den User Jan vorhanden?
2. **Nicht-Scope**: Sind Grenzen und Ausschlüsse für jede Option benannt?
3. **Verifizierbarkeit**: Sind betroffene Dateien und Test-URLs angegeben?

---

## 4 — Stopp & Übergabe

- Nach Ausgabe der Optionen-Matrix sofort stoppen.
- Keine Code-Edits oder Dateierstellungen vor Jans expliziter Auswahl (z. B. „Option 1“).
- Nach Freigabe: Übergang in `Workflow-Jan Execution` (siehe [02_workflow_jan_execution.md](02_workflow_jan_execution.md)).
