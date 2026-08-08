-- Casino Royale - Anonymous Session Storage
-- Allows unauthenticated players to persist progress (xp, level, rank, rakeback)
-- under a client-generated session id. On login the session can be migrated
-- into the authenticated users table.

CREATE TABLE IF NOT EXISTS anonymous_sessions (
    id TEXT PRIMARY KEY,                       -- client-generated UUIDv4
    xp BIGINT DEFAULT 0 CHECK (xp >= 0),
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    rank TEXT DEFAULT 'Bronze',
    rakeback_pool DECIMAL(20,4) DEFAULT 0.00 CHECK (rakeback_pool >= 0),
    data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    last_active_at TIMESTAMPTZ DEFAULT now(),
    migrated_to_user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

ALTER TABLE anonymous_sessions ENABLE ROW LEVEL SECURITY;

-- Only the holder of the matching session id may read/update the row.
-- We pass the session id via a custom claim or use a service-role route for migration.
CREATE POLICY "anonymous_sessions_select_own" ON anonymous_sessions
    FOR SELECT USING (
        (auth.jwt() -> 'app_metadata' ->> 'session_id') = id
        OR (auth.jwt() ->> 'sub') = migrated_to_user_id
    );

CREATE POLICY "anonymous_sessions_update_own" ON anonymous_sessions
    FOR UPDATE USING (
        (auth.jwt() -> 'app_metadata' ->> 'session_id') = id
    );

CREATE POLICY "anonymous_sessions_insert_own" ON anonymous_sessions
    FOR INSERT WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'session_id') = id
    );

CREATE INDEX IF NOT EXISTS idx_anonymous_sessions_migrated
    ON anonymous_sessions(migrated_to_user_id)
    WHERE migrated_to_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_anonymous_sessions_last_active
    ON anonymous_sessions(last_active_at);

-- Atomic migration: copy anonymous session progress into users if the user has less XP.
-- Returns the resulting balance/xp/level from the users table.
CREATE OR REPLACE FUNCTION migrate_anonymous_session(
    p_session_id TEXT,
    p_user_id TEXT
) RETURNS TABLE(balance DECIMAL, xp BIGINT, level INTEGER, rank TEXT, rakeback_pool DECIMAL) AS $$
DECLARE
    v_session anonymous_sessions%ROWTYPE;
    v_user users%ROWTYPE;
BEGIN
    SELECT * INTO v_session FROM anonymous_sessions WHERE id = p_session_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Session not found';
    END IF;

    IF v_session.migrated_to_user_id IS NOT NULL AND v_session.migrated_to_user_id != p_user_id THEN
        RAISE EXCEPTION 'Session already migrated to a different user';
    END IF;

    SELECT * INTO v_user FROM users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    -- Migrate only if the anonymous session has more progress than the existing user.
    IF v_session.xp > COALESCE(v_user.xp, 0) THEN
        UPDATE users
        SET xp = v_session.xp,
            level = GREATEST(v_user.level, v_session.level),
            rank = COALESCE(NULLIF(v_session.rank, ''), v_user.rank),
            rakeback_pool = v_user.rakeback_pool + v_session.rakeback_pool,
            updated_at = now()
        WHERE id = p_user_id;
    ELSE
        -- Just add the rakeback pool; keep existing rank/xp/level.
        UPDATE users
        SET rakeback_pool = v_user.rakeback_pool + v_session.rakeback_pool,
            updated_at = now()
        WHERE id = p_user_id;
    END IF;

    -- Mark session as migrated
    UPDATE anonymous_sessions
    SET migrated_to_user_id = p_user_id,
        last_active_at = now()
    WHERE id = p_session_id;

    RETURN QUERY SELECT u.balance, u.xp, u.level, u.rank, u.rakeback_pool
                 FROM users u WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Lightweight upsert to keep anonymous session state in sync from the client.
CREATE OR REPLACE FUNCTION upsert_anonymous_session(
    p_session_id TEXT,
    p_xp BIGINT,
    p_level INTEGER,
    p_rank TEXT,
    p_rakeback_pool DECIMAL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO anonymous_sessions (id, xp, level, rank, rakeback_pool, last_active_at)
    VALUES (p_session_id, p_xp, p_level, p_rank, p_rakeback_pool, now())
    ON CONFLICT (id) DO UPDATE SET
        xp = EXCLUDED.xp,
        level = EXCLUDED.level,
        rank = EXCLUDED.rank,
        rakeback_pool = EXCLUDED.rakeback_pool,
        last_active_at = now()
    WHERE anonymous_sessions.migrated_to_user_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
