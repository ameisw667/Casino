# 02 — PII-/Secret-Redaction-Filter (`beforeSend`)

> **Säule:** 2 von 9 · **Status:** 🟢 Produktionsreif (TDD, 7/7 Tests bei Einführung) · **Niveau:** 🟢 Top 3 % (siehe [Bewertungsmethode](00_OBSERVABILITY_OVERVIEW.md#1--executive-summary-für-jan-high-level--verständlich)) · **Stand:** 2026-08-31 (Code 1:1 verifiziert)
> **Kern-Datei:** `src/lib/casino/sentry-scrub.ts` · **Back:** [`00_OBSERVABILITY_OVERVIEW.md`](00_OBSERVABILITY_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & wann brauche ich das?

Eine reine Funktion, `scrubSentryEvent(event, hint)`, die als `beforeSend`-Hook in **allen drei** Sentry-Runtime-Configs (Server/Edge/Client, siehe [Modul 01](./01_sentry_sdk_core.md)) hängt. Jedes einzelne Event — egal ob automatisch von Next.js oder manuell von `CasinoLogger.error()` erzeugt — läuft zwingend hier durch, bevor es Sentrys Server erreicht.

- **Wann berühren:** Ein neues sensibles Feld taucht im Code auf (neue Secret-Env-Var, neuer Auth-Header), oder ein Security-Review verlangt eine schärfere Redaction-Regel.
- **Nicht hier:** Was überhaupt an Sentry geschickt wird → [Modul 01](./01_sentry_sdk_core.md) und [Modul 03](./03_logger_error_capture.md).

---

## 2 — Neue-Projekt-Checkliste (3 Schritte)

```
[ ] 1. SENSITIVE_KEY_PATTERN pflegen — Substring-Match, nicht anchored, damit z.B. SUPABASE_SERVICE_ROLE_KEY greift
[ ] 2. beforeSend in ALLEN drei Runtime-Configs auf dieselbe Funktion zeigen lassen (keine Kopie pro Runtime)
[ ] 3. TDD-Pflicht: für jedes neue Redaction-Ziel zuerst einen RED-Test schreiben, der beweist, dass das Feld VORHER durchgerutscht wäre
```

---

## 3 — Der Redaction-Filter (`src/lib/casino/sentry-scrub.ts`, vollständige Datei)

```typescript
import type { ErrorEvent, EventHint } from '@sentry/nextjs';

// Substring match (not anchored) so prefixed real-world names like
// SUPABASE_SERVICE_ROLE_KEY or UPSTASH_REDIS_REST_TOKEN still match. serverSeed
// is excluded specifically when followed by "hash" — serverSeedHash is the
// deliberately disclosable half of the seed pair (see bet/route.ts:141-145).
const SENSITIVE_KEY_PATTERN =
  /(authorization|cookie|password|token|secret|api[-_]?key|service[-_]?role[-_]?key|session|server[-_]?seed(?!_?hash))/i;

const MAX_SCRUB_DEPTH = 6;

function scrubValue(value: unknown, depth: number): unknown {
  if (depth > MAX_SCRUB_DEPTH || value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map((item) => scrubValue(item, depth + 1));
  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = SENSITIVE_KEY_PATTERN.test(key) ? '[Redacted]' : scrubValue(val, depth + 1);
    }
    return result;
  }
  return value;
}

export function scrubSentryEvent(event: ErrorEvent, _hint: EventHint): ErrorEvent {
  const scrubbed: ErrorEvent = { ...event };

  if (scrubbed.request) {
    const { cookies: _cookies, headers: _headers, ...restRequest } = scrubbed.request;
    scrubbed.request = restRequest;
  }

  if (scrubbed.user) {
    const { ip_address: _ip, email: _email, ...restUser } = scrubbed.user;
    scrubbed.user = restUser;
  }

  if (scrubbed.extra) {
    scrubbed.extra = scrubValue(scrubbed.extra, 0) as typeof scrubbed.extra;
  }

  if (scrubbed.contexts) {
    scrubbed.contexts = scrubValue(scrubbed.contexts, 0) as typeof scrubbed.contexts;
  }

  if (scrubbed.breadcrumbs) {
    scrubbed.breadcrumbs = scrubbed.breadcrumbs.map((crumb) => ({
      ...crumb,
      data: crumb.data ? (scrubValue(crumb.data, 0) as typeof crumb.data) : crumb.data,
    }));
  }

  return scrubbed;
}
```

---

## 4 — Wie die Redaction-Strategie sich pro Feld unterscheidet

| Sentry-Event-Feld                                           | Strategie                                           | Warum                                                                                                                                                          |
| :---------------------------------------------------------- | :-------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `event.request.cookies` / `.headers`                        | **Komplett gelöscht** (nicht gefiltert)             | Eine Allowlist einzelner Header würde still unter-redigieren, sobald jemand einen neuen sensiblen Header einführt. Wegwerfen ist sicherer als raten.           |
| `event.user.ip_address`, `.email`                           | **Komplett entfernt**                               | DSGVO — keine direkten personenbezogenen Daten im Dashboard.                                                                                                   |
| `event.user.id`                                             | **Bleibt erhalten**                                 | Interne Supabase-UUID, kein direkter Personenbezug ohne Zugriff auf die Datenbank selbst; nötig, um einen Fehler einem betroffenen Account zuordnen zu können. |
| `event.extra`, `event.contexts`, `event.breadcrumbs[].data` | **Rekursiv musterbasiert gefiltert** (`scrubValue`) | Diese Felder sind Freiform — hier greift `SENSITIVE_KEY_PATTERN` pro Schlüssel, bis zu `MAX_SCRUB_DEPTH = 6` Verschachtelungsebenen.                           |

### Das `SENSITIVE_KEY_PATTERN` im Detail

```
/(authorization|cookie|password|token|secret|api[-_]?key|service[-_]?role[-_]?key|session|server[-_]?seed(?!_?hash))/i
```

- **Substring-Match, nicht verankert** (kein `^`/`$`) — ein Schlüssel wie `SUPABASE_SERVICE_ROLE_KEY` oder `UPSTASH_REDIS_REST_TOKEN` matcht trotz Präfix/Suffix.
- **Negativer Lookahead `(?!_?hash)` bei `server[-_]?seed`** — `serverSeed` wird redigiert, `serverSeedHash` explizit **nicht**. Das ist beabsichtigt: der Hash ist die bewusst offenlegbare Hälfte des Provably-Fair-Seed-Paares (siehe `bet/route.ts:141-145`), der rohe Seed nicht.
- **`MAX_SCRUB_DEPTH = 6`** — verhindert, dass ein pathologisch tief verschachteltes Objekt die Redaction-Rekursion zu einer Performance- oder Stack-Overflow-Gefahr macht. Ab Tiefe 6 wird der Wert unverändert durchgereicht (kein Redact, aber auch kein Crash).

---

## 5 — Code-Pfade

```
src/lib/casino/sentry-scrub.ts               # scrubSentryEvent(), SENSITIVE_KEY_PATTERN
src/lib/casino/__tests__/sentry-scrub.test.ts # TDD-Testsuite (7 Fälle bei Einführung)
sentry.server.config.ts                       # beforeSend: scrubSentryEvent
sentry.edge.config.ts                         # beforeSend: scrubSentryEvent
src/instrumentation-client.ts                 # beforeSend: scrubSentryEvent
```

---

## 6 — Pitfalls

> **Pitfall 1 — Neues Secret-Env-Var ohne passenden Namen:** Die Redaction ist musterbasiert auf dem **Schlüsselnamen**, nicht auf dem Wert. Ein neues Secret mit einem Namen, der keines der Muster-Wörter enthält (z. B. `INTERNAL_SIGNING_MATERIAL` statt `..._SECRET`), rutscht durch. Bei jedem neuen sensiblen Env-Var prüfen, ob der Name eines der Muster trifft — sonst `SENSITIVE_KEY_PATTERN` erweitern und dafür zuerst einen RED-Test schreiben.

> **Pitfall 2 — Redaction schützt nur Schlüssel, nicht Freitext-Werte:** Ein Fehler, der ein Secret versehentlich in eine `Error`-**Message** statt in ein strukturiertes `extra`-Feld schreibt (z. B. `throw new Error(\`Auth failed for token ${token}\`)`), wird von `scrubValue()` nicht erfasst — die Funktion filtert nur Objekt-Schlüssel, nicht Freitext-Strings. Merksatz: Secrets gehören nie in eine Error-Message, immer in ein strukturiertes, dann filterbares Feld.

---

## 7 — Tests

- `src/lib/casino/__tests__/sentry-scrub.test.ts` — Authorization/Cookie-Header vollständig entfernt, `serverSeed` redigiert (aber `serverSeedHash` nicht), bekannte Secret-Key-Muster (`SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `UPSTASH_REDIS_REST_TOKEN`) redigiert, `user.id` bleibt erhalten, `user.email`/`user.ip_address` entfernt.
- `vitest.config.ts` — Coverage-Include für `sentry-scrub.ts` explizit gesetzt (Redaction-Logik ist ein Go-live-Gate, keine optionale Abdeckung).
- **Security-Review (2026-08-12):** PASS — Live-Verifikation in Sentry bestätigte, dass ein zufällig mitgefundener, vorbestehender Fehler (`getUserSeeds RPC failed`) korrekt redigiert ankam: kein Cookie-/Authorization-Header, kein `serverSeed`. Die einzige personenbezogene Angabe im Event stammte aus Sentrys eigener netzwerkseitiger IP-Herkunftsschätzung der Ingest-Verbindung selbst, nicht aus dem Event-Payload.
