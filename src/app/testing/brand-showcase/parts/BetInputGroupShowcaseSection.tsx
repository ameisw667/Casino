import React from 'react';
import { DollarSign } from 'lucide-react';
import { ComponentSectionHeader } from './ComponentSectionHeader';
import { richtlinienListStyle } from './shared';

interface BetInputGroupShowcaseSectionProps {
  betAmount: number;
  onBetAmountChange: (value: number) => void;
  userBalance: number;
}

export function BetInputGroupShowcaseSection({
  betAmount,
  onBetAmountChange,
  userBalance,
}: BetInputGroupShowcaseSectionProps) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <ComponentSectionHeader
        kicker="Initiative 7.2 · Bestätigter Standard"
        title="<BetInputGroup /> — Universelles Wetteingabefeld"
        kickerColor="#34d399"
        badge="✅ Gewinner: Stacked Preset Bar Single Box"
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Live Mockup BetInputGroup */}
        <div
          style={{
            background: '#0b0f18',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#94a3b8',
                fontFamily: 'var(--font-mono)',
              }}
            >
              BET AMOUNT INPUT + PRESETS (1/2, 2X, MAX)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#94a3b8',
              }}
            >
              <span>BET AMOUNT</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                Balance: ${userBalance.toFixed(2)}
              </span>
            </div>

            <div
              className="qa-showcase-bet-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#07090e',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '12px',
                padding: '4px 8px',
              }}
            >
              <DollarSign size={18} style={{ color: '#e5c158', marginLeft: '6px' }} />
              <input
                type="number"
                value={betAmount}
                onChange={(e) => onBetAmountChange(Math.max(0.1, parseFloat(e.target.value) || 0))}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  fontSize: '1rem',
                  padding: '10px 8px',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => onBetAmountChange(Math.max(0.1, betAmount / 2))}
                  style={{
                    padding: '6px 10px',
                    background: '#131a26',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    color: '#cbd5e1',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                  }}
                >
                  1/2
                </button>
                <button
                  onClick={() => onBetAmountChange(Math.min(userBalance, betAmount * 2))}
                  style={{
                    padding: '6px 10px',
                    background: '#131a26',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    color: '#cbd5e1',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                  }}
                >
                  2x
                </button>
                <button
                  onClick={() => onBetAmountChange(userBalance)}
                  style={{
                    padding: '6px 10px',
                    background: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '6px',
                    color: '#e5c158',
                    fontSize: '0.7rem',
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

        {/* Contract Description 7.2 */}
        <div
          style={{
            background: '#0b0e14',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ fontWeight: 800, color: '#e5c158', fontSize: '0.85rem' }}>
            7.2 Design-Richtlinien:
          </div>
          <ul style={richtlinienListStyle}>
            <li>Left-aligned Currency-Symbol (`$`) in edlem Champagne Gold.</li>
            <li>Monospace-Eingabefeld zur Vermeidung von Layout-Sprüngen.</li>
            <li>
              Quick-Action Presets halbieren, verdoppeln oder setzen den Maximalbetrag mit
              automatischem Balance-Check.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
