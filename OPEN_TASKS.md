# Offene Tasks — Casino Projekt

Letzte Aktualisierung: 2026-05-15

---

## 🔴 MANUELL ERFORDERLICH (nicht automatisierbar)

### 1. Supabase Migrations einspielen
**Priorität**: P0 — ohne das funktioniert der WalletService nicht  
**Wo**: Supabase Dashboard → SQL Editor  
**Reihenfolge**:
1. `supabase/migrations/001_users.sql`
2. `supabase/migrations/002_wallet.sql`
3. `supabase/migrations/003_provably_fair.sql`

Alternativ per CLI:
```bash
supabase migration up
```

### 2. Clerk JWT Template "supabase" einrichten
**Priorität**: P0 — RLS-Policies greifen sonst nicht  
**Wo**: Clerk Dashboard → JWT Templates → "supabase" Template erstellen  
**Was**: Clerk muss `sub` = Clerk User ID in den JWT einbetten, damit Supabase `auth.jwt() ->> 'sub'` auflösen kann.  
**Docs**: https://clerk.com/docs/integrations/databases/supabase

### 3. Environment Variables prüfen
**Priorität**: P0  
**Wo**: `.env.local` im Casino-Ordner  
Folgende müssen gesetzt sein:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CLERK_WEBHOOK_SECRET=
```

### 4. Clerk Webhook in Production eintragen
**Priorität**: P1  
**Wo**: Clerk Dashboard → Webhooks  
**Was**: Webhook-URL auf `/api/webhooks/clerk` setzen, damit neue User automatisch in Supabase `users` angelegt werden.

---

## 🟡 TECHNISCHE SCHULDEN (bereits bekannt, noch offen)

### 5. Provably Fair Server-Side
**Priorität**: P1  
`ProvablyFairEngine.generateServerSeed()` läuft aktuell client-seitig — Server Seeds sind nicht geheim.  
Lösung: Seeds serverseitig in `seeds`-Tabelle generieren und nur den Hash ans Frontend schicken.

### 6. Auth-Enforcement auf allen Routen
**Priorität**: P1  
Aktuell sind Games, Vault, Leaderboard, Admin als public in `middleware.ts` deklariert.  
Prüfen welche Routen wirklich public sein dürfen.

### 7. Rate Limiting aktivieren
**Priorität**: P1  
Upstash Redis ist bereits als Dependency vorhanden (`@upstash/ratelimit`, `@upstash/redis`).  
Environment Variables setzen:
```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### 8. casino-platform Ordner archivieren/löschen
**Priorität**: P2  
Der Ordner `D:\ZZ - VibeCoding\casino-platform` ist nach der Migration obsolet.  
Alle wertvollen Elemente wurden in `Casino` übernommen.  
→ Manuell löschen wenn alles geprüft ist.

---

## ✅ ERLEDIGT

- [x] Supabase Migrations erstellt (001, 002, 003)
- [x] WalletService auf echtes Supabase umgestellt (kein mockBalances mehr)
- [x] RLS-Policies auf allen Tabellen definiert
- [x] JAN100 Voucher-Placeholder entfernt
- [x] TypeScript-Fehler in Chip.tsx und vault/page.tsx behoben
- [x] CLAUDE.md aktualisiert mit DB-Architektur
- [x] casino-platform Dateistruktur in Casino überführt
