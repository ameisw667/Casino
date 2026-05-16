# Supabase-Datenbankarchitektur Migration

**Quelle**: `casino-platform` Baseline-Repo  
**Ziel**: `Casino` Hauptprojekt  
**Datum**: 2026-05-15  
**Status**: Abgeschlossen ✅ (2026-05-15)

---

## Ausgangssituation

### Was Casino bereits hat (gut)
- Supabase SDK installiert (`@supabase/supabase-js`, `@supabase/ssr`)
- `src/utils/supabase/admin.ts` — Admin-Client (bypasses RLS, für Webhooks)
- `src/utils/supabase/server.ts` — Server-Client mit Clerk-JWT-Injektion
- `src/utils/supabase/client.ts` — Client-Hook mit Clerk-JWT
- `database/schema.sql` — Schema-Vision (users, seeds, bets, stored procedures)
- Clerk-Webhook (`/api/webhooks/clerk`) erstellt User bereits in Supabase `users`-Tabelle

### Was Casino FEHLT (das ist der Kern dieser Migration)
- `supabase/migrations/` — versionierte Migrations (NICHT vorhanden)
- **Row Level Security (RLS)** auf allen Tabellen — FEHLT komplett
- `wallet_transactions` — Audit-Trail für alle Wallet-Bewegungen — FEHLT
- `game_sessions` — Session-Statistiken — FEHLT
- **WalletService nutzt `mockBalances` (In-Memory)** — resets bei jedem Server-Neustart
- `wallet_transactions`-Tabelle für lückenlose Buchungshistorie — FEHLT

### Was casino-platform hat (das übernehmen wir)
- Saubere Migration-Struktur mit sequenziellen Nummern
- RLS auf jeder Tabelle (User sehen nur eigene Daten)
- `wallet_transactions` mit signiertem `amount` + `metadata JSONB`
- `game_sessions` für Stats/History
- Indizes auf allen kritischen Query-Pfaden

---

## Kritischer Unterschied: User-ID-Schema

| Projekt | User-ID-Typ | FK-Referenz |
|---------|-------------|-------------|
| casino-platform | UUID | `auth.users(id)` (Supabase Auth) |
| Casino | TEXT (`user_xxx`) | `users(id)` (Clerk ID) |

**Konsequenz**: Migrations aus casino-platform können nicht 1:1 kopiert werden — FKs müssen auf `users(id) TEXT` zeigen, nicht auf `auth.users(id)`.

**Konsequenz für RLS**: `auth.uid()` funktioniert NICHT (Supabase Auth). Stattdessen:
```sql
USING ((auth.jwt() ->> 'sub') = user_id)
```
Der Clerk-JWT enthält `sub` = Clerk User ID, injiziert via `getToken({ template: 'supabase' })`.

---

## Implementierungs-Checkliste

### Phase 1: Migrations-Struktur anlegen
- [x] `Casino/supabase/migrations/` Ordner erstellen
- [x] `001_users.sql` — users-Tabelle mit Clerk-ID + RLS
- [x] `002_wallet.sql` — wallets + wallet_transactions + game_sessions + RLS
- [x] `003_provably_fair.sql` — seeds-Tabelle + place_bet / settle_bet Stored Procedures

### Phase 2: WalletService auf Supabase umstellen
- [x] `src/lib/casino/wallet.ts` — mockBalances durch echte Supabase-Calls ersetzen
- [x] Admin-Client verwenden (bypasses RLS, sicher auf Server-Side)
- [x] `place_bet` Stored Procedure nutzen (atomares Debit)
- [x] `settle_bet` Stored Procedure nutzen (atomares Credit + XP)
- [x] `wallet_transactions` nach jedem Bet/Win schreiben

### Phase 3: Sicherheits-Cleanup
- [x] Vault-Seite: Placeholder `"Enter code (e.g. JAN100)"` entfernen

### Phase 4: CLAUDE.md aktualisieren
- [x] Architektur-Abschnitt aktualisieren: WalletService ist jetzt Supabase-backed
- [x] Migration-Workflow dokumentieren
- [x] Verweis auf casino-platform als archiviert

---

## Migration-Architektur (Ziel-Zustand)

```
Casino/
└── supabase/
    └── migrations/
        ├── 001_users.sql          # users-Tabelle (Clerk-ID), RLS
        ├── 002_wallet.sql         # wallets, wallet_transactions, game_sessions, RLS
        └── 003_provably_fair.sql  # seeds, place_bet(), settle_bet()
```

### WalletService Datenfluss (nach Migration)

```
API Route (POST /api/casino/bet)
  └── auth() → Clerk userId (TEXT)
  └── WalletService.updateWallet(userId, amount, payout, xpGain)
        └── supabase.rpc('place_bet', ...) → atomares Debit
        └── supabase.rpc('settle_bet', ...) → atomares Credit + XP
        └── INSERT INTO wallet_transactions → Audit-Trail
        └── RETURN { balance, xp, level }
```

### RLS-Strategie

Alle Tabellen nutzen `(auth.jwt() ->> 'sub') = user_id` als RLS-Predicate.  
Server-Side API-Routen nutzen den Admin-Client (Service Role) — bypasses RLS kontrolliert.

---

## casino-platform Archivierungs-Status

Nach Abschluss dieser Migration ist der `casino-platform` Ordner funktional obsolet.  
Die wertvollen Elemente (DB-Architektur, RLS-Muster) sind in `Casino` übernommen.  
`casino-platform` kann als Referenz-Archiv behalten oder gelöscht werden.
