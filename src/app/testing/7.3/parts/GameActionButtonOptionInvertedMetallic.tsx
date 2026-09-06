import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface GameActionButtonOptionInvertedMetallicProps {
  loading: boolean;
  onSimulate: () => void;
  betAmount: number;
}

export function GameActionButtonOptionInvertedMetallic({
  loading,
  onSimulate,
  betAmount,
}: GameActionButtonOptionInvertedMetallicProps) {
  return (
    <div
      style={{
        background: '#090d15',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '24px',
      }}
    >
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
            <Flame size={18} style={{ color: '#34d399' }} />
            Option 1-b2: Metallic Inverted VIP CTA
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
            Invertiertes Design: Volldeckende Champagne Gold Oberfläche (`#e5c158`) mit tiefdunklem
            Obsidian-Text (`#07090e`).
          </p>
        </div>

        {/* Live Demo Option 1-b2 */}
        <div
          style={{
            padding: '20px',
            background: '#06080e',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
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
            <span>PROTOTYP 1-B2 (INVERTED):</span>
            <span>56px Height</span>
          </div>

          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.96 }}
            onClick={onSimulate}
            disabled={loading}
            style={{
              height: '56px',
              width: '100%',
              background: loading ? '#ca9d28' : '#e5c158',
              border: '1px solid #fef08a',
              borderRadius: '14px',
              color: '#07090e',
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '1.05rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 6px 20px rgba(229, 193, 88, 0.3)',
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
      </div>
    </div>
  );
}
