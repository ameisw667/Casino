-- =====================================================================
-- VERIFY MIGRATIONS APPLIED — read-only (v2, fehlerbereinigt)
-- Zweck: Prüfen, ob Migration 003 + 007 (+ Abhängigkeiten) remote live sind,
--        damit C2 (Migrationen 014/015/016) sicher ausgerollt werden kann.
-- Ausführung: Supabase SQL Editor → Projekt hmqwozhdckbwjqzcmire → Run.
-- Sicherheit: Nur SELECT auf information_schema / pg_catalog. Keine Writes.
-- Fix v2: rowsecurity aus pg_tables (nicht information_schema);
--         ACL-Auswertung via pg_proc.proacl statt has_function_privilege.
-- =====================================================================

-- --- QUERY 1: Objekt-Existenz je Migration ----------------------------
WITH expected AS (
    SELECT * FROM (VALUES
        ('001', 'users',                  'table'),
        ('002', 'wallet_transactions',     'table'),
        ('002', 'game_sessions',           'table'),
        ('003', 'seeds',                   'table'),
        ('004', 'vip_tiers',               'table'),
        ('004', 'ranks',                   'table'),
        ('005', 'anonymous_sessions',      'table'),
        ('006', 'game_configs',            'table'),
        ('007', 'game_rounds',             'table'),
        ('007', 'settle_game_bet',         'function'),
        ('007', 'start_game_round',        'function'),
        ('007', 'settle_game_round',       'function'),
        ('007', 'advance_blackjack_round', 'function'),
        ('007', 'casino_rank_for_level',   'function'),
        ('008', 'on_auth_user_created',     'trigger'),
        ('009', 'user_identities',         'table'),
        ('009', 'identity_link_quarantine', 'table'),
        ('009', 'admin_roles',             'table'),
        ('010', 'casino_xp_level_divisor',  'function'),
        ('012', 'promo_codes',             'table'),
        ('012', 'promo_code_redemptions',  'table'),
        ('013', 'user_achievements',       'table'),
        ('013', 'get_user_stats',          'function'),
        ('013', 'sync_user_achievement',   'function'),
        ('014', 'get_user_stats',          'function'),
        ('015', 'get_leaderboard',         'function'),
        ('016-abh', 'chat_messages',       'table'),
        ('016-abh', 'community_goal',      'table'),
        ('016-abh', 'live_bets',           'table')
    ) AS v(migration, objekt, typ)
)
SELECT
    e.migration                          AS migration,
    e.objekt                             AS objekt,
    e.typ                                AS typ,
    CASE e.typ
        WHEN 'table'   THEN EXISTS (
            SELECT 1 FROM information_schema.tables t
            WHERE t.table_schema = 'public' AND t.table_name = e.objekt
        )
        WHEN 'function' THEN EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public' AND p.proname = e.objekt
        )
        WHEN 'trigger'  THEN EXISTS (
            SELECT 1 FROM pg_trigger t
            WHERE NOT t.tgisinternal AND t.tgname = e.objekt
        )
    END                                  AS vorhanden
FROM expected e
ORDER BY e.migration, e.typ, e.objekt;

-- --- QUERY 2: RLS-Status kritischer Tabellen --------------------------
SELECT
    tablename                            AS tabelle,
    rowsecurity                          AS rls_aktiv
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'wallet_transactions', 'seeds', 'game_rounds', 'game_sessions')
ORDER BY tablename;

-- --- QUERY 3: Legacy-RPC ACL (Migration 011 REVOKE-Check) ------------
-- Interpretation:
--   proacl = NULL  -> Default-ACL (PUBLIC hat EXECUTE) => 011 NICHT angewandt
--   proacl gesetzt (z.B. {postgres=X/postgres}) -> EXECUTE entzogen => 011 OK
--   keine Zeile  -> Funktion existiert nicht (ggf. gedropped) => neutral
SELECT
    proname                              AS funktion,
    proacl                               AS acl,
    CASE
        WHEN proacl IS NULL THEN 'DEFAULT (PUBLIC EXECUTE) -> 011 vermutlich NICHT angewandt'
        ELSE 'ACL gesetzt -> 011 vermutlich angewandt'
    END                                  AS bewertung
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND proname IN ('place_bet', 'settle_bet')
ORDER BY proname;