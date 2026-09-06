import React from 'react';
import { ExternalLink } from 'lucide-react';
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
          <ExternalLink size={22} style={{ color: '#d4af37' }} />
          4. Produktions-Code Contract Export
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
          Bereitgestellter React/TypeScript Code zur direkten Übernahme in{' '}
          <code style={{ color: '#d4af37', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
            src/components/casino/controls/BetModeTabs.tsx
          </code>
        </p>
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
            onClick={() => onSelectCodeTab('varA1')}
            style={{
              padding: '8px 16px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              borderRadius: '8px 8px 0 0',
              border: 'none',
              cursor: 'pointer',
              background: activeCodeTab === 'varA1' ? '#0a0e17' : 'transparent',
              color: activeCodeTab === 'varA1' ? '#d4af37' : '#94a3b8',
              borderTop: activeCodeTab === 'varA1' ? '2px solid #d4af37' : '2px solid transparent',
            }}
          >
            Variante A1 (Standard Gold)
          </button>
          <button
            onClick={() => onSelectCodeTab('varA2')}
            style={{
              padding: '8px 16px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              borderRadius: '8px 8px 0 0',
              border: 'none',
              cursor: 'pointer',
              background: activeCodeTab === 'varA2' ? '#0a0e17' : 'transparent',
              color: activeCodeTab === 'varA2' ? '#e5c158' : '#94a3b8',
              borderTop: activeCodeTab === 'varA2' ? '2px solid #e5c158' : '2px solid transparent',
            }}
          >
            Variante A2 (Muted Champagne - Empfohlen) ★
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
              {activeCodeTab === 'varA1'
                ? `'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Zap } from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';

interface BetModeTabsProps {
  mode: 'manual' | 'auto';
  onModeChange: (mode: 'manual' | 'auto') => void;
  disabled?: boolean;
}

export function BetModeTabs({ mode, onModeChange, disabled }: BetModeTabsProps) {
  const handleSelect = (nextMode: 'manual' | 'auto') => {
    if (disabled || nextMode === mode) return;
    soundManager.play('click');
    onModeChange(nextMode);
  };

  return (
    <div style={{
      position: 'relative',
      background: '#0d131f',
      padding: '4px',
      borderRadius: '14px',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '4px'
    }}>
      <button
        onClick={() => handleSelect('manual')}
        disabled={disabled}
        style={{
          position: 'relative', zIndex: 10, padding: '12px 0', fontSize: '0.75rem', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.08em', border: 'none', background: 'transparent',
          color: mode === 'manual' ? '#f59e0b' : '#94a3b8', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}
      >
        {mode === 'manual' && (
          <motion.div
            layoutId="activeTabPill"
            style={{
              position: 'absolute', inset: 0,
              background: '#161d2a',
              border: '1px solid #d4af37', borderRadius: '10px'
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          />
        )}
        <Play size={14} style={{ position: 'relative', zIndex: 10, color: mode === 'manual' ? '#f59e0b' : '#64748b' }} />
        <span style={{ position: 'relative', zIndex: 10 }}>Manual</span>
      </button>

      <button
        onClick={() => handleSelect('auto')}
        disabled={disabled}
        style={{
          position: 'relative', zIndex: 10, padding: '12px 0', fontSize: '0.75rem', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.08em', border: 'none', background: 'transparent',
          color: mode === 'auto' ? '#f59e0b' : '#94a3b8', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}
      >
        {mode === 'auto' && (
          <motion.div
            layoutId="activeTabPill"
            style={{
              position: 'absolute', inset: 0,
              background: '#161d2a',
              border: '1px solid #d4af37', borderRadius: '10px'
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          />
        )}
        <Zap size={14} style={{ position: 'relative', zIndex: 10, color: mode === 'auto' ? '#f59e0b' : '#64748b' }} />
        <span style={{ position: 'relative', zIndex: 10 }}>Auto Mode</span>
      </button>
    </div>
  );
}`
                : `'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Zap } from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';

interface BetModeTabsMutedProps {
  mode: 'manual' | 'auto';
  onModeChange: (mode: 'manual' | 'auto') => void;
  disabled?: boolean;
}

export function BetModeTabsMuted({ mode, onModeChange, disabled }: BetModeTabsMutedProps) {
  const handleSelect = (nextMode: 'manual' | 'auto') => {
    if (disabled || nextMode === mode) return;
    soundManager.play('click');
    onModeChange(nextMode);
  };

  return (
    <div style={{
      position: 'relative',
      background: '#0b0f18',
      padding: '4px',
      borderRadius: '14px',
      border: '1px solid rgba(212, 175, 55, 0.15)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '4px'
    }}>
      <button
        onClick={() => handleSelect('manual')}
        disabled={disabled}
        style={{
          position: 'relative', zIndex: 10, padding: '12px 0', fontSize: '0.75rem', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.08em', border: 'none', background: 'transparent',
          color: mode === 'manual' ? '#e5c158' : '#64748b', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}
      >
        {mode === 'manual' && (
          <motion.div
            layoutId="activeTabPillMuted"
            style={{
              position: 'absolute', inset: 0,
              background: '#131a26',
              border: '1px solid rgba(212, 175, 55, 0.4)', borderRadius: '10px'
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          />
        )}
        <Play size={14} style={{ position: 'relative', zIndex: 10, color: mode === 'manual' ? '#e5c158' : '#475569' }} />
        <span style={{ position: 'relative', zIndex: 10 }}>Manual</span>
      </button>

      <button
        onClick={() => handleSelect('auto')}
        disabled={disabled}
        style={{
          position: 'relative', zIndex: 10, padding: '12px 0', fontSize: '0.75rem', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.08em', border: 'none', background: 'transparent',
          color: mode === 'auto' ? '#e5c158' : '#64748b', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}
      >
        {mode === 'auto' && (
          <motion.div
            layoutId="activeTabPillMuted"
            style={{
              position: 'absolute', inset: 0,
              background: '#131a26',
              border: '1px solid rgba(212, 175, 55, 0.4)', borderRadius: '10px'
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          />
        )}
        <Zap size={14} style={{ position: 'relative', zIndex: 10, color: mode === 'auto' ? '#e5c158' : '#475569' }} />
        <span style={{ position: 'relative', zIndex: 10 }}>Auto Mode</span>
      </button>
    </div>
  );
}`}
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}
