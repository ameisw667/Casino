import { TrendingUp, RotateCcw, CircleDollarSign, Zap, Spade, type LucideIcon } from 'lucide-react';

/**
 * Same game -> icon/color mapping as src/app/games/page.tsx, reused here so the
 * per-game charts stay visually consistent with the games lobby instead of
 * inventing a second palette (see worldmap/05_1.7_USER_STATS_ANALYTICS.md F6).
 */
export interface GameMeta {
  label: string;
  icon: LucideIcon;
  color: string;
}

export const GAME_META: Record<string, GameMeta> = {
  crash: { label: 'Crash', icon: TrendingUp, color: 'hsl(var(--primary))' },
  dice: { label: 'Dice', icon: RotateCcw, color: 'hsl(var(--secondary))' },
  roulette: { label: 'Roulette', icon: CircleDollarSign, color: 'hsl(var(--accent))' },
  slots: { label: 'Slots', icon: Zap, color: 'hsl(var(--primary))' },
  blackjack: { label: 'Blackjack', icon: Spade, color: 'hsl(var(--secondary))' },
};

const FALLBACK_META: GameMeta = {
  label: 'Other',
  icon: CircleDollarSign,
  color: 'hsl(var(--text-muted))',
};

export function getGameMeta(game: string): GameMeta {
  return GAME_META[game.toLowerCase()] ?? FALLBACK_META;
}
