-- Migration 041: Dynamisches Tägliches Turnier (Daily Race) — P26/2.11
-- worldmap/05_DAILY_TOURNAMENT.md L1-L3. Ersetzt die statischen Dummy-Top-3-Spieler in
-- DailyTournamentTeaser.tsx durch eine serverautoritative Live-Rangliste des laufenden
-- UTC-Tages plus automatisierte Mitternachts-Preisgeldauszahlung ($5.000/$3.000/$2.000).
--
-- Bewusst KEIN Contribution-Pool wie beim Jackpot (032-035): Jan-Entscheidung war direkte
-- Gutschrift (Promo-Code-Muster) statt eines bet-gespeisten Pools. Dadurch schreibt diese
-- Initiative nirgends in settle_game_bet/settle_game_round/advance_blackjack_round — die
-- Rangliste wird ausschließlich lesend aus wallet_transactions/game_rounds aggregiert
-- (identisches Muster wie get_leaderboard, 015_get_leaderboard.sql, nur tageseingegrenzt).
-- Vermeidet damit die Singleton-Row-Contention, die beim Jackpot-Lasttest (L6,
-- docs/archive/01_LiveProgressiveJackpot.md) +230% p95-Regression verursacht hat.

-- ============================================================================
-- L1: Idempotenz-Anker + Gewinner-Nachweis
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.daily_races (
    race_date          DATE PRIMARY KEY,
    total_wagered       NUMERIC(20,2) NOT NULL DEFAULT 0,
    participant_count   INTEGER NOT NULL DEFAULT 0,
    settled_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.daily_race_winners (
    race_date  DATE NOT NULL REFERENCES public.daily_races(race_date) ON DELETE CASCADE,
    rank       SMALLINT NOT NULL CHECK (rank IN (1, 2, 3)),
    user_id    TEXT NOT NULL REFERENCES public.users(id),
    wagered    NUMERIC(20,2) NOT NULL CHECK (wagered >= 0),
    prize      NUMERIC(20,2) NOT NULL CHECK (prize > 0),
    PRIMARY KEY (race_date, rank)
);

ALTER TABLE public.daily_races ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_race_winners ENABLE ROW LEVEL SECURITY;
-- Keine Policies: identisch zu jackpot_pool/risk_events — Zugriff ausschließlich über die
-- SECURITY DEFINER-RPCs unten, kein direktes service_role-Tabellen-Grant.

-- ============================================================================
-- L2: Read-RPC — live Aggregation, kein neuer Write im Bet-Pfad
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_daily_race_standings()
RETURNS TABLE(rank INTEGER, username TEXT, wagered NUMERIC, prize NUMERIC)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  WITH bounds AS (
    SELECT date_trunc('day', now() AT TIME ZONE 'utc') AT TIME ZONE 'utc' AS day_start
  ),
  today AS (
    SELECT user_id, SUM(wagered) AS wagered, MAX(bet_at) AS last_bet_at
    FROM (
      SELECT user_id,
        COALESCE(
          NULLIF((metadata -> 'response' ->> 'betAmount')::numeric, 0),
          NULLIF((metadata -> 'response' -> 'result' ->> 'amount')::numeric, 0),
          CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END
        ) AS wagered,
        created_at AS bet_at
      FROM public.wallet_transactions, bounds
      WHERE type = 'bet_settled'
        AND created_at >= bounds.day_start
        AND created_at < bounds.day_start + interval '1 day'

      UNION ALL

      SELECT user_id, bet_amount AS wagered, updated_at AS bet_at
      FROM public.game_rounds, bounds
      WHERE status = 'SETTLED'
        AND updated_at >= bounds.day_start
        AND updated_at < bounds.day_start + interval '1 day'
    ) c
    GROUP BY user_id
  )
  SELECT
    ROW_NUMBER() OVER (ORDER BY t.wagered DESC, t.last_bet_at ASC)::INTEGER AS rank,
    u.username,
    ROUND(t.wagered, 2) AS wagered,
    (ARRAY[5000.00, 3000.00, 2000.00])[ROW_NUMBER() OVER (ORDER BY t.wagered DESC, t.last_bet_at ASC)] AS prize
  FROM today t
  JOIN public.users u ON u.id = t.user_id
  ORDER BY t.wagered DESC, t.last_bet_at ASC
  LIMIT 3;
$$;

REVOKE ALL ON FUNCTION public.get_daily_race_standings() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_daily_race_standings() TO service_role;

-- ============================================================================
-- L3: Settlement-RPC — Mitternachts-Auszahlung, idempotent gegen Retry
-- ============================================================================

CREATE OR REPLACE FUNCTION public.settle_daily_race()
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_race_date DATE;
  v_day_start TIMESTAMPTZ;
  v_day_end   TIMESTAMPTZ;
  v_winner    RECORD;
  v_user      users%ROWTYPE;
  v_new_bal   NUMERIC(20,2);
  v_prize     NUMERIC(20,2);
  v_winners   JSONB := '[]'::jsonb;
  v_total     NUMERIC(20,2) := 0;
  v_count     INTEGER := 0;
BEGIN
  -- Settlement läuft um 00:00 UTC für den Tag, der gerade zu Ende gegangen ist.
  v_day_start := date_trunc('day', (now() AT TIME ZONE 'utc') - interval '1 day') AT TIME ZONE 'utc';
  v_day_end   := v_day_start + interval '1 day';
  v_race_date := v_day_start::date;

  -- Idempotenz-Anker: FOUND=false nach ON CONFLICT DO NOTHING => Tag bereits abgerechnet.
  INSERT INTO public.daily_races (race_date) VALUES (v_race_date)
  ON CONFLICT (race_date) DO NOTHING;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', true, 'alreadySettled', true, 'raceDate', v_race_date);
  END IF;

  FOR v_winner IN
    WITH today AS (
      SELECT user_id, SUM(wagered) AS wagered, MAX(bet_at) AS last_bet_at
      FROM (
        SELECT user_id,
          COALESCE(
            NULLIF((metadata -> 'response' ->> 'betAmount')::numeric, 0),
            NULLIF((metadata -> 'response' -> 'result' ->> 'amount')::numeric, 0),
            CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END
          ) AS wagered,
          created_at AS bet_at
        FROM public.wallet_transactions
        WHERE type = 'bet_settled' AND created_at >= v_day_start AND created_at < v_day_end
        UNION ALL
        SELECT user_id, bet_amount, updated_at
        FROM public.game_rounds
        WHERE status = 'SETTLED' AND updated_at >= v_day_start AND updated_at < v_day_end
      ) c
      GROUP BY user_id
    )
    SELECT user_id, wagered, last_bet_at,
      ROW_NUMBER() OVER (ORDER BY wagered DESC, last_bet_at ASC) AS rnk
    FROM today
    ORDER BY wagered DESC, last_bet_at ASC
    LIMIT 3
  LOOP
    SELECT * INTO v_user FROM public.users WHERE id = v_winner.user_id FOR UPDATE;
    IF NOT FOUND THEN CONTINUE; END IF;

    v_prize := (ARRAY[5000.00, 3000.00, 2000.00])[v_winner.rnk];
    v_new_bal := round((v_user.balance + v_prize)::numeric, 2);

    UPDATE public.users SET balance = v_new_bal, updated_at = now() WHERE id = v_winner.user_id;
    INSERT INTO public.wallet_transactions (user_id, game, type, amount, balance_after, metadata)
    VALUES (v_winner.user_id, 'bonus', 'bonus', v_prize, v_new_bal,
      jsonb_build_object('source', 'daily_race', 'raceDate', v_race_date, 'rank', v_winner.rnk, 'wagered', round(v_winner.wagered, 2)));
    INSERT INTO public.daily_race_winners (race_date, rank, user_id, wagered, prize)
    VALUES (v_race_date, v_winner.rnk, v_winner.user_id, round(v_winner.wagered, 2), v_prize);

    v_winners := v_winners || jsonb_build_object('rank', v_winner.rnk, 'userId', v_winner.user_id, 'prize', v_prize);
    v_total := v_total + v_winner.wagered;
    v_count := v_count + 1;
  END LOOP;

  UPDATE public.daily_races SET total_wagered = round(v_total, 2), participant_count = v_count WHERE race_date = v_race_date;
  RETURN jsonb_build_object('ok', true, 'raceDate', v_race_date, 'winners', v_winners);
END;
$$;

REVOKE ALL ON FUNCTION public.settle_daily_race() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_daily_race() TO service_role;

-- Fehler-Alert-Wrapper + Cron, 1:1-Muster aus 027_guide_telemetry_purge_cron.sql
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.run_daily_race_settlement_job()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, vault, pg_temp
AS $$
DECLARE
    v_alert_secret TEXT;
BEGIN
    PERFORM public.settle_daily_race();
EXCEPTION WHEN OTHERS THEN
    SELECT decrypted_secret INTO v_alert_secret
    FROM vault.decrypted_secrets
    WHERE name = 'cron_alert_secret'
    LIMIT 1;

    IF v_alert_secret IS NOT NULL THEN
        PERFORM net.http_post(
            url := 'https://casino-xi-six.vercel.app/api/internal/cron-alert',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'x-cron-alert-secret', v_alert_secret
            ),
            body := jsonb_build_object(
                'job', 'daily_race_settlement',
                'error', left(SQLERRM, 500)
            )
        );
    END IF;
    -- Swallowed deliberately, wie im Purge-Cron-Vorbild: pg_cron hat kein Retry/Backoff,
    -- ein Re-Raise würde nur identische Fehler beim nächsten Lauf erneut spammen.
END;
$$;

REVOKE ALL ON FUNCTION public.run_daily_race_settlement_job() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.run_daily_race_settlement_job() TO service_role;

-- Idempotent (re)scheduling, damit diese Migration sicher erneut angewendet werden kann.
DO $$
BEGIN
    PERFORM cron.unschedule('daily-race-settlement');
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

SELECT cron.schedule(
    'daily-race-settlement',
    '0 0 * * *',
    $$SELECT public.run_daily_race_settlement_job();$$
);
