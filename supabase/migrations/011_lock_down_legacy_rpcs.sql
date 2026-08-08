-- CRITICAL security fix, found during the A1 remote verification pass
-- (worldmap/04_WALLET_ECONOMY.md, Befund W8).
--
-- place_bet/settle_bet (003_provably_fair.sql) and migrate_anonymous_session/
-- upsert_anonymous_session (005_anonymous_sessions.sql) are SECURITY DEFINER
-- functions that were never locked down with REVOKE/GRANT, unlike every
-- function introduced in 007_server_authority.sql. By default in Postgres,
-- a newly created function is executable by PUBLIC — which in a Supabase
-- project means the `anon` role, reachable by anyone holding the public
-- anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY, embedded in every page load).
--
-- Verified live and exploitable on 2026-08-08 (non-mutating proof, no real
-- user affected): a direct POST to /rest/v1/rpc/place_bet with a
-- deliberately nonexistent user_id returned the function's own business
-- exception ("Insufficient balance", Postgres error P0001) instead of a
-- permission-denied error (42501) — proving the call reached and executed
-- the function body under the anon role. The same structural gap (grep:
-- 0 REVOKE/GRANT statements in either source file) applies to settle_bet
-- and both anonymous-session functions.
--
-- Impact: place_bet/settle_bet operate directly on users.balance with a
-- caller-supplied user_id and no ownership check — an unauthenticated
-- caller could credit/debit ANY user's real balance. migrate_anonymous_session/
-- upsert_anonymous_session can inflate any user's xp/level/rank/rakeback_pool
-- via a caller-controlled anonymous_sessions row, again with no ownership
-- check on p_user_id.
--
-- Fix: none of these four functions are called by current app code.
-- place_bet/settle_bet were fully superseded by settle_game_bet (Migration
-- 007) — CLAUDE.md already documents "Die alte place_bet()/settle_bet()-Kette
-- darf von neuem Spielcode nicht verwendet werden". migrate_anonymous_session/
-- upsert_anonymous_session are only ever invoked from
-- useCasinoStore.syncAnonymousSession()/migrateAnonymousSession(), both of
-- which are permanently disabled no-ops (see worldmap/04_WALLET_ECONOMY.md).
-- Revoking PUBLIC/anon/authenticated execute access is therefore a pure
-- security hardening with zero functional regression for the running app.

REVOKE ALL ON FUNCTION place_bet(TEXT, DECIMAL, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION settle_bet(TEXT, DECIMAL, INTEGER, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION migrate_anonymous_session(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION upsert_anonymous_session(TEXT, BIGINT, INTEGER, TEXT, DECIMAL) FROM PUBLIC, anon, authenticated;

-- No service_role GRANT is added: nothing in the current codebase calls
-- these four functions anymore (verified by grep — 0 callers outside their
-- own migration files and the permanently-disabled store no-ops). If a
-- future session needs place_bet/settle_bet-equivalent behavior again, it
-- should call the modern settle_game_bet/start_game_round/settle_game_round
-- RPCs from Migration 007 instead of re-granting these legacy functions.
