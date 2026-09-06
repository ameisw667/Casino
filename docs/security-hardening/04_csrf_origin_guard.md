# 04 — CSRF- / Origin-Guard (Doppelte Schutzschicht)

> **Säule:** 4 von 10 · **Status:** 🟡 Unit-Tests grün, **Live-Verhalten im Red-Team-Test aktuell in Klärung** · **Stand:** 2026-08-30, ca. 17:20 UTC
> **Dateien:** `src/lib/security/origin-guard.ts` (Edge), `src/lib/security/request-security.ts` (API) · **Back:** [`00_SECURITY_OVERVIEW.md`](00_SECURITY_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & wann brauche ich das?

Cross-Site Request Forgery (CSRF) nutzt aus, dass ein Browser bei einem Request an eine Ziel-Seite automatisch deren Cookies mitschickt — auch wenn der Request von einer _fremden_ Seite ausgelöst wurde (z. B. ein verstecktes `<form>` auf einer bösartigen Seite, das automatisch abschickt). Der Schutz besteht darin, jeden state-verändernden Request danach zu prüfen, ob er wirklich von der eigenen Origin ausgelöst wurde.

Dieses Projekt hat **zwei unabhängige Prüfungen**, keine Redundanz zum Kürzen:

1. **`hasValidOrigin()`** in `src/proxy.ts` — läuft am Edge, für jeden Request, bevor eine Route erreicht wird.
2. **`validateMutationOrigin()`** in `request-security.ts` — läuft zusätzlich innerhalb einzelner Geld-Routen mit einer expliziten Allowlist.

---

## 2 — Neue-Projekt-Checkliste (3 Schritte)

```
[ ] 1. Sec-Fetch-Site als PRIMÄRES Signal nutzen, nicht nur Origin — es ist vom Browser
       gesetzt und kann von Seiten-JavaScript nicht überschrieben werden (moderne
       Browser-Garantie), im Gegensatz zu manchen anderen Headern.
[ ] 2. GET/HEAD/OPTIONS von der Prüfung ausnehmen (keine State-Änderung), aber niemals
       POST/PATCH/DELETE.
[ ] 3. Bei fehlenden Origin- UND Sec-Fetch-Site-Headern ABLEHNEN, nicht durchlassen —
       ein echter Browser-Request trägt immer mindestens eines von beiden.
```

---

## 3 — Kanonischer Code

### Edge-Schicht (`src/lib/security/origin-guard.ts`)

```typescript
export function hasValidOrigin(req: OriginGuardRequest): boolean {
  const secFetchSite = req.headers.get('sec-fetch-site');
  if (secFetchSite) {
    // 'same-origin'/'same-site': diese Seite hat den Request ausgelöst.
    // 'none': direkte Nutzeraktion (getippte URL, Lesezeichen) — kein CSRF-Fall.
    // 'cross-site': eine fremde Seite hat den Request ausgelöst — GENAU der zu blockierende Fall.
    return secFetchSite !== 'cross-site';
  }

  // Fallback für alte Browser ohne Sec-Fetch-Site
  const origin = req.headers.get('origin');
  if (!origin) return false; // vorher: true (Lücke, mit M4 geschlossen)
  try {
    const forwardedHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
    const expectedHost = forwardedHost || req.headers.get('host');
    return Boolean(expectedHost && new URL(origin).host === expectedHost);
  } catch {
    return false;
  }
}
```

### API-Schicht (`src/lib/security/request-security.ts`)

```typescript
export function validateMutationOrigin(request: Request): Response | null {
  const origin = request.headers.get('origin');
  if (!origin) return new Response('Origin required', { status: 403 });
  // ... URL-Parsing-Validierung ...
  const allowedOrigins = hasConfiguredOrigins
    ? /* aus APP_ORIGINS geparst */
    : process.env.NODE_ENV !== 'production'
      ? [new URL(request.url).origin] // Dev: eigene Origin implizit erlaubt
      : []; // Produktion ohne APP_ORIGINS: NICHTS erlaubt (fail-closed)

  if (!allowedOrigins.includes(parsedOrigin.origin)) {
    return new Response('Cross-site mutation rejected', { status: 403 });
  }
  return null;
}
```

**Wichtiger Unterschied zu `hasValidOrigin()`:** `validateMutationOrigin()` verlangt IMMER einen `Origin`-Header (kein `Sec-Fetch-Site`-Fallback) und schlägt in Produktion ohne `APP_ORIGINS`-Konfiguration standardmäßig **alles ab** — strenger als die Edge-Schicht, bewusst als zusätzliche Verteidigungslinie für Geld-Routen.

---

## 4 — Offener Befund: Red-Team-Probe scheitert aktuell live (Stand 2026-08-30, ca. 17:20 UTC)

**Das ist kein abgeschlossener, sondern ein zum Dokumentationszeitpunkt aktiv bearbeiteter Befund** — hier bewusst nicht schöngefärbt dargestellt:

`scripts/red-team/rate-limit-bypass.ts` feuert 32 Requests gegen `/api/casino/bet` und `/api/casino/blackjack` mit gesetztem `origin`-Header (identisch zur Ziel-URL) und erwartet, dass ab dem konfigurierten Limit `429 Too Many Requests` zurückkommt. Im CI-Lauf `33324584523` (2026-08-30, 17:12 UTC) kamen stattdessen **32× `403`** zurück:

```
P1.4 rate-limit contract failed for /api/casino/bet: statuses=[403,403,403,...] (32× 403)
```

Das bedeutet: **Nicht** der Rate-Limiter greift zuerst (erwartetes Verhalten), sondern eine der beiden Origin-Prüfungen lehnt bereits vorher ab. Zwischen 17:00 und 17:20 UTC liefen mehrere Debug-Commits zur Eingrenzung (`debug(security): temporary origin-guard header logging for CI diagnosis`, `debug(ci): add raw curl step to see full 403 response body`, zuletzt `fix(ci): target red-team probes at localhost, not 127.0.0.1, and drop debug instrumentation`). Der letzte Commit deutet auf die wahrscheinliche Ursache hin: Der Origin-Header im Probe-Skript zeigt vermutlich auf `127.0.0.1`, während `Host`/`x-forwarded-host` im ephemeren CI-Runner auf `localhost` lauten (oder umgekehrt) — ein Host-Mismatch, den `hasValidOrigin()`'s Fallback-Pfad korrekt als Cross-Origin werten würde, weil `127.0.0.1` und `localhost` unterschiedliche Hosts sind, obwohl sie dieselbe Maschine meinen.

**Zum Zeitpunkt dieser Dokumentation läuft der nach diesem Fix erneut ausgelöste CI-Run noch (`in_progress`).** Der tatsächliche Ausgang ist hier bewusst nicht vorweggenommen — der nächste `gh run list`-Aufruf zeigt den aktuellen Stand.

**Wichtige Nebenerkenntnis, unabhängig vom Ausgang:** Dass die Origin-Prüfung im Zweifelsfall zu streng statt zu lax reagiert (ein legitimer Probe wird blockiert, statt versehentlich durchgelassen), ist aus Sicherheitssicht die richtige Fehlerrichtung — das Problem liegt aktuell in der Testumgebung (Host-Mismatch zwischen Probe und ephemeraler App-Instanz), nicht in einer zu laxen Produktionslogik.

---

## 5 — Sicherheits-Grenzen & Ehrliche Einschätzung

- **Zwei Schichten sind Tiefenverteidigung, kein Ersatz für Rate-Limiting.** Ein Angreifer, der die eigene Origin fälschen könnte (was Browser strukturell verhindern, aber ein direkter API-Client ohne Browser nicht muss), würde nicht am Origin-Check scheitern — dafür existiert `enforceRateLimit()` als unabhängige Schicht.
- **`request-security.ts`s Dev-Fallback (`allowedOrigins = [request.url.origin]`) gilt NICHT in Produktion** — ohne gesetztes `APP_ORIGINS` lehnt Produktion dann bewusst _alles_ ab, statt implizit die eigene Origin zu erraten.

---

## 6 — Tests & Verifikation

- `src/lib/security/__tests__/origin-guard.test.ts` — **8 Testfälle**, grep-verifiziert 2026-08-30 (`grep -c "it("` → 8).
- `src/lib/security/__tests__/mutation-origin-inventory.test.ts`, `mutation-origin-routes.test.ts` — Data-driven Tests (kein klassisches `it()`-Pattern), prüfen, dass jede Geld-Route `validateMutationOrigin()` tatsächlich aufruft.
- **Live-/Red-Team-Verifikation:** Offen, siehe Abschnitt 4. Aktuellen Stand vor jeder Aussage über „behoben“ per `gh run list --workflow="Security red team probes" --limit 3` gegenprüfen.
