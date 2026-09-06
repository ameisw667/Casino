# 09 — Red-Team-Probes (Offensive CI-Gate)

> **Säule:** 9 von 10 · **Status:** 🟢 **Debugging-Session abgeschlossen, Root-Cause bestätigt** (nachgetragen 2026-08-30, ~17:45 UTC) · **Stand:** 2026-08-30
> **Dateien:** `.github/workflows/red-team-security.yml`, `scripts/red-team/*.ts` · **Back:** [`00_SECURITY_OVERVIEW.md`](00_SECURITY_OVERVIEW.md)

> **Diese Säule ist neu und wird von keinem der bisherigen Status-Reports (`worldmap/04_security_hardening.md`, `docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md`) erfasst** — sie ist während der Recherche für diese Dokumentation live auf `main` entstanden. Die zum ursprünglichen Schreibzeitpunkt offene Debugging-Session (Abschnitt 4) ist inzwischen abgeschlossen und mit dem tatsächlichen Ausgang nachgetragen.

---

## 1 — High-Level: Was unterscheidet das von den anderen Gates?

Alle bisherigen Gates (`secret-scan`, `dependency-audit`, `security-staging`) prüfen **defensiv** — sie verifizieren, dass eine Regel eingehalten wird. Red-Team-Probes drehen die Perspektive um: Sie **greifen die eigene, laufende App aktiv an**, mit denselben Methoden, die ein echter Angreifer nutzen würde (Rate-Limit-Umgehung, Zugriff auf fremde Datensätze via IDOR). Ein Unit-Test kann prüfen, dass eine Funktion `429` zurückgibt, wenn man sie mit den richtigen Parametern aufruft — ein Red-Team-Probe prüft, ob das **tatsächliche HTTP-Verhalten der laufenden App** unter echtem Netzwerk-, Auth- und Middleware-Zusammenspiel genauso reagiert.

---

## 2 — Architektur: `next dev`, nicht Production-Build

```yaml
on:
  workflow_dispatch: # bewusst manuell, kein automatischer Trigger auf jeden Push
```

**Wichtige Design-Entscheidung, im Workflow-Kommentar begründet:** Der Rate-Limiter (`enforceRateLimit()`) liefert einen fail-closed `503`, sobald `NODE_ENV=production` UND kein Upstash konfiguriert ist — in einem ephemeren Runner ohne echte Upstash-Instanz würde ein Production-Build den Rate-Limit-Bypass-Probe also sinnlos machen (jeder Request bekäme `503` statt einer echten Rate-Limit-Antwort). Der Workflow startet die App deshalb bewusst per `npm run dev` — dieselbe getestete In-Memory-Rate-Limit-Fallback-Logik, die Jan auch lokal nutzt.

---

## 3 — Die vier Probe-Skripte (`scripts/red-team/`)

| Skript                   | Was es prüft                                                                                                                                                                                           | Erwartetes Ergebnis                                                                             |
| :----------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| `target-guard.ts`        | Verhindert, dass ein Probe versehentlich gegen eine echte Produktions-URL statt der ephemeren CI-Instanz läuft (`assertSafePhase1Target()`, geteilt mit `phase1-target-guard.ts`)                      | Wirft, wenn das Ziel nicht als sicherer Nicht-Produktions-Host erkannt wird                     |
| `ephemeral-bootstrap.ts` | Legt zwei Wegwerf-Nutzer (Admin + Nicht-Admin) im ephemeren Supabase an, leitet Session-Cookies für die übrigen Probes ab                                                                              | Liefert `RED_TEAM_AUTH_COOKIE`, `RED_TEAM_NON_ADMIN_COOKIE`, `RED_TEAM_FOREIGN_USER_ID`         |
| `rate-limit-bypass.ts`   | Feuert `limit + 2` parallele Requests gegen `/api/casino/bet` (Limit 30) und `/api/casino/blackjack` (Limit 20), jeweils mit unterschiedlicher `x-forwarded-for` und teils fehlendem `Idempotency-Key` | Erwartet mindestens einen `429` UND nicht mehr akzeptierte Requests als das konfigurierte Limit |
| `admin-idor.ts`          | Versucht mit einem **Nicht-Admin-Cookie**, per `PATCH /api/admin/users` den Kontostand eines **fremden** Nutzers zu verändern (IDOR — Insecure Direct Object Reference)                                | Erwartet `401`, `403` oder `404` — niemals einen Erfolgsstatus                                  |

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

- **`workflow_dispatch`-only, kein automatischer Trigger.** Anders als die übrigen drei Gates läuft dieses nicht bei jedem Push — es muss manuell ausgelöst werden. Eine Regression in der Rate-Limit- oder IDOR-Schutzlogik fällt also nicht automatisch bei jedem PR auf, nur wenn jemand das Gate aktiv anstößt.
- **Nutzt `next dev`, nicht den Produktions-Build.** Ein Unterschied im Verhalten zwischen Dev- und Production-Modus (z. B. andere Fehlerbehandlung, andere Bundle-Struktur) würde von diesem Gate nicht erfasst.
- **Ephemere, synthetische Nutzer (`ci-red-team-admin@ephemeral.test`) statt echter Produktionsdaten** — realistisch für Auth-/Berechtigungs-Logik, aber nicht für Datenvolumen- oder Produktionslast-Verhalten.

---

## 6 — Nächster Schritt (nicht Teil dieser reinen Doku-Aufgabe)

- **Erledigt:** Ausgang nachgetragen (Abschnitt 4), Root-Cause bestätigt.
- **Noch offen, unverändert seit Ersterfassung:** `00_SECURITY_OVERVIEW.md` Zeile 9 trägt weiterhin den alten 🔴-Status dieser Säule und war nicht Teil dieser Überarbeitungsrunde — vor der nächsten Verwendung dieser Zeile den dort stehenden Status gegen diese Datei abgleichen.
- **Neu, aus dem jetzt grünen Lauf abgeleitet:** Da das Gate erstmals nachweislich grün lief, wäre der nächste sinnvolle Schritt, es testweise als regelmäßig laufendes Gate (z. B. wöchentlicher `schedule`-Trigger statt nur `workflow_dispatch`) zu etablieren — bisher fällt eine Regression nur auf, wenn jemand es manuell anstößt.
- **Neu 2026-09-04, Folgeaufgabe aus [`docs/archive/06_1_bot_automation_detection_plan.md`](../archive/06_1_bot_automation_detection_plan.md) L7 (nur benannt, nicht umgesetzt):** `scripts/red-team/rate-limit-bypass.ts` um einen **Bot-Bypass-Testfall** ergänzen — die neuen Anti-Automation-Schranken (`/api/auth/login-guard`-Preflight, Signup-Honeypot/Timing-Signalisierung, Promo-Guess-Zähler, Bet-Velocity-Hint, Daily-Cost-Cap) liegen bewusst außerhalb des bisherigen 429-Bypass-Profilings und werden vom Gate aktuell nicht berührt. Sinnvollster Fall: automatisierter Signup-/Login-Ablauf mit leerem Honeypot und <2s-Submit-Timing → erwartet wird eine erfolgreiche Submission (bewusst fail-open), aber ein `bot_signal_*`-Risk-Event im Admin-Dashboard — verifiziert, dass die Signal-Kette nicht regressioniert.
