'use client';

import { LuxuryRouletteWheel } from '@/components/casino/games/roulette/LuxuryRouletteWheel';
import { RouletteWinnerReveal } from '@/components/casino/games/roulette/RouletteWinnerReveal';
import type { RouletteNumber } from '@/components/casino/games/roulette/types';

interface WheelShowcaseProps {
  spinning: boolean;
  targetNumber: RouletteNumber | null;
  revealedWinner: RouletteNumber | null;
  lastWinAmount: number | null;
  lastMultiplier: number | null;
}

export function WheelShowcase({
  spinning,
  targetNumber,
  revealedWinner,
  lastWinAmount,
  lastMultiplier,
}: WheelShowcaseProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: 5,
      }}
    >
      <LuxuryRouletteWheel spinning={spinning} winningNumber={targetNumber} />

      {/* Slogan & Golden Bridge */}
      <div
        style={{
          margin: '14px 0 10px',
          textAlign: 'center',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 900,
            letterSpacing: '4px',
            color: '#F5E6A3',
            textTransform: 'uppercase',
            fontFamily: 'serif',
          }}
        >
          MONTE-CARLO ROYAL TABLEAU · SINGLE ZERO EUROPEAN
        </span>
      </div>

      {/* Winner Reveal HUD (Erscheint EXAKT bei Stillstand!) */}
      <RouletteWinnerReveal
        spinning={spinning || !revealedWinner}
        winningNumber={revealedWinner}
        lastWinAmount={lastWinAmount}
        lastMultiplier={lastMultiplier}
      />
    </div>
  );
}
