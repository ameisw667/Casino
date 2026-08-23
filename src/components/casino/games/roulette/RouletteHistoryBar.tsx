'use client';

import { Flame, Snowflake } from 'lucide-react';
import type { Color, RouletteNumber } from './types';

interface SectorEntry {
  n: number;
  c: Color;
}

interface RouletteHistoryBarProps {
  history: RouletteNumber[];
  sectorStats: { hot: SectorEntry[]; cold: SectorEntry[] };
}

/**
 * Top bar of the roulette stage: Hot & Cold sector pills (or accumulating
 * badge while < 5 spins) on the left, last 18 winning-number badges on the
 * right. Pure presentational — extracted verbatim from RouletteClient.tsx.
 */
export function RouletteHistoryBar({ history, sectorStats }: RouletteHistoryBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 5,
        flexWrap: 'wrap',
        gap: '10px',
      }}
    >
      {/* Hot & Cold Pills or Accumulating Badge */}
      {history.length < 5 ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#D4AF37',
              boxShadow: '0 0 6px rgba(212, 175, 55, 0.8)',
            }}
          />
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#94a3b8',
              letterSpacing: '0.5px',
            }}
          >
            ACCUMULATING STATS ({history.length}/5 SPINS)...
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame size={14} color="#f97316" />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f97316' }}>HOT:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {sectorStats.hot.map((h) => (
                <span
                  key={h.n}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    fontFamily: 'monospace',
                    color: h.c === 'RED' ? '#f87171' : h.c === 'BLACK' ? '#cbd5e1' : '#4ade80',
                  }}
                >
                  {h.n}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Snowflake size={14} color="#38bdf8" />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8' }}>COLD:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {sectorStats.cold.map((c) => (
                <span
                  key={c.n}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    fontFamily: 'monospace',
                    color: c.c === 'RED' ? '#f87171' : c.c === 'BLACK' ? '#cbd5e1' : '#4ade80',
                  }}
                >
                  {c.n}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Last 18 Number Badges */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          maxWidth: '100%',
        }}
      >
        {history.map((h, i) => (
          <div
            key={`${h.n}-${i}`}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 900,
              fontFamily: 'monospace',
              color: '#FFF',
              background: h.c === 'GREEN' ? '#059669' : h.c === 'RED' ? '#dc2626' : '#1e1e2d',
              border: `1px solid ${
                h.c === 'GREEN'
                  ? 'rgba(16, 185, 129, 0.4)'
                  : h.c === 'RED'
                    ? 'rgba(239, 68, 68, 0.4)'
                    : 'rgba(255, 255, 255, 0.15)'
              }`,
              boxShadow: i === 0 ? '0 0 10px rgba(212, 175, 55, 0.6)' : 'none',
            }}
          >
            {h.n}
          </div>
        ))}
      </div>
    </div>
  );
}
