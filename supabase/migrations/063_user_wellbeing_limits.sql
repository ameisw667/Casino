-- 06_2 Responsible-Gambling-Controls (worldmap/06_2_responsible_gambling_controls_plan.md L0):
-- persistent wellbeing state (self-exclusion + daily loss limit), deliberately separated from
-- the fraud-oriented risk_events infrastructure — wellbeing is a user preference, not a risk signal.
--
-- Service-role only table (same convention as 056_user_notifications): browser clients never
-- touch this table directly; all access flows through authenticated API routes whose server
-- handler resolves the user from the session and uses the admin client. RLS is enabled with no
-- anon/authenticated policy, so a browser can neither read nor write any row — including rows
-- of other users (the plan's "user sees/writes only own row" guarantee, enforced one level up).
-- The server-side wellbeing guard (L1) reads via service_role, which bypasses RLS.

CREATE TABLE IF NOT EXISTS public.user_wellbeing_limits (
  user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  self_excluded_until TIMESTAMPTZ,           -- NULL = no active self-exclusion
  daily_loss_limit_cents INTEGER
    CHECK (daily_loss_limit_cents IS NULL OR daily_loss_limit_cents > 0),  -- NULL = no limit set
  daily_session_minutes_limit INTEGER
    CHECK (daily_session_minutes_limit IS NULL OR daily_session_minutes_limit > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_wellbeing_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.user_wellbeing_limits FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.user_wellbeing_limits TO service_role;

-- 06_2 L1 security review: a self-exclusion may only ever be EXTENDED, never shortened —
-- otherwise a user under a 365-day lock could POST durationDays=1 and cut their own lock.
-- Enforced atomically in the database (no read-then-write race at the API layer): the
-- trigger keeps the later of the existing and the proposed timestamp and stamps updated_at
-- with the actual write time. service_role bypasses RLS but NOT triggers.
CREATE OR REPLACE FUNCTION public.enforce_self_exclusion_only_extends()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.self_excluded_until IS NOT NULL THEN
    NEW.self_excluded_until := GREATEST(OLD.self_excluded_until, NEW.self_excluded_until);
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER user_wellbeing_limits_self_exclusion_only_extends
  BEFORE INSERT OR UPDATE ON public.user_wellbeing_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_self_exclusion_only_extends();

-- 06_2 L3 (Q4a Netto-Verlust): kumulierter Tagesverlust in Cents, UTC-Kalendertag
-- (konsistent mit get_daily_race_standings in 041). Netto = -(Summe der Beträge) über
-- die Spiel-Transaktions-Typen des Server-Authority-Settlements (007):
--   bet_settled   = payout - bet (Netto-Ergebnis Dice/Roulette/Slots)
--   round_started = -bet (Debit Crash/Blackjack)
--   round_settled = +payout bzw. payout - additional_bet (Credit Blackjack)
--   round_action  = -additional_bet bei nicht-settlenden Blackjack-Aktionen —
--     L3 Security-Review (HIGH): ohne diesen Typ entkäme der SPLIT-Einsatz der
--     Tagesverlust-Rechnung. HIT-Aktionen schreiben round_action(-0) und sind harmlos.
-- 'bonus' (Promo-Credits) ist bewusst ausgeschlossen — Geschenke sind kein Verlust.
-- Negative Rückgabe = Tagesgewinn (blockiert nie). Service-Role-only via EXECUTE-Grant,
-- SECURITY DEFINER mit festgenageltem search_path (gleiche Konvention wie 041).
-- Achtung: die Typ-Liste hier und im Partial-Index-Prädikat muss im Gleichschritt
-- bleiben — der Planner nutzt den Partial-Index nur bei exakter Prädikat-Übereinstimmung.
CREATE OR REPLACE FUNCTION public.get_daily_net_loss_cents(p_user_id TEXT)
RETURNS INTEGER
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT (-ROUND(COALESCE(SUM(t.amount), 0) * 100))::integer
  FROM public.wallet_transactions t
  WHERE t.user_id = p_user_id
    AND t.type IN ('bet_settled', 'round_started', 'round_settled', 'round_action')
    AND t.created_at >= date_trunc('day', now() AT TIME ZONE 'utc') AT TIME ZONE 'utc'
    AND t.created_at < date_trunc('day', now() AT TIME ZONE 'utc') AT TIME ZONE 'utc'
        + interval '1 day';
$$;

REVOKE ALL ON FUNCTION public.get_daily_net_loss_cents(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_daily_net_loss_cents(TEXT) TO service_role;

-- Index-Check (Plan-Schritt): bestehende idx_transactions_user(user_id) und
-- idx_wallet_transactions_type_created(type, created_at) decken den kombinierten
-- Filter (user_id + Zeitfenster + type) nicht ab — Partial-Index exakt für die Guard-Query.
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_created_game
  ON public.wallet_transactions (user_id, created_at)
  WHERE type IN ('bet_settled', 'round_started', 'round_settled', 'round_action');