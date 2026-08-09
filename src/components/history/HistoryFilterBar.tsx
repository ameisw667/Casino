'use client';
import React from 'react';

interface HistoryFilterBarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  filteredCount: number;
}

export function HistoryFilterBar({
  activeFilter,
  setActiveFilter,
  filteredCount,
}: HistoryFilterBarProps) {
  const filters = ['ALL', 'WINS'];

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--stealth-surface, #141923)',
        border: '1px solid var(--stealth-border, #1e2638)',
        borderRadius: '8px',
        padding: '10px 14px',
      }}
    >
      <div style={{ display: 'flex', gap: '8px' }}>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border:
                activeFilter === f
                  ? '1px solid var(--stealth-accent, #cbd5e1)'
                  : '1px solid transparent',
              background: activeFilter === f ? 'rgba(203, 213, 225, 0.1)' : 'transparent',
              color: activeFilter === f ? 'var(--stealth-accent, #cbd5e1)' : 'hsl(var(--text-dim))',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {f}
          </button>
        ))}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'hsl(var(--text-dim))',
        }}
      >
        {filteredCount} RECORDS
      </div>
    </div>
  );
}
