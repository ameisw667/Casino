# 06 — Health-Check-Route & externe Uptime-Überwachung

> **Säule:** 6 von 9 · **Status:** 🟢 Produktionsreif, Jan-bestätigt (2026-08-16, voller Erkennungs-/Recovery-Zyklus gegen Produktion verifiziert) · **Niveau:** 🟢 Top 10 % (siehe [Bewertungsmethode](00_OBSERVABILITY_OVERVIEW.md#1--executive-summary-für-jan-high-level--verständlich)) — **hochgestuft von Top 20 % am 2026-09-01 nach 10-Subkategorien-Audit** · **Stand:** 2026-09-01 (Code 1:1 verifiziert)
> **Kern-Datei:** `src/app/api/health/route.ts` · **Archiv-Quelle:** `docs/archive/05_1.13_Uptime-Kuma-Monitoring.md` · **Back:** [`00_OBSERVABILITY_OVERVIEW.md`](00_OBSERVABILITY_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & wann brauche ich das?

Eine öffentliche, unauthentifizierte Liveness-Probe (`GET /api/health`), die ein kostenloser externer Dienst (aktuell **UptimeRobot**) alle paar Minuten abfragt. Bei Ausfall bekommt Jan eine E-Mail. Kein Self-Hosting, kein eigener Bot, kein VPS — bewusst so einfach wie möglich gehalten, nachdem ein aufwendigerer Uptime-Kuma/VPS/Telegram-Ansatz auf Jans Wunsch verworfen wurde (siehe Archiv-Quelle, Abschnitt 0).

- **Wann berühren:** Ein neuer externer Monitoring-Dienst soll angebunden werden, oder die Route soll zusätzliche Signale liefern (z. B. DB-Erreichbarkeit — bewusst aktuell **nicht** enthalten, siehe Abschnitt 4).
- **Nicht hier:** Fehler-Alarme für Hintergrundjobs → [Modul 07](./07_cron_failure_alerting.md). Sentry-Fehler-Tracking → [Modul 01](./01_sentry_sdk_core.md).

---

## 2 — Neue-Projekt-Checkliste (4 Schritte)

```
[ ] 1. Route bleibt IMMER frei von DB-/Wallet-/Secret-Zugriff — sie muss auch funktionieren, wenn Supabase down ist
[ ] 2. Middleware-Bypass in src/proxy.ts NICHT entfernen — sonst hängt die Liveness-Probe an Supabase
[ ] 3. applyBaselineSecurityHeaders() im Bypass NICHT entfernen — sonst fehlen wieder alle 7 Standard-Header (siehe Abschnitt 4)
[ ] 4. Externen Checker (UptimeRobot o.ä.) auf https://<domain>/api/health zeigen lassen, Intervall ~5 Min
```

---

## 3 — Die Route (`src/app/api/health/route.ts`, vollständige Datei, Stand nach Fix 2026-09-01)

```typescript
import { NextResponse } from 'next/server';
import { getClientIdentifier } from '@/lib/security/request-security';
import { CasinoLogger } from '@/lib/casino/logger';

// Public liveness probe for external uptime monitoring (05_1.13). Must stay free of any
// database, wallet, or secret access — this route is intentionally unauthenticated and
// bypasses src/proxy.ts's Supabase session lookup entirely (see the early-return there).
export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120; // generous: real uptime-monitor polling intervals stay well under this
const MAX_TRACKED_IDENTIFIERS = 1_000; // crude unbounded-growth guard, not exactness

const hits = new Map<string, { count: number; windowStart: number }>();

// Deliberately NOT the shared Upstash limiter (enforceRateLimit): that one fails CLOSED
// when Redis is unreachable, which would make this liveness check report "down" for an
// unrelated infra hiccup — exactly the false signal a health check must never produce.
function isRateLimited(identifier: string): boolean {
  try {
    if (hits.size > MAX_TRACKED_IDENTIFIERS) hits.clear();
    const now = Date.now();
    const existing = hits.get(identifier);
    if (!existing || now - existing.windowStart > RATE_LIMIT_WINDOW_MS) {
      hits.set(identifier, { count: 1, windowStart: now });
      return false;
    }
    existing.count += 1;
    const limited = existing.count > RATE_LIMIT_MAX;
    // Reported exactly once per window (on the request that first crosses the limit), not on
    // every subsequent 429 — a sustained flood would otherwise spam Sentry. The identifier
    // (IP/user) is deliberately not included in the message to avoid sending PII to Sentry.
    if (limited && existing.count === RATE_LIMIT_MAX + 1) {
      CasinoLogger.warn('HealthCheck', 'In-memory liveness rate limit exceeded');
    }
    return limited;
  } catch {
    return false; // fail-open by design
  }
}

export async function GET(request: Request) {
  if (isRateLimited(getClientIdentifier(request))) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  // Deliberate chaos switch for the 05_1.13 incident-test runbook. No separate staging
  // deployment exists (removed alongside the Uptime-Kuma/VPS rollback, see
  // docs/archive/05_1.13_Uptime-Kuma-Monitoring.md §0) — this flag is safe to set directly
  // against Production for the duration of a deliberate, short-lived test: it touches no
  // DB/wallet/game path, only this one route's own response. Verified end-to-end against
  // Production on 2026-08-16 (§5 below). Not a secret — a boolean feature flag, no DB/wallet content.
  if (process.env.HEALTH_FORCE_FAIL === '1') {
    return NextResponse.json(
      { status: 'error', reason: 'forced-failure-for-incident-test' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
      deploymentId: process.env.VERCEL_DEPLOYMENT_ID ?? 'local',
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
```

**Was sich geändert hat (2026-09-01, 10-Subkategorien-Audit):** (1) `isRateLimited()` meldet einen Rate-Limit-Trip jetzt einmalig pro Fenster an Sentry ([Modul 03](./03_logger_error_capture.md)); (2) der `HEALTH_FORCE_FAIL`-Kommentar wurde faktisch korrigiert (behauptete zuvor fälschlich „never in Production"); (3) der Middleware-Bypass in `src/proxy.ts` liefert jetzt dieselben 7 Baseline-Security-Header wie jede andere Route (Details Abschnitt 4).

---

## 4 — Design-Entscheidungen, die auffallen könnten

| Entscheidung                                             | Warum                                                                                                                                                                                                                                                  |
| :------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Eigener In-Memory-Limiter statt `enforceRateLimit()`** | Der geteilte Upstash-Limiter schließt fail-**closed** — bei Redis-Ausfall würde die Liveness-Probe fälschlich „down" melden, obwohl nur ein unabhängiger Redis-Dienst betroffen ist. Ein Health-Check muss das Gegenteil: fail-**offen**.              |
| **120 Requests/Min, sehr großzügig**                     | Reale Uptime-Monitor-Intervalle (typisch 1–5 Min) bleiben weit darunter — das Limit schützt nur vor grobem Missbrauch, nicht vor legitimer Überwachung.                                                                                                |
| **Keine DB-/Wallet-Prüfung**                             | Bewusst eine reine Prozess-Liveness-Probe, keine Deep-Health-Prüfung. Ein Supabase-Ausfall soll die Route nicht mit „down" beantworten — das würde False-Positives für ein Problem erzeugen, das die eigentliche App-Verfügbarkeit gar nicht betrifft. |
| **`commit`/`deploymentId` im Response-Body**             | Zeigt, ob wirklich der aktuellste Build antwortet — nützlich, um einen fehlgeschlagenen Deploy von einem echten Ausfall zu unterscheiden.                                                                                                              |
| **`force-dynamic` + `Cache-Control: no-store`**          | Jeder Call ist live, kein CDN-Caching verfälscht das Ergebnis.                                                                                                                                                                                         |

### Middleware-Bypass (`src/proxy.ts`) — jetzt mit Baseline-Security-Headern

```typescript
if (pathname === '/api/health') {
  return applyBaselineSecurityHeaders(NextResponse.next({ request: req }));
}
```

Dieser Check läuft **vor** der Erstellung des Supabase-SSR-Clients — ein Supabase-Problem kann die Route damit nicht fälschlich „down" erscheinen lassen. Bewusst **nicht** zusätzlich in der `PUBLIC_ROUTES`-Liste geführt, um zu vermeiden, dass beide Deklarationen mit der Zeit auseinanderdriften — dieser frühe Bypass ist die einzige Quelle der Wahrheit für den öffentlichen Status der Route.

> [!NOTE] **Behobene Lücke (2026-09-01):** `/api/health` war zuvor die **einzige** Route im Projekt ohne die 7 Standard-Security-Header (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, COOP, CORP, Permissions-Policy) — sie wurden erst nach dem Bypass gesetzt, den `/api/health` nie erreicht. Fix: die 7 Header wurden in `applyBaselineSecurityHeaders(res: NextResponse): NextResponse` extrahiert (eine einzige Quelle der Wahrheit statt möglicher Wert-Drift zwischen zwei Stellen) und werden jetzt sowohl im Hauptpfad als auch im Health-Bypass angewendet. Bewusst **nicht** mit angewendet: `Content-Security-Policy` und `Reporting-Endpoints` — beide hängen von einem per-Request-CSP-Nonce ab, der für eine reine JSON-Antwort ohne Skript-Ausführungskontext irrelevant ist.

---

## 5 — Der Chaos-Schalter: `HEALTH_FORCE_FAIL`

Setzt man die Umgebungsvariable `HEALTH_FORCE_FAIL=1`, antwortet die Route mit `503` statt `200` — ohne dass irgendeine echte Spiel-/Wallet-Funktion betroffen ist. Damit lässt sich der komplette Alarm-Weg testen, ohne einen echten Ausfall zu provozieren.

**Verifizierter Testlauf (2026-08-16):** `HEALTH_FORCE_FAIL=1` in Vercel Production gesetzt → `curl` bestätigte `503` mit `{"status":"error","reason":"forced-failure-for-incident-test"}` → UptimeRobot erkannte den Ausfall beim nächsten planmäßigen Check, Incident wurde angelegt (09:50:17 GMT+2). Root-Domain-Monitor blieb „Up" (erwartet — nur die Health-Route war betroffen).

Der Code-Kommentar wurde am 2026-09-01 korrigiert — er behauptete zuvor „never in Production", was dem oben dokumentierten, tatsächlich gegen Production gefahrenen Testlauf widersprach (kein separates Staging-Ziel existiert mehr seit dem Kuma/VPS-Rückbau). Reine Doku-als-Code-Korrektur, keine Verhaltensänderung.

---

## 6 — Externer Checker: UptimeRobot-Setup (Jans Aktion, ~5 Minuten)

```
1. Kostenlosen Account bei einem Uptime-Checker anlegen (z. B. UptimeRobot).
2. Neuen Monitor: Typ „HTTP(s)", URL https://<production-domain>/api/health, Intervall ~5 Min.
3. Alarm-Kontakt: E-Mail (Standard, kein zusätzlicher Kanal nötig).
```

Kein Server, kein Bot, kein VPS — die gesamte Betriebsverantwortung liegt beim externen Free-Tier-Dienst.

> [!NOTE] **Bekannte, bewusst nicht behobene Lücke — Single-Channel/Single-Region-Checker:** Aktuell existiert nur ein einzelner externer Checker mit nur einem Alarm-Kanal (E-Mail). Das ist ein Single Point of Failure für die Alarmierung selbst (fällt UptimeRobot oder Jans E-Mail-Zustellung aus, bemerkt niemand einen echten Ausfall). **Kein LLM-Task** — die Einrichtung eines zweiten Checkers/Kanals ist eine Aktion in einer Drittanbieter-UI und liegt in Jans Zuständigkeit, nicht in der des LLM.

---

## 7 — Code-Pfade

```
src/app/api/health/route.ts                    # GET-Handler, Chaos-Schalter, In-Memory-Limiter, Rate-Limit-Sichtbarkeit
src/proxy.ts                                    # applyBaselineSecurityHeaders() + Middleware-Bypass VOR Supabase-Client-Erstellung
src/lib/security/__tests__/health-route.test.ts  # 9 Tests inkl. HEALTH_FORCE_FAIL-Fall + Rate-Limit-Sentry-Meldung
src/lib/security/__tests__/proxy-security-headers.test.ts  # Deckt jetzt auch die Header-Anwendung im Health-Bypass ab
src/lib/security/__tests__/proxy-health-bypass.test.ts      # Bypass läuft vor Supabase-Client-Erstellung
```

---

## 8 — Pitfalls

> **Pitfall 1 — Verwechslung mit dem geteilten Rate-Limiter:** Wer `enforceRateLimit()` aus [Modul 05](./05_ratelimit_failclosed_alerting.md) hier „der Konsistenz halber" einbauen möchte, würde die Route fail-closed statt fail-open machen — genau das Gegenteil dessen, was eine Liveness-Probe braucht. Absichtlich getrennt lassen.

> **Pitfall 2 — `HEALTH_FORCE_FAIL` ist keine Secret, aber auch kein normales Feature-Flag:** Es hat keinen DB-/Wallet-Bezug, sollte aber trotzdem nie versehentlich dauerhaft in Production stehen bleiben — sonst zeigt die App dauerhaft „down" gegenüber dem externen Checker, ohne dass ein echtes Problem vorliegt.

> **Pitfall 3 — `MAX_TRACKED_IDENTIFIERS`-Guard ist grob, nicht exakt:** Bei Überschreiten von 1.000 verschiedenen Identifiers wird die gesamte Map geleert (`hits.clear()`) statt nur alte Einträge zu entfernen — ein legitimer Client könnte dadurch kurzzeitig sein Zähler-Fenster verlieren. Für eine reine Missbrauchsbremse auf einer öffentlichen, unauthentifizierten Route ist das ein akzeptabler Trade-off, kein Bug.

> **Pitfall 4 (behoben 2026-09-01) — Fehlende Security-Header im Bypass:** Siehe Abschnitt 4. Bei jedem neuen frühen Middleware-Bypass (vor der Header-Zeile im Hauptpfad) immer prüfen, ob `applyBaselineSecurityHeaders()` mit angewendet werden muss.

> **Pitfall 5 (bewusst akzeptiert, Security-Review-Fund 2026-09-01) — Sustained-Flood erzeugt fortlaufende Sentry-Events:** Ein Angreifer kann `/api/health` trivial mit >120 Req/Min von einer stabilen IP fluten (keine Auth nötig) und erzeugt dadurch alle 60 Sekunden ein neues `Sentry.captureMessage()` — unbegrenzt, solange die Flut anhält. **Begrenzt durch:** (1) die Once-per-window-Guard deckelt es hart auf max. 1 Event/60s pro Identifier (60/h, 1440/Tag), kein unbegrenztes Wachstum; (2) die Nachricht ist bei jedem Trip identisch, Sentrys eigenes Fingerprinting fasst alle Vorkommen in **ein** Issue zusammen statt bei jedem Trip einen neuen Alarm auszulösen. Bewusst keine weitere Mitigation (z. B. ein globaler Cooldown über alle Identifier hinweg) ergänzt — wäre zusätzliche Komplexität für ein bereits begrenztes, nicht-Wallet-relevantes Restrisiko (Overengineering-Risiko). Empfehlung aus dem Review: bei Bedarf prüfen, dass keine Alert-Regel auf dieses spezifische Tag/diese Nachricht mit Paging reagiert.

---

## 9 — Tests

- `src/lib/security/__tests__/health-route.test.ts` — 9 Tests: Response-Shape, Timestamp-Frische, No-DB-Import (Source-Scan), `force-dynamic` (Source-Scan), Commit/Deployment-Fallback, `HEALTH_FORCE_FAIL`, Rate-Limit+Per-IP-Isolation, **neu:** Rate-Limit-Trip meldet sich genau einmal pro Fenster an Sentry (`level:'warning'`), ohne den Identifier in der Nachricht.
- `src/lib/security/__tests__/proxy-security-headers.test.ts` — **neu:** verifiziert, dass der Health-Bypass-Block `applyBaselineSecurityHeaders(` aufruft.
- **Live-Verifikation (2026-08-16):** Vollständiger Erkennungs- und Recovery-Zyklus gegen Produktion bestätigt (siehe Abschnitt 5).
- **Verifikation dieses Durchlaufs (2026-09-01):** `npm run test` (1374/1374 grün), `npm run typecheck` (0 Fehler), `npm run lint` (0 Fehler in berührten Dateien), `npm run build` (grün, Proxy-Middleware korrekt kompiliert).
- **Security-Review (2026-09-01):** `security-reviewer`-Agent gezielt auf `proxy.ts`- und `route.ts`-Änderungen angesetzt. **Ergebnis: Keine CRITICAL-/HIGH-Befunde.**
  - Header-Refaktorierung: alle 7 extrahierten Werte per `git diff` als byte-identisch zum vorherigen Code bestätigt, gegen `docs/security-hardening/02_security_headers.md` abgeglichen.
  - Anwendung der 7 Header auf den Health-Bypass: kein neues Risiko — alle sieben sind statisch, request-unabhängig, reflektieren keinen Nutzer-Input.
  - Bewusstes Fehlen von CSP/`Reporting-Endpoints` im Bypass bestätigt korrekt (beide hängen vom Nonce ab, der für eine reine JSON-Antwort ohne Skript-Ausführungskontext irrelevant ist).
  - Rate-Limit-Sentry-Meldung: keine PII/Identifier in der Nachricht bestätigt; Once-per-Window-Logik durch Code-Walkthrough verifiziert.
  - **1 MEDIUM-Fund** (siehe Pitfall 5 oben): Sustained-Flood erzeugt fortlaufende, aber hart begrenzte Sentry-Events — bewusst akzeptiert, keine weitere Mitigation ergänzt.
  - Identifier-Rotation über `X-Forwarded-For` verstärkt die Sentry-Last **nicht** (im Gegenteil: rotierte Identifier starten je ein frisches Fenster und erreichen `count > 120` nie) — eine vorbestehende, von dieser Änderung unabhängige Eigenschaft des Limiters.
