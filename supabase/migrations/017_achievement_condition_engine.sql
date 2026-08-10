-- Casino Royale - Migration 017: Achievement Condition-Engine
-- Replaces the hardcoded achievement definitions + scattered id-string unlock
-- logic in useCasinoStore.ts with a declarative, DB-driven configuration.
-- Follows the same public read-only config pattern as vip_tiers/ranks (004).
-- Does NOT change how per-user progress is stored (see 013_user_stats_achievements.sql,
-- table user_achievements) — only where the achievement DEFINITIONS live.

CREATE TABLE IF NOT EXISTS public.achievement_configs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    total NUMERIC(20, 2) NOT NULL CHECK (total > 0),
    progress_stat TEXT NOT NULL CHECK (
        progress_stat IN ('totalBetsCount', 'betAmount', 'payout', 'level', 'multiplier', 'winStreak')
    ),
    conditions JSONB NOT NULL CHECK (jsonb_typeof(conditions) = 'array' AND jsonb_array_length(conditions) > 0),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.achievement_configs ENABLE ROW LEVEL SECURITY;

-- Configuration is public and read-only for clients, identical to vip_tiers/ranks.
-- Idempotent: CREATE POLICY has no IF NOT EXISTS, so guard via pg_policies check
-- (prevents duplicate-policy error when re-running against a DB where 017 already exists).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'achievement_configs'
          AND policyname = 'achievement_configs_select_public'
    ) THEN
        CREATE POLICY "achievement_configs_select_public" ON public.achievement_configs
            FOR SELECT USING (true);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_achievement_configs_sort ON public.achievement_configs(sort_order);

-- Seed: 9 achievements. IDs are intentionally identical to the previous
-- hardcoded set in useCasinoStore.ts (INITIAL_ACHIEVEMENTS) so that existing
-- rows in public.user_achievements (per-user unlocked/progress, keyed by
-- achievement_id) keep resolving to the same achievement after this migration.
INSERT INTO public.achievement_configs
    (id, title, description, icon, total, progress_stat, conditions, sort_order, is_active)
VALUES
    (
        'first_bet', 'First Steps', 'Place your first bet', '🎯', 1, 'totalBetsCount',
        '[{"stat":"totalBetsCount","op":"gte","value":1}]'::jsonb, 1, true
    ),
    (
        'high_roller', 'The Whale', 'Wager $1,000 in a single bet', '/images/ach-whale-3d.png', 1000, 'betAmount',
        '[{"stat":"betAmount","op":"gte","value":1000}]'::jsonb, 2, true
    ),
    (
        'lucky_streak', 'Emerald Luck', 'Win 5 times in a row', '/images/ach-clover-3d.png', 5, 'winStreak',
        '[{"stat":"winStreak","op":"gte","value":5}]'::jsonb, 3, true
    ),
    (
        'big_win', 'Jackpot Hunter', 'Win over $500 in a single bet', '💰', 500, 'payout',
        '[{"stat":"payout","op":"gte","value":500}]'::jsonb, 4, true
    ),
    (
        'level_10', 'Rising Star', 'Reach Level 10', '⭐', 10, 'level',
        '[{"stat":"level","op":"gte","value":10}]'::jsonb, 5, true
    ),
    (
        'level_50', 'Casino Elite', 'Reach Level 50', '👑', 50, 'level',
        '[{"stat":"level","op":"gte","value":50}]'::jsonb, 6, true
    ),
    (
        'crash_master', 'Crash Master', 'Hit a 10x multiplier in Crash', '/images/ach-rocket-3d.png', 10, 'multiplier',
        '[{"stat":"multiplier","op":"gte","value":10,"game":"CRASH"}]'::jsonb, 7, true
    ),
    (
        'daily_grinder', 'The Grinder', 'Place 50 bets', '🔥', 50, 'totalBetsCount',
        '[{"stat":"totalBetsCount","op":"gte","value":50}]'::jsonb, 8, true
    ),
    (
        'moon_shot', 'Moon Shot', 'Hit a 100x multiplier in Crash', '/images/ach-rocket-3d.png', 100, 'multiplier',
        '[{"stat":"multiplier","op":"gte","value":100,"game":"CRASH"}]'::jsonb, 9, true
    )
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    total = EXCLUDED.total,
    progress_stat = EXCLUDED.progress_stat,
    conditions = EXCLUDED.conditions,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;
