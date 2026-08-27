-- Migration 054: Add guide_persona column to profiles
-- Stores the user's preferred Guide persona.
-- Values: 'math_strategist' | 'high_roller' | 'casual_buddy'
-- RLS: covered by existing profiles RLS policy (auth.uid() = id).

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS guide_persona text NOT NULL DEFAULT 'math_strategist'
    CONSTRAINT profiles_guide_persona_check
      CHECK (guide_persona IN ('math_strategist', 'high_roller', 'casual_buddy'));

COMMENT ON COLUMN profiles.guide_persona IS
  'Active VIP Guide persona chosen by the player. Determines the tone/style of the Royale Guide AI responses.';
