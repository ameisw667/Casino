import React from 'react';
import { motion } from 'framer-motion';

interface GameActionButtonOptionBaselineProps {
  loading: boolean;
  onSimulate: () => void;
  betAmount: number;
}

export function GameActionButtonOptionBaseline({
  loading,
  onSimulate,
  betAmount,
}: GameActionButtonOptionBaselineProps) {
  return (
    <div
      style={{
        background: '#090d15',
        border: '1px solid rgba(255, 255, 255, 0.08)',
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
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 4px 0',
            }}
          >
            Option 1-b: Baseline Muted Gold
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
            Bisherige Variante mit transparenter Randkontur.
          </p>
        </div>

        {/* Live Demo Option 1-b */}
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
            <span>PROTOTYP 1-B:</span>
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
              background: loading ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0.18)',
              border: '1px solid rgba(212, 175, 55, 0.5)',
              borderRadius: '14px',
              color: '#e5c158',
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '1.05rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              cursor: loading ? 'not-allowed' : 'pointer',
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
