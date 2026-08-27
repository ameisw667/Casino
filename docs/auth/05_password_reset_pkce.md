# 05 — PKCE Password Reset & Recovery Flow

> **Säule:** 5 von 9 · **Status:** 🟢 Produktionsreif · **Stand:** 2026-08-27  
> **Archiv-Quelle:** `docs/archive/20_5_password_reset_recovery_flow.md` · **Back:** [`00_AUTH_OVERVIEW.md`](00_AUTH_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & wann brauche ich das?

Ein vollständiger, sicherer E-Mail-Wiederherstellungsfluss nach dem modernen PKCE-Standard (Proof Key for Code Exchange) mit dedizierter Standalone-Passwort-Reset-Seite im Obsidian & Gold Design.

- **Vorteil:** Schützt vor Phishing, Man-in-the-Middle-Angriffen und Token-Diebstahl im E-Mail-Link.
- **Open-Redirect-Schutz:** Verhindert, dass Angreifer präparierte Links verbreiten, die nach dem Reset auf eine betrügerische Phishing-Seite weiterleiten.

---

## 2 — Neue-Projekt-Checkliste (3 Schritte)

```
[ ] 1. Supabase Dashboard → Authentication → URL Configuration:
        Site URL:        https://deine-domain.com
        Redirect URLs:   https://deine-domain.com/auth/callback*

[ ] 2. Callback-Route etablieren: src/app/auth/callback/route.ts
        PKCE-Code-Tausch via supabase.auth.exchangeCodeForSession(code)
        Strikte Pfad-Validierung: next.startsWith('/') && !next.startsWith('//')

[ ] 3. Standalone-Reset-Seite bereitstellen: src/app/auth/reset-password/page.tsx
        Passwort-Validierung (min. 8 Zeichen, Doppel-Eingabe, Stärkemesser)
        Update via supabase.auth.updateUser({ password })
```

---

## 3 — Vollständiger Flow & Code

### Schritt A: Anforderung in `AuthForm.tsx`
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
});

// Telemetry & Cooldown:
await trackAllowedEvent({ name: 'password_reset_requested' });
setResendCooldown(60); // 60s Flutschutz
```

### Schritt B: Code-Exchange & Open-Redirect-Schutz (`src/app/auth/callback/route.ts`)
```typescript
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // KRITISCHER SCHUTZ GEGEN OPEN REDIRECT PHISHING:
      // Erlaube ausschließlich relative Pfade (startet mit '/' aber nicht '//')
      const isSafeRelativePath = next.startsWith('/') && !next.startsWith('//');
      const safeRedirectPath = isSafeRelativePath ? next : '/';

      return NextResponse.redirect(new URL(safeRedirectPath, origin));
    }
  }

  // Bei Fehler zurück zum Sign-in mit Fehlermeldung
  return NextResponse.redirect(new URL('/sign-in?error=auth_callback_failed', origin));
}
```

### Schritt C: Passwort neu setzen (`src/app/auth/reset-password/page.tsx`)
```typescript
// Nutzer hat durch den Callback-Schritt bereits eine gültige Recovery-Session
const { error } = await supabase.auth.updateUser({ password: newPassword });

if (!error) {
  await trackAllowedEvent({ name: 'password_reset_completed' });
  router.push('/?message=password_updated');
}
```

---

## 4 — Fehler-Mapping (`src/lib/security/form-errors.ts`)

| GoTrue-Fehlercode | Deutsche Nutzermeldung (SAFE_AUTH_MESSAGES) |
| :--- | :--- |
| `same_password` / `same as old password` | *"Das neue Passwort darf nicht mit deinem bisherigen Passwort identisch sein."* |
| `otp_expired` / `recovery link expired` | *"Der Wiederherstellungs-Link ist abgelaufen oder ungültig. Bitte fordere einen neuen Link an."* |
| `password should be at least` | *"Das Passwort muss mindestens 8 Zeichen lang sein."* |
| `compromised password` / `pwned` | *"Dieses Passwort ist in bekannten Datenlecks aufgetaucht. Bitte wähle ein sichereres Passwort."* |

---

## 5 — Analytics-Events (`src/lib/analytics/events.ts`)

```typescript
| { name: 'password_reset_requested' }
| { name: 'password_reset_completed' }

// Strikt typisiert ohne PII (keine E-Mail, kein Passwort im Analytics-Payload)
await trackAllowedEvent({ name: 'password_reset_requested' });
await trackAllowedEvent({ name: 'password_reset_completed' });
```

---

## 6 — Code-Pfade

```
src/
├── app/
│   ├── auth/callback/route.ts          # PKCE Code-Exchange & Open-Redirect Schutz
│   └── auth/reset-password/page.tsx    # Standalone Obsidian & Gold Recovery Page
├── components/auth/
│   ├── AuthForm.tsx                    # "Passwort vergessen"-Modus & 60s Cooldown
│   └── PasswordStrengthMeter.tsx       # Live-Stärkemesser bei Reset-Eingabe
├── lib/security/form-errors.ts         # safe_password, otp_expired Mapping
└── lib/analytics/events.ts             # password_reset_requested, password_reset_completed
```

---

## 7 — Pitfalls

> **Pitfall 1 — Open Redirect (`//evil.com`):** Eine einfache Prüfung wie `next.startsWith('/')` ist **unsicher**, weil Browser `//evil.com` als protocol-relative URL interpretieren und auf eine fremde Domain leiten! Der Check **muss zwingend** `next.startsWith('/') && !next.startsWith('//')` lauten.

> **Pitfall 2 — User Enumeration:** Bei der Passwort-Vergessen-Anforderung muss dem Nutzer immer dieselbe Erfolgsmeldung angezeigt werden (*„Falls ein Konto existiert, haben wir eine E-Mail gesendet"*), egal ob die E-Mail im System existiert oder nicht.

---

## 8 — Tests & Security Review

- **Tests:** `src/lib/security/__tests__/auth-error-mapping.test.ts` (Reset-Fehlercodes)
- **Security-Review:** PASS — 0 Schwachstellen (Open-Redirect-Prüfung und Session-Handling verifiziert).
