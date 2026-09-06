import type React from 'react';
import { TrendingUp, RotateCcw, CircleDollarSign, Zap, Spade } from 'lucide-react';

export type GameId = 'crash' | 'crash-multiplayer' | 'dice' | 'roulette' | 'slots' | 'blackjack';

export interface GameMeta {
  id: GameId;
  name: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  desc: string;
  path: string;
  color: string;
  accentColor: string;
  reward: string;
  rating: string;
  category: 'HOT' | 'NEW' | 'JACKPOT';
  tags: ('ORIGINALS' | 'TABLE' | 'SLOTS' | 'HIGH ROLLER')[];
  studio: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  preview: string;
}

export const GAMES: readonly GameMeta[] = [
  {
    id: 'crash',
    name: 'Crash',
    icon: TrendingUp,
    desc: 'Rising multiplier — cash out before it crashes.',
    path: '/games/crash',
    color: '#D4AF37',
    accentColor: '#D4AF37',
    reward: '$500.00',
    rating: '4.9',
    category: 'HOT',
    tags: ['ORIGINALS', 'HIGH ROLLER'],
    studio: 'ROYALE ORIGINALS',
    difficulty: 'Medium',
    preview: '/images/games/hero-crash-quantum-gold.png',
  },
  {
    id: 'dice',
    name: 'Dice',
    icon: RotateCcw,
    desc: 'Custom odds. Predict the roll, multiply winnings.',
    path: '/games/dice',
    color: '#00F0FF',
    accentColor: '#00F0FF',
    reward: '$250.00',
    rating: '4.7',
    category: 'NEW',
    tags: ['ORIGINALS'],
    studio: 'VIBE PRIME',
    difficulty: 'Easy',
    preview: '/images/games/hero-dice-quantum-gold.png',
  },
  {
    id: 'roulette',
    name: 'Roulette',
    icon: CircleDollarSign,
    desc: 'Classic casino. High-stakes payouts, 0–36.',
    path: '/games/roulette',
    color: '#FF0055',
    accentColor: '#FF0055',
    reward: '$1,000.00',
    rating: '4.8',
    category: 'HOT',
    tags: ['ORIGINALS', 'TABLE', 'HIGH ROLLER'],
    studio: 'ROYALE ORIGINALS',
    difficulty: 'Hard',
    preview: '/images/games/hero-roulette-quantum-gold.png',
  },
  {
    id: 'slots',
    name: 'Slots',
    icon: Zap,
    desc: 'Infinite reels. Legendary jackpots waiting.',
    path: '/games/slots',
    color: '#FFE600',
    accentColor: '#FFE600',
    reward: '$5,000.00',
    rating: '4.9',
    category: 'JACKPOT',
    tags: ['ORIGINALS', 'SLOTS'],
    studio: 'VIBE PRIME',
    difficulty: 'Easy',
    preview: '/images/games/hero-slots-quantum-gold.png',
  },
  {
    id: 'blackjack',
    name: 'Blackjack',
    icon: Spade,
    desc: 'Beat the dealer to 21. Hit, Stand, Double & Split.',
    path: '/games/blackjack',
    color: '#00E676',
    accentColor: '#00E676',
    reward: '$10,000.00',
    rating: '4.8',
    category: 'HOT',
    tags: ['ORIGINALS', 'TABLE', 'HIGH ROLLER'],
    studio: 'ROYALE ORIGINALS',
    difficulty: 'Medium',
    preview: '/images/games/hero-blackjack-quantum-gold.png',
  },
  {
    id: 'crash-multiplayer',
    name: 'Crash Multiplayer',
    icon: TrendingUp,
    desc: 'Shared room flight. Live bets, real-time multiplayer cashouts.',
    path: '/games/crash-multiplayer',
    color: '#D4AF37',
    accentColor: '#D4AF37',
    reward: '$500.00',
    rating: '4.9',
    category: 'HOT',
    tags: ['ORIGINALS', 'HIGH ROLLER'],
    studio: 'ROYALE ORIGINALS',
    difficulty: 'Medium',
    preview: '/images/games/hero-crash-multiplayer-quantum-gold.png',
  },
] as const;

export const CATEGORIES = ['ALL', 'ORIGINALS', 'TABLE', 'SLOTS', 'HIGH ROLLER'] as const;
export type CategoryType = (typeof CATEGORIES)[number];

export const MIN_STAKE = '$0.10';
