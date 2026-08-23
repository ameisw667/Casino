export interface GameTabConfig {
  id: string;
  name: string;
  badge: string;
  maxPayout: string;
  path: string;
  image: string;
  accentColor: string;
  simType: 'crash' | 'blackjack' | 'dice' | 'roulette' | 'slots';
}

export const GAME_TABS: GameTabConfig[] = [
  {
    id: 'crash',
    name: 'CRASH ROCKET',
    badge: 'HOT ORIGINALS',
    maxPayout: '10,000x',
    path: '/games/crash',
    image: '/images/game-crash-new.png',
    accentColor: '#FF4500',
    simType: 'crash',
  },
  {
    id: 'blackjack',
    name: 'VIP BLACKJACK',
    badge: 'HIGH STAKES',
    maxPayout: '2.5x',
    path: '/games/blackjack',
    image: '/images/game-blackjack-new.png',
    accentColor: '#D4AF37',
    simType: 'blackjack',
  },
  {
    id: 'dice',
    name: 'ULTIMATE DICE',
    badge: 'PROVABLY FAIR',
    maxPayout: '990x',
    path: '/games/dice',
    image: '/images/game-dice-new.png',
    accentColor: '#00E701',
    simType: 'dice',
  },
  {
    id: 'roulette',
    name: 'ROYALE ROULETTE',
    badge: 'CLASSIC',
    maxPayout: '36x',
    path: '/games/roulette',
    image: '/images/game-roulette-new.png',
    accentColor: '#9370DB',
    simType: 'roulette',
  },
  {
    id: 'slots',
    name: 'NEON 777 SLOTS',
    badge: 'JACKPOT',
    maxPayout: '5,000x',
    path: '/games/slots',
    image: '/images/lucky-777-neon-3d.png',
    accentColor: '#FF007F',
    simType: 'slots',
  },
];

export const FLOATING_PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  x: (i * 19) % 100,
  y: (i * 29) % 100,
  size: (i % 4) + 2,
  duration: 6 + (i % 5),
  delay: (i % 3) * 0.8,
}));
