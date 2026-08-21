-- 042 Guide Feedback & LLM Evaluations Schema
-- Stores anonymous user ratings (Thumbs Up / Down) for AI responses,
-- calculates satisfaction scores, and provides admin telemetry summaries.

CREATE TABLE IF NOT EXISTS public.guide_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    rating SMALLINT NOT NULL CHECK (rating IN (1, -1)),
    message_id TEXT NULL CHECK (message_id IS NULL OR char_length(message_id) BETWEEN 1 AND 128),
    user_id TEXT NULL CHECK (user_id IS NULL OR char_length(user_id) BETWEEN 1 AND 128),
    category TEXT NULL CHECK (category IS NULL OR category IN ('helpful', 'accurate', 'inaccurate', 'unhelpful', 'slow', 'other')),
    comment TEXT NULL CHECK (comment IS NULL OR char_length(comment) <= 1000)
);

CREATE INDEX IF NOT EXISTS guide_feedback_created_at_idx 
    ON public.guide_feedback (created_at DESC);

CREATE INDEX IF NOT EXISTS guide_feedback_rating_created_at_idx 
    ON public.guide_feedback (rating, created_at DESC);

ALTER TABLE public.guide_feedback ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.guide_feedback FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.guide_feedback TO service_role;

-- Summary RPC for satisfaction metrics
CREATE OR REPLACE FUNCTION public.get_guide_feedback_summary(p_as_of TIMESTAMPTZ)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    WITH window_data AS (
        SELECT
            COUNT(*)::INTEGER AS total_ratings,
            COUNT(*) FILTER (WHERE rating = 1)::INTEGER AS positive_ratings,
            COUNT(*) FILTER (WHERE rating = -1)::INTEGER AS negative_ratings
        FROM public.guide_feedback
        WHERE created_at >= p_as_of - interval '7 days'
          AND created_at <= p_as_of
    ),
    recent_items AS (
        SELECT COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', id,
                    'createdAt', created_at,
                    'rating', rating,
                    'category', category,
                    'comment', comment
                )
            ),
            '[]'::JSONB
        ) AS items
        FROM (
            SELECT id, created_at, rating, category, comment
            FROM public.guide_feedback
            WHERE created_at >= p_as_of - interval '7 days'
              AND created_at <= p_as_of
            ORDER BY created_at DESC
            LIMIT 20
        ) sub
    )
    SELECT jsonb_build_object(
        'totalRatings', wd.total_ratings,
        'positiveRatings', wd.positive_ratings,
        'negativeRatings', wd.negative_ratings,
        'satisfactionRate', CASE WHEN wd.total_ratings = 0 THEN 100.0 ELSE ROUND((wd.positive_ratings::NUMERIC / wd.total_ratings) * 100, 1) END,
        'recentFeedback', ri.items
    )
    FROM window_data wd, recent_items ri;
$$;

REVOKE ALL ON FUNCTION public.get_guide_feedback_summary(TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_guide_feedback_summary(TIMESTAMPTZ) TO service_role;
