# 00B — Basis-Authentifizierung: E-Mail/Passwort & Google OAuth

> **Typ:** Fundament & Basis-Layer · **Status:** 🟢 Produktionsreif · **Stand:** 2026-08-27  
> **Back:** [`00_AUTH_OVERVIEW.md`](00_AUTH_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & wann brauche ich das?

Das Basis-Fundament, auf dem alle 9 erweiterten Sicherheitsstufen aufbauen:
1. **Klassische E-Mail- & Passwort-Authentifizierung:** Registrierung (`signUp`) und Anmeldung (`signInWithPassword`) mit serverseitiger Kennwort-Verschlüsselung (Bcrypt) in Supabase GoTrue.
2. **Social OAuth (Google Login):** 1-Klick-Anmeldung über das Google-Konto via OAuth 2.0 PKCE-Flow.

---

## 2 — Neue-Projekt-Checkliste (3 Schritte)

```
[ ] 1. Supabase Dashboard → Authentication → Providers:
        - Email: ON
        - Google: ON (Client ID & Client Secret aus Google Cloud Console hinterlegen)
        - Authorized Redirect URI in Google Console: https://<project-ref>.supabase.co/auth/v1/callback

[ ] 2. Next.js AuthForm.tsx mit Tab-Umschalter (Anmelden / Registrieren)
[ ] 3. PKCE Callback-Route in src/app/auth/callback/route.ts
```

---

## 3 — Code-Snippets (GoTrue Core Flows)

### E-Mail & Passwort Login / Registrierung
```typescript
// 1. Registrieren
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
  },
});

// 2. Anmelden
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

### Google OAuth Flow
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback?next=/`,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
});
```

---

## 4 — Fehler-Mapping & Feedback

| GoTrue-Fehler | Deutsche Meldung |
| :--- | :--- |
| `invalid_credentials` / `invalid login credentials` | *"Ungültige Anmeldedaten. Bitte überprüfe deine E-Mail-Adresse und dein Passwort."* |
| `user already registered` | *"Ein Konto mit dieser E-Mail-Adresse existiert bereits. Bitte melde dich an."* |
| `email not confirmed` | *"Deine E-Mail-Adresse wurde noch nicht bestätigt. Bitte prüfe dein Postfach."* |

---

## 5 — Pitfalls

> **Pitfall 1 — Google OAuth Redirect URI Mismatch:** In der Google Cloud Console muss exakt die Supabase-Callback-URL (`https://<project-ref>.supabase.co/auth/v1/callback`) als autorisierter Weiterleitungs-URI hinterlegt sein — nicht die Vercel-Domain!

> **Pitfall 2 — User Enumeration:** Bei der Registrierung meldet GoTrue bei existierender E-Mail standardmäßig einen Fehler. Für sensible Apps sollte `confirm email` aktiviert sein, um E-Mail-Enumeration zu verhindern.
