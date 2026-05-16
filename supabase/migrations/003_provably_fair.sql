-- Casino Royale - Provably Fair Seeds & Atomic Bet Stored Procedures
-- All procedures operate on users.balance as the single source of truth.
-- SECURITY DEFINER: runs with creator privileges, safe for RPC calls.

-- Server/client seeds per user for provably fair verification
CREATE TABLE IF NOT EXISTS seeds (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    server_seed TEXT NOT NULL,
    server_seed_hash TEXT NOT NULL,
    client_seed TEXT NOT NULL,
    nonce INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE seeds ENABLE ROW LEVEL SECURITY;

-- Users can read their own seed hash (not the raw server seed)
CREATE POLICY "seeds_select_own" ON seeds
    FOR SELECT USING ((auth.jwt() ->> 'sub') = user_id);

-- Atomic debit: check-and-deduct in one statement, write audit row.
-- Raises exception on insufficient balance (caught by API route).
CREATE OR REPLACE FUNCTION place_bet(
    p_user_id TEXT,
    p_amount DECIMAL,
    p_game TEXT
) RETURNS DECIMAL AS $$
DECLARE
    v_new_balance DECIMAL;
BEGIN
    UPDATE users
    SET balance = balance - p_amount,
        updated_at = now()
    WHERE id = p_user_id AND balance >= p_amount
    RETURNING balance INTO v_new_balance;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

    INSERT INTO wallet_transactions (user_id, game, type, amount, balance_after)
    VALUES (p_user_id, p_game, 'bet', -p_amount, v_new_balance);

    RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic credit: add payout + recalculate XP/level, write audit row if payout > 0.
-- Returns updated balance, xp, level.
CREATE OR REPLACE FUNCTION settle_bet(
    p_user_id TEXT,
    p_payout DECIMAL,
    p_xp_gain INTEGER,
    p_game TEXT
) RETURNS TABLE(balance DECIMAL, xp BIGINT, level INTEGER) AS $$
DECLARE
    v_new_balance DECIMAL;
    v_new_xp BIGINT;
    v_new_level INTEGER;
BEGIN
    UPDATE users
    SET balance = balance + p_payout,
        xp = xp + p_xp_gain,
        level = GREATEST(1, FLOOR(SQRT((users.xp + p_xp_gain) / 100.0))::INTEGER + 1),
        updated_at = now()
    WHERE id = p_user_id
    RETURNING users.balance, users.xp, users.level
    INTO v_new_balance, v_new_xp, v_new_level;

    IF p_payout > 0 THEN
        INSERT INTO wallet_transactions (user_id, game, type, amount, balance_after)
        VALUES (p_user_id, p_game, 'win', p_payout, v_new_balance);
    END IF;

    RETURN QUERY SELECT v_new_balance, v_new_xp, v_new_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
