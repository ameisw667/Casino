'use client';

import { Play, RotateCcw } from 'lucide-react';

interface SandboxHeaderProps {
  spinning: boolean;
  onTestSpin: () => void;
  onClearBets: () => void;
}

export function SandboxHeader({ spinning, onTestSpin, onClearBets }: SandboxHeaderProps) {
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
            FE-04 SANDBOX · MONTE-CARLO GRAND CASINO
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
            TCS John Huxley Mark VII · 100% Synchrondreh-Physik
          </span>
        </div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '6px 0 2px', color: '#FFFFFF' }}>
          Monte-Carlo Grand Casino — TCS John Huxley Sovereign Engine
        </h1>
        <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
          Photorealistisches 80cm-Mahagoni-Roulette mit 3D-Prismen-Stegen, 4-Phasen Kugelbahn-Physik
          und millisekundengenauer Ergebnis-Synchronisation.
        </p>
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          onClick={onTestSpin}
          disabled={spinning}
          style={{
            padding: '12px 26px',
            borderRadius: '12px',
            border: 'none',
            background: spinning
              ? '#2E2E32'
              : 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #B8860B 100%)',
            color: spinning ? '#8A8A8A' : '#000000',
            fontSize: '0.92rem',
            fontWeight: 900,
            cursor: spinning ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: spinning ? 'none' : '0 4px 22px rgba(212, 175, 55, 0.45)',
          }}
        >
          <Play size={16} fill={spinning ? '#8A8A8A' : '#000000'} />
          <span>{spinning ? 'Kugel im Kessel...' : 'Test-Spin starten'}</span>
        </button>

        <button
          type="button"
          onClick={onClearBets}
          style={{
            padding: '10px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            background: 'rgba(255, 255, 255, 0.04)',
            color: '#D4AF37',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <RotateCcw size={14} />
          <span>Einsätze leeren</span>
        </button>
      </div>
    </div>
  );
}
