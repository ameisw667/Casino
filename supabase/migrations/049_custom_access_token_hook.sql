-- 049_custom_access_token_hook.sql
-- Custom Access Token (JWT) Hook for Supabase GoTrue
-- Injects vip_tier, vip_level, and user_role into claims.app_metadata.
-- Fail-safe: wrapped in EXCEPTION WHEN OTHERS to guarantee zero login disruption.

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  claims jsonb;
  user_rank text;
  user_level integer;
  user_role text;
  uid text;
BEGIN
  -- Extract claims object and user_id from GoTrue event payload
  claims := event->'claims';
  uid := event->>'user_id';

  -- Query user data from public.users
  SELECT rank, level, role
  INTO user_rank, user_level, user_role
  FROM public.users
  WHERE id = uid;

  -- Ensure app_metadata container exists
  IF claims->'app_metadata' IS NULL THEN
    claims := jsonb_set(claims, '{app_metadata}', '{}'::jsonb);
  END IF;

  -- Inject claims into app_metadata (tamper-proof server-controlled container)
  claims := jsonb_set(claims, '{app_metadata,vip_tier}', to_jsonb(COALESCE(user_rank, 'BRONZE')));
  claims := jsonb_set(claims, '{app_metadata,vip_level}', to_jsonb(COALESCE(user_level, 1)));
  claims := jsonb_set(claims, '{app_metadata,user_role}', to_jsonb(COALESCE(user_role, 'authenticated')));

  -- Update event with enriched claims
  event := jsonb_set(event, '{claims}', claims);
  RETURN event;

EXCEPTION WHEN OTHERS THEN
  -- Fail-safe fallback: return original event unmodified
  RETURN event;
END;
$$;

-- Grant execution to supabase_auth_admin (the GoTrue hook runner)
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;
GRANT SELECT ON TABLE public.users TO supabase_auth_admin;

-- Revoke from untrusted clients
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM PUBLIC, anon, authenticated;

COMMENT ON FUNCTION public.custom_access_token_hook(jsonb) IS 'Supabase GoTrue Auth Hook: Injects VIP tier, level, and role into JWT app_metadata with fail-safe fallback.';
