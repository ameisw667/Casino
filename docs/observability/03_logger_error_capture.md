# 03 — `CasinoLogger`: Einheitlicher Konsolen- & Sentry-Kanal

> **Säule:** 3 von 9 · **Status:** 🟢 Produktionsreif · **Niveau:** 🟢 Top 8 % (siehe [Bewertungsmethode](00_OBSERVABILITY_OVERVIEW.md#1--executive-summary-für-jan-high-level--verständlich)) — **hochgestuft von Top 35 % nach dem 10-Subkategorien-Audit in Abschnitt 4 (2026-09-01)** · **Stand:** 2026-09-01 (Audit + Fixes gegen aktuellen Code verifiziert, TDD, vollständige Verifikation grün)
> **Kern-Datei:** `src/lib/casino/logger.ts` · **Back:** [`00_OBSERVABILITY_OVERVIEW.md`](00_OBSERVABILITY_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & wann brauche ich das?

Eine statische Klasse (kein Instanzieren nötig) mit fünf Log-Methoden: `info`, `success`, `warn`, `bet` (alle vier: nur lokale Konsole im Dev-Modus) und `error` (immer aktiv, zusätzlich an Sentry weitergeleitet). Statt an jeder Fehlerstelle im Code doppelt `console.error(...)` **und** `Sentry.captureException(...)` zu pflegen, gibt es einen einzigen Aufruf: `CasinoLogger.error(module, message, error?, requestId?)`.

- **Wann berühren:** Ein neuer Service-Layer-Modul braucht Logging, oder ein Catch-Block loggt aktuell nur mit `console.error` statt über `CasinoLogger`.
- **Nicht hier:** Was aus dem Sentry-Event entfernt wird → [Modul 02](./02_pii_secret_redaction.md).

---

## 2 — Neue-Projekt-Checkliste (4 Schritte)

```
[ ] 1. Jeden Catch-Block, der einen echten Fehler behandelt, über CasinoLogger.error() statt rohem console.error laufen lassen
[ ] 2. requestId mitgeben, wo bereits eine im Scope existiert (Bet/Blackjack/Redeem-Code) — sonst automatisch ohne Korrelation
[ ] 3. Bei captureException-Fidelity: immer die rohe Error-Instanz übergeben, nie ein Wrapper-Objekt (siehe Abschnitt 4)
[ ] 4. Neue console.*-Aufrufe in src/ werden von der ESLint-Regel no-console geblockt — CasinoLogger ist Pflicht, keine Ausnahme ohne Eintrag in eslint.config.mjs
```

---

## 3 — `CasinoLogger` (`src/lib/casino/logger.ts`, vollständige Datei, Stand nach Fix)

```typescript
import * as Sentry from '@sentry/nextjs';

export class CasinoLogger {
  private static isDev = process.env.NODE_ENV === 'development';

  static info(module: string, message: string, data?: unknown) {
    if (!this.isDev) return;
    console.log(`[${module}] ℹ️ ${message}`, data || '');
  }

  static success(module: string, message: string, data?: unknown) {
    if (!this.isDev) return;
    console.log(`%c[${module}] ✅ ${message}`, 'color: #00ff88; font-weight: bold;', data || '');
  }

  static warn(module: string, message: string, data?: unknown) {
    if (this.isDev) {
      console.warn(`[${module}] ⚠️ ${message}`, data || '');
    }

    try {
      Sentry.captureMessage(message, { level: 'warning', tags: { module } });
    } catch {
      // A Sentry SDK failure must never break the caller's warning path.
    }
  }

  static error(module: string, message: string, error?: unknown, requestId?: string) {
    console.error(`%c[${module}] 🚨 ${message}`, 'color: #ff4d4d; font-weight: bold;', error || '');

    try {
      const tags = requestId ? { module, request_id: requestId } : { module };
      if (error instanceof Error) {
        Sentry.captureException(error, { tags });
      } else {
        Sentry.captureMessage(message, { level: 'error', tags });
      }
    } catch {
      // A Sentry SDK failure must never break the caller's error path.
    }
  }

  static bet(game: string, amount: number, win: boolean, payout: number) {
    if (!this.isDev) return;
    const style = win ? 'color: #00ff88' : 'color: #ff4d4d';
    console.log(
      `%c[BET] ${game} | Amount: $${amount} | Result: ${win ? 'WIN' : 'LOSS'} | Payout: $${payout}`,
      `${style}; font-weight: bold;`,
    );
  }
}
```

**Was sich geändert hat (2026-09-01):** `warn()` ruft jetzt — symmetrisch zu `error()` — unconditional `Sentry.captureMessage(message, { level: 'warning', tags: { module } })` in einem eigenen try/catch auf. Die Konsolen-Ausgabe bleibt bewusst dev-gated (kein zusätzliches Vercel-Log-Rauschen in Produktion); nur der Sentry-Pfad wurde von „nur im Dev-Modus" auf „immer" umgestellt. `info`/`success`/`bet` bleiben unverändert reine Dev-Konsolen-Werkzeuge ohne Sentry-Anbindung — siehe Abschnitt 4, Subkategorie 2 für die Begründung, warum genau `warn()` und nicht auch die anderen drei umgestellt wurde.

---

## 4 — Audit: 10 Subkategorien, Niveau-Bewertung, Lücken & Fix-Status

Auf Jans Anweisung wurde `CasinoLogger` (Top 35 % im ursprünglichen Observability-Audit) in 10 Subkategorien zerlegt, jede einzeln von Top 1 % bis Top 100 % bewertet, und die gefundenen Lücken vollständig über `xx_sop/02_workflow_jan_execution.md` abgearbeitet (TDD wo anwendbar, vollständige Verifikation, Security-Review für sicherheitsrelevante Pfade). Die Tabelle zeigt Niveau **vor** und **nach** diesem Durchlauf:

| #   | Subkategorie                                                                                            | Niveau vorher | Niveau nachher            | Befund                                                                                                                                                                                                                                                                                                                                                   | Fix-Status                                                                                                                                                                                                                                                                             |
| :-- | :------------------------------------------------------------------------------------------------------ | :------------ | :------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Sentry-Dispatch-Kernlogik** (`captureException`/`captureMessage`-Unterscheidung, try/catch-Isolation) | 🟢 Top 5 %    | 🟢 Top 5 %                | Bereits exzellent, keine Lücke gefunden.                                                                                                                                                                                                                                                                                                                 | Kein Handlungsbedarf.                                                                                                                                                                                                                                                                  |
| 2   | **Log-Level-Design (Dev/Prod-Gating)**                                                                  | 🟠 Top 40 %   | 🟢 Top 5 %                | `warn()` erreichte Produktion nie — weder Konsole noch Sentry — obwohl inhaltlich oft betriebsrelevant (22 Aufrufstellen, u. a. Redis-L2-Fallbacks, Cache-Ausfälle, Chunk-Load-Fehler, Crash-Round-Iterationslimit).                                                                                                                                     | **Behoben** (Abschnitt 3, TDD RED→GREEN, 4 neue Tests).                                                                                                                                                                                                                                |
| 3   | **Vollständigkeit der zentralen Kanalisierung** (console.*-Bypass)                                      | 🔴 Top 55 %   | 🟢 Top 5 %                | 19 Aufrufstellen in 12 Produktionsdateien umgingen `CasinoLogger` komplett — darunter sicherheitsrelevante Pfade: `login-audit.ts` (Login-Audit-Trail), `fraud-ml/scan.ts`+`features.ts` (Betrugserkennung), `csp-report/route.ts` (CSP-Verletzungs-Fallback), `proxy.ts` (Security-Boundary-Catch-All), `auth/callback/route.ts` (OAuth-Code-Exchange). | **Behoben** — 12 Dateien migriert, siehe Abschnitt 5.                                                                                                                                                                                                                                  |
| 4   | **Dispatch-Qualität an Call-Sites** (Objekt- vs. `Error`-Instanz, fehlende Modul-Tags)                  | 🟡 Top 25 %   | 🟢 Top 5 %                | `GameErrorBoundary.tsx` übergab ein `{error, errorInfo}`-Objekt statt der rohen `Error` → verlor den Stack-Trace via `captureMessage`. `error.tsx`/`global-error.tsx` riefen Sentry direkt auf, ohne `module`-Tag — einzige ungetaggten Fehlerquellen im Projekt.                                                                                        | **Behoben** — siehe Abschnitt 6.                                                                                                                                                                                                                                                       |
| 5   | **Modul-Tag-Konsistenz** (Namenskonvention der `module`-Strings)                                        | 🟠 Top 40 %   | 🟠 Top 40 % (unverändert) | Zwei parallele Konventionen: `API/Pfad/Style` für die meisten Routen vs. kurze PascalCase-/UPPERCASE-Namen (`STORE`, `GAME_CONFIG`) für Services/Stores. Kosmetisch — Sentry-Tags sind Freitext, keine Gruppierungs-Beeinträchtigung.                                                                                                                    | **Bewusst kein Fix** — ein Rename über ~66 Aufrufer-Dateien für rein kosmetischen Nutzen wäre unverhältnismäßiger Blast-Radius (Overengineering-Risiko, verstößt gegen YAGNI). Für **neue** Aufrufstellen gilt: `API/…`-Style für Routen, PascalCase für Services/Komponenten.         |
| 6   | **Request-ID-Korrelation**                                                                              | 🟠 Top 45 %   | 🟠 Top 45 % (unverändert) | Nur 3 von ~66 Aufrufer-Dateien (Bet, Blackjack, Redeem-Code) reichen `requestId` durch.                                                                                                                                                                                                                                                                  | **Bewusst kein Fix** — dokumentierte, sinnvolle Beschränkung auf die drei Geld-Pfade mit dem höchsten Korrelationswert pro Aufwand; flächendeckende Erweiterung ist ein separates, größeres Vorhaben (siehe [Modul 05, Pitfall 1](./05_ratelimit_failclosed_alerting.md#7--pitfalls)). |
| 7   | **ESLint-Absicherung gegen Regression**                                                                 | 🔴 Top 90 %   | 🟢 Top 10 %               | Keine `no-console`-Regel im gesamten Projekt — nichts hinderte einen zukünftigen Commit daran, wieder einen rohen `console.error` statt `CasinoLogger.error` zu schreiben. Root Cause für Subkategorie 3.                                                                                                                                                | **Behoben** — `no-console`-Regel in `eslint.config.mjs`, scoped auf `src/**/*.{ts,tsx}`, mit expliziten Ausnahmen für `logger.ts` selbst und `src/app/testing/**`.                                                                                                                     |
| 8   | **Testabdeckung des Loggers selbst**                                                                    | 🟡 Top 20 %   | 🟢 Top 8 %                | 7 solide Tests für `error()`, aber `warn()` hatte keinerlei dedizierte Tests — insbesondere nicht den jetzt kritischen „reicht bis Sentry"-Pfad. `info()/success()/bet()` bleiben bewusst ungetestet.                                                                                                                                                    | **Teilweise behoben** — 4 neue Tests für `warn()` (TDD-Pflicht für Subkategorie 2 ohnehin). `info()/success()/bet()` bewusst ausgelassen: reine Dev-Konsolen-Ausgabe ohne Fehlerpfad-Risiko, niedriger Testwert.                                                                       |
| 9   | **Fehlerisolation gegenüber dem Aufrufer** (SDK-Ausfall-Robustheit)                                     | 🟢 Top 5 %    | 🟢 Top 5 %                | Bereits exzellent, gilt jetzt auch für den neuen `warn()`-Sentry-Pfad (eigenes try/catch).                                                                                                                                                                                                                                                               | Kein Handlungsbedarf.                                                                                                                                                                                                                                                                  |
| 10  | **Strukturierte Log-Daten / Payload-Format**                                                            | 🔴 Top 60 %   | 🔴 Top 60 % (unverändert) | `data?: unknown` wird roh an `console.log` übergeben, kein einheitliches JSON-Log-Format, keine Log-Aggregation außerhalb Sentry.                                                                                                                                                                                                                        | **Bewusst kein Fix** — für die aktuelle Solo-Projekt-Größe mit Sentry als primärer Senke ausreichend; ein volles strukturiertes Logging-System (z. B. Pino/Winston + Log-Aggregator) wäre Overengineering relativ zum tatsächlichen Bedarf (YAGNI).                                    |

**Gesamt-Niveau nach Audit:** 🟢 **Top 8 %** (gewichtet nach Praxisrelevanz — die drei größten, sicherheitsrelevanten Lücken (#2, #3, #7) sind vollständig behoben; die drei verbleibenden „kein Fix"-Einträge (#5, #6, #10) sind bewusste, dokumentierte Trade-offs ohne Korrektheits- oder Sicherheitsrisiko, kein technischer Rückstand).

---

## 5 — Subkategorie 3: Die 12 migrierten console.*-Bypass-Dateien

| Datei                                                                                          | Vorher                                                                                                                                     | Nachher                                                                         | Warum relevant                                                                                                                                                    |
| :--------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/proxy.ts`                                                                                 | `console.error('[Proxy Error]:', error)`                                                                                                   | `CasinoLogger.error('Proxy', 'Security boundary unavailable', error)`           | Middleware-Catch-All (CSRF/Origin/CSP) — ein caught, nicht rethrowter Fehler erreicht Next.js' automatische Sentry-Instrumentierung nie; war komplett unsichtbar. |
| `src/lib/security/login-audit.ts`                                                              | 2× `console.error(..., error.message)`                                                                                                     | 2× `CasinoLogger.error('LoginAudit', ..., error)`                               | Login-Audit-Trail-Fehler (DSGVO-/Security-relevant, siehe `docs/auth/06_login_audit_history.md`).                                                                 |
| `src/lib/casino/fraud-ml/scan.ts`                                                              | 2× `console.error`, 1× `console.log`                                                                                                       | 2× `CasinoLogger.error('FraudMl', ...)`, 1× `CasinoLogger.info('FraudMl', ...)` | Betrugserkennung — Risk-Event-Schreibfehler waren unsichtbar.                                                                                                     |
| `src/lib/casino/fraud-ml/features.ts`                                                          | `console.error`                                                                                                                            | `CasinoLogger.error('FraudMl', ...)`                                            | Feature-Query-Fehler für die Betrugserkennung.                                                                                                                    |
| `src/app/api/internal/csp-report/route.ts`                                                     | `console.error` (nur der äußere Catch — die eigentliche CSP-Meldung ging bereits vorher korrekt per `Sentry.captureMessage()` direkt raus) | `CasinoLogger.error('API/Internal/CspReport', ...)`                             | Konsistenz-Fix für den sekundären Fehlerpfad (Parsing-/SDK-Fehler).                                                                                               |
| `src/app/api/user/login-history/route.ts`                                                      | 3× `console.error`                                                                                                                         | 3× `CasinoLogger.error('API/User/LoginHistory', ...)`                           | Nutzer-sichtbarer Login-Verlauf (Security-UX-Feature).                                                                                                            |
| `src/app/auth/callback/route.ts`                                                               | `console.error`                                                                                                                            | `CasinoLogger.error('API/Auth/Callback', 'Code exchange failed', ...)`          | OAuth-/Magic-Link-Code-Exchange — ein gebrochener Auth-Flow war unsichtbar.                                                                                       |
| `src/app/api/user/history/route.ts`                                                            | 2× `console.error`                                                                                                                         | 2× `CasinoLogger.error('API/User/History', ...)`                                | Wallet-Transaktionshistorie-Abfragefehler.                                                                                                                        |
| `src/app/api/leaderboard/route.ts`                                                             | 3× `console.error`                                                                                                                         | 3× `CasinoLogger.error('API/Leaderboard', ...)`                                 | Leaderboard-Aggregationsfehler.                                                                                                                                   |
| `src/components/social/CasinoGuidePanel.tsx`                                                   | `console.error`                                                                                                                            | `CasinoLogger.error('CasinoGuidePanel', 'Microphone activation error', ...)`    | Client-seitiger Sprachfeature-Fehler.                                                                                                                             |
| `src/utils/supabase/client.ts`                                                                 | `console.warn` (bereits `NODE_ENV!=='production'`-gated)                                                                                   | `CasinoLogger.warn('SupabaseClient', ...)`                                      | Konsistenz — der bestehende Guard verhindert weiterhin jedes Auslösen in Produktion, daher unkritisch.                                                            |
| `src/components/casino/GameErrorBoundary.tsx`, `src/app/error.tsx`, `src/app/global-error.tsx` | Siehe Abschnitt 6 (Dispatch-Qualität, kein reiner console-Bypass)                                                                          | —                                                                               | —                                                                                                                                                                 |

**Bewusst nicht migriert:** `src/lib/casino/perf-monitor.ts` (nur `console.debug`, reines Dev-Performance-Profiling ohne Fehlerpfad-Bezug — von der neuen ESLint-Regel ausdrücklich über `allow: ['debug']` erlaubt) und `src/app/testing/**` (interne QA-Sandbox, kein Produktionscode-Pfad).

---

## 6 — Subkategorie 4: Dispatch-Qualität an den Error-Boundary-Call-Sites

**`GameErrorBoundary.tsx`** (vorher, siehe [Modul 04](./04_error_boundaries.md)):

```typescript
public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  CasinoLogger.error(this.props.gameName, 'Uncaught error', { error, errorInfo });
}
```

`{error, errorInfo}` ist ein Objekt-Literal, besteht `error instanceof Error` nicht → dispatchte über `captureMessage` statt `captureException` → kein nativer Stack-Trace.

**Nachher:**

```typescript
public componentDidCatch(error: Error) {
  // Pass the raw Error instance (not a wrapper object) so CasinoLogger.error()
  // dispatches via Sentry.captureException — preserving the native stack trace.
  CasinoLogger.error(this.props.gameName, 'Uncaught error', error);
}
```

`errorInfo.componentStack` wird bewusst nicht mehr übergeben — `CasinoLogger.error()` hat keinen Extra-Kontext-Parameter, und einen für diese eine Aufrufstelle zu ergänzen wäre eine größere API-Änderung als dieser Fix rechtfertigt. Reiner Gewinn: der native JS-Stack-Trace war vorher ohnehin nicht verfügbar (message-only Capture).

**`error.tsx`/`global-error.tsx`** (vorher: direkter `Sentry.captureException(error)`-Aufruf ohne `module`-Tag — die einzigen ungetaggten Fehlerquellen im gesamten Projekt):

```typescript
// Nachher, identisch in beiden Dateien (unterschiedliche module-Namen):
CasinoLogger.error('RouteErrorBoundary', 'Unhandled route error', error); // error.tsx
CasinoLogger.error('GlobalErrorBoundary', 'Unhandled root error', error); // global-error.tsx
```

Strikte Verbesserung ohne Fidelitätsverlust: `console.error` weiterhin unconditional, `Sentry.captureException` weiterhin try/catch-isoliert, zusätzlich jetzt mit `module`-Tag für Sentry-Dashboard-Filterung.

---

## 7 — Code-Pfade (vollständig, nach diesem Durchlauf)

```
src/lib/casino/logger.ts                             # CasinoLogger — warn() jetzt Sentry-anbindend
src/lib/casino/__tests__/logger.test.ts               # 11 Tests (7 error() + 4 neue warn()-Tests)
eslint.config.mjs                                     # no-console-Regel (src/**), Ausnahmen: logger.ts, app/testing/**

# Migrierte console.*-Bypass-Dateien (Subkategorie 3):
src/proxy.ts
src/lib/security/login-audit.ts
src/lib/casino/fraud-ml/scan.ts
src/lib/casino/fraud-ml/features.ts
src/app/api/internal/csp-report/route.ts
src/app/api/user/login-history/route.ts
src/app/auth/callback/route.ts
src/app/api/user/history/route.ts
src/app/api/leaderboard/route.ts
src/components/social/CasinoGuidePanel.tsx
src/utils/supabase/client.ts

# Dispatch-Qualität-Fixes (Subkategorie 4):
src/components/casino/GameErrorBoundary.tsx
src/app/error.tsx
src/app/global-error.tsx
```

---

## 8 — Pitfalls (verbleibend nach dem Audit)

> **Pitfall 1 — Modul-Tag-Konvention ist nicht erzwungen (Subkategorie 5):** Es gibt keine Lint-Regel, die `API/…`-Style vs. PascalCase durchsetzt. Neue Aufrufstellen orientieren sich an Abschnitt 5 der Tabelle in Abschnitt 4 — an bestehenden Nachbardateien im selben Verzeichnis.

> **Pitfall 2 — `warn()` sendet jetzt bei jedem Aufruf an Sentry, auch bei hoher Frequenz:** 22 bestehende Aufrufstellen lösen jetzt potenziell häufiger Sentry-Events aus als vorher (vorher: 0 in Produktion). Bei einem echten Vorfall mit wiederholten Warnungen (z. B. ein dauerhaft ausgefallener Redis-L2-Cache) könnte das Free-Tier-Kontingent (5.000 Events/Monat, siehe [Modul 01](./01_sentry_sdk_core.md)) schneller als bisher aufgebraucht werden. Kein Sampling/Throttling in diesem Durchlauf ergänzt — bewusst zurückgestellt, da noch keine Praxisdaten zur tatsächlichen `warn()`-Frequenz in Produktion vorliegen. **Beobachten und bei Bedarf nachschärfen**, statt vorab zu optimieren (YAGNI).

> **Pitfall 3 — Objekt- statt Error-Instanz bleibt ein latentes Risiko an neuen Call-Sites:** Der Fix in Abschnitt 6 behebt die zwei bekannten Fälle, verhindert aber nicht strukturell, dass ein zukünftiger Aufrufer erneut ein Wrapper-Objekt statt der rohen `Error` übergibt. Keine TypeScript-Overload-Absicherung ergänzt (würde die Signatur von `CasinoLogger.error()` für alle ~150 Aufrufstellen verschärfen — außerhalb des Scopes dieses Durchlaufs).

---

## 9 — Tests & Verifikation (dieser Durchlauf, 2026-09-01)

- `src/lib/casino/__tests__/logger.test.ts` — 11/11 grün (7 bestehende `error()`-Tests unverändert, 4 neue `warn()`-Tests: Sentry-Weiterleitung außerhalb Dev, SDK-Fehler-Isolation, kein `captureException`-Fallback, keine Konsolen-Ausgabe außerhalb Dev).
- `npm run test` — **1354/1354 Tests grün** (179 Testdateien, keine Regression in anderen Modulen).
- `npm run typecheck` — 0 Fehler.
- `npm run lint` — 0 Fehler (22 vorbestehende, unveränderte Warnungen in unberührten Dateien).
- `npm run build` — grün, alle Routen inkl. `Proxy (Middleware)` erfolgreich kompiliert.
- `npm run vibe-check` — grün.
- **Security-Review:** `security-reviewer`-Agent gezielt gegen alle sicherheitsrelevanten Änderungen dieses Durchlaufs angesetzt (Login-Audit, Fraud-ML, Proxy-Boundary, Auth-Callback, CSP-Report, `warn()`-Sentry-Anbindung, `no-console`-ESLint-Regel). **Ergebnis: Keine CRITICAL-/HIGH-Befunde.**
  - Alle 22 bestehenden `warn()`-Aufrufstellen geprüft: jede `message`-Zeichenkette ist statisch entwicklerverfasst, keine interpolierten Nutzerdaten/Secrets; der `data`/`error`-Payload-Parameter wird weiterhin **nicht** an Sentry weitergereicht (nur `message` + `module`-Tag) — kein Datenleck durch den `warn()`-Fix.
  - `login-audit.ts`, `fraud-ml/*`: übergebene Fehlerobjekte sind generische `PostgrestError`-Formen (message/details/hint/code), keine rohen `userAgent`/IP/Fingerprint-Werte — diese sind vor dem Insert bereits maskiert/transformiert.
  - `proxy.ts`: der umschlossene Try-Block wurde codeseitig durchgesehen — keine realistische Stelle, an der ein Cookie-/Session-Token-Wert in eine `Error.message` interpoliert würde; `sentry-scrub.ts` löscht `event.request.cookies`/`.headers` ohnehin vollständig, unabhängig vom Nachrichtentext.
  - `auth/callback/route.ts`: eigenständig verifiziert (Quellcode von `@supabase/auth-js`, `GoTrueClient.js`, `_exchangeCodeForSession()`), dass der OAuth-`code`/PKCE-`code_verifier` ausschließlich als POST-Body-Feld gesendet wird und **nie** in eine geworfene `Error.message` interpoliert wird — der jetzt an Sentry gemeldete Fehlertext ist ausschließlich der generische API-Fehler des Auth-Servers (z. B. „invalid grant …“). Kein Leck.
  - Redaktions-Pipeline bestätigt: `beforeSend: scrubSentryEvent` ist in allen drei Runtime-Configs identisch verdrahtet und läuft unabhängig vom Entry-Point (`captureException` oder `captureMessage`) — alle neuen Call-Sites dieses Durchlaufs sind davon abgedeckt, keine Bypass-Möglichkeit gefunden.
  - `eslint.config.mjs`: `no-console`-Regel korrekt auf `src/**` beschränkt, kollidiert nicht mit den bestehenden `no-restricted-imports`-/`no-unused-vars`-Blöcken.
  - **Ein vorbestehender, nicht durch diesen Durchlauf verursachter struktureller Befund (MEDIUM, außerhalb des Logger-Scopes):** `sentry-scrub.ts` filtert `extra`/`contexts`/`breadcrumbs`/`request`/`user` nach Schlüsselnamen, aber **nicht** den Freitext von `event.exception.values[].value` (die Exception-Message) oder den Stack-Trace-Text selbst — ein zukünftiges `throw new Error(...)` mit einem interpolierten Secret würde über **jeden** `captureException`-Aufruf im Projekt (nicht nur die neuen aus diesem Durchlauf) ungefiltert an Sentry gelangen. Als separate Aufgabe ausgegliedert (siehe [Modul 02](./02_pii_secret_redaction.md)), nicht Teil dieses Logger-Fixes.
