-- Migration 054: Add guide_persona column to users.
-- Stores the user's preferred Guide persona.
-- Values: 'math_strategist' | 'high_roller' | 'casual_buddy'
-- RLS: browser mutations remain denied; this preference is changed through the
-- authenticated server route, which scopes updates to auth.getUser().id.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS guide_persona text NOT NULL DEFAULT 'math_strategist'
    CONSTRAINT users_guide_persona_check
      CHECK (guide_persona IN ('math_strategist', 'high_roller', 'casual_buddy'));

COMMENT ON COLUMN public.users.guide_persona IS
  'Active VIP Guide persona chosen by the player. Determines the tone/style of the Royale Guide AI responses.';
