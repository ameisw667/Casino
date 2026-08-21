-- Diagnose Teil 2: zeigt die tatsächlich aktive settle_game_bet-Definition in der DB
-- und die xp-Konfigurationszeile. Nur lesend.

SELECT pg_get_functiondef(p.oid) AS active_settle_game_bet_definition
FROM pg_proc p
WHERE p.proname = 'settle_game_bet';

SELECT category, config_key, value, is_active
FROM game_configs
WHERE category = 'xp';
