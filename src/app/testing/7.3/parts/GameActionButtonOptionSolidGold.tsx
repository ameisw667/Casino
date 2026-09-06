import React from 'react';
import { motion } from 'framer-motion';
import { Flame, CheckCircle2 } from 'lucide-react';

interface GameActionButtonOptionSolidGoldProps {
  loading: boolean;
  onSimulate: () => void;
  betAmount: number;
}

export function GameActionButtonOptionSolidGold({
  loading,
  onSimulate,
  betAmount,
}: GameActionButtonOptionSolidGoldProps) {
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
          background:
            'linear-gradient(135deg, rgba(212, 175, 55, 0.3) 0%, rgba(212, 175, 55, 0.15) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.5)',
          color: '#e5c158',
          fontWeight: 800,
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          borderBottomLeftRadius: '14px',
        }}
      >
        ★ EMPFOHLEN: Option 1-b1 (High Contrast Solid)
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
            <Flame size={18} style={{ color: '#e5c158' }} />
            Option 1-b1: High-Contrast Solid Gold CTA
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
            Satter Obsidian-Dark Untergrund (`#141108`) mit 1.5px Champagne Gold Rahmen (`#e5c158`)
            und strahlendem Gold-Text (`#fef08a`).
          </p>
        </div>

        {/* Live Demo Option 1-b1 */}
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
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#94a3b8',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span>PROTOTYP 1-B1 (HIGH CONTRAST):</span>
            <span style={{ color: '#fef08a', fontWeight: 700 }}>WCAG AAA (14:1)</span>
          </div>

          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.96 }}
            onClick={onSimulate}
            disabled={loading}
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
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(0, 0, 0, 0.6)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? 'Processing...' : `PLACE BET ($${betAmount.toFixed(2)})`}
          </motion.button>
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
          <div style={{ fontWeight: 800, color: '#fef08a' }}>
            Highlights Option 1-b1 (Empfohlen):
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0 }} />
            <span>Hervorragender Kontrast ohne blasse Transparenzen</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0 }} />
            <span>Absolut meilenweit entfernt von billigem Standard-Look</span>
          </div>
        </div>
      </div>
    </div>
  );
}
