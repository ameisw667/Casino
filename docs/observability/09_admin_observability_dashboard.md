# 09 — Admin-Observability-Dashboard (`/admin/analytics`)

> **Säule:** 9 von 9 · **Status:** 🟢 Produktionsreif · **Niveau:** 🟢 Top 8 % (siehe [Bewertungsmethode](00_OBSERVABILITY_OVERVIEW.md#1--executive-summary-für-jan-high-level--verständlich)) — **hochgestuft von Top 15 % am 2026-09-03 nach 10-Subkategorien-Audit** · **Stand:** 2026-09-03 (Code 1:1 verifiziert)
> **Kern-Dateien:** `src/app/api/admin/analytics/route.ts`, `src/lib/admin/guide-observability.ts`, `src/app/admin/analytics/AnalyticsPageClient.tsx` · **Back:** [`00_OBSERVABILITY_OVERVIEW.md`](00_OBSERVABILITY_OVERVIEW.md)
> **Verwandt, aber bewusst separater Scope:** Ein neues Job-Health-Panel (`GET /api/admin/job-health` + `AdminOverviewClient.tsx`) existiert seit 2026-09-02 auf `/admin` (nicht `/admin/analytics`) — Ergebnis der Nachbararbeit in [`worldmap/07_background_jobs_scheduling.md`](../../worldmap/07_background_jobs_scheduling.md). Dieses Modul bleibt bei seinem ursprünglichen `/admin/analytics`-Scope, verweist hier nur darauf.

---

## 1 — High-Level: Was ist das & wann brauche ich das?

Der Ort, an dem Jan tatsächlich hinschaut: `/admin/analytics` zeigt Casino-BI (Nutzer, Wallet, Runden, VIP) **und** einen eigenen „Royale Guide Health"-Bereich ([Modul 08](./08_llm_guide_telemetry.md)) nebeneinander. Die beiden Datenquellen folgen dabei bewusst **unterschiedlichen** Lade-Strategien — das ist der zentrale Punkt dieses Moduls.

- **Wann berühren:** Ein neues Observability-Signal soll im Admin-Dashboard sichtbar werden.
- **Nicht hier:** Wie die Guide-Telemetrie selbst entsteht → [Modul 08](./08_llm_guide_telemetry.md).

---

## 2 — Neue-Projekt-Checkliste (3 Schritte)

```
[ ] 1. Neue optionale BI-Quelle: eigenes status: 'ready' | 'unavailable' Discriminated-Union-Schema, NIE die Kern-BI mitreißen
[ ] 2. Zod .strict() auf jedem RPC-Aggregat — Rohzeilen/Hashes dürfen die RPC-Grenze nie verlassen
[ ] 3. Fehlerpfad: CasinoLogger.error() nutzen, NICHT .warn() (siehe Modul 03, Pitfall 1 — warn() ist in Produktion unsichtbar)
```

---

## 3 — Die Architektur-Asymmetrie: Live-RPC vs. Cache-Snapshot

```typescript
const admin = createAdminClient();
const asOf = new Date().toISOString();
const [snapshotResult, guideResult] = await Promise.all([
  admin.from('admin_analytics_snapshots').select('payload, generated_at').eq('id', 1).maybeSingle(),
  Promise.resolve(admin.rpc('get_guide_observability', { p_as_of: asOf })).catch(() => ({
    data: null,
    error: true,
  })),
]);
```

- **Casino-BI** (Nutzer/Wallet/Runden/VIP) wird primär aus `admin_analytics_snapshots` gelesen — einer periodisch von einem Trigger.dev-Job befüllten Cache-Tabelle (Migration `046_admin_analytics_snapshot.sql`). Nur bei fehlendem/ungültigem Snapshot fällt die Route auf `computeAdminAnalyticsFromDb()` zurück (Live-Aggregation, mit `CasinoLogger.warn(...)` — siehe [Modul 03, Pitfall 1](./03_logger_error_capture.md#7--pitfalls) für die Konsequenz, dass dieser Hinweis in Produktion nirgendwo sichtbar wird).
- **Royale-Guide-Daten** werden **immer live** per RPC geladen, bei **jedem** Request, unabhängig davon, ob die Casino-BI aus dem Cache oder live bedient wird. `computeAdminAnalyticsFromDb()` nimmt `guide` explizit **nicht** als Parameter entgegen — der Snapshot-Job (`src/trigger/admin-analytics-snapshot.ts`) schreibt niemals Guide-Daten in den Cache.

> [!NOTE] **Das ist eine bewusste, aber nicht selbsterklärende Architektur-Entscheidung.** Wer neue BI-Quellen ergänzt, könnte annehmen, dass alles dem Snapshot-Muster folgt — tut es nicht. Guide-Observability ist die einzige Quelle, die pro Request frisch von der Datenbank kommt.

---

## 4 — Fail-Open-Verhalten der Guide-Kachel

```typescript
let guide = unavailableGuideObservability();
if (!guideResult.error) {
  try {
    guide = parseGuideObservability(guideResult.data);
  } catch (error) {
    CasinoLogger.error('API/Admin/Analytics', 'Guide observability data failed validation', error);
  }
} else {
  CasinoLogger.error('API/Admin/Analytics', 'Guide observability RPC failed', guideResult.error);
}
```

Schlägt die RPC fehl oder liefert unvalidierbare Daten, wird `guide.status = 'unavailable'` gesetzt — **die Casino-Kern-BI bleibt trotzdem 200 und vollständig**. Das ist eine bewusste Abweichung vom sonstigen fail-closed-Muster für Geld-Pfade ([Modul 05](./05_ratelimit_failclosed_alerting.md)): eine optionale Beobachtungs-Kachel darf das gesamte Admin-Dashboard nicht mit in den Abgrund reißen.

> [!NOTE] **Behobene Lücke (2026-09-03):** Beide Zweige übergaben zuvor **kein** Error-Objekt und **dieselbe** Nachricht („Guide observability data unavailable") — eine RPC-Fehler und eine Zod-Validierungsfehler waren in Sentry nicht voneinander unterscheidbar. Fix: Nachrichten differenziert (`'... RPC failed'` vs. `'... failed validation'`) und das jeweils verfügbare Error-Objekt (`error`/`guideResult.error`, im Validierungsfall stets ein echter `ZodError`) mitgegeben — dispatcht jetzt korrekt via `Sentry.captureException()` mit vollem Kontext statt eines kontextlosen `captureMessage()`.

---

## 5 — Zod-Validierungsgrenze (`src/lib/admin/guide-observability.ts`)

```typescript
const guideWindowSchema = z
  .object({
    requests: nonnegativeInteger,
    uniqueActors: nonnegativeInteger,
    successRate: nullableRate, // 0–100 oder null
    errorRate: nullableRate,
    outcomes: guideOutcomesSchema, // .strict() — exakt die 6 bekannten Outcomes
    averageLatencyMs: nullableInteger,
    p95LatencyMs: nullableInteger,
    tokens: z
      .object({
        input: nullableInteger,
        cachedInput: nullableInteger,
        output: nullableInteger,
        reasoning: nullableInteger,
        total: nullableInteger,
      })
      .strict(),
    estimatedCostMicrousd: nullableInteger,
  })
  .strict();

const guideObservabilitySchema = z.discriminatedUnion('status', [
  z
    .object({
      status: z.literal('ready'),
      asOf: z.string().datetime({ offset: true }),
      last24h: guideWindowSchema,
      last7d: guideWindowSchema,
      pricingVersions: z.array(z.string().min(1).max(64)),
    })
    .strict(),
  z.object({ status: z.literal('unavailable') }).strict(),
]);
```

Jedes `.strict()` bedeutet: ein unerwartetes zusätzliches Feld aus der RPC (z. B. versehentlich eine Rohzeile statt eines Aggregats) lässt die Validierung **fehlschlagen** statt es stillschweigend durchzulassen — die Kachel geht dann kontrolliert auf `unavailable`, statt potenziell sensible Rohdaten im Client-Bundle landen zu lassen.

---

## 6 — Die UI (`AnalyticsPageClient.tsx`)

Ein nicht-interaktiver „Royale Guide Health"-Bereich unterhalb des operativen Casino-Monitorings:

```tsx
<h3>Royale Guide Health</h3>
<GuideWindowCards label="24 h" window={data.guide.last24h} />
<GuideWindowCards label="7 Tage" window={data.guide.last7d} />
{/* Preisversionen als Klartext-Liste */}
{data.guide.pricingVersions.length ? data.guide.pricingVersions.join(', ') : /* Fallback */}
{/* Fehlerverteilung: Quota, Upstream, Rate Limit — jeweils für 24h */}
```

Bei `status: 'unavailable'` oder leerem Zeitfenster zeigt die UI einen Leerzustand statt einer irreführenden „0 %"-Erfolgsquote — konsistent mit der `null`-statt-`0`-Regel aus [Modul 08](./08_llm_guide_telemetry.md).

---

## 7 — Code-Pfade

```
src/app/api/admin/analytics/route.ts            # Paralleler Fetch: Snapshot + Live-Guide-RPC, Fail-Open-Merge
src/lib/admin/guide-observability.ts             # Zod-Schema, parseGuideObservability(), unavailableGuideObservability()
src/lib/admin/analytics.ts                       # buildAdminAnalytics() — guide wird durchgereicht, nicht berechnet
src/lib/admin/analytics-source.ts                 # computeAdminAnalyticsFromDb() — nimmt KEIN guide entgegen
src/app/admin/analytics/AnalyticsPageClient.tsx    # "Royale Guide Health"-UI-Sektion
supabase/migrations/046_admin_analytics_snapshot.sql  # Cache-Snapshot-Tabelle (OHNE Guide-Daten)
src/trigger/admin-analytics-snapshot.ts            # Trigger.dev-Job, befüllt den Snapshot (ohne guide)
```

---

## 8 — Pitfalls

> **Pitfall 1 — Neue BI-Quelle „der Einfachheit halber" ins Snapshot-Muster zu pressen wäre ein Rückschritt für Guide-Health:** Guide-Daten sind bewusst live, weil sie im Vergleich zur Kern-Casino-BI eine deutlich geringere Datenmenge und Query-Kosten haben (aggregierte 24h/7d-Werte, keine Millionen Wallet-Zeilen). Ein neues Feature mit ähnlich günstiger Aggregation kann demselben Live-Muster folgen; ein teures neues Signal sollte eher dem Snapshot-Muster folgen — bewusst abwägen, nicht automatisch kopieren.

> **Pitfall 2 (behoben 2026-09-01, Nebeneffekt des Logger-Audits) — `CasinoLogger.warn()` für den Snapshot-Fallback war in Produktion unsichtbar:** Der Hinweis „Falling back to live aggregation" existierte im Code, erreichte aber niemanden außerhalb eines lokalen Dev-Servers. Seit dem Logger-Audit vom 2026-09-01 ([Modul 03](./03_logger_error_capture.md#4--audit-10-subkategorien-niveau-bewertung-lücken--fix-status)) forwarded `warn()` immer an Sentry — dieser konkrete Aufruf hier profitiert automatisch davon, ohne dass an dieser Datei etwas geändert werden musste.

> **Pitfall 3 — Rate-Limit auf der Admin-Route selbst nicht vergessen:** `/api/admin/analytics` ruft `enforceRateLimit(..., 'admin-analytics-read', 30, 60)` **vor** dem parallelen Snapshot-/Guide-Fetch auf — ein neuer Endpunkt, der dieses Muster kopiert, sollte den Rate-Limit-Check ebenfalls vor die teuren parallelen Reads stellen, nicht danach.

> **Pitfall 4 (behoben 2026-09-03) — Fehlerkontext fehlte bei 3 von 4 `CasinoLogger.error()`-Aufrufen:** Siehe Abschnitt 4. Zwei strukturell unterschiedliche Guide-Fehlerpfade (RPC-Fehler vs. Validierungsfehler) waren in Sentry nicht unterscheidbar, und der Snapshot-Validierungsfehler hatte ebenfalls kein Error-Objekt. Alle drei jetzt behoben — siehe Abschnitt 4 und die neuen Tests unten.

---

## 9 — Tests

- `src/lib/admin/__tests__/guide-observability.test.ts` — Zod akzeptiert nur sichere Aggregate, verwirft negative Werte/ungültige Zeitstempel/unbekannte Outcomes/Rohzeilen; handgerechnete 24h-/7d-Fälle für Anzahl, eindeutige Aktoren, Quoten, Durchschnitt, p95, `null` bei leerem Fenster.
- `src/lib/admin/__tests__/analytics.test.ts` — `buildAdminAnalytics()` reicht `guide` unverändert durch, bestehende Casino-Metriken bytegleich in Bedeutung/Berechnung.
- `src/lib/security/__tests__/admin-analytics-route.test.ts` — **8 Tests** (war 6): Admin-Gates (401/403/429), Fail-Open bei ausgefallener Guide-RPC (Kern-BI bleibt 200), keine Fragen/Antworten im API-JSON, **neu:** `CasinoLogger.error()` erhält bei einer RPC-Fehlfunktion ein `Error`-Objekt mit differenzierter Nachricht, ebenso bei einer fehlgeschlagenen Snapshot-Validierung.
- **Verifikation dieses Durchlaufs (2026-09-03):** `npm run test` (1379/1379 grün), `npm run lint` (0 Fehler in berührten Dateien), `npm run typecheck` (0 Fehler). `npm run build` war zum Zeitpunkt der Verifikation durch einen **unabhängigen, gleichzeitig laufenden Umbau** von `CasinoGuidePanel.tsx` (kompletter Refactor in mehrere Hooks/Komponenten, 959 Zeilen geändert) blockiert — per `git diff --stat` als vollständig unabhängig von diesen Änderungen bestätigt (dieses Modul berührt ausschließlich `admin/analytics/route.ts` und dessen Testdatei).
- **Security-Review (2026-09-03):** `security-reviewer`-Agent gezielt auf die 3 geänderten Zeilen angesetzt. **Ergebnis: Keine CRITICAL-/HIGH-Befunde.**
  - Beide `ZodError`-Quellen (Guide-Validierung, Snapshot-Validierung) empirisch gegen das installierte Zod (v4.4.3) getestet: Fehlermeldungen enthalten ausschließlich Feldpfade und erwartete/erhaltene Typnamen, nie den tatsächlichen Wert (z. B. `"Invalid input: expected \"ready\""`, nicht der fehlerhafte String selbst) — strukturell kein Leck-Pfad.
  - `guideResult.error` (bei echtem RPC-Fehler ein `PostgrestError`, `extends Error`) geht über `captureException` — geprüft, dass das Projekt kein `ExtraErrorData`-Sentry-Integration konfiguriert hat, wodurch nur `.name`/`.message`/`.stack` erfasst werden, **nicht** `.details`/`.hint`/`.code` (wo laut Postgrest-Doku ggf. betroffene Werte/Spalten stünden). Restrisiko beschränkt auf generischen `.message`-Text, inhärent für jedes DB-Fehler-Logging im Projekt, nicht durch diesen Fix neu eingeführt, und landet ohnehin nur im internen Sentry-Dashboard, nie in der HTTP-Antwort.
  - `scrubSentryEvent()` läuft unverändert vor allen drei Pfaden als zusätzliche Verteidigungsebene.
  - 1 MEDIUM/informativer Hinweis (nicht durch diesen Fix verursacht): sollte künftig eine `ExtraErrorData`-Integration oder ein explizites `{extra: error}}`-Muster ergänzt werden, würden `PostgrestError.details`/`.hint` ungefiltert in `event.extra` fließen (`SENSITIVE_KEY_PATTERN` matcht diese Feldnamen nicht) — reine Merknotiz für eine künftige Sentry-Config-Änderung, keine Aktion in diesem Durchlauf nötig.
