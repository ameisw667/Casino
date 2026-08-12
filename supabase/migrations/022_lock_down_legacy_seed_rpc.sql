-- F-06 / B-06: the legacy seed bootstrapper is SECURITY DEFINER and accepts a
-- caller-supplied user id. It is retained only for server-side compatibility.
-- Browser roles must never execute it.

REVOKE ALL ON FUNCTION public.get_or_create_user_seed(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_user_seed(TEXT) TO service_role;
