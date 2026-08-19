-- L1 (worldmap/01_LiveProgressiveJackpot.md): serverautoritativer Cross-Game Jackpot-Pool.
-- Singleton-Tabelle, gespeist von L2 (Contribution) und ausgezahlt von L3 (Trigger).
-- Bootstrap-Werte von Jan am 2026-08-18 bestätigt (siehe Planungsdatei Abschnitt 4).

CREATE TABLE IF NOT EXISTS public.jackpot_pool (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  current_amount NUMERIC(14, 2) NOT NULL CHECK (current_amount >= 0),
  seed_amount NUMERIC(14, 2) NOT NULL CHECK (seed_amount >= 0),
  contribution_rate NUMERIC(5, 4) NOT NULL CHECK (contribution_rate >= 0 AND contribution_rate <= 1),
  win_probability NUMERIC(9, 8) NOT NULL CHECK (win_probability >= 0 AND win_probability <= 1),
  last_won_at TIMESTAMPTZ,
  last_winner_id TEXT REFERENCES public.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.jackpot_pool ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.jackpot_pool FROM PUBLIC, anon, authenticated;

INSERT INTO public.jackpot_pool (id, current_amount, seed_amount, contribution_rate, win_probability)
VALUES (1, 1000.00, 1000.00, 0.0025, 0.0001)
ON CONFLICT (id) DO NOTHING;
