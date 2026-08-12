-- ============================================================
-- Migration 020: Drop orphan get_user_stats(uuid) overload
-- ============================================================
-- Root cause of initiative 1.7 (/stats page) returning empty data after
-- migration 018 was rolled out: a get_user_stats(p_user_id uuid) function
-- exists live in the database with no corresponding migration file in this
-- repo (a manual/experimental artifact, never captured or dropped). Every
-- call site in the codebase uses TEXT (users.id is TEXT — see CLAUDE.md),
-- matching the intended public.get_user_stats(p_user_id TEXT) from migration
-- 013/014/018. With both overloads present, PostgREST cannot disambiguate a
-- JSON string argument between text and uuid and fails every call with
-- PGRST203, which WalletService.getUserStats() silently swallowed into a
-- zeroed fail-closed default (no prior error logging on that path — also
-- fixed in src/lib/casino/wallet.ts alongside this migration).
--
-- This migration only removes the unused uuid overload. The TEXT function
-- itself is untouched — no behavior change to any working call path.
-- ============================================================

DROP FUNCTION IF EXISTS public.get_user_stats(uuid);
