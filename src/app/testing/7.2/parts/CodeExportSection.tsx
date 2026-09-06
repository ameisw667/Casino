import React from 'react';
import { Code2 } from 'lucide-react';
import { sectionHeadingStyle, type CodeExportTab } from './shared';

interface CodeExportSectionProps {
  activeCodeTab: CodeExportTab;
  onSelectCodeTab: (tab: CodeExportTab) => void;
}

export function CodeExportSection({ activeCodeTab, onSelectCodeTab }: CodeExportSectionProps) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px' }}>
        <h2 style={sectionHeadingStyle}>
          <Code2 size={22} style={{ color: '#d4af37' }} />
          4. Produktions-Code Export
        </h2>
      </div>

      <div
        style={{
          background: '#0a0e17',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: '#121826',
            padding: '12px 16px 0 16px',
            gap: '8px',
          }}
        >
          <button
            onClick={() => onSelectCodeTab('opt2c')}
            style={{
              padding: '8px 16px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              borderRadius: '8px 8px 0 0',
              border: 'none',
              cursor: 'pointer',
              background: activeCodeTab === 'opt2c' ? '#0a0e17' : 'transparent',
              color: activeCodeTab === 'opt2c' ? '#34d399' : '#94a3b8',
              borderTop: activeCodeTab === 'opt2c' ? '2px solid #34d399' : '2px solid transparent',
            }}
          >
            Option 2-c (Seamless Single Box - Empfohlen) ★
          </button>
          <button
            onClick={() => onSelectCodeTab('opt2b')}
            style={{
              padding: '8px 16px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              borderRadius: '8px 8px 0 0',
              border: 'none',
              cursor: 'pointer',
              background: activeCodeTab === 'opt2b' ? '#0a0e17' : 'transparent',
              color: activeCodeTab === 'opt2b' ? '#e5c158' : '#94a3b8',
              borderTop: activeCodeTab === 'opt2b' ? '2px solid #e5c158' : '2px solid transparent',
            }}
          >
            Option 2-b (Clean Sans Header)
          </button>
        </div>

        <div
          style={{
            padding: '24px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            overflowX: 'auto',
            color: '#cbd5e1',
            background: '#07090e',
          }}
        >
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
            <code>
              {activeCodeTab === 'opt2c'
                ? `'use client';
import React from 'react';
import { Wallet, X } from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';

interface BetInputGroupSeamlessProps {
  value: number;
  onChange: (value: number) => void;
  balance: number;
  minBet?: number;
  maxBet?: number;
  disabled?: boolean;
}

export function BetInputGroupSeamless({
  value, onChange, balance, minBet = 0.1, maxBet = 1000, disabled
}: BetInputGroupSeamlessProps) {
  const round2 = (val: number) => Math.round(val * 100) / 100;

  const updateVal = (newVal: number) => {
    if (disabled) return;
    const clamped = Math.min(maxBet, Math.max(minBet, round2(newVal)));
    soundManager.play('chip');
    onChange(clamped);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Seamless Integrated Single Box Input */}
      <div style={{
        background: '#0b0f18', border: '1px solid rgba(212, 175, 55, 0.35)',
        borderRadius: '14px', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '4px'
      }}>
        {/* Integrated Header Row Inside Container */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#e5c158', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            WETTEINSATZ
          </span>

          <button onClick={() => updateVal(balance)} disabled={disabled} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
            <Wallet size={12} style={{ color: '#34d399' }} />
            <span>Guthaben:</span>
            <strong style={{ color: '#34d399' }}>\\\${balance.toFixed(2)}</strong>
          </button>
        </div>

        {/* Input Row Inside Container */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#e5c158', fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1.2rem', marginRight: '6px' }}>$</span>
          <input
            type="number"
            value={value}
            disabled={disabled}
            onChange={(e) => updateVal(parseFloat(e.target.value) || 0)}
            style={{
              flex: 1, minWidth: 0, background: 'transparent', border: 'none', color: '#ffffff',
              fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.2rem', padding: '2px 0', outline: 'none'
            }}
          />
          {value > 0 && (
            <button onClick={() => updateVal(10)} disabled={disabled} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '22px', height: '22px', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Preset Bar Bottom */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
        <button onClick={() => updateVal(minBet)} disabled={disabled} style={{ padding: '8px 0', background: '#131a26', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#cbd5e1', fontSize: '0.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>MIN</button>
        <button onClick={() => updateVal(value / 2)} disabled={disabled} style={{ padding: '8px 0', background: '#131a26', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#cbd5e1', fontSize: '0.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>½</button>
        <button onClick={() => updateVal(value * 2)} disabled={disabled} style={{ padding: '8px 0', background: '#131a26', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#cbd5e1', fontSize: '0.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>2×</button>
        <button onClick={() => updateVal(balance)} disabled={disabled} style={{ padding: '8px 0', background: 'rgba(16, 185, 129, 0.16)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', color: '#34d399', fontSize: '0.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>MAX</button>
      </div>
    </div>
  );
}`
                : `'use client';
// Option 2-b Code Contract`}
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}
