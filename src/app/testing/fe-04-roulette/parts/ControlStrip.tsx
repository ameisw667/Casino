'use client';

import { STRATEGY_PRESETS, type StrategyPreset } from './shared';

interface ControlStripProps {
  showRacetrack: boolean;
  onToggleRacetrack: () => void;
  onApplyPreset: (preset: StrategyPreset) => void;
  lastWinAmount: number | null;
}

export function ControlStrip({
  showRacetrack,
  onToggleRacetrack,
  onApplyPreset,
  lastWinAmount,
}: ControlStripProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        padding: '8px 14px',
        borderRadius: '12px',
        background:
          'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(10, 14, 20, 0.8) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Links: Kessel-Rennbahn Toggle Button */}
      <button
        type="button"
        onClick={onToggleRacetrack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '8px',
          background: showRacetrack
            ? 'linear-gradient(180deg, hsla(var(--primary), 0.25) 0%, hsla(var(--primary), 0.1) 100%)'
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
          border: showRacetrack
            ? '1px solid hsla(var(--primary), 0.65)'
            : '1px solid rgba(255, 255, 255, 0.12)',
          color: showRacetrack ? '#FFD700' : 'rgba(255, 255, 255, 0.9)',
          fontSize: '0.70rem',
          fontWeight: 800,
          cursor: 'pointer',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          transition: 'all 0.18s ease',
          boxShadow: showRacetrack ? '0 0 12px hsla(var(--primary), 0.3)' : 'none',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: showRacetrack ? '#FFD700' : 'rgba(255, 255, 255, 0.4)',
          }}
        />
        <span>{showRacetrack ? 'Rennbahn schließen' : 'Kessel-Rennbahn'}</span>
      </button>

      {/* Mitte: Zentrierte Strategy Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          flexWrap: 'wrap',
          flex: 1,
        }}
      >
        {STRATEGY_PRESETS.map((preset) => (
          <button
            key={preset.key}
            type="button"
            onClick={() => onApplyPreset(preset.key)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background:
                'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.92)',
              fontSize: '0.68rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 2px 6px rgba(0, 0, 0, 0.25)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'hsla(var(--primary), 0.55)';
              e.currentTarget.style.background =
                'linear-gradient(180deg, hsla(var(--primary), 0.2) 0%, hsla(var(--primary), 0.06) 100%)';
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.boxShadow =
                '0 4px 14px rgba(0, 0, 0, 0.4), 0 0 10px hsla(var(--primary), 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.background =
                'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.92)';
              e.currentTarget.style.boxShadow =
                'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 2px 6px rgba(0, 0, 0, 0.25)';
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Rechts: Live Payout Tracker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: '#34D399',
              fontFamily: 'var(--font-mono, monospace)',
              letterSpacing: '0.04em',
            }}
          >
            POTENZIAL: +${lastWinAmount ?? 360}
          </span>
        </div>
      </div>
    </div>
  );
}
