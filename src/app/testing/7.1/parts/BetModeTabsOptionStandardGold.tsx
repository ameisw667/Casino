import React from 'react';
import { motion } from 'framer-motion';
import { Play, Zap, Flame, CheckCircle2 } from 'lucide-react';
import type { BetMode } from './StatusQuoSection';

interface BetModeTabsOptionStandardGoldProps {
  mode: BetMode;
  onSelectMode: (mode: BetMode) => void;
}

export function BetModeTabsOptionStandardGold({
  mode,
  onSelectMode,
}: BetModeTabsOptionStandardGoldProps) {
  return (
    <div
      style={{
        background: '#0d111a',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        borderRadius: '24px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '24px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          padding: '6px 16px',
          background: '#d4af37',
          color: '#05070b',
          fontWeight: 800,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          borderBottomLeftRadius: '14px',
        }}
      >
        Variante A1: Standard Gold Accent
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 0 4px 0',
            }}
          >
            <Flame size={20} style={{ color: '#f59e0b' }} />
            A1 — Standard Gold Edge
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
            Ursprüngliche Variante mit deutlicher Goldkante (`1px solid #d4af37`) und klarem
            Gold-Text.
          </p>
        </div>

        <div
          style={{
            padding: '20px',
            background: '#07090e',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: '#94a3b8',
            }}
          >
            <span>PROTOTYP A1:</span>
            <span style={{ color: '#d4af37', fontWeight: 700 }}>Klick auf die Tabs!</span>
          </div>

          <div
            style={{
              position: 'relative',
              background: '#0d131f',
              padding: '4px',
              borderRadius: '14px',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4px',
            }}
          >
            <button
              onClick={() => onSelectMode('manual')}
              style={{
                position: 'relative',
                zIndex: 10,
                padding: '12px 0',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                border: 'none',
                background: 'transparent',
                color: mode === 'manual' ? '#f59e0b' : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'color 0.2s ease',
              }}
            >
              {mode === 'manual' && (
                <motion.div
                  layoutId="activeTabPillVarA1"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#161d2a',
                    border: '1px solid #d4af37',
                    borderRadius: '10px',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                />
              )}
              <Play
                size={14}
                style={{
                  position: 'relative',
                  zIndex: 10,
                  color: mode === 'manual' ? '#f59e0b' : '#64748b',
                }}
              />
              <span style={{ position: 'relative', zIndex: 10 }}>Manual</span>
            </button>

            <button
              onClick={() => onSelectMode('auto')}
              style={{
                position: 'relative',
                zIndex: 10,
                padding: '12px 0',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                border: 'none',
                background: 'transparent',
                color: mode === 'auto' ? '#f59e0b' : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'color 0.2s ease',
              }}
            >
              {mode === 'auto' && (
                <motion.div
                  layoutId="activeTabPillVarA1"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#161d2a',
                    border: '1px solid #d4af37',
                    borderRadius: '10px',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                />
              )}
              <Zap
                size={14}
                style={{
                  position: 'relative',
                  zIndex: 10,
                  color: mode === 'auto' ? '#f59e0b' : '#64748b',
                }}
              />
              <span style={{ position: 'relative', zIndex: 10 }}>Auto Mode</span>
            </button>
          </div>

          <div
            style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: '#94a3b8',
              paddingTop: '8px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            Aktiver Modus:{' '}
            <strong style={{ color: '#f59e0b', textTransform: 'uppercase' }}>{mode}</strong>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '0.75rem',
          }}
        >
          <div
            style={{
              fontWeight: 800,
              color: '#d4af37',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
            }}
          >
            Eigenschaften A1:
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              color: '#cbd5e1',
            }}
          >
            <CheckCircle2 size={16} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Prägnante Goldkante:</strong> `1px solid #d4af37` Rand um aktiven Button.
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              color: '#cbd5e1',
            }}
          >
            <CheckCircle2 size={16} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Hoher Kontrast:</strong> Goldener Text hebt sich stark ab.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
