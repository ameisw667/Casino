-- Fixes an inconsistent roulette house edge: DOZEN/COLUMN/STRAIGHT were paid out as a
-- "profit only" multiplier that omitted the returned stake, giving 35.14%/35.14%/5.41%
-- house edge instead of the 2.70% (1/37) used everywhere else on the table (COLOR/
-- EVEN_ODD/RANGE and the VOISINS/TIERS/ORPHELINS French bets, which already correctly
-- apply the 36/coverage formula). The frontend board already labels Dozen/Column as
-- "2:1" (src/components/casino/games/roulette/RouletteBoard.tsx) — the backend paid
-- less than what was displayed.
-- Found via scripts/economy-audit.ts (worldmap/05_ZUKUNFTSPLANUNG.md P35/1.21).
-- Jan-confirmed 2026-08-21: align all roulette bet types to the standard 2.70% edge.

UPDATE game_configs
SET value = jsonb_set(
      jsonb_set(
        jsonb_set(value, '{multipliers,DOZEN}', '3', true),
        '{multipliers,COLUMN}', '3', true
      ),
      '{multipliers,STRAIGHT}', '36', true
    ),
    updated_at = now()
WHERE category = 'roulette' AND config_key = 'roulette' AND is_active = true;
