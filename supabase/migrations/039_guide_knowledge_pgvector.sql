-- Migration 038: Guide Knowledge Management via pgvector
-- Extends the casino database with vector embeddings and dynamic help document management.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS guide_documents (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  version TEXT NOT NULL DEFAULT '2026-08-21',
  embedding vector(1536),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS guide_documents_embedding_hnsw
ON guide_documents USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_guide_documents_topic
ON guide_documents (topic);

CREATE INDEX IF NOT EXISTS idx_guide_documents_active
ON guide_documents (is_active);

-- RPC for vector similarity search via cosine distance
CREATE OR REPLACE FUNCTION match_guide_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.4,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id text,
  slug text,
  topic text,
  title text,
  content text,
  tags text[],
  version text,
  similarity float
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    gd.id,
    gd.slug,
    gd.topic,
    gd.title,
    gd.content,
    gd.tags,
    gd.version,
    (1 - (gd.embedding <=> query_embedding))::float AS similarity
  FROM guide_documents gd
  WHERE gd.is_active = true
    AND gd.embedding IS NOT NULL
    AND (1 - (gd.embedding <=> query_embedding)) > match_threshold
  ORDER BY gd.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- RLS Configuration
ALTER TABLE guide_documents ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active guide documents
CREATE POLICY "Allow public read access to active guide documents"
ON guide_documents
FOR SELECT
USING (is_active = true);

-- Allow service_role full access
CREATE POLICY "Allow service_role full access to guide documents"
ON guide_documents
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Seed initial core documents
INSERT INTO guide_documents (id, slug, topic, title, content, tags, version, is_active)
VALUES
(
  'guide-blackjack',
  'games-blackjack',
  'blackjack',
  'Blackjack Regeln, Payouts und Spielzüge',
  'Blackjack wird gegen das Haus gespielt. Ziel ist es, näher an 21 Punkte heranzukommen als der Dealer, ohne 21 zu überschreiten. Blackjack zahlt 3:2, Standardgewinn 1:1. Mögliche Aktionen sind DEAL, HIT, STAND, DOUBLE DOWN und SPLIT.',
  ARRAY['blackjack', 'karten', 'regeln', 'hit', 'stand', 'double', 'split', 'payout'],
  '2026-08-21',
  true
),
(
  'guide-crash',
  'games-crash',
  'crash',
  'Crash Multiplikator, Cashout und Kurven-Dynamik',
  'Crash ist ein Multiplikatorspiel mit 1% Hausvorteil. Die Kurve startet bei 1.00x und steigt exponentiell an. Spieler müssen rechtzeitig vor dem zufälligen Crashpunkt auf Cashout klicken, um den Multiplikator zu sichern.',
  ARRAY['crash', 'multiplikator', 'cashout', 'rakete', 'kurve', 'house-edge'],
  '2026-08-21',
  true
),
(
  'guide-dice',
  'games-dice',
  'dice',
  'Dice Würfelregeln, Gewinnchance und Multiplikatoren',
  'Dice generiert eine Zufallszahl von 0.00 bis 100.00. Spieler wählen eine Zielzahl (z.B. Roll Under 50). Der Multiplikator berechnet sich nach 99 / Gewinnchance mit 1% Hausvorteil.',
  ARRAY['dice', 'würfel', 'roll-under', 'roll-over', 'chance', 'multiplikator'],
  '2026-08-21',
  true
),
(
  'guide-roulette',
  'games-roulette',
  'roulette',
  'European Roulette Zahlen, Wetten und Quoten',
  'European Roulette besitzt 37 Zahlen (0 bis 36) mit einer einzelnen grünen Null (2.7% Hausvorteil). Straight Up zahlt 35:1, Dozen/Column zahlt 2:1, einfache Chancen (Rot/Schwarz, Gerade/Ungerade) zahlen 1:1.',
  ARRAY['roulette', 'kessel', 'rot', 'schwarz', 'straight', 'dozen', 'quoten'],
  '2026-08-21',
  true
),
(
  'guide-slots',
  'games-slots',
  'slots',
  'Slots Walzen, Symbole und Gewinnlinien',
  'Klassischer 3-Walzen-Slot mit Symbolen von Diamant, 7er, Krone, Glocke bis Kirsche. Gewinne entstehen durch übereinstimmende Symbole auf der zentralen Gewinnlinie.',
  ARRAY['slots', 'spielautomat', 'walzen', 'symbole', 'jackpot', 'gewinnlinie'],
  '2026-08-21',
  true
),
(
  'guide-navigation',
  'platform-navigation',
  'navigation',
  'Plattform Navigation, Shortcuts und Schnellzugriffe',
  'Die Plattform bietet direkte Navigation über die Sidebar zu /games (Spielauswahl), /history (Transaktionshistorie), /vault (Tresor), /leaderboard (Rangliste) und /stats (persönliche Statistiken).',
  ARRAY['navigation', 'seiten', 'links', 'games', 'history', 'vault', 'leaderboard', 'stats'],
  '2026-08-21',
  true
),
(
  'guide-commands',
  'platform-commands',
  'commands',
  'Chat-Befehle und interaktive Shortcuts',
  'Verfügbare Chat-Befehle im globalen Chat sind /help (Befehlsübersicht), /stats (eigene Spielstatistiken) und /leaderboard (aktuelle Rangliste).',
  ARRAY['commands', 'befehle', 'chat', 'help', 'stats', 'leaderboard'],
  '2026-08-21',
  true
),
(
  'guide-vip',
  'economy-vip',
  'economy',
  'VIP-Ränge, Level-Progression und Rakeback-Stufen',
  'Das VIP-System belohnt Wetteinsätze mit XP. Ränge reichen von Bronze über Silver, Gold, Platinum bis Diamond. Höhere Ränge schalten bis zu 15% täglichen Rakeback frei.',
  ARRAY['vip', 'level', 'xp', 'rank', 'rakeback', 'tiers', 'belohnungen'],
  '2026-08-21',
  true
),
(
  'guide-fairness',
  'economy-fairness',
  'economy',
  'Provably Fair System, HMAC-SHA256 und Seed-Reveal',
  'Alle Spiele basieren auf kryptographischem Provably Fair mit HMAC-SHA256(serverSeed:clientSeed:nonce). Spieler können frühere Server-Seeds im Profil nachprüfen.',
  ARRAY['fairness', 'provably-fair', 'seed', 'hash', 'hmac', 'sha256', 'nachprüfung'],
  '2026-08-21',
  true
),
(
  'guide-limits',
  'economy-limits',
  'economy',
  'Einsatzlimits, Mindesteinsätze und Wallet-Sicherheit',
  'Einsätze sind plattformweit von mindestens $0.10 bis maximal $10,000.00 pro Runde möglich. Alle Salden werden in atomaren Server-RPCs verwaltet.',
  ARRAY['limits', 'mindesteinsatz', 'maximaleinsatz', 'einsatzlimits', 'guthaben', 'sicherheit'],
  '2026-08-21',
  true
)
ON CONFLICT (id) DO NOTHING;
