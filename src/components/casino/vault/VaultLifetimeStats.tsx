'use client';
import { BarChart3 } from 'lucide-react';
import type { TotalStats } from './vault-card';
import { card } from './vault-card';

interface VaultLifetimeStatsProps {
  isMobile: boolean;
  totalStats: TotalStats;
}

export function VaultLifetimeStats({ isMobile, totalStats }: VaultLifetimeStatsProps) {
  return (
    <div style={{ ...card({ padding: isMobile ? '20px 16px' : '28px' }) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <BarChart3 size={16} color="rgba(255,255,255,0.4)" />
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '0.02em',
          }}
        >
          LIFETIME STATS
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {[
          { label: 'BETS', value: totalStats.totalBets.toLocaleString(), color: '#fff' },
          { label: 'WIN RATE', value: `${totalStats.winRate.toFixed(1)}%`, color: '#fff' },
          {
            label: 'PROFIT',
            value: `${totalStats.totalProfit >= 0 ? '+' : ''}$${totalStats.totalProfit.toFixed(2)}`,
            color: totalStats.totalProfit >= 0 ? '#10b981' : '#ef4444',
          },
          { label: 'WAGERED', value: `$${totalStats.wagered.toFixed(0)}`, color: '#D4AF37' },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <div
              style={{
                fontSize: '0.5rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.06em',
                marginBottom: '6px',
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontSize: '1.1rem',
                fontWeight: 900,
                color: s.color,
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
