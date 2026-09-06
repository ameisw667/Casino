import React from 'react';
import { Code2 } from 'lucide-react';
import { sectionHeadingStyle } from './shared';

export type CodeExportTab = 'opt1b' | 'opt1b1' | 'opt1b2';

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
            onClick={() => onSelectCodeTab('opt1b1')}
            style={{
              padding: '8px 16px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              borderRadius: '8px 8px 0 0',
              border: 'none',
              cursor: 'pointer',
              background: activeCodeTab === 'opt1b1' ? '#0a0e17' : 'transparent',
              color: activeCodeTab === 'opt1b1' ? '#fef08a' : '#94a3b8',
              borderTop: activeCodeTab === 'opt1b1' ? '2px solid #fef08a' : '2px solid transparent',
            }}
          >
            Option 1-b1 (High-Contrast Solid - Empfohlen) ★
          </button>
          <button
            onClick={() => onSelectCodeTab('opt1b2')}
            style={{
              padding: '8px 16px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              borderRadius: '8px 8px 0 0',
              border: 'none',
              cursor: 'pointer',
              background: activeCodeTab === 'opt1b2' ? '#0a0e17' : 'transparent',
              color: activeCodeTab === 'opt1b2' ? '#e5c158' : '#94a3b8',
              borderTop: activeCodeTab === 'opt1b2' ? '2px solid #e5c158' : '2px solid transparent',
            }}
          >
            Option 1-b2 (Inverted Metallic)
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
              {activeCodeTab === 'opt1b1'
                ? `'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { soundManager } from '@/lib/casino/sound-manager';

interface GameActionButtonSolidProps {
  label: string;
  betAmount?: number;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function GameActionButtonSolid({ label, betAmount, loading, disabled, onClick }: GameActionButtonSolidProps) {
  const handleClick = () => {
    if (disabled || loading) return;
    soundManager.play('bet');
    onClick();
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.96 }}
      onClick={handleClick}
      disabled={disabled || loading}
      style={{
        height: '56px',
        width: '100%',
        background: loading ? '#18140c' : '#141108',
        border: '1.5px solid #e5c158',
        borderRadius: '14px',
        color: '#fef08a',
        fontFamily: 'var(--font-mono), monospace',
        fontSize: '1.05rem',
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        boxShadow: loading ? 'none' : '0 4px 20px rgba(229, 193, 88, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}
    >
      {loading ? 'Processing...' : betAmount ? \`\${label} (\\\$\${betAmount.toFixed(2)})\` : label}
    </motion.button>
  );
}`
                : `// Option 1-b2 Code Contract`}
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}
