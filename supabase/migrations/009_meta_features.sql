-- Meta-features security and canonical identity baseline.
-- Apply after 008_supabase_auth_bridge.sql with a privileged migration role.

DROP POLICY IF EXISTS "users_update_own" ON public.users;
REVOKE UPDATE ON TABLE public.users FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS public.user_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('clerk', 'supabase')),
  provider_user_id TEXT NOT NULL CHECK (provider_user_id <> '' AND length(provider_user_id) <= 255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_user_id),
  UNIQUE (user_id, provider)
);

CREATE TABLE IF NOT EXISTS public.identity_link_quarantine (
  provider TEXT NOT NULL CHECK (provider IN ('clerk', 'supabase')),
  provider_user_id TEXT NOT NULL CHECK (provider_user_id <> '' AND length(provider_user_id) <= 255),
  reason TEXT NOT NULL CHECK (reason IN ('EMAIL_MATCH_REQUIRES_CLAIM')),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  PRIMARY KEY (provider, provider_user_id),
  CHECK (
    (resolved_at IS NULL AND resolved_user_id IS NULL)
    OR (resolved_at IS NOT NULL AND resolved_user_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS public.admin_roles (
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'analyst', 'support')),
  granted_by TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

ALTER TABLE public.user_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identity_link_quarantine ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Canonical identity and authorization mappings are server-only. Intentionally
-- no browser RLS policy is created for either table.
REVOKE ALL ON TABLE public.user_identities FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.identity_link_quarantine FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.admin_roles FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.user_identities TO service_role;
GRANT SELECT ON TABLE public.identity_link_quarantine TO service_role;
GRANT SELECT ON TABLE public.admin_roles TO service_role;

CREATE INDEX IF NOT EXISTS idx_user_identities_user_id
  ON public.user_identities(user_id);
CREATE INDEX IF NOT EXISTS idx_identity_link_quarantine_unresolved
  ON public.identity_link_quarantine(detected_at DESC)
  WHERE resolved_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_admin_roles_role_user
  ON public.admin_roles(role, user_id);

CREATE OR REPLACE FUNCTION public.guard_canonical_user_provisioning()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_canonical_user_id TEXT;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.identity_link_quarantine
    WHERE provider = 'supabase'
      AND provider_user_id = NEW.id
      AND resolved_at IS NULL
  ) THEN
    RAISE EXCEPTION 'IDENTITY_CLAIM_REQUIRED' USING ERRCODE = '23514';
  END IF;

  SELECT user_id INTO v_canonical_user_id
  FROM public.user_identities
  WHERE provider = 'supabase' AND provider_user_id = NEW.id;

  IF FOUND AND v_canonical_user_id <> NEW.id THEN
    RAISE EXCEPTION 'CANONICAL_IDENTITY_REQUIRED' USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_canonical_user_provisioning()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS guard_canonical_user_provisioning ON public.users;
CREATE TRIGGER guard_canonical_user_provisioning
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_canonical_user_provisioning();

CREATE OR REPLACE FUNCTION public.link_user_identity(
  p_user_id TEXT,
  p_provider TEXT,
  p_provider_user_id TEXT
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_existing_user_id TEXT;
  v_existing_provider_user_id TEXT;
BEGIN
  IF p_user_id IS NULL OR p_user_id = ''
     OR p_provider NOT IN ('clerk', 'supabase')
     OR p_provider_user_id IS NULL OR p_provider_user_id = ''
     OR length(p_provider_user_id) > 255 THEN
    RAISE EXCEPTION 'INVALID_IDENTITY' USING ERRCODE = '22023';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_provider || ':' || p_provider_user_id, 0));

  SELECT user_id INTO v_existing_user_id
  FROM public.user_identities
  WHERE provider = p_provider AND provider_user_id = p_provider_user_id
  FOR UPDATE;

  IF FOUND THEN
    IF v_existing_user_id <> p_user_id THEN
      RAISE EXCEPTION 'IDENTITY_CONFLICT' USING ERRCODE = '23505';
    END IF;
    UPDATE public.identity_link_quarantine
    SET resolved_at = COALESCE(resolved_at, now()),
        resolved_user_id = p_user_id
    WHERE provider = p_provider AND provider_user_id = p_provider_user_id;
    RETURN v_existing_user_id;
  END IF;

  SELECT provider_user_id INTO v_existing_provider_user_id
  FROM public.user_identities
  WHERE user_id = p_user_id AND provider = p_provider
  FOR UPDATE;

  IF FOUND AND v_existing_provider_user_id <> p_provider_user_id THEN
    RAISE EXCEPTION 'IDENTITY_CONFLICT' USING ERRCODE = '23505';
  END IF;

  BEGIN
    INSERT INTO public.user_identities (user_id, provider, provider_user_id)
    VALUES (p_user_id, p_provider, p_provider_user_id);
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'IDENTITY_CONFLICT' USING ERRCODE = '23505';
  END;

  UPDATE public.identity_link_quarantine
  SET resolved_at = COALESCE(resolved_at, now()),
      resolved_user_id = p_user_id
  WHERE provider = p_provider AND provider_user_id = p_provider_user_id;

  RETURN p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.link_user_identity(TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.link_user_identity(TEXT, TEXT, TEXT)
  TO service_role;

-- Extend the native-auth trigger installed by migration 008. Identity linking
-- is based only on the provider subject; email is never used for account merge.
CREATE OR REPLACE FUNCTION public.handle_new_supabase_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_canonical_user_id TEXT;
  v_normalized_email TEXT;
BEGIN
  -- A privileged pre-link claims this provider subject for an existing
  -- canonical user. Never create a second users row or wallet in that case.
  SELECT user_id INTO v_canonical_user_id
  FROM public.user_identities
  WHERE provider = 'supabase' AND provider_user_id = NEW.id::text
  FOR UPDATE;

  IF FOUND THEN
    UPDATE public.identity_link_quarantine
    SET resolved_at = COALESCE(resolved_at, now()),
        resolved_user_id = v_canonical_user_id
    WHERE provider = 'supabase' AND provider_user_id = NEW.id::text;
    RETURN NEW;
  END IF;

  v_normalized_email := lower(btrim(COALESCE(NEW.email, '')));
  IF v_normalized_email <> '' THEN
    PERFORM pg_advisory_xact_lock(
      hashtextextended('identity-email:' || v_normalized_email, 0)
    );

    -- Email is only a conflict signal. It never selects or links a canonical
    -- identity because ownership must be reviewed and claimed explicitly.
    IF EXISTS (
      SELECT 1
      FROM public.users
      WHERE id <> NEW.id::text
        AND email IS NOT NULL
        AND lower(btrim(email)) = v_normalized_email
    ) THEN
      INSERT INTO public.identity_link_quarantine (
        provider,
        provider_user_id,
        reason,
        detected_at,
        resolved_at,
        resolved_user_id
      ) VALUES (
        'supabase',
        NEW.id::text,
        'EMAIL_MATCH_REQUIRES_CLAIM',
        now(),
        NULL,
        NULL
      )
      ON CONFLICT (provider, provider_user_id) DO UPDATE
      SET reason = EXCLUDED.reason,
          detected_at = now(),
          resolved_at = NULL,
          resolved_user_id = NULL;
      RETURN NEW;
    END IF;
  END IF;

  INSERT INTO public.users (id, username, email)
  VALUES (
    NEW.id::text,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  PERFORM public.link_user_identity(NEW.id::text, 'supabase', NEW.id::text);
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_new_supabase_user()
  FROM PUBLIC, anon, authenticated;

-- Stop before backfill if existing rows appear to represent the same person
-- across the legacy Clerk and Supabase ID formats. Email is a conflict signal
-- only: migration operators must explicitly claim a canonical user.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.users legacy_user
    JOIN public.users supabase_user
      ON legacy_user.id < supabase_user.id
     AND lower(btrim(COALESCE(legacy_user.email, ''))) =
         lower(btrim(COALESCE(supabase_user.email, '')))
    WHERE lower(btrim(COALESCE(legacy_user.email, ''))) <> ''
      AND (
        legacy_user.id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      ) <> (
        supabase_user.id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      )
  ) THEN
    RAISE EXCEPTION 'CROSS_PROVIDER_IDENTITY_CONFLICT' USING ERRCODE = '23514';
  END IF;
END;
$$;

-- Backfill existing provider subjects without an email-based heuristic. A
-- uniqueness conflict aborts the migration as IDENTITY_CONFLICT.
DO $$
DECLARE
  v_user RECORD;
BEGIN
  FOR v_user IN SELECT id FROM public.users LOOP
    IF v_user.id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
      PERFORM public.link_user_identity(v_user.id, 'supabase', v_user.id);
    ELSE
      PERFORM public.link_user_identity(v_user.id, 'clerk', v_user.id);
    END IF;
  END LOOP;
END;
$$;

-- Disable every pre-007 balance/progression write path, including any grant
-- left behind by an earlier deployment.
REVOKE ALL ON FUNCTION public.place_bet(TEXT, NUMERIC, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.settle_bet(TEXT, NUMERIC, INTEGER, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.migrate_anonymous_session(TEXT, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.upsert_anonymous_session(TEXT, BIGINT, INTEGER, TEXT, NUMERIC)
  FROM PUBLIC, anon, authenticated, service_role;
