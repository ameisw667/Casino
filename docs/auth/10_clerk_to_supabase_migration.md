# 10 — Architektur-Blaupause: Clerk → Supabase SSR Auth

> **Typ:** Wiederverwendbare Architektur-Blaupause · **Status:** 🟢 Abgeschlossen & Verifiziert · **Stand:** 2026-08-27  
> **Archiv-Quelle:** `docs/architecture/02_CLERK_SUPABASE.md` · **Back:** [`00_AUTH_OVERVIEW.md`](00_AUTH_OVERVIEW.md)

---

## 1 — Warum diese Blaupause wertvoll ist

Dokumentiert die vollständige Migration eines Next.js App Router Projekts von einem proprietären Drittanbieter-Auth-SaaS (**Clerk**) auf native, selbst-kontrollierte **Supabase SSR Cookies** (`@supabase/ssr`) ohne Vendor-Lock-in.

**Kern-Erkenntnis:** Supabase GoTrue ist vollständig cookie-basiert und token-agnostisch. RLS-Policies in Postgres, die `auth.uid()` prüfen, müssen bei einer Migration **nicht geändert werden**.

---

## 2 — Die 10 Migrations-Schritte (Reihenfolge)

| Schritt | Modul | Money-kritisch? | Beschreibung |
| :--- | :--- | :--- | :--- |
| **1** | **Supabase Helper** | Ja (Fundament) | `src/utils/supabase/client.ts` und `server.ts` mit `@supabase/ssr` anlegen. |
| **2** | **Admin-Autorisierung** | Nein | `src/lib/security/admin.ts` mit `isAdminEmail()` über feste ENV-Liste etablieren. |
| **3** | **Next.js Middleware** | Nein (Gate) | `src/proxy.ts` auf `withRefreshedCookies()`-Pattern umstellen. |
| **4** | **API-Routen** | **Ja** | Alle Endpunkte von Clerk `auth()` auf `supabase.auth.getUser()` umstellen. |
| **5** | **RLS-Policies** | Ja (Prüfung) | Sicherstellen, dass alle Tabellen `auth.uid()` nutzen. |
| **6** | **Layout & Providers** | Nein | `<ClerkProvider>` entfernen, `SupabaseSessionProvider` etablieren. |
| **7** | **Sign-In / Sign-Up** | Nein | Native Formulare (`AuthForm.tsx`) anstelle von Clerk-Widgets einbinden. |
| **8** | **Finanz-Regression** | **Ja** | Wetten (`bet`), Blackjack (`advance_blackjack_round`) und Wallet-Abfragen testen. |
| **9** | **Webhooks deaktivieren**| Nein | Alte Clerk-Webhooks entfernen (`410 Gone` zurückgeben). |
| **10**| **Dependency Cleanup** | Nein | `@clerk/nextjs` aus `package.json` deinstallieren und ENV-Keys löschen. |

---

## 3 — Schlüsselpattern 1: `withRefreshedCookies()` (`src/proxy.ts`)

Das wichtigste Detail bei Next.js Middleware mit Supabase SSR: Wenn Supabase ein Token erneuert, müssen die neuen Cookies **zwingend** auf Weiterleitungs- und Fehler-Responses übertragen werden:

```typescript
// src/proxy.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

function withRefreshedCookies(from: NextResponse, terminal: NextResponse): NextResponse {
  from.cookies.getAll().forEach((cookie) => terminal.cookies.set(cookie));
  return terminal;
}

export default async function proxy(req: NextRequest) {
  let response = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          response = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Bei Redirect: Cookies ZWINGEND mitnehmen!
  if (!user && req.nextUrl.pathname.startsWith('/admin')) {
    return withRefreshedCookies(response, NextResponse.redirect(new URL('/sign-in', req.url)));
  }

  return response;
}
```

> **Warnung:** Fehlt `withRefreshedCookies()`, verliert der Browser bei Redirects das erneuerte Session-Cookie und der Nutzer wird unerwartet ausgeloggt!

---

## 4 — Schlüsselpattern 2: Admin-Allowlist (`src/lib/security/admin.ts`)

```typescript
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowlist = (process.env.SUPABASE_ADMIN_EMAILS ?? '')
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.includes(email.trim().toLowerCase());
}
```

---

## 5 — Lessons Learned für neue Projekte

1. **RLS ist Provider-unabhängig:** `auth.uid()` liefert in Postgres immer eine UUID.
2. **Bestandsnutzer nicht konvertieren:** Für Dev/Staging alte Accounts zurücksetzen, statt Passwörter manuell migrieren zu wollen (Passwort-Hashes sind zwischen Providern inkompatibel).
3. **Immer `getUser()` statt `getSession()` auf dem Server nutzen:** `getSession()` validiert das JWT nicht gegen die Datenbank; `getUser()` garantiert Authentizität.
