'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { RouletteNumber } from './types';

interface RouletteWinnerRevealProps {
  spinning: boolean;
  winningNumber: RouletteNumber | null;
  lastWinAmount: number | null;
  lastMultiplier: number | null;
}

/**
 * Winner number reveal HUD shown beneath the wheel once the spin settles.
 * Pure presentational — extracted verbatim from RouletteClient.tsx.
 */
export function RouletteWinnerReveal({
  spinning,
  winningNumber,
  lastWinAmount,
  lastMultiplier,
}: RouletteWinnerRevealProps) {
  return (
    <AnimatePresence>
      {!spinning && winningNumber && (
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'rgba(14, 14, 20, 0.95)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            padding: '8px 24px',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(212, 175, 55, 0.3)',
            marginTop: '-20px',
            zIndex: 40,
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 900,
              fontFamily: 'monospace',
              color: '#FFF',
              background:
                winningNumber.c === 'GREEN'
                  ? '#059669'
                  : winningNumber.c === 'RED'
                    ? '#dc2626'
                    : '#1e1e2d',
              boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)',
            }}
          >
            {winningNumber.n}
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8' }}>
              {winningNumber.c}{' '}
              {winningNumber.n === 0 ? 'ZERO' : winningNumber.n % 2 === 0 ? 'EVEN' : 'ODD'}
            </div>
            {lastWinAmount !== null && lastWinAmount > 0 ? (
              <div
                style={{
                  color: '#4ade80',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  fontSize: '1.15rem',
                }}
              >
                +${lastWinAmount.toFixed(2)} ({lastMultiplier}×)
              </div>
            ) : (
              <div style={{ color: '#64748b', fontWeight: 800, fontSize: '0.85rem' }}>NO WIN</div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
