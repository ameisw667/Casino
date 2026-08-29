# 02 — MCP — Integrations-Lernlandkarte

> Stand: **2026-08-27** — abgespalten aus der bisherigen gemeinsamen Datei `01_API_MCP_CLI.md` (Aufteilung nach Interface-Typ auf Jans Wunsch). Die alte Datei ist archiviert.
> Projekt: **Casino / Next.js 16.3 / Supabase / Sentry**
> Zweck: Lern- und Entscheidungsgrundlage für MCP-Server (Model Context Protocol) — wie KI-Agenten (Claude Code) externe Tools/Datenquellen ansprechen. **Projektübergreifende Kompetenz, kein Code dieses Repos** — die App selbst hat keinen eigenen MCP-Server. Diese Datei ist zunächst eine Analyse und Roadmap; sie führt keine neue Integration automatisch aus.
> Abgrenzung: Externe APIs, die die App selbst aufruft → [01_api.md](01_api.md). CLI-Tool-Nutzung → [03_cli.md](03_cli.md).

## Übersicht für Jan

> **P1 — nächster sinnvoller Lernschritt:** Sicherer, read-only Supabase-MCP-Pilot (CLI-Baseline seit 2026-08-18 abgeschlossen, siehe `docs/archive/01_Supabase-CLI.md`).

### Kompaktübersicht (nach Kategorie, sortiert nach bestem Niveau)

| Kategorie     | Status | Niveau-Spanne | Erledigt/Gesamt | Namen                      |
| ------------- | ------ | ------------- | --------------- | -------------------------- |
| Observability | 🟢     | Top 15%       | 1/1             | Sentry MCP                 |
| Tests         | 🟢     | Top 15%       | 1/1             | Playwright MCP             |
| Dokumentation | 🟢/⬜  | Top 20–90%    | 1/2             | Context7 MCP, DeepWiki MCP |
| Repository    | 🟢     | Top 25%       | 1/1             | GitHub MCP                 |
| Datenbank     | ⬜     | Top 90%       | 0/1             | Supabase MCP               |
| Hosting       | ⬜     | Top 85%       | 0/1             | Vercel MCP (read-only)     |

> **Rechnerischer Schnitt über alle 7 Positionen:** (15+15+20+25+90+85+90)/7 ≈ **Top 49 %**, in `00_WORLDMAP_STATUS.md` Kategorie 16 gerundet als **Top 45 %** geführt.
> **Skalen:** Niveau = Top 1 % (Referenzniveau, kaum verbesserbar) bis Top 100 % (nicht gestartet). Bewertung = R (Risiko) · I (Impact) · L (Lerneffekt) · A (Aufwand), jeweils Niedrig/Mittel/Hoch.

### Detailtabellen

#### Observability

| Nr. | Meilenstein                                           | Status                                                                                                                                    | Niveau  | Bewertung                                     |
| --- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------- | --------------------------------------------- |
| 7   | Sentry MCP für agentische Issue-/Performance-Abfragen | 🟢 Abgeschlossen (2026-08-19) — CLI-vs-MCP-Vergleich für dieselbe Issue deckungsgleich, Details: `docs/archive/01_SentryCLI_SentryMCP.md` | Top 15% | R: Niedrig · I: Mittel · L: Hoch · A: Niedrig |

#### Tests

| Nr. | Meilenstein                                      | Status                                                                                                                                                                           | Niveau  | Bewertung                                       |
| --- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------- |
| 9   | Playwright MCP als interaktiver Agenten-Debugger | 🟢 Abgeschlossen (2026-08-19) — Read-only-Pilot, `/fairness`-404 als Testfall überführt, Dev-Server-Fehlerfall real ausgelöst — Details: `docs/archive/01_Playwright-CLI-MCP.md` | Top 15% | R: Niedrig · I: Mittel · L: Mittel · A: Niedrig |

#### Dokumentation

| Nr. | Meilenstein                                                         | Status                                                                                                                                                | Niveau  | Bewertung                                        |
| --- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------ |
| 19  | Context7 MCP für aktuelle Library-Dokumentation im Agenten-Workflow | 🟢 Abgeschlossen (2026-08-21) — Tool-Namen nach Neustart verifiziert, deckungsgleich mit `docs-lookup`-Agent — Details: `docs/archive/01_context7.md` | Top 20% | R: Niedrig · I: Mittel · L: Niedrig · A: Niedrig |
| 29  | DeepWiki MCP für GitHub-Repo-Wikis/Docs                             | ⬜ Vorschlag, noch nicht eingerichtet                                                                                                                 | Top 90% | R: Niedrig · I: Niedrig · L: Mittel · A: Niedrig |

#### Repository

| Nr. | Meilenstein                                   | Status                                                                                                                        | Niveau  | Bewertung                                       |
| --- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------- |
| 14  | GitHub MCP für Issues, Actions und PR-Kontext | 🟢 Executed (2026-08-21): 3 MCP-Server, Datenvergleich und 401-Negativtest verifiziert — Details: `docs/archive/01_github.md` | Top 25% | R: Niedrig · I: Mittel · L: Mittel · A: Niedrig |

> CLI-Pendant (`gh`) siehe [03_cli.md](03_cli.md) — gleicher Nachweis, deckungsgleicher Datenvergleich CLI vs. MCP.

#### Datenbank

| Nr. | Meilenstein                                        | Status                                       | Niveau  | Bewertung                             |
| --- | -------------------------------------------------- | -------------------------------------------- | ------- | ------------------------------------- |
| 12  | Supabase MCP projektbezogen und zunächst read-only | ⬜ Vorschlag — jetzt P1 (siehe Hinweis oben) | Top 90% | R: Hoch · I: Hoch · L: Hoch · A: Hoch |

#### Hosting

| Nr. | Meilenstein                                                                                                      | Status                                                                                    | Niveau  | Bewertung                                     |
| --- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------- | --------------------------------------------- |
| 28  | Vercel MCP (read-only Teilmenge: `list_deployments`, `get_deployment`, `get_project`) als CLI-Vergleichsbaustein | ⬜ Vorschlag, noch nicht eingerichtet — nur Read-only-Subset, keine `buy_*`/Schreib-Tools | Top 85% | R: Niedrig · I: Mittel · L: Hoch · A: Niedrig |

## Inspiration für Jan

> Vorschläge des LLM für weitere MCP-Kandidaten, die aktuell in keinem Worldmap-Dokument stehen. Noch nicht bewertet oder freigegeben — reine Anregung zur Diskussion. Recherche-Kontext (Methodik, alle Detailergebnisse): [`01_opensource_tools_recherche.md`](01_opensource_tools_recherche.md).

| #   | Kategorie     | Meilenstein                                                                                                               | Tool                       | Status                                                                                                                                                                                                                         | Kurzbeschreibung                                                                                                                                     | Niveau  | Lerneffekt | Verhältnismäßigkeit |
| --- | ------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------- | ------------------- |
| 4   | Performance   | Lighthouse CI / Chrome DevTools MCP für reproduzierbare Core-Web-Vitals-Messung (LCP/INP/CLS)                             | Lighthouse CI (MCP-Teil)   | ⬜ Vorschlag                                                                                                                                                                                                                   | Misst automatisch, wie schnell/flüssig sich die Website anfühlt (Ladezeit, Ruckeln, Layout-Sprünge).                                                 | Top 90% | 🟡 Mittel  | 🟢 Passend          |
| 7   | Sicherheit    | Semgrep MCP für statische Codeanalyse (OWASP-Muster, Secrets-Scan) direkt im Agenten-Workflow                             | Semgrep                    | ⬜ Vorschlag                                                                                                                                                                                                                   | Durchsucht den eigenen Code automatisch nach bekannten Sicherheitsfehlern und versehentlich eingecheckten Passwörtern.                               | Top 90% | 🟡 Mittel  | 🟡 Bedingt passend  |
| 8   | Infrastruktur | Rancher-Desktop-MCP als formalisierter Agenten-Zugriff auf den bestehenden lokalen Container-Stack                        | Rancher Desktop (MCP-Teil) | ⬜ **zurückgestellt (2026-08-23, Jan-Entscheidung)** — Docker's offizielles MCP Toolkit ist Docker-Desktop-exklusiv, Community-Alternative hat volle Schreibrechte ohne Read-only-Schalter, siehe `docs/archive/01_Rancher.md` | Startet eine abgeschottete lokale Kopie von Supabase/Jaeger zum Testen, ohne Produktionsdaten zu berühren.                                           | Top 90% | 🟡 Mittel  | 🔴 Zurückgestellt   |
| 12  | Performance   | Offizieller Google-MCP für live Core-Web-Vitals-Messung (LCP/INP/CLS) direkt gegen die in `CLAUDE.md` fixierten Zielwerte | chrome-devtools-mcp        | ⬜ Vorschlag — Recherche siehe `01_opensource_tools_recherche.md`                                                                                                                                                              | Misst exakt die drei Metriken, die als feste Performance-Ziele definiert sind — bisher nicht automatisiert gemessen (Playwright deckt das nicht ab). | Top 85% | 🟢 Hoch    | 🟢 Passend          |

## Empfohlene Reihenfolge

| Phase | Lern-/Integrationsschritt   | Nachweis für den Abschluss                                                                                                                                                           |
| ----- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P1    | Supabase MCP read-only      | Projekt- und Tool-Scope dokumentiert; harmlose Tabellen-/Migrationsabfrage — nächster sinnvoller Lernschritt (siehe Datenbank-Detailtabelle oben, Meilenstein 12)                    |
| P2    | Sentry MCP                  | 🟢 Erledigt (2026-08-19) — CLI-vs-MCP-Vergleich für dieselbe Issue deckungsgleich — siehe `docs/archive/01_SentryCLI_SentryMCP.md`                                                   |
| P4    | Playwright MCP verifizieren | 🟢 Erledigt (2026-08-19) — Agenten-Browserkontrolle nach Session-Neustart verifiziert, `/fairness`-404-Befund als Testfall überführt — siehe `docs/archive/01_Playwright-CLI-MCP.md` |
| P6    | GitHub MCP                  | 🟢 Erledigt (2026-08-21) — CI-/Issue-/PR-Kontext read-only zusammengeführt, CLI-vs-MCP-Vergleich deckungsgleich, 401-Negativtest dokumentiert — siehe `docs/archive/01_github.md`    |
| P10   | Context7 MCP (Option A)     | 🟢 Erledigt (2026-08-21) — `.mcp.json`-Eintrag ohne Key, Tool-Namen nach Neustart verifiziert — siehe `docs/archive/01_context7.md`                                                  |
