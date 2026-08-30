-- Removes obsolete Guild database objects that pre-date Guild's removal.
-- Objects are named individually so unexpected dependencies stop the migration.

DROP TABLE IF EXISTS public.guild_invites;
DROP TABLE IF EXISTS public.guild_members;
DROP TABLE IF EXISTS public.guilds;

DROP FUNCTION IF EXISTS public.enforce_single_guild_leader();
DROP FUNCTION IF EXISTS public.update_guild_member_count();