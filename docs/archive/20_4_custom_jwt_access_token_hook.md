# 20.4 — Custom JWT Access Token Hook (VIP-Claims & Rollen-Injektion)

> **Status:** 🟢 Executed (Verifiziert 2026-08-23) · **Stand:** 2026-08-23 · **Owner:** Jan + LLM · **Scope:** Erstellung und Integration eines nativen Supabase GoTrue Auth Hooks (`049_custom_access_token_hook.sql`) zur zustandslosen Injektion von VIP-Tier (`vip_tier`), Level (`vip_level`) und Rollen (`user_role`) in das JWT-Token (`app_metadata`). Inklusive Fail-Safe-Exception-Handling, TypeScript-Zod-Validierung (`src/lib/security/jwt-claims.ts`), Unit-Tests und Sicherheits-Audit. Referenz: [20_authentication.md](../../worldmap/20_authentication.md) Level 4 / Meilenstein M4.

---

## 0 — Vorab geklärte Architektur-Entscheidungen

| Frage / Aspekt | Entscheidung | Begründung |
|---|---|---|
| **Hook-Typ & Signatur** | **Postgres Auth Hook:** `public.custom_access_token_hook(event jsonb) RETURNS jsonb` | Offizieller Supabase GoTrue Standard für Custom Access Token Minting. |
| **Claim-Container** | **`claims.app_metadata`** (`vip_tier`, `vip_level`, `user_role`) | `app_metadata` ist serverseitig geschützt und kann vom Client im Gegensatz zu `user_metadata` nie manipuliert werden. |
| **Ausfallsicherheit (Fail-Safe)** | **`EXCEPTION WHEN OTHERS THEN RETURN event;`** | Falls die Datenbank unter Last steht oder ein Fehler auftritt, wird das unmodifizierte Token ausgegeben. **0 % Risiko für Login-Ausfälle.** |
| **Berechtigungsmodell** | **`SECURITY DEFINER` + expliziter `supabase_auth_admin` Grant** | GoTrue führt Hooks als `supabase_auth_admin` aus. Zugriff für `anon` und `authenticated` wird strikt entzogen (`REVOKE`). |
| **Tarif-Kompatibilität** | **100 % Supabase Free Tier** | Custom Access Token Hooks via Postgres-Funktionen sind im Free Tier ohne Zusatzkosten nutzbar. |
| **Zuständigkeit** | **Maximal LLM-getrieben (L1–L4 vollautomatisch)** | Jan führt lediglich die 1-Klick-Aktivierung im Dashboard (L0) aus. |

---

## 1 — Übersicht für Jan (Meilensteine L0–L4)

| Nummer | Meilenstein | Aufwand | Status | Nächster Schritt | Zuständigkeit |
|---|---|---|---|---|---|
| **L0** | Dashboard-Aktivierung: Auth Hook im Supabase Dashboard zuweisen | 0,25h | 🟢 Executed | ✅ Im Dashboard aktiviert (Status: ENABLED) | **Jan** |
| **L1** | SQL-Migration: `049_custom_access_token_hook.sql` | 1,0h | 🟢 Executed | ✅ Migration ausgeführt & in DB aktiv | **LLM** |
| **L2** | TypeScript & Zod-Layer: `jwt-claims.ts` & Server-Integration | 1,0h | 🟢 Executed | ✅ Zod-Schema, Typen & Helfer-Funktionen | **LLM** |
| **L3** | Security-Review: Pflicht-Audit durch Subagenten | 0,5h | 🟢 Executed | ✅ Subagent `security-reviewer` verdict PASS (0 Vulns) | **LLM (Agent)** |
| **L4** | Verifizierung: Unit-Tests, Typecheck, Build & Dokumentation | 0,75h | 🟢 Executed | ✅ 119/119 Vitest-Dateien grün, Build erfolgreich | **LLM** |
| | **Summe** | **~3,5h** | | | |

---

## 2 — Detailbereich

### L0 — Dashboard-Aktivierung
- **Ziel:** Zuweisung des Postgres Hooks im Supabase Dashboard für GoTrue Token Issuance.
- **Scope:** 
  1. Supabase Dashboard öffnen $ightarrow$ *Authentication* $ightarrow$ *Hooks*.
  2. Bei *Customize Access Token (JWT)* die Funktion `public.custom_access_token_hook` auswählen und speichern.
- **Verifizierung:** ✅ Erledigt 2026-08-23 — Hook ist live im Dashboard als `ENABLED` bestätigt.

---

### L1 — SQL-Migration: `049_custom_access_token_hook.sql`
- **Ziel:** Robuste, isolierte Postgres-Funktion zur Injektion der VIP- und Rollen-Claims in GoTrue-Events.
- **Scope:**
  1. `supabase/migrations/049_custom_access_token_hook.sql`:
     - `public.custom_access_token_hook(event jsonb) RETURNS jsonb`.
     - Liest `rank`, `level` und `role` aus `public.users` anhand von `event->>'user_id'`.
     - Injiziert `vip_tier`, `vip_level`, `user_role` in `event.claims.app_metadata`.
     - Block `EXCEPTION WHEN OTHERS THEN RETURN event;` garantiert unterbrechungsfreie Logins.
     - Berechtigungen: `GRANT EXECUTE ... TO supabase_auth_admin`, `REVOKE ... FROM PUBLIC, anon, authenticated`.
     - `GRANT SELECT ON public.users TO supabase_auth_admin`.
- **Verifizierung:** ✅ Erledigt 2026-08-23 — In Postgres ausgeführt und erfolgreich gebunden.

---

### L2 — TypeScript & Zod-Layer: `jwt-claims.ts`
- **Ziel:** Typsicherer Zugriff auf injizierte Claims ohne redundante Datenbank-Roundtrips in API-Routen.
- **Scope:**
  1. `src/lib/security/jwt-claims.ts`:
     - Zod-Schema `customJwtAppMetadataSchema` zur Validierung von `vip_tier` (`VipTierName`), `vip_level` (number) und `user_role` (`string`).
     - Helfer `getJwtClaimsFromUser(user: User | null)`: Extrahiert Claims mit typsicheren Fallbacks (`BRONZE`, Level `1`, `authenticated`).
     - Helfer `isJwtAdminUser(user: User | null)`: Schnelle Vorabprüfung auf Admin-Rolle.
- **Verifizierung:** ✅ Erledigt 2026-08-23 — Unit-Tests in `src/lib/security/__tests__/jwt-claims.test.ts` (6/6 Tests bestanden).

---

### L3 — Security-Review
- **Ziel:** Umfassender Sicherheits-Check vor Freigabe (Pflicht nach AGENTS.md).
- **Scope:** Prüfung durch Subagent `security-reviewer`.
- **Verifizierung:** ✅ Erledigt 2026-08-23 — Security-Review Report mit Urteil **PASS** (0 Critical, 0 High, 0 Medium, 0 Low).

---

### L4 — Verifizierung, CI & Dokumentation
- **Ziel:** Vollständige automatisierte Verifikation und saubere Projektdokumentation.
- **Verifizierung:** ✅ Erledigt 2026-08-23:
  - Unit-Tests: **119/119 Testdateien grün (952 Tests bestanden)**
  - Typecheck: **tsc --noEmit 0 Fehler**
  - Build: **Next.js Production Build erfolgreich (46/46 statische Routen)**
  - Dokumentation: `worldmap/20_authentication.md` synchronisiert, Plan archiviert.
