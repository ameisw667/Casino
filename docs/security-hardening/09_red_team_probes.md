# 09 — Red-Team-Probes (Offensive CI-Gate)

> **Säule:** 9 von 10 · **Status:** 🟢 **Debugging-Session abgeschlossen, Root-Cause bestätigt** (nachgetragen 2026-08-30, ~17:45 UTC) · **06_7-Execution 2026-09-06:** wöchentlicher Schedule-Trigger, Concurrency-Blöcke, Bot-Bypass-Probe (Autor-TODOs aus Abschnitt 6 erledigt), Crash-MP-/Admin-Fraud-Proben, Katalog-Vollständigkeits-Check · **Stand:** 2026-09-06
> **Dateien:** `.github/workflows/red-team-security.yml`, `scripts/red-team/*.ts` · **Back:** [`00_SECURITY_OVERVIEW.md`](00_SECURITY_OVERVIEW.md)

> **Diese Säule ist neu und wird von keinem der bisherigen Status-Reports (`T_SECURITY_HARDENING/04_security_hardening.md`, `docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md`) erfasst** — sie ist während der Recherche für diese Dokumentation live auf `main` entstanden. Die zum ursprünglichen Schreibzeitpunkt offene Debugging-Session (Abschnitt 4) ist inzwischen abgeschlossen und mit dem tatsächlichen Ausgang nachgetragen.

---

## 1 — High-Level: Was unterscheidet das von den anderen Gates?

Alle bisherigen Gates (`secret-scan`, `dependency-audit`, `security-staging`) prüfen **defensiv** — sie verifizieren, dass eine Regel eingehalten wird. Red-Team-Probes drehen die Perspektive um: Sie **greifen die eigene, laufende App aktiv an**, mit denselben Methoden, die ein echter Angreifer nutzen würde (Rate-Limit-Umgehung, Zugriff auf fremde Datensätze via IDOR). Ein Unit-Test kann prüfen, dass eine Funktion `429` zurückgibt, wenn man sie mit den richtigen Parametern aufruft — ein Red-Team-Probe prüft, ob das **tatsächliche HTTP-Verhalten der laufenden App** unter echtem Netzwerk-, Auth- und Middleware-Zusammenspiel genauso reagiert.

---

## 2 — Architektur: `next dev`, nicht Production-Build

```yaml
on:
  schedule:
    - cron: '0 4 * * 0' # wöchentlich, Sonntag 04:00 UTC (06_7 L0 — eine Stunde nach backup-drill 03:00)
  workflow_dispatch:

concurrency:
  group: red-team-security-${{ github.ref }} # 06_7 L1 — parallele Läufe canceln statt auf
  cancel-in-progress: true # denselben ephemeren Supabase-Stack zu rennen
```

**Wichtige Design-Entscheidung, im Workflow-Kommentar begründet:** Der Rate-Limiter (`enforceRateLimit()`) liefert einen fail-closed `503`, sobald `NODE_ENV=production` UND kein Upstash konfiguriert ist — in einem ephemeren Runner ohne echte Upstash-Instanz würde ein Production-Build den Rate-Limit-Bypass-Probe also sinnlos machen (jeder Request bekäme `503` statt einer echten Rate-Limit-Antwort). Der Workflow startet die App deshalb bewusst per `npm run dev` — dieselbe getestete In-Memory-Rate-Limit-Fallback-Logik, die Jan auch lokal nutzt. **Update 06_7 (2026-09-06):** Der Gate läuft jetzt wöchentlich automatisch (`schedule: '0 4 * * 0'`) zusätzlich zu `workflow_dispatch`, mit `concurrency`-Block gegen kollidierende Läufe — die frühere reine Manuell-Situation (Abschnitt 5, Bullet 1) ist damit aufgehoben; ein Prod-Build-Wechsel bleibt bewusst außen vor (06_7 Q3a).

---

## 3 — Die sieben Probe-Skripte (`scripts/red-team/`)

| Skript                   | Was es prüft                                                                                                                                                                                           | Erwartetes Ergebnis                                                                             |
| :----------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| `target-guard.ts`        | Verhindert, dass ein Probe versehentlich gegen eine echte Produktions-URL statt der ephemeren CI-Instanz läuft (`assertSafePhase1Target()`, geteilt mit `phase1-target-guard.ts`)                      | Wirft, wenn das Ziel nicht als sicherer Nicht-Produktions-Host erkannt wird                     |
| `ephemeral-bootstrap.ts` | Legt zwei Wegwerf-Nutzer (Admin + Nicht-Admin) im ephemeren Supabase an, leitet Session-Cookies für die übrigen Probes ab                                                                              | Liefert `RED_TEAM_AUTH_COOKIE`, `RED_TEAM_NON_ADMIN_COOKIE`, `RED_TEAM_FOREIGN_USER_ID`         |
| `rate-limit-bypass.ts`   | Feuert `limit + 2` parallele Requests gegen `/api/casino/bet` (Limit 30) und `/api/casino/blackjack` (Limit 20), jeweils mit unterschiedlicher `x-forwarded-for` und teils fehlendem `Idempotency-Key` | Erwartet mindestens einen `429` UND nicht mehr akzeptierte Requests als das konfigurierte Limit |
| `admin-idor.ts`          | Versucht mit einem **Nicht-Admin-Cookie**, per `PATCH /api/admin/users` den Kontostand eines **fremden** Nutzers zu verändern (IDOR — Insecure Direct Object Reference)                                | Erwartet `401`, `403` oder `404` — niemals einen Erfolgsstatus                                  |

| `bot-bypass.ts` (06_7) | Live-Angriffssimulation der 06_1-Anti-Automation-Guards: Signup-Honeypot-Signal gegen `/api/auth/signup-suspicion`, Login-Flood gegen `/api/auth/login-guard` (hartes 5/60s-Ceiling), Promo-Guess-Flood gegen `/api/casino/redeem-code` (10×400 fail-open, 11. Request → 429) | Signup: `200 {recorded:true}` **plus** `bot_signal_honeypot`-Risk-Event (per Service-Role-Query gegen die ephemere DB verifiziert); Login: erste 5 Requests `200`, danach `429`; Promo: `voucher_velocity`/`guess_threshold`-Event für den Probe-Code |
| `crash-mp-bypass.ts` (06_7) | Rate-Limit-Boundary des separaten Crash-Multiplayer-Transports (`/api/casino/bet-crash-multiplayer`, Limit 30/10s): 32 parallele Requests mit ungültigem Body (Validation `400` **vor** jeder Wallet-Operation) | Mindestens ein `429`, nicht mehr akzeptierte Requests als das Limit, Statusmenge ⊆ {400, 429} |
| `admin-fraud-idor.ts` (06_7) | IDOR-Analogon zu `admin-idor.ts`, aber für Risk-Event-Review-Status: Nicht-Admin versucht `PATCH /api/admin/fraud` mit fabrizierter Event-UUID (kann mit keiner realen Zeile kollidieren) | Erwartet `401`, `403` oder `404` — niemals einen Erfolgsstatus |

**Bemerkenswert an `rate-limit-bypass.ts`:** Es toleriert _fehlende_ `Idempotency-Key`-Header bei jedem dritten Request (`index % 3 !== 2`) — das Skript prüft damit implizit auch, dass fehlende Idempotenz nicht versehentlich zu doppelten Wett-Buchungen führt, nicht nur das Rate-Limit selbst.

---

## 4 — Behobener Befund: Live-Debugging-Session (abgeschlossen, verifiziert)

Zwischen **17:00 und 17:20 UTC am 2026-08-30** liefen mehrere aufeinanderfolgende Commits, die exakt dieses Gate betrafen:

```
09d7534 fix(ci): strip Supabase CLI shell-quoting in red-team-security env export
c54039f fix(security): correct stale blackjack rate-limit assumption in red-team probe
23ec22a debug(security): log actual response statuses on rate-limit probe failure
5a7164d debug(security): temporary origin-guard header logging for CI diagnosis
0ebbc3a debug(ci): add raw curl step to see full 403 response body
94a1aca fix(ci): target red-team probes at localhost, not 127.0.0.1, and drop debug instrumentation
```

Der Fehler (siehe [`04_csrf_origin_guard.md`](./04_csrf_origin_guard.md) Abschnitt 4 für die Origin-Guard-Perspektive): `rate-limit-bypass.ts` bekam durchgängig `403` statt eines erwarteten `429`, weil `origin`-Header und `Host`/`x-forwarded-host` im ephemeren Runner nicht exakt übereinstimmten (`127.0.0.1` vs. `localhost`).

**Bestätigt (2026-08-30, 17:45 UTC):** Der durch `94a1aca` ausgelöste Lauf `33324856360` (`workflow_dispatch`, 17:17:46 UTC) ist **erfolgreich abgeschlossen** (`gh run view 33324856360` → `✓ red-team in 3m35s`). Die Host-Mismatch-Hypothese war korrekt — nach dem Fix auf `localhost` statt `127.0.0.1` bekam `rate-limit-bypass.ts` den erwarteten `429` und `admin-idor.ts` lief ebenfalls grün durch. Dieser Lauf ist der **erste beobachtete grüne Lauf** dieses Gates seit mindestens den 5 vorherigen, alle roten Versuchen zwischen 16:55 und 17:12 UTC.

---

## 5 — Sicherheits-Grenzen & Ehrliche Einschätzung

- **~~`workflow_dispatch`-only, kein automatischer Trigger~~ (seit 06_7, 2026-09-06 aufgehoben).** Das Gate läuft jetzt wöchentlich automatisch (Sonntag 04:00 UTC, `schedule`-Trigger) zusätzlich zu manuellem `workflow_dispatch`. Bewusst **nicht** bei jedem Push/PR: ein Red-Team-Lauf betrifft potenziell jede Route, ein sinnvoller Pfadfilter wäre unpraktisch breit, und die Ephemeral-Stack-Laufzeit macht wöchentlich den Kosten-Nutzen-Schnitt (06_7 Q1a). Eine Regression fällt damit spätestens wöchentlich automatisch auf statt nur bei manuellem Anstoßen.
- **Nutzt `next dev`, nicht den Produktions-Build.** Ein Unterschied im Verhalten zwischen Dev- und Production-Modus (z. B. andere Fehlerbehandlung, andere Bundle-Struktur) würde von diesem Gate nicht erfasst.
- **Ephemere, synthetische Nutzer (`ci-red-team-admin@ephemeral.test`) statt echter Produktionsdaten** — realistisch für Auth-/Berechtigungs-Logik, aber nicht für Datenvolumen- oder Produktionslast-Verhalten.

---

## 6 — Nächster Schritt (nicht Teil dieser reinen Doku-Aufgabe)

- **Erledigt:** Ausgang nachgetragen (Abschnitt 4), Root-Cause bestätigt.
- **Noch offen, unverändert seit Ersterfassung:** `00_SECURITY_OVERVIEW.md` Zeile 9 trägt weiterhin den alten 🔴-Status dieser Säule und war nicht Teil dieser Überarbeitungsrunde — vor der nächsten Verwendung dieser Zeile den dort stehenden Status gegen diese Datei abgleichen.
- **Neu, aus dem jetzt grünen Lauf abgeleitet — erledigt 2026-09-06 (06_7 L0):** Der wöchentliche `schedule`-Trigger ist eingerichtet (`'0 4 * * 0'`, zusätzlich zu `workflow_dispatch`, plus `concurrency`-Block auch in `security-staging.yml`). Abschnitt 2 zeigt die aktuelle Trigger-Konfiguration.
- **Neu 2026-09-04, Folgeaufgabe aus [`docs/archive/06_1_bot_automation_detection_plan.md`](../archive/06_1_bot_automation_detection_plan.md) L7 — erledigt 2026-09-06 (06_7 L2):** Der **Bot-Bypass-Testfall** ist gebaut (`scripts/red-team/bot-bypass.ts`, siehe Abschnitt 3): Signup-Honeypot-Signal-Verifikation per Service-Role-Query, Login-Guard-Flood (hartes 5/60s-Ceiling — der Guard ist bewusst NICHT fail-open, anders als die übrigen Bot-Signale) und Promo-Guess-Kette (`voucher_velocity`/`guess_threshold`). **Bekannte Restlücke dabei:** der Signal-Typ `bot_signal_login_flood` existiert im Enum, hat aber bislang keinen Producer (Stand 2026-09-06 verifiziert) — der Flood-Case prüft daher das Rate-Limit-Ceiling, nicht ein Risk-Event. Bewusst weiter ausgeklammert: Chat/Guide-Tages-Cap (Kosten- statt Sicherheitstest) und Bet-Velocity-Hint (realtime-only Signal ohne eigenen Endpunkt-Angriffsfall).
- **Neu 2026-09-06, Folgeaufgabe aus 06_7 L3 (7 bewusst nicht gebaute Proben):** Die folgende Money-/Auth-Routen-Teilmenge bleibt ohne Red-Team-Probe und ist als benannte Folgeaufgabe im Katalog (`scripts/red-team/test-catalog.json` + `scripts/red-team/catalog-coverage.ts`, `RED_TEAM_KNOWN_NOT_BUILT_ROUTES`) dokumentiert, nicht stillschweigend fallen gelassen: `casino/jackpot`, `user/balance`, `tournaments/daily-race`, `admin/promo-codes` (Erstellung), `casino/guide-persona`, `telegram/webhook`, `user/self-exclusion`. Der `red-team-catalog-coverage.test.ts` warnt bei jeder NEUEN kritischen Route ohne Probe-Entscheidung (warn-only, kein hartes CI-Gate — 06_7 L4) und schlägt fehl, wenn ein Katalogeintrag auf eine nicht mehr existierende Route zeigt.
