'use client';

import { Flame } from 'lucide-react';
import type { CrashHistoryItem } from './crash-sandbox-types';

interface FlightTopRowProps {
  winStreak: number;
  history: CrashHistoryItem[];
}

export function FlightTopRow({ winStreak, history }: FlightTopRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              color: 'rgba(255, 255, 255, 0.38)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            FLIGHT DECK TELEMETRY
          </span>
        )}
      </div>

      {/* Multiplier History Stream */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', maxWidth: '60%' }}>
        {history.map((h) => (
          <div
            key={h.id}
            style={{
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 800,
              fontFamily: 'monospace',
              background: h.win ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: h.win
                ? '1px solid rgba(16, 185, 129, 0.35)'
                : '1px solid rgba(239, 68, 68, 0.35)',
              color: h.win ? '#34D399' : '#F87171',
            }}
          >
            {h.multiplier.toFixed(2)}×
          </div>
        ))}
      </div>
    </div>
  );
}
