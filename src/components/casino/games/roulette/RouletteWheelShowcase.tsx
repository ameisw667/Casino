'use client';

import type { RouletteNumber } from './types';
import { LuxuryRouletteWheel } from './LuxuryRouletteWheel';
import { RouletteWinnerReveal } from './RouletteWinnerReveal';

interface RouletteWheelShowcaseProps {
  spinning: boolean;
  wheelTargetNumber: RouletteNumber | null;
  onSettled: () => void;
  displayWinningNumber: RouletteNumber | null;
  lastWinAmount: number | null;
  lastMultiplier: number | null;
}

export function RouletteWheelShowcase({
  spinning,
  wheelTargetNumber,
  onSettled,
  displayWinningNumber,
  lastWinAmount,
  lastMultiplier,
}: RouletteWheelShowcaseProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 5,
      }}
    >
      {/* 3D Mahagoni-Kesselschale mit 8 Messing-Deflektoren */}
      <div
        style={{
          padding: '28px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 25%, #522416 0%, #33140B 50%, #150503 100%)',
          border: '3.5px solid #E5C158',
          boxShadow:
            '0 40px 90px rgba(0, 0, 0, 0.99), inset 0 8px 16px rgba(255, 255, 255, 0.35), inset 0 -14px 30px rgba(0, 0, 0, 0.98), 0 0 40px rgba(212, 175, 55, 0.35)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '12px',
            borderRadius: '50%',
            border: '2px solid rgba(212, 175, 55, 0.55)',
            boxShadow: 'inset 0 12px 28px rgba(0, 0, 0, 0.95)',
            pointerEvents: 'none',
          }}
        />

        {/* 8 Messing-Rauten (Deflektoren) */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <div
            key={`fret-live-${deg}`}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '9px',
              height: '16px',
              background: 'linear-gradient(135deg, #FFF5B8 0%, #FFD700 50%, #8A6500 100%)',
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              boxShadow: '0 0 8px rgba(255, 215, 0, 0.9)',
              transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-224px)`,
              pointerEvents: 'none',
              zIndex: 6,
            }}
          />
        ))}

        <LuxuryRouletteWheel
          spinning={spinning}
          winningNumber={wheelTargetNumber}
          onSettled={onSettled}
        />
      </div>

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

      {/* Winner Number Reveal HUD (Reveals strictly after ball settles) */}
      <RouletteWinnerReveal
        spinning={spinning}
        winningNumber={displayWinningNumber}
        lastWinAmount={lastWinAmount}
        lastMultiplier={lastMultiplier}
      />
    </div>
  );
}
