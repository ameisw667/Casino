'use client';

import { Play } from 'lucide-react';
import type { FlightState } from './crash-sandbox-types';

interface CockpitControlsProps {
  flightState: FlightState;
  betAmount: number;
  currentMultiplier: number;
  onBetAmountChange: (updater: (b: number) => number) => void;
  autoCashout: number | null;
  onAutoCashoutChange: (value: number) => void;
  onCashout: () => void;
  onLaunch: () => void;
}

const PANEL_STYLES = {
  background: 'rgba(0, 0, 0, 0.28)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '16px',
  padding: '12px 16px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '6px',
};

function PanelLabel({ children }: { children: string }) {
  return (
    <span
      style={{
        fontSize: '0.70rem',
        color: 'rgba(255, 255, 255, 0.45)',
        fontWeight: 700,
        letterSpacing: '0.04em',
      }}
    >
      {children}
    </span>
  );
}

const SMALL_BUTTON_STYLES = {
  padding: '4px 8px',
  borderRadius: '6px',
  background: 'rgba(255, 255, 255, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#FFF',
  fontSize: '0.72rem',
  fontWeight: 800 as const,
  cursor: 'pointer' as const,
};

export function CockpitControls({
  flightState,
  betAmount,
  currentMultiplier,
  onBetAmountChange,
  autoCashout,
  onAutoCashoutChange,
  onCashout,
  onLaunch,
}: CockpitControlsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
        position: 'relative',
        zIndex: 10,
        marginTop: '12px',
      }}
    >
      {/* Bet Amount Control */}
      <div style={PANEL_STYLES}>
        <PanelLabel>EINSATZ ($)</PanelLabel>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              color: '#FFFDF0',
              fontFamily: 'monospace',
            }}
          >
            ${betAmount.toFixed(2)}
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => onBetAmountChange((b) => Math.max(1, b / 2))}
              style={SMALL_BUTTON_STYLES}
            >
              ½
            </button>
            <button onClick={() => onBetAmountChange((b) => b * 2)} style={SMALL_BUTTON_STYLES}>
              2×
            </button>
          </div>
        </div>
      </div>

      {/* Auto Cashout Setting */}
      <div style={PANEL_STYLES}>
        <PanelLabel>AUTO-CASHOUT MULTIPLIER</PanelLabel>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              color: '#D4AF37',
              fontFamily: 'monospace',
            }}
          >
            {autoCashout ? `${autoCashout.toFixed(2)}×` : 'OFF'}
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[1.5, 2.0, 5.0].map((v) => (
              <button
                key={v}
                onClick={() => onAutoCashoutChange(v)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background:
                    autoCashout === v ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                  border:
                    autoCashout === v ? '1px solid #D4AF37' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: autoCashout === v ? '#D4AF37' : '#FFF',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {v}×
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Main Action Button */}
      <div>
        {flightState === 'FLYING' ? (
          <button
            onClick={onCashout}
            style={{
              width: '100%',
              height: '100%',
              minHeight: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              border: 'none',
              color: '#FFF',
              fontSize: '1.05rem',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            CASHOUT ${(betAmount * currentMultiplier).toFixed(2)}
          </button>
        ) : (
          <button
            onClick={onLaunch}
            style={{
              width: '100%',
              height: '100%',
              minHeight: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #D4AF37 0%, #B89222 100%)',
              border: 'none',
              color: '#07090E',
              fontSize: '1.05rem',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(212, 175, 55, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Play size={18} fill="currentColor" />
            WETTE PLATZIEREN & START
          </button>
        )}
      </div>
    </div>
  );
}
