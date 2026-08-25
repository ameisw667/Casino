-- Casino Royale - Migration 051: Achievement visibility metadata
-- Adds UI-only mystery handling. Definitions remain public; this is not a secret-storage boundary.

ALTER TABLE public.achievement_configs
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'visible';

ALTER TABLE public.achievement_configs
  DROP CONSTRAINT IF EXISTS achievement_configs_visibility_check;

ALTER TABLE public.achievement_configs
  ADD CONSTRAINT achievement_configs_visibility_check
  CHECK (visibility IN ('visible', 'secret'));

UPDATE public.achievement_configs
SET visibility = 'visible'
WHERE visibility IS NULL OR visibility NOT IN ('visible', 'secret');

INSERT INTO public.achievement_configs
  (id, title, description, icon, total, progress_stat, conditions, sort_order, is_active, visibility)
VALUES
  (
    'lucky_seven',
    'Lucky Seven',
    'Hit a 7x multiplier in Dice',
    '🎰',
    7,
    'multiplier',
    '[{"stat":"multiplier","op":"gte","value":7,"game":"DICE"}]'::jsonb,
    10,
    true,
    'secret'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  total = EXCLUDED.total,
  progress_stat = EXCLUDED.progress_stat,
  conditions = EXCLUDED.conditions,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  visibility = EXCLUDED.visibility;