/**
 * Canonical Casino Games Registry
 * Single Source of Truth for game metadata, routes, display titles,
 * and high-resolution Quantum Gold hero artwork.
 */

export type CasinoGameId =
  'crash' | 'blackjack' | 'dice' | 'roulette' | 'slots' | 'crash-multiplayer';

export interface CasinoGameDefinition {
  id: CasinoGameId;
  name: string;
  badge: string;
  maxPayout: string;
  path: string;
  image: string;
  accentColor: string;
  category: 'originals' | 'table' | 'top_games';
  description: string;
  simType?: 'crash' | 'blackjack' | 'dice' | 'roulette' | 'slots';
}

export const CASINO_GAMES_REGISTRY: readonly CasinoGameDefinition[] = [
  {
    id: 'crash',
    name: 'CRASH ROCKET',
    badge: 'HOT ORIGINALS',
    maxPayout: '10,000x',
    path: '/games/crash',
    image: '/images/games/hero-crash-quantum-gold.png',
    accentColor: '#FF4500',
    category: 'originals',
    description: 'Multiplikator steigt in Echtzeit. Cashout vor dem Crash!',
    simType: 'crash',
  },
  {
    id: 'blackjack',
    name: 'VIP BLACKJACK',
    badge: 'HIGH STAKES',
    maxPayout: '2.5x',
    path: '/games/blackjack',
    image: '/images/games/hero-blackjack-quantum-gold.png',
    accentColor: '#D4AF37',
    category: 'table',
    description: 'Klassisches 21 mit Dealer. Double Down & Split Strategien.',
    simType: 'blackjack',
  },
  {
    id: 'dice',
    name: 'ULTIMATE DICE',
    badge: 'PROVABLY FAIR',
    maxPayout: '990x',
    path: '/games/dice',
    image: '/images/games/hero-dice-quantum-gold.png',
    accentColor: '#00E701',
    category: 'top_games',
    description: 'Wähle dein Gewinn-Ziel von 1-98%. Instant Roll Engine.',
    simType: 'dice',
  },
  {
    id: 'roulette',
    name: 'ROYALE ROULETTE',
    badge: 'CLASSIC',
    maxPayout: '36x',
    path: '/games/roulette',
    image: '/images/games/hero-roulette-quantum-gold.png',
    accentColor: '#9370DB',
    category: 'table',
    description: 'Europäisches Kesselspiel mit Red/Black & Straight-Betting.',
    simType: 'roulette',
  },
  {
    id: 'slots',
    name: 'NEON 777 SLOTS',
    badge: 'JACKPOT',
    maxPayout: '5,000x',
    path: '/games/slots',
    image: '/images/games/hero-slots-quantum-gold.png',
    accentColor: '#FF007F',
    category: 'top_games',
    description: '5-Reel Cyber Slot mit Scatter, Free Spins & Hold-Win Bonus.',
    simType: 'slots',
  },
  {
    id: 'crash-multiplayer',
    name: 'CRASH MULTIPLAYER',
    badge: 'MULTIPLAYER',
    maxPayout: '10,000x',
    path: '/games/crash-multiplayer',
    image: '/images/games/hero-crash-multiplayer-quantum-gold.png',
    accentColor: '#D4AF37',
    category: 'originals',
    description: 'Gemeinsamer Raumflug mit Live-Einsätzen anderer Spieler.',
    simType: 'crash',
  },
] as const;

export function getCasinoGame(id: string): CasinoGameDefinition | undefined {
  return CASINO_GAMES_REGISTRY.find((game) => game.id === id);
}
