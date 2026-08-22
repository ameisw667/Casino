# 99 — CLAUDE.md: Verbesserung der Startkontext-Struktur

> **Status:** Bewertung · **Stand:** 2026-08-21 · **Scope:** Aufteilung von Kernregeln, SOPs und Referenzen. Diese Datei ändert keine Regel in `CLAUDE.md`.

## Bewertung

Schätzung für `CLAUDE.md` als LLM-Startkontext: **Top 25 %**.

| Bereich | Niveau | Beleg |
| --- | --- | --- |
| Sicherheits- und Geldregeln | Top 15 % | Server-Autorität, Fail-Closed, alte RPC-Kette verboten |
| Arbeitsregeln | Top 20 % | Output, Klärung, Doku-Pflege, Befehle |
| Architektur-Orientierung | Top 25 % | Service-, API-, State- und DB-Übersichten |
| Kontext-Effizienz | Top 60 % | 221 Zeilen / 35.453 Bytes werden bei jeder Aufgabe geladen |
| SOP-Routing | Top 35 % | 3 SOPs geroutet, 6 weitere SOPs noch nicht im Router |

Zielwert: **Top 10–15 %** durch einen Kern von etwa **60–90 Zeilen** plus On-Demand-Referenzen.

## Kernregel, SOP oder Referenz

Nicht jede ausgelagerte Datei ist eine SOP.

| Artefakt | Zweck | Beispiel |
| --- | --- | --- |
| Kernregel in `CLAUDE.md` | Gilt bei jeder Aufgabe | Wallet-Autorität liegt nie im Browser |
| SOP | Beschreibt Ablauf, Trigger und Prüfschritte | Migration erstellen und verifizieren |
| Referenz | Beschreibt Ist-Zustand oder Systemkarte | Vollständige API-Routen-Tabelle |

Die Architektur-Tabellen sind überwiegend Referenzen. Sie sollten daher nicht zwangsweise zu SOPs werden.

## Empfehlungen

| Bereich | Entscheidung | Zielort |
| --- | --- | --- |
| Output | Behalten | `CLAUDE.md` |
| Klärung offener Punkte | Behalten | `CLAUDE.md` |
| Q&A | Nicht neu anlegen; durch „Klärung“ abgedeckt | — |
| Doku-Aktualität | Behalten, auf 3–5 Regeln kürzen | `CLAUDE.md` |
| Supabase | Projekt-ID, Master-DB-Warnung und Remote-vs.-lokal-Regel behalten | `CLAUDE.md` |
| Supabase-Tabellen, Migrationen, RPCs | Auslagern | `xx_sop/05_database_supabase.md` |
| Commands | Behalten | `CLAUDE.md` |
| Auto-Allow / Execution Policy | Auslagern; betrifft Shell-Ausführung | `xx_sop/02_workflow_jan_execution.md` |
| Tech Stack | Eine Zeile behalten | `CLAUDE.md` |
| Service Layer | Auslagern | `xx_sop/06_service_layer_casino.md` |
| Analytics | Auslagern | `xx_sop/08_analytics_posthog.md` |
| State | Wallet-Regel im Kern; Store-Details auslagern | `CLAUDE.md` + `xx_sop/06_service_layer_casino.md` |
| API Routes, Proxy, Admin | Auslagern | `xx_sop/07_api_backend_routes.md` |
| Layout, Games, Komponenten | Systemkarte auslagern | `docs/architecture/00_SYSTEM_MAP.md` |
| Design-System-Regeln | Auslagern | `xx_sop/04_design_system_ui.md` |
| Key Constraints | Behalten, auf 5–8 Invarianten verdichten | `CLAUDE.md` |
| Database Architecture | Auslagern | `xx_sop/05_database_supabase.md` |
| Workflows & SOPs | Behalten und auf 9 Trigger erweitern | `CLAUDE.md` |

## Kernstruktur für CLAUDE.md

1. Output
2. Klärung und Scope
3. Nicht verhandelbare Invarianten
   - Wallet und Settlement
   - Secrets
   - Auth-, Rate-Limit- und DB-Fehler
   - Alte RPC-Kette
4. Doku-Pflege
5. Supabase-Kurzkontext
6. Commands
7. Tech-Stack in einer Zeile
8. SOP-Router

## SOP-Router

Nach Commit der vorhandenen Dateien sollte der Router mindestens diese Trigger enthalten:

| Trigger | Datei |
| --- | --- |
| Optionen, Architektur, Scope | `xx_sop/01_workflow_jan_option_gate.md` |
| Umsetzung, Selbstprüfung | `xx_sop/02_workflow_jan_execution.md` |
| Worldmap, Roadmap, Planungsdatei | `xx_sop/03_workflow_jan_planungsdateien.md` |
| React, CSS, UI, Motion | `xx_sop/04_design_system_ui.md` |
| Supabase, Migration, RPC, RLS | `xx_sop/05_database_supabase.md` |
| Casino-Logik, RNG, Settlement, Store | `xx_sop/06_service_layer_casino.md` |
| API, Route, Proxy, Admin | `xx_sop/07_api_backend_routes.md` |
| PostHog, Events, Consent | `xx_sop/08_analytics_posthog.md` |
| Wallet, Auth, Security-Review | `xx_sop/09_security_wallet_invariants.md` |

## Zielbild

| Ebene | Leitfrage |
| --- | --- |
| `CLAUDE.md` | Was gilt bei jeder Aufgabe? |
| SOP | Wie wird bei diesem Thema gearbeitet? |
| Systemkarte | Wo liegt welche Komponente? |
| Worldmap | Was ist geplant oder offen? |
| Archiv | Warum wurde eine Entscheidung getroffen? |
