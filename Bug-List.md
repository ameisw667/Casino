# Bug-List

Stand: 2026-06-12 · Gegengeprüft: 2026-08-07 (siehe Fußnoten)

Offene Punkte aus dem letzten Audit (alle anderen Top-10-Punkte sind erledigt: C-2, CSRF-1, REEL-2, API-1, H-5, H-3, H-6, SETTINGS-1).

## Offene Punkte (Stand 2026-06-12, siehe Update-Status je Punkt)

### SEC-4 — Balance komplett client-seitig manipulierbar (DevTools-Exploit) — CRITICAL
- `ProvablyFairEngine.generateServerSeed()` läuft aktuell client-seitig → Server-Seed ist nicht geheim.
- Fix erfordert: Server-Seed-Generierung + -Speicherung serverseitig (Supabase), Hash-Reveal-Flow anpassen.
- **Entscheidung nötig**: Migration-Strategie für bestehende `provablyFairSettings` im Store/Persist.
- **Update 2026-08-07**: Ursprünglicher Fund erledigt. `generateServerSeed()`-Aufrufe (`casino-core.ts:71`, `:188`; `api/casino/blackjack/route.ts:82`) laufen ausschließlich in Server-API-Routen (`/api/casino/bet`, `/api/casino/blackjack`), nicht mehr client-seitig — Wallet ist seit Migration `007_server_authority.sql` serverautoritativ (siehe `CLAUDE.md`). `CasinoCore` wird in `RouletteClient.tsx` weiterhin client-seitig aufgerufen, aber nur für UI-Anzeige (Highlight/Max-Win-Vorschau), nicht für die tatsächliche Auszahlung. Verbleibende, davon unabhängige Lücke: kein Commit-Reveal/Seed-Chain (siehe `01_WORLDMAP_STATUS.md`, Kategorie 03).

### ODDS-3 — Slots-RTP — HIGH/Business
- Aktuell 57,70% RTP laut `calculateSlotsPayout()` (5 Reels, 8 Symbole), geprüft per Brute-Force über alle 8⁵ Kombinationen.
- Ursprünglicher Befund (RTP > 100%) trifft auf den aktuellen Code nicht mehr zu — kein akutes Problem, aber RTP wirkt sehr niedrig für ein Casino-Spiel.
- **Entscheidung nötig**: Ziel-RTP (z.B. 95-97%) und angepasste Payout-Tabelle in `casino-core.ts`.
- **Update 2026-08-07**: Payout-Berechnung läuft jetzt über `calculateSlotsPayoutWithConfig()` (config-getrieben statt hartcodiert) — Teil der Supabase-Auslagerung (`01_WORLDMAP_STATUS.md`, Kategorie 12: „Parameter raus, Algorithmus bleibt"). Die 57,70%-Zahl von 2026-06-12 ist damit veraltet; aktueller RTP hängt vom aktiven `game_configs`-Eintrag ab (Remote-Status unbestätigt, siehe Kategorie 12). Ziel-RTP-Entscheidung weiterhin offen.
