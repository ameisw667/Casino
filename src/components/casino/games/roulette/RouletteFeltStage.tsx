'use client';

import type { ReactNode } from 'react';
import type { RouletteNumber } from './types';

interface RouletteFeltStageProps {
  isMobile: boolean;
  displayWinningNumber: RouletteNumber | null;
  spinning: boolean;
  children: ReactNode;
}

export function RouletteFeltStage({
  isMobile,
  displayWinningNumber,
  spinning,
  children,
}: RouletteFeltStageProps) {
  return (
    <div
      className="roulette-center game-area"
      style={{
        borderRadius: '32px',
        background: '#07090E',
        border: '3px solid #2B1D12',
        boxShadow: '0 40px 100px rgba(0, 0, 0, 0.99), inset 0 2px 6px rgba(255, 255, 255, 0.12)',
        padding: isMobile ? '10px' : '16px',
        perspective: '1400px',
        position: 'relative',
        boxSizing: 'border-box',
        order: isMobile ? 1 : 2,
        minWidth: 0,
        width: '100%',
      }}
    >
      {/* Haupt-Tischfilz mit Smaragd-Kaschmir Ausleuchtung */}
      <div
        style={{
          width: '100%',
          borderRadius: '24px',
          background:
            displayWinningNumber && !spinning
              ? 'radial-gradient(ellipse at 50% 22%, #185239 0%, #0D3222 45%, #05160E 100%)'
              : 'radial-gradient(ellipse at 50% 20%, #134630 0%, #0B2C1E 45%, #05160E 100%)',
          border: '1.5px solid rgba(212, 175, 55, 0.4)',
          boxShadow:
            displayWinningNumber && !spinning
              ? '0 0 50px rgba(212, 175, 55, 0.25), inset 0 0 80px rgba(0, 0, 0, 0.9)'
              : '0 25px 60px rgba(0, 0, 0, 0.95), inset 0 0 80px rgba(0, 0, 0, 0.9)',
          padding: isMobile ? '16px 12px 24px' : '24px 24px 34px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.6s ease',
        }}
      >
        {/* Dynamic Spotlight-Fokus */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              displayWinningNumber && !spinning
                ? 'radial-gradient(circle at 50% 25%, rgba(255, 220, 120, 0.25) 0%, rgba(16, 185, 129, 0.1) 50%, transparent 80%)'
                : 'radial-gradient(circle at 50% 20%, rgba(255, 235, 170, 0.18) 0%, transparent 75%)',
            pointerEvents: 'none',
            transition: 'background 0.8s ease',
          }}
        />

        {children}
      </div>
    </div>
  );
}
