# Feature Matrix — Casino (Stand nach Migration 2026-05-15)

## Legende
- Status: `none` · `partial` · `good`
- Quelle: Wo der Code herkommt

| Feature | Status | Quelle | Notizen |
|---|---|---|---|
| App Shell / Layout | good | Casino | Sidebar, Modals, ClientShell, GlobalChat vollständig |
| Auth (Clerk) | good | Casino | Clerk + Webhook → Supabase users-Tabelle |
| Wallet / Balance | good | Casino + casino-platform | WalletService jetzt Supabase-backed (nicht mehr mockBalances) |
| Supabase RLS | good | casino-platform | users, wallet_transactions, game_sessions, seeds abgesichert |
| Wallet Audit Trail | good | casino-platform | wallet_transactions mit place_bet() / settle_bet() Stored Procs |
| Game Sessions | good | casino-platform | game_sessions-Tabelle vorhanden, noch nicht befüllt |
| Provably Fair | partial | Casino | Algorithmus korrekt (HMAC-SHA256), aber Server Seed läuft noch client-seitig |
| Crash | good | Casino | Implementiert, server-seitig settliert |
| Dice | good | Casino | Implementiert |
| Roulette | partial | Casino | Implementiert, 3D-Physik-Desync noch offen (Master Plan 2.4) |
| Slots | partial | Casino | Implementiert, Reel-Desync noch offen (Master Plan 2.6) |
| Blackjack | none | — | Noch nicht implementiert |
| Poker | none | — | Noch nicht implementiert |
| Payments (Stripe) | none | casino-platform (plan) | Webhook-Struktur geplant, noch nicht integriert |
| Rate Limiting | partial | Casino | Upstash-Code vorhanden, ENV-Vars noch nicht gesetzt |
| Admin / Dashboard | partial | Casino | Seite vorhanden, keine echten DB-Daten |
| Tests | none | — | Kein Test-Setup vorhanden |
| Cross-Tab Sync | none | — | BroadcastChannel fehlt (Master Plan 3.1) |

## Offene P0-Punkte (blockierend für Production)
1. Supabase Migrations einspielen → `OPEN_TASKS.md` #1
2. Clerk JWT Template "supabase" einrichten → `OPEN_TASKS.md` #2
3. ENV-Vars in `.env.local` vervollständigen → `OPEN_TASKS.md` #3

## casino-platform Status
**Archiviert** — alle wertvollen Elemente (DB-Architektur, RLS, Migrations) sind in Casino übernommen.  
Der Ordner kann gelöscht werden, sobald die Migrations erfolgreich in Supabase eingespielt wurden.
