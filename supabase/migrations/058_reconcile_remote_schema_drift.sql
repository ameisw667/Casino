-- Migration 058: Reconcile the reviewed remote schema drift.
-- Source: K6-A supabase db diff --linked (2026-08-29).
-- No destructive or legacy-feature operation.

SET local check_function_bodies = off;

REVOKE ALL ON TABLE "public"."promo_codes" FROM "anon";

REVOKE ALL ON TABLE "public"."promo_codes" FROM "authenticated";

COMMENT ON FUNCTION "public"."custom_access_token_hook"(jsonb) IS NULL;

CREATE OR REPLACE FUNCTION public.admin_update_user (
  p_actor_id       text,
  p_target_user_id text,
  p_request_id     uuid,
  p_reason         text,
  p_balance        numeric DEFAULT NULL::numeric,
  p_xp             numeric DEFAULT NULL::numeric,
  p_level          integer DEFAULT NULL::integer,
  p_rank           text    DEFAULT NULL::text
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
DECLARE
  v_user public.users%ROWTYPE;
  v_existing public.wallet_transactions%ROWTYPE;
  v_new_balance NUMERIC(20, 2);
  v_new_xp BIGINT;
  v_new_level INTEGER;
  v_new_rank TEXT;
  v_delta NUMERIC(20, 2);
  v_transaction_id UUID;
  v_metadata JSONB;
  v_response JSONB;
BEGIN
  IF p_actor_id IS NULL OR length(trim(p_actor_id)) = 0
    OR p_target_user_id IS NULL OR length(trim(p_target_user_id)) = 0
    OR p_request_id IS NULL OR p_reason IS NULL OR length(trim(p_reason)) = 0
  THEN
    RAISE EXCEPTION 'Admin audit context is required';
  END IF;
  IF p_balance IS NULL AND p_xp IS NULL AND p_level IS NULL AND p_rank IS NULL THEN
    RAISE EXCEPTION 'No update fields provided';
  END IF;
  IF p_balance IS NOT NULL AND p_balance < 0 THEN
    RAISE EXCEPTION 'Invalid balance';
  END IF;
  IF p_xp IS NOT NULL AND p_xp < 0 THEN
    RAISE EXCEPTION 'Invalid xp';
  END IF;
  IF p_level IS NOT NULL AND p_level < 1 THEN
    RAISE EXCEPTION 'Invalid level';
  END IF;
  IF p_rank IS NOT NULL AND length(trim(p_rank)) = 0 THEN
    RAISE EXCEPTION 'Invalid rank';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_target_user_id, 0));

  SELECT * INTO v_existing
  FROM public.wallet_transactions
  WHERE user_id = p_target_user_id AND request_id = p_request_id;
  IF FOUND AND v_existing.type = 'admin_adjust' THEN
    SELECT * INTO v_user FROM public.users WHERE id = p_target_user_id;
    RETURN jsonb_build_object(
      'user', jsonb_build_object(
        'id', v_user.id, 'username', v_user.username, 'email', v_user.email,
        'balance', v_user.balance, 'xp', v_user.xp, 'level', v_user.level, 'rank', v_user.rank,
        'created_at', v_user.created_at
      ),
      'transactionId', v_existing.id,
      'replayed', true
    );
  END IF;
  IF FOUND THEN
    RAISE EXCEPTION 'Request ID already belongs to another wallet mutation';
  END IF;

  SELECT * INTO v_user FROM public.users WHERE id = p_target_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target user not found';
  END IF;

  v_new_balance := round(COALESCE(p_balance, v_user.balance)::numeric, 2);
  v_new_xp := COALESCE(p_xp::bigint, v_user.xp);
  v_new_level := COALESCE(p_level, v_user.level);
  v_new_rank := COALESCE(p_rank, v_user.rank);
  v_delta := round((v_new_balance - v_user.balance)::numeric, 2);
  v_transaction_id := gen_random_uuid();
  v_metadata := jsonb_build_object(
    'changedFields', jsonb_build_object(
      'balance', CASE WHEN p_balance IS NULL THEN NULL ELSE jsonb_build_object('before', v_user.balance, 'after', v_new_balance) END,
      'xp', CASE WHEN p_xp IS NULL THEN NULL ELSE jsonb_build_object('before', v_user.xp, 'after', v_new_xp) END,
      'level', CASE WHEN p_level IS NULL THEN NULL ELSE jsonb_build_object('before', v_user.level, 'after', v_new_level) END,
      'rank', CASE WHEN p_rank IS NULL THEN NULL ELSE jsonb_build_object('before', v_user.rank, 'after', v_new_rank) END
    )
  );

  UPDATE public.users
  SET balance = v_new_balance,
      xp = v_new_xp,
      level = v_new_level,
      rank = v_new_rank,
      updated_at = now()
  WHERE id = p_target_user_id;

  INSERT INTO public.wallet_transactions
    (id, user_id, actor_id, game, type, amount, before_balance, balance_after,
     request_id, reason, metadata)
  VALUES
    (v_transaction_id, p_target_user_id, p_actor_id, 'admin', 'admin_adjust',
     v_delta, v_user.balance, v_new_balance, p_request_id, trim(p_reason), v_metadata);

  v_response := jsonb_build_object(
    'id', v_user.id, 'username', v_user.username, 'email', v_user.email,
    'balance', v_new_balance, 'xp', v_new_xp, 'level', v_new_level,
    'rank', v_new_rank, 'created_at', v_user.created_at
  );
  RETURN jsonb_build_object(
    'user', v_response,
    'transactionId', v_transaction_id,
    'replayed', false
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.compute_cohort_win_rates (
  p_game         text,
  p_window_hours integer DEFAULT 24,
  p_min_bets     integer DEFAULT 50
)
  RETURNS TABLE (
    user_id       text,
    user_rtp      numeric,
    cohort_mean   numeric,
    cohort_stddev numeric,
    bet_count     integer
  )
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
  WITH per_user AS (
    SELECT
      wallet_transactions.user_id AS user_id,
      sum(amount) FILTER (WHERE type = 'win')::NUMERIC
        / NULLIF(sum(-amount) FILTER (WHERE type = 'bet'), 0) AS rtp,
      count(*) FILTER (WHERE type = 'bet') AS bets
    FROM public.wallet_transactions
    WHERE game = p_game AND created_at >= now() - (p_window_hours || ' hours')::interval
    GROUP BY wallet_transactions.user_id
    HAVING count(*) FILTER (WHERE type = 'bet') >= p_min_bets
  )
  SELECT
    per_user.user_id,
    per_user.rtp AS user_rtp,
    avg(per_user.rtp) OVER () AS cohort_mean,
    stddev_pop(per_user.rtp) OVER () AS cohort_stddev,
    per_user.bets::INT AS bet_count
  FROM per_user;
$function$;

CREATE OR REPLACE FUNCTION public.consume_active_seed (
  p_user_id    text,
  p_request_id uuid
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
DECLARE
    v_existing seed_consumptions%ROWTYPE;
    v_seed seeds%ROWTYPE;
    v_server_seed TEXT;
    v_hash TEXT;
BEGIN
    IF p_user_id IS NULL OR p_user_id = '' OR p_request_id IS NULL THEN
        RAISE EXCEPTION 'Invalid seed consumption request';
    END IF;

    PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id, 0));

    SELECT * INTO v_existing FROM seed_consumptions
        WHERE user_id = p_user_id AND request_id = p_request_id;
    IF FOUND THEN
        SELECT server_seed INTO v_server_seed FROM seeds
            WHERE user_id = p_user_id AND server_seed_hash = v_existing.server_seed_hash;
        IF v_server_seed IS NULL THEN
            SELECT server_seed INTO v_server_seed FROM seed_history
                WHERE user_id = p_user_id AND server_seed_hash = v_existing.server_seed_hash
                ORDER BY rotated_at DESC LIMIT 1;
        END IF;
        RETURN jsonb_build_object(
            'serverSeed', v_server_seed,
            'serverSeedHash', v_existing.server_seed_hash,
            'nonce', v_existing.nonce,
            'replayed', true
        );
    END IF;

    SELECT * INTO v_seed FROM seeds WHERE user_id = p_user_id AND is_active = TRUE FOR UPDATE;
    IF NOT FOUND THEN
        v_server_seed := encode(extensions.gen_random_bytes(32), 'hex');
        v_hash := encode(extensions.digest(v_server_seed, 'sha256'), 'hex');
        INSERT INTO seeds (user_id, server_seed, server_seed_hash, client_seed, nonce, is_active)
        VALUES (p_user_id, v_server_seed, v_hash, 'vibe-coder-default', 0, TRUE)
        ON CONFLICT (user_id) DO UPDATE SET is_active = TRUE
        RETURNING * INTO v_seed;
    END IF;

    UPDATE seeds SET nonce = nonce + 1
        WHERE user_id = p_user_id AND is_active = TRUE
        RETURNING * INTO v_seed;

    INSERT INTO seed_consumptions (user_id, request_id, server_seed_hash, nonce)
        VALUES (p_user_id, p_request_id, v_seed.server_seed_hash, v_seed.nonce);

    RETURN jsonb_build_object(
        'serverSeed', v_seed.server_seed,
        'serverSeedHash', v_seed.server_seed_hash,
        'nonce', v_seed.nonce,
        'replayed', false
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.custom_access_token_hook (
  event jsonb
)
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
DECLARE
  claims jsonb;
  user_rank text;
  user_level integer;
  user_role text;
  uid text;
BEGIN
  claims := event->'claims';
  uid := event->>'user_id';

  SELECT rank, level, role
  INTO user_rank, user_level, user_role
  FROM public.users
  WHERE id = uid;

  IF claims->'app_metadata' IS NULL THEN
    claims := jsonb_set(claims, '{app_metadata}', '{}'::jsonb);
  END IF;

  claims := jsonb_set(claims, '{app_metadata,vip_tier}', to_jsonb(COALESCE(user_rank, 'BRONZE')));
  claims := jsonb_set(claims, '{app_metadata,vip_level}', to_jsonb(COALESCE(user_level, 1)));
  claims := jsonb_set(claims, '{app_metadata,user_role}', to_jsonb(COALESCE(user_role, 'authenticated')));

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;

EXCEPTION WHEN OTHERS THEN
  RETURN event;
END;
$function$;

CREATE OR REPLACE FUNCTION public.detect_bet_velocity_outliers (
  p_window_minutes integer DEFAULT 10,
  p_min_bets       integer DEFAULT 30
)
  RETURNS TABLE (
    user_id   text,
    bet_count integer
  )
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
  SELECT user_id, count(*)::INT AS bet_count
  FROM public.wallet_transactions
  WHERE type = 'bet' AND created_at >= now() - (p_window_minutes || ' minutes')::interval
  GROUP BY user_id
  HAVING count(*) >= p_min_bets;
$function$;

CREATE OR REPLACE FUNCTION public.detect_multi_account_clusters (
  p_window_hours integer DEFAULT 24,
  p_min_cluster  integer DEFAULT 3
)
  RETURNS TABLE (
    ip_hash      text,
    user_ids     text[],
    cluster_size integer
  )
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
  -- ORDER BY inside the aggregate matters: array_agg(DISTINCT ...) has no ordering guarantee
  -- otherwise, and an unstable element order would change buildRiskEvent()'s evidence hash
  -- across identical same-day scans, breaking the ON CONFLICT dedup in record_risk_event().
  SELECT ip_hash, array_agg(DISTINCT user_id ORDER BY user_id) AS user_ids, count(DISTINCT user_id)::INT AS cluster_size
  FROM public.bet_network_fingerprints
  WHERE last_seen_at >= now() - (p_window_hours || ' hours')::interval
  GROUP BY ip_hash
  HAVING count(DISTINCT user_id) >= p_min_cluster;
$function$;

CREATE OR REPLACE FUNCTION public.get_active_game_round (
  p_user_id text,
  p_game    text
)
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
DECLARE
    v_round game_rounds%ROWTYPE;
BEGIN
    SELECT * INTO v_round FROM game_rounds
    WHERE user_id = p_user_id AND game = UPPER(p_game) AND status = 'ACTIVE'
    ORDER BY created_at DESC LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('hasActiveRound', false);
    END IF;

    RETURN jsonb_build_object(
        'hasActiveRound', true,
        'roundId', v_round.id,
        'requestId', v_round.request_id,
        'betAmount', v_round.bet_amount,
        'state', v_round.state,
        'version', v_round.version
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_community_stats()
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
    SELECT jsonb_build_object(
        'communityWagered', COALESCE(SUM(ABS(amount)), 0),
        'communityGoal', 25000.0,
        'communityGoalReached', (COALESCE(SUM(ABS(amount)), 0) >= 25000.0)
    )
    FROM wallet_transactions
    WHERE type IN ('bet', 'bet_settled');
$function$;

CREATE OR REPLACE FUNCTION public.get_leaderboard()
  RETURNS TABLE (
    username      text,
    level         integer,
    rank          text,
    total_wagered numeric,
    biggest_win   numeric
  )
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
  SELECT
    u.username,
    COALESCE(u.level, 1)::INTEGER AS level,
    COALESCE(u.rank, 'BRONZE') AS rank,
    ROUND(COALESCE(SUM(c.wagered), 0), 2) AS total_wagered,
    ROUND(COALESCE(MAX(c.win_amount), 0), 2) AS biggest_win
  FROM (
    -- DICE / ROULETTE / SLOTS (from wallet_transactions)
    SELECT
      user_id,
      COALESCE(
        NULLIF((metadata -> 'response' ->> 'betAmount')::numeric, 0),
        NULLIF((metadata -> 'response' -> 'result' ->> 'amount')::numeric, 0),
        CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END
      ) AS wagered,
      CASE WHEN amount > 0 THEN amount ELSE 0 END AS win_amount
    FROM public.wallet_transactions
    WHERE type = 'bet_settled'

    UNION ALL

    -- CRASH / BLACKJACK (from game_rounds)
    SELECT
      user_id,
      bet_amount AS wagered,
      GREATEST(payout - bet_amount, 0) AS win_amount
    FROM public.game_rounds
    WHERE status = 'SETTLED'
  ) c
  JOIN public.users u ON u.id = c.user_id
  GROUP BY u.id, u.username, u.level, u.rank
  ORDER BY total_wagered DESC
  LIMIT 50;
$function$;

CREATE OR REPLACE FUNCTION public.get_or_create_user_seed (
  p_user_id text
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
DECLARE
    v_seed seeds%ROWTYPE;
    v_server_seed TEXT;
    v_server_seed_hash TEXT;
BEGIN
    SELECT * INTO v_seed FROM seeds WHERE user_id = p_user_id AND is_active = TRUE LIMIT 1;
    IF FOUND THEN
        RETURN jsonb_build_object(
            'clientSeed', v_seed.client_seed,
            'serverSeedHash', v_seed.server_seed_hash,
            'nonce', v_seed.nonce
        );
    END IF;

    v_server_seed := encode(gen_random_bytes(32), 'hex');
    v_server_seed_hash := encode(digest(v_server_seed, 'sha256'), 'hex');

    INSERT INTO seeds (user_id, server_seed, server_seed_hash, client_seed, nonce, is_active)
    VALUES (p_user_id, v_server_seed, v_server_seed_hash, 'vibe-coder-default', 0, TRUE)
    ON CONFLICT (user_id) DO UPDATE SET
        server_seed = EXCLUDED.server_seed,
        server_seed_hash = EXCLUDED.server_seed_hash,
        is_active = TRUE
    RETURNING * INTO v_seed;

    RETURN jsonb_build_object(
        'clientSeed', v_seed.client_seed,
        'serverSeedHash', v_seed.server_seed_hash,
        'nonce', v_seed.nonce
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_recent_chat_messages (
  p_limit integer DEFAULT 50
)
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
    SELECT COALESCE(jsonb_agg(msg), '[]'::jsonb)
    FROM (
        SELECT
            id,
            username AS "user",
            rank,
            message,
            to_char(created_at, 'HH12:MI AM') AS "time",
            is_system AS "isSystem",
            is_win AS "isWin"
        FROM chat_messages
        ORDER BY created_at DESC
        LIMIT LEAST(p_limit, 100)
    ) msg;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_stats (
  p_user_id text
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
DECLARE
  v_total_bets    BIGINT         := 0;
  v_total_wins    BIGINT         := 0;
  v_total_wagered NUMERIC(20, 2) := 0;
  v_total_payout  NUMERIC(20, 2) := 0;
  v_total_profit  NUMERIC(20, 2) := 0;
  v_achievements  JSONB          := '[]'::jsonb;
  v_per_game      JSONB          := '[]'::jsonb;
BEGIN
  -- combined/grouped are CTEs scoped to this single statement (a CTE cannot be
  -- referenced across separate SELECT INTO statements in PL/pgSQL), so both the
  -- lifetime scalars and the per-game jsonb_agg are produced by one query here.
  WITH combined AS MATERIALIZED (
    -- DICE / ROULETTE / SLOTS: one bet_settled row per bet, amount already net.
    SELECT
      lower(game)                                                        AS game,
      1                                                                   AS bets,
      (amount > 0)::int                                                  AS win,
      COALESCE(
        NULLIF((metadata -> 'response' ->> 'betAmount')::numeric, 0),
        CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END
      )                                                                   AS wagered,
      COALESCE(
        (metadata -> 'response' ->> 'payout')::numeric,
        CASE WHEN amount > 0 THEN amount ELSE 0 END
      )                                                                   AS payout,
      amount                                                              AS profit
    FROM public.wallet_transactions
    WHERE user_id = p_user_id AND type = 'bet_settled'

    UNION ALL

    -- CRASH / BLACKJACK: settled game_rounds carry exact bet_amount/payout.
    SELECT
      lower(game)                                                        AS game,
      1                                                                   AS bets,
      (payout > 0)::int                                                  AS win,
      bet_amount                                                          AS wagered,
      payout                                                              AS payout,
      payout - bet_amount                                                 AS profit
    FROM public.game_rounds
    WHERE user_id = p_user_id AND status = 'SETTLED'
  ),
  grouped AS (
    SELECT
      game,
      SUM(bets)    AS bets,
      SUM(win)     AS wins,
      SUM(wagered) AS wagered,
      SUM(payout)  AS payout,
      SUM(profit)  AS profit
    FROM combined
    WHERE game IS NOT NULL
    GROUP BY game
  )
  SELECT
    COALESCE((SELECT SUM(bets)    FROM combined), 0),
    COALESCE((SELECT SUM(win)     FROM combined), 0),
    COALESCE((SELECT SUM(wagered) FROM combined), 0),
    COALESCE((SELECT SUM(payout)  FROM combined), 0),
    COALESCE((SELECT SUM(profit)  FROM combined), 0),
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'game',    grouped.game,
        'bets',    grouped.bets,
        'wins',    grouped.wins,
        'wagered', grouped.wagered,
        'payout',  grouped.payout,
        'profit',  grouped.profit,
        'winRate', CASE WHEN grouped.bets > 0
                     THEN round((grouped.wins::numeric / grouped.bets::numeric) * 100, 1)
                     ELSE 0
                   END
      ) ORDER BY grouped.wagered DESC)
      FROM grouped
    ), '[]'::jsonb)
  INTO v_total_bets, v_total_wins, v_total_wagered, v_total_payout, v_total_profit, v_per_game;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id',       achievement_id,
    'unlocked', unlocked,
    'progress', progress
  )), '[]'::jsonb)
  INTO v_achievements
  FROM public.user_achievements
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'totalBets',    v_total_bets,
    'totalWins',    v_total_wins,
    'totalWagered', v_total_wagered,
    'totalPayout',  v_total_payout,
    'totalProfit',  v_total_profit,
    'winRate',      CASE
                      WHEN v_total_bets > 0
                      THEN round((v_total_wins::numeric / v_total_bets::numeric) * 100, 1)
                      ELSE 0
                    END,
    'achievements', v_achievements,
    'perGame',      v_per_game
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.guard_wallet_transaction_immutable()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'wallet_transactions is append-only';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.id IS DISTINCT FROM NEW.id
      OR OLD.user_id IS DISTINCT FROM NEW.user_id
      OR OLD.game IS DISTINCT FROM NEW.game
      OR OLD.type IS DISTINCT FROM NEW.type
      OR OLD.amount IS DISTINCT FROM NEW.amount
      OR OLD.balance_after IS DISTINCT FROM NEW.balance_after
      OR OLD.request_id IS DISTINCT FROM NEW.request_id
      OR OLD.result_id IS DISTINCT FROM NEW.result_id
      OR OLD.actor_id IS DISTINCT FROM NEW.actor_id
      OR OLD.before_balance IS DISTINCT FROM NEW.before_balance
      OR OLD.reason IS DISTINCT FROM NEW.reason
      OR OLD.created_at IS DISTINCT FROM NEW.created_at
      OR COALESCE(OLD.metadata, '{}'::jsonb) <> '{}'::jsonb
      OR NOT (COALESCE(NEW.metadata, '{}'::jsonb) ? 'response')
    THEN
      RAISE EXCEPTION 'wallet_transactions is append-only';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.place_bet (
  p_user_id text,
  p_amount  numeric,
  p_game    text
)
  RETURNS numeric
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
DECLARE
    v_new_balance DECIMAL;
BEGIN
    UPDATE users
    SET balance = balance - p_amount,
        updated_at = now()
    WHERE id = p_user_id AND balance >= p_amount
    RETURNING balance INTO v_new_balance;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

    INSERT INTO wallet_transactions (user_id, game, type, amount, balance_after)
    VALUES (p_user_id, p_game, 'bet', -p_amount, v_new_balance);

    RETURN v_new_balance;
END;
$function$;

CREATE OR REPLACE FUNCTION public.post_chat_message (
  p_user_id text,
  p_message text
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
DECLARE
    v_user users%ROWTYPE;
    v_msg_id UUID;
    v_result JSONB;
BEGIN
    IF p_user_id IS NULL OR p_user_id = '' OR p_message IS NULL OR btrim(p_message) = '' THEN
        RAISE EXCEPTION 'Invalid chat message';
    END IF;

    SELECT * INTO v_user FROM users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    INSERT INTO chat_messages (user_id, username, rank, message)
    VALUES (p_user_id, v_user.username, v_user.rank, btrim(p_message))
    RETURNING id INTO v_msg_id;

    SELECT jsonb_build_object(
        'id', id,
        'user', username,
        'rank', rank,
        'message', message,
        'time', to_char(created_at, 'HH12:MI AM'),
        'isSystem', is_system,
        'isWin', is_win
    ) INTO v_result
    FROM chat_messages WHERE id = v_msg_id;

    RETURN v_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.purge_bet_network_fingerprints()
  RETURNS void
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
  DELETE FROM public.bet_network_fingerprints WHERE first_seen_at < now() - interval '30 days';
$function$;

CREATE OR REPLACE FUNCTION public.purge_expired_telegram_link_tokens()
  RETURNS integer
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
DECLARE
    v_deleted INTEGER;
BEGIN
    DELETE FROM public.telegram_link_tokens
    WHERE expires_at < now() - interval '1 day'
       OR (consumed_at IS NOT NULL AND consumed_at < now() - interval '1 day');
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$function$;

CREATE OR REPLACE FUNCTION public.reconcile_wallet_ledger (
  p_user_id text
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
DECLARE
  v_baseline NUMERIC(20, 2);
  v_observed NUMERIC(20, 2);
  v_expected NUMERIC(20, 2);
  v_delta NUMERIC(20, 2);
  v_fingerprint TEXT;
  v_consistent BOOLEAN;
BEGIN
  SELECT opening_balance INTO v_baseline
  FROM public.wallet_ledger_baselines
  WHERE user_id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet ledger baseline not found';
  END IF;

  SELECT balance INTO v_observed
  FROM public.users
  WHERE id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet user not found';
  END IF;

  SELECT round((v_baseline + COALESCE(SUM(amount), 0))::numeric, 2)
  INTO v_expected
  FROM public.wallet_transactions
  WHERE user_id = p_user_id;

  v_delta := round((v_observed - v_expected)::numeric, 2);
  v_consistent := v_delta = 0;
  v_fingerprint := md5(
    p_user_id || ':' || v_expected::text || ':' || v_observed::text || ':' || v_delta::text
  );

  IF NOT v_consistent THEN
    INSERT INTO public.wallet_invariant_events
      (user_id, fingerprint, expected_balance, observed_balance, delta)
    VALUES
      (p_user_id, v_fingerprint, v_expected, v_observed, v_delta)
    ON CONFLICT (user_id, fingerprint) DO UPDATE
      SET occurrences = wallet_invariant_events.occurrences + 1,
          last_seen_at = now();
  END IF;

  RETURN jsonb_build_object(
    'userId', p_user_id,
    'expectedBalance', v_expected,
    'observedBalance', v_observed,
    'delta', v_delta,
    'consistent', v_consistent,
    'eventFingerprint', CASE WHEN v_consistent THEN NULL ELSE v_fingerprint END
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.record_bet_network_fingerprint (
  p_user_id text,
  p_ip_hash text
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
BEGIN
  IF p_user_id IS NULL OR length(trim(p_user_id)) = 0
    OR p_ip_hash IS NULL OR length(trim(p_ip_hash)) = 0
  THEN
    RAISE EXCEPTION 'Invalid network fingerprint';
  END IF;

  INSERT INTO public.bet_network_fingerprints (user_id, ip_hash)
  VALUES (p_user_id, p_ip_hash)
  ON CONFLICT (user_id, ip_hash, seen_date) DO UPDATE
    SET hit_count = public.bet_network_fingerprints.hit_count + 1,
        last_seen_at = now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.redeem_promo_code (
  p_user_id    text,
  p_code       text,
  p_request_id uuid
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
DECLARE
    v_promo promo_codes%ROWTYPE;
    v_user users%ROWTYPE;
    v_existing promo_code_redemptions%ROWTYPE;
    v_new_balance NUMERIC(12, 2);
    v_transaction_id UUID;
    v_code_norm TEXT;
    v_response JSONB;
BEGIN
    IF p_user_id IS NULL OR btrim(p_user_id) = '' OR p_request_id IS NULL THEN
        RAISE EXCEPTION 'Invalid promo redemption identity';
    END IF;

    IF p_code IS NULL OR btrim(p_code) = '' THEN
        RETURN jsonb_build_object('ok', false, 'code', 'PROMO_INVALID');
    END IF;

    v_code_norm := upper(btrim(p_code));
    PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id, 0));

    SELECT * INTO v_existing
    FROM public.promo_code_redemptions
    WHERE user_id = p_user_id AND request_id = p_request_id;

    IF FOUND THEN
        IF v_existing.code <> v_code_norm THEN
            RETURN jsonb_build_object('ok', false, 'code', 'PROMO_REQUEST_CONFLICT');
        END IF;
        RETURN v_existing.response || jsonb_build_object('replayed', true);
    END IF;

    SELECT * INTO v_existing
    FROM public.promo_code_redemptions
    WHERE user_id = p_user_id AND code = v_code_norm;

    IF FOUND THEN
        RETURN jsonb_build_object('ok', false, 'code', 'PROMO_ALREADY_REDEEMED');
    END IF;

    SELECT * INTO v_promo
    FROM public.promo_codes
    WHERE code = v_code_norm
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'code', 'PROMO_NOT_FOUND');
    END IF;
    IF NOT v_promo.active THEN
        RETURN jsonb_build_object('ok', false, 'code', 'PROMO_INACTIVE');
    END IF;
    IF v_promo.expires_at IS NOT NULL AND v_promo.expires_at < now() THEN
        RETURN jsonb_build_object('ok', false, 'code', 'PROMO_EXPIRED');
    END IF;
    IF v_promo.used_count >= v_promo.max_uses THEN
        RETURN jsonb_build_object('ok', false, 'code', 'PROMO_EXHAUSTED');
    END IF;

    SELECT * INTO v_user
    FROM public.users
    WHERE id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    v_new_balance := round((v_user.balance + v_promo.amount)::numeric, 2);

    UPDATE public.promo_codes
    SET used_count = used_count + 1
    WHERE code = v_code_norm;

    UPDATE public.users
    SET balance = v_new_balance,
        updated_at = now()
    WHERE id = p_user_id;

    INSERT INTO public.wallet_transactions (
        user_id, game, type, amount, balance_after, metadata
    )
    VALUES (
        p_user_id,
        'bonus',
        'bonus',
        v_promo.amount,
        v_new_balance,
        jsonb_build_object(
            'source', 'promo_code',
            'code', v_code_norm,
            'requestId', p_request_id
        )
    )
    RETURNING id INTO v_transaction_id;

    v_response := jsonb_build_object(
        'ok', true,
        'amount', v_promo.amount,
        'balance', v_new_balance,
        'xp', v_user.xp,
        'level', v_user.level,
        'rank', v_user.rank,
        'transactionId', v_transaction_id,
        'replayed', false
    );

    INSERT INTO public.promo_code_redemptions (
        user_id, code, request_id, amount, transaction_id, response
    )
    VALUES (
        p_user_id,
        v_code_norm,
        p_request_id,
        v_promo.amount,
        v_transaction_id,
        v_response
    );

    RETURN v_response;
END;
$function$;

CREATE OR REPLACE FUNCTION public.release_fraud_scan_lock()
  RETURNS void
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
  UPDATE public.fraud_scan_lock SET locked_at = NULL, locked_by = NULL WHERE id = true;
$function$;

CREATE OR REPLACE FUNCTION public.review_risk_event (
  p_event_id    uuid,
  p_reviewer_id text,
  p_status      text,
  p_reason      text
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
DECLARE
  v_event public.risk_events%ROWTYPE;
BEGIN
  IF p_event_id IS NULL OR p_reviewer_id IS NULL OR length(trim(p_reviewer_id)) = 0
    OR p_status NOT IN ('reviewed', 'closed')
    OR p_reason IS NULL OR length(trim(p_reason)) = 0
  THEN
    RAISE EXCEPTION 'Invalid risk review';
  END IF;

  UPDATE public.risk_events
  SET status = p_status,
      reviewed_by = p_reviewer_id,
      reviewed_at = now(),
      review_reason = left(trim(p_reason), 500)
  WHERE id = p_event_id
  RETURNING * INTO v_event;
  IF NOT FOUND THEN RAISE EXCEPTION 'Risk event not found'; END IF;

  RETURN jsonb_build_object(
    'id', v_event.id,
    'status', v_event.status,
    'reviewedBy', v_event.reviewed_by,
    'reviewedAt', v_event.reviewed_at
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
  RETURNS event_trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'pg_catalog'
  AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.rotate_user_seed (
  p_user_id     text,
  p_client_seed text
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
DECLARE
    v_old seeds%ROWTYPE;
    v_new_server_seed TEXT;
    v_new_hash TEXT;
BEGIN
    IF p_client_seed IS NULL OR btrim(p_client_seed) = '' THEN
        RAISE EXCEPTION 'Invalid client seed';
    END IF;

    PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id, 0));

    SELECT * INTO v_old FROM seeds WHERE user_id = p_user_id AND is_active = TRUE FOR UPDATE;

    v_new_server_seed := encode(extensions.gen_random_bytes(32), 'hex');
    v_new_hash := encode(extensions.digest(v_new_server_seed, 'sha256'), 'hex');

    IF FOUND THEN
        INSERT INTO seed_history (user_id, server_seed, server_seed_hash, client_seed, nonce_at_rotation)
        VALUES (v_old.user_id, v_old.server_seed, v_old.server_seed_hash, v_old.client_seed, v_old.nonce);
    END IF;

    INSERT INTO seeds (user_id, server_seed, server_seed_hash, client_seed, nonce, is_active)
    VALUES (p_user_id, v_new_server_seed, v_new_hash, p_client_seed, 0, TRUE)
    ON CONFLICT (user_id) DO UPDATE SET
        server_seed = v_new_server_seed,
        server_seed_hash = v_new_hash,
        client_seed = p_client_seed,
        nonce = 0,
        is_active = TRUE;

    RETURN jsonb_build_object(
        'clientSeed', p_client_seed,
        'serverSeedHash', v_new_hash,
        'nonce', 0,
        'revealedSeed', v_old.server_seed,
        'revealedSeedHash', v_old.server_seed_hash
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.run_bet_fingerprint_purge_job()
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'net', 'vault', 'pg_temp'
  AS $function$
DECLARE
    v_alert_secret TEXT;
BEGIN
    PERFORM public.purge_bet_network_fingerprints();
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
                'job', 'bet_fingerprint_purge',
                'error', left(SQLERRM, 500)
            )
        );
    END IF;
    -- Swallowed deliberately, same rationale as 027: pg_cron has no retry/backoff, re-raising
    -- would only spam identical failures at the next run without changing the outcome.
END;
$function$;

CREATE OR REPLACE FUNCTION public.settle_bet (
  p_user_id text,
  p_payout  numeric,
  p_xp_gain integer,
  p_game    text
)
  RETURNS TABLE (
    balance numeric,
    xp      bigint,
    level   integer
  )
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
DECLARE
    v_new_balance DECIMAL;
    v_new_xp BIGINT;
    v_new_level INTEGER;
BEGIN
    UPDATE users
    SET balance = balance + p_payout,
        xp = xp + p_xp_gain,
        level = GREATEST(1, FLOOR(SQRT((users.xp + p_xp_gain) / 100.0))::INTEGER + 1),
        updated_at = now()
    WHERE id = p_user_id
    RETURNING users.balance, users.xp, users.level
    INTO v_new_balance, v_new_xp, v_new_level;

    IF p_payout > 0 THEN
        INSERT INTO wallet_transactions (user_id, game, type, amount, balance_after)
        VALUES (p_user_id, p_game, 'win', p_payout, v_new_balance);
    END IF;

    RETURN QUERY SELECT v_new_balance, v_new_xp, v_new_level;
END;
$function$;

CREATE OR REPLACE FUNCTION public.start_game_round (
  p_user_id    text,
  p_request_id uuid,
  p_game       text,
  p_amount     numeric,
  p_state      jsonb
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
DECLARE
  v_user users%ROWTYPE;
  v_round game_rounds%ROWTYPE;
  v_existing wallet_transactions%ROWTYPE;
  v_balance NUMERIC(20, 2);
  v_transaction_id UUID;
  v_response JSONB;
BEGIN
  IF p_game NOT IN ('CRASH', 'BLACKJACK', 'CRASH_MULTIPLAYER') OR p_amount <= 0 OR p_request_id IS NULL THEN
    RAISE EXCEPTION 'Invalid round values';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id, 0));

  SELECT * INTO v_round FROM game_rounds
    WHERE user_id = p_user_id AND request_id = p_request_id;
  IF FOUND THEN
    SELECT * INTO v_existing FROM wallet_transactions WHERE user_id = p_user_id AND request_id = p_request_id;
    RETURN (v_existing.metadata -> 'response') || jsonb_build_object('replayed', true);
  END IF;

  -- Multiplayer-Crash & Solo-Crash Race-Guard (worldmap/05_v2_multiplayer_crash.md §5):
  -- Generalisiert von p_game = 'CRASH' auf 'CRASH' und 'CRASH_MULTIPLAYER',
  -- matched auf den angefragten Typ (game = p_game), sodass Solo- und Multiplayer-Runden
  -- unabhaengig voneinander parallel aktiv sein koennen, aber niemals zwei gleichzeitige
  -- aktive Runden desselben Typs.
  IF p_game IN ('CRASH', 'CRASH_MULTIPLAYER') AND EXISTS (
    SELECT 1 FROM game_rounds
    WHERE user_id = p_user_id AND game = p_game AND status = 'ACTIVE'
  ) THEN
    RAISE EXCEPTION 'Active % round already exists', lower(p_game);
  END IF;

  INSERT INTO users (id, username) VALUES (p_user_id, left(p_user_id, 64))
    ON CONFLICT (id) DO NOTHING;
  SELECT * INTO v_user FROM users WHERE id = p_user_id FOR UPDATE;
  IF v_user.balance < p_amount THEN RAISE EXCEPTION 'Insufficient balance'; END IF;

  v_balance := round((v_user.balance - p_amount)::numeric, 2);
  UPDATE users SET balance = v_balance, updated_at = now() WHERE id = p_user_id;
  INSERT INTO game_rounds(user_id, request_id, game, bet_amount, state)
    VALUES (p_user_id, p_request_id, p_game, p_amount, p_state)
    RETURNING * INTO v_round;
  INSERT INTO wallet_transactions
    (user_id, game, type, amount, balance_after, request_id, metadata)
    VALUES (p_user_id, lower(p_game), 'round_started', -p_amount, v_balance,
      p_request_id, '{}'::jsonb)
    RETURNING id INTO v_transaction_id;

  v_response := jsonb_build_object(
    'roundId', v_round.id, 'state', v_round.state, 'version', v_round.version,
    'balance', v_balance, 'xp', v_user.xp, 'level', v_user.level,
    'rank', v_user.rank, 'transactionId', v_transaction_id, 'replayed', false
  );
  UPDATE wallet_transactions SET metadata = jsonb_build_object('response', v_response)
    WHERE id = v_transaction_id;
  RETURN v_response;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_user_achievement (
  p_user_id        text,
  p_achievement_id text,
  p_progress       numeric,
  p_unlocked       boolean
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
BEGIN
  INSERT INTO public.user_achievements (user_id, achievement_id, progress, unlocked, updated_at)
  VALUES (p_user_id, p_achievement_id, p_progress, p_unlocked, now())
  ON CONFLICT (user_id, achievement_id) DO UPDATE
  SET progress = GREATEST(public.user_achievements.progress, EXCLUDED.progress),
      unlocked = public.user_achievements.unlocked OR EXCLUDED.unlocked,
      updated_at = now();

  RETURN jsonb_build_object('success', true);
END;
$function$;

CREATE OR REPLACE FUNCTION public.try_acquire_fraud_scan_lock (
  p_locked_by           text,
  p_stale_after_minutes integer DEFAULT 5
)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
DECLARE
  v_rows INT;
BEGIN
  UPDATE public.fraud_scan_lock
  SET locked_at = now(), locked_by = p_locked_by
  WHERE id = true
    AND (locked_at IS NULL OR locked_at < now() - (p_stale_after_minutes || ' minutes')::interval);
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows > 0;
END;
$function$;

CREATE EVENT TRIGGER "ensure_rls"
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  EXECUTE FUNCTION "public"."rls_auto_enable"();

GRANT EXECUTE ON FUNCTION "public"."rls_auto_enable"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
