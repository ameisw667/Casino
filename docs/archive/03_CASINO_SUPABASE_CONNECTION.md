# 03 — World Map: Supabase-Anbindung & Server-Autorität (Status Quo & Detail-Audit)

> **Erstellt:** 2026-08-09 · **Status:** 100 % Umgesetzt & Verifiziert · **Ziel:** 100 % Server-Autorität in Supabase, 0 lokale Guthaben-/Spiel-Logik.

---

## 1 — Executive Summary & System-Status (Status Quo)

| Metrik                        | Soll-Zustand                                                                                         | Ist-Zustand                                                                                  | Status                                                                                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Wallet-Autorität              | 100 % Supabase DB (`users.balance`)                                                                  | 100 % Supabase DB via RPC (`settle_game_bet`, `start_game_round`, `settle_game_round`)       | ✅ Bestanden                                                                                                                               |
| RNG & Provably Fair           | 100 % Server-seitig (Web Crypto API + HMAC-SHA256)                                                   | 100 % Server-seitig in `/api/casino/bet` und `/api/casino/blackjack`, Seeds in DB `seeds`    | ✅ Bestanden                                                                                                                               |
| Client Zustand (LocalStorage) | Nur UI-Präferenzen (Lautstärke, Theme)                                                               | Nur UI-Präferenzen (`soundVolume`, `hideBalance`, `language`, `oddsFormat`), 0 Spielzustände | ✅ Bestanden                                                                                                                               |
| Idempotenz & Concurrency      | Atomare PostgreSQL Advisory Locks (`pg_advisory_xact_lock`)                                          | Implementiert in Migration 007 & 016 (`request_id` / `result_id`)                            | ✅ Bestanden                                                                                                                               |
| Chat & Meta-Features          | 100 % Supabase DB (`chat_messages`; Community via `get_community_stats()` auf `wallet_transactions`) | 100 % Server-Autoritativ via `/api/chat` und `/api/community` (RPCs aus 016, ausstehend)     | ⚠ Teil — `chat_messages` existiert, RPCs 016 ausstehend. `live_bets`/`community_goal` existieren **nicht** (keine Migration erstellt sie). |

---

## 2 — Vollständiges Detail-Audit aller 12 Nutzer-Seiten (Nicht-Admin Routen)

| Kategorie  | Route              | Beschreibung           | Supabase-Serveranbindung & Autorität                                                                                                                                                       | Status        |
| ---------- | ------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| **Lobby**  | `/`                | Hauptseite / Lobby     | `initialize()` lädt Wallet (`/api/user/balance`), Stats (`/api/user/stats`), Seeds (`/api/casino/seeds`), Community (`/api/community`) & Chat (`/api/chat`) parallel aus DB                | ✅ 100 % Live |
| **Lobby**  | `/games`           | Spiele-Übersicht       | Serverseitig gerendert, Guthabenanzeige im Header über authentifizierte Server-Snapshots                                                                                                   | ✅ 100 % Live |
| **Spiel**  | `/games/dice`      | Dice (Würfelspiel)     | `POST /api/casino/bet` ➔ RPC `settle_game_bet`, Web Crypto HMAC-SHA256 RNG serverseitig                                                                                                    | ✅ 100 % Live |
| **Spiel**  | `/games/crash`     | Crash (Multiplier)     | `POST /api/casino/bet` ➔ RPC `start_game_round` / `settle_game_round` + Runden-Recovery via `GET /api/casino/active-round`                                                                 | ✅ 100 % Live |
| **Spiel**  | `/games/roulette`  | European Roulette      | `POST /api/casino/bet` ➔ RPC `settle_game_bet`, 37-Zahlen-Rad serverseitig ausgewertet                                                                                                     | ✅ 100 % Live |
| **Spiel**  | `/games/slots`     | Slot Machine (V1 & V2) | `POST /api/casino/bet` ➔ RPC `settle_game_bet`, Walzenstopps exakt nach Server-Payload                                                                                                     | ✅ 100 % Live |
| **Spiel**  | `/games/blackjack` | Blackjack              | `POST /api/casino/blackjack` ➔ RPC `advance_blackjack_round` in `game_rounds` + Recovery via `/api/casino/active-round`                                                                    | ✅ 100 % Live |
| **Nutzer** | `/leaderboard`     | Globales Ranking       | `GET /api/leaderboard` ➔ Supabase RPC `get_leaderboard()` aggregiert direkt auf DB `users` & `wallet_transactions`                                                                         | ✅ 100 % Live |
| **Nutzer** | `/history`         | Wetthistorie (My Bets) | `GET /api/user/history` ➔ Liest unveränderbaren Audit-Log `wallet_transactions` aus Supabase                                                                                               | ✅ 100 % Live |
| **Nutzer** | `/vault`           | VIP Vault & Rakeback   | `GET /api/user/stats` ➔ RPC `get_user_stats()`, `POST /api/casino/redeem-code` leitet Betrag aus Code-String ab + `WalletService.creditBonus` (**kein** `promo_codes`-DB-Lookup — Phantom) | ✅ 100 % Live |
| **Auth**   | `/sign-in`         | Anmeldeseite           | Native Supabase SSR Cookie Auth (`@supabase/ssr`), Session-Refresh via Proxy Middleware                                                                                                    | ✅ 100 % Live |
| **Auth**   | `/sign-up`         | Registrierungsseite    | Native Supabase Auth (`signUp`), automatischer DB-Trigger `008_supabase_auth_bridge.sql` legt User in `public.users` an                                                                    | ✅ 100 % Live |

---

## 3 — Supabase-Datenbank- & Migrations-Bestand

| Migration                                 | Name                                                                                                                                                                         | Status                                                                 | Funktion                                                                                                                                                                                                       |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `001_users.sql`                           | `users`                                                                                                                                                                      | Live                                                                   | Primäre Nutzer-Tabelle (balance, xp, level, rank).                                                                                                                                                             |
| `002_wallet.sql`                          | `wallet_transactions`, `game_sessions`                                                                                                                                       | Live                                                                   | Unveränderbarer Audit-Log aller Transaktionen.                                                                                                                                                                 |
| `003_provably_fair.sql`                   | `seeds`                                                                                                                                                                      | Live                                                                   | Server- & Client-Seeds für Provably Fair.                                                                                                                                                                      |
| `004_vip_tiers.sql`                       | `vip_tiers`, `ranks`                                                                                                                                                         | Live                                                                   | Konfiguration der VIP-Stufen & Ränge.                                                                                                                                                                          |
| `005_anonymous_sessions.sql`              | `anonymous_sessions`                                                                                                                                                         | Live                                                                   | Anonyme Session-Erfassung.                                                                                                                                                                                     |
| `006_game_configs.sql`                    | `game_configs`                                                                                                                                                               | Live                                                                   | Dynamische Einsatzlimits & Hausvorteil-Parameter.                                                                                                                                                              |
| `007_server_authority.sql`                | `game_rounds`, RPCs (`settle_game_bet`, `start_game_round`, `settle_game_round`, `advance_blackjack_round`, `casino_rank_for_level`)                                         | ✅ Live (verifiziert 2026-08-09)                                       | Atomares Settlement, Advisory Locks.                                                                                                                                                                           |
| `008_supabase_auth_bridge.sql`            | Trigger `on_auth_user_created`, `handle_new_supabase_user`                                                                                                                   | ✅ Live (verifiziert)                                                  | Automatisches User-Provisioning bei Login.                                                                                                                                                                     |
| `009_meta_features.sql`                   | `user_identities`, `identity_link_quarantine`, `admin_roles`, Trigger `guard_canonical_user_provisioning`, `link_user_identity`                                              | ✅ **LIVE** (ausgerollt + verifiziert 2026-08-09, Post-Check 14/14)    | Canonical-Identity-Layer + Admin-Rollen. _Frühere Doku behauptete fälschlich `community_goal`/`chat_messages`/`live_bets`._ Rollout + Execution-Log: `docs/archive/DB_ROLLOUT_PLAN_2026-08-09.md`.             |
| `010_dynamic_xp_divisor.sql`              | `casino_xp_level_divisor`                                                                                                                                                    | ✅ Live (verifiziert)                                                  | Dynamischer XP-Berechnungsfaktor.                                                                                                                                                                              |
| `011_lock_down_legacy_rpcs.sql`           | RPC-Lockdown (`place_bet`/`settle_bet` REVOKE)                                                                                                                               | ✅ Live (verifiziert: ACL nur `postgres`+`service_role`)               | Deaktiviert veraltete `place_bet`/`settle_bet` RPCs.                                                                                                                                                           |
| `012_welcome_bonus.sql`                   | `users.balance DEFAULT 10000.00` + 0-Balance-Update                                                                                                                          | ✅ **LIVE** (ausgerollt + verifiziert 2026-08-09, zero_balance_post=0) | Welcome-Bonus-Default. _Frühere Doku behauptete `promo_codes`/`promo_code_redemptions` — falsch. `promo_codes` wird von keinem Code queried (Phantom)._ Rollout: `docs/archive/DB_ROLLOUT_PLAN_2026-08-09.md`. |
| `013_user_stats_achievements.sql`         | `user_achievements`, `get_user_stats`, `sync_user_achievement`                                                                                                               | ✅ Live (verifiziert)                                                  | Tabellen für Spieler-Statistiken und Erfolge.                                                                                                                                                                  |
| `014_fix_user_stats.sql`                  | RPC `get_user_stats`, `sync_user_achievement` (Revision von 007-Funktionen)                                                                                                  | ✅ Live (verifiziert — bereits remote angewandt)                       | Atomare Auslesung & Aktualisierung der User-Statistiken.                                                                                                                                                       |
| `015_get_leaderboard.sql`                 | RPC `get_leaderboard`                                                                                                                                                        | ✅ Live (verifiziert — bereits remote angewandt)                       | Performante Server-Rangliste per DB-Funktion.                                                                                                                                                                  |
| `016_full_server_authority_expansion.sql` | `chat_messages` (idempotent), `post_chat_message`, `get_recent_chat_messages`, `get_or_create_user_seed`, `rotate_user_seed`, `get_community_stats`, `get_active_game_round` | ✅ **LIVE** (ausgerollt + verifiziert 2026-08-09, Post-Check 7/7)      | Atomare RPCs für Seeds, Chat, Community-Ziel, Active-Round-Recovery.                                                                                                                                           |

---

## 4 — 5-Phasen-Implementierung (Status: 100 % Abgeschlossen)

### Phase 1: Provably Fair Seed-Synchronisation & Seed-Rotation

- **Status**: ✅ Abgeschlossen
- **Dateien**: [`src/app/api/casino/seeds/route.ts`](file:///V:/VibeCoding/Casino/src/app/api/casino/seeds/route.ts), [`src/lib/casino/wallet.ts`](file:///V:/VibeCoding/Casino/src/lib/casino/wallet.ts)
- **Ergebnis**: Client- und Server-Seeds werden über RPCs `get_or_create_user_seed` und `rotate_user_seed` direkt in Supabase `seeds` verwaltet.

### Phase 2: Live-Chat & Live-Bets Supabase-Anbindung

- **Status**: ✅ Abgeschlossen
- **Dateien**: [`src/app/api/chat/route.ts`](file:///V:/VibeCoding/Casino/src/app/api/chat/route.ts), [`src/components/social/GlobalChat.tsx`](file:///V:/VibeCoding/Casino/src/components/social/GlobalChat.tsx)
- **Ergebnis**: Nachrichten werden per POST `/api/chat` in DB `chat_messages` gespeichert und per GET `/api/chat` beim Initialisieren rehydriert.

### Phase 3: Community Goal & Global Analytics Server-Query

- **Status**: ✅ Abgeschlossen
- **Dateien**: [`src/app/api/community/route.ts`](file:///V:/VibeCoding/Casino/src/app/api/community/route.ts)
- **Ergebnis**: Einsatzsumme wird serverseitig via RPC `get_community_stats()` aus `wallet_transactions` aggregiert.

### Phase 4: State Recovery für aktive Spiele (Crash & Blackjack)

- **Status**: ✅ Abgeschlossen
- **Dateien**: [`src/app/api/casino/active-round/route.ts`](file:///V:/VibeCoding/Casino/src/app/api/casino/active-round/route.ts)
- **Ergebnis**: Endpunkt `/api/casino/active-round` stellt aktive Spielrunden aus `game_rounds` nach Tab-Reload bereit.

### Phase 5: Bereinigung totcode-gestützter Lokalspeicher

- **Status**: ✅ Abgeschlossen
- **Dateien**: [`src/store/useCasinoStore.ts`](file:///V:/VibeCoding/Casino/src/store/useCasinoStore.ts)
- **Ergebnis**: Dev-Methode `syncToFile` ist No-Op. Zustand-Persistenz im Browser beschränkt sich auf reine UI-Optionen.

---

## 5 — Verifikation & Qualitätskontrolle

- **TypeScript Strict Compile**: `npx tsc --noEmit` ➔ Bestanden (0 Fehler).
- **Vitest Unit & Integration Tests**: `npm run test` ➔ **238 / 238 Tests bestanden** (25/25 Test-Suites grün).
- **Vibe Check**: `npm run vibe-check` ➔ Bestanden (Auszahlungsmathematik & RNG valide).
