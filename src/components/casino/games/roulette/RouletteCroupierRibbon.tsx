'use client';

import { Volume2 } from 'lucide-react';
import type { RouletteNumber } from './types';
import { KineticTextReveal } from '@/components/casino/typography/KineticTextReveal';

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
  const calloutText =
    spinPhase === 'ball_launched'
      ? '„FAITES VOS JEUX — DIE KUGEL ROLLT“'
      : spinPhase === 'no_more_bets'
        ? '„RIEN NE VA PLUS — NICHTS GEHT MEHR“'
        : spinPhase === 'drop'
          ? '„KUGEL FÄLLT IN DEN KRANZ...“'
          : displayWinningNumber
            ? `„NUMMER ${displayWinningNumber.n}, ${displayWinningNumber.c === 'RED' ? 'ROT' : displayWinningNumber.c === 'BLACK' ? 'SCHWARZ' : 'ZERO'}, IMPAIR ET MANQUE“`
            : '„FAITES VOS JEUX — BITTE PLATZIEREN SIE IHRE EINSÄTZE“';

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
            fontWeight: 800,
            color: '#D4AF37',
            letterSpacing: '0.8px',
            fontFamily: 'serif',
            marginRight: '4px',
          }}
        >
          CROUPIER:
        </span>
        <KineticTextReveal
          text={calloutText}
          triggerKey={`${spinPhase}-${displayWinningNumber?.n ?? 'none'}`}
          variant="croupier"
          colorScheme="gold"
          skewAngle={10}
          fontSize="0.70rem"
          fontFamily="serif"
          fontWeight={700}
          letterSpacing="0.5px"
        />
      </div>
    </div>
  );
}
