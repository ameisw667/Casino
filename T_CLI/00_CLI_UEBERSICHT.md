# 00 — CLI: Verbesserungsplan

> **Status:** 🟡 Lebendes Arbeitsdokument · **Stand:** 2026-09-06 · **Owner:** Jan / LLM
> **Worldmap-Kategorie:** 17 CLI · Projektübergreifende Tooling-Kompetenz, kein Code dieses Repos.

## 1 — Executive Summary für Jan

Der gewichtete Reifegrad liegt bei **Top 25 %** — identisch mit der bisherigen Worldmap-Headline **Top 25 %** (unveränderte Übernahme aus [`worldmap/Tooling/02_cli.md`](../worldmap/Tooling/02_cli.md), dort als ungewichteter Schnitt über 6 aktiv genutzte CLIs berechnet). Wie bei Kategorie 16 (MCP) bestätigt die Gewichtung nach Nutzungsimportanz hier den bestehenden Wert, statt ihn zu revidieren — diese Kategorie hat keinen Selbstwiderspruch wie API/Auth/LLM. Größte Lücke bleibt Vercel CLI (Top 80 %, nur Basis-Nutzung: Deploy-/Log-Abfrage, keine Tiefe).

## 2 — Bewertungsmethode

Gewichtung nach praktischem Nutzungsgewicht im Alltag (wie oft/zentral wird das Tool eingesetzt), nicht nach Sicherheitsrisiko — CLI-Kompetenz ist reines Tooling-Skill, kein Code dieses Repos. Werte und Status stammen aus [`worldmap/Tooling/02_cli.md`](../worldmap/Tooling/02_cli.md).

## 3 — Die 6 Subkategorien: Gewichtung & Bewertung

|  #  | CLI                 | Gewicht |  Niveau  | Status | Befund                                                                                                                                      |
| :-: | :------------------ | :-----: | :------: | :----: | :------------------------------------------------------------------------------------------------------------------------------------------ |
|  1  | Supabase CLI        | **20**  | Top 12 % |   🟢   | Abgeschlossen (2026-08-18): `config.toml`, Link, reproduzierbarer Local-Stack.                                                              |
|  2  | GitHub CLI (`gh`)   | **20**  | Top 25 % |   🟢   | Executed (2026-08-21): CLI-Kontext, Datenvergleich und 401-Negativtest verifiziert.                                                         |
|  3  | Trigger.dev SDK/CLI | **15**  | Top 5 %  |   🟢   | Abgeschlossen & vertieft (2026-08-21): 7 Tasks deployt, Concurrency-Queues, Human-in-the-Loop Wait-Tokens, 2× Security-Review ohne Befunde. |
|  4  | Sentry CLI          | **15**  | Top 15 % |   🟢   | Abgeschlossen (2026-08-18): reproduzierbarer lokaler Diagnoseweg.                                                                           |
|  5  | Playwright CLI      | **15**  | Top 15 % |   🟢   | Erledigt (2026-08-17): lokale Browser-Session, Snapshot, Trace, Screenshot reproduzierbar.                                                  |
|  6  | Vercel CLI/API      | **15**  | Top 80 % |   🟠   | Eingerichtet (2026-08-18), aber nur Basis-Nutzung: Deploy-/Log-Abfrage, keine Tiefe (Runtime-Logs als zweite Diagnoseebene fehlt).          |

## 4 — Gewichteter Gesamt-Schnitt

`Σ(Gewicht × Niveau) / 100 = 24,65` → **Top 25 %**. Identisch mit dem bisherigen Worldmap-Headlinewert — Gewichtung ändert hier nichts, bestätigt nur den Ist-Stand.

## 5 — Priorisierte Verbesserungs-Reihenfolge

1. Vercel Runtime Logs/Errors als zweite Diagnoseebene einrichten (größte Einzellücke).
2. Dependabot/GitHub Security Advisories aktivieren (bisher nicht Teil der 6 aktiv genutzten CLIs, aber naheliegende Erweiterung des GitHub-CLI-Einsatzes).

## 6 — Verwandte Artefakte

- [CLI-Integrations-Lernlandkarte (volle Detailtabellen je Kategorie)](../worldmap/Tooling/02_cli.md)
- [Opensource-Tools-Recherche (weitere Kandidaten)](../worldmap/Tooling/03_opensource_tools_recherche.md)
- [MCP-Übersicht (Pendant, gleiche Methodik)](../T_MCP/00_MCP_UEBERSICHT.md)
- [Worldmap-Status](../worldmap/00_WORLDMAP_STATUS.md)
