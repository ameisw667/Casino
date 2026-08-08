-- Casino Royale - VIP Tier & Rank Configuration
-- Global, read-only configuration tables for the gamification system.
-- These values can be tuned in Supabase without a code deploy.

-- VIP Tiers (XP-based, used for rakeback calculation)
CREATE TABLE IF NOT EXISTS vip_tiers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    min_xp BIGINT NOT NULL CHECK (min_xp >= 0),
    rakeback DECIMAL(5,4) NOT NULL CHECK (rakeback >= 0),
    color TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE vip_tiers ENABLE ROW LEVEL SECURITY;

-- Configuration is public and read-only for clients
CREATE POLICY "vip_tiers_select_public" ON vip_tiers
    FOR SELECT USING (true);

INSERT INTO vip_tiers (name, min_xp, rakeback, color, sort_order) VALUES
('BRONZE', 0, 0.0100, '#cd7f32', 1),
('SILVER', 5000, 0.0200, '#c0c0c0', 2),
('GOLD', 25000, 0.0300, '#ffd700', 3),
('PLATINUM', 100000, 0.0500, '#e5e4e2', 4),
('DIAMOND', 500000, 0.1000, '#b9f2ff', 5)
ON CONFLICT (name) DO UPDATE SET
    min_xp = EXCLUDED.min_xp,
    rakeback = EXCLUDED.rakeback,
    color = EXCLUDED.color,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;

-- Ranks (Level-based, used for UI and rank perks)
CREATE TABLE IF NOT EXISTS ranks (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    min_level INTEGER NOT NULL CHECK (min_level >= 1),
    color TEXT NOT NULL,
    rakeback DECIMAL(5,4) NOT NULL CHECK (rakeback >= 0),
    perks TEXT[] NOT NULL DEFAULT '{}',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ranks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ranks_select_public" ON ranks
    FOR SELECT USING (true);

INSERT INTO ranks (name, min_level, color, rakeback, perks, sort_order) VALUES
('Bronze', 1, '#CD7F32', 0.0100, ARRAY['Daily Missions','Basic Rakeback'], 1),
('Silver', 10, '#C0C0C0', 0.0120, ARRAY['Priority Support','Enhanced Rakeback'], 2),
('Gold', 25, '#FFD700', 0.0150, ARRAY['Private Access','Weekly Bonuses'], 3),
('Platinum', 50, '#E5E4E2', 0.0180, ARRAY['VIP Manager','Custom Cases'], 4),
('Diamond', 100, '#B9F2FF', 0.0200, ARRAY['Instant Withdrawals','Global Recognition'], 5)
ON CONFLICT (name) DO UPDATE SET
    min_level = EXCLUDED.min_level,
    color = EXCLUDED.color,
    rakeback = EXCLUDED.rakeback,
    perks = EXCLUDED.perks,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;

-- Indexes for sorted reads
CREATE INDEX IF NOT EXISTS idx_vip_tiers_sort ON vip_tiers(sort_order);
CREATE INDEX IF NOT EXISTS idx_ranks_sort ON ranks(sort_order);
