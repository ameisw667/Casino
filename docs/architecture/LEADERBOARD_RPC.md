# Leaderboard-RPC — Architektur & Verifizierung

> **Kanonische, konsolidierte Dokumentation** des Leaderboard-Workstreams.
> Vereint aus `03_LEADERBOARD_STATS.md` (RNG/Crash-Blackjack-Stakes-Korrektur) und `13_LEADERBOARD_BOT_SIMULATION.md` (Bot-Simulation & `total_wagered`-Fix) — beide Quellen nach Konsolidierung gelöscht (M5, 2026-08-09).
> **Status:** 100 % umgesetzt & live · **Verifiziert (2026-08-09):** Remote-DB-RPC-Deployment (`015_get_leaderboard.sql` von Jan live ausgeführt), `npm run test` (235/235 passed), `npm run lint` (0 errors), `npm run build` (clean).

---

## Executive Summary

1. **Migration 015 (`supabase/migrations/015_get_leaderboard.sql`)** — Performanter DB-RPC `get_leaderboard()`, konsolidiert alle 5 Spiele: DICE/SLOTS/ROULETTE via `wallet_transactions`, CRASH/BLACKJACK via `game_rounds`. Erforderliche `payout`-Spalte in `game_rounds` per `ADD COLUMN IF NOT EXISTS` abgesichert. **Von Jan im Supabase SQL Editor live ausgeführt.**
2. **API-Route-Hardening (`src/app/api/leaderboard/route.ts`)** — Route nutzt direkt `supabase.rpc('get_leaderboard')`. Fallback-Pfad fragt parallel `wallet_transactions` und `game_rounds` (`status = 'SETTLED'`) ab.
3. **Unit-Tests (`src/lib/casino/__tests__/leaderboard.test.ts`)** — 4 Unit-Tests decken Einzelspiel-, Multi-Game- und Nullfall-Aggregationspfade ab.
4. **`biggest_win`-Semantik** — Netto-Gewinn-Semantik als Standard beibehalten: `amount > 0` und `GREATEST(payout - bet_amount, 0)`.
5. **`betAmount`-Alignment** — Settlement-autoritatives Alignment in Route & Test-Suite.

---

## Status-Tabelle (Workstream-Punkte)

| #    | Punkt                                      | Status                  | Anmerkung                                                                        |
| ---- | ------------------------------------------ | ----------------------- | -------------------------------------------------------------------------------- |
| 1–11 | Bot-Setup, Simulation, Route-Fix & Cleanup | ✅ abgeschlossen        | Initial in Run1/Run2 durchgeführt                                                |
| 12   | `biggest_win`-Semantik                     | ✅ abgeschlossen        | Netto-Gewinn-Semantik (`amount > 0` / `payout - stake`)                          |
| 14   | `get_leaderboard`-RPC                      | ✅ abgeschlossen & live | In `015_get_leaderboard.sql` implementiert & auf Supabase ausgeführt             |
| 15   | CRASH/BLACKJACK-Einsätze im Leaderboard    | ✅ abgeschlossen & live | In RPC & API-Route-Fallback über `game_rounds` (`status = 'SETTLED'`) integriert |
| 16   | `betAmount`-Alignment                      | ✅ abgeschlossen        | Settlement-autoritatives Alignment in Route & Test-Suite                         |

---

## Verified Results

- **Remote DB:** `get_leaderboard()`-RPC live & aktiv auf Supabase.
- **`npm run test`:** 25 Test-Dateien passed (235 total tests).
- **`npm run lint`:** 0 errors / 0 warnings.
- **`npm run build`:** 100 % clean production build.

---

## Quellen-Herkunft (M5-Konsolidierung, 2026-08-09)

- `docs/architecture/03_LEADERBOARD_STATS.md` → gelöscht (Exec-Summary, RPC 015, Semantik, Tests, Verified-Results).
- `docs/architecture/13_LEADERBOARD_BOT_SIMULATION.md` → gelöscht (Status-Tabelle 1–16, Bot-Simulation, `total_wagered`-Fix, `betAmount`-Alignment).
- Vollständige Originale in der Git-Historie erhalten. Externe Link-Korrektur (Hub `01_WORLDMAP_STATUS` → neue Datei) ist M10-Pending (siehe `worldmap/04_docs_ordnung.md`).
