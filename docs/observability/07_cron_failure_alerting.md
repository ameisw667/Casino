# 07 — Cron-Failure-Alerting: Wächter für Postgres-Hintergrundjobs

> **Säule:** 7 von 9 · **Status:** 🟢 Produktionsreif, 5 Alarmquellen über 1 gemeinsame SQL-Funktion abgedeckt · **Niveau:** 🟢 Top 10 % (siehe [Bewertungsmethode](00_OBSERVABILITY_OVERVIEW.md#1--executive-summary-für-jan-high-level--verständlich)) — **hochgestuft von Top 20 % am 2026-09-03 nach 10-Subkategorien-Audit** · **Stand:** 2026-09-03 (Code + alle Migrationen bis inkl. `060` 1:1 verifiziert)
> **Kern-Datei:** `src/app/api/internal/cron-alert/route.ts` · **Back:** [`00_OBSERVABILITY_OVERVIEW.md`](00_OBSERVABILITY_OVERVIEW.md)
> **Verwandt, aber bewusst separater Scope:** [`worldmap/07_background_jobs_scheduling.md`](../../worldmap/07_background_jobs_scheduling.md) — eine deutlich breitere, bereits abgeschlossene 10-Unterkategorien-Aufschlüsselung der **gesamten** Background-Jobs-Domäne (Trigger.dev-Architektur, Idempotenz, Retry-Ledger, Backfill, Testabdeckung). Dieses Modul hier bleibt bewusst auf den schmalen Next.js-Alarm-Callback selbst beschränkt — siehe Abschnitt 9 für die genaue Abgrenzung.

---

## 1 — High-Level: Was ist das & wann brauche ich das?

`pg_cron` (Postgres) hat **kein** eingebautes Retry/Backoff und **keine** Benachrichtigung bei Fehlschlag — ein gescheiterter nächtlicher Job verschwindet sonst lautlos. Dieser Kanal schließt genau diese Lücke: Eine gemeinsame SQL-Funktion (`enqueue_cron_alert()`, seit Migration `060`) schickt bei einem terminalen Fehlschlag per `pg_net` einen textfreien POST an eine secret-geschützte interne Next.js-Route, die den Fehler an Sentry weiterreicht.

- **Wann berühren:** Ein neuer terminaler Fehlerzustand soll alarmieren (bereits vorhandene `enqueue_cron_alert(job_name, error)` aufrufen, siehe Abschnitt 4), oder das Secret muss rotiert werden.
- **Nicht hier:** Die Retry-/Backoff-/Ledger-Logik selbst (Migration `060`), Trigger.dev-Alerting (fehlt komplett, bereits priorisiert in `worldmap/07_background_jobs_scheduling.md`), Admin-UI-Sichtbarkeit von Job-Zuständen (→ [Modul 09](./09_admin_observability_dashboard.md)).

---

## 2 — Neue-Projekt-Checkliste (3 Schritte)

```
[ ] 1. Terminalen Fehlerzustand über die bestehende public.enqueue_cron_alert(job_name, error) melden
       — NICHT erneut eigenen net.http_post()-Boilerplate schreiben (das alte 5×-duplizierte Muster
       wurde in Migration 060 durch diese eine Funktion ersetzt)
[ ] 2. Eindeutigen job-Namen wählen (String, keine Duplikate über die 5 bestehenden Quellen hinweg)
[ ] 3. Terminal-Alert-Deduplizierung sicherstellen (eigenes Flag wie alert_enqueued_at/dead_letter_alerted_at)
       — sonst alarmiert derselbe Fehlschlag bei jedem weiteren Retry erneut
```

---

## 3 — Die Alarm-Route (`src/app/api/internal/cron-alert/route.ts`, vollständige Datei, Stand nach Fix 2026-09-03)

```typescript
import { timingSafeEqual } from 'node:crypto';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';
import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import { getClientIdentifier } from '@/lib/security/request-security';

function hasValidAlertSecret(request: Request): boolean {
  const expected = process.env.CRON_ALERT_SECRET;
  const provided = request.headers.get('x-cron-alert-secret');
  if (!expected || !provided) return false;

  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  if (expectedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, providedBuffer);
}

// Deliberately NOT the shared Upstash limiter (enforceRateLimit): that one fails CLOSED when
// Redis is unreachable, which could suppress a genuine cron-failure alert exactly when broader
// infra trouble makes it most needed — same reasoning as the health-check's own in-memory
// limiter. Applied only AFTER the secret check succeeds, so an unauthenticated flood can never
// consume a legitimate caller's budget.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const MAX_TRACKED_IDENTIFIERS = 1_000;
const hits = new Map<string, { count: number; windowStart: number }>();

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
    return existing.count > RATE_LIMIT_MAX;
  } catch {
    return false; // fail-open by design
  }
}

const alertSchema = z.object({
  job: z.string().min(1).max(128),
  error: z.string().max(500),
});

export async function POST(request: Request) {
  if (!hasValidAlertSecret(request)) {
    return apiErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }

  if (isRateLimited(getClientIdentifier(request))) {
    return apiErrorResponse('RATE_LIMIT_EXCEEDED', 'Too Many Requests', 429);
  }

  const body = await request.json().catch(() => null);
  const parsed = alertSchema.safeParse(body);
  if (!parsed.success) {
    return apiSuccessResponse({ ok: true }); // see Pitfall 1 — deliberately silent, test-locked
  }

  Sentry.captureMessage(`Cron job failed: ${parsed.data.job}`, {
    level: 'error',
    extra: { error: parsed.data.error },
    tags: { job: parsed.data.job },
  });

  return apiSuccessResponse({ ok: true });
}
```

**Was sich geändert hat (2026-09-03, 10-Subkategorien-Audit):** (1) `tags: { job }` ergänzt, damit Sentry-Dashboard-Queries nach Job-Name filterbar sind (vorher nur im Freitext der Message); (2) fail-offener In-Memory-Rate-Limiter ergänzt (vorher gar keiner). **Nicht geändert, bewusst bestätigt:** Der Silent-Swallow bei ungültigem Payload bleibt exakt wie zuvor — siehe Abschnitt 7, Pitfall 1.

**Auth-Modell:** Der Längenvergleich (`expectedBuffer.length !== providedBuffer.length`) läuft **vor** `timingSafeEqual()`, weil die Node-Funktion bei unterschiedlicher Puffer-Länge selbst wirft — der Längen-Check ist damit eine notwendige Vorbedingung, kein zusätzliches Timing-Leck.

---

## 4 — Das SQL-seitige Alarm-Muster: 1 gemeinsame Funktion statt 5× dupliziertem Code (seit Migration `060`)

> [!NOTE] **Architektur-Verbesserung, nicht von diesem Modul umgesetzt:** Bis Migration `027`–`058` baute **jede** Cron-Funktion ihren eigenen, wörtlich duplizierten `net.http_post`-Aufruf. Migration `060_pg_cron_retry_failure_handling.sql` (aus der breiteren, bereits abgeschlossenen Arbeit in `worldmap/07_background_jobs_scheduling.md`) hat das durch eine einzige gemeinsame Funktion ersetzt — dieser Abschnitt wurde entsprechend aktualisiert, um Doku-Drift zu vermeiden.

```sql
CREATE OR REPLACE FUNCTION public.enqueue_cron_alert(p_job_name TEXT, p_error TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, vault, pg_temp
AS $$
DECLARE
  v_alert_secret TEXT;
BEGIN
  SELECT decrypted_secret INTO v_alert_secret
  FROM vault.decrypted_secrets
  WHERE name = 'cron_alert_secret'
  LIMIT 1;

  IF v_alert_secret IS NULL THEN
    RETURN false;
  END IF;

  PERFORM net.http_post(
    url := 'https://casino-xi-six.vercel.app/api/internal/cron-alert',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-alert-secret', v_alert_secret
    ),
    body := jsonb_build_object(
      'job', left(p_job_name, 128),
      'error', left(p_error, 500)
    )
  );

  -- pg_net only confirms enqueueing the request. The durable terminal state remains queryable
  -- even if the downstream HTTP receiver is unavailable.
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$;
```

Aufrufer erhalten den Rückgabewert (`BOOLEAN`) und setzen darauf ihr eigenes Dedup-Flag (z. B. `alert_enqueued_at`) nur bei `true` — verhindert, dass ein Alarm als „gesendet" markiert wird, obwohl `pg_net` ihn nicht mal enqueuen konnte (siehe `execute_background_job()` in Migration `060`, Zeilen 162–171).

---

## 5 — Alle 5 Alarmquellen (Stand nach Migration `060`)

| Quelle                     | Aufrufende Funktion                                            | Alarm-Trigger                                                                                                       | `job`-Feld im Alarm     |
| :------------------------- | :------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ | :---------------------- |
| Guide-Telemetry-Purge      | `execute_background_job('guide_telemetry_purge', ...)`         | 3. Fehlschlag in Folge (nach 5-/15-Min.-Retry)                                                                      | `guide_telemetry_purge` |
| Bet-Fingerprint-Purge      | `execute_background_job('bet_fingerprint_purge', ...)`         | 3. Fehlschlag in Folge                                                                                              | `bet_fingerprint_purge` |
| Daily-Race-Settlement      | `execute_background_job('daily_race_settlement', ...)`         | 3. Fehlschlag in Folge, run-key-gebunden (kein versehentliches Settlement des falschen Tages bei verzögertem Retry) | `daily_race_settlement` |
| XP-Outbox Dead-Letter      | `alert_wallet_event_dead_letters('wallet_events_retry', ...)`  | Events erreichen `attempts >= 5`                                                                                    | `wallet_events_retry`   |
| Big-Win-Outbox Dead-Letter | `alert_wallet_event_dead_letters('big_win_events_retry', ...)` | Events erreichen `attempts >= 5` **oder** `dispatch_attempts >= 5`                                                  | `big_win_events_retry`  |

**Unterschied zum vorherigen Modell:** Die ersten drei Quellen alarmieren jetzt erst nach **3 Gesamtversuchen** (5-/15-Min.-Backoff über das neue `background_job_runs`-Ledger), nicht mehr bei jedem einzelnen täglichen Fehlschlag — deutlich weniger Alarm-Rauschen bei einem einmaligen, selbstheilenden Blip. Jede Quelle alarmiert außerdem garantiert **nur einmal** pro terminalem Fehlschlag (Dedup-Flags `alert_enqueued_at`/`dead_letter_alerted_at`), nicht mehr bei jedem weiteren Cron-Durchlauf danach.

---

## 6 — Code-Pfade

```
src/app/api/internal/cron-alert/route.ts                    # Secret-Auth + Rate-Limit + Zod-Validierung + Sentry-Weiterleitung
src/lib/security/__tests__/cron-alert-route.test.ts           # 7 Tests (Secret, Sentry-Payload inkl. tags, Validierung, Rate-Limit)
supabase/migrations/060_pg_cron_retry_failure_handling.sql     # enqueue_cron_alert(), background_job_runs-Ledger, Dead-Letter-Alerts
supabase/migrations/027_guide_telemetry_purge_cron.sql          # Ursprüngliche Job-Definition (Alarm-Aufruf jetzt über 060 umgeleitet)
supabase/migrations/030_fraud_signal_detection.sql               # Ursprüngliche Job-Definition
supabase/migrations/036_wallet_events_outbox.sql                  # Ursprüngliche Job-Definition
supabase/migrations/041_daily_race.sql                             # Ursprüngliche Job-Definition
supabase/migrations/047_event_bus_big_win_consumer.sql             # Ursprüngliche Job-Definition
src/lib/casino/__tests__/pg-cron-retry-failure-handling-migration.test.ts  # 7 Migrationstests für 060 (nicht Teil dieses Moduls, siehe Abschnitt 9)
```

---

## 7 — Pitfalls

> **Pitfall 1 (bewusst, jetzt test-verriegelt) — Ungültige Payloads werden still verschluckt:** Schlägt die Zod-Validierung fehl, antwortet die Route mit `{ ok: true }` statt einem Fehler. Das ist beabsichtigt — ein fehlerhaft aufrufender Cron-Job soll nicht in eine Retry-Schleife geraten, die es bei `pg_cron`/`pg_net` ohnehin nicht gibt. Dieses Verhalten wurde bei der Verifikation dieses Audits als bereits durch `cron-alert-route.test.ts` (`'acknowledges without calling Sentry when the payload fails validation'`) explizit test-verriegelt vorgefunden — **bewusst nicht verändert**, um nicht gegen eine bereits geprüfte, getestete Entscheidung zu arbeiten.

> **Pitfall 2 (behoben 2026-09-03) — Kein Rate-Limit:** Siehe Abschnitt 3. Ein fail-offener In-Memory-Limiter ist jetzt vorhanden, analog zum Muster in [Modul 06](./06_health_check_uptime_monitoring.md).

> **Pitfall 3 (behoben 2026-09-03) — Keine Job-Korrelation:** `Sentry.captureMessage()` trägt jetzt `tags: { job }` zusätzlich zu `extra: { error }` — Dashboard-Filterung nach Job-Name ist jetzt möglich.

> **Pitfall 4 — `pg_net`-Erfolg ist kein Zustellnachweis:** `enqueue_cron_alert()` bestätigt nur, dass der Request enqueued wurde, nicht dass die Next.js-Route ihn tatsächlich verarbeitet hat. Bereits als bewusste Restlücke in `worldmap/07_background_jobs_scheduling.md` §3 dokumentiert („End-to-End-Zustellnachweis und manueller Replay", Top 35 %) — außerhalb des Scopes dieses schmalen Moduls, siehe Abschnitt 9.

> **Pitfall 5 (Security-Review-Fund 2026-09-03, bewusst akzeptiert) — Rate-Limit-Key ist durch den Aufrufer beeinflussbar:** `getClientIdentifier()` leitet den Bucket aus dem unauthentifizierten `x-forwarded-for`/`x-real-ip`-Header ab (kein Trusted-Proxy-Allowlist, wie im Rest der App). Wer bereits ein gültiges `CRON_ALERT_SECRET` besitzt, kann das 20/Min-Limit trivial umgehen, indem er den Header pro Request rotiert — jeder „neue" Identifier bekommt ein frisches Budget. Der Limiter schützt damit nur vor einer einzelnen fehlkonfigurierten/wiederholenden Quelle, nicht vor einem gezielten Angreifer mit geleaktem Secret. **Bewusst akzeptiert:** Das deckt sich mit der eigenen Einordnung des Codes („ein Trip bedeutet einen fehlkonfigurierten Aufrufer oder ein geleaktes Secret") — der Limiter ist Rauschen-/Kosten-Kontrolle, keine harte Sicherheitsgrenze; die Sicherheit selbst kommt weiterhin ausschließlich vom Secret. Keine weitere Mitigation ergänzt (Overengineering-Risiko für eine sekundäre Schutzschicht).

---

## 8 — Tests

- `src/lib/security/__tests__/cron-alert-route.test.ts` — **7 Tests** (war 0 zum Zeitpunkt der vorherigen Modul-Version dieser Doku — der Fund „keine Testdatei" war zum Zeitpunkt dieses Audits bereits veraltet, siehe Abschnitt 9): fehlendes/falsches/nicht konfiguriertes Secret, gültiger Alarm inkl. `tags`-Payload-Shape, ungültiger Payload (kein Sentry-Aufruf), ungültiges JSON (kein Sentry-Aufruf), **neu:** Sustained-Flood löst nach 20 Requests/Min `429` aus.
- **Verifikation dieses Durchlaufs (2026-09-03):** `npm run test` (1375/1375 grün), `npm run lint` (0 Fehler in berührten Dateien). `npm run typecheck`/`npm run build` waren zum Zeitpunkt der Verifikation durch einen **unabhängigen, gleichzeitig laufenden Prozess** blockiert, der `scripts/generate-design-assets.ts` (eine von diesem Modul nicht berührte Datei) mitten in der Bearbeitung hatte — per `git diff`/`git status` bestätigt als komplett unabhängig von diesen Änderungen. Alle Dateien dieses Moduls wurden isoliert über die Testsuite verifiziert.
- **Security-Review (2026-09-03):** `security-reviewer`-Agent gezielt auf beide Änderungen angesetzt. **Ergebnis: Keine CRITICAL-/HIGH-Befunde.**
  - `tags: { job }`: sicher — derselbe Wert war bereits vorher im Freitext der Message enthalten, keine neue Exposition.
  - Reihenfolge Secret-Check vor Rate-Limit-Check: bestätigt korrekt — ein Aufrufer ohne gültiges Secret erreicht `isRateLimited()` nie, kann das Budget eines legitimen Aufrufers also nicht vergiften.
  - Fail-Open-Catch-Pfad: durch Code-Walkthrough bestätigt praktisch unerreichbar (keine der Operationen in `isRateLimited()` kann realistisch werfen) — harmlos, aber aktuell wirkungslos als Verteidigungslinie.
  - **1 MEDIUM-Fund** (siehe Pitfall 5 oben): Rate-Limit-Key über `X-Forwarded-For`-Rotation umgehbar — bewusst akzeptiert, deckt sich mit der eigenen Einordnung des Limiters als Rauschen-Kontrolle, nicht als harte Sicherheitsgrenze.
  - 2 LOW-Funde: stiller 429 ohne eigenes Logging (bewusst, konsistent mit dem bestehenden 401-Verhalten der Route); In-Memory-Map ist pro Serverless-Instanz, nicht global (dieselbe akzeptierte Einschränkung wie beim Health-Check-Limiter).

---

## 9 — Abgrenzung zur breiteren Kategorie-07-Arbeit (`worldmap/07_background_jobs_scheduling.md`)

Bei der Vorbereitung dieses Audits wurde eine bereits abgeschlossene, deutlich breitere 10-Unterkategorien-Aufschlüsselung der gesamten Background-Jobs-Domäne gefunden (Stand 2026-09-02). Um Duplikation zu vermeiden, wurden folgende, für dieses schmale Modul relevante Erkenntnisse **übernommen statt neu hergeleitet**:

- Migration `060`s neue `enqueue_cron_alert()`-Architektur (Abschnitt 4 oben).
- Die bereits vorhandene Testabdeckung für `cron-alert/route.ts` (Abschnitt 8).
- Die bewusst offen gelassene Restlücke „Zustellnachweis" (Pitfall 4).
- Die bereits priorisierte, aber hier **nicht** umgesetzte Trigger.dev-Alerting-Parität (kein `onFailure`-Hook auf der Trigger.dev-Seite — bereits als „Prio 2" in `worldmap/07_background_jobs_scheduling.md` geführt, deutlich größerer Scope als dieses Modul).
- Das neue `GET /api/admin/job-health`-Panel — inhaltlich relevant für [Modul 09 (Admin-Dashboard)](./09_admin_observability_dashboard.md), dort aufgegriffen, nicht hier.

Dieses Modul beschränkt sich bewusst auf den Next.js-Alarm-Callback selbst (`cron-alert/route.ts`) — die einzigen beiden hier tatsächlich behobenen Lücken (Rate-Limit, `tags`) lagen im Next.js-Code, nicht in der SQL-Architektur, die von der anderen Arbeit bereits gehärtet wurde.
