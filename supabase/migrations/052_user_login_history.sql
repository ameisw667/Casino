-- Level 6 (Auth Audit Log & Login History): Tracks recent user logins for security auditing.
-- RLS allows authenticated users to query their own login history (auth.uid()::text = user_id).
-- Writes are performed by the application backend (service_role or authenticated user).

CREATE TABLE IF NOT EXISTS public.user_login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  auth_method TEXT NOT NULL CHECK (auth_method IN ('password', 'passkey', 'google', 'otp_magic_link')),
  device_info TEXT NOT NULL CHECK (char_length(device_info) BETWEEN 1 AND 120),
  ip_masked TEXT NOT NULL CHECK (char_length(ip_masked) BETWEEN 1 AND 60),
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_login_history_timeline
  ON public.user_login_history (user_id, created_at DESC);

ALTER TABLE public.user_login_history ENABLE ROW LEVEL SECURITY;

-- Read policy: Users can only read their own login records.
DROP POLICY IF EXISTS "user_login_history_select_own" ON public.user_login_history;
CREATE POLICY "user_login_history_select_own"
ON public.user_login_history
FOR SELECT
TO authenticated
USING (user_id = auth.uid()::text);

-- Grants
GRANT SELECT, INSERT ON TABLE public.user_login_history TO service_role;
GRANT SELECT, INSERT ON TABLE public.user_login_history TO authenticated;
