-- P34 / 2.12: Guild Core System (guilds, guild_members, guild_invites)
--
-- Provides tables, triggers, constraints and RLS policies for guilds, memberships, and invites.
-- Client writes are strictly routed via service_role in authenticated API routes.

-- ============================================================================
-- 1. Table: public.guilds
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL CHECK (char_length(name) BETWEEN 3 AND 30),
  tag TEXT UNIQUE NOT NULL CHECK (tag = upper(tag) AND char_length(tag) BETWEEN 2 AND 5),
  description TEXT CHECK (char_length(description) <= 500),
  created_by TEXT NOT NULL REFERENCES public.users(id),
  member_count INTEGER NOT NULL DEFAULT 1 CHECK (member_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guilds_name ON public.guilds (name);
CREATE INDEX IF NOT EXISTS idx_guilds_tag ON public.guilds (tag);
CREATE INDEX IF NOT EXISTS idx_guilds_member_count ON public.guilds (member_count DESC);

-- ============================================================================
-- 2. Table: public.guild_members
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.guild_members (
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'officer', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (guild_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_guild_members_user_id ON public.guild_members (user_id);
CREATE INDEX IF NOT EXISTS idx_guild_members_guild_id ON public.guild_members (guild_id);

-- Trigger: Exactly one leader per guild
CREATE OR REPLACE FUNCTION public.enforce_single_guild_leader()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.role = 'leader' THEN
    IF EXISTS (
      SELECT 1 FROM public.guild_members
      WHERE guild_id = NEW.guild_id
        AND role = 'leader'
        AND (TG_OP = 'INSERT' OR user_id <> NEW.user_id)
    ) THEN
      RAISE EXCEPTION 'Guild already has a leader';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_single_guild_leader ON public.guild_members;
CREATE TRIGGER trg_enforce_single_guild_leader
  BEFORE INSERT OR UPDATE ON public.guild_members
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_single_guild_leader();

-- Trigger: Maintain member_count on guilds atomically
CREATE OR REPLACE FUNCTION public.update_guild_member_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.guilds
    SET member_count = (
      SELECT count(*)::integer FROM public.guild_members WHERE guild_id = NEW.guild_id
    ),
    updated_at = now()
    WHERE id = NEW.guild_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.guilds
    SET member_count = (
      SELECT count(*)::integer FROM public.guild_members WHERE guild_id = OLD.guild_id
    ),
    updated_at = now()
    WHERE id = OLD.guild_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_guild_member_count ON public.guild_members;
CREATE TRIGGER trg_update_guild_member_count
  AFTER INSERT OR DELETE ON public.guild_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_guild_member_count();

-- ============================================================================
-- 3. Table: public.guild_invites
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.guild_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  invited_user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  invited_by TEXT NOT NULL REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'revoked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days')
);

CREATE INDEX IF NOT EXISTS idx_guild_invites_invited_user_id ON public.guild_invites (invited_user_id);
CREATE INDEX IF NOT EXISTS idx_guild_invites_guild_id ON public.guild_invites (guild_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_guild_invites_pending_unique
  ON public.guild_invites (guild_id, invited_user_id)
  WHERE (status = 'pending');

-- ============================================================================
-- 4. Row Level Security & Permissions
-- ============================================================================
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_invites ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.guilds FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.guild_members FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.guild_invites FROM PUBLIC, anon, authenticated;

-- Public read for guilds
DROP POLICY IF EXISTS "guilds_select_all" ON public.guilds;
CREATE POLICY "guilds_select_all"
  ON public.guilds
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated read for guild members (own record or members of the same guild)
DROP POLICY IF EXISTS "guild_members_select" ON public.guild_members;
CREATE POLICY "guild_members_select"
  ON public.guild_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()::text
    OR guild_id IN (
      SELECT gm.guild_id FROM public.guild_members gm WHERE gm.user_id = auth.uid()::text
    )
  );

-- Authenticated read for guild invites (own invite or leader/officer of inviting guild)
DROP POLICY IF EXISTS "guild_invites_select" ON public.guild_invites;
CREATE POLICY "guild_invites_select"
  ON public.guild_invites
  FOR SELECT
  TO authenticated
  USING (
    invited_user_id = auth.uid()::text
    OR guild_id IN (
      SELECT gm.guild_id FROM public.guild_members gm
      WHERE gm.user_id = auth.uid()::text AND gm.role IN ('leader', 'officer')
    )
  );

-- Grant select to anon/authenticated where policies allow
GRANT SELECT ON TABLE public.guilds TO anon, authenticated;
GRANT SELECT ON TABLE public.guild_members TO authenticated;
GRANT SELECT ON TABLE public.guild_invites TO authenticated;

-- Full access for service_role (all API mutations use service_role)
GRANT ALL ON TABLE public.guilds TO service_role;
GRANT ALL ON TABLE public.guild_members TO service_role;
GRANT ALL ON TABLE public.guild_invites TO service_role;
