'use client';
import React from 'react';
import { Trophy, Crown, Zap } from 'lucide-react';

interface LeaderboardHeroStatsProps {
  totalWagered: number;
  activePlayersCount: number;
  topWinnerWager: number;
  topWinnerName: string;
  isMobile: boolean;
}

export function LeaderboardHeroStats({
  totalWagered,
  activePlayersCount,
  topWinnerWager,
  topWinnerName,
  isMobile,
}: LeaderboardHeroStatsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: isMobile ? '10px' : '14px',
      }}
    >
      <div
        style={{
          background: 'var(--stealth-surface, #141923)',
          border: '1px solid var(--stealth-border, #1e2638)',
          borderRadius: '8px',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              color: 'hsl(var(--text-dim))',
              letterSpacing: '0.08em',
            }}
          >
            VOLUME INDEX
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.4rem',
              fontWeight: 800,
              color: 'var(--stealth-accent, #cbd5e1)',
              marginTop: '4px',
            }}
          >
            ${totalWagered.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <Zap size={22} color="var(--stealth-accent, #cbd5e1)" />
      </div>

      <div
        style={{
          background: 'var(--stealth-surface, #141923)',
          border: '1px solid var(--stealth-border, #1e2638)',
          borderRadius: '8px',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              color: 'hsl(var(--text-dim))',
              letterSpacing: '0.08em',
            }}
          >
            TOP HIGH ROLLER
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.4rem',
              fontWeight: 800,
              color: 'var(--stealth-emerald, #00e676)',
              marginTop: '4px',
            }}
          >
            {topWinnerName || '—'} ($
            {topWinnerWager.toLocaleString('en-US', { maximumFractionDigits: 0 })})
          </div>
        </div>
        <Crown size={22} color="var(--stealth-emerald, #00e676)" />
      </div>

      <div
        style={{
          background: 'var(--stealth-surface, #141923)',
          border: '1px solid var(--stealth-border, #1e2638)',
          borderRadius: '8px',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              color: 'hsl(var(--text-dim))',
              letterSpacing: '0.08em',
            }}
          >
            RANKED PLAYERS
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.4rem',
              fontWeight: 800,
              color: 'var(--stealth-accent, #cbd5e1)',
              marginTop: '4px',
            }}
          >
            {activePlayersCount} PARTICIPANTS
          </div>
        </div>
        <Trophy size={22} color="var(--stealth-accent, #cbd5e1)" />
      </div>
    </div>
  );
}
