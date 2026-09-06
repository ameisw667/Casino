import React from 'react';
import { CheckCircle2, Wallet, Flame, X } from 'lucide-react';

interface BetInputGroupOptionSeamlessBoxProps {
  bet: number;
  onSetBet: (value: number) => void;
  balance: number;
  minBet: number;
}

export function BetInputGroupOptionSeamlessBox({
  bet,
  onSetBet,
  balance,
  minBet,
}: BetInputGroupOptionSeamlessBoxProps) {
  return (
    <div
      style={{
        background: '#090d15',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        borderRadius: '24px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '20px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          padding: '6px 14px',
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#34d399',
          fontWeight: 800,
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          borderBottomLeftRadius: '14px',
        }}
      >
        ★ GEWINNER FAVORIT: Option 2-c (Seamless Box)
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 0 4px 0',
            }}
          >
            <Flame size={18} style={{ color: '#34d399' }} />
            Option 2-c: Seamless Floating Label Box
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
            Integrierter Single-Box Container: Header-Beschriftung und Guthaben-Badge sind nahtlos
            im Eingaberahmen eingebettet.
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
            gap: '12px',
          }}
        >
          <div
            style={{
              background: '#0b0f18',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              borderRadius: '14px',
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
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
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#e5c158',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                WETTEINSATZ
              </span>

              <button
                onClick={() => onSetBet(balance)}
                title="Klick für Maximalwette (MAX)"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <Wallet size={12} style={{ color: '#34d399' }} />
                <span>Guthaben:</span>
                <strong style={{ color: '#34d399' }}>${balance.toFixed(2)}</strong>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  color: '#e5c158',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 900,
                  fontSize: '1.2rem',
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
                  color: '#ffffff',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  padding: '2px 0',
                  outline: 'none',
                }}
              />
              {bet > 0 && (
                <button
                  onClick={() => onSetBet(10.0)}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
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
                background: 'rgba(16, 185, 129, 0.16)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '8px',
                color: '#34d399',
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

        <div
          style={{
            fontSize: '0.75rem',
            color: '#cbd5e1',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ fontWeight: 800, color: '#34d399' }}>Highlights Option 2-c (Seamless):</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0 }} />
            <span>Nahtlose Single-Box Integration ohne losen Header-Text</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0 }} />
            <span>Integrierter Klick-Trigger für Maximalwette im Guthaben-Text</span>
          </div>
        </div>
      </div>
    </div>
  );
}
