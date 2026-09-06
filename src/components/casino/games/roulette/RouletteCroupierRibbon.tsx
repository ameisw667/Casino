'use client';

import { Volume2 } from 'lucide-react';
import type { RouletteNumber } from './types';

interface RouletteCroupierRibbonProps {
  spinning: boolean;
  spinPhase: 'idle' | 'ball_launched' | 'no_more_bets' | 'drop' | 'resolved';
  displayWinningNumber: RouletteNumber | null;
}

export function RouletteCroupierRibbon({
  spinning,
  spinPhase,
  displayWinningNumber,
}: RouletteCroupierRibbonProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 14px',
          borderRadius: '8px',
          background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.5) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          backdropFilter: 'blur(14px)',
          boxShadow: '0 3px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        <Volume2 size={13} color="#D4AF37" className={spinning ? 'animate-pulse' : ''} />
        <span
          style={{
            fontSize: '0.70rem',
            fontWeight: 700,
            color: '#FCE7A1',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            fontFamily: 'serif',
          }}
        >
          CROUPIER:{' '}
          {spinPhase === 'ball_launched'
            ? '„Faites vos jeux — Die Kugel rollt“'
            : spinPhase === 'no_more_bets'
              ? '„Rien ne va plus — Nichts geht mehr“'
              : spinPhase === 'drop'
                ? '„Kugel fällt in den Kranz...“'
                : displayWinningNumber
                  ? `„Nummer ${displayWinningNumber.n}, ${displayWinningNumber.c === 'RED' ? 'Rot' : displayWinningNumber.c === 'BLACK' ? 'Schwarz' : 'Zero'}, Impair et Manque“`
                  : '„Faites vos jeux — Bitte platzieren Sie Ihre Einsätze“'}
        </span>
      </div>
    </div>
  );
}
