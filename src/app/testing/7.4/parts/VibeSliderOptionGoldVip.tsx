import React from 'react';
import { Flame } from 'lucide-react';

interface VibeSliderOptionGoldVipProps {
  value: number;
  onChange: (value: number) => void;
}

export function VibeSliderOptionGoldVip({ value, onChange }: VibeSliderOptionGoldVipProps) {
  return (
    <div
      style={{
        background: '#090d15',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        borderRadius: '24px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '24px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          padding: '6px 14px',
          background:
            'linear-gradient(135deg, rgba(212, 175, 55, 0.3) 0%, rgba(212, 175, 55, 0.15) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.5)',
          color: '#e5c158',
          fontWeight: 800,
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          borderBottomLeftRadius: '14px',
        }}
      >
        ★ EMPFOHLEN: Option 1-b1 (Obsidian Gold)
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h3
            style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 0 4px 0',
            }}
          >
            <Flame size={18} style={{ color: '#e5c158' }} /> Option 1-b1: Obsidian Gold VIP
            Dual-Stat
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
            100% harmonisiert mit dem Champagne Gold Marken-System (`#e5c158`).
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
                border: '1px solid rgba(212, 175, 55, 0.3)',
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
                  color: '#e5c158',
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
                border: '1px solid rgba(212, 175, 55, 0.3)',
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
                  color: '#fef08a',
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
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '9999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${value}%`,
                  height: '100%',
                  background: '#e5c158',
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
            <div
              style={{
                position: 'absolute',
                left: `calc(${value}% - 14px)`,
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#141108',
                border: '2px solid #e5c158',
                boxShadow: '0 2px 8px rgba(0,0,0,0.8)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#e5c158',
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              textAlign: 'center',
              gap: '4px',
            }}
          >
            {[1, 25, 50, 75, 98].map((pct) => (
              <button
                key={pct}
                onClick={() => onChange(pct)}
                style={{
                  padding: '6px 0',
                  background: value === pct ? 'rgba(212, 175, 55, 0.2)' : '#0b0f18',
                  border:
                    value === pct
                      ? '1px solid rgba(212, 175, 55, 0.6)'
                      : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  color: value === pct ? '#e5c158' : '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
