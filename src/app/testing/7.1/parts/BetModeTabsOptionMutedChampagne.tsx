import React from 'react';
import { motion } from 'framer-motion';
import { Play, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import type { BetMode } from './StatusQuoSection';

interface BetModeTabsOptionMutedChampagneProps {
  mode: BetMode;
  onSelectMode: (mode: BetMode) => void;
}

export function BetModeTabsOptionMutedChampagne({
  mode,
  onSelectMode,
}: BetModeTabsOptionMutedChampagneProps) {
  return (
    <div
      style={{
        background: '#090d15',
        border: '1px solid rgba(212, 175, 55, 0.16)',
        borderRadius: '24px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '24px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          padding: '6px 16px',
          background: 'rgba(212, 175, 55, 0.18)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          color: '#e5c158',
          fontWeight: 800,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          borderBottomLeftRadius: '14px',
        }}
      >
        ★ Empfohlen: Variante A2 (Muted Champagne)
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
            <Sparkles size={20} style={{ color: '#e5c158' }} />
            A2 — Subtle Muted Champagne Gold
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
            Angenehm reduzierte Farbintensität: Samtige Champagne-Gold Kante (`1px solid rgba(212,
            175, 55, 0.4)`), meidet grelles Gelb für ein edles matte VIP-Finish.
          </p>
        </div>

        <div
          style={{
            padding: '20px',
            background: '#06080e',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
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
            <span>PROTOTYP A2 (REDUZIERTE INTENSITÄT):</span>
            <span style={{ color: '#e5c158', fontWeight: 700 }}>Klick auf die Tabs!</span>
          </div>

          <div
            style={{
              position: 'relative',
              background: '#0b0f18',
              padding: '4px',
              borderRadius: '14px',
              border: '1px solid rgba(212, 175, 55, 0.15)',
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
                color: mode === 'manual' ? '#e5c158' : '#64748b',
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
                  layoutId="activeTabPillVarA2"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#131a26',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
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
                  color: mode === 'manual' ? '#e5c158' : '#475569',
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
                color: mode === 'auto' ? '#e5c158' : '#64748b',
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
                  layoutId="activeTabPillVarA2"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#131a26',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
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
                  color: mode === 'auto' ? '#e5c158' : '#475569',
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
            <strong style={{ color: '#e5c158', textTransform: 'uppercase' }}>{mode}</strong>
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
              color: '#e5c158',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
            }}
          >
            Highlights Variante A2 (Muted Gold):
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              color: '#cbd5e1',
            }}
          >
            <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Dezente Randfassung (`rgba(212, 175, 55, 0.16)`):</strong> Keinerlei knallige
              oder aufdringliche Goldrahmen.
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
            <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Eleganter Champagne-Farbton (`#e5c158`):</strong> Angenehm warm und edel ohne
              knalliges Gelb.
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
            <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Maximaler Sehkomfort:</strong> Ruhiges, mattes Obsidian-Inlay fügt sich
              perfekt ins Gesamtdesign ein.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
