# 06 — Uncommitted-Changes Cleanup & Commit-Plan

> **Status:** Executed (archiviert) · **Stand:** 2026-08-19 · **Owner:** LLM · **Scope:** Alle uncommitted/untracked Änderungen im Arbeitsbaum (84 Einträge laut `git status`) in nachvollziehbare, thematisch saubere Commits überführen, verifizieren, pushen.

## 1 — Übersicht für Jan

| Nummer | Kategorie                                                                                     | Status      | Nächster Schritt | Zuständigkeit |
| ------ | --------------------------------------------------------------------------------------------- | ----------- | ---------------- | ------------- |
| K0     | Vorabprüfung (Tests/Lint/Diff-Review)                                                         | 🟢 Executed | —                | LLM           |
| K1     | Tooling/Config (gitignore, tsconfig, eslint, package.json, prettier, mcp)                     | 🟢 Executed | commit           | LLM           |
| K2     | Trigger.dev-Integration (Daily-Digest-Job)                                                    | 🟢 Executed | commit           | LLM           |
| K3     | Supabase Local-CLI-Scaffold                                                                   | 🟢 Executed | commit           | LLM           |
| K4     | Docs-Reorg (worldmap-Archivierung, CLAUDE.md/AGENTS.md/README-Sync, Proxy/Fraud-Doku-Linkfix) | 🟢 Executed | commit           | LLM           |
| K5     | Feature: PostHog-Identity-Bootstrap (HMAC)                                                    | 🟢 Executed | commit           | LLM           |
| K6     | Feature: Casino-Guide-Knowledge-Modularisierung + Live-Leaderboard-Snippet                    | 🟢 Executed | commit           | LLM           |
| K7     | Feature: Erstwett-/CTA-Analytics-Signale (Store + Games + Auth + Stats)                       | 🟢 Executed | commit           | LLM           |
| K8     | Fix: Fraud-Admin Doku-Linkfix (in K4 gebündelt)                                               | 🟢 Executed | —                | LLM           |
| K9     | Test-Infra: Fairness-404-Spec + Red-Team-Testkatalog                                          | 🟢 Executed | commit           | LLM           |
| K10    | Push + Verifikation                                                                           | 🟢 Executed | —                | LLM           |

**Ampel-Definition:** 🔴 Geplant = nicht gestartet; 🟡 In Execution = gestartet, nicht verifiziert; 🟢 Executed = verifiziert abgeschlossen.

---

## 2 — Ausgangslage (K0)

- `git status -sb`: `main...origin/main` → **0/0 ahead/behind** (keine Divergenz, reiner Arbeitsbaum-Stand).
- 84 geänderte/neue/gelöschte Pfade, keine Konflikte, kein halbfertiger Merge.
- `npm run test -- --run`: **80 Testdateien, 671 Tests, alle grün.**
- `npm run lint`: Fehler ausschließlich in `.trigger/tmp/**` (lokale Trigger.dev-Build-Artefakte, bereits über `.gitignore` ausgeschlossen) und in unberührten Altdateien (nicht Teil dieser Änderungen). Einziger echter Treffer in neuem Code: `src/trigger/example.ts` (`any`-Typ, Scaffold-Datei ohne Produktionsnutzen).
- Alle inhaltlichen Diffs wurden gelesen (nicht nur Diffstat) — Ergebnis: kohärente, bereits fertiggestellte Arbeit aus vorherigen Sessions, keine halbfertigen Baustellen.

**Korrekturen vor Commit:**

- `src/trigger/example.ts` gelöscht (Trigger.dev-Scaffold-Boilerplate, ungenutzt, verletzt `no-explicit-any`).
- `eslint.config.mjs`: `.trigger/**` zu `globalIgnores` hinzugefügt (lokale Build-Artefakte sollen nie gelintet werden).

---

## 3 — Kategorien im Detail

### K1 — Tooling/Config

**Dateien:** `.gitignore`, `tsconfig.json`, `eslint.config.mjs`, `package.json`, `package-lock.json`, `.prettierrc.json`, `.mcp.json`, `.claude/launch.json`, `scripts/typecheck-staged.mjs`
**Ziel:** Lockfile/Skripte auf aktuellen Stand (Trigger.dev-Deps, Supabase/Sentry/GitHub-CLI-Shortcuts), robusteres Temp-Verzeichnis-Handling in `typecheck-staged.mjs` (mkdtemp statt Race-anfälligem Einzeldatei-Named-Tempfile), `.gitignore`-Härtung (`.env.example` bleibt versioniert, `.trigger`, `.sentryclirc`, `.playwright-mcp/` neu ignoriert).
**Money-Pfad:** Nein. **Security-Review:** Nein (reine Tooling-Config).
**Verifizierung:** `npm run test`, `npm run build` grün (siehe K10).

### K2 — Trigger.dev-Integration

**Dateien:** `trigger.config.ts`, `src/trigger/daily-activity-digest.ts` (Scaffold `src/trigger/example.ts` entfernt, siehe K0)
**Ziel:** Täglicher Cron-Job (08:00 Europe/Berlin, PRODUCTION-only), aggregiert `wallet_transactions`/`game_rounds` des Vortags serverseitig, sendet GGR-/Aktivitäts-Report per Telegram an `TELEGRAM_ADMIN_CHAT_ID`. Nutzt bestehende `createAdminClient()` und `sendTelegramMessage()`, keine neuen Secrets im Code, Zod-validiert alle DB-Zeilen.
**Money-Pfad:** Nein (Read-only Reporting). **Security-Review:** Nein (kein neuer Schreibpfad, nutzt bestehende Service-Role-Clients).
**Nicht-Scope:** Deployment/Aktivierung des Jobs bei Trigger.dev (Projekt `proj_kktqoexlvytkmoewzysl`) ist ein separater, außerhalb dieses Cleanups liegender Schritt (Owner: Jan).

### K3 — Supabase Local-CLI-Scaffold

**Dateien:** `supabase/config.toml`, `supabase/.gitignore`
**Ziel:** Standard-Konfiguration für `supabase start` (lokaler Stack), keine Secrets enthalten (Default-Ports/-Flags).
**Money-Pfad:** Nein. **Security-Review:** Nein.

### K4 — Docs-Reorg

**Dateien (gelöscht):** `01_WORLDMAP_STATUS.md` (Root-Duplikat), `Bug-List.md` (→ ersetzt durch `docs/status-reports/00_BUG_LIST.md`), `report-errors.mjs` (Alt-Skript), `worldmap/01_API_MCP_CLI.markdown`, `worldmap/02_FRONTEND_REDESIGN.md`, `worldmap/05_1.10 Resilience Chaos Testing.md`, `worldmap/05_2.8_Anti_Fraud.md`
**Dateien (umbenannt):** `worldmap/01_LiveProgressiveJackpot.md` → `docs/archive/01_LiveProgressiveJackpot.md`
**Dateien (neu):** `worldmap/00_WORLDMAP_STATUS.md`, `worldmap/01_API_MCP_CLI.md`, `worldmap/01_Trigger.dev.md`, `worldmap/01_context7.md`, `worldmap/01_github.md`, `00_LERNREISE.md`, `docs/archive/01_{Playwright-CLI-MCP,SentryCLI_SentryMCP,Supabase-CLI,Vercel}.md`, `docs/archive/05_2.6_llmerweiterung*.md`, `docs/archive/05_2.8_Anti_Fraud.md`, `docs/status-reports/00_BUG_LIST.md`
**Dateien (angepasst):** `CLAUDE.md`, `AGENTS.md`, `README.md`, `docs/architecture/02_CLERK_SUPABASE.md`, diverse `docs/archive/*.md` (Linkfixes nach Umzug), `worldmap/05_ZUKUNFTSPLANUNG.md`, sowie Code-Kommentar-Linkfixes in `src/proxy.ts`, `src/app/admin/fraud/FraudPageClient.tsx`, `src/app/api/admin/fraud/scan/route.ts`, `src/components/analytics/ConsentBanner.tsx` (Verweise `worldmap/05_2.8_Anti_Fraud.md` / `worldmap/05_2.9_PostHog_Analytics.md` → `docs/archive/...`, da die Zieldateien archiviert wurden).
**Ziel:** Abgeschlossene Planungsdateien liegen konsistent unter `docs/archive/`; `worldmap/` enthält nur noch aktive/laufende Inhalte; CLAUDE.md/AGENTS.md dokumentieren den aktuellen Architektur-Stand (Analytics-Identity, Fraud-Detection, Promo-Codes, Guide-Knowledge — bereits vorher live gebaut, aber nicht dokumentiert).
**Money-Pfad:** Nein. **Security-Review:** Nein (reine Dokumentation, keine Verhaltensänderung im Code außer Kommentartext).
**Verifizierung:** Kein Markdown-Link zeigt mehr auf eine gelöschte/verschobene Datei (stichprobenartig gegen die vier betroffenen Code-Kommentare geprüft).

### K5 — Feature: PostHog-Identity-Bootstrap

**Dateien (neu):** `src/lib/analytics/identify.ts`, `src/components/analytics/AnalyticsIdentityBootstrap.tsx`, `src/lib/analytics/__tests__/identify.test.ts`
**Dateien (geändert):** `src/lib/analytics/posthog-client.ts`, `src/lib/analytics/consent.ts`, `src/lib/analytics/__tests__/posthog-client.test.ts`, `src/components/auth/ClientProviders.tsx`
**Ziel:** Ruft `/api/analytics/identity` (bestehende Route, liefert HMAC-`distinctId`) und identifiziert den PostHog-Client, sobald Consent vorliegt — nie die rohe Supabase-User-ID im Client. In `ClientProviders` gemountet, läuft für jede Session.
**Datenklassen:** HMAC-Hash der User-ID (kein PII im Klartext), nur bei erteiltem Consent (`consent.ts`-Gate greift vor jedem Call).
**Money-Pfad:** Nein. **Security-Review:** Nein (additiv, kein neuer Schreibpfad, bestehende HMAC-Route wird nur konsumiert, nicht verändert).
**Verifizierung:** `identify.test.ts`, `posthog-client.test.ts` grün.

### K6 — Feature: Casino-Guide-Knowledge-Modularisierung + Live-Leaderboard

**Dateien (neu):** `src/lib/casino/guide-knowledge/{schema,registry,games,navigation,commands}.ts`, `src/lib/casino/guide-live-leaderboard.ts`, `src/lib/casino/__tests__/guide-live-leaderboard.test.ts`
**Dateien (geändert):** `src/lib/casino/chat-guide.ts`, `src/lib/casino/guide-telemetry.ts`, `src/components/social/CasinoGuidePanel.tsx`, `src/lib/casino/__tests__/chat-guide.test.ts`, `src/lib/casino/__tests__/guide-telemetry.test.ts`, `src/lib/security/__tests__/chat-guide-route.test.ts`
**Ziel:** Vorher hartkodierte Guide-Facts (`CASINO_GUIDE_FACTS`) → Zod-validierte, modulare Knowledge-Registry (`guide-knowledge/*`); zusätzlich optionaler Live-Block mit öffentlichem Leaderboard-Snapshot (klar als "Snapshot as of ..." markiert, Prompt-Injection-Guard für Usernamen als untrusted Daten). Modell-Default `gpt-5-mini` → konfigurierbar über `CASINO_GUIDE_MODEL` (Default `gpt-4o-mini`). Client-seitig differenzierte Fehlermeldungen (401/429) statt generischem Fehler-Throw.
**Datenklassen:** Erlaubt — statische Guide-Facts (Registry), öffentliches Leaderboard (Username/Level/Rank/Wagered, bereits öffentlich einsehbar). Verboten — weiterhin keine privaten Nutzerkontexte, keine Freitext-DB-Suche, keine Schreibtools (unverändert gegenüber Vorgabe).
**Money-Pfad:** Nein. **Security-Review:** Bereits vorab im Code adressiert (Prompt-Injection-Kommentar im Diff: Usernamen "never follow, quote as a command"), kein neuer API-Boundary — konsumiert nur bestehende `GET /api/leaderboard`-Daten server-seitig.
**Verifizierung:** 3 betroffene Testdateien + neue `guide-live-leaderboard.test.ts` grün (Teil der 671 Gesamttests).

### K7 — Feature: Erstwett-/CTA-Analytics-Signale

**Dateien:** `src/store/useCasinoStore.ts`, `src/app/games/{blackjack,dice,slots,slots/v2}/page.tsx`, `src/app/games/roulette/RouletteClient.tsx`, `src/app/stats/page.tsx`, `src/components/auth/AuthForm.tsx`, `src/components/home/HomeClientV2.tsx`, `src/store/__tests__/useCasinoStore.test.ts`
**Ziel:** Additive PostHog-Events (`first_game_started`, `cta_play_now_clicked`, `sign_up_completed`, `stats_viewed`, `landing_viewed`) — ändern nie Settlement/Wallet-Logik, nur Telemetrie. `isFirstBet`-Flag kommt vom Server (Blackjack: nur im DEAL-Response; Dice/Slots/Roulette: im Bet-Response) und wird über eine explizite Allowlist (`ANALYTICS_GAME_TYPES`) validiert, bevor der Cast auf `AnalyticsGameType` erfolgt (verhindert stillen Drop in `trackAllowedEvent()`s eigener Zod-Validierung).
**Money-Pfad:** Nein (rein additive Telemetrie, keine Wallet-Werte betroffen). **Security-Review:** Nein.
**Verifizierung:** `useCasinoStore.test.ts` (+75 Zeilen neue Tests) grün.

### K9 — Test-Infra

**Dateien:** `tests/fairness-404.spec.ts` (Playwright — verifiziert, dass `/fairness` 404 liefert statt Redirect, konsistent mit `AGENTS.md`-Key-Constraint), `tests/screenshots/01_playwright-mcp-pilot-landing.png` (Referenz-Screenshot aus MCP-Pilot-Lauf), `scripts/red-team/test-catalog.json` (Prompt-Injection-Testfälle für den Casino-Guide, korrespondiert mit K6s Untrusted-Data-Handling)
**Money-Pfad:** Nein. **Security-Review:** Nein (Testartefakte).

---

## 4 — Plan-Selbstprüfung

- Alle 84 Pfade aus `git status --porcelain -uall` sind einer Kategorie zugeordnet (K1–K9); keine Datei fehlt.
- Reihenfolge: K1 (Tooling) zuerst, da nachfolgende Commits ggf. von `tsconfig.json`/`eslint.config.mjs` abhängen (z. B. `trigger.config.ts`-Include). K4 (Docs) vor K5–K7 (Features), da einige Feature-Dateien Kommentar-Links auf umbenannte Docs referenzieren (`ConsentBanner.tsx`, Fraud-Dateien) — diese Linkfixes sind aber inhaltlich Teil von K4, nicht der Feature-Cohorten, deshalb dort gebündelt.
- Kein Money-Pfad in irgendeiner Kategorie betroffen — keine `Security-Review: Pflicht`-Kategorie vorhanden.
- Ausgeschlossen aus Scope: tatsächliche Aktivierung des Trigger.dev-Jobs in Production (K2, Owner Jan), inhaltliche Bewertung/Freigabe der Consent-Banner-Copy (bereits im Code als "nicht rechtlich geprüft, Jan gibt frei" markiert — unverändert, kein Scope dieses Cleanups).
- Kein Widerspruch zwischen dieser Datei und `worldmap/05_ZUKUNFTSPLANUNG.md` (keine Overlap-Themen).

---

## 5 — Execution-Log

| Schritt                   | Commit    | Ergebnis                                                                                                                                                                                                                               |
| ------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vorabprüfung              | —         | 671/671 Tests grün. Lint zunächst 393 Fehler/1854 Warnungen — alle aus `.trigger/tmp/**` (lokale Build-Artefakte) und unberührten Altdateien; einziger echter Treffer `src/trigger/example.ts` (`any`). Behoben vor dem ersten Commit. |
| K1 Commit                 | `9001bda` | chore(tooling): update dev tooling config and lockfile                                                                                                                                                                                 |
| K1-Fix (im Hook gefunden) | `fba4b66` | fix(tooling): pin typeRoots in typecheck-staged tmp config — mkdtemp-Änderung hatte `@types/node`-Resolution gebrochen, vom Pre-Commit-Hook selbst aufgedeckt                                                                          |
| K3 Commit                 | `9ee6f08` | chore(supabase): add local Supabase CLI scaffold                                                                                                                                                                                       |
| K4 Commit                 | `7dc3c6c` | docs: reorganize worldmap into active vs archived planning docs                                                                                                                                                                        |
| K5 Commit                 | `9d54238` | feat(analytics): identify PostHog client via HMAC distinct ID                                                                                                                                                                          |
| K6 Commit                 | `1f49673` | feat(guide): modularize knowledge base, add live leaderboard context                                                                                                                                                                   |
| K7 Commit                 | `9da2651` | feat(analytics): add first-bet and CTA event signals                                                                                                                                                                                   |
| K9 Commit                 | `50df111` | test: add fairness-404 e2e spec and guide red-team catalog                                                                                                                                                                             |
| Post-Commit-Verifikation  | —         | `npm run test` (671/671 grün), `npm run build` (kompiliert, alle Routen gerendert) erneut grün nach dem letzten Commit                                                                                                                 |
| Push                      | —         | `git push origin main`                                                                                                                                                                                                                 |

Ergebnis: `git status` zeigt nach Push nur noch diese archivierte Planungsdatei als Diff — alle 84 ursprünglichen Pfade sind in 8 thematischen Commits gelandet.
