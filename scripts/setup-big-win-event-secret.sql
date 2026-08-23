-- Manuell einmalig im Supabase SQL Editor auf dem Remote-Projekt (hmqwozhdckbwjqzcmire)
-- ausgeführt — NICHT als nummerierte Migration, damit der Secret-Wert nie im Repo landet.
-- Teil von P29/4.3, Meilenstein L6 — vollständiger Nachweis: docs/archive/05_EventBusBigWinConsumer.md.
-- Bereits ausgeführt (2026-08-23); Datei bleibt als Vorlage/Referenz im Repo (Muster:
-- scripts/setup-wallet-event-secret.sql für 4.1).
--
-- 1. Starkes Secret generieren, z.B. lokal in PowerShell:
--      -join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })
--    oder mit Git-Bash/OpenSSL: openssl rand -hex 32
-- 2. Den generierten Wert unten anstelle von <GENERATE_A_STRONG_RANDOM_SECRET> einsetzen.
-- 3. Diesen Block im Supabase SQL Editor ausführen.
-- 4. Denselben Wert als BIG_WIN_EVENT_SECRET in Vercel (Production + Preview) und in
--    .env.local eintragen (Schritt 2) — muss exakt mit dem hier gespeicherten Wert
--    übereinstimmen. Darf NICHT mit WALLET_EVENT_SECRET übereinstimmen (eigene, dedizierte
--    Blast-Radius-Klasse — genau das ist der Isolations-Zweck von 4.3).

SELECT vault.create_secret(
  '<GENERATE_A_STRONG_RANDOM_SECRET>',
  'big_win_event_secret',
  'Shared secret for the pg_net -> /api/internal/big-win-events push (worldmap/05_event_bus_statt_outbox.md)'
);

-- Zur Kontrolle (zeigt den Klartext NICHT an, nur dass der Eintrag existiert):
-- SELECT name, created_at FROM vault.secrets WHERE name = 'big_win_event_secret';
