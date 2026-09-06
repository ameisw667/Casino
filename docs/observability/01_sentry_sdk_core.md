# 01 — Sentry SDK-Grundgerüst (Server · Edge · Client)

> **Säule:** 1 von 9 · **Status:** 🟢 Produktionsreif · **Niveau:** 🟢 Top 5 % (siehe [Bewertungsmethode](00_OBSERVABILITY_OVERVIEW.md#1--executive-summary-für-jan-high-level--verständlich)) · **Stand:** 2026-08-31 (gegen aktuellen Code verifiziert)
> **Archiv-Quelle:** `docs/architecture/05_1.9_ERROR_TRACKING_SENTRY.md` (historischer Implementierungsplan, M0–M8) · **SDK:** `@sentry/nextjs ^10.70.0` · **Back:** [`00_OBSERVABILITY_OVERVIEW.md`](00_OBSERVABILITY_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & wann brauche ich das?

Drei separate `Sentry.init()`-Aufrufe — einer pro Next.js-Runtime (Server, Edge, Client) — mit **identischer** Datenschutz-Policy. Next.js 16 lädt sie über `instrumentation.ts` (Server/Edge) bzw. die Konvention `src/instrumentation-client.ts` (Client) automatisch, ohne dass eine Route sie manuell importieren muss.

- **Wann berühren:** Neue Runtime-Config-Option (z. B. Sample-Rate ändern), neues Environment-Var für die DSN, oder wenn ein Team-Mitglied fragt „warum sehe ich diesen Fehler nicht in Sentry".
- **Nicht hier:** Was aus einem Event entfernt wird, bevor es Sentry erreicht → [Modul 02](./02_pii_secret_redaction.md). Wie `CasinoLogger` Sentry aufruft → [Modul 03](./03_logger_error_capture.md).

---

## 2 — Neue-Projekt-Checkliste (4 Schritte)

```
[ ] 1. Sentry-Projekt anlegen, EU-Data-Region wählen (DSGVO), DSN als NEXT_PUBLIC_SENTRY_DSN setzen
[ ] 2. next.config.ts mit withSentryConfig() wrappen (org/project/authToken kommen implizit aus Env-Vars)
[ ] 3. sentry.server.config.ts, sentry.edge.config.ts, src/instrumentation-client.ts mit identischer Policy anlegen
[ ] 4. src/proxy.ts CSP connect-src auf den EXAKTEN Ingest-Host erweitern — niemals *.ingest.<region>.sentry.io
```

---

## 3 — Die drei Runtime-Configs

### 3.1 Server (`sentry.server.config.ts`)

```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  sendDefaultPii: false,
  tracesSampleRate: 0,
  beforeSend: scrubSentryEvent,
});
```

### 3.2 Edge (`sentry.edge.config.ts`)

Identische Config-Werte wie Server. Next.js 16 stellte den Proxy (`src/proxy.ts`) standardmäßig auf die **Node.js-Runtime** um (Breaking Change gegenüber älteren Next.js-Versionen — verifiziert in `node_modules/next/dist/docs/`), wodurch `sentry.server.config.ts` den Proxy bereits abdeckt. `sentry.edge.config.ts` bleibt als **defensive Absicherung** bestehen, für zukünftige Routen mit explizitem `runtime = 'edge'`.

### 3.3 Client (`src/instrumentation-client.ts`)

```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  sendDefaultPii: false,
  tracesSampleRate: 0,
  beforeSend: scrubSentryEvent,
});
```

> **Namenskonvention beachten:** Der Client-Init lebt unter der Next.js-16-Konvention `src/instrumentation-client.ts`, **nicht** unter dem älteren `sentry.client.config.ts`-Namen, den viele Sentry-Tutorials noch zeigen.

**Bewusst nicht verdrahtet:** `onRouterTransitionStart` (vom Sentry-Build-Plugin als „ACTION REQUIRED" markiert) — würde volle Navigations-URLs inkl. Query-Strings als Breadcrumb erfassen, potenziell inkl. des OAuth-`code`-Parameters auf `/auth/callback`. Das ist zusätzliche, ungeprüfte Capture-Fläche — bewusst ausgelassen statt unreviewed ergänzt.

### 3.4 Registrierung (`src/instrumentation.ts`)

```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { assertCoreEnv } = await import('./lib/env');
    assertCoreEnv();
    await import('../sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}
export { captureRequestError as onRequestError } from '@sentry/nextjs';
```

`onRequestError` ist Next.js' App-Router-Hook für automatisch erfasste Server-Rendering-Fehler — er ergänzt, ersetzt aber nicht die manuellen `CasinoLogger.error()`-Aufrufe (siehe [Modul 03](./03_logger_error_capture.md)).

### 3.5 Build-Wrapping (`next.config.ts:24-27`)

```typescript
export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  widenClientFileUpload: false,
});
```

`org`/`project`/`authToken` werden implizit aus `SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_AUTH_TOKEN` gelesen. Fehlt `SENTRY_AUTH_TOKEN`, bricht der Build **nicht** — nur der Source-Map-Upload wird übersprungen (Stack-Traces bleiben dann minifiziert, reine Komfort-Einbuße).

---

## 4 — Konfigurationsentscheidungen (verbindlich, nicht ohne neue Freigabe ändern)

| Entscheidung       | Wert                                         | Warum                                                                          |
| :----------------- | :------------------------------------------- | :----------------------------------------------------------------------------- |
| Data Region        | EU (`o4511899214020608.ingest.de.sentry.io`) | DSGVO, deutscher Nutzerstamm                                                   |
| Session Replay     | Aus (kein `replayIntegration()`)             | Wallet-Beträge/Formulare auf dem Screen — Masking-Fehler wären ein Datenrisiko |
| `tracesSampleRate` | `0`                                          | Nur Error-Tracking, schont das Free-Tier-Kontingent                            |
| `sendDefaultPii`   | `false` (explizit in allen 3 Configs)        | Auditierbarkeit, auch wenn es SDK-Default wäre                                 |
| Alerting-Kanal     | Nur E-Mail (Sentry Free-Tier)                | Kein Zusatzaufwand für einen zweiten Kanal                                     |

---

## 5 — CSP-Anbindung (`src/proxy.ts:129`)

```
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.upstash.io
  https://o4511899214020608.ingest.de.sentry.io https://us.i.posthog.com;
```

Der Ingest-Host ist **exakt** eingetragen, kein `*.ingest.de.sentry.io`-Wildcard — ein Security-Review (M7 der ursprünglichen Einführung) markierte einen zuvor vorhandenen Wildcard-Eintrag als Befund #1: Exfiltration zu jedem anderen Sentry-Kundenprojekt in derselben EU-Region wäre sonst möglich. Kein `script-src`-Eintrag nötig — das Sentry-Next.js-SDK sendet Events per `fetch`, lädt kein externes Skript nach.

---

## 6 — Code-Pfade

```
sentry.server.config.ts                    # Server-Init
sentry.edge.config.ts                       # Edge-Init (defensiv, aktuell nicht der aktive Pfad)
src/instrumentation.ts                      # register() lädt Server/Edge-Config je nach NEXT_RUNTIME
src/instrumentation-client.ts                # Client-Init (Next.js-16-Konvention)
next.config.ts                              # withSentryConfig() Wrapping
src/proxy.ts                                 # CSP connect-src Host-Allowlist
src/lib/casino/sentry-scrub.ts               # beforeSend-Filter, siehe Modul 02
```

---

## 7 — Pitfalls

> **Pitfall 1 — Wildcard in der CSP wirkt harmlos, ist es aber nicht:** `*.ingest.de.sentry.io` sieht wie eine sinnvolle Verallgemeinerung aus, erlaubt aber Datenexfiltration zu fremden Sentry-Projekten. Immer den exakten, aus der DSN abgelesenen Host eintragen — nie raten oder verallgemeinern.

> **Pitfall 2 — Client-Init-Datei falsch benannt:** Viele Sentry-Next.js-Tutorials (auch ältere Sentry-eigene Doku) zeigen `sentry.client.config.ts`. In Next.js 16 ist die aktive Konvention `src/instrumentation-client.ts` — eine Datei mit dem alten Namen wird schlicht nicht geladen, ohne Fehlermeldung.

> **Pitfall 3 — `SENTRY_AUTH_TOKEN` fehlt lautlos:** Der Build bricht nicht, wenn das Token fehlt oder falsch ist — nur Source-Maps fehlen. Ein Health-Check nach dem Rollout (Stack-Trace lesbar vs. minifiziert) ist der einzige Weg, das zu bemerken.

---

## 8 — Verifikations-Historie

- **2026-08-12:** Alle 8 Meilensteine (M0–M8) des ursprünglichen Rollouts abgeschlossen, Security-Review (2 Befunde, beide behoben — CSP-Wildcard, fehlendes try/catch), Live-Testfehler `Insufficient balance` in Sentry bestätigt.
- **2026-08-31:** Vollständige Neu-Verifikation gegen den aktuellen Quellcode für diese Dokumentation — alle Konfigurationswerte (siehe Tabelle in Abschnitt 4) bestätigt unverändert. Keine Drift zum ursprünglichen Plan gefunden, mit Ausnahme kleinerer Namenskonventions-Details (siehe Pitfall 2).
