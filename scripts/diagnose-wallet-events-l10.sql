-- Diagnose für L10 (worldmap/05_OutboxWallet.md): prüft, ob die letzten Dice-Bets über die
-- neue settle_game_bet-Version liefen und ob wallet_events wirklich leer ist.
-- Nur lesend, keine Änderung.

SELECT id, balance, xp, level, rank, updated_at
FROM users
ORDER BY updated_at DESC
LIMIT 3;

SELECT id, user_id, game, type, amount, balance_after, request_id, created_at
FROM wallet_transactions
ORDER BY created_at DESC
LIMIT 5;

SELECT id, user_id, request_id, event_type, xp_gain, processed_at, attempts, last_error, created_at
FROM wallet_events
ORDER BY created_at DESC
LIMIT 5;
