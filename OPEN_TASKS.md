# Offene Tasks — Casino Projekt

Letzte Aktualisierung: 2026-08-08

---

## 🔴 MANUELL ERFORDERLICH (nicht automatisierbar)

### 1. Supabase Migrations einspielen
**Priorität**: P0 — ohne das funktioniert der WalletService nicht
**Status**: Migrationen 001-009 sind lokal vorhanden; Remote-Stand wurde am 2026-08-07 stichprobenartig live verifiziert (Tabellen `users`, `wallet_transactions`, `game_configs`, `vip_tiers`, `game_rounds` sowie die RPC `settle_game_bet` existieren remote mit korrekten Berechtigungen) — siehe [worldmap/04_WALLET_ECONOMY.md](worldmap/04_WALLET_ECONOMY.md). Ein vollständiger Verifikationslauf gegen alle 9 Migrationen steht noch aus.
**Wo**: Supabase Dashboard → SQL Editor, oder `supabase db push`
**Reihenfolge**:
1. `supabase/migrations/001_users.sql`
2. `supabase/migrations/002_wallet.sql`
3. `supabase/migrations/003_provably_fair.sql`
4. `supabase/migrations/004_vip_tiers.sql`
5. `supabase/migrations/005_anonymous_sessions.sql`
6. `supabase/migrations/006_game_configs.sql`
7. `supabase/migrations/007_server_authority.sql`
8. `supabase/migrations/008_supabase_auth_bridge.sql`
9. `supabase/migrations/009_meta_features.sql`

Alternativ per CLI:
```bash
supabase migration up
```

### 2. ~~Clerk JWT Template "supabase" einrichten~~ — obsolet
Clerk ist seit der Auth-Migration komplett entfernt (siehe [02_CLERK_SUPABASE.md](02_CLERK_SUPABASE.md)). Kein JWT-Template mehr nötig — die App nutzt native Supabase Auth.

### 3. Environment Variables prüfen
**Priorität**: P0
**Wo**: `.env.local` im Casino-Ordner
**Status**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` und `SUPABASE_ADMIN_EMAILS` sind gesetzt (verifiziert). `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` fehlen weiterhin — siehe Punkt 7.
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ADMIN_EMAILS=
```

### 4. ~~Clerk Webhook in Production eintragen~~ — obsolet
`/api/webhooks/clerk` ist stillgelegt (410 Gone). User-Provisioning läuft seit Migration `008_supabase_auth_bridge.sql` über einen nativen `auth.users`-Trigger, kein Webhook mehr nötig.

---

## 🟡 TECHNISCHE SCHULDEN (bereits bekannt, noch offen)

### 5. ~~Provably Fair Server-Side~~ — korrigiert, kein offener Punkt mehr
**Ursprüngliche Behauptung war veraltet/falsch:** `ProvablyFairEngine.generateServerSeed()` läuft **nicht** client-seitig. Verifiziert per Grep: Aufgerufen wird sie ausschließlich serverseitig in `casino-core.ts:71,188` und `blackjack/route.ts:82`, jeweils nur erreichbar über die API-Routen. Die client-seitigen `CasinoCore`-Aufrufe in `RouletteBoard.tsx`/`RouletteClient.tsx` nutzen nachweislich nur `isRouletteWin()`/`getRouletteMultiplier()` (reine Anzeige-Mathematik fürs Hover-Highlighting), keine RNG- oder Settlement-Funktion. Offen bleibt laut [worldmap/03_ENGINE_FAIRNESS.md] (noch nicht erstellt) ein vollständiges Commit-Reveal-Schema — das ist ein separater, echter Punkt in Kategorie 03, nicht identisch mit der hier ursprünglich behaupteten Client-Side-Seed-Lücke.

### 6. Auth-Enforcement auf allen Routen
**Priorität**: P1
Aktuell sind Games, Vault, Leaderboard, Admin als public in `proxy.ts` (vormals `middleware.ts`, umbenannt im Zuge der Next.js-16-Migration) deklariert.
Prüfen welche Routen wirklich public sein dürfen.

### 7. Rate Limiting aktivieren
**Priorität**: P1
Upstash Redis ist bereits als Dependency vorhanden (`@upstash/ratelimit`, `@upstash/redis`). Weiterhin nicht konfiguriert — Production reagiert an kritischen Grenzen bewusst fail-closed mit 503.
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

- [x] Supabase Migrations 001-009 lokal erstellt (Stand 2026-08-08, war zuvor nur 001-003 dokumentiert)
- [x] WalletService auf echtes Supabase umgestellt (kein mockBalances mehr)
- [x] WalletService auf server-autoritatives, idempotentes Modell umgebaut (Migration 007: Advisory Locks, Request-ID-Idempotenz, `game_rounds`)
- [x] RLS-Policies auf allen Tabellen definiert (Hinweis: werden von der App aktuell nicht aktiv geprüft, da `WalletService` durchgängig den Service-Role-Client nutzt und RLS damit architekturbedingt umgeht — siehe [02_CLERK_SUPABASE.md](02_CLERK_SUPABASE.md))
- [x] JAN100 Voucher-Placeholder entfernt
- [x] TypeScript-Fehler in Chip.tsx und vault/page.tsx behoben
- [x] CLAUDE.md aktualisiert mit DB-Architektur
- [x] casino-platform Dateistruktur in Casino überführt
- [x] Clerk komplett entfernt, native Supabase Auth (siehe [02_CLERK_SUPABASE.md](02_CLERK_SUPABASE.md))
- [x] `middleware.ts` → `proxy.ts` umbenannt (Next.js 16 Konvention)
- [x] Zwei dokumentierte `wallet.ts`-Bugs behoben (Transaction-Lookup-Fehler wird jetzt geworfen; `settleRound()` mapped „Insufficient" konsistent) — siehe [worldmap/04_WALLET_ECONOMY.md](worldmap/04_WALLET_ECONOMY.md)
