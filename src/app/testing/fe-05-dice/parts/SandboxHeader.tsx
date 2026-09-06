'use client';

import { Play } from 'lucide-react';

interface SandboxHeaderProps {
  rolling: boolean;
  onRoll: () => void;
  onNearMissRoll: () => void;
}

export function SandboxHeader({ rolling, onRoll, onNearMissRoll }: SandboxHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '18px 24px',
        borderRadius: '18px',
        background:
          'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(14, 16, 22, 0.95) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '0.68rem',
              color: '#D4AF37',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            FE-05 SANDBOX · MONTE-CARLO SOVEREIGN
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              color: '#34D399',
              background: 'rgba(16, 185, 129, 0.12)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            Target unter dem Slider · Subtile Telemetrie · Sanfter Schatten
          </span>
        </div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '6px 0 2px', color: '#FFFFFF' }}>
          Monte-Carlo Sovereign — Perfektionierte Ausführung
        </h1>
        <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
          Der schwarze Schatten wurde sanft abgetönt, die <code>OVER/UNDER</code>-Marke liegt nun
          ergonomisch unter dem Slider, und die 3 Metrik-Karten wurden subtil in den Kaschmirfilz
          integriert.
        </p>
      </div>

      {/* Quick Test Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          onClick={onRoll}
          disabled={rolling}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            background: rolling
              ? '#2E2E32'
              : 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #B8860B 100%)',
            color: rolling ? '#8A8A8A' : '#000000',
            fontSize: '0.90rem',
            fontWeight: 900,
            cursor: rolling ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: rolling ? 'none' : '0 4px 20px rgba(212, 175, 55, 0.45)',
          }}
        >
          <Play size={16} fill={rolling ? '#8A8A8A' : '#000000'} />
          <span>{rolling ? 'Kugel rollt...' : 'Test-Roll starten'}</span>
        </button>

        <button
          type="button"
          onClick={onNearMissRoll}
          disabled={rolling}
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            background: 'rgba(245, 158, 11, 0.1)',
            color: '#FBBF24',
            fontSize: '0.80rem',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          ⚡ Near-Miss Test
        </button>
      </div>
    </div>
  );
}
