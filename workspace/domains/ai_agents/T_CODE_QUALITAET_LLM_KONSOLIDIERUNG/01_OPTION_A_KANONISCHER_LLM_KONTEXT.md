# Option A — Kanonischer LLM-Kontext

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM
> **Scope:** Quellenhierarchie für volatile Fakten und schlanke Dokumentationsnavigation.
> **Money-Pfad:** Nein · **Security-Review:** Nein

## Bewertung

| Lerneffekt | Aufwand/Komplexität | Risiko | Wartbarkeit | Gewichteter Score |
| ---------: | ------------------: | -----: | ----------: | ----------------: |
|        4,8 |                 4,4 |    4,6 |         4,8 |       **4,7 / 5** |

**Beleg:** GEMINI.md nennt 001–037, CLAUDE.md 001–049, der lokale Bestand enthält 69 SQL-Dateien bis 069. docs/README beschreibt zugleich manuelle Synchronität und einen unvollständigen Index.

| ID  | Befund                            | Policy                                                   | Ausführung  | Verifikation                             | Plan                                                                       |
| --- | --------------------------------- | -------------------------------------------------------- | ----------- | ---------------------------------------- | -------------------------------------------------------------------------- |
| A01 | Mehrere mutable Migrationszahlen  | P1: Bestand ist Primärquelle; Startdateien verweisen nur | Sequenziell | Dateiliste, höchste Nummer, Textabgleich | [A01](Planungsdateien/02_a01_kanonischer_migrationskontext_plan.md)        |
| A02 | Router und einzelne Links driften | Router enthält Navigation, keine volatile Inventarzahl   | Sequenziell | relative Pfade, Case und Ziele           | [A02](Planungsdateien/04_a02_dokumentationsrouter_linkintegritaet_plan.md) |

A ändert weder SQL, Schema, RLS, RPCs, Produktcode noch Live-Status. Die Ausführung folgt P1 aus der [Arbeitssteuerung](00_CODE_QUALITAET_LLM_KONSOLIDIERUNG_UEBERSICHT.md).
