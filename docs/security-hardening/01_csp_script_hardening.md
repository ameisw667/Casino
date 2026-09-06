# 01 — CSP `script-src`-Härtung (Nonce & `strict-dynamic`)

> **Säule:** 1 von 10 · **Status:** 🟢 Committed (`1e75626`, 2026-08-30) · **Stand:** 2026-08-30
> **Datei:** `src/proxy.ts` Zeilen 110–134 · **Back:** [`00_SECURITY_OVERVIEW.md`](00_SECURITY_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & wann brauche ich das?

Ohne Nonce müsste eine Content-Security-Policy entweder `'unsafe-inline'` (jedes Inline-`<script>` erlaubt — inklusive eines von einem Angreifer injizierten) oder eine komplette Host-Allowlist pflegen. Ein **Nonce** ist ein pro Request neu erzeugter Zufallswert, den nur der Server kennt: Nur Skripte mit exakt diesem Attribut (`<script nonce="...">`) dürfen laufen. Ein XSS-Payload, der z. B. über ungefilterten User-Content eingeschleust wird, kennt den Nonce des aktuellen Requests nicht und wird vom Browser blockiert, bevor er ausgeführt wird.

- **Vorteil:** Schließt die häufigste reale CSP-Schwachstelle (`unsafe-inline`), ohne Next.js' eigene Hydration-Skripte zu brechen.
- **`strict-dynamic`:** Skripte, die vom nonce-tragenden Hauptbundle _nachgeladen_ werden (Code-Splitting), erben das Vertrauen automatisch — ohne `strict-dynamic` müsste jeder Chunk-Host einzeln allowlisted werden.

---

## 2 — Neue-Projekt-Checkliste (2 Schritte)

```
[ ] 1. Nonce pro Request erzeugen und auf die REQUEST-Header setzen (nicht nur Response) —
       Next.js liest den Nonce aus den Request-Headern, um ihn automatisch in
       framework-injizierte Skripte einzufügen (node_modules/next/dist/docs/01-app/
       02-guides/content-security-policy.md).
[ ] 2. 'unsafe-eval' NUR in NODE_ENV=development zulassen (React braucht es dort für
       Error-Stack-Rekonstruktion im Browser) — nie in Produktion.
```

---

## 3 — Kanonischer Code (`src/proxy.ts`)

```typescript
const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
const isDev = process.env.NODE_ENV === 'development';
const cspHeader =
  `default-src 'self'; ` +
  `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}; ` +
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ` +
  `font-src 'self' https://fonts.gstatic.com data:; ` +
  `img-src 'self' data: blob: https:; ` +
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.upstash.io ` +
  `https://o4511899214020608.ingest.de.sentry.io https://us.i.posthog.com; ` +
  `frame-ancestors 'none'; ` +
  `report-uri /api/internal/csp-report; report-to csp-endpoint;`;

const requestHeaders = new Headers(req.headers);
requestHeaders.set('x-nonce', nonce);
requestHeaders.set('Content-Security-Policy', cspHeader); // auf REQUEST-Headern für Next.js' Nonce-Injection

let response = NextResponse.next({ request: { headers: requestHeaders } });
// ... (Supabase-Session-Handling, siehe 04_csrf_origin_guard.md) ...
response.headers.set('Content-Security-Policy', cspHeader); // zusätzlich auf dem tatsächlichen Response
```

**Pitfall (bereits im Code kommentiert):** Der CSP-Header muss auf die _Request_-Header gesetzt werden, nicht nur auf die Response — Next.js parst die CSP aus den Request-Headern, um den Nonce automatisch in jedes framework-injizierte Skript (Hydration, Seiten-Bundle) einzufügen. Wer nur `response.headers.set(...)` aufruft, bekommt eine korrekte Response-CSP, aber Next.js' eigene Skripte tragen dann keinen Nonce und werden von der eigenen Policy blockiert.

**Host-Allowlist-Pitfall (`connect-src`):** Sentry- und PostHog-Hosts sind exakte Hostnamen (`o4511899214020608.ingest.de.sentry.io`), keine Wildcards (`*.ingest.de.sentry.io`). Ein Wildcard würde auch Exfiltration zu einem _fremden_ Sentry-Kundenprojekt in derselben Region erlauben.

---

## 4 — Sicherheits-Grenzen & Ehrliche Einschätzung

- **`style-src` bleibt `'unsafe-inline'`.** Das Projekt verwendet projektweit React-Inline-Styles (`style={{...}}`). Eine Nonce-Härtung von `style-src` wäre ein eigener, deutlich größerer Umbau (jede Inline-Style-Stelle müsste auf CSS-Klassen oder einen eigenen Style-Nonce-Mechanismus umgestellt werden) und ist bewusst nicht Teil dieser Härtungsrunde. **Reale Restlücke:** Ein Angreifer mit einer CSS-Injection-Schwachstelle (nicht XSS) kann weiterhin CSS-basierte Datenexfiltration betreiben (z. B. per `attr()`-Selektoren).
- **Verifiziert per Grep (2026-08-28):** 0 Treffer für `eval(` oder `new Function(` in `src/` — `'unsafe-eval'` in Produktion wäre also ohnehin folgenlos ungenutzt, ist aber trotzdem explizit ausgeschlossen (Defense-in-Depth gegen zukünftigen Code, nicht nur den heutigen Stand).

---

## 5 — Tests & Verifikation

- **`src/lib/security/__tests__/proxy-security-headers.test.ts`** (korrigiert 2026-08-30 — die vorherige Fassung dieser Datei behauptete fälschlich, es gäbe kein dediziertes Test-File) — 3 Testfälle, alle source-text-basiert gegen `src/proxy.ts` selbst:
  1. `defines all mandated security headers including CSP in proxy.ts` — prüft, dass jeder mandatierte Header-Aufruf (inkl. `Content-Security-Policy`) im Quelltext vorhanden ist.
  2. `configures strict Content-Security-Policy rules` — prüft `default-src 'self'`, `https://*.supabase.co`, `https://*.upstash.io`, `frame-ancestors 'none'` als Substring im Quelltext.
  3. `scopes the PostHog connect-src entry to the exact ingest host, never a wildcard` — prüft explizit das **Fehlen** von `*.posthog.com`/`*.i.posthog.com`.
- **Reale, unveränderte Lücke:** Diese Tests sind String-Matching gegen den Quelltext, kein Laufzeit-Test. Es gibt **keinen** Test, der verifiziert, dass der Nonce zur Laufzeit tatsächlich (a) pro Request eindeutig ist und (b) im ausgelieferten HTML auf den `<script>`-Tags landet, die Next.js injiziert — das wäre nur per E2E-Test (z. B. Playwright, zwei aufeinanderfolgende Requests, Nonce-Wert im Response-Body vergleichen) belegbar und existiert aktuell nicht.
- **Live-Verifikation ausstehend:** Ein `curl -I https://casino-xi-six.vercel.app` zeigt zum Zeitpunkt dieser Dokumentation (2026-08-30) noch die alte Produktions-CSP — der Commit `1e75626` ist auf `main` committed, aber der Produktions-Stand hängt vom nächsten Vercel-Deploy ab, das außerhalb des Scopes dieser reinen Doku-Aufgabe liegt.
