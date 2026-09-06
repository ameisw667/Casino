import React from 'react';

interface VibeSliderOptionEmeraldProps {
  value: number;
  onChange: (value: number) => void;
}

export function VibeSliderOptionEmerald({ value, onChange }: VibeSliderOptionEmeraldProps) {
  return (
    <div
      style={{
        background: '#090d15',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '24px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h3
            style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 4px 0',
            }}
          >
            Option 1-b: Baseline Emerald Dual-Stat
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
            Bisherige Smaragdgrün-Variante (`#34d399`).
          </p>
        </div>

        <div
          style={{
            padding: '20px',
            background: '#06080e',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div
              style={{
                padding: '10px 14px',
                background: '#0b0f18',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '10px',
              }}
            >
              <span
                style={{
                  fontSize: '0.65rem',
                  color: '#94a3b8',
                  fontFamily: 'var(--font-mono)',
                  display: 'block',
                }}
              >
                CHANCE
              </span>
              <strong
                style={{
                  fontSize: '1.1rem',
                  color: '#34d399',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {value}%
              </strong>
            </div>
            <div
              style={{
                padding: '10px 14px',
                background: '#0b0f18',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '10px',
              }}
            >
              <span
                style={{
                  fontSize: '0.65rem',
                  color: '#94a3b8',
                  fontFamily: 'var(--font-mono)',
                  display: 'block',
                }}
              >
                MULTIPLIER
              </span>
              <strong
                style={{
                  fontSize: '1.1rem',
                  color: '#34d399',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {(98 / value).toFixed(2)}×
              </strong>
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '10px',
                background: '#0b0f18',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '9999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${value}%`,
                  height: '100%',
                  background: '#34d399',
                  borderRadius: '9999px',
                }}
              />
            </div>
            <input
              type="range"
              min="1"
              max="98"
              value={value}
              onChange={(e) => onChange(parseInt(e.target.value))}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
                zIndex: 10,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
