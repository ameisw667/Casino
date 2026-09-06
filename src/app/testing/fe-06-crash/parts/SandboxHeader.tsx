'use client';

import { Play, Rocket } from 'lucide-react';
import type { FlightState } from './crash-sandbox-types';

interface SandboxHeaderProps {
  flightState: FlightState;
  onLaunch: (targetCrash?: number) => void;
}

export function SandboxHeader({ flightState, onLaunch }: SandboxHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      <div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            borderRadius: '12px',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            color: '#D4AF37',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            marginBottom: '8px',
          }}
        >
          <Rocket size={14} />
          MONTE-CARLO SOVEREIGN FLIGHT DECK (FE-06)
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: '1.85rem',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #FFFDF0 0%, #D4AF37 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Monte-Carlo Sovereign Flight Deck
        </h1>
        <p style={{ margin: '6px 0 0', color: 'rgba(255, 255, 255, 0.55)', fontSize: '0.90rem' }}>
          Präzise arretierte Crash-Koordinate, keine Geister-Linien, Einmal-Supernova-VFX und 100%
          sauberer Alpha-Jet.
        </p>
      </div>

      {/* Quick Simulation Trigger Buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => onLaunch()}
          disabled={flightState === 'FLYING'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '12px',
            background:
              flightState === 'FLYING'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'linear-gradient(135deg, #D4AF37 0%, #B89222 100%)',
            color: flightState === 'FLYING' ? 'rgba(255, 255, 255, 0.3)' : '#07090E',
            fontWeight: 900,
            fontSize: '0.85rem',
            border: 'none',
            cursor: flightState === 'FLYING' ? 'not-allowed' : 'pointer',
            boxShadow: flightState === 'FLYING' ? 'none' : '0 6px 20px rgba(212, 175, 55, 0.35)',
          }}
        >
          <Play size={15} fill="currentColor" />
          START FLIGHT
        </button>

        <button
          onClick={() => onLaunch(1.18)}
          disabled={flightState === 'FLYING'}
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#EF4444',
            fontWeight: 800,
            fontSize: '0.80rem',
            cursor: 'pointer',
          }}
        >
          ⚡ Instant Crash (1.18×)
        </button>

        <button
          onClick={() => onLaunch(7.77)}
          disabled={flightState === 'FLYING'}
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10B981',
            fontWeight: 800,
            fontSize: '0.80rem',
            cursor: 'pointer',
          }}
        >
          🚀 Mega Flight (7.77×)
        </button>
      </div>
    </div>
  );
}
