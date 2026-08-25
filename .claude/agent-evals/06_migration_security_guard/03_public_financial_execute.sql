CREATE OR REPLACE FUNCTION public.settle_game_bet(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN '{}'::jsonb;
END;
$$;
GRANT EXECUTE ON FUNCTION public.settle_game_bet(uuid) TO PUBLIC, anon, authenticated;