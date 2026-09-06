import React from 'react';
import { Wallet } from 'lucide-react';

interface BetInputGroupOptionCleanSansProps {
  bet: number;
  onSetBet: (value: number) => void;
  balance: number;
  minBet: number;
}

export function BetInputGroupOptionCleanSans({
  bet,
  onSetBet,
  balance,
  minBet,
}: BetInputGroupOptionCleanSansProps) {
  return (
    <div
      style={{
        background: '#090d15',
        border: '1px solid rgba(212, 175, 55, 0.3)',
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
            Option 2-b: Clean Sans Header
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
            Klar strukturierter Header ohne doppeltes Dollar-Zeichen.
          </p>
        </div>

        <div
          style={{
            padding: '16px',
            background: '#06080e',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#e5c158',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.08em',
              }}
            >
              BET AMOUNT
            </span>

            <button
              onClick={() => onSetBet(balance)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 8px',
                background: '#121826',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '6px',
                color: '#94a3b8',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
              }}
            >
              <Wallet size={12} style={{ color: '#e5c158' }} />
              <span>Bal:</span>
              <strong style={{ color: '#ffffff' }}>${balance.toFixed(2)}</strong>
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#0b0f18',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '12px',
              padding: '4px 12px',
            }}
          >
            <span
              style={{
                color: '#e5c158',
                fontFamily: 'var(--font-mono)',
                fontWeight: 900,
                fontSize: '1.1rem',
                marginRight: '6px',
              }}
            >
              $
            </span>
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
                background: 'rgba(212, 175, 55, 0.18)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
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
