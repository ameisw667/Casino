import { TableChipStack } from '@/components/casino/games/roulette/TableChipStack';
import type { BetPlacement } from '@/components/casino/games/roulette/types';

interface BetChipOverlayProps {
  bet: BetPlacement | undefined;
  size?: number;
}

export function BetChipOverlay({ bet, size = 36 }: BetChipOverlayProps) {
  if (!bet) return null;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <TableChipStack amount={bet.amount} size={size} />
    </div>
  );
}
