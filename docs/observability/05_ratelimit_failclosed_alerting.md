# 05 — Fail-Closed Rate-Limiter-Instrumentierung (44 Routen, 2 Funktionen)

> **Säule:** 5 von 9 · **Status:** 🟢 Produktionsreif · **Niveau:** 🟢 Top 10 % (siehe [Bewertungsmethode](00_OBSERVABILITY_OVERVIEW.md#1--executive-summary-für-jan-high-level--verständlich); Abzug wegen Pitfall 1 unten) · **Stand:** 2026-08-31 (Code 1:1 verifiziert, Aufrufer-Liste frisch gegrept)
> **Kern-Datei:** `src/lib/security/request-security.ts` · **Back:** [`00_OBSERVABILITY_OVERVIEW.md`](00_OBSERVABILITY_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & wann brauche ich das?

`enforceRateLimit()` ist die zentrale Rate-Limit-Funktion für **42 API-Routen** (direkt oder über den `withRateLimit()`-Wrapper, beide identisch fail-closed). Ihr eigentlicher Zweck ist Missbrauchsschutz (Sliding-Window über Upstash Redis) — für Observability entscheidend ist aber ihr **Fail-Closed-Verhalten**: Ist Upstash nicht erreichbar oder in Produktion nicht konfiguriert, meldet die Funktion sich selbst per `Sentry.captureMessage()` und liefert eine kontrollierte Fehlerantwort statt eines stillen Durchwinkens.

- **Wann berühren:** Eine neue API-Route braucht Rate-Limiting, oder das Fail-Closed-Verhalten bei Infrastruktur-Ausfall muss angepasst werden.
- **Nicht hier:** `/api/health` nutzt bewusst **nicht** diese Funktion, sondern einen eigenen fail-**offenen** In-Memory-Limiter → [Modul 06](./06_health_check_uptime_monitoring.md).

---

## 2 — Neue-Projekt-Checkliste (3 Schritte)

```
[ ] 1. enforceRateLimit(identifier, scope, limit, windowSeconds) am Routenanfang aufrufen, VOR Body-Parsing
[ ] 2. Bei result.unavailable === true → 503 zurückgeben (Infra-Ausfall), bei result.success === false → 429 (echtes Limit)
[ ] 3. rateLimitHeaders(result) in die Response-Header mergen (X-RateLimit-*, Retry-After)
```

---

## 3 — `enforceRateLimit()` (`src/lib/security/request-security.ts`, Kernlogik)

```typescript
export interface RateLimitDecision {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  unavailable?: boolean;
}

// Controlled fail-closed 503s never throw, so they'd otherwise never reach
// Sentry — this is the 1.9 dependency 1.10 (chaos testing) relies on to
// observe simulated Upstash outages.
function reportRateLimiterUnavailable(scope: string): void {
  try {
    Sentry.captureMessage('Rate limiter unavailable, failing closed', {
      level: 'error',
      tags: { scope },
    });
  } catch {
    // A Sentry SDK failure must never affect the fail-closed rate limit decision.
  }
}

export async function enforceRateLimit(
  identifier: string,
  scope: string,
  limit = 10,
  windowSeconds = 10,
): Promise<RateLimitDecision> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      // ... sliding-window limiter via @upstash/ratelimit, cached per (url, token, scope, limit, window)
      const result = await remoteLimiter.limit(identifier);
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    } catch {
      reportRateLimiterUnavailable(scope);
      return {
        success: false,
        unavailable: true,
        limit,
        remaining: 0,
        reset: Date.now() + windowSeconds * 1000,
      };
    }
  }
  if (process.env.NODE_ENV === 'production') {
    // Missing Upstash credentials in production is itself an incident, not a silent local-dev fallback.
    reportRateLimiterUnavailable(scope);
    return {
      success: false,
      unavailable: true,
      limit,
      remaining: 0,
      reset: Date.now() + windowSeconds * 1000,
    };
  }

  // Dev-only in-memory sliding window when no Upstash credentials are configured locally.
  // ...
}
```

Zwei Auslöser für `reportRateLimiterUnavailable(scope)`:

1. Der Upstash-Redis-Call wirft (Netzwerkfehler, Timeout, Auth-Fehler).
2. `UPSTASH_REDIS_REST_URL`/`_TOKEN` fehlen **und** `NODE_ENV === 'production'` — ein fehlkonfigurierter Prod-Deploy ist selbst ein Incident, kein akzeptabler Fallback.

In beiden Fällen: `{ success: false, unavailable: true, ... }` — die aufrufende Route muss das als **503** (Infra-Ausfall), nicht als **429** (echtes Rate-Limit) beantworten.

---

## 4 — `rateLimitHeaders()`

```typescript
export function rateLimitHeaders(result: RateLimitDecision): HeadersInit {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
    ...(result.success
      ? {}
      : { 'Retry-After': String(Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))) }),
  };
}
```

`Retry-After` erscheint nur bei einer Ablehnung (`success: false`) — egal ob echtes Limit oder Infra-Ausfall.

---

## 5 — Die 44 Aufrufer (Stand 2026-09-08)

```
user/stats, user/history, user/login-history, user/balance, user/self-exclusion,
telegram/toggle, telegram/unlink, telegram/link, telegram/status, telegram/webhook,
notifications, notifications/[id], notifications/read-all,
leaderboard,
chat, chat/voice-synthesize, chat/voice-transcribe, chat/bot-response, chat/feedback,
casino/seeds, casino/seeds/history, casino/redeem-code, casino/blackjack, casino/bet, casino/bet-crash-multiplayer, casino/guide-persona,
admin/users, admin/users/[id]/status, admin/overview, admin/promo-codes, admin/promo-codes/[code]/reverse, admin/knowledge, admin/games, admin/job-health,
admin/fraud, admin/fraud/scan, admin/fraud/complete-wait, admin/evals, admin/analytics,
analytics/identity, internal/csp-report,
auth/login-guard (scope `login-attempt`), auth/signup-suspicion (scope `signup-suspicion`),
auth/signup-fingerprint (scope `signup-fingerprint`)
```

> **Update 2026-09-08 (06_3 Multi-Account-Abuse-Prevention, L0/L2):** Neu instrumentiert: `auth/signup-fingerprint` (`signup-fingerprint`, 10/60s, IP-basiert, fail-offener Empfänger analog `signup-suspicion`) und `admin/users/[id]/status` (`admin-users-status-write`, 10/60s, Admin-fail-closed). Damit: 44 instrumentiert von 59 Route-Dateien gesamt.

> **Update 2026-09-06 (06_6 Distributed-/Edge-Konsistenz, L0/L1/L3/L4):** Neu instrumentiert: `casino/guide-persona` (GET+PATCH, `guide-persona` 20/60s, auth-first via `withRateLimit()`-resolve) und `telegram/webhook` (`telegram-webhook` 60/60s, Secret-first via `withRateLimit()`-resolve — die bisher dokumentierten 120/min waren ein Dokumentationsfehler, die Route hatte real **0** Rate-Limit-Aufrufe). Zuvor fehlten in dieser Liste bereits `admin/job-health`, `admin/promo-codes/[code]/reverse` (06_10) und `user/self-exclusion`. Neu: der `withRateLimit()`-Higher-Order-Wrapper (`request-security.ts`) führt die Limit-Entscheidung **vor** dem Handler aus und ist seit 06_6 Pflichtmuster für **neue** Routen (bestehende 40 manuell instrumentierte Routen bleiben bewusst unangetastet). Damit existiert ein struktureller Vollständigkeits-Check: `src/lib/security/rate-limit-route-inventory.ts` + `rate-limit-route-completeness.test.ts` scannen alle `src/app/api/**/route.ts` und schlagen fehl, wenn eine Route weder instrumentiert noch auf der Exemption-Allowlist ist (42 instrumentiert von 57 Route-Dateien gesamt — Stand 2026-09-06, seit 06_3: 44 von 59).

> **Update 2026-09-04 (06_1 Bot-Automation-Detection, L1/L3):** Zwei neue öffentliche Auth-Routen nutzen `enforceRateLimit()`: `POST /api/auth/login-guard` (`login-attempt`, 5/60s, IP-basiert, fail-closed) als serverseitiger Login-Preflight und `POST /api/auth/signup-suspicion` (`signup-suspicion`, 10/60s, fail-closed) als fail-offener Empfänger für Signup-Honeypot/Timing-Signale. Zusätzlich existiert seit L2 ein **separater** Daily-Cost-Cap (`src/lib/security/daily-cost-cap.ts`) für die Chat-Routen — ein festes 24h-Kontingent (INCR + `EXPIRE 86400 NX`, fail-closed 503 ohne Upstash in Produktion) _neben_ den bestehenden Sliding-Windows der Chat-Routen; er läuft nicht über `enforceRateLimit()` und taucht deshalb nicht in dieser Liste auf.

**Bewusst NICHT über `enforceRateLimit()`/`withRateLimit()` instrumentiert** (Allowlist in `src/lib/security/rate-limit-route-inventory.ts`): `/api/health` (eigener fail-offener Limiter, [Modul 06](./06_health_check_uptime_monitoring.md)), `/api/internal/cron-alert` (kein Rate-Limit, nur Secret-Auth, [Modul 07](./07_cron_failure_alerting.md)), `/api/internal/big-win-events`, `/api/internal/wallet-events` (beide Secret-Auth, nur pg_net/pg_cron aus der DB), `/api/casino/config`, `/api/casino/jackpot`, `/api/casino/active-round`, `/api/community`, `/api/tournaments/daily-race`, `/api/admin/digest-preview/start`, `/api/casino/session-sync` + `/api/casino/migrate-session` (beide `410 Gone`), `/api/webhooks/clerk` (`410 Gone`), `/api/docs` + `/api/openapi.json` (force-static, CDN-gecached — 06_6 L2).

---

## 6 — Code-Pfade

```
src/lib/security/request-security.ts          # enforceRateLimit(), withRateLimit(), reportRateLimiterUnavailable(), rateLimitHeaders()
src/lib/security/rate-limit-route-inventory.ts # 06_6 L3: Exemption-Allowlist + Instrumentierungs-Erkennung (Call-Syntax, nicht Kommentare)
src/lib/security/__tests__/request-security.test.ts  # Testsuite (sliding window, fail-closed, fail-open dev)
src/lib/security/__tests__/rate-limit-route-completeness.test.ts  # 06_6 L3: Dateisystem-Scan aller API-Routen gegen die Allowlist (fail on forgotten route)
```

---

## 7 — Pitfalls

> **Pitfall 1 — Kein `request_id`-Tag am Rate-Limit-Alarm:** `reportRateLimiterUnavailable()` setzt nur `tags: { scope }`. Bei einem Ausfall im Dashboard lässt sich der betroffene `scope` (z. B. `'bet'`) sehen, aber **nicht**, welcher konkrete Request ihn ausgelöst hat — anders als bei den drei Geld-Pfad-Routen, die eine eigene `request_id`-Korrelation über `CasinoLogger.error()` ergänzen ([Modul 03](./03_logger_error_capture.md)). Wer diese Lücke schließen will: `request_id` als zusätzlichen Tag-Parameter an `enforceRateLimit()` durchreichen.

> **Pitfall 2 — Fehlkonfiguration in Produktion sieht aus wie ein echter Ausfall:** Fehlende `UPSTASH_REDIS_REST_URL`/`_TOKEN` in Produktion erzeugt denselben `unavailable: true`-Zustand wie ein echter Upstash-Ausfall — im Sentry-Dashboard nicht ohne Weiteres unterscheidbar. Bei einem Alarm zuerst die Env-Var-Konfiguration prüfen, bevor man von einem Upstash-Incident ausgeht.

---

## 8 — Tests

- `src/lib/security/__tests__/request-security.test.ts` — Sliding-Window-Logik, Fail-Closed bei Upstash-Fehler, Fail-Closed bei fehlenden Prod-Credentials, Fail-Open-Dev-Fallback, `rateLimitHeaders()`-Formatierung.
- Der zugrundeliegende Fail-Closed-Pfad ist außerdem Ziel der Artillery-basierten Chaos-/Lasttest-Initiative (`worldmap/05_Observability_und_Lasttest.md`) — bewusst eine separate Test-Initiative, nicht Teil dieser Observability-Dokumentation selbst (siehe [Overview, Abschnitt 7](./00_OBSERVABILITY_OVERVIEW.md#7--verwandte-aber-bewusst-nicht-teil-dieser-dokumentation)).
