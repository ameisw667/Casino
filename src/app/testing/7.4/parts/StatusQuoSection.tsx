import React from 'react';
import { Info } from 'lucide-react';
import { sectionHeadingStyle } from './shared';

interface StatusQuoSectionProps {
  value: number;
  onChange: (value: number) => void;
}

export function StatusQuoSection({ value, onChange }: StatusQuoSectionProps) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 style={sectionHeadingStyle}>
        <Info size={22} style={{ color: '#94a3b8' }} /> 1. Status Quo — Ist-Zustand im Bestand
      </h2>
      <div
        style={{
          background: '#0b0e14',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#94a3b8',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span>Game: /games/dice (Range Control)</span>
          <span>Aktueller Wert: {value}%</span>
        </div>
        <input
          type="range"
          min="1"
          max="98"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          style={{ width: '100%', cursor: 'pointer' }}
        />
      </div>
    </section>
  );
}
