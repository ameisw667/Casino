-- L4 (worldmap/01_LiveProgressiveJackpot.md): oeffentlicher Read-Endpoint fuer
-- den Jackpot-Pool-Stand. jackpot_pool hat kein direktes service_role-Grant
-- (wie risk_events, gleiches Muster) -- Zugriff ausschliesslich ueber diese
-- schreibgeschuetzte SECURITY DEFINER-Funktion mit einer engen Feld-Allowlist.
-- last_winner_id, contribution_rate, win_probability und seed_amount sind
-- interne/Tuning-Werte bzw. eine User-Referenz und werden bewusst NICHT
-- zurueckgegeben.

CREATE OR REPLACE FUNCTION get_jackpot_pool_public()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT jsonb_build_object(
    'currentAmount', current_amount,
    'lastWonAt', last_won_at
  )
  FROM public.jackpot_pool
  WHERE id = 1;
$$;

REVOKE ALL ON FUNCTION get_jackpot_pool_public() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION get_jackpot_pool_public() TO service_role;
