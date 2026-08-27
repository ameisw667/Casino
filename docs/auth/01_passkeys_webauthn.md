# 01 — WebAuthn Passkeys (FIDO2 / Biometrie-Login)

> **Säule:** 1 von 9 · **Status:** 🟢 Produktionsreif · **Stand:** 2026-08-27
> **Archiv-Quelle:** `docs/archive/07_PASSKEY_LOGIN.md` · **Back:** [`00_AUTH_OVERVIEW.md`](00_AUTH_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & wann brauche ich das?

Passkeys ersetzen Passwörter durch kryptografische Schlüsselpaare, die im Hardware-Chip des Geräts liegen (Apple Secure Enclave, Windows TPM, Android Keystore). Der private Schlüssel verlässt **nie** das Gerät.

**Warum phishing-resistent?** Die Challenge wird ausschließlich für die exakte RP-ID signiert. Eine gefälschte Domain scheitert zwingend — der Authenticator verweigert die Signatur, weil die Origin nicht mit der hinterlegten RP-ID übereinstimmt.

**Wann im nächsten Projekt einbauen?** Erst nachdem der Standard-Login (E-Mail/Passwort + Google OAuth) stabil in Produktion läuft. Passkeys sind ein Add-on, kein Ersatz. Die RP-ID muss auf eine stabile Domain zeigen.

---

## 2 — Neue-Projekt-Checkliste (3 Schritte, kein Coding)

```
[ ] 1. Supabase Dashboard → Authentication → Sign In Methods → Passkeys aktivieren
        RP Display Name:  "Dein Projektname"
        RP ID:            "deine-produktions-domain.com"   ← KEINE localhost!
        RP Origins:       "https://deine-produktions-domain.com"

[ ] 2. Browser-Client opt-in (src/utils/supabase/client.ts):
        createBrowserClient(url, key, {
          auth: { experimental: { passkey: true } }
        })

[ ] 3. Feature-Detection-Guard im Login-Button:
        Nur anzeigen wenn: typeof window !== 'undefined'
                           && !!window.PublicKeyCredential
```

> **Keine DB-Migration nötig.** GoTrue verwaltet `auth.webauthn_credentials` vollständig intern.

---

## 3 — Projekt-Konfiguration (Produktionswerte)

| Parameter | Wert in diesem Projekt |
| :--- | :--- |
| **RP Display Name** | `Casino Royale` |
| **RP ID** | `casino-xi-six.vercel.app` |
| **RP Origins** | `https://casino-xi-six.vercel.app` |
| **SDK** | `@supabase/supabase-js` 2.108.2+ |

**Vollständige `src/utils/supabase/client.ts`:**
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      console.warn('[Supabase Client] Missing env variables.');
    }
  }

  return createBrowserClient(url || '', anonKey || '', {
    auth: {
      experimental: {
        passkey: true,  // ← Passkey opt-in — nur im BROWSER-Client, nie im Server-Client!
      },
    },
  });
}
```

---

## 4 — Fehler-Mapping (`src/lib/security/form-errors.ts`)

Alle WebAuthn-Fehler laufen durch `mapAuthError()`. Die Funktion normalisiert Browser-Fehlercodes auf sichere deutsche Nutzertexte:

| Browser-Error / GoTrue-Code | Deutsche Nutzermeldung (SAFE_AUTH_MESSAGES) |
| :--- | :--- |
| `NotAllowedError` / user cancelled / timed out | *"Die Passkey-Anmeldung wurde abgebrochen oder ist abgelaufen. Bitte versuche es erneut oder nutze dein Passwort."* |
| `NotSupportedError` / webauthn not supported | *"Passkeys werden von diesem Browser oder Gerät nicht unterstützt. Bitte nutze dein Passwort."* |
| `SecurityError` / rp id / origin mismatch | *"Sicherheitsfehler bei der Passkey-Verifikation. Bitte überprüfe die Domain oder nutze dein Passwort."* |
| `InvalidStateError` / already registered | *"Dieser Passkey ist auf diesem Gerät bereits registriert oder ungültig."* |
| passkey not found / no credentials | *"Kein passender Passkey auf diesem Gerät gefunden. Bitte melde dich mit deinem Passwort an."* |

```typescript
// Verwendung in AuthForm.tsx:
import { formatAuthError } from '@/lib/security/form-errors';

try {
  await supabase.auth.signInWithPasskey();
  await trackAllowedEvent({ name: 'passkey_sign_in_completed' });
} catch (err) {
  const message = formatAuthError(err instanceof Error ? err.message : String(err));
  setError(message); // → automatisch lokalisierter, sicherer Text
}
```

---

## 5 — Analytics-Events (`src/lib/analytics/events.ts`)

```typescript
// Zod-Allowlist (strictObject — extra Properties werden zur Laufzeit rejected)
| { name: 'passkey_sign_in_completed' }
| { name: 'passkey_registered' }

// Aufruf:
import { trackAllowedEvent } from '@/lib/analytics/events';
await trackAllowedEvent({ name: 'passkey_sign_in_completed' });
await trackAllowedEvent({ name: 'passkey_registered' });
```

**Sicherheits-Invariante Analytics:** Events sind bewusst property-los. `z.strictObject` verwirft Events mit zusätzlichen Feldern silently — verhindert versehentlichen PII-Versand (z. B. `{ name: 'passkey_registered', userId: '...' }` wird rejected).

---

## 6 — Code-Pfade (vollständig)

```
src/
├── utils/supabase/client.ts               # Browser-Client mit experimental.passkey: true
├── components/auth/AuthForm.tsx           # handlePasskeySignIn() + Feature-Detection-Guard
├── components/casino/
│   ├── PasskeyManagementSection.tsx       # list / register / delete Passkeys
│   └── SettingsModal.tsx                  # Tab "Sicherheit" — Einbettung
├── lib/security/form-errors.ts            # mapAuthError() — vollständiges Fehler-Mapping
└── lib/analytics/events.ts               # passkey_sign_in_completed, passkey_registered
```

---

## 7 — Sicherheits-Invarianten

1. **Fallback-Pflicht:** Passwort- und Google-Login bleiben immer aktiv — kein Passkey-only-Lock-in.
2. **Keine Secrets im Client:** GoTrue speichert `auth.webauthn_credentials` serverseitig. Client empfängt nur `{ id, friendly_name, created_at }`.
3. **SSR-Trennung:** `experimental: { passkey: true }` ausschließlich im Browser-Client (createBrowserClient). Server-Client darf diese Option nie erhalten.

---

## 8 — Pitfalls (verhindert Stunden an Debugging)

> **Pitfall 1 — Localhost (häufigster Fehler):** Passkeys funktionieren niemals auf localhost. RP-ID muss exakt mit der HTTP-Origin übereinstimmen. Nur in Staging/Produktion testen. Lokal den Passkey-Button ausblenden.

> **Pitfall 2 — Domain-Umzug:** Alle bestehenden Passkeys werden ungültig wenn die Domain wechselt. Die RP-ID ändert sich → GoTrue kann Challenges nicht mehr verifizieren. Nutzer müssen Passkeys neu registrieren.

> **Pitfall 3 — Server-Client opt-in:** `experimental: { passkey: true }` im Server-Client (z. B. in proxy.ts/Middleware) → `ReferenceError: PublicKeyCredential is not defined` im Node.js-Prozess zur Laufzeit.

---

## 9 — Tests

- `src/lib/security/__tests__/passkey-auth.test.ts` — 5/5 Tests (GoTrue-Integration, Fehlercode-Mapping)
- `src/lib/security/__tests__/auth-error-mapping.test.ts` — 13/13 Tests (alle WebAuthn-Codes)
- **Security-Review:** PASS — 0 Critical, 0 High, 0 Medium — autonomer `security-reviewer`-Agent
- **Rollback:** Reversibel ohne DB-Migration — Flag entfernen + UI ausblenden
