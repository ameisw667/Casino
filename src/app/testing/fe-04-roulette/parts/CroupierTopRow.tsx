'use client';

import { Volume2 } from 'lucide-react';
import { RouletteHistoryBar } from '@/components/casino/games/roulette/RouletteHistoryBar';
import type { RouletteNumber } from '@/components/casino/games/roulette/types';
import type { SpinPhase } from './shared';

interface CroupierTopRowProps {
  spinning: boolean;
  spinPhase: SpinPhase;
  revealedWinner: RouletteNumber | null;
  history: RouletteNumber[];
}

function croupierPhrase(spinPhase: SpinPhase, revealedWinner: RouletteNumber | null): string {
  if (spinPhase === 'ball_launched') return '„Faites vos jeux — Die Kugel rollt“';
  if (spinPhase === 'no_more_bets') return '„Rien ne va plus — Nichts geht mehr“';
  if (spinPhase === 'drop') return '„Kugel fällt in den Kranz...“';
  const color =
    revealedWinner?.c === 'RED' ? 'Rot' : revealedWinner?.c === 'BLACK' ? 'Schwarz' : 'Zero';
  return `„Nummer ${revealedWinner?.n ?? 17}, ${color}, Impair et Manque“`;
}

export function CroupierTopRow({
  spinning,
  spinPhase,
  revealedWinner,
  history,
}: CroupierTopRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        position: 'relative',
        zIndex: 10,
        width: '100%',
      }}
    >
      {/* Croupier Voice Ribbon */}
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
            padding: '6px 16px',
            borderRadius: '8px',
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.5) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            backdropFilter: 'blur(14px)',
            boxShadow: '0 3px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          <Volume2 size={14} color="#D4AF37" className={spinning ? 'animate-pulse' : ''} />
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#FCE7A1',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              fontFamily: 'serif',
            }}
          >
            CROUPIER: {croupierPhrase(spinPhase, revealedWinner)}
          </span>
        </div>
      </div>

      {/* History Stream (Rechtsbündig) */}
      <RouletteHistoryBar history={history} />
    </div>
  );
}
