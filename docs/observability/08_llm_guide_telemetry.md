# 08 — Royale Guide LLM-Telemetrie (pseudonym, textfrei)

> **Säule:** 8 von 9 · **Status:** 🟢 Produktionsreif, Live-Nachweis 2026-08-14 · **Niveau:** 🟢 Top 8 % (siehe [Bewertungsmethode](00_OBSERVABILITY_OVERVIEW.md#1--executive-summary-für-jan-high-level--verständlich); Abzug wegen der Streaming-Lücke in Abschnitt 5) · **Stand:** 2026-08-31 (Code + Migrationen 1:1 verifiziert)
> **Kern-Datei:** `src/lib/casino/guide-telemetry.ts` · **Migrationen:** `024_guide_telemetry_events.sql`, `027_guide_telemetry_purge_cron.sql` (unverändert seit 2026-08-14, keine Renummerierung) · **Back:** [`00_OBSERVABILITY_OVERVIEW.md`](00_OBSERVABILITY_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & wann brauche ich das?

Beobachtung des KI-gestützten „Royale Guide" (OpenAI Responses API) auf Betriebsebene — Volumen, Erfolg/Fehler, Latenz, Tokenverbrauch, Kostenschätzung — **ohne jemals** eine Frage, eine Antwort, eine Roh-User-ID, eine IP oder einen Provider-Rohfehler zu speichern. Der Aktor wird per HMAC-SHA-256 pseudonymisiert; Daten werden nach 90 Tagen automatisch gelöscht.

- **Wann berühren:** Eine neue LLM-Funktion soll ähnlich beobachtet werden (Muster wiederverwenden), oder die Kostenformel braucht ein neues Modell.
- **Nicht hier:** Gesprächsinhalt, Nutzerfeedback, personalisierte Beratung — bewusst außerhalb des Scopes (siehe `docs/architecture/05_2.7_ROYALE_GUIDE_OBSERVABILITY.md`, „Nicht im Umfang").

---

## 2 — Neue-Projekt-Checkliste (4 Schritte)

```
[ ] 1. Actor NIE roh speichern — immer HMAC-SHA-256(Secret, actorId) mit versioniertem Secret
[ ] 2. Schreiboperation mit hartem Timeout (250ms) absichern — Telemetrie darf die eigentliche Antwort nie verzögern
[ ] 3. Bei Streaming-Antworten: usage ist NICHT verfügbar, bevor der Stream konsumiert ist — siehe Abschnitt 5, bewusste Lücke
[ ] 4. RLS: PUBLIC/anon/authenticated bekommen 0 Rechte, nur service_role — Migration mit REVOKE ALL prüfen
```

---

## 3 — `recordGuideTelemetry()` und Kostenschätzung (`src/lib/casino/guide-telemetry.ts`)

```typescript
export type GuideTelemetryOutcome =
  'success' | 'configuration' | 'quota' | 'upstream' | 'invalid_response' | 'rate_limited';

const TELEMETRY_WRITE_TIMEOUT_MS = 250;
const MIN_HMAC_SECRET_BYTES = 32;

function readHmacConfiguration(): { secret: string; version: number } | null {
  const secret = process.env.GUIDE_TELEMETRY_HMAC_SECRET?.trim();
  const version = Number(process.env.GUIDE_TELEMETRY_HMAC_VERSION);
  if (
    !secret ||
    Buffer.byteLength(secret, 'utf8') < MIN_HMAC_SECRET_BYTES ||
    !Number.isSafeInteger(version) ||
    version < 1
  )
    return null;
  return { secret, version };
}

export function createGuideActorHash(actorId: string): { hash: string; version: number } | null {
  const config = readHmacConfiguration();
  if (!config || !actorId) return null;
  return {
    hash: createHmac('sha256', config.secret).update(actorId, 'utf8').digest('hex'),
    version: config.version,
  };
}

// Preise verifiziert gegen die offizielle OpenAI-Preisdokumentation zum jeweiligen Stichtag.
const GUIDE_PRICING: Record<string, GuidePricing> = {
  'gpt-4o-mini': {
    version: 'gpt-4o-mini-2026-08-17',
    inputMicrousdPerMillion: 150_000,
    cachedInputMicrousdPerMillion: 75_000,
    outputMicrousdPerMillion: 600_000,
  },
  'gpt-5-mini': {
    version: 'gpt-5-mini-2026-08-12',
    inputMicrousdPerMillion: 250_000,
    cachedInputMicrousdPerMillion: 25_000,
    outputMicrousdPerMillion: 2_000_000,
  },
};

async function withTelemetryTimeout<T extends { error: unknown }>(
  write: PromiseLike<T>,
): Promise<T | { error: Error }> {
  return Promise.race([
    write,
    new Promise<{ error: Error }>((resolve) =>
      setTimeout(
        () => resolve({ error: new Error('Guide telemetry write timed out') }),
        TELEMETRY_WRITE_TIMEOUT_MS,
      ),
    ),
  ]);
}

export async function recordGuideTelemetry(input: {
  actorId: string;
  outcome: GuideTelemetryOutcome;
  latencyMs: number;
  model: string | null;
  usage: GuideUsage | null;
  rateLimitWindowStartedAt?: Date;
}): Promise<'recorded' | 'skipped'> {
  const actor = createGuideActorHash(input.actorId);
  if (!actor || !isSafeNonNegativeInteger(input.latencyMs) || input.latencyMs > MAX_LATENCY_MS)
    return 'skipped';
  // ... weitere Validierung (Outcome/rate_limited-Fensterkonsistenz, Modellname-Länge)

  const usage = input.outcome === 'success' ? input.usage : null;
  const cost = estimateGuideCostMicrousd(input.model, usage);

  try {
    const write = createAdminClient().from('guide_telemetry_events').upsert(payload, {
      onConflict: 'actor_hash,actor_hash_version,outcome,rate_limit_window_started_at',
      ignoreDuplicates: true,
    });
    const result = await withTelemetryTimeout(write);
    if (result.error) throw result.error;
    return 'recorded';
  } catch {
    CasinoLogger.error('GuideTelemetry', 'Guide telemetry write failed');
    return 'skipped';
  }
}
```

**Kostenformel:** Integer-Arithmetik in Mikro-USD (`estimatePartMicrousd` rundet kaufmännisch: `Math.floor((tokens * rate + rate/2 der Millionen-Basis) / 1_000_000)`), getrennt für unkachierten Input, gecachten Input und Output. Reasoning-Tokens werden **nicht** separat berechnet, da sie bereits im Output stecken. Fehlt Modell, Preis-Snapshot oder Usage, ist die Kostenschätzung `null` — **nie erfunden, nie `$0`**.

**Idempotenz gegen doppelte 429er:** Der `upsert` mit `onConflict: 'actor_hash,actor_hash_version,outcome,rate_limit_window_started_at', ignoreDuplicates: true` dedupliziert mehrere Rate-Limit-Events desselben Aktors im selben 60-Sekunden-Fenster auf genau eine Zeile — abgesichert durch eine `UNIQUE`-Constraint in der Migration.

---

## 4 — Datenfluss: Von der Guide-Anfrage bis zur Zeile in Postgres

```
1. POST /api/chat/bot-response
2. Origin-/Auth-Check → enforceRateLimit('guide-chat', 30/60s)
   → bei Rate-Limit: recordGuideTelemetry(outcome:'rate_limited') VOR Body-Parsing
3. Zod-Validierung des Body
4. requestCasinoGuideAnswer() bzw. ...Stream() (src/lib/casino/chat-guide/, siehe Abschnitt 5)
   → OpenAI Responses API, 2-Turn Function-Calling-Loop (Tools + RAG-Kontext + Leaderboard)
   → liefert { answer, model, usage, suggestions?, action? }
5. Bei Erfolg: recordGuideTelemetry(outcome:'success', model, usage)
   Bei CasinoGuideError: kind → outcome (configuration/quota/upstream/invalid_response), model:null, usage:null
6. Öffentliche Antwort an den Client: NUR { answer, contextVersion } — model/usage NIE im Response-Body
7. Postgres: guide_telemetry_events (Migration 024) — HMAC-Hash, Outcome, Latenz, Tokens, Kosten
8. get_guide_observability(p_as_of) RPC aggregiert 24h/7d → siehe Modul 09
9. 90-Tage-Purge täglich via pg_cron (Migration 027) → alarmiert bei Fehlschlag via Modul 07
```

---

## 5 — Bekannte, verifizierte Lücke: Streaming-Antworten liefern nie echte Kosten-Telemetrie

> [!CAUTION] Für den **Streaming-Pfad** ruft die Route `recordGuideTelemetry(outcome:'success', usage: null)` auf, **unmittelbar nachdem der Stream erhalten wurde — bevor der Client ihn überhaupt konsumiert hat.** Da OpenAI die finale Token-Usage erst am Streaming-Ende liefert, ist zu diesem Zeitpunkt technisch noch keine echte Usage verfügbar. **Konsequenz:** Jede gestreamte Guide-Antwort erscheint in der Telemetrie als „Erfolg", aber mit `usage: null` — Token- und Kostenzahlen im Admin-Dashboard ([Modul 09](./09_admin_observability_dashboard.md)) sind für den Streaming-Anteil systematisch unvollständig, nicht nur gelegentlich. Nur der **nicht-streamende** Pfad liefert echte `usage`-Werte.
>
> **Für neue LLM-Features:** Wer dieses Telemetrie-Muster auf ein anderes gestreamtes Feature überträgt, sollte diese Einschränkung bewusst übernehmen (dokumentieren) oder lösen (z. B. `usage` erst nach vollständigem Stream-Abschluss serverseitig nachtragen), statt sie stillschweigend zu wiederholen.

---

## 6 — Struktur-Drift gegenüber der historischen Planungsdatei

Die ursprüngliche Planungsdatei (`docs/architecture/05_2.7_ROYALE_GUIDE_OBSERVABILITY.md`) beschreibt `src/lib/casino/chat-guide.ts` als **eine** Datei. Das ist seit einer späteren Umstrukturierung nicht mehr korrekt: `chat-guide` ist heute ein **Verzeichnis** `src/lib/casino/chat-guide/` mit einem Barrel-Export `index.ts` und den Modulen `answer.ts`, `stream.ts`, `request.ts`, `response-parser.ts`, `context.ts`, `instructions.ts`, `personas.ts`, `suggestions.ts`. Das Datenmodell (Migration 024/027) und die RPC-Signatur sind **unverändert** — nur der Service-Layer-Dateipfad hat sich geändert.

---

## 7 — Code-Pfade

```
src/lib/casino/guide-telemetry.ts                    # HMAC-Hashing, Kostenschätzung, 250ms-Timeout-Upsert
src/lib/casino/__tests__/guide-telemetry.test.ts       # Unit-Tests
src/lib/casino/__tests__/guide-telemetry-migration.test.ts  # Migrationstest (RLS, REVOKE ALL, Constraints)
src/lib/casino/chat-guide/index.ts                     # Barrel: requestCasinoGuideAnswer(), ...Stream()
src/lib/casino/chat-guide/answer.ts                    # Non-Streaming-Pfad, liefert GuideAnswerResult inkl. usage
src/lib/casino/chat-guide/stream.ts                     # Streaming-Pfad (usage: null, siehe Abschnitt 5)
src/app/api/chat/bot-response/route.ts                  # Einziger Aufrufer von recordGuideTelemetry()
supabase/migrations/024_guide_telemetry_events.sql       # Tabelle, RLS, get_guide_observability() RPC, Purge-/Löschfunktionen
supabase/migrations/027_guide_telemetry_purge_cron.sql    # pg_cron-Job + Alarm-Wiring (siehe Modul 07)
```

---

## 8 — Pitfalls

> **Pitfall 1 — Streaming verliert Kostentransparenz (siehe Abschnitt 5):** Beim Erweitern der Guide-Funktion nicht vergessen, dass Kosten-KPIs im Dashboard den Streaming-Traffic strukturell unterschätzen.

> **Pitfall 2 — HMAC-Secret-Rotation verändert `actor_hash_version`:** Nach einer Secret-Rotation zählen dieselben Nutzer über die Rotationsgrenze hinweg als „neue" pseudonyme Aktoren (andere Hash-Version). Das Admin-UI muss eindeutige Nutzerzahlen über eine Rotation hinweg als potenziell ungenau kennzeichnen — nicht automatisch korrigierbar, ohne die Pseudonymisierung selbst zu schwächen.

> **Pitfall 3 — `usage`-Validierung ist strikt bis zur Ablehnung:** `normalizeGuideUsage()` verwirft die gesamte Usage (nicht nur das fehlende Feld), sobald `total_tokens < inputTokens + outputTokens` oder ein Feld keine sichere nicht-negative Ganzzahl ist. Ein leicht inkonsistentes Provider-Response-Objekt führt damit zu komplett fehlenden Token-/Kostendaten für diesen einen Call, nicht zu einer Teilangabe.

---

## 9 — Tests

- `src/lib/casino/__tests__/guide-telemetry.test.ts` — HMAC-Stabilität, abweichende Secrets, alle 6 Outcomes, negative/fractionale/NaN/Infinity-Latenzen, ungültige Tokens, fehlendes Secret, unbekannter Preis-Snapshot, 250-ms-Timeout, dupliziertes Rate-Limit-Fenster.
- `src/lib/casino/__tests__/guide-telemetry-migration.test.ts` — RLS, `REVOKE ALL` für Browserrollen, service-role-only Grants, Constraints, 90-Tage-Purge, sicherer `search_path`.
- **Live-E2E-Nachweis (2026-08-14, Produktion `hmqwozhdckbwjqzcmire`):** Echter Testcall über `/api/chat/bot-response` lieferte `200` + echte Antwort; `get_guide_observability` zeigte danach `outcomes.success: 1`, `input_tokens: 469`, `output_tokens: 51`, `estimated_cost_microusd: 219`, `pricing_version: "gpt-5-mini-2026-08-12"`. Rohzeile enthielt ausschließlich Hash/Outcome/Zahlen — kein Frage-/Antworttext, keine User-ID, keine IP.
