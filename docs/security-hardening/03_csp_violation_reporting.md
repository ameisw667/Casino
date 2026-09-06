# 03 — CSP-Violation-Reporting

> **Säule:** 3 von 10 · **Status:** 🟢 Committed, 6/6 Tests grün (verifiziert 2026-08-30) · **Stand:** 2026-08-30
> **Datei:** `src/app/api/internal/csp-report/route.ts` · **Back:** [`00_SECURITY_OVERVIEW.md`](00_SECURITY_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & wann brauche ich das?

Eine Content-Security-Policy, die Verstöße nur blockiert, aber nicht meldet, ist ein Blindflug: Man weiß nicht, ob es reale Angriffsversuche gibt, ob ein neues Feature versehentlich gegen die eigene Policy verstößt, oder ob die Policy überhaupt jemals greift. `report-uri`/`report-to` lassen den Browser jeden Verstoß automatisch an einen selbst gehosteten Endpunkt melden.

- **Zwei Formate parallel unterstützt:** Das alte `report-uri` (Firefox unterstützt bis heute nur dieses), und das aktuelle `report-to` (Reporting API, Chrome-Standard) — beide zeigen auf denselben Sink.
- **Sink leitet an Sentry weiter:** Kein separates Dashboard nötig, Verstöße erscheinen dort, wo ohnehin schon Fehler beobachtet werden.

---

## 2 — Neue-Projekt-Checkliste (3 Schritte)

```
[ ] 1. In der Middleware BEIDE Header setzen: `report-uri` in der CSP-Direktive selbst
       UND einen separaten `Reporting-Endpoints`-Header für `report-to`.
[ ] 2. Route MUSS unauthentifiziert sein und die CSRF-Prüfung umgehen — der Browser
       sendet Reports ohne Origin-/Sec-Fetch-Site-Metadaten (siehe proxy.ts PUBLIC_ROUTES
       und isBrowserReport-Flag).
[ ] 3. Rate-Limiten, aber NIE mit einem Fehlerstatus antworten — ein Reporting-Sink darf
       den Browser niemals zu einem Retry verleiten oder als sichtbarer Fehler auffallen.
```

---

## 3 — Kanonischer Code

### Middleware-Seite (`src/proxy.ts`)

```typescript
// CSP-Direktive
`report-uri /api/internal/csp-report; report-to csp-endpoint;`;

// Zusätzlicher Header, löst den "csp-endpoint"-Namen aus report-to auf
response.headers.set('Reporting-Endpoints', 'csp-endpoint="/api/internal/csp-report"');
```

### Sink (`src/app/api/internal/csp-report/route.ts`)

```typescript
export async function POST(request: Request): Promise<Response> {
  const identifier = getClientIdentifier(request);
  const decision = await enforceRateLimit(identifier, 'csp-report', 20, 10); // 20 Reports / 10s
  if (!decision.success) return new Response(null, { status: 204 }); // stiller Verwurf, kein Fehler

  try {
    const raw: unknown = await request.json();
    if (!raw) return new Response(null, { status: 204 });

    // Legacy-Einzelobjekt { "csp-report": {...} } ODER Reporting-API-Batch [{ type, url, body }, ...]
    const reports: unknown[] = Array.isArray(raw)
      ? raw
      : raw && typeof raw === 'object' && 'csp-report' in raw
        ? [(raw as Record<string, unknown>)['csp-report']]
        : [raw];

    for (const report of reports.slice(0, 20)) {
      // hart auf 20 Reports pro Request gekappt
      Sentry.captureMessage('CSP violation reported', {
        level: 'warning',
        tags: { source: 'csp-report' },
        extra: { report },
      });
    }
  } catch (error) {
    console.error('[CspReport] Failed to process violation report:', error);
  }

  return new Response(null, { status: 204 }); // IMMER 204, unabhängig vom Ausgang
}
```

---

## 4 — Sicherheits-Grenzen & Ehrliche Einschätzung

- **Bewusst unauthentifiziert und von CSRF ausgenommen:** Das ist keine Lücke, sondern eine Notwendigkeit — der Browser selbst (nicht Seiten-JavaScript) sendet diese Reports und trägt keine verlässlichen Origin-Metadaten. Ein Angreifer kann diesen Endpunkt mit gefälschten Reports fluten, aber das Rate-Limit (20/10s pro Client-Identifier) und der `204`-Nichts-Passiert-Response begrenzen den Schaden auf Sentry-Rauschen, nicht auf einen Denial-of-Service.
- **`Sentry.captureMessage` kann selbst fehlschlagen** (SDK-Fehler, Netzwerk) — das ist im `try/catch` abgefangen und darf laut Kommentar im Code niemals zum Browser durchschlagen.
- **Rate-Limit-Identifier kann kollidieren:** `getClientIdentifier()` (`request-security.ts`) fällt ohne `x-forwarded-for`/`x-real-ip`-Header auf den festen String `'unknown'` zurück → alle Clients ohne diese Header teilen sich denselben Rate-Limit-Eimer (`ip:unknown`, 20 Reports/10s). Auf Vercel ist `x-forwarded-for` in der Praxis zuverlässig gesetzt, ungeprüft bleibt aber jeder abweichende Deployment-Kontext (z. B. ein Reverse-Proxy davor, der den Header entfernt). **Schadensbegrenzung bereits gegeben:** Eine Kollision führt nur zu still verworfenen Reports (verlorene Sentry-Sichtbarkeit für andere Clients im selben Zeitfenster), nicht zu einem sichtbaren Fehler oder einem Denial-of-Service — der Endpunkt antwortet in jedem Fall mit `204`.

---

## 5 — Tests & Verifikation

- `src/lib/security/__tests__/csp-report-route.test.ts` — **6 Testfälle**, grep-verifiziert am 2026-08-30 (`grep -c "it(" csp-report-route.test.ts` → 6). Deckt beide Report-Formate, Rate-Limit-Überschreitung und den fehlerfreien 204-Pfad bei defektem JSON ab.
