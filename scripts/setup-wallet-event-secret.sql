-- Manuell einmalig im Supabase SQL Editor auf dem Remote-Projekt (hmqwozhdckbwjqzcmire)
-- ausführen — NICHT als nummerierte Migration, damit der Secret-Wert nie im Repo landet.
-- Teil von worldmap/05_OutboxWallet.md, Meilenstein L7.
--
-- 1. Starkes Secret generieren, z.B. lokal in PowerShell:
--      -join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })
--    oder mit Git-Bash/OpenSSL: openssl rand -hex 32
-- 2. Den generierten Wert unten anstelle von <GENERATE_A_STRONG_RANDOM_SECRET> einsetzen.
-- 3. Diesen Block im Supabase SQL Editor ausführen.
-- 4. Denselben Wert als WALLET_EVENT_SECRET in Vercel (Production + Preview) und in
--    .env.local eintragen (L8) — muss exakt mit dem hier gespeicherten Wert übereinstimmen.

SELECT vault.create_secret(
  '<GENERATE_A_STRONG_RANDOM_SECRET>',
  'wallet_event_secret',
  'Shared secret for the pg_net -> /api/internal/wallet-events push (worldmap/05_OutboxWallet.md)'
);

-- Zur Kontrolle (zeigt den Klartext NICHT an, nur dass der Eintrag existiert):
-- SELECT name, created_at FROM vault.secrets WHERE name = 'wallet_event_secret';
