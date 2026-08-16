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
  const filters = [
    { key: 'ALL', label: 'Alle Wetten' },
    { key: 'WINS', label: 'Nur Gewinne' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(12, 12, 14, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '14px',
        padding: '8px 14px',
      }}
    >
      <div style={{ display: 'flex', gap: '6px' }}>
        {filters.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: isActive ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid transparent',
                background: isActive ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                color: isActive ? '#D4AF37' : 'rgba(255, 255, 255, 0.5)',
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '0.02em',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: 'rgba(255, 255, 255, 0.4)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {filteredCount} Einträge
      </div>
    </div>
  );
}
