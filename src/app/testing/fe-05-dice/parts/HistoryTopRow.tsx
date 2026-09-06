'use client';

import { Flame } from 'lucide-react';

export interface DiceRollHistory {
  id: string;
  roll: number;
  target: number;
  isOver: boolean;
  win: boolean;
  multiplier: number;
}

interface HistoryTopRowProps {
  winStreak: number;
  history: DiceRollHistory[];
}

export function HistoryTopRow({ winStreak, history }: HistoryTopRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {winStreak >= 2 ? (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '8px',
            background: 'rgba(212, 175, 55, 0.12)',
            border: '1px solid rgba(212, 175, 55, 0.28)',
            color: '#D4AF37',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
          }}
        >
          <Flame size={13} color="#D4AF37" />
          <span>{winStreak}× WIN STREAK</span>
        </div>
      ) : (
        <span
          style={{
            fontSize: '0.74rem',
            fontWeight: 800,
            color: 'rgba(255, 255, 255, 0.40)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          ROLL HISTORY
        </span>
      )}

      {/* History Stream */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', maxWidth: '70%' }}>
        {history.map((h) => (
          <div
            key={h.id}
            style={{
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 800,
              flexShrink: 0,
              fontFamily: 'var(--font-mono, monospace)',
              color: h.win ? (h.multiplier >= 5 ? '#FFD700' : '#34D399') : '#F87171',
              background: h.win ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${h.win ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.25)'}`,
            }}
          >
            {h.roll.toFixed(2)}
          </div>
        ))}
      </div>
    </div>
  );
}
