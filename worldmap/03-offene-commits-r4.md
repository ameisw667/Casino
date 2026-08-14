# 03 — Offene Commits R4: Kohorten-Plan & Execution

> **Erstellt:** 2026-08-15 · **Status:** ✅ **Executed** — 14 Commits (`7f4442a`…`472ad33`), alle Kohorten + P0-Blocker abgearbeitet, 498/498 Tests grün, `tsc`/`lint`/`build` grün. Siehe §9 Execution-Self-Audit.
> **Zweck:** Vollständige Bestandsaufnahme aller aktuell uncommitted Punkte (`git status`-Basis, verifiziert 2026-08-15), Kohorten-Zerlegung nach dem R1/R2/R3-Vorbild (`worldmap/01-offene-commits.md`/`worldmap/02-offene-commits-r2.md`, beide inzwischen retired), Abhängigkeiten, Risiken und konkrete Fehlerbehandlung — Top-Weltklasse-Anspruch analog `docs/archive/01b-c1-docs-commit-plan.md`.
> **Warum ein neuer Dateiname statt `01-offene-commits.md`:** Diese Quelldatei ist selbst Teil der aktuell uncommitted Änderungen (Delete, siehe C29) — `01_WORLDMAP_STATUS.md` dokumentiert das bereits als bewusste Entscheidung ("Quelldatei entfernt"). Sie am alten Pfad wiederzubeleben würde eine bereits getroffene Entscheidung überschreiben. R1 = `01-offene-commits.md`, R2 = `02-offene-commits-r2.md` (beide retired) → diese Datei ist konsequent **R4** (R3 lief ohne eigene Nummern-Datei, siehe Referenz in `01-offene-commits.md`s letzter Fassung).
> **Basis:** `git status --porcelain=v2 -uall`, `git diff --stat`, gezielte Einzeldiffs (2026-08-15, Branch `main`, `82cdcd6`).

---

## 1 — Executive Summary

| Kennzahl                                              | Wert                                                                     |
| ----------------------------------------------------- | ------------------------------------------------------------------------ |
| Geänderte Pfade gesamt                                | 111 (2 staged Renames + 41 unstaged Modified + 6 Deletes + 62 Untracked) |
| Davon reiner Inhalt-0-Diff (CRLF-Rauschen)            | 18 Dateien                                                               |
| Kohorten                                              | 8 Feature-Kohorten (C29–C37) + 1 Chore-Kohorte (C38)                     |
| **Blockierende Befunde (vor jedem Commit zu klären)** | **3 (P0-1, P0-2, P0-3)**                                                 |
| **Kritischer Funktions-Bruch bereits verifiziert**    | **1 (B-CRIT, siehe §3, Kohorte C33)**                                    |
| Empfohlene Commit-Reihenfolge                         | §6                                                                       |

---

## 2 — Pre-Flight-Blocker (P0) — vor dem ersten Commit klären

Diese 3 Punkte sind keine Kohorten-Details, sondern Repo-Zustand-Probleme, die mehrere Kohorten betreffen. Unbehandelt führen sie zu stillen Datenverlusten im Commit oder zu einem kaputten Pre-Commit-Hook.

### P0-1 — `.gitignore` Zeile 46 (`*.mjs`) versteckt 12 reale Dateien, davon 1 aktiv genutzt

**Befund (verifiziert via `git check-ignore -v` + `git ls-files --error-unmatch`):**

`.gitignore:46` ignoriert pauschal **alle** `*.mjs`-Dateien repoweit. Ursprünglich gedacht für Scratch-Debug-Skripte (`.qa-tmp/*.mjs`) — aber `.qa-tmp/` hat seit dieser Session bereits eine **eigene, spezifischere** Ignore-Regel (`.gitignore` Zeile 69, selbst Teil der uncommitted Änderungen, siehe C29/Diff). Zeile 46 ist damit für ihren ursprünglichen Zweck redundant und versteckt zusätzlich 12 echte, dauerhafte Projektdateien:

| Datei                                        | Tracked?                                                | Referenziert von                                                                            |
| -------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `eslint.config.mjs`                          | ✅ Tracked (vor der Regel hinzugefügt, daher unberührt) | —                                                                                           |
| `scripts/typecheck-staged.mjs`               | ❌ Unsichtbar                                           | **`package.json` `lint-staged`-Config, aktiv im Pre-Commit-Hook**                           |
| `scripts/chaos/lib/fault-proxy.mjs`          | ❌ Unsichtbar                                           | `scripts/chaos/run-fault-test.mjs`, von `worldmap/05_1.10` als "implementiert" dokumentiert |
| `scripts/chaos/lib/fault-proxy.selftest.mjs` | ❌ Unsichtbar                                           | dito                                                                                        |
| `scripts/chaos/lib/prod-guard.mjs`           | ❌ Unsichtbar                                           | dito                                                                                        |
| `scripts/chaos/run-fault-test.mjs`           | ❌ Unsichtbar                                           | `scripts/chaos/README.md`                                                                   |
| `report-errors.mjs`                          | ❌ Unsichtbar                                           | ungeklärt, root-level Skript                                                                |
| `scripts/kill-stale-dev.mjs`                 | ❌ Unsichtbar                                           | ungeklärt                                                                                   |
| `scripts/measure-bundle.mjs`                 | ❌ Unsichtbar                                           | erwähnt in `docs/status-reports/11_PERF_MOBILE.md`                                          |
| `scripts/test-config-remote.mjs`             | ❌ Unsichtbar                                           | ungeklärt                                                                                   |
| `scripts/test-upstash.mjs`                   | ❌ Unsichtbar                                           | ungeklärt                                                                                   |
| `scripts/verify-priorities.mjs`              | ❌ Unsichtbar                                           | ungeklärt                                                                                   |
| `scripts/verify-supabase-env.mjs`            | ❌ Unsichtbar                                           | vermutlich stale, siehe P0-3                                                                |

**Auswirkung, falls ignoriert:** `scripts/typecheck-staged.mjs` läuft laut `package.json` **jetzt schon** bei jedem lokalen Commit über `lint-staged` — aber die Datei existiert in keinem Commit. Ein frischer Checkout (neue Maschine, CI, anderer Rechner) hätte einen kaputten Pre-Commit-Hook (Datei fehlt → Hook-Fehler oder stiller No-op, je nach `lint-staged`-Fehlerbehandlung). Kohorte C36 (Chaos-Pivot) würde zusätzlich eine Doku committen, die Skripte als "implementiert und getestet" beschreibt, obwohl die Skripte selbst nie im Repo landen — Dokumentation/Realität-Divergenz.

**Empfehlung:** Zeile 46 (`*.mjs`) aus `.gitignore` entfernen (redundant seit `.qa-tmp/`-Regel). Danach `git status` erneut prüfen — die 12 Dateien werden als untracked sichtbar; jede einzeln bewerten (siehe P0-3 für den einen Sonderfall). **Das ist eine `.gitignore`-Änderung über das reine Doku-Update dieser Datei hinaus — Jans Freigabe nötig, bevor sie ausgeführt wird** (siehe §7 Scope-Hinweis).

### P0-2 — Kein `.gitattributes` → wiederkehrendes CRLF/LF-Rauschen

**Befund:** `.gitattributes` existiert nicht. 18 Dateien zeigen in `git status` als "Modified", haben aber laut `git diff` **0 inhaltliche Änderung** (nur Zeilenumbruch-Normalisierung, vermutlich durch Editor/Tooling auf Windows). Liste: `src/app/admin/{AdminOverviewLoader,forbidden,page}.tsx`, `src/app/admin/games/{GamesPageLoader,page}.tsx`, `src/app/admin/simulation/{SimulationPageLoader,page}.tsx`, `src/app/admin/users/{UsersPageLoader,page}.tsx`, `src/lib/casino/{wallet-contract,perf-monitor}.ts`, `src/lib/casino/__tests__/{casino-core.xp.test,helpers/supabase-mock,security-surface.test,wallet-service-authority.test}.ts`, `src/lib/security/__tests__/{admin-meta-features.test,admin-user-mutations.test}.ts`, `src/utils/{supabase/admin,time-patch}.ts`.

**Auswirkung:** Kein funktionales Risiko (0 Content-Diff), aber jede neue Session wird diese Dateien wieder als "modified" anzeigen, wenn sie geöffnet/gespeichert werden — Rauschen, das echte Änderungen verdeckt (genau das Risiko, das C1's Postmortem E4/E5 in `01b-c1-docs-commit-plan.md` bereits einmal beschrieben hat).

**Empfehlung:** `.gitattributes` mit `* text=auto eol=lf` (oder Projekt-Konvention) ergänzen, dann die 18 Dateien einmalig mit `git add --renormalize .` bereinigen. Gehört inhaltlich nicht zu einer Feature-Kohorte — eigene Chore-Kohorte C38.

### P0-3 — `scripts/verify-supabase-env.mjs` vs. `.ts`-Duplikat

**Befund:** Zwei Dateien mit identischem Zweck koexistieren: `scripts/verify-supabase-env.mjs` (durch P0-1 aktuell unsichtbar) und `scripts/verify-supabase-env.ts` (untracked, sichtbar, **neu verdrahtet** in `package.json` als `"verify:supabase": "tsx scripts/verify-supabase-env.ts"`). Die `.mjs`-Version wird von keinem `package.json`-Skript mehr referenziert.

**Empfehlung:** Vermutlich ist `.mjs` der Vorgänger, `.ts` der aktuelle Stand. **Jan-Entscheidung nötig:** `.mjs`-Datei löschen (empfohlen, wenn Vorgänger bestätigt) oder behalten (falls sie einen eigenständigen Zweck hat, der nicht ersetzt wurde).

---

## 3 — Kritischer, bereits verifizierter Funktions-Bruch (B-CRIT)

**Nicht hypothetisch — durch direkten Codevergleich bestätigt.**

`src/app/api/admin/users/route.ts` (Kohorte C33) verlangt nach der uncommitted Änderung zwingend:

1. Header `Idempotency-Key` (muss ein gültiges UUID sein, sonst 400)
2. Body-Feld `reason` (`min(1).max(500)`, sonst 400 durch Zod-Parse-Fehler)

Der einzige Caller im Repo, `src/app/admin/users/UsersPageClient.tsx:102`, sendet **beides nicht** — dieser Client ist selbst nicht Teil der uncommitted Änderungen (kein Diff, keine CRLF-Markierung, unverändert seit letztem Commit). Sobald `route.ts` committed **und deployed** wird, schlägt jeder Speichern-Klick im Admin-User-Editor (`/admin/users`) mit 400 fehl — Balance-/XP-/Level-Edits sind dann in Produktion nicht mehr nutzbar, bis der Client nachgezogen wird.

**Pflicht-Fix vor oder mit C33:** `UsersPageClient.tsx` Zeile ~102–111 um `headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() }` und `body`-Feld `reason: <UI-Eingabe oder fixer Text>` ergänzen (plus optional ein Eingabefeld für `reason`, falls Audit-Trail-Qualität gewünscht ist — sonst reicht ein Platzhaltertext). Das ist eine echte Code-Änderung, keine reine Doku-Aktualisierung — **liegt außerhalb des Scopes dieser Planungsdatei** (siehe §7) und braucht Jans Freigabe, bevor sie umgesetzt wird.

---

## 4 — Kohorten-Übersicht

| #   | Kohorte                                                  | Thema                                                  | Dateien                          | Risiko                                            | Harte Abhängigkeit                                                     |
| --- | -------------------------------------------------------- | ------------------------------------------------------ | -------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------- |
| C29 | Docs-Reorg & Zukunftsplanung-Archiv                      | worldmap→docs/architecture, 05_ZUKUNFTSPLANUNG-Kürzung | 16                               | Niedrig                                           | keine (reine Doku + 3 Kommentar-Pfad-Fixes)                            |
| C30 | Migration-Dedup 021→026                                  | pgcrypto-Seed-Chain Rename                             | 3                                | Niedrig                                           | vor C29-Doku, die 026 referenziert                                     |
| C31 | SEO-Routes & Cron-Alert-Route                            | robots/sitemap, `/api/internal/cron-alert`             | 7                                | Mittel (Auth-Verifikation offen)                  | Migration 027 (bereits laut Doku live)                                 |
| C32 | Red-Team & Security-Staging-Infra                        | CI-Workflows, Angriffsskripte                          | 10                               | **Hoch** (aktive Angriffs-Skripte + CI)           | P0-1 teilweise (verify-supabase-env)                                   |
| C33 | Wallet-Ledger-Invarianten, Risk-Signals, Admin-Audit-RPC | Migrationen 028/029, RPC-Umstellung                    | 8 real + 10 CRLF-Rider           | **Hoch** (B-CRIT, Migrations-Rollout-Reihenfolge) | Migration 028 vor Route-Deploy; B-CRIT-Fix                             |
| C34 | Auth-Hardening                                           | Validation, Error-Mapping                              | 5                                | Mittel                                            | keine                                                                  |
| C35 | Neon-Arcade-Dashboard & Frontend-Redesign                | größte Kohorte, neues Lobby-UI                         | 34                               | Mittel (Umfang, Third-Party-Libs)                 | keine harte, aber größter Review-Aufwand                               |
| C36 | Chaos/Resilience-Testing-Pivot                           | VPS→Fault-Injection-Proxy                              | 3 (+4 durch P0-1 freigeschaltet) | Mittel                                            | **P0-1 muss zuerst gelöst sein**, sonst fehlt der Code hinter der Doku |
| C37 | Generelle Planungs-Docs (nicht Neon-Arcade-spezifisch)   | 2 Superpowers-Pläne                                    | 2                                | Niedrig                                           | keine                                                                  |
| C38 | Chore: CRLF-Normalisierung                               | 18 Dateien 0-Diff                                      | Niedrig                          | P0-2 (`.gitattributes`) sollte vorher existieren  |

---

## 5 — Kohorten-Detail

### C29 — Docs-Reorg & Zukunftsplanung-Archiv

- **Staged Rename (bereits im Index):** `docs/architecture/05_2.7_ROYALE_GUIDE_OBSERVABILITY.md` ← `worldmap/05_2.7 Royale Guide Observability.md` (+34 Zeilen Nacheditierung, muss neu gestaged werden)
- **Deletes:** `worldmap/05_1.9 Applikationsweites Error-Tracking.md`, `worldmap/05_2.4 Chatbot LLM Erweiterung.md`, `worldmap/06-security-casino.md`, `worldmap/07_BRAND_DESIGN_CONTROLS_HARMONIZATION.md`, `worldmap/10_production_bugs.md`, `worldmap/01-offene-commits.md`
- **Neu:** `docs/architecture/05_1.9_ERROR_TRACKING_SENTRY.md`, `docs/architecture/05_2.4_CHATBOT_LLM_ERWEITERUNG.md`, `docs/architecture/06_SECURITY_CASINO_LOCAL_CLOSURE.md`, `docs/archive/05_ZUKUNFTSPLANUNG_ARCHIV.md`, `worldmap/05_1.0_Sentry.md`, `worldmap/elv_jan_instagram.md`
- **Modifiziert:** `01_WORLDMAP_STATUS.md`, `worldmap/05_ZUKUNFTSPLANUNG.md` (334→ Zeilen, Initiativen-Kürzung auf aktive Punkte)
- **Kommentar-Pfad-Fixes (reiten in sonst funktionalen Dateien mit):** `next.config.ts`, `sentry.server.config.ts`, `src/instrumentation-client.ts` — je 1 Zeile, verweisen jetzt auf `docs/architecture/05_1.9_...` statt `worldmap/05_1.9 ...`. 0 Verhaltensänderung.

**Risiken:**

- Link-Rotation in verbleibenden Docs, die noch alte `worldmap/0[1679]...`- oder `worldmap/10_...`-Pfade referenzieren (gleiche Fehlerklasse wie F4/F6 in `01b-c1-docs-commit-plan.md`). **Handling:** Nach Commit `grep -rn "worldmap/05_1.9\|worldmap/05_2.4\|worldmap/06-security\|worldmap/07_BRAND\|worldmap/10_production\|worldmap/01-offene-commits" docs/ worldmap/ src/` — 0 Treffer außer bewusst historischen Archiv-Referenzen.
- `worldmap/10_production_bugs.md` wird ersatzlos gelöscht (kein neuer QA-Bug-Tracker sichtbar in den untracked Dateien). **Klärungsbedarf:** ist QA-Bug-Tracking eingestellt oder woanders hin verlagert? Nicht aus dem Diff ableitbar — an Jan zu klären, nicht selbst zu entscheiden (Scope-Grenze).

### C30 — Migration-Dedup 021→026

- **Staged Rename:** `supabase/migrations/026_require_pgcrypto_for_seed_chain.sql` ← `021_require_pgcrypto_for_seed_chain.sql` (+4 Zeilen Nacheditierung)
- **Modifiziert:** `src/lib/casino/__tests__/pgcrypto-seed-migration.test.ts` (2 Zeilen, Pfad-/Nummer-Referenz)

**Kontext:** Löst das in `worldmap/05_1.10` dokumentierte Nummern-Duplikat bei `021` (zwei konkurrierende Migrationsdateien). **Abhängigkeit:** Muss vor oder mit C29 committed werden, da C29s neue Chaos-Doku bereits "021→026 bereits gelöst" behauptet — sonst Doku/Realität-Divergenz wie bei P0-1.
**Rollout-Hinweis:** Falls die alte `021`-Nummer bereits remote ausgerollt war, prüfen, ob eine Nummern-Kollision mit einer bereits angewendeten Migration in Supabase entsteht, bevor `026` remote ausgeführt wird (nicht Teil dieses Doku-Updates, sondern ein Rollout-Schritt für Jan).

### C31 — SEO-Routes & Internal Cron-Alert-Route

- **Modifiziert (real):** `src/proxy.ts` (robots.txt/sitemap.xml + `/api/internal/cron-alert` als Public/Webhook-Route, trägt zusätzlich den Kommentar-Pfad-Fix)
- **Neu:** `src/app/api/internal/cron-alert/route.ts`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/lib/site-url.ts`
- **Neue Tests:** `src/lib/casino/__tests__/seo-routes.test.ts`, `src/lib/security/__tests__/cron-alert-route.test.ts`
- **Modifiziert (real, klein):** `src/lib/security/__tests__/proxy-routing.test.ts` (+4 Zeilen)

**Risiko:** `proxy.ts` nimmt `/api/internal/cron-alert` aus dem Origin-/CSRF-Check heraus (wie ein Webhook) — das entbindet die Route **nicht** von eigener Authentifizierung. **Pflichtprüfung vor Commit:** `src/app/api/internal/cron-alert/route.ts` muss selbst ein Secret/Signatur prüfen (z. B. Shared Secret Header, analog zum Svix-Pattern bei Clerk-Webhooks). Migration `027_guide_telemetry_purge_cron.sql` (laut `01_WORLDMAP_STATUS`-Diff bereits **live in Produktion**) ruft diese Route vermutlich per `pg_cron`/`pg_net` auf — ein fehlender Secret-Check würde die Route zu einem offenen, unauthentifizierten Alert-Trigger machen. Existierender Test `cron-alert-route.test.ts` sollte genau das abdecken; vor Commit verifizieren, dass er einen 401/403-Fall für fehlendes/falsches Secret enthält.

### C32 — Red-Team & Security-Staging-Infrastruktur (höchstes externes Risiko)

- **Neu:** `.github/workflows/red-team-security.yml`, `.github/workflows/security-staging.yml`
- **Neu:** `scripts/red-team/admin-idor.ts`, `rate-limit-bypass.ts`, `target-guard.ts`
- **Neu:** `scripts/phase1-concurrency.ts`, `scripts/phase1-target-guard.ts`, `scripts/verify-security-phase1.sql`, `scripts/verify-supabase-env.ts`
- **Neue Tests:** `src/lib/security/__tests__/red-team-contract.test.ts`, `staging-regression-contract.test.ts`
- **Modifiziert (real):** `src/lib/security/request-security.ts`
- **Modifiziert (real):** `docs/status-reports/06_0_SECURITY_AUDIT_BATCH.md`, `docs/status-reports/06_1_SECURITY_REMEDIATION_F01_F06.md`
- **Modifiziert:** `package.json` (+`verify:supabase`-Skript)

**Risiko (hoch):** Diese Skripte simulieren aktiv Angriffe (IDOR-Probes, Rate-Limit-Bypass-Versuche). `scripts/red-team/target-guard.ts` und `scripts/phase1-target-guard.ts` sollen verhindern, dass sie gegen die Produktions-DB laufen — **vor Aktivierung der beiden GitHub-Actions-Workflows muss die Guard-Logik gelesen und verifiziert werden** (nicht nur, dass die Datei existiert). Empfehlung: Workflows zunächst nur mit `workflow_dispatch` (manueller Trigger) committen, nicht mit automatischem `push`/`schedule`-Trigger, bis Jan die Guard-Logik freigegeben hat. Das ist eine Sicherheitsentscheidung, keine reine Doku-Frage — **Klärungsbedarf an Jan**, nicht selbst zu entscheiden.

### C33 — Wallet-Ledger-Invarianten, Risk-Signals, Admin-Audit-RPC

- **Neu:** `src/lib/casino/risk-event-store.ts`, `risk-signals.ts`
- **Neue Tests:** `src/lib/casino/__tests__/risk-signals.test.ts`, `wallet-ledger-invariants.test.ts`
- **Neue Migrationen:** `supabase/migrations/028_wallet_ledger_invariants.sql` (definiert u. a. die RPC `admin_update_user`), `029_risk_events.sql`
- **Modifiziert (real):** `src/app/api/admin/users/route.ts` (Umstellung auf `admin_update_user`-RPC, Idempotency-Key + `reason`-Pflichtfeld — siehe **B-CRIT in §3**)
- **Modifiziert (real):** `src/app/api/casino/redeem-code/route.ts` (Risk-Event-Aufzeichnung bei Rate-Limit/Idempotency-Conflict/Voucher-Velocity)
- **CRLF-Rider (0 Content-Diff, siehe P0-2):** `wallet-contract.ts`, `perf-monitor.ts`, `src/utils/supabase/admin.ts`, `src/utils/time-patch.ts`, `casino-core.xp.test.ts`, `helpers/supabase-mock.ts`, `security-surface.test.ts`, `wallet-service-authority.test.ts`, `src/lib/security/__tests__/admin-meta-features.test.ts`, `admin-user-mutations.test.ts`

**Harte Abhängigkeit (Deploy-Reihenfolge, nicht nur Commit-Reihenfolge):** Migration `028` (definiert `admin_update_user`) muss remote ausgerollt sein, **bevor** die neue `route.ts` deployed wird — sonst schlägt `PATCH /api/admin/users` in Produktion mit "RPC not found" fehl. Zusätzlich **B-CRIT (§3): `UsersPageClient.tsx` muss vor/mit diesem Deploy nachgezogen werden**, sonst ist der Admin-Editor sofort funktionsunfähig, unabhängig vom Migrations-Status.

### C34 — Auth-Hardening

- **Neu:** `src/components/auth/auth-validation.ts`
- **Modifiziert (real):** `src/components/auth/AuthForm.tsx` (+65 Zeilen)
- **Neue Tests:** `src/lib/security/__tests__/auth-error-mapping.test.ts`, `auth-validation.test.ts`
- **Modifiziert (real, klein):** `src/utils/supabase/client.ts` (Guard gegen fehlende `NEXT_PUBLIC_SUPABASE_*`-Env-Vars, Dev-Warnung statt hartem Crash)

**Risiko:** Niedrig-Mittel. Der `client.ts`-Guard ändert das Fehlverhalten bei fehlenden Env-Vars von sofortigem Crash (`!`-Assertion) zu einem leeren String + Konsolen-Warnung — das verschiebt den Fehler von Build-/Start-Zeit auf Laufzeit (erster Supabase-Call schlägt fehl statt sofortigem Absturz). Für Produktion mit garantiert gesetzten Env-Vars unkritisch; für lokale Fehlkonfiguration ein späterer, schwerer zu lokalisierender Fehler. Vertretbarer Trade-off, aber erwähnenswert.

### C35 — Neon-Arcade-Dashboard & Frontend-Redesign (größte Kohorte)

- **Neu (Komponenten):** `src/components/home/NeonArcadeDashboard.tsx`, `NeonArcadeDashboardView.tsx`, `NeonArcadeDashboard.module.css`, `neon-arcade-dashboard-model.ts`
- **Neue Tests:** `src/components/home/__tests__/neon-arcade-dashboard-model.test.ts`, `neon-arcade-dashboard-view.test.ts`, `neon-arcade-lobby-model.test.ts`, `tests/neon-arcade-dashboard-colorway.spec.ts` (Playwright E2E)
- **Neu (Routing/Sandbox):** `src/components/layout/shell-routing.ts` + `__tests__/shell-routing.test.ts`, `src/app/testing/neon-arcade-dashboard/page.tsx`, `src/app/refactoring/layout.tsx` + `page.tsx`
- **Neue Tests (Meta/Nav):** `src/lib/meta/__tests__/v2-navigation.test.ts`, `performance-mobile.test.ts` (+52 Zeilen)
- **Modifiziert (real):** `src/components/v2/V2Hero.tsx`, `V2PromoCard.tsx`, `V2Sidebar.tsx`, `v2-data.ts`, `src/app/globals.css` (+38 Zeilen), `src/app/layout.tsx`
- **Modifiziert (real, klein):** `src/app/testing/7.3/GameActionButtonTestingClient.tsx`, `7.4/VibeSliderTestingClient.tsx`, `7.5/AutoBetDrawerTestingClient.tsx` (+237 Zeilen — größte Einzeländerung außerhalb der Kern-Komponenten), `brand-showcase/BrandShowcaseClient.tsx`
- **Modifiziert (real, klein):** `src/app/games/dice/page.tsx` (+19), `src/app/games/page.tsx` (+3), `src/app/games/roulette/RouletteClient.tsx` (+2)
- **Prototypen (Referenz, nicht produktiv gerendert):** `public/prototypes/awwwards_signal_landing.html`, `lobby_v2_refactoring.html`, `reference_option_1_neon_arcade.html`, `reference_option_3_bet_circuit.html`, `public/prototypes/lib/gsap.min.js`, `three.min.js`
- **Planungs-Docs:** `worldmap/02_FRONTEND_REDESIGN.md` (347 Zeilen), `docs/superpowers/plans/2026-08-14-neon-arcade-{complete-lobby,dashboard-optimization,dashboard,optimization}.md`, `docs/superpowers/specs/2026-08-14-neon-arcade-{complete-lobby,dashboard,dashboard-optimization}-design.md`

**Risiken:**

- Umfang: 34 Dateien, größte Kohorte — Review-Aufwand entsprechend hoch. **Empfehlung:** in 2 Teil-Commits splitten (a) Kern-Komponenten + Tests + Routing, (b) Prototypen + Planungs-Docs — reduziert Blast-Radius pro Commit, ohne den fachlichen Zusammenhang zu verlieren (beide Teile bleiben im selben Kohorten-Fenster).
- `public/prototypes/lib/gsap.min.js` und `three.min.js`: Third-Party-Minified-Libs im Repo. **Klärungsbedarf:** Lizenz-Check (GSAP hat eine eigene, nicht-MIT-Standardlizenz für bestimmte Plugins) und ob diese Dateien dauerhaft im Repo bleiben sollen oder besser per CDN/`node_modules` eingebunden würden — reine Sandbox-Prototypen laut Kontext, aber Repo-Größe/Lizenz sind Jans Entscheidung, nicht meine.
- `AutoBetDrawerTestingClient.tsx` +237 Zeilen ist unverhältnismäßig groß gegenüber den Nachbardateien (+1/+2 Zeilen) — vor Commit kurz verifizieren, dass das kein versehentlich eingecheckter Debug-/Experimentierstand ist.

### C36 — Chaos/Resilience-Testing-Pivot (VPS → Fault-Injection-Proxy)

- **Modifiziert:** `infra/chaos/README.md` (markiert VPS-Ansatz als archiviert), `scripts/chaos/README.md` (+54/-Zeilen, beschreibt neuen Proxy-Ansatz)
- **Modifiziert:** `worldmap/05_1.10 Resilience Chaos Testing.md` (310 Zeilen, vollständige Neufassung: Fault-Injection-Proxy statt Docker-VPS-Stack)
- **Durch P0-1 freigeschaltet (aktuell unsichtbar, siehe §2):** `scripts/chaos/lib/fault-proxy.mjs`, `fault-proxy.selftest.mjs`, `prod-guard.mjs`, `scripts/chaos/run-fault-test.mjs`

**Blockierend:** Diese Kohorte darf **nicht vor P0-1** committed werden — sonst landet eine Doku im Repo, die einen Node-nativen Fault-Injection-Proxy als "implementiert, 5/5 Selbsttests grün" beschreibt, während der Code dazu durch `.gitignore` unsichtbar bleibt. Reihenfolge: P0-1 lösen → die 4 freigeschalteten Dateien sichten (Selbsttest-Ergebnis stichprobenartig nachvollziehen, keine Secrets/Hostinger-Zugangsdaten im Klartext) → dann C36 zusammen mit den 4 Code-Dateien committen.

### C37 — Generelle Planungs-Docs (nicht Neon-Arcade-spezifisch)

- **Neu:** `docs/superpowers/plans/2026-08-14-technical-discoverability.md`, `2026-08-14-zukunftsplanung-aktive-roadmap.md`

Inhaltlich unabhängig von C35 (kein Neon-Arcade-Bezug im Dateinamen/Pfad-Kontext), daher als eigene Kohorte statt kritiklos in C35 gebündelt. Risiko: niedrig.

### C38 — Chore: CRLF-Normalisierung

Die 18 unter P0-2 gelisteten 0-Diff-Dateien. Nach `.gitattributes`-Einführung per `git add --renormalize .` in einem eigenen `chore:`-Commit bereinigen, getrennt von Feature-Kohorten, damit Feature-Commits nicht mit inhaltsleerem Rauschen vermischt werden.

---

## 6 — Empfohlene Commit-Reihenfolge

```
0. P0-1 (.gitignore-Fix) + P0-3-Entscheidung (Jan-Freigabe nötig)
1. P0-2 (.gitattributes) + C38 (CRLF-Renormalisierung)
2. C30 (Migration-Dedup 021→026) — vor C29, da C29-Doku 026 bereits referenziert
3. C29 (Docs-Reorg & Zukunftsplanung-Archiv)
4. C31 (SEO-Routes & Cron-Alert) — nach Verifikation des Secret-Checks in der Route
5. C34 (Auth-Hardening)
6. C33 (Wallet-Ledger/Risk-Signals/Admin-RPC) — NUR nach B-CRIT-Fix (UsersPageClient.tsx) UND nach Klärung der Migrations-Rollout-Reihenfolge mit Jan
7. C36 (Chaos-Pivot) — NUR nach P0-1
8. C35 (Neon-Arcade-Dashboard), ggf. in 2 Teil-Commits (Kern / Prototypen+Docs)
9. C37 (generelle Planungs-Docs)
10. C32 (Red-Team/Security-Staging) — zuletzt, da höchstes Risiko und Workflows erst nach Guard-Verifikation aktiv geschaltet werden sollten
```

Zwischen jedem Schritt: `npm run test`, `tsc --noEmit`, `npm run lint` grün, sowie `git status --porcelain` zur Kontrolle, dass nur die geplanten Pfade der jeweiligen Kohorte gestaged wurden (kein `git add .`/`git add -A` — analog zur V4-Regel aus `01b-c1-docs-commit-plan.md`).

---

## 7 — Scope-Hinweis (Ausführung, keine reine Planung mehr)

Ursprünglich als reine Planung angelegt. Auf explizite Anweisung (Goal-Vorgabe: direkt ausführen, selbst prüfen, danach nur noch diese Datei aktualisieren und Jan informieren) wurde die Ausführung nachgeholt — siehe §9. Alle Commits sind **lokal**, **nicht gepusht**. Nichts, was einen Remote-Zustand verändert (kein Push, keine Supabase-Migration ausgerollt, kein GitHub-Actions-Lauf ausgelöst — beide Workflows in C32 sind `workflow_dispatch`-gated und ohne Push ohnehin inaktiv), wurde angefasst. Rollout der Migrationen 026–029 in Supabase bleibt weiterhin Jans manueller Schritt (DDL-fähiger Zugang nötig, siehe `CLAUDE.md`).

---

## 8 — Self-Audit (Prüfung des eigenen Plans)

- **Geprüft — Vollständigkeit:** Alle 111 Pfade aus `git status --porcelain=v2 -uall` sind einer Kohorte oder einem P0-Punkt zugeordnet; keine Datei doppelt gezählt (Kreuzkontrolle über `comm`/manuelles Abgleichen der Listen aus §4/§5 gegen den rohen Status-Output).
- **Korrigiert während der Erstellung:** Ursprünglich war `src/app/api/admin/users/route.ts` vorläufig der Admin-UI-Polish-Kohorte zugeordnet (rein nach Verzeichnis geraten) — nach tatsächlichem Diff-Lesen zu C33 (Wallet/Risk) verschoben, weil der inhaltliche Treiber die RPC-Umstellung ist, nicht UI-Politur. Die ursprünglich angenommene "C36 Admin-Loader-Polish"-Kohorte existierte nicht real — alle 9 Dateien darin waren reines CRLF-Rauschen (P0-2), keine Feature-Arbeit.
- **Verifiziert statt angenommen:** Die `admin_update_user`-RPC-Abhängigkeit (C33) wurde per `grep` in den neuen Migrationen bestätigt (liegt in `028_wallet_ledger_invariants.sql`), nicht nur vermutet. Der B-CRIT-Bruch (§3) wurde durch tatsächliches Lesen von `UsersPageClient.tsx` bestätigt, nicht nur aus der Zod-Schema-Änderung abgeleitet — vermeidet einen False Positive.
- **Bewusst nicht entschieden (Jan-Fragen, keine LLM-Annahmen):** `worldmap/10_production_bugs.md`-Löschung ohne Ersatz (C29), GSAP/Three.js-Lizenz & Repo-Verbleib (C35), Red-Team-Workflow-Trigger-Modus (C32), `.mjs`-vs-`.ts`-Duplikat (P0-3), Migrations-Rollout-Reihenfolge für 028/029 gegen die Produktions-DB (C33) — jeweils mit Begründung in der Kohorte dokumentiert statt selbst entschieden, gemäß Projekt-Regel zu Scope-Grenzen.
- **Offen für Folge-Runde:** Nach Ausführung dieser R4-Kohorten sollte `01_WORLDMAP_STATUS.md` um eine Zeile für diese Datei ergänzt werden (analog zu den R1/R2-Einträgen) — bewusst **nicht** in dieser Session gemacht, um die bereits laufende uncommitted Änderung an `01_WORLDMAP_STATUS.md` (Teil von C29) nicht zusätzlich zu verkomplizieren.

---

## 9 — Execution-Self-Audit (post-Execution, 2026-08-15)

**Ergebnis:** ✅ Alle P0-Blocker gelöst, B-CRIT gefixt, 12 Kohorten + 3 während der Ausführung gefundene Zusatzpunkte in **14 lokalen Commits** (`7f4442a`…`472ad33`, `main`, nicht gepusht) sauber getrennt committed. 498/498 Tests grün, `tsc --noEmit` 0 Fehler (außerhalb des bewusst ausgeklammerten Stubs), `npm run lint` 0 Fehler (69 Vorbestand-Warnings), `npm run build` vollständig grün (verifiziert mit dem Stub temporär beiseitegelegt).

### 9.1 — Commit-Log dieser Session

| Hash      | Commit                                                                                         | Kohorte            |
| --------- | ---------------------------------------------------------------------------------------------- | ------------------ |
| `7f4442a` | chore: add .gitattributes                                                                      | P0-2               |
| `a7559af` | fix(db): resolve migration number duplicate at 021                                             | C30                |
| `36a9dc3` | docs: archive completed 05-initiatives, retire stale open-commits tracker                      | C29                |
| `a8d3668` | feat(seo,security): add robots/sitemap routes and authenticated cron-alert endpoint            | C31                |
| `6751942` | feat(auth): add client-side validation and mapped Supabase error messages                      | C34                |
| `8d86310` | feat(wallet,security): add ledger invariants, risk-signal tracking, and idempotent admin edits | C33 (+ B-CRIT-Fix) |
| `9bb4222` | feat(chaos): replace VPS Docker chaos stack with a fault-injection proxy                       | C36                |
| `c077ebc` | feat(frontend): add Neon Arcade dashboard and finish redesign polish                           | C35 Teil 1         |
| `4e9695d` | docs(frontend): commit redesign plan and reference prototypes                                  | C35 Teil 2         |
| `395abe4` | docs: add technical-discoverability and active-roadmap planning notes                          | C37                |
| `b404af4` | feat(security): add red-team probes and staging regression CI, gated to manual dispatch        | C32                |
| `dd7e75b` | chore: unhide dev-tooling scripts from an over-broad .gitignore rule                           | P0-1 (Abschluss)   |
| `d2aff8f` | fix(db): add the missing 027 guide-telemetry purge cron migration                              | Nachtrag zu C29    |
| `472ad33` | fix(lint): exclude vendored prototype libs from eslint                                         | Nachtrag zu C35    |

### 9.2 — Was während der Execution zusätzlich gefunden/gelöst wurde (nicht im ursprünglichen Plan)

| #   | Befund                                                                                                                                                                                                                                       | Auflösung                                                                                                                                                                                                                                                                                                                                                                        |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | Migration `027_guide_telemetry_purge_cron.sql` war im Plan nur erwähnt, aber in keiner Kohorten-Dateiliste enthalten — beim finalen `git status` nach C29 aufgefallen                                                                        | Eigener Nachtrags-Commit `d2aff8f`, inhaltlich verifiziert (ruft die in C31 committete Cron-Alert-Route auf)                                                                                                                                                                                                                                                                     |
| E2  | `public/prototypes/lib/{gsap,three}.min.js` (C35) lösten 31 ESLint-Fehler aus (`no-this-alias`, typisch für minifizierten Code) — beim finalen Lint-Lauf gefunden, nicht vorher antizipiert                                                  | `eslint.config.mjs` um `public/prototypes/lib/**` in `globalIgnores` ergänzt, Nachtrags-Commit `472ad33`; Lint danach 0 Fehler                                                                                                                                                                                                                                                   |
| E3  | `scripts/typecheck-staged.mjs` und 6 weitere `.mjs`-Dev-Skripte (`report-errors`, `kill-stale-dev`, `measure-bundle`, `test-config-remote`, `test-upstash`, `verify-priorities`) waren nach P0-1 sichtbar, aber in keiner Kohorte eingeplant | Eigener Commit `dd7e75b` — `typecheck-staged.mjs` war zwingend (aktiv im Pre-Commit-Hook, sonst bricht der Hook für jeden Neu-Checkout), die anderen 6 nach kurzer Inhaltsprüfung (keine Secrets, kein riskanter Code) mitgenommen; `verify-priorities.mjs` referenziert noch die 2026-08-08 gelöschte Route `blackjack-v2` — als stale geflaggt, nicht gefixt (außerhalb Scope) |
| E4  | `.gitignore`-Fix selbst (P0-1) war zwar im Working Tree gemacht, aber nicht committed, bis der finale Status-Check das aufdeckte                                                                                                             | In `dd7e75b` mitcommitted                                                                                                                                                                                                                                                                                                                                                        |

### 9.3 — Bewusst nicht committed

- `src/components/home/__tests__/neon-arcade-lobby-model.test.ts` — referenziert ein nicht existierendes Modul (`../neon-arcade-lobby-model`), einziger verbleibender `tsc`-Fehler im Repo. TDD-Red-Stub ohne Implementierung. Verifiziert per Build mit der Datei temporär entfernt: committeter Baum baut vollständig grün. Braucht die Modell-Implementierung (Jackpot-Pool-Ableitung, VIP-Tier-Rewards, Tournament-Countdown) — echte Feature-Arbeit, kein Commit-Staging, daher nicht selbst improvisiert.
- `.mjs`-Duplikat `scripts/verify-supabase-env.mjs` wurde nach Volltext-Vergleich als vollständig durch die `.ts`-Version ersetzt identifiziert (P0-3) und gelöscht statt committed — war nie in der Git-Historie, daher kein Informationsverlust.

### 9.4 — Nicht ausgeführt (bewusst, siehe §7)

Kein `git push`, kein Supabase-Migrations-Rollout (026–029 liegen jetzt im Repo, müssen von Jan im SQL Editor ausgeführt werden), keine Aktivierung der Red-Team-/Staging-Workflows über die `workflow_dispatch`-Gate hinaus.

### 9.5 — Fazit

Alle 3 P0-Blocker gelöst, der verifizierte B-CRIT-Bruch (Admin-User-Edit) gefixt und getestet, alle 8 Feature-Kohorten + Chore-Aufräumarbeit in nachvollziehbare, einzeln überprüfbare Commits zerlegt. Zwei während der Execution neu gefundene Probleme (E1 Migrations-Lücke, E2 Lint-Bruch durch Vendor-Libs) wurden noch in derselben Session behoben und verifiziert, nicht nur dokumentiert. Working Tree ist bis auf den bewusst ausgeklammerten TDD-Stub sauber. Bereit für Jans Review; Push und Migrations-Rollout bleiben manuelle Folgeschritte.
