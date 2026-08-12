-- 2.2 Telegram-Benachrichtigungen: opt-in Big-Win-Push per bestehendem Telegram-Bot.
-- Kein direkter Client-Zugriff auf beide Tabellen (RLS + REVOKE ALL) — Linking/Unlinking/
-- Toggle laufen ausschließlich ueber die service-role-only API-Routen unter /api/telegram/*.
-- chat_id ist BIGINT: Telegrams chat_id kann bis zu 52 Bit signed umfassen, INTEGER reicht nicht.

CREATE TABLE IF NOT EXISTS public.telegram_links (
    user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    chat_id BIGINT NOT NULL UNIQUE,
    telegram_username TEXT NULL,
    notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    linked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.telegram_link_tokens (
    token UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '10 minutes',
    consumed_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS telegram_link_tokens_user_id_idx
    ON public.telegram_link_tokens (user_id);

ALTER TABLE public.telegram_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_link_tokens ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.telegram_links FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.telegram_link_tokens FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.telegram_links TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.telegram_link_tokens TO service_role;

-- Deletes tokens that are either expired or already consumed and older than one day.
-- Keeps a short post-consumption trail for support/debugging without unbounded growth.
CREATE OR REPLACE FUNCTION public.purge_expired_telegram_link_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_deleted INTEGER;
BEGIN
    DELETE FROM public.telegram_link_tokens
    WHERE expires_at < now() - interval '1 day'
       OR (consumed_at IS NOT NULL AND consumed_at < now() - interval '1 day');
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_expired_telegram_link_tokens() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_expired_telegram_link_tokens() TO service_role;
