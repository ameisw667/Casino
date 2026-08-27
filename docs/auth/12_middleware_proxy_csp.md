# 12 — Sicherheits-Perimeter: Next.js Middleware, CSP & Cookie-Bridge

> **Typ:** Sicherheits-Infrastruktur · **Status:** 🟢 Produktionsreif · **Stand:** 2026-08-27  
> **Datei:** `src/proxy.ts` · **Back:** [`00_AUTH_OVERVIEW.md`](00_AUTH_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & warum im nächsten Projekt?

`src/proxy.ts` ist der vorgeschaltete Sicherheits-Wächter (Next.js Edge Middleware) für jeden einzelnen eingehenden HTTP-Request. Er erfüllt vier fundamentale Schutzaufgaben:
1. **Automatischer Cookie-Refresh:** Erneuert ablaufende Supabase-Tokens transparent im Hintergrund.
2. **CSRF & Origin Guard:** Blockiert State-modifizierende HTTP-Requests (POST/PATCH/DELETE) mit gefälschtem oder abweichendem `Origin`-Header.
3. **Admin-Route Guard:** Schützt alle `/admin/**`-Routen per strikter E-Mail-Allowlist (`SUPABASE_ADMIN_EMAILS`).
4. **Content Security Policy (CSP) & Header-Härtung:** Schützt vor XSS, Clickjacking und Datenexfiltration.

---

## 2 — Die 4 Schutzschichten im Code (`src/proxy.ts`)

### 1. CSRF & Origin Guard
```typescript
function hasValidOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try {
    const forwardedHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
    const expectedHost = forwardedHost || req.headers.get('host');
    return Boolean(expectedHost && new URL(origin).host === expectedHost);
  } catch {
    return false;
  }
}
```

### 2. Cookie Token-Refresh mit `withRefreshedCookies()`
```typescript
function withRefreshedCookies(from: NextResponse, terminal: NextResponse): NextResponse {
  from.cookies.getAll().forEach((cookie) => terminal.cookies.set(cookie));
  return terminal;
}
```

### 3. Admin-Gate
```typescript
if (pathname.startsWith('/admin')) {
  if (!user) return withRefreshedCookies(response, NextResponse.redirect(new URL('/sign-in', req.url)));
  if (!isAdminEmail(user.email)) return withRefreshedCookies(response, new NextResponse('Forbidden', { status: 403 }));
}
```

### 4. CSP & Security Headers
```typescript
response.headers.set('X-Frame-Options', 'SAMEORIGIN');
response.headers.set('X-Content-Type-Options', 'nosniff');
response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
response.headers.set(
  'Content-Security-Policy',
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.upstash.io https://o4511899214020608.ingest.de.sentry.io https://us.i.posthog.com; frame-ancestors 'none';"
);
```

---

## 3 — Pitfalls

> **Pitfall 1 — Externe Analytics & Sentry in CSP:** Neue Dienste (z. B. PostHog, Sentry) müssen zwingend in der CSP unter `connect-src` mit ihrem exakten Hostnamen eingetragen werden. Wildcards wie `*.sentry.io` sollten vermieden werden, um Datenabfluss zu fremden Sentry-Projekten zu verhindern.
