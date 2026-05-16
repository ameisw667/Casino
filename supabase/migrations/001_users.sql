-- Casino Royale - Users Table
-- Uses Clerk User ID (TEXT) as primary key, NOT Supabase auth.users UUID.
-- RLS uses JWT sub claim injected by Clerk via getToken({ template: 'supabase' }).

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,                          -- Clerk User ID (user_xxx...)
    username TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    balance DECIMAL(20, 2) DEFAULT 1000.00 CHECK (balance >= 0),
    xp BIGINT DEFAULT 0,
    level INTEGER DEFAULT 1,
    rank TEXT DEFAULT 'BRONZE',
    rakeback_pool DECIMAL(20, 4) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only read and update their own row.
-- Admin-Client (service role) bypasses RLS for webhook upserts.
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING ((auth.jwt() ->> 'sub') = id);

CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING ((auth.jwt() ->> 'sub') = id);

CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
