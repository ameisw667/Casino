# 00 — MCP: Verbesserungsplan

> **Status:** 🟡 Lebendes Arbeitsdokument · **Stand:** 2026-09-06 · **Owner:** Jan / LLM
> **Worldmap-Kategorie:** 16 MCP · Projektübergreifende Tooling-Kompetenz, kein Code dieses Repos.

## 1 — Executive Summary für Jan

Der gewichtete Reifegrad liegt bei **Top 43 %** — nahe an der bisherigen Worldmap-Headline **Top 45 %** (unveränderte Übernahme aus [`worldmap/Tooling/01_mcp.md`](../worldmap/Tooling/01_mcp.md), dort als ungewichteter Schnitt über 7 Positionen ≈ Top 49 % berechnet). Anders als bei den Security-lastigen Kategorien (API, Auth, LLM) bestätigt diese Aufschlüsselung die bestehende Headline weitgehend, statt sie zu widerlegen — es gibt hier keinen Selbstwiderspruch, nur eine fehlende `T_`-Ordner-Formalisierung. Größte Lücke bleibt der noch unbegonnene Supabase-MCP-Pilot (P1, read-only), der laut Quelldatei der nächste sinnvolle Lernschritt ist.

## 2 — Bewertungsmethode

Gewichtung nach praktischem Nutzungsgewicht (wie zentral wäre der Pilot im Alltag, falls fertig) statt nach Sicherheitsrisiko — MCP-Server sind hier reine Lern-/Tooling-Kompetenz ohne eigenen Code in diesem Repo. Werte und Status stammen aus [`worldmap/Tooling/01_mcp.md`](../worldmap/Tooling/01_mcp.md).

## 3 — Die 7 Subkategorien: Gewichtung & Bewertung

|  #  | MCP-Server                    | Gewicht |  Niveau  | Status | Befund                                                                                                           |
| :-: | :---------------------------- | :-----: | :------: | :----: | :--------------------------------------------------------------------------------------------------------------- |
|  1  | GitHub MCP                    | **20**  | Top 25 % |   🟢   | Executed (2026-08-21): 3 MCP-Server, Datenvergleich und 401-Negativtest verifiziert.                             |
|  2  | Sentry MCP                    | **18**  | Top 15 % |   🟢   | Abgeschlossen (2026-08-19): CLI-vs-MCP-Vergleich für dieselbe Issue deckungsgleich.                              |
|  3  | Playwright MCP                | **16**  | Top 15 % |   🟢   | Abgeschlossen (2026-08-19): Read-only-Pilot, `/fairness`-404 als Testfall überführt.                             |
|  4  | Supabase MCP (read-only)      | **16**  | Top 90 % |   🔴   | Vorschlag, jetzt P1 — nächster sinnvoller Lernschritt laut Quelldatei, noch nicht eingerichtet.                  |
|  5  | Context7 MCP                  | **12**  | Top 20 % |   🟢   | Abgeschlossen (2026-08-21): Tool-Namen nach Neustart verifiziert, deckungsgleich mit `docs-lookup`-Agent.        |
|  6  | Vercel MCP (read-only Subset) | **10**  | Top 85 % |   🔴   | Vorschlag, noch nicht eingerichtet — nur Read-only-Subset (`list_deployments`, `get_deployment`, `get_project`). |
|  7  | DeepWiki MCP                  |  **8**  | Top 90 % |   🔴   | Vorschlag, noch nicht eingerichtet.                                                                              |

## 4 — Gewichteter Gesamt-Schnitt

`Σ(Gewicht × Niveau) / 100 = 42,6` → **Top 43 %**. Liegt nahe am bisherigen Worldmap-Headlinewert (Top 45 %) — anders als bei anderen Kategorien bestätigt die Gewichtung hier den Ist-Stand, statt ihn zu revidieren.

## 5 — Priorisierte Verbesserungs-Reihenfolge

1. Supabase MCP read-only einrichten (P1 laut Quelldatei) — Projekt- und Tool-Scope dokumentieren, harmlose Tabellen-/Migrationsabfrage als Nachweis.
2. Vercel MCP (read-only Subset) als CLI-Vergleichsbaustein.
3. DeepWiki MCP für GitHub-Repo-Wikis/Docs.

## 6 — Verwandte Artefakte

- [MCP-Integrations-Lernlandkarte (volle Detailtabellen je Kategorie)](../worldmap/Tooling/01_mcp.md)
- [Opensource-Tools-Recherche (weitere Kandidaten)](../worldmap/Tooling/03_opensource_tools_recherche.md)
- [CLI-Übersicht (Pendant, gleiche Methodik)](../T_CLI/00_CLI_UEBERSICHT.md)
- [Worldmap-Status](../worldmap/00_WORLDMAP_STATUS.md)
