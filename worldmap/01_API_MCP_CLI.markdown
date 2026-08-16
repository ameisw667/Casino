# API, MCP und CLI — Integrations- und Lernlandkarte

> Stand: **2026-08-15**  
> Projekt: **Casino / Next.js 16.3 / Supabase / Sentry**  
> Zweck: Lern- und Entscheidungsgrundlage für die nächsten Integrationen. Diese Datei ist zunächst eine Analyse und Roadmap; sie führt keine neue Integration automatisch aus.

## Übersicht für Jan

| Kategorie | Meilenstein | Status |
|---|---|---|
| Anwendung | Supabase wird im Frontend, Server und Admin-Kontext per SDK/REST verwendet | ✅ Vorhanden |
| Anwendung | OpenAI Responses API für den Casino-Guide | ✅ Vorhanden |
| Anwendung | Telegram Bot API für opt-in Big-Win-Benachrichtigungen | ✅ Vorhanden |
| Anwendung | Upstash Redis/Rate Limiting über REST-SDK | ✅ Vorhanden |
| Observability | Sentry Next.js SDK inklusive Redaction und Error Boundaries | ✅ Vorhanden |
| Observability | Sentry CLI als reproduzierbarer lokaler Diagnoseweg | 🟡 Lokal vorhanden, noch als Standard-Workflow zu dokumentieren |
| Observability | Sentry MCP für agentische Issue-/Performance-Abfragen | 🟡 Historisch pilotiert, aktuelle Projektkonfiguration fehlt |
| Tests | Playwright E2E-Test-Suite | ✅ Vorhanden |
| Tests | Playwright CLI/MCP als interaktiver Agenten-Debugger | 🟡 CLI vorhanden, MCP-Workflow noch zu verifizieren |
| Datenbank | Supabase-Migrationen im Repository | ✅ 30 Migrationen vorhanden |
| Datenbank | Supabase CLI mit `config.toml`, Link und reproduzierbarem Local-Stack | 🔴 Nicht eingerichtet |
| Datenbank | Supabase MCP projektbezogen und zunächst read-only | ⬜ Vorschlag / noch nicht eingerichtet |
| Hosting | Vercel CLI/API für Deployments, Logs und Env-Prüfung | ⬜ Noch nicht eingerichtet |
| Repository | GitHub CLI/MCP für Issues, Actions und PR-Kontext | ⬜ Noch nicht eingerichtet |
| Produktanalyse | PostHog API/SDK | 🟡 Ausführungsbereiter Plan, noch nicht integriert |
| Betrieb | Uptime Kuma API/Monitoring | 🟡 Detailplan vorhanden, noch nicht produktiv eingerichtet |
| Automation | Trigger.dev SDK/CLI | ⬜ Geplant, nicht gestartet |
| Lernpriorität | Sicherer, read-only Supabase-CLI-/MCP-Pilot auf einer Entwicklungsumgebung | **P0 — nächster sinnvoller Lernschritt** |

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

| Bereich | Beleg im Projekt | Technische Einordnung |
|---|---|---|
| Framework | `package.json`, Next.js `^16.3.0` | Web-App, API-Routes und Server-/Client-Komponenten |
| Datenbank/Auth | `@supabase/ssr`, `@supabase/supabase-js`, `src/utils/supabase/*` | Browser-, Server- und privilegierter Service-Role-Kontext |
| Datenbankänderungen | `supabase/migrations/001_*.sql` bis `030_*.sql` | SQL ist versioniert; die CLI-Projektkonfiguration fehlt aktuell |
| Cache/Rate Limit | `@upstash/redis`, `@upstash/ratelimit`, `src/lib/security/request-security.ts` | Externer REST-basierter Redis-Dienst; im Sicherheitsweg fail-closed |
| Fehlertracking | `@sentry/nextjs`, `src/instrumentation*.ts`, `sentry.*.config.ts` | Client-, Server- und Request-Error-Tracking mit Redaction |
| KI-Guide | `src/lib/casino/chat-guide.ts` | Direkter Server-Request an die OpenAI Responses API; kein Browser-Key |
| Telegram | `src/lib/casino/telegram-api.ts`, `telegram-link.ts` | Bot API, Webhook und Big-Win-Nachrichten |
| Browser-Tests | `@playwright/test`, `tests/*.spec.ts` | E2E-, Regression- und Screenshot-Tests |
| Lokale Infrastruktur | `docker`, `infra/chaos/*` | Docker ist lokal verfügbar; Chaos-Tests bleiben durch Guards begrenzt |
| CI | `.github/workflows/*` | GitHub Actions werden verwendet; GitHub CLI ist nicht lokal nachgewiesen |

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

### 3.1 Sentry: SDK ✅, CLI 🟡, MCP 🟡

Der archivierte Plan `docs/archive/05_1.0_Sentry.md` dokumentiert einen erfolgreichen Sentry-CLI- und Sentry-MCP-Pilot mit OAuth und lesenden Abfragen. Das ist ein valider historischer Nachweis.

Die aktuelle lokale Prüfung ergab:

- `sentry-cli` ist nicht global im PATH.
- Das Repository enthält aber durch die installierte Sentry-Abhängigkeit `node_modules/.bin/sentry-cli`.
- `node_modules/.bin/sentry-cli.cmd --version` liefert aktuell `sentry-cli 2.58.6`.
- Es gibt keine repo-lokale MCP-Konfigurationsdatei, aus der sich der aktuelle MCP-Zustand ablesen lässt.

**Bewertung:** Sentry CLI ist lokal nutzbar, aber der Aufruf sollte künftig über `npx sentry-cli ...` oder einen dokumentierten npm-Script-Wrapper standardisiert werden. Der Sentry-MCP-Zugang ist ein persönlicher/Client-seitiger OAuth-Kontext und darf nicht aus Repository-Dateien oder `.env.local` abgeleitet werden.

### 3.2 Playwright: Tests ✅, CLI ✅, MCP 🔍

Das Projekt verwendet `@playwright/test` in Version `1.61.0`.

Die lokale Prüfung ergab:

- `node_modules/.bin/playwright.cmd --version` liefert `Version 1.61.0`.
- `playwright-cli --help` ist über die installierte Playwright-Toolchain verfügbar.
- Der interaktive CLI-Weg unterstützt Browser-Sessions, Snapshots, Netzwerkinspektion, Tracing und Screenshots.
- Der lokale Aufruf `playwright mcp --help` zeigt in dieser Installation keinen eigenständigen `mcp`-Befehl; die genaue MCP-Installationsform muss deshalb separat gegen die verwendete Playwright-Version geprüft werden.

**Bewertung:** Playwright CLI ist der naheliegende zweite Lernschritt nach Supabase/Sentry, weil es unmittelbar auf das Casino-Frontend und bestehende E2E-Tests wirkt. MCP darf erst als aktiv gelten, wenn ein Agent eine lokale Browser-Session kontrolliert und ein reproduzierbarer Testnachweis dokumentiert ist.

### 3.3 Supabase: SDK/API ✅, Migrationen ✅, CLI 🔴, MCP ⬜

Der `supabase/`-Ordner enthält Migrationen, aber bei der aktuellen Prüfung keine `supabase/config.toml`. Der globale Befehl `supabase` ist nicht installiert. `psql` ist ebenfalls nicht im PATH; Docker ist vorhanden.

Damit ist der genaue Status:

1. Supabase als Runtime-Dienst funktioniert und ist remote verifiziert.
2. SQL-Migrationen liegen versioniert im Repository.
3. Der standardisierte CLI-Workflow `supabase init`, `supabase link`, `supabase db pull`, `supabase db diff`, `supabase db reset` und `supabase db push` ist in dieser Arbeitsumgebung nicht nachgewiesen.
4. Ein Supabase-MCP ist nicht als Repository-Konfiguration nachgewiesen.

Das ist die wichtigste Lücke zwischen „wir nutzen Supabase“ und „wir beherrschen Supabase als Entwicklungsplattform“.

## 4. Kandidaten, die aktuell noch fehlen

### 4.1 Supabase CLI + MCP — höchste Priorität

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

### 4.2 Sentry CLI + MCP — höchste Priorität nach Supabase

**Lernziel:** Einen Fehler einmal über MCP kontextuell untersuchen und danach über CLI reproduzierbar nachweisen.

**Pilot:**

- Eine bekannte, nicht monetäre Test-Issue auswählen.
- MCP: Issue, Stacktrace, Zeitfenster, Tags und Release-Kontext lesen.
- CLI: dieselbe Issue mit lesendem Befehl und JSON-Ausgabe abfragen.
- Ergebnis in einem kurzen Runbook dokumentieren.
- Keine automatische Änderung, kein Issue-Schließen und kein Alarm- oder Release-Management im ersten Durchlauf.

**Nutzen für das Spiel:** Schnellere Diagnose von Fehlern in Bet-, Auth-, Guide- und Webhook-Pfaden, ohne Logdateien manuell zusammenzusuchen.

### 4.3 Playwright CLI/MCP — hohe Priorität

**Lernziel:** Einen UI-Fehler interaktiv reproduzieren, als Snapshot/Trace untersuchen und anschließend in einen stabilen E2E-Test überführen.

**Pilot:**

- Lokalen Entwicklungsserver starten.
- Eine nicht monetäre Route wie Landing, Lobby oder Settings öffnen.
- Snapshot und Screenshot erstellen.
- Einen kontrollierten UI-Fehler oder eine bekannte Regression untersuchen.
- Erst danach einen Testfall in `tests/` ergänzen.

**Sicherheitsgrenze:** Keine echten Wallet-Mutationen, keine echten Echtgeld-/Produktionskonten und keine gespeicherten Auth-Zustände ohne ausdrückliche Prüfung.

**Nutzen für das Spiel:** Schnellere Frontend-Diagnose, stabilere mobile Flows und ein direkter Lernpfad von Agenten-Interaktion zu automatisiertem Test.

### 4.4 Vercel CLI/API — mittlere Priorität

**Aktueller Stand:** Vercel ist aus den Projekt- und Deployment-Dokumenten bekannt, aber `vercel` ist in der aktuellen Shell nicht installiert.

**Möglicher Pilot:** Deployment-Liste, Preview-URL, Build-Logs und sichere Environment-Variablen-Metadaten lesen. Keine Secrets ausgeben, keine Production-Env überschreiben und keine Deployments löschen.

**Nutzen für das Spiel:** Deployment-Diagnose, Preview-Verifikation, Logs und Umgebungsabgleich werden reproduzierbarer.

### 4.5 GitHub CLI/MCP — mittlere Priorität

**Aktueller Stand:** GitHub Actions sind im Repository vorhanden; `gh` ist lokal nicht nachgewiesen.

**Möglicher Pilot:** Workflow-Status, offene Issues und Pull-Request-Kontext lesen. Schreibaktionen wie Merge, Labeling oder Kommentar erst nach separater Entscheidung.

**Nutzen für das Spiel:** Änderungen, Tests, CI und Review-Kontext können für Mensch und Agent zusammengeführt werden.

### 4.6 PostHog API/SDK — produktanalytischer Kandidat

**Aktueller Stand:** `worldmap/05_2.9_PostHog_Analytics.md` ist ein ausführungsbereiter Plan, aber PostHog ist im aktuellen `package.json` nicht integriert.

**Lernziel:** Product Analytics von Sentry Error Tracking und Supabase-Admin-BI unterscheiden.

**Sicherheitsgrenze:** Keine Wallet-, Payout-, Roh-PII- oder geheimen Nutzerdaten in Analytics-Events. Consent, Erasure und Datenresidenz müssen vor Go-live geklärt werden.

**Nutzen für das Spiel:** Funnel, Retention und UX-Probleme messen, ohne die monetäre Datenautorität zu verschieben.

### 4.7 Uptime Kuma — API-/Betriebs-Kandidat

**Aktueller Stand:** Ein Detailplan existiert in `worldmap/05_1.13_Uptime-Kuma-Monitoring.md`; die produktive Monitoring-Instanz ist noch nicht als abgeschlossen belegt.

**Lernziel:** Verfügbarkeitstest, Alarmweg, Recovery und Post-Mortem von Sentry-Fehlertracking unterscheiden.

**Nutzen für das Spiel:** Erkennt, ob die Website/API erreichbar ist, auch wenn die App selbst noch keinen Fehler an Sentry gesendet hat.

### 4.8 Trigger.dev — Background-Workflow-Kandidat

**Aktueller Stand:** In `worldmap/05_ZUKUNFTSPLANUNG.md` als späterer Lernjob vorgesehen; noch nicht gestartet.

**Lernziel:** Retries, Run-Status, Background-Execution und Idempotenz außerhalb des synchronen Request-Pfads.

**Erster Scope:** Nicht-monetärer Wochenreport. Kein Wallet-Settlement, keine Auszahlung und keine autonome Production-Automation im ersten Schritt.

## 5. Empfohlene Reihenfolge

| Phase | Lern-/Integrationsschritt | Nachweis für den Abschluss |
|---|---|---|
| P0 | Supabase CLI-Baseline | CLI-Version, Projekt-Ref-Prüfung, `migration list`, sicherer Read-only-Check |
| P1 | Supabase MCP read-only | Projekt- und Tool-Scope dokumentiert; harmlose Tabellen-/Migrationsabfrage |
| P2 | Sentry CLI + MCP | Dieselbe Test-Issue über beide Wege gefunden; keine Schreibaktion |
| P3 | Playwright CLI | Lokale Browser-Session, Snapshot, Trace oder Screenshot reproduzierbar erstellt |
| P4 | Playwright MCP verifizieren | Agenten-Browserkontrolle mit lokalem, nicht monetärem Testnachweis |
| P5 | Vercel CLI/API | Preview/Logs/Deployment-Metadaten gelesen, keine Secrets ausgegeben |
| P6 | GitHub CLI/MCP | CI-/Issue-Kontext read-only zusammengeführt |
| P7 | PostHog | Consent-, PII-, Erasure- und Datenresidenz-Gates erfüllt |
| P8 | Uptime Kuma | Health-Route, Down-Alarm, Recovery-Alarm und Runbook vollständig |
| P9 | Trigger.dev | Nicht-monetärer Reportjob mit Retry und idempotentem Ergebnis |

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

Diese Punkte sollen nicht stillschweigend entschieden werden:

- Soll Supabase zuerst als CLI-Lernstrecke oder parallel als read-only MCP-Lernstrecke gestartet werden?
- Soll für die CLI eine globale Installation, ein projektgebundener Runner oder ein CI-Container verwendet werden?
- Welche Supabase-Umgebung darf für MCP verwendet werden: lokales Docker-Projekt, dedizierte Entwicklungsinstanz oder Branch?
- Soll der erste Sentry-Pilot nur lesen oder zusätzlich einen sicheren Test-Release-/Source-Map-Workflow abdecken?
- Soll Playwright MCP ein neues Agentenwerkzeug werden oder reicht zunächst der vorhandene CLI-/Test-Workflow?
- Ist Vercel-Diagnose für den nächsten Lernschritt wichtiger als Product Analytics?
- Welche Daten dürfen später in PostHog landen, und wie wird der Erasure-Pfad nachgewiesen?

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
- [`docs/archive/05_1.0_Sentry.md`](../docs/archive/05_1.0_Sentry.md) — historischer Sentry-CLI-/MCP-Pilot
- [`worldmap/05_2.9_PostHog_Analytics.md`](05_2.9_PostHog_Analytics.md) — PostHog-Detailplan
- [`worldmap/05_1.13_Uptime-Kuma-Monitoring.md`](05_1.13_Uptime-Kuma-Monitoring.md) — Uptime-Kuma-Detailplan
- [`worldmap/05_ZUKUNFTSPLANUNG.md`](05_ZUKUNFTSPLANUNG.md) — übergeordnete Zukunftsplanung

## LLM-Hinweis

Bei einer späteren Fortsetzung zuerst den Status dieser Datei und die aktuelle Arbeitsumgebung erneut prüfen. Besonders wichtig sind: `supabase --version`, Vorhandensein von `supabase/config.toml`, aktueller Git-Status, Zielumgebung des Supabase-Projekts und MCP-Scope. Keine schreibende Aktion aus den Vorschlägen ableiten, bevor Jan den konkreten Meilenstein bestätigt hat.
