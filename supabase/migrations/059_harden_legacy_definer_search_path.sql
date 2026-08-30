-- Migration 059: Quarantine legacy SECURITY DEFINER wallet RPCs.
-- The application uses only the atomic replacement RPCs. Keep these legacy
-- definitions inaccessible to all externally used roles while hardening lookup.

ALTER FUNCTION public.place_bet(text, numeric, text)
  SET search_path TO public, pg_temp;

ALTER FUNCTION public.settle_bet(text, numeric, integer, text)
  SET search_path TO public, pg_temp;

REVOKE ALL ON FUNCTION public.place_bet(text, numeric, text)
  FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.settle_bet(text, numeric, integer, text)
  FROM PUBLIC, anon, authenticated, service_role;