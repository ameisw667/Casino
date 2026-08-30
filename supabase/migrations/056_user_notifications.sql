-- P43 / 2.14: Persistent, account-bound In-App notification inbox.
--
-- The table is deliberately service-role only. Browser clients use authenticated
-- API routes; the only direct browser capability is receiving a private Realtime
-- broadcast published by the server after durable persistence succeeds.

CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('big_win', 'achievement', 'system')),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_key TEXT NOT NULL CHECK (char_length(source_key) BETWEEN 1 AND 160),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ,
  UNIQUE (user_id, source_key)
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_inbox
  ON public.user_notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_notifications_unread
  ON public.user_notifications (user_id, created_at DESC)
  WHERE read_at IS NULL;

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.user_notifications FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.user_notifications TO service_role;

-- Realtime Authorization is enabled in this Supabase project. The application
-- server is the sole publisher (service_role bypasses RLS); an authenticated
-- browser can receive only its own user-scoped topic.
DROP POLICY IF EXISTS "user_notifications_broadcast_receive" ON realtime.messages;
CREATE POLICY "user_notifications_broadcast_receive"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = 'user-notifications:' || auth.uid()::text
  AND realtime.messages.extension = 'broadcast'
);