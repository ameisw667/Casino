CREATE OR REPLACE FUNCTION public.calculate_bonus(p_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN 0;
END;
$$;
REVOKE ALL ON FUNCTION public.calculate_bonus(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_bonus(uuid) TO service_role;