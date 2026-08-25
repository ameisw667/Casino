CREATE OR REPLACE FUNCTION public.calculate_bonus(p_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN 0;
END;
$$;