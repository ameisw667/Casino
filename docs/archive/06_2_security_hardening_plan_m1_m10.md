> **Archiviert 2026-08-29.** Ursprünglich `worldmap/00-04-SecurityHardening.md`. Alle 10 Meilensteine (M1–M10) sind umgesetzt und lokal verifiziert, aber **zum Zeitpunkt der Archivierung nicht committed/gepusht/deployed** — siehe [`docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md`](../status-reports/06_2_security_hardening_headers_csp.md) für den aktuellen, ehrlichen Status inkl. der Gründe, warum das Kategorie-Niveau deswegen bewusst **nicht** hochgestuft wurde. Diese Datei bleibt als vollständige Entscheidungshistorie erhalten (Recherche, Root-Cause-Analysen, verworfene Optionen, Jan-Entscheidungen) — für den aktuellen Stand den Status-Report lesen, nicht diese Datei.

# 04 — Security Hardening (Headers, CSP & Secrets): Von Top 15 % zu Top 1–10 %

> **Status:** Executed — alle 10 Meilensteine umgesetzt und verifiziert (2026-08-28); 2 Punkte bleiben bewusst offen für Jan (siehe Abschnitt 7) · **Stand:** 2026-08-28 · **Owner:** LLM · **Scope:** Härtung von Headers, Content-Security-Policy und Secrets-Handling für Kategorie 04 aus [`00_WORLDMAP_STATUS.md`](../../worldmap/00_worldmap_status.md) — bewusst **nicht** Auth/Identity (Kategorie 03) oder Rate Limiting (Kategorie 06).
> **Money-Pfad:** Nein (reine Infrastruktur-Härtung, kein Wallet-Schreibpfad) · **Security-Review:** Pflicht (jede Änderung an `src/proxy.ts` ist sicherheitsrelevant)

---

## 1 — Übersicht für Jan

Alle Meilensteine liegen vollständig beim LLM (Analyse, Umsetzung, Verifikation). Jans einzige zwingende Zuständigkeit: Freigabe vor Live-Rollout bei M2 (CI-Gate-Änderung) und M9 (HSTS-Preload-Submission, da praktisch irreversibel).

| Nummer  | Meilenstein                                                        |                     Status                     | Nächster Schritt                                                           | Zuständigkeit |
| :------ | :----------------------------------------------------------------- | :--------------------------------------------: | :------------------------------------------------------------------------- | :-----------: |
| **M1**  | **CSP Nonce statt `unsafe-inline`/`unsafe-eval`** (`src/proxy.ts`) |                 🟢 Verifiziert                 | —                                                                          |      LLM      |
| **M2**  | **Security-CI-Gate reparieren** (`security-staging.yml`)           |                 🟢 Verifiziert                 | — (Jan-Entscheidung 2026-08-28: Option A, Trigger auf `workflow_dispatch`) |      LLM      |
| **M3**  | **Zentrales Env-/Secrets-Schema mit Fail-Fast**                    |                 🟢 Verifiziert                 | —                                                                          |      LLM      |
| **M4**  | **CSRF/Origin-Guard Edge Cases härten** (`hasValidOrigin`)         |                 🟢 Verifiziert                 | —                                                                          |      LLM      |
| **M5**  | **Header-Vollständigkeit** (COOP/CORP, `Permissions-Policy`)       |                 🟢 Verifiziert                 | —                                                                          |      LLM      |
| **M6**  | **CSP-Violation-Reporting**                                        |                 🟢 Verifiziert                 | —                                                                          |      LLM      |
| **M7**  | **Supply-Chain-/Dependency-Audit-Gate**                            | 🟢 Verifiziert (advisory, noch kein Hard-Gate) | —                                                                          |      LLM      |
| **M8**  | **Secret-Rotation-SOP**                                            |                 🟢 Verifiziert                 | —                                                                          |      LLM      |
| **M9**  | **HSTS-Preload-Submission verifizieren**                           |     🟢 Verifiziert — kein Handlungsbedarf      | —                                                                          |      LLM      |
| **M10** | **`security.txt` (RFC 9116)**                                      |                 🟢 Verifiziert                 | —                                                                          |      LLM      |

Ampel: 🔴 geplant, 🟡 in Ausführung, 🟢 verifiziert ausgeführt.

---

## 2 — Ausgangslage (verifiziert, Quelle: `src/proxy.ts`, `docs/auth/12_middleware_proxy_csp.md`, 210/210 Tests grün)

- CSP vorhanden (`default-src 'self'`, `frame-ancestors 'none'`), aber `script-src` erlaubt `'unsafe-inline' 'unsafe-eval'`
- Security-Header-Set: HSTS (2 Jahre + `preload`-Flag, Listing nie verifiziert), `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` (nur 3 von >20 Features gesteuert)
- CSRF/Origin-Guard eigenbau (`hasValidOrigin`), fällt bei fehlendem `Origin`-Header offen durch
- Secrets: `SUPABASE_ADMIN_EMAILS` / `SUPABASE_SERVICE_ROLE_KEY` server-only referenziert, aber kein zentrales Env-Schema — Zugriff via `process.env.X!` (Non-Null-Assertion), Fehler erst zur Laufzeit sichtbar
- Kein CSP-Reporting, kein `security.txt`, kein dokumentierter Secret-Rotations-Turnus
- `security-staging.yml` (einziger Security-CI-Workflow) scheitert laut Worldmap-Kategorie-09-Messung an **100 % der Läufe** an `phase1-target-guard.ts`; `red-team-security.yml` wurde nie ausgelöst

„Top 15 %" (Bewertungsskala, Abschnitt 3 der Status-Datei) bedeutet: solide, kleine bekannte Lücken, nicht sicherheitsrelevant dokumentiert. Die obigen Punkte sind genau diese Lücken.

---

## 3 — Kategorien-Auflistung mit Kategorienbewertung

Jede Unterkategorie einzeln bewertet nach der Bewertungslogik aus Abschnitt 1 der Status-Datei (Risiko/Impact/Aufwand, Hoch/Mittel/Niedrig). Kein Top-%-Niveau je Unterkategorie, da nie einzeln gemessen — laut Bewertungsskala-Regel „keine Einstufung aus dem Bauch" (Abschnitt 3 der Status-Datei) wird hier nicht geraten.

| #   | Kategorie                           | Ist-Zustand                                                                   | Risiko  | Impact  | Aufwand | Meilenstein |
| :-- | :---------------------------------- | :---------------------------------------------------------------------------- | :-----: | :-----: | :-----: | :---------: |
| 1   | CSP `script-src` Nonce-Härtung      | 🟢 Umgesetzt (2026-08-28)                                                     |  Hoch   |  Hoch   | Mittel  |     M1      |
| 2   | Security-CI-Gate                    | 🟢 Umgesetzt (2026-08-28) — Interim-Fix, echtes Staging-Setup weiterhin offen |  Hoch   |  Hoch   | Mittel  |     M2      |
| 3   | Env-/Secrets-Schema Fail-Fast       | 🟢 Umgesetzt (2026-08-28) — Kernvariablen                                     | Mittel  |  Hoch   | Niedrig |     M3      |
| 4   | CSRF/Origin-Guard Edge Cases        | 🟢 Umgesetzt (2026-08-28)                                                     | Mittel  | Mittel  | Niedrig |     M4      |
| 5   | Header-Vollständigkeit (COOP/CORP)  | 🟢 Umgesetzt (2026-08-28)                                                     | Mittel  | Mittel  | Niedrig |     M5      |
| 6   | CSP-Violation-Reporting             | 🟢 Umgesetzt (2026-08-28)                                                     | Mittel  | Mittel  | Niedrig |     M6      |
| 7   | Supply-Chain-/Dependency-Audit-Gate | 🟢 Umgesetzt (2026-08-28) — advisory, kein Hard-Gate                          | Mittel  | Mittel  | Niedrig |     M7      |
| 8   | Secret-Rotation-Prozess             | 🟢 Umgesetzt (2026-08-28)                                                     | Niedrig | Mittel  | Niedrig |     M8      |
| 9   | HSTS-Preload-Submission             | 🟢 Bereits abgedeckt (2026-08-28 verifiziert)                                 | Niedrig | Niedrig | Niedrig |     M9      |
| 10  | `security.txt` (RFC 9116)           | 🟢 Umgesetzt (2026-08-28)                                                     | Niedrig | Niedrig | Niedrig |     M10     |

---

## 4 — Meilenstein-Details

### M1 — CSP Nonce statt `unsafe-inline`/`unsafe-eval` ✅ 2026-08-28

- **Ziel:** `script-src` ohne `unsafe-inline`/`unsafe-eval`, Nonce-basiert pro Request.
- **Scope:** `src/proxy.ts`, alle Inline-`<script>`-Verwendungen im App Router.
- **Umsetzung:** Recherche in `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md` (Pflichtlektüre laut `AGENTS.md` — Next 16 hat Breaking Changes) ergab: `unsafe-eval` war nie durch eine Projekt-Library nötig, sondern nur die generische Next.js-Empfehlung für Dev-Mode (React-Debug-Eval für Server-Error-Stacks). Codebase-Grep bestätigte keinen einzigen `eval(`/`new Function(`-Aufruf in `src/`. Umsetzung: Per-Request-Nonce via `crypto.randomUUID()`, `script-src 'self' 'nonce-{nonce}' 'strict-dynamic'` + `'unsafe-eval'` nur wenn `NODE_ENV === 'development'`. Nonce wird sowohl auf die Response- als auch auf die Request-Header (`x-nonce`, `Content-Security-Policy`) gesetzt, damit Next.js ihn automatisch an alle Framework-Skripte anhängt (dokumentiertes Next-16-Verhalten, kein manuelles Nonce-Wiring in `layout.tsx` nötig, da keine eigenen `<Script>`-Komponenten im Projekt existieren). `style-src` bewusst unverändert gelassen (Scope war explizit `script-src`; `style-src` von `'unsafe-inline'` zu lösen hätte projektweite `style={{...}}`-Inline-Styles betroffen — eigener, größerer Task, nicht Teil von M1).
- **Freigabe-Gate:** Keine Jan-Freigabe nötig (kein M2/M9-Sonderfall).
- **Verifizierung:** `npm run typecheck` (0 Fehler), `npx vitest run src/lib/security` (38/38 Testdateien, 274/274 Tests grün, inkl. `proxy-security-headers.test.ts` und `proxy-routing.test.ts`), `npm run build` (Next.js 16.3, Proxy kompiliert als dynamische Middleware, 51/51 Seiten generiert). `npm run lint` zeigt 2 Fehler in `RouletteClient.tsx`/`LuxuryRouletteWheel.tsx` — vorbestehend aus unversionierten Änderungen von vor dieser Session (`git status`), nicht durch M1 verursacht, außerhalb Scope.
- **Nicht-Scope:** Rate-Limiting- oder Auth-Header bleiben unverändert. `style-src` bleibt `'unsafe-inline'`.

### M2 — Security-CI-Gate reparieren ⏸️ 2026-08-28 — Diagnose fertig, Root-Cause ist keine Code-Änderung

- **Ziel:** `security-staging.yml` läuft grün statt 100 % Fail-Rate.
- **Scope:** `phase1-target-guard.ts` und der zugehörige Workflow.
- **Diagnose (verifiziert via `gh run view <id> --log-failed` + `gh secret list`):** `phase1-target-guard.ts` ist **kein Bug** — er ist ein korrekt funktionierender Fail-Closed-Schutz, der verhindert, dass das Security-Regressionsscript versehentlich gegen Production statt Staging läuft (`scripts/phase1-target-guard.ts:4-25`, prüft `PHASE1_TARGET_CONFIRMED === 'true'` + dass die Ziel-URL nicht mit `NEXT_PUBLIC_SUPABASE_URL` übereinstimmt oder wie eine Prod-Domain aussieht). Der reale Root-Cause: `gh secret list` zeigt **0 Repository-Secrets** — `PHASE1_TARGET_CONFIRMED`, `PHASE1_STAGING_URL`, `PHASE1_STAGING_DATABASE_URL` und `PHASE1_STAGING_SERVICE_ROLE_KEY` existieren nicht. Es gibt schlicht **keine Staging-Supabase-Umgebung** für dieses Projekt (bestätigt: keine Erwähnung in `docs/` oder `xx_docs/`). Der Workflow ist bei jedem Push zu 100 % rot, weil er etwas prüft, das es nicht gibt — nicht, weil Code fehlerhaft ist.
- **Warum kein Code-Fix möglich ist:** Ich kann keine echte Staging-Supabase-Instanz erzeugen oder GitHub-Repo-Secrets mit echten Credentials befüllen — das sind laut `xx_sop/09_security_wallet_invariants.md`/CLAUDE.md-Secrets-Regel und `xx_sop/11_cicd_deployment.md` K5-Aktionen (Secret-Rotation/-Erstellung), die zwingend Jans Freigabe und Zutun erfordern. Das ist außerdem eine echte Architektur-Entscheidung (separates Supabase-Projekt vs. Staging-Schema im selben Projekt vs. Workflow redesignen), die laut Start-Gate der Execution-SOP ("Bei Architektur, Scope ... anhalten und nachfragen") nicht einseitig vom LLM getroffen werden darf.
- **Jan-Entscheidung (2026-08-28):** Option A — Workflow-Trigger von `push` auf `workflow_dispatch` umstellen (wie `red-team-security.yml`), bis eine echte Staging-Umgebung existiert.
- **Umsetzung:** `.github/workflows/security-staging.yml` — `on:`-Block von `push: { paths: [...] }` auf reines `workflow_dispatch:` reduziert, mit Kommentar zur Root-Cause und Revert-Bedingung (sobald Staging-Secrets existieren, zurück auf `push`). Struktur jetzt 1:1 identisch zu `red-team-security.yml`.
- **Verifizierung:** YAML-Syntax mit `js-yaml` geparst (`VALID YAML`, `on.workflow_dispatch` korrekt erkannt) — Struktur entspricht exakt dem bereits produktiv laufenden `red-team-security.yml`-Pattern. Kein `gh run`-Live-Test nötig/möglich ohne Push; Workflow ist jetzt manuell auslösbar statt permanent rot bei jedem Commit.
- **Restrisiko / offen:** Die automatische Regressionsabdeckung bei jedem Push ist damit deaktiviert, bis Jan eine echte Staging-Supabase-Instanz + die 4 Secrets bereitstellt. Das ist ein bewusster, von Jan getroffener Kompromiss — kein abgeschlossener Zustand für „echte" CI-Sicherheit, sondern Interim-Fix gegen die permanente Rot-Meldung.
- **Abhängigkeiten:** Größter Hebel für nachhaltige Härtung — ohne echtes Staging-Setup bleibt die automatisierte Regressionssicherung für M1, M3–M10 aus. Blockiert aber nicht M3–M10 technisch, da diese nicht von einer Staging-DB abhängen.
- **Freigabe-Gate:** Erfüllt — Jan hat die Entscheidung im Chat getroffen (2026-08-28).

### M3 — Zentrales Env-/Secrets-Schema mit Fail-Fast ✅ 2026-08-28

- **Ziel:** Zod-Schema für alle Pflicht-Env-Vars, harter Fail beim App-Start statt stillem `undefined`.
- **Scope-Korrektur gegenüber Erstplanung:** Vor der Umsetzung `src/lib/security/admin.ts`, `request-security.ts`, `instrumentation-client.ts` und `posthog-client.ts` geprüft — `SUPABASE_ADMIN_EMAILS` (fehlt = fail-closed „keine Admins", ein legitimer Zustand für z. B. Preview-Deploys), `UPSTASH_REDIS_REST_URL`/`_TOKEN` (fehlt = Dev-In-Memory-Fallback, Production 503 fail-closed — bereits eigenes Invariant) sowie Sentry-DSN und PostHog-Key/Host (beide SDKs no-oppen sauber bei `undefined`) haben **bereits ein bewusstes, korrektes Soft-Fail-Design**. Ein harter Boot-Fail hätte dort unterstützte Deployment-Formen kaputt gemacht (z. B. lokale Dev-Umgebung ohne Upstash). Deshalb auf die drei Variablen ohne jeden bestehenden Fallback reduziert: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — deren Fehlen aktuell (`src/utils/supabase/client.ts:7-13`) nur einen `console.warn` auslöst und dann trotzdem einen kaputten Client mit leeren Strings baut, der erst beim ersten echten Request mit einer kryptischen Fehlermeldung scheitert.
- **Umsetzung:** Neue Datei `src/lib/env.ts` (Zod-Schema `coreEnvSchema` + `assertCoreEnv()`, einmalig validiert via Modul-Flag), aufgerufen in `src/instrumentation.ts` `register()` im `NEXT_RUNTIME === 'nodejs'`-Zweig, vor dem Sentry-Server-Init.
- **Freigabe-Gate:** Keine.
- **Verifizierung:** Neuer Test `src/lib/__tests__/env.test.ts` (6/6 grün) — deckt: alle Vars vorhanden → kein Throw; je eine der 3 Pflicht-Vars fehlt → Throw mit Variablennamen in der Fehlermeldung; ungültige URL → Throw; einmalige Validierung (zweiter Aufruf wirft nicht erneut). Zusätzlich Vollsuite verifiziert: `npm run typecheck` (0 Fehler), `npm run build` (erfolgreich, 51/51 Seiten), `npm run test` (147/147 Dateien, 1156/1156 Tests grün), `npm run lint` (weiterhin nur die 2 vorbestehenden, scope-fremden Fehler aus `RouletteClient.tsx`/`LuxuryRouletteWheel.tsx`, unverändert gegenüber vor M1).

### M4 — CSRF/Origin-Guard Edge Cases härten ✅ 2026-08-28

- **Ziel:** `hasValidOrigin()` fällt nicht mehr blind offen durch, wenn `Origin`-Header fehlt.
- **Kontext geprüft vor Umsetzung:** `hasValidOrigin()` in `src/proxy.ts` ist eine globale Vorprüfung, die für **alle** nicht-GET/HEAD/OPTIONS-Requests (außer Webhooks) läuft, auch für Routen wie `/api/casino/bet`, die zusätzlich noch die feingranularere `validateMutationOrigin()` (`src/lib/security/request-security.ts`, mit `APP_ORIGINS`-Allowlist) pro Route durchlaufen. Die Härtung hier ist also zusätzliche Tiefenverteidigung, nicht die einzige Schutzschicht — reduziert das Risiko eines Breaking Change für Geld-Routen.
- **Umsetzung:** Funktion aus `src/proxy.ts` in eigenes Modul `src/lib/security/origin-guard.ts` extrahiert (direkt testbar statt nur per Source-Text-Extraktion wie bei `isPublicRoute`). Neue Logik: zuerst `Sec-Fetch-Site`-Header prüfen (von Browsern gesetzt, nicht von Seiten-JS überschreibbar — `cross-site` wird abgelehnt, `same-origin`/`same-site`/`none` akzeptiert); nur wenn der Header fehlt (alte Browser), Fallback auf den bisherigen `Origin`-vs-`Host`-Abgleich; fehlen **beide** Header, wird jetzt **abgelehnt** statt wie vorher blind durchgelassen.
- **Bewusste Verhaltensänderung:** Manuelles API-Testen (z. B. `curl` gegen Mutation-Routen ohne gesetzten `Origin`/`Sec-Fetch-Site`-Header) wird jetzt mit `403 Invalid Origin` abgelehnt, wo es vorher durchging. Das ist beabsichtigt (echte Browser-Requests senden immer mindestens einen der beiden Header) — für manuelles Testen muss künftig ein `Origin`-Header mitgeschickt werden.
- **Freigabe-Gate:** Keine.
- **Verifizierung:** Neuer Test `src/lib/security/__tests__/origin-guard.test.ts` (8/8 grün) — deckt: weder Header vorhanden → Reject; `Sec-Fetch-Site: cross-site` → Reject trotz gültigem Origin; `same-origin`/`same-site`/`none` → Accept ohne Origin-Header; Fallback-Pfad bei fehlendem `Sec-Fetch-Site` (Origin/Host-Match, Mismatch, `x-forwarded-host`-Priorität, malformter Origin). `npm run typecheck`: 0 Fehler in den von M1–M4 geänderten Dateien. `npm run test`: 148/148 Dateien, 1164/1164 Tests grün.
- **Wichtiger Nebenbefund (nicht M4-Scope):** Ab diesem Verifikationsschritt schlägt `npm run build` an einem TypeScript-Fehler in `src/store/useCasinoStore.ts:335` fehl (`Parameters<typeof get>['0']` auf einer leeren Tupel-Typ, TS2493/TS2339). Per `git diff HEAD` verifiziert: **vollständig vorbestehend**, Teil von Jans unversionierten WIP-Änderungen von vor dieser Session, bisher nur durch einen veralteten TypeScript-Incremental-Cache (`.next/cache/tsconfig.tsbuildinfo`, `"incremental": true` in `tsconfig.json`) maskiert — mehrere `npm run build`-Läufe während M1–M3 haben den Cache offenbar invalidiert, bis der echte Fehler sichtbar wurde. **Nicht durch M1–M4 verursacht** (keiner der geänderten Dateien betroffen); als separater Chip an eine eigene Session ausgelagert (`task_cee6bbb4`), da außerhalb des Security-Hardening-Scopes. **Update 2026-08-29: gelöst** — siehe Abschnitt 7.

### M5 — Header-Vollständigkeit ✅ 2026-08-28

- **Ziel:** `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin`, `Permissions-Policy` um alle ungenutzten Browser-APIs erweitert.
- **Vor der Umsetzung geprüft (um keinen Feature-Bruch zu riskieren):** Grep über `src/` nach `window.open`, `signInWithOAuth`, `navigator.credentials`, `navigator.clipboard`, `getUserMedia`, `requestFullscreen`, `navigator.usb/hid/serial/geolocation/gamepad`, `wakeLock`. Ergebnis: Google-Sign-in läuft über vollen `redirectTo`-Redirect (`src/components/auth/AuthForm.tsx:442-444`), keine Popup-/`window.opener`-Abhängigkeit → COOP `same-origin` sicher. `navigator.clipboard.writeText` in 7 Komponenten (Referral-Code, Deposit-Adresse, MFA-Secret, Bet-Receipts) → `clipboard-write=(self)` explizit erlaubt statt implizit dem Browser-Default überlassen. WebAuthn-Passkeys laufen über Supabase-SDK intern (`experimental.passkey: true`, kein direkter `navigator.credentials`-Aufruf im eigenen Code) → `publickey-credentials-get`/`-create` explizit auf `(self)` erlaubt, um das Top-1%-Passkey-Feature nicht zu brechen. Kein Treffer für Kamera, Geolocation, Fullscreen, USB/HID/Serial, Gamepad, Wake-Lock → alle sicher auf `()` (deny) gesetzt.
- **Umsetzung:** `src/proxy.ts` — `Cross-Origin-Opener-Policy: same-origin` und `Cross-Origin-Resource-Policy: same-origin` neu gesetzt; `Permissions-Policy` von 3 auf 21 Features erweitert (18 explizit verweigert, 3 explizit auf `(self)` erlaubt inkl. der beiden neu ergänzten Passkey-Direktiven). `interest-cohort`/`browsing-topics` (FLoC/Topics-API) defensiv mitverweigert, passend zum bestehenden Privacy-Kurs (HMAC-distinctId, Consent-Gate).
- **Freigabe-Gate:** Keine.
- **Verifizierung:** `npm run typecheck` (nur der bekannte vorbestehende, scope-fremde `useCasinoStore.ts`-Fehler aus M4), `npm run test` (148/148 Dateien, 1164/1164 Tests grün), `npm run lint` (weiterhin nur die 2 vorbestehenden Fehler, unverändert). `curl -I` gegen laufende Kernrouten nicht durchgeführt (kein laufender Dev-/Preview-Server in dieser Session) — stattdessen Header-String im Quelltext gegen die Grep-Ergebnisse oben verifiziert.

### M6 — CSP-Violation-Reporting ✅ 2026-08-28

- **Ziel:** CSP-Verstöße werden sichtbar statt blind zu bleiben.
- **Umsetzung:** Neue Route `src/app/api/internal/csp-report/route.ts` — nimmt sowohl das alte `{ "csp-report": {...} }`-Einzelobjekt (`Content-Type: application/csp-report`) als auch den aktuellen Reporting-API-Batch (`application/reports+json`) an, entpackt beide auf ein einheitliches Array, leitet jeden Report (gekappt bei 20 pro Anfrage) per `Sentry.captureMessage('CSP violation reported', { level: 'warning', tags: { source: 'csp-report' }, extra: { report } })` weiter. `src/proxy.ts`: CSP um `report-uri /api/internal/csp-report; report-to csp-endpoint;` ergänzt (beide Direktiven für Browser-Kompatibilität — Firefox unterstützt nur `report-uri`), neuer `Reporting-Endpoints`-Header (`csp-endpoint="/api/internal/csp-report"`) für die aktuelle Reporting API. Route ist bewusst unauthentifiziert (der Browser selbst sendet die Reports, kein eingeloggter Nutzer) — in `PUBLIC_ROUTES` aufgenommen und von der M4-CSRF-Origin-Guard-Härtung ausgenommen (Browser-interne Reports tragen keine verlässlichen Origin/Sec-Fetch-Site-Metadaten, analog zur bestehenden Webhook-Ausnahme). Missbrauchsschutz: IP-basiertes Rate-Limit (20 Requests/10s über `enforceRateLimit`) — bei Überschreitung wird still verworfen (204), nie ein Fehler an den Browser zurückgegeben.
- **Freigabe-Gate:** Keine.
- **Verifizierung:** Neuer Test `src/lib/security/__tests__/csp-report-route.test.ts` (6/6 grün) — deckt: immer 204 ohne Body; Reporting-API-Batch wird pro Eintrag an Sentry weitergeleitet; Legacy-Einzelobjekt-Form wird korrekt entpackt; ungültiges JSON wirft nicht und ruft Sentry nicht auf; Batch wird bei 20 Einträgen gekappt; Rate-Limit greift und verwirft still. Zusätzlich `proxy-routing.test.ts` um einen Test für die neue Public-Route ergänzt. Vollsuite: `npm run typecheck` (nur der bekannte vorbestehende `useCasinoStore.ts`-Fehler), `npm run test` (149/149 Dateien, 1171/1171 Tests grün), `npm run lint` (unverändert 2 vorbestehende Fehler).

### M7 — Supply-Chain-/Dependency-Audit-Gate ✅ 2026-08-28 (advisory, noch kein Hard-Gate)

- **Ziel:** `npm audit --audit-level=high` als fester Pipeline-Schritt.
- **Vor der Umsetzung geprüft:** `npm audit --audit-level=high` lokal ausgeführt — **6 vorbestehende High-Severity-Funde** (30 gesamt inkl. moderate): `brace-expansion` (ESLint-Toolchain, non-breaking fixbar), `deepmerge-ts` via `@prisma/config` (non-breaking fixbar), `js-yaml` (non-breaking fixbar), `style-dictionary` (nur `--force`, Breaking-Change), `ws` via `@trigger.dev/sdk`/`socket.io-client` (nur `--force`, Breaking-Change). Ein sofort hart blockierendes Gate hätte ab jetzt **jeden** PR/Push rot gemacht — das wäre eine ungeplante Nebenwirkung weit über M7 hinaus und hätte für die beiden `--force`-Fälle eine Breaking-Dependency-Änderung ohne Jans Freigabe erzwungen (verboten laut Sicherheitsregeln: Downgrades/Upgrades mit Breaking Change brauchen explizite Zustimmung).
- **Entscheidung:** Gate als **advisory** (`continue-on-error: true`) eingeführt — läuft ab sofort bei jedem PR/Push und macht neue Funde im Actions-Log sichtbar, blockiert aber noch keine Merges. Umschalten auf Hard-Gate (`continue-on-error: false`) erst nach Jans Entscheidung zu den 2 Breaking-Change-Fällen.
- **Umsetzung:** Neue Datei `.github/workflows/dependency-audit.yml` (`pull_request`/`push` auf `main`, `permissions: contents: read`, `npm ci` + `npm audit --audit-level=high` mit Kommentar zur Advisory-Begründung und den 6 vorbestehenden Funden).
- **Wichtiger Nebenbefund (nicht M7-Scope):** `xx_sop/11_cicd_deployment.md` beschreibt einen dritten Workflow `.github/workflows/quality-ci.yml` (Test/Typecheck/Lint/Build bei jedem PR/Push, „blockiert Merge bedingungslos") als bereits existierend — **die Datei existiert nicht**, nur `security-staging.yml` und `red-team-security.yml` liegen im Repo. Es gibt aktuell **keinen** automatisierten Quality-Gate auf GitHub-Ebene, nur das lokale Pre-Commit-Gate. Als separater Chip an eine eigene Session ausgelagert (`task_ffa9f119`), da Neuaufbau eines kompletten CI-Workflows weit über den Security-Hardening-Scope hinausgeht — zumal er sofort auf die vorbestehenden `useCasinoStore.ts`- und `RouletteClient.tsx`-Fehler treffen würde (siehe M4-Nebenbefund). **Update 2026-08-29: gelöst** — siehe Abschnitt 7.
- **Freigabe-Gate:** Keine für den advisory-Zustand. Umschalten auf Hard-Gate braucht Jans Entscheidung zu den 2 Breaking-Change-Funden.
- **Verifizierung:** YAML mit `js-yaml` geparst (`VALID YAML`), Trigger- und Step-Struktur korrekt erkannt (`npm ci`, `npm audit --audit-level=high`). Kein `gh run`-Live-Test möglich ohne Push.

### M8 — Secret-Rotation-SOP ✅ 2026-08-28

- **Ziel:** Dokumentierter Rotationsturnus (z. B. 90 Tage `SUPABASE_SERVICE_ROLE_KEY`) statt rein reaktiver Rotation nach Incident.
- **Vor der Umsetzung geprüft:** `_Brain/50_Library/Secrets-Reference.md` gelesen — enthält bereits eine vollständige Ablageort-Übersicht projektübergreifend plus einen „CRITICAL Rotation-Backlog" für **bereits geleakte** Secrets, aber **keinen proaktiven Turnus** für Secrets, die (noch) nicht geleakt sind. Grep über alle `process.env.*`-Aufrufe in `src/` durchgeführt, um alle tatsächlich vorhandenen Server-Secrets für die Klassifizierung zu erfassen (nicht nur die 4 aus der Erstplanung).
- **Umsetzung:** Neue Datei `xx_sop/14_secret_rotation.md` — Rotationsklassen nach Blast-Radius (kritisch: `SUPABASE_SERVICE_ROLE_KEY` 90 Tage; hoch: Upstash/Sentry/Trigger.dev/OpenAI-Tokens 180 Tage; mittel: interne HMAC-/Webhook-Secrets 365 Tage; niedrig: öffentliche Keys, kein Turnus), generischer 7-Schritte-Rotationsablauf (Überlappungsfenster statt Hard-Cutover), Sonderfall HMAC-Versionierung (`GUIDE_TELEMETRY_HMAC_VERSION`). Ausdrücklich als reine Dokumentations-/Erinnerungs-SOP markiert — die tatsächliche Rotation bleibt zwingend K5 (Jans Zutun), die LLM darf nie selbstständig rotieren.
- **Zeiger ergänzt:** `_Brain/50_Library/Secrets-Reference.md` um additive Sektion „Proaktiver Rotationsturnus" erweitert, verlinkt auf die neue Casino-SOP (Obsidian-Wikilink-Konvention `[[Casino/xx_sop/14_secret_rotation]]`, geprüft gegen bestehende Links in `Casino-MOC.md`). Bestehender Inhalt der Datei nicht verändert (Additiv-Regel aus der Root-`CLAUDE.md`).
- **Bewusst nicht gemacht:** `CLAUDE.md`/`AGENTS.md` **nicht** um einen Router-Eintrag zur neuen SOP ergänzt — Projekt-`CLAUDE.md` verbietet eigenständige Bearbeitung ausdrücklich ohne Jans Freigabe im laufenden Chat. Falls gewünscht, bräuchte es eine separate Freigabe.
- **Freigabe-Gate:** Keine für die Dokumentation selbst.
- **Verifizierung:** Beide Dateien erstellt/erweitert und gelesen zur Bestätigung; kein Code betroffen, daher keine Test-/Build-Verifikation nötig.

### M9 — HSTS-Preload-Submission verifizieren ✅ 2026-08-28 — kein Handlungsbedarf

- **Ziel:** Klarheit, ob die Domain tatsächlich in der Browser-Preload-Liste gelistet ist.
- **Produktions-Domain ermittelt:** `casino-xi-six.vercel.app` (verifiziert über `.env.local` `APP_ORIGINS`, `docs/auth/01_passkeys_webauthn.md` RP-Origin, mehrere Live-Nachweise in `docs/archive/`).
- **Ergebnis der Prüfung:** `https://hstspreload.org/api/v2/status?domain=casino-xi-six.vercel.app` → `{"name": "casino-xi-six.vercel.app", "status": "preloaded", "bulk": false, "preloadedDomain": "app"}`. Das Feld `preloadedDomain: "app"` ist der entscheidende Befund: Die Domain ist **nicht** über eine projektspezifische Einreichung gelistet, sondern weil Google die gesamte `.app`-Top-Level-Domain seit deren Einführung zwingend und dauerhaft auf TLD-Ebene preloaded (HTTPS ist für jede `.app`-Domain verpflichtend, nicht optional — ein bekannter, öffentlich dokumentierter Google-Registry-Mechanismus, keine projektspezifische Aktion).
- **Konsequenz für das Freigabe-Gate:** Ursprünglich als Jan-Freigabe-pflichtig eingestuft, weil eine Submission praktisch irreversibel ist — das war die richtige Vorsicht für den angenommenen Fall „muss eingereicht werden". Da aber **nichts einzureichen ist** (bereits abgedeckt, dauerhaft, nicht rückgängig machbar da TLD-Policy), entfällt die Freigabefrage ersatzlos — es gibt keine Aktion, der Jan zustimmen oder die er ablehnen könnte.
- **Scope:** Nur Prüfung, keine Submission nötig.
- **Freigabe-Gate:** Entfällt (kein Handlungsbedarf, siehe oben).
- **Verifizierung:** Live-API-Abfrage gegen hstspreload.org (read-only, zweimal mit unterschiedlichem Prompt gegengeprüft, um Zusammenfassungs-Fehler des WebFetch-Tools auszuschließen — beide Abfragen identisch).

### M10 — `security.txt` ✅ 2026-08-28

- **Ziel:** Offizieller, risikofreier Meldeweg für externe Security-Researcher.
- **Jan-Entscheidung:** Kontaktweg-Frage gestellt (E-Mail vs. GitHub Security Advisories vs. Platzhalter) — Jan wählte **GitHub Security Advisories**, um keine private E-Mail-Adresse öffentlich auf der Live-Seite zu exponieren. Repo-Sichtbarkeit vor Umsetzung verifiziert: `gh repo view ameisw667/Casino` → `PUBLIC`, Issues aktiviert.
- **Umsetzung:** Neue Datei `public/.well-known/security.txt` — `Contact: https://github.com/ameisw667/Casino/security/advisories/new`, `Expires: 2027-08-28T00:00:00.000Z` (1 Jahr, RFC-9116-Pflichtfeld), `Preferred-Languages: de, en`, `Canonical` zeigt auf die Produktions-URL.
- **Notwendige Zusatzänderung entdeckt:** `.txt` steht nicht in der Ausschlussliste des Middleware-Matchers in `src/proxy.ts` (`config.matcher`) — ohne Anpassung hätte die Auth-Gate-Logik jeden unauthentifizierten Abruf von `/.well-known/security.txt` auf `/sign-in` umgeleitet, statt die Datei auszuliefern. `/.well-known/(.*)` zu `PUBLIC_ROUTES` ergänzt, damit RFC 9116 tatsächlich funktioniert (nicht nur die Datei existiert).
- **Freigabe-Gate:** Erfüllt — Jan hat die Kontaktweg-Entscheidung im Chat getroffen (2026-08-28).
- **Verifizierung:** Neuer Test in `proxy-routing.test.ts` (`/.well-known/security.txt` → `isPublicRoute` `true`). Vollsuite: `npm run typecheck` (0 Fehler — der zuvor beobachtete `useCasinoStore.ts`-Fehler war in diesem Lauf durch den TS-Incremental-Cache erneut nicht sichtbar, siehe Nebenbefund-Historie bei M4; Bug selbst bleibt bestehen laut `git diff`), `npm run test` (149/149 Dateien, 1172/1172 Tests grün), `npm run build` (erfolgreich, `/api/internal/csp-report` taucht korrekt in der Routenliste auf). `npm run lint`: weiterhin nur die 2 bekannten vorbestehenden Fehler in den eigenen Quelldateien — siehe Nebenbefund unten zu einem externen Störfaktor im Lint-Output.

---

## 5 — Selbstprüfung vor `Execution-Ready`

- [ ] Scope gegenüber Kategorie 03 (Auth) und Kategorie 06 (Rate Limiting) abgegrenzt — keine Überschneidung
- [ ] M2 und M9 haben explizites Jan-Freigabe-Gate benannt, alle anderen Meilensteine liegen vollständig beim LLM
- [ ] Jede Statusbehauptung in Abschnitt 2 ist als „verifiziert" (mit Quelle) oder „unverifiziert" gekennzeichnet
- [ ] Keine Referenz doppelt als SOP, Kontextreferenz und Plan gepflegt
- [ ] Datei ist für eine neue LLM-Konversation ohne diesen Chat-Verlauf eigenständig verständlich

## 6 — Verifikationsplan (gesamt)

Nach Abschluss aller Meilensteine: `npm run test`, `npm run build`, `npm run typecheck`, manueller CSP-Check via Browser-DevTools (0 Violations auf allen Kernrouten), erneuter `gh run list` für `security-staging.yml`. Erst danach Hochstufung von Kategorie 04 in `00_WORLDMAP_STATUS.md` — keine Einstufung ohne diesen Beleg (Regel aus Abschnitt 3 der Status-Datei).

**Tatsächlich ausgeführt (2026-08-28, letzter Stand nach M10):** `npm run typecheck` 0 Fehler, `npm run test` 149/149 Dateien (1172/1172 Tests) grün, `npm run build` erfolgreich (alle Routen inkl. neuer `/api/internal/csp-report` generiert), `npm run lint` unverändert 2 vorbestehende, scope-fremde Fehler in eigenen Quelldateien. CSP-Violation-Check über Browser-DevTools nicht durchgeführt (kein laufender Preview-/Dev-Server in dieser Session) — stattdessen jede Direktive gegen eine gezielte Grep-Verifikation der tatsächlichen Feature-Nutzung abgesichert (siehe M1/M5-Detailabschnitte). `gh run list` für `security-staging.yml` nicht erneut geprüft, da M2 den Trigger auf `workflow_dispatch` umgestellt hat (kein automatischer Push-Lauf mehr, der neu geprüft werden könnte) — nächster aussagekräftiger Check erst nach manuellem Dispatch oder nach Bereitstellung der Staging-Umgebung.

---

## 7 — Offene Punkte für Jan (Stand nach Follow-up-Runde 2026-08-29)

Alle 10 Meilensteine sind umgesetzt und verifiziert. Update nach Jans Bitte „von deiner Seite fortführen":

1. **M2 — echtes Staging-Setup: ✅ gelöst, aber nicht durch diesen Plan.** Ein anderer Workstream (`worldmap/00-09-CICD.md`, Commit `b5b0841`) hat mit Jan zusammen eine bessere Lösung als der hiesige Interim-Fix umgesetzt: `security-staging.yml` und `red-team-security.yml` starten jetzt einen **ephemeren lokalen Supabase-Stack** (`npx supabase start`/`stop`) direkt im Runner statt eine dauerhafte Cloud-Staging-Instanz zu brauchen — kein Account, keine Secrets, nichts zu rotieren. Mein `workflow_dispatch`-only-Interim-Fix aus M2 wurde dabei vollständig ersetzt (Trigger ist wieder `push`, jetzt mit echtem Backend). **Update 2026-08-29: der Mechanismus ist korrekt, aber `security-staging.yml` läuft live weiterhin rot** — Root-Cause ist eine Migrations-Nummern-Kollision (zwei Dateien mit Version `049`), außerhalb dieses Scopes, siehe `docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md`.
2. **M7 — Dependency-Audit-Gate: teilweise verbessert, Rest bleibt bei Jan.** `npm audit fix` (non-breaking) angewendet: **High-Severity-Funde von 6 auf 1 reduziert** (`brace-expansion`, `deepmerge-ts`, `js-yaml`, `style-dictionary` gelöst — letzteres offenbar bereits durch einen Dependabot-Merge). Verbleibend: `ws` (über `@trigger.dev/sdk`/`socket.io-client`), nur per `npm audit fix --force` lösbar — Breaking Change, braucht weiterhin Jans Entscheidung. `continue-on-error: true` bleibt bis dahin gesetzt. Volle Testsuite nach dem Fix erneut grün.

**Zusätzlich in der Follow-up-Runde erledigt:**

- Beide zuvor gespawnten Chips sind bestätigt gelöst und wurden zurückgezogen: `task_cee6bbb4` (`useCasinoStore.ts`-Typfehler — jetzt korrekt via `Parameters<CasinoState['mergeServerAchievements']>[0]`, 80/80 Store-Tests grün) und `task_ffa9f119` (`quality-ci.yml` — jetzt vorhanden, Commit `b5b0841`, exakt nach der `xx_sop/11_cicd_deployment.md`-Spezifikation).
- **Neuer Fund, ebenfalls außerhalb des Scopes**, Chip `task_2ae2ff6e`: `src/lib/casino/__tests__/multiplayer-crash-reveal-leak.test.ts` (CRITICAL-Security-Regressionstest gegen den Crash-Point-Leak-Exploit) schlägt seit dem parallel laufenden API-Envelope-Standardisierungs-Sweep (`worldmap/06_api_envelope_standardization.md`) fehl — **nicht weil die Schutzlogik kaputt ist**, sondern weil Prettier die geprüfte `if`-Zeile in `bet-crash-multiplayer/route.ts` mehrzeilig umbricht und der Test einen einzeiligen Literal-String sucht. Manuell verifiziert (Zeilen 210–289 des Route-Files, Stand 2026-08-29 09:xx): `revealCrashPoint` wird weiterhin vor `settleRound` berechnet, `crashPoint: revealCrashPoint ? crashPoint : null` steht weiterhin als späterer Sibling-Key nach dem Spread — die eigentliche Sicherheitseigenschaft ist intakt, nur der Test ist brüchig gegen Reformatierung. Fix (Whitespace-Normalisierung nach dem Muster von `proxy-security-headers.test.ts`s `norm()`-Helfer) an die separate Session ausgelagert, da die Route-Datei gerade aktiv von einem anderen Workstream bearbeitet wird.

## 8 — Zweite Follow-up-Runde (2026-08-29, Archivierung + ehrliche Neubewertung)

Jan bat darum, diese Datei zu archivieren und `00_WORLDMAP_STATUS.md`/`05_ZUKUNFTSPLANUNG.md` zu aktualisieren, mit expliziter Bitte um eine schonungslos ehrliche Neubewertung. Ergebnis dieser Prüfung (voller Befund in `docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md`):

- **`git status --short` zeigt: keine der M1–M10-Änderungen ist committed.** Alles sitzt als unversionierte Arbeitsbaum-Änderung.
- **Produktion ist unverändert** — die neue CSP/Header/Origin-Guard-Härtung ist nirgends deployed.
- **`security-staging.yml` läuft live weiterhin rot** (Migrations-Kollision `049`, nicht durch diesen Plan verursacht, aber ein Faktum, das den „automatisiert verifiziert"-Anspruch von Top 1–10 % verhindert).
- **Konsequenz:** Das Kategorie-Niveau in `00_WORLDMAP_STATUS.md` bleibt bei **Top 15 %**, bewusst **nicht** hochgestuft — die Worldmap-Regel „Automatisiert verifiziert" für Top 1–10 % ist durch lokale Ad-hoc-Tests einer einzelnen Session nicht erfüllt.
