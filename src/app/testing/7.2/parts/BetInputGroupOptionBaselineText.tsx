import React from 'react';
import { DollarSign } from 'lucide-react';

interface BetInputGroupOptionBaselineTextProps {
  bet: number;
  onSetBet: (value: number) => void;
  balance: number;
  minBet: number;
}

export function BetInputGroupOptionBaselineText({
  bet,
  onSetBet,
  balance,
  minBet,
}: BetInputGroupOptionBaselineTextProps) {
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
        gap: '20px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 4px 0',
            }}
          >
            Option 1-b: Baseline Text
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
            Schlichter Text-Header mit ungerichtetem Abstand.
          </p>
        </div>

        <div
          style={{
            padding: '16px',
            background: '#06080e',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#94a3b8',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span>BET AMOUNT ($)</span>
            <span>Balance: ${balance.toFixed(2)}</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#0b0f18',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: '12px',
              padding: '4px 12px',
            }}
          >
            <DollarSign size={18} style={{ color: '#e5c158', flexShrink: 0 }} />
            <input
              type="number"
              value={bet}
              onChange={(e) => onSetBet(parseFloat(e.target.value) || 0)}
              style={{
                flex: 1,
                minWidth: 0,
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                fontSize: '1.1rem',
                padding: '8px 4px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            <button
              onClick={() => onSetBet(minBet)}
              style={{
                padding: '8px 0',
                background: '#131a26',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                color: '#cbd5e1',
                fontSize: '0.75rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
              }}
            >
              MIN
            </button>
            <button
              onClick={() => onSetBet(bet / 2)}
              style={{
                padding: '8px 0',
                background: '#131a26',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                color: '#cbd5e1',
                fontSize: '0.75rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
              }}
            >
              ½
            </button>
            <button
              onClick={() => onSetBet(bet * 2)}
              style={{
                padding: '8px 0',
                background: '#131a26',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                color: '#cbd5e1',
                fontSize: '0.75rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
              }}
            >
              2×
            </button>
            <button
              onClick={() => onSetBet(balance)}
              style={{
                padding: '8px 0',
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                borderRadius: '8px',
                color: '#e5c158',
                fontSize: '0.75rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
              }}
            >
              MAX
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
