# 04 — Custom Postgres JWT Access Token Hook (VIP-Claims)

> **Säule:** 4 von 9 · **Status:** 🟢 Produktionsreif · **Stand:** 2026-08-27  
> **Archiv-Quelle:** `docs/archive/20_4_custom_jwt_access_token_hook.md` · **Migration:** `supabase/migrations/049_custom_access_token_hook.sql` · **Back:** [`00_AUTH_OVERVIEW.md`](00_AUTH_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & wann brauche ich das?

Ein nativer Postgres Auth Hook, der bei jeder Ausstellung eines JWT-Tokens (Login / Token-Refresh) benutzerdefinierte Daten aus der Datenbank direkt in das Token (`claims.app_metadata`) einbettet.

- **Vorteil:** API-Routen, Server-Komponenten und Middleware kennen den VIP-Rang, das Level und die Rolle des Nutzers sofort aus dem Token, ohne bei jedem einzelnen HTTP-Request eine zusätzliche Datenbank-Abfrage (`SELECT rank FROM users`) durchführen zu müssen (**0 ms Datenbank-Latenz**).
- **Sicherheit:** `app_metadata` ist serverseitig geschützt — der Client kann diese Werte niemals manipulieren.

**Wann im nächsten Projekt einbauen?** Sobald Rollen (z. B. `admin`, `moderator`) oder VIP-Stufen existieren, die in API-Routen häufig geprüft werden.

---

## 2 — Neue-Projekt-Checkliste (3 Schritte)

```
[ ] 1. Migration ausführen (siehe SQL in Abschnitt 3):
        - Funktion public.custom_access_token_hook(event jsonb) erstellen
        - Berechtigungen: REVOKE FROM public, anon, authenticated; GRANT TO supabase_auth_admin
        - SELECT auf users-Tabelle an supabase_auth_admin gewähren

[ ] 2. Supabase Dashboard → Authentication → Hooks:
        "Customize Access Token (JWT)" aktivieren → Hook: public.custom_access_token_hook

[ ] 3. TypeScript Zod-Parser & Helper in src/lib/security/jwt-claims.ts einbinden (Abschnitt 4)
```

---

## 3 — Vollständige SQL-Definition (`049_custom_access_token_hook.sql`)

```sql
-- 1. Funktion mit SECURITY DEFINER und explizitem search_path erstellen
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_rec record;
  claims jsonb;
BEGIN
  -- Daten des Nutzers abfragen
  SELECT rank, level, role
  INTO user_rec
  FROM public.users
  WHERE id = (event->>'user_id')::uuid;

  claims := event->'claims';

  -- Claims in app_metadata injizieren (Client-geschützt)
  claims := jsonb_set(claims, '{app_metadata,vip_tier}', to_jsonb(COALESCE(user_rec.rank, 'bronze')));
  claims := jsonb_set(claims, '{app_metadata,vip_level}', to_jsonb(COALESCE(user_rec.level, 0)));
  claims := jsonb_set(claims, '{app_metadata,user_role}', to_jsonb(COALESCE(user_rec.role, 'user')));

  -- Modifiziertes Event zurückgeben
  RETURN jsonb_set(event, '{claims}', claims);
EXCEPTION WHEN OTHERS THEN
  -- KRITISCHER FAIL-SAFE: Login niemals durch einen Hook-Fehler blockieren!
  RETURN event;
END;
$$;

-- 2. Strikte Berechtigungen (Minimale Angriffsfläche)
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
GRANT SELECT ON public.users TO supabase_auth_admin;
```

---

## 4 — TypeScript Zod-Layer (`src/lib/security/jwt-claims.ts`)

```typescript
import { z } from 'zod';
import type { User } from '@supabase/supabase-js';

export const VIP_TIER_NAMES = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'] as const;
export type VipTierName = (typeof VIP_TIER_NAMES)[number];

export const customJwtAppMetadataSchema = z.object({
  vip_tier: z
    .unknown()
    .transform((val) => {
      if (typeof val !== 'string') return 'BRONZE';
      const upper = val.toUpperCase();
      return (VIP_TIER_NAMES as readonly string[]).includes(upper) ? (upper as VipTierName) : 'BRONZE';
    })
    .default('BRONZE'),
  vip_level: z
    .unknown()
    .transform((val) => {
      const num = typeof val === 'number' ? val : Number(val);
      return Number.isInteger(num) && num >= 1 ? num : 1;
    })
    .default(1),
  user_role: z
    .unknown()
    .transform((val) => (typeof val === 'string' && val.trim().length > 0 ? val.trim() : 'authenticated'))
    .default('authenticated'),
});

export interface ExtractedJwtClaims {
  vipTier: VipTierName;
  vipLevel: number;
  userRole: string;
  isAdmin: boolean;
}

export function getJwtClaimsFromUser(user: User | null | undefined): ExtractedJwtClaims {
  if (!user) {
    return { vipTier: 'BRONZE', vipLevel: 1, userRole: 'anonymous', isAdmin: false };
  }

  const rawAppMetadata = user.app_metadata ?? {};
  const parsed = customJwtAppMetadataSchema.safeParse(rawAppMetadata);

  const vipTier: VipTierName = parsed.success ? (parsed.data.vip_tier as VipTierName) : 'BRONZE';
  const vipLevel = parsed.success ? parsed.data.vip_level : 1;
  const userRole = parsed.success ? parsed.data.user_role : 'authenticated';
  const isAdmin = userRole.toLowerCase() === 'admin';

  return { vipTier, vipLevel, userRole, isAdmin };
}
```

---

## 5 — Code-Pfade

```
supabase/migrations/
  └── 049_custom_access_token_hook.sql   # Postgres Auth Hook Funktion & Grants
src/lib/security/
  ├── jwt-claims.ts                      # Zod-Schema & getJwtClaimsFromUser()
  └── __tests__/jwt-claims.test.ts       # 100 % Unit-Testabdeckung
```

---

## 6 — Sicherheits-Invarianten

1. **`app_metadata` vs. `user_metadata`:** Benutzerdefinierte Claims gehören **ausschließlich** in `claims.app_metadata`. `user_metadata` kann vom Nutzer über `supabase.auth.updateUser()` selbst überschrieben werden!
2. **Fail-Safe Exception Block:** Der Block `EXCEPTION WHEN OTHERS THEN RETURN event;` stellt sicher, dass selbst bei einem Datenbankfehler (z. B. Spalte fehlt temporär) der Login-Flow für den Nutzer niemals blockiert wird.
3. **Explicit Permissions:** Die Funktion darf nur für `supabase_auth_admin` ausführbar sein. `PUBLIC`, `anon` und `authenticated` müssen entzogen werden.

---

## 7 — Pitfalls

> **Pitfall 1 (Showstopper):** Fehlender `GRANT SELECT ON public.users TO supabase_auth_admin`. Wenn dieser Grant fehlt, schlägt die SELECT-Abfrage im Hook fehl. Dank des Exception-Blocks funktioniert der Login zwar weiter, aber die Claims fehlen stillschweigend!

> **Pitfall 2 (Token-Aktualität):** Wenn ein Admin in der Datenbank das VIP-Level ändert, sieht der Nutzer die Änderung erst bei der nächsten Token-Erneuerung (nach max. 60 Minuten oder nach Logout/Login). Für sofortige Status-Änderungen muss ein explizites `supabase.auth.refreshSession()` getriggert werden.

---

## 8 — Tests & Verifikation

- `src/lib/security/__tests__/jwt-claims.test.ts` — Vollständige Tests für Normalisierung, Fallback-Werte und Admin-Rollen-Erkennung.
- **Security-Review:** PASS — 0 Schwachstellen (autonomer `security-reviewer`-Agent).
