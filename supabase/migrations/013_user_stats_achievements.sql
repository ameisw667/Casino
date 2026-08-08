-- Casino Royale - Migration 013: User Lifetime Stats & Achievements Server Authority
-- Enables cross-device persistent achievements and server-aggregated lifetime stats.

CREATE TABLE IF NOT EXISTS public.user_achievements (
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked BOOLEAN NOT NULL DEFAULT false,
  progress NUMERIC(20, 2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.user_achievements FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.user_achievements TO service_role;

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);

CREATE OR REPLACE FUNCTION public.sync_user_achievement(
  p_user_id TEXT,
  p_achievement_id TEXT,
  p_progress NUMERIC,
  p_unlocked BOOLEAN
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.user_achievements (user_id, achievement_id, progress, unlocked, updated_at)
  VALUES (p_user_id, p_achievement_id, p_progress, p_unlocked, now())
  ON CONFLICT (user_id, achievement_id) DO UPDATE
  SET progress = GREATEST(public.user_achievements.progress, EXCLUDED.progress),
      unlocked = public.user_achievements.unlocked OR EXCLUDED.unlocked,
      updated_at = now();

  RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION public.sync_user_achievement(TEXT, TEXT, NUMERIC, BOOLEAN) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_user_achievement(TEXT, TEXT, NUMERIC, BOOLEAN) TO service_role;

CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_total_bets BIGINT := 0;
  v_total_wins BIGINT := 0;
  v_total_wagered NUMERIC(20, 2) := 0;
  v_total_payout NUMERIC(20, 2) := 0;
  v_total_profit NUMERIC(20, 2) := 0;
  v_achievements JSONB := '[]'::jsonb;
BEGIN
  SELECT
    COALESCE(COUNT(*), 0),
    COALESCE(COUNT(*) FILTER (WHERE amount < balance_after OR (metadata->>'payout')::numeric > amount), 0),
    COALESCE(SUM(amount), 0),
    COALESCE(SUM((metadata->>'payout')::numeric), 0),
    COALESCE(SUM(COALESCE((metadata->>'payout')::numeric, 0) - amount), 0)
  INTO v_total_bets, v_total_wins, v_total_wagered, v_total_payout, v_total_profit
  FROM public.wallet_transactions
  WHERE user_id = p_user_id AND (type = 'BET' OR game IS NOT NULL);

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', achievement_id,
    'unlocked', unlocked,
    'progress', progress
  )), '[]'::jsonb)
  INTO v_achievements
  FROM public.user_achievements
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'totalBets', v_total_bets,
    'totalWins', v_total_wins,
    'totalWagered', v_total_wagered,
    'totalPayout', v_total_payout,
    'totalProfit', v_total_profit,
    'winRate', CASE WHEN v_total_bets > 0 THEN round((v_total_wins::numeric / v_total_bets::numeric) * 100, 1) ELSE 0 END,
    'achievements', v_achievements
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_stats(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_stats(TEXT) TO service_role;
