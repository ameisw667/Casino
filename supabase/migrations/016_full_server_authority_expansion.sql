-- Migration 016: Full Server Authority Expansion
-- Erweitert Supabase um atomare RPCs für Seeds, Global Chat, Live Bets, Community Goal & Active Round Recovery.

-- 1. Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    rank TEXT NOT NULL DEFAULT 'BRONZE',
    message TEXT NOT NULL CHECK (length(message) > 0 AND length(message) <= 500),
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    is_win BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(created_at DESC);

-- RPC: Chat-Nachricht verfassen
CREATE OR REPLACE FUNCTION public.post_chat_message(
    p_user_id TEXT,
    p_message TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user users%ROWTYPE;
    v_msg_id UUID;
    v_result JSONB;
BEGIN
    IF p_user_id IS NULL OR p_user_id = '' OR p_message IS NULL OR btrim(p_message) = '' THEN
        RAISE EXCEPTION 'Invalid chat message';
    END IF;

    SELECT * INTO v_user FROM users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    INSERT INTO chat_messages (user_id, username, rank, message)
    VALUES (p_user_id, v_user.username, v_user.rank, btrim(p_message))
    RETURNING id INTO v_msg_id;

    SELECT jsonb_build_object(
        'id', id,
        'user', username,
        'rank', rank,
        'message', message,
        'time', to_char(created_at, 'HH12:MI AM'),
        'isSystem', is_system,
        'isWin', is_win
    ) INTO v_result
    FROM chat_messages WHERE id = v_msg_id;

    RETURN v_result;
END;
$$;

-- RPC: Neueste Chat-Nachrichten abrufen
CREATE OR REPLACE FUNCTION public.get_recent_chat_messages(p_limit INT DEFAULT 50)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT COALESCE(jsonb_agg(msg), '[]'::jsonb)
    FROM (
        SELECT 
            id,
            username AS "user",
            rank,
            message,
            to_char(created_at, 'HH12:MI AM') AS "time",
            is_system AS "isSystem",
            is_win AS "isWin"
        FROM chat_messages
        ORDER BY created_at DESC
        LIMIT LEAST(p_limit, 100)
    ) msg;
$$;

-- 2. Seeds & Provably Fair Management
CREATE OR REPLACE FUNCTION public.get_or_create_user_seed(p_user_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_seed seeds%ROWTYPE;
    v_server_seed TEXT;
    v_server_seed_hash TEXT;
BEGIN
    SELECT * INTO v_seed FROM seeds WHERE user_id = p_user_id AND is_active = TRUE LIMIT 1;
    IF FOUND THEN
        RETURN jsonb_build_object(
            'clientSeed', v_seed.client_seed,
            'serverSeedHash', v_seed.server_seed_hash,
            'nonce', v_seed.nonce
        );
    END IF;

    v_server_seed := encode(gen_random_bytes(32), 'hex');
    v_server_seed_hash := encode(digest(v_server_seed, 'sha256'), 'hex');

    INSERT INTO seeds (user_id, server_seed, server_seed_hash, client_seed, nonce, is_active)
    VALUES (p_user_id, v_server_seed, v_server_seed_hash, 'vibe-coder-default', 0, TRUE)
    ON CONFLICT (user_id) DO UPDATE SET
        server_seed = EXCLUDED.server_seed,
        server_seed_hash = EXCLUDED.server_seed_hash,
        is_active = TRUE
    RETURNING * INTO v_seed;

    RETURN jsonb_build_object(
        'clientSeed', v_seed.client_seed,
        'serverSeedHash', v_seed.server_seed_hash,
        'nonce', v_seed.nonce
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.rotate_user_seed(
    p_user_id TEXT,
    p_client_seed TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_new_server_seed TEXT;
    v_new_hash TEXT;
BEGIN
    IF p_client_seed IS NULL OR btrim(p_client_seed) = '' THEN
        RAISE EXCEPTION 'Invalid client seed';
    END IF;

    v_new_server_seed := encode(gen_random_bytes(32), 'hex');
    v_new_hash := encode(digest(v_new_server_seed, 'sha256'), 'hex');

    INSERT INTO seeds (user_id, server_seed, server_seed_hash, client_seed, nonce, is_active)
    VALUES (p_user_id, v_new_server_seed, v_new_hash, p_client_seed, 0, TRUE)
    ON CONFLICT (user_id) DO UPDATE SET
        server_seed = v_new_server_seed,
        server_seed_hash = v_new_hash,
        client_seed = p_client_seed,
        nonce = 0,
        is_active = TRUE;

    RETURN jsonb_build_object(
        'clientSeed', p_client_seed,
        'serverSeedHash', v_new_hash,
        'nonce', 0
    );
END;
$$;

-- 3. Community Goal Calculation
CREATE OR REPLACE FUNCTION public.get_community_stats()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT jsonb_build_object(
        'communityWagered', COALESCE(SUM(ABS(amount)), 0),
        'communityGoal', 25000.0,
        'communityGoalReached', (COALESCE(SUM(ABS(amount)), 0) >= 25000.0)
    )
    FROM wallet_transactions
    WHERE type IN ('bet', 'bet_settled');
$$;

-- 4. Active Game Round Recovery
CREATE OR REPLACE FUNCTION public.get_active_game_round(
    p_user_id TEXT,
    p_game TEXT
) RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_round game_rounds%ROWTYPE;
BEGIN
    SELECT * INTO v_round FROM game_rounds
    WHERE user_id = p_user_id AND game = UPPER(p_game) AND status = 'ACTIVE'
    ORDER BY created_at DESC LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('hasActiveRound', false);
    END IF;

    RETURN jsonb_build_object(
        'hasActiveRound', true,
        'roundId', v_round.id,
        'requestId', v_round.request_id,
        'betAmount', v_round.bet_amount,
        'state', v_round.state,
        'version', v_round.version
    );
END;
$$;
