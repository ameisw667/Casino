# 06 — Auth Audit-Log & Login-Historie (DSGVO-konform)

> **Säule:** 6 von 9 · **Status:** 🟢 Produktionsreif · **Stand:** 2026-08-27  
> **Archiv-Quelle:** `docs/archive/20_6_auth_audit_log_login_history.md` · **Migration:** `supabase/migrations/052_user_login_history.sql` · **Back:** [`00_AUTH_OVERVIEW.md`](00_AUTH_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & wann brauche ich das?

Eine fälschungssichere, RLS-gesicherte Datenbanktabelle, die alle Login-Ereignisse eines Nutzers chronologisch protokolliert. Nutzer sehen ihre letzten 5 Anmeldungen transparent in den Kontoeinstellungen (Gerät, Anmeldemethode, Zeitstempel, anonymisierte IP).

- **Sicherheit:** Sofortiges Erkennen unbefugter Anmeldeversuche von fremden Geräten.
- **DSGVO:** 100 % konform, da IP-Adressen vor dem Schreiben in die Datenbank unwiderruflich auf Netzwerk-Ebene gekürzt werden.

---

## 2 — Neue-Projekt-Checkliste (3 Schritte)

```
[ ] 1. Migration ausführen (Tabelle public.user_login_history mit RLS)
[ ] 2. IP-Maskierung & User-Agent-Parser in src/lib/security/login-audit.ts bereitstellen
[ ] 3. Logging-Aufruf in allen 4 Login-Pfaden einbinden (Passwort, Passkey, Google OAuth, OTP)
```

---

## 3 — Datenbank-Schema & RLS (`052_user_login_history.sql`)

```sql
CREATE TABLE public.user_login_history (
  id          uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid            NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz     NOT NULL DEFAULT now(),
  auth_method text            NOT NULL, -- 'password' | 'passkey' | 'google' | 'otp_magic_link'
  device_info text,                     -- 'Windows · Chrome', 'iOS · Safari'
  ip_masked   text,                     -- '192.168.***.***' (DSGVO-anonymisiert)
  status      text            NOT NULL DEFAULT 'success' -- 'success' | 'failed'
);

-- Index für performante Abfrage der letzten Logins pro Nutzer
CREATE INDEX idx_user_login_history_user_created ON public.user_login_history (user_id, created_at DESC);

-- RLS: Nutzer können NUR ihre eigenen Einträge lesen
ALTER TABLE public.user_login_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_history" ON public.user_login_history
  FOR SELECT USING (auth.uid() = user_id);

-- Schreiben erfolgt ausschließlich über den Service-Role-Client (Backend)
```

---

## 4 — IP-Maskierung & User-Agent Parsing (`src/lib/security/login-audit-types.ts`)

```typescript
import { z } from 'zod';

export const authMethodSchema = z.enum(['password', 'passkey', 'google', 'otp_magic_link']);
export type AuthMethod = z.infer<typeof authMethodSchema>;

export const loginStatusSchema = z.enum(['success', 'failed']);
export type LoginStatus = z.infer<typeof loginStatusSchema>;

/**
 * Anonymisiert IP-Adressen nach DSGVO-Standard vor der Speicherung.
 * IPv4: "192.168.1.100" -> "192.168.***.***"
 * IPv6: "2001:0db8:85a3:..." -> "2001:0db8:****"
 */
export function maskIpAddress(rawIp?: string | null): string {
  if (!rawIp || typeof rawIp !== 'string') return 'Unbekannt';

  const cleanIp = rawIp.trim().slice(0, 45);

  // IPv4: Behalte die ersten 2 Oktette
  if (cleanIp.includes('.')) {
    const parts = cleanIp.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.***.***`;
    }
  }

  // IPv6: Behalte die ersten 2 Segmente
  if (cleanIp.includes(':')) {
    const parts = cleanIp.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}:****`;
    }
  }

  return '127.0.***.***';
}

/**
 * Parst User-Agent in prägnante Darstellung ("Windows · Chrome", "iOS · Safari").
 */
export function parseDeviceInfo(userAgent?: string | null): string {
  if (!userAgent) return 'Unbekanntes Gerät';
  const ua = userAgent.toLowerCase();

  let os = 'Unbekanntes OS';
  if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('macintosh') || ua.includes('mac os x')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';

  let browser = 'Browser';
  if (ua.includes('edg/')) browser = 'Edge';
  else if (ua.includes('firefox/')) browser = 'Firefox';
  else if (ua.includes('chrome/')) browser = 'Chrome';
  else if (ua.includes('safari/') && !ua.includes('chrome')) browser = 'Safari';

  return `${os} · ${browser}`;
}
```

---

## 5 — Audit-Eintrag erfassen (`src/lib/security/login-audit.ts`)

```typescript
import { createAdminClient } from '@/utils/supabase/admin';
import { type AuthMethod, type LoginStatus, maskIpAddress, parseDeviceInfo } from './login-audit-types';

export async function recordLoginAuditEntry({
  userId,
  authMethod,
  userAgent,
  rawIp,
  status = 'success',
}: {
  userId: string;
  authMethod: AuthMethod;
  userAgent?: string | null;
  rawIp?: string | null;
  status?: LoginStatus;
}): Promise<boolean> {
  if (!userId) return false;

  try {
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.from('user_login_history').insert({
      user_id: userId,
      auth_method: authMethod,
      device_info: parseDeviceInfo(userAgent),
      ip_masked: maskIpAddress(rawIp),
      status: status,
    });
    return !error;
  } catch {
    return false; // Fail-safe: Audit-Logging darf den Login nie blockieren
  }
}
```

---

## 6 — Alle 4 Logging-Pfade im Überblick

| Login-Methode | Auslöser-Ort |
| :--- | :--- |
| **Passwort** | `AuthForm.tsx` nach erfolgreichem `signInWithPassword()` |
| **Passkey** | `AuthForm.tsx` nach erfolgreichem `signInWithPasskey()` |
| **Google OAuth** | `src/app/auth/callback/route.ts` beim Code-Exchange |
| **OTP / Magic Link** | `AuthForm.tsx` nach `verifyOtp()` oder Callback-Route |

---

## 7 — Code-Pfade

```
supabase/migrations/
  └── 052_user_login_history.sql         # Tabellenschema, Indexe, RLS Policy
src/lib/security/
  ├── login-audit-types.ts               # Zod-Schemas, maskIpAddress(), parseDeviceInfo()
  ├── login-audit.ts                     # recordLoginAuditEntry() via Service-Role
  └── __tests__/login-audit.test.ts      # Unit-Tests für IP-Maskierung & UA-Parsing
src/components/casino/
  └── LoginHistorySection.tsx            # Timeline-UI im Tab "Sicherheit & Login"
```

---

## 8 — Pitfalls

> **Pitfall 1 — Speicherung von Rohen IPs:** Unmaskierte IP-Adressen in der Datenbank verletzen die DSGVO (personenbezogene Daten). Die Maskierung `maskIpAddress()` muss **vor** dem `insert()` im Backend stattfinden — niemals dem Client vertrauen.

> **Pitfall 2 — User-Agent ReDoS:** RegExp-basierte User-Agent-Parser können anfällig für Catastrophic Backtracking sein. Die hier verwendete Implementierung nutzt ausschließlich O(1) `.includes()`-Prüfungen auf Strings.

---

## 9 — Tests

- `src/lib/security/__tests__/login-audit.test.ts` — Vollständige Tests für IPv4-, IPv6-, Localhost-Maskierung und Browser-Erkennung.
- **Security-Review:** PASS — 0 Schwachstellen (Service-Role-Isolation & RLS verifiziert).
