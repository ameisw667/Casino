-- 2.7 Royale Guide Observability: text-free, pseudonymous operational telemetry.
-- This table deliberately contains no prompt, answer, raw user id, IP, cookie,
-- provider payload, or provider error text.

CREATE TABLE IF NOT EXISTS public.guide_telemetry_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    actor_hash TEXT NOT NULL CHECK (actor_hash ~ '^[a-f0-9]{64}$'),
    actor_hash_version SMALLINT NOT NULL CHECK (actor_hash_version > 0),
    outcome TEXT NOT NULL CHECK (outcome IN (
        'success', 'configuration', 'quota', 'upstream', 'invalid_response', 'rate_limited'
    )),
    latency_ms INTEGER NOT NULL CHECK (latency_ms >= 0 AND latency_ms <= 120000),
    model TEXT NULL CHECK (model IS NULL OR char_length(model) BETWEEN 1 AND 128),
    input_tokens INTEGER NULL CHECK (input_tokens IS NULL OR input_tokens >= 0),
    cached_input_tokens INTEGER NULL CHECK (cached_input_tokens IS NULL OR cached_input_tokens >= 0),
    output_tokens INTEGER NULL CHECK (output_tokens IS NULL OR output_tokens >= 0),
    reasoning_tokens INTEGER NULL CHECK (reasoning_tokens IS NULL OR reasoning_tokens >= 0),
    total_tokens INTEGER NULL CHECK (total_tokens IS NULL OR total_tokens >= 0),
    estimated_cost_microusd BIGINT NULL CHECK (estimated_cost_microusd IS NULL OR estimated_cost_microusd >= 0),
    pricing_version TEXT NULL CHECK (pricing_version IS NULL OR char_length(pricing_version) BETWEEN 1 AND 64),
    rate_limit_window_started_at TIMESTAMPTZ NULL,
    CHECK ((estimated_cost_microusd IS NULL) = (pricing_version IS NULL)),
    CHECK (cached_input_tokens IS NULL OR input_tokens IS NULL OR cached_input_tokens <= input_tokens),
    CHECK (total_tokens IS NULL OR input_tokens IS NULL OR output_tokens IS NULL OR total_tokens >= input_tokens + output_tokens),
    CHECK (
        (outcome = 'rate_limited' AND rate_limit_window_started_at IS NOT NULL)
        OR (outcome <> 'rate_limited' AND rate_limit_window_started_at IS NULL)
    ),
    UNIQUE (actor_hash, actor_hash_version, outcome, rate_limit_window_started_at)
);

CREATE INDEX IF NOT EXISTS guide_telemetry_events_occurred_at_idx
    ON public.guide_telemetry_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS guide_telemetry_events_outcome_occurred_at_idx
    ON public.guide_telemetry_events (outcome, occurred_at DESC);

ALTER TABLE public.guide_telemetry_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.guide_telemetry_events FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.guide_telemetry_events TO service_role;

CREATE OR REPLACE FUNCTION public.get_guide_observability(p_as_of TIMESTAMPTZ)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    WITH windows AS (
        SELECT 'last24h'::TEXT AS key, p_as_of - interval '24 hours' AS starts_at
        UNION ALL
        SELECT 'last7d'::TEXT, p_as_of - interval '7 days'
    ),
    window_metrics AS (
        SELECT
            windows.key,
            COUNT(events.id)::INTEGER AS requests,
            COUNT(DISTINCT (events.actor_hash_version::TEXT || ':' || events.actor_hash))::INTEGER AS unique_actors,
            COUNT(events.id) FILTER (WHERE events.outcome = 'success')::INTEGER AS successes,
            ROUND(AVG(events.latency_ms) FILTER (WHERE events.outcome = 'success'))::INTEGER AS average_latency_ms,
            ROUND(percentile_cont(0.95) WITHIN GROUP (ORDER BY events.latency_ms) FILTER (WHERE events.outcome = 'success'))::INTEGER AS p95_latency_ms,
            SUM(events.input_tokens)::BIGINT AS input_tokens,
            SUM(events.cached_input_tokens)::BIGINT AS cached_input_tokens,
            SUM(events.output_tokens)::BIGINT AS output_tokens,
            SUM(events.reasoning_tokens)::BIGINT AS reasoning_tokens,
            SUM(events.total_tokens)::BIGINT AS total_tokens,
            SUM(events.estimated_cost_microusd)::BIGINT AS estimated_cost_microusd,
            jsonb_build_object(
                'success', COUNT(events.id) FILTER (WHERE events.outcome = 'success'),
                'configuration', COUNT(events.id) FILTER (WHERE events.outcome = 'configuration'),
                'quota', COUNT(events.id) FILTER (WHERE events.outcome = 'quota'),
                'upstream', COUNT(events.id) FILTER (WHERE events.outcome = 'upstream'),
                'invalid_response', COUNT(events.id) FILTER (WHERE events.outcome = 'invalid_response'),
                'rate_limited', COUNT(events.id) FILTER (WHERE events.outcome = 'rate_limited')
            ) AS outcomes
        FROM windows
        LEFT JOIN public.guide_telemetry_events events
            ON events.occurred_at >= windows.starts_at AND events.occurred_at <= p_as_of
        GROUP BY windows.key
    )
    SELECT jsonb_build_object(
        'status', 'ready',
        'asOf', p_as_of,
        'last24h', (
            SELECT jsonb_build_object(
                'requests', requests,
                'uniqueActors', unique_actors,
                'successRate', CASE WHEN requests = 0 THEN NULL ELSE ROUND((successes::NUMERIC / requests) * 100, 1) END,
                'errorRate', CASE WHEN requests = 0 THEN NULL ELSE ROUND(((requests - successes)::NUMERIC / requests) * 100, 1) END,
                'outcomes', outcomes,
                'averageLatencyMs', average_latency_ms,
                'p95LatencyMs', p95_latency_ms,
                'tokens', jsonb_build_object(
                    'input', input_tokens,
                    'cachedInput', cached_input_tokens,
                    'output', output_tokens,
                    'reasoning', reasoning_tokens,
                    'total', total_tokens
                ),
                'estimatedCostMicrousd', estimated_cost_microusd
            ) FROM window_metrics WHERE key = 'last24h'
        ),
        'last7d', (
            SELECT jsonb_build_object(
                'requests', requests,
                'uniqueActors', unique_actors,
                'successRate', CASE WHEN requests = 0 THEN NULL ELSE ROUND((successes::NUMERIC / requests) * 100, 1) END,
                'errorRate', CASE WHEN requests = 0 THEN NULL ELSE ROUND(((requests - successes)::NUMERIC / requests) * 100, 1) END,
                'outcomes', outcomes,
                'averageLatencyMs', average_latency_ms,
                'p95LatencyMs', p95_latency_ms,
                'tokens', jsonb_build_object(
                    'input', input_tokens,
                    'cachedInput', cached_input_tokens,
                    'output', output_tokens,
                    'reasoning', reasoning_tokens,
                    'total', total_tokens
                ),
                'estimatedCostMicrousd', estimated_cost_microusd
            ) FROM window_metrics WHERE key = 'last7d'
        ),
        'pricingVersions', COALESCE((
            SELECT jsonb_agg(DISTINCT pricing_version ORDER BY pricing_version)
            FROM public.guide_telemetry_events
            WHERE occurred_at >= p_as_of - interval '7 days'
              AND occurred_at <= p_as_of
              AND pricing_version IS NOT NULL
        ), '[]'::JSONB)
    );
$$;

CREATE OR REPLACE FUNCTION public.purge_guide_telemetry_events()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_deleted INTEGER;
BEGIN
    DELETE FROM public.guide_telemetry_events
    WHERE occurred_at < now() - interval '90 days';
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_guide_telemetry_events_for_actor(
    p_actor_hash TEXT,
    p_actor_hash_version SMALLINT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_deleted INTEGER;
BEGIN
    IF p_actor_hash IS NULL OR p_actor_hash !~ '^[a-f0-9]{64}$' OR p_actor_hash_version IS NULL OR p_actor_hash_version < 1 THEN
        RAISE EXCEPTION 'Invalid guide telemetry actor identity';
    END IF;
    DELETE FROM public.guide_telemetry_events
    WHERE actor_hash = p_actor_hash AND actor_hash_version = p_actor_hash_version;
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION public.get_guide_observability(TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.purge_guide_telemetry_events() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_guide_telemetry_events_for_actor(TEXT, SMALLINT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_guide_observability(TIMESTAMPTZ) TO service_role;
GRANT EXECUTE ON FUNCTION public.purge_guide_telemetry_events() TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_guide_telemetry_events_for_actor(TEXT, SMALLINT) TO service_role;
