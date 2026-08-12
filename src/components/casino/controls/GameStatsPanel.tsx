'use client';

import React from 'react';
import { TrendingUp, Award, BarChart3, Repeat, ShieldCheck } from 'lucide-react';

export interface GameStatsPanelProps {
  totalWagered: number;
  netProfit: number;
  betsCount: number;
  winRate: number; // Percentage (0-100)
  highestMultiplier?: number;
  className?: string;
}

/**
 * Standardized Casino Royale GameStatsPanel Component.
 * Approved Standard (Initiative 7.6) — Session Stats & Profit Consolidation Panel.
 *
 * Features:
 * - Real-time net profit display with green/red dynamic colorway
 * - Total wagered, bets count, win rate percentage, and peak multiplier
 * - Monospace typography to prevent layout flicker
 * - Zero fuzzy AI glows
 */
export function GameStatsPanel({
  totalWagered,
  netProfit,
  betsCount,
  winRate,
  highestMultiplier = 1.0,
  className = '',
}: GameStatsPanelProps) {
  const isProfitPositive = netProfit >= 0;

  return (
    <div
      className={className}
      style={{
        background: '#090d15',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        borderRadius: '20px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#e5c158',
            fontFamily: 'var(--font-mono), monospace',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <BarChart3 size={14} /> SESSION STATISTIKEN
        </span>
        <span
          style={{
            fontSize: '0.7rem',
            color: '#94a3b8',
            fontFamily: 'var(--font-mono), monospace',
          }}
        >
          Echtzeit
        </span>
      </div>

      {/* Grid Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
        }}
      >
        {/* Net Profit */}
        <div
          style={{
            padding: '12px',
            background: '#0b0f18',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <span
            style={{
              fontSize: '0.65rem',
              color: '#94a3b8',
              fontFamily: 'var(--font-mono), monospace',
              fontWeight: 700,
            }}
          >
            NETTO GEWINN
          </span>
          <strong
            style={{
              fontSize: '1.05rem',
              color: isProfitPositive ? '#34d399' : '#f87171',
              fontFamily: 'var(--font-mono), monospace',
              fontWeight: 900,
            }}
          >
            {isProfitPositive ? '+' : ''}${netProfit.toFixed(2)}
          </strong>
        </div>

        {/* Total Wagered */}
        <div
          style={{
            padding: '12px',
            background: '#0b0f18',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <span
            style={{
              fontSize: '0.65rem',
              color: '#94a3b8',
              fontFamily: 'var(--font-mono), monospace',
              fontWeight: 700,
            }}
          >
            GESAMTEINSATZ
          </span>
          <strong
            style={{
              fontSize: '1.05rem',
              color: '#ffffff',
              fontFamily: 'var(--font-mono), monospace',
              fontWeight: 900,
            }}
          >
            ${totalWagered.toFixed(2)}
          </strong>
        </div>

        {/* Win Rate */}
        <div
          style={{
            padding: '12px',
            background: '#0b0f18',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <span
            style={{
              fontSize: '0.65rem',
              color: '#94a3b8',
              fontFamily: 'var(--font-mono), monospace',
              fontWeight: 700,
            }}
          >
            GEWINNRATE
          </span>
          <strong
            style={{
              fontSize: '1.05rem',
              color: '#e5c158',
              fontFamily: 'var(--font-mono), monospace',
              fontWeight: 900,
            }}
          >
            {Math.round(winRate)}%
          </strong>
        </div>

        {/* Total Bets */}
        <div
          style={{
            padding: '12px',
            background: '#0b0f18',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <span
            style={{
              fontSize: '0.65rem',
              color: '#94a3b8',
              fontFamily: 'var(--font-mono), monospace',
              fontWeight: 700,
            }}
          >
            SPIELE
          </span>
          <strong
            style={{
              fontSize: '1.05rem',
              color: '#cbd5e1',
              fontFamily: 'var(--font-mono), monospace',
              fontWeight: 900,
            }}
          >
            {betsCount}
          </strong>
        </div>
      </div>
    </div>
  );
}

export default GameStatsPanel;
