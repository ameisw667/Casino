# 03 — CLI — Integrations-Lernlandkarte

> Stand: **2026-08-27** — abgespalten aus der bisherigen gemeinsamen Datei `01_API_MCP_CLI.md` (Aufteilung nach Interface-Typ auf Jans Wunsch). Die alte Datei ist archiviert.
> Projekt: **Casino / Next.js 16.3 / Supabase / Sentry**
> Zweck: Lern- und Entscheidungsgrundlage für Terminal-/CLI-Tooling. **Projektübergreifende Kompetenz, kein Code dieses Repos** — der Skill (z. B. Supabase-CLI-Bedienung) wandert 1:1 in jedes andere VibeCoding-Projekt mit. Diese Datei ist zunächst eine Analyse und Roadmap; sie führt keine neue Integration automatisch aus.
> Abgrenzung: Externe APIs, die die App selbst aufruft → [01_api.md](01_api.md). MCP-Server-Nutzung → [02_mcp.md](02_mcp.md).

## Übersicht für Jan

### Kompaktübersicht (nach Kategorie, sortiert nach bestem Niveau)

| Kategorie       | Status | Niveau-Spanne | Erledigt/Gesamt | Namen                                             |
| --------------- | ------ | ------------- | --------------- | ------------------------------------------------- |
| Automation      | 🟢     | Top 5%        | 1/1             | Trigger.dev SDK/CLI                               |
| Datenbank       | 🟢     | Top 12–15%    | 2/2             | Supabase-Migrationen im Repo, Supabase CLI        |
| Observability   | 🟢     | Top 15%       | 1/1             | Sentry CLI                                        |
| Tests           | ✅/🟢  | Top 15%       | 2/2             | Playwright E2E-Suite, Playwright CLI              |
| Repository      | 🟢/⬜  | Top 25–90%    | 1/2             | GitHub CLI, Dependabot/GitHub Security Advisories |
| Hosting/Betrieb | 🟢/⬜  | Top 80–85%    | 1/2             | Vercel CLI/API, Vercel Runtime Logs               |

> **Rechnerischer Schnitt über die 6 aktiv genutzten CLIs:** (5+12+15+15+25+80)/6 ≈ **Top 25 %**, so auch in `00_WORLDMAP_STATUS.md` Kategorie 17 geführt.
> **Skalen:** Niveau = Top 1 % (Referenzniveau, kaum verbesserbar) bis Top 100 % (nicht gestartet). Bewertung = R (Risiko) · I (Impact) · L (Lerneffekt) · A (Aufwand), jeweils Niedrig/Mittel/Hoch.

### Detailtabellen

#### Automation

| Nr. | Meilenstein                                                    | Status                                                                                                                                                                                                                                                                                                                                                        | Niveau  | Bewertung                                       |
| --- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------- |
| 17  | Trigger.dev SDK/CLI                                            | 🟢 Abgeschlossen & vertieft (2026-08-21) — Alle 6 Deepdive-Meilensteine (M1–M6): 7 Tasks deployt, global-scoped Idempotenz, Realtime-Browser-Streaming, Concurrency-Queues (Limit 5), Human-in-the-Loop Wait-Tokens (48h-Timeout), entkoppelte Bet-API-Auslösung, 2× Security-Review ohne Befunde — Details: `docs/archive/06_TRIGGER_DEV_DIGEST_DEEPDIVE.md` | Top 5%  | R: Niedrig · I: Hoch · L: Hoch · A: Niedrig     |
| 21  | n8n als visuelle Workflow-Automation                           | 🔴 Geplant — eigene VPS-Instanz (Hostinger) vorhanden, Deep-Dive-Roadmap (Lead-Gen/Enrichment/Outreach-Mastery) geplant, Details: [`07_n8n_deepdive.md`](07_n8n_deepdive.md)                                                                                                                                                                                  | Top 90% | R: Niedrig · I: Mittel · L: Hoch · A: Mittel    |
| 22  | Supabase `pg_cron`/`pg_net` als eigener Automation-Meilenstein | 🟡 Technisch bereits vorhanden (siehe `00_WORLDMAP_STATUS.md` Kategorie 07 „Background Jobs & Scheduling", live gemessen Top 20%), hier noch nicht separat als Tooling-Lernschritt dokumentiert                                                                                                                                                               | Top 40% | R: Niedrig · I: Mittel · L: Mittel · A: Niedrig |
| 23  | GitHub Actions Scheduled Workflows für Repo-Hygiene            | ⬜ Vorschlag, noch nicht eingerichtet                                                                                                                                                                                                                                                                                                                         | Top 90% | R: Niedrig · I: Niedrig · L: Mittel · A: Mittel |

#### Datenbank

| Nr. | Meilenstein                                                           | Status                                                                       | Niveau  | Bewertung                                      |
| --- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------- | ---------------------------------------------- |
| 10  | Supabase-Migrationen im Repository                                    | ✅ 31 Dateien, `031` lokal-only — Details: `docs/archive/01_Supabase-CLI.md` | Top 15% | R: Niedrig · I: Hoch · L: Niedrig · A: Niedrig |
| 11  | Supabase CLI mit `config.toml`, Link und reproduzierbarem Local-Stack | 🟢 Abgeschlossen (2026-08-18) — Details: `docs/archive/01_Supabase-CLI.md`   | Top 12% | R: Niedrig · I: Hoch · L: Niedrig · A: Niedrig |

#### Observability

| Nr. | Meilenstein                                         | Status                                                                            | Niveau  | Bewertung                                       |
| --- | --------------------------------------------------- | --------------------------------------------------------------------------------- | ------- | ----------------------------------------------- |
| 6   | Sentry CLI als reproduzierbarer lokaler Diagnoseweg | 🟢 Abgeschlossen (2026-08-18) — Details: `docs/archive/01_SentryCLI_SentryMCP.md` | Top 15% | R: Niedrig · I: Mittel · L: Mittel · A: Niedrig |

#### Tests

| Nr. | Meilenstein                                                          | Status                                             | Niveau  | Bewertung                                       |
| --- | -------------------------------------------------------------------- | -------------------------------------------------- | ------- | ----------------------------------------------- |
| 8   | Playwright E2E-Test-Suite                                            | ✅ Vorhanden                                       | Top 15% | R: Niedrig · I: Hoch · L: Niedrig · A: Niedrig  |
| 9   | Playwright CLI (lokale Browser-Session, Snapshot, Trace, Screenshot) | 🟢 Erledigt (2026-08-17) — reproduzierbar erstellt | Top 15% | R: Niedrig · I: Mittel · L: Mittel · A: Niedrig |

> MCP-Pendant (interaktiver Agenten-Debugger) siehe [02_mcp.md](02_mcp.md).

#### Repository

| Nr. | Meilenstein                                          | Status                                                                                                                       | Niveau  | Bewertung                                       |
| --- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------- |
| 14  | GitHub CLI (`gh`) für Issues, Actions und PR-Kontext | 🟢 Executed (2026-08-21): CLI-Kontext, Datenvergleich und 401-Negativtest verifiziert — Details: `docs/archive/01_github.md` | Top 25% | R: Niedrig · I: Mittel · L: Mittel · A: Niedrig |
| 27  | Dependabot/GitHub Security Advisories aktivieren     | ⬜ Vorschlag, noch nicht eingerichtet                                                                                        | Top 90% | R: Niedrig · I: Hoch · L: Mittel · A: Niedrig   |

> MCP-Pendant siehe [02_mcp.md](02_mcp.md) — gleicher Nachweis, deckungsgleicher Datenvergleich CLI vs. MCP.

#### Hosting / Betrieb

| Nr. | Meilenstein                                          | Status                                                              | Niveau  | Bewertung                                       |
| --- | ---------------------------------------------------- | ------------------------------------------------------------------- | ------- | ----------------------------------------------- |
| 13  | Vercel CLI/API für Deployments, Logs und Env-Prüfung | 🟢 Eingerichtet (2026-08-18) — Details: `docs/archive/01_Vercel.md` | Top 80% | R: Niedrig · I: Mittel · L: Mittel · A: Niedrig |
| 25  | Vercel Runtime Logs/Errors als zweite Diagnoseebene  | ⬜ Vorschlag, noch nicht eingerichtet                               | Top 85% | R: Niedrig · I: Mittel · L: Mittel · A: Niedrig |

## Inspiration für Jan

> Vorschläge des LLM für weitere CLI-Kandidaten, die aktuell in keinem Worldmap-Dokument stehen. Noch nicht bewertet oder freigegeben — reine Anregung zur Diskussion. Recherche-Kontext (Methodik, alle Detailergebnisse): [`01_opensource_tools_recherche.md`](01_opensource_tools_recherche.md).

| #   | Kategorie     | Meilenstein                                                                                                                              | Tool                                    | Kurzbeschreibung                                                                                                                                                                                        | Niveau  | Lerneffekt | Verhältnismäßigkeit |
| --- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------- | ------------------- |
| 1   | Sicherheit    | npm audit als eingebauter CLI-Befehl für einen ersten Dependency-Sicherheitscheck ohne Zusatz-Tool                                       | npm audit                               | Der in npm eingebaute Befehl, der bekannte Sicherheitslücken in den installierten Paketen auflistet — kein Setup, einfach im Terminal ausführen.                                                        | Top 95% | 🟢 Niedrig | 🟢 Passend          |
| 2   | Codequalität  | knip CLI zum Aufspüren toter Dateien, unused Exports und ungenutzter Dependencies                                                        | knip                                    | Ein Kommandozeilen-Tool, das automatisch ungenutzten Code und nicht mehr gebrauchte npm-Pakete findet — einmal ausführen, Liste lesen, aufräumen.                                                       | Top 90% | 🟢 Niedrig | 🟢 Passend          |
| 3   | Performance   | `@next/bundle-analyzer` als offizielles Next.js-CLI-Plugin zur Visualisierung der JS-Bundle-Größe pro Route                              | Next.js Bundle Analyzer                 | Zeigt als interaktive Grafik, welche Pakete wie viel vom JavaScript jeder Seite belegen.                                                                                                                | Top 90% | 🟡 Mittel  | 🟢 Passend          |
| 6   | Sicherheit    | Socket.dev CLI/API für Supply-Chain-Scan der npm-Dependencies vor jedem Release                                                          | Socket.dev                              | Prüft automatisch, ob eine neu installierte Programmierbibliothek verdächtigen Code enthält — wie ein Virenscanner für Dependencies.                                                                    | Top 90% | 🟡 Mittel  | 🟡 Bedingt passend  |
| 7   | Sicherheit    | Semgrep CLI für statische Codeanalyse (OWASP-Muster, Secrets-Scan)                                                                       | Semgrep                                 | Durchsucht den eigenen Code automatisch nach bekannten Sicherheitsfehlern und versehentlich eingecheckten Passwörtern.                                                                                  | Top 90% | 🟡 Mittel  | 🟡 Bedingt passend  |
| 8   | Infrastruktur | Rancher-Desktop-CLI als formalisierter Zugriff auf den bestehenden lokalen Container-Stack (lokale Supabase-Instanz, Jaeger-Stack)       | Rancher Desktop (Docker-CLI-kompatibel) | Startet eine abgeschottete lokale Kopie von Supabase/Jaeger zum Testen — läuft über Rancher Desktops Docker-kompatible CLI. Runtime läuft (verifiziert 2026-08-23), siehe `docs/archive/01_Rancher.md`. | Top 90% | 🟡 Mittel  | 🔴 Zurückgestellt   |
| 10  | Sicherheit    | Verifikations-basierter Secret-Scanner (prüft per read-only API-Call, ob ein gefundenes Credential noch gültig ist)                      | TruffleHog                              | Findet nicht nur Muster wie ein Regex-Scanner, sondern bestätigt aktiv, ob ein übersehenes Secret gerade jetzt echten Schaden anrichten könnte.                                                         | Top 85% | 🟢 Hoch    | 🟢 Passend          |
| 11  | Repository    | GitHub-Actions-Workflows lokal in Containern ausführen, bevor sie gepusht werden — nutzt bestehende `gh`-CLI und Rancher-Desktop-Runtime | nektos/act                              | Spart echte Actions-Minuten und Wartezeit beim Debuggen von `security-staging.yml`/`red-team-security.yml`, ohne neuen Account.                                                                         | Top 80% | 🟢 Hoch    | 🟢 Passend          |

## Empfohlene Reihenfolge

| Phase | Lern-/Integrationsschritt | Nachweis für den Abschluss                                                                                                                                                                                  |
| ----- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0    | Supabase CLI-Baseline     | 🟢 Erledigt (2026-08-18) — CLI-Version, Login, Link, `config.toml`, `migration list`, Container-Runtime, `supabase start`, `db reset` und npm-Wrapper vollständig — siehe `docs/archive/01_Supabase-CLI.md` |
| P2    | Sentry CLI                | 🟢 Erledigt (2026-08-19) — siehe `docs/archive/01_SentryCLI_SentryMCP.md`                                                                                                                                   |
| P3    | Playwright CLI            | 🟢 Erledigt (2026-08-17) — lokale Browser-Session, Snapshot, Trace und Screenshot reproduzierbar erstellt                                                                                                   |
| P5    | Vercel CLI/API            | 🟢 Erledigt (2026-08-18) — Preview/Logs/Deployment-Metadaten gelesen, keine Secrets ausgegeben                                                                                                              |
| P6    | GitHub CLI                | 🟢 Erledigt (2026-08-21) — CI-/Issue-/PR-Kontext read-only zusammengeführt, 401-Negativtest dokumentiert — siehe `docs/archive/01_github.md`                                                                |
| P9    | Trigger.dev               | Nicht-monetärer Reportjob mit Retry und idempotentem Ergebnis — siehe Automation-Detailtabelle oben                                                                                                         |
