# API, MCP und CLI — Integrations- und Lernlandkarte

> Stand: **2026-08-19** (Playwright-CLI/MCP nachgezogen, Context7-MCP-Plan ergänzt)  
> Projekt: **Casino / Next.js 16.3 / Supabase / Sentry**  
> Zweck: Lern- und Entscheidungsgrundlage für die nächsten Integrationen. Diese Datei ist zunächst eine Analyse und Roadmap; sie führt keine neue Integration automatisch aus.

## Übersicht für Jan

> **P1 — nächster sinnvoller Lernschritt:** Sicherer, read-only Supabase-MCP-Pilot (CLI-Baseline seit 2026-08-18 abgeschlossen, siehe `docs/archive/01_Supabase-CLI.md`).

### Kompaktübersicht (nach Kategorie, sortiert nach bestem Niveau)

| Kategorie      | Status | Niveau-Spanne | Erledigt/Gesamt | Namen                                                                                                                    |
| -------------- | ------ | ------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Anwendung      | ✅     | Top 10–15%    | 4/4             | Supabase, OpenAI Responses API, Telegram Bot API, Upstash Redis                                                          |
| Observability  | 🟢     | Top 10–15%    | 3/3             | Sentry SDK, Sentry CLI, Sentry MCP                                                                                       |
| Tests          | 🟢/✅  | Top 15%       | 2/2             | Playwright E2E, Playwright CLI/MCP                                                                                       |
| Datenbank      | 🟢/⬜  | Top 12–90%    | 2/3             | Supabase-Migrationen, Supabase CLI, Supabase MCP                                                                         |
| Dokumentation  | 🟡/⬜  | Top 45–90%    | 0/2             | Context7 MCP, DeepWiki MCP                                                                                               |
| Hosting        | 🟢/⬜  | Top 80–85%    | 1/2             | Vercel CLI/API, Vercel MCP (read-only)                                                                                   |
| Repository     | 🟡/⬜  | Top 25–90%    | 0/2             | GitHub CLI/MCP, Dependabot/GitHub Security Advisories                                                                    |
| Produktanalyse | 🟢     | Top 65%       | 1/1             | PostHog                                                                                                                  |
| Betrieb        | 🟢/⬜  | Top 20–85%    | 1/4             | Production-Monitoring (Health-Route + UptimeRobot), Telegram-Ops-Alerts, Vercel Runtime Logs/Errors, Synthetic API-Check |
| Automation     | 🟡/⬜  | Top 40–90%    | 0/5             | Trigger.dev, Vercel Cron Jobs, n8n, Supabase pg_cron/pg_net, GitHub Actions Scheduled Workflows                          |

> **Skalen:** Niveau = Top 1 % (Referenzniveau, kaum verbesserbar) bis Top 100 % (nicht gestartet). Bewertung = R (Risiko) · I (Impact) · L (Lerneffekt) · A (Aufwand), jeweils Niedrig/Mittel/Hoch — Niveau ist die primäre Kennzahl, Bewertung liefert nur Zusatzkontext. Alle Werte sind eine LLM-Einschätzung auf Basis der Belege in Abschnitt 1–4 dieser Datei, keine Messung. Lange Status-Begründungen stehen in Abschnitt 3/4 bzw. den verlinkten Detaildateien.

### Detailtabellen

#### Anwendung

| Nr. | Meilenstein                                                 | Status       | Niveau  | Bewertung                                         |
| --- | ----------------------------------------------------------- | ------------ | ------- | ------------------------------------------------- |
| 1   | Supabase im Frontend, Server und Admin-Kontext per SDK/REST | ✅ Vorhanden | Top 10% | R: Mittel · I: Hoch · L: Niedrig · A: Niedrig     |
| 2   | OpenAI Responses API für den Casino-Guide                   | ✅ Vorhanden | Top 15% | R: Niedrig · I: Mittel · L: Niedrig · A: Niedrig  |
| 3   | Telegram Bot API für opt-in Big-Win-Benachrichtigungen      | ✅ Vorhanden | Top 10% | R: Niedrig · I: Niedrig · L: Niedrig · A: Niedrig |
| 4   | Upstash Redis/Rate Limiting über REST-SDK                   | ✅ Vorhanden | Top 10% | R: Mittel · I: Hoch · L: Niedrig · A: Niedrig     |

#### Observability

| Nr. | Meilenstein                                                 | Status                                                                            | Niveau  | Bewertung                                       |
| --- | ----------------------------------------------------------- | --------------------------------------------------------------------------------- | ------- | ----------------------------------------------- |
| 5   | Sentry Next.js SDK inklusive Redaction und Error Boundaries | ✅ Vorhanden                                                                      | Top 10% | R: Niedrig · I: Hoch · L: Niedrig · A: Niedrig  |
| 6   | Sentry CLI als reproduzierbarer lokaler Diagnoseweg         | 🟢 Abgeschlossen (2026-08-18) — Details: `docs/archive/01_SentryCLI_SentryMCP.md` | Top 15% | R: Niedrig · I: Mittel · L: Mittel · A: Niedrig |
| 7   | Sentry MCP für agentische Issue-/Performance-Abfragen       | 🟢 Abgeschlossen (2026-08-19) — Details: `docs/archive/01_SentryCLI_SentryMCP.md` | Top 15% | R: Niedrig · I: Mittel · L: Hoch · A: Niedrig   |

#### Tests

| Nr. | Meilenstein                                          | Status                                                                                                                                     | Niveau  | Bewertung                                       |
| --- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------- | ----------------------------------------------- |
| 8   | Playwright E2E-Test-Suite                            | ✅ Vorhanden                                                                                                                               | Top 15% | R: Niedrig · I: Hoch · L: Niedrig · A: Niedrig  |
| 9   | Playwright CLI/MCP als interaktiver Agenten-Debugger | 🟢 Abgeschlossen (2026-08-19) — Read-only-Pilot, `/fairness`-404 als Testfall überführt — Details: `docs/archive/01_Playwright-CLI-MCP.md` | Top 15% | R: Niedrig · I: Mittel · L: Mittel · A: Niedrig |

#### Datenbank

| Nr. | Meilenstein                                                           | Status                                                                       | Niveau  | Bewertung                                      |
| --- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------- | ---------------------------------------------- |
| 10  | Supabase-Migrationen im Repository                                    | ✅ 31 Dateien, `031` lokal-only — Details: `docs/archive/01_Supabase-CLI.md` | Top 15% | R: Niedrig · I: Hoch · L: Niedrig · A: Niedrig |
| 11  | Supabase CLI mit `config.toml`, Link und reproduzierbarem Local-Stack | 🟢 Abgeschlossen (2026-08-18) — Details: `docs/archive/01_Supabase-CLI.md`   | Top 12% | R: Niedrig · I: Hoch · L: Niedrig · A: Niedrig |
| 12  | Supabase MCP projektbezogen und zunächst read-only                    | ⬜ Vorschlag — separate Initiative, jetzt P1 (siehe Hinweis oben)            | Top 90% | R: Hoch · I: Hoch · L: Hoch · A: Hoch          |

#### Dokumentation

| Nr. | Meilenstein                                                         | Status                                                                                                        | Niveau  | Bewertung                                        |
| --- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------ |
| 19  | Context7 MCP für aktuelle Library-Dokumentation im Agenten-Workflow | 🟡 Config gesetzt, Neustart-Verifikation/Pilot/Fehlerfall offen — Details: [`01_context7.md`](01_context7.md) | Top 45% | R: Niedrig · I: Mittel · L: Niedrig · A: Niedrig |
| 29  | DeepWiki MCP für GitHub-Repo-Wikis/Docs                             | ⬜ Vorschlag, noch nicht eingerichtet                                                                         | Top 90% | R: Niedrig · I: Niedrig · L: Mittel · A: Niedrig |

#### Hosting

| Nr. | Meilenstein                                                                                                      | Status                                                                                    | Niveau  | Bewertung                                       |
| --- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------- | ----------------------------------------------- |
| 13  | Vercel CLI/API für Deployments, Logs und Env-Prüfung                                                             | 🟢 Eingerichtet (2026-08-18) — Details: `docs/archive/01_Vercel.md`                       | Top 80% | R: Niedrig · I: Mittel · L: Mittel · A: Niedrig |
| 28  | Vercel MCP (read-only Teilmenge: `list_deployments`, `get_deployment`, `get_project`) als CLI-Vergleichsbaustein | ⬜ Vorschlag, noch nicht eingerichtet — nur Read-only-Subset, keine `buy_*`/Schreib-Tools | Top 85% | R: Niedrig · I: Mittel · L: Hoch · A: Niedrig   |

#### Repository

| Nr. | Meilenstein                                       | Status                                                                                                            | Niveau  | Bewertung                                       |
| --- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------- |
| 14  | GitHub CLI/MCP für Issues, Actions und PR-Kontext | 🟡 CLI+PAT+3 MCP-Server verbunden (2026-08-19), Vergleich+Runbook offen — Details: [`01_github.md`](01_github.md) | Top 25% | R: Niedrig · I: Mittel · L: Mittel · A: Niedrig |
| 27  | Dependabot/GitHub Security Advisories aktivieren  | ⬜ Vorschlag, noch nicht eingerichtet                                                                             | Top 90% | R: Niedrig · I: Hoch · L: Mittel · A: Niedrig   |

#### Produktanalyse

| Nr. | Meilenstein     | Status                                                                                       | Niveau  | Bewertung                                 |
| --- | --------------- | -------------------------------------------------------------------------------------------- | ------- | ----------------------------------------- |
| 15  | PostHog API/SDK | 🟢 Abgeschlossen und live (2026-08-17) — Details: `docs/archive/05_2.9_PostHog_Analytics.md` | Top 65% | R: Mittel · I: Hoch · L: Mittel · A: Hoch |

#### Betrieb

| Nr. | Meilenstein                                                                | Status                                                                                              | Niveau  | Bewertung                                        |
| --- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------ |
| 16  | Production-Monitoring: `/api/health` + externer Free-Checker (UptimeRobot) | 🟢 Verifiziert (2026-08-16), Rest offen — Details: `docs/archive/05_1.13_Uptime-Kuma-Monitoring.md` | Top 20% | R: Niedrig · I: Mittel · L: Niedrig · A: Niedrig |
| 24  | Telegram statt/zusätzlich zu E-Mail als Alarmkanal                         | ⬜ Vorschlag, noch nicht eingerichtet                                                               | Top 80% | R: Niedrig · I: Mittel · L: Mittel · A: Niedrig  |
| 25  | Vercel Runtime Logs/Errors als zweite Diagnoseebene                        | ⬜ Vorschlag, noch nicht eingerichtet                                                               | Top 85% | R: Niedrig · I: Mittel · L: Mittel · A: Niedrig  |
| 26  | Synthetic Check auf echten API-Endpunkt statt nur `/api/health`            | ⬜ Vorschlag, baut auf Automation-Vorschlag #20 auf                                                 | Top 85% | R: Niedrig · I: Mittel · L: Mittel · A: Mittel   |

#### Automation

| Nr. | Meilenstein                                                    | Status                                                                                                                                                                                                                                                                                                                                                       | Niveau  | Bewertung                                       |
| --- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | ----------------------------------------------- |
| 17  | Trigger.dev SDK/CLI                                            | 🟢 Abgeschlossen und deployed (2026-08-19) — Task implementiert, manueller Testlauf + Telegram-Zustellung verifiziert, Retry real ausgelöst, Security-Review ohne CRITICAL/HIGH, deklarativer Cron (`0 8 * * *` Europe/Berlin, nur Production) deployed; erster automatischer Lauf noch nicht abgewartet — Details: [`01_Trigger.dev.md`](01_Trigger.dev.md) | Top 20% | R: Niedrig · I: Mittel · L: Hoch · A: Niedrig   |
| 20  | Vercel Cron Jobs (Vergleichsbaustein zu Trigger.dev)           | ⬜ Vorschlag, noch nicht eingerichtet                                                                                                                                                                                                                                                                                                                        | Top 85% | R: Niedrig · I: Mittel · L: Hoch · A: Niedrig   |
| 21  | n8n als visuelle Workflow-Automation                           | ⬜ Vorschlag, noch nicht eingerichtet                                                                                                                                                                                                                                                                                                                        | Top 90% | R: Niedrig · I: Mittel · L: Hoch · A: Mittel    |
| 22  | Supabase `pg_cron`/`pg_net` als eigener Automation-Meilenstein | 🟡 Technisch bereits vorhanden, noch nicht dokumentiert                                                                                                                                                                                                                                                                                                      | Top 40% | R: Niedrig · I: Mittel · L: Mittel · A: Niedrig |
| 23  | GitHub Actions Scheduled Workflows für Repo-Hygiene            | ⬜ Vorschlag, noch nicht eingerichtet                                                                                                                                                                                                                                                                                                                        | Top 90% | R: Niedrig · I: Niedrig · L: Mittel · A: Mittel |

## Inspiration für Jan

> Vorschläge des LLM für weitere API-/MCP-/CLI-Kandidaten, die aktuell in keinem Worldmap-Dokument stehen. Noch nicht bewertet oder freigegeben — reine Anregung zur Diskussion.

| #   | Kategorie     | Meilenstein                                                                                                        | Tool                    | Status                                                                                                           | Kurzbeschreibung                                                                                                                                      | Niveau  | Lerneffekt | Verhältnismäßigkeit  |
| --- | ------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------- | -------------------- |
| 1   | Sicherheit    | npm audit als eingebauter CLI-Befehl für einen ersten Dependency-Sicherheitscheck ohne Zusatz-Tool                 | npm audit               | ⬜ Vorschlag                                                                                                     | Der in npm eingebaute Befehl, der bekannte Sicherheitslücken in den installierten Paketen auflistet — kein Setup, einfach im Terminal ausführen.      | Top 95% | 🟢 Niedrig | 🟢 Passend           |
| 2   | Codequalität  | knip CLI zum Aufspüren toter Dateien, unused Exports und ungenutzter Dependencies                                  | knip                    | ⬜ Vorschlag                                                                                                     | Ein Kommandozeilen-Tool, das automatisch ungenutzten Code und nicht mehr gebrauchte npm-Pakete findet — einmal ausführen, Liste lesen, aufräumen.     | Top 90% | 🟢 Niedrig | 🟢 Passend           |
| 3   | Performance   | `@next/bundle-analyzer` als offizielles Next.js-Plugin zur Visualisierung der JS-Bundle-Größe pro Route            | Next.js Bundle Analyzer | ⬜ Vorschlag                                                                                                     | Zeigt als interaktive Grafik, welche Pakete wie viel vom JavaScript jeder Seite belegen — direkt gekoppelt an das Bundle-Budget aus deiner CLAUDE.md. | Top 90% | 🟡 Mittel  | 🟢 Passend           |
| 4   | Performance   | Lighthouse CI / Chrome DevTools MCP für reproduzierbare Core-Web-Vitals-Messung (LCP/INP/CLS)                      | Lighthouse CI           | ⬜ Vorschlag                                                                                                     | Misst automatisch, wie schnell und flüssig sich die Website für echte Besucher anfühlt (Ladezeit, Ruckeln, Layout-Sprünge).                           | Top 90% | 🟡 Mittel  | 🟢 Passend           |
| 5   | Dokumentation | Context7 MCP für aktuelle Library-Dokumentation direkt im Agenten-Workflow statt Trainingsdaten                    | Context7                | ✅ Übernommen in Übersicht Zeile 19 — Option A (Minimal-Pilot) geplant, siehe [`01_context7.md`](01_context7.md) | Liefert dem KI-Assistenten die aktuelle Anleitung einer Bibliothek, statt sich auf veraltetes Trainingswissen zu verlassen.                           | Top 85% | 🟢 Niedrig | 🟢 Passend           |
| 6   | Sicherheit    | Socket.dev CLI/API für Supply-Chain-Scan der npm-Dependencies vor jedem Release                                    | Socket.dev              | ⬜ Vorschlag                                                                                                     | Prüft automatisch, ob eine neu installierte Programmierbibliothek verdächtigen Code enthält — wie ein Virenscanner für Dependencies.                  | Top 90% | 🟡 Mittel  | 🟡 Bedingt passend   |
| 7   | Sicherheit    | Semgrep CLI/MCP für statische Codeanalyse (OWASP-Muster, Secrets-Scan)                                             | Semgrep                 | ⬜ Vorschlag                                                                                                     | Durchsucht den eigenen Code automatisch nach bekannten Sicherheitsfehlern und versehentlich eingecheckten Passwörtern.                                | Top 90% | 🟡 Mittel  | 🟡 Bedingt passend   |
| 8   | Infrastruktur | Docker CLI/MCP als formalisierter Zugriff auf den bestehenden lokalen Stack (Chaos-Tests, lokale Supabase-Instanz) | Docker                  | ⬜ Vorschlag                                                                                                     | Startet eine abgeschottete Kopie von App/Datenbank auf dem eigenen Rechner zum Testen, ohne die echte Datenbank zu berühren.                          | Top 90% | 🟡 Mittel  | 🟡 Bedingt passend   |
| 9   | Betrieb       | Vercel Edge Config API für Feature-Flags/Kill-Switches riskanter Game-Features ohne Redeploy                       | Vercel Edge Config      | ⬜ Vorschlag                                                                                                     | Ein Schalter, um ein riskantes Spiel-Feature sofort auszuschalten, ohne die Website neu hochzuladen.                                                  | Top 95% | 🔴 Hoch    | 🔴 Unpassend aktuell |

> **Sortierung:** nach Verhältnismäßigkeit (bester Fit zuerst), nicht nach Kategorie. Verhältnismäßigkeit = passt Aufwand/Komplexität zu deinem aktuellen Stand bei API/MCP/CLI (Supabase-CLI noch P0, Vercel/GitHub CLI noch nicht eingerichtet) — unabhängig vom reinen Lerneffekt. Deshalb bleibt z. B. Context7 trotz niedrigem Lerneffekt bei 🟢 Passend: minimaler Aufwand, direkter Alltagsnutzen, kein Overengineering. Vercel Edge Config ist umgekehrt 🔴, weil es auf Vercel-CLI-Grundlagen aufbaut, die laut Übersicht oben noch fehlen.
> Zeilen 1–3 sind neu recherchiert (bislang in keiner Datei dieses Projekts referenziert, per `package.json`-Check am 2026-08-17 geprüft).

> **Ab hier: Arbeitskontext für das LLM.** Die folgenden Abschnitte enthalten Belege, Abgrenzungen, Sicherheitsregeln und konkrete Vorschläge für spätere Arbeitsschritte.

## 1. Bewertungsrahmen

### 1.1 Begriffe sauber trennen

- **API:** Die Anwendung spricht einen Dienst direkt aus Code an, zum Beispiel OpenAI, Telegram, Supabase REST oder Upstash REST.
- **SDK:** Eine typisierte Bibliothek kapselt eine API, zum Beispiel `@supabase/supabase-js`, `@sentry/nextjs` oder `@upstash/redis`.
- **CLI:** Ein Mensch oder Skript bedient einen Dienst über das Terminal, zum Beispiel Migrationen, Releases, Logs oder Deployments.
- **MCP:** Ein LLM erhält kontrollierte Werkzeuge für einen Dienst. MCP ist eine Agenten-Schnittstelle, kein Ersatz für die fachliche Runtime-API der Anwendung.

### 1.2 Statusregeln

- ✅ **Vorhanden:** Im Repository oder in der dokumentierten Umgebung technisch belegt.
- 🟡 **Teilweise / historisch:** Ein Teil ist belegt, aber nicht vollständig reproduzierbar, standardisiert oder aktuell konfiguriert.
- ⬜ **Vorschlag:** Sinnvoller Kandidat, aber noch nicht eingerichtet.
- 🔴 **Nicht eingerichtet:** Für diesen Workflow fehlt aktuell ein nachgewiesener Baustein.
- 🔍 **Zu verifizieren:** Es gibt eine plausible Spur, aber der konkrete Zugriff oder die aktuelle Version muss in einem separaten Lernschritt geprüft werden.

### 1.3 Priorisierung

Jeder Vorschlag wird nach vier Achsen bewertet:

1. **Lerneffekt:** Versteht Jan danach ein neues Werkzeugprinzip?
2. **Nutzen für das Spiel:** Verbessert es Sicherheit, Betrieb, Diagnose, Tests oder Produktentscheidungen?
3. **Risiko:** Kann der Zugriff Geldpfade, Produktionsdaten oder Secrets gefährden?
4. **Reproduzierbarkeit:** Kann derselbe Ablauf später per Kommando, Dokumentation oder CI wiederholt werden?

Die Priorität ist absichtlich nicht identisch mit dem maximalen Produktnutzen. Ein kleiner, sicherer CLI-/MCP-Pilot mit sauberem Nachweis ist als Lernschritt wertvoller als eine große neue Produktintegration ohne klare Kontrolle.

## 2. Ist-Zustand: Was wir bereits verwenden

### 2.1 Runtime- und Plattformbasis

| Bereich              | Beleg im Projekt                                                               | Technische Einordnung                                                    |
| -------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Framework            | `package.json`, Next.js `^16.3.0`                                              | Web-App, API-Routes und Server-/Client-Komponenten                       |
| Datenbank/Auth       | `@supabase/ssr`, `@supabase/supabase-js`, `src/utils/supabase/*`               | Browser-, Server- und privilegierter Service-Role-Kontext                |
| Datenbankänderungen  | `supabase/migrations/001_*.sql` bis `030_*.sql`                                | SQL ist versioniert; die CLI-Projektkonfiguration fehlt aktuell          |
| Cache/Rate Limit     | `@upstash/redis`, `@upstash/ratelimit`, `src/lib/security/request-security.ts` | Externer REST-basierter Redis-Dienst; im Sicherheitsweg fail-closed      |
| Fehlertracking       | `@sentry/nextjs`, `src/instrumentation*.ts`, `sentry.*.config.ts`              | Client-, Server- und Request-Error-Tracking mit Redaction                |
| KI-Guide             | `src/lib/casino/chat-guide.ts`                                                 | Direkter Server-Request an die OpenAI Responses API; kein Browser-Key    |
| Telegram             | `src/lib/casino/telegram-api.ts`, `telegram-link.ts`                           | Bot API, Webhook und Big-Win-Nachrichten                                 |
| Browser-Tests        | `@playwright/test`, `tests/*.spec.ts`                                          | E2E-, Regression- und Screenshot-Tests                                   |
| Lokale Infrastruktur | `docker`, `infra/chaos/*`                                                      | Docker ist lokal verfügbar; Chaos-Tests bleiben durch Guards begrenzt    |
| CI                   | `.github/workflows/*`                                                          | GitHub Actions werden verwendet; GitHub CLI ist nicht lokal nachgewiesen |

### 2.2 APIs, die bereits produktiv oder technisch integriert sind

#### Supabase API/SDK

Die Anwendung verwendet Supabase auf mehreren Ebenen:

- Browser-Session über `createBrowserClient` in `src/utils/supabase/client.ts`.
- Server-Session über `createServerClient` in `src/utils/supabase/server.ts`.
- Privilegierter Server-Kontext über `createAdminClient` in `src/utils/supabase/admin.ts`.
- Direkte Remote-Verifikation über `scripts/test-config-remote.mjs` und `scripts/verify-supabase-env.ts`.
- SQL-Migrationen inklusive RLS, RPCs, `pg_cron` und `pg_net` im Ordner `supabase/migrations`.

**Wichtige Abgrenzung:** Supabase ist als Anwendungskomponente bereits erfolgreich eingebunden. Daraus folgt aber noch nicht, dass die Supabase-CLI als lokaler Entwicklungs- und Deployment-Workflow eingerichtet ist.

#### OpenAI Responses API

`src/lib/casino/chat-guide.ts` verwendet den Server-Endpunkt `https://api.openai.com/v1/responses`. Der API-Key bleibt serverseitig. `store:false`, ein fester Guide-Kontext, Zod-Validierung, Rate Limiting und textfreie Telemetrie sind Teil der bestehenden Sicherheitsgrenze.

**Lernwert:** API-Request-Builder, Server-only Secrets, Fehlerklassifizierung, Quota-Verhalten und Kosten-/Token-Telemetrie.

#### Telegram Bot API

Der Telegram-Bot wird über `TELEGRAM_BOT_TOKEN`, Webhook-Validierung und die API-Helfer in `src/lib/casino/telegram-api.ts` angebunden. Die Funktion ist laut Architektur-Dokument mit Migration, Webhook, Linking und Big-Win-Test bereits live verifiziert.

**Lernwert:** Webhook-Sicherheit, idempotente Verarbeitung, Deep-Link-Token und externer Push-Kanal.

#### Upstash REST SDK

`@upstash/redis` und `@upstash/ratelimit` werden im Runtime-Code eingesetzt. `scripts/test-upstash.mjs` prüft Ping und einen separaten Rate-Limit-Test.

**Lernwert:** REST-basierter Redis-Zugriff, TTL/Cache, Rate Limiting, Fail-open versus Fail-closed und externe Ausfalltests.

#### Sentry SDK

`@sentry/nextjs` ist in `package.json` vorhanden. `src/instrumentation-client.ts`, `sentry.server.config.ts` und `sentry.edge.config.ts` bilden die Integration. Zusätzlich existieren Redaction-Tests sowie ein interner Cron-Alert-Pfad.

**Lernwert:** automatische versus manuelle Fehlererfassung, Event-Redaction, Releases, Source Maps, Request-Kontext und Datenschutz.

## 3. Was bereits vorhanden ist, aber als CLI/MCP-Nutzung unterschieden werden muss

### 3.1 Sentry: SDK ✅, CLI 🟢, MCP 🟢

Der archivierte Plan `docs/archive/05_1.0_Sentry.md` dokumentiert einen erfolgreichen Sentry-CLI- und Sentry-MCP-Pilot mit OAuth und lesenden Abfragen (anderer Agenten-Host: Codex Desktop). Das ist ein valider historischer Nachweis.

**Abgeschlossener Plan (Stand 2026-08-19):** `docs/archive/01_SentryCLI_SentryMCP.md` führt den Pilot für den aktuellen Agenten-Host (Claude Code) fort — vollständig ausgeführt und verifiziert, nach `docs/archive/` verschoben.

- `sentry-cli` ist nicht global im PATH, aber über `node_modules/.bin/sentry-cli` verfügbar (`--version` → `sentry-cli 2.58.6`).
- npm-Script-Wrapper `sentry:info`/`sentry:issues` sind in `package.json` ergänzt und verifiziert (2026-08-18) — liefern den erwarteten, sauberen Auth-Fehler ohne Secret-Leck.
- Interaktiver Login (`sentry-cli login`, Personal Token), lesende CLI-Abfragen (`info`, `issues list`) und Sentry-MCP-Verbindung (Registrierung + OAuth, `Status: ✔ Connected`) sind erledigt (2026-08-18).
- CLI-vs-MCP-Vergleich für dieselbe Issue (`JAVASCRIPT-NEXTJS-2`) ist verifiziert (2026-08-19, frische Konversation): Titel, Status und Zeitpunkt stimmen überein.
- Es gibt weiterhin keine repo-lokale MCP-Konfigurationsdatei — MCP-Konfiguration bleibt bewusst lokal im Agenten-Host, nicht im Repository.

**Bewertung:** CLI und MCP sind beide standardisiert, verifiziert und deckungsgleich nachgewiesen — siehe Detailplan.

### 3.2 Playwright: Tests ✅, CLI ✅, MCP ✅

Das Projekt verwendet `@playwright/test` in Version `1.61.0`.

**Abgeschlossener Plan (Stand 2026-08-19):** `docs/archive/01_Playwright-CLI-MCP.md`, Option B (CLI + MCP-Install) — vollständig ausgeführt und verifiziert, nach `docs/archive/` verschoben.

- `node_modules/.bin/playwright.cmd --version` liefert `Version 1.61.0`; der interaktive CLI-Weg unterstützt Browser-Sessions, Snapshots, Netzwerkinspektion, Tracing und Screenshots (verifiziert 2026-08-17).
- Das offizielle `@playwright/mcp`-Paket wurde recherchiert und als MCP-Server installiert/konfiguriert: `.mcp.json` mit `--headless --isolated --allowed-origins=http://localhost:3015`, Version gepinnt auf `0.0.79` (2026-08-18).
- Nach Neustart der Claude-Code-Session verbunden und verifiziert (2026-08-19): `browser_navigate`/`browser_snapshot`/`browser_take_screenshot` gegen `localhost:3015` erfolgreich getestet (Read-only-Pilot gegen `/`).
- Kontrollierter UI-Zustand untersucht: `/fairness` liefert `HTTP status: 404 Not Found` (Root Cause `src/proxy.ts:17`) — als neuer Testfall `tests/fairness-404.spec.ts` überführt und lokal grün verifiziert.
- Realer Fehlerfall ausgelöst: Dev-Server-Prozess (Port 3015) beendet, Downtime beobachtet, automatischer Neustart durch Jans Dev-Setup (neuer PID, kein manueller Eingriff nötig) dokumentiert.

**Bewertung:** Playwright CLI und MCP sind beide standardisiert, verifiziert und mit einem echten Regressionstest nachgewiesen — siehe Detailplan.

### 3.3 Supabase: SDK/API ✅, Migrationen ✅, CLI ✅, MCP ⬜

**Abgeschlossener Plan (Stand 2026-08-18):** `docs/archive/01_Supabase-CLI.md`, Option B (vollständiger lokaler Dev-Loop) — vollständig ausgeführt und verifiziert, nach `docs/archive/` verschoben.

Damit ist der genaue Status:

1. Supabase als Runtime-Dienst funktioniert und ist remote verifiziert.
2. SQL-Migrationen liegen versioniert im Repository (31 Dateien, `031` lokal-only).
3. Der CLI-Workflow ist vollständig nachgewiesen: `npx supabase --version` (`2.114.0`, kein globaler Install nötig), `supabase login`, `supabase link --project-ref hmqwozhdckbwjqzcmire`, `supabase/config.toml` (per `supabase init` erzeugt), `supabase migration list` (lokal/remote abgeglichen, Drift `031`/`999999` dokumentiert, nicht repariert), `supabase start` (lokaler Stack, alle 31 Migrationen fehlerfrei angewendet) und `supabase db reset` (Reproduzierbarkeit bestätigt) sind erledigt (2026-08-17/18). npm-Script-Wrapper (`supabase:start`/`stop`/`reset`/`migrations`) ergänzt und getestet.
4. Container-Runtime für den lokalen Stack ist geklärt: Docker Desktop wurde verworfen (Daemon nicht erreichbar), Rancher Desktop mit Moby/dockerd läuft stattdessen (verifiziert 2026-08-18, `docker context use default` als Fix für eine tote Docker-Desktop-Pipe).
5. Bekannte, nicht blockierende Einschränkung: Container `supabase_vector_Casino` (Log-Aggregation) crash-loopt unter Rancher Desktop (Docker-Socket-Zugriff verweigert); DB/Auth/REST/Storage/Realtime/Studio bleiben „healthy" — Details in `docs/archive/01_Supabase-CLI.md` Abschnitt 6.
6. Ein Supabase-MCP ist weiterhin nicht als Repository-Konfiguration nachgewiesen — bewusst außerhalb des Scopes von `01_Supabase-CLI.md`, eigene spätere Initiative (jetzt P1, siehe Zeile 18 oben).

Die Lücke zwischen „wir nutzen Supabase" und „wir beherrschen Supabase als Entwicklungsplattform" ist auf der CLI-Seite geschlossen: CLI/Login/Link/Migrationsabgleich/Container-Runtime/lokaler Stack/Reset/npm-Wrapper sind erledigt. Offen bleibt ausschließlich der MCP-Teil.

## 4. Kandidaten, die aktuell noch fehlen

### 4.1 Supabase CLI — abgeschlossen; Supabase MCP — jetzt höchste Priorität

**Aktueller Stand:** CLI-Teil abgeschlossen und verifiziert (2026-08-18, siehe `docs/archive/01_Supabase-CLI.md`) — Schritte 1–6 unten sind erledigt. Schritt 7 (MCP) ist die nächste offene Priorität, noch keine eigene Planungsdatei.

**Lernziel:** Den Unterschied zwischen direktem SDK-Zugriff, CLI-Migrationsworkflow und LLM-gestütztem MCP-Zugriff praktisch verstehen.

**Vorgeschlagener Ablauf:**

1. Supabase CLI lokal oder projektbezogen verfügbar machen.
2. Vor jedem Remote-Schritt den Projekt-Ref und die Zielumgebung eindeutig prüfen.
3. `supabase migration list` gegen die lokale Migrationserwartung und die Remote-Historie laufen lassen.
4. Falls erforderlich, remote vorhandene Historie mit `supabase db pull` bzw. `migration repair` nachvollziehbar abgleichen.
5. Lokalen Stack mit Docker nur in einer sicheren Entwicklungsumgebung starten.
6. Einen ungefährlichen Read-only-Test durchführen: Tabellen, Migrationen und Extensions lesen.
7. Erst nach diesem Nachweis einen projektbezogenen Supabase-MCP testen.

**MCP-Sicherheitsgrenzen:**

- Niemals zuerst gegen Produktionsdaten verbinden.
- Projekt-Ref explizit begrenzen.
- Mit `read_only=true` starten.
- Feature-Gruppen minimieren, zunächst `database`, `debugging` und `docs` prüfen.
- Jede schreibende Aktion manuell bestätigen.
- Keine Service-Role-Secrets in MCP-Konfigurationen eintragen.

**Nutzen für das Spiel:** Sichere Migrationen, schnelleres Schema-Debugging, reproduzierbare lokale Datenbanktests und weniger manuelle Dashboard-Abhängigkeit. Der MCP darf niemals die fachliche Autorität über Wallet, Bet, Payout oder Settlement übernehmen.

### 4.2 Sentry CLI + MCP — abgeschlossen

**Aktueller Stand:** Vollständig abgeschlossen und verifiziert (2026-08-19, siehe `docs/archive/01_SentryCLI_SentryMCP.md`) — npm-Script-Wrapper, Login, `info` und `issues list` verifiziert; MCP-Server registriert und verbunden (`local`-Scope, projektbezogener Endpunkt, OAuth erfolgreich); CLI-vs-MCP-Vergleich für dieselbe Issue (`JAVASCRIPT-NEXTJS-2`) in frischer Konversation durchgeführt, Ergebnis deckungsgleich.

**Lernziel:** Einen Fehler einmal über MCP kontextuell untersuchen und danach über CLI reproduzierbar nachweisen.

**Pilot:**

- Eine bekannte, nicht monetäre Test-Issue auswählen.
- MCP: Issue, Stacktrace, Zeitfenster, Tags und Release-Kontext lesen.
- CLI: dieselbe Issue mit lesendem Befehl und JSON-Ausgabe abfragen.
- Ergebnis in einem kurzen Runbook dokumentieren.
- Keine automatische Änderung, kein Issue-Schließen und kein Alarm- oder Release-Management im ersten Durchlauf.

**Nutzen für das Spiel:** Schnellere Diagnose von Fehlern in Bet-, Auth-, Guide- und Webhook-Pfaden, ohne Logdateien manuell zusammenzusuchen.

### 4.3 Playwright CLI/MCP — abgeschlossen

**Aktueller Stand:** Abgeschlossen und verifiziert (2026-08-19, siehe `docs/archive/01_Playwright-CLI-MCP.md`) — CLI vollständig nutzbar, `@playwright/mcp` installiert/konfiguriert/verbunden, Read-only-Pilot, `/fairness`-404-Befund als Testfall überführt, Dev-Server-Fehlerfall real ausgelöst.

**Lernziel:** Einen UI-Fehler interaktiv reproduzieren, als Snapshot/Trace untersuchen und anschließend in einen stabilen E2E-Test überführen.

**Pilot (erledigt):**

- Lokalen Entwicklungsserver starten. ✅
- Eine nicht monetäre Route (Landing `/`) öffnen. ✅
- Snapshot und Screenshot erstellen. ✅
- Einen kontrollierten UI-Zustand (`/fairness` → 404) untersuchen. ✅
- Testfall in `tests/fairness-404.spec.ts` ergänzt, lokal grün verifiziert. ✅

**Sicherheitsgrenze:** Keine echten Wallet-Mutationen, keine echten Echtgeld-/Produktionskonten und keine gespeicherten Auth-Zustände ohne ausdrückliche Prüfung.

**Nutzen für das Spiel:** Schnellere Frontend-Diagnose, stabilere mobile Flows und ein direkter Lernpfad von Agenten-Interaktion zu automatisiertem Test.

### 4.4 Vercel CLI/API — abgeschlossen (CLI-Basis)

**Aktueller Stand:** Abgeschlossen und verifiziert (2026-08-18, siehe `docs/archive/01_Vercel.md`) — `npx vercel` (v59.1.4, keine globale Installation), Login/Team-Auth durch Jan, lokaler Ordner mit `hamburgerzockerjunge-9074s-projects/casino` verknüpft (`.vercel/` und `.env.local` gitignored), Deployment-Liste/Build-Details/Runtime-Logs/Env-Metadaten (17 Variablen, alle `Hidden`) read-only gelesen.

**Pilot (erledigt):** Deployment-Liste, Preview-URL, Build-Logs und sichere Environment-Variablen-Metadaten lesen. Keine Secrets ausgegeben, keine Production-Env überschrieben, keine Deployments gelöscht.

**Nutzen für das Spiel:** Deployment-Diagnose, Preview-Verifikation, Logs und Umgebungsabgleich werden reproduzierbarer.

### 4.5 GitHub CLI/MCP — mittlere Priorität

**Aktueller Stand:** GitHub Actions sind im Repository vorhanden; `gh` ist lokal nicht nachgewiesen.

**Möglicher Pilot:** Workflow-Status, offene Issues und Pull-Request-Kontext lesen. Schreibaktionen wie Merge, Labeling oder Kommentar erst nach separater Entscheidung.

**Nutzen für das Spiel:** Änderungen, Tests, CI und Review-Kontext können für Mensch und Agent zusammengeführt werden.

### 4.6 PostHog API/SDK — produktanalytischer Kandidat

**Aktueller Stand:** Abgeschlossen und live (2026-08-17, siehe `docs/archive/05_2.9_PostHog_Analytics.md`) — `posthog-js` ist integriert, Consent-Gate + 5 Custom-Events aktiv.

**Lernziel:** Product Analytics von Sentry Error Tracking und Supabase-Admin-BI unterscheiden.

**Sicherheitsgrenze:** Keine Wallet-, Payout-, Roh-PII- oder geheimen Nutzerdaten in Analytics-Events. Consent, Erasure und Datenresidenz müssen vor Go-live geklärt werden.

**Nutzen für das Spiel:** Funnel, Retention und UX-Probleme messen, ohne die monetäre Datenautorität zu verschieben.

### 4.7 Uptime Kuma — API-/Betriebs-Kandidat

**Aktueller Stand:** Ein Detailplan existiert in `worldmap/05_1.13_Uptime-Kuma-Monitoring.md`; die produktive Monitoring-Instanz ist noch nicht als abgeschlossen belegt.

**Lernziel:** Verfügbarkeitstest, Alarmweg, Recovery und Post-Mortem von Sentry-Fehlertracking unterscheiden.

**Nutzen für das Spiel:** Erkennt, ob die Website/API erreichbar ist, auch wenn die App selbst noch keinen Fehler an Sentry gesendet hat.

### 4.8 Trigger.dev — Background-Workflow-Kandidat

**Aktueller Stand:** Nahezu abgeschlossen (2026-08-19, siehe [`01_Trigger.dev.md`](01_Trigger.dev.md)) — Account, CLI, Secrets, Task-Implementierung, manueller Testlauf mit Telegram-Zustellung, Retry-Nachweis, Security-Review und Deploy mit deklarativem Cron (Production, täglich 08:00 Europe/Berlin) sind alle verifiziert abgeschlossen. Einzig offen: der erste **echte automatische** Lauf ist noch nicht abgewartet/bestätigt — Archivierung nach `docs/archive/` erfolgt erst danach.

**Lernziel:** Retries, Run-Status, Background-Execution und Idempotenz außerhalb des synchronen Request-Pfads.

**Aktueller Scope (ersetzt den ursprünglichen Wochenreport-Vorschlag):** Täglicher automatisierter `daily-activity-digest`-Task — liest Spiel-/Business-Aktivität (aktive User, Bets, GGR, Top-Spiel) direkt per Supabase-Service-Role-Client, Zustellung per Telegram an Jan. Kein Wallet-Settlement, keine Auszahlung, kein Resend/E-Mail, keine Server-/Fehler-Health-Daten, keine neue DB-Persistenz. Detail-Scope, IST-Stand, Anforderungen und Execution-Plan in [`01_Trigger.dev.md`](01_Trigger.dev.md).

### 4.9 Context7 MCP — Doku-Lookup-Kandidat

**Aktueller Stand:** Execution-Ready (2026-08-19, siehe [`01_context7.md`](01_context7.md)) — Option A (Minimal-Pilot ohne Account/API-Key) per Rückfrage bestätigt, Recherche zu Paketname/Config/Rate-Limit abgeschlossen; `.mcp.json`-Änderung selbst noch nicht ausgeführt (bleibt Jan-freigabepflichtig, persistente Konfigurationsänderung).

**Lernziel:** Aktuelle Library-Dokumentation strukturiert per MCP abrufen statt auf Trainingsdaten zu vertrauen; Unterschied zwischen kostenlosem Basis-Kontingent und API-Key-Kontingent praktisch verstehen.

**Pilot (geplant):**

- `@upstash/context7-mcp` per `npx` ohne API-Key in `.mcp.json` registrieren.
- Nach Session-Neustart MCP-Tool-Verfügbarkeit und exakte Tool-Namen verifizieren.
- Eine im Projekt tatsächlich genutzte Library nachschlagen (z. B. Next.js, Zod oder Supabase-JS).
- Tool-Namen gegen den bestehenden globalen `docs-lookup`-Agenten abgleichen (der bereits `mcp__context7__resolve-library-id`/`mcp__context7__query-docs` referenziert, aktuell aber unverdrahtet).
- Mindestens einen Fehlerfall (Rate-Limit von recherchiert 60 Requests/Std. ohne Key, oder ungültige Library-ID) real auslösen und dokumentieren.

**Sicherheitsgrenze:** Kein API-Key/Account in diesem Scope, keine Indexierung privater Repos, read-only (Context7 bietet ohnehin keine Schreibtools).

**Nutzen für das Spiel:** Reduziert veraltete/halluzinierte Library-Antworten bei Framework-/Dependency-Fragen (z. B. Next.js 16, Supabase-JS), ohne Geldpfad- oder Datenbankzugriff.

## 5. Empfohlene Reihenfolge

| Phase | Lern-/Integrationsschritt   | Nachweis für den Abschluss                                                                                                                                                                                                 |
| ----- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0    | Supabase CLI-Baseline       | 🟢 Erledigt (2026-08-18) — CLI-Version, Login, Link, `config.toml`, `migration list`, Container-Runtime, `supabase start`, `db reset` und npm-Wrapper vollständig — siehe `docs/archive/01_Supabase-CLI.md`                |
| P1    | Supabase MCP read-only      | Projekt- und Tool-Scope dokumentiert; harmlose Tabellen-/Migrationsabfrage — jetzt nächster sinnvoller Lernschritt (siehe Zeile 18 oben)                                                                                   |
| P2    | Sentry CLI + MCP            | 🟢 Erledigt (2026-08-19) — CLI und MCP verifiziert, CLI-vs-MCP-Vergleich für dieselbe Issue deckungsgleich — siehe `docs/archive/01_SentryCLI_SentryMCP.md`                                                                |
| P3    | Playwright CLI              | 🟢 Erledigt (2026-08-17) — lokale Browser-Session, Snapshot, Trace und Screenshot reproduzierbar erstellt                                                                                                                  |
| P4    | Playwright MCP verifizieren | 🟢 Erledigt (2026-08-19) — Agenten-Browserkontrolle nach Session-Neustart verifiziert, `/fairness`-404-Befund als Testfall überführt, Dev-Server-Fehlerfall real ausgelöst — siehe `docs/archive/01_Playwright-CLI-MCP.md` |
| P5    | Vercel CLI/API              | 🟢 Erledigt (2026-08-18) — Preview/Logs/Deployment-Metadaten gelesen, keine Secrets ausgegeben                                                                                                                             |
| P6    | GitHub CLI/MCP              | CI-/Issue-Kontext read-only zusammengeführt                                                                                                                                                                                |
| P7    | PostHog                     | 🟢 Erledigt (2026-08-17) — Consent-, PII- und Datenresidenz-Gates erfüllt; Erasure-Pfad bewusst unverdrahtet, Pflicht-Trigger sobald weitere Nutzer Zugriff bekommen                                                       |
| P8    | Uptime Kuma                 | Health-Route, Down-Alarm, Recovery-Alarm und Runbook vollständig                                                                                                                                                           |
| P9    | Trigger.dev                 | Nicht-monetärer Reportjob mit Retry und idempotentem Ergebnis                                                                                                                                                              |
| P10   | Context7 MCP (Option A)     | 🟡 Execution-Ready (2026-08-19) — `.mcp.json`-Eintrag ohne Key, read-only-Pilot gegen eine echte Library, Tool-Namen-Abgleich mit `docs-lookup`-Agent, ein Fehlerfall dokumentiert — siehe `01_context7.md`                |

## 6. Supabase-Fokus: Was im zweiten Schritt konkret verifiziert werden muss

### 6.1 Nicht voreilig annehmen

Die vorhandenen Migrationen beweisen nicht automatisch:

- dass die lokale CLI installiert ist;
- dass das Repository mit dem korrekten Remote-Projekt verlinkt ist;
- dass lokale und remote Migrationshistorie identisch sind;
- dass ein lokaler Stack mit Docker reproduzierbar startet;
- dass die Remote-Datenbank gefahrlos über einen Agenten erreichbar ist.

### 6.2 Bevorzugte Prüfsequenz

```powershell
# 1. Tool- und Konfigurationsstatus
supabase --version
Test-Path .\supabase\config.toml
Get-ChildItem .\supabase\migrations

# 2. Nach expliziter Projekt-Ref-/Umgebungsprüfung
supabase link --project-ref <development-project-ref>
supabase migration list

# 3. Erst danach lokale Reproduzierbarkeit
supabase start
supabase db reset

# 4. Nur nach Review einer erzeugten Migration
supabase db push --linked
```

Die Befehle sind ein Lernablauf, keine automatische Freigabe für Remote-Schreibzugriffe. `db reset` ist nur für eine lokale Entwicklungsdatenbank akzeptabel; ein Reset einer verknüpften Remote-Datenbank ist destruktiv und bleibt außerhalb des ersten Lernschritts.

### 6.3 MCP-Grenze

Ein Supabase-MCP kann Tabellen, Migrationen, Logs, Advisors und SQL-Werkzeuge anbieten. Für dieses Projekt ist die sichere Startkonfiguration:

- ein einzelnes Entwicklungsprojekt;
- read-only;
- keine Account- oder Organisationsverwaltung;
- keine Storage- oder Branch-Schreibwerkzeuge im ersten Pilot;
- manuelle Bestätigung jedes Tool-Aufrufs;
- keine Verbindung zu Produktions-Walletdaten.

Die offizielle Supabase-Dokumentation warnt ausdrücklich vor Prompt Injection und empfiehlt Projekt-Scope, read-only-Modus und manuelle Tool-Bestätigung.

## 7. Sicherheits- und Betriebsregeln für alle zukünftigen Tools

1. **Runtime-Secrets bleiben Runtime-Secrets.** Keine API-Keys, Service-Role-Keys, OAuth-Tokens oder Bot-Tokens in Markdown, MCP-JSON, Git-Historie oder Prompttexten.
2. **Read-only zuerst.** Jeder neue Dienst beginnt mit Identität, Version, Scope und einer lesenden Probe.
3. **Produktionsdaten nicht als Lernumgebung verwenden.** Für MCP-Experimente sind lokale, synthetische oder dedizierte Entwicklungsdaten vorzuziehen.
4. **Geldpfade bleiben autoritativ.** MCP, Analytics, Cache und externe Jobdienste dürfen keine fachliche Autorität über Wallet, Bet, Payout oder Settlement erhalten.
5. **Schreibaktionen explizit trennen.** Migration anwenden, Deployment starten, Issue schließen, Event löschen und Benutzer-/Datenänderungen sind jeweils eigene Freigabepunkte.
6. **Reproduzierbarkeit dokumentieren.** Für jeden Pilot gehören Version, Installationsweg, Login-/OAuth-Modell, exakter read-only-Befehl, erwartete Ausgabe und Abbruchkriterium ins Runbook.
7. **Fehlerzustände testen.** Timeout, fehlende Berechtigung, Rate Limit, falsche Umgebung und Dienst-Ausfall müssen mindestens einmal sicher beobachtet werden.
8. **MCP nicht mit magischer Autonomie verwechseln.** Tool-Ergebnisse sind Eingaben für die Analyse und müssen gegen Repository, Tests und Dienst-UI plausibilisiert werden.

## 8. Offene Entscheidungen für Jans spätere Bewertung

**Geklärt seit dieser Version (nicht mehr offen):**

- Supabase: CLI-Lernstrecke zuerst gestartet, MCP bewusst als separate Initiative (P1) ausgeklammert.
- Supabase-CLI-Installationsweg: `npx supabase ...`, kein globaler Install, kein CI-Container.
- Sentry-Pilot-Scope: nur lesend (`info`, `issues list`); Release-/Source-Map-Workflow explizit ausgeschlossen.
- Playwright MCP: Option B bestätigt (CLI + `@playwright/mcp`-Install) und vollständig ausgeführt (2026-08-19) — siehe `docs/archive/01_Playwright-CLI-MCP.md`.
- Sentry-MCP-Host-Registrierung für Claude Code (statt des archivierten Codex-Desktop-Pilots): Scope `local`, projektbezogener Endpunkt — umgesetzt und CLI-vs-MCP-Vergleich verifiziert (2026-08-19, siehe `docs/archive/01_SentryCLI_SentryMCP.md`).

**Weiterhin offen:**

- Welche Supabase-Umgebung darf für MCP verwendet werden: lokales Docker-Projekt, dedizierte Entwicklungsinstanz oder Branch? (Betrifft erst P1, noch nicht gestartet.)
- Erasure-Pfad für PostHog ist implementiert, aber unverdrahtet — wann wird er angebunden, und welche zusätzlichen Daten dürfen später dazukommen (Pflicht-Trigger laut `docs/archive/05_2.9_PostHog_Analytics.md`, sobald weitere Nutzer Zugriff bekommen)?

## 9. Definition of Done für diese Lernlandkarte

Die jeweilige Integration gilt erst dann als abgeschlossen, wenn:

- der Dienst und der konkrete Zugriffsscope benannt sind;
- der lokale Installationsweg reproduzierbar ist;
- mindestens ein read-only-Nachweis vorliegt;
- ein Fehler- oder Berechtigungsfall getestet wurde;
- klar dokumentiert ist, ob CLI, API, SDK und MCP jeweils existieren oder nicht;
- keine Secrets oder sensiblen Produktionsdaten in den Nachweisen enthalten sind;
- der Nutzen für Casino-Betrieb oder Spielentwicklung getrennt vom persönlichen Lerneffekt beschrieben ist;
- die Integration nicht versehentlich Geldpfade oder Sicherheitsgrenzen verändert.

## 10. Quellen und lokale Belege

### Offizielle externe Dokumentation

- [Supabase: Local development workflow with the CLI](https://supabase.com/docs/guides/local-development/cli-workflows)
- [Supabase: CLI reference](https://supabase.com/docs/reference/cli/getting-started)
- [Supabase: MCP Server](https://supabase.com/docs/guides/ai-tools/mcp)
- [Sentry: MCP Server](https://mcp.sentry.dev/)
- [Sentry: official CLI repository](https://github.com/getsentry/sentry-cli)
- [Vercel: CLI overview](https://vercel.com/docs/cli)
- [Playwright: CLI and MCP release notes](https://playwright.dev/docs/release-notes)
- [Context7: GitHub-Repository (upstash/context7)](https://github.com/upstash/context7)
- [Context7: MCP Clients — alle Client-Konfigurationen](https://context7.com/docs/resources/all-clients)

### Relevante lokale Belege

- [`package.json`](../package.json) — Runtime-/Dev-Abhängigkeiten und npm-Scripts
- [`src/utils/supabase/client.ts`](../src/utils/supabase/client.ts) — Browser-Supabase-Client
- [`src/utils/supabase/server.ts`](../src/utils/supabase/server.ts) — Server-Supabase-Client
- [`src/utils/supabase/admin.ts`](../src/utils/supabase/admin.ts) — Service-Role-Client
- [`scripts/verify-supabase-env.ts`](../scripts/verify-supabase-env.ts) — Supabase-Health-Probes
- [`scripts/test-config-remote.mjs`](../scripts/test-config-remote.mjs) — Remote-Supabase-Verifikation
- [`scripts/test-upstash.mjs`](../scripts/test-upstash.mjs) — Upstash-Ping und Rate-Limit-Probe
- [`src/lib/casino/chat-guide.ts`](../src/lib/casino/chat-guide.ts) — OpenAI-Responses-API
- [`src/lib/casino/telegram-api.ts`](../src/lib/casino/telegram-api.ts) — Telegram-Bot-API-Helfer
- [`src/instrumentation-client.ts`](../src/instrumentation-client.ts) — Sentry-Client-Initialisierung
- [`docs/archive/05_1.0_Sentry.md`](../docs/archive/05_1.0_Sentry.md) — historischer Sentry-CLI-/MCP-Pilot (Codex Desktop)
- [`docs/archive/05_2.9_PostHog_Analytics.md`](../docs/archive/05_2.9_PostHog_Analytics.md) — PostHog-Detailplan (abgeschlossen)
- [`docs/archive/01_Vercel.md`](../docs/archive/01_Vercel.md) — Vercel-CLI-Detailplan (abgeschlossen)
- [`docs/archive/01_Supabase-CLI.md`](../docs/archive/01_Supabase-CLI.md) — Supabase-CLI-Detailplan (abgeschlossen, archiviert)
- [`docs/archive/01_SentryCLI_SentryMCP.md`](../docs/archive/01_SentryCLI_SentryMCP.md) — Sentry-CLI-/MCP-Detailplan (abgeschlossen, archiviert)
- [`docs/archive/01_Playwright-CLI-MCP.md`](../docs/archive/01_Playwright-CLI-MCP.md) — Playwright-CLI-/MCP-Detailplan (abgeschlossen, archiviert)
- [`tests/fairness-404.spec.ts`](../tests/fairness-404.spec.ts) — Regressionstest aus dem Playwright-MCP-Pilot
- [`worldmap/01_github.md`](01_github.md) — GitHub-CLI-/MCP-Detailplan (Execution-Ready, noch nicht gestartet)
- [`worldmap/01_Trigger.dev.md`](01_Trigger.dev.md) — Trigger.dev-Tagesreport-Detailplan (Execution-Ready, noch nicht gestartet)
- [`worldmap/01_context7.md`](01_context7.md) — Context7-MCP-Detailplan, Option A (Execution-Ready, noch nicht gestartet)
- [`worldmap/05_1.13_Uptime-Kuma-Monitoring.md`](05_1.13_Uptime-Kuma-Monitoring.md) — Uptime-Kuma-Detailplan
- [`worldmap/05_ZUKUNFTSPLANUNG.md`](05_ZUKUNFTSPLANUNG.md) — übergeordnete Zukunftsplanung

## LLM-Hinweis

Bei einer späteren Fortsetzung zuerst den Status dieser Datei **und** der noch aktiven Einzelpläne (`01_github.md`, `01_Trigger.dev.md`, `01_context7.md`) erneut prüfen — diese Übersichtsdatei führt nur Status und Reihenfolge, die tagesaktuelle Wahrheit steht in den Einzelplänen (siehe Abschnitt 10 und Erfahrung vom 2026-08-18: diese Datei war zuvor mehrere Tage hinter den Einzelplänen zurück). Supabase-CLI, Sentry-CLI/MCP und Playwright-CLI/MCP sind abgeschlossen und nach `docs/archive/` verschoben (`01_Supabase-CLI.md`, `01_SentryCLI_SentryMCP.md`, `01_Playwright-CLI-MCP.md`). Context7 (`01_context7.md`) ist Execution-Ready, die `.mcp.json`-Änderung selbst ist noch nicht ausgeführt. Keine schreibende Aktion aus den Vorschlägen ableiten, bevor Jan den konkreten Meilenstein bestätigt hat.
