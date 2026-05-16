-- Casino Royale - Wallet Audit Trail & Session Tracking
-- NOTE: user balance lives in users.balance (single source of truth).
-- wallet_transactions is an immutable audit log only — never a balance source.
-- Adapted from casino-platform baseline RLS pattern.

-- Immutable audit trail for every balance change
-- amount: positive = credit (win/purchase), negative = debit (bet)
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game TEXT,                   -- 'slots', 'roulette', 'crash', 'dice', 'purchase', 'bonus'
    type TEXT NOT NULL,          -- 'bet', 'win', 'crash_pending', 'purchase', 'bonus'
    amount DECIMAL(20, 2) NOT NULL,
    balance_after DECIMAL(20, 2) NOT NULL,
    metadata JSONB,              -- Game-specific details (multiplier, result, seed hash, crashPoint)
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Per-session stats for history & analytics pages
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ,
    total_bet DECIMAL(20, 2) DEFAULT 0.00,
    total_won DECIMAL(20, 2) DEFAULT 0.00,
    hands_played INTEGER DEFAULT 0
);

-- Row Level Security
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_select_own" ON wallet_transactions
    FOR SELECT USING ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "sessions_select_own" ON game_sessions
    FOR SELECT USING ((auth.jwt() ->> 'sub') = user_id);

-- Indexes for critical query paths
CREATE INDEX IF NOT EXISTS idx_transactions_user ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_game ON wallet_transactions(game);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_game ON game_sessions(game);
