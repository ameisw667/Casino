import { Cherry, Dices, Disc3, Gamepad2, Rocket } from 'lucide-react';
import type { ReactNode } from 'react';

export function formatFullTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('de-DE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '—';
  }
}

export interface GameConfig {
  name: string;
  category: string;
  icon: ReactNode;
}

export function getGameConfig(game: string | null): GameConfig {
  const g = (game ?? '').toLowerCase();
  switch (g) {
    case 'crash':
      return { name: 'Crash', category: 'Original', icon: <Rocket size={12} color="#D4AF37" /> };
    case 'dice':
      return { name: 'Dice', category: 'Original', icon: <Dices size={12} color="#D4AF37" /> };
    case 'slots':
      return { name: 'Slots', category: 'Original', icon: <Cherry size={12} color="#D4AF37" /> };
    case 'roulette':
      return {
        name: 'Roulette',
        category: 'Tisch',
        icon: <Disc3 size={12} color="#D4AF37" />,
      };
    case 'blackjack':
      return {
        name: 'Blackjack',
        category: 'Tisch',
        icon: <Gamepad2 size={12} color="#D4AF37" />,
      };
    default:
      return {
        name: (game ?? 'Casino').toUpperCase(),
        category: 'Original',
        icon: <Gamepad2 size={12} color="#D4AF37" />,
      };
  }
}
