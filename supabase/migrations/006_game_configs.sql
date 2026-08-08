-- Casino Royale - Global Game Configuration
-- Centralized tunable parameters: bet limits, house edge, multipliers, XP formula.
-- Values can be changed in Supabase without a code deploy.

CREATE TABLE IF NOT EXISTS game_configs (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL,      -- e.g. 'limits', 'crash', 'roulette'
    config_key TEXT NOT NULL,    -- mirrors category for grouped configs
    value JSONB NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(category, config_key)
);

ALTER TABLE game_configs ENABLE ROW LEVEL SECURITY;

-- Configuration is public and read-only for clients
CREATE POLICY "game_configs_select_public" ON game_configs
    FOR SELECT USING (true);

-- Seed with values currently hardcoded in the application
INSERT INTO game_configs (category, config_key, value, description) VALUES
('limits', 'limits', '{"bet_min":0.10,"bet_max":10000.00,"max_bet_hardcap":100000000.00}', 'Bet limits and hardcap'),
('crash', 'crash', '{"house_edge":0.01}', 'Crash house edge (1%)'),
('roulette', 'roulette', '{"multipliers":{"STRAIGHT":35,"COLOR":2,"EVEN_ODD":2,"RANGE":2,"DOZEN":2,"COLUMN":2,"VOISINS":2.1176,"TIERS":3.0,"ORPHELINS":4.5}}', 'Roulette payout multipliers'),
('blackjack', 'blackjack', '{"max_payout_factor":2.5}', 'Maximum allowed client-reported payout factor'),
('slots', 'slots', '{"paytable":{"match_5_base":50,"match_4_base":10,"match_3_base":2,"symbol_weight":0.5}}', 'Slots paytable parameters'),
('xp', 'xp', '{"max_xp_per_bet":10000,"max_level":100,"base_multiplier":10,"level_formula_sqrt_divisor":100,"level_multiplier_step":100,"level_multiplier_max":5}', 'XP formula parameters')
ON CONFLICT (category, config_key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    updated_at = now();

CREATE INDEX IF NOT EXISTS idx_game_configs_category ON game_configs(category);
