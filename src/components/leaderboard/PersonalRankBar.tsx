'use client';
import React from 'react';

interface PersonalRankBarProps {
  username: string;
  rank: string;
  level: number;
  wagered: number;
}

export function PersonalRankBar({ username, rank, level, wagered }: PersonalRankBarProps) {
  return (
    <div
      style={{
        position: 'sticky',
        bottom: '20px',
        zIndex: 20,
        background: 'var(--stealth-surface, #141923)',
        border: '1px solid var(--stealth-accent, #cbd5e1)',
        boxShadow: '0 4px 20px rgba(203, 213, 225, 0.15)',
        borderRadius: '8px',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            fontWeight: 800,
            color: 'var(--stealth-accent, #cbd5e1)',
            padding: '2px 8px',
            borderRadius: '4px',
            background: 'rgba(203, 213, 225, 0.1)',
          }}
        >
          YOUR RANK
        </div>
        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{username || 'Anonymous'}</span>
        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-dim))' }}>
          LVL {level} • {rank}
        </span>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 800,
          color: 'var(--stealth-emerald, #00e676)',
          fontSize: '0.95rem',
        }}
      >
        ${wagered.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </div>
    </div>
  );
}
